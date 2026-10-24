import type { ExpensesData } from '@/types/expenses'
import type { ApprovalDecision, ExpenseInput } from '@/data/actions'

/**
 * Data-fetching contract for the Expenses screen. MockExpensesSource and
 * HttpExpensesSource both implement it; pick one via src/data/sources.ts.
 */
export interface ExpensesSource {
  getExpenses(): Promise<ExpensesData>
  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void>
  submitExpense(input: ExpenseInput): Promise<void>
}
