import {describe,expect,test} from 'bun:test'
import {
  prepareB1CandidateReadPreview,assertB1CandidateReadAdoption,assertB1CandidateBackupConfirmation,type B1CandidateReadResponse,
} from './review-v3-author-revision-read'
import type { B1AuthorDocument } from '../../../main/lib/review/review-template-plan-adapter-v3-b1'
const make=():B1AuthorDocument=>({
 schemaVersion:'review-b1/1',status:'candidate-held',
 templateId:'candidate-author51',templateVersion:'1',name:'Original candidate',purpose:'Unverified workflow',
 fields:[],targets:[{targetKey:'target-1',objectKey:'obj-1',subjectId:'sub-1',scenario:'test',fieldValues:{}}],
 sources:[{sourceId:'src',kind:'user-declared',documentVersionId:'source-v1',
   locator:'test-reader',recordedBy:'local-author'}],
 modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[
   {checkKey:'c1',sourceIds:['src'],targetKeys:['target-1'],requirement:'Requirement',
    responsibility:'human',condition:{kind:'always'}}]}],
 stages:[{stageId:'human',role:'reviewer',mode:'manual'}],outputs:[{outputId:'report',kind:'report'}],
})
const local=()=>({templateId:'candidate-author51',revision:2,epoch:8,draft:make(),saved:make()})
const response=():B1CandidateReadResponse=>({
 schemaVersion:'review-b1-author-read/1',candidateStatus:'candidate-held',
 templateId:'candidate-author51',revision:3,digest:'a'.repeat(64),document:{
   ...make(),name:'Later candidate',modules:[{moduleId:'core',version:'2',dependsOn:[],checks:[]}]},
})
describe('B1 R16 C-authorized revision-reader UI consumption, no automatic business authority',()=>{
 test('new Main result is a read-only difference and never a Plan publication',()=>{
  const p=prepareB1CandidateReadPreview(response(),local())
  expect(p.remote.revision).toBe(3)
  expect(p.comparedWithCurrent.deletedCheckKeys).toEqual(['c1'])
  expect(p.publicationAllowed).toBe(false);expect(p.mayAutoSave).toBe(false)
  expect(p.remote.document.sources[0]!.kind).toBe('user-declared')
  expect(()=>assertB1CandidateReadAdoption(p,{templateId:'candidate-author51',
     revision:2,epoch:8,busy:false,backupEpoch:8,hasUnsavedEdits:true})).not.toThrow()
 })
 test('must back up dirty draft before acknowledging remote adoption',()=>{
  const p=prepareB1CandidateReadPreview(response(),local())
  expect(()=>assertB1CandidateReadAdoption(p,{templateId:'candidate-author51',
     revision:2,epoch:8,busy:false,backupEpoch:null,hasUnsavedEdits:true}))
    .toThrow('B1_AUTHOR_READ_BACKUP_REQUIRED')
 })
 test('changed draft epoch or CAS revision or busy Main operation rejects stale read',()=>{
  const p=prepareB1CandidateReadPreview(response(),local())
  for(const changes of [{epoch:9},{revision:3},{busy:true},{templateId:'other'}]){
   expect(()=>assertB1CandidateReadAdoption(p,{templateId:'candidate-author51',
     revision:2,epoch:8,busy:false,backupEpoch:8,hasUnsavedEdits:true,...changes})).toThrow()
  }
 })
 test('cross-template, published, malformed digest, unsupported body and older revision reject',()=>{
  for(const bad of [{templateId:'other'},{candidateStatus:'published'},
    {digest:'fake-digest'},{revision:1},
    {document:{...make(),status:'published'}},{document:{...make(),modules:null}}]){
   expect(()=>prepareB1CandidateReadPreview({...response(),...bad},local())).toThrow('B1_AUTHOR_READ_')
  }
 })
 test('same revision conflict cannot silently overwrite local saved revision',()=>{
  expect(()=>prepareB1CandidateReadPreview({...response(),revision:2},local()))
    .toThrow('B1_AUTHOR_READ_SAME_REVISION_DIVERGED')
  const equal=prepareB1CandidateReadPreview({...response(),revision:2,document:make()},local())
  expect(()=>assertB1CandidateReadAdoption(equal,{templateId:'candidate-author51',
   revision:2,epoch:8,busy:false,backupEpoch:8,hasUnsavedEdits:false}))
    .toThrow('B1_AUTHOR_READ_NOT_NEWER')
 })
 test('returned candidate document is deeply copied before external mutation',()=>{
  const r=response()
  const p=prepareB1CandidateReadPreview(r,local())
  r.document.modules[0]!.version='evil'
  expect(p.remote.document.modules[0]!.version).toBe('2')
 })
})

describe('B1 R17 backup download is never acknowledged merely by starting an export',()=>{
 test('explicit acknowledgement applies only to the same draft/template epoch',()=>{
  expect(()=>assertB1CandidateBackupConfirmation(null,{epoch:6,templateId:'candidate-author51',busy:false}))
    .toThrow('B1_AUTHOR_READ_BACKUP_CONFIRMATION_STALE')
  const requested={epoch:6,templateId:'candidate-author51'}
  expect(()=>assertB1CandidateBackupConfirmation(requested,{epoch:6,templateId:'candidate-author51',busy:false}))
    .not.toThrow()
  for(const mismatch of [{epoch:7},{templateId:'candidate-author52'},{busy:true}]){
   expect(()=>assertB1CandidateBackupConfirmation(requested,{
    epoch:6,templateId:'candidate-author51',busy:false,...mismatch,
   })).toThrow('B1_AUTHOR_READ_BACKUP_CONFIRMATION_STALE')
  }
 })
})
