---
path: apps/electron/src/main/lib/review/case-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9154545cbc564c54c7274963f79f71665c8e6ece
sha256: 9f1429abcda9856e21a435a912473e6564725ae14b9195ca2c44609a79039111
lines: 414
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/case-store.ts

## 1. 结论与边界

V1 兼容案卷的本地 JSON 持久化层：读写 `{getConfigDir()}/review-cases/{caseId}/case.json`（案卷本体）与 `runs/{runId}.json`（审核运行记录），提供 ID 白名单校验、原子写、损坏容忍读取、逐案串行写队列 + 修订号（revision）定向更新、审核输入指纹、演示案卷载入；同时对**原生 V2 案卷**设置旧入口护栏：V1 三栏只读投影、旧写入口拒绝、旧删除入口拒绝（`case-store.ts:206-221, 357-374`）。

边界（不做什么）：
- 不写 V2 聚合 `state.v2.json`。本文件对 V2 聚合**只读**（唯一 V2 依赖是 `readAggregate`，`case-store.ts:18`）；V2 业务写事务在 `case-store-v2.ts` + `review-v3-case-disk-tx.ts`。
- 不做 IPC/sender/actor/role 校验（全文件无任何权限入参，见 §7）。
- 不含审核业务规则：指纹算法只做内容哈希（`case-store.ts:313-354`），不判定对错。

## 2. 导出与关键符号

导出 13 项（1 常量 + 1 类 + 11 函数），与源码 `export` 逐条一致：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEMO_CASE_ID` | const | 22 | `'demo-zhangsan-2026'` | 演示案卷固定 ID |
| `assertSafeId` | fn | 32 | `(id: string) => void` | ID 白名单，非法即 throw |
| `getReviewCasesDir` | fn | 39 | `() => string` | 案卷根目录，缺则 mkdir |
| `listCases` | fn | 125 | `() => ReviewCaseSummary[]` | 摘要列表（含原生 V2 投影） |
| `getCase` | fn | 182 | `(caseId) => ReviewCase \| undefined` | 读单案（V1 文件或 V2 投影） |
| `saveCase` | fn | 224 | `(reviewCase) => void` | 原子写 case.json（旧写入口） |
| `CaseRevisionConflictError` | class | 257 | `(caseId, expectedRevision, currentRevision)` | 修订冲突错误 |
| `updateCase` | fn | 278 | `(caseId, patch, options?) => Promise<ReviewCase>` | 队列内读改写 + revision+1 |
| `computeCaseInputHash` | fn | 313 | `(reviewCase) => string` | 审核输入指纹（sha1） |
| `deleteCase` | fn | 357 | `(caseId) => void` | 删整目录（V2 案卷拒绝） |
| `saveRun` | fn | 377 | `(caseId, run) => void` | 原子写 runs/{runId}.json |
| `listRuns` | fn | 389 | `(caseId) => ReviewRun[]` | 列运行记录（字典序） |
| `loadDemoCase` | fn | 406 | `() => ReviewCase` | 载入/复制演示案卷 |

关键内部符号（均未导出）：`SAFE_ID_RE`（:25，`/^[a-zA-Z0-9_-]+$/`）、`getCaseDir`（:46）、`getCaseFilePath`（:52）、`getRunsDirReadOnly`（:57）、`ensureRunsDir`（:62）、`writeJsonAtomic`（:73）、`readJsonFile`（:80）、`listRunFileNames`（:91）、`readLastRunStatus`（:110）、`isLegacyProjectionAllowed`（:206）、`assertWritableLegacyProjection`（:217）、`caseWriteQueues`（:239，`Map<string, Promise>`）、`enqueueCaseWrite`（:245）。

## 3. 内部逻辑与关键流程

按真实执行顺序：

1. **路径与 ID 守卫**：所有路径拼接前先过 `assertSafeId`（`case-store.ts:32-36`，非字符串/空/含 `SAFE_ID_RE` 外字符 → throw 中文错误 `无效的 ID: …`）。`getCaseDir`（:46-49）内联该断言；`getReviewCasesDir`（:39-43）对 `review-cases/` 目录 `mkdirSync(recursive)`。
2. **原子写** `writeJsonAtomic`（:73-77）：写 `${filePath}.tmp` 后 `renameSync` 覆盖目标；无 fsync（对比 `review-v3-case-disk-tx.ts:127-147` 的 fsync+目录 sync）。
3. **读取** `readJsonFile`（:80-88）：文件缺失 → `undefined`；JSON 解析失败 → `console.warn` 后 `undefined`（不抛）。
4. **运行记录**：`listRunFileNames`（:91-102）列 `runs/` 下 `.json` 并字典序排序；`readLastRunStatus`（:110-118）从尾部逆序找第一个 `status` 为字符串的记录，即「最近一次运行状态」。
5. **`listCases`**（:125-179）：遍历 `review-cases/` 条目；跳过 `.tmp`（:138）；`isLegacyProjectionAllowed(name)` 为真 → 读 `case.json`（:144-147），否则读 `readAggregate(name)` 并投影 `nativeWorkspaceProjectionV3`（:148-151）；两分支整体包在 `try{...}catch{continue}`（:143-152），非法目录名（`assertSafeId` 抛错）也被静默跳过。`reviewCase.id !== name` 者丢弃（:153）。材料数：原生案卷数聚合中 `active !== false` 的文档（:157-158），V1 案卷数 `documents?.length`（:159，ASSET-06 注释 :155-156 说明三栏投影隐藏 attachment 角色）。结果按 `updatedAt` 倒序（:177）。
6. **`getCase`**（:182-199）：先 `assertSafeId`；非旧投影许可 → 返回 `nativeWorkspaceProjectionV3(readAggregate(caseId))` 且要求 `projected?.id === caseId`（:186-189）；否则读 `case.json`，损坏时 `console.warn` 返回 `undefined`（:193-197）。
7. **旧投影许可** `isLegacyProjectionAllowed`（:206-215）：无 `state.v2.json` → `true`（纯 V1）；否则 `readAggregate`，`!state || !state.caseV2 || !Array.isArray(state.receiptLog)` → `false`（fail-closed，:211）；许可条件 = `stage !== 'archived' && receiptLog.some(r => r?.type === 'EnsureReviewWorkspaceAggregate')`（:213-214）。`assertWritableLegacyProjection`（:217-221）不许可即 throw `原生审核案卷禁止通过旧版案卷写入口修改…`。
8. **`saveCase`**（:224-234）：先过写屏障（:225），`mkdirSync` 案卷目录后 `writeJsonAtomic`；失败 `console.error` 并抛**新** `Error('保存案卷失败: …')`（:230-233，原错误只进日志）。
9. **写队列 + 修订号**：`caseWriteQueues`（:239）按 caseId 独立；`enqueueCaseWrite`（:245-254）用 `previous.then(task, task)` 保证前任务成败都继续，队尾存 `next.catch(()=>undefined)` 吞错防链断裂，返回的 `next` 对调用方保留错误。`updateCase`（:278-304）在队列内：写屏障（:286）→ `getCase` 读最新（:287）→ 无案卷 throw `案卷不存在`（:288）→ `expectedRevision` 不符抛 `CaseRevisionConflictError`（:290-292）→ `patch(latest)` 返回 `null` 则不动 revision 不写盘直接返回旧值（:293-294）→ 否则 `{...patched, revision: current+1, updatedAt: now}`（:295-299）→ `saveCase`（:300）→ 可选 `console.log` reason（:301）。CAS 判定式为 `options.expectedRevision !== undefined && options.expectedRevision !== currentRevision`（:289-292）：**缺省（undefined）完全跳过 CAS 校验、任何当前 revision 均接受**（`currentRevision = latest.revision ?? 0` 仅用于 +1 与冲突报数）。注意源码注释 :273-274 称「expectedRevision 缺省视为 0：仅当盘上 revision 也是 0/缺省时接受」，与实现（缺省不校验）矛盾——照实记录，以实现为准；已带 revision 的调用方传错值才触发 `CaseRevisionConflictError`。
10. **`computeCaseInputHash`**（:313-354）：对领域包/模板/手写规则/主体文档集/规则包（含大纲）/文档（含块文本、解析状态）/事项/证明识别结果构造固定键序 `fingerprint`，`createHash('sha1')` 十六进制（:353）；刻意排除 `updatedAt/createdAt/revision` 等元数据（注释 :311）。
11. **`deleteCase`**（:357-374）：目录不存在静默返回（:359）；存在 `state.v2.json` 即 throw `已有 V2 业务案卷禁止通过旧版删除入口清除…`（:364-366，注释 :360-363 说明 V1 删除会连带删掉权威 V2 聚合/回执/留证）；否则 `rmSync(recursive, force)`，失败 `console.error` + throw。
12. **运行读写**：`saveRun`（:377-386）`assertSafeId(run.id)` 后原子写 `runs/{run.id}.json`；`listRuns`（:389-398）按文件名字典序读全部记录，缺 `id` 者 warn 跳过。
13. **`loadDemoCase`**（:406-414）：`getCase(DEMO_CASE_ID)` 已存在直接返回；否则 `buildDemoCase()` + `saveCase` 首次落盘并 `console.log`。

## 4. 调用者与调用链

入向（生产，均经 `apps/electron/src/main/lib/review` 内模块静态 import，grep 全树）：
- `review-ipc.ts:38-47` 导入 `deleteCase/getCase/getReviewCasesDir/listCases/listRuns/loadDemoCase/saveCase/updateCase`；调用点：`LOAD_DEMO_CASE`（:123-124 → `loadDemoCase`）、`LIST_RUNS`（:134-136 → `listRuns`）、`UPDATE_CASE_SETTINGS`（:279 → `updateCase`）、`UPDATE_RULE_OUTLINE`（:312）、`UPDATE_REVIEW_ITEM`（:344）、`DELETE_CASE`（:1375 → `deleteCase`）。
- `run-service.ts:14` 导入 `assertSafeId/computeCaseInputHash/getCase/listRuns/saveRun`；`saveRun` 落盘点 :86/:109/:124，`listRuns` :139/:149，指纹 :43/:158。
- `case-import.ts:14`（`getCase/saveCase/updateCase/assertSafeId/getReviewCasesDir`，`updateCase` :265/:314/:365/:400）；`ai-review-service.ts:44`（`updateCase` :415/:557、`listRuns` :974/:1009）；`workspace-service-v2.ts:7`（`updateCase` :241）；`report-service.ts:16-17`（`assertSafeId/computeCaseInputHash`，:80）；`report-data.ts:9`（`getCase/listRuns`，:18）；`review-v3-t07-main-service.ts:14`（`getCase`）；`review-pi-run-bridge.ts:21`（`getCase`）；`case-creation.ts:9`（`saveCase`）。

出向（本文件调用谁）：`../config-paths` 的 `getConfigDir`（:16；实现 `config-paths.ts:80-90`，`resolveConfigDir` :57-59 读 `PROFER_CONFIG_DIR` 环境变量并 `resolve`，缺省 `~/.cdutai*`，目录不存在则 mkdir）；`./demo-fixtures/demo-case-fixture` 的 `buildDemoCase`（:17；`demo-case-fixture.ts:127` 定义、:456 `id: 'demo-zhangsan-2026'`）；`./case-store-v2` 的 `readAggregate`（:18；`case-store-v2.ts:51-73`，主账损坏时回退 `.previous.json`）；`./native-workspace-case-v3` 的 `nativeWorkspaceProjectionV3`（:19；`native-workspace-case-v3.ts:90` 起，:105-106 过滤 `role !== 'attachment'`）；`node:crypto createHash`、`node:fs`、`node:path join`（:12-14）。

## 5. 数据 I/O、读写与副作用

- 输入形状：`ReviewCase`/`ReviewRun`（`@profer/shared` 类型，:15）；输出 `ReviewCaseSummary[]`、`ReviewRun[]`、指纹 hex。
- 磁盘读写：`{review-cases}/{caseId}/case.json`、`{review-cases}/{caseId}/runs/{runId}.json`；写为 `JSON.stringify(data, null, 2)`（:75）→ `.tmp` → rename（:73-77）。**无 fsync**：rename 保证不出现写一半的 JSON（注释 :70-71），但断电耐久性未保证——与 V2 落盘 `writeC2CaseStateDurably`（`review-v3-case-disk-tx.ts:118-152`，fsync 文件 + 非 win32 目录 sync）不同档。
- 幂等/并发：同案写经 `enqueueCaseWrite` 严格串行（:245-254），消除「A/B 同时读 v0 后写丢字段」（注释 :238）；`loadDemoCase` 二次调用不重写（:407-408）；`deleteCase` 对不存在目录幂等（:359）。
- 副作用：mkdir（:41/:64/:227）、`console.log`（:301/:369/:412）、`console.warn`（:85/:99/:131/:195/:395）、`console.error`（:231/:371/:383）；无网络、无遥测、无窗口操作。

## 6. 分支、失败、取消与恢复

- `assertSafeId` 失败即 throw（:33-35），错误文案 `无效的 ID: …（仅允许字母、数字、连字符与下划线）`。
- `readJsonFile`/`listRunFileNames`/`listCases` 的坏文件：warn 后跳过，不让单个坏文件拖垮列表（:123、:395）。
- `saveCase`/`saveRun`/`deleteCase` 失败：`console.error` 后抛新的中文 `Error`（:232/:372/:384），调用侧（IPC handler）转为用户可见失败。
- `updateCase`：案卷不存在 throw（:288）；修订冲突抛 `CaseRevisionConflictError`（:291），带 `caseId/expectedRevision/currentRevision` 公开字段（:258-261），渲染层据此提示「案卷已更新，请刷新后重试」（注释 :256）。
- 中断残留：`.tmp` 残片可能留下（:71 注释）；`listCases` 跳过 `.tmp`（:138），`case-store.test.ts:100-101` 断言正常完成后无 `.tmp`。无自动清理/恢复机制（本文件不提供）。
- 无取消概念（全部同步函数 + 一个 Promise 队列，无 AbortSignal/超时）。

## 7. 权限与权威状态

- 本文件**无权限分支**：依据为全文件无 sender/actor/role/IPC event 形参或校验调用（grep `sender|actor|role|event` 仅命中注释）。调用侧守卫由各 IPC handler 自行负责，且不齐一：`DELETE_CASE` 入口先 `assertC0ReviewMainSender`（`review-ipc.ts:1343`），而 `LIST_CASES`（:130）与 `GET_CASE`（:140）的 handler 未做 sender 校验——本文件无法判断调用者身份，该差异属 handler 层事实。
- 权威状态规则（数据权威而非身份权威）：原生 V2 聚合是案卷业务权威。`isLegacyProjectionAllowed`（:206-215）判定「V1 兼容投影/写入」是否仍被允许：纯 V1 目录允许；有 `state.v2.json` 时要求聚合形状完好、未归档、且回执账含 `EnsureReviewWorkspaceAggregate`（迁移过的兼容案卷）；V1 三栏对原生案卷只是**只读投影**（注释 :139-140、:184-185）。旧写（:225/:286）与旧删（:364-366）对原生案卷 fail-closed。

## 8. 修改影响面

- 改本文件会影响：`review-ipc.ts` 的 LOAD_DEMO_CASE/LIST_CASES/GET_CASE/UPDATE_CASE_SETTINGS/UPDATE_RULE_OUTLINE/UPDATE_REVIEW_ITEM/DELETE_CASE 等通道返回；`run-service.ts`/`ai-review-service.ts`（运行记录读写、指纹）；`case-import.ts`/`workspace-service-v2.ts`/`case-creation.ts`（案卷读写）；`report-service.ts`/`report-data.ts`（报告数据源）。
- 存储布局变更（路径/文件名/JSON 形状）需同步：`native-workspace-case-v3.ts` 投影、`case-store-v2.ts` 聚合路径（`state.v2.json` 共目录）、`review-v3-case-disk-tx.ts` 锁目录（`.state.v2.tx.lock` 同目录）。
- 指纹字段增删会改变 `computeCaseInputHash` 输出 → `run.inputHash` 与新指纹失配（`run-service.ts:158`、`report-service.ts:80` 会报「输入已变化」），属预期行为变更，需同步测试 `case-store.test.ts:208-237`。
- 需同步修改的测试：`case-store.test.ts`（直接）；`case-lifecycle-v3.test.ts`、`review-v3-legacy-entry-gates.test.ts`、`native-workspace-case-v3.test.ts`（护栏/投影，间接）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/review/case-store.test.ts`（16 用例 / 5 describe；隔离 `PROFER_CONFIG_DIR=work/tmp/profer-test-case-store-{Date.now()}`，:40-41，`afterAll` rmSync :43-46；fixture 为 `buildDemoCase()` 改 id 的 `case-test-001`，:52-54）。本轮 **NOT_RUN**（未执行 bun test/typecheck/build/GUI）。

逐用例真实断言（行号为测试文件内）：
1. `:57-62` 合法 id 不抛（`case-ok_1`/`demo-zhangsan-2026`/`A1_b2-c3`）。
2. `:64-71` `../evil`、`a/b`、`''`、`..` 抛 `'无效的 ID'`；`x y`、`x.y` 抛出（任意错误）。
3. `:75-86` save→get 往返 `toEqual` 深相等、`items` 6 条、`documents` 6 条。
4. `:88-102` `case.json` 存在且可解析、目录内无 `.tmp` 残片（原子写）。
5. `:104-116` `listCases` 含该案卷：title=`综测加分审核演示案卷（模拟）· 张三（模拟）`、`documentCount` 6、`applicant`=`张三（模拟）`、`lastRunStatus` `undefined`。
6. `:118-126` delete 后 `getCase` undefined、目录消失。
7. `:128-130` 删不存在 id 不抛（幂等）。
8. `:134-156` `loadDemoCase` 两次：同 id、`updatedAt` 相同、case.json mtime 相同、目录条目相同、无 `.tmp`（不重复写入）。
9. `:158-164` `isDemo=true` 的摘要仅 demo 一条。
10. `:170-176` `updateCase` 后 `revision===1`、字段落盘。
11. `:178-190` 过期 `expectedRevision` 抛 `CaseRevisionConflictError` 实例，`currentRevision` 为前值+1。
12. `:192-205` 两个并发 `updateCase`：两 patch 均保留、`revision===2` 且等于后到者的 `revision`（串行队列）。
13. `:209-217` 同数量但 `activityDate` 改动 → 指纹不同。
14. `:219-222` 同内容 → 指纹稳定相等。
15. `:224-231` `reviewTemplate`/`manualRules` 变化 → 指纹不同。
16. `:233-237` 仅 `updatedAt/revision` 变化 → 指纹不变。

间接证据（其他测试经由本文件）：`case-lifecycle-v3.test.ts:46`（V2 案卷 `deleteCase` 抛「禁止通过旧版删除入口」）；`review-v3-legacy-entry-gates.test.ts:210/:234`（原生/迁移案卷 `updateCase` 被拒）、`:264/:273`（`deleteCase` 被拒）；`native-workspace-case-v3.test.ts:9`（`listCases/getCase` 原生投影）；`review-v3-case-storage-durability.test.ts:15`（`getReviewCasesDir/listCases`）；`workspace-service-v2.test.ts:6`、`migration.test.ts:9`、`review-multi-rule.test.ts:14`、`case-store-v2.test.ts`（经 `readAggregate` 互依）。

未覆盖（测试缺口）：`readJsonFile` 损坏 JSON 的 warn 分支、`readLastRunStatus` 的逆序回退、`saveCase/saveRun` 失败抛错分支、`enqueueCaseWrite` 队尾吞错语义、`.tmp` 残片中断场景、`expectedRevision` 缺省跳过 CAS 的行为（:289 实现）无直接用例（测试 :178-190 只覆盖显式过期值冲突）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 个导出符号与行号如 §2 | 已证实 | `case-store.ts:22-406` 逐条 `export` |
| 原子写 = tmp+rename、无 fsync | 已证实 | `case-store.ts:73-77`；对比 `review-v3-case-disk-tx.ts:127-147` |
| 原生 V2 案卷禁止旧写/旧删，只读投影 | 已证实 | `case-store.ts:206-221, 357-366`；`native-workspace-case-v3.ts:90-106` |
| 同案写串行、修订 +1、冲突带当前版 | 已证实 | `case-store.ts:239-254, 278-304`；`case-store.test.ts:170-205` |
| 指纹排除元数据、含块文本 | 已证实 | `case-store.ts:313-354`；`case-store.test.ts:208-237` |
| 调用者清单如 §4 | 已证实 | 各 import 行 + 调用点 grep 定位 |
| 「最近运行」按文件名字典序==时间序 | 已证实（生成侧） | `run-service.ts:31-34` `run-${Date.now()}-${rand}` 定长时间戳；`case-store.ts:104-110` 消费侧注释 |
| `isLegacyProjectionAllowed` 判定读到的是主账**或回退副本** | 推断 | `case-store.ts:209` 调 `readAggregate`，后者损坏时回退 `.previous.json`（`case-store-v2.ts:56-71`）；无用例固定此组合 |
| `saveCase` 抛错丢失原始 error 对象（仅日志保留） | 已证实 | `case-store.ts:228-233` |
| 存量历史 run 文件名是否全部符合 `run-*` 约定 | 未知 | 只读冻结树静态代码，未检查用户真实数据目录 |
| `.tmp` 残片清理策略 | 未知 | 全文件无清理调用；仅列表跳过（:138） |

实现层面记录（照实，不改码）：
- 两套 ID 语法并存：V1 用 `SAFE_ID_RE`（不允许 `.`，`case-store.ts:25`），V2 用 `assertSafeReviewStorageId`（允许 `.` 但禁 `..`，`review-storage-id.ts:6-15`）；同一目录树不同入口接受的字符集不同。
- `writeJsonAtomic`（V1）与 `writeC2CaseStateDurably`（V2）耐久性档位不同（无 fsync vs fsync+目录 sync）。

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DEMO_CASE_ID` | §2/§3.13 | 22 | covered |
| `assertSafeId` | §2/§3.1/§6 | 32-36 | covered |
| `getReviewCasesDir` | §2/§3.1/§5 | 39-43 | covered |
| `listCases`（两分支+排序） | §3.5 | 125-179 | covered |
| `getCase`（投影/文件两分支） | §3.6 | 182-199 | covered |
| `saveCase`（屏障+原子写+失败） | §3.8/§6 | 224-234 | covered |
| `CaseRevisionConflictError` | §2/§6 | 257-266 | covered |
| `updateCase`（队列/冲突/null patch） | §3.9 | 278-304 | covered |
| `computeCaseInputHash` | §3.10/§8 | 313-354 | covered |
| `deleteCase`（V2 拒绝分支） | §3.11/§7 | 357-374 | covered |
| `saveRun`/`listRuns` | §3.12 | 377-398 | covered |
| `loadDemoCase` | §3.13 | 406-414 | covered |
| `isLegacyProjectionAllowed`/`assertWritableLegacyProjection` | §3.7/§7 | 206-221 | covered |
| `writeJsonAtomic`/`readJsonFile`/`listRunFileNames`/`readLastRunStatus` | §3.2-3.4/§5 | 73-118 | covered |
| `enqueueCaseWrite`（吞错语义） | §3.9 | 245-254 | covered |
| `.tmp` 残片恢复策略 | §6 | — | unknown（无实现） |
