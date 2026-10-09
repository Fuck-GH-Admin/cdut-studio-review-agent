import { describe, expect, it } from 'bun:test'
import { sanitizeContextForInference } from './pi-agent-adapter'

describe('sanitizeContextForInference（跨协议推理上下文净化）', () => {
  it('OpenAI 兼容：应安全剔除 store 字段并将 developer 角色转回 system', () => {
    const payload = {
      store: false,
      messages: [
        { role: 'developer', content: 'You are a tutor.' },
        { role: 'user', content: 'Hello' },
      ],
    }
    const result = sanitizeContextForInference(payload, { id: 'qwen' }, { openAICompatible: true })
    expect(result.store).toBeUndefined()
    expect(result.messages[0].role).toBe('system')
  })

  it('OpenAI 兼容：应将纯文本单项数组平坦化为 string，并保留多模态图片数组', () => {
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
    const result = sanitizeContextForInference(payload, { id: 'qwen' }, { openAICompatible: true })
    expect(result.messages[0].content).toBe('你好')
    expect(Array.isArray(result.messages[1].content)).toBe(true)
    expect(result.messages[1].content.length).toBe(2)
  })

  it('应剥离前序 assistant 的 thinking 字段并折叠前序超长 tool 结果', () => {
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
    const result = sanitizeContextForInference(payload, { id: 'qwen' }, { openAICompatible: true })
    // 前序 assistant 的 reasoning_content 必须被清除
    expect(result.messages[1].reasoning_content).toBeUndefined()
    // 前序 tool 超长内容必须被折叠
    expect(result.messages[2].content.length).toBeLessThan(2000)
    expect(result.messages[2].content).toContain('[...该历史查询结果已折叠')
    // 当前轮的 assistant 和 tool 必须保持原样
    expect(result.messages[4].reasoning_content).toBe('当前思考')
    expect(result.messages[5].content).toBe('B'.repeat(5000))
  })

  it('Anthropic：应剥离历史 thinking 内容块，并保留当前轮 thinking', () => {
    const payload = {
      messages: [
        { role: 'user', content: [{ type: 'text', text: '问题 1' }] },
        {
          role: 'assistant',
          content: [
            { type: 'thinking', thinking: '历史推理' },
            { type: 'text', text: '答案 1' },
          ],
        },
        { role: 'user', content: [{ type: 'text', text: '当前轮问题' }] },
        {
          role: 'assistant',
          content: [
            { type: 'thinking', thinking: '当前推理' },
            { type: 'text', text: '当前答案' },
          ],
        },
      ],
    }
    const result = sanitizeContextForInference(payload, { id: 'claude' })
    // 历史 assistant 的 thinking 块被剥离，只剩 text
    expect(result.messages[1].content).toEqual([{ type: 'text', text: '答案 1' }])
    // 当前轮 thinking 原样保留
    expect(result.messages[3].content).toEqual([
      { type: 'thinking', thinking: '当前推理' },
      { type: 'text', text: '当前答案' },
    ])
  })

  it('Google：应基于 contents 剥离历史 thought part', () => {
    const payload = {
      contents: [
        { role: 'user', parts: [{ text: '问题 1' }] },
        { role: 'model', parts: [{ text: '历史思考', thought: true }, { text: '答案 1' }] },
        { role: 'user', parts: [{ text: '当前轮问题' }] },
        { role: 'model', parts: [{ text: '当前思考', thought: true }, { text: '当前答案' }] },
      ],
    }
    const result = sanitizeContextForInference(payload, { id: 'google' }, { openAICompatible: true })
    expect(result.contents[1].parts).toEqual([{ text: '答案 1' }])
    expect(result.contents[3].parts).toEqual([{ text: '当前思考', thought: true }, { text: '当前答案' }])
  })

  it('折叠历史超长工具输出：仍保留折叠提示与首段内容', () => {
    const payload = {
      messages: [
        { role: 'user', content: '问题 1' },
        { role: 'tool', tool_call_id: 'call_1', content: `HEAD${'X'.repeat(3000)}` },
        { role: 'user', content: '当前轮' },
      ],
    }
    const result = sanitizeContextForInference(payload, { id: 'qwen' }, { openAICompatible: true })
    expect(result.messages[1].content.startsWith('HEAD')).toBe(true)
    expect(result.messages[1].content).toContain('[...该历史查询结果已折叠')
  })
})
