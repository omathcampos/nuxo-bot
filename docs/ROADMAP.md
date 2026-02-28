# Nuxo-Bot — Plano de Ação

## Status geral
🟡 Em andamento — fase de implementação

## Tarefas

| # | Tarefa | Status | Branch |
|---|--------|--------|--------|
| 1 | Restaurar projeto Supabase + migrations + seed | ✅ Concluído | `feat/supabase-setup` |
| 2 | Scaffold do projeto TypeScript | ✅ Concluído | `feat/scaffold` |
| 3 | Infraestrutura base (db client, env, bot setup) | ⏳ Pendente | `feat/infra-base` |
| 4 | Auth middleware + comando /start | ⏳ Pendente | `feat/auth-start` |
| 5 | Registro de gastos (conversa multi-step) | ⏳ Pendente | `feat/add-expense` |
| 6 | Consulta de gastos por mês | ⏳ Pendente | `feat/monthly-query` |
| 7 | Gerenciamento de gastos (excluir / cancelar) | ⏳ Pendente | `feat/expense-management` |
| 8 | Gerenciamento de categorias | ⏳ Pendente | `feat/categories` |
| 9 | Deploy no Railway + webhook | ⏳ Pendente | `feat/railway-deploy` |

**Legenda:** ✅ Concluído · 🔄 Em andamento · ⏳ Pendente · ❌ Bloqueado

---

## Dependências entre tarefas

```
#1 Supabase + migrations
    └── #2 Scaffold TypeScript
            └── #3 Infra base
                    └── #4 Auth + /start
                            ├── #5 Registro de gastos
                            │       ├── #6 Consulta mensal
                            │       └── #7 Excluir / cancelar
                            └── #8 Categorias
                                    └── #9 Deploy Railway
```

---

## Fluxo de branches

```
main        ← produção (Railway faz deploy daqui)
  └── develop ← integração
        └── feat/* ← features individuais
        └── fix/*  ← correções
```

### Regras
- `main` nunca recebe commit direto — só via PR de `develop`
- `develop` recebe merges de `feat/*` via PR
- Cada tarefa acima tem sua própria branch `feat/`
- Hotfixes urgentes: branch `fix/` a partir de `main`, PR direto para `main` + cherry-pick em `develop`

---

## Decisões técnicas já tomadas

Ver `docs/ARCHITECTURE.md` para detalhes completos.

| Decisão | Escolha |
|---|---|
| Linguagem | TypeScript / Node.js 20+ |
| Bot framework | Grammy + @grammyjs/conversations |
| Banco | Supabase (PostgreSQL) |
| Sessão | @grammyjs/storage-supabase |
| Deploy | Railway (webhook mode) |
| Modelo de parcelas | Linha única + função SQL `get_monthly_expenses` |

---

*Última atualização: 2026-02-28*
