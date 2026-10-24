---
path: apps/electron/src/main/lib/review/run-async-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e36eedbcddcff59b5494edccb9860364176d173c
sha256: 34c1af2d18b44e428689e508440737095a718d9a4d937eb2323ac2c54d98a633
lines: 230
kind: source
package: p06-review-batch
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/run-async-service.ts

## 1. 结论与边界

V2 审核运行的**装配与异步管理**层：把「案卷聚合 + 模板 + 模型渠道 + OCR + 图像检查」装配成运行执行器，再交给 `runReviewCaseV2` 跑运行图；同时提供进程内去重、后台启动（先落 `queued` 再后台执行）、取消与按 `caseId+runId` 读取。运行时模块，有磁盘写入（运行 JSON）与网络副作用（模型、OCR）。

不做的事：不实现运行图节点/检查点（`run-service-v2.ts`）；不解析渠道（`review-model-gateway.ts`）；不做 Pi 会话审核（`review-pi-run-bridge.ts`）；不注册 IPC（`review-ipc.ts:1070-1092` 薄委托）；不做启动恢复（`run-store-v2.markStaleRunsInterrupted`，由 `review-ipc.ts:113-119` 在注册时调用）。

## 2. 导出与关键符号

导出 6 条：1 个 interface、5 个 function。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `StartRunAsyncResult` | interface | `run-async-service.ts:130-137` | `{caseId; runId; status:'queued'; startedAt; nextPollAfterMs}` | 异步启动立即返回的句柄 |
| `assembleAndRunReview` | function | `:102-120` | `(caseId, options?: {signal?: AbortSignal; initiatedBy?: Actor}) => Promise<ReviewRunV2>` | 同步执行全图；IPC 与 Agent 工具共用 |
| `findActiveRunForCase` | function | `:123-128` | `(caseId) => {runId} \| undefined` | 进程内去重查询 |
| `startReviewRunAsync` | function | `:144-212` | `(caseId, initiatedBy, source?, input?: {runId?}) => StartRunAsyncResult` | 预分配 runId、落 queued、后台跑 |
| `cancelAsyncRun` | function | `:215-225` | `(runId) => boolean` | 三处同时取消；返回是否活跃 |
| `getRunById` | function | `:228-230` | `(caseId, runId) => ReviewRunV2 \| undefined` | 直接读持久文件 |

内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `ActiveRun` | `:21-27` | 登记表项：`caseId/runId/promise/controller/startedAt` |
| `activeRuns` | `:30` | `Map<runId, ActiveRun>`，进程内，非持久 |
| `assembleReviewClient` | `:33-79` | 渠道 + 模型 + Pi client + 图像检查 + OCR 的唯一装配出口 |
| `assertCaseReadyForReview` | `:86-100` | 开审门禁（draft/archived/必填输入/必交槽） |

## 3. 内部逻辑与关键流程

### 3.1 装配 `assembleReviewClient`（`:33-79`）

1. 懒加载网关导出（`:34`），`resolveReviewGatewayChannel()`；失败抛"未配置可用模型渠道，无法执行真实审核（请在设置中配置渠道）"（`:36-37`）。
2. 取 `getEffectiveReviewModelSelection()`，用 `pickChannelModelId(resolved.channel, selection)` 解析本次模型（`:40-41`）；解析不到抛"审核渠道「x」没有已配置模型"（`:42`）。
3. **显式失效保护**（`:44-46`）：`explicit && selection && selection.channelId === resolved.channel.id && selection.modelId !== model` → 抛"审核所选模型已停用或被删除，请在审核设置中重新选择后再运行"。当前网关 `findFirstAllowedChannel` 已要求显式模型 `enabled !== false`（`review-model-gateway.ts:176`），所以该分支主要防"解析与选择读取之间设置被改"的竞态，正常路径不触发（推断）。
4. 构造 `PiAgentAdapter`（`:47`、`:50`），返回：
   - `client = createPiReviewModelClient({channel, apiKey, model, baseUrl, timeoutMs: REVIEW_RUN_TIMEOUT_MS, cwd: <configDir>/review-cases/<caseId>, piAgentDir: getSdkConfigDir(), query, abort})`（`:52-62`）——**文本 client 与 imageInspector 共用同一个 `model` 与渠道**，注释明确"解析一次后冻结"（`:39`）。注意：Pi client 把 `channel.provider` 直接传给 Pi SDK（`pi-review-agent-client.ts:138`），**不经过网关白名单**；只有 `imageInspector` 走 `review-model-gateway`（白名单在 `review-model-gateway.ts:309-312` 强制）。
   - `imageInspector`（`:63-76`）：`chatCompletionWithMeta` 发 `[system, user(prompt+dataUrl 图)]`，`timeoutMs=150s`、`signal`、`retryWithoutImages:false`、`maxTokens:1000`；返回 `{content, imagesDropped, channel:渠道名, model, protocol:'openai-chat', usage?}`。
   - `ocrPort = await SystemTesseractOcrPort.create()`（`:77`）——OCR 初始化失败会在运行开始前抛出。

### 3.2 开审门禁 `assertCaseReadyForReview`（`:86-100`）

`stage==='draft'` → "案卷尚未提交审核，不能开始审核运行"（`:93`）；`stage==='archived'` → "已归档案卷不能开始审核运行"（`:94`）；`collectMissingIntakeInputs(template, caseV2)` 与 `collectMissingSubmissionSlots(template, caseV2.documents)`（`:95-96`）任一非空 → 拼接"案卷尚未补齐必填输入，不能开始审核：…；材料槽 …"（`:97-99`）。该函数被同步与异步两条入口共用，注释说明"批量队列直接调用本模块，不能只靠 submitCaseV2 的单案按钮拦截"（`:82-85`）。

### 3.3 同步执行 `assembleAndRunReview`（`:102-120`）

1. 取聚合，缺失抛"案卷聚合不存在: id"（`:107-108`）；取模板，缺失抛"模板不存在: id@version"（`:109-110`）。
2. 门禁（`:111`）→ 装配 client/OCR/imageInspector（`:112`）→ `assembleV2Executors(aggregate, template, {client, ocrPort, imageInspector, signal})`（`:113`）。
3. `runReviewCaseV2(aggregate.caseV2, template, executors, {...})`（`:114-119`）：
   - `initiatedBy` 缺省 `{actorId:'local-user', actorSource:'local', role:'reviewer'}`（`:115`）；
   - `cancelled` 仅在传了 `signal` 时提供（`:116`）；
   - 传观察/证据快照（`:117-118`）。

### 3.4 异步启动 `startReviewRunAsync`（`:144-212`）

1. **去重**：`findActiveRunForCase(caseId)` 命中即抛"案卷已有进行中的审核运行（去重；可先查询状态或取消）"（`:150`）。
2. 聚合/模板/门禁/渠道四道检查（`:151-156`）——渠道不可用会在**分配 runId 之前**抛"未配置可用模型渠道…"。
3. `runId = input?.runId ?? 'run-' + Date.now() + '-' + random4`（`:158`）；`startedAt` ISO（`:159`）。
4. 构造 `queuedRun`（`:162-176`）：`status:'queued'`、空 checks/opinions/checkpoints、`coverage` 全零、`inputManifest.hash:''`（真实哈希要等 `runReviewCaseV2` 计算后覆盖，`run-service-v2.ts:157-181`）、观察/证据只存 ID、`initiatedBy` 落盘。
5. `saveRunV2(queuedRun)` 立即落盘（`:178`，tmp+rename，`run-store-v2.ts:24-30`）。
6. `void source`（`:177`）：`CommandSourceMeta` 参数被接收但**未使用/未落盘**，实际只有 `initiatedBy` 记录来源。
7. 创建 `AbortController`（`:180`），后台 IIFE（`:181-207`）：装配 → `assembleV2Executors(..., signal: controller.signal)` → `runReviewCaseV2`（带 `runId`、`initiatedBy`、快照、`cancelled: () => isRunCancelled(runId) || controller.signal.aborted`）。
8. 失败收尾（`:192-203`）：重新读运行；仅当仍为 `queued/running` 时写 `cancelled`（signal 中止或注册表已取消）或 `failed`，附 `error`、追加 `diagnostics`、`completedAt`；随后**重新抛出**。
9. `finally`（`:204-206`）：`setTimeout(() => activeRuns.delete(runId), 5_000).unref?.()`——运行结束后登记项**再保留 5 秒**。
10. 登记 `activeRuns.set(...)`（`:208`），`void promise.catch(() => {})` 防止未处理拒绝（`:209`）。
11. 返回 `{caseId, runId, status:'queued', startedAt, nextPollAfterMs: Math.min(150000, 15000)=15000}`（`:211`）。

### 3.5 取消 `cancelAsyncRun`（`:215-225`）

- 非活跃：仅 `cancelRunV2(runId)`（写入 `run-service-v2.ts:20-22` 的进程内 Set），返回 `false`（`:217-220`）。
- 活跃：`cancelRunV2(runId)` + `active.controller.abort()`，返回 `true`（`:222-224`）。持久状态由后台 promise 的 catch/运行图取消路径落盘，本函数不直接写文件。
- `cancelledRunIds` 是进程内 Set（`run-service-v2.ts:18-26`）：**正常收尾会删除**——`runReviewCaseV2` 在 `saveRunV2` 之后执行 `cancelledRunIds.delete(runId)`（`run-service-v2.ts:247-248`）。只有 `runReviewCaseV2` 在到达该行之前抛错（归档、续跑校验失败、执行图抛错等）才可能残留；残留只影响同进程内后续同 runId 的判断，不跨进程。

### 3.6 查询 `getRunById`（`:228-230`）

直接 `getRunV2(caseId, runId)`；`caseId` 作为目录组成部分，调用方需自行保证归属（Agent 工具在 `pi-review-ops-tools.ts:469` 调用时先校验指派绑定案卷）。

## 4. 调用者与调用链

入向（grep 全 `apps/electron/src`）：

| 调用者 | 位置 | 用途 |
| --- | --- | --- |
| `review-ipc.ts` `RUN_BATCH_V2` | `:1070-1086` | 批量队列对每个 case 调 `assembleAndRunReview(caseId)`（`:1076`），之后按需跑自动化 |
| `review-ipc.ts` `RUN_REVIEW_V2` | `:1087-1092` | 单案同步运行；只做 `assertSafeReviewStorageId(caseId)`（`:1088`），**未见 sender 断言** |
| `pi-review-ops-tools.ts`（Agent 工具） | `:446-447` `startReviewRunAsync`；`:469` `getRunById`；`:508` `cancelAsyncRun` | 工具 `review_start_run`/`review_get_run_status`/`review_cancel_run`；带 `requireAssignment` 与案卷绑定校验（`:445-449`、`:466-469`、`:505-509`） |
| `review-v3-t06-main-service.test.ts` | `:185` import `assembleAndRunReview` | 间接测试：未提交/缺字段案卷被门禁拒绝 |

出向：`application-service`（聚合/缺项收集）、`template-store`、`v2-executor-factory`、`run-service-v2`（`runReviewCaseV2`/`cancelRunV2`/`isRunCancelled`）、`run-store-v2`（`saveRunV2`/`getRunV2`）、`review-model-gateway`、`pi-review-agent-client`、`pi-agent-adapter`、`system-tesseract-ocr-adapter`、`config-paths`。全部为静态 import/require，无字符串拼接调用。

## 5. 数据 I/O、读写与副作用

- **写盘**：`saveRunV2(queuedRun)`（`:178`）与失败收尾 `saveRunV2({...current,...})`（`:195-201`）；路径 `<configDir>/review-cases/<caseId>/runs-v2/<runId>.json`，tmp+rename（`run-store-v2.ts:24-30`），无 fsync。`runReviewCaseV2` 随后会用真实 `inputManifest`/`status:'running'` 覆盖同一文件（`run-service-v2.ts:157-181`）。
- **网络**：模型请求经 `createPiReviewModelClient`（Pi SDK）与 `imageInspector`（网关）；OCR 本地进程。
- **进程内状态**：`activeRuns`（去重/取消）、`run-service-v2.cancelledRunIds`。均不跨进程。
- **幂等/并发**：去重只在**当前进程**内、且运行结束后还多保留 5 秒（`:205`），因此刚失败/完成 5 秒内再次启动会被判"已有进行中的审核运行"；跨进程/跨窗口无文件锁，理论上可并发启动同一案卷。
- **原子性**：单文件 tmp+rename；但 `queuedRun` 与后续 `running` 是两次独立写，崩溃窗口内会留下 `queued` 文件（启动时由 `markStaleRunsInterrupted` 处理，`run-store-v2.ts:86` 起）。
- **副作用**：`console.warn`（网关内部）；`assembleReviewClient` 会创建 Pi 适配器与 OCR 端口；`saveRunV2` 建目录。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| 已有活跃运行 | `:150` | 抛"案卷已有进行中的审核运行…" |
| 聚合/模板缺失 | `:107-110`、`:151-154` | 抛对应中文错误 |
| draft/archived/缺项 | `:93-99` | 开审门禁拒绝 |
| 无渠道 | `:37`、`:156` | "未配置可用模型渠道…" |
| 无模型 | `:42` | "审核渠道「x」没有已配置模型" |
| 显式模型失效 | `:44-46` | "审核所选模型已停用或被删除…" |
| 后台执行异常 | `:192-203` | 运行写 `failed`（或取消时 `cancelled`）+ error + diagnostics，并 rethrow |
| 外部取消 | `:190` | `cancelled` 回调含 `isRunCancelled` 与 controller |
| 完成后 | `:205` | 登记表延迟 5s 清理 |

**恢复**：本文件不负责重启恢复；`markStaleRunsInterrupted` 在 IPC 注册时把遗留 `queued/running` 改写为 **`status:'failed'`**，写 `error='应用重启导致运行中断…'`，并追加诊断标记 `interrupted: 进程重启`（`run-store-v2.ts:108-111`、`:37`），同时在进程内 `interruptedRunIds` 拒止授权（`:104`）。**不存在独立的 `interrupted` 状态**；`isResumableInterruptedRunV2` 正是靠 `status==='failed'` + 该标记 + 已有检查/检查点来判定可原 ID 续交（`:49-56`）。RUN-43 的显式续交在 `review-pi-run-bridge.ts`。**不可恢复点**：`queued` 已落盘但装配失败时，运行被标 `failed`，不会自动重试；调用方需重新发起（会得到新 runId，除非显式传 `input.runId`）。

## 7. 权限与权威状态

- 本文件**无 sender/role 检查**；权限在 IPC/工具层：`RUN_REVIEW_V2` 仅 `assertSafeReviewStorageId`（`review-ipc.ts:1088`），`RUN_BATCH_V2` 仅校验 `batchId` 字符串（`:1071`）——两者都**没有** `assertMainWindowSender`（对比后台入口 `:1118`、`:1123`）。Agent 工具侧有 `requireAssignment` 与案卷绑定校验（`pi-review-ops-tools.ts:445-449` 等）。
- **provider 白名单**：本文件不校验；`imageInspector` 走网关时由 `review-model-gateway.ts:309-312` 强制，文本 Pi client 直接把 `channel.provider` 交给 SDK（`pi-review-agent-client.ts:138`），不经该闸。因此白名单的实际入口约束在 IPC 保存审核设置（`review-ipc.ts:1515`）。
- `initiatedBy` 是运行记录里的来源声明：IPC 路径缺省 `local-user/local/reviewer`（`:115`），Agent 工具显式传 `actorSource:'agent'`（`pi-review-ops-tools.ts:447`）。它是**记录**，不是权限校验。
- 权威状态：运行 JSON 文件（`run-store-v2`）是运行状态的权威；`activeRuns` 只是进程内去重/取消辅助，不参与"运行是否完成"的判断。

## 8. 修改影响面

- `review-ipc.ts:1070-1092`：改签名/返回值影响 `RUN_REVIEW_V2`/`RUN_BATCH_V2` 的 IPC 响应；批量路径还依赖 `run.status`（`:1077`）。
- `pi-review-ops-tools.ts:446`、`:469`、`:508`：Agent 工具契约（`review_start_run` 返回 `runId/nextPollAfterMs`；`review_cancel_run` 返回 `wasActive`）。
- `review-v3-t06-main-service.test.ts:185`：门禁错误文案断言 `/尚未提交审核|尚未补齐/`，改文案需同步。
- `review-model-gateway.ts` 的选择语义：显式失效分支（`:44-46`）依赖 `explicit`；若网关改成"回退其他渠道"，这里会静默用别的模型。
- `run-store-v2`：`queuedRun.inputManifest.hash=''` 依赖 `runReviewCaseV2` 覆盖；改运行持久化顺序会让"空 hash 运行"可见。
- 去重 5 秒窗口（`:205`）会影响 UI"重新运行"按钮的即时可用性。

## 9. 测试证据

- 直接测试：**无**专门 `run-async-service.test.ts`（`grep -rn "run-async-service" --include=*.test.ts` 仅 `review-v3-t06-main-service.test.ts:185`）。
- 间接：`review-v3-t06-main-service.test.ts:184-186` 对未提交/缺必填的 T06 建案调用 `assembleAndRunReview(caseId)`，断言 `rejects.toThrow(/尚未提交审核|尚未补齐/)`——只覆盖门禁，不覆盖真实模型、异步启动、去重、取消、失败落盘。
- `review-pi-run-bridge.main.test.ts` 覆盖的是 Pi 会话路径，不经过本文件。
- 未覆盖：`startReviewRunAsync` 的 queued 落盘/后台失败收尾/5 秒去重窗口、`cancelAsyncRun` 三处联动、`assembleReviewClient` 的模型冻结与 imageInspector 形状、`getRunById`。
- `NOT_RUN`：本轮未执行 `bun test`/typecheck；以上为静态阅读。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 异步启动先落 `queued` 再后台执行，立即返回 runId | 已证实 | `run-async-service.ts:162-178`、`:211` |
| 去重按 `caseId` 扫进程内 Map，结束后延迟 5s 清理 | 已证实 | `:123-128`、`:205`、`:208` |
| `source` 参数被接收但未使用 | 已证实 | `:177` `void source`；全文件无其它引用 |
| 门禁对 draft/archived/缺输入/缺槽四类拒绝 | 已证实 | `:93-99` |
| 显式模型失效分支在当前网关语义下多为竞态兜底 | 推断 | `:44-46` 对比 `review-model-gateway.ts:176`、`:210-217` |
| 失败时只在运行仍为 queued/running 时改写终态 | 已证实 | `:193-202` |
| `queued` 记录 `inputManifest.hash` 为空，随后被 runReviewCaseV2 覆盖 | 已证实 | `:167`；`run-service-v2.ts:157-181` |
| `cancelledRunIds` 正常收尾删除；仅提前抛错路径可能残留 | 已证实 | `run-service-v2.ts:18-26`、`:247-248` |
| 跨进程可并发启动同一案卷 | 推断 | 去重仅进程内 Map（`:30`） |
| IPC 入口未做 sender 断言 | 已证实 | `review-ipc.ts:1087-1092` 无 `assertMainWindowSender`（对比 `:1118`） |
| 真实 UI 点击后的表现 | 未知 | 未读渲染层；本轮不运行 GUI |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 条导出 | §2 | `:102-230` | covered |
| `assembleReviewClient` 模型冻结/图像端口/OCR | §3.1 | `:33-79` | covered |
| 开审门禁 | §3.2 | `:86-100` | covered |
| 同步执行链 | §3.3 | `:102-120` | covered |
| 异步 queued/后台/失败收尾/5s 清理 | §3.4 | `:144-212` | covered |
| 取消三处联动 | §3.5 | `:215-225` | covered |
| 查询归属 | §3.6 | `:228-230` | covered |
| 权限/权威状态 | §7 | 跨文件 | covered |
| 真实模型/UI 运行 | §9 | — | unknown（NOT_RUN） |
