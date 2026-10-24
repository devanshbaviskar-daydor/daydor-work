import { createBrowserRouter } from 'react-router-dom'
import { sources } from '@/data/sources'
import { HomeScreen } from '@/screens/HomeScreen'
import { LeaveScreen } from '@/screens/LeaveScreen'
import { HiringScreen } from '@/screens/HiringScreen'
import { ExpensesScreen } from '@/screens/ExpensesScreen'
import { BenefitsScreen } from '@/screens/BenefitsScreen'
import { ComplianceScreen } from '@/screens/ComplianceScreen'
import { PayrollScreen } from '@/screens/PayrollScreen'
import { DocumentsScreen } from '@/screens/DocumentsScreen'
import { SettingsScreen } from '@/screens/SettingsScreen'
import { PeopleScreen } from '@/screens/PeopleScreen'
import { PersonScreen } from '@/screens/PersonScreen'

const homeSource = sources.home
const hiringSource = sources.hiring
const expensesSource = sources.expenses
const leaveSource = sources.leave
const benefitsSource = sources.benefits
const complianceSource = sources.compliance
const payrollSource = sources.payroll
const documentsSource = sources.documents
const settingsSource = sources.settings
const peopleSource = sources.people

export const router = createBrowserRouter([
  { path: '/', element: <HomeScreen source={homeSource} /> },
  { path: '/leave', element: <LeaveScreen source={leaveSource} /> },
  { path: '/hiring', element: <HiringScreen source={hiringSource} /> },
  { path: '/expenses', element: <ExpensesScreen source={expensesSource} /> },
  { path: '/benefits', element: <BenefitsScreen source={benefitsSource} /> },
  { path: '/compliance', element: <ComplianceScreen source={complianceSource} /> },
  { path: '/payroll', element: <PayrollScreen source={payrollSource} /> },
  { path: '/documents', element: <DocumentsScreen source={documentsSource} /> },
  { path: '/settings', element: <SettingsScreen source={settingsSource} /> },
  { path: '/people', element: <PeopleScreen source={peopleSource} /> },
  { path: '/people/:id', element: <PersonScreen source={peopleSource} /> },
])
