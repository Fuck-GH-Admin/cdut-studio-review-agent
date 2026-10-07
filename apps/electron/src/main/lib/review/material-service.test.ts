import { afterAll, describe, expect, test } from 'bun:test'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'
import type { Actor, TemplateVersion } from '@profer/shared'
import { createCaseFromTemplate } from './application-service'
import { readAggregate } from './case-store-v2'
import { registerMaterial } from './material-service'
import { publishTemplate, saveDraft } from './template-store'

const CONFIG_DIR = mkdtempSync(join(tmpdir(), 'cdut-material-version-'))
const SOURCE_DIR = join(CONFIG_DIR, 'sources')
process.env.PROFER_CONFIG_DIR = CONFIG_DIR
mkdirSync(SOURCE_DIR, { recursive: true })
afterAll(() => rmSync(CONFIG_DIR, { recursive: true, force: true }))

const actor: Actor = { actorId: 'version-chain-reviewer', actorSource: 'local', role: 'reviewer' }
const template: TemplateVersion = {
  templateId: 'material-version-chain', version: 1, schemaVersion: 2, name: '材料版本测试', objectType: 'person',
  displayName: { template: '{{applicant}}' }, fields: [], materialSlots: [], policyVersionIds: [], policyRefs: [],
  stages: [{ id: 'review', name: '审核', kind: 'manual-review', executorRole: 'reviewer' }], outputs: [],
  status: 'draft', createdAt: new Date().toISOString(),
}

describe('材料版本链', () => {
  test('同名材料再次登记时，新版本指向上一版本并停用旧版本', async () => {
    saveDraft(template)
    publishTemplate(template.templateId, template.version)
    const caseId = `material-version-${Date.now()}`
    expect((await createCaseFromTemplate(template.templateId, 1, { title: '材料版本链', fieldValues: {}, subjects: [] }, actor, caseId)).ok).toBeTrue()
    const firstPath = join(SOURCE_DIR, '证明材料.txt')
    const replacementPath = join(SOURCE_DIR, 'replacement')
    mkdirSync(replacementPath, { recursive: true })
    const secondPath = join(replacementPath, '证明材料.txt')
    writeFileSync(firstPath, '第一版证明内容')
    writeFileSync(secondPath, '第二版证明内容')

    let aggregate = readAggregate(caseId)!
    const first = await registerMaterial(caseId, { requestId: 'version-1', actor, expectedRevision: aggregate.caseV2.revision, payload: { sourcePath: firstPath, role: 'evidence', materialSlotId: 'certificates' } })
    expect(first.ok).toBeTrue()
    aggregate = readAggregate(caseId)!
    const firstVersion = aggregate.caseV2.documents[0]!.versionId
    const second = await registerMaterial(caseId, { requestId: 'version-2', actor, expectedRevision: aggregate.caseV2.revision, payload: { sourcePath: secondPath, role: 'evidence', materialSlotId: 'certificates' } })

    expect(second.ok).toBeTrue()
    const versions = readAggregate(caseId)!.caseV2.documents
    expect(versions).toHaveLength(2)
    expect(versions[0]?.active).toBeFalse()
    expect(versions[1]?.supersedesVersionId).toBe(firstVersion)
    expect(versions[1]?.active).toBeTrue()
  })

  test('XLSX 登记后保留可引用的工作表和单元格定位', async () => {
    const caseId = `material-xlsx-${Date.now()}`
    saveDraft({ ...template, templateId: 'material-xlsx-review' })
    publishTemplate('material-xlsx-review', 1)
    expect((await createCaseFromTemplate('material-xlsx-review', 1, { title: 'Excel 结构解析', fieldValues: {}, subjects: [] }, actor, caseId)).ok).toBeTrue()

    const zip = new JSZip()
    zip.file('xl/workbook.xml', '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="申报项目" sheetId="1" r:id="rId1"/></sheets></workbook>')
    zip.file('xl/_rels/workbook.xml.rels', '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Target="worksheets/sheet1.xml"/></Relationships>')
    zip.file('xl/worksheets/sheet1.xml', '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="4"><c r="C4" t="inlineStr"><is><t>创新创业项目</t></is></c></row></sheetData></worksheet>')
    const sourcePath = join(SOURCE_DIR, '项目申报.xlsx')
    writeFileSync(sourcePath, await zip.generateAsync({ type: 'nodebuffer' }))

    const aggregate = readAggregate(caseId)!
    const result = await registerMaterial(caseId, { requestId: 'xlsx-structure', actor, expectedRevision: aggregate.caseV2.revision, payload: { sourcePath, role: 'application' } })

    expect(result.ok).toBeTrue()
    const document = readAggregate(caseId)!.caseV2.documents[0]!
    expect(document.parseStatus).toBe('parsed')
    expect(document.blocks).toHaveLength(1)
    expect(document.blocks[0]).toMatchObject({
      text: '创新创业项目', kind: 'table', format: 'table-cell',
      location: { kind: 'sheet-cell', sheet: '申报项目', row: 4, column: 'C' },
    })
  })
})
