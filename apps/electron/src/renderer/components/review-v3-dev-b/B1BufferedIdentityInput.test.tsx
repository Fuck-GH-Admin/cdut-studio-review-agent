import { describe, expect, test } from 'bun:test'
import { renderToStaticMarkup } from 'react-dom/server'
import { B1BufferedIdentityInput } from './B1BufferedIdentityInput'
import { renameB1AuthorIdentity } from './review-v3-author-edit'
import { compileReviewB1Plan, type B1AuthorDocument } from '../../../main/lib/review/review-template-plan-adapter-v3-b1'

const doc=():B1AuthorDocument=>({
  schemaVersion:'review-b1/1',status:'candidate-held',
  templateId:'new-business',templateVersion:'1',name:'New business',purpose:'UAT candidate',
  sources:[{sourceId:'src',kind:'user-declared',documentVersionId:'declared-1',
    locator:'author-input',recordedBy:'local-unverified'}],
  fields:[{key:'consent',label:'Consent',sourceId:'src',required:true,type:'boolean'}],
  targets:[{targetKey:'target',objectKey:'object',subjectId:'subject',
    scenario:'sample',fieldValues:{consent:true}}],
  modules:[{moduleId:'core',version:'1',dependsOn:[],checks:[{
    checkKey:'consent-check',requirement:'Confirm scope',
    responsibility:'author',sourceIds:['src'],targetKeys:['target'],
    condition:{kind:'field-equals',fieldKey:'consent',equals:true},
  }]}],
  stages:[{stageId:'human',role:'reviewer',mode:'manual'}],
  outputs:[{outputId:'summary',kind:'report'}],
})
describe('B1 author identity input: complete edit versus transient IME state',()=>{
  test('candidate ID is rendered as controlled input and does not write a Case',()=>{
    const rendered=renderToStaticMarkup(<B1BufferedIdentityInput
      value="existing-source" onCommit={()=>{throw new Error('SSR must not commit')}}/>)
    expect(rendered).toContain('value="existing-source"')
    expect(rendered).not.toContain('onCommit')
  })
  test('one complete source/field/target rename preserves compiler bindings',()=>{
    const src=renameB1AuthorIdentity(doc(),'source','src','renamed-source')
    const field=renameB1AuthorIdentity(src,'field','consent','renamed-consent')
    const target=renameB1AuthorIdentity(field,'target','target','renamed-target')
    const compiled=compileReviewB1Plan(target)
    expect(compiled.publicationAllowed).toBe(false)
    expect(compiled.canonicalPlan.bindings).toHaveLength(1)
    expect(compiled.bindingDetails[0]!.sourceIds).toEqual(['renamed-source'])
    expect(compiled.bindingDetails[0]!.targetKey).toBe('renamed-target')
    expect(compiled.bindingDetails[0]!.condition).toEqual({
      kind:'field-equals',fieldKey:'renamed-consent',equals:true,
    })
  })
  test('duplicate or transient blank ID fails without changing persisted candidate',()=>{
    const original=doc()
    expect(()=>renameB1AuthorIdentity(original,'field','consent','')).toThrow(
      'B1_AUTHOR_EDIT_ID_INVALID')
    expect(()=>renameB1AuthorIdentity(original,'source','src','')).toThrow(
      'B1_AUTHOR_EDIT_ID_INVALID')
    expect(original).toEqual(doc())
  })
})
