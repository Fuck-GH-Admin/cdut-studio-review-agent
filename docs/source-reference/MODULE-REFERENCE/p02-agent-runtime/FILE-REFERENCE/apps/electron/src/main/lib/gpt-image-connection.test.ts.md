---
path: apps/electron/src/main/lib/gpt-image-connection.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7798efef079321ea8af42c1f303ed3e820a6e8f8
sha256: 793d216ae2ea4743163d746cd8b2c071b058e436ada1d153740191dbd2702715
lines: 138
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/gpt-image-connection.test.ts

## 1. 测试目标

GPT Image 连接测试三模式：官方（团队健康接口/未登录/失效）、BYOK（OpenAI/xAI）、legacy nano-banana；URL/Header/文案逐项锁定（不执行生图）。

## 2. 用例清单

6 用例 / 1 describe（`GPT Image 连接测试` :39）。mock electron/chat-tool-config/auth-service（:5-22）；fetch mock（每例捕获 Request）；afterEach 还原（:31-37）。

| # | 用例 | 行 | 核心断言 |
| --- | --- | --- | --- |
| 1 | 官方模式不要求 Key | 41-58 | `…/v1/account/channels/health`、`Bearer team-token`、`连接成功，Profer 官方生图服务可用` |
| 2 | 未登录提示登录 | 60-68 | `请先登录 Profer 团队账号`（fetch 断言不发起） |
| 3 | 账号失效提示重登 | 70-76 | 401→`登录已失效，请重新登录` |
| 4 | BYOK 用 models 接口 | 78-95 | `https://byok.example/v1/models`+`Bearer sk-test`+`OpenAI Images API 可用` |
| 5 | xAI 去尾 /v1 | 97-117 | `https://api.x.ai/v1/`→`https://api.x.ai/v1/models` |
| 6 | legacy nano-banana 要 Key | 123-136 | `https://legacy.example/v1/models`+`Bearer sk-legacy`+`OpenAI API 可用` |

## 3. 真实断言

如 §2 表（逐条读自 :41-136）。

## 4. 未覆盖与脆弱点

- 未覆盖：真实网络连通（全部 fetch mock）；401/403 外的失败 status 文案分支。
- 脆弱点：`credentials`/`auth` 模块级变量经 mock.module 闭包改写。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例断言如 §2 | 已证实 | 本文件逐行 |
| 三模式文案/URL/Header 被固定 | 已证实 | 用例族 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 官方三态 | §2 | covered |
| BYOK 两 provider | §2 | covered |
| legacy | §2 | covered |
| 真实服务 | §4 | unknown（mock 边界） |
