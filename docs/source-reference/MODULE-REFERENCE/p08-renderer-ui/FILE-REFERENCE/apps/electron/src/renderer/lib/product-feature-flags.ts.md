---
path: apps/electron/src/renderer/lib/product-feature-flags.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4a6bd6bcc6d0146da86e54befb996a7cc8f92ba5
sha256: a561b51033878ed9bc1fac178c8cac00c41b80490bdb80ea3ec40a1e5276f11f
lines: 40
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/product-feature-flags.ts

## 1. 结论与边界

工作区**产品入口可见性**的单一判定层：一个硬编码产品开关 `TEAM_WORKSPACE_UI_ENABLED`（当前 `false`）+ 三个纯判定函数，统一决定侧边栏切换器、TabSwitcher、规划中心、自动化表单等入口显示/拦截哪些工作区（`product-feature-flags.ts:3-8,11-17`）。

边界：只控 renderer 产品入口，**不删除团队数据、IPC 或服务端能力**（`:6`）；不管理工作区数据本身（来源是 `agentWorkspacesAtom` 等，见 §4 消费点）；`archived` 收纳状态的写入方不在本文件。类型 `AgentWorkspace` 来自 `@profer/shared`（`:1`，纯 type import）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TEAM_WORKSPACE_UI_ENABLED` | 导出常量 | 9 | `false`（字面量） | 暂时隐藏团队工作区的产品开关；恢复入口=改回 `true` 重新构建（`:4-8` 注释） |
| `isAgentWorkspaceVisible` | 导出函数 | 18-24 | `(workspace: Pick<AgentWorkspace,'type'> & {slug?; archived?}) => boolean` | 单个工作区是否进入产品入口 |
| `getVisibleAgentWorkspaces` | 导出泛型函数 | 26-30 | `<T>(workspaces: readonly T[]) => T[]` | 过滤可见工作区，保序返回新数组 |
| `isAgentWorkspaceIdVisible` | 导出函数 | 32-40 | `(workspaceId: string\|null\|undefined, workspaces) => boolean` | 按 id 判可见（打开/更新会话的守卫） |

导出计数：4（常量 1，函数 3，类型 0）；无内部函数。

## 3. 内部逻辑与关键流程

- `isAgentWorkspaceVisible`（`product-feature-flags.ts:18-24`）：`workspace.archived` 为真 → `false`（`:21`）；`slug === 'default'` → `false`（`:22`，默认工作区不进 UI 入口）；否则返回 `TEAM_WORKSPACE_UI_ENABLED || workspace.type !== 'team'`（`:23`）——开关为 `false` 时即「非 team 可见，team 隐藏」；`type` 缺失按非 team 处理（测试 `product-feature-flags.test.ts:41-43` 固定）。
- `getVisibleAgentWorkspaces`（`:26-30`）：`filter(isAgentWorkspaceVisible)`，返回新数组、不改入参（`:29`）。
- `isAgentWorkspaceIdVisible`（`:32-40`）：`workspaceId` 为空（`null`/`undefined`）→ `true`（`:36`，不阻塞未绑定工作区的入口）；按 `id` 查找（`:37`）；命中且 `slug === 'default'` → `true`（`:38`）；未命中 → `true`（`:39` 左值 `!workspace`，避免历史数据被误判）；否则委托 `isAgentWorkspaceVisible`（`:39`）。**注意不对称**：默认工作区对 `isAgentWorkspaceVisible` 恒 `false`（`:22`）但按 id 判定为 `true`（`:38`）——允许打开默认工作区的独立会话（测试 `product-feature-flags.test.ts:82-85` 固定此意图）。

## 4. 调用者与调用链

入向（全冻结树检索 `product-feature-flags`/三个函数名/常量名，命中 14 个消费文件，均为 renderer 层）：
- `hooks/useProjectActions.ts:16,34,44`（`getVisibleAgentWorkspaces` 过滤项目工作区列表、校验目标工作区）。
- `hooks/useGlobalAgentListeners.ts:88,453,1714`（`isAgentWorkspaceIdVisible` 拦截不可见工作区的会话推送）。
- `hooks/useOpenSession.ts:33,72`（`openAuthorized` 内守卫：不可见工作区不建 Agent/Browser Tab；`:59-62` 注释说明与 `requiresAgentSession` 的分工）。
- `renderer/main.tsx:118,320,324,813-815`（启动恢复可见工作区、`getVisibleAgentWorkspaces` 生成候选 id 集；`:815` 注释：默认沙箱工作区恒不可见）。
- `components/planning/PlanningView.tsx:30,58,212`；`components/tabs/TabSwitcher.tsx:31,74`；`components/tabs/TabBar.tsx:79`（`isAgentWorkspaceIdVisible`）；`components/settings/BotDefaultSettings.tsx:11,19`；`components/agent/MoveSessionDialog.tsx:26,62`（移动会话目标列表另排除当前工作区）；`components/automation/AutomationFormView.tsx:38,257`；`components/app-shell/SearchDialog.tsx:45,232`；`components/app-shell/left-sidebar/use-left-sidebar.ts:107,507`（`:1377` 注释提及开关）；`lib/tab-activation.ts:23,40`（Tab 激活前校验）。
- 注释提及（非导入）：`components/app-shell/AppShell.tsx:79` 硬编码 `const isTeamWorkspace = false`（自述「原 TEAM_WORKSPACE_UI_ENABLED 分支移除」）。

出向：仅 type import `AgentWorkspace`（`product-feature-flags.ts:1`）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用，依据：`product-feature-flags.ts:18-40` 全部为纯函数（filter/比较），不写 atom/磁盘/网络；数据读发生在调用方（如 `useGlobalAgentListeners.ts:453` 读 `agentWorkspacesAtom` 后传入）。

## 6. 分支、失败、取消与恢复

分支：`:21`（archived）、`:22`（default slug）、`:23`（开关||type）、`:36`（空 id）、`:38`（default id）、`:39`（未命中/委托）。无 throw、无异步、无取消概念；输入为任意对象（缺字段走默认分支，不抛错）——依据：全文件无 try/throw/Promise。

## 7. 权限与权威状态

本文件是**产品入口可见性守卫**而非权限层：不校验用户身份/sender，只按工作区属性（`archived`/`slug`/`type`）与产品开关过滤展示与打开路径（`product-feature-flags.ts:11-17` 注释自述两种「不可见」）。权威来源：`TEAM_WORKSPACE_UI_ENABLED` 字面量（`:9`）为团队可见性的唯一权威；`archived` 状态权威在写入方（不在本文件）。

## 8. 修改影响面

- 改 `TEAM_WORKSPACE_UI_ENABLED` 为 `true`：上列 14 个消费文件的团队工作区全部恢复入口（列表/Tab/规划/自动化/搜索/移动会话），需重新构建（`:4-8` 注释）；`AppShell.tsx:79` 的硬编码 `isTeamWorkspace=false` **不会**随之改变（该分支已独立移除）。
- 改三个函数的判定顺序（如 archived/default 优先级）：影响 `useOpenSession.ts:72` 打开守卫、`useGlobalAgentListeners.ts:453,1714` 推送拦截、`tab-activation.ts:40` 激活判定——被隐藏工作区的会话将被拒绝打开/更新（测试 `product-feature-flags.test.ts:74-76` 固定该拦截用途）。
- 同步测试：`product-feature-flags.test.ts`（15 用例，见 §9）；类型 `AgentWorkspace` 来自 `@profer/shared`，改字段需双侧同步。

## 9. 测试证据

直接测试 `apps/electron/src/renderer/lib/product-feature-flags.test.ts`（15 个 `test(`，2 个 describe），纯函数真测无 mock：
- 「工作区可见性」9 例（`product-feature-flags.test.ts:21-59`）：活跃个人可见（`:22` `toBe(true)`）、default 不可见（`:26`）、archived 不可见（`:30`）、团队被开关隐藏（`:34` `toBe(false)`）、已收纳团队不可见（`:38`）、缺 `type` 旧数据按个人可见（`:42`）、过滤保序只留 `['p1']`（`:46-47`）、返回新数组且入参不变（`:52-54` `not.toBe`+长度）、空输入空数组（`:58`）。
- 「isAgentWorkspaceIdVisible」6 例（`:65-89`）：空 id 可见（`:66-67`）、活跃个人可见（`:71`）、archived id 拦截（`:75`）、团队 id 拦截（`:79`）、default id 可见（`:84`）、未知 id 可见（`:88`）。
- 未覆盖：`type` 为未来枚举值的行为、`slug` 非 'default' 的特殊 slug、并发下 workspaces 列表变化。
- NOT_RUN：本轮未执行 `bun test`/typecheck/build/GUI；断言为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 开关 `TEAM_WORKSPACE_UI_ENABLED=false` 硬编码（QA 预读线索回源核实属实） | 已证实 | `product-feature-flags.ts:9` |
| 三函数分支语义与 default 不对称（对象不可见/id 可见） | 已证实 | `product-feature-flags.ts:18-40` + 测试 `:25-27,82-85` |
| 14 个消费文件及行号（见 §4） | 已证实 | 各消费点 grep 命中 + `useOpenSession.ts:55-80` 段落已读 |
| 开关仅控 renderer 入口、不删数据/IPC/服务端能力 | 推断 | `product-feature-flags.ts:6` 注释自述，未逐个核对团队数据/IPC 的保留实现 |
| 「恢复时改回 true 并重新构建即可」 | 推断 | 注释自述（`:7`）；`AppShell.tsx:79` 独立硬编码表明部分旧分支已物理移除，恢复成本可能高于注释所述 |
| 团队工作区的服务端/IPC 链路现状 | 未知 | 超出本文件范围，未读 |

NOT_RUN：未运行测试/构建/GUI。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `TEAM_WORKSPACE_UI_ENABLED` | §2/§7/§8/§10 | 9 | covered |
| `isAgentWorkspaceVisible` 三分支 | §3/§9 | 18-24 | covered |
| `getVisibleAgentWorkspaces` | §3/§9 | 26-30 | covered |
| `isAgentWorkspaceIdVisible` 四分支 | §3/§9 | 32-40 | covered |
| 14 个消费文件 | §4/§8 | — | covered |
