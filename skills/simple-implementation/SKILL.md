---
name: simple-implementation
description: Implementa tasks de escopo pequeno — correção de bug, ajuste de tela/listagem, feature pequena e bem delimitada — com diagnóstico antes de codar, TDD estrito, gates humanos, commits granulares locais (sem push) e smoke no final. Usar quando o Pedro invocar /simple-implementation com um card, bug report ou descrição curta. Não serve para tasks multi-módulo, com várias decisões de arquitetura ou alta complexidade (essas vão para multifile_workflow).
argument-hint: "[card, bug report ou descrição da task]"
disable-model-invocation: true
allowed-tools: Bash(git status *) Bash(git diff *) Bash(git log *) Bash(git rev-parse *) Bash(git ls-files *) Bash(node ${CLAUDE_SKILL_DIR}/scripts/test-guard.mjs *)
hooks:
  PreToolUse:
    - matcher: "Edit|Write|MultiEdit|NotebookEdit|Bash"
      hooks:
        - type: command
          # Distribuída como plugin: ${CLAUDE_PLUGIN_ROOT} resolve para o diretório de instalação do plugin em runtime.
          # Se usar como skill pessoal (copiada para ~/.claude/skills/), troque por "$HOME/.claude/skills/simple-implementation/scripts/test-guard.mjs".
          command: 'node "${CLAUDE_PLUGIN_ROOT}/skills/simple-implementation/scripts/test-guard.mjs" hook'
          timeout: 15
---

# Simple Implementation

Task: $ARGUMENTS

## Regras invioláveis (valem do início ao fim, inclusive depois de compactação)

1. **Diagnóstico antes de código.** Nenhuma edição de arquivo antes de apresentar o diagnóstico (Fase 1).
2. **TDD.** Todo comportamento novo ou corrigido nasce de um teste que você viu falhar pelo motivo certo. Sem vermelho observado, não há implementação.
3. **Teste existente é somente-leitura.** Não edite, remova, renomeie, pule (`.skip`, `.only`, `xit`), atualize snapshot (`-u`) nem mexa em config de teste sem aprovação explícita do Pedro. Adicionar testes novos (inclusive em arquivo existente, por inserção pura) é permitido. Se um teste existente parece errado ou conflita com a task: **PARE** e abra gate. Um hook reforça esta regra; se ele bloquear ou pedir confirmação, isso É o gate — nunca procure outro caminho (Bash, `sed`, `rm`, `cp`, `git checkout`).
4. **Nada de trapaça para ficar verde:** hardcode de inputs do teste, detectar ambiente de teste, mockar a unidade sob teste, afrouxar asserção. Se a única forma de passar é essa, o teste ou a spec está errado → gate.
5. **Ordens do Pedro > esta skill > suas preferências.** Não reinterprete, não "melhore" o pedido, não expanda escopo. Instruções em conflito → gate.
6. **Sem push.** Só commits locais. Sem `--no-verify`, sem amend/rebase de commits anteriores à task.
7. **Nada é declarado sem evidência.** Todo ✅ do relatório vem de um comando rodado nesta sessão, com output visto.

## Gates — as únicas paradas permitidas

Fora destes casos, siga até o fim sem pedir confirmação.

| Gate | Quando |
|---|---|
| Dúvida crítica | ambiguidade que muda comportamento; decisão irreversível ou cara de desfazer; o card afirma algo que o código contradiz; dependência declarada que não existe no código; contexto essencial faltando |
| Migration / dados | mudança de schema, migration, seed ou script que altera dados. Pare **antes** de criar ou aplicar; mostre a proposta e se é reversível |
| Edição/remoção de teste | qualquer alteração em teste, snapshot ou config de teste existente |
| Edição/remoção fora do plano | remover código, arquivo ou comportamento existente, ou tocar arquivo que não estava no diagnóstico |
| Dependência nova | instalar ou atualizar pacote |
| Escopo estourado | a task se revela maior que "simples" (gatilhos na Fase 0) |
| Ambiente | testes não rodam, não há infra de teste para a camada, build já quebrado antes de você mexer |

Decisão pequena e reversível (tamanho de truncamento, texto de placeholder, ordem de colunas) **não é gate**: siga o precedente do código, registre como suposição no diagnóstico e continue.

Formato do gate:

```
⛔ GATE — <tipo>
Encontrei: <fato> (arquivo:linha)
Por que parei: <risco/impacto>
Opções: A) … (recomendo, porque …)  B) …
Preciso de: <decisão ou informação exata>
```

Apresente e pare. Com a resposta, continue exatamente de onde parou.

## Fase 0 — Preparação (execute sem narrar)

1. `git rev-parse HEAD` → guarde como **BASE**. `git status --short`: alterações pré-existentes são do Pedro e nunca entram nos seus commits.
2. Descubra os comandos reais do projeto (scripts do package.json, Makefile, .csproj): teste, typecheck, lint, build. Não invente comando.
3. Rode os testes da área afetada **antes de mexer**. O que já falha é baseline: registre, não corrija, não use como desculpa.
4. Confira cada afirmação do card contra o código ("o backend já devolve X", "o mesmo seletor das outras telas", "depende do card Y"). Afirmação falsa ou dependência ausente → gate de dúvida crítica.
5. Gatilhos de escopo estourado: mudança em mais de ~2 camadas independentes, contrato de API consumido em outros lugares, migration, ou mais de ~10 arquivos de produção. Bateu → gate recomendando multifile_workflow.

## Fase 1 — Diagnóstico (apresente, depois siga)

Em até ~25 linhas:

- **Entendimento:** 1–2 frases.
- **Critérios de aceite:** lista numerada e verificável, incluindo os "não pode acontecer". Se o card não os explicita, derive do "como validar".
- **Causa raiz / estado atual:** com `arquivo:linha`. Em bug: por que acontece, não só onde.
- **Plano mínimo:** arquivos que vai tocar e o que muda em cada. Reuso primeiro: cite o componente/hook/util existente que vai aproveitar.
- **Plano de testes:** teste → critério que prova → nível (unit/componente/integração). Liste os testes existentes que protegem as regressões; se não houver, quais testes de caracterização vai criar.
- **Fora de escopo:** o que o card exclui + o que você notou e não vai fazer.
- **Suposições / gates:** havendo gate, abra aqui e pare. Sem gate, siga para a Fase 2 na mesma resposta.

## Fase 2 — Ciclo TDD (um critério por vez)

1. **Red:** escreva o menor teste que expressa o comportamento, com valor esperado tirado do card/spec — nunca do output do código. Rode só esse teste. Ele precisa falhar por **ausência do comportamento** (asserção), não por import quebrado, typo ou setup. Guarde a linha da falha.
2. **Green:** implemente o mínimo para passar. Rode o teste, depois a suíte da área.
3. **Prova anti-falso-positivo:** em lógica com condição ou limite (filtro, busca, truncamento, status), faça uma mutação temporária no código de produção via Edit (inverter condição, trocar limite), confirme que algum teste fica vermelho, desfaça e confirme verde. Nenhum teste pegou → o teste é fraco; fortaleça antes de seguir.
4. **Refactor:** só no código que você escreveu nesta task; suíte continua verde.

Regressões ("não pode acontecer") sem cobertura: escreva **testes de caracterização antes** de mexer no código. Eles passam desde o início (única exceção ao red-first) e precisam continuar verdes no final.

Qualidade de teste — o essencial (detalhes e exemplos em `references/test-quality.md`, leia antes do primeiro teste):
- teste o observável (o que o usuário vê, o que a função retorna, o que vai na request), não detalhes internos;
- mocke só fronteiras (rede, tempo, storage), seguindo o padrão de mock que o projeto já usa;
- asserções específicas; snapshot nunca é a única asserção;
- async com `findBy`/`waitFor`, nunca `sleep`.

## Disciplina de escopo (anti-overengineering)

- Toda linha alterada precisa ser rastreável a um critério de aceite. Não é? Remova.
- Reuse antes de criar: procure componente/hook/util parecido. Nada de abstração para uso único, configurabilidade não pedida, tratamento de erro para cenário impossível ou padrão divergente do código ao redor.
- Não "melhore" código vizinho, formatação, nomes ou comentários. Viu problema não relacionado? Vai para "Observações", não para o diff.
- Remova só o que **você** tornou órfão (imports, variáveis).
- Diff crescendo além do plano do diagnóstico → pare e reavalie: simplifique ou abra gate de escopo.

## Fase 3 — Verificação final

1. Suíte da área (e a completa, se rodar em tempo razoável), typecheck, lint e build com os comandos do projeto.
2. Integridade dos testes: `node ${CLAUDE_SKILL_DIR}/scripts/test-guard.mjs verify <BASE>`. Violação não aprovada pelo Pedro no chat → gate. Leia as inserções listadas e confirme que nenhuma desativa teste existente.
3. Auto-revisão de `git diff <BASE>`: escopo, reuso, sem `console.log`/debug, sem código comentado, sem TODO novo, sem dependência nova, estilo consistente, nenhum arquivo alheio.

## Fase 4 — Commits

Use a `commit-conversional-skill`, granular:
- um commit por unidade lógica (normalmente teste + implementação de um critério), cada commit com a suíte verde;
- `git add <caminhos explícitos>`, nunca `-A` ou `.`; alterações pré-existentes do Pedro ficam fora;
- sem push, sem `--no-verify`.

## Fase 5 — Relatório final + smoke

Responda só com isto:

```
**Problema:** <1–2 frases: o que estava errado e por quê>
**Solução:** <1–3 frases: o que mudou e onde>

**Critérios:** 1 ✅ <teste que prova> · 2 ✅ … (❌/⚠️ com motivo, se houver)
**Testes:** <N> novos · <comando> ✅ · baseline já falhando: <lista ou "nenhum">
**Integridade:** testes existentes intactos (verify OK) | alterações aprovadas: <lista>
**Commits:** <hash> <mensagem> (um por linha)
**Observações:** <fora de escopo notado, riscos, suposições — omita se vazio>
```

Por fim, pergunte (AskUserQuestion, se disponível): **"Smoke: prefere que eu rode ou quer as instruções?"**
- **Rodar:** execute com o que estiver disponível (app local + browser/Playwright), cobrindo o "como validar" do card e as regressões; relate o que viu. Sem como rodar → diga e passe as instruções.
- **Instruções:** passos numerados curtos (rota → ação → resultado esperado), incluindo as checagens de regressão.
