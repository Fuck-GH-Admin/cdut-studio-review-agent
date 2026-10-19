import { describe, expect, test } from 'bun:test'
import type { D4ClientTemplate } from '@profer/shared'
import { recommendD4Intake } from './review-d4-routing'

const templates = [
  { templateId: 'g03-t01', version: 1, name: '公共教学教室临时借用', domain: 'G03' },
  { templateId: 'g08-t02', version: 1, name: '失物认领', domain: 'G08' },
  { templateId: 'g02-t01-review', version: 1, name: '档案资料共享', domain: 'G02' },
] as D4ClientTemplate[]
describe('P1-C deterministic intake recommendations', () => {
  test('single task can recommend a template from a file name without asserting facts', () => {
    const result = recommendD4Intake([{ name: '公共教学教室借用申请.md' }], templates)
    expect(result.status).toBe('suggested')
    expect(result.suggestion?.templateId).toBe('g03-t01')
    expect(result.suggestion?.basis.some(item => item.includes('文件名'))).toBeTrue()
  })
  test('text-only sample may nominate lost item route', () => {
    const result = recommendD4Intake([{ name: 'application.txt', textSample: '办理失物认领，申请领取失物。' }], templates)
    expect(result.status).toBe('suggested')
    expect(result.suggestion?.templateId).toBe('g08-t02')
  })
  test('unrecognized PDF must be manually routed; PDF bytes are not parsed', () => {
    expect(recommendD4Intake([{ name: '申请.pdf' }], templates).status).toBe('manual-required')
  })
  test('multiple distinct matters are explicitly denied as a batch', () => {
    const result = recommendD4Intake([
      { name: '失物招领申请.txt' }, { name: '教室借用申请.md' },
    ], templates)
    expect(result.status).toBe('multiple-tasks')
    expect(result.suggestion).toBeUndefined()
  })
  test('mixed recognized and unrecognized items cannot get automatic suggestion', () => {
    const result = recommendD4Intake([
      { name: '教室借用申请.md' }, { name: '其他材料.pdf' },
    ], templates)
    expect(result.status).toBe('manual-required')
  })
  test('frozen authored template names give previously unlisted G02 items conservative discoverability', () => {
    const result = recommendD4Intake([{ name: '档案资料共享申请.pdf' }], templates)
    expect(result.status).toBe('suggested')
    expect(result.suggestion?.templateId).toBe('g02-t01-review')
    expect(result.suggestion?.basis).toContain('文件名与完整候选名称一致')
  })
  test('short generic template names do not become unsafe catch-all routes', () => {
    const short = [{ ...templates[2]!, templateId: 'g02-short', name: '申请' }] as D4ClientTemplate[]
    expect(recommendD4Intake([{ name: '申请.pdf' }], short).status).toBe('manual-required')
  })
  test('name-matched files for different business matters still trigger fail-closed split', () => {
    const result = recommendD4Intake([
      { name: '档案资料共享申请.pdf' },
      { name: '公共教学教室借用申请.md' },
    ], templates)
    expect(result.status).toBe('multiple-tasks')
  })
  test('full authoring name inside a plain-text sample may suggest, but PDF bytes do not', () => {
    const long = [{ ...templates[2]!, name: '档案资料共享申请审核事项' }] as D4ClientTemplate[]
    expect(recommendD4Intake([{ name: '材料说明.txt', textSample: '现办理档案资料共享申请审核事项。' }], long).status).toBe('suggested')
    expect(recommendD4Intake([{ name: '材料说明.pdf', textSample: undefined }], long).status).toBe('manual-required')
  })
  test('model cannot infer school facts, conditions, or applicant; exact candidate IDs are only recommendation', () => {
    const result = recommendD4Intake([{ name: 'g08-t02-技术案例.txt' }], templates)
    expect(result.status).toBe('suggested')
    expect(result.suggestion?.templateId).toBe('g08-t02')
    expect(Object.keys(result)).toEqual(['status', 'suggestion', 'reason'])
  })
})
