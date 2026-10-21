# Convenções — board SgBR (ClickUp)

Fonte das regras usadas pela skill `clickup-card`. Mudou uma regra do time → muda aqui, não no SKILL.md.

---

## 1. Board

| Item | Valor |
|---|---|
| Lista | `Shared with me › SG Super › Tarefas` — `list_id` **901325021370** |
| Acesso | por compartilhamento: `get_workspace_hierarchy` volta vazio; usar `get_task`, `search`, `filter_tasks` |
| Usuário do Pedro | **284444818** |
| Campo "Stack" (labels) | field `766ad81c-b381-4e29-a713-89595296b4bf` · Backend `9a82cdd9-b507-45c0-b35c-c31a4ee17c04` · Frontend `f9638c49-c300-4c4e-b58f-6995076726e7` |
| Tags | `sgsuper` sempre + `sgsuper-pdv` e/ou `sgsuper-web` |

Os demais campos personalizados (Equipe Suporte, Grupo Vip, Avisado da att, Resp. pela análise…) são do fluxo de suporte — **nunca preencher**.

---

## 2. Status — quem move

| Status | Quem move | Quando |
|---|---|---|
| aberto | — | card criado |
| pendente | dev | subtask criada / na fila |
| em andamento | dev | começou a subtask (plano ou código) |
| parado | dev | bloqueado — sempre com comentário dizendo o bloqueio |
| pr git aguardando | dev | código pronto, PR ainda não aberto |
| pr git aberta | dev | PR aberto |
| a testar · em teste · testado · upado | **somente QA** | — |

**Teto do dev: `pr git aberta`.** Nunca mover para `a testar` ou além, e nunca mexer em task que já esteja de `a testar` em diante.

**Task principal** (mesmo teto do dev):

| Situação das subtasks | Status da principal |
|---|---|
| Nenhuma começou (todas em `aberto`/`pendente`) | `pendente` |
| Alguma começou e alguma ainda está antes de `pr git aguardando` (inclui as que nem começaram) | `em andamento` |
| Todas em `pr git aguardando` ou além | `pr git aguardando` |
| Todas em `pr git aberta` ou além | `pr git aberta` |

Ex.: backs em `pr git aguardando` + fronts em `pendente` → principal em `em andamento` (e não `pendente`: a regra antiga "acompanha a menos avançada" fazia a principal regredir).

**Módulo grande (seção 3.1):** a mesma tabela vale em cada nível — a PRÉ TAREFA a partir das fases dela, a TAREFA a partir das fases e PRÉ TAREFAs dela, o BLOCO a partir das TAREFAs. BLOCO e épico são do autor do módulo: o status deles só muda com o OK do usuário. Status da fase com branch base: seção 3.2.

---

## 3. Stacks e prefixos

Dois níveis de prefixo:

- **Stack**: a task que o board mostra por stack. São três: `[WEB-BACKEND]`, `[WEB-FRONTEND]` e `[PDV]`. O PDV é **uma stack só**, com servidor local (back) e Terminal (front) na mesma task, porque o front do PDV também é C# (Avalonia).
- **Fase**: uma fase = **um repo, uma branch, um PR**. O prefixo diz o repo.

| Stack | Fases que entram nela | Campo Stack | Tags |
|---|---|---|---|
| `[WEB-BACKEND]` | `[CONTRATOS]`, `[BACK-WEB]` | Backend | sgsuper, sgsuper-web |
| `[WEB-FRONTEND]` | `[FRONT-WEB]` | Frontend | sgsuper, sgsuper-web |
| `[PDV]` | `[BACK-PDV]`, `[FRONT-PDV]` (e `[CONTRATOS]` quando só o PDV usa) | Backend e/ou Frontend, conforme as fases | sgsuper, sgsuper-pdv |

| Prefixo de fase | Repo (`sgsuper/apps/...`) | Tags |
|---|---|---|
| `[CONTRATOS]` | contracts / compartilhado | sgsuper, sgsuper-pdv, sgsuper-web |
| `[BACK-PDV]` | pdv/backend (ServidorPdv) | sgsuper, sgsuper-pdv |
| `[FRONT-PDV]` | pdv/frontend (TerminalPdv, Avalonia) | sgsuper, sgsuper-pdv |
| `[BACK-WEB]` | web/backend | sgsuper, sgsuper-web |
| `[FRONT-WEB]` | web/frontend (Vue) | sgsuper, sgsuper-web |

`[CONTRATOS]` é fase, não stack: entra na task da stack que consome o contrato primeiro (em geral `[WEB-BACKEND]`), e as fases que dependem dele aguardam essa fase (seção 4).

**Card normal (sem BLOCO):** uma subtask por stack envolvida, título `<STACK> <verbo no infinitivo + o quê>` — ex.: `[WEB-BACKEND] Expor endpoint de resposta da autorização`. Subtask que mexe num repo só é um PR e não tem fases. Subtask que mexe em mais de um repo (o `[PDV]` com servidor e Terminal, ou um contrato novo) ganha fases dentro dela, uma por repo, no formato da seção 3.1.

### 3.1 Módulo grande: épico → BLOCO → TAREFA por stack → fases

Molde: `[FINANCEIRO] BLOCO 01 — Prestação de contas da Filial à Matriz` (21/10/2026). É o BLOCO mais complexo do Financeiro, com PRÉ TAREFAs, por isso serve de referência para todos.

```text
[EPIC] Módulo <X>                          task principal: roadmap e anexos do módulo (do autor)
├─ REF — BLOCO NN — <nome>                 só referência: link para o BLOCO; nunca escrever aqui
└─ BLOCO NN — <nome>                       item do roadmap que ainda não virou task própria

[<MÓDULO>] BLOCO NN — <nome>               task sem parent na lista Tarefas; regras do bloco no anexo do autor
├─ [WEB-BACKEND] TAREFA NN — <nome>        uma subtask por stack
│  ├─ PRÉ TAREFA NN — [BACKEND] <o quê>    pré-requisito, dentro da TAREFA que depende dele
│  │  └─ FASE A, B… — <PREFIXO> <verbo + o quê>
│  └─ FASE A, B… — <PREFIXO> <verbo + o quê>
├─ [WEB-FRONTEND] TAREFA NN — <nome>       front da web (outro dev); recebe o handoff por fase (seção 5.2)
└─ [PDV] TAREFA NN — <nome>                servidor local e Terminal na mesma TAREFA
   └─ FASE A, B… — [BACK-PDV] / [FRONT-PDV] <verbo + o quê>
```

- **Como reconhecer:** link de um `[MÓDULO] BLOCO NN`, de uma subtask do épico (`BLOCO NN` ou `REF — BLOCO NN`) ou de qualquer task dessa árvore.
- **REF:** os primeiros BLOCOs refatorados ficaram com uma subtask `REF — BLOCO NN` no épico; o certo seria ter só o BLOCO. A REF é um ponteiro: abrir os `linked_tasks` dela e trabalhar no `[MÓDULO] BLOCO NN`. Nunca escrever na REF nem criar nada no épico.
- **BLOCO ainda sem task própria** (subtask do épico sem `[MÓDULO] BLOCO` ligado): mostrar e perguntar ao usuário se cria no molde (task sem parent na lista Tarefas, nome com o prefixo do módulo, link com a subtask do épico) ou se espera o autor do módulo.
- **TAREFA:** título `<STACK> TAREFA NN — <nome do BLOCO ou recorte>`, subtask do BLOCO, tags e campo Stack da stack (seção 3). `NN` conta por stack dentro do BLOCO: quase sempre só existe a 01; BLOCO grande demais para uma TAREFA da mesma stack se fragmenta em TAREFA 02, 03… Fases só da própria stack (tabela da seção 3).
- **PRÉ TAREFA:** o que o BLOCO precisa mas não é escopo dele (ex.: fundação de outra fase do roadmap). Título `PRÉ TAREFA NN — [BACKEND] <o quê>`, contagem própria no BLOCO, subtask da TAREFA que depende dela. Serve para a TAREFA não ficar inflada nem acumular entregas que não são dela. Por ser fundação, pode ter fases de mais de um repo de back (`[CONTRATOS]`, `[BACK-PDV]`, `[BACK-WEB]`).
- **Fase:** título `FASE A — <PREFIXO> <verbo + o quê>`, subtask da TAREFA ou da PRÉ TAREFA, descrição no modelo da seção 5. As letras recomeçam em cada TAREFA e PRÉ TAREFA.
- **Nunca** criar task de stack direto no épico, na REF ou fora do BLOCO.
- **Anexos:** o roadmap do módulo (ex.: `FASES-<módulo>.md`) fica no épico e é reanexado quando muda; as regras do bloco ficam no `[MÓDULO] BLOCO` (anexo do autor); a SPEC, quando houver, fica na task planejada (seção 5.1).
- **Acompanhamento do BLOCO:** a árvore já mostra as TAREFAs, então o bloco de acompanhamento do BLOCO (seção 6) leva só o plano, a branch base e o PR base→`dev`. A descrição do BLOCO é do autor: reler na hora e reenviar o texto dele intacto, só com o bloco no fim.

### 3.2 Branches do módulo grande

Ao identificar um módulo grande, **sugerir** este fluxo ao usuário. Se a branch base já existe no repo, usar; se não, propor criar a partir da `dev`.

```text
dev
└─ feature/<módulo>                          branch base (intermediária), criada a partir da dev
   ├─ feature/<módulo>-b01-pt01-fase-a       PR → feature/<módulo>
   ├─ feature/<módulo>-b01-t01-fase-a        PR → feature/<módulo>
   └─ …
feature/<módulo>                             PR → dev quando o usuário decidir (fim do BLOCO ou de um recorte)
```

- **Uma branch por fase**, a partir da base, com PR para a base (nunca direto para a `dev`). As letras das fases recomeçam em cada TAREFA, então o nome leva o BLOCO e a task: `b01` = BLOCO 01, `t01` = TAREFA 01, `pt01` = PRÉ TAREFA 01. Ex.: `feature/financeiro-b01-t01-fase-a`.
- A base existe em cada repo que o módulo toca (contracts, pdv/backend, web/backend…); a branch da fase nasce no repo da fase.
- **Antes de começar cada fase**, no repo dela, conferir se a `dev` andou:

  ```bash
  git fetch origin
  git log --oneline origin/feature/<módulo>..origin/dev
  ```

  Saída vazia → criar a branch da fase. Com commits → atualizar a base antes: `git switch feature/<módulo>`, `git pull --ff-only`, `git merge origin/dev` (merge, nunca rebase: QA e front usam a base), resolver conflitos, rodar build e testes, mostrar no chat o que entrou e só com o ok fazer o `git push`. Depois criar a branch da fase a partir da base atualizada.
- **Por quê:** o QA testa na base o que já está estável enquanto as próximas fases andam, e o front integra o que já está na base sem esperar o módulo inteiro (seção 5.2).
- **Status da fase:** código pronto sem PR → `pr git aguardando`; PR para a base aberto → `pr git aberta`; mergeado na base → continua `pr git aberta` (teto do dev: o QA testa na base e move dali em diante).

---

## 4. Relações entre subtasks

Back e front da mesma funcionalidade **sempre** ficam relacionados (ex.: back na WEB ↔ implementação no front da WEB).

**Regra:** dependência ("aguardando") **só quando a task da qual se depende ainda não foi implementada** e o outro lado realmente não consegue começar sem ela. Em todos os outros casos, **link**.

Por quê: no ClickUp, a task que "aguarda" fica marcada como **bloqueada até a outra chegar a `testado`/`upado`** — e esses status são do QA. Uma dependência com código já pronto deixa o board cheio de "bloqueado por dependência" por semanas sem nada bloquear de verdade.

| Situação | Ferramenta | Tipo |
|---|---|---|
| Front não começa sem o endpoint/evento/campo que o back **ainda vai criar** | `add_task_dependency` | front `waiting_on` back |
| Fase `[CONTRATOS]` **ainda não feita** | `add_task_dependency` | fases de back e front `waiting_on` a fase de contrato |
| Mesma funcionalidade, dá para andar em paralelo (contrato já descrito) | `add_task_link` | link |
| O lado do qual se depende **já está implementado** (mesmo que ainda não esteja na `dev`) | `add_task_link` | link |
| Ordem entre backs que já aconteceu (registro histórico) | `add_task_link` | link |
| TAREFAs de stack do mesmo BLOCO entre si (`[WEB-BACKEND]` ↔ `[WEB-FRONTEND]` ↔ `[PDV]`) | `add_task_link` | link, sempre |

No módulo grande, a hierarquia (BLOCO → TAREFA → PRÉ TAREFA → fase) já mostra quem é de quem: sem link entre pai e filha. A regra de dependência vale entre fases; BLOCO, TAREFA e PRÉ TAREFA nunca recebem dependência.

**Dependência fica na fase, não na task inteira.** Quando uma TAREFA precisa de algo de uma PRÉ TAREFA (ou de outra TAREFA), a fase que precisa aguarda a fase exata que entrega aquilo. Ex.: `FASE C` da TAREFA 01 aguarda `FASE A` da PRÉ TAREFA 01 (o contrato), em vez de a TAREFA 01 inteira aguardar a PRÉ TAREFA 01 inteira. Assim as fases que não dependem de nada começam antes.

Quando a task que bloqueava fica pronta (PR aberto), **trocar a dependência por link** (`remove_task_dependency` + `add_task_link`) e ajustar a seção "Relações" da descrição.

Toda subtask de front cita, na seção **Contrato**, exatamente o que consome — assim pode começar com dados fictícios.

---

## 5. Modelo da descrição da subtask

Até ~60 linhas. É o README/SPEC da etapa e vira o material de entrada do quick-plan ou multi_file_workflow quando a subtask começar.

```
## Objetivo
Uma ou duas frases: o que esta etapa entrega.

## Contexto
Task principal: <link> · README: anexo da task principal
(módulo grande: BLOCO: <link do [MÓDULO] BLOCO> · TAREFA: <link> · Épico: <link>)

## Escopo
- ...

## Fora de escopo
- ...

## Contrato
Endpoints / eventos / DTOs que esta etapa expõe ou consome.

## Critérios de aceite
- Dado ..., quando ..., então ...

## Relações
- Aguarda: <link> (só se houver dependência real) · Relacionadas (link): <link>

## Testes esperados
- caminho feliz · validações de entrada · falhas esperadas (not found, conflict, validation) · transação, quando houver
```

### 5.1 Descrição depois do planejamento

Quando a task (TAREFA, PRÉ TAREFA ou subtask) é planejada, a descrição passa a ser o **plano em alto nível**. Objetivo: quem gerencia o board entra na task e entende em segundos do que ela trata, sem abrir o repositório.

```
## Objetivo
Uma ou duas frases, em linguagem de negócio.

## Como vai ser feito
- 3 a 6 itens: as etapas, na ordem, sem detalhe de código.

## Fora de escopo
- ...

## Riscos e decisões
- O que pode atrasar ou o que foi decidido no planejamento (só se houver).

## Relações
- Aguarda: <link> · Relacionadas (link): <link>

## Documentos
- SPEC: anexo `SPEC-<slug>.md` (só quando o planejamento usou o multi_file_workflow)
- Plano detalhado: plans/<tema>/<slug>/
```

- quick-plan: só a descrição, sem anexo.
- multi_file_workflow: a descrição acima + a `SPEC.md` aprovada anexada na task, com nome que diga a task (`SPEC-tarefa-01-<tema>.md`). PLAN e TASKS ficam só no `/plans`.
- A descrição continua terminando no bloco de acompanhamento (seção 6).

### 5.2 Handoff para o front da web (por fase)

**Quando:** ao fim de cada fase de back (de TAREFA ou PRÉ TAREFA) que entrou na branch base (seção 3.2) — ou na `dev`, fora do módulo grande —, se existe task `[WEB-FRONTEND]` ligada e o que a fase entregou **funciona sozinho**: o front consegue integrar sem esperar fase ainda em andamento. Ex.: FASE A (buscar usuário) na base e FASE B (editar usuário) em andamento — a A não depende da B, então o front já integra a A. Fase que só faz sentido junto com a próxima fica sem handoff, e ele sai com a fase que fecha o recorte.

**Onde:** na descrição da task `[WEB-FRONTEND]`, na seção `## Pronto para integrar`, no fim da descrição (antes do bloco de acompanhamento, se houver). Uma subseção por fase, a mais nova embaixo. A descrição é de outra pessoa: reler na hora e reenviar o texto dela intacto, só com a seção acrescentada ou atualizada.

**Modelo** (breve, até ~20 linhas por fase, em alto nível):

```
## Pronto para integrar

### FASE A — <o que ficou pronto, em uma linha>
Branch: feature/<módulo> · PR: <link>

O que já dá para fazer
- 2 a 4 itens: a tela ou ação e o que o back já resolve.

Endpoints
| Método | Rota | Para quê |
|---|---|---|

Ainda não disponível
- O que depende de fase em andamento (ex.: editar usuário — FASE B).

Sugestões
- Só o que o usuário pedir para incluir (libs, convenções).
```

Mostrar o texto no chat e **perguntar ao usuário se há sugestões (libs, convenções) para incluir** — quem dá as sugestões é ele; nunca inventar. Só com o OK, atualizar a descrição e comentar na task de front (seção 7). É a única escrita em task de outra pessoa.

---

## 6. Bloco de acompanhamento

Vai **no fim** da descrição (task principal e subtasks), sempre como última seção. Ao atualizar: reler a descrição na hora, trocar só o que vem depois de `## Acompanhamento (dev)`, nunca tocar no texto acima.

```
---
## Acompanhamento (dev)
- Plano: plans/<tema>/<slug>/
- Branch: <nome> → <base> (módulo grande: a branch da fase → feature/<módulo>)
- PRs: <links>
```

No `[MÓDULO] BLOCO`: só `Plano`, `Branch base: feature/<módulo> (a partir da dev)` e `PR base → dev: <link ou —>`. É onde o QA vê em qual branch testar.

---

## 7. Comentários (só em marcos)

| Marco | Texto |
|---|---|
| README anexado | `README da entrega anexado (v<n>). Plano em plans/<tema>/<slug>/.` |
| Subtasks criadas | `Subtasks criadas: <lista com prefixo>. Relações: <resumo>.` |
| TAREFAs criadas (no BLOCO) | `TAREFAs criadas: <lista com prefixo e fases>. Branch base: feature/<módulo>.` |
| Handoff do front (na task de front) | `FASE <X> na feature/<módulo>: já dá para integrar <resumo>. Detalhes em "Pronto para integrar" na descrição.` |
| README mudou | `README atualizado para v<n>: <o que mudou em uma linha>.` |
| PR aberto | `PR aberto: <link>.` |
| Bloqueio | `Parado: <motivo>. Destrava quando <condição>.` |
| Handoff de sessão | `Feito: … · Falta: … · Próximo passo: …` (3 linhas no máximo) |

Nunca comentar por commit. `notify_all` sempre `false`.

---

## 8. Restrições

1. **Gate antes de escrever:** divisão e textos aparecem no chat (e em `SUBTASKS.md`) e só vão ao ClickUp com "ok" explícito.
2. **Tamanho:** subtask que passaria de ~8 tasks no quick-plan → dividir.
3. **Limite:** até ~6–8 subtasks por task principal; acima disso, propor quebrar o card principal (sugestão para quem criou o card). No módulo grande: até ~6 fases por TAREFA; acima disso, o que é pré-requisito vira PRÉ TAREFA e o resto vira TAREFA 02 da mesma stack, dentro do mesmo BLOCO.
4. **Card de outra pessoa:** descrição original nunca é reescrita — README entra como anexo, e só o bloco de acompanhamento é acrescentado no fim.
5. **Não duplicar:** se o card já tem subtasks, conciliar com o que existe. Card de outra pessoa sobre a mesma funcionalidade (fora da árvore) é mostrado com as divergências e ligado por link; a subtask própria só é criada com o OK do usuário.
6. **Responsáveis:** subtasks, TAREFAs, PRÉ TAREFAs e fases nascem **sem responsável**. O Pedro entra como responsável só quando começar a executar aquela subtask.
7. **README alterado:** anexar `README-v<n>.md` e comentar o que mudou.
8. **Só escreve em:** tasks atribuídas ao Pedro ou criadas por este fluxo. Demais tasks: somente leitura.
9. **Escrita:** português; termos técnicos explicados entre parênteses; nunca usar o símbolo de seção.
