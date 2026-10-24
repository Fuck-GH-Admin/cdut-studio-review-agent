---
path: apps/electron/src/main/lib/adapters/pi-deepseek-reasoning-request-settings.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a496332a9a4bb2a3df669b5f48bb1d6159b76777
sha256: 6bacbba02175119c1b494fe0e2d2da14a3bb4f89795c3c81a29a45f654389e98
lines: 66
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-deepseek-reasoning-request-settings.ts

## 1. 结论与边界

把 Pi 通用 Anthropic extended-thinking 请求体重写为 DeepSeek V4 的 Anthropic 兼容协议：DeepSeek 忽略 `thinking.budget_tokens`，强度必须由 `output_config.effort` 承载（文件头注释 `apps/electron/src/main/lib/adapters/pi-deepseek-reasoning-request-settings.ts:20-24`）。薄文件（66 行）：payload 改写 + Pi 内联扩展工厂。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 2 个函数 = 3 个导出（类/常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DeepSeekReasoningRequestSettings` | 接口（导出） | 11-14 | `{profile?:ReasoningProfile,thinkingLevel?:AgentThinkingLevel}` | |
| `injectDeepSeekReasoningLevel` | 函数（导出） | 25-54 | `(payload,settings)=>unknown` | 请求体重写 |
| `createDeepSeekReasoningRequestExtension` | 函数（导出） | 57-66 | `(settings)=>(pi:ExtensionAPI)=>void` | 内联扩展 |
| `ProviderPayload`/`isProviderPayload` | 内部 | 7,16-19 | 非数组对象守卫 | |

## 3. 内部逻辑与关键流程

`injectDeepSeekReasoningLevel`（`:25-54`）：

1. 非对象 payload 原样返回（`:27`）。
2. `profile = settings.profile ?? resolveReasoningProfile({modelId,transport:'anthropic-messages'})`（`:30-33`）；`encoding=profile?.encodings['anthropic-messages']`；仅当 `encoding.kind==='deepseek-output-effort'` **且** `settings.thinkingLevel` 存在才继续，否则原样返回（`:34-35`）。
3. `normalizedLevel=normalizeReasoningLevel(profile,thinkingLevel)`；无归一化值原样返回（`:37-38`）。
4. 剥离上游 `thinking`/`output_config`（`:40`）；`off` → `{...body, thinking:{type:'disabled'}}`（`:41-43`）；否则 `effort=encoding.effortMap[level]` 非字符串原样返回（`:45-46`），返回 `{...body, thinking:{type:'enabled'}, output_config:{effort}}`（`:47-51`）。

`createDeepSeekReasoningRequestExtension`（`:57-66`）：`pi.on('before_provider_request')`，无变化返回 `undefined`（`:61-62`）。

## 4. 调用者与调用链

入向：DeepSeek reasoning 配置装配（`pi-agent-adapter.ts` 扩展链，见 §10）；测试：本批无专属测试文件（scope 内 `pi-deepseek-reasoning-request-settings` 无 `.test.ts`；`pi-agent-adapter.test.ts` 可能间接覆盖）。出向：`@earendil-works/pi-coding-agent`（`ExtensionAPI`）、`@profer/shared`（`normalizeReasoningLevel`/`resolveReasoningProfile`/类型）。

## 5. 数据 I/O、读写与副作用

纯函数 + 扩展工厂：无 IO/无持久状态；副作用仅“向传入 pi 注册 before_provider_request 钩子”（由调用方提供 pi 实例）。

## 6. 分支、失败、取消与恢复

无抛错；分支=原样返回（非对象/非 deepseek 编码/无 thinkingLevel/归一化失败/effortMap 非字符串）。`off` 显式禁用（`:41-43`）。无取消概念。

## 7. 权限与权威状态

强度语义由 `@profer/shared` 的 reasoning profile/编码表权威决定；本文件只做协议转写，不猜级别映射（effortMap 未命中即不改写）。

## 8. 修改影响面

改转写语义影响 DeepSeek V4 请求体与思考计费/行为；影响 `pi-agent-adapter` 装配与共享 reasoning 编码表契约。

## 9. 测试证据

本批**无专属测试**（scope 未含）；间接：`pi-agent-adapter.test.ts`（185 行）可能覆盖扩展链（其手册记录）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| budget_tokens→effort 协议转写 | 已证实 | `:20-24,40-51` |
| off 显式禁用 | 已证实 | `:41-43` |
| 未命中映射不动 payload | 已证实 | `:34-35,45-46` |
| 钩子幂等 | 已证实 | `:61-62` |
| 生产接线 | 未知 | 本批未逐行核 |
| 测试覆盖 | 未知 | 无专属测试文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `injectDeepSeekReasoningLevel` | §3 | 25-54 | covered |
| `createDeepSeekReasoningRequestExtension` | §3 | 57-66 | covered |
| 接线/测试 | §9,§10 | — | unknown |
