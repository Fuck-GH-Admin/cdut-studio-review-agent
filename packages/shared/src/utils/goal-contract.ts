import type { AgentGoalCommand, AgentGoalContract, AgentGoalLimits, AgentGoalState } from '../types/agent'

export interface GoalLimitsInput {
  maxIterations: string
  maxDurationMinutes: string
  maxConsecutiveFailures: string
  maxTokens: string
}

/** 表单预算采用严格十进制，拒绝截断、溢出及将非法值静默当作无限额。 */
export function parseGoalLimitsInput(input: GoalLimitsInput): Partial<AgentGoalLimits> {
  const positiveInteger = (value: string, label: string): number => {
    const text = value.trim()
    const number = Number(text)
    if (!/^\d+$/.test(text) || !Number.isSafeInteger(number) || number <= 0) {
      throw new Error(`${label}必须是正整数`)
    }
    return number
  }
  const minutes = input.maxDurationMinutes.trim()
  const durationMs = Number(minutes) * 60000
  if (!/^\d+(?:\.\d+)?$/.test(minutes) || !Number.isSafeInteger(durationMs) || durationMs <= 0) {
    throw new Error('运行时长必须是有效正数，精确到毫秒且不能超出安全范围')
  }
  return {
    maxIterations: positiveInteger(input.maxIterations, '轮次上限'),
    maxDurationMs: durationMs,
    maxConsecutiveFailures: positiveInteger(input.maxConsecutiveFailures, '连续失败上限'),
    // 留空表示保留已有 token 上限，避免把删除表单文字误当作取消预算授权。
    ...(input.maxTokens.trim() ? { maxTokens: positiveInteger(input.maxTokens, 'Token 上限') } : {}),
  }
}

/** 展示与恢复前检查；运行准入的最终裁决仍由主进程 Controller 负责。 */
export function getGoalBudgetExhaustedReasons(goal: AgentGoalState): string[] {
  const reasons: string[] = []
  if (goal.iteration >= goal.limits.maxIterations) reasons.push('已达到轮次上限')
  if ((goal.elapsedMs ?? 0) >= goal.limits.maxDurationMs) reasons.push('已达到净运行时长上限')
  if (goal.limits.maxTokens !== undefined && (goal.usage?.totalTokens ?? 0) >= goal.limits.maxTokens) reasons.push('已达到 Token 上限')
  return reasons
}

const GOAL_SUBCOMMANDS = ['status', 'pause', 'resume', 'stop', 'clear'] as const

/**
 * 解析 `/goal` 输入（renderer 与 main 共用的唯一实现）。
 * 支持 Codex 式契约行标记（沿用 pi-harness @verify/@artifact 的声明式行标记传统）：
 *   /goal 完成登录页
 *   @verify: pnpm test:e2e login 通过
 *   @constraint: 不修改支付相关代码
 *   @stop: 需要生产环境凭据时
 * 标记行不进入 goal 文本本身。
 */
export function parseGoalCommand(input: string): AgentGoalCommand {
  const trimmed = input.trim()
  if (!/^\/goal(?:\s|$)/i.test(trimmed)) return { type: 'not_goal' }
  const rest = trimmed.replace(/^\/goal\s*/i, '').trim()
  if (!rest) return { type: 'invalid', reason: '目标不能为空，例如：/goal 完成登录页' }
  const single = rest.toLowerCase()
  if (!rest.includes('\n') && (GOAL_SUBCOMMANDS as readonly string[]).includes(single)) {
    return { type: single as 'status' | 'pause' | 'resume' | 'stop' | 'clear' }
  }
  if (/^[a-z]+$/.test(single)) {
    return { type: 'invalid', reason: `未知的 Goal 命令：${rest}` }
  }
  const { goal, contract } = parseGoalContractInput(rest)
  if (!goal) return { type: 'invalid', reason: '目标不能为空，契约标记之外需要一行目标描述' }
  return { type: 'start', goal, contract }
}

/**
 * 从 `/goal` 正文中分离目标文本与契约标记。
 * 每类契约标记取第一条有效行（≤240 字符），其余行视为目标描述。
 */
export function parseGoalContractInput(text: string): { goal: string; contract?: AgentGoalContract } {
  const goalLines: string[] = []
  const contract: AgentGoalContract = {}
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    const match = line.match(/^@(verify|constraint|constraints|stop):\s*(\S.*)$/i)
    if (match) {
      const value = match[2]!.trim()
      if (value.length <= 240) {
        const kind = match[1]!.toLowerCase()
        if (kind === 'verify' && !contract.verification) contract.verification = value
        else if (kind.startsWith('constraint') && !contract.constraints) contract.constraints = value
        else if (kind === 'stop' && !contract.stopWhen) contract.stopWhen = value
      }
      continue
    }
    goalLines.push(rawLine)
  }
  const goal = goalLines.join('\n').trim()
  const hasContract = Boolean(contract.verification || contract.constraints || contract.stopWhen)
  return { goal, contract: hasContract ? contract : undefined }
}

/**
 * 从展示文本中剥离 <goal_result> 机器协议块。
 * 仅兼容旧消息展示；main 不再把文本块视为可信控制报告。
 * 未闭合的尾部块（流式中途）一并剥离。
 */
export function stripGoalResultBlocks(text: string): string {
  return text.replace(/<goal_result>[\s\S]*?(<\/goal_result>|$)/gi, '').replace(/\n{3,}/g, '\n\n').trimEnd()
}

export const GOAL_UPDATE_TOOL_NAME = 'update_goal'

/** Goal 内部状态工具不应作为普通工具过程展示。 */
export function isGoalUpdateToolName(name: unknown): boolean {
  return name === GOAL_UPDATE_TOOL_NAME || name === `mcp__goal__${GOAL_UPDATE_TOOL_NAME}`
}

/** 判断 SDK user 消息是否为 Goal 迭代注入的控制消息（带 _goalIteration 标记） */
export function isGoalIterationMessage(message: unknown): boolean {
  return Boolean(message && typeof message === 'object' && (message as { _goalIteration?: unknown })._goalIteration != null)
}
