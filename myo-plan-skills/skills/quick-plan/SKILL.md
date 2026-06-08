---
name: quick-plan
description: Use quando o usuário quer um plano leve de arquivo único (PLAN.md) para uma tarefa pequena e bem delimitada — renomear/mover algo, ajustar um contrato, corrigir um bug localizado, pequenas refatorações. Impõe formato estrito (≤60 linhas, ≤8 tasks com casos de teste), gate de validação do PLAN e gate de validação humana dos testes em modo TDD. Acionar quando o usuário disser "plano rápido", "quick plan", "crie um PLAN para X", "/quick-plan", ou similar para tarefas curtas. Para features grandes ou multi-serviço, usar multi_file_workflow.
---

# Quick Plan Skill

Plano de arquivo único para tarefas pequenas e bem delimitadas — renomear/mover algo,
ajustar um contrato, corrigir um bug localizado, pequenas refatorações. Gera um único
PLAN.md e conduz a execução com gates de validação humana.

Se a tarefa envolve múltiplos serviços, decisões de arquitetura, ou mais de ~8 passos,
NÃO use esta skill — use a multi_file_workflow.

## Argumentos

- tdd: true|false — Default: true. Com tdd: true, cada task lista os casos de teste
  (entrada -> saída) e a execução passa pelo gate de validação dos testes.

## Idioma

Respeita o idioma do projeto (PT-BR em projetos como este). Se não for óbvio pelo
CLAUDE.md/README, pergunte antes de escrever.

## Fluxo

Fase 0 (coleta) -> Fase 1 (PLAN.md) -> Gate A (valida PLAN)
-> Fase 2 (implementação TDD): por task -> escreve testes -> Gate B (valida testes) -> implementa
-> Encerramento (verificação final + resumo)

### Fase 0 — Coleta rápida

Confirme em 2-3 perguntas no máximo:

1. Onde criar o PLAN.md e onde mora o material-fonte, se houver.
2. O que exatamente muda e o que NÃO deve mudar (fora de escopo).
3. Restrições conhecidas (nome literal, compatibilidade a manter, etc.).

Se faltar contexto crítico, PARE e pergunte. Não invente.

### Fase 1 — PLAN.md

Formato: máximo 60 linhas. Seções obrigatórias:

- Problema — 2-3 frases. O que está errado/faltando e por quê importa.
- Abordagem — como será feito; decisões técnicas em 1 linha cada, quando houver.
- Em escopo / Fora de escopo — listas curtas.
- Restrições — nomes literais, compatibilidade, convenções obrigatórias.
- Tasks — lista numerada e ordenada (T1, T2, ...), máximo 8, **agrupada em fatias**
  (cada fatia entrega um comportamento; gate e checkpoint acontecem por fatia). Cada task contém:
    - `gate: humano | auto` — tag curta no cabeçalho da task, com motivo de ≤6 palavras
      (ver "Critérios de risco"). Na dúvida: `humano`. (Tag, não linha nova — respeita o teto de 60.)
    - Arquivos tocados (código e teste, separados).
    - Mudança — o que muda, em 1-2 frases.
    - Casos de teste (quando tdd: true) — pelo menos caminho feliz + 1 caso de erro,
      no formato (entrada -> saída esperada). Sem código de teste, só os casos.
- Verificação final — checklist ponta-a-ponta: build limpo, testes passando, e uma
  checagem de que nada quebrou (ex.: nenhuma referência ao nome antigo restante).

Proibido no PLAN:
- Pseudo-código ou implementação.
- Tasks vagas ("ajustar o que for preciso") — cada task tem arquivos e mudança concretos.
- Mais de 8 tasks — se passar disso, PARE e recomende a multi_file_workflow.

### Critérios de risco (classificação do `gate`)

`gate: humano` se a task toca **pelo menos um**: contrato público / API consumida por
terceiros; migração ou escrita destrutiva de dados; autenticação, autorização, segredos,
permissão; dinheiro / cobrança / saldo / repasse; operação irreversível; alta incerteza
(não dá pra listar arquivos concretos, área nova, "como" ainda em dúvida).

`gate: auto` só se localizada, mecânica, bem entendida e com cobertura existente.

Na dúvida, `humano`. Escopo pequeno **não** rebaixa o gate: o que conta é blast radius e
reversibilidade, nunca o tamanho da tarefa. "É só um rename" não é critério.

### Gate A — validação do PLAN

1. Apresente o PLAN.md, com destaque para a **classificação `gate:` de cada task e as fatias**.
2. Se houver ambiguidade que afete uma task, pergunte (use AskUserQuestion quando
   houver opções discretas com trade-offs).
3. A validação do `gate:` aqui **É** a aprovação da estratégia de paradas: aprovada a
   classificação, as tasks `auto` rodam sem novo gate (só com stops por exceção). É isto que
   legitima o `auto` — o agente não se auto-autoriza depois.
4. Confirme explicitamente a validação antes de avançar. Não comece a Fase 2 sem o "ok".

### Fase 2 — Implementação TDD (quando tdd: true)

Trabalhe por fatia, seguindo a ordem do PLAN. Para cada task:

1. Escreva os testes a partir dos casos listados na task — só os testes, sem implementação.
2. `gate: humano` → Gate B: apresente os testes e confirme explicitamente que estão corretos
   antes de implementar. Pausa real. As tasks `humano` da mesma fatia podem ser validadas
   num Gate B só (em lote por fatia), não uma a uma.
   `gate: auto` → siga direto pra implementação; os casos já foram aprovados no Gate A.
3. Implemente até os testes passarem.
4. Teste validado que falha durante a implementação: NÃO edite o teste — corrija o código,
   ou pause e sinalize suspeita de teste errado. Editar teste validado exige nova
   justificativa e re-validação (é mudança de spec).
5. Rebaixar uma task de `humano` para `auto` durante a execução (pra parar menos) é proibido —
   é mudança de spec, re-valide. Stops por exceção valem SEMPRE, inclusive em `auto`: pare se
   uma premissa do PLAN quebrar ou surgir ambiguidade que mude comportamento.
6. Ao fim de cada fatia, apresente um checkpoint consolidado das tasks `auto` (testes + diff
   por task) para revisão em bloco. O checkpoint NÃO substitui o Gate B das `humano`.

Nunca implemente código de uma task `humano` cujos testes não passaram pelo Gate B.

Com tdd: false: não há Gate B; implemente as tasks na ordem e rode a Verificação final.

### Encerramento

Após a última task, rode a Verificação final do PLAN e apresente um resumo objetivo
do que mudou em código e testes.

## Regras de PARE

- Fase 0 — falta contexto crítico -> pergunte antes de escrever.
- Fase 1 — a tarefa cresce além de 8 tasks -> pare; recomende multi_file_workflow.
- Fase 1 — não consegue listar arquivos concretos de uma task -> pare; explore o código antes.
- Fase 1 — dúvida sobre a classificação de risco de uma task -> classifique como `humano`.
- Gate B — teste validado falha e o teste parece errado -> pare e sinalize; não edite o teste sozinho.
- Execução — tentação de rebaixar task `humano`→`auto` pra parar menos -> proibido; é mudança de spec, re-valide.

## Princípios

- Um arquivo, gates reais. O plano é leve (1 arquivo), mas os gates — do PLAN e dos
  testes — são pausas de verdade. Nunca avance sem confirmação explícita.
- Blast radius, não tamanho. O gate escala com raio de impacto e reversibilidade, nunca
  com o tamanho da tarefa. Escopo pequeno não compra menos validação. A frustração do
  usuário com paradas waivia a cerimônia (vira lote + checkpoint por fatia), nunca o gate
  das tasks de alto risco. "Confia, toca o barco" não rebaixa contrato/dado/dinheiro/permissão.
- Concretude vence prolixidade. Cada task aponta arquivos e mudança reais; o limite de
  60 linhas força isso.
- Testes são spec executável. Os casos da task viram testes, validados no Gate B (tasks
  `humano`) antes de qualquer implementação.
- Se cresceu, troque de skill. Esta skill é para o que é pequeno de verdade.
