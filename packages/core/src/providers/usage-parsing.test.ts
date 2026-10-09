/**
 * 四适配器真实 usage 解析单元测试
 *
 * 覆盖：Anthropic message_start/message_delta、OpenAI Chat 尾 chunk、
 * OpenAI Responses response.completed、Google usageMetadata（含无 parts 末 chunk）。
 */

import { describe, expect, test } from 'bun:test'
import { AnthropicAdapter } from './anthropic-adapter.ts'
import { GoogleAdapter } from './google-adapter.ts'
import { OpenAIAdapter } from './openai-adapter.ts'
import { OpenAIResponsesAdapter } from './openai-responses-adapter.ts'
import type { StreamEvent } from './types.ts'

/** 从事件数组中取出 usage 事件 */
function usageEvent(events: StreamEvent[]): Extract<StreamEvent, { type: 'usage' }> | undefined {
  return events.find((event): event is Extract<StreamEvent, { type: 'usage' }> => event.type === 'usage')
}

describe('适配器 usage 解析', () => {
  test('Anthropic：message_start 提供 input/cache，message_delta 提供 output', () => {
    const adapter = new AnthropicAdapter()

    const start = adapter.parseSSELine(
      JSON.stringify({
        type: 'message_start',
        message: {
          usage: {
            input_tokens: 1200,
            output_tokens: 1,
            cache_read_input_tokens: 300,
            cache_creation_input_tokens: 50,
          },
        },
      }),
    )
    expect(usageEvent(start)).toMatchObject({
      inputTokens: 1200,
      cacheReadTokens: 300,
      cacheWriteTokens: 50,
    })

    const delta = adapter.parseSSELine(
      JSON.stringify({
        type: 'message_delta',
        delta: { stop_reason: 'end_turn' },
        usage: { output_tokens: 640 },
      }),
    )
    expect(usageEvent(delta)).toMatchObject({ outputTokens: 640 })
  })

  test('OpenAI Chat：流末尾 chunk 的 usage 被解析', () => {
    const adapter = new OpenAIAdapter()
    const events = adapter.parseSSELine(
      JSON.stringify({
        choices: [],
        usage: { prompt_tokens: 800, completion_tokens: 120, prompt_tokens_details: { cached_tokens: 64 } },
      }),
    )
    expect(usageEvent(events)).toMatchObject({
      inputTokens: 800,
      outputTokens: 120,
      cacheReadTokens: 64,
    })
  })

  test('OpenAI Responses：response.completed 的 usage 被解析', () => {
    const adapter = new OpenAIResponsesAdapter()
    const events = adapter.parseSSELine(
      JSON.stringify({
        type: 'response.completed',
        response: { status: 'completed', usage: { input_tokens: 900, output_tokens: 210 } },
      }),
    )
    expect(usageEvent(events)).toMatchObject({ inputTokens: 900, outputTokens: 210 })
  })

  test('Google：无 parts 但带 usageMetadata 的末 chunk 仍产出 usage', () => {
    const adapter = new GoogleAdapter()
    const events = adapter.parseSSELine(
      JSON.stringify({
        candidates: [],
        usageMetadata: {
          promptTokenCount: 700,
          candidatesTokenCount: 180,
          cachedContentTokenCount: 20,
          thoughtsTokenCount: 30,
        },
      }),
    )
    expect(usageEvent(events)).toMatchObject({
      inputTokens: 700,
      outputTokens: 180,
      cacheReadTokens: 20,
      reasoningTokens: 30,
    })
  })

  test('无 usage 字段时不产出 usage 事件', () => {
    const adapter = new OpenAIAdapter()
    const events = adapter.parseSSELine(JSON.stringify({ choices: [{ delta: { content: 'hi' } }] }))
    expect(usageEvent(events)).toBeUndefined()
  })
})
