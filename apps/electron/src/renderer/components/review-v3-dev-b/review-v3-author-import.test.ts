import { describe, expect, test } from 'bun:test'
import { parseB1AuthorCandidateImport,assertB1ImportReplaceSafe,B1_AUTHOR_IMPORT_MAX_BYTES } from './review-v3-author-import'
import { exportB1AuthorCandidate } from './review-v3-author-trial'
import type { B1AuthorDocument } from '../../../main/lib/review/review-template-plan-adapter-v3-b1'
const doc=():B1AuthorDocument=>({
  schemaVersion:'review-b1/1',status:'candidate-held',templateId:'candidate-51',templateVersion:'1',
  name:'作者用户声明业务',purpose:'R13 import / export',
  sources:[{sourceId:'author',kind:'user-declared',documentVersionId:'user-doc1',
    locator:'author-supplied',recordedBy:'untrusted-remote-principal'}],
  fields:[{key:'confirm',label:'Confirm',type:'boolean',required:true,sourceId:'author'}],
  targets:[{targetKey:'lab',objectKey:'room',subjectId:'subject',scenario:'user-case',fieldValues:{}}],
  modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[{checkKey:'c1',
    requirement:'确认',responsibility:'operator',sourceIds:['author'],targetKeys:['lab'],
    condition:{kind:'field-equals',fieldKey:'confirm',equals:true}}]}],
  stages:[{stageId:'manual',role:'reviewer',mode:'manual'}],
  outputs:[{outputId:'summary',kind:'report'}],
})
const mutate=(cb:(v:any)=>void):string=>{
  const v=JSON.parse(exportB1AuthorCandidate(doc()))
  cb(v)
  return JSON.stringify(v)
}
describe('B1 R13 untrusted candidate JSON import',()=>{
 test('export/import preserves references but discards forged recordedBy identity',()=>{
  const imported=parseB1AuthorCandidateImport(exportB1AuthorCandidate(doc()))
  expect(imported.templateId).toBe('candidate-51')
  expect(imported.sources[0]?.recordedBy).toBe('imported-local-unverified')
  expect(imported.modules[0]?.checks[0]?.targetKeys).toEqual(['lab'])
  expect(imported.status).toBe('candidate-held')
 })
 test('malformed, oversized, published and privileged envelopes are denied',()=>{
  expect(()=>parseB1AuthorCandidateImport('{')).toThrow('B1_IMPORT_INVALID_JSON')
  expect(()=>parseB1AuthorCandidateImport('x'.repeat(B1_AUTHOR_IMPORT_MAX_BYTES+1))).toThrow('B1_IMPORT_FILE_TOO_LARGE')
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.publicationAllowed=true}))).toThrow('B1_IMPORT_UNTRUSTED_ENVELOPE')
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.trustTier='school-signed'}))).toThrow('B1_IMPORT_UNTRUSTED_ENVELOPE')
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.candidate.status='published'}))).toThrow('B1_IMPORT_AUTHOR_STRUCTURE')
 })
 test('unrecognized publication ACL props and prototype pollution never enter author state',()=>{
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.candidate.schoolPublished=true}))).toThrow('B1_IMPORT_AUTHOR_STRUCTURE')
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.candidate.sources[0].officialSignature='signed'}))).toThrow('B1_IMPORT_SOURCE_STRUCTURE')
  const polluted=mutate(x=>{x.candidate.fields[0].label='x'})
  expect(()=>parseB1AuthorCandidateImport(polluted.replace('"label":"x"','"__proto__":{},"label":"x"'))).toThrow('B1_IMPORT_PROTOTYPE_KEY')
 })
 test('broken nested conditions, duplicate IDs and unsafe values are rejected',()=>{
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.candidate.modules[0].checks[0].condition={kind:'eval',js:'true'}}))).toThrow('B1_IMPORT_MODULE_CHECK_STRUCTURE')
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.candidate.sources.push({...x.candidate.sources[0]})}))).toThrow('B1_IMPORT_DUPLICATE_ID')
  expect(()=>parseB1AuthorCandidateImport(mutate(x=>{x.candidate.targets[0].fieldValues.confirm={script:'bad'}}))).toThrow('B1_IMPORT_TARGET_STRUCTURE')
 })
 test('an old async import cannot replace newer edited or busy state',()=>{
  expect(()=>assertB1ImportReplaceSafe(4,5,false)).toThrow('B1_IMPORT_STALE_SCREEN')
  expect(()=>assertB1ImportReplaceSafe(4,4,true)).toThrow('B1_IMPORT_OPERATION_BUSY')
  expect(()=>assertB1ImportReplaceSafe(4,4,false)).not.toThrow()
 })
})
