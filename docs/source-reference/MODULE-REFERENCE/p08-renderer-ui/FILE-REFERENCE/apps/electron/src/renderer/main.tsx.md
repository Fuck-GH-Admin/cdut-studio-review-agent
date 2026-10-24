---
path: apps/electron/src/renderer/main.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c14557f6c018fad886a4c833454fecdf6484eb8
sha256: 6ae6ad4c1fce85748dee9d1c4714b5250069ab805156c50996375c2e515049d6
lines: 1150
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/main.tsx

## 1. 结论与边界

渲染进程 module 入口：按 URL `window=` 参数分流 6 路窗口（5 个 `window=` 参数分支 + 主窗缺省：主窗/独立预览/Agent 预览/计划窗/科学助理窗/烟花宠浮窗），主窗挂载 React 根树 + 15 个无渲染初始化组件（主题/Agent 设置/通知/规划/飞书/钉钉/标签持久化/草稿本/快捷键等）（`apps/electron/src/renderer/main.tsx:1-145,1059-1150`）。

边界：初始化只做装配与订阅（业务实现在各 atoms/hooks/主进程 IPC）；不管理窗口生命周期（主进程）；`migrateLocalStorageKeys()` 是模块副作用第一行（`:7-9`，必须先于任何 localStorage 读取）。

## 2. 导出与关键符号

文件级 `export` 0（`grep -c '^export'`=0；全部内部符号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `hasEnabledModel` | 内部函数 | 128-135 | 渠道模型有效性判定（设置校验用） |
| 窗口类型常量 | 内部常量 | 138-144 | `isDetachedPreviewWindow`/`isAgentPreviewWindow`/`isPlanningWindow`/`isScienceAgentWindow`/`isYanhuPetWindow`（URL `window=` 逐一判定） |
| `ThemeInitializer` | 内部组件 | 152-211 | 主题初始化 + skins 变更广播；`themeSignature` memo（special→`special:style`；system→`system:dark/light`）避免无谓 `applyThemeToDOM` |
| `AgentSettingsInitializer` | 内部组件 | 218-405 | 并行 listChannels+getSettings；模型/渠道校验清理（`:260-272`）；`setAgentRuntime(settings.agentRuntime ?? 'pi')`（`:276`，settings.ts:244 注释矛盾的生效口径）；agentChannelIds 过滤迁移（`:279-302`）；workspaces 加载+恢复（不可见回退并落盘 `:330-332`）；`agentSettingsReady` 出错也置真（`:336,340`）；能力 diff toast（初载/切工作区抑制 `:244,346-360,375-380`）；能力/文件变更 1s 节流（`:387-395`） |
| `PlanningShortcutInitializer` | 内部组件 | 412-422 | `initShortcutRegistry()` + `updateShortcutOverrides(settings.shortcutOverrides ?? {})`（`:414-416`） |
| `PlanningInitializer` | 内部组件 | 424-492 | todos/日历/分组/标签 5 路加载（request-id 防乱序 `:436-466`）+ 团队工作区过滤；SSE 连接（`:477-479`）+ onPlanningChanged + `sse.onEvent('planning_changed')`（`:480-487`）；disposed 旗标 |
| `AutomationInitializer` | 内部组件 | 494-507 | listAutomations + onAutomationChanged |
| `NotificationsInitializer` | 内部组件 | 514-526 | initializeNotifications + initDesktopNotificationListener |
| `DockBadgeInitializer` | 内部组件 | 533-567 | badgeCount = 开关 ? 计数 : 0 → setDockBadgeCount；focus/visibilitychange 清当前会话角标 |
| `UiPreferencesInitializer` | 内部组件 | 574-590 | 4 项 UI 偏好初始化（stickyUserMessage/长文本附件/富文本/紧凑模式） |
| `MarkdownFontSizeInitializer`/`UiScaleInitializer` | 内部组件 | 597-605,613-621 | 字号/缩放档位初始化（UiScale 注释 `:610-611`：localStorage 缓存模块加载即应用，此处校正 settings 权威值） |
| `AgentListenersInitializer` | 内部组件 | 629-640 | `useGlobalAgentListeners({restoreActiveStreams})` + CDUT 水合 + 划词引用 + 预览换肤同步 + 未读归档（根部常驻订阅） |
| `FeishuInitializer` | 内部组件 | 649-709 | 多 Bot 状态加载（旧单 API 回退 `:654-676`）+ onFeishuStatusChanged + 在场上报（5s 间隔 + focus/blur，`:689-698`） |
| `DingTalkInitializer` | 内部组件 | 717-762 | 同构多 Bot 模式（加载/订阅/上报） |
| `TabStatePersistenceInitializer` | 内部组件 | 792-948 | tabState 恢复校验（不信任 title/ID 用 Main 元数据 `:809-811`；默认工作区可恢复不可见 `:815-818`）；parentSessionId 回填（`:825-833`）；activeTabId 恢复 + legacy splitLayout 兼容（`extractLegacyActiveTabId :783-790`）；scratchPadActive 仲裁（`:853-858`）；groups reconcile（`:859-863`）；自动保存 500ms 防抖（`:887-912`）；beforeunload `updateSettingsSync` 同步保存 + 异步回退（`:914-935`，`:926-927`） |
| `ScratchPadPersistence` | 内部组件 | 956-1057 | scratch-pad.md 载入→`markdownToHtml`→scratchPadContentAtom；`ensureScratchPadTab`；500ms 防抖自动保存（htmlToMarkdown+saveScratchPad）；beforeunload `saveScratchPadSync`（`:1029-1031`）；scratchPadActive 持久化（`:1044-1054`） |
| 入口分支 | 内部逻辑 | 1059-1122 | 见 §3.2 |

## 3. 内部逻辑与关键流程

### 3.1 模块级副作用（`:7-15,124-126`）

`migrateLocalStorageKeys()`（proma-*→profer-* 一次性迁移，注释 `:7`：必须先于任何 localStorage 读取）→ Inter 字体（`:14`）→ `import './styles/globals.css'`、`'./styles/skin-base.css'`、katex（`:124-126`）。

### 3.2 窗口分流（`:1059-1150`，`window=` URL 参数）

| 条件 | 行 | 挂载 |
| --- | --- | --- |
| `window=detached-preview` | 1060-1066 | 动态 import DetachedPreviewApp + 最小初始化集 |
| `window=agent-preview` | 1072-1073 | `mountAgentPreviewRenderer()` |
| `window=planning` | 1076-1081 | PlanningWindowApp |
| `window=science-agent` | 1092-1102 | ScienceAgentWindowView（`restoreActiveStreams=false`，注释 `:1099`：次级窗口不重绑活跃流；labId/windowId/focusSessionId 参数） |
| `window=yanhu-pet` | 1110-1115 | YanhuPetFloatingHost |
| 否则（主窗） | 1123-1149 | `createRoot(...).render(<React.StrictMode>…)`：15 个 Initializer + `<App />` + 三弹窗（GatekeeperNoticeModal/MutationConfirmModal/CdutAiClassAccessDialog）+ ProferToaster（top-right offset 96） |

### 3.3 初始化时序要点

- `notifyRendererReady` 由 `App.tsx:57-59` 在首帧提交后发出（撤原生启动屏）。
- Agent 设置初始化单次执行（空依赖），`agentSettingsReady` 出错也置真避免 UI 卡加载（`:336,340`）。
- 标签/草稿保存均 500ms 防抖 + `beforeunload` 同步 IPC 兜底（`updateSettingsSync`/`saveScratchPadSync`，`:926-927,:1029-1031`）。

## 4. 调用者与调用链

入向：Vite 入口链（`index.html:56` `<script type="module" src="/main.tsx">`）。无测试引用（见 §9）。

出向（关键）：`@/lib/localstorage-migration`、`./App`、`./atoms/{theme,agent-atoms,automation-atoms,notifications,ui-preferences,markdown-font-size,ui-scale,developer-mode,planning-atoms,tab-atoms,tab-group-atoms,feishu-atoms,dingtalk-atoms,sidebar-atoms}`、`./hooks/{useGlobalAgentListeners,useCdutAccountHydration,useBrowserLocalFileSelectionQuote,useBrowserPreviewThemeSync}`、`./lib/{shortcut-registry,active-tab-side-effects}`、`./components/**`（各初始化伴生 UI/弹窗）；IPC 面：getSettings/listChannels/agent workspaces/能力、规划 5 路+SSE、automations、通知、feishu/dingtalk 状态与在场、tabState/scratch-pad 保存。

## 5. 数据 I/O、读写与副作用

- 读（IPC）：settings/channels/workspaces/规划数据/automations/通知/飞书钉钉状态/草稿本。
- 写（IPC）：`updateSettingsSync`（tabState）、`saveScratchPadSync`/`saveScratchPad`、`setDockBadgeCount`、`reportFeishuPresence`/`reportDingtalkPresence`；localStorage（经各 initializer 与迁移函数）。
- 副作用：React 树挂载、SSE 连接、定时器（在场 5s、防抖 500ms×2、能力节流 1s）、focus/visibilitychange/beforeunload 监听（均有 cleanup）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 6 路窗口分流（5 个参数分支 + 主窗缺省） | 1059-1122 | 各自动态 import 挂载 |
| 设置/渠道加载异常 | 218-405 内 | console + `agentSettingsReady=true`（不卡 UI） |
| 规划加载乱序 | 436-466 | request-id 丢弃 |
| beforeunload 保存 | 914-935,1029-1031 | 同步 IPC 优先，缺失回退异步 |
| 飞书多 Bot API 缺失 | 654-663 | 回退旧单 Bot API |

- 取消：各 effect cleanup（订阅/定时器/SSE disposed 旗标）。
- 恢复：初始化失败不自动重试（随设置页/重启恢复）。

## 7. 权限与权威状态

无 sender/role 检查（渲染侧装配层）；settings 权威在主进程，本文件多处“本地缓存先行、settings 权威校正”双轨（如 UiScale `:610-611`）。`AgentListenersInitializer` 的 `restoreActiveStreams=false` 仅科学助理次级窗口（`:1099` 注释），防重复绑定活跃流。

## 8. 修改影响面

- 改初始化组件/顺序影响全窗口启动行为与数据水合；改 `window=` 分流影响 6 路窗口入口（5 个参数分支 + 主窗缺省）。
- 改 tabState/scratchPad 持久化契约需同步主进程 settings-service/scratch-pad IPC 与 `@/atoms/tab-atoms`。
- `agentRuntime ?? 'pi'`（`:276`）与 `types/settings.ts:244` 注释口径联动（见 settings.ts 手册 §3.2 矛盾记录）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `main.tsx` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：`shortcut-registry`/`tab-atoms` 等被测库不经本文件装配。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：15 个初始化组件、窗口分流、beforeunload 兜底均无自动化断言。维护者验证：首启/切窗参数/断网下各初始化降级、草稿即时保存。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出；15 初始化组件 | 已证实 | `grep -c '^export'`=0；§2 表行号经 grep 复核 |
| 6 路窗口分流（5 参数分支+主窗缺省） | 已证实 | `:138-144,1059-1122` |
| `agentRuntime ?? 'pi'` 生效口径 | 已证实 | `:276`（grep 复核） |
| beforeunload 同步保存兜底 | 已证实 | `:926-927,:1029-1031` |
| 次级窗 restoreActiveStreams=false | 已证实 | `:629,1099` |
| 各 IPC/原子实现细节 | 未知 | 文件外 |
| 真实启动时序 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 模块副作用 | §3.1 | 7-15,124-126 | covered |
| 15 个初始化组件 | §2,§3.3 | 152-1057 | covered |
| 窗口分流 | §3.2 | 1059-1150 | covered |
| 失败/取消分支 | §6 | 336-340,436-466,914-935 | covered |
| 测试 | §9 | — | unknown |
