---
path: apps/electron/scripts/review-d2-plan.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 832516bf047ca2e89c4a0bd87bc41220115b436a
sha256: a598466421e5a4787c6c1fcaf7879db118faa1a7c4a2c817c0f83de6609e935b
lines: 66
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/review-d2-plan.ts

## 1. 结论与边界

D2 Agent JSON 合约 CLI，4 个命令：`preview`（只编译预览不写入）、`register`（登记不可发布的服务端候选草稿）、`create`（创建专用技术案卷并固定任务包）、`attach`（修复已建草稿案卷的事务绑定）（`scripts/review-d2-plan.ts:2-7`）。任何写操作必须显式设置 `PROFER_CONFIG_DIR`（`scripts/review-d2-plan.ts:7`）。

边界：不做 GUI、不发布校规、不产生行政决定；所有输出固定 `publicationAllowed: false`（`:33`、`:42`、`:58`）；不自动创建案卷（`attach` 对不存在案卷直接拒绝，`:50-51`）。

## 2. 导出与关键符号

导出 0：CLI 脚本无 `export` 声明（逐条核对全文 `scripts/review-d2-plan.ts:9-66`）。关键内部符号：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `command, workspacePath, selectionPath, target, revisionArg, actorId` | 解构常量（内部） | 15 | `process.argv.slice(2)` | `target`/`revisionArg` 随命令复用（见 §3） |
| `json` | 泛型常量（内部） | 16 | `<T>(path: string): T` | `JSON.parse(readFileSync(path,'utf8'))` 类型断言 |
| `main` | 异步函数（内部） | 18-62 | `(): Promise<void>` | 命令分派 |
| 顶层 `await main().catch(...)` | 语句 | 63-66 | — | 错误写 stderr、`process.exitCode = 1` |

## 3. 内部逻辑与关键流程

argv 解构一次复用（`scripts/review-d2-plan.ts:15`）：`create` 的第 5 参是案卷标题、`attach` 的第 5 参是 `expectedRevision`——同一变量 `revisionArg` 双义（`:37-38` vs `:52-55`）。

1. 缺 `workspacePath`/`selectionPath` 抛用法错误（`:19`）；随后读入 workspace 与 selection 两个 JSON（`:20-21`）。
2. `preview`（`:22-27`）：必须给 `target`（合成案卷 JSON 路径，`:23`）；`compileD2RuntimePlan(workspace, selection, json<ReviewCaseV2>(target))`（`:24`）；把 plan JSON 写 stdout（`:25`）。无副作用（不落盘）。
3. `register`（`:28-35`）：必须 `PROFER_CONFIG_DIR`（`:29`）；`makeD2CandidateShell(workspace, selection.templateId, selection.version)` 生成最小草稿壳（`:31`）→ `saveAuthoringCandidateDraft(draft)`（`:32`）；输出 `{registered: true, templateId, templateVersion, publicationAllowed: false}`（`:33`）。
4. `create`（`:36-43`）：必须 `target`（caseId）、`revisionArg`（标题）、`actorId`（`:36`）；`createD2TechnicalCase({caseId: target, title: revisionArg, actor: {actorId, actorSource: 'local', role: 'reviewer'}, workspace, selection})`（`:37-40`）；`!created.ok` 抛 `created.code + ': ' + created.message`（`:41`）；输出 `{created: true, caseId, revision, fingerprint, publicationAllowed: false}`（`:42`）。
5. `attach`（`:45-59`）：必须 `PROFER_CONFIG_DIR`（`:46`）与 `target`/`revisionArg`/`actorId`（`:47`）；`expectedRevision = Number(revisionArg)` 须为非负安全整数（`:48-49`）；`readAggregate(target)` 为空即抛「案卷不存在，不会自动创建或取得审批资格」（`:50-51`）；`attachD2RuntimePlan({caseId: target, requestId: 'd2-attach-' + target + '-rev-' + version, actor: {actorId, actorSource: 'local', role: 'reviewer'}, expectedRevision: version, workspace, selection})`（`:52-56`）；`!result.ok` 抛 code+message（`:57`）；输出 `{attached: true, caseId, revision, fingerprint, publicationAllowed: false}`（`:58`）。
6. 未知命令抛「未知命令：…」（`:61`）。

`create`/`attach` 均不传可选的 `trustedStudentSnapshot`（对比被调签名 `src/main/lib/review/review-d2-runtime.ts:142-147`、`:366-374`）。

## 4. 调用者与调用链

入向（全冻结树检索 `scripts/review-d2-plan`，命中仅测试 spawn 与文档示例）：
- `src/main/lib/review/review-d2-runtime.test.ts:103`（`preview` spawn）、`:142`（`register`+`create` spawn）。
- `docs/design/review-agent/19-d2-scenario-scoped-pi-runtime.md:38-55`（四命令用法示例）——文档示例，不是执行调用者。

出向（`scripts/review-d2-plan.ts:9-13` 导入）：
- `@profer/shared`：类型 `D2ScenarioSelection`/`ReviewAuthoringWorkspaceV1`/`ReviewCaseV2`（`:10`）。
- `src/main/lib/review/review-d2-runtime.ts:142`（`compileD2RuntimePlan`）、`:68-83`（`makeD2CandidateShell`）、`:366-417`（`attachD2RuntimePlan`）、`:425-468`（`createD2TechnicalCase`）。
- `src/main/lib/review/template-store.ts:372-374`（`saveAuthoringCandidateDraft`）。
- `src/main/lib/review/case-store-v2.ts:51-64`（`readAggregate`）。

## 5. 数据 I/O、读写与副作用

- 输入：workspace/selection/case 三个 JSON（`scripts/review-d2-plan.ts:16`、`:20-21`、`:24`）。
- 输出：stdout 纯 JSON（`:25`、`:33`、`:42`、`:58`）；错误写 stderr（`:64`）。
- 磁盘写：`register` → `saveAuthoringCandidateDraft` 写模板草稿与 `candidate-held` 资格记录（`src/main/lib/review/template-store.ts:365-374`）；`create`/`attach` → 经 `submitCommand` 事务写案卷聚合（`src/main/lib/review/review-d2-runtime.ts:375-416`），把 `subjects`/`reviewRules`/`caseFields.d2PlanFingerprint`/`d2RuntimePlan` 固定进案卷（`:402-413`）；`create` 先 `createAggregate` 落 `CreateD2TechnicalReviewCase` 收据（`:450-456`）。
- `preview` 零写入（`:22-27`，仅编译）。无网络、无遥测。

## 6. 分支、失败、取消与恢复

- 错误出口统一：`await main().catch(...)` 把消息写 stderr 并 `process.exitCode = 1`（`scripts/review-d2-plan.ts:63-66`），无 `[D1]` 式前缀。
- 本文件抛错分支：`:19`（用法）、`:23`/`:36`/`:47`（分命令缺参）、`:29`/`:46`（缺 `PROFER_CONFIG_DIR`）、`:49`（`expectedRevision` 非法）、`:51`（案卷不存在）、`:61`（未知命令）。
- 下游 fail-closed：`D2_AUTHORING_INVALID`/`D3_FROZEN_LOCK_INVALID`/`D2_UNMAPPED_ADVANCED`/`D2_TEMPLATE_MISMATCH`/`D2_SCENARIOS_INVALID`/`D2_SCENARIO_REQUIRED`/`D2_TARGET_INVALID` 等（`src/main/lib/review/review-d2-runtime.ts:148-184`、`:85-121`）；`attach` 的 `INVALID_TRANSITION`（案卷非 draft 或已有计划，`:380-382`）、`AGENT_DECISION_DISABLED`（模板非 D2 候选壳，`:390-392`）、`VALIDATION_FAILED`（案卷预混规则/主体，`:397-399`）。
- 失败后状态：`create` 先前置编译再建案，坏情景/悬空对象不落半个案卷（`src/main/lib/review/review-d2-runtime.ts:446-447`；测试断言 `src/main/lib/review/review-d2-runtime.test.ts:133-137`：抛 `D2_SCENARIO_REQUIRED` 且 `readAggregate` 为 undefined）。`create` 的建案与绑定是两个事务，第二步受 I/O 故障影响时裸草稿仍不能执行审核，可用 `attachD2RuntimePlan` 显式恢复（`src/main/lib/review/review-d2-runtime.ts:419-423`）。无自动重试/取消。

## 7. 权限与权威状态

- 无身份认证：`actor` 固定为 `{actorId: <参数>, actorSource: 'local', role: 'reviewer'}`（`scripts/review-d2-plan.ts:38`、`:54`）；被调侧只校验 `actor.role === 'reviewer'` 与 `actorId` 非空（`src/main/lib/review/review-d2-runtime.ts:433-435`）——角色由 CLI 硬编码，不是真实身份。
- 写操作强制隔离根 `PROFER_CONFIG_DIR`（`:29`、`:46`），`preview` 不要求。
- 权威状态：候选草稿永不可发布，全路径输出 `publicationAllowed: false`（`:33`、`:42`、`:58`）；`register` 只登记 `candidate-held` 候选壳（`src/main/lib/review/review-d2-runtime.ts:76`、`src/main/lib/review/template-store.ts:368-374`）；正式建案入口 `createCaseFromTemplate` 仍拒绝未发布模板（`src/main/lib/review/review-d2-runtime.test.ts:122-124` 断言「只有已发布模板」）。

## 8. 修改影响面

- 调用方测试：`src/main/lib/review/review-d2-runtime.test.ts:96-117`（断言 `fingerprint` 64 位、`rules` 3 条、`publicationAllowed` false）、`:140-158`（断言 `d2RuntimePlan.mapping` 1 条、`caseV2.title === 'CLI 技术审核'`）；命令行参数复用语义（`target`/`revisionArg` 双义）改动会破坏用法文档 `docs/design/review-agent/19-d2-scenario-scoped-pi-runtime.md:38-55`。
- 被调 API 契约：`compileD2RuntimePlan` 返回 `D2RuntimePlan`（含 `fingerprint`/`rules`/`mapping`）、`createD2TechnicalCase`/`attachD2RuntimePlan` 返回 `ReviewCommandResult<D2RuntimePlan>`（`ok`/`code`/`message`/`aggregate`/`entity`，`src/main/lib/review/review-d2-runtime.ts:366-374`、`:425-432`）；字段变化直接影响 stdout JSON 与测试解析。

## 9. 测试证据

针对本 CLI 的直接测试（`src/main/lib/review/review-d2-runtime.test.ts`，`Bun.spawnSync` 真实起进程）：
- `:96-117`（`preview`）：用 fixture `d2-workspace-synthetic.json` + `d2-selection-archive.json` + 临时 case JSON（`:97-99`）；断言 `exitCode === 0`（`:111`）、`plan.fingerprint` 长 64（`:114`）、`plan.rules` 长 3（`:115`）、`plan.publicationAllowed === false`（`:116`）。
- `:140-158`（`register`+`create`）：`register` 断言 `exitCode === 0`（`:149`）；`create` 断言 `exitCode === 0`（`:154`）后以 `readAggregate('d2-cli-created')` 断言 `d2RuntimePlan.mapping` 长 1（`:156`）、`caseV2.title === 'CLI 技术审核'`（`:157`）。

未覆盖：`attach` 子命令无 CLI 级 spawn 断言（检索范围：全冻结树 `scripts/review-d2-plan` 命中仅 `src/main/lib/review/review-d2-runtime.test.ts:103`、`:142` 与 `docs/design/review-agent/19-d2-scenario-scoped-pi-runtime.md`）；CLI 的错误路径（缺参/缺 env/未知命令）无断言。间接证据：同测试文件 `:119-138` 直接调 `createD2TechnicalCase` 断言失败不留半案卷、`:160-169` 断言 `D2_FIXED_PLAN_MISSING`——覆盖库层而非本 CLI。`NOT_RUN`：本轮未执行任何测试/typecheck/运行，全部为静态阅读所得。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四命令分派、`target`/`revisionArg` 双义复用、参数校验 | 已证实 | `scripts/review-d2-plan.ts:15-61` |
| `preview` 无副作用、`register` 只登记不可发布候选 | 已证实 | `scripts/review-d2-plan.ts:22-35` |
| `attach` 不自动建案、拒绝非 draft/已有计划案卷 | 已证实 | `scripts/review-d2-plan.ts:50-51`、`src/main/lib/review/review-d2-runtime.ts:380-382` |
| `create` 前置编译 fail-closed，坏输入无半案卷 | 已证实 | `src/main/lib/review/review-d2-runtime.ts:446-447`、`src/main/lib/review/review-d2-runtime.test.ts:133-137` |
| CLI spawn 断言（preview/register/create） | 已证实 | `src/main/lib/review/review-d2-runtime.test.ts:111-116`、`:149-157` |
| `requestId` 命名 `d2-attach-<caseId>-rev-<n>` 的去重/幂等语义 | 推断 | `scripts/review-d2-plan.ts:53`（未见对应断言） |
| `attach` 的 CLI 实际行为、错误输出格式 | 未知 | 无 CLI 级测试，见 §9 |
| `trustedStudentSnapshot` 缺省时的快照门禁影响 | 未知 | 本 CLI 不传该参数（`:24`、`:52-56`），门禁分支在库内 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| argv 解构/双义复用 | §3 | 15 | covered |
| `json` 装载器 | §2、§5 | 16 | covered |
| 用法/缺参早退 | §3.1、§6 | 19-21 | covered |
| `preview` | §3.2 | 22-27 | covered |
| `register` | §3.3 | 28-35 | covered |
| `create` | §3.4 | 36-43 | covered |
| `attach`（校验/存在性/事务绑定） | §3.5、§6 | 45-59 | covered |
| 未知命令/顶层 catch | §3.6、§6 | 61、63-66 | covered |
| 下游错误码族 | §6 | — | covered（引库行号） |
| `attach` CLI 运行时行为 | §9、§10 | — | unknown（无 CLI 测试，NOT_RUN） |
