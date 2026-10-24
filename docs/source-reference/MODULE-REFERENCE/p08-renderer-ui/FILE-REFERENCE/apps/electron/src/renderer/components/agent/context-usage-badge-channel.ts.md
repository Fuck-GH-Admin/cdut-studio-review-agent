---
path: apps/electron/src/renderer/components/agent/context-usage-badge-channel.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5fa92e5bce28e65f005f816736cbfb81105dafb4
sha256: 08dd5fc90867095314eb6d56bf722f7941ae5aa7be8805a6c0bc0c921b5bd690
lines: 9
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/context-usage-badge-channel.ts

## 1. 结论与边界

额度徽标渠道选择（文件头 `apps/electron/src/renderer/components/agent/context-usage-badge-channel.ts:1-3`）：优先本轮有效渠道；切换初始化短暂为空时**保留最近稳定值**，避免额度查询/工具栏闪烁。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数 = 1 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `resolvePlanQuotaChannelId` | 函数（导出） | 4-8 | `(current,lastStable)=>string\|undefined` | `current ?? lastStable ?? undefined`（`:7`） |

## 3. 内部逻辑与关键流程

单行三值回退（`:7`）；无其它分支。

## 4. 调用者与调用链

入向：额度徽标/工具栏（renderer）；测试：`context-usage-badge-channel.test.ts`（16 行，本批）。出向：无。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

三值回退即全部语义；无失败/取消概念。

## 7. 权限与权威状态

渠道优先级权威=「本轮有效 > 最近稳定 > 无」。

## 8. 修改影响面

影响额度查询触发与徽标稳定性。

## 9. 测试证据

直接测试：`context-usage-badge-channel.test.ts`（16 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三值回退语义 | 已证实 | `:1-8` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单函数 | §2,§3 | 4-8 | covered |
