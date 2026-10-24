---
path: apps/electron/scripts/diagnose-openai-reasoning.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 87c7d89b88d4915936e8c31e497f6b9ce52073ad
sha256: 187b0bda98c221c6565bfac43e43c2ad6b956060426b0f200eead42597399c36
lines: 232
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/diagnose-openai-reasoning.mjs

## 1. 结论与边界

OpenAI 兼容 reasoning 诊断脚本（232 行，Node ESM）：按 Profer 的 OpenAI 兼容传输形态发一条流式 Chat Completions 请求，报告网关返回了哪些公开 reasoning 字段；明确不把密钥/响应体写盘（`apps/electron/scripts/diagnose-openai-reasoning.mjs:1-7`）。可选 `--responses` 再探 `/responses` 端点（第二次请求、可能消耗额度，`:31-32`）。边界：只诊断不修复；不读应用配置（凭据全来自环境变量）。

## 2. 导出与关键符号

无导出（CLI）。参数/环境：`--help`（打印 HELP 后 exit 0，`:37-40`）、`--responses`（`:227`）；环境变量 `OPENAI_BASE_URL`/`OPENAI_API_KEY`/`OPENAI_MODEL` 必填、`OPENAI_REASONING_EFFORT` 可选缺省 `'max'`（`:42-45`）。

内部符号：常量 `HELP`（用法文本，`:19-34`）、`args`（argv Set，`:36`）。
- 内部函数 `resolveEndpoint(input, endpoint)`（内部，`:59-67`）：URL 归一化（去 hash/search/尾斜杠，剥既有 `/(chat/completions|responses)$`）后拼 `<path>/<endpoint>`。
- 内部函数 `redactHeaders(headers)`（内部，`:69-75`）：仅保留 content-type/content-length/server/via/x-request-id/cf-ray 六种白名单头，值截 160 字符。
- 内部函数 `summarize(value, limit=280)`（内部，`:77-80`）：字符串压缩空白后截断；非字符串返回 undefined。
- 内部函数 `analyzeChatChunk(chunk, state)`（内部，`:82-100`）：统计 `choices[0].delta` 的 `reasoning_content/reasoning/analysis/thinking` 四字段（进 `state.reasoningFields` 集合 + 计字符 + 留 3 个样本）、`content` 字符（2 个样本）、`finish_reason`、`usage`。
- 内部函数 `readSse(response)`（内部，`:102-140`）：SSE 解码（`data:` 行、跳过 `[DONE]`、逐行 JSON.parse，坏行计 `malformedEvents`），返回 state 展开 + reasoningFields 转数组。
- 内部函数 `probeChatCompletions()`（内部，`:142-184`）：主探针。
- 内部函数 `probeResponses()`（内部，`:186-223`）：可选 `/responses` 探针。

## 3. 内部逻辑与关键流程

1. help/环境校验（`:36-57`）：缺任一必填 env → `Missing required environment variable(s): …` + `Run with --help for an example.` → exit 1。
2. `probeChatCompletions`（`:142-184`）：endpoint=`resolveEndpoint(baseUrl,'chat/completions')`；body=`{model, messages:[12 硬币称重推理题（要求不跳平衡分支）], stream:true, stream_options:{include_usage:true}, reasoning_effort:effort}`（`:144-153`）；打印 endpoint+请求体；`fetch` POST（Bearer apiKey）；打印 `HTTP <status> <statusText>` 与 redactHeaders；`!response.ok` → 打印 `Gateway error: <summarize(text,800)>` 并返回 `{ok:false}`（`:168-172`）；成功则 `readSse` 并打印 8 项统计（reasoning 字段/字符/样本、answer 字符/样本、finish reason、usage、非 JSON 事件数，`:174-183`）。返回 `{ok:true, result}`。
3. `probeResponses`（`:186-223`）：body=`{model, input:'Reply with the number 8.', reasoning:{effort, summary:'detailed'}}`；`!ok` 打印错误后 return；成功则 JSON.parse 响应体，枚举 `output[].type`、统计 `type==='reasoning'` 项及其 `summary[].text` 样本（`:210-219`）；非 JSON 成功体打印样本（`:220-222`）。
4. 主流程（`:225-232`）：`chat = await probeChatCompletions()`；`args.has('--responses')` 时再探；`process.exit(chat.ok ? 0 : 1)`。顶层 try/catch：任何异常打印 `Probe failed: <message>` → exit 1（`:229-231`）。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:51`（`"diagnose:openai-reasoning": "node scripts/diagnose-openai-reasoning.mjs"`）。全树 grep（工具：ripgrep，pattern `diagnose-openai-reasoning|diagnose:openai`）其余命中为本文件注释（`:12,15-16`），无 CI/测试引用。
- 出向：全局 `fetch`（HTTP POST ×1-2）、`process.env`/`process.argv`；无本地模块 import。

## 5. 数据 I/O、读写与副作用

- 输入：3+1 环境变量、argv；输出：stdout 诊断报告 + 退出码。
- 磁盘：零写入（文件头 `:6` 明确 never writes secrets or response bodies to disk）；密钥仅进 `Authorization` 头。
- 网络：真实网关请求（1 次必发，`--responses` 加 1 次）。
- 幂等/锁：请求无副作用写，重复执行安全；无锁、无缓存、无全局状态。
- 副作用：消耗网关额度；console 输出含请求体与响应摘要（样本截 280/800 字符）。

## 6. 分支、失败、取消与恢复

- exit 0：`--help` 或 chat 探针 ok；exit 1：缺 env（`:53-57`）、HTTP 非 2xx（`chat.ok=false`，`:228`）、顶层异常（`:229-231`）。
- 错误文案：`Missing required environment variable(s): …`、`Gateway error: …`/`(empty response)`、`Gateway returned an empty streaming response body.`（`readSse` throw，`:114`）、`Probe failed: …`、`Non-JSON SSE events ignored: N`、`Non-JSON successful response sample: …`。
- 失败后状态：无磁盘残留；恢复=修 env/网络后重跑。取消：无 AbortController，外部杀进程即止（fetch 挂起时无超时逻辑）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：凭据权威 = 环境变量（不落盘、不打印，`redactHeaders` 白名单防止头泄露，`:69-75`）；「网关是否返回公开 reasoning 字段」的判定权威 = `reasoningFields` 集合（四字段名清单 `:87`）。

## 8. 修改影响面

- `apps/electron/package.json:51`（diagnose:openai-reasoning）→ OpenAI 兼容渠道排障工具。
- 判定字段清单（`:87`）与 Profer OpenAI 兼容传输（域外）约定联动；诊断结论影响渠道接入决策（docs 域，非代码）。
- 无构建/CI/测试接线（§4 否定结论）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无测试（全树 grep `diagnose-openai` 于 *.test.ts 零命中）。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两个探针的请求体/统计项/退出码/脱敏策略 | 已证实 | `apps/electron/scripts/diagnose-openai-reasoning.mjs:1-232` 全文 |
| 唯一调用点 package.json:51 | 已证实 | grep 命中清单 |
| 真实网关的 reasoning 字段形态 | 未知 | 需真实 OPENAI_* 环境运行，NOT_RUN |
| 推理题 prompt 对 reasoning 输出的激发效果 | 推断 | prompt 设计意图（`:148`），无取证 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| --help / env 校验 | §2/§3/§6 | 36-57 | covered |
| resolveEndpoint/redactHeaders/summarize | §2 | 59-80 | covered |
| analyzeChatChunk 四 reasoning 字段统计 | §2/§3 | 82-100 | covered |
| readSse 解码与 malformed 计数 | §2/§3/§6 | 102-140 | covered |
| probeChatCompletions（主探针） | §3/§6 | 142-184 | covered |
| probeResponses（可选探针） | §3/§6 | 186-223 | covered |
| 主流程 exit 0/1 + 顶层 catch | §3/§6 | 225-232 | covered |
