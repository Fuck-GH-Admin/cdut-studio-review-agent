---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1e7db381027203df5086b728f11386740b6e5557
sha256: b89e27f7e7779c280ae21970f4231f214fbcf85d4aa91a5f0fb7c88bc4fa80e4
lines: 543
kind: source
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-pi-runtime.ts

## 1. 结论与边界

「砚小龙」**阉割版 Pi 运行时**（543 行）：与通用 Agent 工作区严格隔离的纯净执行循环，只具备 Chat（流式对话）+ Memory（0~1000 滑动窗口）+ ToolCalling（14 项浏览器门禁工具）三件事（`:4-7`）。边界红线（`:9-11`）："严禁挂载文件系统、外部终端、子会话委派与系统级环境变量"——复用 `@profer/core` 适配器+SSE 读取器，绕开 Pi SDK 特权能力。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `padAbortedToolResults` | `:91-105` | 用户中止时为未执行 toolCall 补占位回执（`'（操作已由用户手动中止，未执行）'` isError:true），保 tool_use/tool_result 配对（`:88-89` 协议错误防线）；结果已齐原样返回（`>=` 短路） |
| `estimateYanhuTokens` | `:116-121` | CJK 1 字符≈1 Token、非 CJK 4 字符≈1（适配器无真实 usage，`:112-114` 注释） |
| `YanhuPiRuntime`（class） | `:188-540` | 执行循环主体（见 §3） |
| `yanhuPiRuntime` | `:543` | 全局单例 |

内部常量：`MAX_TOOL_ITERATIONS=500:52`（失控护栏）；`YANHU_PARALLEL_SAFE_TOOLS:62-69`（6 工具白名单可并行；click/navigate/tab_actions/read_page 一律串行——因果基线/页面拓扑，`:56-60`）；`canRunInParallel:72-74`、`toToolResult:77-83`（串并行共用口径）、`CJK_CHAR_PATTERN:108`。

## 3. 内部逻辑与关键流程

`YanhuPiRuntime` 私有状态（`:188-203`）：`cache`（config/memory/convo/messages）、`store`（YanhuPetMemoryStore）、`activeRuns`（runId 集防并发）、`destroyed`、`closedEmit`、`inflightRefresh`。关键方法：

- `bootstrap/sendMessage/stream/sendToModel/cancel/destroy/dispose`（API 面，`:217-266`）；`ensureCache` 惰性装载+内存上限归一（`:259-284`）；`refreshConfig` 持久化+revision 广播+飞书设置变更（`:286-313`）；`updateConfig` 仅显式字段（`:315-342`）；`saveMemory` 原子落盘（`:344-355`）。
- 发送链 `sendToModel`（`:378-480`）：渠道解析（`:380-386`）、系统提示词组装（`buildYanhuPetSystemPrompt`）、续接裁剪（`pruneYanhuContinuationMessages`/`slimYanhuToolResultForHistory` `:411-415`）、适配器流循环（`:425-467`）、thinking 记录（`:441-444`）、`padAbortedToolResults` 收尾（`:457-459`）。
- 工具执行 `executeToolCall`（`:511-539`）：**未知工具自愈**（`:517-527`：回传当前可用工具清单而非死胡同"未知工具"——历史问题：提示词宣传了未挂载工具）；try/catch 归一错误。

## 4. 调用者与调用链

`yanhu-pet-window-manager`（Pet IPC→chat）；出向 `@profer/core`（getAdapter/streamSSE）、`@profer/shared`（YanhuPet* 类型）、settings/channel-manager/proxy-*/agent-prompt-utils、`./yanhu-browser-tools`、`./yanhu-pet-prompt`、`./yanhu-pet-memory`、`./yanhu-context-pruning`、`./yanhu-thinking-log`。

## 5. 数据 I/O、读写与副作用

HTTP（经适配器流式对话）+ 本地原子写（`~/.cdutai/yanhu-pet-history.json`，经 safe-file）；工具副作用经浏览器门禁（browser-tools）。

## 6. 分支、失败、取消与恢复

`activeRuns` 并发互斥；用户中止→padAbortedToolResults 配对恢复；未知工具→自愈清单；`destroyed` 闸全 API；异常归一为 ToolResult error（`:533-536`）。

## 7. 权限与权威状态

- **三不挂载**红线（`:9-11`）：无文件系统/终端/子会话工具（14 浏览器工具白名单）。
- devTools/视觉能力默认关（pet-memory `devToolsEnabled`/`enableVision` 仅显式开启）。
- 用量记账诚实性（`estimateYanhuTokens` 估算声明）。

## 8. 修改影响面

改循环影响桌宠对话全链；`YANHU_PARALLEL_SAFE_TOOLS` 增删影响并行安全；`padAbortedToolResults` 改动影响网关协议兼容。

## 9. 测试证据

`yanhu-pi-runtime.test.ts`（同批）：`padAbortedToolResults` 2 用例（补齐占位/已齐原样）+ pet-memory 族 6 用例（见 pet-memory 手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（含矛盾）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件结构/红线/并发闸/自愈 | 已证实 | 543 行全读 |
| `estimateYanhuTokens` 估算口径 | 已证实 | `:112-121`（自述为粗估） |
| **测试文件归属矛盾**：`yanhu-pi-runtime.test.ts` 大部分用例实测 pet-memory（resolveInjectedHistory/normalizeYanhuPetConfig/toChatMessages/YanhuPetMemoryStore/healYanhuMessages），仅 2 用例测本文件——照实记录 | 已证实 | 测试文件 `:10-228` |
| 适配器流行为/usage 缺失 | 未知 | @profer/core 不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全导出/内部方法 | §2/§3 | covered |
| 红线/并发/自愈 | §6/§7 | covered |
| 测试归属矛盾 | §10 | covered |
