---
path: apps/electron/src/main/lib/review/review-v3-t01-model-draft-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cd1206618f3bda4ee97d0cab818a3545ad60a8c6
sha256: b86ddbcaf7201b6db8c5cc35e7ba9c9b5b1a5f0899c0975fb7fdd827731d201f
lines: 56
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t01-model-draft-service.ts

## 1. 结论与边界

T01 受控模型起草端口（文件头 `apps/electron/src/main/lib/review/review-v3-t01-model-draft-service.ts:1-10`）：渲染层只提交 prompt 文本，**模型渠道与凭据留在 Main**——由 Main 解析审核网关渠道、复用既有 `chatCompletion`，返回原始文本。唯一导出函数 `requestT01ModelDraft`。

边界：**不做**输出解析/结构与安全校验（"由 T01 自己的 `parseT01ModelDraftResponse` 做"，`:7-9` 注释明确"绝不把模型输出当成已确认模板"）；不持久化；不新建 Provider 调用（复用 `review-model-gateway`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `T01ModelDraftResult` | interface（export） | `:13-19` | `{ raw: string; channelName: string; modelId: string }` | raw 未做业务解释（`:14`） |
| `T01ModelDraftInput` | interface（export） | `:21-24` | `{ system: string; user: string }` | 两段 prompt |
| `requestT01ModelDraft` | function（export） | `:31-56` | `(input) => Promise<T01ModelDraftResult>` | 唯一运行入口 |
| `T01_MAX_OUTPUT_CHARS` | const（内部） | `:27` | `60_000` | 超长判定跑偏 |
| `T01_DRAFT_TIMEOUT_MS` | const（内部） | `:29` | `120_000` | 单次起草超时 |

## 3. 内部逻辑与关键流程

`requestT01ModelDraft`（`apps/electron/src/main/lib/review/review-v3-t01-model-draft-service.ts:31-56`）按序：

1. prompt 校验：`system/user` trim 后任一为空 → `throw Error('T01_MODEL_PROMPT_REQUIRED')`（`:32-34`）。
2. 渠道解析：`resolveReviewGatewayChannel()`（`review-model-gateway.ts:246`）返回 falsy → `throw Error('T01_MODEL_GATEWAY_UNAVAILABLE')`（`:36-37`）。
3. 调用：`chatCompletion(resolved.channel, [system, user], { timeoutMs: 120_000 })`（`:39-46`，`chatCompletion` 定义 `review-model-gateway.ts:269`）。
4. 输出校验：空/全空白 → `'T01_MODEL_EMPTY_RESPONSE'`（`:48`）；长度 > 60_000 → `'T01_MODEL_RESPONSE_TOO_LONG'`（`:49`）。
5. 返回 `{ raw, channelName: resolved.channel.name, modelId: resolveReviewGatewayModelId(resolved.channel) }`（`:51-55`）。

分支共 4 个 throw + 1 正常返回；无 catch（错误直接上抛给 IPC 层）。

## 4. 调用者与调用链

- **入向**：`apps/electron/src/main/lib/review/review-ipc.ts:977-981`（`ipcMain.handle(REVIEW_IPC_CHANNELS.T01_MODEL_DRAFT …)`，handler 内 `require` 本模块并调用，`:980-981`）；preload 桥 `apps/electron/src/preload/index.ts:4947`（`requestT01ModelDraft`）。渲染层消费者（经 preload）：`apps/electron/src/renderer/components/content-review/ReviewV3TemplateRoutingAssistant.tsx`、`content-review/TemplateWizardPanel.tsx`、`onboarding/ReviewFirstUseReadiness.tsx`（全树检索命中）。
- **出向**：`./review-model-gateway` 的 `resolveReviewGatewayChannel`（`:246`）、`chatCompletion`（`:269`）、`resolveReviewGatewayModelId`（`:198`），导入行 `:11`。无动态调用。

## 5. 数据 I/O、读写与副作用

- 输入：两段 prompt 文本（渲染层可构造）；输出：原始文本 + 渠道/模型名。
- 副作用：一次网络模型请求（经 `chatCompletion`，凭据由网关内部注入，本文件不触碰）；无磁盘/缓存/日志。
- 并发：无状态函数，多次调用互不影响；无幂等键（重复调用产生多次模型计费，由调用方控制）。
- 无重试（文件头 `:6`"不新建第二套 Provider 调用"；代码内无循环）。

## 6. 分支、失败、取消与恢复

- 4 个显式失败（§3）均为同步 `throw new Error('<CODE>')`，错误码字符串即契约（`T01_MODEL_PROMPT_REQUIRED`/`T01_MODEL_GATEWAY_UNAVAILABLE`/`T01_MODEL_EMPTY_RESPONSE`/`T01_MODEL_RESPONSE_TOO_LONG`）。
- 超时/网络失败由 `chatCompletion` 内部行为决定（实现在 review-model-gateway，跨批未逐行读；`timeoutMs` 传入 `:45`）——本文件不 catch、不重试。
- 取消：无 AbortSignal 接口（签名 `:31` 仅 input）；调用方无法中途取消（已证实自签名）。
- 恢复：无状态、无持久痕迹，失败后可直接重发。

## 7. 权限与权威状态

- 本文件无 sender/role 检查；权限由入口层承担（`review-ipc.ts:977` handler 是否有 sender 校验属 review-ipc 主手册范围，本处不推定）。
- 权威状态：渠道/凭据选择权在 Main（文件头 `:4-5` 明确"模型渠道与凭据全部留在 Main"）；返回的 `channelName/modelId` 是"供界面如实展示"的事实（`:16`），不构成业务确认。

## 8. 修改影响面

- 改返回结构/错误码 → `review-ipc.ts:977-981` 的 handler 与渲染层 3 个消费组件（§4）。
- 改渠道解析 → `review-model-gateway.ts`（跨批）；改 prompt 契约 → T01 调用方（TemplateWizardPanel 等）与 `parseT01ModelDraftResponse`（T01 侧，不在本文件）。
- 常量（60k/120s）改动无测试锁定（§9）。

## 9. 测试证据

- **直接测试：无**。负向检索：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `requestT01ModelDraft|T01ModelDraft` → 0 命中。
- 间接：无（`review-ipc` 相关测试未覆盖本函数体）。
- 未覆盖：4 个错误分支、长度/超时常量、返回字段均无断言。本轮 **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出函数 + 2 接口 + 2 常量；4 失败分支 | 已证实 | 逐行读 `:1-56` |
| IPC 链（review-ipc handler → preload → 3 渲染消费者） | 已证实 | `review-ipc.ts:977-981`、`preload/index.ts:4947` |
| 不做解析/不重试/无取消 | 已证实 | `:7-9` 注释 + 签名 `:31` + 全文无循环 |
| `chatCompletion` 超时与凭据注入行为 | 未知 | `review-model-gateway.ts` 跨批未逐行读 |
| handler 层 sender 校验 | 未知 | review-ipc 主手册范围 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `requestT01ModelDraft` 全分支 | §3/§6 | `:31-56` | covered |
| 2 接口 + 2 常量 | §2 | `:13-29` | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
| chatCompletion 内部行为 | §10 | — | unknown |
