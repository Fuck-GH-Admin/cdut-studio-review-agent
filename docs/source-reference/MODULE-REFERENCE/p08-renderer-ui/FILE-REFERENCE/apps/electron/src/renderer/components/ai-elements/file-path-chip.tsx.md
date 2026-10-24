---
path: apps/electron/src/renderer/components/ai-elements/file-path-chip.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4245725485df349798003037fb69ad8dd136f923
sha256: be046778570caf16872e4e76c99beadabbe115ba0413f36803c096d8db3cd474
lines: 311
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/file-path-chip.tsx

## 1. 结论与边界

**文件路径芯片**（311 行）：消息内文件引用的可点击芯片——左键搜索/预览、右键复制完整路径、Tooltip 显示全路径；候选搜索缓存 5 分钟（`:52`）。关键设计（`:216-218` 注释）："工具调用已提供绝对路径时它就是唯一可靠预览目标，不能先按文件名浅搜（同名误选）"。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `shouldSearchFileCandidate` | `:60-62` | `(isAbsolute) => !isAbsolute`（策略单一真源） |
| `FilePathChip` | `:64-282` | 主组件：stripLineCol 剥行号后缀→四态 fileStatus（idle/resolved/pending/broken）→搜索/预览/复制 |
| `isAbsoluteFilePath` | `:284-298` | 含 `~/` 缩写（`^~[\\/][^\n]+$` `:291`）、Unix 路径结构校验 |
| `isRelativeFilePath` | `:300-311` | 扩展名白名单（IMAGE/VIDEO/CODE/DOC `:12-21`）+路径字符模式（中文 `\p{L}`）+排除单文件名/纯文案 |

内部：`normalizeCandidatePath:41-44`（大小写归一防重复候选）、`fileSearchCache:53`（Map+TTL）、`startSearch:133-190`（simple/deep 两模式、requestId+cancelledRequests 竞态防护、"已有候选时不算 broken" `:165-171`）、`cancelSearch:192`、卸载清理 `:201-207`、`handleChipClick:215-237`（绝对直预览→缓存命中→逐次搜新候选）。

## 3. 内部逻辑与关键流程

点击链：绝对路径→openPreview（basePaths）；相对→缓存同步读（防水合间隙误搜 `:224`）→命中预览→否则 `startSearch('simple', true)`。搜索链：`window.electronAPI.searchFileCandidate`（带 requestId/alreadyFound）→去重合并→预览/提示；失败→broken+toast。

## 4. 调用者与调用链

消息渲染（工具结果/正文路径识别）；出向 `@/lib/file-utils`、`../file-access-context`（sessionId）、`@/components/diff/preview-opener`、`window.electronAPI`（searchFileCandidate/cancelFileSearch）。

## 5. 数据 I/O、读写与副作用

IPC 文件搜索（可取消）+内存缓存+剪贴板+预览打开。

## 6. 分支、失败、取消与恢复

无 sessionId→toast 拒绝（`:135-138` fail closed）；requestId 竞态双防护（`:153`/`:181`）；卸载取消在途搜索（`:201-207`）；缓存过期清理（`:106-108`）。

## 7. 权限与权威状态

- **绝对路径权威**（`:216-218`）：不浅搜防同名误选。
- **fail closed**（`:135-138`）：无会话不搜索。
- 候选去重按 normalizeCandidatePath（Windows 大小写归一）。

## 8. 修改影响面

改识别正则影响正文路径提取（测试 21 用例锁定）；改搜索策略影响预览命中率。

## 9. 测试证据

`file-path-chip.test.ts`（同批，21 个 `test(`）：路径识别全谱（含中文回归/`~` 缩写）+搜索策略。组件交互面未测。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件搜索/缓存/竞态链 | 已证实 | 311 行全读 |
| 识别正则 | 已证实 | 测试 21 用例（同批） |
| **历史 Bug 注释**（`:165-171` broken 判定、`:224` 水合间隙、`:114`（InputToolbar 同款问题在本文件无）） | 已证实 | 注释原文 |
| searchFileCandidate 实现 | 未知 | 主进程不在本批 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 4 导出/搜索链/缓存 | §2/§3 | covered |
| fail closed/竞态防护 | §6/§7 | covered |
| 测试 | §9 | 部分（纯函数 covered，组件 unknown） |
