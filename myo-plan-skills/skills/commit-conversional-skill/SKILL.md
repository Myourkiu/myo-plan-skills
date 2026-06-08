---
name: commit-conversional-skill
description: Use sempre que estiver prestes a criar um commit git em qualquer projeto. Impõe Conventional Commits em inglês, somente título — sem corpo, sem trailers, sem Co-Authored-By, sem referências a Claude/Cursor/Copilot ou ferramentas. Um commit = uma responsabilidade.
---

# Commit Conversional Skill

Estilo obrigatório para **todos** os commits, em qualquer repo.

## Formato

```
type(scope): short description in present tense
```

- **Sempre em inglês.**
- **Apenas o título** — uma linha, ≤ 70 chars, presente do indicativo, sem ponto final.
- **Sem corpo.** Não explicar o quê nem o porquê na mensagem do commit. Justificativas vivem no código (XML summaries, comentários inline) ou no PR.
- **Sem trailers e sem referências de autoria externa.** Nada de:
  - `Co-Authored-By: ...`
  - `Signed-off-by: ...`
  - `🤖 Generated with Claude Code`
  - Menções a Claude, Cursor, Copilot, ChatGPT, IA, etc.
  - Links de geração ou rodapés automáticos.

A mensagem é exatamente `type(scope): description`. **Nada mais.**

## Granularidade

**Um commit = uma responsabilidade.** Não misturar tipos diferentes (`feat` + `refactor` + `test`) no mesmo commit. Se a mudança tem dois propósitos, são dois commits.

Em fluxo TDD: o **teste** é um commit (`test(...)`), a **implementação** é outro (`feat(...)` ou `fix(...)`), a **refatoração** com a suíte verde é um terceiro (`refactor(...)`).

## Tipos

| Tipo       | Quando usar                                                              |
|------------|--------------------------------------------------------------------------|
| `feat`     | Nova funcionalidade ou nova regra de negócio                             |
| `fix`      | Correção de bug                                                          |
| `refactor` | Reorganização de código sem mudar comportamento                          |
| `test`     | Adição ou modificação de testes                                          |
| `docs`     | Documentação (READMEs, summaries em massa, CLAUDE.md)                    |
| `chore`    | Build, deps, configs, housekeeping                                       |
| `perf`     | Mudança focada em performance                                            |
| `style`    | Formatação, whitespace, naming sem mudança semântica                     |

## Scope

Identificador curto do módulo/feature/área afetada. Exemplos: `auth`, `api`, `domain`, `infra`, `db`, `deps`, `docker`, `tests`, ou nome de uma feature concreta (`import-jobs`, `categories`, `transactions`).

## Comando git

Usar `-m` direto, **sem heredoc**, **sem `--amend`** (a não ser que o usuário peça explicitamente), **sem `--no-verify`**.

```bash
git commit -m "feat(import-jobs): add filepath to entity"
```

Para múltiplos commits granulares, encadear `git add` + `git commit -m` em sequência.

## Exemplos válidos

```
feat(import-jobs): add filepath to ImportJob entity
fix(rabbitmq): declare DLX before main exchange to avoid race
refactor(categories): extract enum conversion to converter
test(transactions): cover update with foreign user id
docs(domain): add summaries to Money value object
chore(deps): bump RabbitMQ.Client to 6.8.1
perf(transactions): add UserId Date index for monthly listing
style(worker): normalize whitespace in CsvProcessorWorker
```

## Exemplos inválidos

```
update stuff                                          ← não é Conventional Commits
feat: várias coisas                                   ← sem scope, descrição vaga, em PT
feat(import): add upload, fix bug, refactor handler   ← não é granular
Feat(import-jobs): Add Upload.                        ← capitalização errada e ponto final
```

E **qualquer commit com corpo ou trailer é inválido**:

```
feat(domain): add filepath to entity     ← ESTA LINHA OK,
                                            mas tudo abaixo é proibido:
Tracks the absolute path of the uploaded
CSV in the shared volume...

Co-Authored-By: Claude <noreply@anthropic.com>
🤖 Generated with Claude Code
```

## Antes de commitar

1. `git status` — confirmar quais arquivos entram em cada commit.
2. `git diff` (e `git diff --cached`) — entender o que mudou para escolher o `type` e `scope` corretos.
3. `git log --oneline -5` — espelhar o estilo dos commits anteriores do repo.
4. Agrupar arquivos por responsabilidade. Se um único `git add` pega arquivos de propósitos diferentes, fazer `add` separados.
5. Commitar um por um com `-m` direto. Verificar com `git log --oneline` no final.

## O que NUNCA fazer

- Adicionar `Co-Authored-By` automaticamente.
- Adicionar rodapé `🤖 Generated with Claude Code` ou similar.
- Criar commits com corpo "explicando a mudança".
- Misturar `feat` + `refactor` no mesmo commit "para economizar histórico".
- Usar `--amend` sem o usuário pedir.
- Usar `--no-verify` para pular hooks.
- Escrever a mensagem em português ou outro idioma que não inglês.
