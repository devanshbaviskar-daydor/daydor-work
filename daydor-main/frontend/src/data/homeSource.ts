import type { ConversationTurn, HomeData, ProposedCommand } from '@/types/home'
import type { ApprovalDecision } from '@/data/actions'

/**
 * Data-fetching contract for the Founder Home screen. MockHomeSource and
 * HttpHomeSource both implement it; pick one via src/data/sources.ts.
 */
export interface HomeSource {
  getHome(): Promise<HomeData>
  resolveApproval(approvalId: string, decision: ApprovalDecision, note?: string): Promise<void>
  /** Say something to Daydor; returns today's conversation including its answer. Daydor answers or proposes; it never acts. */
  sendMessage(text: string, aboutEmployeeId?: string): Promise<ConversationTurn[]>
  /** The person confirmed a command Daydor proposed: call that endpoint as themselves, with the key it came with. */
  runCommand(command: ProposedCommand): Promise<void>
}
