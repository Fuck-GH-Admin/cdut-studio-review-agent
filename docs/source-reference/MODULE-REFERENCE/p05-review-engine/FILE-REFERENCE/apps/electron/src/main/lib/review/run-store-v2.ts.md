---
path: apps/electron/src/main/lib/review/run-store-v2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ade927628e35bdda4871354b412bd807898e2a6e
sha256: c113331f5cda65eb3d225241e8569bed08b1cf74a239ca37da8b296a2d24c6cd
lines: 174
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/run-store-v2.ts

## 1. 结论与边界

V2 运行存储（M3，头注 :1-6）：`review-cases/{caseId}/runs-v2/{runId}.json` 整文件原子写；运行状态机推进时整份重写（检查点/事件追加 → 每节点后持久化）。另含节点产物存储（`runs-v2/{runId}/artifacts/{nodeId}.json`，不可变）与 RUN-43 冷启动中断治理（拒止→续交）。

边界：不含运行编排（`run-service-v2`）；不做 IPC/身份检查；id 校验用 `assertSafeReviewStorageId`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `saveRunV2` | fn | 24-30 | 原子写运行记录（tmp+rename） |
| `INTERRUPTED_RUN_MARKER` | const | 37 | `'interrupted: 进程重启'`（RUN-43 稳定标记） |
| `isInterruptedRunV2` | fn | 40-42 | 内存拒止查询（旧轮次不得获工具/admission） |
| `isResumableInterruptedRunV2` | fn | 49-56 | 「可原 ID 续交」判定 |
| `reopenInterruptedRunForResume` | fn | 66-83 | 恢复为 `partially-completed` 续交 |
| `markStaleRunsInterrupted` | fn | 86-122 | 启动恢复：queued/running → failed+标记 |
| `getRunV2` | fn | 124-133 | 读单个运行 |
| `listRunsV2` | fn | 135-146 | 列运行（startedAt 倒序） |
| `saveArtifact` | fn | 155-163 | 节点产物落盘（不可变） |
| `readArtifact` | fn | 165-174 | 读产物（损坏视为无产物） |

内部：`runsDir`（:14-17）、`runPath`（:19-22）、`interruptedRunIds`（:33，进程内集合）、`interruptedRunKey`（:34，`caseId\0runId`）、`artifactsDir`（:149-153）。

## 3. 内部逻辑与关键流程

1. **路径/写**：`runsDir`/`runPath` 双 id 校验（:14-22）；`saveRunV2` mkdir+tmp+rename（:24-30）。
2. **RUN-43 中断治理**：
   - `markStaleRunsInterrupted(caseId?)`（:86-122）：遍历 `review-cases/*/runs-v2/*.json`；非法 id 跳过（:92/:98）；`queued/running` → **先**收拒止（`interruptedRunIds.add`，:104）→ 身份一致性校验（caseId/id 与路径不符 throw 内部 catch，:105-107）→ 改 `failed` + error `应用重启导致运行中断（材料与检查点已保留，可续跑）` + completedAt + `INTERRUPTED_RUN_MARKER`（:108-111）→ 原子写（:112-113）；写失败（EACCES/ENOSPC）保留拒止并 warn（:116-118，注释 :103）。
   - `isResumableInterruptedRunV2`（:49-56）：须 `status==='failed'` + diagnostics 含标记 + 有已接受检查或检查点（:52-55）。
   - `reopenInterruptedRunForResume`（:66-83）：不可续交返 undefined（:72）；改 `partially-completed`、删 completedAt/error、追加诊断（用户确认与否两种文案，:76-79，注释 :63-65「续交是新回合，中断前 Provider 请求不可宣称已恢复/重放」）；落盘并解除拒止（:80-81）。
   - `isInterruptedRunV2`（:40-42）：内存拒止查询（注释 :39「即使恢复写盘失败旧 running 也不能重获工具」）。
3. **读**：`getRunV2` 缺失/损坏 → undefined + warn（:124-133）；`listRunsV2` 过滤 `.json`+合法 runId、按 `startedAt` 倒序（:135-146）。
4. **产物**：`saveArtifact`（:155-163）mkdir+随机后缀 tmp+rename；`readArtifact`（:165-174）损坏返回 undefined（注释 :172「恢复时重做」）。

## 4. 调用者与调用链

入向（生产）：`pi-case-review-service.ts:16`（getRunV2/isInterruptedRunV2/listRunsV2/readArtifact/saveArtifact/saveRunV2）；`run-service-v2.ts:13`；`run-async-service.ts:11`；`review-pi-run-bridge.ts:17-18`；`review-agent-assignment.ts:16`（getRunV2/isInterruptedRunV2）；`workspace-business-service-v2.ts:7`；`batch-automation-service.ts:13`/`batch-group-action-service.ts:14`（readArtifact）；`review-v3-main-template-run.ts:20`；`review-v3-t05-main-service.ts:22`/`case-lifecycle-v3.ts:12`/`review-background-state.ts:11`（listRunsV2）；`review-pi-admission.ts:18`；`review-ipc.ts:114-115`（动态 require `markStaleRunsInterrupted`，启动恢复）。测试：`review-storage-id.test.ts:7`、本批两个 run-service-v2 测试、`pi-case-review-service.test.ts:10` 等。出向：`../config-paths`（:11）、`./review-storage-id`（:12）、`node:fs/path`（:8-9）。

## 5. 数据 I/O、读写与副作用

- 写：`runs-v2/{runId}.json`（tmp+rename）、`runs-v2/{runId}/artifacts/{nodeId}.json`（随机 tmp+rename）；mkdir 递归。
- 进程内状态：`interruptedRunIds` 拒止集合（重启即清空，靠 `markStaleRunsInterrupted` 重建）。
- 副作用：`console.warn`（:117/:130）；无网络/窗口。

## 6. 分支、失败、取消与恢复

- 读失败 → undefined（不抛）；`markStaleRunsInterrupted` 单文件失败继续扫描（:116-118）。
- 恢复语义（RUN-43）：崩溃 running → failed+标记 → `isResumableInterruptedRunV2` → `reopenInterruptedRunForResume` 续交（新回合语义，:63-65）。
- 容量故障时**不截断**最后有效记录（:112 注释）；写失败保留拒止（fail-closed）。
- 无取消概念（存储层）。

## 7. 权限与权威状态

- 轮次授权权威：`interruptedRunIds` 拒止（:39-42）——旧进程遗留 running 不得重新获得工具/admission；只经 `reopenInterruptedRunForResume` 显式恢复（:81 解除）。
- `INTERRUPTED_RUN_MARKER` 是稳定审计标记（:36-37）；`isResumableInterruptedRunV2` 三条件（:52-55）防「正常失败冒充可续交」。
- 产物不可变（:148 注释）；损坏即重做。
- 无 sender/role 检查；id 校验防路径穿越。

## 8. 修改影响面

- `saveRunV2/getRunV2/readArtifact/saveArtifact` 是 V2 运行/产物的唯一存储口，改动影响 §4 全部消费方（Pi 审核、批处理、工作台、报告）。
- RUN-43 语义改动影响 `review-pi-admission`/`review-pi-run-bridge` 的续交链与 `review-storage-id.test.ts`。
- 同步测试：`review-storage-id.test.ts`（存储守卫）、`run-service-v2*` 测试（间接）。

## 9. 测试证据

间接测试为主（无专属测试文件）：
- `review-storage-id.test.ts:7`（`saveRunV2/getRunV2/listRunsV2/saveArtifact/readArtifact/markStaleRunsInterrupted` 的 id 守卫断言）。
- `run-service-v2.test.ts:11`/`run-service-v2.artifacts.test.ts:10`（产物落盘/删除重做/损坏指纹重做经 `readArtifact/saveArtifact`，:36-57/:174-178）。
- `pi-case-review-service.test.ts:10`（运行读写）。
未覆盖（缺口）：`markStaleRunsInterrupted` 的 queued→failed 路径、写失败保留拒止、`reopenInterruptedRunForResume` 用户确认文案、`isInterruptedRunV2` 拒止解除竞态均无直接用例（RUN-43 组合在 `review-startup-io-recovery.p06.test.ts` 间接，他批）。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 原子写 + 随机 tmp（产物） | 已证实 | :24-30/:155-163 |
| RUN-43 拒止→续交状态机 | 已证实 | :33-83 |
| 写失败保留拒止（fail-closed） | 已证实 | :103/:116-118 |
| `markStaleRunsInterrupted` 接线于 review-ipc 启动 | 已证实 | review-ipc.ts:114-115 |
| queued→failed 路径运行行为 | 未知 | 无直接用例；NOT_RUN |
| 跨进程并发写同一 runId | 未知 | 存储层无锁（依赖上层事务） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `saveRunV2`/`getRunV2`/`listRunsV2` | §3.1/§3.3 | 24-30/124-146 | covered（间接） |
| RUN-43 三函数+marker | §3.2/§7 | 33-83 | covered（部分未测） |
| `markStaleRunsInterrupted` | §3.2 | 86-122 | partial（未测） |
| `saveArtifact`/`readArtifact` | §3.4 | 148-174 | covered（间接） |
