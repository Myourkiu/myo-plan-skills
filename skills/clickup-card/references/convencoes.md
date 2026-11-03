# Convenções — board SgBR (ClickUp)

Fonte das regras usadas pela skill `clickup-card`. Mudou uma regra do time → muda aqui, não no SKILL.md.

---

## 1. Board

| Item | Valor |
|---|---|
| Lista | `Shared with me › SG Super › Tarefas` — `list_id` **901325021370** |
| Acesso | por compartilhamento: `get_workspace_hierarchy` volta vazio; usar `get_task`, `search`, `filter_tasks` |
| Campo "Stack Super" (labels) | field `045d8c61-385c-4ad7-86e8-e41904447c7a` · Backend `91b4e6a3-3294-4a58-8308-d09b20abe105` · Frontend `7669cc53-4ccc-4eb7-9bd9-4cc810de0cf0` · Desktop `31d1f30f-0151-4976-892b-1f0d587c8aba` |
| Tags | `sgsuper` sempre + `sgsuper-pdv` e/ou `sgsuper-web` |

| Pessoa | Papel | Usuário |
|---|---|---|
| Pedro Figueiredo | dev (quem usa a skill) | **284444818** |
| Luan Coldebella | autor dos BLOCOs e dos cards de stack | 72756919 |
| Bruna Varela | `[FRONTEND]` da web | 118084166 |
| José Lucas | `[BACKEND]` (Compras e outros) | 284444793 |

O campo Stack, as tags e a prioridade dos cards de stack são do autor: não mexer. Os demais campos personalizados (Equipe Suporte, Grupo Vip, Avisado da att, Resp. pela análise…) são do fluxo de suporte — **nunca preencher**.

---

## 2. Status — quem move

| Status | Quem move | Quando |
|---|---|---|
| aberto | — | task criada |
| aguardando desenv. | **autor** | BLOCO entregue para desenvolvimento |
| pendente | autor / dev | card de stack ou fase na fila |
| parado | dev | bloqueado — sempre com comentário dizendo o bloqueio |
| em andamento | dev | começou (plano ou código) |
| pr git aguardando | dev | código pronto, PR ainda não aberto |
| pr git aberta | dev | PR aberto (ou mergeado na branch base, seção 8) |
| ambiente dev · a testar hom · em teste hom · testado · upado | **somente QA / implantação** | — |

**Teto do dev: `pr git aberta`.** Nunca mover para `ambiente dev` ou além, e nunca mexer em task que já esteja de `ambiente dev` em diante.

**O BLOCO nunca é movido pelo dev:** o status dele é do autor.

**Status a partir das filhas** (subdivisões → fase; fases → card de stack), com o mesmo teto:

| Situação das filhas | Status da task acima |
|---|---|
| Nenhuma começou (todas em `aberto`/`pendente`) | `pendente` |
| Alguma começou e alguma ainda está antes de `pr git aguardando` (inclui as que nem começaram) | `em andamento` |
| Todas em `pr git aguardando` ou além | `pr git aguardando` |
| Todas em `pr git aberta` ou além | `pr git aberta` |

Ex.: FASES A–E em `pr git aguardando` + FASE F em `em andamento` + FASES G–M em `aberto` → card de stack em `em andamento`.

---

## 3. Estrutura: BLOCO → card de stack → fases → subdivisões

Moldes: `[COMPRAS] Entrada de mercadorias` (fases longas subdivididas) e `[FINANCEIRO] Prestação de contas da Filial à Matriz` (pré-requisitos e fases em mais de um repo).

```text
[<MÓDULO>] <nome>   (o prefixo pode faltar)    BLOCO — card funcional do autor, sem pai
  aguarda (dependência) ↓                       problema, regras, critérios, decisões pendentes; contexto de negócio e QA
[BACKEND] <nome>                                card de stack, sem pai, com responsável; criado pelo autor
├─ FASE A — <nome>                              pré-requisito também é FASE (seção 4.1)
├─ FASE D — <nome>                              fase longa: subdividida
│  ├─ D1 — <nome>                               resumo no estilo da spec (seção 5.3)
│  └─ D2 — <nome>
└─ …
[FRONTEND] <nome>                               front da web (outro dev); mesmo formato
[PDV] <nome>                                    Terminal (frente de caixa); mesmo formato
```

- **BLOCO:** o card funcional. Quem cria é o autor (em geral o Luan), que também cria os cards de stack e faz o BLOCO **aguardar** cada um deles. Pode ter prefixo de módulo (`[COMPRAS]`, `[FINANCEIRO]`) ou não, e pode nem ter épico. Somente leitura para o dev. As subtasks do BLOCO ficam só para os BUGs que o QA abrir.
- **Como achar um a partir do outro:** no card de stack, o BLOCO é a task que ele bloqueia (aparece como "Bloqueio" no ClickUp; na API, a dependência em que `depends_on` = card de stack). No BLOCO, os cards de stack são as tasks que ele aguarda.
- **Card de stack:** título `[BACKEND] <nome do BLOCO>`, `[FRONTEND] …` ou `[PDV] …`, sem pai, já com responsável, campo Stack e tags. A descrição do autor diz para criar as fases e traz pontos de atenção: nunca reescrever (seção 5.1). Comentários técnicos e o contrato com o outro lado ficam aqui (seção 7.1); o BLOCO fica para o contexto funcional e o QA.
- **Épico e REF:** os BLOCOs antigos (`[MÓDULO] BLOCO NN`, `REF — BLOCO NN`, TAREFA e PRÉ TAREFA) foram arquivados. Se aparecer um, é só histórico: não escrever, e perguntar ao usuário qual é o card atual.
- **Nunca** criar task de stack: quem cria é o autor. Faltou o card da stack do Pedro → perguntar.

### 3.1 Stacks e prefixos de repo

| Card de stack | Fases que entram nele | Repo (`sgsuper/apps/...`) |
|---|---|---|
| `[BACKEND]` | `[CONTRATOS]`, `[BACK-WEB]`, `[BACK-PDV]` | contracts / compartilhado · web/backend · pdv/backend (ServidorPdv) |
| `[FRONTEND]` | `[FRONT-WEB]` | web/frontend (Vue) |
| `[PDV]` | `[FRONT-PDV]` | pdv/frontend (TerminalPdv, Avalonia) |

O servidor local do PDV é back: as fases dele ficam no `[BACKEND]`. O `[PDV]` é só o Terminal.

| Prefixo de fase | Tags da fase |
|---|---|
| `[CONTRATOS]` | sgsuper, sgsuper-pdv, sgsuper-web |
| `[BACK-WEB]`, `[FRONT-WEB]` | sgsuper, sgsuper-web |
| `[BACK-PDV]`, `[FRONT-PDV]` | sgsuper, sgsuper-pdv |

---

## 4. Fases

- **Uma fase = um repo, uma branch, um PR.** Ordem: contrato → back → front.
- **Título:** `FASE A — <verbo no infinitivo + o quê>` ou `FASE A — <tema>`, em linguagem de negócio. O prefixo de repo entra só quando o card de stack cruza mais de um repo: `FASE B — [BACK-PDV] Encerrar o dia no servidor local`. Card todo num repo (ex.: a entrada de mercadorias, só web) → sem prefixo.
- **Letras** em ordem de execução, a partir de A.
- **Status inicial** `pendente`, responsável = dono do card de stack.
- **Fase já implementada** (há HANDOFF no `/plans`) nasce no status real (seção 2), com os PRs no acompanhamento.

### 4.1 Pré-requisito e fase longa

- **Pré-requisito vira fase normal.** O que outras fases precisam e não é escopo do BLOCO (uma fundação, uma correção de base, outra parte do roadmap) não ganha task própria acima das fases: é uma fase nas primeiras letras, com a seção `## Pré-requisito de` dizendo quais fases dependem dela e por quê. Ex.: FASE A — vincular os usuários atuais ao Keycloak, pré-requisito da FASE D (remover a senha).
- **Fase longa se subdivide.** Fase com mais de uma entrega independente, ou que passaria de ~8 tasks no quick-plan, ganha subdivisões dentro dela:
  - título `<letra><n> — <nome>` (`D1 — Bloqueio de NF-e de transferência interna`); item que se parte de novo → `G2.1`, `G2.2`;
  - cada subdivisão é pequena: cabe num quick-plan e tem critério de pronto próprio;
  - a descrição da fase resume cada subdivisão em uma linha (seção 5.2) e a subdivisão traz o resumo no estilo da spec (seção 5.3);
  - a branch e o PR continuam da fase; a subdivisão só ganha branch própria se for grande demais para o PR da fase;
  - mais de ~4 subdivisões → considerar quebrar em duas fases.

### 4.2 Relações

**Regra:** dependência ("aguardando") **só entre fases, e só quando a fase da qual se depende ainda não foi implementada** e a outra realmente não consegue começar sem ela. Em todos os outros casos, **link**.

Por quê: no ClickUp, a task que "aguarda" fica marcada como **bloqueada até a outra chegar a `testado`/`upado`**, e esses status são do QA. Uma dependência com código já pronto deixa o board cheio de "bloqueado por dependência" por semanas sem nada bloquear de verdade.

| Situação | Ferramenta | Tipo |
|---|---|---|
| Fase que precisa de um pré-requisito **ainda não feito** | `add_task_dependency` | fase `waiting_on` a fase pré-requisito |
| Fase de front (`[FRONTEND]`/`[PDV]`) que não começa sem o endpoint/evento que uma fase de back **ainda vai criar** | `add_task_dependency` | fase de front `waiting_on` fase de back |
| Mesma funcionalidade, dá para andar em paralelo, ou o lado do qual se depende **já está implementado** | `add_task_link` | link |
| BLOCO ↔ cards de stack | — | do autor (o BLOCO aguarda os cards de stack); nunca mexer |

- A hierarquia (card de stack → fase → subdivisão) já mostra quem é de quem: sem link entre pai e filha.
- **Dependência fica na fase, não no card inteiro:** a fase que precisa aguarda a fase exata que entrega aquilo, e as que não dependem de nada começam antes.
- Quando a fase que bloqueava fica pronta (PR aberto), **trocar a dependência por link** (`remove_task_dependency` + `add_task_link`).

---

## 5. Modelos de descrição

Linguagem de negócio, frases curtas, sem detalhe de código: quem gerencia o board entende a task em segundos. O detalhe técnico fica no `/plans`.

### 5.1 Card de stack (só acrescentar)

A descrição é do autor. Reler na hora e reenviar o texto dele intacto, com estas seções no fim:

```
## Fases
- FASE A — <nome> (pré-requisito de C e D)
- FASE B — <nome>
- …

---
## Acompanhamento (dev)
- Plano: plans/<tema>/<slug>/
- Branch base: feature/<base> (a partir da dev) — ou —, sem base
- PR base → dev: <link ou —>
```

Ao atualizar: trocar só o que vem depois de `## Fases`; nunca tocar no texto acima.

### 5.2 Fase

Até ~30 linhas. Molde: `FASE D — Ajustes da entrada e listagem`.

```
## Objetivo
Uma ou duas frases: o que a fase entrega, em linguagem de negócio.

## O que entrega
- **D1 — <nome>:** uma ou duas frases.
- **D2 — <nome>:** …
(fase sem subdivisão: 2 a 5 itens do que muda)

## Pré-requisito de
- FASE C e FASE D: <por quê, em uma linha>   (só quando for pré-requisito)

## Fora do escopo
- …

## Decisões
- <decisão> (<quem>, <data>)   (só se houver)

## Impacto nas outras stacks
- **Front:** o que muda na tela.   (só se houver)

---
## Acompanhamento (dev)
- Branch: <branch da fase> → <base ou dev>
- PR: <link ou —>
```

### 5.3 Subdivisão

Até ~15 linhas, no estilo da spec. Molde: `E2 — Destino e papel de cada unidade`.

```
## O que muda
Uma frase, do ponto de vista de quem usa.

## Regras
- 2 a 5 regras curtas.

## Pronto quando
- Exemplo concreto verificável (dado, ação, resultado). Ex.: "A Matriz cria uma compra com destino na Filial 10, mas não consegue conferir nem confirmar."
```

### 5.4 Depois do planejamento

- quick-plan: a descrição da fase só muda se o planejamento mudou o que ela entrega.
- multi_file_workflow: a `SPEC.md` aprovada é anexada na fase, com nome que diga a fase (`SPEC-fase-d-<tema>.md`). PLAN e TASKS ficam só no `/plans`.

---

## 6. Anexos

Para anexar um arquivo local (`FASES.md`, `SPEC-*.md`): pedir um ticket por arquivo com `clickup_request_attachment_upload` (`task_id` + `file_name`), montar um `jobs.json` no scratchpad e rodar `python -I scripts/upload_attachments.py jobs.json`; apagar o `jobs.json` depois (tem os tickets). Os tickets vencem em poucos minutos: pedir todos e subir em seguida. Não usar `clickup_attach_task_file` com base64 para arquivos locais: o conteúdo inteiro iria no texto da chamada.

- `FASES.md` → no card de stack (`FASES-v<n>.md` em nova versão).
- `SPEC-*.md` → na fase.
- Nada é anexado no BLOCO.

---

## 7. Comentários (só em marcos)

| Marco | Onde | Texto |
|---|---|---|
| Fases criadas | card de stack | `Fases criadas: <lista>. Pré-requisitos: <fases>. Plano em plans/<tema>/<slug>/.` |
| Fases mudaram | card de stack | `Fases atualizadas (v<n>): <o que mudou em uma linha>.` |
| PR aberto | fase | `PR aberto: <link>.` |
| Bloqueio | fase | `Parado: <motivo>. Destrava quando <condição>.` |
| Handoff de sessão | fase | `Feito: … · Falta: … · Próximo passo: …` (3 linhas no máximo) |
| Dúvida de regra (decisão pendente) | BLOCO | `Dúvida para a FASE <X>: <pergunta>. Enquanto isso: <o que a fase assume ou espera>.` — só com o OK do usuário; é a única escrita no BLOCO |

Nunca comentar por commit. `notify_all` sempre `false`.

### 7.1 Contrato e "Pronto para integrar" (com menção)

O contrato entre back e front é combinado por comentário no **próprio** card de stack, com menção ao dono do outro card: `[@Nome](#user_mention#<id>)` (ids na seção 1). Nunca editar o card de stack de outra pessoa.

**Contrato** (quando a fase de back define o que o front consome): endpoints, eventos e DTOs (objetos de dados trocados) em tabela curta, para o front poder começar com dados fictícios.

**Pronto para integrar** (ao fim de cada fase de back que entrou na base ou na `dev`, se existe `[FRONTEND]`/`[PDV]` no mesmo BLOCO e o que a fase entregou **funciona sozinho**). Fase que só faz sentido junto com a próxima fica sem comentário, e ele sai com a fase que fecha o recorte.

```
[@Bruna](#user_mention#118084166) FASE <X> pronta para integrar — <o que ficou pronto, em uma linha>
Branch: <base ou dev> · PR: <link>

O que já dá para fazer
- 2 a 4 itens: a tela ou ação e o que o back já resolve.

Endpoints
| Método | Rota | Para quê |
|---|---|---|

Ainda não disponível
- O que depende de fase em andamento.

Sugestões
- Só o que o usuário pedir para incluir (libs, convenções).
```

Mostrar o texto no chat e **perguntar ao usuário se há sugestões** — quem dá as sugestões é ele; nunca inventar.

---

## 8. Branches

- **Sem branch base** (BLOCO pequeno, entra na `dev` de uma vez): branch da fase a partir da `dev`, PR para a `dev`.
- **Com branch base** (BLOCO com várias fases, em que o QA testa e o front integra por partes, ou um módulo inteiro como o Financeiro): **sugerir** ao usuário. Se a base já existe no repo, usar; se não, propor criar a partir da `dev`.

```text
dev
└─ feature/<base>                            base: o módulo (feature/financeiro) ou o BLOCO (feature/keycloak)
   ├─ feature/<base>-<bloco>-fase-a          PR → feature/<base>   (base = BLOCO: feature/<base>-fase-a)
   ├─ feature/<base>-<bloco>-fase-b          PR → feature/<base>
   └─ …
feature/<base>                               PR → dev quando o usuário decidir
```

- `<bloco>` é um slug curto do BLOCO (`prestacao`, `entrada`). Ex.: `feature/financeiro-prestacao-fase-a`.
- A base existe em cada repo que o BLOCO toca; a branch da fase nasce no repo da fase.
- **Antes de começar cada fase**, no repo dela, conferir se a `dev` andou:

  ```bash
  git fetch origin
  git log --oneline origin/feature/<base>..origin/dev
  ```

  Saída vazia → criar a branch da fase. Com commits → atualizar a base antes: `git switch feature/<base>`, `git pull --ff-only`, `git merge origin/dev` (merge, nunca rebase: QA e front usam a base), resolver conflitos, rodar build e testes, mostrar no chat o que entrou e só com o ok fazer o `git push`. Depois criar a branch da fase a partir da base atualizada.
- **Status da fase:** código pronto sem PR → `pr git aguardando`; PR aberto → `pr git aberta`; mergeado na base → continua `pr git aberta` (o QA testa na base e move dali em diante).

---

## 9. Restrições

1. **Gate antes de escrever:** fases e textos aparecem no chat (e em `FASES.md`) e só vão ao ClickUp com "ok" explícito.
2. **BLOCO:** somente leitura. Nada de subtask, anexo, edição ou status; comentário só para dúvida de regra, com o OK do usuário.
3. **Card de stack do autor:** o texto dele nunca é reescrito; só se acrescentam `## Fases` e o acompanhamento no fim.
4. **Card de stack de outra pessoa:** somente leitura; contrato e handoff vão por comentário com menção no card do Pedro.
5. **Não duplicar:** card de stack já com fases → conciliar. Card de outra pessoa sobre a mesma funcionalidade (fora do BLOCO) é mostrado com as divergências e ligado por link, só com o OK do usuário.
6. **Tamanho:** fase que passaria de ~8 tasks → subdividir; mais de ~4 subdivisões → considerar duas fases.
7. **Só escreve em:** o card de stack do Pedro, as fases e subdivisões dele, e o BLOCO só no caso do item 2.
8. **Escrita:** português; termos técnicos explicados entre parênteses; nunca usar o símbolo de seção.
