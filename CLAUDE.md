# CLAUDE.md

Este arquivo fornece orientações ao Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Projeto
Nuxo-Bot — bot de finanças pessoais para Telegram (TypeScript). Usuários registram despesas, visualizam resumos mensais/anuais e gerenciam cobranças recorrentes e parcelamentos.

## Comandos

```bash
npm run dev          # tsx watch (hot reload, sem build)
npm test             # vitest run (~72 testes)
npm run test:watch   # vitest em modo watch
npm run typecheck    # tsc --noEmit (deve passar antes de PRs)
npm run build        # tsc → dist/
npm start            # node dist/main.js (produção)
```

Dev local requer URL pública para webhooks do Telegram — use ngrok ou similar e configure `WEBHOOK_DOMAIN`.

## Arquitetura

**Stack:** Grammy + @grammyjs/conversations · Supabase (PostgreSQL, sem ORM) · Express (webhook handler) · Railway (deploy)

**Estrutura de camadas:**
```
src/bot/          → Configuração Grammy, middleware, commands, conversations, callbacks, keyboards
src/services/     → Lógica de negócio (expense, category, user)
src/repositories/ → SQL direto via cliente Supabase
src/db/           → Cliente singleton, session storage, migrations/
src/types/        → Interfaces compartilhadas
src/utils/        → Helpers de data, formatação, validação
```

**Ordem do middleware (não alterar):**
```
session → conversations → auth → commands/callbacks
```
O middleware de auth resolve `ctx.session.dbUserId` — nada downstream funciona sem ele.

**Contexto do bot:**
```typescript
type BotContext = ConversationFlavor<Context & SessionFlavor<SessionData>>
// SessionData: { dbUserId, _pendingCancelExpenseId?, _monthFilter? }
```

## Conceito Central: "Desdobramento" de Despesas

Um único registro em `expenses` representa toda a vida útil de uma despesa. A função PostgreSQL `get_monthly_expenses(user_id, year, month)` desdobra esse registro em linhas mensais via UNION ALL:
- **one_time** → aparece uma vez no mês exato
- **installment** → dividido em N meses a partir de billing_start_date
- **recurring** → todo mês do início até cancelled_at

Nunca duplicar dados de despesa — sempre consultar através dessa função.

## Fluxo de Registro de Despesa (conversa add-expense)

7 etapas: valor → forma de pagamento → tipo de cobrança → número de parcelas (só crédito) → data de início → categoria → descrição (opcional).

A seleção de categoria suporta "criar nova" inline sem sair do fluxo da conversa.

## Formas de Pagamento e Tipos de Cobrança

- Pagamento: `credit_card | debit_card | pix | cash | vr | va`
- Cobrança: `one_time | installment | recurring`
- `installments_total` é NULL exceto quando charge = installment
- `cancelled_at` é NULL exceto quando charge = recurring

## Adicionando Features

| Tarefa | Onde |
|--------|------|
| Novo comando | `src/bot/commands/` + registrar em `commands/index.ts` |
| Novo callback | `src/bot/callbacks/` — seguir padrão `expense:*` / `month:*` |
| Novo campo em despesa | Atualizar types → repository → service → conversation |
| Nova query no banco | Adicionar no repository, chamar do service (nunca da camada bot) |

## Variáveis de Ambiente

`BOT_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (service role, não anon), `WEBHOOK_DOMAIN`, `TZ=America/Sao_Paulo`

## Migrations

Arquivos SQL em `src/db/migrations/`. Aplicar via dashboard ou CLI do Supabase. A tabela `sessions` é gerenciada pelo `@grammyjs/storage-supabase`.

## Estratégia de Branches

`main` (produção, deploy automático no Railway) ← `develop` ← `feat/*`, `fix/*`

## Documentação Existente

- `docs/ARCHITECTURE.md` — schema completo e decisões de arquitetura
- `docs/PRODUCT.md` — regras de negócio
- `docs/ROADMAP.md` — acompanhamento de tarefas
