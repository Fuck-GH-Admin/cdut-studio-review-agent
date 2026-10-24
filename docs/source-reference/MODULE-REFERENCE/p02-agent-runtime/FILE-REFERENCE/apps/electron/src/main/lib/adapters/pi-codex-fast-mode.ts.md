---
path: apps/electron/src/main/lib/adapters/pi-codex-fast-mode.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 66792f90fb9ff0bb0d9315a7508416151bb4301e
sha256: 0b7de9fab8633bed47e9ec2583fb1c866f1542f7c1c3be7d861a8b2d39061541
lines: 45
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-codex-fast-mode.ts

## 1. 结论与边界

为符合条件的 Codex Responses 请求附加 OpenAI `priority` service tier（Fast Mode）。Pi 扩展钩子位于实际请求 payload 构建之后，因此覆盖首轮、tool continuation、队列续轮与恢复会话后的全部 provider request（文件头注释 `apps/electron/src/main/lib/adapters/pi-codex-fast-mode.ts:12-17`）。薄文件（45 行）：payload 改写 + streamFn 选项包装 + Pi 内联扩展工厂。

## 2. 导出与关键符号

`export` 逐条核对：1 个常量 + 3 个函数 = 4 个导出（类/接口 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CODEX_FAST_MODE_SERVICE_TIER` | 常量（导出） | 6 | `'priority'` | |
| `injectCodexFastMode` | 函数（导出） | 18-26 | `(payload:unknown)=>unknown` | 改写 provider payload |
| `withCodexFastModeServiceTier` | 函数（导出） | 33-35 | `<T>(options:T)=>T&{serviceTier:'priority'}` | streamFn 选项包装 |
| `createCodexFastModeExtension` | 函数（导出） | 38-45 | `()=>(pi:ExtensionAPI)=>void` | Pi 内联扩展 |
| `ProviderPayload`/`isProviderPayload` | 内部 | 4,8-10 | 非数组对象守卫 | |

## 3. 内部逻辑与关键流程

- `injectCodexFastMode`（`:18-26`）：非对象 payload 原样返回；`payload.model` 非 `isCodexFastModeSupportedModel`（`@profer/shared`）命中即原样返回；否则 `{...payload, service_tier:'priority'}`。注释强调 Fast Mode 是明确用户选择，**必须覆盖**先加载用户扩展写入的 tier，避免 UI 显示 Fast 而请求退化 default/flex（`:23-24`）。
- `withCodexFastModeServiceTier`（`:33-35`）：注释说明 Pi 公开 streamFn 类型未含 `serviceTier`，但运行时会完整传给 Codex Responses provider，让 Pi 按 priority tier 计算 `usage.cost` 与 Proma 预算守卫（`:28-32`）。
- `createCodexFastModeExtension`（`:38-45`）：`pi.on('before_provider_request',…)`；仅当 payload 变化时返回新对象，否则 `undefined`（幂等钩子语义，`:42`）。注释：内联扩展，Proma 不依赖用户安装第三方 Pi extension（`:37`）。

## 4. 调用者与调用链

入向（冻结树 grep）：Fast Mode 配置链（`pi-codex-request-settings.ts`/`pi-agent-adapter.ts` 装配处，见 §10）；测试：`apps/electron/src/main/lib/adapters/pi-codex-fast-mode.test.ts`（本批 118 行）。出向：`@earendil-works/pi-coding-agent`（`ExtensionAPI` 类型）、`@profer/shared`（`isCodexFastModeSupportedModel`）。

## 5. 数据 I/O、读写与副作用

纯函数 + 扩展工厂：无 IO/状态；副作用仅“注册 before_provider_request 钩子”（由调用方传入 `pi`）。

## 6. 分支、失败、取消与恢复

无抛错路径；分支=原样返回（非 payload/非支持模型/无变化）。无取消/恢复概念。

## 7. 权限与权威状态

无权限判定；`service_tier:'priority'` 覆盖语义以“用户显式选择”为权威（`:23-24`），模型资格由 `@profer/shared` 的 `isCodexFastModeSupportedModel` 判定。

## 8. 修改影响面

改 tier 值/覆盖语义影响 Fast Mode 请求与 Proma 计费（`usage.cost`）；影响 `pi-codex-fast-mode.test.ts` 断言与 Codex 设置链。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/adapters/pi-codex-fast-mode.test.ts`（118 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 覆盖既有 tier（用户显式选择） | 已证实 | `:23-25` |
| 非支持模型不动 payload | 已证实 | `:20-21` |
| 钩子幂等（无变化返回 undefined） | 已证实 | `:42` |
| 生产接线点 | 未知 | 本批未逐行核 adapter 装配 |
| `isCodexFastModeSupportedModel` 判定 | 未知（文件外） | `@profer/shared` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `injectCodexFastMode` | §3 | 18-26 | covered |
| `withCodexFastModeServiceTier` | §3 | 33-35 | covered |
| `createCodexFastModeExtension` | §3 | 38-45 | covered |
| 接线/模型判定 | §4,§10 | — | unknown |
