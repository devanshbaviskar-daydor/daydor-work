/** What `GET /api/auth/me` returns: who is signed in, what their role may open and which approvals it may decide. */
export interface Session {
  id: string
  email: string
  display_name: string
  role: string
  role_letter: string
  role_label: string
  tenant_id: string | null
  tenant_name: string | null
  user_id: string | null
  employee_id: string | null
  capabilities: {
    workflow_timeline: boolean
    directory: boolean
    /** Screen key (home, leave, hiring, payroll, compliance, expenses, benefits, documents, people, settings) to whether the role has it. */
    screens: Record<string, boolean>
    /** Gate ids the role may decide (the registry's approver roles). */
    decides: string[]
  }
}

export interface DevUser {
  email: string
  display_name: string
  role: string
  role_label: string
  tenant_name: string | null
}
