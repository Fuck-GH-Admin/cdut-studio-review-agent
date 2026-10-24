---
path: apps/electron/src/main/lib/review/template-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 487d07bba14ca6d96dac754ae8971d035bb2ffcd
sha256: 1797df65174f32be802b83e1eea101cb6e94402f30975d5472ab5fa6d61be52d
lines: 305
kind: test
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/template-store.test.ts

## 1. 测试目标

M1 模板仓库单测（文件头 `:1-4`，对应 K14/D12「第七种业务只靠配置创建」）：发布信任（TAR-08/13/17）、模板目录（M1）、发布检查（02 §5.6）、纯配置建业务。隔离：`PROFER_CONFIG_DIR` 指向唯一临时目录（`:16-18`）。

## 2. 用例清单

4 describe、19 test（`:30/:45/:67` + `:94/:100/:115/:131/:147/:158/:169/:185/:200` + `:226/:236/:242/:249/:255/:269` + `:277`）。

`describe('模板发布信任（TAR-08/13/17）')`（`:20`）：

1. `:30-43` TAR-08 Main 发布事务拒绝缺负责人确认的确定性数值规则。
2. `:45-65` TAR-13 无内置标准的纯材料/运行时规则模板可发布但显式标记。
3. `:67-90` TAR-17 崩溃遗留锁按 pid/时限隔离并留证据；活进程锁仍拒绝。

`describe('审核模板目录（M1）')`（`:93`）：

4. `:94-98` 模板 ID 支持中文并拒绝路径穿越字符。
5. `:100-113` 旧版综测模板读取补齐 requiredAt 默认值。
6. `:115-129` 内置与参考范本通过结构校验。
7. `:131-145` 新版综测模板无预登记事项也生成整案分项检查。
8. `:147-156` 必需分项无标准不能发布。
9. `:158-167` 新草稿版本存在时仍可读已发布版本。
10. `:169-183` 内置草稿幂等落盘且可发布。
11. `:185-198` 排序、移出与恢复；历史版本可读。
12. `:200-222` 停用正文逐字节不变但读取投影 deprecated。

`describe('发布检查（02 §5.6）')`（`:225`）：

13. `:226-234` 悬空条件引用报缺失字段。
14. `:236-240` 流程重复阶段报循环/重复。
15. `:242-247` 阶段链遗漏终审阻止发布且内置基金链路闭合。
16. `:249-253` 下一阶段成环阻止发布。
17. `:255-267` 旧版内置基金草稿初始化保留旧版并新增闭环草稿。
18. `:269-273` 非法量表报权重/范围错误。

`describe('第七种业务只靠配置创建（D12/K14）')`（`:276`）：

19. `:277-304` 实验室使用申请配置 validate+publish 通过且无学年/申报分字段。

## 3. 真实断言

- `:41-42` publish 抛含 `'T01 类型规则发布检查'`、状态仍 `'draft'`。
- `:52/:62-64` 两例 `executionScope` 为 `'material-manual-only'`，warning 含 `'自动检查阶段'`。
- `:78-80/:88` 崩溃锁下草稿仍写盘、原锁消失、存在 `1.lock.stale-*` 隔离证据；活锁（`process.pid`）保存抛 `'正在被其他进程'`。
- `:95-97` 中文 ID true、`../outside`/`has.dot` false。
- `:111-112` `application-form` 补 `'submission'`、`certificates` 补 `'decision'`。
- `:116-128` 内置 2/reference 8、活动/报销模板含 sheet-sum-match/sheet-unique-values、全模板零 error。
- `:141-144` 已发布、rules>0 且全 `targetScope==='group'`、`plannedChecks>0`。
- `:154-155` error 含 `'至少需要一条审核要求'` 且 publish 抛同。
- `:165-166` 最新为 draft、版本列表 `[[2,'draft'],[1,'published']]`。
- `:174-182` 模板数≥6、`activity-approval-v2` 在归档不在库、目录首项正确、publish 后 `publishedAt` 为字符串、`saveDraft(published)` 抛。
- `:188-197` 逆序排序生效、移出后 getTemplate 仍读原名、归档可见、恢复回库。
- `:208-221` deprecated/retired 断言、正文 `toBe(beforeBytes)` 逐字节、三读取路径投影 deprecated、停用后 saveDraft/publish 均抛且正文仍不变。
- `:233/:239/:245-246/:252/:262-266/:272` 校验消息断言（ghost-field/重复阶段/主管部门定稿/流程从阶段/修复版 v2 nextStageId='decision'/min>=max）。
- `:297-303` 实验室模板零 error、publish 成功、`rubric` undefined、无 `academicYear`/`declaredScore` 字段。

## 4. 未覆盖与脆弱点

未覆盖：`readPublicationControl` 损坏/不合法分支、`reorderTemplates` 数量不一致抛错、`saveAuthoringCandidateDraft`/`isAuthoringCandidateDraft`、旧空锁 `LEGACY_LOCK_STALE_MS` 分支、`listTemplateVersions` 归档过滤细节。夹具依赖 `./builtin-templates`/`./effective-rules`/`./case-store-v2`/`./coverage-ledger`（跨模块集成断言，非纯单测）；`CONFIG_DIR` 用 `Date.now()` 唯一目录（`:16`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 19 用例行号与断言文本 | 已证实 | `:30-304` 逐条核对 |
| 停用逐字节不变断言 | 已证实 | `:206/:211/:221` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| TAR-08/13/17 | §3 | test:30-90 | covered |
| 目录/迁移/版本历史/停用 | §3 | test:94-222 | covered |
| validateTemplate 错误路径 | §3 | test:226-273 | covered |
| 纯配置业务 | §3 | test:277-304 | covered |
| 资格损坏/旧空锁/候选 API | §4 | — | unknown（无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
