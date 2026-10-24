---
path: apps/electron/src/main/lib/longterm-memory/longterm-memory-auditor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fef60f8ff55cd5d5db6d905260d9059a70187aeb
sha256: 779653433f09f5d7e5a560582573f932b6ba6a5524a8fbc502e5165f42e8810f
lines: 142
kind: source
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/longterm-memory/longterm-memory-auditor.ts

## 1. 结论与边界

长期记忆写入前的“隔离极简审核器”：用一段独立的英文 system prompt 判断单个候选记忆是否值得永久写入，构建 system/user 分离的提示词，解析模型返回的 JSON 裁决（`approved/rejected/unavailable`），并把调用异常统一降级为 `unavailable`。运行时模块，但本身**不做网络 I/O**——补全闭包 `complete` 由调用方注入（`:130-141`）。

不做的事：不提取候选（`longterm-memory-reflector.ts:155-181`）；不写图谱（`longterm-memory-store.ts`）；不决定审核不可用时是否写入（反射器负责降置信度，`longterm-memory-reflector.ts:294-298`）；不校验模型渠道/身份。

## 2. 导出与关键符号

导出 9 项：3 个 const、3 个 function、1 个 type、2 个 interface。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `MAX_AUDIT_CONTEXT_CHARS` | const | `:16` | `1200` | 用户原文进入审核上下文的上限 |
| `MEMORY_AUDIT_MAX_TOKENS` | const | `:18` | `700` | 审核输出 token 上限 |
| `MemoryAuditStatus` | type | `:21` | `'approved' \| 'rejected' \| 'unavailable'` | 三态裁决 |
| `MemoryAuditVerdict` | interface | `:23-26` | `{status; reason}` | 审核结果 |
| `MemoryAuditCompletionArgs` | interface | `:28-32` | `{systemPrompt; userPrompt; maxTokens}` | 注入补全的参数 |
| `MEMORY_AUDIT_SYSTEM_PROMPT` | const | `:35-51` | 多行字符串 | 唯一 system prompt；与主 Agent 隔离 |
| `buildMemoryAuditPrompt` | function | `:54-80` | `(input:{candidate; userMessage}) => MemoryAuditCompletionArgs` | 截断用户原文、拼候选字段 |
| `parseMemoryAuditVerdict` | function | `:96-124` | `(raw: string \| null) => MemoryAuditVerdict` | 剥推理块/围栏，提取首个 `{` 到末个 `}` |
| `auditLongTermMemoryCandidate` | function | `:130-141` | `(input:{candidate; userMessage; complete}) => Promise<MemoryAuditVerdict>` | 构建提示词 → 调 `complete` → 解析；异常降级 |

内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `REASONING_BLOCK` | `:83` | 删除已闭合的 `<think|thinking|reasoning>…</…>` |
| `REASONING_TAIL` | `:85` | 贪婪匹配到最后一个闭合推理标签，截掉其前内容 |
| `CODE_FENCE` | `:86` | 删除 ` ```json ` / ` ``` ` 标记 |
| `unavailable` | `:88-90` | 统一三态中的不可用 |

## 3. 内部逻辑与关键流程

### 3.1 提示词构建 `buildMemoryAuditPrompt`（`:54-80`）

1. `message = input.userMessage.trim()`（`:59`）。
2. 超过 1200 字 → 截 1200 并追加 `…`；否则原样（`:60-62`）。空消息在 userPrompt 中写 `(empty)`（`:75`）。
3. `tags` 为空/缺省写 `none`，否则 `join(', ')`（`:63`）。
4. 返回的 `systemPrompt` 恒等于 `MEMORY_AUDIT_SYSTEM_PROMPT`（`:66`），`maxTokens` 恒为 700（`:78`）。
5. `userPrompt` 固定结构（`:67-77`）：候选的 Category/Title/Content/Tags，空行，`<user_message_context>` + 原文 + `</user_message_context>`。
6. **候选字段未做分隔或转义**：`candidate.title/content/tags` 直接插值（`:69-72`）。候选由反射器从同一用户消息规则提取，内容可能含换行或指令性文本；system prompt 只声明 `<user_message_context>` 内是不可信数据（`:51`），没有声明候选区不可信。这是提示注入的边界，不是“已隔离”的强保证。

### 3.2 裁决解析 `parseMemoryAuditVerdict`（`:96-124`）

1. `raw` 非字符串或 trim 为空 → `unavailable('模型未返回内容')`（`:97`）。
2. `REASONING_BLOCK` 全局删除闭合推理块（`:99`）。
3. `REASONING_TAIL` 若命中，`text = text.slice(tail[0].length)`——`[\s\S]*` 贪婪，等价于删到**最后一个**闭合推理标签之后（`:100-101`）。用于截断输出只剩闭合标签的场景；若完全没有闭合标签，不处理。
4. 删除代码围栏标记并 trim（`:102`）。
5. 取第一个 `{` 与最后一个 `}`；缺失或 `end <= start` → `unavailable('模型未返回 JSON 裁决')`（`:104-106`）。
6. `JSON.parse(text.slice(start,end+1))` 失败 → `unavailable('裁决 JSON 解析失败')`（`:108-113`）。
7. 非对象 → `unavailable`；`approved` 非 boolean → `unavailable`（`:114-117`）。**额外字段被忽略**；`approved:false` 与缺失 reason 都可解析。
8. `reason` 是字符串且 trim 非空 → trim 后截 200 字；否则按 `approved` 给“审核通过”/“未通过审核”（`:119-121`）。注意 prompt 要求“最多 20 词”，代码只截 200 字符，不校验词数/语言。
9. 返回 `approved`/`rejected`（`:123`）。

### 3.3 执行 `auditLongTermMemoryCandidate`（`:130-141`）

1. 先构建参数（`:135`）。
2. `await input.complete(args)`；任何 throw → `unavailable('审核调用异常: <message>')`（`:136-141`）。
3. 解析结果；`parse` 自身不 throw（所有异常路径返回三态），因此正常返回三态。
4. **没有超时/取消**：超时由调用方闭包控制。主进程调用点传 `timeoutMs: 10_000`（`agent-orchestrator.ts:822-830`），但本文件不强制。

## 4. 调用者与调用链

### 4.1 入向

全冻结树检索 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`：

| 调用者 | 位置 | 用法 |
| --- | --- | --- |
| `agent-orchestrator` | `agent-orchestrator.ts:176`（import）、`:818-830` | 作为 `reflectOnTurn` 的 `auditCandidate`，内部调 `auditLongTermMemoryCandidate`，`complete` 走 `runLightweightCompletion`（10s 超时） |
| 反射器 | `longterm-memory-reflector.ts:19` | 只 import 类型 `MemoryAuditVerdict`，不直接调用审核函数 |
| 测试 | `longterm-memory-auditor.test.ts:14-17` | 直接调三个导出函数 |

没有 IPC handler、没有渲染层直接调用；审核只在主进程后台反思链路中发生。

### 4.2 出向

- 无 import 的运行时依赖；仅 `@profer/shared` 类型（`:13`）。
- 通过注入的 `complete` 间接调用 `runLightweightCompletion`（`agent-orchestrator.ts:823-830`），后者再走渠道/模型与网络；本文件不感知。

### 4.3 链路

```
STREAM 完成 (agent-orchestrator.ts:3229-3236)
  → scheduleLongTermMemoryReflection (agent-orchestrator.ts:803-835)
  → setImmediate → reflectOnTurn({auditCandidate}) (longterm-memory-reflector.ts:280-299)
  → auditLongTermMemoryCandidate
  → buildMemoryAuditPrompt → complete(...) [runLightweightCompletion, timeout 10s]
  → parseMemoryAuditVerdict → approved/rejected/unavailable
  → 反射器：rejected 丢弃；unavailable 置信度 0.45；approved 原 0.65
```

## 5. 数据 I/O、读写与副作用

- **输入**：`LongTermMemoryNodeInput`（`category/title/content/tags?/confidence?`，`packages/shared/src/types/longterm-memory.ts:56-62`）+ 用户原文。
- **输出**：`MemoryAuditVerdict`，不落盘、不写缓存。
- **磁盘/网络**：本文件零磁盘、零网络；`complete` 可能发起网络请求（调用方负责）。
- **副作用**：纯内存字符串处理；无日志（解析失败也不打印）；无进程/窗口操作。
- **幂等**：同一输入同一模型输出可重复解析；审核调用本身不幂等（每次都可能请求模型）。
- **敏感数据**：用户原文最多 1200 字 + 候选内容会进入模型请求；由调用方选择渠道，本文件不做脱敏。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 空/非字符串响应 | `:97` | `unavailable('模型未返回内容')` |
| 无 JSON 大括号 | `:104-106` | `unavailable('模型未返回 JSON 裁决')` |
| JSON 解析失败 | `:108-113` | `unavailable('裁决 JSON 解析失败')` |
| JSON 非对象 | `:114` | `unavailable('裁决不是 JSON 对象')` |
| `approved` 非布尔 | `:117` | `unavailable('裁决缺少布尔 approved 字段')` |
| `complete` 抛错 | `:139-141` | `unavailable('审核调用异常: …')`，不向上抛 |
| `complete` 返回 null | `:97` | `unavailable` |
| 取消 | 无 | 本文件无 AbortSignal；调用方 `runLightweightCompletion` 的取消/超时不由本文件传播 |
| 恢复 | 无 | 无持久状态；下次反思重新审核 |

**降级语义**：审核不可用不是“拒绝”，而是“降置信度放行”——反射器把候选 `confidence` 改为 0.45（`longterm-memory-reflector.ts:294-298`、`:76`）。这是产品选择，不是本文件的失败关闭。

## 7. 权限与权威状态

- **无权限分支**：没有 sender/role/actor 检查，也没有渠道白名单；任何调用者都能传入任意 `candidate/userMessage/complete`。
- **权威状态**：审核结论只是建议，最终写不写由反射器决定（`longterm-memory-reflector.ts:288-302`）；本文件不产生持久权威状态。
- **隔离声明**：system prompt 只在本文件定义（`:35-51`），不继承 Agent 的三层 Context Sandwich；测试断言 system 不含 `CDUT Studio`、`<SYSTEM_CONTEXT>`、`<USER_REQUEST>`、`workspace`（`longterm-memory-auditor.test.ts:31-36`）。但候选字段未分隔（§3.1），隔离不等于对候选内容免疫。

## 8. 修改影响面

- 改 `MEMORY_AUDIT_SYSTEM_PROMPT`/`MEMORY_AUDIT_MAX_TOKENS` 会影响所有后台审核请求；测试 `:31`、`:36`、`:125-126` 直接断言。
- 改 `parseMemoryAuditVerdict` 的三态/默认文案会影响反射器的 `rejected` 丢弃与 `unavailable` 降置信度分支（`longterm-memory-reflector.ts:290-298`）。
- 改 `MemoryAuditVerdict` 类型会影响 `longterm-memory-reflector.ts:19` 与 `ReflectTurnInput.auditCandidate`（`longterm-memory-reflector.ts:219-222`）。
- 改 `buildMemoryAuditPrompt` 的截断/结构会影响 `longterm-memory-auditor.test.ts:39-57`；也会改变进入模型的用户原文长度。
- 无磁盘/协议兼容问题；但 prompt 变更会影响模型行为，需以真实请求验证（本轮 NOT_RUN）。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`、typecheck、构建或 Electron/GUI。

直接测试：`apps/electron/src/main/lib/longterm-memory/longterm-memory-auditor.test.ts`，3 个 `describe`、**14 个 `test`**（`:28,39,49,61,68,75,82,89,96,100,104,113,129,139`）。

| # | 用例 | 设置/动作 | 真实断言 | 未覆盖点 |
| --- | --- | --- | --- | --- |
| 1 | system 隔离 | 构建提示词 | `systemPrompt === MEMORY_AUDIT_SYSTEM_PROMPT`；不含 `CDUT Studio`/`<SYSTEM_CONTEXT>`/`<USER_REQUEST>`/`workspace`；`maxTokens===700`（`:31-36`） | 未验证候选字段注入 |
| 2 | userPrompt 结构 | 同上 | 含 Category/Title/Content/Tags 四行与完整 XML 包裹（`:42-46`） | 未测空 tags/空消息 |
| 3 | 超长截断 | 1400 个 `x` | 含 1200 个 `x`，不含 1201 个（`:55-56`） | 未断言省略号 |
| 4 | 标准通过 | `{"approved":true,...}` | 精确 `{status:'approved',reason:'durable rule'}`（`:62-65`） | — |
| 5 | 标准拒绝 | `{"approved":false,...}` | 精确 `{status:'rejected',reason:'one-time task'}`（`:69-72`） | — |
| 6 | 围栏+前后缀 | `Verdict:\n```json...```\nDone` | 精确 approved/ok（`:76-79`） | 非 json 围栏 |
| 7 | 闭合 think | `<think>...</think>{...}` | rejected/question（`:83-86`） | 多个 think 块 |
| 8 | 未闭合 think 前缀 | `<think>budget exhausted ... {...}` | approved/ok（`:90-93`） | 实际无闭合标签，走的是首尾大括号提取 |
| 9 | 缺 reason | `{"approved":true}` | 默认“审核通过”（`:97`） | rejected 默认文案 |
| 10 | approved 非布尔 | `"yes"` | `unavailable`（`:101`） | 其他类型 |
| 11 | 空/非法 JSON | null、空格、无 JSON、截断 | 全部 `unavailable`（`:105-108`） | — |
| 12 | complete 成功 | 捕获 args | approved；system/maxTokens 透传（`:124-126`） | userPrompt 未逐字断言 |
| 13 | complete null | 返回 null | `unavailable`（`:136`） | reason 文案 |
| 14 | complete 抛错 | `network down` | `unavailable` 且 reason 含 `network down`（`:148-149`） | 超时/取消 |

**未覆盖**：真实模型请求、10s 超时、AbortSignal、提示注入、非英文 reason 截断、200 字上限、`approved:false` 缺 reason 默认文案、多个推理块/混合围栏。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 本文件不做网络 I/O，补全由 `complete` 注入 | 已证实 | `:130-141` 无 fetch/渠道 import |
| system prompt 独立定义且测试断言不含主 Agent 上下文 | 已证实 | `:35-51`；`longterm-memory-auditor.test.ts:31-36` |
| 用户原文超过 1200 字截断并加省略号 | 已证实 | `:60-62` |
| 解析容忍闭合/未闭合推理前缀与 json 围栏 | 已证实 | `:83-102`；测试 `:75-93` |
| `complete` 异常统一降级 `unavailable`，不向上抛 | 已证实 | `:136-141` |
| 审核不可用由反射器降置信度写入，不是拒绝 | 已证实 | `longterm-memory-reflector.ts:294-298` |
| 候选字段未做 XML/转义隔离 | 已证实 | `:67-77` 直接插值 |
| 解析不校验 reason 词数/语言 | 已证实 | `:119-121` 只截 200 字符 |
| 主进程调用超时为 10s | 已证实 | `agent-orchestrator.ts:829` |
| 取消不会从本文件传播到补全 | 已证实 | 本文件无 signal 参数；`:130-134` |
| 模型真实行为/审核准确率 | 未知 | 本轮未发请求 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `MAX_AUDIT_CONTEXT_CHARS` | 2、3.1 | `:16` | covered |
| `MEMORY_AUDIT_MAX_TOKENS` | 2、3.1 | `:18` | covered |
| `MEMORY_AUDIT_SYSTEM_PROMPT` | 2、3.1、7 | `:35-51` | covered |
| `buildMemoryAuditPrompt` | 3.1 | `:54-80` | covered |
| `REASONING_BLOCK/TAIL/CODE_FENCE` | 3.2 | `:83-86` | covered |
| `parseMemoryAuditVerdict` | 3.2、6 | `:96-124` | covered |
| `auditLongTermMemoryCandidate` | 3.3、6 | `:130-141` | covered |
| `unavailable` | 3.2、6 | `:88-90` | covered |
| 14 个测试断言 | 9 | `:28-149` | covered（静态读） |
| 真实模型/超时/取消 | 6、9、10 | — | unknown（NOT_RUN） |
