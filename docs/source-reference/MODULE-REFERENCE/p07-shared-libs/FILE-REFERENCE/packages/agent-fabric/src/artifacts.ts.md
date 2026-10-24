---
path: packages/agent-fabric/src/artifacts.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dd400169b278eb0da30f450b111399e1ffbfdafc
sha256: fc8828bbac6d199040c2839601e7b4f27d78b63a43505febbb5f2e4487fcf8ea
lines: 109
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/agent-fabric/src/artifacts.ts

## 1. 结论与边界

**Artifact 与 Result 契约**：结论（Result）与证据（Evidence/Artifact）分开；产物不经任意路径暴露——Gateway 只返引用与元数据，内容读取须再校验（`artifacts.ts:1-7`）。含产物过期门禁与"结果-证据一致性"检查（防"测试通过"式虚报，`:88-90`）。纯逻辑，无 I/O。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ArtifactKind` | 常量组 | `:11` | 6 值：log/screenshot/test-report/diff/patch/other | |
| `ArtifactRef` | 接口 | `:23` | artifactId/taskId/kind/mimeType?/sizeBytes?/createdAt/expiresAt?/label? | **只含元数据，不含内容/文件系统路径**（`:22`） |
| `assertArtifactReadable` | 函数 | `:36` | `(ref,now?): void` | `expiresAt<=now`→`ARTIFACT_EXPIRED`（`:37-42`） |
| `EvidenceType` | 常量组 | `:47` | 5 值：command/log/screenshot/diff/runtime-event | |
| `Evidence` | 接口 | `:58` | type/ref（指向 executionId 或 artifactId，`:60-61`） | 是引用不是内容（`:57`） |
| `TaskTestResult` | 接口 | `:64` | command/exitCode/passed/failed/artifactId? | |
| `TaskResult` | 接口 | `:76` | status('completed'\|'failed'\|'cancelled'\|'expired')/summary/changedFiles/testResults/artifacts/evidence/blockers/nextActions | summary 面向人，**不作状态来源**（`:74-75`） |
| `findResultInconsistencies` | 函数 | `:91` | `(result): string[]` | 见 §3 |

## 3. 内部逻辑与关键流程

`findResultInconsistencies`（`:91-109`）：`failedTests`=exitCode≠0 或 failed>0（`:93`）；`status==='completed'` 且 blockers>0→问题项（`:96-98`）；completed 且 failedTests>0→列出失败命令（`:99-103`）；`status==='failed'` 且无 blocker 且无失败测试→"缺少可定位的失败原因"（`:105-107`）。返回空数组=一致。

## 4. 调用者与调用链

- 入向（同包）：`gateway.ts:39`（assertArtifactReadable/ArtifactRef/TaskResult，getArtifact `:288` 调用断言、TaskResult 为 store/reporter 类型）。
- 测试：`contract-security.test.ts` 3 用例（`:248` 过期拒绝；`:257` completed+失败测试暴露；`:271` failed 无因暴露）。
- 出向：`./protocol`（错误码）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用（纯结构+检查函数）。

## 6. 分支、失败、取消与恢复

过期抛错（`:37-42`）；一致性检查为纯报告（不抛错）。无取消路径。

## 7. 权限与权威状态

产物读取权威=过期门禁（本文件）+ 能力校验（gateway ARTIFACT_READ，跨文件）；状态权威=`TaskResult.status`（机器判定字段，`:74`），summary 不作数。

## 8. 修改影响面

`TaskResult`/`ArtifactRef` 形状影响 gateway store/reporter、域外 fabric-executor-headless 结果上报（未深读）；一致性规则影响域外结果审查。

## 9. 测试证据

`NOT_RUN`。直接测试 3 用例（§4，断言体见 contract-security 手册）。缺口：`findResultInconsistencies` 对 cancelled/expired 状态、failed+blockers 组合无断言。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §2/§3 全部规则（6+5 枚举、过期门禁、三类不一致） | 已证实 | `:11-109` 逐行 + 测试互证 |
| summary 不作状态来源（机器字段权威） | 已证实 | `:74-75` 注释+形状 |
| 域外执行器的结果/证据真实落盘 | 边界 | 未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出对象 | §2 | 11-91 | covered |
| 一致性检查 | §3 | 91-109 | covered |
| 测试 3 用例 | §9 | test 文件 | covered（NOT_RUN） |
