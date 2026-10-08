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

---

## 3. Stacks e prefixos

Uma subtask = **uma stack, um repo, um PR**. O front do PDV é C# (Avalonia), mas é subtask de **front**, separada do back.

| Prefixo | Repo | Stack | Tags |
|---|---|---|---|
| `[CONTRATOS]` | SgBR.Contracts / compartilhado | Backend | sgsuper, sgsuper-pdv, sgsuper-web |
| `[BACK-PDV]` | servidor-pdv (ServidorPdv) | Backend | sgsuper, sgsuper-pdv |
| `[FRONT-PDV]` | terminal (TerminalPdv, Avalonia) | Frontend | sgsuper, sgsuper-pdv |
| `[BACK-WEB]` | web-backend | Backend | sgsuper, sgsuper-web |
| `[FRONT-WEB]` | front da WEB (Vue) | Frontend | sgsuper, sgsuper-web |

`[CONTRATOS]` existe porque mudança de contrato mexe num repo que não é nem back nem front.

Título: `<PREFIXO> <verbo no infinitivo + o quê>` — ex.: `[BACK-WEB] Expor endpoint de resposta da autorização`.

---

## 4. Relações entre subtasks

Back e front da mesma funcionalidade **sempre** ficam relacionados (ex.: back na WEB ↔ implementação no front da WEB).

**Regra:** dependência ("aguardando") **só quando a task da qual se depende ainda não foi implementada** e o outro lado realmente não consegue começar sem ela. Em todos os outros casos, **link**.

Por quê: no ClickUp, a task que "aguarda" fica marcada como **bloqueada até a outra chegar a `testado`/`upado`** — e esses status são do QA. Uma dependência com código já pronto deixa o board cheio de "bloqueado por dependência" por semanas sem nada bloquear de verdade.

| Situação | Ferramenta | Tipo |
|---|---|---|
| Front não começa sem o endpoint/evento/campo que o back **ainda vai criar** | `add_task_dependency` | front `waiting_on` back |
| Mudança em `[CONTRATOS]` **ainda não feita** | `add_task_dependency` | back e front `waiting_on` contratos |
| Mesma funcionalidade, dá para andar em paralelo (contrato já descrito) | `add_task_link` | link |
| O lado do qual se depende **já está implementado** (mesmo que ainda não esteja na `dev`) | `add_task_link` | link |
| Ordem entre backs que já aconteceu (registro histórico) | `add_task_link` | link |

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

---

## 6. Bloco de acompanhamento

Vai **no fim** da descrição (task principal e subtasks), sempre como última seção. Ao atualizar: reler a descrição na hora, trocar só o que vem depois de `## Acompanhamento (dev)`, nunca tocar no texto acima.

```
---
## Acompanhamento (dev)
- Plano: plans/<tema>/<slug>/
- Branch: <nome>
- PRs: <links>
```

---

## 7. Comentários (só em marcos)

| Marco | Texto |
|---|---|
| README anexado | `README da entrega anexado (v<n>). Plano em plans/<tema>/<slug>/.` |
| Subtasks criadas | `Subtasks criadas: <lista com prefixo>. Relações: <resumo>.` |
| README mudou | `README atualizado para v<n>: <o que mudou em uma linha>.` |
| PR aberto | `PR aberto: <link>.` |
| Bloqueio | `Parado: <motivo>. Destrava quando <condição>.` |
| Handoff de sessão | `Feito: … · Falta: … · Próximo passo: …` (3 linhas no máximo) |

Nunca comentar por commit. `notify_all` sempre `false`.

---

## 8. Restrições

1. **Gate antes de escrever:** divisão e textos aparecem no chat (e em `SUBTASKS.md`) e só vão ao ClickUp com "ok" explícito.
2. **Tamanho:** subtask que passaria de ~8 tasks no quick-plan → dividir.
3. **Limite:** até ~6–8 subtasks por task principal; acima disso, propor quebrar o card principal (sugestão para quem criou o card).
4. **Card de outra pessoa:** descrição original nunca é reescrita — README entra como anexo, e só o bloco de acompanhamento é acrescentado no fim.
5. **Não duplicar:** se o card já tem subtasks, conciliar com o que existe.
6. **Responsáveis:** subtasks nascem **sem responsável**. O Pedro entra como responsável só quando começar a executar aquela subtask.
7. **README alterado:** anexar `README-v<n>.md` e comentar o que mudou.
8. **Só escreve em:** tasks atribuídas ao Pedro ou criadas por este fluxo. Demais tasks: somente leitura.
9. **Escrita:** português; termos técnicos explicados entre parênteses; nunca usar o símbolo de seção.
