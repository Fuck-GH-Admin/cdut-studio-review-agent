import { describe, expect, test } from 'bun:test'
import type { Channel, SDKMessage } from '@profer/shared'
import type { PiAgentQueryOptions } from '../adapters/pi-agent-adapter'
import { createPiReviewModelClient } from './pi-review-agent-client'

describe('Pi 审核 Agent 客户端', () => {
  test('受控检查提交尝试结束 Pi 工具轮，并在缺少模型总结时返回保守摘要', async () => {
    let terminateHint: unknown
    const client = createPiReviewModelClient({
      channel: { id: 'test-channel', name: 'Test', provider: 'openai' } as Channel,
      apiKey: 'test-key',
      model: 'test-model',
      cwd: '/tmp/review-case',
      piAgentDir: '/tmp/pi-config',
      loadSdk: async () => ({ defineTool: (definition: unknown) => definition }) as never,
      query: async function* (input) {
        const submit = input.customTools?.find((tool) => tool.name === 'submit_checks')
        if (!submit) throw new Error('submit_checks tool missing')
        const result = await submit.execute('call-submit', { checks: [{ ruleId: 'rule-1' }] } as never, undefined, undefined, {} as never) as { terminate?: boolean }
        terminateHint = result.terminate
        yield { type: 'result', subtype: 'success' } as SDKMessage
      },
    })

    const result = await client.complete({
      prompt: '执行检查',
      system: '审核',
      terminateAfterTools: ['submit_checks'],
      tools: [{
        name: 'submit_checks', description: '提交检查', input: '{ checks }',
        execute: async () => ({ ok: true, data: { results: [{ ok: false, error: '引用无效，需人工复核' }] } }),
      }],
    })

    expect(terminateHint).toBe(true)
    expect(JSON.parse(result.content).opinion).toContain('审核工具已执行，但 Pi 未返回最终摘要')
  })

  test('总结阶段未授权提前结束时不把事实记录误认为检查完成', async () => {
    const client = createPiReviewModelClient({
      channel: { id: 'test-channel', name: 'Test', provider: 'openai' } as Channel,
      apiKey: 'test-key',
      model: 'test-model',
      cwd: '/tmp/review-case',
      piAgentDir: '/tmp/pi-config',
      loadSdk: async () => ({ defineTool: (definition: unknown) => definition }) as never,
      query: async function* (input) {
        const record = input.customTools?.find((tool) => tool.name === 'record_observations')
        if (!record) throw new Error('record_observations tool missing')
        const result = await record.execute('call-record', { observations: [{}] } as never, undefined, undefined, {} as never) as { terminate?: boolean }
        expect(result.terminate).toBeUndefined()
        yield { type: 'result', subtype: 'success' } as SDKMessage
      },
    })

    await expect(client.complete({
      prompt: '生成审核结论',
      system: '审核',
      terminateAfterTools: ['submit_check', 'submit_checks'],
      tools: [{
        name: 'record_observations', description: '记录事实', input: '{ observations }',
        execute: async () => ({ ok: true, data: { results: [{ ok: true }] } }),
      }],
    })).rejects.toThrow('没有返回可用的结构化结果')
  })

  test('文本审核遇到服务超时后返回明确人工待办，不丢弃整案运行', async () => {
    const client = createPiReviewModelClient({
      channel: { id: 'test-channel', name: 'Test', provider: 'openai' } as Channel,
      apiKey: 'test-key',
      model: 'test-model',
      cwd: '/tmp/review-case',
      piAgentDir: '/tmp/pi-config',
      loadSdk: async () => ({ defineTool: (definition: unknown) => definition }) as never,
      query: async function* () {
        throw new Error('Pi 审核 Agent 超时（150000 ms）')
      },
    })

    const result = await client.complete({ prompt: '审核', system: '审核', terminateAfterTools: ['submit_checks'] })

    expect(JSON.parse(result.content).opinion).toContain('本轮未得到可核验的模型结论')
  })

  test.each(['502: upstream service temporarily unavailable', 'Internal server error', 'Pi 审核 Agent 超时（150000 ms）'])(
    '图片请求遇到 %s 时以纯文本重试并要求人工核对图片',
    async (failure) => {
    const observedImages: Array<string[] | undefined> = []
    const observedPrompts: string[] = []
    const client = createPiReviewModelClient({
      channel: { id: 'test-channel', name: 'Test', provider: 'openai' } as Channel,
      apiKey: 'test-key',
      model: 'test-model',
      cwd: '/tmp/review-case',
      piAgentDir: '/tmp/pi-config',
      loadSdk: async () => ({ defineTool: (definition: unknown) => definition }) as never,
      query: async function* (input) {
        observedImages.push(input.images)
        observedPrompts.push(input.prompt)
        if (input.images?.length) throw new Error(failure)
        yield { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: '{"ok":true}' }] } } as SDKMessage
        yield { type: 'result', subtype: 'success' } as SDKMessage
      },
    })

    const output = await client.complete({ prompt: '检查图片材料', system: '审核', images: ['data:image/png;base64,aGVsbG8='] })

    expect(output).toEqual({ content: '{"ok":true}', imagesDropped: true })
    expect(observedImages).toEqual([['data:image/png;base64,aGVsbG8='], []])
    expect(observedPrompts[1]).toContain('图像中的事实一律标记待人工核对')
    },
  )

  test('通过项目 Pi review profile 注册受控审核工具并传递视觉输入', async () => {
    let observed: PiAgentQueryOptions | undefined
    const toolCalls: string[] = []
    const client = createPiReviewModelClient({
      channel: { id: 'test-channel', name: 'Test', provider: 'ollama' } as Channel,
      apiKey: '',
      model: 'test-model',
      cwd: '/tmp/review-case',
      piAgentDir: '/tmp/pi-config',
      loadSdk: async () => ({ defineTool: (definition: unknown) => definition }) as never,
      query: async function* (input) {
        observed = input
        yield { type: 'assistant', message: { role: 'assistant', content: [{ type: 'text', text: '{"ok":true}' }] } } as SDKMessage
        yield { type: 'result', subtype: 'success' } as SDKMessage
      },
      abort: () => undefined,
    })
    const image = 'data:image/png;base64,aGVsbG8='
    const output = await client.complete({
      prompt: '审核本案',
      system: '使用审核工具',
      images: [image],
      onToolCall: (name) => toolCalls.push(name),
      tools: [{
        name: 'read_rule', description: '读取审核规则', input: '{ ruleId }',
        execute: async (input) => ({ ok: true, data: { ruleId: input.ruleId } }),
      }],
    })

    expect(output.content).toBe('{"ok":true}')
    expect(client.runtime).toBe('pi')
    expect(client.protocol).toBe('ollama-chat')
    expect(observed?.agentRuntime).toBe('pi')
    expect(observed?.toolProfile).toBe('review')
    expect(observed?.customTools?.map((tool) => tool.name)).toEqual(['read_rule'])
    expect(observed?.images).toEqual([image])
    const tool = observed?.customTools?.[0]
    await tool?.execute('call-1', { ruleId: 'r1' } as never, undefined, undefined, {} as never)
    expect(toolCalls).toEqual(['read_rule'])
  })
})
