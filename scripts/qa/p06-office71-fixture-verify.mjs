// Verify the synthetic OOXML files before launching the app; this is not the parser acceptance itself.
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import JSZip from 'jszip'
import XLSX from 'xlsx'

const raw = resolve(process.env.P06_OFFICE71_RAW_ROOT ?? '')
const root = resolve(process.env.P06_OFFICE71_MATERIAL_ROOT ?? '')
if (!raw.split(/[\\/]/).at(-1)?.startsWith('p06-office71-local-r02-') || root !== join(raw, 'materials')) {
  throw new Error('只允许验证本轮 Office71 R02 合成材料')
}
const sha = bytes => createHash('sha256').update(bytes).digest('hex')
mkdirSync(join(raw, 'office71'), { recursive: true })
const rows = []
for (const label of ['A', 'B']) for (const ext of ['docx', 'xlsx', 'pptx']) {
  const path = join(root, label, `proof.${ext}`)
  const bytes = readFileSync(path)
  const zip = await JSZip.loadAsync(bytes, { checkCRC32: true })
  const members = Object.keys(zip.files)
  let validation
  if (ext === 'docx') {
    const xml = await zip.file('word/document.xml')?.async('string')
    assert.ok(xml)
    assert.ok((xml.match(/<w:p>/g) ?? []).length >= 2)
    assert.ok(xml.includes('<w:tbl>'))
    assert.ok(xml.includes(`P06_U1_SYNTHETIC_${label}`))
    validation = { paragraphs: (xml.match(/<w:p>/g) ?? []).length, tables: (xml.match(/<w:tbl>/g) ?? []).length }
  } else if (ext === 'xlsx') {
    const workbook = XLSX.read(bytes, { type: 'buffer' })
    assert.deepEqual(workbook.SheetNames, ['Budget', 'Details'])
    const sheets = workbook.SheetNames.map(name => {
      const values = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 })
      assert.ok(values.length >= 3)
      return { name, rows: values.length, columns: Math.max(...values.map(row => row.length)) }
    })
    assert.ok(sheets.some(sheet => XLSX.utils.sheet_to_csv(workbook.Sheets[sheet.name]).includes(`P06_U1_SYNTHETIC_${label}`)))
    validation = { sheets }
  } else {
    const slides = members.filter(name => /^ppt\/slides\/slide\d+\.xml$/.test(name)).sort()
    assert.ok(slides.length >= 2)
    const text = (await Promise.all(slides.map(name => zip.file(name).async('string')))).join('\n')
    assert.ok(text.includes(`P06_U1_SYNTHETIC_${label}`))
    validation = { slideCount: slides.length, slidePaths: slides }
  }
  rows.push({ input: relative(raw, path).split('\\').join('/'), format: ext, source: label,
    bytes: bytes.length, sha256: sha(bytes), zipMembers: members.length, validation })
}
for (const ext of ['docx', 'xlsx', 'pptx']) {
  const a = readFileSync(join(root, 'A', `proof.${ext}`))
  const same = readFileSync(join(root, 'same', `proof.${ext}`))
  assert.equal(sha(a), sha(same), `${ext} same-byte copy differs`)
}
for (const name of ['readable.pdf', 'blank.pdf', 'corrupt.pdf']) {
  const bytes = readFileSync(join(root, name))
  assert.ok(bytes.subarray(0, 5).equals(Buffer.from('%PDF-')))
}
const report = { status: 'PASS', sourceSha: process.env.QA_APPLICATION_SHA, rows, sameByteCopies: 3,
  pdfControls: ['readable.pdf', 'blank.pdf', 'corrupt.pdf'] }
writeFileSync(join(raw, 'office71', 'fixture-verification.json'), JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ status: report.status, officeRows: rows.length, sameByteCopies: report.sameByteCopies,
  hashes: rows.map(row => ({ input: row.input, bytes: row.bytes, sha256: row.sha256 })) }))
