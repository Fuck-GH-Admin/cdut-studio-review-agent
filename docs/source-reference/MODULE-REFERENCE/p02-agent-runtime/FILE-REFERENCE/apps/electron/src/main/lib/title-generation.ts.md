---
path: apps/electron/src/main/lib/title-generation.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: db36c58af44de0434cdad39ba112dfdd217db41f
sha256: 2f420853a9144a548fa3240140e7bb4e3629672b483b8603604496af7db2d1a3
lines: 313
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/title-generation.ts

## 1. 结论与边界

**会话标题生成唯一定义处**（`title-generation.ts:1-11` 注释）：提示词/清洗/信息量判定/命名窗口策略集中于此（Chat 与 Agent 两链共用，避免三处各写一份+内联正则被编码往返损坏）。**命名策略（2026-10 起）：首轮单次裁决**——仅首轮用首条用户消息生成一次并立即锁定（titleLockedAt），后续轮次完全短路；失败/超时/空 → 首句本地兜底，**会话永不停留在默认标题**；**用户手动改名永不覆盖**（`:10`）。

## 2. 导出与关键符号（14 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MAX_TITLE_LENGTH` | const | `:15` | 20 字符 |
| `SHORT_MESSAGE_THRESHOLD` | const | `:18` | 4（仅 Chat 链短路） |
| `buildTitlePrompt` | function | `:29-31` | 单条消息 prompt |
| `sanitizeGeneratedTitle` | function | `:89-95` | 剥 think 块/引号/截断；fallbackSource 兜底 |
| `createFallbackTitle` | function | `:104-117` | 首行确定性兜底 |
| `TITLE_SOURCE_MAX_COUNT`/`TITLE_SOURCE_MAX_CHARS` | const | `:122/:125` | 4 条 / 400 字符 |
| `TitleSourceEvaluation` | interface | `:211-216` | `{text, informative}` |
| `evaluateTitleSource` | function | `:224-236` | 三类脏数据过滤（§3.2） |
| `collectTitleSources` | function | `:243-256` | 去重+限长限条 |
| `buildWindowTitlePrompt` | function | `:259-262` | 前几轮窗口 prompt |
| `createWindowFallbackTitle` | function | `:265-271` | 最早有效来源首行 |
| `AutoTitleDecision` | type | `:276-280` | skip(locked/auto-generated/human-named) / generate(default/exploration) |
| `AutoTitleInput` | interface | `:283-298` | 含 `allowNonDefaultTitle`（Pi 探索/分叉首命名，`:293-296`） |
| `planAutoTitle` | function | `:307-313` | 首轮单次裁决（§3.4） |

内部：`TITLE_PROMPT`（`:26`，10 字符上限/禁标点前缀/「你好」→"日常问候"）、`WINDOW_TITLE_PROMPT`（`:137`，**禁止照抄单条原文**——历史标题多为首条截断）、`TITLE_PUNCTUATION`（保留中文弯引号/书名号，`:33-39`）、`THINK_BLOCK`（`:80`）、`INJECTED_BLOCK`/`INJECTED_TAG`（`:145-148`，剥离 Profer 注入上下文；user_request 只去标签留正文）、`SLASH_COMMAND_PREFIX`（`:156`，路径不误判命令）、`EMPTY_INTENT_TOKENS`（`:164-181`，寒暄/确认/催促词元表）、`extractVisibleTextBlock`/`extractTitleText`（`:50-77`，OpenAI 兼容三种 content 形态归一）、`normalizeIntentText`/`isPureAcknowledgement`/`stripInjectedContext`（`:184-208`）。

## 3. 内部逻辑与关键流程

1. **标题文本归一**（`:50-77`）：thinking/reasoning/tool 块不得进入标题（`:55`）；数组形态显式 text 块为权威，仅无显式块才兼容省略 type 的 `{text}`（`:63-72`）。
2. **信息量判定**（`:224-236`）：剥注入块/调度标记 → 纯斜杠命令取载荷（无载荷→无信息）→ 归一化长度 <3 或纯寒暄词元（最长匹配逐段消费 `:189-201`）→ 不构成主题。
3. **来源收敛**（`:243-256`）：会话顺序取最早 4 条、单条 400 字符、归一化去重。
4. **首轮单次裁决**（`:307-313`）：优先级 已定稿→已自动命名→人工命名（非默认即人工，`:311`）→ generate（default/exploration）；human-named 时调用方也应补 titleLockedAt（`:304-305`）。

## 4. 调用者与调用链

- 入向：chat-service 与 agent-orchestrator 两链（`:3-5` 自述唯一取用处）；「重新生成标题」手动路径（`:119`）。
- 出向：`@profer/session-core`（stripScheduledRunMarker `:12`）。无模型调用（prompt 构造在本文件，请求在调用方）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/状态。

## 6. 分支、失败、取消与恢复

失败兜底链：sanitize 空→fallbackSource 首句（`:94`）；模型不可调（Codex Responses 协议不适配标题请求，`:100-102`）→createFallbackTitle；不返回 null 除非无输入（`:116`）。

## 7. 权限与权威状态

语义红线：人工命名永不覆盖（`:10/:311`）、注入上下文不得当主题（`:143-145`）、多轮禁照抄原文（`:133-135`）。

## 8. 修改影响面

改策略/prompt/清洗 → Chat 与 Agent 双链标题行为；`EMPTY_INTENT_TOKENS` 表 → 信息量判定面。

## 9. 测试证据

**直接测试 `title-generation.test.ts`（296 行，同批，NOT_RUN）**：断言见测试手册。未覆盖项亦见测试手册 §4。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 导出+9 内部+全分支 | 已证实 | 逐行读 `:1-313` |
| 两链调用方遵守锁定协议 | 未知 | chat-service/orchestrator 跨文件 |
| 模型标题质量 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 14 导出 | §2 | `:15-313` | covered |
| 归一/信息量/来源/裁决 | §3 | `:50-313` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
