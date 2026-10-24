---
path: apps/electron/src/main/lib/review/review-v3-f04-intake-identity.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a30fd0898ba7577fda9fc77498426d0b075f34c9
sha256: 5cec048125d7a254482d8fcb5d22654537b0f32d1d7cbf81a4c2a97e1958aa00
lines: 104
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-f04-intake-identity.ts

## 1. 结论与边界

F04 物理入库身份适配器（文件头 `:1-7`），独立于 IPC 与 Case 写者：预览身份必须绑定**确切字节**（不是文件名+长度）；entry token 必须对选择唯一（两人可向不同案卷交同名同大小 `award.pdf`）。纯函数 + `createHash/randomUUID`。

不做的事：不读盘（字节/摘要由 Main 供给）；不建案卷。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `F04PhysicalEntryBytes` | interface | `:13-16` | `{relativePath; bytes}` |
| `F04PhysicalEntryDigest` | interface | `:18-22` | `{relativePath; byteLength; rawSha256}` |
| `F04PhysicalEntryIdentity` | interface | `:24-29` | +`entryId` |
| `F04PhysicalSelectionIdentity` | interface | `:31-35` | `{selectionId; previewFingerprint; entries[]}` |
| `identifyF04PhysicalSelection` | function | `:38-51` | 字节入口（Main 供已授权物理字节，非渲染层路径，`:37`） |
| `identifyF04PhysicalSelectionFromDigests` | function | `:54-91` | 流式读取器供摘要入口 |
| `assertF04OriginalUnchanged` | function | `:94-98` | 写者消费前立即校验 |
| `f04CaseRegistrationKey` | function | `:101-104` | 每案去重键（**DocumentVersion 绝不跨案复用**，`:100`） |

## 3. 内部逻辑与关键流程

- `selectionId = 'sel-f04-'+sha256([kind,nonce]).slice(0,24)`（`:61`）；nonce 默认 `randomUUID()`——同内容不同选择不同身份。
- entry 校验（`:64-75`）：byteLength 安全整数 ≥1、`rawSha256` 64 hex，否则 `F04_EMPTY_ENTRY`；相对路径拒绝反斜杠/绝对/控制字符/空段/`.`/`..`/尾点尾空格/`<>:"|?*`（`F04_UNSAFE_RELATIVE_PATH`）；NFC+小写归一后查重（`F04_DUPLICATE_RELATIVE_PATH`）——**大小写/规范化等价视为重复**。
- `entryId = 'e-f04-'+sha256([selectionId, index, relativePath, rawSha256]).slice(0,24)`（`:79`）——含选择身份与字节摘要。
- `previewFingerprint`：kind + 排序后的 `[path, len, hash]` 三元组摘要（`:85-89`）——同内容不同选择 fingerprint 相同（内容级），entryId 不同（选择级）。
- `assertF04OriginalUnchanged`：长度+hash 双核，不符 `F04_ORIGINAL_CHANGED_AFTER_PREVIEW`（`:94-98`）。
- `f04CaseRegistrationKey`：`sha256([selectionId, entryId, caseId])`；任一空 → `F04_REGISTRATION_SCOPE_INVALID`（`:101-104`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`（排除测试）：`review-v3-f04-folder-snapshot`（`identifyF04PhysicalSelectionFromDigests`，`:12/:100`）与 F04 入库/预览链路（`assertF04OriginalUnchanged`/`f04CaseRegistrationKey`）；直接测试 `review-v3-f04-intake-identity.test.ts`。出向仅 `node:crypto`。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O；`randomUUID()` 默认 nonce 使输出非确定（显式传 nonce 可确定）。

## 6. 分支、失败、取消与恢复

throw 族：`F04_ENTRY_BYTES_INVALID`/`F04_SOURCE_KIND_INVALID`/`F04_EMPTY_SELECTION`/`F04_EMPTY_ENTRY`/`F04_UNSAFE_RELATIVE_PATH`/`F04_DUPLICATE_RELATIVE_PATH`/`F04_ORIGINAL_CHANGED_AFTER_PREVIEW`/`F04_REGISTRATION_SCOPE_INVALID`。无异步/取消/恢复。

## 7. 权限与权威状态

- 字节由 Main 供（`:37` 注释），不是渲染层路径。
- 身份=确切字节（hash 绑定）；选择级（selectionId+nonce）与内容级（previewFingerprint）分离；每案去重键防跨案复用。

## 8. 修改影响面

改派生公式 → 影响 folder-snapshot 的 identity 与入库去重；路径校验规则影响跨平台文件名接受面。

## 9. 测试证据

本轮 `NOT_RUN`。直接测试 `review-v3-f04-intake-identity.test.ts`（详见其手册）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 字节绑定身份、选择级唯一 | 已证实 | `:61/:79` |
| 路径安全+规范化查重 | 已证实 | `:68-75` |
| 内容/选择两级身份分离 | 已证实 | `:85-89` |
| 每案去重键 | 已证实 | `:100-104` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 三类型 | 2 | `:13-35` | covered |
| `identifyF04PhysicalSelection` | 3 | `:38-51` | covered |
| `identifyF04PhysicalSelectionFromDigests` | 3 | `:54-91` | covered |
| `assertF04OriginalUnchanged` | 3 | `:94-98` | covered |
| `f04CaseRegistrationKey` | 3 | `:101-104` | covered |
