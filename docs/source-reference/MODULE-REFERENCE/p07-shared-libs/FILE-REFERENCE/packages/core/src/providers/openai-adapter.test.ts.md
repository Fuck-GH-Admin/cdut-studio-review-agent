---
path: packages/core/src/providers/openai-adapter.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 99c4082414b517a7f42e5272a13f3145c4c873d8
sha256: 18a222dc99b095c26411b05d94c24a7ba4d976cb5e53902b7d4c0b92f77da712
lines: 31
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/providers/openai-adapter.test.ts

## 1. 测试目标

`OpenAIAdapter` 的 Ollama 特判：根地址→OpenAI-compatible chat endpoint 拼接、空 key 时 `Authorization: Bearer ollama` 兜底、`/v1` 不重复拼接、显式 key 保留。bun:test。**边界（已证实）**：被测实现 `openai-adapter.ts` **不在本批 scope**（他批主责）——断言已逐条读，被断言的源码行为未在本批回源。

## 2. 用例清单

共 **2 个 `test(`**（计数核对）：

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:5` | 根地址使用 Ollama endpoint | `new OpenAIAdapter('ollama')`，baseUrl `http://127.0.0.1:11434`、apiKey `''`、modelId `qwen3:8b`、空 history、`readImageAttachments:()=>[]` | `buildStreamRequest` | 独立 |
| `:20` | `/v1` 不重复拼接，显式 key 保留 | baseUrl `http://127.0.0.1:11434/v1`、apiKey `local-key`、modelId `llama3.2`、prompt `title` | `buildTitleRequest` | 独立 |

## 3. 真实断言

- `:15` `request.url === 'http://127.0.0.1:11434/v1/chat/completions'`。
- `:16` `request.headers.Authorization === 'Bearer ollama'`（空 key 兜底）。
- `:17` `JSON.parse(request.body)` `toMatchObject({ model: 'qwen3:8b', stream: true })`。
- `:28` `request.url === 'http://127.0.0.1:11434/v1/chat/completions'`（`/v1` 未重复拼接）。
- `:29` `Authorization === 'Bearer local-key'`（显式 key 保留）。

## 4. 未覆盖与脆弱点

- 未覆盖：非 ollama 协议串的 URL 拼接、错误分支、`buildStreamRequest` 的 history/图片参数形态。
- 脆弱点：断言依赖 URL 字面与 header 键名。
- mock 边界：无 mock，直接构造适配器调用真实构建函数（但实现文件域外）。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例、5 断言、夹具形状 | 已证实 | 全 31 行逐行读 |
| 被断言行为（URL 拼接/兜底 key）在实现中成立 | 未知（域外未回源） | `openai-adapter.ts` 不在本批 scope |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 用例 | §2/§3 | 5-30 | covered |
| 域外边界 | §1/§5 | — | covered（如实标注） |
