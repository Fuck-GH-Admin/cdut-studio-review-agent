---
path: apps/electron/src/main/lib/cslab/cslab-window-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5e4669b662940c267e19ef97592e732963371637
sha256: d8f23077063db56c17022903dd550699a39fd9b779a761805874593c4e21c830
lines: 333
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-window-manager.ts

## 1. 结论与边界

**CDUT Science 科学助理独立窗口**（单例，运行时代码）：与主窗口共享 preload（天然拥有 window.electronAPI 全量能力）；生命周期与主窗口联动；上下文经主进程 Map 中转避免长提示词塞 URL（`apps/electron/src/main/lib/cslab/cslab-window-manager.ts:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `openCsLabAgentWindow` | 函数 | 257-279 | `(input): CsLabAgentWindowRef \| null` | 打开/聚焦；切实验室重载渲染层；getLab 无效返 null |
| `sendCsLabAgentContext` | 函数 | 282-300 | `(context): {delivered}` | 投递上下文（窗口不存在/跨实验室自动创建） |
| `getCsLabAgentWindowContext` | 函数 | 303-305 | `(windowId)` | 渲染层挂载兜底拉取（防 did-finish-load 竞态，`:33`） |
| `closeCsLabAgentWindowForLab` | 函数 | 308-316 | `(labId)` | 实验室删除→关窗（防孤立窗口） |
| `destroyCsLabAgentWindow` | 函数 | 319-333 | `()` | 应用退出/主窗关闭联动销毁 |

内部：窗口尺寸常量（`:24-28`）、`agentWindow/agentWindowId/agentWindowLabId` 单例状态（`:30-32`）、`contextByWindowId` Map（`:34`）、`makeWindowId`（`:36-38`）、`getIconPath`（`:40-51`）、`getInitialBounds`（贴主窗右侧+回退屏缘，`:54-76`）、`ensureWindowOnScreen`（`:78-98`）、`persistWindowState`（settings 持久化，`:100-108`）、`loadAgentWindow`（dev URL/loadFile 双态，`:110-131`）、`focusAgentWindow`（先 restore，`:134-140`）、`pushContext`（loading 则 did-finish-load 一次性发送，`:142-153`）、`createAgentWindow`（`:155-254`）。

## 3. 内部逻辑与关键流程

`createAgentWindow`：恢复保存态/初始 bounds（`:179-181`）→preload+contextIsolation:true+nodeIntegration:false（`:187-191`）→平台标题栏定制（`:163-170`）→`registerTrustedAgentSender`（`:195`，IPC 发送方注册）→ready-to-show 显示+**初始上下文不推送**（渲染层拉取，防覆盖草稿，`:211-212`）→窗口状态防抖保存 500ms（`:215-234`）→**导航安全**：will-navigate 非 dev 一律 preventDefault、http(s) 转 shell.openExternal；setWindowOpenHandler deny（`:236-244`）→closed 清理（`:246-251`）。

`openCsLabAgentWindow`：已存在且同实验室→存 context+pushContext+focus（`:269-273`）；跨实验室→新 windowId+重载（`:262-268`）。

## 4. 调用者与调用链

入向：CSLab IPC/主进程编排（非本批）。出向：electron（app/BrowserWindow/screen/shell）、`../{config-paths,ipc-sender-guard,main-window-lifecycle,main-window-state,settings-service}`、`./cslab-manager`（getLab）、`@profer/shared`。

## 5. 数据 I/O 与副作用

BrowserWindow 创建/销毁；settings 读写（scienceAgentWindowState）；shell.openExternal（仅 http(s)）。

## 6. 分支、失败、取消与恢复

persistWindowState try/catch error（`:103-107`）；destroy 幂等（`:319-326`）；focus 前 isDestroyed 检查（`:135`）；上下文双通道（push 事件+mount 拉取）互为兜底。

## 7. 权限与权威状态

webPreferences 安全基线（contextIsolation/无 nodeIntegration）；外部链接一律外开浏览器+deny 弹窗（`:236-244`）；`registerTrustedAgentSender` IPC 信任注册。

## 8. 修改影响面

窗口 query 契约（window=science-agent&labId&windowId&focusSessionId）与渲染层路由同步；settings 字段。

## 9. 测试证据

无专属测试（glob `**/cslab-window-manager*test*` 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出+单例生命周期+导航安全 | 已证实 | `:1-333` 逐行 |
| 渲染层 window=science-agent 路由 | 推断 | `:119/:125` 载入约定 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出/生命周期/安全 | §2/§3/§7 | 24-333 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
