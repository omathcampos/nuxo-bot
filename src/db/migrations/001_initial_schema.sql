-- Enums
CREATE TYPE charge_type AS ENUM ('one_time', 'installment', 'recurring');
CREATE TYPE payment_method AS ENUM ('credit_card', 'debit_card', 'pix', 'cash');

-- Users
CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  telegram_id   BIGINT NOT NULL UNIQUE,
  telegram_name TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);

-- Categories
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  user_id     BIGINT REFERENCES users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  icon        TEXT,
  is_default  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Partial indexes: nomes únicos globalmente (user_id NULL) e por usuário
CREATE UNIQUE INDEX unique_global_category_name
  ON categories(name) WHERE user_id IS NULL;
CREATE UNIQUE INDEX unique_user_category_name
  ON categories(user_id, name) WHERE user_id IS NOT NULL;
CREATE INDEX idx_categories_user_id ON categories(user_id);

-- Expenses
CREATE TABLE expenses (
  id                  BIGSERIAL PRIMARY KEY,
  user_id             BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id         INTEGER NOT NULL REFERENCES categories(id),
  description         TEXT,
  total_amount        NUMERIC(12, 2) NOT NULL CHECK (total_amount > 0),
  payment_method      payment_method NOT NULL,
  charge_type         charge_type NOT NULL,
  billing_start_date  DATE NOT NULL,
  installments_total  INTEGER,
  cancelled_at        DATE,
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
CREATE INDEX idx_expenses_user_charge_type ON expenses(user_id, charge_type);
