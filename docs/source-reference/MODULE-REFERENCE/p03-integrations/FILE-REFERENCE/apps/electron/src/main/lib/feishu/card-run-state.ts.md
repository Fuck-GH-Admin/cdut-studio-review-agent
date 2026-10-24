---
path: apps/electron/src/main/lib/feishu/card-run-state.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 55b9d57423ea4bb2e3e67342f04082d2a3d12adc
sha256: 1096f2ed58d804ff78aa3e2d2deabe3490753ea7ee8b686e6c94cccac222d548
lines: 354
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu/card-run-state.ts

## 1. 结论与边界

**飞书流式卡片运行时状态机**：把 AgentStreamPayload（sdk_message+profer_event）累积成 RunState，渲染层无时序转 CardKit 2.0 JSON；设计参考 zara/feishu-claude-code-bridge 但消费 Profer SDKMessage 形态；**所有 reducer 纯函数**（`apps/electron/src/main/lib/feishu/card-run-state.ts:1-17`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ToolStatus`/`ToolEntry`/`Block`/`FooterStatus`/`Terminal` | 类型 | 19-35 | |
| `RunState` | 接口 | 37-61 | blocks/reasoning/footer/terminal/meta/**assistantSourceOrder+assistantThinking**（Pi partial 累计快照按 uuid 替换，`:46-52`） |
| `createInitialState` | 函数 | 63-74 | |
| `reduce` | 函数 | 180-310 | 核心 reducer |
| `markInterrupted`/`markIdleTimeout`/`markError` | 函数 | 312-342 | 终态标记 |
| `finalizeIfRunning` | 函数 | 345-354 | 兜底收尾 |

## 3. 内部逻辑与关键流程

`reduce` 分支：

- **assistant**（`:184-247`）：记录 model；顶层 error→markError（`:192-194`）；**Pi `_partial` 累计快照→`replaceAssistantSnapshot` 按 sourceId 替换不重复拼接**（`:196-230`，关键语义）；否则增量 appendText/appendThinking/startTool。
- **user**（`:249-262`）：tool_result→completeTool（is_error 判定）。
- **result**（`:264-296`）：meta（durationMs=now-startedAt、tokens、cost）；`subtype.startsWith('error')`→error 终态（含 error_max_turns 等，`:273-275`）。
- **profer_event**（`:301-307`）：model_resolved→meta.model。

内部：`closeStreamingText`、`appendText`（同 sourceId 续写）、`replaceAssistantSnapshot`（旧块移除+按序插入+reasoning 按 sourceOrder 拼接，`:130-154`）、`stringifyToolResult`（`:156-178`）。

## 4. 调用者与调用链

入向：`card-renderer-v2.ts:1`（类型）、`card-run-state.test.ts:3`、飞书桥接层（非本批）。出向：`@profer/shared` 类型。

## 5. 数据 I/O 与副作用

无（纯函数）。

## 6. 分支、失败、取消与恢复

全分支：running/done/interrupted/error/idle_timeout；assistant 顶层 error 直转终态（注释：SDK 偶尔在 assistant 帧带 error，`:190-191`）。

## 7. 权限与权威状态

不适用（状态机）。

## 8. 修改影响面

快照替换语义是 Pi partial 契约；renderCard 消费 RunState（双侧同步）。

## 9. 测试证据

`card-run-state.test.ts`（2 用例：partial 快照替换/final 替换不追加，另篇）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出+reduce 全分支+快照语义 | 已证实 | `:1-354` 逐行 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
