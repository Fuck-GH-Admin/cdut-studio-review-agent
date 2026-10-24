---
path: apps/electron/src/renderer/components/onboarding/review-first-use-readiness.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e46341a3eafe6882481c180db109a61af3595ca2
sha256: c7ed32f902868d010c30dffc03a531304f9aee3d0d4d531800895b7fbed5fbb8
lines: 52
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/review-first-use-readiness.ts

## 1. 结论与边界

**首次审核准备与模型自检的纯函数层**（52 行）：审核模型白名单过滤、选择可用性判定、选择键、文本自检回执解读（严格 JSON 标记 + 身份一致性）。

边界：无状态、无 I/O；UI 在 `ReviewFirstUseReadiness.tsx`（域外）；`REVIEW_MODEL_PROVIDERS` 白名单来自 `@profer/shared`（注释 `:6`：与 Main 同一份，不把普通 Agent 渠道误列为审核出口）。

## 2. 导出与关键符号

导出计数：`export` **6 条**（`:4`、`:7`、`:13`、`:19`、`:23`、`:28`），与源码逐条一致。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewModelSelection` | 类型 | 4 | `ReviewModuleSettingsV2['agentModelSelection']` | |
| `eligibleReviewChannels` | 函数 | 7-11 | `(channels: readonly Channel[]) => Channel[]` | 白名单过滤 |
| `isReviewSelectionAvailable` | 函数 | 13-17 | `(channels, selection) => boolean` | 选择有效性 |
| `selectionKey` | 函数 | 19-21 | `(selection) => string` | `channelId\0modelId` |
| `ReviewTextProbe` | 类型 | 23-25 | `{status:'passed', channelName, modelId, identityConfirmed} \| {status:'failed', reason}` | |
| `interpretReviewTextProbe` | 函数 | 28-52 | `(result, gateway) => ReviewTextProbe` | 自检回执解读 |

## 3. 内部逻辑与关键流程

- **eligibleReviewChannels**（`:7-11`）：`channel.enabled === true` **且** `channel.provider ∈ REVIEW_MODEL_PROVIDERS` **且** 至少一个 `model.enabled !== false`。
- **isReviewSelectionAvailable**（`:13-17`）：`selection` 空 → **true**（未选择视为可用，不阻断）；否则存在「eligible 渠道 id 匹配且所选 model id 匹配且 enabled」。
- **selectionKey**（`:19-21`）：空选择 → `''`；否则 `` `${channelId}\u0000${modelId}` ``（NUL 分隔防 `('a','bc')` 与 `('ab','c')` 碰撞，测试 `:20` 固化）。
- **interpretReviewTextProbe**（`:28-52`）：
  1. `JSON.parse(raw.trim())`，必须是非数组对象且 `ready === 'CDUT_REVIEW_PROBE'`，否则 `failed`（「没有按约定返回 JSON 自检标记」/「不是有效 JSON」，`:33-40`）。
  2. `passed` 时 `identityConfirmed` = `gateway.available === true && gateway.channelName === result.channelName && Boolean(gateway.modelId) && gateway.modelId === result.modelId`（注释 `:46`：Main 回执与锁定出口不符时只能声称「请求成功」，不能宣称特定模型通过）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep review-first-use-readiness|eligibleReviewChannels|interpretReviewTextProbe|isReviewSelectionAvailable|selectionKey`，apps+packages 全类型）：
  - `apps/electron/src/renderer/components/onboarding/ReviewFirstUseReadiness.tsx:7-8` import 全部符号；`:47-50`（选项过滤/dirty 判定/两个可用性）；`:81` `setProbe(interpretReviewTextProbe(result, route))`（generation 防过期回写）；`:104-120`（`selectionKey` 做受控 select 值与禁用提示）。
  - `review-first-use-readiness.test.ts:3-5`（同批专属测试，3 用例）。
- 出向：`@profer/shared` 的 `REVIEW_MODEL_PROVIDERS`/类型（`:1-2`）。

## 5. 数据 I/O、读写与副作用

- 无 I/O、无副作用；纯函数。

## 6. 分支、失败、取消与恢复

- 全部分支列于 §3；`interpretReviewTextProbe` 的 JSON 解析失败走 catch 返回 `failed`（`:38-40`），不抛。
- 不适用：取消/恢复（纯函数）。

## 7. 权限与权威状态

- 无权限分支（纯函数）；语义上维护「审核出口」边界：白名单过滤防止把普通 Agent 渠道当审核模型（`:6` 注释）。
- 权威状态：`gateway: ReviewModelGatewayStatus`（Main 侧锁定的出口）用于身份一致性判定；probe 结果只信格式合规的回执。

## 8. 修改影响面

- 唯一消费者 `ReviewFirstUseReadiness.tsx`（选择器/自检流程）。
- `REVIEW_MODEL_PROVIDERS`（shared）变更影响 eligible 集合。
- 测试：`review-first-use-readiness.test.ts`（3 用例）直接覆盖全部 4 个函数。

## 9. 测试证据

- 直接测试：`review-first-use-readiness.test.ts`（40 行，`bun:test`，**3 test**，NOT_RUN）——①白名单过滤+选择可用性+key 防碰撞（`:14-21`，含 `provider:'anthropic'` 渠道被排除、禁用模型 `m2` 不可用）；②严格 JSON 自检通过且身份一致（`:23-28`，`toEqual({status:'passed',...,identityConfirmed:true})`）；③回执型号不一致 `identityConfirmed:false`、非 JSON `failed`（`:30-39`）。断言逐条引用见同批测试手册。
- 未覆盖：`selection` 空 → true 分支、`gateway.available:false` 分支、`ready` 字段缺/数组输入。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/真实模型请求；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出与签名 | 已证实 | `:4-28` |
| 白名单三条件过滤 | 已证实 | `:7-11` |
| NUL 分隔 key 防碰撞 | 已证实 | `:19-21` |
| 严格 JSON 标记 + 身份一致性 | 已证实 | `:28-52` |
| 空选择视为可用 | 已证实 | `:14` |
| 3 用例断言 | 已证实 | `review-first-use-readiness.test.ts:13-39` |
| 真实模型自检行为 | 未知 | NOT_RUN |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `eligibleReviewChannels` | §3/§9 | 7-11 | covered |
| `isReviewSelectionAvailable` | §3/§9 | 13-17 | covered |
| `selectionKey` | §3/§9 | 19-21 | covered |
| `interpretReviewTextProbe` | §3/§9 | 28-52 | covered |
| 空选择/gateway 不可用分支 | §9 | 14,47-50 | partial（无用例） |
| 运行结果 | §10 | — | unknown（NOT_RUN） |
