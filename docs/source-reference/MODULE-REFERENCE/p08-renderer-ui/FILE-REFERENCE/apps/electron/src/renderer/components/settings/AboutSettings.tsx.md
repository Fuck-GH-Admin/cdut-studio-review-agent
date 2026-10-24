---
path: apps/electron/src/renderer/components/settings/AboutSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 69cb75e64b1eb97f1185d14112d333de7c9264e1
sha256: e407eedbb6f7f4fab5be63eea842d3ccf0f871eeaddf93b4ca50ead5a4ae19ea
lines: 363
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/AboutSettings.tsx

## 1. 结论与边界

**关于页**（`:1-5`）：核心研发团队头像画廊（5 位）、Agent 运行环境检测、Shell 环境（仅 Windows）、系统公告入口。纯展示+检测触发。

## 2. 导出与关键符号

1 导出：`AboutSettings`（`:342`）。内部：`TEAM_AVATARS` 5 项（`:32-38`）、`EnvironmentCard`（`:41`）、`ShellEnvironmentCard`（Windows 专属）、`TeamCreditsCard`、`BulletinCard`（`:330`）。

## 3. 内部逻辑与关键流程

- `EnvironmentCard`（`:41-`）：初始化读 `settings.lastEnvironmentCheck` 缓存（`:48-55`）→`checkEnvironment` 手动触发（`:58-69`）→Node.js/Git 状态三档推导（`checking/success/warning/error`，`:74-87`）；`hasIssues` 时 destructive 徽章（`:95`）。
- `AboutSettings` 渲染序（`:342-362`）：团队画廊→环境检测→Shell 卡（仅 Windows）→公告卡（手动入口，"本地数据，随时翻阅" `:335`）。

## 4. 调用者与调用链

- 入向：`SettingsPanel.tsx`（about 标签，本批）。
- 出向：environment atoms、`bulletinDialogOpenAtom`、`EnvironmentCheckCard`（域外）、`window.electronAPI.getSettings/checkEnvironment/getPlatformInfo`、团队图片资源。

## 5. 数据 I/O、读写与副作用

读 settings 缓存；触发环境检测（主进程）；写 atom（environmentCheckResultAtom）。

## 6. 分支、失败、取消与恢复

检测失败→console.error（`:64-65`）；isChecking 禁用按钮；无回滚。

## 7. 权限与权威状态

无权限分支，依据：本地检测展示。

## 8. 修改影响面

关于页/环境健康展示：上游=SettingsPanel about 标签渲染路径（本批）；修改本文件波及四卡布局序（团队画廊→环境检测→Shell→公告）与 `hasEnvironmentIssuesAtom` 徽章联动；回归面=环境检测缓存读取（`settings.lastEnvironmentCheck`）与手动检测双入口。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 检测缓存/三档状态/四卡布局 | 已证实 | `:1-363` 全文 |
| checkEnvironment 实现 | 边界 | 主进程域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+4 内部卡 | §2/§3 | 32-362 | covered |
