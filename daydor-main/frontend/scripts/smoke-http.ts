// Smoke test against a running API: npm run smoke  (SMOKE_API_URL default http://127.0.0.1:8000/api)
import { readFileSync } from 'node:fs'
import Ajv from 'ajv'
import { ApiError, configure } from '../src/data/http/httpClient.ts'
import { createSources } from '../src/data/sources.ts'

const baseUrl = (process.env.SMOKE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/+$/, '')
configure({ baseUrl, token: null })

type Caps = { capabilities: { screens: Record<string, boolean> } }

async function login(email: string): Promise<string> {
  const res = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ email }),
  })
  if (!res.ok) throw new Error(`login ${email}: HTTP ${res.status} ${await res.text()}`)
  return ((await res.json()) as { token: string }).token
}

/** Every dev person: each screen their session says is open passes the contract, each screen it says is closed answers 403. */
async function roleMatrix(ajv: Ajv, schema: (n: string) => object): Promise<number> {
  const users = ((await (await fetch(`${baseUrl}/auth/dev-users`)).json()) as { users: { email: string; role: string }[] }).users
  const reads: Record<string, [string, (s: ReturnType<typeof createSources>) => Promise<unknown>]> = {
    home: ['HomeData', (s) => s.home.getHome()],
    leave: ['LeaveData', (s) => s.leave.getLeave()],
    hiring: ['HiringData', (s) => s.hiring.getHiring()],
    payroll: ['PayrollData', (s) => s.payroll.getPayroll()],
    compliance: ['ComplianceData', (s) => s.compliance.getCompliance()],
    expenses: ['ExpensesData', (s) => s.expenses.getExpenses()],
    benefits: ['BenefitsData', (s) => s.benefits.getBenefits()],
    people: ['PeopleData', (s) => s.people.getPeople()],
    documents: ['DocumentsData', (s) => s.documents.getDocuments()],
    settings: ['SettingsData', (s) => s.settings.getSettings()],
  }
  let failures = 0
  for (const u of users) {
    if (u.email === 'rohan.mehta@acme.test') continue
    const token = await login(u.email)
    configure({ token })
    const me = (await (await fetch(`${baseUrl}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })).json()) as Caps
    const s = createSources('http')
    for (const [screen, [type, call]] of Object.entries(reads)) {
      const open = me.capabilities.screens[screen] === true
      const label = `${u.role.padEnd(16)} ${screen.padEnd(10)}`
      try {
        const data = await call(s)
        if (!open) {
          failures++
          console.log(`FAIL ${label} the session says closed but the read answered`)
        } else if (ajv.compile(schema(type))(data)) console.log(`PASS ${label} open, matches ${type}`)
        else {
          failures++
          console.log(`FAIL ${label} open, but does not match ${type}: ${JSON.stringify(ajv.compile(schema(type)).errors?.slice(0, 3))}`)
        }
      } catch (e) {
        const ok = e instanceof ApiError && e.status === 403 && (e.code === 'screen_not_available' || (screen === 'hiring' && e.code === 'forbidden'))
        if (!open && ok) console.log(`PASS ${label} closed, 403 ${(e as ApiError).code}`)
        else {
          failures++
          console.log(`FAIL ${label} ${open ? 'open but failed' : 'closed but did not answer 403'}: ${e instanceof Error ? e.message : String(e)}`)
        }
      }
    }
    if (me.capabilities.screens.people) {                    // a colleague's page opens for every role that has the directory
      try {
        const list = await s.people.getPeople()
        const mine = list.people.find((p) => p.id) ?? list.people[0]
        const p = mine ? await s.people.getPerson(mine.id) : null
        if (p && ajv.compile(schema('PersonDetail'))(p)) console.log(`PASS ${u.role.padEnd(16)} person     matches PersonDetail`)
        else {
          failures++
          console.log(`FAIL ${u.role.padEnd(16)} person     ${p ? 'does not match' : 'not found'}`)
        }
      } catch (e) {
        failures++
        console.log(`FAIL ${u.role.padEnd(16)} person     ${e instanceof Error ? e.message : String(e)}`)
      }
    }
  }
  return failures
}

async function main(): Promise<number> {
  const res = await fetch(`${baseUrl}/auth/dev-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() },
    body: JSON.stringify({ email: 'rohan.mehta@acme.test' }),
  })
  if (!res.ok) {
    console.error(`FAIL login: HTTP ${res.status} ${await res.text()}`)
    return 1
  }
  const { token } = (await res.json()) as { token: string }
  configure({ token })

  const s = createSources('http')
  const ajv = new Ajv({ allErrors: true, strict: false })
  const schema = (name: string) => JSON.parse(readFileSync(`contract/schemas/${name}.schema.json`, 'utf8'))

  let people: { people: { id: string }[] } | undefined
  const checks: [string, string, () => Promise<unknown>][] = [
    ['home', 'HomeData', () => s.home.getHome()],
    ['leave', 'LeaveData', () => s.leave.getLeave()],
    ['hiring', 'HiringData', () => s.hiring.getHiring()],
    ['payroll', 'PayrollData', () => s.payroll.getPayroll()],
    ['compliance', 'ComplianceData', () => s.compliance.getCompliance()],
    ['expenses', 'ExpensesData', () => s.expenses.getExpenses()],
    ['benefits', 'BenefitsData', () => s.benefits.getBenefits()],
    ['people', 'PeopleData', async () => (people = await s.people.getPeople())],
    ['documents', 'DocumentsData', () => s.documents.getDocuments()],
    ['settings', 'SettingsData', () => s.settings.getSettings()],
    ['person', 'PersonDetail', async () => {
      const id = people?.people[0]?.id
      if (!id) throw new Error('no people returned to fetch a detail for')
      const p = await s.people.getPerson(id)
      if (!p) throw new Error(`person ${id} returned null (404)`)
      return p
    }],
  ]

  let failures = 0
  for (const [label, type, call] of checks) {
    try {
      const data = await call()
      const validate = ajv.compile(schema(type))
      if (validate(data)) console.log(`PASS ${label} (${type})`)
      else {
        failures++
        console.log(`FAIL ${label} (${type})`)
        for (const e of (validate.errors ?? []).slice(0, 10)) console.log(`     ${e.instancePath || '/'} ${e.message}`)
      }
    } catch (e) {
      failures++
      console.log(`FAIL ${label} (${type}): ${e instanceof Error ? e.message : String(e)}`)
    }
  }
  configure({ token: null })
  console.log('-- every role against its own capabilities')
  failures += await roleMatrix(ajv, schema)
  console.log(failures ? `${failures} FAILED` : 'ALL PASSED')
  return failures ? 1 : 0
}

main().then((c) => process.exit(c), (e) => { console.error(e); process.exit(1) })
