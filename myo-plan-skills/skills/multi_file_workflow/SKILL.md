---
name: multi_file_workflow
description: Use quando o usuário quer criar um fluxo de planejamento multi-arquivo (SPEC.md → PLAN.md → TASKS.md) para uma feature/entrega. Impõe formato estrito por arquivo (Problema, dado/quando/então, ≤100/150 linhas, ≤12 tasks com casos de teste explícitos), pausa entre fases para validação humana, e aplica ordem TDD nas tasks por padrão. Acionar quando o usuário disser "fluxo de planejamento", "crie SPEC/PLAN/TASKS para X", "/multi_file_workflow", ou similar.
---

# Multi-File Workflow Skill

Orquestra a criação de **SPEC.md → PLAN.md → TASKS.md** com gates de validação humana entre cada fase, formato estrito e regras de PARE explícitas.

## Argumentos

- `tdd: true|false` — booleano. **Default: `true`**.
  - `tdd: true` (ou ausente): adiciona o bloco "Ordem de execução por task" no topo do TASKS.md e mantém os casos de teste como spec executável da task (sempre presentes).
  - `tdd: false`: **modo ainda não suportado** — os prompts específicos de fluxo não-TDD ainda não foram especificados. Se o usuário passar `tdd: false`, **pare e avise** que o modo não está disponível, e pergunte se quer prosseguir como `tdd: true` ou abortar. Não tente improvisar um fluxo não-TDD.

## Idioma

Os arquivos respeitam o idioma do projeto (PT-BR em projetos como o Walletly). Se não for óbvio pelo CLAUDE.md/README, **pergunte** antes da Fase 0.

---

## Fluxo (4 fases com gates)

### Fase 0 — Coleta de contexto inicial (antes da SPEC)

Antes de escrever qualquer arquivo, pergunte ao usuário:

1. **Onde mora o material-fonte** (README, plano antigo, conversa) e **onde os 3 arquivos vão ser criados** (caminho do diretório).
2. **Qual é o problema** a resolver, em 2-3 frases.
3. **O que está fora de escopo** explicitamente.
4. **Restrições já conhecidas** (regras de produto, decisões herdadas).
5. **Perguntas em aberto** que o usuário sabe que existem.

Leia o material-fonte se fornecido. Se faltar contexto crítico do problema, **PARE** e pergunte antes de escrever a SPEC.

---

### Fase 1 — SPEC.md

#### Formato (máximo 100 linhas)

Seções obrigatórias:

- **Problema** — 2-3 frases.
- **Critérios de aceite** em formato `dado/quando/então`. Cada critério precisa ser passível de virar teste — comportamento observável, com entrada e saída específicas.
- **Em escopo**
- **Fora de escopo**
- **Restrições não-negociáveis**
- **Perguntas em aberto**

#### Proibido na SPEC

- Stack, biblioteca, framework, algoritmo
- Schema de banco, endpoint, formato de payload
- Pseudo-código
- Estimativa, fase, task

#### Critérios vagos proibidos

"Deve ser rápido", "deve ser seguro", "deve ser escalável" — proibido. Reescreva em comportamento testável OU mova para "Restrições não-negociáveis" como qualidade não-funcional.

Se for tentado a escrever "vamos usar X" em algum critério, **corte**: isso pertence ao PLAN.

#### Gate 1 — validação da SPEC

1. Apresente a SPEC criada.
2. **Se houver perguntas em aberto** que afetem critérios, **faça-as explicitamente** ao usuário (use `AskUserQuestion` quando houver opções discretas com trade-offs).
3. Para cada resposta, integre o resultado: vira **critério novo/expandido** ou **restrição não-negociável**, e a pergunta sai da seção "Perguntas em aberto".
4. Itere até a seção "Perguntas em aberto" estar vazia (ou só conter itens que o usuário decidiu adiar).
5. **Confirme explicitamente a validação da SPEC** antes de avançar. Não inicie a Fase 2 sem o "ok" do usuário.

---

### Fase 2 — PLAN.md

#### Antes de escrever, pergunte

"Tem contexto técnico adicional ou instruções que queira fixar no PLAN?" — exemplos:
- Stack/libs já decididas (banco, framework de testes, validação)
- Convenções obrigatórias (sem certas libs, padrão de testes específico)
- Decisões herdadas de outras partes do projeto

Aguarde a resposta antes de redigir.

#### Formato (máximo 150 linhas)

Seções obrigatórias:

- **Abordagem técnica em alto nível**
- **Decisões arquiteturais com justificativa (1-2 frases cada)** — cobrir, quando aplicáveis: esquema de autenticação, estratégia de hashing, formato dos endpoints, padronização de erros. **Cada decisão técnica linka qual critério de aceite da SPEC ela atende.**
- **Trade-offs considerados**
- **Riscos técnicos identificados**
- **Dependências externas** (sinalize licenças se houver convenção do projeto sobre lib comercial paga)
- **Estratégia de teste**: para cada critério/bloco da SPEC, indicar qual nível (unit/integration/e2e) e por quê. Marcar critérios que precisam de mais de um nível.
- **Pontos onde teste é caro/inviável** (se houver) e como serão verificados em vez disso
- **Áreas que ainda precisam de exploração antes de virar task**

#### Proibido no PLAN

- Lista de tasks
- Pseudo-código ou implementação
- Repetir conteúdo da SPEC — referenciar

#### PARE durante a Fase 2

- Se uma decisão técnica **invalidar algo da SPEC**, **PARE** e sinalize ao usuário antes de seguir.
- Se a SPEC tiver **ambiguidade que afete decisão técnica ou estratégia de teste**, **PARE** e pergunte antes de planejar.

#### Gate 2 — validação do PLAN

1. Apresente o PLAN criado.
2. Se o usuário pedir ajustes, aplique-os e re-apresente.
3. **Confirme explicitamente a validação do PLAN** antes de avançar para TASKS.

---

### Fase 3 — TASKS.md

#### Cabeçalho do arquivo (quando `tdd: true` — default)

Listar uma única vez no topo:

```
## Ordem de execução por task (regra do projeto)

1. Escrever os testes a partir dos casos listados na task.
2. Validação humana dos testes antes de qualquer implementação.
3. Implementar até os testes passarem.
4. Se um teste validado falhar durante a implementação: não editar o teste — corrigir o código, ou pausar e sinalizar suspeita de teste errado.
5. Edição de teste após validação humana exige justificativa explícita e re-validação — é mudança de SPEC, não de código.
```

#### Cada task contém

- **ID** (`T01`, `T02`, ...)
- **Nome curto**
- **Arquivos tocados** — separados em **código** e **teste**
- **Entrada esperada** — estado prévio + dependência de outras tasks
- **Saída esperada** — o que existe depois que essa task termina
- **Casos de teste explícitos** — pelo menos `caminho feliz + um caso de erro + um edge case relevante`, em formato `(entrada → saída esperada)`. Estes são a spec executável da task. **Sem código de teste — apenas os casos.**
- **Nível de teste** (unit/integration/e2e) conforme estratégia do PLAN
- **Implementável (teste + código) em <2h**

#### Estrutura do arquivo

- Lista numerada na ordem de execução
- **Grafo/lista de dependências entre tasks**
- Seção **"Suposições adicionais que precisei fazer pra criar as tasks"**
- Seção **"Pontas soltas"**

#### Proibido nas tasks

- Código (incluindo código de teste — só os casos em formato entrada/saída)
- Justificativa do "por quê" — está no PLAN

#### PARE durante a Fase 3

- Se passar de **12 tasks**, **PARE** e sinalize ao usuário que a feature deveria ser quebrada em duas entregas, em vez de continuar gerando.
- Se houver **gap entre SPEC e PLAN** que impeça criar uma task com casos de teste claros, **PARE** e pergunte.

#### Gate 3 — validação do TASKS

1. Apresente o TASKS criado, com destaque para tasks no limite superior do orçamento de 2h e dependências críticas.
2. Aplique ajustes pedidos pelo usuário.
3. **Confirme explicitamente a validação final.**

---

## STOP signals consolidados

| Momento | Condição | Ação |
|---|---|---|
| Antes da SPEC | Falta contexto crítico do problema | Pergunte antes de escrever |
| Fase 1 | Pergunta em aberto que afeta critério | Pergunte (use `AskUserQuestion` quando houver trade-offs) |
| Fase 2 | Decisão técnica invalida algo da SPEC | Pare e sinalize |
| Fase 2 | Ambiguidade da SPEC que afeta tech ou teste | Pergunte antes de planejar |
| Fase 3 | >12 tasks | Pare; recomende dividir em duas entregas |
| Fase 3 | Gap SPEC/PLAN impede caso de teste claro | Pergunte |

## Princípios

- **Gate sempre = pausa real**: nunca avance entre fases sem confirmação explícita do usuário.
- **Respostas viram conteúdo, não notas avulsas**: cada resposta a uma "Pergunta em aberto" da SPEC precisa virar critério ou restrição. Cada resposta a uma "Área a explorar" do PLAN precisa virar decisão ou ajuste.
- **Formato vence prolixidade**: o limite de linhas (100 SPEC / 150 PLAN) força a escolha do que é essencial. Não exceda.
- **Casos de teste são a spec executável**: cada task tem `entrada → saída`; eles são o que será validado humanamente antes do código.
