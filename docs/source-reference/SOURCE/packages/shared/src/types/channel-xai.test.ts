import { describe, expect, test } from 'bun:test'
import {
  isAgentEnabledForChannel,
  resolveXaiCredentialMode,
  type AgentRuntimeMode,
} from './channel'

const oauthSecret = JSON.stringify({
  access: 'access-token',
  refresh: 'refresh-token',
  expires: Date.now() + 60_000,
})

function channel(overrides: Partial<{
  provider: 'xai' | 'anthropic'
  enabled: boolean
  agentExperimentalEnabled: boolean
  agentRuntimes: AgentRuntimeMode[]
}> = {}) {
  return {
    provider: 'xai' as const,
    enabled: true,
    ...overrides,
  }
}

describe('xAI 凭据模式与 Agent 内核资格', () => {
  test('Given 历史 xAI OAuth JSON When 未声明模式 Then 自动识别为 oauth', () => {
    expect(resolveXaiCredentialMode(undefined, oauthSecret)).toBe('oauth')
  })

  test('Given 普通 xAI API Key When 未声明模式 Then 自动识别为 api-key', () => {
    expect(resolveXaiCredentialMode(undefined, 'xai-api-key')).toBe('api-key')
  })

  test('Given 明确模式与密文内容冲突 When 解析模式 Then OAuth 结构优先保护 refresh token', () => {
    expect(resolveXaiCredentialMode('api-key', oauthSecret)).toBe('oauth')
    expect(resolveXaiCredentialMode('oauth', 'xai-api-key')).toBe('oauth')
  })

  // 兼容旧调用方的别名：当前仓库仅保留 Pi runtime，因此它等价于 Pi 资格。
  test('Given 渠道没有任何勾选信息 When 判断 Agent 资格 Then 按 provider 推导', () => {
    // xAI 无 Anthropic 端点，推导结果里没有 claude
    expect(isAgentEnabledForChannel(channel())).toBe(false)
    // 既有兼容渠道推导结果含 claude，保持原有语义
    expect(isAgentEnabledForChannel(channel({ provider: 'anthropic' }))).toBe(true)
  })

  test('Given 渠道显式勾选 Pi 内核 When 判断 Agent 资格 Then 允许', () => {
    expect(isAgentEnabledForChannel(channel({ agentRuntimes: ['pi'] }))).toBe(true)
  })

  test('Given xAI 未勾选 Pi 内核 When 判断 Agent 资格 Then 拒绝', () => {
    expect(isAgentEnabledForChannel(channel({ agentRuntimes: [] }))).toBe(false)
  })

  test('Given xAI 只开了实验开关但没有显式勾选 When 判断 Agent 资格 Then 按历史迁移规则允许 Pi', () => {
    expect(isAgentEnabledForChannel(channel({ agentExperimentalEnabled: true }))).toBe(true)
    expect(isAgentEnabledForChannel(channel({ agentExperimentalEnabled: true, agentRuntimes: ['pi'] }))).toBe(true)
  })
})
