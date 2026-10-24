---
path: apps/electron/src/renderer/atoms/tab-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9072b48f75dd6fd615f6a58cea9566e73a69ac7a
sha256: ada59f59f6b52e00e7573a309baa2665d40b0b310d240337176128cd336ac758
lines: 553
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/tab-atoms.ts

## 1. 结论与边界

**Tab Atoms（当前工作区入口状态）**（`apps/electron/src/renderer/atoms/tab-atoms.ts:1-6`）：顶部保留 Scratch Pad 与用户打开的会话入口；会话恢复/导航交给左侧列表。**桥接 atom 与 `currentConversationIdAtom`/`currentAgentSessionIdAtom` 同步**（`:5-6`），现有派生 atoms 无需修改。

## 2. 导出与关键符号

`export` 共 **36 个**（按真实行号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getFileBaseName` | re-export | `:24` | — |
| `TabType` | type | `:32` | — |
| `SCRATCH_PAD_ID` | const | `:35` | — |
| `TUTORIAL_TAB_ID` | const | `:38` | — |
| `TUTORIAL_TAB_TITLE` | const | `:39` | — |
| `SCRATCH_PAD_TITLE` | const | `:45` | — |
| `TabItem` | interface | `:48` | — |
| `PersistedTabState` | interface | `:68` | — |
| `tabsAtom` | const | `:76` | — |
| `activeTabIdAtom` | const | `:79` | — |
| `tabMruAtom` | const | `:82` | — |
| `sidebarCollapsedAtom` | const | `:89` | — |
| `TabMinimapItem` | interface | `:97` | — |
| `tabMinimapCacheAtom` | const | `:104` | — |
| `scratchPadContentAtom` | const | `:107` | — |
| `scratchPadLoadedAtom` | const | `:109` | — |
| `activeTabAtom` | const | `:114` | — |
| `activeSessionIdAtom` | const | `:125` | — |
| `tabStreamingMapAtom` | const | `:132` | — |
| `tabIndicatorMapAtom` | const | `:149` | — |
| `visibleTopBarTabsAtom` | const | `:177` | — |
| `orderTabsBySessionContext` | function | `:192` | — |
| `isMruEligibleId` | function | `:228` | — |
| `promoteSessionMru` | function | `:236` | — |
| `createBrowserTabId` | function | `:250` | — |
| `isBrowserTab` | function | `:254` | — |
| `isSessionWorkTab` | function | `:262` | — |
| `tabContextSessionId` | function | `:276` | — |
| `getPersistableTabState` | function | `:293` | — |
| `OpenTabInput` | type | `:314` | — |
| `openTab` | function | `:345` | — |
| `selectSameModeCloseFallback` | function | `:447` | — |
| `closeTab` | function | `:467` | — |
| `reorderTabs` | function | `:523` | — |
| `updateTabTitle` | function | `:538` | — |
| `ensureScratchPadTab` | function | `:549` | — |

## 3. 内部逻辑与关键流程

- 桥接同步（`:5-6`）：现有派生 atoms 不改。
- `TabType` 5 态（`:32`）；preview 退役（`:30`）。
- 固定 ID 常量（`:35`、`:38`）。

## 4. 调用者与调用链

- 消费方：顶部 Tab 栏/工作区。
- 出向：Jotai（桥接 atom）。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

桥接协议（`:5-6`）保现有派生 atoms 兼容；Tab 类型边界（Settings 独立/preview 退役）。

## 8. 修改影响面

- `TabType` 联合；桥接 atom 同步协议。
- tab-group-atoms 组合模型依赖 `tabsAtom` 扁平（配套）。

## 9. 测试证据

`tab-atoms.test.ts`（218 行）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

Tab 状态集/桥接契约已证实（`:24-553`）；测试实际通过未知（NOT_RUN）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| Tab 状态集 | `:24-553` | covered |
| 类型/常量 | `:29-38` | covered |
