export type RequisitionStage = 'drafting' | 'awaiting_budget_approval' | 'budget_rejected' | 'approved' | 'posted'

export interface RequisitionApproval {
  id: string
  status: string
  gate_type: string
}

export interface RequisitionPosting {
  channel: string
  pay_range_min: number
  pay_range_max: number
  pay_transparency_checked: boolean
  posted_at: string
}

export interface ThresholdHeadsUp {
  scheme: string
  headcount_at_check: number
  threshold: number
}

export interface RequisitionSummary {
  id: string
  status: string
  target_start_date: string
  position_id: string
  hiring_manager_id: string
  hiring_manager_name: string
  job_title: string
  department_name: string
  stage: RequisitionStage
  approval: RequisitionApproval | null
  posting: RequisitionPosting | null
  candidate_count: number
  created_at: string
  /** Daydor addition: India's Industrial Relations Code / OSH Central Rules 2026 require an appointment letter; no Daydor-Build equivalent exists. */
  appointment_letter: { status: 'not_applicable' | 'pending' | 'generated' | 'sent' | 'acknowledged' }
  /** Daydor addition: requisition_opener's read-only heads-up when filling this seat would cross a statutory headcount threshold (Domain 1). */
  threshold_heads_up: ThresholdHeadsUp | null
}

export type ApplicationStage = 'applied' | 'screening' | 'interview' | 'offer' | 'background_check' | 'hired'

export interface PipelineApplication {
  id: string
  stage: ApplicationStage
  stage_changed_at: string
  rejection_reason_code: string | null
}

export interface PipelineCandidate {
  id: string
  full_name: string
  email: string
  source: string
}

export interface PipelineScreening {
  id: string
  score: number
  recommendation: string
  tool_name: string
  model_version: string
  candidate_notified_at: string | null
  human_override: boolean
  approval: RequisitionApproval | null
}

export interface PipelineInterview {
  id: string
  scheduled_at: string
  interviewer_employee_id: string
  interviewer_name: string
  recommendation: string | null
}

export interface CompBand {
  currency: string
  band_min: number
  band_mid: number
  band_max: number
}

export interface PipelineOffer {
  id: string
  proposed_base: number
  proposed_equity: string | null
  within_band: boolean
  sent_at: string | null
  accepted_at: string | null
  band: CompBand | null
  approval: RequisitionApproval | null
}

/**
 * Daydor addition replacing Daydor-Build's `background_check` US-FCRA fields
 * (`adverse_action_stage`, `pre_adverse_notice_at`, which have no Indian-law
 * meaning) with DPDP consent tracking instead.
 */
export interface PipelineBackgroundCheck {
  id: string
  status: 'awaiting_consent' | 'in_progress' | 'clear' | 'flagged'
  consent_requested_at: string | null
  consent_received_at: string | null
  retain_until: string | null
}

export interface PipelineItem {
  application: PipelineApplication
  candidate: PipelineCandidate | null
  screening: PipelineScreening | null
  interview: PipelineInterview | null
  offer: PipelineOffer | null
  background_check: PipelineBackgroundCheck | null
}

export interface DirectoryRow {
  id: string
  full_name: string
  work_email: string
  department_id: string
  location_id: string
  position_id: string
}

/** The hire's progress once the employee exists; only for the roles that may read workflows (HR, founder, payroll). */
export interface RequisitionOnboarding {
  employee_id: string
  instance_state: string
  instance_status: string
  awaiting_consent_request: boolean
}

export interface RequisitionDetail {
  requisition: RequisitionSummary
  pipeline: PipelineItem[]
  access: { can_enter_applications: boolean; sees_candidates: boolean }
  onboarding?: RequisitionOnboarding | null
  /** The hire is waiting for HR to record the new hire's personal details (POST /hire/requisitions/{id}/new-hire-details). */
  awaiting?: 'new_hire_details' | null
}

export interface HiringData {
  requisitions: RequisitionSummary[]
  details: Record<string, RequisitionDetail>
}
