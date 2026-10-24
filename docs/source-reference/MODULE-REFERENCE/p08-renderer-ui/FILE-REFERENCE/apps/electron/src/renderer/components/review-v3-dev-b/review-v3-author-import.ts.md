---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-import.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8f9a71f9914c8db15e8cce1f61f92509ed33d43b
sha256: c58c4dee5d03587c5e9df3375123a184dde38ccd2045763284c6ba936c4a291f
lines: 112
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-import.ts

## 1. 结论与边界

**B1 不受信候选导入**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-import.ts:1-7`）：仅接受我们的 candidate-only 导出信封；**永不让 JSON 文件/其 recordedBy/source IDs/Subject/policy-candidate 成为 Main 权威**；结构合法声明仍可能是不完整草稿——**C/Main 必须在保存/预览/冻结时重验身份/CAS/编译规则**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B1_AUTHOR_IMPORT_MAX_BYTES` | const | `:10` | 2MB 上限 |
| `parseB1AuthorCandidateImport` | 函数 | `:87-106` | JSON→`B1AuthorDocument` |
| `assertB1ImportReplaceSafe` | 函数 | `:107-112` | 替换安全断言 |

内部：`id` 正则（`:11`）、`safe`（`:12`，≤16384）。

## 3. 内部逻辑与关键流程

- `parseB1AuthorCandidateImport`（`:87-106`）：2MB 上限→JSON 解析→结构深验（id 正则/字符串上限）→candidate-only 信封校验。
- `assertB1ImportReplaceSafe`（`:107-112`）：替换安全。

## 4. 调用者与调用链

- 消费方：ReviewV3AuthorWizard（导入预览）。
- 出向：B1 类型。

## 5. 数据 I/O、读写与副作用

纯解析；无写（C/Main 重验，`:5-6`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 超 2MB | `:10` | 拒 |
| 结构非法 | `:87-106` | 抛 |

## 7. 权限与权威状态

**JSON 文件非 Main 权威**（`:3-4`）；C/Main 重验身份/CAS/编译（`:5-6`）——导入红线。

## 8. 修改影响面

- 2MB 上限；id/字符串约束。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、不受信导入红线 | 已证实 | `:1-112` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:10-112` | covered |
