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
- Tasks — lista numerada e ordenada (T1, T2, ...), máximo 8. Cada task contém:
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

### Gate A — validação do PLAN

1. Apresente o PLAN.md.
2. Se houver ambiguidade que afete uma task, pergunte (use AskUserQuestion quando
   houver opções discretas com trade-offs).
3. Confirme explicitamente a validação antes de avançar. Não comece a Fase 2 sem o "ok".

### Fase 2 — Implementação TDD (quando tdd: true)

Para cada task, na ordem do PLAN:

1. Escreva os testes a partir dos casos listados na task — só os testes, sem implementação.
2. Gate B — validação dos testes: apresente os testes escritos e confirme explicitamente
   que estão corretos antes de implementar. Este é um gate real — pause.
3. Implemente até os testes passarem.
4. Teste validado que falha durante a implementação: NÃO edite o teste — corrija o código,
   ou pause e sinalize suspeita de teste errado. Editar teste validado exige nova
   justificativa e re-validação (é mudança de spec).

Agrupamento do Gate B:
- Tasks pequenas e coesas: escreva os testes de todas as tasks e faça UM Gate B antes
  de implementar.
- Tasks independentes entre si: valide e implemente task a task (um Gate B por task).
- Nunca implemente código de uma task cujos testes não passaram pelo Gate B.

Com tdd: false: não há Gate B; implemente as tasks na ordem e rode a Verificação final.

### Encerramento

Após a última task, rode a Verificação final do PLAN e apresente um resumo objetivo
do que mudou em código e testes.

## Regras de PARE

- Fase 0 — falta contexto crítico -> pergunte antes de escrever.
- Fase 1 — a tarefa cresce além de 8 tasks -> pare; recomende multi_file_workflow.
- Fase 1 — não consegue listar arquivos concretos de uma task -> pare; explore o código antes.
- Gate B — teste validado falha e o teste parece errado -> pare e sinalize; não edite o teste sozinho.

## Princípios

- Um arquivo, gates reais. O plano é leve (1 arquivo), mas os gates — do PLAN e dos
  testes — são pausas de verdade. Nunca avance sem confirmação explícita.
- Concretude vence prolixidade. Cada task aponta arquivos e mudança reais; o limite de
  60 linhas força isso.
- Testes são spec executável. Os casos da task viram testes, validados no Gate B antes
  de qualquer implementação.
- Se cresceu, troque de skill. Esta skill é para o que é pequeno de verdade.
