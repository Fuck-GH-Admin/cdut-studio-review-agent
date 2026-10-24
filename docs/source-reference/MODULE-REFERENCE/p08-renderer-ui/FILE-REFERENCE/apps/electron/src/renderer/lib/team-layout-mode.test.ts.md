---
path: apps/electron/src/renderer/lib/team-layout-mode.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: de16db726a682026113a05a27cc05d8c4181ca96
sha256: 2152f8d810ee430d79c6b2a6423098a3da6eddccea3e42efe45be3cad0230a83
lines: 12
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/team-layout-mode.test.ts

## 1. 测试目标

验证 `team-layout-mode.ts` 的两条常量导出：默认布局模式为 `'files'`，且持久化键为独立键 `'profer-team-layout-mode'`（team-layout-mode.test.ts:8）。测试框架 `bun:test`（:1）。本轮 `NOT_RUN`，纯静态阅读。

## 2. 用例清单

机械计数 `test(`=1、`it(`=0、`test.each(`=0，共 1 个用例：

1. `默认以文件为主，并使用独立的持久化键`（team-layout-mode.test.ts:8-11）。

## 3. 真实断言

- team-layout-mode.test.ts:9：`expect(DEFAULT_TEAM_WORKSPACE_LAYOUT_MODE).toBe('files')`。
- team-layout-mode.test.ts:10：`expect(TEAM_WORKSPACE_LAYOUT_MODE_STORAGE_KEY).toBe('profer-team-layout-mode')`。

## 4. 未覆盖与脆弱点

未覆盖 `'chat'` 模式成员的任何行为（类型联合另一成员 team-layout-mode.ts:3 无运行时验证）；未覆盖 `agent-atoms.ts:384-386` 的 `atomWithStorage` 持久化读写。脆弱点：两处字面量断言使常量合法重命名/改值必须同步改测试。无动态调用。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 用例数 1、断言行真实存在 | 已证实 | team-layout-mode.test.ts:8-11 |
| 测试运行结果 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| DEFAULT_TEAM_WORKSPACE_LAYOUT_MODE | §1/§3 | team-layout-mode.test.ts:9 | covered |
| TEAM_WORKSPACE_LAYOUT_MODE_STORAGE_KEY | §1/§3 | team-layout-mode.test.ts:10 | covered |
| TeamWorkspaceLayoutMode='chat' 分支 | §4 | — | unknown |
