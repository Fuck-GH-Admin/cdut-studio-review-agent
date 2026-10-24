---
path: apps/electron/src/main/lib/review/evidence-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0710f799b7e5366a80bf21dce09bc1672312b3a9
sha256: 25cd8d93b18d45997083f5da6710644a9265a7d3934774afa175756c07c995fd
lines: 120
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/evidence-service.ts

## 1. 结论与边界

事实提取与证明绑定服务（M2，头注 :1-8）：Observation 缺失与零值不同、supersedes 链替代（历史可回溯，A05）；EvidenceLink 多对多（一证多事/多证一事；共享证书≠重复计分，重复计分由规则判）；绑定默认 candidate/user 确认后才是已核验依据。全部函数**纯函数**（输入数组→新数组），无状态。

边界：不做 IPC/权限；落库/事务在调用方（`application-service`/`pi-case-review-service` 等）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `recordObservation` | fn | 13-44 | 追加观察（supersedes 链） |
| `latestObservations` | fn | 47-53 | 链尾 Map（`subjectId::fieldKey`） |
| `observationDiffers` | fn | 56-59 | 候选值 vs 当前生效值差异 |
| `buildEvidenceLinks` | fn | 62-99 | 多主体绑定（去重防复活） |
| `transitionEvidenceLink` | fn | 102-108 | confirmed/rejected 迁移 |
| `subjectEvidenceCoverage` | fn | 111-120 | 主体覆盖（confirmed/candidate 分组） |

无内部函数。

## 3. 内部逻辑与关键流程

1. **`recordObservation`**（:13-44）：取同 subject+field 的 createdAt 最新为 `previous`（:27-29）；id 形如 `obs-{subject}-{field}-{ms}-{rand4}`（:31）；`confirmed` 缺省=`extractedBy==='user'`（:37）；`supersedesObservationId=previous?.id`（:38）；**只追加不删除**（:42-43，注释 :41-42：AI 重提取不静默覆盖人工确认值，由调用方展示差异）。
2. **`latestObservations`**（:47-53）：升序排序后 set（后写覆盖）→ 链尾。
3. **`observationDiffers`**（:56-59）：`JSON.stringify` 值比较；无当前 → true。
4. **`buildEvidenceLinks`**（:62-99）：`supportsFact` trim 空 → 原样返回（:75-76）；`new Set(subjectIds)` 去重（:79，注释 :77-78 防 `[s1,s1]` 单事务双关联）；重复键=同 doc+subject+fact（含已存在+本批新增，:80-85）→ 跳过（:86 **含已拒绝：人工否决不因 AI 重跑复活（A05）**）；`linkedBy==='user'` → confirmed 否则 candidate（:93）。
5. **`transitionEvidenceLink`**（:102-108）：map 翻转状态；rejected 保留记录供审计。
6. **`subjectEvidenceCoverage`**（:111-120）：按 subjectId 过滤并按状态分组。

## 4. 调用者与调用链

入向（生产）：`application-service.ts:13`（recordObservation/buildEvidenceLinks/transitionEvidenceLink，C0 命令事务）；`pi-case-review-service.ts:17`（recordObservation）；`review-tools.ts:10`（recordObservation/buildEvidenceLinks）；`workspace-service-v2.ts:12`（buildEvidenceLinks）。测试：`evidence-service.test.ts:6-13`。`latestObservations/observationDiffers/subjectEvidenceCoverage` **生产零消费者**（全树检索仅定义与测试）。出向：仅 `@profer/shared` 类型（:10）；纯函数。

## 5. 数据 I/O、读写与副作用

无 I/O/日志；纯数组变换（immutable 风格）。

## 6. 分支、失败、取消与恢复

无 throw；全部经返回值表达。幂等性由去重键保证（重复绑定不产生新记录）。

## 7. 权限与权威状态

- 证据权威：一证多事/多证一事显式建链；同名/同证书不推断重复计分（头注 :5-6）。
- 拒绝权威：rejected 三元组不复活（:86）；状态迁移保留记录（注释 :101）。
- 确认权威：user 直确认 vs ai candidate（:93）；AI 重提取只追加候选不覆盖确认值（注释 :41-42）。
- 无 sender/role 检查（调用方事务层负责）。

## 8. 修改影响面

影响 `application-service` 的 `SET_EVIDENCE_LINK`/`CORRECT_OBSERVATION` 语义、Pi 提取落观察链；`buildEvidenceLinks` 去重键变更会改变重复申报/复活判定。同测：`evidence-service.test.ts`（9 用例）。

## 9. 测试证据

直接测试 `evidence-service.test.ts`（9 用例 / 2 describe；纯函数；NOT_RUN）：
1. `:20-28` 替代链：AI 重提取不同值 → `latest.value==='一等奖'`、`supersedesObservationId` 指向首条、历史长度 2。
2. `:30-34` 同值不算差异、异值算差异（`observationDiffers`）。
3. `:38-43` 一证多事：2 条 candidate、`reuseScope` undefined。
4. `:45-50` 多证一事：`subjectEvidenceCoverage.candidate` 2 条。
5. `:52-56` 同 doc+subject+fact 去重长度 1。
6. `:58-70` 单命令重复主体 `[s1,s1,s2,s2]` → 2 条且 supportsFact trim；再次绑定仍 2。
7. `:72-78` rejected 不复活：长度 1、状态仍 `rejected`。
8. `:80-84` user 绑定直 confirmed、覆盖计 1。
9. `:86-90` transition → confirmed 计 1。

未覆盖：`confirmed` 缺省推导、`supersedesObservationId` 为 undefined 首条、跨 subject 键隔离；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出/行号如 §2 | 已证实 | 逐条 |
| 只追加不删/不复活/去重 | 已证实 | :42-43/:86/:79-85 + 测试 :20-78 |
| 3 函数生产零消费者 | 已证实（否定） | 全树检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `recordObservation` 链 | §3.1/§9 | 13-44 | covered |
| `latestObservations`/`observationDiffers` | §3.2-3.3/§9 | 47-59 | covered |
| `buildEvidenceLinks` 去重/防复活/多主体 | §3.4/§9 | 62-99 | covered |
| `transitionEvidenceLink`/`subjectEvidenceCoverage` | §3.5-3.6/§9 | 102-120 | covered |
