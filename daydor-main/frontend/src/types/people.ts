export type EmploymentStatus = 'active' | 'on-leave' | 'withdrawn'

export interface PersonSummary {
  id: string
  name: string
  role: string
  department: string
  status: EmploymentStatus
  /** Null when the role reads people through the directory, which does not carry the joining date. */
  joinDate: string | null
  location: string
}

export interface PersonStat {
  label: string
  value: number | string
  delta?: string
  deltaTone?: 'warning' | 'success'
}

export type ProfileFieldTier = 'direct' | 'review' | 'gated'

export interface PersonProfileField {
  label: string
  value: string
  tier: ProfileFieldTier
  mono?: boolean
  pending?: string
}

export interface PersonTimelineEntry {
  text: string
  domain?: string
  time: string
  writeClass?: 'read' | 'guarded' | 'irreversible'
  by?: 'person'
  name?: string
}

export interface PersonDetail {
  id: string
  name: string
  role: string
  department: string
  status: EmploymentStatus
  /** Null when the role reads people through the directory, which does not carry the joining date. */
  joinDate: string | null
  location: string
  employeeId: string
  manager: string
  /** Absent when the signed-in role may not read pay. */
  monthlyCtc?: number
  taxRegime?: 'Old' | 'New'
  stats: PersonStat[]
  fields: PersonProfileField[]
  timeline: PersonTimelineEntry[]
}

export interface PeopleData {
  headcount: number
  people: PersonSummary[]
}
