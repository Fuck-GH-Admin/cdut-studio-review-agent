---
path: apps/electron/src/renderer/components/diff/MarkdownToc.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a81fc2bcc24c2e48367d642b06524f2e253f98a9
sha256: ab5ff467649c4c8c212631f35bba162b686a6bc44a3914115fd6e9bd76cc2929
lines: 99
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/MarkdownToc.tsx

## 1. 结论与边界

Markdown 只读预览的侧边目录组件：从预览滚动容器提取标题列表（`useTocHeadings`）、用滚动监听高亮当前标题（`useScrollSpy`），点击平滑跳转，active 项自动保持在目录视区内（`apps/electron/src/renderer/components/diff/MarkdownToc.tsx:1-22`）。

边界：

- 不解析 Markdown 本身（标题提取在 `useTocHeadings`）；不渲染文档内容。
- 仅用于只读预览（props 注释 `:13` “仅 Markdown 只读预览时为 true”）；`enabled=false` 整体不渲染。
- 无数据读写、无 IPC。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MarkdownToc` | 函数（导出） | 24-99 | `({containerRef, contentKey, enabled, onOpenChange?}) => React.ReactElement \| null` | 目录组件 |
| `offsetTopWithin` | 内部函数 | 20-22 | `(node, container) => number` | 标题相对容器的 top（rect 差 + scrollTop，不依赖 offsetParent 链） |
| `MarkdownTocProps` | 内部接口 | 8-17 | `{containerRef; contentKey; enabled; onOpenChange?}` | `contentKey` 变化重建目录 |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/MarkdownToc.tsx:24-99`：

1. `useTocHeadings(containerRef, contentKey, enabled)` 得标题表；`useScrollSpy(containerRef, headings)` 得 `activeId`（`:25-26`）。
2. active 滚入视区 effect（`:30-34`）：`[data-toc-id="..."]`（`CSS.escape` 转义）`scrollIntoView({block:'nearest'})`，依赖 `[activeId]`。
3. `minLevel` memo（`:36-39`）：所有标题的最小层级（空表取 1），用于缩进基准。
4. `!enabled` → `null`（`:41`）。
5. `jumpTo`（`:43-48`）：`offsetTopWithin(heading.el, container)` 后 `container.scrollTo({top: Math.max(top-8,0), behavior:'smooth'})`；容器不存在直接 return。
6. 渲染（`:50-97`）：`nav`（w-52）+ 标题行“目录”+ 可选收起按钮（`onOpenChange(false)`，`:57-71`）+ 按钮列表：`paddingLeft=(level-minLevel)*12+8`（`:83`）、active 时 border-primary/加粗/底色（`:87-89`）、`key`/`data-toc-id`=heading.id、`title`=heading.text。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/tabs/TabContent.tsx:15`（import）、`TabContent.tsx:97`（`contentKey={content.slice(0,100)} enabled={tocOpen}`）；`apps/electron/src/renderer/components/diff/DiffTabContent.tsx:28`（import）、`DiffTabContent.tsx:1044`（预览目录挂载）。无测试引用（见 §9）。

出向：`@/hooks/useTocHeadings`（标题提取，`:4`）、`@/hooks/useScrollSpy`（滚动监听高亮，`:5`）、`lucide-react`、`@profer/ui/primitives/tooltip`、`@/lib/utils`（`cn`）。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/IPC；只读 DOM 几何（`getBoundingClientRect`/`scrollTop`）。
- 副作用：`scrollIntoView`（`:33`）改目录滚动位置；`container.scrollTo`（`:47`）改预览滚动位置。无全局状态写入。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| `!enabled` | 41 | 渲染 null |
| 无 `activeId`/listRef 空 | 31 | 跳过 scrollIntoView |
| 容器 ref 为空 | 44-45 | `jumpTo` 直接 return |
| 无 `onOpenChange` | 57 | 不渲染收起按钮 |
| headings 空 | 36-39,74 | minLevel=1；列表空渲染 |

- 无 throw/异步；无取消需求（effect 同步）。恢复：不适用。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查、无 IPC。`enabled` 权威在调用方（TabContent 的 `tocOpen` / DiffTabContent 的预览模式判断）。

## 8. 修改影响面

- 改 props 形状影响 `TabContent.tsx:97` 与 `DiffTabContent.tsx:1044` 两处传参。
- 改 `data-toc-id` 契约需同步 `useTocHeadings`/`useScrollSpy` 输出的 `heading.id`。
- 改跳转偏移（`top-8`）影响所有预览跳转手感。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `MarkdownToc` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：active 高亮、跳转偏移、收起回调均无自动化断言。维护者验证：Markdown 预览打开目录，滚动看高亮、点击跳转。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:24`） |
| `!enabled` 渲染 null | 已证实 | `:41` |
| 跳转=top-8 平滑滚动 | 已证实 | `:43-48` |
| active 项 nearest 滚入 | 已证实 | `:30-34` |
| 缩进按 (level-minLevel)*12+8 | 已证实 | `:83` |
| 两个调用点 | 已证实（检索） | `TabContent.tsx:97`、`DiffTabContent.tsx:1044` |
| useTocHeadings/useScrollSpy 内部实现 | 未知 | 文件外，未逐行读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MarkdownToc` | §3 | 24-99 | covered |
| `offsetTopWithin` | §2,§3 | 20-22 | covered |
| active 滚入 effect | §3 | 30-34 | covered |
| `jumpTo` | §3 | 43-48 | covered |
| 收起按钮 | §3,§6 | 57-71 | covered |
| 渲染/高亮/缩进 | §3 | 74-95 | covered |
| 测试 | §9 | — | unknown |
