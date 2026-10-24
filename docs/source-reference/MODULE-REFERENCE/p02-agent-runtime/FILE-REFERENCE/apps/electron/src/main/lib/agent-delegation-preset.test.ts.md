---
path: apps/electron/src/main/lib/agent-delegation-preset.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 659d85a586fe8665c0f0c5870dab8cd7f4856591
sha256: 7066e1ff8a4c5fa8fc199dcd255a401e2b01e7eb35acff06a33a7b9abcf2f187
lines: 144
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-delegation-preset.test.ts

## 1. 测试目标

验证 `apps/electron/src/main/lib/agent-delegation-preset.ts` 的 `resolveDelegationPreset`：目标/父引用/presetId 三级继承优先级、工作区预设归属校验（缺 slug、跨工作区拒绝、同工作区允许）、禁用全局预设拒绝、全局引用禁带 workspaceSlug、无候选返回 undefined。使用真实 `agent-preset-manager` + tmp 文件系统。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 9（`test(` 计数：:38/:52/:64/:75/:85/:104/:116/:127/:138），1 个 describe（:37）。公共设置：`beforeEach` 建 tmp 目录并 `__setAgentPresetsBaseDirForTest(tmpDir)`（:17-20）；`afterEach` `__resetAgentPresetsBaseDirForTest()` + `rmSync` 清理（:22-25）；`parent()` 工厂（:27-35）。

| # | 用例（行） | 设置 | 动作 | 断言 |
| --- | --- | --- | --- | --- |
| 1 | 继承父稳定引用（:38） | parent 带 `presetReference` | 无 target 解析 | `result?.reference` toEqual 引用、`preset.id==='code'`（:48-49） |
| 2 | 旧父仅 presetId 转换（:52） | parent 仅 `presetId:'minimal'` | 解析 | `toMatchObject({presetId:'minimal', presetScope:'builtin-meta'})`（:58-61） |
| 3 | 显式目标覆盖（:64） | parent presetId 'minimal' | target builtin 'code' | `reference.presetId==='code'`、`preset.id==='code'`（:71-72） |
| 4 | workspace 目标缺 slug 抛错（:75） | target workspace 无 slug | 解析 | `toThrow('目标工作区预设必须提供 workspaceSlug')`（:82） |
| 5 | 同工作区允许（:85） | `createAgentPreset('workspace-a', …)` 真实创建 | target 指向该 preset | `preset.id` 相等、`reference.workspaceSlug==='workspace-a'`（:100-101） |
| 6 | 跨工作区拒绝（:104） | parent presetId 'code' | target workspace slug 'workspace-b' | `toThrow('目标工作区预设不属于父会话工作区')`（:113） |
| 7 | 禁用全局预设拒绝（:116） | `createGlobalAgentPreset` + `disableGlobalPresetInWorkspace('workspace-a', ref)` | target 该引用 | `toThrow('当前工作区')`（:124，子串） |
| 8 | 全局引用禁带 slug（:127） | target builtin 'code' 带 workspaceSlug | 解析 | `toThrow('全局预设引用不得携带 workspaceSlug')`（:135） |
| 9 | 无父预设无目标（:138） | parent 空 | 解析 | `toBeUndefined()`（:142） |

依赖顺序：独立（每用例重置 baseDir）；#5/#7 依赖真实 preset-manager 落盘（tmp 目录）。

## 3. 真实断言

- `:48-49`：`expect(result?.reference).toEqual(reference)`、`expect(result?.preset.id).toBe('code')`。
- `:58-61`：`expect(result?.reference).toMatchObject({ presetId: 'minimal', presetScope: 'builtin-meta' })`。
- `:71-72`：`expect(result?.reference.presetId).toBe('code')`、`expect(result?.preset.id).toBe('code')`。
- `:82`：`expect(() => resolveDelegationPreset({...})).toThrow('目标工作区预设必须提供 workspaceSlug')`。
- `:100-101`：`expect(result?.preset.id).toBe(preset.id)`、`expect(result?.reference.workspaceSlug).toBe('workspace-a')`。
- `:113`：`expect(() => …).toThrow('目标工作区预设不属于父会话工作区')`。
- `:124`：`expect(() => …).toThrow('当前工作区')`。
- `:135`：`expect(() => …).toThrow('全局预设引用不得携带 workspaceSlug')`。
- `:142`：`expect(resolveDelegationPreset({...})).toBeUndefined()`。

## 4. 未覆盖与脆弱点

- 未覆盖：`presetVersion` 匹配语义、`presetReferenceForId` 对未知 presetId 行为、builtin-meta 预设内容、被调方（`normalizePresetReference`/`getAgentPresetByReference`）其它错误分支、并发/损坏的 preset 存储。
- 脆弱点：#7/#8 的 toThrow 是子串匹配——实际抛错发生在被调方（`agent-preset-manager.ts`），若抛错文案前缀变化或被替换为其它错误，测试可能仍绿/假红；#5/#7 依赖测试专用注入口 `__setAgentPresetsBaseDirForTest`，若注入口失效会写真实用户配置目录（tmpdir 隔离是唯一防线）。
- mock/真实边界：preset-manager 真身 + tmp 文件系统；无 IPC/会话存储；`AgentSessionMeta` 用最小工厂对象（:27-35，仅 id/title/时间戳 + overrides）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例计数与 `test(` 一致 | 已证实 | :38-138 |
| 断言行如 §3 | 已证实 | 逐行读 :48-142 |
| 优先级/越界/禁用/undefined 行为均被断言 | 已证实 | #1-#9 |
| #7/#8 错误来源在被调方 | 已证实 | 本文件无对应 throw；测试断言文案与 `agent-preset-manager` 行为一致（实现未逐行读） |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 继承优先级（target/parent.ref/parent.id） | #1/#2/#3 | covered |
| 校验 A/B/C | #4/#6 | covered |
| 同工作区允许 | #5 | covered |
| 被调方拒绝（禁用/带 slug） | #7/#8 | covered（子串断言） |
| 无候选 undefined | #9 | covered |
| presetVersion/损坏存储 | — | unknown |
