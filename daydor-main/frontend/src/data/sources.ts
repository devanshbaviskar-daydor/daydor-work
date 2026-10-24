import { MockBenefitsSource } from '@/data/mockBenefitsSource'
import { MockComplianceSource } from '@/data/mockComplianceSource'
import { MockDocumentsSource } from '@/data/mockDocumentsSource'
import { MockExpensesSource } from '@/data/mockExpensesSource'
import { MockHiringSource } from '@/data/mockHiringSource'
import { MockHomeSource } from '@/data/mockHomeSource'
import { MockLeaveSource } from '@/data/mockLeaveSource'
import { MockPayrollSource } from '@/data/mockPayrollSource'
import { MockPeopleSource } from '@/data/mockPeopleSource'
import { MockSettingsSource } from '@/data/mockSettingsSource'
import { HttpBenefitsSource } from '@/data/http/httpBenefitsSource'
import { HttpComplianceSource } from '@/data/http/httpComplianceSource'
import { HttpDocumentsSource } from '@/data/http/httpDocumentsSource'
import { HttpExpensesSource } from '@/data/http/httpExpensesSource'
import { HttpHiringSource } from '@/data/http/httpHiringSource'
import { HttpHomeSource } from '@/data/http/httpHomeSource'
import { HttpLeaveSource } from '@/data/http/httpLeaveSource'
import { HttpPayrollSource } from '@/data/http/httpPayrollSource'
import { HttpPeopleSource } from '@/data/http/httpPeopleSource'
import { HttpSettingsSource } from '@/data/http/httpSettingsSource'
import type { BenefitsSource } from '@/data/benefitsSource'
import type { ComplianceSource } from '@/data/complianceSource'
import type { DocumentsSource } from '@/data/documentsSource'
import type { ExpensesSource } from '@/data/expensesSource'
import type { HiringSource } from '@/data/hiringSource'
import type { HomeSource } from '@/data/homeSource'
import type { LeaveSource } from '@/data/leaveSource'
import type { PayrollSource } from '@/data/payrollSource'
import type { PeopleSource } from '@/data/peopleSource'
import type { SettingsSource } from '@/data/settingsSource'

export type DataSourceKind = 'mock' | 'http'

export interface Sources {
  home: HomeSource
  leave: LeaveSource
  hiring: HiringSource
  payroll: PayrollSource
  compliance: ComplianceSource
  expenses: ExpensesSource
  benefits: BenefitsSource
  people: PeopleSource
  documents: DocumentsSource
  settings: SettingsSource
}

/** Reads VITE_DATA_SOURCE ('mock' default | 'http'). Undefined under Node, so the smoke script passes a kind. */
export function defaultKind(): DataSourceKind {
  const v = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.VITE_DATA_SOURCE
  return v === 'http' ? 'http' : 'mock'
}

export function createSources(kind: DataSourceKind = defaultKind()): Sources {
  if (kind === 'http') {
    return {
      home: new HttpHomeSource(),
      leave: new HttpLeaveSource(),
      hiring: new HttpHiringSource(),
      payroll: new HttpPayrollSource(),
      compliance: new HttpComplianceSource(),
      expenses: new HttpExpensesSource(),
      benefits: new HttpBenefitsSource(),
      people: new HttpPeopleSource(),
      documents: new HttpDocumentsSource(),
      settings: new HttpSettingsSource(),
    }
  }
  return {
    home: new MockHomeSource(),
    leave: new MockLeaveSource(),
    hiring: new MockHiringSource(),
    payroll: new MockPayrollSource(),
    compliance: new MockComplianceSource(),
    expenses: new MockExpensesSource(),
    benefits: new MockBenefitsSource(),
    people: new MockPeopleSource(),
    documents: new MockDocumentsSource(),
    settings: new MockSettingsSource(),
  }
}

export const sources: Sources = createSources()
