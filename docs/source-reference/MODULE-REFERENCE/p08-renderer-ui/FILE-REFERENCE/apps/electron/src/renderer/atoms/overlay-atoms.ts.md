---
path: apps/electron/src/renderer/atoms/overlay-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5ff7ad4b980822be4bc16b037b3e7eec4798d490
sha256: ed4c02a5a7ec244ff748375deb49d61da15eb98853d8495ff067b5acc6f566fb
lines: 37
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/overlay-atoms.ts

## 1. 结论与边界

全局模态叠加态调度（Overlay Coordinator，37 行，头注释 `:1-13`）：Electron 原生 `WebContentsView`（智联万站内嵌页）是 OS 级视口、恒凌驾 Chromium DOM 之上，React 模态会被硬性遮挡——因此以全局计数（模态开 +1/关 -1）驱动 `YanhuExpressView`/桌宠在 >0 时上报 `visible=false` 瞬时隐去原生图层。

**边界**：原生图层隐去/恢复动作在 `YanhuExpressView` 与主进程（跨批）；本文件只管计数与派生。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `globalOverlayCountAtom` | atom（导出） | 19 | `number` 初值 0 | 叠加计数（恒非负） |
| `isGlobalOverlayActiveAtom` | 派生 atom（导出） | 22 | `get(globalOverlayCountAtom) > 0` | 是否遮挡中 |
| `useGlobalOverlay` | React hook（导出） | 30-37 | `(open: boolean) => void` | 声明式注册开合 |

导出合计 3。

## 3. 内部逻辑与关键流程

`useGlobalOverlay(open)`（`:30-37`）：`useEffect`（依赖 `[open, setCount]`）——`open` 为真时 `setCount(c => c+1)`（`:34`），cleanup `setCount(c => Math.max(0, c-1))`（`:35`）。**挂载即登记、卸载即回退**（`:27-28` 注释）：强制卸载等异常路径也能精确回退，防计数泄漏导致原生视图永久隐藏；`Math.max(0, …)` 防负。

## 4. 调用者与调用链

入向（全冻结树检索 `overlay-atoms`/`useGlobalOverlay`/`isGlobalOverlayActiveAtom`）：
- `useGlobalOverlay`（10 处）：`components/settings/LongTermMemoryView.tsx:29`（`LongTermMemoryView.tsx:176`）、`components/settings/SettingsDialog.tsx:13`（`SettingsDialog.tsx:35`）、`components/onboarding/coach-tour/CoachTourOverlay.tsx:28`（`CoachTourOverlay.tsx:136`，`open && !isYanhuStep`）、`components/ai-elements/mindmap-canvas.tsx:23`（`mindmap-canvas.tsx:458`，恒 true）、`components/cdut-zone/CdutFeatureSheet.tsx:23`（`CdutFeatureSheet.tsx:41`）、`components/cdut-zone/CdutAiClassAccessDialog.tsx:15`（`CdutAiClassAccessDialog.tsx:23`）、`components/cdut-zone/AiClassSessionPickerModal.tsx:29`（`AiClassSessionPickerModal.tsx:60`）、`components/cdut-zone/GatekeeperNoticeModal.tsx:21`（`GatekeeperNoticeModal.tsx:30`）、`components/cdut-zone/MutationConfirmModal.tsx:14`（`MutationConfirmModal.tsx:22`）、`components/cdut-zone/ai-class-tabs/AiClassArtifactFormModal.tsx:13`（`AiClassArtifactFormModal.tsx:32`）。
- `isGlobalOverlayActiveAtom`（1 处）：`components/cdut-zone/yanhu/YanhuExpressView.tsx:25`（`YanhuExpressView.tsx:57` 读取驱动原生视图可见性）。
- 批内测试 `overlay-atoms.test.ts:9`。
出向：`jotai`、`react`。

## 5. 数据 I/O、读写与副作用

无磁盘/网络（不适用）。状态=Jotai store 计数；副作用=React effect 登记/回退（`:32-36`）。

## 6. 分支、失败、取消与恢复

- `open` false 短路（`:33`）；cleanup 多重回退 `Math.max(0, count-1)` 不为负（`:35`）。
- 无 throw（不适用，依据：全文无 throw）。
- 恢复语义=cleanup 保证计数归还（`:27-28` 注释的设计目标）。

## 7. 权限与权威状态

无权限分支（不适用）。权威=计数本身（各模态自行登记）。

## 8. 修改影响面

10 个模态组件的登记 + `YanhuExpressView` 的原生图层隐去联动；计数语义破坏会导致原生视口永久遮挡或永久隐藏（注释 `:9-12` 场景）。

## 9. 测试证据

直接测试：`atoms/overlay-atoms.test.ts`（批内，2 test，详见其手册）：0/正计数遮挡判定、嵌套逐个关闭归零+多重回退不为负。未覆盖：`useGlobalOverlay` hook 本身（effect 注册/卸载）无测试（需 React 测试环境）。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 计数/派生/hook 语义（含防泄漏） | 已证实 | `:1-37` 全文逐行 |
| 11 个调用点（10 hook + 1 派生） | 已证实 | 全树检索（§4） |
| 原生 WebContentsView 遮挡行为 | 已证实（注释声明+消费方语义） | `:3-12`（OS 行为未运行验证） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `globalOverlayCountAtom`/`isGlobalOverlayActiveAtom` | §2/§9 | 19-22 | covered |
| `useGlobalOverlay`（effect/cleanup） | §3/§6 | 30-37 | covered |
| hook 的 React 运行面 | §9 | - | unknown（未覆盖） |
