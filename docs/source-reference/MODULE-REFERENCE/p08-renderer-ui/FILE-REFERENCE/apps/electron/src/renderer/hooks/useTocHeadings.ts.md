---
path: apps/electron/src/renderer/hooks/useTocHeadings.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c02e84dcd7d497590c1a539dde312b415bd3e319
sha256: 5966d37c91a102416733ff93f10945cb202136eba31992b2a7b1864b4b60411d
lines: 97
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/useTocHeadings.ts

## 1. 结论与边界

预览标题树提取 hook（运行时）：从滚动容器的渲染结果提取 h1-h6 标题树并为缺 id 的标题注入锚点 id；因 TipTap 异步渲染、Shiki 高亮、图片懒加载持续改 DOM，用 MutationObserver + debounce 重提取而非挂载时一次读取（文件头注释 `apps/electron/src/renderer/hooks/useTocHeadings.ts:13-23`）。

边界：不渲染目录 UI（消费方 `MarkdownToc`）；不做滚动高亮（`useScrollSpy`）；不改标题文本/层级，只补 id；slug 策略在 `lib/slugify` 的 `createSlugger`，本文件不定义。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 1 函数 = 2 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TocHeading` | 接口（导出） | 4-9 | `{id: string; level: number; text: string; el: HTMLElement}` | 标题节点（保留 DOM 引用） |
| `useTocHeadings` | 函数（导出） | 24-85 | `(containerRef: React.RefObject<HTMLElement>, contentKey: string, enabled: boolean) => TocHeading[]` | 主 hook |
| `HEADING_SELECTOR` | 常量（内部） | 11 | `'h1, h2, h3, h4, h5, h6'` | 选择器 |
| `sameHeadings` | 函数（内部） | 87-97 | `(a, b) => boolean` | 逐项比 el/id/level/text 防抖状态更新 |

## 3. 内部逻辑与关键流程

### 3.1 守卫（`:31-40`）

`!enabled` → `setHeadings([])`（`:32-35`）；容器未挂 → `setHeadings([])`（`:36-40`）。

### 3.2 `extract`（`:42-54`）

`createSlugger()` 每轮新建（`:43`，同文本重复 slug 归并策略由 slugify 决定）；`querySelectorAll(HEADING_SELECTOR)`（`:45`）；跳过空 text（`:48`）；`level = Number(el.tagName.slice(1))`（`:49`）；**无 id 的标题注入 `el.id = slug(text)`（`:50`，DOM 写副作用）**；`setHeadings` 前经 `sameHeadings` 比较，相同则保留旧引用（`:53`）。

### 3.3 时序（`:56-74`）

挂载即 `extract()`（`:56`）+ 三次补提取定时器 0/240/600ms（`:57-61`，覆盖异步渲染/高亮/懒加载）。`schedule`（`:65-71`）：debounce 120ms（`clearTimeout`+`setTimeout`）后 `requestAnimationFrame(extract)`。`MutationObserver(childList+subtree)` 触发 `schedule`（`:73-74`）。

### 3.4 清理（`:76-81`）

`observer.disconnect()`、清 3 个初识 timer、debounce timer、`cancelAnimationFrame(raf)`。effect deps `[containerRef, contentKey, enabled]`（`:82`），`contentKey` 变化强制重建 observer 与提取（注释 `:21`）。

## 4. 调用者与调用链

入向（全树 `*.ts/*.tsx` 检索，证实）：`components/diff/MarkdownToc.tsx:4`（import）、`:25`（`useTocHeadings(containerRef, contentKey, enabled)`）。类型被 `hooks/useScrollSpy.ts:2` 导入（`TocHeading`）。无其它调用者、无测试引用。

出向：`../lib/slugify` 的 `createSlugger`（`:2`，定义 `apps/electron/src/renderer/lib/slugify.ts:27`）；React state/effect；DOM querySelectorAll/MutationObserver。

## 5. 数据 I/O、读写与副作用

- 写：React state（headings）；**DOM 写 `el.id`（`:50`）**——为锚点注入，改渲染结果 DOM 属性。不写盘/网络/atom（依据：本文件无 fs/IPC/fetch）。
- 副作用：MutationObserver；3+1 定时器；rAF。
- 并发：debounce + rAF 合帧；`sameHeadings` 防止无意义 state 更新（`:53,:87-97`）。
- 幂等：重复 extract 对已有 id 的标题不再改写（`:50` 条件 `!el.id`）；slug 幂等性取决于 `createSlugger` 每轮新建（同文本多标题时各轮归并结果可能随 DOM 变化，推断）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 清空 | `!enabled`/容器缺失 | 32-40 |
| 跳过空标题 | text 空 | 48 |
| 注入 id | `!el.id` | 50 |
| 状态保持 | sameHeadings 为真 | 53 |

卸载全清理（§3.4）；无 try/catch；无恢复概念，依据：状态随容器 DOM 重建。`contentKey` 变化即视为新内容，重新提取（`:82`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；DOM id 注入不涉及权限，权威=当前渲染 DOM。

## 8. 修改影响面

- 调用方 `MarkdownToc.tsx:25`；`TocHeading` 类型同时被 `useScrollSpy.ts:2` 消费——改接口需同步两文件。
- `el.id` 注入影响锚点跳转（MarkdownToc 的点击滚动）与任何按 id 查询的逻辑。
- `HEADING_SELECTOR`/层级计算改动手感影响目录树。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `useTocHeadings` 0 命中。间接证据：无。

真实断言：不适用。未覆盖：debounce 时序、id 注入、sameHeadings 短路、contentKey 重建。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI/真实渲染；以上行为均为冻结源码静态可见。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 签名 | 已证实 | `:4-9, 24-28` |
| extract 全流程含 id 注入 | 已证实 | `:42-54` |
| 0/240/600ms + 120ms debounce + rAF | 已证实 | `:56-71` |
| sameHeadings 比较维度 | 已证实 | `:87-97` |
| 调用方/类型消费方 | 已证实 | `MarkdownToc.tsx:4,25`；`useScrollSpy.ts:2` |
| DOM 写副作用 el.id | 已证实 | `:50` |
| slug 多标题归并的跨轮一致性 | 推断 | `createSlugger` 每轮新建（`:43`），slugify 内部未逐行读 |
| TipTap/Shiki 实际 DOM 时序 | 未知 | NOT_RUN |
| 运行期表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `TocHeading` | §2 | 4-9 | covered |
| `useTocHeadings` | §3 | 24-85 | covered |
| `HEADING_SELECTOR` | §2 | 11 | covered |
| `sameHeadings` | §2, §3.2 | 87-97 | covered |
| 守卫/空文本/id 注入分支 | §3.1-3.2, §6 | 32-50 | covered |
| 时序与清理 | §3.3-3.4 | 56-81 | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
