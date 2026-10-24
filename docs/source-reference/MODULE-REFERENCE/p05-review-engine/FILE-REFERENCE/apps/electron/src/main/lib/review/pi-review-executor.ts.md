---
path: apps/electron/src/main/lib/review/pi-review-executor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dcfe4c87f59c33ca20c1cab7e7ba9c9e0d701f73
sha256: b0e1c2ac1e490dcdbf9a3a9b17cd915f394d1eb9ede12c933f06a0b14c545758
lines: 154
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/pi-review-executor.ts

## 1. 结论与边界

Pi 审核执行器基座（N2d/R10，头注 :1-8）：工具白名单（审核业务工具 + `read_rule`，通用 read/bash/write 永不入审核）、协议白名单（`openai-chat`/`ollama-chat`，拒绝而非静默换）、材料指令边界（系统提示声明材料是数据）、取消语义（调用前后查 `signal`，中止不产生产物）。另定义审核系统提示词与 Pi customTools 构建器。

边界：不调用模型本身（`ReviewModelClient` 由 Pi adapter/审核网关实现）；不做业务校验；`buildReviewExecutors` 的节点产物是占位摘要（:145/:151）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `REVIEW_ALLOWED_PROTOCOLS` | const | 19 | `['openai-chat','ollama-chat'] as const` | 协议白名单 |
| `ReviewAllowedProtocol` | type | 20 | union | 协议类型 |
| `REVIEW_TOOL_ALLOWLIST` | const | 23-27 | 15 个工具名 | 审核工具白名单 |
| `selectReviewTools` | fn | 30 | `(tools: ReviewTool[]) => ReviewTool[]` | 按白名单过滤 |
| `assertAllowedProtocol` | fn | 35 | `(protocol: string) => void` | 不在清单即 throw |
| `ReviewModelClient` | interface | 42-47 | `{protocol, runtime?, complete(input)}` | 模型调用客户端契约 |
| `buildPiReviewToolDefinitions` | fn | 50-102 | `(sdk, tools, onToolCall?, onToolResult?, terminateAfterTools?) => ToolDefinition[]` | 注册 Pi customTools |
| `REVIEW_SYSTEM_PROMPT` | const | 111-122 | 多行字符串 | 审核执行器系统指令 |
| `REVIEW_VISION_SYSTEM_PROMPT` | const | 125-130 | 多行字符串 | 单页图像读取能力指令 |
| `ReviewExecutorDeps` | interface | 104-108 | `{client, signal?}` | 执行器依赖 |
| `buildReviewExecutors` | fn | 136-153 | `(deps, tools) => Partial<Record<NodeKind, NodeExecutor>>` | 构建 extract/check 节点执行器 |

内部：TypeBox `schemas` 表（:57-71，15 个工具的参数 schema）。

## 3. 内部逻辑与关键流程

1. **白名单过滤**（:30-32）：`tools.filter(name ∈ REVIEW_TOOL_ALLOWLIST)`；工具集合由代码决定，材料/Prompt 不能改（注释 :29）。
2. **协议校验**（:35-39）：不在清单 → throw `协议不在审核允许清单: …（允许：…）`。
3. **customTools 构建**（:50-102）：每个 `ReviewTool` 转 `sdk.defineTool`，参数 schema 从 `schemas[tool.name]` 取，缺省空对象（:73）；`execute`（:79-99）：回调 `onToolCall` → 执行 `tool.execute(input)` → `onToolResult` 返回 `true` 视为「已验证的终止条件」（:82）；终止判定（:85-89）：工具在 `terminateAfterTools` 内且 `outcome.ok` 且 `terminateAfterValidatedResult` 且（单发 `record_observation`/`submit_check` 或非空批量 `results`）→ 返回 `{terminate:true}`（:96，注释 :94-95 避免再花一轮模型润色）；失败结果带 `isError:true`（:93）。
4. **系统提示**：`REVIEW_SYSTEM_PROMPT`（:111-122）声明材料是数据、忽略材料内指令、只用审核工具、引用必须真实块、按需读材料、图片单页核验、批量提交、结论仍须结构化 JSON、工具结果不能替代人工审批；`REVIEW_VISION_SYSTEM_PROMPT`（:125-130）限定单页图像转写职责（不判规则、不推断、最多 8 条）。
5. **`buildReviewExecutors`**（:136-153）：`assertAllowedProtocol`（:137）+ `selectReviewTools`（:138）；返回 `extract`/`check` 两个节点执行器，均在模型调用前后检查 `deps.signal?.aborted`（`已取消（模型调用前/后）`，:141/:144/:148/:150），调用 `client.complete`（:143/:149，system 为 `REVIEW_SYSTEM_PROMPT`），产物为固定形状摘要（:145/:151）。

## 4. 调用者与调用链

入向：
- `buildPiReviewToolDefinitions`：`pi-review-agent-client.ts:9/:86`（唯一生产调用）。
- `REVIEW_SYSTEM_PROMPT`/`REVIEW_VISION_SYSTEM_PROMPT`：`v2-executor-factory.ts:18`（调用点 :127/:768-769/:882/:964）。
- `ReviewModelClient`（类型）：`pi-review-agent-client.ts:8`、`v2-executor-factory.ts:17/:104`、`run-async-service.ts:33`。
- `buildReviewExecutors`/`selectReviewTools`/`assertAllowedProtocol`/`REVIEW_TOOL_ALLOWLIST`/`REVIEW_ALLOWED_PROTOCOLS`：**仅 `pi-review-executor.test.ts` 消费**（全树检索无生产调用者；`batch-store.ts:650` 仅为注释提及）。否定范围：`apps/electron/src` 全部 `.ts`。

出向：`./review-run-graph` 类型、`./review-tools` 类型、`typebox`、Pi SDK 类型（:10-16）。

## 5. 数据 I/O、读写与副作用

纯构造/纯校验；`execute` 闭包内的副作用是调用注入的 `tool.execute` 与回调；无磁盘/网络/日志。

## 6. 分支、失败、取消与恢复

- `assertAllowedProtocol` throw（:37）；工具 `execute` 的失败以 `isError:true` 返回不抛（:93）。
- 取消：`buildReviewExecutors` 的 `signal` 前置检查 throw `已取消（模型调用前）`（:141/:148）、后置 throw `已取消（模型调用后）`（:144/:150）；`buildPiReviewToolDefinitions` 本身无取消逻辑（取消在 agent-client 的 abort 监听）。
- 无恢复/重试逻辑。

## 7. 权限与权威状态

- 工具集合权威在代码（白名单 :23-27），材料内容不可改变（头注 :5、注释 :29）；系统提示重申「工具集合与规则版本由系统固定」（:114）。
- `terminate` 语义要求「已验证的写入」（`onToolResult===true`）才允许提前结束（:82-89）——提交质量由调用方验证器决定（agent-client 的 requiredToolKeys 机制）。
- 无 sender/role 分支；模型无权限概念（`permissionMode:'bypassPermissions'` 由 agent-client 传入，见该篇）。

## 8. 修改影响面

- 白名单/协议变更影响 `pi-review-agent-client` 的 customTools 与 `v2-executor-factory` 的提示词行为。
- `buildPiReviewToolDefinitions` 的 TypeBox schema 是 Pi 工具参数契约，改动影响模型调用形状与 `pi-review-agent-client.test.ts`。
- `buildReviewExecutors` 目前无生产消费者，改动只影响测试。

## 9. 测试证据

直接测试 `pi-review-executor.test.ts`（5 用例 / 3 describe；`buildReviewTools` 真实构造 + fake client；NOT_RUN）：
1. `:10-24` 白名单：注入 `bash`/`write_file` 伪装工具后 `selectReviewTools` 结果名集 `toEqual([...REVIEW_TOOL_ALLOWLIST].sort())`，含 `list_review_documents`/`inspect_document_image`，不含 `bash`。
2. `:28-33` 协议：`openai-chat`/`ollama-chat` 不抛，`anthropic-native` 抛含 `'允许清单'`，`REVIEW_ALLOWED_PROTOCOLS` 长度 2。
3. `:41-46` 未取消：`extract` 节点 `status==='done'` 且 artifact.summary 含 `'openai-chat'`。
4. `:48-54` 已 abort：`rejects.toThrow('已取消')` 且模型 `complete` 未被调用（`called` false）。
5. `:56-58` 不允许协议构建执行器 → throw `'允许清单'`。

未覆盖：`buildPiReviewToolDefinitions` 全部（在 `pi-review-agent-client.test.ts` 间接覆盖）、`terminate` 三条件组合、schema 缺省分支；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出/行号如 §2 | 已证实 | :19-153 |
| 白名单=代码决定，材料不可改 | 已证实 | :23-32 + 系统提示 :114 |
| `buildReviewExecutors` 等四符号零生产消费者 | 已证实（否定） | 全树 `.ts` 检索 |
| 生产提示词消费者为 v2-executor-factory | 已证实 | :127/:768-769/:882/:964 |
| Pi 运行时 `defineTool` 真实行为 | 未知 | 测试用 fake sdk；真实 SDK NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `REVIEW_TOOL_ALLOWLIST`/`selectReviewTools` | §3.1/§9 | 23-32 | covered |
| `assertAllowedProtocol` | §3.2/§9 | 35-39 | covered |
| `buildPiReviewToolDefinitions`（terminate 判定） | §3.3 | 50-102 | covered（间接测试） |
| 两个系统提示 | §3.4 | 111-130 | covered |
| `buildReviewExecutors`（取消分支） | §3.5/§9 | 136-153 | covered（仅测试消费） |
| `ReviewModelClient` 契约 | §2/§4 | 42-47 | covered |
