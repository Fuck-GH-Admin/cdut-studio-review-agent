---
path: apps/electron/src/renderer/components/agent/ContextModeToggleButton.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c98182e67c0c3459dd1d5833b026923c6ae2ad9
sha256: 6316869788e49b16928e68c2d8c9458f76aaacdc1fefdbde1e53235f3824487d
lines: 84
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/ContextModeToggleButton.tsx

## 1. 结论与边界

输入栏常驻的**上下文模式双态开关**（受控纯展示组件）：在"经典 / 索引"两档间切换，语义自述"经典 = 续接完整前序对话；索引 = 只检索相关历史，不上传全量 transcript"（`apps/electron/src/renderer/components/agent/ContextModeToggleButton.tsx:22-25`）。导出仅 1 个组件。

边界：不读写任何 atom/IPC/存储——`mode/onChange` 全由 props 传入（真实状态机在 `apps/electron/src/renderer/components/agent/AgentView.tsx:1047-1087` 与 `apps/electron/src/renderer/atoms/agent-atoms.ts:1266-1286`）；不做网络请求；不管理记忆开关（那是 `ContextMemoryToggleButton`，另一组件）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ContextModeToggleButton` | const（export，`React.FC`） | `:26-84` | `({ mode, onChange, disabled=false, disabledReason?, isProcessing=false }) => JSX` | 唯一导出 |
| `ContextModeToggleButtonProps` | interface（内部） | `:7-15` | `{ mode: AgentContextMode; onChange: (mode) => void; disabled?; disabledReason?; isProcessing? }` | props 契约 |
| `MODES` | const（内部） | `:17-20` | `[{value:'classic',label:'经典',icon:<BookOpen/>},{value:'index',label:'索引',icon:<Database/>}]` | 渲染与顺序来源 |

`AgentContextMode = 'classic' | 'index'`（`packages/shared/src/types/agent.ts:803`）。

## 3. 内部逻辑与关键流程

按渲染顺序（`apps/electron/src/renderer/components/agent/ContextModeToggleButton.tsx:33-83`）：

1. `locked = disabled || isProcessing`（`:33`）——两按钮 `disabled={locked}`（`:50`），容器 `opacity-50`（`:40-41`）、`cursor-not-allowed`（`:58`）。
2. `MODES.map`（`:44-65`）：`active = mode === item.value`（`:45`）；激活态 `bg-primary/10 text-primary dark:bg-primary/20`，未激活 `text-muted-foreground hover:...`（`:55-57`）；`aria-pressed={active}`（`:51`）；`onClick={() => onChange(item.value)}`（`:52`）——**点击即回调，无本地状态、无防抖**。
3. 文案 `hidden sm:inline`（`:62`）：窄屏只剩图标。
4. 容器 `aria-label="上下文模式：索引|经典"`（`:42`）。
5. Tooltip（`:35-82`）：标题行按 mode 显示（`:71`）；正文优先 `disabledReason`（`:74-75`），否则按 mode 显示两段固定说明（`:76-78`：索引=只检索相关历史降低 Token；经典=上下文最完整）。

条件分支共 3 组：`locked`（`:33/:40/:50/:58`）、`active`（`:45/:55-57/:51`）、tooltip 三元（`:74-78`）。无 throw、无 early-return、无异步。

## 4. 调用者与调用链

- **入向（唯一调用者）**：`apps/electron/src/renderer/components/agent/AgentView.tsx:27`（import）+ `:3229-3245`（渲染）：`mode={effectiveContextMode}`、`onChange={handleContextModeChange}`、`disabled={sessionMemoryDisabled}`、`disabledReason={...}`（记忆关闭 / 全局索引强制两种文案 `:3235-3241`）、`isProcessing={streaming || backgroundWaiting}`。冻结树检索 `ContextModeToggleButton` 仅命中本文件与 AgentView.tsx 两处。
- **出向**：`lucide-react` 的 `Database/BookOpen`（`:2`）、`@profer/shared` 的 `AgentContextMode` 类型（`:3`）、`@/lib/utils` 的 `cn`（`:4`）、`@profer/ui/primitives/tooltip` 三件套（`:5`）。
- **回调链（跨层传参）**：`onChange` → `AgentView.handleContextModeChange`（`AgentView.tsx:1082-1087`）：若 `mode==='classic' && globalContextIndexEnabled` 先 `handleGlobalContextIndexChange(false)`（关全局索引，写 `updateSettings({agentContextIndexGlobal})`，`:1068-1079`），再写 `sessionContextModeMapAtom[sessionId]=mode`。发送时该值以 `contextMode: effectiveContextMode` 透传主进程（`AgentView.tsx:2481`、`:2146`）。
- 显示值 `effectiveContextMode` 的优先级（`AgentView.tsx:1062-1066`）：`sessionMemoryDisabled → 'classic'`；否则 `globalContextIndexEnabled → 'index'`；否则会话选择（默认 'classic'，`agent-atoms.ts:1278-1280`）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/IPC/缓存访问；无全局状态读写；无副作用（纯渲染 + `onChange` 回调）。
- 唯一"输出"是 props 回调与 DOM 属性（aria-pressed/aria-label）。
- 不适用项依据：全文无 `window.`/`atom`/`localStorage`/事件订阅（逐行读 1-84 确认）。

## 6. 分支、失败、取消与恢复

- 仅 §3 三组条件分支；组件自身无失败路径、无异步、无取消/恢复需求（不适用，依据：文件内无 Promise/事件监听/资源获取）。
- 锁定态（`locked`）下点击被 `disabled` 吞掉，无回调——"运行中不可切模式"由此处与 `isProcessing` 传入方共同保证（`AgentView.tsx:3242`）。
- 显示层矛盾（照实记录）：`disabledReason` 在 `locked` 时仍渲染于 tooltip（`:74-75`），但 `disabled` 与 `isProcessing` 共用同一 tooltip 文案槽——运行中（isProcessing）时若无 `disabledReason`，tooltip 仍显示"模式说明"而非"运行中不可切换"（`AgentView.tsx:3235-3241` 仅对 `sessionMemoryDisabled`/全局索引给 reason）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role/权限检查。
- 权威状态不由本组件产生：`mode` 的持久化真源是 `sessionContextModeMapAtom`（atomWithStorage，`agent-atoms.ts:1272-1275`）与设置项 `agentContextIndexGlobal`（主进程 settings.json，经 `updateSettings`）；本组件只是投影。

## 8. 修改影响面

- 改 props 契约 → 唯一调用者 `AgentView.tsx:3229-3245`（工具栏 `inputToolbarItems` 的 `context-mode` 项）需同步；`AgentView.tsx` 的 `inputToolbarItems` useMemo 依赖数组含 `effectiveContextMode/handleContextModeChange/sessionMemoryDisabled/globalContextIndexEnabled`（`:3316-3321`）。
- 改 MODES 值/顺序 → 与 `AgentContextMode` 联合类型（`packages/shared/src/types/agent.ts:803`）及主进程 `contextMode` 语义联动；不可单改本文件。
- 改 tooltip 文案 → 无测试依赖（§9）；与 `AgentSettings.tsx:74-80` 的"全部会话使用索引模式"文案互为说明，改文案建议两边一致。

## 9. 测试证据

- **直接测试：无**。负向检索范围：冻结树 `baseline/source@05fb2565` 的 `apps/`+`packages/` 内 `*.test.*`/`*.spec.*` 全文检索 `ContextModeToggleButton` → 0 命中。
- **间接证据**：无测试渲染或断言本组件。`AgentView.tsx` 的上下文模式逻辑（`effectiveContextMode`/`handleContextModeChange`）亦无测试覆盖。
- 未覆盖：locked/active 渲染、tooltip 三元、回调参数均无断言。本轮 **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 = `ContextModeToggleButton`；纯受控组件无副作用 | 已证实 | 逐行读 `:1-84` |
| 唯一调用者 AgentView.tsx:27/:3229-3245 | 已证实（负向检索） | 冻结树全源码检索符号名仅 2 文件命中 |
| `onChange` → `handleContextModeChange` 的全局索引联动与落点 | 已证实 | `AgentView.tsx:1082-1087`、`:1068-1079`、`:2481` |
| `effectiveContextMode` 三级优先级 | 已证实 | `AgentView.tsx:1062-1066` |
| `sessionContextModeMapAtom` 落 localStorage | 推断 | `agent-atoms.ts:1272-1275`（jotai 默认 storage） |
| 窄屏（sm 以下）仅图标的实际可访问性 | 未知 | 未运行 GUI（NOT_RUN） |
| tooltip 无"运行中"文案的 UX 意图 | 未知 | 源码无注释说明 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `ContextModeToggleButton`（唯一导出） | §2/§3 | `:26-84` | covered |
| `ContextModeToggleButtonProps`/`MODES` | §2 | `:7-15`/`:17-20` | covered |
| `locked`/`active`/tooltip 三分支 | §3/§6 | `:33-78` | covered |
| 回调链到 atom/IPC | §4 | AgentView 行号 | covered |
| 显示层 reason 槽位语义 | §6 | `:74-75` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
