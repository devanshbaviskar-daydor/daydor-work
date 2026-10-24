export type ExpenseCategoryCode =
  | 'meals'
  | 'travel'
  | 'client_entertainment'
  | 'office_supplies'
  | 'professional_development'

/**
 * daydor's own reference table (Product Spec §7.1, §7.3) — Daydor-Build's
 * `expense.category` is a bare text field with no backing rule table, so
 * this is daydor's load-bearing addition, not a port of anything upstream.
 */
export interface ExpenseCategoryRule {
  categoryCode: ExpenseCategoryCode
  label: string
  requiresReceiptAbove: number
  managerApprovalThreshold: number
  itcEligible: boolean
}

export type ExpensePolicyFlagKind = 'missing_receipt' | 'needs_founder_approval'

/**
 * Open-ended jsonb bag on the `expense` row (Daydor-Build schema), not fixed
 * boolean columns — `policy_threshold_validator` output is informational and
 * never blocks submission.
 */
export interface ExpensePolicyFlag {
  kind: ExpensePolicyFlagKind
  message: string
}

export type ExpenseApprovalStage = 'manager' | 'founder'

export interface ExpenseApprovalRequest {
  id: string
  stage: ExpenseApprovalStage
  approverName: string
  status: 'pending' | 'approved' | 'declined'
  /** Only on a pending request: whether the signed-in role may decide it, and why not. */
  canDecide?: boolean
  cannotDecideReason?: string
}

export interface ExtractedReceiptField {
  label: string
  value: number | string
  confidence?: 'high' | 'low'
  flag?: string
}

/**
 * Base entity mirrors Daydor-Build's `expense` table
 * (employee_id, amount, category, receipt_document_id, policy_flags,
 * approval_request_id, reimbursed_at) — kept as a clean, compatible subset.
 */
export interface ExpenseClaim {
  id: string
  employeeId: string
  employeeName: string
  amount: number
  categoryCode: ExpenseCategoryCode
  submittedAt: string
  receiptDocumentId?: string
  extractedFields?: ExtractedReceiptField[]
  vendor?: string
  receiptDate?: string
  note?: string
  policyFlags: ExpensePolicyFlag[]
  approvalRequest?: ExpenseApprovalRequest
  /**
   * Set only in lockstep with a payroll run's disbursed_at (captain decision,
   * Product Spec §7.1): reimbursement folds into Payroll's existing
   * salary_disbursement rather than running as a separate payout.
   */
  reimbursedAt?: string
  reimbursementBatchId?: string
}

/** A payroll run's salary_disbursement batch that a claim's reimbursement rides on. */
export interface ReimbursementBatch {
  id: string
  payrollRunLabel: string
  disbursedAt?: string
  scheduledDisbursementDate: string
  claimIds: string[]
  totalAmount: number
}

export interface ExpensesData {
  categoryRules: ExpenseCategoryRule[]
  claims: ExpenseClaim[]
  reimbursementBatches: ReimbursementBatch[]
}
