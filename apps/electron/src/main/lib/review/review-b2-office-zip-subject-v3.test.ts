/**
 * B2 synthetic but REAL OOXML byte-input regression.
 * Exercises production Office parsers through ZIP -> staging -> parser registry
 * -> user-confirmed input ledger; never invokes CurrentCase ApplyMaterial.
 */
import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import JSZip from 'jszip'
import * as XLSX from 'xlsx'
import { ReviewB2StagingService, type B2MainContext } from './review-intake-adapter-v3-b2'
import { ReviewB2ArchiveVault } from './review-import-checkpoint-v3-b2'
import { ReviewB2InputLedger } from './review-import-ledger-v3-b2'
import { proposeB2MaterialCandidates } from './review-import-handoff-v3-b2'
import { ReviewB2SourceVersionAdapter } from './review-source-version-adapter-v3-b2'

const work=mkdtempSync(join(tmpdir(),'b2-real-ooxml-zip-'))
afterAll(()=>rmSync(work,{recursive:true,force:true}))
const ctx:B2MainContext={
  senderId:7,frameId:2,ownerId:'owner-office',ownerGeneration:1,caseCandidateId:'office-case',
}
async function makeDocx(message:string):Promise<Buffer>{
  const z=new JSZip()
  z.file('[Content_Types].xml',
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>' +
    '<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>' +
    '</Types>')
  z.file('_rels/.rels',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>' +
    '</Relationships>')
  const body='<w:p><w:r><w:t>'+message+'</w:t></w:r></w:p>' +
    '<w:tbl><w:tr><w:tc><w:p><w:r><w:t>Applicant</w:t></w:r></w:p></w:tc>' +
    '<w:tc><w:p><w:r><w:t>School</w:t></w:r></w:p></w:tc></w:tr></w:tbl>'
  z.file('word/document.xml',
    '<?xml version="1.0" encoding="UTF-8"?>' +
    '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:body>'+body+'</w:body></w:document>')
  z.file('word/_rels/document.xml.rels',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>' +
    '</Relationships>')
  z.file('word/styles.xml',
    '<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">' +
    '<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/></w:style>' +
    '</w:styles>')
  return z.generateAsync({type:'nodebuffer'})
}
function makeXlsx():Buffer{
  const book=XLSX.utils.book_new()
  const first=XLSX.utils.aoa_to_sheet([['Subject','Student'],['B','00123']])
  const second=XLSX.utils.aoa_to_sheet([['Award','Score'],['Science','85']])
  XLSX.utils.book_append_sheet(book,first,'Students')
  XLSX.utils.book_append_sheet(book,second,'Awards')
  return XLSX.write(book,{type:'buffer',bookType:'xlsx'}) as Buffer
}
describe('B2 real OOXML ZIP + per-Subject identity, candidate-only',()=>{
  test('mixed DOCX/XLSX are parsed from physical bytes with independent Subject-confirmed receipts',async()=>{
    const archiveZip=new JSZip()
    archiveZip.file('sub-A/proposal.docx',await makeDocx('Original physical application'),{createFolders:false})
    archiveZip.file('sub-B/results.xlsx',makeXlsx(),{createFolders:false})
    archiveZip.file('sub-C/scan.png',Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg==','base64',
    ),{createFolders:false})
    const original=await archiveZip.generateAsync({type:'nodebuffer',compression:'DEFLATE'})
    const staging=new ReviewB2StagingService()
    const vault=new ReviewB2ArchiveVault(staging,join(work,'archive'))
    const ledger=new ReviewB2InputLedger(vault,staging,join(work,'ledger'))
    const parser=new ReviewB2SourceVersionAdapter(staging)
    const saved=vault.saveAndStage(ctx,{
      physicalArchiveKey:'main-picked-multiformat-1',requestId:'ooxml-office-1',bytes:original,
    })
    expect(saved.checkpoint.fileReceipts).toHaveLength(3)
    expect(saved.preview.candidates).toHaveLength(3)
    expect(saved.preview.receipts.every(r=>r.status==='needs-user-confirmation')).toBe(true)
    expect(()=>proposeB2MaterialCandidates(ctx,vault,staging,ledger,saved.checkpoint.archiveId))
      .toThrow() // input ledger does not exist until explicitly begun
    const docx=saved.preview.candidates.find(c=>c.fileName==='proposal.docx')!
    const xlsx=saved.preview.candidates.find(c=>c.fileName==='results.xlsx')!
    const image=saved.preview.candidates.find(c=>c.fileName==='scan.png')!
    expect(docx).toBeDefined()
    expect(xlsx).toBeDefined()
    expect(image).toBeDefined()
    expect(docx.subjectId).toBeNull()
    expect(xlsx.subjectId).toBeNull()
    const doc=await parser.parse(ctx,docx)
    const sheet=await parser.parse(ctx,xlsx)
    const photo=await parser.parse(ctx,image)
    expect(photo.status).toBe('partial')
    expect(photo.blocks).toHaveLength(1)
    expect(photo.blocks[0]!.precision).toBe('file')
    expect(photo.blocks[0]!.uncertainty).toContain('visual inspection')
    expect(doc.blocks.some(b=>b.text.includes('Original physical application'))).toBe(true)
    expect(doc.blocks.some(b=>b.kind==='table-cell' && b.precision==='document-block')).toBe(true)
    expect(sheet.blocks.some(b=>b.text.includes('00123'))).toBe(true)
    const coords=sheet.blocks.filter(b=>b.precision==='sheet-cell')
      .map(b=>JSON.parse(b.location.locator) as {sheet:string;row:number;column:number})
    expect(coords.some(c=>c.sheet==='Students' && c.row===2 && c.column===2)).toBe(true)
    expect(coords.some(c=>c.sheet==='Awards' && c.row===2 && c.column===2)).toBe(true)
    const initial=ledger.getOrCreate(ctx,saved.checkpoint.archiveId)
    const docxEntry=initial.files.find(f=>f.entryName==='sub-A/proposal.docx')!
    const xlsxEntry=initial.files.find(f=>f.entryName==='sub-B/results.xlsx')!
    const pendingImage=initial.files.find(f=>f.entryName==='sub-C/scan.png')!
    expect(pendingImage.status).toBe('needs-user-confirmation')
    expect(docxEntry.status).toBe('needs-user-confirmation')
    const authority={principalId:'trusted-input-owner',authorize:()=>true}
    ledger.decide(ctx,saved.checkpoint.archiveId,0,'confirm-docx',{
      entryIndex:docxEntry.index,status:'accepted',rawSha256:docxEntry.rawSha256!,
      role:'application',subjectId:'subject-A',
    },authority)
    ledger.decide(ctx,saved.checkpoint.archiveId,1,'confirm-xlsx',{
      entryIndex:xlsxEntry.index,status:'accepted',rawSha256:xlsxEntry.rawSha256!,
      role:'supporting',subjectId:'subject-B',
    },authority)
    const proposals=proposeB2MaterialCandidates(ctx,vault,staging,ledger,saved.checkpoint.archiveId)
    expect(proposals).toHaveLength(2)
    expect(proposals.some(p=>p.entryName==='sub-C/scan.png')).toBe(false)
    expect(proposals.map(p=>[p.entryName,p.subjectId,p.role])).toEqual([
      ['sub-A/proposal.docx','subject-A','application'],
      ['sub-B/results.xlsx','subject-B','supporting'],
    ])
    expect(proposals.every(p=>p.candidateKind==='input-only-unapplied')).toBe(true)
    expect(proposals.every(p=>!('caseId' in p)&&!('sourceIdentity' in p))).toBe(true)
    const source=parser.sourceForBlock(ctx,docx.candidateId,doc.parseRevision,doc.blocks[0]!.blockId)
    expect(source.rawSha256).toBe(docx.rawSha256)
    expect(source.documentVersionId).toBe(docx.documentVersionId)
    expect(()=>parser.sourceForBlock(ctx,xlsx.candidateId,sheet.parseRevision,doc.blocks[0]!.blockId))
      .toThrow('B2_SOURCE_BLOCK_UNVERIFIED')
    expect(()=>parser.sourceForBlock({...ctx,caseCandidateId:'different-case'},
      docx.candidateId,doc.parseRevision,doc.blocks[0]!.blockId)).toThrow('B2_SOURCE_STALE')

    // Same native path + filename with changed actual Office bytes is a NEW version.
    const next=staging.stage(ctx,staging.grant(ctx).token,{
      requestId:'updated-docx-2',fileName:docx.fileName,
      physicalSourceKey:docx.physicalSourceKey,bytes:await makeDocx('Modified real application'),
      role:'supporting',subjectId:'subject-A',
    })
    expect(next.documentVersionId).not.toBe(docx.documentVersionId)
    const updated=await parser.parse(ctx,next)
    expect(updated.blocks.some(b=>b.text.includes('Modified real application'))).toBe(true)
    expect(()=>parser.sourceForBlock(ctx,next.candidateId,updated.parseRevision,doc.blocks[0]!.blockId))
      .toThrow('B2_SOURCE_BLOCK_UNVERIFIED')
    staging.revoke(ctx)
    expect(()=>parser.sourceForBlock(ctx,docx.candidateId,doc.parseRevision,doc.blocks[0]!.blockId))
      .toThrow('B2_OWNER_INVALID_OR_REVOKED')
  },45_000)
})
