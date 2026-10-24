---
path: apps/electron/src/main/lib/review/rule-section-scope.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 61675b871c0c236d76e6244719622b1ae9345b43
sha256: 2e3d01814ff9ea2205f8dd632eed8d3298e8a4b457923319bf5b0631ec71f173
lines: 6
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/rule-section-scope.ts

## 1. 结论与边界

分项规则的事项范围过滤（6 行单函数）：带 `sectionId` 的规则只接收所属分项事项，不越界读取其它分项。

## 2. 导出与关键符号

导出 1 条（`export` :4）：`subjectsForRule(subjects: ReviewSubject[], rule: RuleSpec): ReviewSubject[]`——`rule.sectionId ? subjects.filter(s => s.sectionId === rule.sectionId) : subjects`（:5）。

## 3. 内部逻辑与关键流程

单表达式二分支（:5）：有 sectionId 过滤、无则全量返回。无副作用。

## 4. 调用者与调用链

入向：`apps/electron/src/main/lib/review/v2-executor-factory.ts:25`（import），调用 `:451`、`:565`、`:940`、`:957`、`:977`、`:1002`、`:1018`；测试 `rule-section-scope.test.ts:3`（批内，:18/:22）。出向：仅 `@profer/shared` 类型（:1）。

## 5. 数据 I/O、读写与副作用

无（纯函数）。

## 6. 分支、失败、取消与恢复

二分支（:5）；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支；语义边界=分项隔离（头注释 :3：不能越界读取其他分项事项）。

## 8. 修改影响面

影响 `v2-executor-factory.ts` 的规则→事项绑定（:562）与批内测试 2 用例。

## 9. 测试证据

`rule-section-scope.test.ts`（批内，2 用例，NOT_RUN）：分项规则只收 `study-a`（:21-23）、未限定分项收全部（:25-27）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；过滤语义 | 已证实 | :4-5；测试 :21-27 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `subjectsForRule` 二分支 | §3/§9 | :5 | covered |
