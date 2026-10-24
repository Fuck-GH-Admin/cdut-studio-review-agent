---
path: apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c0327df279844e7e571326d8362256aa010088a
sha256: 10bb69d8c003d05627201276e7a6ba878fb8ad4235aa8b631aeeee9109a79395
lines: 211
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts

## 1. 测试目标

验证 D4 50 套候选目录整体可读、单套缺件只降级自身、G01-I 使用冻结的受控学籍选择，以及真实 IPC 入口能把计划固定到原生未绑定草稿案卷、并拒绝已绑定模板的案卷且零写入（文件头 `apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts:1-5`）。测试直接调用 Main 服务与 IPC handler，不启动 Electron 窗口、不发模型请求。

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 2. 用例清单

共 7 个 `test(`（4 + 3）。所有用例共享：`PROFER_CONFIG_DIR` 指向临时目录（`:19-21`），`setMainWindow` 伪造主窗口，`globalThis.__proferElectronTestHooks.ipcMainHandlers` 作为 IPC 注册表（`:29-34`）。

| # | 用例（行） | 设置 | 动作 | 真实断言 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | `LOCAL_D4_LIST_V3 返回全部 50 套候选，且每套都带真实冻结选择`（`:43-61`） | 清空 handlers；设置主窗口；安装 D4 handler | 调用 `LOCAL_D4_LIST_V3` handler | `toHaveLength(50)`；无 `selectionIssue`；无空 `targets`；无空 `name`；域计数 `{G01:5,G02:3,G03:10,G04:8,G05:6,G06:9,G07:7,G08:2}` | 必须先 `handlers.clear()`，否则重复注册/旧 handler 干扰 |
| 2 | `G01-I 使用冻结 two 分支：两个学籍字段各一个 Subject`（`:63-77`） | 无额外设置 | `listLocalD4Templates()` | `controlledStudentFixture=true`；`selectionIssue` 未定义；`templateId`/`version=2`；`scenarios=['s01','s02','s07']`；两个目标分别为 `synthetic-1/full-name`、`synthetic-1/credential-id`，`kind='student-field'`，`intent='correction'` | 依赖仓库冻结 fixtures；不依赖 IPC |
| 3 | `受控学籍候选缺 selections.json 时如实报缺，不退化成空选择`（`:79-83`） | 使用 G01-I entry 与 `d4-g01-build/A` 路径 | 调 `localD4Selection` | `toThrow('D4_SELECTION_MISSING')` | 依赖 `A` 目录存在但无 `fixtures/selections.json` |
| 4 | `单个候选损坏只影响自身，其余候选照常返回`（`:85-100`） | 在 50 套后追加一个 `workspacePath` 指向不存在 `Z/workspace/workspace.json` 的 entry | `buildLocalD4Templates([...entries, broken])` | 长度 51；坏 entry `selectionIssue` 为真且含 `workspace.json`；`selection.targets=[]`；其余 50 套无 issue 且有目标 | 依赖目录 50 套本身可读 |
| 5 | `attachD2RuntimePlan 得到非零 checks，且 verifyD2InstalledPlan 无错`（`:114-145`） | 加载 G01-I 工作区、受控快照、`two` 选择；登记候选壳；`createAggregate` 建 `g01-student-identity-correction@2` 草稿案卷 | 直接调 `attachD2RuntimePlan`（`requestId='local-d4-g01i'`，`expectedRevision=0`） | `schemaVersion=2`；`mapping.length>0`；`mapping.length===rules.length`；指纹 64 位；快照 `studentId='synthetic-1'`/`enrollmentStatus='enrolled'`；主体集合 `['student-id','student-name']`；存在 `applicable`；无 `not-applicable`；`verifyD2InstalledPlan` 为空 | 依赖 G01-I fixtures；不依赖 IPC handler |
| 6 | `LOCAL_D4_ATTACH_PLAN_V3 真实入口：原生草稿案卷固定非零 checks 并回传指纹`（`:147-178`） | 清空 handlers；安装 handler；`createAggregate` 建 `pending-template-v3@0` 且首条回执为 `CreateNativeWorkspaceCaseV3` 的案卷 | 调 `LOCAL_D4_ATTACH_PLAN_V3`，`useControlledStudentFixture:true` | 返回 `caseId/templateId=g01-student-identity-correction/templateVersion`；`checks>0`；指纹 64 位；案卷 `mapping.length===checks`；案卷模板已绑定；`verifyD2InstalledPlan` 为空 | 依赖 handler 已注册；依赖原生案卷回执类型 |
| 7 | `已绑定正式模板的案卷不能再套技术方案，并给出可操作的原因`（`:180-210`） | 清空 handlers；安装 handler；建 `comprehensive-assessment-v2@3` 的 `CreateNativeWorkspaceCaseV3` 案卷 | 调 `LOCAL_D4_ATTACH_PLAN_V3`，捕获异常 | 消息含 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 与 `请新建一个未绑定模板的案卷`；不含 `失去受控候选资格`；案卷模板仍为 `comprehensive-assessment-v2`；`d2RuntimePlan` 未定义 | 依赖 handler 已注册；断言拒绝发生在写入前 |

## 3. 真实断言

- 用例 1：`expect(list).toHaveLength(50)`（`:48`）；`expect(list.filter(item => item.selectionIssue)).toEqual([])`（`:49`）；`expect(list.filter(item => item.selection.targets.length === 0)).toEqual([])`（`:51`）；`expect(domains).toEqual({ G01: 5, ... })`（`:58`）。
- 用例 2：`expect(g01i.selection.scenarios).toEqual(['s01', 's02', 's07'])`（`:69`）；`expect(g01i.selection.targets.map(...)).toEqual([...])`（`:70-76`）。
- 用例 3：`expect(() => localD4Selection(g01iEntry(), missing)).toThrow('D4_SELECTION_MISSING')`（`:82`）。
- 用例 4：`expect(list).toHaveLength(51)`（`:92`）；`expect(unavailable.selectionIssue).toBeTruthy()`（`:94`）；`expect(unavailable.selectionIssue).toContain('workspace.json')`（`:95`）；`expect(unavailable.selection.targets).toEqual([])`（`:96`）；其余 50 套无 issue（`:98`）且 50 套有目标（`:99`）。
- 用例 5：`expect(plan.schemaVersion).toBe(2)`（`:133`）；`expect(plan.mapping.length).toBe(plan.rules.length)`（`:135`）；`expect(plan.fingerprint).toHaveLength(64)`（`:136`）；`expect([...new Set(plan.mapping.map(item => item.subjectId))].sort()).toEqual(['student-id', 'student-name'])`（`:139-140`）；`expect(plan.mapping.some(item => item.applicability === 'not-applicable')).toBeFalse()`（`:142`）；`expect(verifyD2InstalledPlan(aggregate)).toEqual([])`（`:143`）。
- 用例 6：`expect(result).toMatchObject({caseId, templateId:'g01-student-identity-correction', templateVersion: entry.templateVersion})`（`:168-170`）；`expect(result.checks).toBeGreaterThan(0)`（`:171`）；`expect(result.fingerprint).toHaveLength(64)`（`:172`）；`expect(aggregate.caseV2.templateId).toBe('g01-student-identity-correction')`（`:175`）；`expect(verifyD2InstalledPlan(aggregate)).toEqual([])`（`:176`）。
- 用例 7：`expect(message).toContain('LOCAL_D4_TEMPLATE_ALREADY_BOUND')`（`:203`）；`expect(message).toContain('请新建一个未绑定模板的案卷')`（`:204`）；`expect(message).not.toContain('失去受控候选资格')`（`:205`）；`expect(aggregate.caseV2.templateId).toBe('comprehensive-assessment-v2')`（`:208`）；`expect(aggregate.d2RuntimePlan).toBeUndefined()`（`:209`）。

## 4. 未覆盖与脆弱点

未覆盖（静态检索本文件与相邻测试）：

- 没有 sender 拒绝用例：`event` 是伪造的受信任主框架（`:32-34`），`assertC0ReviewMainSender` 的失败分支未被触发。
- 没有“IPC 传入被篡改 selection”的用例：用例 6/7 都使用测试自己从 fixture 读出的 `two` 分支；实现只用 `compileD2RuntimePlan` 做结构校验，不比对冻结 fixture（`review-v3-main-d4-local-plan.ts:100-123`）。
- 没有非原生案卷、已有 `d2RuntimePlan`/`canonicalPlan`、已有主体/规则、模板已发布/占用、非 G01-I 使用学籍快照、原件字节篡改、候选目录 entry 缺失等拒绝分支。
- 没有 `LOCAL_D4_LIST_V3` 的 50 套逐套 attach；该覆盖在 `review-v3-d4-catalog-attach.test.ts`（不在本批）。
- 没有并发 attach、写盘失败、`ipcMain.handle` 重复注册。

脆弱点：

- 依赖仓库内冻结 fixtures 的精确内容（`g01iEntry`、`two` 分支、`controlled-registry.json`、`selections.json`）；fixture 改名/改值会使用例 2/5 失败。
- 用例 1/6/7 依赖 `handlers.clear()` 的全局注册表与执行顺序；若 Bun 改变并发执行或 hooks 实现，可能互相干扰。
- 用例 4 的错误文本含 `workspace.json`，依赖 Node `readFileSync` 的 ENOENT 消息；换运行时可能改变。
- 临时目录清理在 `afterAll`（`:21`），若用例中途崩溃会留下临时目录；不影响断言。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个用例，4 个目录/选择 + 3 个安装 | 已证实 | `grep test(` 计数；`:42-101,103-210` |
| 用例 1 断言 50 套与域计数 | 已证实 | `:48-58` |
| 用例 2 断言 G01-I 的两个学籍目标 | 已证实 | `:69-76` |
| 用例 3 断言缺件抛错 | 已证实 | `:82` |
| 用例 4 断言单套降级不影响其余 | 已证实 | `:92-99` |
| 用例 5 直接走 `attachD2RuntimePlan`，不经过 IPC | 已证实 | `:125-129` |
| 用例 6/7 走真实 handler | 已证实 | `:164-166,196-199` |
| 用例 7 断言拒绝零写入 | 已证实 | `:207-209` |
| sender 失败分支未覆盖 | 已证实（本文件检索） | 全文无“非主窗口/非主框架”构造 |
| 并发/崩溃恢复未覆盖 | 已证实（本文件检索） | 全文无并发/故障注入 |
| 测试依赖固定 fixture 内容 | 已证实 | `:36-40,117-120,152-153` |
| 测试在真实 Electron 窗口运行 | 未知/否 | 使用 fake hooks 与 `setMainWindow`（`:29-34,45`）；未启动窗口 |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 50 套列表、无 issue、域计数 | 1 | 43-61 | covered |
| G01-I 冻结 `two` 选择 | 2 | 63-77 | covered |
| 缺 `selections.json` | 3 | 79-83 | covered |
| 单套损坏降级 | 4 | 85-100 | covered |
| 直接 attach + 安装校验 | 5 | 114-145 | covered |
| 真实 IPC attach + 模板绑定 | 6 | 147-178 | covered |
| 已绑定模板拒绝 + 零写入 | 7 | 180-210 | covered |
| sender 拒绝 | 无 | — | unknown |
| 非原生/已有计划/已有主体拒绝 | 无 | — | unknown |
| 模板已发布/占用拒绝 | 无 | — | unknown |
| 学籍快照作用域拒绝 | 无 | — | unknown |
| 原件字节篡改拒绝 | 无 | — | unknown |
| 50 套逐套 attach | 另文件 | `review-v3-d4-catalog-attach.test.ts:30-80` | 间接 |
