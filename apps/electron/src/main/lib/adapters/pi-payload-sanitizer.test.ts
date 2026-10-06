import { describe, expect, it } from 'bun:test'
import { sanitizeAndPruneOpenAIPayload } from './pi-agent-adapter'

describe('sanitizeAndPruneOpenAIPayload', () => {
  it('应当安全剔除 store 字段并将 developer 角色转回 system', () => {
    const payload = {
      store: false,
      messages: [
        { role: 'developer', content: 'You are a tutor.' },
        { role: 'user', content: 'Hello' },
      ],
    }
    const result = sanitizeAndPruneOpenAIPayload(payload, { id: 'qwen' })
    expect(result.store).toBeUndefined()
    expect(result.messages[0].role).toBe('system')
  })

  it('应当将纯文本单项数组平坦化为 string，并保留多模态图片数组', () => {
    const payload = {
      messages: [
        { role: 'user', content: [{ type: 'text', text: '你好' }] },
        {
          role: 'user',
          content: [
            { type: 'text', text: '看图' },
            { type: 'image_url', image_url: { url: 'data:image/png;base64,...' } },
          ],
        },
      ],
    }
    const result = sanitizeAndPruneOpenAIPayload(payload, { id: 'qwen' })
    expect(result.messages[0].content).toBe('你好')
    expect(Array.isArray(result.messages[1].content)).toBe(true)
    expect(result.messages[1].content.length).toBe(2)
  })

  it('应当剥离前序 assistant 的 thinking 字段并折叠前序超长 tool 结果', () => {
    const payload = {
      messages: [
        { role: 'user', content: '问题 1' },
        { role: 'assistant', content: '答案 1', reasoning_content: '长篇思考过程...' },
        { role: 'tool', tool_call_id: 'call_1', content: 'A'.repeat(5000) },
        { role: 'user', content: '问题 2 (当前轮)' },
        { role: 'assistant', content: '当前回答', reasoning_content: '当前思考' },
        { role: 'tool', tool_call_id: 'call_2', content: 'B'.repeat(5000) },
      ],
    }
    const result = sanitizeAndPruneOpenAIPayload(payload, { id: 'qwen' })
    // 前序 assistant 的 reasoning_content 必须被清除
    expect(result.messages[1].reasoning_content).toBeUndefined()
    // 前序 tool 超过 2000 字符必须被折叠
    expect(result.messages[2].content.length).toBeLessThan(2000)
    expect(result.messages[2].content).toContain('[...该历史查询结果已折叠')
    // 当前轮的 assistant 和 tool 必须保持原样
    expect(result.messages[4].reasoning_content).toBe('当前思考')
    expect(result.messages[5].content).toBe('B'.repeat(5000))
  })
})
