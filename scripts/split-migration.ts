/**
 * Splits migration.sql into numbered chunks for the Supabase SQL Editor.
 */
import * as fs from 'fs'
import * as path from 'path'

const INPUT = path.resolve(process.cwd(), 'migration.sql')
const CHUNK_SIZE = 15

const raw = fs.readFileSync(INPUT, 'utf8')

// Extract the header (everything up to VALUES) and the rows
const valuesIdx = raw.indexOf('\nVALUES\n')
const header = raw.slice(0, valuesIdx + '\nVALUES\n'.length)
const onConflict = '\nON CONFLICT (slug) DO NOTHING;'

// Extract just the rows block (between VALUES and ON CONFLICT)
const rowsBlock = raw.slice(valuesIdx + '\nVALUES\n'.length, raw.indexOf(onConflict))

// Split on row boundaries: each row starts with '  ('
const rows = rowsBlock.split(/\n(?=  \()/)

console.log(`Total rows: ${rows.length}`)

const chunks = Math.ceil(rows.length / CHUNK_SIZE)
for (let i = 0; i < chunks; i++) {
  const batch = rows.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE)
  const num = String(i + 1).padStart(2, '0')
  const filename = path.resolve(process.cwd(), `migration-part-${num}.sql`)
  const content = header + batch.join(',\n').replace(/,\n$/, '\n') + onConflict + '\n'
  fs.writeFileSync(filename, content)
  const kb = (fs.statSync(filename).size / 1024).toFixed(0)
  console.log(`  migration-part-${num}.sql — ${batch.length} rows (${kb} KB)`)
}
console.log(`\nDone. Run each file in Supabase SQL Editor in order.`)
