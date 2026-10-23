/**
 * P06-L02-U1: deliberately reproduce #71 in the REAL Office v2 materialization function.
 *
 * This exercise uses synthetic *post-parse* results, not a real DOCX/XLSX/PPTX parser
 * or Electron session. Its scope is identity/index materialization only.
 * The observed colliding output is a BLOCKER, not an acceptable product behavior.
 * Running successfully means a security-relevant collision was reproduced.
 */
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { materializeToWorkspace, type ParseDocumentResult } from '../../apps/electron/src/main/lib/document-parse-tools'

type Candidate = Omit<ParseDocumentResult, 'materialized'>
const root = mkdtempSync(join(tmpdir(), 'p06-l02-office-repro-'))
const observations: Array<Record<string, string | boolean>> = []
function digest(content: string): string { return createHash('sha256').update(content).digest('hex') }
function parse(format: string, content: string): Candidate {
  const revision = 'sha256:v2:' + digest(content)
  return { file: { name: 'proof.'+format, size: Buffer.byteLength(content), modifiedAt: '2026-10-18T00:00:00Z', revision },
    format, text: content, cleanText: content, truncated: false, pageCount: 1, outline: [] }
}
function testCase(format: string, mode: 'same-revision' | 'changed-revision'): void {
  const pathRoot = join(root, format+'-'+mode)
  const workspace = join(pathRoot, 'workspace')
  const firstDir = join(pathRoot, 'A'), secondDir = join(pathRoot, 'B')
  for (const p of [workspace, firstDir, secondDir]) mkdirSync(p, { recursive: true })
  const first = join(firstDir,'proof.'+format), second = join(secondDir,'proof.'+format)
  const inputA = format+'-first'
  const inputB = mode==='same-revision' ? inputA : format+'-second'
  writeFileSync(first,inputA); writeFileSync(second,inputB)
  const before = materializeToWorkspace(first,workspace,parse(format,inputA))
  const after = materializeToWorkspace(second,workspace,parse(format,inputB))
  if (!before || !after) throw new Error('materialization failed: '+format+' '+mode)
  const stored = JSON.parse(readFileSync(join(workspace,'.context','artifacts','manifest.json'),'utf-8'))
  const registry = JSON.parse(readFileSync(join(workspace,'.context','artifacts','registry.json'),'utf-8'))
  const collision = before.fileId===after.fileId
  const staleCache = mode==='same-revision' && after.sourcePath===first
  const reassignedId = mode==='changed-revision' && registry[before.fileId]?.sourcePath===second
  observations.push({format,mode,collision,staleCache,reassignedId,
    firstRevision:digest(inputA),secondRevision:digest(inputB),
    manifestTracksB:stored.proof?.sourcePath===second,
    registryTracksB:registry[before.fileId]?.sourcePath===second })
}
try {
  for (const fmt of ['docx','xlsx','pptx']) {
    testCase(fmt,'same-revision')
    testCase(fmt,'changed-revision')
  }
  const collisionDetected=observations.every(o=>o.collision && (o.staleCache || o.reassignedId))
  console.log(JSON.stringify({kind:'P06-L02-U1-OFFICE-POSTPARSE-IDENTITY-REPRO',source:'actual materializeToWorkspace; synthetic post-parse payloads',issue:71,collisionDetected,rows:observations},null,2))
  if (!collisionDetected) { console.error('Collision not reproduced; investigate new behavior; do not claim PASS'); process.exitCode=2 }
} catch (error) {
  console.error(error)
  process.exitCode=1
} finally {
  if (existsSync(root)) rmSync(root,{recursive:true,force:true})
}
