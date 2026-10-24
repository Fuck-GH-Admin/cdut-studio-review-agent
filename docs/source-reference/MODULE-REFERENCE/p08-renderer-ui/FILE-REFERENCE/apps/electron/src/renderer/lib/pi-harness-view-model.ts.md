---
path: apps/electron/src/renderer/lib/pi-harness-view-model.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: be1aaf2f03c348c442a5b6baead4e8497506df05
sha256: 93a07a074946b7160aaa25ad725953c3ac47c4bbb03e3474e2761c4525c00dce
lines: 57
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/pi-harness-view-model.ts

## 1. 结论与边界

把主进程净化后的 Pi Harness 快照（`PiHarnessSnapshotView`）投影成只读的小型 UI 信号（徽标/标签文案），供任务图节点与详情面板渲染（`apps/electron/src/renderer/lib/pi-harness-view-model.ts:26` 注释自述：read-only graph UI signals）。纯函数、无副作用。

边界：不做调度/不发命令（`canManuallyContinue` 只是「UI hint」，`:10-11`）；不拉取快照（拉取在 `ProjectGraphPanel.tsx:110-126` 的 `usePiHarnessData`）；不产生权威状态（快照由主进程 `apps/electron/src/main/lib/pi-harness/snapshot-view.ts:33` 投影）；不含样式。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiHarnessTaskPresentation` | 接口 | 3-12 | `{ badge?; executionLabel?; assuranceLabel?; pauseReason?; lastFactSummary?; shadowCandidateLabel?; canManuallyContinue? }` | badge.tone ∈ emerald/amber/red/muted/blue |
| `presentPiHarnessTask` | 函数 | 27-57 | `(taskId: string, snapshot?: PiHarnessSnapshotView \| null) => PiHarnessTaskPresentation` | 投影入口 |

导出计数：2（接口 1 + 函数 1）。内部：`executionLabel`（`:14-24`，未导出）：7 个执行态→文案（starting=准备执行、running=正在执行、compacting=正在压缩上下文、retrying=正在重试、settled=本轮已结束、interrupted=已暂停、failed=本轮失败）；`base` 组装（`:34-44`）。

## 3. 内部逻辑与关键流程

按 `apps/electron/src/renderer/lib/pi-harness-view-model.ts:27-57` 执行顺序：
1. `:31-32` `task = snapshot?.tasks[taskId]`；缺失（或 snapshot 为 null/undefined）→ 返回 `{}`。
2. `:34-44` 组装 `base`（条件展开）：有 `execution` 才有 `executionLabel`（`:35`）；有 `assurance` 才有 `assuranceLabel=assurance.reason`（`:36`）；有 `lastFactSummary` 才透传（`:37`）；有 `shadowCandidate` 才有 `shadowCandidateLabel`（`:38-43`）：`action==='required_verification'` → `后续验证候选（shadow，未执行）：…`，否则 `后续任务候选（shadow，未执行）：…`（`:39-41`）；`shadowCandidate.canManuallyContinue` 为真才置 `canManuallyContinue: true`（`:42`）。
3. `:46-48` **最高优先**：`snapshot.goal.state === 'paused' && snapshot.goal.activeTaskId === taskId` → badge `{label:'已暂停', tone:'muted'}` + `pauseReason = snapshot.goal.pauseReason ?? '任务链已暂停'`（早退，不再看 assurance/execution）。
4. `:49-52` assurance 四分叉（早退）：verified→已验证/emerald、pending→待验证/amber、failed→验证失败/red、waived→已接受风险/muted。
5. `:53-55` execution 三分叉（早退）：running/compacting/retrying→执行中/压缩中/重试中，tone=blue。
6. `:56` 其余（settled/interrupted/starting/failed、assurance=not_required/无）→ 无 badge，仅 base。

注意：`interrupted`（执行态，`packages/shared/src/types/pi-harness.ts:9`）只映射文案「已暂停」（`:21`），不产生 badge；badge 级「已暂停」仅来自 goal 级 paused（`:47`）——两者层级不同，不是同一状态。

## 4. 调用者与调用链

入向：
- `apps/electron/src/renderer/components/agent/ProjectGraphPanel.tsx:37` 导入；`:686`（节点卡 `NodeCard` 的 harness 属性）与 `:722`（`DetailPanel`，选中节点）调用 `presentPiHarnessTask(node.id, piHarness)`。
- 渲染消费：`ProjectGraphPanel.tsx:198-206`（badge.label/tone→样式类）、`:325-329`（executionLabel/assuranceLabel/pauseReason/lastFactSummary/shadowCandidateLabel 文案）、`:252-256`（`canManuallyContinue` 为真才允许点「继续」→ `onContinueCandidate`）。
- 直接测试 `apps/electron/src/renderer/lib/pi-harness-view-model.test.ts`（§9）。

出向：仅类型 `PiHarnessSnapshotView`/`PiHarnessTaskView`（`apps/electron/src/renderer/lib/pi-harness-view-model.ts:1`）：定义 `packages/shared/src/types/pi-harness.ts:38-48`（任务视图）、`:50-58`（快照视图）、`:8-10`（assurance/execution/goal 状态枚举）、`:24-30`（shadowCandidate，`canManuallyContinue` 注释：仅未消费的 ready_task/shadow_mode 候选为真）。无运行时调用。

## 5. 数据 I/O、读写与副作用

不适用（数据部分），依据：本文件无磁盘/网络/缓存/状态写入，纯入参→出参（`:27-57` 全为无副作用表达式）。快照数据来源是主进程 IPC 投影（`ProjectGraphPanel.tsx:126` `getPiHarnessSnapshot`），本文件只读内存对象。

## 6. 分支、失败、取消与恢复

- 早退链（`:32,47,49-56`）：任务缺失→`{}`；goal paused（对当前 taskId）→暂停徽标；assurance 四态→四徽标；execution 三态→蓝徽标；否则无徽标。
- `pauseReason` 兜底 `?? '任务链已暂停'`（`:47`）。
- 无 throw/无异步/无取消恢复——不适用，依据：纯函数无 I/O；「取消/恢复」语义（暂停/继续）在上游 goal 与 `ProjectGraphPanel.tsx:252-256` 的继续动作里，本文件只显示。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态全部上游：执行/验证/暂停/候选的权威在主进程投影（`packages/shared/src/types/pi-harness.ts:1-6` 明确 main process owns the projection；投影实现 `apps/electron/src/main/lib/pi-harness/snapshot-view.ts:33`）；`canManuallyContinue` 是主进程给的 UI 提示（`pi-harness-view-model.ts:10-11`、`pi-harness.ts:28`），**本文件不校验 ready_task/shadow_mode/blockedReason**——测试名提到的 ready_task/shadow_mode 约束属于投影层语义（`snapshot-view.test.ts:48-53` 间接印证），不得读作本文件的守卫。

## 8. 修改影响面

- 改徽标优先级/文案 → `ProjectGraphPanel.tsx:198-206,325-329` 的 UI 直接变化；徽标 tone 枚举若增删，`:201-205` 的样式分支需同步。
- 改 `canManuallyContinue` 置位条件 → `ProjectGraphPanel.tsx:252-256` 的「继续候选」按钮门禁变化（放宽会允许 UI 发出主进程会拒绝的请求——主进程重校验，`pi-harness.ts:32`）。
- 改 `PiHarnessTaskPresentation` 字段 → 两处消费点（:218/:322-330）与 `NodeCard`/`DetailPanel` props 类型连锁。
- 需同步修改的测试：`apps/electron/src/renderer/lib/pi-harness-view-model.test.ts`（badge/label 快照断言）。

## 9. 测试证据

直接测试 `apps/electron/src/renderer/lib/pi-harness-view-model.test.ts`（`test.each` 4 行 + 3 个 `test(`，共 7 个运行时用例；静态阅读、NOT_RUN）：
- assurance 四态→badge 映射（`:14-21`，断言 `:20` `toEqual({label,tone})`）。
- goal paused 优先于 assurance pending（`:23-29`，断言 `:28` `toMatchObject({badge:{label:'已暂停'}, pauseReason:'user_stop'})`）。
- 候选只读性：required_verification 只出文案且 `canManuallyContinue` 为 undefined（`:38-39`）；ready_task+canManuallyContinue:true 透传 true（`:40`）。
- snapshot 为 null → `{}`（`:43-45`）。

未覆盖（详见测试篇 §4）：`executionLabel` 7 态文案、execution 三态蓝徽标（`:53-55`）、`lastFactSummary` 透传、assurance=`not_required`、任务缺失→`{}`、goal 其它态。NOT_RUN：本轮未执行 bun test/typecheck；断言为静态阅读所得，不代表通过。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 内部 `executionLabel` 7 态映射 | 已证实 | `apps/electron/src/renderer/lib/pi-harness-view-model.ts:3,14-24,27` |
| 徽标优先级：paused>assurance×4>execution×3 | 已证实 | `pi-harness-view-model.ts:46-56` |
| 消费点与 canManuallyContinue 门禁 | 已证实 | `ProjectGraphPanel.tsx:37,686,722,252-256` |
| `canManuallyContinue` 语义由主进程投影产生 | 已证实 | `packages/shared/src/types/pi-harness.ts:28-29`、`pi-harness-view-model.ts:10-11` |
| 测试覆盖 7 用例的断言内容 | 已证实 | `pi-harness-view-model.test.ts:14-45` 逐行读 |
| 断言在真实运行下全绿 | 未知 | NOT_RUN（本轮未执行） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PiHarnessTaskPresentation` | §2、§8 | 3-12 | covered |
| `presentPiHarnessTask` 主流程 | §3 | 27-57 | covered |
| `executionLabel` 7 态 | §2 | 14-24 | covered（手册）/unknown（无测试） |
| paused 早退 | §3、§6 | 46-48 | covered |
| assurance 四分叉 | §3、§6 | 49-52 | covered |
| execution 三分叉 | §3、§6 | 53-55 | covered（手册）/unknown（无测试） |
| shadowCandidate 双文案+canManuallyContinue | §3、§7 | 38-43 | covered |
| lastFactSummary 透传 | §3 | 37 | covered（手册）/unknown（无测试） |
