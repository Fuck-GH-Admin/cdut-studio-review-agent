---
path: packages/session-core/src/group.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a90ec9d588823da196af073f988eb4e297ba965a
sha256: 7c12b4275ae97abdf4e0aec43279a88e99a38f505ce0ae58bd01de805f1317f1
lines: 294
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/session-core/src/group.ts

## 1. 结论与边界

Turn 分组——会话「快照去重」唯一真源（头注释 :1-9）：流式 SDKMessage（含同回合多快照碎片）→ 可渲染 Turn 分组；逻辑逐字迁移自渲染层 SDKMessageRenderer.tsx。

## 2. 导出与关键符号

导出 10 条（`export` :21/:25/:34/:50/:64/:81/:96/:195/:258/:265）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `MessageMeta`/`extractMeta` | `:21-30` | 提取 `_createdAt` |
| `extractUserText` | `:34-46` | user 消息 text 块拼接 |
| `isUserInputMessage` | `:50-60` | 真用户输入判定：非 parent_tool_use_id/非 isSynthetic/非 goal 迭代/无 tool_result/有文本 |
| `AssistantTurn` | `:64-79` | assistant-turn 组（含 `startsAfterWake` :78，后台唤醒阻断合并） |
| `MessageGroup` | `:81-84` | user/system/assistant-turn 三态 |
| `groupIntoTurns(messages, sessionModelId?)` | `:96-185` | 主分组（见 §3） |
| `countTurns` | `:195-201` | 可分析轮次口径（user+assistant-turn，注释 :188-193 与 retrospective 水位一致） |
| `stripScheduledRunMarker` | `:258-260` | 去 `<!--PROMA_SCHEDULED_RUN-->` |
| `getGroupPreview` | `:265-294` | 迷你地图预览（user 去附件/引文截 200 :271-274；system 三 subtype 文案 :277-279；assistant text 拼接截 200 :283-293） |

## 3. 内部逻辑与关键流程

`groupIntoTurns` 五规则（:89-95 注释）：真用户输入/goal 迭代→独立组（:114-123）；tool_result 归当前 turn（:124-129）；assistant 开 turn/续 turn（:130-152，跳过 isReplay :133）；system 仅 compact_boundary/compacting/permission_denied 独立（:157-159），task_notification 无 turn 时标记唤醒边界（:160-167，注释 :99-101：不用 result 做信号防误伤）；prompt_suggestion 跳过（:174-176）。后处理 `mergeAdjacentSameModelTurns`（:210-252）：同模型相邻 turn 合并，startsAfterWake/user 输入/compact_boundary/permission_denied 阻断（:222-232）。

## 4. 调用者与调用链

入向（子agent 交叉核）：`transcript.ts:11`（包内）、`index.ts:19-30` 聚合。经 index 生产消费 10 处：`cli/commands/{outline,search,info,export}.ts`、`main/lib/{agent-orchestrator:93, agent-session-manager:79, retrospective-service:16, title-generation:12}`、`renderer/components/agent/{SDKMessageRenderer:15, AgentMessages:41}`。否定：`countTurns`/`extractMeta` 无外部消费者（SDKMessageRenderer:204 为本地同名函数非 import）；`getGroupPreview` 仅 transcript.ts 用。出向：`@profer/shared`（isGoalIterationMessage :55/:114/:267）、`./thinking-tags`（:287）。

## 5. 数据 I/O、读写与副作用

无（纯函数）。

## 6. 分支、失败、取消与恢复

分组五规则+合并后处理（§3）；无 throw。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支；「快照去重唯一真源」是口径权威（:4-6 注释，countTurns 水位口径 :188-193 两侧必须一致）。

## 8. 修改影响面

全部会话渲染/CLI/回溯链（10 生产消费点）；分组语义改动影响渲染层展示与 retrospective 水位。

## 9. 测试证据

`packages/session-core/src/session-core.test.ts`（批外，未在本批 18 清单，逐行读状态未知）经 index 间接覆盖。本批内无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 10 条；五规则+合并 | 已证实 | :81-252 |
| countTurns/extractMeta 无外部消费者 | 已证实（否定） | §4 子agent 全树检索 |
| session-core.test 断言细节 | 未知（批外文件） | — |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 导出+五规则+合并 | §2/§3 | :21-294 | covered |
| 否定结论 | §4/§10 | — | covered |
| 测试断言 | §9 | — | unknown（批外） |
