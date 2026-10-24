---
path: apps/electron/src/renderer/lib/product-feature-flags.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7a2240383dd2bc83378063371d7589b497611844
sha256: 68957bf797543d6cc3383355f7f1cd2fd6f121c2f5e6fd7e205d23d578e136ec
lines: 90
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/product-feature-flags.test.ts

## 1. 测试目标

钉死工作区产品可见性的**两种不可见**（用户收纳 `archived` / 团队开关 `TEAM_WORKSPACE_UI_ENABLED`）在所有 UI 入口的一致性：`isAgentWorkspaceVisible`、`getVisibleAgentWorkspaces`、`isAgentWorkspaceIdVisible` 三个纯函数的分支语义（文件头自述 `product-feature-flags.test.ts:1-6`）。被测对象 `./product-feature-flags`（`:8-12` 导入 3 函数）。

## 2. 用例清单

用例数与源码一致：15 个 `test(`（2 个 `describe`，9+6；grep 实测 `^\s*test\(`=15）。夹具（`:14-18`）：`personal`（活跃个人）、`personalArchived`（收纳）、`defaultWs`（slug=default）、`team`、`teamArchived`。依赖顺序：无（各用例独立，无 beforeEach/共享可变态）。

describe「工作区可见性」9 例（`:20-60`）：
1. `:21-23` 活跃个人可见——动作：`isAgentWorkspaceVisible(personal)`。
2. `:25-27` slug=default 不可见——动作：`isAgentWorkspaceVisible(defaultWs)`。
3. `:29-31` 已收纳不可见——`personalArchived`。
4. `:33-35` 团队被开关统一隐藏（当前关闭）——`team`。
5. `:37-39` 已收纳团队同样不可见——`teamArchived`。
6. `:41-43` 缺 `type` 旧数据按个人处理——`{} as {type?: undefined}`。
7. `:45-48` 过滤后只留活跃个人且保序——`getVisibleAgentWorkspaces([personal, defaultWs, personalArchived, team, teamArchived])`。
8. `:50-55` 返回新数组不改入参——同一数组引用比对与长度比对。
9. `:57-59` 空输入返回空数组。

describe「isAgentWorkspaceIdVisible」6 例（`:62-90`，共享 `workspaces = [personal, personalArchived, team]` `:63`）：
10. `:65-68` 空 id（null/undefined）视为可见。
11. `:70-72` 活跃个人 id 可见。
12. `:74-76` 收纳工作区 id 不可见（用途注释：拦截打开/更新其会话）。
13. `:78-80` 团队 id 不可见。
14. `:82-85` default id 可见（`listWithDefault` 追加 `defaultWs`，允许打开独立会话）。
15. `:87-89` 未知 id 可见（避免历史数据误判）。

## 3. 真实断言

全部 `expect` 直断言被测函数返回值（无 mock、无 snapshot）：
- `:22` `expect(isAgentWorkspaceVisible(personal)).toBe(true)`；`:26` `toBe(false)`；`:30` `toBe(false)`；`:34` `toBe(false)`；`:38` `toBe(false)`；`:42` 缺 type `{}` → `toBe(true)`。
- `:47` `expect(visible.map((w) => w.id)).toEqual(['p1'])`（保序+全过滤）。
- `:53` `expect(visible).not.toBe(input)` + `:54` `expect(input.length).toBe(2)`（引用独立性+入参不变）。
- `:58` `toEqual([])`。
- `:66-67` `isAgentWorkspaceIdVisible(null|undefined, workspaces)` 均 `toBe(true)`；`:71` `toBe(true)`；`:75` `toBe(false)`；`:79` `toBe(false)`；`:84` default id `toBe(true)`；`:88` 未知 id `toBe(true)`。

mock 边界：**无任何 mock/spy**——`bun:test` 直测真实实现（`:7`）；被测函数纯计算，无 Main/IPC 依赖。

## 4. 未覆盖与脆弱点

- 未覆盖：`type` 为 `'team'` 以外未来枚举值；`slug` 为 'default' 以外特殊值；`archived: false` 显式字段；`workspaceId` 为空串 `''`（实现 `:36` 用 falsy 判定，空串将走 `find` 分支——未断言）。
- 脆弱点：用例 4 的标题断言绑定当前开关值 `false`（`product-feature-flags.ts:9`）——若开关改回 `true`，`team` 用例（`:33-35`）将失败，属**故意的开关哨兵**而非缺陷。
- 夹具 `type` 用 `as const` 字面量（`:14-18`），不含真实 `AgentWorkspace` 全形状（如 `id` 真实格式）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 用例的设置/动作/断言逐条（见 §2/§3） | 已证实 | `product-feature-flags.test.ts:21-89` 逐行读 |
| 无 mock、直测真实实现 | 已证实 | `:7` 仅 `bun:test` 导入，全文无 `mock`/`spy` 字样 |
| 「一个开关决定所有入口一致性」的产品意图 | 推断 | `:2-5` 注释自述；入口一致性由各消费点测试间接保证，非本文件断言 |
| 测试运行状态 | 未知 | NOT_RUN：本轮未执行 `bun test`/typecheck/build/GUI，不得视为已通过 |

## 6. 覆盖表

| 用例/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isAgentWorkspaceVisible` 5 分支+缺 type | §2/§3 | 21-43 | covered |
| `getVisibleAgentWorkspaces` 3 例 | §2/§3 | 45-59 | covered |
| `isAgentWorkspaceIdVisible` 6 例 | §2/§3 | 65-89 | covered |
| 空串 id 分支 | §4 | — | unknown（未断言） |
| 开关=true 路径 | §4 | — | unknown（当前固定 false） |
