---
path: apps/electron/src/main/lib/review/document-preview-path.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ca6d3689d264d22d6fa1367366847e9b31f47a66
sha256: 89152c99007698ad81cac7d4d49e72bb158a37a036295d993f4025e5b6838f1d
lines: 29
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/document-preview-path.ts

## 1. 结论与边界

案卷原件预览路径解析：**仅当**登记的原件仍位于该案卷资产目录内才返回真实路径，否则 `null`。头注 :4 一句定边界。

边界：不做 MIME/权限判断；大小上限 50MB 硬编码；消费方是预览 IPC（`review-ipc.ts:67`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `resolveCaseDocumentPreviewPath` | fn | 6-25 | `(caseRoot, aggregate, documentVersionId) => string \| null` |

无内部符号。

> **r1 校订说明**：§2 行号经 `grep -n` 逐符号实测校订（NB17-N-01）；符号定位以符号名为准。

## 3. 内部逻辑与关键流程

1. 从 `aggregate.caseV2.documents` 找 versionId（:8）；无 `assetPath` → null（:9）。
2. `realpathSync(resolve(caseRoot))` 得根真实路径（:13）；绝对 assetPath 直接 resolve，否则相对根（:14-16）。
3. 不存在 → null（:17）；`realpathSync(candidate)` 解析符号链接（:18）。
4. `relative(rootReal, assetReal)` 越界判定：空/`..`/`..{sep}*`/绝对 → null（:19-20）——**symlink 逃逸也在此拦截**（realpath 已解析）。
5. `statSync` 须为文件且 `size ≤ 50*1024*1024`（:21-22）。
6. 返回 `assetReal`（真实路径）；任何异常 → null（:24-26）。

## 4. 调用者与调用链

入向（生产）：`review-ipc.ts:67`（`resolveCaseDocumentPreviewPath`，预览通道）。测试：`document-preview-path.test.ts:7`。出向：`node:fs`/`node:path`（:1-2）、`@profer/shared` 类型（:3）。

## 5. 数据 I/O、读写与副作用

只读（realpath/existsSync/statSync）；无写/日志/网络。

## 6. 分支、失败、取消与恢复

全分支返回 `string|null`，无 throw（catch 兜底 :24-26）；无取消/恢复。

## 7. 权限与权威状态

路径权威：realpath+relative 双重越界防御（符号链接逃逸拒绝，:18-20）；50MB 上限（:21）；未登记/未激活材料直接 null（findDocument 走 active 文档列表）。无 sender/role 检查（IPC 层负责）。

## 8. 修改影响面

预览 IPC 的可用性；放宽大小/越界判定即扩大读取面。同测：`document-preview-path.test.ts`（2 用例）。

## 9. 测试证据

直接测试 `document-preview-path.test.ts`（2 用例 / 1 describe；mkdtemp 真实目录+真实符号链接；NOT_RUN）：
1. `:30-35` 目录内登记原件 → 返回真实路径 `toBe(source)`。
2. `:37-46` 三拒绝：`../outside` 越界 → null；`linked.txt` 指向案卷外的 symlink → null；`missing-v1` 未登记版本 → null。
未覆盖：50MB 上限、目录冒充文件、异常 catch；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出存在性与行为 | 已证实 | 行号 r1 grep 实测校订；以符号名为准 |
| symlink 逃逸拒绝 | 已证实 | :18-20 + 测试 :37-46 |
| 50MB 上限 | 已证实 | :21 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 目录内原件通过 | §3/§9 | 5-28 | covered |
| 越界/symlink/未登记拒绝 | §3/§9 | 17-20 | covered |
| 大小/非文件/异常 | §3 | 21-26 | partial（未测） |
