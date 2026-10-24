---
path: apps/electron/src/main/lib/adapters/pi-openai-reasoning-request-settings.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b3996ac978fd4070f132d1b9a22e5678523dc60b
sha256: 5d1902a3b4b84b33bce50c80dfdc6318d69167470cb21e8407aa55224c7a75f9
lines: 71
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-openai-reasoning-request-settings.ts

## 1. 结论与边界

对 Pi 已构造的 OpenAI Responses request body **补充会话级 reasoning effort**（运行时代码）：Pi 在 off 时可能省略 reasoning 字段、服务端默认非 none，故统一用 profile 的 encoding 明确写入目标 effort；Codex Fast Mode 的自定义 stream function 同样经此 hook（`apps/electron/src/main/lib/adapters/pi-openai-reasoning-request-settings.ts:24-30`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `OpenAIReasoningRequestSettings` | 导出接口 | 11-14 | `{profile?, thinkingLevel?}` | 设置 |
| `injectOpenAIReasoningLevel` | 导出函数 | 31-59 | `(payload: unknown, settings): unknown` | 注入 effort |
| `createOpenAIReasoningRequestExtension` | 导出函数 | 62-71 | `(settings) => (pi: ExtensionAPI) => void` | Pi inline 扩展 |

内部：`isProviderPayload`（`:16-18`）、`isReasoningPayload`（`:20-22`）。

## 3. 内部逻辑与关键流程

`injectOpenAIReasoningLevel`（`:31-59`）：payload 非对象原样返回（`:35`）；profile 缺省时 `resolveReasoningProfile({modelId, transport:'openai-responses'})`（`:38-41`）；encoding kind 非 `openai-reasoning-effort` 或无 thinkingLevel 原样返回（`:43`）；`normalizeReasoningLevel` 失败原样返回（`:46`）；effort 映射 `encoding.effortMap[normalizedLevel] ?? normalizedLevel`，null 原样返回（`:47-48`）；**剥离 `reasoning.mode`**（`:51-53` 注释：ChatGPT Codex OAuth 不接受 reasoning.mode）；`effort==='none'` 或原无 effort 时写入 effort（`:56`，已有 effort 不覆盖）。

`createOpenAIReasoningRequestExtension`（`:62-71`）：挂 `before_provider_request`，仅当 payload 变化时返回更新（`:68`，同引用返回 undefined）。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`（import 检索）。出向：`@earendil-works/pi-coding-agent`（ExtensionAPI 类型）、`@profer/shared`（normalizeReasoningLevel/resolveReasoningProfile 类型）。

## 5. 数据 I/O 与副作用

无（纯转换；hook 由 Pi 调度）。

## 6. 分支、失败与恢复

无 throw；5 处原样返回分支（`:35/:43/:46/:48`）。

## 7. 权限与权威状态

推理档位权威=`@profer/shared` 的 reasoning profile 编码（`resolveReasoningProfile`）；本文件只按 encoding 写字段。

## 8. 修改影响面

改注入逻辑影响 OpenAI Responses 全部会话的 reasoning 参数与 Codex Fast Mode。

## 9. 测试证据

无专属测试（冻结树 glob `**/pi-openai-reasoning*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+注入分支+mode 剥离 | 已证实 | `:11-71` |
| 消费者=pi-agent-adapter | 已证实 | import 检索 |
| 消费者=pi-agent-adapter | 已证实 | import 检索 |
| 服务端默认非 none | 推断 | `:27-29` 注释自述 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部 3 导出+分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
