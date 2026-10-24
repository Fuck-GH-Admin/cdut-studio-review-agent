---
path: apps/electron/src/renderer/hooks/usePreviewQuotedSelection.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3046a7d5384abe32196bbeaffb1701e4bd016f9a
sha256: 064f77a9310f27f0805f10bcb1f1746dec842bbd053143a9882527011335852a
lines: 176
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/usePreviewQuotedSelection.ts

## 1. 结论与边界

预览面板划词引用 hook（运行时）：监听容器内选区变化（含开放 Shadow DOM），把选中文本写入当前会话的 `quotedSelectionMapAtom` 引用附件，并回调 `onSelectionChange`；超过 2000 字符截断并 toast 提示（文件头注释 `apps/electron/src/renderer/hooks/usePreviewQuotedSelection.ts:74`）。

边界：不负责发送消息/注入输入框（只写引用状态）；不做行号定位（`QuotedSelection` 的 startLine/endLine 不由本文件填）；不处理浏览器本地文件预览的哨兵 URL 回投（那是 `useBrowserLocalFileSelectionQuote` 的职责，`apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.ts:13-14` 注释交叉引用）；不持久化（只写内存 atom）。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 1 函数 = 2 个导出（类型/函数分开计数；常量/内部函数不导出）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PreviewSelectionSnapshot` | 接口（导出） | 61-64 | `{ text: string; rect: DOMRect \| null }` | 选区快照 |
| `usePreviewQuotedSelection` | 函数（导出） | 75-176 | `({containerRef, sessionId?, filePath, sourceType='file', sourceLabel?, onSelectionChange?, enabled=true}) => void` | 主 hook |
| `MAX_QUOTED_CHARS` | 常量（内部） | 6 | `2000` | 截断上限 |
| `isSelectionInside` | 函数（内部） | 8-17 | `(container, selection) => boolean` | 沿 `commonAncestorContainer` 上溯，穿 `ShadowRoot.host`（`:13-14`） |
| `getSelectionRect` | 函数（内部） | 19-25 | `(selection) => DOMRect \| null` | rect 宽高均 0 时回退 `getClientRects()[0]`（`:23-24`） |
| `getDeepSelection` | 函数（内部） | 27-59 | `(container, shadowRoots) => PreviewSelectionSnapshot \| null` | 三级取选区（见 §3.4） |
| `walk` | 闭包（内部） | 42-57 | `(node) => PreviewSelectionSnapshot \| null` | 递归开放 Shadow DOM 兜底 |
| `discoverShadowRoots` | 函数（内部） | 66-72 | `(root, target: Set<ShadowRoot>) => void` | TreeWalker 收集开放 shadowRoot |

## 3. 内部逻辑与关键流程

### 3.1 `capture` 回调（`usePreviewQuotedSelection.ts:103-136`）

1. 守卫：`!enabled || !sessionId || !containerRef.current` 直接 return（`:104`）。
2. `getDeepSelection` 取选区（`:106`）；`clear` 闭包（`:107-112`）仅当 Map 已有该 `sessionId` 键时删项并换新 Map 引用。
3. 无选区（`:113-118`）：`onSelectionChange(null)`、`dismissToast()`；仅当 `document.activeElement` 不在 `.ProseMirror, [data-input-mode]` 内才 `clear()`（`:116-117`，焦点在输入区时保留旧引用）。
4. 有选区：`len > 2000` 截断取前 2000（`:120-121`）；回调快照（`:122`）；写 atom（`:123-129`）——幂等：`existing.text === text && existing.filePath === filePath` 时返回原 Map（`capturedAt` 不刷新，`:125`），否则 `set(sessionId, {text, filePath, sourceType, sourceLabel, capturedAt: Date.now()})`（`:127`）。
5. 截断提示（`:130-134`）：toast id = `quoted-chars-cap:${sessionId}:${Math.floor(len/1000)*1000}`（按千字分桶去重），已有不同 id 先 dismiss（`:132`），`toast.warning('已选中超过 2000 字符，仅引用前 2000 字符', {id, duration: 3000})`（`:133`）；未截断则 `dismissToast()`（`:135`）。

### 3.2 监听 effect（`:138-175`）

1. 守卫同 `:139`；`roots.clear()` 后 `discoverShadowRoots(container, roots)` 初始收集（`:141-143`）；`MutationObserver(childList+subtree)` 对新增节点增量收集（`:144-147`）。
2. 拖拽跟踪：`mousedown`（button===0 且 target 在容器内）→ `tracking=true`（`:158`）；`mousemove` 跟踪期持续 `schedule()`（`:159`）；`mouseup` 收尾（`:160`）；`selectionchange` 也 `schedule()`（`:161`）。
3. `schedule`（`:150-157`）：非拖拽且 document 选区折叠或不在容器内时跳过昂贵遍历（`:152-155`）；`requestAnimationFrame` 合帧执行 `capture`（`:156`，单帧去重）。

### 3.3 清理（`:166-174`）

`cancelAnimationFrame`、`onSelectionChange(null)`、`observer.disconnect()`、`roots.clear()`、`dismissToast()`、移除 container 1 个 + document 3 个监听（`:170-173`）。

### 3.4 `getDeepSelection` 三级取数（`:27-59`）

document 选区（非折叠、rangeCount>0、在容器内，`:28-32`）→ 已缓存 shadowRoots 的 `getSelection?.()`（host 在容器内才查，`:33-40`）→ 递归 `walk` 开放 Shadow DOM 兜底（`:42-58`，注释称与原生文件预览一致 `:41`）。`getSelection` 在 ShadowRoot 上为非标准 API，用 cast 调用（`:35,:44`），不存在则跳过。

## 4. 调用者与调用链

入向（冻结树 `apps/`+`packages/` 全 `*.ts/*.tsx` 检索，import 形式与名字形式各一遍）：**无任何导入调用者**。仅命中本文件定义（`:75`）与两条注释：`packages/shared/src/constants/browser-file-sentinels.ts:24`、`apps/electron/src/renderer/hooks/useBrowserLocalFileSelectionQuote.ts:14`。结论：本 hook 在冻结树内无生产调用者（否定范围=上述检索；动态 `import()`/字符串引用未覆盖，见 UNVERIFIED）。注释称与 `DiffTabContent` 同款（`:74`）——那是行为类比，不是调用关系。

出向：`@/atoms/preview-atoms` 的 `quotedSelectionMapAtom`（`apps/electron/src/renderer/atoms/preview-atoms.ts:73`）与 `QuotedSelectionSourceType`（`preview-atoms.ts:48`）；`sonner` toast（`:3`）；jotai `useSetAtom`（`:2`）；DOM Selection/TreeWalker/MutationObserver API。

## 5. 数据 I/O、读写与副作用

- 写：jotai atom `Map<sessionId, QuotedSelection>`（`:123-129`，字段 text/filePath/sourceType/sourceLabel/capturedAt）；每次写用新 Map 引用（`:128`）。不写盘、不发网络（依据：本文件无 fs/IPC/fetch 调用）。
- 副作用：toast 提示/关闭；容器与 document 事件监听；MutationObserver；rAF。均为 UI 层，无进程/窗口操作。
- 并发：renderer 单线程；`capture` 经 rAF 合帧，同一帧多次触发只执行一次。
- 幂等：同 text+filePath 重复命中不刷新 capturedAt（`:125`）；`clear` 对缺失键 no-op（`:108`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 全 no-op | `!enabled`/无 `sessionId`/容器未挂 | 104, 139 |
| 清空引用 | 无选区且焦点不在输入区 | 113-118 |
| 保留旧引用 | 无选区但焦点在 `.ProseMirror, [data-input-mode]` | 116-117 |
| 截断+warning | 选区 >2000 字符 | 120-121, 130-134 |
| 幂等跳过 | 同 text+filePath | 125 |
| 拖拽跟踪期 | mousedown→mouseup 之间 | 158-160 |

无 try/catch：DOM API 异常直接冒泡（推断）。卸载即完全清理（§3.3），无遗留监听；无持久状态，重挂载后从空开始。取消/恢复概念不适用，依据：本文件无异步任务与持久状态。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/身份检查；写的是本渲染进程内存 atom，权威边界=当前会话 UI 状态，不产生跨进程权威。

## 8. 修改影响面

- 无现成调用方（§4），改动当前不影响任何生产入口；若接入，将影响 `quotedSelectionMapAtom` 的既有消费者：`AgentView.tsx:763,1967-1970,2415-2420`、`AgentHistorySelectionLayer.tsx:92`、`useBrowserLocalFileSelectionQuote.ts:46`（同一 atom 的并排 chip 语义，`preview-atoms.ts:87-90` 注释）。
- 跨文件常量契约：`MAX_QUOTED_CHARS=2000` 与 `BROWSER_LOCAL_FILE_SELECTION_MAX_CHARS=2000`（`packages/shared/src/constants/browser-file-sentinels.ts:26`）注释声明“同值”（`:22-25`）；改上限必须两侧同步并复核主进程兜底截断。
- 修改 `QuotedSelection` 写入字段需同步 `preview-atoms.ts:51-68` 接口与其它写入方。

## 9. 测试证据

直接测试：**无**。冻结树 `*.test.ts`/`*.test.tsx`/`*.spec.ts` 全树检索本 hook 名 0 命中（检索范围见 §4）。同目录 `useBrowserLocalFileSelectionQuote.test.ts` 测的是姊妹 hook，非本文件（间接/无关，不构成本文件断言）。

真实断言：不适用（无测试）。未覆盖：全部行为（选区三级取数、截断、幂等、清理）均无自动验证。

NOT_RUN：本轮未运行任何测试、typecheck、构建、Electron/GUI、真实浏览器选区；以上“行为”只表示冻结源码静态可见。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 6 内部符号及行号 | 已证实 | `usePreviewQuotedSelection.ts:6-96` 逐行读 |
| 写 atom 字段与幂等规则 | 已证实 | `:123-129` |
| 截断 2000/toast id/3000ms | 已证实 | `:6,120-134` |
| 清空条件（焦点判定） | 已证实 | `:113-118` |
| 冻结树无导入调用者 | 已证实 | 全树 import/名字形式检索 0 命中 |
| ShadowRoot#getSelection 非标准、缺省即跳过 | 已证实 | `:35,:44`（可选调用 `?.()`） |
| 与 sentinel 常量同值 2000 | 已证实 | `browser-file-sentinels.ts:24-26` |
| 未接入原因（预留/重构遗留） | 推断 | 仅注释交叉引用，无调用史证据 |
| 运行期选区/渲染表现 | 未知 | NOT_RUN |
| 动态 import/字符串引用的调用者 | 未知 | 已尝试检索：全树 `.ts/.tsx` 文本；未覆盖运行期拼接 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PreviewSelectionSnapshot` | §2 | 61-64 | covered |
| `usePreviewQuotedSelection` 主流程 | §3 | 75-176 | covered |
| `MAX_QUOTED_CHARS` 截断分支 | §3.1, §8 | 6, 120-134 | covered |
| `isSelectionInside` | §2, §3.4 | 8-17 | covered |
| `getSelectionRect` 回退 | §2 | 19-25 | covered |
| `getDeepSelection` 三级 | §3.4 | 27-59 | covered |
| `discoverShadowRoots` | §2, §3.2 | 66-72, 141-147 | covered |
| 清空条件（焦点守卫） | §3.1, §6 | 113-118 | covered |
| 监听/清理 | §3.2, §3.3 | 138-175 | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
