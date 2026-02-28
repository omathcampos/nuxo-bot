import { supabase } from '../db/client'
import { CreateExpenseDTO, MonthlyExpenseRow } from '../types/expense.types'

export const ExpenseRepository = {
  async create(dto: CreateExpenseDTO) {
    const { data } = await supabase
      .from('expenses')
      .insert({
        user_id:             dto.userId,
        category_id:         dto.categoryId,
        description:         dto.description ?? null,
        total_amount:        dto.totalAmount,
        payment_method:      dto.paymentMethod,
        charge_type:         dto.chargeType,
        billing_start_date:  dto.billingStartDate.toISOString().slice(0, 10),
        installments_total:  dto.installmentsTotal ?? null,
      })
      .select('*')
      .single()
    return data
  },

  async getMonthly(userId: number, year: number, month: number): Promise<MonthlyExpenseRow[]> {
    const { data } = await supabase.rpc('get_monthly_expenses', {
      p_user_id: userId,
      p_year:    year,
      p_month:   month,
    })
    return (data as MonthlyExpenseRow[]) ?? []
  },

  async findById(id: number, userId: number) {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()
    return data
  },

  async deleteById(id: number, userId: number) {
    await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
  },

  // Exclui apenas as parcelas futuras (a partir do mês atual) — usado para parcelados
  async deleteFutureInstallments(id: number, userId: number) {
    // Como cada compra é uma linha, basta deletar o registro
    // A lógica de "preservar passado" é feita no service, gerando um novo registro truncado
    await supabase
      .from('expenses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
  },

  // Define a data de cancelamento para recorrentes
  async cancelRecurring(id: number, userId: number, cancelFromDate: Date) {
    await supabase
      .from('expenses')
      .update({ cancelled_at: cancelFromDate.toISOString().slice(0, 10) })
      .eq('id', id)
      .eq('user_id', userId)
  },
}
