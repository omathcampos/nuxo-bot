# Nuxo-Bot — Arquitetura Técnica

## Stack

| Camada | Tecnologia |
|---|---|
| Linguagem | TypeScript / Node.js 20+ |
| Framework do bot | Grammy + @grammyjs/conversations |
| Banco de dados | Supabase (PostgreSQL) |
| Persistência de sessão | @grammyjs/storage-supabase |
| Servidor HTTP | Express (para receber webhook) |
| Deploy | Railway (webhook mode) |
| Dev | tsx (hot-reload sem build) |
| Testes | Vitest |

---

## Estrutura de Pastas

```
nuxo-bot/
├── src/
│   ├── main.ts                          # Entry point: webhook + bot setup
│   ├── config/
│   │   └── env.ts                       # Validação de variáveis de ambiente
│   ├── bot/
│   │   ├── index.ts                     # Inicialização do bot + middlewares
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts        # Garante usuário existe no DB
│   │   │   └── error.middleware.ts       # Handler global de erros
│   │   ├── commands/
│   │   │   ├── index.ts                 # Registra todos os commands
│   │   │   ├── start.command.ts         # /start — boas vindas + menu
│   │   │   ├── add.command.ts           # /add — inicia conversa de registro
│   │   │   ├── month.command.ts         # /month — gastos do mês (com filtros)
│   │   │   ├── recurring.command.ts     # /recurring — recorrentes ativos
│   │   │   └── year.command.ts          # /year — resumo anual
│   │   ├── conversations/
│   │   │   ├── add-expense.conversation.ts  # Fluxo multi-step de registro
│   │   │   └── add-category.conversation.ts # Fluxo de nova categoria
│   │   ├── callbacks/
│   │   │   ├── index.ts                 # Registra todos os callbacks
│   │   │   ├── expense.callbacks.ts     # Excluir, cancelar recorrente
│   │   │   └── month.callbacks.ts       # Navegação, gerenciar, filtros
│   │   └── keyboards/
│   │       ├── expense-type.keyboard.ts  # Condicionado ao paymentMethod
│   │       ├── payment-method.keyboard.ts
│   │       └── categories.keyboard.ts
│   ├── services/
│   │   ├── expense.service.ts           # Regras de negócio de despesas
│   │   ├── category.service.ts          # Regras de categorias
│   │   └── user.service.ts              # Upsert/busca de usuários
│   ├── repositories/
│   │   ├── expense.repository.ts        # Queries SQL de despesas
│   │   ├── category.repository.ts       # Queries de categorias
│   │   └── user.repository.ts           # Queries de usuários
│   ├── db/
│   │   ├── client.ts                    # Singleton Supabase client
│   │   └── migrations/
│   │       ├── 001_initial_schema.sql
│   │       └── 002_monthly_expenses_fn.sql
│   ├── types/
│   │   ├── expense.types.ts
│   │   ├── category.types.ts
│   │   └── bot.types.ts                 # BotContext + SessionData
│   └── utils/
│       ├── date.utils.ts
│       ├── format.utils.ts
│       └── validation.utils.ts
├── supabase/
│   └── migrations/
├── .env.example
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── railway.toml
└── .gitignore
```

---

## Schema do Banco de Dados

### Tabela `users`
```sql
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  telegram_id   BIGINT NOT NULL UNIQUE,
  telegram_name TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
```

### Tabela `categories`
```sql
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
  -- user_id NULL = categoria global (pré-definida)
  name        TEXT NOT NULL,
  icon        TEXT,  -- emoji
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_category_per_user UNIQUE (user_id, name)
);
```

**Categorias pré-definidas (seed):**
Alimentação 🍕, Transporte 🚗, Moradia 🏠, Saúde 💊, Lazer 🎮, Educação 📚, Vestuário 👕, Assinaturas 📺, Outros 📦

### Tabela `expenses`
```sql
CREATE TYPE charge_type AS ENUM ('one_time', 'installment', 'recurring');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'pix', 'cash');

CREATE TABLE expenses (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id         INTEGER NOT NULL REFERENCES categories(id),
  description         TEXT,
  total_amount        NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  payment_method      payment_method NOT NULL,
  charge_type         charge_type NOT NULL,
  billing_start_date  DATE NOT NULL,       -- sempre o 1º dia do mês
  installments_total  INTEGER,             -- só para 'installment'
  cancelled_at        DATE,                -- só para 'recurring' (1º mês que NÃO cobra)
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT check_installment_fields CHECK (
    (charge_type = 'installment' AND installments_total IS NOT NULL) OR
    (charge_type != 'installment' AND installments_total IS NULL)
  ),
  CONSTRAINT check_cancelled_only_recurring CHECK (
    charge_type = 'recurring' OR cancelled_at IS NULL
  )
);

CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_billing_start ON expenses(billing_start_date);
```

### Função SQL `get_monthly_expenses` — peça central da consulta

```sql
CREATE OR REPLACE FUNCTION get_monthly_expenses(
  p_user_id BIGINT, p_year INTEGER, p_month INTEGER
)
RETURNS TABLE (
  expense_id         BIGINT,
  description        TEXT,
  category_name      TEXT,
  category_icon      TEXT,
  payment_method     payment_method,
  charge_type        charge_type,
  effective_amount   NUMERIC(12, 2),
  installment_number INTEGER,
  installments_total INTEGER,
  billing_start_date DATE
) AS $$
DECLARE
  v_target DATE := make_date(p_year, p_month, 1);
BEGIN
  RETURN QUERY

  -- À VISTA: aparece apenas no mês exato
  SELECT e.id, e.description, c.name, c.icon, e.payment_method, e.charge_type,
         e.total_amount, NULL::INT, NULL::INT, e.billing_start_date
  FROM expenses e JOIN categories c ON c.id = e.category_id
  WHERE e.user_id = p_user_id AND e.charge_type = 'one_time'
    AND DATE_TRUNC('month', e.billing_start_date) = v_target

  UNION ALL

  -- PARCELADO: aparece nos N meses a partir do início
  SELECT e.id, e.description, c.name, c.icon, e.payment_method, e.charge_type,
         ROUND(e.total_amount / e.installments_total, 2),
         (EXTRACT(YEAR FROM AGE(v_target, DATE_TRUNC('month', e.billing_start_date)))::INT * 12
          + EXTRACT(MONTH FROM AGE(v_target, DATE_TRUNC('month', e.billing_start_date)))::INT + 1),
         e.installments_total, e.billing_start_date
  FROM expenses e JOIN categories c ON c.id = e.category_id
  WHERE e.user_id = p_user_id AND e.charge_type = 'installment'
    AND DATE_TRUNC('month', e.billing_start_date) <= v_target
    AND v_target < (DATE_TRUNC('month', e.billing_start_date)
                    + (e.installments_total || ' months')::INTERVAL)

  UNION ALL

  -- RECORRENTE: aparece a partir do início, até cancelled_at (exclusive)
  SELECT e.id, e.description, c.name, c.icon, e.payment_method, e.charge_type,
         e.total_amount, NULL::INT, NULL::INT, e.billing_start_date
  FROM expenses e JOIN categories c ON c.id = e.category_id
  WHERE e.user_id = p_user_id AND e.charge_type = 'recurring'
    AND DATE_TRUNC('month', e.billing_start_date) <= v_target
    AND (e.cancelled_at IS NULL OR e.cancelled_at > v_target);
END;
$$ LANGUAGE plpgsql;
```

---

## Padrões Arquiteturais

### Contexto do Grammy
```typescript
// src/types/bot.types.ts
export interface SessionData {
  dbUserId: number | null
  _pendingCancelExpenseId?: number
  _monthFilter?: { chargeType?: ChargeType; categoryName?: string }
}
export type BotContext = ConversationFlavor<Context & SessionFlavor<SessionData>>
```

O campo `_monthFilter` é armazenado na sessão (Supabase) e aplicado client-side sobre o resultado de `getMonthlySummary` ao renderizar a tela mensal.

### Ordem dos middlewares (crítico)
```
session → conversations → auth → commands/callbacks
```

### Conversations
Side-effects de banco dentro de `conversation.external()` para evitar dupla execução em caso de replay.

### Fluxo de registro de gastos (ordem dos passos)
```
1. Valor
2. Forma de pagamento  ← define se Parcelado estará disponível no passo 3
3. Tipo de cobrança    ← "Parcelado" só aparece se pagamento = crédito
4. Parcelas            ← apenas se installment
5. Data de início
6. Categoria
7. Descrição (opcional)
```

### Callbacks — padrão de nomenclatura

```
expense:delete:<id>
expense:delete:confirm:(all|future):<id>
expense:cancel:<id>
expense:cancel:confirm:<id>:<MM/YYYY>
expense:cancel:custom:<id>
expense:noop

month:nav:<YYYY-MM>
month:manage:<YYYY-MM>
month:filter:<YYYY-MM>
month:ftype:<YYYY-MM>:<chargeType>
month:fcat:<YYYY-MM>:<categoryName>
month:fclear:<YYYY-MM>

menu:add | menu:month | menu:recurring | menu:year | menu:categories
```

---

## Testes

**Framework:** Vitest (TypeScript nativo)

| Arquivo de teste | Cobertura |
|---|---|
| `src/utils/date.utils.test.ts` | `parseBillingDate`, `formatMonthYear`, `formatMonthLabel`, `addMonths`, `toFirstOfMonth` |
| `src/utils/format.utils.test.ts` | `parseAmount`, `formatInstallment`, `formatBRL` |
| `src/utils/validation.utils.test.ts` | `parseInstallments` |
| `src/services/expense.service.test.ts` | `getMonthlySummary`/`buildSummary`, `deleteExpense`, `cancelRecurring` |

```bash
npm test           # 72 testes, todos passando
npm run typecheck  # zero erros TypeScript
```

---

## Configurações

### .env.example
```bash
BOT_TOKEN=
WEBHOOK_DOMAIN=https://seu-app.railway.app
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=3000
TZ=America/Sao_Paulo
```

### railway.toml
```toml
[build]
builder = "NIXPACKS"
buildCommand = "npm install && npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
```

---

## Decisões e Trade-offs

| Decisão | Escolha | Justificativa |
|---|---|---|
| Modelo de parcelas | Linha única + função SQL | Evita explosão de dados; PostgreSQL calcula com índices |
| Sessão | @grammyjs/storage-supabase | Zero infra extra; latência aceitável para MVP |
| ORM | Nenhum (SQL direto via Supabase client) | Consulta mensal requer SQL customizado de qualquer forma |
| Webhook vs Polling | Webhook | Railway é always-on; webhook é mais eficiente |
| RLS | Desabilitado (service_role) | Segurança garantida via `WHERE user_id` nas queries |
| Arredondamento | `ROUND(total/n, 2)` | Diferença de R$0,01 aceitável no MVP |
| Filtros mensais | Client-side sobre `getMonthlySummary` | Sem nova migration; dados já carregados |
| Resumo anual | `Promise.all` de 12 chamadas mensais | Sem nova migration; reutiliza função SQL existente |

---

*Criado em: 2026-02-27*
*Atualizado em: 2026-03-02 — novos comandos, filtros, padrão de callbacks, SessionData atualizado, seção de testes*
