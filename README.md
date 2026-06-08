# myo-plan-skills

Skills pessoais de planejamento, debate de feature e commit para o [Claude Code](https://code.claude.com/docs/en/plugins) — distribuídas como plugin via marketplace.

Contém o plugin **`myo-plan-skills`** (publicado no marketplace **`myo`**).

## Skills incluídas

| Skill | Para quê |
|-------|----------|
| `brainstorm-readme` | Debater e convergir um README antes de qualquer plano ou código. |
| `quick-plan` | Plano leve de arquivo único (PLAN.md) para tarefas pequenas. |
| `multi_file_workflow` | Fluxo de planejamento multi-arquivo (SPEC → PLAN → TASKS). |
| `commit-conversional-skill` | Impõe Conventional Commits (inglês, só título). |

## Instalação

Funciona no **Claude Code** e no **Claude Desktop**:

```
/plugin marketplace add Myourkiu/myo-plan-skills
/plugin install myo-plan-skills@myo
```

Depois de instalado, as skills ficam disponíveis com o namespace do plugin, por exemplo:
`myo-plan-skills:quick-plan`.

## Atualizar

```
/plugin marketplace update myo
```

## Estrutura

```
myo-plan-skills/
├── .claude-plugin/
│   └── marketplace.json          # catálogo do marketplace "myo"
└── myo-plan-skills/              # o plugin
    ├── .claude-plugin/
    │   └── plugin.json           # manifesto do plugin
    └── skills/
        ├── brainstorm-readme/SKILL.md
        ├── commit-conversional-skill/SKILL.md
        ├── multi_file_workflow/SKILL.md
        └── quick-plan/SKILL.md
```
