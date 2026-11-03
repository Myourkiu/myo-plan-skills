---
name: clickup-card
description: Use quando o usuário colar um link de card do ClickUp (app.clickup.com/t/...) ou pedir "/clickup-card <link>", "puxa o card", "cria as fases", "começa a fase", "atualiza o card", "abri o PR do card". Parte do BLOCO (card funcional que o autor cria) e do card de stack que ele passa para o dev ([BACKEND], [FRONTEND], [PDV]): analisa o BLOCO contra o código, propõe e cria as FASES dentro do card de stack (pré-requisitos viram fases; fase longa se subdivide em itens com resumo no estilo da spec) e acompanha a execução de cada fase atualizando status e comentários dentro das convenções do board. Exige o conector do ClickUp (ferramentas clickup_*).
---

# Card do ClickUp → entrega

Leva o card de stack do ClickUp do link até os PRs, usando o fluxo de planejamento de sempre (`brainstorm-readme` → `quick-plan` / `multi_file_workflow`) e mantendo o board atualizado sem gerar ruído para o time.

**Antes de qualquer passo, leia `references/convencoes.md`.** Ele tem os IDs do board, a estrutura BLOCO → card de stack → fases, quem move cada status, os modelos de descrição e de comentário e as restrições. Este arquivo descreve só o fluxo.

<HARD-GATE>
Nada é escrito no ClickUp (criar, editar, anexar, comentar, mudar status, relacionar) sem o usuário ter aprovado aquele lote no chat. O board é compartilhado: toda escrita notifica o time.
O BLOCO é do autor: nunca editar, nunca criar subtask nele, nunca mudar o status.
Nunca mover task para `ambiente dev` ou além, e nunca mexer em task que já esteja de `ambiente dev` em diante.
</HARD-GATE>

## Como o trabalho chega

O autor (em geral o Luan) cria o **BLOCO**, que é o card funcional com problema, regras e critérios de aceite. Ele cria também um **card de stack** por stack envolvida (`[BACKEND]`, `[FRONTEND]`, `[PDV]`), já com responsável, e o BLOCO **aguarda** esses cards. O card de stack diz "analise o código e crie as suas FASES". A partir daí o trabalho é do dev, dentro do card de stack dele (convenções, seção 3).

## Fluxo

Fase 0 (ler) → Fase 1 (analisar) → Fase 2 (propor as fases — gate) → Fase 3 (criar as fases) → Fase 4 (executar uma fase, repetível)

Link de uma **fase** ou de uma **subdivisão** já criada → pular direto para a Fase 4.

### Fase 0 — Ler

1. Extrair o id do link (`/t/<id>` ou `/t/<workspace>/<id>`).
2. `clickup_get_task` com `include: [description, subtasks, attachments, linked_tasks, dependencies, custom_fields]` e `expand_statuses: true`. Ler os comentários (`clickup_get_task_comments`) e baixar anexos `.md` relevantes (`clickup_download_task_attachment`).
3. Achar as duas pontas pelas dependências (convenções, seção 3):
   - link do **BLOCO** → abrir as tasks que ele aguarda; o card de stack do Pedro é onde se trabalha. Sem card de stack do Pedro → mostrar e perguntar (quem cria é o autor).
   - link do **card de stack** → abrir o BLOCO (a task que aguarda este card, o "Bloqueio" no ClickUp) e ler problema, regras, critérios e decisões pendentes.
   - abrir também os outros cards de stack do mesmo BLOCO, só como leitura.
4. Conferir e **parar** se: o card não estiver na lista Tarefas; o status for `ambiente dev` ou além; o card de stack não for do Pedro (perguntar antes de seguir).
5. Resumir no chat: BLOCO (título, autor, status, decisões pendentes), card de stack (responsável, status, pontos de atenção do autor), outros cards de stack e quem cuida de cada um, fases que já existem.
6. **Card de stack já tem fases?** → conciliação: mostrar o que existe e perguntar se é para seguir a partir daí (nunca recriar).
7. **Procurar cards relacionados fora do BLOCO:** `linked_tasks` e `clickup_search` com 2–3 palavras-chave do tema (só `task`). Para cada card da mesma funcionalidade, mostrar título, responsável, status e **onde diverge** do BLOCO. Esse card nunca é editado; entra só como link, e o alinhamento com o dono fica com o usuário.

### Fase 1 — Analisar

1. O BLOCO já traz problema, regras e critérios: no lugar de um brainstorm do zero, analisar o BLOCO e os pontos de atenção do card de stack contra o código e o `/plans`. Usar `brainstorm-readme` com o BLOCO como material de entrada quando houver decisão técnica a debater.
2. Caminho: `plans/<tema>/<slug-do-bloco>/README.md`, com o link do BLOCO e do card de stack na primeira linha.
3. **Decisões pendentes do BLOCO** que travam alguma fase: listar no chat. Elas são do autor; perguntar ao usuário se leva a dúvida para o BLOCO (convenções, seção 7).
4. **Ajuste no gate terminal do brainstorm:** apresentar a estimativa de tamanho, mas **não invocar** `quick-plan` nem `multi_file_workflow`; voltar para a Fase 2 desta skill. O plano detalhado é feito por fase, na Fase 4.

### Fase 2 — Propor as fases (GATE)

1. Dividir o card de stack em fases (convenções, seção 4):
   - uma fase = um repo, uma branch, um PR; ordem: contrato → back → front;
   - o que é **pré-requisito** (fundação de que outras fases precisam, mesmo fora do escopo do BLOCO) vira uma **fase normal**, nas primeiras letras, com a linha `Pré-requisito de: FASE X, Y` na descrição;
   - fase longa (mais de uma entrega independente, ou que passaria de ~8 tasks no quick-plan) se **subdivide** em `X1`, `X2`… dentro dela, cada uma com resumo no estilo da spec.
2. Escrever `plans/<tema>/<slug>/FASES.md` com a árvore: para cada fase e subdivisão, o título e a descrição completa nos modelos da seção 5, as relações e a branch.
3. Mostrar no chat uma tabela (fase · repo · pré-requisito de · subdivisões · objetivo em 1 linha) e anexar o `FASES.md` para leitura no celular (convenções, seção 6).
4. **Esperar "ok" explícito.** Ajustes voltam para o passo 2.

### Fase 3 — Criar no ClickUp

1. Para cada fase, na ordem do `FASES.md`: `clickup_create_task` com `parent` = card de stack, `list_id` da lista Tarefas, `markdown_description`, status `pendente`, responsável = dono do card de stack. Depois as subdivisões, com `parent` = a fase. Fase já implementada nasce no status real (convenções, seção 4).
2. Relações: dependência só entre fases e só quando a fase da qual se depende ainda não foi implementada; o resto é link (convenções, seção 4.2).
3. Descrição do card de stack: reler na hora, manter o texto do autor intacto e acrescentar no fim só as seções `## Fases` e `## Acompanhamento (dev)` (convenções, seção 5.1).
4. Atualizar o `FASES.md` com o id e o link de cada task criada.
5. Um único comentário no card de stack: "Fases criadas".
6. **Contrato com o outro lado:** se a fase de back expõe algo para o `[FRONTEND]` (ou o contrário), o combinado vai em comentário no **próprio** card de stack, com menção ao dono do outro card (convenções, seção 7.1). Mostrar o texto no chat antes.

### Fase 4 — Executar uma fase (repetível)

Gatilho: "começa a fase X", link de fase ou subdivisão, ou continuação natural após a Fase 3.

1. Ler a fase e as subdivisões. Ao começar: status `em andamento` na fase (e no card de stack, se ainda estiver `pendente`). Um "ok" por fase basta.
2. **Branch** (convenções, seção 8): conferir se a `dev` andou desde a branch base e, se andou, atualizar a base primeiro (merge da `dev`, build e testes, `git push` só com o ok). Depois criar a branch da fase a partir da base. Sem branch base, a partir da `dev`.
3. Dimensionar a partir da descrição da fase e invocar `quick-plan` (padrão) ou `multi_file_workflow`, passando a descrição da fase e das subdivisões como material da Fase 0 dela. O plano vai em `plans/<tema>/<slug>/fase-<x>/`.
4. Com o plano aprovado: se o planejamento mudou o que a fase entrega, atualizar a descrição da fase e das subdivisões (convenções, seção 5) e, se foi `multi_file_workflow`, anexar a `SPEC.md` na fase. Mostrar o texto no chat antes de enviar.
5. Durante a execução, atualizar só nos marcos (convenções, seção 7):
   - bloqueio → `parado` + comentário;
   - subdivisão com código pronto → `pr git aguardando` na subdivisão;
   - código da fase pronto sem PR → `pr git aguardando`;
   - PR aberto → `pr git aberta` + link no bloco de acompanhamento + comentário; se outras fases aguardam esta, trocar a dependência por link;
   - fim de sessão → comentário de handoff (3 linhas).
6. Após mudar o status de uma subdivisão ou fase, recalcular o das tasks acima pela tabela das convenções (seção 2): subdivisões → fase → card de stack, com teto em `pr git aberta`. O BLOCO nunca.
7. **Fim de uma fase de back com `[FRONTEND]` no mesmo BLOCO:** se o que a fase entregou funciona sozinho (o front integra sem esperar fase em andamento), montar o comentário "Pronto para integrar" (convenções, seção 7.1) no card `[BACKEND]`, com menção ao dono do `[FRONTEND]`. Mostrar no chat e **perguntar ao usuário se há sugestões (libs, convenções) para incluir**. Só com o OK, comentar. Fase que depende da próxima → sem comentário agora; ele sai com a fase que fecha o recorte.
8. Depois do merge, **não mexer mais no status**: o QA move de `ambiente dev` em diante.

## Regras de PARE

- Qualquer escrita no ClickUp sem aprovação do lote → pare (HARD-GATE).
- BLOCO → somente leitura; dúvida de regra só como comentário aprovado (convenções, seção 7).
- Task em `ambiente dev` ou além → somente leitura.
- Card de stack de outra pessoa → somente leitura; perguntar.
- Card de stack já com fases → conciliar, nunca duplicar.
- Card de stack faltando para a stack do Pedro → perguntar; quem cria é o autor do BLOCO.
- Fase com branch base sem conferir se a `dev` andou → pare e confira antes de criar a branch.
- Texto do autor no card de stack → nunca reescrever; só acrescentar `## Fases` e o acompanhamento no fim.

## Princípios

- **`/plans` é a fonte da verdade do detalhe; o ClickUp é a vitrine.** A descrição da fase diz o quê e o porquê em linguagem de negócio; o como fica no plano.
- **O BLOCO é a spec; a fase é o recorte.** Regras e critérios não são copiados para as fases, só citados quando ajudam.
- **Pouco ruído:** comentário só em marco, `notify_all: false`, criação em lote único; menção só para quem precisa agir.
- **Plano no arquivo e no chat:** todo artefato de planejamento é mostrado no chat e anexado para leitura no celular.
