---
path: apps/electron/src/renderer/components/WindowControlsTemplate.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0829410af9f1343cecaf7a8fa15ffbc50507a999
sha256: 7ab99b353bb0fec9e96d50b2332763429e40ed0e15134aa1955c7d1f161736f2
lines: 87
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/WindowControlsTemplate.tsx

## 1. 结论与边界

全局窗口按钮模板（渲染层运行时）：同一时刻只把 Windows 窗口控制按钮渲染给优先级最高的可见宿主，页面只需放 `WindowControlsHost` 声明 `active/priority`，不再各自判平台（文件头 `apps/electron/src/renderer/components/WindowControlsTemplate.tsx:17-25`）。优先级按物理窗口右缘排序：右侧文件栏 30 > 方案/全屏 20 > 普通内容顶栏 10 > MainArea 兜底 5（`:21-23` 注释）；相同 priority 的 active 宿主会跳位（`:24` 警示）。

边界：按钮渲染在 `WindowControls`；宿主选择纯函数在 `@/lib/window-controls-layout`；不做窗口 IPC。

## 2. 导出与关键符号

`export` 逐条核对：2 个函数导出（接口均内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `WindowControlsTemplateProvider` | 函数/组件（导出） | 26-61 | `({children}) => React.ReactElement` | 宿主注册表 Provider |
| `WindowControlsHost` | 函数/组件（导出） | 71-87 | `({id, active=true, priority, className}) => React.ReactElement \| null` | 页面按钮插槽 |

内部：`WindowControlsTemplateContextValue`（`:9-13`）、`WindowControlsTemplateContext`（`:15`）、`WindowControlsHostProps`（`:63-68`）。

## 3. 内部逻辑与关键流程

1. Provider 维护 `Map<id, WindowControlsHostRegistration>`（`:27`）；`registerHost` 注册并返回注销函数（`:29-43`）；`updateHost` 仅在 `active/priority` 实际变化时换引用（`:45-53`）。
2. 宿主选择委托纯函数 `selectActiveWindowControlsHost(hosts.values())`（`:57`，注释：便于单测、避免第二份优先级判断，`:55-56`）。
3. `WindowControlsHost`：注册 effect 只依赖 `[registerHost, id]`（`:76-79`）+ 更新 effect 同步 active/priority（`:81-83`）；渲染条件 `isWindows && context && activeHostId === id`，否则 null（`:85`）；命中时输出 `<WindowControls variant="inline">`（`:86`）。

## 4. 调用者与调用链

入向（全树检索，证实）：

- Provider：`app-shell/AppShell.tsx:15,215,295`（包裹应用）。
- Host（8 处 JSX）：`cdut-science/CdutScienceView.tsx:64`、`cdut-zone/CdutZoneView.tsx:301,356`、`planning/PlanningView.tsx:130`、`tabs/MainArea.tsx:314`、`tabs/TabBar.tsx:1353`、`agent-skills/AgentSkillsView.tsx:320,359`。

出向：`WindowControls`（`:2,86`）、`@profer/ui` `detectIsWindows`（`:3`）、`@/lib/window-controls-layout`（`selectActiveWindowControlsHost` + 类型，`:4-7`）。

## 5. 数据 I/O、读写与副作用

React context + state（注册表 Map）；无盘/网络（依据：全文读）。副作用：无。并发/幂等：注册/注销经函数式 setState；`updateHost` 短路相同值（`:48`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 注销防重 | previous.has(id) | 37 |
| update 短路 | active/priority 未变 | 48 |
| Host 三重守卫 | 非 Windows/无 context/非 active | 85 |
| registerHost 缺失 | context 未挂 | 77 |

无异常路径；无取消/恢复概念，依据：纯 React 状态协调。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；「唯一按钮」权威=注册表+选择函数（跨组件约定，`selectActiveWindowControlsHost`）。

## 8. 修改影响面

- Provider 1 处（AppShell）+ Host 8 处（§4）；改 context 契约影响全部宿主。
- 选择规则在 `window-controls-layout`（非本批）；同 priority 冲突行为依赖其 tie-break。
- 需同步的测试：`lib/window-controls-layout.test.ts`、`lib/window-controls-host-coverage.test.ts`（非本批，间接）。

## 9. 测试证据

直接测试：**无**（本文件无专属测试）。间接证据：`lib/window-controls-host-coverage.test.ts`（非本批）测宿主覆盖/选择（注释 `:55-56` 声明选择函数为此抽取），`lib/window-controls-layout.test.ts` 测纯函数——均非本文件渲染逻辑，标间接。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 注册表语义 | 已证实 | `:26-87` 逐行读 |
| Host 8 处调用 + Provider 1 处 | 已证实 | §4 行号 |
| 选择委托纯函数 | 已证实 | `:55-57` |
| 同 priority 跳位 | 已证实 | `:24` 注释（设计约束） |
| selectActiveWindowControlsHost tie-break 细节 | 未知 | 非本批文件 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `WindowControlsTemplateProvider` | §2-3 | 26-61 | covered |
| `WindowControlsHost` | §2-3, §6 | 71-87 | covered |
| 注册/更新/注销 | §3 | 29-53 | covered |
| 调用链 | §4 | - | covered |
| 选择函数内部 | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
