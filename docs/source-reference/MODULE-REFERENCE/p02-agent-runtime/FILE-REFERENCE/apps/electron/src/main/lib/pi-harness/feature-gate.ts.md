---
path: apps/electron/src/main/lib/pi-harness/feature-gate.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e84f0735867a002fc32c6acac4397e8ff8a7fc7f
sha256: 4bae5be0e0f662bf8cefefadf188664d3247eeded29a0e83b831638a6d4da6b7
lines: 30
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/feature-gate.ts

## 1. 结论与边界

Pi Host Harness **特性门**：默认开启（`feature-gate.ts:3-7`），`PROFER_PI_HARNESS=0` 为进程级紧急关闭；**Harness 仅限 Pi**——runtime 检查放此，防 Claude 会话产生 sidecar 状态（`:21-24`）。纯函数，无 I/O。

## 2. 导出与关键符号

`export` 逐条核：3 个。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PI_HARNESS_FEATURE_ENV` | 常量 | `:11` | `'PROFER_PI_HARNESS'` |
| `isPiHarnessEnabled` | 函数 | `:17` | `(env=process.env)`：trim 后 `!== '0'` 即启用（空串/任意非 0 保持默认开，`:14-15`） |
| `shouldStartPiHarness` | 函数 | `:25` | `(agentRuntime, env)`：`=== 'pi' && isPiHarnessEnabled` |

## 3. 内部逻辑与关键流程

两函数单行判定（§2）；`' 0 '` trim 后关闭（测试锁定）。

## 4. 调用者与调用链

- 入向：`agent-orchestrator`/启动链（域外，grep）；测试 `feature-gate.test.ts` 5 用例。
- 出向：`@profer/shared`（AgentRuntime 类型，`:9`）。

## 5. 数据 I/O、读写与副作用

无（env 只读）。

## 6. 分支、失败、取消与恢复

不适用（纯判定无抛错）。

## 7. 权限与权威状态

kill-switch 权威=`PROFER_PI_HARNESS`（进程级）；Pi-only 边界权威=本函数（防 Claude 侧写 sidecar）。

## 8. 修改影响面

Harness 全链启停；测试 5 断言锁定 `'0'`/trim 语义。

## 9. 测试证据

`NOT_RUN`。直接测试 `feature-gate.test.ts`（39 行/**5 个 `test(`**）：缺省启用（`:6`）；`'0'`/`' 0 '` 关闭（`:10-11`）；`'1'/'true'/'yes'/''` 保持开（`:15-18`）；claude 不启动（startCalls=0，`:21-32`）；pi 缺省/显式开/`'0'` 关（`:34-38`）。无 mock。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出语义 | 已证实 | `:1-30` 全文 + 5 测试互证 |
| 调用点实际把关 | 边界 | 域外未核 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2/§3 | 11-29 | covered |
| 测试 5 用例 | §9 | test 文件 | covered（NOT_RUN） |
