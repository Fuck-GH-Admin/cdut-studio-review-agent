---
path: apps/electron/src/main/lib/pi-task-prompt.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f89676d7cb875dc0073248c5ee83bad55a87c680
sha256: ab6eed9891db03933350ea5cfe5e7d18ba53dca70c191049d4ba2769732c93f8
lines: 157
kind: source
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-task-prompt.ts

## 1. 结论与边界

Pi system prompt 的静态化裁剪（主进程运行时）：为前缀缓存命中（Cache Read 1 折），同一会话内 `systemPrompt` 必须字节级稳定——`buildPiTaskPrompt` 只按「会话稳定」的工具挂载/能力开关裁剪低频 SOP，**不参考用户提问文本**（文件头 `apps/electron/src/main/lib/pi-task-prompt.ts:1-11`）。裁剪只做原位删除、不搬段落，保留段落留在原 XML 父标签内（`:9-10`）。

边界：不组装基础 prompt（`basePrompt` 由 `buildSystemPrompt()` 产出）；不改工具权限（裁剪只影响说明文案，`:6-7`）；不解析用户输入。

## 2. 导出与关键符号

`export` 逐条核对：1 接口 + 1 函数 = 2 个导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `PiTaskPromptOptions` | 接口（导出） | 13-26 | `{basePrompt, userMessage, toolNames, forceAutomation?, pptCapabilityActive?}` | `userMessage` 仅兼容保留不参与裁剪（`:16-20`） |
| `buildPiTaskPrompt` | 函数（导出） | 93-157 | `(options) => string` | 返回裁剪后 prompt（`.trim()`） |

内部符号：`PromptSection`（`:28-31`）、`removeSection`（`:33-49`，标记对切段）、`removeHeadingSection`（`:52-62`，取到下一 `## `/闭标签）、`pruneSection`/`pruneHeadingSection`（`:64-79`，keep=true 原样返回）、`hasAnyTool`（`:81-83`）。

## 3. 内部逻辑与关键流程

按固定顺序六段裁剪（`:93-156`）：

1. `## SubAgent Delegation Policy`：有 `mcp__collaboration__*` 工具才保留；endMarker 兼容 `</subagents>`/`## Pi Agent Runtime`（`:97-103`）。
2. `### Pi Runtime & File Memory`（heading 型）：有 `mcp__memory-archive__*` 或 `mcp__team-memory__*` 才保留（`:105-108`）。
3. `## Team Shared Knowledge Memory`：有 `mcp__team-memory__*` 才保留（`:110-111`）。「知识维护架构」段常驻不裁（`:113-114`）。
4. `7. **Scheduled tasks (Automation)**`：有 `mcp__automation__*` 或 `forceAutomation` 才保留；endMarker 给出 8/9/10 条与后续标题等 7 个候选兜底（`:116-133`）。
5. 图像/皮肤/PPT 交付段（`8. **Sending existing local images**` 起）：`send_local_image`/`generate_image`/`create_skin` 任一注册，或 PPT 工作流四件齐备（`plan_ppt_visuals`+`audit_ppt_delivery`+`open_file_preview`+`inspect_file_preview`）且 `pptCapabilityActive===true` 才保留（`:135-151`）。
6. `## CDUT Studio Managed Browser`（heading 型）：有 `Browser*` 工具才保留（`:153-154`）。

失败安全：marker 找不到时 `removeSection`/`removeHeadingSection` 返回 undefined，`prune*` 原样保留 prompt，绝不静默丢失安全指令（`:90-91` 注释、`:70-78`）。

## 4. 调用者与调用链

入向（全树检索，证实）：`agent-orchestrator.ts:136`（import）、`:2111`（`const compressedSystemPrompt = buildPiTaskPrompt({…})`，Pi 轮次组装）。测试：`pi-task-prompt.test.ts`（本批 13 用例）；`agent-prompt-builder.test.ts`（间接引用，非本批）。

出向：无模块导入（纯字符串操作，全文无 import）。

## 5. 数据 I/O、读写与副作用

纯函数：输入字符串/工具名集合，输出字符串。无 I/O、无全局状态、无副作用（依据：全文读）。幂等：同输入同输出；同会话工具集不变时输出字节级一致（测试 `:130-134` 断言 `b === a`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 各段保留/删除 | 工具前缀匹配/能力开关 | 97-154 |
| marker 缺失保守保留 | remove* 返回 undefined | 70-78 |
| PPT 双条件 | `pptCapabilityActive` + 四工具齐 | 136-140 |
| forceAutomation 强制 | 自动任务上下文 | 132 |

无异常路径（无 throw/try）；无取消/恢复概念，依据：纯函数一次成型。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查；文件头明确“裁剪不隐藏能力、不改变权限”（`:6-7`），能力权威在 ToolDefinition/会话门禁（`pptCapabilityActive` 由调用方传入）。

## 8. 修改影响面

- 调用方 `agent-orchestrator.ts:2111`：输出直接进模型 system prompt，改裁剪逻辑影响缓存命中率与模型可见指令。
- marker 字符串与真实 prompt 文档（buildSystemPrompt 侧）构成隐式契约：文案变更需双侧同步（`:91` 保守策略降低风险）。
- 需同步的测试：`pi-task-prompt.test.ts`（13 用例，本批）、`agent-prompt-builder.test.ts`（间接）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/pi-task-prompt.test.ts`（本批，13 用例，逐条见该手册）。关键断言：Tier 0 仅留核心+知识治理（测试 `:62-81`）；字节稳定 `expect(b).toBe(a)`（`:133`）；XML 拓扑守恒（`:280-288` 计数与位置断言）；近因提醒恒为最后一段（`:291`）。

未覆盖：真实 `buildSystemPrompt` 输出形态（测试用 BASE_PROMPT 字面量夹具）；`userMessage` 兼容字段行为。

NOT_RUN：本轮未运行任何测试/typecheck/构建；断言均为静态读取。

间接证据：`agent-prompt-builder.test.ts`（非本批，未逐条读，标间接）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出 + 内部 5 符号 | 已证实 | `:13-93` 逐行读 |
| 六段裁剪条件与顺序 | 已证实 | `:97-154` |
| marker 缺失保守保留 | 已证实 | `:70-78` + `:90-91` |
| 纯函数无副作用 | 已证实 | 全文读（无 import/IO） |
| 唯一调用方 | 已证实 | `agent-orchestrator.ts:136,2111` |
| 真实 prompt 文档段落形态 | 未知 | buildSystemPrompt 在别处（非本批） |
| 运行期缓存命中效果 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PiTaskPromptOptions` | §2 | 13-26 | covered |
| `buildPiTaskPrompt` | §3 | 93-157 | covered |
| `removeSection`/`removeHeadingSection`/`prune*` | §2, §6 | 33-79 | covered |
| 六段裁剪条件 | §3 | 97-154 | covered |
| 调用链 | §4 | - | covered |
| prompt 文档实际形态 | §10 | - | unknown（非本批） |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
