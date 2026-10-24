---
path: apps/electron/src/renderer/components/shortcuts/GlobalShortcuts.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 96fd0df27d1b0b00e805237c6dc1cb7e4c138d8d
sha256: 640c0e26a427d14f48e21dfff903aaff199b4cdf6e57141c1f06fffa6217c49c
lines: 214
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shortcuts/GlobalShortcuts.tsx

## 1. 结论与边界

**全局快捷键注册组件**（214 行，`:1-10`）：main.tsx 顶层挂载永不销毁（返回 null）；①初始化注册表 ②settings 加载自定义 ③注册应用级 handler ④菜单 IPC（Cmd+W）。

## 2. 导出与关键符号

1 导出：`GlobalShortcuts`（`:43`）。用 `useShortcut(id, handler)` 绑 8 个：close-tab（`:112`）/open-settings（Cmd+,）/global-search（Cmd+Shift+F）/new-session（Cmd+N，draft）/toggle-sidebar（Cmd+B）/toggle-mode（Cmd+Shift+M，**注释 `:145`：保留注册但不再切已移除的 Chat 模式，现切 scratch↔agent**）/clear-context（Cmd+K CustomEvent）/focus-input（Cmd+L）/stop-generation（Cmd+Shift+Backspace）。

## 3. 内部逻辑与关键流程

- 初始化（`:65-75`）：`initShortcutRegistry`+settings.shortcutOverrides/sendWithCmdEnter 加载。
- `handleCloseTab`（`:84-103`）：**浮窗优先**——设置浮窗（渠道表单 dirty→`setSettingsCloseRequested` 交 SettingsPanel 弹确认 `:88-90`）→搜索浮窗→`requestClose(activeTab)`（useCloseTab 统一关闭含子进程 stop+流式确认，注释 `:59-60` Issue #357）。
- 菜单/托盘（`:106-212`）：`onMenuCloseTab`（Cmd+W 被 Electron 菜单拦截转发）；`onTrayOpenAgentSession`（查会话→开 Tab→activateTabWithSideEffects，带 lineage parentSessionId `:188-193`）；`onTrayCreateSession`（切 agent 模式+createAgent）。

## 4. 调用者与调用链

- 入向：main.tsx（顶层常驻）。
- 出向：settings/search/tab/shortcut/agent atoms、`useCloseTab`/`useCreateSession`/`useShortcut`、shortcut-registry、`window.electronAPI.onMenuCloseTab/onTray*`。

## 5. 数据 I/O、读写与副作用

IPC 事件订阅（menu/tray）；写 shortcutOverridesAtom/sendWithCmdEnterAtom/tabs/agentSessions/appMode；CustomEvent 分发（profer:clear-context/focus-input/stop-generation）。

## 6. 分支、失败、取消与恢复

关闭优先级链（§3）；托盘打开失败 console.error（`:197-198`）；effect cleanup 卸载监听。

## 7. 权限与权威状态

快捷键权威=shortcut-registry（可自定义覆盖）；关闭权威=useCloseTab 统一入口。

## 8. 修改影响面

全局键盘/菜单/托盘行为；与 SettingsPanel dirty 拦截联动（settingsCloseRequestedAtom）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 handler/关闭优先级/托盘链 | 已证实 | `:1-214` 全文 |
| toggle-mode 注释与实现差异（保留注册现切 scratch） | 已证实（照实记录） | `:145-149` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+8 handler+2 IPC effect | §2/§3 | 43-213 | covered |
