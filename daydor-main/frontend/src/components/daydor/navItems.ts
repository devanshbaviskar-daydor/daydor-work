import type { NavItem } from '@/components/daydor/Sidebar'

/** A destination and the screen key the signed-in role must have for it (`GET /api/auth/me` capabilities.screens). */
export type ScreenNavItem = NavItem & { screen: string }

/**
 * Main Sidebar destinations per design-system/components/Sidebar/README.md.
 * All ten destinations have an `href` here, routed to their own screens.
 */
export function mainNavItems(opts: { needsYouCount?: number; peopleCount?: number } = {}): ScreenNavItem[] {
  return [
    { key: 'home', screen: 'home', label: 'Home', icon: 'home', href: '/', count: opts.needsYouCount || undefined, countTone: 'warning' },
    { key: 'people', screen: 'people', label: 'People', icon: 'users', href: '/people', count: opts.peopleCount },
    { key: 'hiring', screen: 'hiring', label: 'Hiring', icon: 'briefcase', href: '/hiring' },
    { key: 'leave', screen: 'leave', label: 'Leave & attendance', icon: 'calendar', href: '/leave' },
    { key: 'payroll', screen: 'payroll', label: 'Payroll', icon: 'rupee', href: '/payroll' },
    { key: 'expenses', screen: 'expenses', label: 'Expenses', icon: 'receipt', href: '/expenses' },
    { key: 'compliance', screen: 'compliance', label: 'Compliance', icon: 'landmark', href: '/compliance' },
    { key: 'docs', screen: 'documents', label: 'Documents', icon: 'folder', href: '/documents' },
    { key: 'benefits', screen: 'benefits', label: 'Benefits', icon: 'heart', href: '/benefits' },
    { key: 'settings', screen: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
  ]
}
