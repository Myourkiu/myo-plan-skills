# claude-skills

Marketplace pessoal de skills do [Claude Code](https://code.claude.com/docs/en/plugins).

Contém o plugin **`myo-plan-skills`**, que empacota minhas skills de planejamento e workflow.

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
/plugin marketplace add pedro/claude-skills
/plugin install myo-plan-skills@claude-skills
```

> Troque `pedro/claude-skills` pelo `owner/repo` real onde este repositório está hospedado.

Depois de instalado, as skills ficam disponíveis com o namespace do plugin, por exemplo:
`myo-plan-skills:quick-plan`.

## Atualizar

```
/plugin marketplace update claude-skills
```

## Estrutura

```
claude-skills/
├── .claude-plugin/
│   └── marketplace.json          # catálogo do marketplace
└── myo-plan-skills/              # o plugin
    ├── .claude-plugin/
    │   └── plugin.json           # manifesto do plugin
    └── skills/
        ├── brainstorm-readme/SKILL.md
        ├── commit-conversional-skill/SKILL.md
        ├── multi_file_workflow/SKILL.md
        └── quick-plan/SKILL.md
```
