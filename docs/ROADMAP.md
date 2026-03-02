# Nuxo-Bot — Plano de Ação

## Status geral
🟡 Em andamento — fase de implementação

## Tarefas

| # | Tarefa | Status | Branch |
|---|--------|--------|--------|
| 1 | Restaurar projeto Supabase + migrations + seed | ✅ Concluído | `feat/supabase-setup` |
| 2 | Scaffold do projeto TypeScript | ✅ Concluído | `feat/scaffold` |
| 3 | Infraestrutura base (db client, env, bot setup) | ✅ Concluído | `feat/scaffold` |
| 4 | Auth middleware + comando /start | ✅ Concluído | `feat/scaffold` |
| 5 | Registro de gastos (conversa multi-step) | ✅ Concluído | `feat/scaffold` |
| 6 | Consulta de gastos por mês | ✅ Concluído | `feat/scaffold` |
| 7 | Gerenciamento de gastos (excluir / cancelar) | ✅ Concluído | `feat/expense-management` |
| 8 | Gerenciamento de categorias | ✅ Concluído | `feat/scaffold` |
| 9 | Unit tests (Vitest) | ✅ Concluído | `feat/unit-tests` |
| 10 | Melhorias de UX — lote 1 | ✅ Concluído | `feat/ux-improvements` |
| 11 | Deploy no Railway + webhook | ⏳ Pendente | `feat/railway-deploy` |

**Legenda:** ✅ Concluído · 🔄 Em andamento · ⏳ Pendente · ❌ Bloqueado

### Detalhes — Tarefa 10: Melhorias de UX (lote 1)

| Item | Descrição |
|---|---|
| A | **Reordenar fluxo de registro** — Pagamento antes do Tipo; Parcelado só aparece para crédito |
| B | **Botão "✏️ Gerenciar"** — substitui botões individuais por item na tela mensal |
| C | **Filtros na visão mensal** — por tipo de cobrança ou categoria; persiste na sessão |
| D | **Resumo anual** — `/year` mostra totais mensais do ano corrente |
| E | **Recorrentes ativos** — `/recurring` lista cobranças recorrentes com opção de cancelar |

---

## Dependências entre tarefas

```
#1 Supabase + migrations
    └── #2 Scaffold TypeScript
            └── #3 Infra base
                    └── #4 Auth + /start
                            ├── #5 Registro de gastos
                            │       ├── #6 Consulta mensal
                            │       │       └── #10 Melhorias UX lote 1
                            │       └── #7 Excluir / cancelar
                            ├── #8 Categorias
                            └── #9 Unit tests
                                        └── #11 Deploy Railway
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
| Testes | Vitest — utils + services, 72 testes |

---

*Última atualização: 2026-03-02*
