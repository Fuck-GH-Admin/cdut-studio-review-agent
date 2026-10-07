import { describe, expect, test } from 'bun:test'
import type { Channel, SDKMessage } from '@profer/shared'
import type { PiAgentQueryOptions } from '../adapters/pi-agent-adapter'
import { createPiReviewModelClient } from './pi-review-agent-client'

describe('Pi 审核 Agent 客户端', () => {
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
