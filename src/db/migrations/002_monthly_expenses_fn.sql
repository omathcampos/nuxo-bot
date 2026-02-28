CREATE OR REPLACE FUNCTION get_monthly_expenses(
  p_user_id BIGINT,
  p_year    INTEGER,
  p_month   INTEGER
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
  SELECT
    e.id, e.description, c.name, c.icon,
    e.payment_method, e.charge_type,
    e.total_amount,
    NULL::INTEGER, NULL::INTEGER,
    e.billing_start_date
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
  WHERE e.user_id = p_user_id
    AND e.charge_type = 'one_time'
    AND DATE_TRUNC('month', e.billing_start_date) = v_target

  UNION ALL

  -- PARCELADO: cada parcela no seu mês
  SELECT
    e.id, e.description, c.name, c.icon,
    e.payment_method, e.charge_type,
    ROUND(e.total_amount / e.installments_total, 2),
    (
      EXTRACT(YEAR FROM AGE(v_target, DATE_TRUNC('month', e.billing_start_date)))::INTEGER * 12
      + EXTRACT(MONTH FROM AGE(v_target, DATE_TRUNC('month', e.billing_start_date)))::INTEGER
      + 1
    ),
    e.installments_total,
    e.billing_start_date
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
  WHERE e.user_id = p_user_id
    AND e.charge_type = 'installment'
    AND DATE_TRUNC('month', e.billing_start_date) <= v_target
    AND v_target < (
      DATE_TRUNC('month', e.billing_start_date)
      + (e.installments_total || ' months')::INTERVAL
    )

  UNION ALL

  -- RECORRENTE: a partir do início, até cancelled_at (exclusive)
  SELECT
    e.id, e.description, c.name, c.icon,
    e.payment_method, e.charge_type,
    e.total_amount,
    NULL::INTEGER, NULL::INTEGER,
    e.billing_start_date
  FROM expenses e
  JOIN categories c ON c.id = e.category_id
  WHERE e.user_id = p_user_id
    AND e.charge_type = 'recurring'
    AND DATE_TRUNC('month', e.billing_start_date) <= v_target
    AND (e.cancelled_at IS NULL OR e.cancelled_at > v_target);
END;
$$ LANGUAGE plpgsql;
