---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetFloatingHost.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3f13ae9e1130272df3d13e13e4361d738481ad75
sha256: bed31234b4148dd624501b5eacc2a600f61f66d4a067b0630a63b6894be234a1
lines: 582
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetFloatingHost.tsx

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

浮动桌宠主容器（582 行，头注 :1-9）：独立透明子窗口（`?window=yanhu-pet`）内负责启动引导、常驻伴随布局、拖拽+视口推回+窗口几何上报、60s 闲置四态精灵、透明留白鼠标穿透（`setIgnoreMouseEvents forward`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuPetFloatingHost` | 组件 | 62-582 | 桌宠宿主 |

内部常量：`IDLE_YAWN_MS=60_000`、`INITIAL_BLINK_MS=3_000`、`TYPING_BLINK_MS=1_200`、`FALLBACK_VIEWPORT={900,640}`（:38-44）、`IGNORE_HYSTERESIS_PX=10`（:47-52，注释——命中边界高频横跳的「碰撞箱不稳定」滞后余量）。

## 3. 内部逻辑与关键流程

1. **引导+订阅**（:80-158）：`petGetBootstrap`（config/history/viewport/presented）；`onPetStateChanged` 仅 `configRevision` 变化才应用配置（注释 :118 防视口高频广播回写朝向）；旧版坐标 `isLegacyDefaultPosition`→`resetCenterRef` 复位；stream 事件（delta/reasoning/tool-start/tool-end/error/done→refreshHistory）。
2. **布局**（:211-229）：pet 态 `clampPetPosition`；card 态 `computePushBackCoordinates`；`bounds=computePetOnlyLayout/computePetCardLayout`；**首帧上报完成才允许穿透**（ready 门，:122 注释杜绝启动瞬间冻结）。
3. **命中并集+穿透**（:236-253/:339-365）：`computeInteractionUnionRect`；全局 `pointermove` 判定（注释 :341-346——onPointerEnter/Leave 会在穿透切换后丢事件，故不用）；`updateMouseIgnore` 去重+拖拽/输入聚焦时拒绝切穿透（:333-338）。
4. **四态切变**（:265-287）：500ms tick——streaming→walking、打字/启动 3s 内→blinking、60s 闲置→yawning、余→breathing。
5. **拖拽**（:293-318）：pointer capture；抬起保存 `petSaveConfig` 并按真实光标重算穿透（:565-568 注释）。
6. **首帧居中**（:328-346）：引导到达+视口有效后旧值/越界→`handleResetCenter`（`computeCenterPetPosition`），每会话仅一次（`initialCenterDoneRef`）。
7. **对话**（:411-443）：`petSendChat`+流状态管理；`handleDevCommand` 切 `devToolsEnabled` 并唤起诊断控制台（下一轮生效）。

## 4. 调用者与调用链

入向：独立子窗口入口（`?window=yanhu-pet`）。出向：`./pet-geometry`（全函数）、`./YanhuPetAvatar`、`./YanhuPetDialog`、`window.electronAPI.yanhuExpress`（pet* IPC 群）、jotai（yanhu-pet-atoms）、sonner。

## 5. 数据 I/O、读写与副作用

经 IPC 读写配置/历史/几何/穿透；`logIpcError` 统一日志（注释 :65 去除静默 .catch 暴露异常）。

## 6. 分支、失败、取消与恢复

petUpdateGeometry 失败仍 setReady(true)（注释 :258-259 防交互永久冻结）；拖拽保存失败仅日志；订阅卸载全清理。

## 7. 权限与权威状态

- 交互稳定权威：穿透唯一驱动=全局 pointermove+并集矩形+滞后余量（:341-346）；拖拽/输入聚焦期间绝不切穿透。
- 首师权威：几何上报前维持捕获（防启动冻结）；上报失败也放行。
- 历史权威：对话结束从主进程拉取权威历史（`petGetHistory`，:163-171）。

## 8. 修改影响面

- 受影响消费者：桌宠窗口交互/穿透/拖拽/对话全链。
- 回归关注：穿透去重与滞后余量、首帧 ready 门、configRevision 回写防护、legacy 居中迁移。
- 无专属测试文件（全树检索确认）；回归靠 Electron/GUI 人工验证。

## 9. 测试证据

直接测试：无（几何核心由 `pet-geometry.test.ts` 覆盖）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 组件/内部常量/行号 | 已证实 | 逐行核对 |
| 穿透/首帧/configRevision 语义 | 已证实 | :80-365 |
| 透明窗口真实行为 | 未知 | 无测试、NOT_RUN |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 引导/订阅/布局/上报 | §3.1-3.2 | 80-262 | covered（未测） |
| 穿透/四态/拖拽/居中 | §3.3-3.6 | 236-346 | covered（未测） |
| 对话/设置 | §3.7 | 411-443 | covered（未测） |
