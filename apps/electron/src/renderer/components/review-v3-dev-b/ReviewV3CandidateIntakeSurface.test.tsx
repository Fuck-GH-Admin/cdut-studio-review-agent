import {describe,expect,test} from 'bun:test'
import {renderToStaticMarkup} from 'react-dom/server'
import type {B3RouteState} from '../../../main/lib/review/review-intake-routing-adapter-v3-b3'
import {ReviewV3CandidateIntakeSurface,ReviewV3RouteReviewPanel,assertB3TechnicalChoiceAck} from './ReviewV3CandidateIntakeSurface'
const catalog=[
  {templateId:'approved-template',templateVersion:'1.0',name:'Technical Template',
    availability:'authorized-for-technical-selection' as const},
  {templateId:'candidate-only',templateVersion:'1.0',name:'Candidate Draft',
    availability:'candidate-held' as const},
]
const route:B3RouteState={status:'countdown',remainingMs:10400,reason:'technical-only'}
const common={
  caseCandidateId:'case-b1-b3',
  sessionKey:'trusted-session-scoped-by-main',
  route,manualCatalog:catalog,
  onRequestRefresh:()=>{},
  onInterrupt:()=>{},
  onManualChoice:async()=>{},
}
describe('B1+B3 candidate workspace markup (not Main IPC / user UAT)',()=>{
  test('route countdown can be interrupted; only technically eligible choice is selectable',()=>{
    const html=renderToStaticMarkup(<ReviewV3RouteReviewPanel {...common}
      onOpenCustomAuthor={()=>{}}/>)
    expect(html).toContain('停止自动选择')
    expect(html).toContain('剩余约')
    expect(html).toContain('11 秒')
    expect(html).toContain('Technical Template')
    expect(html).not.toContain('value="[&quot;candidate-only&quot;')
    expect(html).toContain('自建审核业务（候选）')
    expect(html).toContain('查看尚不可提交的')
    expect(html).toContain('Candidate Draft')
    expect(html).toContain('当前展示 2 套候选版本')
    expect(html).toContain('不建案')
  })
  test('manual technical choice only reports confirmed if Main returned matching response',()=>{
    const choice={proposalOnly:true as const,caseCandidateId:'case-1',sessionKey:'session',
      templateId:'G01-T01',templateVersion:'1'}
    expect(assertB3TechnicalChoiceAck(undefined,choice)).toBe(false)
    const ack={candidateOnly:true as const,technicalChoiceRecorded:true as const,
      caseCandidateId:'case-1',templateId:'G01-T01',templateVersion:'1'}
    expect(assertB3TechnicalChoiceAck(ack,choice)).toBe(true)
    expect(()=>assertB3TechnicalChoiceAck({...ack,templateId:'G01-T02'},choice))
      .toThrow('B3_MAIN_TECHNICAL_ACK_MISMATCH')
  })
  test('technical timeout is visibly not a formal Case/Policy decision',()=>{
    const html=renderToStaticMarkup(<ReviewV3RouteReviewPanel
      {...common} route={{status:'default-selected',remainingMs:0,reason:'proposed',
        chosen:{templateId:'approved-template',templateVersion:'1.0'}}}
      onOpenCustomAuthor={()=>{}}/>)
    expect(html).toContain('倒计时已结束')
    expect(html).toContain('Technical Template')
    expect(html).toContain('不是正式建案')
  })
  test('combined B1/B3 workspace starts in route, retains separate author callbacks',()=>{
    const html=renderToStaticMarkup(<ReviewV3CandidateIntakeSurface {...common}
      author={{
        onSaveDraft:async()=>({revision:1}),
        onPreview:async()=>{throw new Error('not invoked')},
        onFreezeCandidate:async()=>({fingerprint:'0'.repeat(64)}),
      }}/>)
    expect(html).toContain('材料业务类型确认')
    expect(html).toContain('自建审核业务（候选）')
    expect(html).not.toContain('冻结候选（非正式发布）')
  })
  test('R21-08 unmatched shows honest workflow and new candidate entry, never default-selected',()=>{
    const html=renderToStaticMarkup(<ReviewV3RouteReviewPanel {...common}
      route={{status:'unmatched',remainingMs:0,reason:'No verified match'}}
      onOpenCustomAuthor={()=>{}}/>)
    expect(html).toContain('现有模板未匹配')
    expect(html).toContain('这批材料尚无可验证的匹配模板')
    expect(html).toContain('20 秒自动建议已停止')
    expect(html).toContain('创建新的候选审核模板（非正式发布）')
    expect(html).not.toContain('倒计时已结束')
    expect(html).not.toContain('技术候选：Technical Template')
    expect(html).toContain('不建案')
  })

})
