export type WriteLevel = 'read' | 'guarded' | 'irreversible'

export interface BriefStat {
  value: number
  label: string
  tone?: 'warning' | 'brand'
}

export interface BriefData {
  greeting: string
  date?: string
  summary: string
  stats: BriefStat[]
}

export interface DecisionFigure {
  label: string
  value: number | string
  note?: string
}

export interface DecisionDeadline {
  daysLeft: number
  date?: string
}

export interface Decision {
  id: string
  title: string
  domain?: string
  gate?: string
  writeClass: WriteLevel
  summary?: string
  figures?: DecisionFigure[]
  why?: string
  deadline?: DecisionDeadline
  approveLabel?: string
  reviewLabel?: string
  escalation?: string
  /** False when the signed-in role may not decide this (or raised it themselves); `cannotDecideReason` says why. Absent means the screen cannot tell. */
  canDecide?: boolean
  cannotDecideReason?: string
}

export interface Run {
  id: string
  title: string
  state: 'running' | 'waiting' | 'done' | 'failed'
  domain?: string
  meta?: string
  progress?: number
}

/** A command Daydor proposes for the person to confirm: the real endpoint, in words (`summary`), with the idempotency key to send with it. Daydor never runs it. */
export interface ProposedCommand {
  id: string
  method: 'POST' | 'PUT' | 'PATCH' | 'GET'
  path: string
  body?: Record<string, unknown> | null
  query?: Record<string, unknown> | null
  summary: string
  risk: string
  kind: string
  confirm_required: boolean
  idempotency_key: string
}

/** What a reply from Daydor offers: open a screen, or confirm a command. */
export type TurnAction = { kind: 'open'; path: string; label: string } | { kind: 'command'; command: ProposedCommand }

export type ConversationTurn =
  | { kind: 'message'; id: string; from: 'user' | 'daydor'; domain?: string; time?: string; text: string; action?: TurnAction }
  | { kind: 'thinking'; id: string; label: string; steps?: string[] }

export interface HomeData {
  brief: BriefData
  conversation: ConversationTurn[]
  needsYou: Decision[]
  runningNow: Run[]
  doneToday: Run[]
  doneTodayMoreCount?: number
}
