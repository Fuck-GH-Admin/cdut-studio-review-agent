---
path: apps/electron/src/renderer/components/diff/DiffView.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 85158f2a13c941719b5f5720f747696db2aee060
sha256: 63cf9001c899b5e2a4cebcb2e867aa1ac784d1dbd5c3f61e8cc881884e7107b6
lines: 149
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/DiffView.tsx

## 1. 结论与边界

`@pierre/diffs` 的 diff 渲染包装（React.memo）：接收 old/new 内容经 `MultiFileDiff` 渲染 split/unified 两种视图，主题色绑定应用 token；单侧超过 `MAX_DIFF_LINES`（5000）行**不计算 diff**（防 Myers O(N*D) 阻塞主线程），改显纯文本提示（`apps/electron/src/renderer/components/diff/DiffView.tsx:1-19`）。

边界：

- 不取文件内容（内容由调用方传入）；不做语法高亮配置（归 `@pierre/diffs`/shiki）。
- 不渲染文件头（`disableFileHeader: true`）；不支持多文件（单 `filePath`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个（const 组件 1；类/接口/函数导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DiffView` | 组件（导出，`React.memo`） | 37-149 | `({oldContent,newContent,filePath,viewMode}) => React.ReactElement` | diff 渲染器 |
| `MAX_DIFF_LINES` | 内部常量 | 19 | `5_000` | 单侧行数上限 |
| `DiffViewProps` | 内部接口 | 21-26 | `{oldContent;newContent;filePath;viewMode:'split'\|'unified'}` | props |
| `countLines` | 内部函数 | 28-35 | `(content) => number` | 空串 0；否则 1+换行数 |

## 3. 内部逻辑与关键流程

`apps/electron/src/renderer/components/diff/DiffView.tsx:37-149`：

1. `theme = useAtomValue(resolvedThemeAtom)`（`:38`）；`oldLines`/`newLines` memo 计行数（`:40-41`）；`tooLarge = oldLines > 5000 || newLines > 5000`（`:42`）。
2. `oldFile`/`newFile`：`FileContents {name: filePath, contents}`，memo 按内容（`:44-52`）。
3. `options` memo（`:54-124`，依赖 `[viewMode, theme]`）：`diffStyle=viewMode`、主题 `dark:'one-dark-pro' / light:'one-light'`、`disableFileHeader`、`diffIndicators:'bars'`、`hunkSeparators:'line-info'`、`lineDiffType:'none'`、`overflow:'scroll'`、`themeType`（atom 值）；`unsafeCSS` 把 `--diffs-*` 变量绑定应用 token（addition/deletion 色、separator、滚动条 6px、行号/gutter 底色，`:63-123`）。
4. `tooLarge` 分支（`:126-142`）：居中提示「文件过大，无法显示差异对比」+ 新旧行数（`toLocaleString()`）+ 建议命令行 `git diff`；不调用 MultiFileDiff（此时不计算 diff）。
5. 正常分支（`:144-147`）：`.diff-scroll` 容器内 `<MultiFileDiff oldFile newFile options className="h-full">`（依赖 `./diff-scroll.css`，`:16`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/DiffTabContent.tsx:23`（import）、`DiffTabContent.tsx:1235`（`oldContent/newContent/filePath/viewMode` 传入，diff 渲染分支）。无测试引用（见 §9）。

出向：`@pierre/diffs/react`（`MultiFileDiff`）、`@pierre/diffs`（`FileContents` 类型）、`@/atoms/theme`（`resolvedThemeAtom`）、`./diff-scroll.css`。

## 5. 数据 I/O、读写与副作用

- 无 IPC/磁盘/网络；props 纯输入。
- 副作用：`unsafeCSS` 向 `@pierre/diffs` 注入样式（`:63-123`）；依赖 `diff-scroll.css` 全局导入（`:16`）。
- 性能语义：`React.memo` + memos；`tooLarge` 时**跳过 diff 计算**（`:126`），这是防主线程阻塞的关键分支（注释 `:7-8,18`）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| 任一侧 >5000 行 | 42,126-142 | 提示屏（不渲染 diff） |
| 两侧 ≤5000 行 | 144-147 | MultiFileDiff 渲染 |
| `countLines('')` | 29 | 0 |

- 无异步、无 throw；无恢复语义（行数是纯输入派生）。
- 文本换行计数为近似（无末行换行的尾行计入，`:28-35`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role/IPC。主题权威是 `resolvedThemeAtom`（应用主题解析结果）。

## 8. 修改影响面

- 改 props 契约影响 `DiffTabContent.tsx:1235` 的 diff 分支。
- 改 `MAX_DIFF_LINES` 直接改变大文件体验与阻塞阈值（与 shiki 耗时相关，注释 `:18`）。
- 改 `unsafeCSS` 变量映射影响 diff 配色/滚动条（应用主题 token 变更需同步）。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `DiffView`/`countLines` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：tooLarge 阈值、countLines、viewMode 切换均无自动化断言。维护者验证：打开含变更文件，切 split/unified；打开 >5000 行文件验证提示屏。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出（React.memo 组件） | 已证实 | 全文 `export` 逐条核（仅 `:37`） |
| 阈值 5000、超限不渲染 diff | 已证实 | `:19,42,126-142` |
| countLines 空串 0/1+换行 | 已证实 | `:28-35` |
| options 绑定应用 token | 已证实 | `:54-124` |
| 唯一调用点 DiffTabContent | 已证实（检索） | `DiffTabContent.tsx:23,1235` |
| MultiFileDiff 内部/真实阻塞曲线 | 未知 | 依赖库实现，未读；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DiffView` | §3 | 37-149 | covered |
| `countLines` | §2,§3 | 28-35 | covered |
| tooLarge 分支 | §3,§6 | 42,126-142 | covered |
| options/unsafeCSS | §3,§5 | 54-124 | covered |
| 正常渲染 | §3 | 144-147 | covered |
| 测试 | §9 | — | unknown |
