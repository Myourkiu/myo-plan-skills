---
name: brainstorm-readme
description: Use no início de uma feature para debater e convergir um README antes de qualquer plano ou código — criar um README novo ou discutir/refinar um existente. Conduz diálogo (uma pergunta por vez, 2-3 abordagens, gate de aprovação), escreve o README no idioma do projeto, e no fim DIMENSIONA a entrega para chamar quick-plan (pequena/incerta) ou multi_file_workflow (grande). Acionar com "brainstorm", "debater README", "criar/refinar README para X", "/brainstorm-readme", ou ao iniciar uma feature.
---

# Brainstorm de README

Transforma uma ideia (ou um README existente) num **README debatido e aprovado** através de diálogo colaborativo. Não produz plano nem código — termina dimensionando a entrega e passando o bastão para `quick-plan` ou `multi_file_workflow`.

<HARD-GATE>
NÃO escreva código, não crie plano, não invoque skill de planejamento e não tome nenhuma ação de implementação até ter apresentado o README e o usuário tê-lo aprovado. Vale para TODA feature, por mais simples que pareça. O README pode ser curto, mas precisa ser apresentado e aprovado.
</HARD-GATE>

## Idioma

Respeita o idioma do projeto (PT-BR em projetos como hub-frontend/portal). Se não for óbvio pelo CLAUDE.md/README, pergunte antes de escrever.

## Fluxo

Fase 0 (contexto) → Fase 1 (perguntas, uma a uma) → Fase 2 (2-3 abordagens) → Fase 3 (README + gate de aprovação) → **Gate terminal (dimensionamento → quick-plan | multi_file_workflow)**

### Fase 0 — Contexto

1. Explore o estado atual: arquivos, docs, commits recentes.
2. Pergunte: **README novo ou existente?** e **onde ele mora / onde deve ser criado** (caminho).
3. Se existente, **leia-o** — ele é a base do debate.
4. **Cheque escopo:** se a ideia descreve múltiplos subsistemas independentes (ex.: "chat + billing + analytics"), sinalize já. Não gaste perguntas refinando algo que precisa ser decomposto antes — ajude a quebrar em sub-projetos e brainstorme o primeiro.

### Fase 1 — Perguntas (uma de cada vez)

- **Uma pergunta por mensagem.** Não despeje várias.
- Prefira múltipla escolha; use `AskUserQuestion` quando houver opções discretas com trade-offs.
- Foque em: propósito, restrições, critérios de sucesso.

### Fase 2 — Abordagens

- Proponha **2-3 abordagens** com trade-offs e sua recomendação. Lidere com a recomendada e explique o porquê.
- **Fique no nível de produto/comportamento.** Detalhe técnico fino — schema de banco, endpoint, payload, lib específica — **NÃO entra no README**; isso é decisão do PLAN. O README captura "o quê / porquê / forma", não "como implementar". (Mantém a fronteira com seu `multi_file_workflow`, onde SPEC é comportamento e PLAN é técnica.)

### Fase 3 — README + Gate de aprovação

Conteúdo do README (em prosa, escalado à complexidade):

- **Problema / contexto** — o que está faltando e por que importa.
- **Comportamento esperado** — em termos de produto/usuário (não `dado/quando/então`; isso é da SPEC).
- **Em escopo / Fora de escopo.**
- **Decisões de produto** tomadas no debate (e a abordagem escolhida, em alto nível).
- **Perguntas em aberto.**

Condução:

1. Apresente o README em seções, pedindo "ok até aqui?" após cada uma. Revise até aprovar.
2. **Escreva o README** no caminho definido na Fase 0, no idioma do projeto.
3. **Auto-revisão** (corrija inline): placeholders/TBD, seções contraditórias, ambiguidade (algum ponto pode ser lido de dois jeitos? escolha um), escopo (cabe numa entrega só?).
4. **Gate de revisão humana:** "README escrito em `<caminho>`. Revise e me diga se quer ajustes antes de eu dimensionar e partir pro plano." Espere a resposta. Só avance com aprovação explícita.
5. **Commit (opcional):** se o usuário quiser versionar, use a `commit-conversional-skill`. Não comite por conta própria.

### Gate terminal — Dimensionamento + handoff

Antes de invocar qualquer skill de plano, **estime o tamanho da entrega** a partir do README aprovado e roteie:

| Sinal | Rota |
|---|---|
| Uma área/serviço, sem decisões de arquitetura, estimativa ≤ ~8 tasks, escopo bem delimitado | **`quick-plan`** |
| Múltiplos serviços/subsistemas, decisões de arquitetura, muitos fluxos/critérios, estimativa > 8 tasks | **`multi_file_workflow`** |
| **Incerteza sobre o tamanho** | **`quick-plan`** — ele já tem gate que escala pro `multi_file_workflow` ao passar de 8 tasks |

Condução do gate:

1. Apresente a estimativa em 1-2 linhas: nº aproximado de tasks, nº de serviços/áreas tocadas, se há decisão de arquitetura — e a **rota recomendada**.
2. O usuário pode sobrescrever a rota. Em empate ou dúvida genuína, **vá de `quick-plan`** (rota segura, auto-escala).
3. Invoque a skill escolhida e **passe o caminho do README como material-fonte da Fase 0** dela.

## Regras de PARE

- Fase 0 — ideia abrange múltiplos subsistemas → pare e ajude a decompor antes de brainstormar.
- Qualquer fase — tentação de implementar/planejar antes do README aprovado → pare (HARD-GATE).
- Gate terminal — não consegue estimar o tamanho com confiança → roteie pro `quick-plan` (não chute multifile).

## Princípios

- **Uma pergunta por vez.** Não sobrecarregue.
- **README é produto, não técnica.** Schema/endpoint/lib ficam pro PLAN.
- **Gate = pausa real.** Nunca dimensione nem invoque plano sem a aprovação explícita do README.
- **Na dúvida, quick-plan.** É a rota que se auto-corrige; multifile é só quando o tamanho é claramente grande.
- **YAGNI.** Corte features desnecessárias do README antes de aprovar.
