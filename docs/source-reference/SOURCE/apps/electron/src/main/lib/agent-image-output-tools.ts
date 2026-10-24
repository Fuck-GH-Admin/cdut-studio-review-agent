import { sendAgentLocalImage, type AgentImageOutputContext } from './agent-image-output-service'

type ToolResult = { content: Array<{ type: 'text'; text: string }>; details?: unknown }

function result(payload: Awaited<ReturnType<typeof sendAgentLocalImage>>): ToolResult {
  return {
    content: [{
      text: `图片已安全复制到当前会话，并会自动显示在回复中。文件相对路径：${payload.image.relativePath}。如需将图片用于皮肤壁纸等后续文件工作流，请使用该相对路径；不要输出任何内部图片协议标记。`,
      type: 'text',
    }],
    // 结构化 details 由 Profer UI 直接消费；不再要求模型回显 marker。
    details: payload,
  }
}

/** Claude runtime 的受控本地图片输出 MCP 工具。 */
/** Pi 与 Claude 共用相同的结构化图片工具结果。 */
export function formatAgentImageOutputToolResult(payload: Awaited<ReturnType<typeof sendAgentLocalImage>>): ToolResult {
  return result(payload)
}
