import { afterAll, describe, expect, test } from 'bun:test'
import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import type { Actor, CaseAggregateV2, D2ScenarioSelection, ReviewAuthoringWorkspaceV1, ReviewCaseV2 } from '@profer/shared'
import { validateReviewAuthoringV1 } from './review-authoring-v1'
import { compileD2RuntimePlan, createD2TechnicalCase, makeD2CandidateShell, verifyD2PiRun } from './review-d2-runtime'
import { exportD3Bundle, importD3Bundle } from './review-d3-module-library'
import { validateD2GuardSubmission } from './review-d2-execution-gates'
import { saveAuthoringCandidateDraft } from './template-store'
import { readAggregate } from './case-store-v2'
import { registerMaterial } from './material-service'
import { setEvidenceLink } from './application-service'
import { preparePiReviewRunV2, submitPiReviewResultV2 } from './pi-case-review-service'
import { getRunV2 } from './run-store-v2'

const home = mkdtempSync(join(tmpdir(), 'd4-g02-runtime-'))
process.env.PROFER_CONFIG_DIR = home
afterAll(() => rmSync(home, { recursive: true, force: true }))
const actor: Actor = { actorId: 'd4-g02-synthetic-reviewer', actorSource: 'local', role: 'reviewer' }
const base = resolve(import.meta.dir, '../../../../../../docs/design/review-agent/acceptance/d4-g02-build')
const spec = [
  { id: 'T01', rules: 32, kind: 'g02-data-item' },
  { id: 'T02', rules: 32, kind: 'g02-mailbox-action' },
  { id: 'T03', rules: 36, kind: 'g02-network-access' },
] as const
const load = <T>(s: string, name: string): T => JSON.parse(readFileSync(join(base, s, name), 'utf8')) as T
const rcase = (s: string): ReviewCaseV2 => load<ReviewCaseV2>(s, 'case.json')
const wspace = (s: string): ReviewAuthoringWorkspaceV1 => load<ReviewAuthoringWorkspaceV1>(s, 'workspace.json')
const select = (s: string): D2ScenarioSelection => load<D2ScenarioSelection>(s, 'selection.json')
const evidenceDir = process.env.D4_G02_EVIDENCE_DIR
const record = (name: string, value: unknown) => {
  if (!evidenceDir) return
  mkdirSync(evidenceDir, { recursive: true })
  writeFileSync(join(evidenceDir, name), JSON.stringify(value, null, 2) + '\n')
}

describe('D4 G02 full-business-MD modular candidates — synthetic technical execution only', () => {
  for (const s of spec) {
    test(s.id + ': D1 source bindings, original coverage and D3 transfer round trip', () => {
      const w = wspace(s.id)
      const ledger = load<Array<{id:string;type:string;checkId?:string;coveringCheckIds?:string[]}>>(s.id, 'coverage-ledger.json')
      expect(validateReviewAuthoringV1(w)).toEqual([])
      expect(w.definitions.templates).toHaveLength(1)
      expect(w.definitions.modules.length).toBeGreaterThan(4)
      const ids = new Set(ledger.filter(e => e.type === 'rule').map(e => e.id))
      expect(ids.size).toBe(s.rules)
      for (let n = 1; n <= s.rules; n++) expect(ids.has('R-' + String(n).padStart(2,'0'))).toBeTrue()
      expect(ledger.some(e => e.type === 'F')).toBeTrue()
      expect(ledger.some(e => e.type === 'M')).toBeTrue()
      expect(ledger.some(e => e.type === 'BR')).toBeTrue()
      expect(ledger.some(e => e.type === 'ST')).toBeTrue()
      expect(ledger.some(e => e.type === 'EV')).toBeTrue()
      for (const entry of ledger.filter(e => e.type === 'rule')) {
        expect(w.sourceBindings.some(b => b.checkId === entry.checkId)).toBeTrue()
      }
      const bundle = exportD3Bundle(w)
      const imported = importD3Bundle(bundle)
      expect(imported).toEqual(w)
      expect(exportD3Bundle(imported).fingerprint).toBe(bundle.fingerprint)
      record(s.id+'-d3-transfer.json', {bundleFingerprint:bundle.fingerprint,moduleLocks:imported.sharedModuleLocks,workspaceId:w.workspaceId})
    })

    test(s.id + ': actual generic-object D2 Plan compiles with per-object Check/SourceRef and tri-state', () => {
      const w=wspace(s.id), sel=select(s.id), plan=compileD2RuntimePlan(w,sel,rcase(s.id))
      expect(plan.schemaVersion).toBe(3)
      expect(plan.publicationAllowed).toBeFalse()
      expect(plan.subjects).toHaveLength(2)
      expect(plan.mapping.length).toBeGreaterThan(s.rules*2)
      expect(new Set(plan.rules.map(r=>r.id)).size).toBe(plan.rules.length)
      expect(plan.mapping.every(m=>m.sourceIds.length>0)).toBeTrue()
      expect(plan.mapping.filter(m=>m.subjectId===sel.targets[0]!.subjectId).length).toBeGreaterThan(s.rules)
      expect(plan.mapping.filter(m=>m.subjectId===sel.targets[1]!.subjectId).length).toBeGreaterThan(s.rules)
      expect(plan.mapping.some(m=>m.subjectId===sel.targets[1]!.subjectId&&m.applicability==='unknown')).toBeTrue()
      expect(plan.mapping.every(m=>m.objectKey ? !!m.subjectId && m.sourceIds.length>0 : !!m.sourceIds.length)).toBeTrue()
      expect(plan.fingerprint).toHaveLength(64)
      record(s.id+'-d2-plan.json',plan)
      console.log('[D4_G02_PLAN]',JSON.stringify({id:s.id,fingerprint:plan.fingerprint,checks:plan.mapping.length,subjects:plan.subjects.length,release:'technical-only'}))
    })

    test(s.id + ': cannot silently reuse another Subject, select unknown as false or use stale source', () => {
      const w=wspace(s.id), sel=select(s.id), c=rcase(s.id)
      const ok=compileD2RuntimePlan(w,sel,c)
      const duplicated=structuredClone(sel)
      duplicated.targets[1]!.subjectId=duplicated.targets[0]!.subjectId
      expect(()=>compileD2RuntimePlan(w,duplicated,c)).toThrow('D2_TARGET_INVALID')
      const stale=structuredClone(sel)
      stale.targets[0]!.conditions![0]!.sourceVersionId='stale-source-v0'
      expect(()=>compileD2RuntimePlan(w,stale,c)).toThrow('D2_GENERIC_CONDITION_SOURCE_INVALID')
      const omit=structuredClone(sel)
      omit.targets[0]!.conditions!.pop()
      expect(()=>compileD2RuntimePlan(w,omit,c)).toThrow('D2_GENERIC_CONDITIONS_INCOMPLETE')
      const changed=structuredClone(sel)
      changed.targets[1]!.conditions![1]!.applicability='applicable'
      changed.targets[1]!.conditions![1]!.decidedBy='reviewer'
      expect(compileD2RuntimePlan(w,changed,c).fingerprint).not.toBe(ok.fingerprint)
      const unknown=ok.mapping.find(m=>m.subjectId===sel.targets[1]!.subjectId&&m.applicability==='unknown')!
      const fake={caseV2:{...c,documents:[]},d2RuntimePlan:ok,observations:[],evidenceLinks:[]} as unknown as CaseAggregateV2
      expect(validateD2GuardSubmission(fake,unknown,'compliant',[])).toContain('APPLICABILITY_UNKNOWN')
      expect(validateD2GuardSubmission(fake,unknown,'awaiting-confirmation',[])).toBeUndefined()
      const relevant=ok.mapping.find(m=>m.subjectId===sel.targets[0]!.subjectId&&m.applicability==='applicable')!
      expect(validateD2GuardSubmission(fake,relevant,'compliant',[])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
    })

    test(s.id + ': real candidate create + material registration + reviewer EvidenceLink + Pi receipt', async () => {
      const w=wspace(s.id),sel=select(s.id),c=rcase(s.id)
      saveAuthoringCandidateDraft(makeD2CandidateShell(w,c.templateId,c.templateVersion))
      const created=await createD2TechnicalCase({caseId:c.id,title:c.title,actor,workspace:w,selection:sel})
      expect(created.ok).toBeTrue()
      if(!created.ok) throw Error(created.message)
      const dir=join(home,s.id+'-material');mkdirSync(dir,{recursive:true})
      const input=join(dir,'synthetic.txt')
      writeFileSync(input,'SYNTHETIC REVIEW MATERIAL ONLY. This document is for subject A; subject B has not been evidenced.')
      const before=readAggregate(c.id)!
      const registered=await registerMaterial(c.id,{requestId:s.id+'-register',actor,expectedRevision:before.caseV2.revision,payload:{sourcePath:input,role:'evidence'}})
      expect(registered.ok).toBeTrue()
      if(!registered.ok) throw Error(registered.message)
      const docVersion=readAggregate(c.id)!.caseV2.documents[0]!.versionId
      const A=created.entity!.mapping.find(m=>m.subjectId===sel.targets[0]!.subjectId&&m.applicability==='applicable'&&m.evidenceCoverage?.supportsFacts.length)!
      const B=created.entity!.mapping.find(m=>m.subjectId===sel.targets[1]!.subjectId&&m.applicability==='applicable'&&m.evidenceCoverage?.supportsFacts.length)!
      const newer=readAggregate(c.id)!
      const linked=await setEvidenceLink(c.id,{requestId:s.id+'-edge',actor,expectedRevision:newer.caseV2.revision,payload:{
        documentVersionId:docVersion,subjectIds:[A.subjectId!],supportsFact:A.evidenceCoverage!.supportsFacts[0]!,linkedBy:'user',
      }})
      expect(linked.ok).toBeTrue()
      if(!linked.ok)throw Error(linked.message)
      const aggregate=readAggregate(c.id)!
      expect(validateD2GuardSubmission(aggregate,A,'compliant',[docVersion])).toBeUndefined()
      expect(validateD2GuardSubmission(aggregate,B,'compliant',[docVersion])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
      expect(validateD2GuardSubmission(aggregate,A,'compliant',['retired-document-version'])).toContain('D2_GENERIC_EVIDENCE_SCOPE_MISSING')
      const prepared=preparePiReviewRunV2({caseId:c.id,sessionId:s.id+'-synthetic-session',turnId:s.id+'-synthetic-turn'})
      const receipt=submitPiReviewResultV2({binding:{assignmentId:prepared.assignmentId,sessionId:s.id+'-synthetic-session',caseId:c.id,runId:prepared.runId},
        triggeredBy:'user',result:{summary:'G02 synthetic pre-review: candidate checks remain subject to source/authority verification',
        checks:created.entity!.mapping.map(m=>({ruleId:m.ruleId,subjectIds:m.subjectId?[m.subjectId]:[],status:'awaiting-confirmation' as const,
          reason:'Source applicability and official approval require an authorized reviewer',sourceRefs:[]})),finish:true}})
      expect(receipt.rejected).toEqual([])
      expect(receipt.missingChecks).toEqual([])
      const updated=readAggregate(c.id)!,run=getRunV2(c.id,prepared.runId)!
      expect(verifyD2PiRun(updated,run)).toMatchObject({complete:true,problems:[]})
      record(s.id+'-pi-receipt.json',{caseId:c.id,runId:run.id,fingerprint:created.entity!.fingerprint,subjects:updated.caseV2.subjects.map(sub=>sub.id),
        checks:run.checks.length,documentVersionId:docVersion,evidenceLinks:updated.evidenceLinks,
        objectAConfirmed:true,objectBInheritsEvidence:false,verified:verifyD2PiRun(updated,run),publicationAllowed:false})
      console.log('[D4_G02_PI]',JSON.stringify({id:s.id,caseId:c.id,runId:run.id,checks:run.checks.length,verified:true,technicalOnly:true}))
    })
  }

  test('D1/D3/D2 CLI path for every G02 authoring candidate', () => {
    const scripts=resolve(import.meta.dir,'../../../../scripts')
    const env={...process.env,PROFER_CONFIG_DIR:join(home,'cli-config')}
    mkdirSync(env.PROFER_CONFIG_DIR,{recursive:true})
    const run=(script:string,args:string[])=>{
      const result=Bun.spawnSync({cmd:[process.execPath,join(scripts,script),...args],env})
      if(result.exitCode!==0)throw Error(script+' '+args[0]+' exit='+result.exitCode+' '+result.stderr.toString().slice(0,2000))
      return JSON.parse(result.stdout.toString()) as Record<string,any>
    }
    for(const s of spec){
      const p=join(base,s.id),work=join(p,'workspace.json'),selection=join(p,'selection.json'),caseFile=join(p,'case.json')
      const out=join(home,s.id+'-bundle.json'),imported=join(home,s.id+'-imported.json')
      expect(run('review-authoring-v1.ts',['validate',work]).ok).toBeTrue()
      expect(run('review-authoring-v1.ts',['save',work,'0','d4-g02-author']).saved).toBeTrue()
      expect(run('review-authoring-v1.ts',['read',wspace(s.id).workspaceId]).workspace.revision).toBe(1)
      expect(run('review-d3-library.ts',['export',work,out]).fingerprint).toHaveLength(64)
      expect(run('review-d3-library.ts',['import',out,imported]).imported).toBeTrue()
      const plan=run('review-d2-plan.ts',['preview',imported,selection,caseFile])
      expect(plan.schemaVersion).toBe(3)
      expect(plan.subjects).toHaveLength(2)
      expect(run('review-d2-plan.ts',['register',imported,selection]).registered).toBeTrue()
      const result=run('review-d2-plan.ts',['create',imported,selection,s.id.toLowerCase()+'-cli-case','G02 synthetic CLI technical case','d4-g02-author'])
      expect(result.created).toBeTrue()
      record(s.id+'-cli-plan.json',plan)
    }
  })
})
