---
path: apps/electron/src/renderer/components/content-review/review-v3-source-navigation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e4b628d805d15c4664cf738502201b0c7ce4a132
sha256: 838cd557e28a6cea6362b77b1d137922bf07ba446bab5a95d20952c99dc3231a
lines: 33
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-source-navigation.ts

## 1. 结论与边界

**F10 来源逐处导航**（`apps/electron/src/renderer/components/content-review/review-v3-source-navigation.ts`，33 行）：来源去重（含解析版本+坐标——同文件不同出处不折叠）、目标栏判定（**只用精确 V2 DocumentVersion，不从文件名/旧 V1 ID 猜测**，`:17`）、状态文案。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewSourcePurpose` | type | `:4` | `rule/application/evidence` |
| `uniqueReviewSourceRefs` | 函数 | `:7-15` | 按 `[caseId, versionId, parseRevision, location]` JSON key 去重 |
| `reviewSourcePurpose` | 函数 | `:18-23` | 判目标栏（`foreign-case`/`parse-revision-mismatch`→null） |
| `reviewSourceStatusLabel` | 函数 | `:25-33` | 5 态中文文案（含「禁止按旧坐标定位」） |

## 3. 内部逻辑与关键流程

- `uniqueReviewSourceRefs`（`:7-15`）：四元组 JSON key 去重（`:10`）。
- `reviewSourcePurpose`（`:18-23`）：`resolveT08Source` 解析→不匹配/null→按 `document.role` 映射三栏。
- `reviewSourceStatusLabel`（`:25-33`）：5 态全披露（located/file-only/version-unavailable/parse-revision-mismatch/foreign-case）。

## 4. 调用者与调用链

- 消费方：三栏定位导航（D8）。
- 出向：`review-v3-t08-case-report`（`resolveT08Source`）。

## 5. 数据 I/O、读写与副作用

纯函数；无写。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 重复出处 | `:11-12` | 滤除 |
| 版本不匹配/跨案 | `:20` | null |
| 无匹配块 | — | `file-only` 降级（test 锁定） |

## 7. 权限与权威状态

「不从文件名或旧 V1 ID 猜测」（`:17`）、「禁止按旧坐标定位」（`:30`）是定位权威红线。

## 8. 修改影响面

- 去重 key（四元组）与 `SourceRef` 形状耦合；5 态文案是披露口径。

## 9. 测试证据

`review-v3-source-navigation.test.ts`（59 行，4 用例）直接覆盖。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出、去重/判定/文案 | 已证实 | `:4-33` |
| 不猜测/不伪造红线 | 已证实 | `:6`、`:17` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 4 个导出 | `:4-33` | covered |
