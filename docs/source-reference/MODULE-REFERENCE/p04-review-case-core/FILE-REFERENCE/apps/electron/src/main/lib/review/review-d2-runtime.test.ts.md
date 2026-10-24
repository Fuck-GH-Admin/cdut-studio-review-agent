---
path: apps/electron/src/main/lib/review/review-d2-runtime.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ce35e1dde6e76d2c66f2ca0472d54407c98c5465
sha256: b62e7d63b32ab615eea7a4d480e7e5bd07a536b723be3333222a460ce927e212
lines: 437
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-d2-runtime.test.ts

## 1. 测试目标

D2 作者态 → Pi 有效审核规则的 BDD 回归（头注 :1-3）：用**合成材料/模型回执**检查完整任务包、分支作用范围、档案逐操作隔离、跨版本防混用；文件头明示「不代表校方制度真实性」。被测主单元 `review-d2-runtime.ts`（`compileD2RuntimePlan/createD2TechnicalCase/makeD2CandidateShell/attachD2RuntimePlan/verifyD2InstalledPlan/verifyD2PiRun`，:11）及 Pi 链路 `pi-case-review-service`（:16）、`template-store`/`application-service`/`stage-workflow`/`workspace-business-service-v2`/`run-store-v2`（:14-19）。**被测 `review-d2-runtime.ts` 不在本批源文件清单**（由其他批次主责）；本篇记录本测试文件的真实断言、夹具与缺口。

## 2. 用例清单

16 用例 / 1 describe（`D2 作者态到 Pi 有效审核规则（BDD）`，:95）。夹具与 mock 边界：
- 磁盘隔离 `mkdtempSync(join(tmpdir(),'cdut-d2-real-pi-'))` + `PROFER_CONFIG_DIR`（:21-25，`afterAll` rmSync）。
- **fixture 文件**：`docs/design/review-agent/fixtures/d05-synthetic-state.json`（`DemoState`，:28）；CLI 用例另读 `d2-workspace-synthetic.json`/`d2-selection-archive.json`/`d2-selection-text.json`（:97/:105-107/:144-145）。
- `authoring()`（:36-58）：从 demo 模板/情景构造 `ReviewAuthoringWorkspaceV1`，sourceBindings 逐 checkId 绑 `synthetic-source`，仅 `local/school-decision` 绑 `school-policy-unverified`（:45）；来源两条（synthetic / policy-candidate 未核，:52-55）。
- `setup()`（:69-93）：`saveAuthoringCandidateDraft(makeD2CandidateShell)` → `createD2TechnicalCase` → **真实 `registerMaterial`** 写合成文本（内容含查阅已授权/复制未确认/开放未知等语义，:79）→ 返回 `sourceRef`。**合成材料与合成回执**（无真实模型调用、无网络）。
- CLI 用例用 `Bun.spawnSync` 跑 `apps/electron/scripts/review-d2-plan.ts`（:100-110/:148-155），`process.execPath` 子进程。

| # | 用例 | 行 | 要点 |
| --- | --- | --- | --- |
| 1 | CLI 固定 workspace 无副作用编译计划 | 96-117 | preview 命令 |
| 2 | 不可发布候选只能走显式技术建案 | 119-138 | 正式入口拒未发布 |
| 3 | CLI 注册候选并建可运行案卷 | 140-158 | register/create 命令 |
| 4 | 无固定任务包不能跑 Pi | 160-169 | `D2_FIXED_PLAN_MISSING` |
| 5 | 计划外混入规则/主体被拒 | 171-190 | `verifyD2InstalledPlan` |
| 6 | 普通文本任务单语义检查 | 192-198 | rules/mapping 各 1 |
| 7 | 校园卡 family/temporary 分支作用域 | 200-212 | 规则文本/mapping/指纹 |
| 8 | 未知情景不假装不适用；对象不悬空 | 214-233 | 4 类 throw |
| 9 | 档案 read/copy 生成隔离 RuleSpec/Subject | 235-244 | 3/3 隔离 |
| 10 | 普通 Pi 真实准备/工具回执完成技术检查 | 246-287 | 含 3 个 AGENT_DECISION_DISABLED |
| 11 | 查阅 SourceRef 不得覆盖复制 | 289-348 | 逐操作三项检查 |
| 12 | 未认证校规：AI 符合结论必须拒绝 | 350-375 | unverified-policy |
| 13 | 计划改写/输入变化拒旧结果冒用 | 377-389 | RuleSpec/输入哈希 |
| 14 | 安装资格独立登记，删 sourceNote 不影响 | 391-407 | attach + publish 拒 |
| 15 | 候选壳始终草稿 | 409-415 | status/outputs |
| 16 | 候选模板夹带额外 RuleSpec/政策/审批拒止 | 416-435 | `D2_FIXED_PLAN_MISMATCH` |

## 3. 真实断言

- 用例 1（:111-116）：`run.exitCode === 0`；`plan.fingerprint` 长度 64；`plan.rules` 长度 3；`plan.publicationAllowed` `toBeFalse()`。
- 用例 2（:122-137）：`createCaseFromTemplate` `rejects.toThrow('只有已发布模板')`；`createD2TechnicalCase` ok 且聚合 `d2RuntimePlan.publicationAllowed` false（:129-130）；错误情景 `rejects.toThrow('D2_SCENARIO_REQUIRED')` 且 `readAggregate` undefined（:133-137，无半写）。
- 用例 3（:148-157）：register/create 两命令 `exitCode 0`；`mapping` 长度 1；`caseV2.title === 'CLI 技术审核'`。
- 用例 4（:165-168）：`preparePiReviewRunV2` `toThrow('D2_FIXED_PLAN_MISSING')`；聚合 `d2RuntimePlan` `toBeUndefined()`。
- 用例 5（:184-189）：外加规则后 `verifyD2InstalledPlan(...).join('；')` 含 `'未登记的外部规则'`；外加主体含 `'未登记的外部业务主体'`。
- 用例 6（:194-197）：`rules` 1、`rules[0].targetScope === 'case'`、`mapping` 1、`publicationAllowed` false。
- 用例 7（:204-211）：family 规则文本含 `'关联教职工已故'` 不含 `'派遣协议'`；temporary 相反；两分支 `mapping` 各 2（按 subjectId 过滤）；family 存在 `confirmation==='unconfirmed'` 规则；`family.fingerprint !== temporary.fingerprint`。
- 用例 8（:217-232）：无情景/非法情景 `toThrow('D2_SCENARIO_REQUIRED')`；空 targets/伪造 kind `toThrow('D2_SCENARIO_SCOPE_REQUIRED')`；篡改 `operation` `toThrow('D2_TARGET_INVALID')`；缺目标 `toThrow('D2_SCOPE_MISSING')`。
- 用例 9（:237-243）：`rules` 3、`subjects` 3；read/copy 的 `subjectId`/`ruleId`/`sectionId` 两两不同（隔离）。
- 用例 10（:248-286）：`verifyD2InstalledPlan` `toEqual([])`；`prepared.userMessage` 含 `'D2 固定技术预审包'`；回执 `rejected` `toEqual([])`、`missingChecks` `toEqual([])`、`status === 'completed'`（:264-266）；`verifyD2PiRun(...).complete` true（:267）；随后 `decideWorkspaceCaseV2`/`recordStageDecision`/`resolveAppealV2` 三者 `ok:false` 且 `code === 'AGENT_DECISION_DISABLED'`（:273-286）。
- 用例 11（:292-347）：user 确认查阅链接后，首次只交 read 检查 → `status === 'running'`、`missingChecks` 含 copy/open 的 ruleId（:315-317）；用查阅凭据冒充复制 → `rejected` 某项 `reason` 含 `'逐操作'`、`missingChecks` 仍含 copy、`verifyD2PiRun(...).complete` false（:326-328）；补齐 `awaiting-confirmation` 两项后 `status === 'completed'`、`rejected` `toEqual([])`、`verifyD2PiRun` `toMatchObject({complete:true, problems:[]})`（:340-343）；copy 规则的 run.checks 恰 1 条、`status === 'awaiting-confirmation'`、`target.subjectIds` `toEqual([copy.subjectId])`（:344-347）。
- 用例 12（:355-374）：`authority==='unverified-policy'` 的 mapping 提交 `compliant` → `rejected` 某项 `reason` 含 `'尚未确认'`、`status === 'running'`（:360-361）；全 `awaiting-confirmation` 提交 → `completed`、`rejected` `toEqual([])`、verify complete（:372-374）。
- 用例 13（:382-388）：改写 `reviewRules[0].requirement` 后 `verifyD2InstalledPlan` 含 `'RuleSpec'`；`documents[0].contentHash` 改 `altered-hash` 后 `verifyD2PiRun(...).complete` false 且 `problems` 含 `'输入哈希'`。
- 用例 14（:393-406）：删除 `sourceNote` 的候选仍 `isAuthoringCandidateDraft` true；`attachD2RuntimePlan` ok 且 `verifyD2InstalledPlan` `toEqual([])`；`publishTemplate` `toThrow('发布资格')`。
- 用例 15（:411-414）：候选壳 `status === 'draft'`；`outputs` 不含 `kind==='approval'`；`publishTemplate` `toThrow('候选')`。
- 用例 16（:423-434）：篡改模板 sections 后 `verifyD2InstalledPlan` 含 `'候选模板壳被加入'`；`preparePiReviewRunV2` `toThrow('D2_FIXED_PLAN_MISMATCH')`。

## 4. 未覆盖与脆弱点

- 未覆盖：`review-d2-execution-gates` 的守卫码（`D2_GATE_*`/`D2_MATERIAL_*`/`D2_STUDENT_*` 无断言，全树 `.test.ts` 零命中）；学籍字段/trusted-registry-field（`trustedStudentSnapshot`）路径、`generic-object` 模式错误（`D2_GENERIC_*`）未测；`attachD2RuntimePlan` 的 CAS 冲突分支；CLI 的错误退出路径。
- 脆弱点：强依赖 fixture 文件与 `scripts/review-d2-plan.ts` 的 CLI 形状（`Bun.spawnSync`，:100-110）；`sourceRef` 依赖 `registerMaterial` 解析出的首个非 image block（:88-91）；文案子串断言（`'逐操作'`/`'尚未确认'`/`'输入哈希'`）随文案改动失效；16 用例共享 `home` 目录但案卷 id 用递增 serial（:68-71）隔离。
- **NOT_RUN**：本轮未执行 bun test / CLI / 任何产品代码。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例断言/行号如 §2-3 | 已证实 | 本文件逐行 |
| 合成材料/回执边界（非真实制度/模型） | 已证实 | 头注 :1-3、:53-55/:79 |
| 逐操作隔离/未认证拒绝/防混用被断言 | 已证实 | :315-347/:355-374/:382-388 |
| 3 个 AGENT_DECISION_DISABLED 边界 | 已证实 | :273-286 |
| `D2_GATE_*` 等守卫码零测试 | 已证实（否定） | 全树 `.test.ts` 检索 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 计划编译（普通/分支/隔离/防混用） | §3 | 111-243 | covered |
| 建案门禁（未发布/情景/技术入口） | §3 | 122-137 | covered |
| Pi 准备/提交/verify 全链 | §3 | 248-347 | covered |
| 未认证制度拒绝 | §3 | 355-374 | covered |
| 候选壳/夹带/发布资格 | §3 | 393-434 | covered |
| CLI preview/register/create | §3 | 111-157 | covered |
| D2 执行门禁守卫码 | §4 | — | unknown（未测） |
| 学籍/generic-object 路径 | §4 | — | unknown（未测） |
