import type { Decision } from '@/types/home'

export interface LeaveBalance {
  leaveType: string
  balanceDays: number
}

export interface AttendanceDay {
  label: string
  sub?: string
  today?: boolean
}

export interface AttendancePerson {
  name: string
  /** One letter per day: P present, A absent, H half day, L on leave, O weekly off/holiday, - upcoming. */
  marks: string
}

export interface LeaveStat {
  label: string
  value: string
  delta?: string
  deltaTone?: 'warning' | 'success'
}

export interface LeavePolicy {
  id: string
  leaveType: string
  /** Days earned each month, when the policy accrues monthly. */
  daysPerMonth?: number
  carryForwardCap: number
}

export interface LeaveData {
  period: string
  /** The company's leave policies; the request form picks one. */
  policies?: LeavePolicy[]
  stats: LeaveStat[]
  requests: Decision[]
  balances: LeaveBalance[]
  attendance: {
    days: AttendanceDay[]
    people: AttendancePerson[]
    moreCount?: number
  }
}
