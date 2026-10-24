---
path: apps/electron/src/main/lib/review/document-preview-path.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f8dccbf9fa26069ccfb9dd98cc75249d77b0e98e
sha256: fc2ab08775489d4de2a0996ee88d64227e9933a998d1509af72e114ab337ec03
lines: 47
kind: test
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/document-preview-path.test.ts

## 1. 测试目标

案卷原件预览路径解析：目录内登记原件返回真实路径；拒绝未登记材料、越界路径、指向案卷外的符号链接。

## 2. 用例清单

2 用例 / 1 describe（`审核原件预览路径` :29）。夹具：mkdtemp 真实目录 + `aggregate(assetPath)` 构造（:16-27）+ 真实 `symlinkSync`；无 mock。

| # | 用例 | 行 |
| --- | --- | --- |
| 1 | 返回案卷目录中的登记原件 | 31-36 |
| 2 | 拒绝未登记/越界/外指 symlink | 38-46 |

## 3. 真实断言

- 1：`resolveCaseDocumentPreviewPath(root, aggregate('source-docs/original.pdf'), 'doc-1-v1')` `toBe(source)`（真实路径）。
- 2：`../outside-review-preview.txt` → null；`source-docs/linked.txt`（symlink→案卷外） → null；`missing-v1` 未登记版本 → null。

## 4. 未覆盖与脆弱点

- 未覆盖：50MB 上限、statSync 非文件、异常 catch 分支。
- 脆弱点：`outside` 文件写在 mkdtemp 根的上层（`join(root,'..',…)`，:40-41），finally 清理（:46）。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §3 | 已证实 | 本文件逐行 |
| symlink 逃逸拒绝被固定 | 已证实 | :42 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 目录内原件通过 | §3 | covered |
| 越界/symlink/未登记拒绝 | §3 | covered |
| 大小/非文件/异常 | §4 | unknown（未测） |
