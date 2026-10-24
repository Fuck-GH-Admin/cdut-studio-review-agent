---
path: apps/electron/src/renderer/components/content-review/review-v3-t06-physical-manifest.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d1a889779b3774d1bb5820ab9f0eda072003f501
sha256: 5ad396cc33180346937eda39aded546f82046ae5a736d1f80a2ed8dde782ab3c
lines: 42
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t06-physical-manifest.ts

## 1. 结论与边界

**清单↔文件夹建议映射**（`:4-8` 注释）：**CSV 编号可建议匹配文件夹但绝不自动给可信身份；用户必须显式应用并核对；申报人姓名和文件名不作为唯一标识**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `suggestT06PhysicalManifest` | function（export） | `:9-42` | `(preview, manifest, knownCaseIds) → {suggestions, unmatched, ambiguous}` |

## 3. 内部逻辑与关键流程

1. 索引（`:13-21`）：按 externalId+caseId 双键建行映射（同行去重 `:18`）。
2. 逐组（`:26-40`）：unassigned 目录→unmatched（`:27`）；无清单行→unmatched（`:29`）；**多行命中或行已占用→ambiguous**（`:30`）；`row.caseId ∈ knownCaseIds`→existing 建议（`:32-33`）；否则有申报人→create 建议（**:34-37，title 缺省取目录名**）；无申报人→unmatched（`:38`）；行标记占用（`:39`）。

## 4. 调用者与调用链

入向：`ReviewV3T06PhysicalImport.importManifest`（nb-86 手册，「仅为建议」）。出向：同批两类型。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

三输出（suggestions/unmatched/ambiguous）；不适用。

## 7. 权限与权威状态

红线：建议≠可信身份（`:5-7`）；姓名/文件名非唯一标识（`:7`）；仅显式应用生效（消费方语义）。

## 8. 修改影响面

- 改匹配键/占用判定 → 建议与歧义口径。
- 放宽「一目录仅一行」（`:30`）→ 误配风险上升。
- 改 create 建议缺省（title/无申报人处理 `:34-38`）→ 新建案卷预填行为。
- 改三输出结构 → PhysicalImport 提示展示。
- 无测试锁定（§9）：改动需人工验证清单-目录匹配。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `suggestT06PhysicalManifest` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+匹配全链 | 已证实 | 逐行读 `:1-42` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `suggestT06PhysicalManifest` | §2/§3 | `:9-42` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
