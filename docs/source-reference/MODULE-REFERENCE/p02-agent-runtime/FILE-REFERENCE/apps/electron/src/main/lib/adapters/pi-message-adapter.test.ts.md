---
path: apps/electron/src/main/lib/adapters/pi-message-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 45b1392e0ac0d84ba4905470782ec513bab05436
sha256: f2c6975eac77086b490b0d818c865edf04a891e7965947f146a60c0a45a35cd6
lines: 305
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-message-adapter.test.ts

## 1. 测试目标

`pi-message-adapter.ts` 的消息转换/错误分级/断流保消息（#1268）/上下文消毒。mock 边界=纯构造器（`textAssistant`/`thinkingOnlyAssistant`/`writeToolCall`，`:6-36`），无 mock 模块。

## 2. 用例清单

3 describe、15 test 调用点（grep 核对；convertPiMessage 12 + sanitize 3 = 15）：

- `convertPiMessage`（`:38`）12 用例（QA N-NB54-08 校准枚举）：`:39` thinking-only→empty_output、`:51` 预览帧省略大 Write（`<1000` 字节）、`:62` 终帧保留完整（`>content.length`）、`:77` result subtype error_during_execution、`:88` 模型窗口/渠道模型持久化、`:108/:124/:139` network_error/provider_error 三分、`:155` 断流分离（errorText/uuid 保留/无 error 字段）、`:182` 纯错误不判定、`:197` 正文=错误文案副本不冒充、`:213` 正常消息不判定。
- `sanitizePiContextMessages`（`:226`）3 用例：`:227` 空图像→占位且原对象不可变、`:250` 非空透传+原数组引用、`:267` 历史折叠/最近 6 步完整。

## 3. 真实断言（锚定）

- `:47-48` error 对象 `toEqual`+`_emptyOutput` true；`:58-59` `input` 为 `{}` 且序列化 `<1_000`。
- `:69-74` 终帧 input 含 path/file_path/content 三键、序列化 `>` content 长度。
- `:101-104` `modelUsage` 为 `{gateway/deepseek-v4-pro: {contextWindow: 1_000_000}}`、`_channelModelId` 为 `'gateway/deepseek-v4-pro[1m]'`。
- `:120/:136/:151` errorType 分别为 network_error/network_error/provider_error。
- `:167-179` `hasTerminalErrorWithContent` true、`errorText` 为注入文案、`contentMessage.error` undefined、uuid `'assistant-sep'`、正文保留。
- `:242-247` 占位替换+原 `data` 仍为 `''`；`:263-264` `result` **toBe** 原数组。
- `:295-303` 折叠文案/长度界（`<700`、`<1300`）与最近 6 步 `3000` 不折叠。

## 4. 未覆盖与脆弱点

未覆盖：`normalizePermissionInput`/`restorePiInput`/`displayToolName` 多 edit→MultiEdit、`convertResultMessage` 的 cost 聚合、`hasToolResult`。测试内含硬编码 Windows 路径样例（`:31`，数据非行为）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 用例行号与断言文本 | 已证实 | `:38-304` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 转换/错误分级/断流/消毒 | §3 | covered |
| 权限输入归一/工具名 | §4 | unknown |
| 实际运行 | §5 | unknown（NOT_RUN） |
