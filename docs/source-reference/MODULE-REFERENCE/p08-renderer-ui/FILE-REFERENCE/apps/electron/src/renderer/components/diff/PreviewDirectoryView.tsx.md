---
path: apps/electron/src/renderer/components/diff/PreviewDirectoryView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 873ae55ca98d201afb0cfadb1b5bc26f3042c98b
sha256: c5ace7a4d221940fc1612da89e5d4c0d8a3a8c43dfebdd9b0685f2a345735b62
lines: 156
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/PreviewDirectoryView.tsx

## 1. 结论与边界

预览面板的目录视图：当会话文件链接指向目录（如皮肤目录）时展示目录清单——子目录可逐级进入、文件点击直接开预览（`apps/electron/src/renderer/components/diff/PreviewDirectoryView.tsx:1-9`）。含一个导出的纯格式化函数 `formatEntrySize`。

边界：

- 列表数据全部来自主进程 `listDirectory`（只读预览策略；系统/凭据敏感位置由主进程拒绝，`:7`）；排序由主进程保证（目录在前、隐藏项靠后、名称本地化排序，`:8`）。
- 不做文件读写、不做大小统计（`size` 是 `FileEntry` 带来的）；预览动作委托 `useOpenPreview`。

## 2. 导出与关键符号

`export` 逐条核对：2 个（函数 2，类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `formatEntrySize` | 函数（导出） | 20-31 | `(size?: number) => string` | 体积列格式化（见 §3.1） |
| `PreviewDirectoryView` | 函数（导出） | 40-156 | `({filePath, sessionId, basePaths?}) => React.ReactElement` | 目录视图组件 |
| `PreviewDirectoryViewProps` | 内部接口 | 33-38 | `{filePath: string; sessionId: string; basePaths?: string[]}` | props |

## 3. 内部逻辑与关键流程

### 3.1 `formatEntrySize`（`apps/electron/src/renderer/components/diff/PreviewDirectoryView.tsx:20-31`）

`size` 为 `undefined`/非有限/负数 → `''`（`:21`）；`<1024` → `` `${size} B` ``（`:22`）；否则按 `['KB','MB','GB','TB']` 逐级除 1024（`unitIndex` 封顶 `units.length-1`，`:23-29`）；`value<10` 取 `toFixed(1)`，否则 `Math.round`（`:30`）。

### 3.2 组件（`:40-156`）

1. 状态：`currentPath`（初始 `filePath`）、`entries`、`loading`（初始 true）、`error`（`:42-45`）。
2. `filePath` 变化 → `setCurrentPath(filePath)` 重置到新目录（`:48-50`）。
3. 列表 effect（`:52-72`）：`cancelled` 令牌；`window.electronAPI.listDirectory(currentPath, { sessionId, candidateBasePaths: basePaths })` 成功 `setEntries`，失败 `setEntries([])` + `setError(err.message ?? '无法读取该目录')`（非 Error 用固定文案，`:66`）；依赖 `[basePaths, currentPath, sessionId]`；cleanup 置 `cancelled`（卸载/切换后丢弃过期结果）。
4. `parentPath = getFileParentPath(currentPath)`、`currentName = getFileBaseName(currentPath) || currentPath`（`:74-75`）。
5. `openEntry`（`:77-90`）：目录 → `setCurrentPath(entry.path)` 下钻；文件 → `openPreview(sessionId, {filePath: entry.path, previewOnly: true, basePaths})`（basePaths 空数组归一为 undefined，`:86`）。
6. 渲染（`:92-155`）：顶栏（上级按钮 `disabled={!parentPath}`，`:97`；计数/“读取中”，`:107`）；主体四态：loading（Loader2）、error（TriangleAlert + 文案 + 路径，`:116-121`）、空目录（`:122-123`）、列表（Folder/FileTypeIcon + 名称 + `formatEntrySize(entry.size)`，`:125-146`）；底栏提示（仅非 loading 非 error，`:149-153`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/DiffTabContent.tsx:27`（import）、`DiffTabContent.tsx:1070`（目录分支渲染）。测试：`PreviewDirectoryView.test.ts:2`（仅测 `formatEntrySize`）。

出向：`@/components/diff/preview-opener`（`useOpenPreview`，`:16`）、`@/lib/file-utils`（`getFileBaseName`/`getFileParentPath`）、`@/components/file-browser/FileTypeIcon`、`@profer/shared`（`FileEntry` 类型）、`window.electronAPI.listDirectory`（IPC）。

## 5. 数据 I/O、读写与副作用

- 读：IPC `listDirectory(currentPath, {sessionId, candidateBasePaths: basePaths})`（`:56-57`）——只读目录清单；无写。
- 副作用：`openPreview` 会话级预览状态写入（`previewFileMapAtom`，经 preview-opener）；滚动/布局无副作用。
- 并发：`cancelled` 令牌防旧响应覆盖新状态（`:53,59,64,69-71`）；无锁；请求可重入（依赖变化即重发）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| `filePath` 变化 | 48-50 | 回到新目录根 |
| IPC 失败 | 63-68 | entries 清空 + error 文案（`err.message` 或 '无法读取该目录'） |
| 空目录 | 122-123 | “空目录”占位 |
| 无上级目录 | 97-98 | 上级按钮 disabled |
| 条目为目录/文件 | 79-87 | 下钻 / 开预览 |
| 旧响应回来 | 59,64 | 丢弃（cancelled） |

- 失败后状态：错误屏显示路径，可点上级/切文件恢复；无自动重试。
- 不可恢复点：无。

## 7. 权限与权威状态

- 渲染层无权限检查；只读预览的路径守卫在主进程 `listDirectory` 侧（敏感位置拒绝，文件头注释 `:7`）。
- `sessionId`+`candidateBasePaths`（`basePaths`）是传给主进程的授权上下文（`:57`）。

## 8. 修改影响面

- 改 `FileEntry` 形状需同步主进程 `listDirectory` 输出与 `@profer/shared` 类型。
- 改 `openEntry` 的 `previewOnly: true` 影响预览打开语义（preview-opener）。
- `formatEntrySize` 被本组件 `:142` 消费并被 `PreviewDirectoryView.test.ts` 锁定 9 条断言；改动会破坏测试。
- 挂载点 `DiffTabContent.tsx:1070` 的目录分支依赖其自管路径状态。

## 9. 测试证据

直接测试：`apps/electron/src/renderer/components/diff/PreviewDirectoryView.test.ts` —— 仅覆盖 `formatEntrySize`（3 用例 9 断言：B/KB/MB 换算与非法值空串；详见该测试手册）。组件本体（列表 effect/四态渲染/下钻/预览）**无测试**。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行。

缺口（静态判断）：listDirectory 失败分支、cancelled 竞态、空目录、下钻/回退均无自动化断言。维护者验证：预览中点目录链接，进入子目录、点文件预览、断 IPC 看错误屏。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出（`formatEntrySize`+组件） | 已证实 | 全文 `export` 逐条核（`:20`、`:40`） |
| 非法 size → 空串 | 已证实 | `:21` + 测试 `:18-20` |
| KB/MB 小数规则 | 已证实 | `:30` + 测试 `:11-14` |
| 列表读取走 IPC listDirectory | 已证实 | `:56-57` |
| cancelled 令牌丢弃过期响应 | 已证实 | `:53,59,64,69-71` |
| 目录下钻/文件预览分流 | 已证实 | `:79-87` |
| 主进程 listDirectory 拒绝策略细节 | 未知 | 文件外，未读实现 |
| 测试运行结果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `formatEntrySize` | §3.1 | 20-31 | covered |
| 状态与路径重置 | §3.2 | 42-50 | covered |
| 列表 effect/失败 | §3.2,§6 | 52-72 | covered |
| `openEntry` 分流 | §3.2 | 77-90 | covered |
| 四态渲染 | §3.2,§6 | 111-147 | covered |
| 测试（formatEntrySize） | §9 | — | covered |
| 组件行为测试 | §9 | — | unknown（无） |
