---
path: apps/electron/src/renderer/components/tabs/MainArea.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3cf0a43a501eaa94cae8337518af021b9db9115a
sha256: 23038c0af38434064ea4a106d6652eb061f45ebff9af488d6e84d16d63862e19
lines: 455
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/MainArea.tsx

## 1. 结论与边界

主内容区域（头注释 :2-8）：组合 TabBar+TabContent；文件预览/受管浏览器均为顶栏工作 Tab（每文件一预览、浏览器每会话单例）；**并排统一走 Tab 组合**；Agent 推送浏览器状态自动组合（不打断对话、焦点留对话侧）。

## 2. 导出与关键符号

导出 1 条（`export` :54）：`MainArea()`（:54-）。

## 3. 内部逻辑与关键流程

（头+大纲级，455 行）：视图分派（activeViewAtom 五视图：conversations/planning/agent-skills/cdut-zone/cdut-science——nb-99 已知 :337 挂 CdutScienceView、:72 传 activeLabId）；浏览器自动开（shouldAutoOpenBrowserFromPush :19→openBrowserTabFromPush :17）；dismiss 语义（browserPanelDismissedSessionIdsAtom :16）；WelcomeView 空态（shouldShowWelcomeLauncher 由 active-tab-content 判定）。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产 `app-shell/AppShell.tsx:13`→:264；window-controls-host-coverage.test:66 readSource 静态读其源文本（元测试）。出向：TabBar（:21→:341）、TabContent（:22→:369/:397）、EmptyPanePlaceholder（:35→:372/:400）、五视图（:23-27）、tab-group-atoms 大块（:36-52）；electronAPI setAgentBrowserForeground:124/onAgentBrowserStateChanged:139 等。

## 5. 数据 I/O、读写与副作用

浏览器推送→自动开 Tab（IPC 状态流）。

## 6. 分支、失败、取消与恢复

视图分派+浏览器推送分支；不适用取消/恢复。

## 7. 权限与权威状态

浏览器单例/自动组合契约（:5-7）；dismiss 不强制重开（browser-atoms 上游）。

## 8. 修改影响面

- 消费面：App 主区。
- 依赖面：TabBar/TabContent+多视图。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；组合/单例契约 | 已证实 | :2-8 |
| 主区实现逐行 | 推断（头+大纲级） | :54-454 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+契约 | §2/§7 | :2-54 | covered |
| 主区实现 | §3/§10 | :54-454 | 推断 |
