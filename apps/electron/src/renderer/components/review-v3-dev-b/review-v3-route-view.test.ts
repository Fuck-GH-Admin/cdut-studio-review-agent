import { describe,expect,test } from 'bun:test'
import type {B3ManualCatalogEntry,B3RouteState} from '../../../main/lib/review/review-intake-routing-adapter-v3-b3'
import {buildB3RouteView,filterB3Catalog,requireB3VisibleManualChoice} from './review-v3-route-view'

const options:B3ManualCatalogEntry[]=[
  {templateId:'activity',templateVersion:'v1',name:'Activity Use',
    availability:'authorized-for-technical-selection'},
  {templateId:'draft',templateVersion:'v2',name:'Unpublished Draft',
    availability:'candidate-held'},
  {templateId:'activity',templateVersion:'v1',name:'Duplicated option',
    availability:'authorized-for-technical-selection'},
]
const show=(status:B3RouteState['status'],remainingMs=0):B3RouteState=>({
  status,remainingMs,reason:'technical-only',
})
describe('B1+B3 visible routing candidate contract',()=>{
  test('countdown displays rounded Main time and explicit user interruption',()=>{
    const view=buildB3RouteView(show('countdown',19001),options)
    expect(view.remainingSeconds).toBe(20)
    expect(view.canInterrupt).toBe(true)
    expect(view.authority).toBe('technical-candidate-only')
    expect(view.eligible).toHaveLength(1)
    expect(view.held).toHaveLength(1)
  })
  test('search by name/ID/version finds held and eligible without granting held a Main choice',()=>{
    const view=buildB3RouteView(show('needs-user-confirmation'),options)
    expect(filterB3Catalog(view.eligible,'ACTIV')).toHaveLength(1)
    expect(filterB3Catalog(view.held,'DRAFT')[0]?.name).toBe('Unpublished Draft')
    expect(filterB3Catalog(view.held,'v2')).toHaveLength(1)
    expect(filterB3Catalog(view.eligible,'unpublished')).toHaveLength(0)
    expect(()=>requireB3VisibleManualChoice(options,'draft','v2'))
      .toThrow('B3_VIEW_TEMPLATE_NOT_TECHNICALLY_AVAILABLE')
  })
  test('expired candidate must exactly match technically eligible catalog',()=>{
    const valid=buildB3RouteView({...show('default-selected'),chosen:{
      templateId:'activity',templateVersion:'v1',
    }},options)
    expect(valid.suggested?.name).toBe('Activity Use')
    const held=buildB3RouteView({...show('default-selected'),chosen:{
      templateId:'draft',templateVersion:'v2',
    }},options)
    expect(held.suggested).toBeNull()
    const switched=buildB3RouteView({...show('default-selected'),chosen:{
      templateId:'activity',templateVersion:'old',
    }},options)
    expect(switched.suggested).toBeNull()
  })
  test('manual options never allow candidate-held, invisible, forged or wrong version',()=>{
    expect(requireB3VisibleManualChoice(options,'activity','v1')).toEqual({
      templateId:'activity',templateVersion:'v1',
    })
    expect(()=>requireB3VisibleManualChoice(options,'activity','v2'))
      .toThrow('B3_VIEW_TEMPLATE_NOT_TECHNICALLY_AVAILABLE')
    expect(()=>requireB3VisibleManualChoice(options,'draft','v2'))
      .toThrow('B3_VIEW_TEMPLATE_NOT_TECHNICALLY_AVAILABLE')
    expect(()=>requireB3VisibleManualChoice(options,'nonexistent','v1'))
      .toThrow('B3_VIEW_TEMPLATE_NOT_TECHNICALLY_AVAILABLE')
  })
  test('missing and malformed display options do not become selectable',()=>{
    const view=buildB3RouteView(show('awaiting-evidence'),[
      ...options,{templateId:'',name:'Incomplete',templateVersion:'v3',
        availability:'authorized-for-technical-selection'},
    ])
    expect(view.eligible).toHaveLength(1)
    expect(view.canInterrupt).toBe(false)
    expect(()=>buildB3RouteView(null as unknown as B3RouteState,options))
      .toThrow('B3_VIEW_INPUT_INVALID')
  })
})
