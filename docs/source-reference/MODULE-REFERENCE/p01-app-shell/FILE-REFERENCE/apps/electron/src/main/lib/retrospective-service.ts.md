---
path: apps/electron/src/main/lib/retrospective-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c9ca99bb2072435c9ab464bcac40c4f3f18d2a81
sha256: 053094ddba7f77f8762b7b6882e01b3da6f6b5c89af09b957980d05ae8815e92
lines: 438
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/retrospective-service.ts

## 1. 结论与边界

回溯放弃抽取服务（主进程）：通读会话 JSONL 的增量轮次，用一次性 LLM 调用抽取「显式放弃的探索方向」，高置信且能挂到现有任务节点的写成 `task_abandon_annotated` 事件进图（枯死支线），挂不上的降级为文字注记返回、不硬造节点（文件头 `apps/electron/src/main/lib/retrospective-service.ts:1-13`）。设计要点：只抓显式放弃（Plan B、Precision 0.85-0.90 前置 eval）、增量水位 `lastAnalyzedTurn` + OVERLAP 回看、复用 generateTitle 的渠道/鉴权/适配器链。

边界：不改 Automation/任务图结构（只 append 事件）；不做 UI；LLM 协议细节在 adapter；导出的 `oneShotJsonCall` 被 CSLab 审稿复用（`:231` 注释）。

## 2. 导出与关键符号

`export` 逐条核对：2 个函数导出（接口均为内部）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `oneShotJsonCall` | 函数（导出） | 232-307 | `(systemPrompt, userPrompt) => Promise<string \| null>` | 一次性 LLM JSON 调用 |
| `runRetrospective` | 函数（导出） | 341-438 | `(sessionId) => Promise<RetrospectiveResult>` | 主入口 |

内部符号：常量 `CONFIDENCE_THRESHOLD=0.7`（`:32`）、`OVERLAP=10`（`:34`）、`MAX_TRANSCRIPT_CHARS=50_000`（`:36`）、`ASSISTANT_CAP=2600`/`USER_CAP=2000`（`:37-38`）、`MAX_TOKENS=8000`（`:40`）、`ANTHROPIC_PROXY_PROVIDERS`（`:43-46`）；类型 `RenderedTurn`（`:50-54`）、`RawAbandonment`（`:57-66`）；函数 `stripThink`（`:72-74`）、`MAX_TOOLS_PER_TURN=14`（`:77`）、`assistantText`（`:86-122`）、`renderTurns`（`:125-137`）、`renderTranscript`（`:140-166`）、`SYSTEM_PROMPT`（`:170-191`）、`buildNodeList`（`:193-198`）、`buildUserPrompt`（`:200-227`）、`parseJsonLenient`（`:310-329`）、`toIntArray`（`:331-334`）。

## 3. 内部逻辑与关键流程

### 3.1 Turn 渲染（`:72-166`）

`stripThink` 去思考块（`:72-74`）；`assistantText` 把助手轮渲染为「文本 + `[Execution]` 工具摘要行（`summarizeToolInput`，超 14 条折叠 `:112-115`）+ `[N tool error(s) this turn]`（扫 `tool_result(is_error)` `:101-111`）」（`:86-122`）；`renderTurns` 用 `groupIntoTurns` 切 user/assistant 轮（system 跳过）并编号 1-based（`:125-137`）；`renderTranscript` 逐轮截断（user 2000/assistant 2600）+ 总量超 50000 时从尾部保留最近轮并 warn 丢弃数（`:140-166`）。

### 3.2 一次性 LLM 调用 `oneShotJsonCall`（`:232-307`）

settings 取 `agentChannelId`/`agentModelId`，缺→warn+null（`:233-239`）；渠道不存在→null（`:240-244`）；代管商用模式（`isCommercialBuild()||isCommercialMode()` 且 `isOfficialManagedChannel`）走团队鉴权 `getTeamAuthWithRefresh`，按 provider 选 `/v1/proxy/messages`（Anthropic 系 7 家，`:43-46`）或 `/v1/proxy/chat`，`apiKey=auth.proxyToken||auth.token`（`:248-256`）；否则 `decryptApiKey(channelId)`（`:258`）。借 `adapter.buildTitleRequest` 拿 url+鉴权头骨架后改写 body：`max_tokens=8000`、`temperature=0`（`:278-279`）；URL 含 `/chat/completions` → OpenAI 形态（messages+`response_format:json_object`），否则 Anthropic 形态（顶层 `system`+messages）（`:280-290`）。`getFetchFn(await getEffectiveProxyUrl())` 发请求（`:294-295`）；`!resp.ok` → warn+null（`:296-300`）；`adapter.parseTitleResponse(data)` 返回文本（`:302`）；异常 warn+null（`:303-306`）。

### 3.3 主入口 `runRetrospective`（`:341-438`）

1. 读 meta 水位 `lastAnalyzedTurn`（`:342-343`）、消息→turns（`:344-345`）、图（`:346`）。
2. 无新增轮次（`turns.length<=lastAnalyzed`）→ `{skipped:'no-new-turns'}`（`:357-360`）。
3. 窗口 `analyzeFrom=max(0, lastAnalyzed-OVERLAP)`（`:362`）；transcript 渲染；节点表（`:365`）。
4. LLM 返回 null → `{skipped:'llm-failed'}` **不推进水位**（`:369-373`）；JSON 解析失败 → `{skipped:'parse-failed'}` 不推进（`:375-379`）。
5. 逐条放弃（`:387-424`）：`confidence<0.7` 丢弃（`:388-391`）；`mappedTaskId` 必须存在于图中才落图（`:392`）；**去重**：目标节点已有 `abandonReason` 则跳过（OVERLAP 会重复抽到，`:393-398`）；落图 = `appendGraphEvent(task_abandon_annotated)`（`:400-413`）；游离条目进 `unmappedNotes`（`:414-423`）。
6. 推进水位 `updateAgentSessionMeta(..., {lastAnalyzedTurn: turns.length})` + 回读（`:427-428`）；返回图+计数+`analyzedRange`（`:431-437`）。

幂等：同水位重复跑不重复落地（`:339` 注释 + `:357` 短路 + 节点去重 `:395`）。

## 4. 调用者与调用链

入向（全树检索，证实）：

- `runRetrospective`：`ipc.ts:4436-4437`（动态 `import('./lib/retrospective-service')` 后调用）；渲染侧经 `preload/index.ts:1116,3259`。
- `oneShotJsonCall`：`lib/cslab/cslab-ai-review.ts:19,205`（CSLab 审稿复用）。

出向：`@profer/session-core`（`groupIntoTurns`/`extractUserText`/`summarizeToolInput`，`:16`）、`@profer/core` `getAdapter`（`:17`）、`@profer/shared`/`@profer/project-core` 类型（`:15,18`）、`./channel-manager`（`listChannels`/`decryptApiKey`/`isCommercialMode`，`:19`）、`./auth-service`（`:20`）、`./proxy-fetch`（`:21`）、`./proxy-settings-service`（`:22`）、`./build-target`（`:23`）、`./official-channel`（`:24`）、`./settings-service`（`:25`）、`./agent-session-manager`（`getAgentSessionSDKMessages`/`getAgentSessionMeta`/`updateAgentSessionMeta`，`:26`）、`./project-graph-service`（`loadGraph`/`appendGraphEvent`，`:27`）。

## 5. 数据 I/O、读写与副作用

- 读：会话 SDK 消息（`getAgentSessionSDKMessages`）、meta、图。写：`appendGraphEvent`（图事件追加）、`updateAgentSessionMeta`（水位）。网络：一次性 LLM 请求（`:295`）。
- 副作用：`console.log/warn` 密集诊断（含 `[回溯][诊断]` 前缀）。
- 原子性/并发：事件逐条 append（`:412`）；水位在全部落地后推进（`:427`）；失败不推进 → 可重试；同会话并发跑两次可能重复 append（无锁，去重仅看节点 abandonReason，推断风险）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 水位 |
| --- | --- | --- | --- |
| no-new-turns | 无新增 | 357-360 | 不变 |
| llm-failed | 调用失败/渠道缺失/鉴权过期 | 236-253, 296-306, 369-373 | **不推进（可重试）** |
| parse-failed | JSON 不可解析 | 375-379 | 不推进 |
| 置信不足丢弃 | conf<0.7 | 388-391 | 推进 |
| 已标注节点去重 | abandonReason 已存在 | 393-398 | 推进 |
| 游离注记 | mappedTaskId 无效 | 392, 414-423 | 推进 |

`parseJsonLenient` 容忍 markdown 围栏/前后噪声（`:310-329`）。无取消机制（单次调用不可中断，推断）；无恢复概念——失败靠下次调用重试。

## 7. 权限与权威状态

- 鉴权分支（`:248-258`）：代管商用模式走团队账号（过期→跳过），其余用本地解密 API key；渠道权威=`channel-manager`。
- 任务图写权限：本服务只 append `task_abandon_annotated` 事件（`:401-412`），不改节点本体；`mappedTaskId` 必须命中现有节点（`:392`），不硬造节点（`:6` 设计注释）。
- 无 Electron sender/role 检查，依据：本文件无 sender 校验；IPC 面在 `ipc.ts:4436`。

## 8. 修改影响面

- `ipc.ts:4436`（回溯 IPC）→ 渲染探索溯源面板；`cslab-ai-review.ts:205`（oneShotJsonCall 复用方）。
- SYSTEM_PROMPT/JSON schema（`:170-227`）是与模型的契约，改动影响抽取质量（前置 eval 结论绑定，`:9` 注释）。
- `appendGraphEvent`/`updateAgentSessionMeta` 依赖 project-graph/agent-session-manager 的事件与 meta 格式。
- 需同步的测试：无（0 test，§9）。

## 9. 测试证据

直接测试：**无**。全树 `*.test.*`/`*.spec.*` 检索 `retrospective-service`/`runRetrospective`/`oneShotJsonCall` 0 命中。间接证据：无。

真实断言：不适用。未覆盖：全部分支（渲染、调用、解析、去重、水位）。

NOT_RUN：本轮未运行任何测试/typecheck/构建/真实 LLM 调用。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 全内部符号行号 | 已证实 | `:32-334` 逐行读 |
| 渲染/调用/落图/水位全链 | 已证实 | `:72-438` |
| 失败不推进水位 | 已证实 | `:369-379` |
| 节点去重防重刨 | 已证实 | `:393-398` |
| 调用链（ipc 动态导入 + cslab 复用） | 已证实 | `ipc.ts:4436-4437`；`cslab-ai-review.ts:19,205` |
| Anthropic 系 7 供应商 proxy 路径 | 已证实 | `:43-46,254` |
| 同会话并发重复 append 风险 | 推断 | 无锁 + 去重仅查节点 |
| adapter buildTitleRequest/parseTitleResponse 行为 | 未知 | @profer/core（非本批） |
| 前置 eval（Precision 0.85-0.90）实际结果 | 未知 | 注释声明（`:9`），eval 产物不在冻结树核对 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2-3 | 232-307, 341-438 | covered |
| Turn 渲染（stripThink/工具摘要/错误标） | §3.1 | 72-166 | covered |
| oneShotJsonCall（双协议/鉴权/失败） | §3.2 | 232-307 | covered |
| runRetrospective（窗口/去重/水位） | §3.3 | 341-438 | covered |
| SYSTEM_PROMPT/JSON 契约 | §8 | 170-227 | covered |
| 调用链 | §4 | - | covered |
| adapter/eval/运行期 | §10 | - | unknown（非本批/NOT_RUN） |
