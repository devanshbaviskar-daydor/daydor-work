/** Input shapes for the write (action) methods on the data sources. */

export type ApprovalDecision = 'approved' | 'rejected'

export interface LeaveRequestInput {
  leave_policy_id: string
  start_date: string
  end_date: string
  reason: string
}

export interface ExpenseInput {
  amount: number
  category: string
  receipt_document_id?: string
}

/** Everything is optional: the API takes last month and the company's own legal entity and retention class when they are left out. */
export interface PayrollRunInput {
  legal_entity_id?: string
  period_start?: string
  period_end?: string
  retention_class_id?: string
}

export type CoverageTierCode = 'employee_only' | 'employee_spouse_children' | 'employee_spouse_children_parents'

export interface ElectionInput {
  employee_id: string
  benefit_plan_id: string
  coverage_tier: CoverageTierCode
  employee_cost: number
  effective_from: string
}

export interface PlanChangeInput {
  plan_type: 'GMC' | 'GPA' | 'GTL'
  carrier: string
  plan_year: number
  employer_contribution: number
  replaces_plan_id?: string
}

export interface NewHireDetailsInput {
  date_of_birth: string
  personal_address: string
  aadhaar_last4: string
  uan_number?: string
  esic_ip_number?: string
}

/** An open seat a role can be opened for, with its names already joined. */
export interface OpenPosition {
  id: string
  label: string
}

export interface DirectoryPerson {
  id: string
  name: string
}

export interface NotificationPreferenceInput {
  kind: string
  email: boolean
  in_app: boolean
  whatsapp: boolean
}

/** "Open a role": what a person knows. The API fills the rest from the seat's pay band, the legal entity, the location and the retention class. */
export interface HireStartInput {
  position_id: string
  hiring_manager_id: string
  target_start_date: string
  pay_range_min: number
  pay_range_max: number
}