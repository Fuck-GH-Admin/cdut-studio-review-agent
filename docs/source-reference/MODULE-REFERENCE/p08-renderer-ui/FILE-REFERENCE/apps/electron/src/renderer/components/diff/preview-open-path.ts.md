---
path: apps/electron/src/renderer/components/diff/preview-open-path.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 52f9b10143b14608933bc5df27c3c55ddae421e3
sha256: b888af1eb72d1571736c68876926cba5de28d5fe998ff31294e9fc546d70dc9a
lines: 88
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/preview-open-path.ts

## 1. 结论与边界

**预览路径归一工具**（88 行纯函数）：Windows 混合分隔符归一+file URL 吞点修复（`yuan.cdutai-dev`→`yuan/.cdutai-dev`，`:15-20`）、候选根合并、默认应用目标路径解析。注释声明绝对路径判定统一走 renderer/lib（R2）此处转发兼容（`:5-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isAbsoluteFilePath` | 再导出 | `:6` | 转发 `@/lib/file-utils`（保持导入路径兼容） |
| `getPreviewCandidateBasePaths` | 函数 | `:44` | 合并 basePaths+上下文路径→去重归一（相对路径预览须带会话工作目录，`:40-43` 注释） |
| `getDefaultAppTargetPath` | 函数 | `:54` | 绝对→归一；相对→previewOnly 取 `basePaths[0]??dirPath??sessionPath`，否则 `gitRoot??dirPath??sessionPath` 拼接（`:57-59`） |
| `getPreviewFileAccess` | 函数 | `:64` | 组 FileAccessOptions（sessionId+候选根四源） |
| `resolvePreviewDirPath` | 函数 | `:85` | 截取文件所在目录，无分隔符回落 sessionPath |

内部：`normalizeWindowsDrivePath`（`:8`）、`joinFilePath`（`:23`）、`uniqueTruthyPaths`（`:29`）。

## 3. 内部逻辑与关键流程

归一三步（`:8-21`）：盘符路径判定（`^[A-Za-z]:[\\/]`）→反斜杠转正斜杠+压缩盘符后多斜杠→隐藏目录正则还原（`profer|proma|cdutai` 及 -dev 变体，`:18`）。注释：Diff 服务要相对 git 路径、默认 App 打开须真实路径（`:51-53`）。

## 4. 调用者与调用链

- 入向：`preview-open-path.test.ts`（本批 2 断言）；diff 预览宿主（DiffTabContent/浏览器列，注释 `:81-83`）。
- 出向：`@/lib/file-utils`、`@profer/shared`、`@/atoms/preview-atoms`（类型）。

## 5. 数据 I/O、读写与副作用

无（纯函数）。

## 6. 分支、失败、取消与恢复

绝对/相对/previewOnly 分支（§2）；无抛错。

## 7. 权限与权威状态

路径口径权威=本模块（默认应用授权检查与 Diff 服务分流，`:51-53`）。

## 8. 修改影响面

预览打开目标路径（默认应用探测/FileAccessOptions）；被测试文件锁定两行为。

## 9. 测试证据

`NOT_RUN`。直接测试=`preview-open-path.test.ts`（本批，2 test 断言级覆盖归一与候选根；`resolvePreviewDirPath`/`getPreviewFileAccess` 未测）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 归一正则/取序/拼接 | 已证实 | `:1-88` 全文 |
| 2 断言行为 | 已证实（断言级） | 同批测试文件 |
| 测试运行 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出+3 内部 | §2/§3 | 6-88 | covered |
