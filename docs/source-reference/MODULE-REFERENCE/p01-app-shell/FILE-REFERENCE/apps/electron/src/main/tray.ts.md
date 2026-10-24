---
path: apps/electron/src/main/tray.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fcad66442dc57b42666ea5540e8baa36f77bfe4f
sha256: e6d8bea3df36d36a71980dd29a18fc228df7ab919f715d5495c0cd8eabe17685
lines: 191
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/main/tray.ts

## 1. 结论与边界

系统托盘模块：创建/销毁托盘图标与右键菜单（运行中/最近/更多会话分组 + 新建对话/新建 Agent 会话 + 打开/退出），动作经 `TrayActions` 注入（`apps/electron/src/main/tray.ts:1-7`）。

边界：不决定会话数据（`listAgentSessions`/`listAgentWorkspaces`/`isAgentSessionActive` 取数、`createTrayMenuModel` 纯建模）；不实现窗口管理（showMainWindow 只聚焦第一个窗口）。

## 2. 导出与关键符号

`export` 逐条核对：4 个（接口 1 + 函数 3；类/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TrayActions` | 接口（导出） | 11-16 | `{showMainWindow; openAgentSession(sessionId,title); createChatSession; createAgentSession}` | 动作注入面 |
| `createTray` | 函数（导出） | 130-174 | `(actionsInput?: Partial<TrayActions>) => Tray \| null` | 创建托盘 |
| `destroyTray` | 函数（导出） | 179-184 | `() => void` | 销毁并置空 |
| `getTray` | 函数（导出） | 189-191 | `() => Tray \| null` | 取当前实例 |

内部：模块级 `tray: Tray|null`（`:9`）、`getTrayIconPath`（`:22-30`）、`showMainWindow`（`:33-42`）、`getDefaultTrayActions`（`:44-51`）、`createRecentSessionMenuItem`（`:53-62`）、`buildTrayMenu`（`:64-118`）、`updateTrayMenu`（`:120-125`）。

## 3. 内部逻辑与关键流程

`apps/electron/src/main/tray.ts:130-174`（`createTray`）：

1. 图标路径 `getTrayIconPath`（`:22-30`）：**双路径**——`app.isPackaged ? process.resourcesPath/tray-icons : __dirname/resources/tray-icons`（注释 `:23-24`：dev 用构建拷贝、prod 用 extraResources）；**双文件名**——darwin `iconTemplate.png`（单色 Template，系统自动着色，注释 `:20,142-144`）其余 `iconTray.png`（`:28`）。
2. 动作合并 `{...getDefaultTrayActions(), ...actionsInput}`（`:132`）；默认动作全部退化为 `showMainWindow`（`:44-51`）。
3. 图标不存在 → `console.warn` + `return null`（`:134-137`）。
4. `nativeImage.createFromPath` → darwin `setTemplateImage(true)`（`:145-147`）→ `new Tray(image)` → `setToolTip('CDUT Studio')`（`:152`）→ `updateTrayMenu(actions)` 初次装配。
5. **点击弹菜单**（`:156-162`，注释「始终弹出菜单（与右键一致）」）：`click` → `updateTrayMenu` 重建菜单 + `tray.popUpContextMenu(contextMenu)`；`right-click` → 仅 `updateTrayMenu`（`:164-166`，系统默认行为弹出）。
6. 整体 try/catch：异常 `console.error` + `return null`（`:170-173`）。

`buildTrayMenu`（`:64-118`）：`sessions = listAgentSessions()`；`runningSessionIds = Set(活跃会话 id)`（`:66-70`）；`model = createTrayMenuModel(sessions, listAgentWorkspaces(), runningSessionIds)`（`:71`）；分组渲染：「运行中」（有才渲染：禁用标题头 + 项 + 分隔，`:77-83`）、「最近」（标题 + 项或「暂无最近会话」禁用项，`:84-87`）、「更多」（有则 submenu，`:88-93`）、分隔、「新建对话」「新建 Agent 会话」（`:95-102`）、「打开 CDUT Studio」（`:104-107`）、「退出 CDUT Studio」（`app.quit()`，`:109-114`）。每项 click → `actions.openAgentSession(item.id, item.title)`（`:53-62`）。

`showMainWindow`（`:33-42`）：`getAllWindows()[0]`，无窗口 return；minimized 则 restore；show + focus。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/main/index.ts:196`（import）、`main/index.ts:1008`（`createTray({...})` 注入真实动作）、`main/index.ts:858`（`getTray()` 关窗拦截判断）、`main/index.ts:1281`（`destroyTray()`）。无测试引用（见 §9）。

出向：`electron`（Tray/Menu/app/nativeImage/BrowserWindow）、`./lib/agent-session-manager`（`listAgentSessions`）、`./lib/agent-workspace-manager`（`listAgentWorkspaces`）、`./lib/agent-service`（`isAgentSessionActive`）、`./lib/tray-menu-model`（`createTrayMenuModel`/`TrayRecentSessionItem`）。

## 5. 数据 I/O、读写与副作用

- 读：会话/工作区列表与活跃状态（内存 API，非磁盘直读）。
- 写：无磁盘；副作用 = 创建/销毁系统托盘、tooltip、菜单弹出、`app.quit()`。
- 状态：模块级 `tray` 单例（无并发保护，Electron 主进程单线程）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 图标文件缺失 | 134-137 | warn + return null（无托盘） |
| 创建异常 | 170-173 | error + return null |
| 无窗口 | 35 | showMainWindow 直接 return |
| 运行中为空 | 77-83 | 不渲染「运行中」组 |
| 最近为空 | 85-87 | 「暂无最近会话」禁用项 |
| `tray` 为 null | 121 | updateTrayMenu 返回 null |

- 失败后状态：`createTray` 失败不留半成品（`tray` 变量在 `new Tray` 后才赋值）；`destroyTray` 幂等（`:179-184`）。
- 恢复：不适用（重建即重调 `createTray`）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。会话数据权威在 agent-session-manager/agent-workspace-manager/agent-service（本组件只读取展示）；动作权威在 `main/index.ts:1008` 注入（默认动作仅聚焦窗口，`tray.ts:44-51`）。

## 8. 修改影响面

- 改 `TrayActions` 契约需同步 `main/index.ts:1008` 注入点。
- 改菜单结构/文案影响托盘用户体验；改 `tray-menu-model` 输出形状需同步 `createRecentSessionMenuItem`。
- 图标资源布局（`resources/tray-icons/{iconTemplate.png,iconTray.png}`）是打包契约（electron-builder extraResources）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `tray.ts` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`tray-menu-model` 若有测试不覆盖本组件装配（`createTrayMenuModel` 的测试文件未见）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实托盘交互。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：图标双路径、点击弹菜单语义、分组渲染均无自动化断言。维护者验证：启动看托盘图标/tooltip，左右键弹菜单，走新建/退出。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出 | 已证实 | `grep -c '^export'`=4，`:11,130,179,189` |
| 图标双路径 + 平台双文件名 | 已证实 | `:25-28` |
| 点击弹菜单（与右键一致） | 已证实 | `:156-166` |
| 默认动作全退化 showMainWindow | 已证实 | `:44-51` |
| 图标缺失/异常均 return null | 已证实 | `:134-137,170-173` |
| 唯一调用点 main/index.ts | 已证实（检索） | `:196,858,1008,1281` |
| tray-menu-model 分组算法 | 未知 | 文件外（`lib/tray-menu-model.ts` 未逐行读） |
| 真实托盘表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getTrayIconPath` 双路径 | §3 | 22-30 | covered |
| `createTray` 全流程 | §3,§6 | 130-174 | covered |
| `buildTrayMenu` 分组 | §3 | 64-118 | covered |
| `showMainWindow` | §3 | 33-42 | covered |
| `destroyTray`/`getTray` | §2 | 179-191 | covered |
| 测试 | §9 | — | unknown |
