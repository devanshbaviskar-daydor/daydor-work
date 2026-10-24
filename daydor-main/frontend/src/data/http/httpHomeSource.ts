import type { HomeSource } from '@/data/homeSource'
import type { ConversationTurn, HomeData, ProposedCommand } from '@/types/home'
import type { ApprovalDecision } from '@/data/actions'
import { http } from '@/data/http/httpClient'

export class HttpHomeSource implements HomeSource {
  getHome(): Promise<HomeData> {
    return http.get<HomeData>('/views/home')
  }

  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void> {
    return http.post<void>(`/approvals/${encodeURIComponent(approvalId)}/resolve`, { decision, ...(note ? { note } : {}) })
  }

  async sendMessage(text: string, aboutEmployeeId?: string): Promise<ConversationTurn[]> {
    const r = await http.post<{ conversation: ConversationTurn[] }>('/conversation/messages', {
      text,
      ...(aboutEmployeeId ? { about_employee_id: aboutEmployeeId } : {}),
    })
    return r.conversation
  }

  async runCommand(command: ProposedCommand): Promise<void> {
    // The command's path is the real endpoint ("/api/..."); the client's base already ends in /api.
    await http.send<void>(command.method, command.path.replace(/^\/api/, ''), command.body ?? undefined, command.idempotency_key)
  }
}
