#!/usr/bin/env node
// test-guard.mjs — guarda de integridade de testes da skill simple-implementation.
//
//   node test-guard.mjs hook            → hook PreToolUse (lê o JSON do stdin)
//   node test-guard.mjs verify <BASE>   → relatório de integridade: árvore atual vs BASE
//
// Regra: teste existente (versionado) é somente-leitura. Inserir linhas novas é
// permitido (TDD); alterar/remover linhas, snapshot ou config de teste exige o Pedro.
// Env opcional: TEST_GUARD_MODE=deny força bloqueio em vez de pedir confirmação.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const TEST_FILE_I = new RegExp(
  [
    String.raw`(^|/)(__tests__|__snapshots__|__mocks__|tests?|e2e|cypress)/`,
    String.raw`\.(test|spec|e2e|cy)\.[cm]?[jt]sx?$`,
    String.raw`\.snap$`,
    String.raw`(^|/)test_[^/]*\.py$`,
    String.raw`_test\.(py|go)$`,
  ].join('|'),
  'i',
);
const TEST_FILE_CS = /[A-Za-z0-9]Tests?\.cs$|\.Tests?\//; // .NET: FooTests.cs, Projeto.Tests/
const TEST_CONFIG =
  /(^|\/)((jest|vitest|playwright|cypress|karma)\.config\.[cm]?[jt]s|(setupTests|jest\.setup|vitest\.setup)\.[cm]?[jt]sx?|conftest\.py|pytest\.ini|[^/]*\.runsettings)$/i;
const FOCUS_SKIP =
  /\.(only|skip|skipIf)\s*\(|\b(xit|xdescribe|xtest|fit|fdescribe)\s*\(|\btest\.todo\s*\(|Skip\s*=\s*["']|\[Ignore\b|@pytest\.mark\.skip|\bt\.Skip\(/;
const SUSPICIOUS = [FOCUS_SKIP, /\/\*|\*\//, /^\s*return\s*;?\s*$/m, /\bif\s*\(\s*(false|0)\s*\)/];

const STOP =
  ' PARE e abra um GATE para o Pedro: arquivo, o que mudaria, motivo e justificativa. Não contorne com outra ferramenta (Bash, sed, rm, cp, git).';

const toPosix = (p) => p.split(path.sep).join('/');
const isTestPath = (p) => TEST_FILE_I.test(toPosix(p)) || TEST_FILE_CS.test(toPosix(p));
const isTestConfig = (p) => TEST_CONFIG.test(toPosix(p));
const isGuarded = (p) => isTestPath(p) || isTestConfig(p);

function git(args, cwd) {
  try {
    return { ok: true, out: execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }) };
  } catch {
    return { ok: false, out: '' };
  }
}

// Existe e está versionado? (fora de um repo git, existir já basta)
function isProtected(abs) {
  if (!existsSync(abs)) return false;
  const dir = path.dirname(abs);
  if (!git(['rev-parse', '--is-inside-work-tree'], dir).ok) return true;
  return git(['ls-files', '--error-unmatch', '--', path.basename(abs)], dir).ok;
}

// A nova versão só INSERE linhas? (todas as linhas antigas continuam, na mesma ordem)
function insertionOnly(before, after) {
  const a = before.split('\n');
  const b = after.split('\n');
  const inserted = [];
  let i = 0;
  for (const line of b) {
    if (i < a.length && line === a[i]) i++;
    else inserted.push(line);
  }
  return { ok: i === a.length, inserted: inserted.join('\n') };
}

// ───────────────────────────── modo hook ─────────────────────────────
function hook() {
  let input;
  try {
    input = JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return;
  }
  const { tool_name: tool, tool_input: ti = {}, cwd = process.cwd(), permission_mode: mode } = input;
  const unattended = ['bypassPermissions', 'auto', 'dontAsk'].includes(mode) || process.env.TEST_GUARD_MODE === 'deny';

  const deny = (reason) => {
    process.stderr.write(`[simple-implementation] ${reason}\n`);
    process.exit(2);
  };
  const ask = (reason) => {
    if (unattended) deny(reason); // sem humano olhando: bloqueia
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PreToolUse',
          permissionDecision: 'ask',
          permissionDecisionReason: `[simple-implementation] ${reason}`,
        },
      }),
    );
    process.exit(0);
  };

  if (['Edit', 'Write', 'MultiEdit', 'NotebookEdit'].includes(tool)) {
    const file = ti.file_path || ti.notebook_path;
    if (!file) return;
    const abs = path.resolve(cwd, file);
    if (!isGuarded(abs)) return;
    const rel = toPosix(path.relative(cwd, abs));

    if (!isProtected(abs)) {
      // arquivo novo: livre, mas .only/.skip num teste novo afeta a suíte inteira
      const added =
        tool === 'Write' ? ti.content : tool === 'Edit' ? ti.new_string : (ti.edits || []).map((e) => e.new_string).join('\n');
      if (added && FOCUS_SKIP.test(added)) ask(`${rel}: .only/.skip/x-/todo desativa ou pula testes.` + STOP);
      return;
    }

    if (isTestConfig(abs) || /\.snap$/i.test(abs) || tool === 'NotebookEdit') {
      ask(`${rel} é config ou snapshot de teste existente.` + STOP);
    }

    const before = readFileSync(abs, 'utf8');
    let after = before;
    if (tool === 'Write') {
      after = ti.content ?? '';
    } else {
      for (const e of tool === 'Edit' ? [ti] : ti.edits || []) {
        if (!e.old_string || !after.includes(e.old_string)) return; // a própria edição vai falhar
        after = e.replace_all
          ? after.split(e.old_string).join(e.new_string ?? '')
          : after.replace(e.old_string, () => e.new_string ?? '');
      }
    }

    const { ok, inserted } = insertionOnly(before, after);
    if (!ok) {
      ask(
        `${rel} é um teste existente e esta edição altera ou remove linhas existentes.` +
          ' Para ADICIONAR testes, use inserção pura (só linhas novas, sem mudar nenhuma existente).' +
          STOP,
      );
    }
    if (SUSPICIOUS.some((r) => r.test(inserted))) {
      ask(`${rel}: a inserção contém .only/.skip, comentário de bloco, return solto ou if(false) — pode desativar testes existentes.` + STOP);
    }
    return; // inserção pura de testes novos: segue o fluxo normal de permissão
  }

  if (tool === 'Bash') {
    const cmd = String(ti.command || '');
    if (/\bgit\s+push\b/.test(cmd)) deny('push bloqueado: esta skill só faz commits locais; o push é do Pedro.');
    if (/--no-verify\b/.test(cmd) || /\bgit\s+commit\b[^;&|]*\s-n\b/.test(cmd)) {
      deny('--no-verify bloqueado: os hooks do repositório precisam rodar. Corrija a causa da falha.');
    }
    if (/\bgit\s+(reset\s+--hard|clean\s+-\w*f|restore\b|stash\b)|\bgit\s+checkout\b[^;&|]*\s--\s/.test(cmd)) {
      ask('comando git destrutivo (pode descartar trabalho, inclusive testes).' + STOP);
    }
    if (
      /\b(jest|vitest|playwright|cypress|test)\b/.test(cmd) &&
      /(\s-u\b|--update-?snapshots?\b|--updateSnapshot\b)/i.test(cmd)
    ) {
      ask('atualizar snapshot equivale a alterar teste existente.' + STOP);
    }
    const tokens = cmd.split(/[\s'"`;|&()<>]+/).filter(Boolean);
    const redirectTargets = [...cmd.matchAll(/(?:^|[^0-9&>])>{1,2}\s*([^\s;&|]+)/g), ...cmd.matchAll(/\btee\s+(?:-a\s+)?([^\s;&|]+)/g)].map(
      (m) => m[1],
    );
    const destructiveVerb = /(^|[\s;&|(])(rm|mv|cp|truncate|git\s+rm|git\s+mv|sed\s+(-\w+\s+)*-i\w*|perl\s+-\w*i)\b/.test(cmd);
    if ((destructiveVerb && tokens.some(isGuarded)) || redirectTargets.some(isGuarded)) {
      ask('comando shell que pode alterar ou remover arquivo de teste.' + STOP);
    }
  }
}

// ──────────────────────────── modo verify ────────────────────────────
function parseDiff(text) {
  const removed = [];
  const added = [];
  let inHunk = false;
  for (const line of text.split('\n')) {
    if (line.startsWith('diff --git')) inHunk = false;
    else if (line.startsWith('@@')) inHunk = true;
    else if (inHunk && line.startsWith('-')) removed.push(line.slice(1));
    else if (inHunk && line.startsWith('+')) added.push(line.slice(1));
  }
  return { removed, added };
}

function verify(base) {
  if (!base) {
    console.error('uso: node test-guard.mjs verify <BASE_SHA>');
    process.exit(2);
  }
  const top = git(['rev-parse', '--show-toplevel'], process.cwd());
  if (!top.ok) {
    console.error('não é um repositório git');
    process.exit(2);
  }
  const root = top.out.trim();
  if (!git(['rev-parse', '--verify', `${base}^{commit}`], root).ok) {
    console.error(`BASE inválida: ${base}`);
    process.exit(2);
  }

  const violations = [];
  const warnings = [];
  const created = [];
  const flagFocus = (file, text) => {
    if (FOCUS_SKIP.test(text)) violations.push(`${file}: contém .only/.skip/x-/todo (desativa ou pula testes)`);
  };

  const changes = git(['diff', '--name-status', '-M', '--no-color', base, '--'], root).out.split('\n').filter(Boolean);
  for (const entry of changes) {
    const [code, a, b] = entry.split('\t');
    const kind = code[0];
    const file = b || a;
    if (!isGuarded(a) && !(b && isGuarded(b))) continue;

    if (kind === 'A') {
      created.push(file);
      if (existsSync(path.join(root, file))) flagFocus(file, readFileSync(path.join(root, file), 'utf8'));
      continue;
    }
    if (kind === 'D') {
      violations.push(`removido: ${a}`);
      continue;
    }
    if (kind === 'R') violations.push(`renomeado/movido: ${a} → ${b}`);
    if (isTestConfig(file) || /\.snap$/i.test(file)) {
      violations.push(`config/snapshot de teste alterado: ${file}`);
      continue;
    }

    const { removed, added } = parseDiff(git(['diff', '-U0', '--no-color', '-M', base, '--', ...(b ? [a, b] : [a])], root).out);
    if (removed.length) {
      const sample = removed.slice(0, 3).map((l) => `        - ${l.trim()}`).join('\n');
      violations.push(`${file}: ${removed.length} linha(s) existente(s) alterada(s)/removida(s)\n${sample}`);
    }
    if (added.length) {
      const addedText = added.join('\n');
      flagFocus(file, addedText);
      const suspicious = SUSPICIOUS.slice(1).some((r) => r.test(addedText));
      warnings.push(`${file}: +${added.length} linha(s) inserida(s)${suspicious ? ' [SUSPEITO: comentário de bloco / return solto / if(false)]' : ''}`);
    }
  }

  // testes novos ainda não versionados
  const untracked = git(['ls-files', '--others', '--exclude-standard'], root).out.split('\n').filter(Boolean);
  for (const file of untracked.filter(isGuarded)) {
    created.push(`${file} (não versionado)`);
    flagFocus(file, readFileSync(path.join(root, file), 'utf8'));
  }

  const short = git(['rev-parse', '--short', base], root).out.trim();
  const out = [`Integridade de testes vs BASE ${short}`];
  if (violations.length) out.push('✗ VIOLAÇÕES — só valem se o Pedro aprovou explicitamente no chat:', ...violations.map((v) => `  - ${v}`));
  if (warnings.length) out.push('⚠ Inserções em testes existentes (revise: não podem desativar nada):', ...warnings.map((w) => `  - ${w}`));
  if (created.length) out.push('✓ Testes novos:', ...created.map((c) => `  - ${c}`));
  out.push(violations.length ? 'RESULTADO: VIOLAÇÕES' : 'RESULTADO: OK — nenhum teste existente alterado ou removido');
  console.log(out.join('\n'));
  process.exit(violations.length ? 1 : 0);
}

const [mode, arg] = process.argv.slice(2);
if (mode === 'hook') hook();
else if (mode === 'verify') verify(arg);
else {
  console.error('uso: node test-guard.mjs hook | verify <BASE_SHA>');
  process.exit(2);
}
