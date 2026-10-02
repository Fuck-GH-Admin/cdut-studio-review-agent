import { describe, expect, test } from 'bun:test'
import { resolveAgentRuntimeSystemPrompt, resolveAgentSystemPromptPolicy } from './agent-system-prompt-policy'

describe('resolveAgentSystemPromptPolicy', () => {
  test('默认保持 grounded 并使用 Claude Code preset', () => {
    expect(resolveAgentSystemPromptPolicy({})).toEqual({
      epistemicMode: 'grounded',
      useClaudeCodePreset: true,
    })
  })

  test('只开启开发者模式时仍保持 grounded', () => {
    expect(resolveAgentSystemPromptPolicy({ developerModeEnabled: true })).toEqual({
      epistemicMode: 'grounded',
      useClaudeCodePreset: true,
    })
  })

  test('两个门禁同时开启时使用 open 并停止叠加 Claude Code preset', () => {
    expect(resolveAgentSystemPromptPolicy({
      developerModeEnabled: true,
      openEpistemicModeEnabled: true,
    })).toEqual({
      epistemicMode: 'open',
      useClaudeCodePreset: false,
    })
  })

  test('开发者模式关闭时忽略残留的开放认识论值', () => {
    expect(resolveAgentSystemPromptPolicy({ openEpistemicModeEnabled: true })).toEqual({
      epistemicMode: 'grounded',
      useClaudeCodePreset: true,
    })
  })

  test('Pi runtime 使用自管 system prompt，不叠加 Claude preset', () => {
    const grounded = resolveAgentSystemPromptPolicy({})
    const open = resolveAgentSystemPromptPolicy({
      developerModeEnabled: true,
      openEpistemicModeEnabled: true,
    })

    expect(resolveAgentRuntimeSystemPrompt('pi', grounded, 'PROMPT')).toBe('PROMPT')
    expect(resolveAgentRuntimeSystemPrompt('pi', open, 'PROMPT')).toBe('PROMPT')
  })
})
