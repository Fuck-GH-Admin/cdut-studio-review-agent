/** 观察已实际注册的 SDK MCP 工具，不读取 SDK 私有字段、不额外连接外部服务器。 */
import type * as ClaudeSdk from '@anthropic-ai/claude-agent-sdk'
import { isEffectiveAgentPresetToolDisabled, type EffectiveAgentPresetPolicy } from '@profer/shared'

export function captureSkillToolInventory(sdk: typeof ClaudeSdk) {
  const registered = new Map<string, string[]>()
  return {
    sdk: {
      ...sdk,
      createSdkMcpServer(options: Parameters<typeof ClaudeSdk.createSdkMcpServer>[0]) {
        const server = sdk.createSdkMcpServer(options)
        registered.set(options.name, options.tools?.map(tool => tool.name) ?? [])
        return server
      },
    },
    getToolNames(serverNames: readonly string[], policy: EffectiveAgentPresetPolicy): string[] {
      const native = ['Read', 'Write', 'Edit', 'Glob', 'Grep', 'Bash', 'WebSearch', 'WebFetch']
      return [...native, ...serverNames.flatMap(server => (registered.get(server) ?? []).map(tool => `mcp__${server}__${tool}`))]
        .filter(tool => !isEffectiveAgentPresetToolDisabled(policy, tool) && !policy.disabledTools?.includes(tool))
    },
  }
}
