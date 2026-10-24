---
path: apps/electron/src/main/lib/document-parse-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5a4a21bbf1e8d88bc8b989384e1ef03c3a702c9f
sha256: 452fc9b804a0a5369395c7fecde467be84f2251ae9e8d66e64dc82af94bb3d67
lines: 375
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/document-parse-tools.test.ts

## 1. 测试目标

内核双态物化 + 零 Token 摄入 + 双轨定位反查算法（`resolveDocumentAnchor` 抗劫持/扩展锚点，describe :219）。

## 2. 用例清单

14 用例 / 3 describe。夹具：手工合法单页 PDF 字节 `buildPdfWithText`（:12-31，ASCII 便于 xref 偏移）；手工索引 `writeHandmadeIndex`（:168-218，聚焦反查算法本体）；真 mkdtemp root。

| describe | # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- | --- |
| 内核双态物化 | 3 | txt 解析 | 42-50 | format `txt`、truncated false |
| | | PDF 双态落盘 | 52-78 | fileId `f1`、`sample.md` 无锚点、anchored 含 `id="f1:p1-b0"` |
| | | 未授权路径拒 | 80-88 | rejects |
| 零 Token 摄入 | 5 | 句柄+切片+query | 93-121 | file_id `f2`、`证据互信`、`PreIngest` 切片/检索 |
| | | 多 PDF 带/不带 fileId 反查 | 123-148 | `#f1`→sample.pdf、`#f2`→attached.pdf、`#p1-b0` 有 BBox |
| | | 纯文本不注入 | 150-159 | 空串 |
| | | read 透明重定向 | 161-166 | 含 `[内核透明重定向]`+`PreIngest` |
| 抗劫持与扩展锚点 | 6 | 显式 p2-b3 不被劫持 | 237-245 | 保持 `p2-b3`+BBox（label 含关键词也不劫持） |
| | | 互斥类型校正 | 247-256 | 插图块校正到同页表格块 |
| | | `p1-tbl1` 不坍缩 | 258-267 | 命中 `p1-tbl1` |
| | | 命名空间化 | 269-280 | `f9:p1-tbl1` span+注释 |
| | | 无 c 前缀范围 | 282-291 | cellRef `B4:E10` |
| | | 单格不放大 | 293-302 | cellRef `B10` |
| | | registry 确定性 | 304-341 | alpha→f2、beta→f1（与字母序相反） |

## 3. 真实断言

如 §2 表（逐条读自 :42-341）；registry 用例注释 :312-314 明示「若实现退回按下标分配则 f1 错落 alpha，测试即刻暴露」。

## 4. 未覆盖与脆弱点

- 未覆盖：`upgradeStaleOfficeIndexIfNeeded`、`parseAttachedDocument` 缓存、预算截断分支。
- 脆弱点：手工 PDF 与 pdf-engine 契约耦合；fileId 分配依赖用例执行顺序（f1/f2 断言）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 用例断言如 §2 | 已证实 | 本文件逐行 |
| 抗劫持/tbl/单格/registry 语义被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 双态落盘/沙箱拒 | §2 | covered |
| 句柄/切片/重定向 | §2 | covered |
| `resolveDocumentAnchor` 全语义 | §2 | covered |
| 升级/缓存/预算 | §4 | unknown（未测） |
