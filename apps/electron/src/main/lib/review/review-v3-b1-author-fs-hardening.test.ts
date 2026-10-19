import {afterAll,describe,expect,test} from 'bun:test'
import {mkdtempSync,readFileSync,rmSync,symlinkSync,writeFileSync,statSync,mkdirSync,linkSync} from 'node:fs'
import {tmpdir} from 'node:os'
import {join} from 'node:path'
import {saveB1AuthorRevision,readB1AuthorRevision,freezeB1Candidate,readB1FrozenCandidate} from './review-template-author-store-v3-b1'
import type {B1AuthorDocument} from './review-template-plan-adapter-v3-b1'
const home=mkdtempSync(join(tmpdir(),'b1-author-fs-r17-'))
const original=process.env.PROFER_CONFIG_DIR
process.env.PROFER_CONFIG_DIR=home
afterAll(()=>{
 if(original===undefined)delete process.env.PROFER_CONFIG_DIR
 else process.env.PROFER_CONFIG_DIR=original
 rmSync(home,{recursive:true,force:true})
})
const candidate=(id:string):B1AuthorDocument=>({
 schemaVersion:'review-b1/1',status:'candidate-held',templateId:id,templateVersion:'1',
 name:'Unpublished safety candidate',purpose:'R17 filesystem regression',
 sources:[{sourceId:'declared',kind:'user-declared',documentVersionId:'test-v1',locator:'test:',recordedBy:'unverified'}],
 fields:[],targets:[{targetKey:'t',objectKey:'o',subjectId:'s',scenario:'synthetic',fieldValues:{}}],
 modules:[{moduleId:'m',version:'1',dependsOn:[],checks:[{checkKey:'check',requirement:'Do a check',responsibility:'human',sourceIds:['declared'],targetKeys:['t'],condition:{kind:'always'}}]}],
 stages:[{stageId:'step',role:'human',mode:'manual'}],outputs:[{outputId:'o',kind:'report'}],
})
const root=()=>join(home,'review-v3-author-candidate')
describe('B1 R17 immutable author candidate FS boundary',()=>{
 test('append revision and frozen candidate preserve JSON compatibility, strict CAS, immutable links',()=>{
  const doc=candidate('b1-r17-cas')
  const a=saveB1AuthorRevision(doc,0,'main-trusted')
  expect(a.revision).toBe(1)
  const file=join(root(),doc.templateId,'revisions','1.json')
  expect(statSync(file).nlink).toBe(1)
  expect(JSON.parse(readFileSync(file,'utf8'))).toEqual(a)
  const frozen=freezeB1Candidate(doc.templateId,1)
  expect(readB1FrozenCandidate(doc.templateId,frozen.descriptor.canonicalPlan.fingerprint)).toEqual(frozen)
  expect(()=>saveB1AuthorRevision(doc,0,'main-trusted')).toThrow('B1_AUTHOR_REVISION_CONFLICT')
  const second=saveB1AuthorRevision(doc,1,'main-trusted')
  expect(second.parentDigest).toBe(a.digest)
  expect(readB1AuthorRevision(doc.templateId,1)?.revision).toBe(1)
  expect(readB1AuthorRevision(doc.templateId)?.revision).toBe(2)
 })
 test('symlinked immutable revision is rejected; do not parse link target',()=>{
  const doc=candidate('b1-r17-symlink')
  saveB1AuthorRevision(doc,0,'main-trusted')
  const file=join(root(),doc.templateId,'revisions','1.json')
  const moved=join(root(),doc.templateId,'revisions','shadow.txt')
  const content=readFileSync(file)
  rmSync(file)
  writeFileSync(moved,content)
  symlinkSync(moved,file)
  expect(()=>readB1AuthorRevision(doc.templateId)).toThrow('B1_AUTHOR_UNSAFE_FILE')
  expect(()=>saveB1AuthorRevision(doc,1,'main-trusted')).toThrow('B1_AUTHOR_UNSAFE_FILE')
 })
 test('hardlinked revisions refused; body digest alone does not make file safe',()=>{
  const doc=candidate('b1-r17-hardlink')
  saveB1AuthorRevision(doc,0,'main-trusted')
  const file=join(root(),doc.templateId,'revisions','1.json')
  linkSync(file,join(root(),doc.templateId,'revisions','extra-copy.txt'))
  expect(()=>readB1AuthorRevision(doc.templateId)).toThrow('B1_AUTHOR_UNSAFE_FILE')
 })
 test('candidate path symlink is rejected rather than crossing into unrelated directory',()=>{
  const outside=mkdtempSync(join(home,'out-'))
  symlinkSync(outside,join(root(),'b1-r17-bad-directory'))
  expect(()=>saveB1AuthorRevision(candidate('b1-r17-bad-directory'),0,'main-trusted'))
    .toThrow('B1_AUTHOR_UNSAFE_DIRECTORY')
  rmSync(outside,{force:true,recursive:true})
 })
 test('frozen candidate symlink is rejected despite matching filename and old digest',()=>{
  const doc=candidate('b1-r17-frozen')
  saveB1AuthorRevision(doc,0,'main-trusted')
  const saved=freezeB1Candidate(doc.templateId,1)
  const file=join(root(),doc.templateId,'frozen',saved.descriptor.canonicalPlan.fingerprint+'.json')
  const alternate=join(root(),doc.templateId,'frozen','elsewhere.json')
  const bytes=readFileSync(file)
  rmSync(file)
  writeFileSync(alternate,bytes)
  symlinkSync(alternate,file)
  expect(()=>readB1FrozenCandidate(doc.templateId,saved.descriptor.canonicalPlan.fingerprint))
    .toThrow('B1_AUTHOR_UNSAFE_FILE')
 })
 test('orphaned writer lock cannot be stolen implicitly',()=>{
  const doc=candidate('b1-r17-orphan-lock')
  saveB1AuthorRevision(doc,0,'main-trusted')
  const lock=join(root(),doc.templateId,'author.lock')
  writeFileSync(lock,'orphaned; manual Main authorization required',{flag:'wx'})
  expect(()=>saveB1AuthorRevision(doc,1,'main-trusted')).toThrow()
  expect(()=>freezeB1Candidate(doc.templateId,1)).toThrow()
  rmSync(lock)
 })
 test('invalid revision numbers never become filesystem paths',()=>{
  const doc=candidate('b1-r17-invalid-revision')
  saveB1AuthorRevision(doc,0,'main-trusted')
  for(const bad of [0,-1,1.2,Number.MAX_SAFE_INTEGER+1])
   expect(()=>readB1AuthorRevision(doc.templateId,bad)).toThrow('B1_AUTHOR_REVISION_INVALID')
 })
})
