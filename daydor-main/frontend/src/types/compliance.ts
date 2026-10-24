export type StatutoryScheme = 'ESI' | 'Gratuity' | 'POSH' | 'EPF'

export type ChecklistItemStatus = 'pending' | 'done'

/**
 * Pattern follows Daydor-Build's own generic `checklist_task` shape
 * (owner_domain/title/status/due_at/completed_at/blocking) — the closest
 * upstream analog for a "drafted items awaiting completion" list, since
 * Daydor-Build's `threshold_obligation` table has no checklist concept at all.
 */
export interface ChecklistItem {
  id: string
  title: string
  status: ChecklistItemStatus
  dueDate?: string
  completedAt?: string
  blocking?: boolean
}

/**
 * Mirrors Daydor-Build's `threshold_obligation` table (domain `hr`) field names —
 * daydor's own differentiator domain; the upstream table is thin (no checklist
 * concept), so the checklist below is daydor's own addition on top of it.
 */
export interface ThresholdObligation {
  id: string
  legalEntityId: string
  scheme: StatutoryScheme
  headcountAtCheck: number
  threshold: number
  applicable: boolean
  crossedAt?: string
  registrationDeadline?: string
  approvalRequestId?: string
  checklist: ChecklistItem[]
}

export type FilingStatus = 'overdue' | 'needs-you' | 'upcoming' | 'filed'

/** Mirrors Daydor-Build's `filing_record` table (domain `pay`) field names. */
export interface FilingRecord {
  id: string
  legalEntityId: string
  scheme: StatutoryScheme | 'PT' | 'TDS'
  period: string
  filedOn?: string
  acknowledgementNo?: string
  documentId?: string
  authority: string
  amount?: number
  dueDate: string
  status: FilingStatus
}

export interface ComplianceStat {
  label: string
  value: string
  delta?: string
  deltaTone?: 'warning' | 'success'
}

export interface ComplianceData {
  legalEntityName: string
  stats: ComplianceStat[]
  obligations: ThresholdObligation[]
  filings: FilingRecord[]
}
