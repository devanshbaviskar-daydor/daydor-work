import type { ExpensesSource } from '@/data/expensesSource'
import type { ExpensesData } from '@/types/expenses'
import type { ApprovalDecision, ExpenseInput } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpExpensesSource implements ExpensesSource {
  getExpenses(): Promise<ExpensesData> {
    return http.get<ExpensesData>('/views/expenses')
  }

  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void> {
    return http.post<void>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, { decision, ...(note ? { note } : {}) })
  }

  submitExpense(input: ExpenseInput): Promise<void> {
    return http.post<void>('/expenses', input)
  }
}
