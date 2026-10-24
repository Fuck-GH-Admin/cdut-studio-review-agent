---
path: apps/electron/src/main/lib/error-patterns.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4ee7d5040f66e32a0c411f72f04e1280d23bfde7
sha256: 646691656adbfe952d95d2d0ed8383ae2d45e558fde5a3b8512d9a64e19c7969
lines: 195
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/error-patterns.ts

## 1. 结论与边界

**瞬时网络错误模式与细分类**（195 行）：覆盖上游 API 断流/抖动/解析失败/中文瞬时文案；命中走"保留 resume 的自动重试，**不清除 sdkSessionId**（#903）"（`:8`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `TRANSIENT_NETWORK_PATTERN` | `:15-16` | 大正则（terminated/ECONNRESET/AbortError/stream ended before… 等） |
| `isTransientNetworkError` | `:19-25` | message/stderr 双查 |
| `NetworkErrorCategory` | `:41-48` | 7 类细分（dns/connection_refused/connection_reset/timeout/stream_interrupted/parse_error/unknown） |
| `classifyNetworkError` | `:76-103` | **优先级链**（parse_error>stream_interrupted>timeout>dns>refused>reset>unknown `:69-70`） |
| `getCategoryRetryDelayMultiplier` | `:114-128` | 差异化退避（stream 0 立即/dns×2/timeout×1.5） |
| `MALFORMED_RESPONSE_PATTERN`/`isMalformedResponseError` | `:139-140`/`:143-149` | JSON 解析失败（JSC+V8 措辞） |
| `TRANSIENT_UPSTREAM_TEXT_PATTERN`/`isTransientUpstreamText` | `:158`/`:161-167` | 中文瞬时文案（**与 pi-ai patch 对齐** `:154-156` 防重试预算浪费） |
| `isEphemeralTransportError` | `:175-178` | 传输层瞬时故障（不入会话历史 `:172-173`） |
| `isRecoveredEphemeralTransportError` | `:189-195` | **仅已恢复的断流才丢弃**（尾部失败卡必须保留防"一闪就没了" `:183-185`） |

## 3. 内部逻辑与关键流程

模式族+分类优先级链+退避乘数+两级丢弃判定（recoveredLater 门）。

## 4. 调用者与调用链

Orchestrator 重试/错误卡渲染层；被 `error-patterns.test.ts`（24 个 `test(`+4 个 test.each）覆盖。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

空输入→unknown；双源（message/stderr）任一命中。

## 7. 权限与权威状态

- **#903 红线**（`:8`）：瞬时错误不清 sdkSessionId。
- **丢弃门**（`:183-185`）：只有后续有正常产出才丢弃断流卡。
- **pi-ai patch 口径一致契约**（`:154-156`）。

## 8. 修改影响面

改正则影响重试判定面；测试 55 动态用例锁定。

## 9. 测试证据

`error-patterns.test.ts`（同批，24 个 `test(`+4 个 `test.each` 生成 31 参数化用例）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录，主根自读兜底）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/三红线/分类链 | 已证实 | 195 行全读 |
| **照实**：`:100` TRANSIENT_NETWORK_PATTERN 兜底分支返回 'unknown' 与 `:102` 等价（冗余非矛盾） | 已证实 | `:99-102` |
| pi-ai patch 对齐实现 | 未知 | 不在本批 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
