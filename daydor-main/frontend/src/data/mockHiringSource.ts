import type { HiringSource } from '@/data/hiringSource'
import type { ApprovalDecision, DirectoryPerson, HireStartInput, NewHireDetailsInput, OpenPosition } from '@/data/actions'
import type { HiringData, PipelineItem, RequisitionSummary } from '@/types/hiring'

const BACKEND_PIPELINE: PipelineItem[] = [
  {
    application: { id: 'app-1', stage: 'applied', stage_changed_at: '2026-10-19T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-1', full_name: 'Meera Pillai', email: 'meera.pillai@example.com', source: 'Naukri' },
    screening: null,
    interview: null,
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-2', stage: 'applied', stage_changed_at: '2026-10-21T07:30:00Z', rejection_reason_code: null },
    candidate: { id: 'c-2', full_name: 'Aakash Gupta', email: 'aakash.gupta@example.com', source: 'LinkedIn' },
    screening: null,
    interview: null,
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-3', stage: 'screening', stage_changed_at: '2026-10-18T12:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-3', full_name: 'Ishaan Kapoor', email: 'ishaan.kapoor@example.com', source: 'Instahyre' },
    screening: {
      id: 'scr-3',
      score: 82,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: null,
      human_override: false,
      approval: { id: 'ap-3', status: 'pending', gate_type: 'screening_shortlist' },
    },
    interview: null,
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-4', stage: 'screening', stage_changed_at: '2026-10-17T10:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-4', full_name: 'Fatima Shaikh', email: 'fatima.shaikh@example.com', source: 'Referral · Rohit' },
    screening: {
      id: 'scr-4',
      score: 61,
      recommendation: 'hold',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: null,
      human_override: false,
      approval: null,
    },
    interview: null,
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-5', stage: 'interview', stage_changed_at: '2026-10-13T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-5', full_name: 'Neha Joshi', email: 'neha.joshi@example.com', source: 'LinkedIn' },
    screening: {
      id: 'scr-5',
      score: 88,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: '2026-10-13T11:00:00Z',
      human_override: false,
      approval: { id: 'ap-5', status: 'approved', gate_type: 'screening_shortlist' },
    },
    interview: {
      id: 'int-5',
      scheduled_at: '2026-10-15T10:30:00Z',
      interviewer_employee_id: 'emp-9',
      interviewer_name: 'Rohit Sinha',
      recommendation: null,
    },
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-6', stage: 'interview', stage_changed_at: '2026-10-14T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-6', full_name: 'Varun Menon', email: 'varun.menon@example.com', source: 'Naukri' },
    screening: {
      id: 'scr-6',
      score: 74,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: '2026-10-14T10:00:00Z',
      human_override: false,
      approval: { id: 'ap-6', status: 'approved', gate_type: 'screening_shortlist' },
    },
    interview: {
      id: 'int-6',
      scheduled_at: '2026-10-16T09:00:00Z',
      interviewer_employee_id: 'emp-2',
      interviewer_name: 'Abhijeet Singh',
      recommendation: null,
    },
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-7', stage: 'offer', stage_changed_at: '2026-10-12T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-7', full_name: 'Rohan Iyer', email: 'rohan.iyer@example.com', source: 'Instahyre' },
    screening: {
      id: 'scr-7',
      score: 91,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: '2026-10-08T09:00:00Z',
      human_override: false,
      approval: { id: 'ap-7', status: 'approved', gate_type: 'screening_shortlist' },
    },
    interview: {
      id: 'int-7',
      scheduled_at: '2026-10-10T15:00:00Z',
      interviewer_employee_id: 'emp-2',
      interviewer_name: 'Abhijeet Singh',
      recommendation: 'strong_hire',
    },
    offer: {
      id: 'off-7',
      proposed_base: 2600000,
      proposed_equity: '0.10%',
      within_band: false,
      sent_at: '2026-10-12T09:00:00Z',
      accepted_at: null,
      band: { currency: 'INR', band_min: 1800000, band_mid: 2100000, band_max: 2400000 },
      approval: { id: 'ap-7-offer', status: 'pending', gate_type: 'offer_above_band' },
    },
    background_check: null,
  },
  {
    application: { id: 'app-8', stage: 'background_check', stage_changed_at: '2026-10-19T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-8', full_name: 'Kavya Nair', email: 'kavya.nair@example.com', source: 'LinkedIn' },
    screening: {
      id: 'scr-8',
      score: 85,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: '2026-10-05T09:00:00Z',
      human_override: false,
      approval: { id: 'ap-8', status: 'approved', gate_type: 'screening_shortlist' },
    },
    interview: {
      id: 'int-8',
      scheduled_at: '2026-10-07T14:00:00Z',
      interviewer_employee_id: 'emp-2',
      interviewer_name: 'Abhijeet Singh',
      recommendation: 'hire',
    },
    offer: {
      id: 'off-8',
      proposed_base: 2000000,
      proposed_equity: null,
      within_band: true,
      sent_at: '2026-10-08T09:00:00Z',
      accepted_at: '2026-10-09T09:00:00Z',
      band: { currency: 'INR', band_min: 1800000, band_mid: 2100000, band_max: 2400000 },
      approval: { id: 'ap-8-offer', status: 'approved', gate_type: 'offer_above_band' },
    },
    background_check: {
      id: 'bgc-8',
      status: 'awaiting_consent',
      consent_requested_at: '2026-10-19T09:00:00Z',
      consent_received_at: null,
      retain_until: null,
    },
  },
  {
    application: { id: 'app-9', stage: 'hired', stage_changed_at: '2026-10-05T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-9', full_name: 'Prithvi Rao', email: 'prithvi.rao@example.com', source: 'Referral · Deepa' },
    screening: {
      id: 'scr-9',
      score: 89,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: '2026-09-28T09:00:00Z',
      human_override: false,
      approval: { id: 'ap-9', status: 'approved', gate_type: 'screening_shortlist' },
    },
    interview: {
      id: 'int-9',
      scheduled_at: '2026-09-30T14:00:00Z',
      interviewer_employee_id: 'emp-2',
      interviewer_name: 'Abhijeet Singh',
      recommendation: 'strong_hire',
    },
    offer: {
      id: 'off-9',
      proposed_base: 2200000,
      proposed_equity: null,
      within_band: true,
      sent_at: '2026-10-01T09:00:00Z',
      accepted_at: '2026-10-02T09:00:00Z',
      band: { currency: 'INR', band_min: 1800000, band_mid: 2100000, band_max: 2400000 },
      approval: { id: 'ap-9-offer', status: 'approved', gate_type: 'offer_above_band' },
    },
    background_check: {
      id: 'bgc-9',
      status: 'clear',
      consent_requested_at: '2026-10-02T09:00:00Z',
      consent_received_at: '2026-10-03T09:00:00Z',
      retain_until: '2027-04-02T00:00:00Z',
    },
  },
]

const DESIGNER_PIPELINE: PipelineItem[] = [
  {
    application: { id: 'app-10', stage: 'applied', stage_changed_at: '2026-10-20T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-10', full_name: 'Ananya Reddy', email: 'ananya.reddy@example.com', source: 'LinkedIn' },
    screening: null,
    interview: null,
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-11', stage: 'screening', stage_changed_at: '2026-10-16T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-11', full_name: 'Siddharth Rao', email: 'siddharth.rao@example.com', source: 'Behance' },
    screening: {
      id: 'scr-11',
      score: 79,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: null,
      human_override: false,
      approval: { id: 'ap-11', status: 'pending', gate_type: 'screening_shortlist' },
    },
    interview: null,
    offer: null,
    background_check: null,
  },
  {
    application: { id: 'app-12', stage: 'interview', stage_changed_at: '2026-10-11T09:00:00Z', rejection_reason_code: null },
    candidate: { id: 'c-12', full_name: 'Divya Menon', email: 'divya.menon@example.com', source: 'Naukri' },
    screening: {
      id: 'scr-12',
      score: 84,
      recommendation: 'shortlist',
      tool_name: 'Daydor Screen',
      model_version: '2026-09',
      candidate_notified_at: '2026-10-11T10:00:00Z',
      human_override: false,
      approval: { id: 'ap-12', status: 'approved', gate_type: 'screening_shortlist' },
    },
    interview: {
      id: 'int-12',
      scheduled_at: '2026-10-22T16:00:00Z',
      interviewer_employee_id: 'emp-2',
      interviewer_name: 'Abhijeet Singh',
      recommendation: null,
    },
    offer: null,
    background_check: null,
  },
]

const BACKEND_REQUISITION: RequisitionSummary = {
  id: 'req-backend-engineer',
  status: 'open',
  target_start_date: '2026-12-01',
  position_id: 'pos-101',
  hiring_manager_id: 'emp-2',
  hiring_manager_name: 'Abhijeet Singh',
  job_title: 'Backend engineer',
  department_name: 'Engineering',
  stage: 'posted',
  approval: { id: 'ap-req-1', status: 'approved', gate_type: 'requisition_budget' },
  posting: {
    channel: 'LinkedIn, Naukri, Instahyre',
    pay_range_min: 1800000,
    pay_range_max: 2400000,
    pay_transparency_checked: true,
    posted_at: '2026-09-20T09:00:00Z',
  },
  candidate_count: BACKEND_PIPELINE.length,
  created_at: '2026-09-15T09:00:00Z',
  appointment_letter: { status: 'not_applicable' },
  threshold_heads_up: {
    scheme: 'ESI',
    headcount_at_check: 9,
    threshold: 10,
  },
}

const DESIGNER_REQUISITION: RequisitionSummary = {
  id: 'req-product-designer',
  status: 'open',
  target_start_date: '2026-11-15',
  position_id: 'pos-102',
  hiring_manager_id: 'emp-2',
  hiring_manager_name: 'Abhijeet Singh',
  job_title: 'Product designer',
  department_name: 'Design',
  stage: 'posted',
  approval: { id: 'ap-req-2', status: 'approved', gate_type: 'requisition_budget' },
  posting: {
    channel: 'LinkedIn, Behance, Naukri',
    pay_range_min: 1600000,
    pay_range_max: 2000000,
    pay_transparency_checked: true,
    posted_at: '2026-10-01T09:00:00Z',
  },
  candidate_count: DESIGNER_PIPELINE.length,
  created_at: '2026-09-28T09:00:00Z',
  appointment_letter: { status: 'not_applicable' },
  threshold_heads_up: null,
}

const SUPPORT_REQUISITION: RequisitionSummary = {
  id: 'req-support-lead',
  status: 'awaiting_budget_approval',
  target_start_date: '2027-01-15',
  position_id: 'pos-103',
  hiring_manager_id: 'emp-3',
  hiring_manager_name: 'Deepa Nair',
  job_title: 'Support lead',
  department_name: 'Customer Success',
  stage: 'awaiting_budget_approval',
  approval: { id: 'ap-req-3', status: 'pending', gate_type: 'requisition_budget' },
  posting: null,
  candidate_count: 0,
  created_at: '2026-10-18T09:00:00Z',
  appointment_letter: { status: 'not_applicable' },
  threshold_heads_up: null,
}

const MOCK_HIRING: HiringData = {
  requisitions: [BACKEND_REQUISITION, DESIGNER_REQUISITION, SUPPORT_REQUISITION],
  details: {
    [BACKEND_REQUISITION.id]: {
      requisition: BACKEND_REQUISITION,
      pipeline: BACKEND_PIPELINE,
      access: { can_enter_applications: true, sees_candidates: true },
    },
    [DESIGNER_REQUISITION.id]: {
      requisition: DESIGNER_REQUISITION,
      pipeline: DESIGNER_PIPELINE,
      access: { can_enter_applications: true, sees_candidates: true },
    },
    [SUPPORT_REQUISITION.id]: {
      requisition: SUPPORT_REQUISITION,
      pipeline: [],
      access: { can_enter_applications: false, sees_candidates: false },
    },
  },
}

export class MockHiringSource implements HiringSource {
  async getHiring(): Promise<HiringData> {
    return MOCK_HIRING
  }

  async resolveApproval(_approvalId: string, _decision: ApprovalDecision, _note?: string): Promise<void> {}

  async startHiring(_input: HireStartInput): Promise<void> {}

  async listOpenPositions(): Promise<OpenPosition[]> {
    return [{ id: 'pos-1', label: 'Product Designer · Design' }]
  }

  async listPeople(): Promise<DirectoryPerson[]> {
    return [{ id: 'emp-1', name: 'Priya Nair' }]
  }

  async recordNewHireDetails(_requisitionId: string, _input: NewHireDetailsInput): Promise<void> {}
}
