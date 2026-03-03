-- Adiciona Vale Refeição (vr) e Vale Alimentação (va) ao enum payment_method
-- Rodar no Supabase Dashboard → SQL Editor

ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'vr';
ALTER TYPE payment_method ADD VALUE IF NOT EXISTS 'va';
