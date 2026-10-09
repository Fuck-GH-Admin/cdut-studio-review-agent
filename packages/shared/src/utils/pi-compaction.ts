/**
 * Pi 自动压缩（SWE-Compressor 32k 封顶）。
 *
 * 参考论文：未受控的 ReAct 智能体上下文按 O(N^2) 膨胀；把活跃上下文稳稳压在
 * 约 32k tokens 天花板内，可显著降低单轮成本并提升成功率。因此不再使用「窗口占比 80%」
 * 这类对大窗口模型极其危险的阈值（128k 需累积到约 10 万才压缩），改为绝对红线：
 * 一旦活跃上下文达到 28k~32k 区间立即触发滚动压缩。
 */

/** 活跃上下文绝对上限（tokens）：无论上下文窗口多大（128k/200k/1M），都以此为天花板。 */
export const PI_AUTO_COMPACTION_MAX_TOKENS = 32_000

/** 滚动压缩触发点（tokens）：达到该占用即开始压缩。 */
export const PI_AUTO_COMPACTION_TRIGGER_TOKENS = 28_000

/**
 * @deprecated 旧「窗口占比」阈值已废弃，保留仅为兼容既有导出；
 * 请改用 PI_AUTO_COMPACTION_MAX_TOKENS / PI_AUTO_COMPACTION_TRIGGER_TOKENS。
 */
export const PI_AUTO_COMPACTION_THRESHOLD_RATIO = 0.8

/**
 * 将目标占用换算为 Pi SDK 的 reserveTokens 配置。
 *
 * Pi 在 `contextTokens > contextWindow - reserveTokens` 时自动压缩，因此：
 * - 大窗口（> 32k）：预留 `contextWindow - 28k`，使触发点稳定落在 28k 附近；
 * - 小窗口（≤ 32k）：退化为预留 25%，保留原有安全边界。
 */
export function calculatePiAutoCompactionReserveTokens(contextWindow: number): number {
  if (!Number.isFinite(contextWindow) || contextWindow <= 0) {
    throw new TypeError('Pi context window must be a positive finite number')
  }

  if (contextWindow > PI_AUTO_COMPACTION_MAX_TOKENS) {
    return contextWindow - PI_AUTO_COMPACTION_TRIGGER_TOKENS
  }
  return Math.ceil(contextWindow * 0.25)
}

/** 返回 Pi SDK 会开始自动压缩的上下文 token 阈值。 */
export function calculatePiAutoCompactionThresholdTokens(contextWindow: number): number {
  return contextWindow - calculatePiAutoCompactionReserveTokens(contextWindow)
}
