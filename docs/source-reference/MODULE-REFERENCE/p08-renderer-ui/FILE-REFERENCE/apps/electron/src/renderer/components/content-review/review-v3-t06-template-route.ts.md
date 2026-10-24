---
path: apps/electron/src/renderer/components/content-review/review-v3-t06-template-route.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 17e7a59f80b16b5d1ef1b4d7d52bfe11366e3641
sha256: 185d8cff4b9289b8e52a5a1b1d811943c7378b65dfb9a001dfb7b23dfbac952c
lines: 63
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-v3-t06-template-route.ts

## 1. 结论与边界

**T06 模板路由与字段辅助**：申请人提取红线——**只提取文件夹明确写出的申请人字段，普通文件夹名不能当作真实申请人**（`:36`）；模板建议红线——**保守预路由，仅明确唯一命中才给建议；不是材料语义分类**（`:42-46`）。

## 2. 导出与关键符号（6 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `T06TemplateFieldOption`/`T06TemplateSlotOption`/`T06PublishedTemplateOption` | interface（export） | `:4-24` | 只读模板元数据（`:21`） |
| `t06RequiredCaseFields` | function（export） | `:27-29` | 案卷级必填字段（scope=case+required） |
| `t06RequiredSubmissionSlots` | function（export） | `:32-34` | 必交槽（minCount>0+requiredAt=submission；**只提示不猜归属** `:31`） |
| `suggestT06ApplicantFromFolder` | function（export） | `:37-40` | 仅认 `申请人/申请单位/提交人[:：=]` 显式标注（`:38`） |
| `suggestT06GroupTemplate` | function（export） | `:47-63` | 保守评分路由（§3） |

## 3. 内部逻辑与关键流程

`suggestT06GroupTemplate`（`:47-63`）：上下文=目录名+相对路径（NFKC+小写 `:51-52`）；评分（id 命中 +4（≥4 字符 `:57`）、全名命中 +4、≥3 字标签命中各 +1 `:56-59`）；**score≥2 才入候选**（`:60`）；**唯一命中或首位领先 >1 才返回，否则 undefined 交用户确认**（`:61-62`）。

## 4. 调用者与调用链

入向：`ReviewV3T06PhysicalImport`（建议预填）。出向：同批类型。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

评分不足/并列→undefined（§3）。不适用。

## 7. 权限与权威状态

红线：申请人仅显式标注（`:36-38`）；路由仅建议（`:42-46`）；槽位只提示不猜（`:31`）。

## 8. 修改影响面

- 改评分权重/阈值 → 模板建议命中与歧义率。
- 放宽「唯一/领先 >1」（`:61-62`）→ 误路由风险上升。
- 改申请人正则（`:38`）→ 新建案卷 applicant 预填口径。
- 改必填字段/必交槽过滤（`:27-34`）→ 分案确认页提示面。
- 测试锁定（同批 46 行测试）：见测试手册。

## 9. 测试证据

**直接测试 `review-v3-t06-template-route.test.ts`（同批，NOT_RUN）**，断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出+路由评分 | 已证实 | 逐行读 `:1-63` |
| 测试断言 | 已证实 | 同批测试；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2/§3 | `:4-63` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
