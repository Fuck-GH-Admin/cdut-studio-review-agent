---
path: apps/electron/src/main/lib/pi-harness/tool-facts.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a50cc75df3de2abd9b9a83af4ef5006bfc9f6d9b
sha256: e19dcf5677fda86f89751ea960a6ab5c04090a8f9dc948276344fa0c4a39ace3
lines: 217
kind: source
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/tool-facts.ts

## 1. 结论与边界

工具结果 → **有界、脱敏 ToolFact** 的转换器（`:84-87`："No result body, command text or secret-bearing input is persisted"）。按工具族分类 kind/outcome/subject，哈希摘要替代正文；是验证证据（verification_command/file_mutation/file_read）的唯一生产口。

不做的事：不持久化（store 侧）；不评估验证（`verification-evaluator`）；不抛错（返回 `ToolFact|undefined` 签名但实际总返回 fact——见矛盾②）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ToolFactInput` | `:5-13` | `{toolUseId?; toolName; input; result; executionResult?:CommandExecutionResult; isError?; timestamp?}` |
| `createToolFact` | `:88-217` | `(context:{goalId,turnId,taskId?}, input) => ToolFact\|undefined`：按工具族分支构造（见 §3） |

内部函数：`digest:15-17`（sha256 hex 前 16 位）、`textFromResult:19-27`（string 或 text block 数组拼接）、`normalizePath:29-32`（反斜杠→`/`、压多斜杠）、`pathFromInput:34-36`（`file_path ?? path`）、`commandCategory:38-43`（test/typecheck/build/command 正则分类）、`legacyExitCodeFromResult:45-48`（正则抓 `exit code N`/`退出码 N`）、`normalizedName:50-52`（剥 `mcp__x__` 前缀+小写）、`reviewToolOutcome:64-82`（结构化 ok/results 判定）。

## 3. 内部逻辑与关键流程

按 `normalizedName(toolName)` 五族分支：

1. **观察族** `read/grep/glob/find/ls`（`:107-118`）：kind `file_read`（read）或 `observation`；outcome：isError→failure，有 path→success，否则 unknown；subject 只留 `path?` + `resultHash`。
2. **写族** `write/edit/multiedit`（`:120-130`）：kind `file_mutation`；subject `path?` + `outputHash`。
3. **命令族** `bash/powershell`（`:132-181`）：kind = category==='command' ? `command` : `verification_command`；**证据优先级**：`executionResult` 结构化进程证据 > 文本 legacy 退出码（`:135-137`）；processFailed 判定（`:139-141`：timedOut/aborted/signal/exitCode≠0/errorKind）；outcome 三分支（`:144-148`）：失败→failure；exitCode===0 或（无 execution 且非 error 且无退出码且**有限验证类**）→success（`executionEvidence:'tool_result_success'` `:174`）；否则 unknown；subject 含 `commandHash`（**命令正文不存**）、category、exitCode?、结构化执行元数据（`:160-172`）、outputHash。
4. **审核族** `review_*`（`:183-195`）：kind `review_operation`；outcome=`reviewToolOutcome`（`:64-82`）：isError→failure；JSON 解析失败→**success**（保守，`:61-62` 注释：不再记 unknown）；`ok===false` 或整批 `results[].ok===false`→failure；其余 success。
5. **任务族** `taskcreate/taskupdate/*proma_task_*`（`:197-206`）：kind `task_graph`；subject 只留 taskId/status。
6. **兜底**（`:208-216`）：`external_or_unknown`，outcome isError→failure 否则 unknown（Browser/MCP 不参与验证）。

fingerprint 统一 `toolUseId ?? digest(...)`（toolUseId 优先）。

## 4. 调用者与调用链

pi-harness store/reducer 的 `tool_fact_recorded` 事件生产口（Agent loop 捕获工具完成时）；`verification-evaluator` 消费其产出的 kind/outcome/subject.category/path；`telemetry` 的 `hasNoChangeFailedValidation` 依赖 `verification_command`/`file_mutation`。出向：`../command-execution` 的 `CommandExecutionResult`（`:2`）、`./types`。

## 5. 数据 I/O、读写与副作用

纯转换函数；无 I/O、无副作用。**脱敏承诺**（`:85-86`）：结果正文/命令文本/含密输入不落盘——只有哈希与元数据。

## 6. 分支、失败、取消与恢复

不适用（无控制流异常）。outcome 判定分支见 §3；`undefined` 返回类型声明了"无法构造"可能但实现总返回 fact（矛盾②）。

## 7. 权限与权威状态

- **证据权威**：结构化 `executionResult` 压过文本（`:135-137`、`:142-143` 注释：tool_result.is_error 是协议证据、executionResult 是进程证据，仅有限验证类可用协议兜底）。
- **脱敏边界**：subject 只含哈希/路径/退出码/执行元数据；测试证明密钥不落（`tool-facts.test.ts:12-13/91/152`）。
- **审核域定位**（`:184-186` 注释）：review_* 是产品内已知工具，真实 outcome 防可观测性失真。

## 8. 修改影响面

改分支判定影响验证证据生产（falseVerified/failed-loop 判定随之变）；fingerprint 兼容（toolUseId 优先）改动影响 `manuallyContinuedCandidateFingerprints` 去重；`reviewToolOutcome` 改动影响审核域观测。

## 9. 测试证据

直接测试 `tool-facts.test.ts`（8 个 `test(`）：脱敏写事实（`:7-14`）、退出码文本分类（`:16-25`）、结构化证据压过矛盾文本（`:27-58`）、结构化失败分类不泄 stderr（`:60-92`）、exit0 结构化成功（`:94-118`）、无退出码有限类成功（`:120-130`）、外部工具非验证（`:132-135`）、审核族真实 outcome 四情形（`:137-178`）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五族分支/证据优先级/脱敏 | 已证实 | 文件全读 + 8 测试断言 |
| `digest` 16 位截断 | 已证实 | `:16` |
| **矛盾①** `legacyExitCodeFromResult` 正则 `(?:is\|为\|=|:)?` 后无分隔容忍度细节（`退出码:1` 可匹配、`exit code:1` 可匹配） | 已证实 | `:46`（照实） |
| **矛盾②** 返回类型 `ToolFact\|undefined` 但实现无 undefined 出口 | 已证实 | `:88-217` |
| **矛盾③** `commandCategory` 的 typecheck 正则 `\b(?:tsc\|typecheck)\b` 会把 `tsc` 子串命令（如 `vitest tsc-thing`）误分类 | 推断 | `:40` |
| 真实 Agent 工具结果形状（text block 数组）的全覆盖 | 未知 | 仅测试样例 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 2 导出 + 8 内部函数 | §2 | covered |
| 五族分支逐条 | §3 | covered |
| 证据权威/脱敏 | §7 | covered |
| 8 测试断言 | §9 | covered |
| 矛盾/未知 | §10 | covered |
