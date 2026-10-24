---
path: apps/electron/src/renderer/components/content-review/review-v3-t06-physical-intake.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 686597ae428fa6bd42b71f69055729bf5defff5b
sha256: f5501864f121cd3a8d984597204d9990c2d4ce0288e735afa330e6d47ed592d9
lines: 239
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t06-physical-intake.ts

## 1. 结论与边界

**T06 物理分案**（`:1` 注释）：**Main 持有选择器、原始字节与 Case/Document/Batch 提交**。类型红线：`entryId` 是 **Main 签发的不透明令牌，绝不是本地绝对路径**（`:4`）；`warnings/excluded` 是 Main 的清单跳过/拒绝，**绝不静默成功**（`:14-15`）；提交红线——**仅显式分组、申请人与模板兼容绑定可提交**（`:115`）；执行红线——**独立失败组可恢复，只有完整导入的案卷进批次**（`:193`）。

## 2. 导出与关键符号（14 条）

类型：`T06SourceKind/T06PhysicalEntry/T06PhysicalExcludedEntry/T06PhysicalSelection/T06PhysicalGroup/T06PhysicalPreview/T06GroupOptions`（`:2-33`）、`T06MaterialRole` 4 角色/T06EntryAssignment/T06CommitSubject/T06GroupChoice（create/existing/exclude `:80-92`）、`T06CommitGroup/T06PhysicalCommitRequest`（`:93-114`）、`T06ItemReceipt/T06CaseReceipt/T06CommitReceipt`（`:167-186`）、`T06PhysicalWriterPorts`（**Main 实现可信写入器** `:187-192`）。
函数：`previewT06PhysicalImport`（`:41-79`）、`planT06PhysicalImport`（`:116-166`）、`executeT06PhysicalImport`（`:194-239`）。
内部：`partsOf`（**路径闸：绝对路径/`.`/`..`/控制字符全拒** `:34-39`）。

## 3. 内部逻辑与关键流程

1. **预览**（`:41-79`）：来源三项校验（缺 Main 验证即拒 `:43-46`）；条目校验（entryId 唯一/路径合法/字节数 `:51-54`）；**重复路径（NFC+小写归一）拒**（`:56-57`）；剥壳须显式且仅单顶层目录（`:62-63`）；**一目录一候选案卷；根目录文件须显式分组否则 unassigned**（`:40/:68-73`）。
2. **计划**（`:116-166`）：缺决策/根文件未归属/模板缺失（`:130-136`）均拒；create **缺标题拒、申请人只是可选字段不阻断先入库后补录**（`:139-140`）；existing **案卷须 known+未重复绑定+模板版本一致**（`:147-153`）；全错→无 request（`:160-161`）。
3. **执行**（`:194-239`）：逐组 try——createCase→逐 entry importEntry（幂等 requestId `:205/:212`）→done/failed 分记（**部分案卷保留已导入文档可恢复** `:199-224`）；**仅成功案卷按模板分组建批**（`:216-233`，多模板批次名加后缀 `:232`）；零成功不建批（`:226`）；批错误并入 batchError（`:235-238`）。

## 4. 调用者与调用链

入向：`ReviewV3T06PhysicalImport`（nb-86 手册）。出向：无（纯函数+端口注入；端口由 L 绑 Main）。

## 5. 数据 I/O、读写与副作用

纯函数；写入经 `T06PhysicalWriterPorts`。

## 6. 分支、失败、取消与恢复

错误全走 errors 列表；执行组级隔离+可恢复（§3）。不适用取消/恢复。

## 7. 权限与权威状态

红线：entryId 不透明（`:4`）、跳过不静默（`:14`）、显式才提交（`:115`）、完整导入才进批（`:193`）、路径闸（`:34-39`）。

## 8. 修改影响面

- 改路径闸（`partsOf` `:34-39`）→ 穿越/重复文件防护面（测试锁定）。
- 改计划校验（模板兼容/绑定唯一 `:135-153`）→ 提交门槛。
- 改执行编排（组隔离/建批条件 `:194-239`）→ 导入可恢复性（测试锁定）。
- 改类型形状（T06CommitRequest/Receipt）→ Main 事务兼容性。
- 测试锁定（同批 127 行测试 8 用例）：见测试手册。

## 9. 测试证据

**直接测试 `review-v3-t06-physical-intake.test.ts`（8 用例，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 导出+三链全读 | 已证实 | 逐行读 `:1-239` |
| 测试 8 用例断言 | 已证实 | 测试文件；NOT_RUN |
| Main 写入器 | 未知 | 端口注入 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 14 导出+三链 | §2/§3 | `:2-239` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
