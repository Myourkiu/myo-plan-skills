---
name: clickup-card
description: Use quando o usuário colar um link de card do ClickUp (app.clickup.com/t/...) ou pedir "/clickup-card <link>", "puxa o card", "começa a subtask", "atualiza o card", "abri o PR do card". Conduz o card de ponta a ponta — lê o card, faz o brainstorm-readme, anexa o README na task principal, divide em subtasks por stack (back/front/contratos) relacionadas entre si, e acompanha a execução de cada subtask atualizando status e comentários dentro das convenções do board. Exige o conector do ClickUp (ferramentas clickup_*).
---

# Card do ClickUp → entrega

Leva um card do ClickUp do link até os PRs, usando o fluxo de planejamento de sempre (`brainstorm-readme` → `quick-plan` / `multi_file_workflow`) e mantendo o board atualizado sem gerar ruído para o time.

**Antes de qualquer passo, leia `references/convencoes.md`.** Ele tem os IDs do board, quem move cada status, os prefixos por stack, o modelo de descrição, os modelos de comentário e as restrições. Este arquivo descreve só o fluxo.

<HARD-GATE>
Nada é escrito no ClickUp (criar, editar, anexar, comentar, mudar status, relacionar) sem o usuário ter aprovado aquele lote no chat. O board é compartilhado: toda escrita notifica o time.
Nunca mover task para `a testar` ou além, e nunca mexer em task que já esteja de `a testar` em diante — isso é do QA.
</HARD-GATE>

## Fluxo

Fase 0 (ler card) → Fase 1 (brainstorm) → Fase 2 (anexar README) → Fase 3 (propor divisão — gate) → Fase 4 (criar subtasks) → Fase 5 (executar subtask, repetível)

Se o link recebido for de uma **subtask** já criada por este fluxo, pular direto para a Fase 5.

### Modo retroativo (card já implementado)

Quando o trabalho do card já foi feito (há plano em `/plans` com SPEC/PLAN/TASKS/HANDOFF das entregas), o objetivo é só organizar o card:

- **Fase 0** igual, mais: conferir no GitHub (`gh pr view` / `gh pr list --head <branch base>`) o estado real de cada PR das entregas e do PR base→`dev`.
- **Fase 1 é pulada**: o README e as SPECs existentes são a fonte.
- **Fase 3**: uma subtask por entrega e stack, montada a partir da SPEC e do HANDOFF (escopo, contrato, critérios por referência aos CA da SPEC, números da suíte, PRs). Os fronts saem dos guias em `doc-front/` quando houver.
- **Fase 4**: cada subtask nasce **no status real** (ex.: etapa mergeada na base com PR base→`dev` ainda fechado → `pr git aguardando`) e com o responsável de quem fez. O que ainda não começou nasce `pendente`, sem responsável.
- **Relações**: como o backend já existe, quase tudo é **link** (convenções, seção 4). Dependência só para o que de fato ainda não foi implementado.
- **Anexos**: cada SPEC vai para a subtask da sua entrega, com nome que diga a entrega (`SPEC-entrega-1-pdv-local.md`), e cada guia de front vai para a subtask do front. Anexos antigos com nome genérico na task principal ficam (o conector não remove anexos) e o comentário de marco explica onde está cada coisa agora.

### Fase 0 — Ler o card

1. Extrair o id do link (`/t/<id>` ou `/t/<workspace>/<id>`).
2. `clickup_get_task` com `include: [description, subtasks, checklists, attachments, linked_tasks, dependencies, custom_fields]` e `expand_statuses: true`. Ler também os comentários (`clickup_get_task_comments`) e baixar anexos `.md` relevantes (`clickup_download_task_attachment`).
3. Conferir e **parar** se: o card não estiver na lista Tarefas; o status for `a testar` ou além; o Pedro não for responsável e o card não tiver sido criado para ele (perguntar antes de seguir).
4. Resumir no chat: título, autor, responsáveis, status, subtasks existentes, anexos, e o que o card pede em 3–5 linhas.
5. **Card já tem subtasks ou README anexado?** → modo conciliação: mostrar o que existe e perguntar se é para seguir a partir daí (nunca recriar).
6. **Procurar cards relacionados fora da árvore:** abrir os `linked_tasks` do card e rodar `clickup_search` com 2–3 palavras-chave do tema (só `task`). Para cada card que trate da mesma funcionalidade (ex.: o front de outro dev criado em paralelo), mostrar no chat: título, responsável, status, se já começou (comentários, branch no repo) e **onde ele diverge** do que o card principal ou o README decidiram. Esse card nunca é editado; ele entra na divisão só como link com a subtask correspondente, e o alinhamento com o dono fica com o usuário.

### Fase 1 — Brainstorm

1. Invocar `brainstorm-readme` com o conteúdo do card (e o que o usuário descrever no chat) como material de entrada.
2. Caminho do README: `plans/<tema>/<slug-do-card>/README.md`, com o link do card na primeira linha.
3. **Ajuste no gate terminal do brainstorm:** apresentar a estimativa de tamanho, mas **não invocar** `quick-plan` nem `multi_file_workflow` — voltar para a Fase 2 desta skill. O plano detalhado é feito por subtask, na Fase 5.

### Fase 2 — Anexar o README na task principal

Com o README aprovado e o "ok" para escrever no card:

1. Anexar o README: `clickup_attach_task_file` com `file_data` em base64 (README costuma ter bem menos de 200KB); se maior, `clickup_request_attachment_upload` e seguir as instruções devolvidas. Nome: `README.md` (ou `README-v<n>.md` em nova versão).
2. Acrescentar o bloco de acompanhamento no fim da descrição (ver convenções, seção 6), sem tocar no texto original.
3. Comentário de marco "README anexado".

### Fase 3 — Propor a divisão (GATE)

1. Dividir por stack conforme as convenções (seções 3 e 4): uma subtask = uma stack, um repo, um PR. Ordem: `[CONTRATOS]` → back → front.
2. Escrever `plans/<tema>/<slug>/SUBTASKS.md` com, para cada subtask: título com prefixo, stack, repo, tags, relações (dependência ou link, e com quem) e a descrição completa no modelo da seção 5.
3. Mostrar no chat uma tabela (título · stack · relações · objetivo em 1 linha) e anexar o `SUBTASKS.md` para leitura no celular.
4. Checar limites: subtask que passaria de ~8 tasks → dividir; mais de ~8 subtasks → propor quebrar o card principal.
5. **Esperar "ok" explícito.** Ajustes voltam para o passo 2.

### Fase 4 — Criar no ClickUp

1. Para cada subtask, na ordem do `SUBTASKS.md`: `clickup_create_task` com `parent` = id da task principal, `list_id` da lista Tarefas, `markdown_description`, `tags`, campo Stack, status `pendente`, **sem responsável**.
2. Criar as relações: `clickup_add_task_dependency` (`waiting_on`) só para quem depende de algo ainda não implementado; o resto com `clickup_add_task_link` (convenções, seção 4).
3. Atualizar o `SUBTASKS.md` com o id e o link de cada subtask criada.
4. Um único comentário na task principal: "Subtasks criadas".
5. Se a task principal estiver em `aberto`/`pendente`, mover para `pendente` ou `em andamento` conforme o usuário indicar.

### Fase 5 — Executar uma subtask (repetível)

Gatilho: "começa a subtask X", link de subtask, ou continuação natural após a Fase 4.

1. Ler a subtask. Ao começar: Pedro como responsável + status `em andamento` (um "ok" por subtask basta).
2. Dimensionar a partir da descrição da subtask e invocar `quick-plan` (padrão) ou `multi_file_workflow`, passando a descrição como material da Fase 0 dela. O plano vai em `plans/<tema>/<slug>/<prefixo-da-subtask>/`.
3. Durante a execução, atualizar só nos marcos (convenções, seção 7):
   - bloqueio → `parado` + comentário;
   - código pronto sem PR → `pr git aguardando`;
   - PR aberto → `pr git aberta` + link no bloco de acompanhamento da subtask + comentário; se outras subtasks "aguardam" esta, trocar a dependência por link;
   - fim de sessão → comentário de handoff (3 linhas).
4. Após mudar o status de uma subtask, recalcular o da task principal pela tabela das convenções (seção 2), com teto em `pr git aberta`.
5. Depois do merge, **não mexer mais**: o QA move de `a testar` em diante.

## Regras de PARE

- Qualquer escrita no ClickUp sem aprovação do lote → pare (HARD-GATE).
- Task em `a testar` ou além → somente leitura.
- Task de outra pessoa que não foi atribuída ao Pedro nem criada por este fluxo → somente leitura; perguntar.
- Card já dividido → conciliar, nunca duplicar.
- Divisão passou de ~8 subtasks → propor quebrar o card antes de criar.
- Descrição original de outra pessoa → nunca reescrever; só acrescentar o bloco de acompanhamento no fim.

## Princípios

- **`/plans` é a fonte da verdade do detalhe; o ClickUp é a vitrine.** O card aponta para o plano, não copia o conteúdo.
- **Back e front da mesma funcionalidade andam juntos:** sempre relacionados, com o contrato descrito dos dois lados.
- **Pouco ruído:** comentário só em marco, `notify_all: false`, criação em lote único.
- **Plano no arquivo e no chat:** todo artefato de planejamento é mostrado no chat e anexado para leitura no celular.
