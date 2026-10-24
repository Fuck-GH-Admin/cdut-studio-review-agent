---
path: apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 35fc991f1bc3ef98ae588e13a2506db451191fe6
sha256: ab5a01e5fff0754f4fed4b62ca5d521c205c528e0a3b39a5efa2b2058e6624bb
lines: 133
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts

## 1. 结论与边界

本文件是 Main 侧 D4 候选目录与“把某套 D4 审核方案固定到原生 V3 草稿案卷”的 IPC 实现：列出随包冻结的 50 套作者态候选（逐套读取冻结选择，单套损坏只影响自身），并通过 `LOCAL_D4_ATTACH_PLAN_V3` 校验案卷、原件字节、候选资格后调用 `attachD2RuntimePlan` 安装技术预审计划。运行时服务 + IPC 注册，无 UI。

边界：

- 不发布模板、不产生行政决定：候选只作为本地技术方案安装（文件头注释 `apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts:1-4`）。
- 不编译规则本身：编译在 `review-d2-runtime.ts`；本文件只负责选择、校验与调用。
- 不写案卷 JSON：写入由 `attachD2RuntimePlan` 的 `submitCommand` 完成。
- 不读渲染层路径：所有 D4 路径经 `resolveD4SourcePath` 白名单校验（`apps/electron/src/main/lib/review/review-d4-catalog.ts:42-48`）。

## 2. 导出与关键符号

`export` 逐条核对：4 个导出函数；无导出类型/常量（`D4ClientTemplate`/`D4UnifiedEntry` 为导入类型）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `localD4Selection` | 函数（导出） | 28-42 | `(entry:D4UnifiedEntry, directory:string) => D2ScenarioSelection` | 读取单套候选的冻结选择；G01-I 特判 `fixtures/selections.json` 的 `two` 分支；缺件抛 `D4_SELECTION_MISSING` |
| `buildLocalD4Templates` | 函数（导出） | 55-72 | `(entries:readonly D4UnifiedEntry[]) => D4ClientTemplate[]` | 逐套加载工作区与选择；单套异常降级为带 `selectionIssue` 的不可用占位 |
| `listLocalD4Templates` | 函数（导出） | 73-75 | `() => D4ClientTemplate[]` | 读取完整目录并构建客户端列表 |
| `installC11NativeD4TechnicalPlan` | 函数（导出） | 76-133 | `() => void` | 注册 `LOCAL_D4_LIST_V3` 与 `LOCAL_D4_ATTACH_PLAN_V3` 两个 handler |
| `unavailableLocalD4Template` | 内部 | 45-52 | `(entry, reason) => D4ClientTemplate` | 不可用占位：保留身份与 blob，`targets:[]`，`selectionIssue=reason` |
| `base` | 内部 | 20 | `(path)=>string` | 去掉 `workspace.json`/`workspace/workspace.json` 后缀 |
| `readJson` | 内部 | 19 | `<T>(path)=>T` | `JSON.parse(readFileSync(resolveD4SourcePath(path)))` |
| `reviewer` | 内部常量 | 18 | `Actor` | `local-reviewer/local/reviewer` |
| `CONTROLLED_STUDENT_TEMPLATE` | 内部常量 | 22 | `'g01-student-identity-correction'` | 唯一使用受控合成学籍快照的候选 |

## 3. 内部逻辑与关键流程

### 3.1 冻结选择读取（`localD4Selection`）

- G01-I：读取 `<directory>/fixtures/selections.json`，取 `two`；文件缺失或 `two.targets` 非非空数组 → `D4_SELECTION_MISSING`（`apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts:29-36`）。注释明确“绝不返回 `targets:[]` 冒充无需对象”（`:24-27`）。
- 其它候选：按 `selection.json`、`synthetic-selection.json`、`fixtures/selection.json` 顺序找第一个存在文件；全缺 → `D4_SELECTION_MISSING`（`:38-41`）。

### 3.2 逐套构建（`buildLocalD4Templates`）

对每个 entry（`:56-71`）：

1. `loadD4UnifiedWorkspace(entry)`：校验 workspace Git blob 与身份，并跑 D1 校验（`review-d4-catalog.ts:85-97`）。
2. 取 `definitions.templates[0]`；`loadD4UnifiedWorkspace` 已保证恰好一个模板（`review-d4-catalog.ts:88-92`）。
3. 组装 `D4ClientTemplate`：`name`、`workspaceGitBlobSha`、`primary/conditions`（来自 `genericScenarioAxes`）、`selection`、`controlledStudentFixture`（`:60-65`）。
4. 任一步抛错：`console.error` 记录 `[review-v3] D4 候选不可用 ...`，返回 `unavailableLocalD4Template`（`:66-69`）。占位保留 `templateId/version/domain/workspaceGitBlobSha`，`name` 用 `templateId`，`primary/conditions` 为空，`selection.targets:[]`，`selectionIssue` 为错误文本（`:45-52`）。

`listLocalD4Templates` 每次调用都重新 `loadD4UnifiedCatalog()` 并重建 50 套（无缓存），因此每次列表都会重新读磁盘与校验 blob（`:73-75`）。

### 3.3 列表 IPC（`LOCAL_D4_LIST_V3`）

handler 先 `assertC0ReviewMainSender(event)`，再返回 `listLocalD4Templates()`（`:77-80`）。通道值 `review-v3:local-d4-list`（`packages/shared/src/types/review.ts:523`）。

### 3.4 安装 IPC（`LOCAL_D4_ATTACH_PLAN_V3`）

执行顺序（`apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts:81-132`）：

1. `assertC0ReviewMainSender`（`:84`）。
2. 入参形状：`caseId` 字符串、`d4.selection.targets` 数组，否则 `LOCAL_D4_CASE_AND_SCENARIO_REQUIRED`（`:85-87`）。
3. `readAggregate(caseId)`，并要求：原生 V3 案卷、ID 一致、`stage==='draft'`、无 `canonicalPlan`、无 `d2RuntimePlan`；否则 `LOCAL_D4_NATIVE_DRAFT_CASE_REQUIRED`（`:88-92`）。
4. 模板必须仍未绑定（`pending-template-v3@0`），否则 `LOCAL_D4_TEMPLATE_ALREADY_BOUND`，文案包含当前模板并提示“请新建一个未绑定模板的案卷”（`:93-97`）。
5. 案卷不得已有主体或规则，否则 `LOCAL_D4_EXISTING_ITEMS`（`:98-99`）。
6. 按 `templateId+version` 在目录中找 entry；找不到 → `LOCAL_D4_CANDIDATE_NOT_FOUND`（`:100-103`）。
7. 加载工作区（`:104`）。
8. 对每个 active 原件调用 `assertC2PhysicalOriginalBytes`，逐份重哈希（`:105-106`）。
9. 若 `useControlledStudentFixture`：必须是 G01-I，否则 `LOCAL_D4_STUDENT_FIXTURE_SCOPE_INVALID`；读取 `fixtures/controlled-registry.json`（`:107-113`）。
10. 模板占用检查：已存在且不是 candidate-held → `LOCAL_D4_TEMPLATE_ID_ALREADY_PUBLISHED_OR_OCCUPIED`（`:114-116`）。
11. 不存在则 `saveAuthoringCandidateDraft(makeD2CandidateShell(...))`（`:117`）。
    - 这是模板库磁盘写，发生在案卷 attach 之前；若后续 attach 失败，代码没有删除/回滚该草稿（`:117-124`）。
12. 再次 sender 校验（`:118`）。
13. `attachD2RuntimePlan`：`requestId='local-d4-'+randomUUID()`、actor 固定本地 reviewer、`expectedRevision` 为刚读到的 revision（`:119-123`）。
    - 这里的 `selection` 直接来自 IPC 入参 `input.d4.selection`；本文件只用 `compileD2RuntimePlan` 做结构/模板/对象校验，**不重新读取或比对** `fixtures/selections.json`。冻结选择只在列表路径 `localD4Selection` 读取（`:28-42`）。
14. `!result.ok` → 抛 `code+': '+message`（`:124`）。
15. `verifyD2InstalledPlan` 有问题 → `LOCAL_D4_PLAN_INVALID`（`:125-126`）。
16. 再次 sender 校验后返回 `{caseId, templateId, templateVersion, checks: mapping.length, fingerprint}`（`:127-131`）。

## 4. 调用者与调用链

入向：

- `apps/electron/src/main/index.ts:192` 导入，`:950` 在应用初始化时调用 `installC11NativeD4TechnicalPlan()`（同处还有 `installC11LocalNativeProductIntake()`，`:949`）。
- 渲染层经 preload `listD4Templates`/`attachD4TechnicalPlanV3` 调通道（`apps/electron/src/preload/index.ts:4827-4834`）。
- 测试：`apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts:14`、`review-v3-d4-catalog-attach.test.ts:17`（后者不在本批）。

出向：

- `review-d4-catalog.ts:55/85/42`：目录、工作区、路径白名单。
- `review-d2-runtime.ts:68/366/320`：候选壳、安装、校验。
- `template-store.ts:253/358/372`：模板读取、候选资格、草稿登记。
- `native-workspace-case-v3.ts:58`：原生案卷识别。
- `review-c0-authority.ts:21`：sender 守卫。
- `review-v3-main-trust-port.ts:68`：原件字节复核。
- `case-store-v2.ts:51`：读聚合。

## 5. 数据 I/O、读写与副作用

- 读：`catalog.json`、各候选 `workspace.json`、`fixtures/selections.json`、`fixtures/controlled-registry.json`、模板库、案卷聚合、每个 active 原件的真实字节。
- 写：仅通过 `attachD2RuntimePlan`（案卷 JSON）与 `saveAuthoringCandidateDraft`（模板库草稿）产生磁盘写；本文件本身不直接写。
- 幂等：attach 的 `requestId` 每次 `randomUUID()`，因此同一请求重放不会命中幂等回执；重复点击会因 revision/CAS 或“已有 d2RuntimePlan”被拒。
- 副作用：`console.error` 记录不可用候选；`ipcMain.handle` 注册两个通道；无网络/窗口/通知。
- 原子性：候选壳登记与计划安装不是同一事务（`:117` 与 `:119`）；若 attach 失败，模板库会留下一个草稿壳，代码无删除/回滚（`:114-124`）。

## 6. 分支、失败、取消与恢复

| 错误 | 触发 | 行 |
| --- | --- | --- |
| `D4_SELECTION_MISSING` | 选择文件缺失/`two` 为空 | 32,35,40 |
| `LOCAL_D4_CASE_AND_SCENARIO_REQUIRED` | 入参形状非法 | 87 |
| `LOCAL_D4_NATIVE_DRAFT_CASE_REQUIRED` | 非原生/非草稿/已有计划 | 92 |
| `LOCAL_D4_TEMPLATE_ALREADY_BOUND` | 案卷已绑定模板 | 96 |
| `LOCAL_D4_EXISTING_ITEMS` | 已有主体或规则 | 99 |
| `LOCAL_D4_CANDIDATE_NOT_FOUND` | 目录无此候选 | 103 |
| `LOCAL_D4_STUDENT_FIXTURE_SCOPE_INVALID` | 非 G01-I 使用学籍快照 | 110 |
| `LOCAL_D4_TEMPLATE_ID_ALREADY_PUBLISHED_OR_OCCUPIED` | 模板已发布/被占用 | 116 |
| `LOCAL_D4_PLAN_INVALID` | 安装后校验失败 | 126 |

- 失败不写计划：1–11 步都在 attach 前；attach 内部由事务保证不写部分数据。
- 不可用候选不是异常：列表路径把异常转成 `selectionIssue`，调用方仍拿到 50 条（`:66-69`）。
- 无取消/超时；恢复：修复候选文件后重新列目录；已安装计划不能在本入口覆盖，需新案卷（`:93-97` 与 `review-d2-runtime.ts:380-382`）。

## 7. 权限与权威状态

- 两个 handler 都调用 `assertC0ReviewMainSender`（`:78,84`）；安装流程在关键步骤前后共调用 3 次（`:84,118,127`）。该守卫只证明“来自当前主窗口主框架”，不是教师/学校身份（`review-c0-authority.ts:1,21-28`）。
- actor 固定为 `local-reviewer/local/reviewer`（`:18`），不来自渲染层。
- 候选资格由 `isAuthoringCandidateDraft` 的服务端控制记录决定（`template-store.ts:352-360`）；已发布模板直接拒绝（`:114-116`）。
- 计划仍是 `publicationAllowed:false` 的技术预审（`review-d2-runtime.ts:305-306`）；本入口不产生发布、审批或决定。

## 8. 修改影响面

- 改返回形状 `D4ClientTemplate` 会影响 preload 类型与渲染层 `listD4Templates`/候选工作台（`apps/electron/src/preload/index.ts:4827-4829`）。
- 改错误码/文案会影响 UI 错误人话映射与测试（`review-v3-main-d4-local-plan.test.ts:203-205` 断言 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 与“请新建一个未绑定模板的案卷”）。
- 改 `localD4Selection` 的 G01-I 特判会影响 50 套目录可读性与学籍候选；`review-v3-d4-catalog-attach.test.ts` 逐套 attach 依赖它。
- 改候选壳登记逻辑会影响 `review-d2-runtime.ts` 的 `d2CandidateShellProblem` 与 B1（B1 也登记自己的壳）。
- 改路径白名单/目录加载会影响所有 D4 读取；`resolveD4SourcePath` 只接受 `d4-g0[1-8]-build` 下的 `.json/.md`（`review-d4-catalog.ts:42-48`）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts`（本批，7 个用例，详见该文件手册）。本文件被断言的关键点：

- 列表 50 套、无 `selectionIssue`、无空选择、域计数（`review-v3-main-d4-local-plan.test.ts:43-61`）。
- G01-I 冻结 `two` 分支与两个学籍目标（`:63-77`）。
- 缺 `selections.json` 抛 `D4_SELECTION_MISSING`（`:79-83`）。
- 单套损坏只影响自身（`:85-100`）。
- 真实 IPC attach 返回非零 checks 并绑定模板（`:147-178`）。
- 已绑定模板被拒且零写入（`:180-210`）。

间接测试：`review-v3-d4-catalog-attach.test.ts:30-80` 对 50 套逐一 attach（不在本批）。

`NOT_RUN`：本轮未运行 Bun 测试/typecheck/构建/GUI；以上为静态阅读断言。

缺口：未覆盖 `LOCAL_D4_LIST_V3` 的 sender 拒绝、非原生案卷、已有 `d2RuntimePlan`/`canonicalPlan`、已有主体/规则、模板已发布占用、非 G01-I 使用学籍快照、原件字节被篡改、`ipcMain.handle` 重复注册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 列表逐套隔离，单套异常降级为 `selectionIssue` | 已证实 | `:56-71`；测试 `:85-100` |
| G01-I 选择来自 `fixtures/selections.json` 的 `two` | 已证实 | `:29-36`；测试 `:63-77` |
| 安装前逐份复核 active 原件字节 | 已证实 | `:105-106`；`review-v3-main-trust-port.ts:68-115` |
| 已绑定模板在 attach 前被拒 | 已证实 | `:93-97`；测试 `:180-210` |
| 候选壳登记与计划安装非同一事务 | 已证实 | `:117` 与 `:119-123` |
| 每次列表都重读 50 套工作区（无缓存） | 已证实 | `:73-75` |
| `readJson` 的路径安全依赖 `resolveD4SourcePath` 白名单 | 已证实 | `:19`；`review-d4-catalog.ts:42-48` |
| 同一进程重复调用 `installC11NativeD4TechnicalPlan` 会重复注册 | 推断 | `ipcMain.handle` 语义；生产只在 `apps/electron/src/main/index.ts:950` 调一次 |
| 并发 attach 的败者得到版本冲突 | 推断 | `expectedRevision` 来自读聚合（`:121`）+ `case-store-v2.ts:233-236` |
| attach 使用 IPC selection，不与冻结 fixture 比对 | 已证实 | `:100-123` 只用传入 selection；`localD4Selection` 只在 `:28-42` 列表路径使用 |
| 模板草稿先写、attach 失败不回滚 | 已证实 | `:114-124` 无清理逻辑 |
| `useControlledStudentFixture` 的快照与选择是否匹配 | 未知 | 本文件只校验模板 ID；匹配由 `compileD2RuntimePlan` 的学籍逻辑间接约束 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `localD4Selection` G01-I | §3.1 | 29-36 | covered |
| `localD4Selection` 其它候选 | §3.1 | 38-41 | covered |
| `buildLocalD4Templates` 正常/异常 | §3.2 | 55-72 | covered |
| `unavailableLocalD4Template` | §3.2 | 45-52 | covered |
| `listLocalD4Templates` | §3.3 | 73-75 | covered |
| 列表 IPC + sender | §3.3 | 77-80 | covered |
| 安装 IPC 入参与案卷校验 | §3.4 | 81-99 | covered |
| 候选查找/工作区/原件 | §3.4 | 100-106 | covered |
| 学籍快照 | §3.4 | 107-113 | covered |
| 模板占用/登记 | §3.4 | 114-117 | covered |
| attach/校验/返回 | §3.4 | 118-131 | covered |
| 并发/重复注册 | §10 | 121；`apps/electron/src/main/index.ts:950` | partial |
