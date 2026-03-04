import ExcelJS from 'exceljs'
import { MonthlyExpenseSummary, PAYMENT_METHOD_LABEL, CHARGE_TYPE_LABEL } from '../types/expense.types'
import { formatMonthLabel } from './date.utils'

const MONTH_SLUG = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

export async function generateExpenseXlsx(
  summary: MonthlyExpenseSummary,
  opts: { year: number; month: number },
): Promise<{ buffer: Buffer; filename: string }> {
  const { year, month } = opts
  const monthLabel = formatMonthLabel(year, month)
  const filename = `gastos-${MONTH_SLUG[month - 1]}-${year}.xlsx`

  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Gastos')

  sheet.columns = [
    { key: 'categoria',  width: 20 },
    { key: 'descricao',  width: 28 },
    { key: 'valor',      width: 14 },
    { key: 'pagamento',  width: 20 },
    { key: 'tipo',       width: 14 },
    { key: 'parcela',    width: 10 },
  ]

  // Título
  sheet.mergeCells('A1:F1')
  const titleCell = sheet.getCell('A1')
  titleCell.value = `Gastos de ${monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}`
  titleCell.font = { bold: true, size: 14 }
  titleCell.alignment = { horizontal: 'center' }

  sheet.addRow([])

  // Cabeçalho
  const headerRow = sheet.addRow(['Categoria', 'Descrição', 'Valor (R$)', 'Pagamento', 'Tipo', 'Parcela'])
  headerRow.font = { bold: true }
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } }
    cell.border = { bottom: { style: 'thin' } }
  })

  // Dados
  for (const [catName, data] of Object.entries(summary.byCategory)) {
    for (const item of data.items) {
      const parcela = item.installmentNumber
        ? `${item.installmentNumber}/${item.installmentsTotal}`
        : '—'

      const row = sheet.addRow([
        catName,
        item.description ?? catName,
        item.amount,
        PAYMENT_METHOD_LABEL[item.paymentMethod],
        CHARGE_TYPE_LABEL[item.chargeType],
        parcela,
      ])

      row.getCell(3).numFmt = '#,##0.00'
    }
  }

  sheet.addRow([])

  // Total
  const totalRow = sheet.addRow(['Total', '', summary.grandTotal, '', '', ''])
  totalRow.font = { bold: true }
  totalRow.getCell(3).numFmt = '#,##0.00'

  const buffer = Buffer.from(await workbook.xlsx.writeBuffer())
  return { buffer, filename }
}
