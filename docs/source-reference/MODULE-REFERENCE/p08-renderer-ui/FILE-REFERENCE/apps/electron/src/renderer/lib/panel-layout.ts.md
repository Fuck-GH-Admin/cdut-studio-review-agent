---
path: apps/electron/src/renderer/lib/panel-layout.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b50e9d3694fa4c5d425c98b3f7a49eee1eee5259
sha256: afc72edb45330636a4bb275e5f65e9a3772b5ceac15009e6017339282f750adc
lines: 98
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/panel-layout.ts

## 1. 结论与边界

面板自适应布局的**纯函数判定层**（运行时代码、无副作用）：把文件面板「展开意图 A」与「实际可见 B」分离，B = A 且窗口宽度够；按主区栏数（组合 tab 为 2 栏）计算最小所需窗口宽，带 50px 滞后带防抖（`apps/electron/src/renderer/lib/panel-layout.ts:1-12`）。

边界：不订阅窗口/不碰 React/jotai（驱动在 `apps/electron/src/renderer/hooks/usePanelAutoLayout.ts`）；只管右侧文件面板的可见性，左侧栏纯手动（`:9-11`）；不渲染（渲染宽度常量的孪生 `GROUP_SPLIT_GAP` 在 `apps/electron/src/renderer/atoms/tab-group-atoms.ts:76`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PanelLayoutState` | 接口 | 15-26 | `{ sidebar: boolean; filePanel: boolean; mainPaneCount: number }` | 输入：sidebar=实际展开；filePanel=意图 A |
| `PanelVisibility` | 接口 | 29-31 | `{ filePanel: boolean }` | 输出：实际可见 B |
| `CONVERSATION_MIN_WIDTH` | 常量 | 34 | `420` | 单栏对话最小宽 |
| `PANE_SPLIT_GAP` | 常量 | 40 | `8` | 组合分栏缝，须与 `GROUP_SPLIT_GAP` 同值 |
| `SIDEBAR_WIDTH` | 常量 | 42 | `300` | 左侧栏展开宽（折叠 60 不计入） |
| `FILE_PANEL_MIN_WIDTH` | 常量 | 44 | `300` | 文件面板最小宽 |
| `GAP_BUFFER` | 常量 | 46 | `16` | 分栏间隙+边距余量 |
| `HYSTERESIS` | 常量 | 48 | `50` | 滞后带 |
| `mainAreaNeed` | 函数 | 54-57 | `(paneCount: number) => number` | 主区最小所需宽 |
| `layoutNeed` | 函数 | 64-69 | `(layout: PanelLayoutState) => number` | 整体最小所需宽 |
| `computeVisibility` | 函数 | 81-98 | `(windowWidth, layout, prev: PanelVisibility) => PanelVisibility` | B 判定（带滞后） |

导出计数：11（接口 2 + 常量 6 + 函数 3）；无其它 `export`，无未导出内部函数。

## 3. 内部逻辑与关键流程

1. `mainAreaNeed`（`apps/electron/src/renderer/lib/panel-layout.ts:54-57`）：`panes = Math.max(1, Math.floor(paneCount))`——非法栏数（0/负/小数）回落 1 栏；返回 `420×panes + (panes-1)×8`（1 栏=420，2 栏=848，`:51-53` 注释给出算例）。
2. `layoutNeed`（`:64-69`）：`mainAreaNeed(mainPaneCount) + (sidebar?300:0) + (filePanel?300:0) + 16`。算例（`:61-62`）：单栏+侧栏+文件面板=1036、仅侧栏=736、仅对话=436；组合+左栏=1164、再加文件面板=1464。
3. `computeVisibility`（`:81-98`）：先算 `threshold = mainAreaNeed + (sidebar?300:0) + 300 + 16`（`:86-89`，**注意固定计入 FILE_PANEL_MIN_WIDTH**，因调用前提就是问文件面板该不该显示）；`filePanel` 判定（`:91-95`）：意图 A=false → 恒 false；A=true 且 `prev.filePanel`（当前可见）→ `windowWidth >= threshold`（收起阈值）；A=true 且此前不可见 → `windowWidth >= threshold + 50`（展开阈值，滞后带）。返回新 `PanelVisibility`（`:97`）。

状态变化：本文件无状态（纯函数）；A/B 状态存于 `apps/electron/src/renderer/atoms/panel-layout-atoms.ts` 的 atoms。

## 4. 调用者与调用链

入向：
- `apps/electron/src/renderer/hooks/usePanelAutoLayout.ts:30-33` 导入 `computeVisibility`/两接口；`:67`（`openFilePanel`，manual 打开时立即算一次）、`:117`（统一 resize/状态 effect）调用。该 hook 用与 MainArea 相同的 `isGroupActive` 纯判定派生 `mainPaneCount`（`usePanelAutoLayout.ts:47-54`）。
- `apps/electron/src/renderer/atoms/panel-layout-atoms.ts:11` 仅 `import type { PanelVisibility }`（类型消费）。
- 直接测试 `apps/electron/src/renderer/lib/panel-layout.test.ts`（见 §9）。

出向：无（不 import 任何运行时模块；纯计算）。被消费常量：`PANE_SPLIT_GAP` 仅测试对比用（`panel-layout.test.ts:92`）；`GROUP_SPLIT_GAP`（`tab-group-atoms.ts:76` = 8，同值）由 `MainArea.tsx:37,202-257,352,427-428` 渲染侧消费——两侧同值是刻意契约（`:37-39`）。

## 5. 数据 I/O、读写与副作用

不适用（数据部分），依据：本文件无磁盘/网络/缓存/全局状态读写，纯函数入参出参（`:54-57,64-69,81-98` 全部为无副作用表达式）。无副作用、无并发交错；幂等（同输入同输出）。

## 6. 分支、失败、取消与恢复

- `mainAreaNeed:55`：`Math.max(1, Math.floor(paneCount))`——0/-3/1.7 都回落 1 栏，不抛错（测试锁死 `panel-layout.test.ts:85-89`）。
- `layoutNeed:66-67`：sidebar/filePanel 两个三元分支。
- `computeVisibility:91-95`：意图 A 假 → false；A 真再分 `prev.filePanel` 真/假两条阈值分支。
- 无 throw、无取消、无恢复路径——不适用，依据：纯函数无 I/O，失败面仅入参合法性（已由 :55 兜底）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查、无 IPC。「权威」分离在模型层面：展开意图 A 的权威是用户手动操作（`agentSidePanelOpenAtom`，`usePanelAutoLayout.ts:63`），可见性 B 的权威是本模块计算 + `panelVisibilityAtom`（`usePanelAutoLayout.ts:114-122`），本文件只提供计算不持有状态。

## 8. 修改影响面

- 改 6 个常量 → 直接影响文件面板收起/展开阈值（`usePanelAutoLayout.ts:67,117`）；`PANE_SPLIT_GAP` 若不与 `GROUP_SPLIT_GAP`（`tab-group-atoms.ts:76`）同步，`panel-layout.test.ts:92` 断言失败，且组合渲染（`MainArea.tsx:204`）与预算不一致。
- 改 `computeVisibility` 阈值/滞后逻辑 → 影响 `openFilePanel` 的 toast 触发（`usePanelAutoLayout.ts:69-71`）与面板闪烁行为。
- 改 `PanelLayoutState.mainPaneCount` 语义 → `usePanelAutoLayout.ts:47-54` 派生逻辑与组合场景预算联动。
- 需同步修改的测试：`apps/electron/src/renderer/lib/panel-layout.test.ts`（硬编码 1036/436/736/848/1164/1464 等期望值，`:29,34,38,82,102,110`）。

## 9. 测试证据

直接测试 `apps/electron/src/renderer/lib/panel-layout.test.ts`（18 个 `test(`，静态阅读、NOT_RUN）：
- `layoutNeed` 三组合：1036/436/736（`:25-39`，公式+硬编码双断言）。
- `computeVisibility`：宽窗可见（`:43-46`）、滞后带 1085/1086（`:48-52`）、窄窗隐藏（`:54-57`）、无意图恒隐藏（`:59-62`）、侧栏抬阈值（`:64-69`）。
- `mainAreaNeed`：1 栏=420（`:75-78`）、2 栏=848（`:80-83`）、非法栏数回落（`:85-89`）、`PANE_SPLIT_GAP===GROUP_SPLIT_GAP`（`:91-93`，真 import `@/atoms/tab-group-atoms` 无 mock）。
- 组合预算：1164（`:100-106`）、1464 让位/恢复（`:108-113`）、滞后带 1463/1514（`:115-118`）、解散回单栏恢复（`:120-124`）。
- 滞后防抖动（`:128-136`）、`HYSTERESIS===50`（`:138-140`）。

未覆盖：`mainAreaNeed(3+)` 多栏、`layoutNeed` 的 sidebar-only 组合、`computeVisibility` 对 `mainPaneCount>2` 的阈值——见测试篇 §4。NOT_RUN：本轮未执行 bun test/typecheck；断言均为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出清单与签名 | 已证实 | `apps/electron/src/renderer/lib/panel-layout.ts:15-81` |
| 阈值/滞后带公式与算例（1036/848/1464 等） | 已证实 | `panel-layout.ts:54-69,86-95` 与 `panel-layout.test.ts:29,82,110` 互证 |
| 非法栏数回落 1 栏 | 已证实 | `panel-layout.ts:55`、`panel-layout.test.ts:85-89` |
| `PANE_SPLIT_GAP` 与 `GROUP_SPLIT_GAP` 同值（8） | 已证实 | `panel-layout.ts:40`、`tab-group-atoms.ts:76`、`panel-layout.test.ts:92` |
| hook 侧 A/B 状态流转（消费语义） | 已证实 | `usePanelAutoLayout.ts:62-72,113-122` |
| 测试全绿 | 未知 | NOT_RUN（本轮未执行） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PanelLayoutState`/`PanelVisibility` | §2、§4 | 15-31 | covered |
| 6 常量 | §2、§8 | 34-48 | covered |
| `mainAreaNeed`（含非法回落） | §3、§6 | 54-57 | covered |
| `layoutNeed` 三元分支 | §3、§6 | 64-69 | covered |
| `computeVisibility` 三分支+滞后 | §3、§6 | 81-98 | covered |
| 3+ 栏预算 | §9 | 54-57 | unknown（未测） |
