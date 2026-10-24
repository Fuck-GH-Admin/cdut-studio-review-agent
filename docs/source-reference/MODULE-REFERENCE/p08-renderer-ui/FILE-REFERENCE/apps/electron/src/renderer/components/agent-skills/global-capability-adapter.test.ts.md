---
path: apps/electron/src/renderer/components/agent-skills/global-capability-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5ad3e6ce98f03b03ed7a030ea44b08fafc4000f6
sha256: 8b8d56155652fc22ffde0e9cf9c5a47c1561897d59c0bed2d8c00b750e270788
lines: 55
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent-skills/global-capability-adapter.test.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 测试目标

全局能力 renderer adapter：预设引用 scope 保真（全局/工作区不互混）、真实 adapter 逐方法委派 preload。

## 2. 用例清单

3 用例 / 1 describe（`全局能力 renderer adapter` :5）。mock `window.electronAPI`（`Object.defineProperty(globalThis,'window')`）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 全局预设显式 scope 保真 | 6-13 | `{presetId:'global-review',presetScope:'user-global'}`（不带 workspaceSlug） |
| 2 | 工作区候选携带 slug | 15-22 | `{presetId,presetScope:'workspace',workspaceSlug:'demo'}` |
| 3 | 真实 adapter 委派链 | 24-53 | list 映射 `{id:'skill-1',domain:'skill',scope:'user-global',readOnly:false}`；calls 序列 `copy-skill:skill-1:workspace-a → enabled:workspace-a:skill-1:false → restore:workspace-a:skill-1 → delete-skill:skill-1` |

## 3. 真实断言

如 §2 表（逐条读自 :6-53）。用例 3 覆盖 getImpact（无断言但执行不抛）。

## 4. 未覆盖与脆弱点

- 未覆盖：preset 侧委派（deleteGlobalAgentPreset/copyPreset/rebind*）、`presetItem` throw 守卫、preload 缺方法失败路径。
- 脆弱点：全局 window mock 未恢复（单文件内无害）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例断言如 §2 | 已证实 | 本文件逐行 |
| skill 侧委派被固定 | 已证实 | 用例 3 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| `referenceForPresetCandidate` | §2 | covered |
| skill 侧 adapter 委派 | §2 | covered |
| preset 侧委派/throw 守卫 | §4 | unknown（未测） |
