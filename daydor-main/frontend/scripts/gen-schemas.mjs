// Generates contract/schemas/<Type>.schema.json from src/types/*.ts. Objects are closed
// (additionalProperties: false) because ts-json-schema-generator's default is closed.
import { mkdirSync, writeFileSync } from 'node:fs'
import { createGenerator } from 'ts-json-schema-generator'

const TYPES = {
  HomeData: 'home', LeaveData: 'leave', HiringData: 'hiring', RequisitionSummary: 'hiring',
  RequisitionDetail: 'hiring', PayrollData: 'payroll', ComplianceData: 'compliance',
  ExpensesData: 'expenses', BenefitsData: 'benefits', PeopleData: 'people',
  PersonDetail: 'people', DocumentsData: 'documents', SettingsData: 'settings',
}
const noTypeCheck = process.argv.includes('--no-type-check')
mkdirSync('contract/schemas', { recursive: true })
for (const [type, file] of Object.entries(TYPES)) {
  const schema = createGenerator({
    path: `src/types/${file}.ts`,
    tsconfig: 'tsconfig.app.json',
    type,
    expose: 'export',
    topRef: false,
    additionalProperties: false,
    skipTypeCheck: noTypeCheck,
  }).createSchema(type)
  writeFileSync(`contract/schemas/${type}.schema.json`, JSON.stringify(schema, null, 2) + '\n')
  console.log('wrote', type)
}
