import type { HiringSource } from '@/data/hiringSource'
import type { HiringData, RequisitionDetail, RequisitionSummary } from '@/types/hiring'
import type { ApprovalDecision, DirectoryPerson, HireStartInput, NewHireDetailsInput, OpenPosition } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpHiringSource implements HiringSource {
  async getHiring(): Promise<HiringData> {
    const { requisitions } = await http.get<{ requisitions: RequisitionSummary[] }>('/hire/requisitions')
    const details = await Promise.all(
      requisitions.map((r) => http.get<RequisitionDetail>(`/hire/requisitions/${encodeURIComponent(r.id)}`)),
    )
    const byId: Record<string, RequisitionDetail> = {}
    requisitions.forEach((r, i) => {
      byId[r.id] = details[i]
    })
    return { requisitions, details: byId }
  }

  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void> {
    return http.post<void>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, { decision, ...(note ? { note } : {}) })
  }

  startHiring(input: HireStartInput): Promise<void> {
    return http.post<void>('/hire/start', input)
  }

  async listOpenPositions(): Promise<OpenPosition[]> {
    const [pos, prof, dept] = await Promise.all([
      http.get<{ rows: { id: string; department_id: string; job_profile_id: string }[] }>('/tables/position?status=open&limit=200'),
      http.get<{ rows: { id: string; title: string }[] }>('/tables/job_profile?limit=200'),
      http.get<{ rows: { id: string; name: string }[] }>('/tables/department?limit=200'),
    ])
    const title = new Map(prof.rows.map((p) => [p.id, p.title]))
    const name = new Map(dept.rows.map((d) => [d.id, d.name]))
    return pos.rows.map((p) => ({ id: p.id, label: `${title.get(p.job_profile_id) ?? 'Role'} · ${name.get(p.department_id) ?? ''}`.replace(/ · $/, '') }))
  }

  async listPeople(): Promise<DirectoryPerson[]> {
    const r = await http.get<{ rows: { id: string; full_name: string }[] }>('/directory?limit=200')
    return r.rows.map((p) => ({ id: p.id, name: p.full_name }))
  }

  recordNewHireDetails(requisitionId: string, input: NewHireDetailsInput): Promise<void> {
    return http.post<void>(`/hire/requisitions/${encodeURIComponent(requisitionId)}/new-hire-details`, input)
  }
}
