---
path: apps/electron/src/main/lib/agent-sdk-auth-env.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: efc073dd78f1fc2553874ab24e9be447c2dcf46a
sha256: f635b0f194570dd1aaba07dc6f07ce1c87d92a6f7411e8308eb8ef42a0101d31
lines: 42
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-sdk-auth-env.test.ts

## 1. 测试目标

`applyAgentSdkAuthEnv`/`usesAgentSdkBearerWithUserAgent`：请求级隔离、渠道分流、Ollama 哨兵。不运行（`NOT_RUN`）。

## 2. 用例清单

4 用例（:5/:21/:27/:32），1 describe（:4）。
1. 并发请求级 env 隔离（:5-19）：anthropic→API_KEY、kimi-coding→AUTH_TOKEN+CUSTOM_HEADERS 含 'User-Agent:'（:13-17）；`process.env` 不变（:18）。
2. 强制 Bearer 不带渠道头（:21-25）：env toEqual `{ANTHROPIC_AUTH_TOKEN}`。
3. Bearer+UA 仅计划渠道（:27-30）：kimi true/anthropic false。
4. Ollama 空 key 哨兵（:32-41）：`{AUTH_TOKEN:'ollama', FINE_GRAINED:'0'}`，process.env 不污染（:40）。

## 3. 真实断言

`:13-18`/`:24`/`:28-29`/`:36-40`（toBe/toBeUndefined/toContain/toEqual 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：minimax 分支、zhipu/xiaomi 渠道。mock 边界：纯函数直调。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 隔离/forceBearer/渠道判定/Ollama | #1-#4 | covered |
| minimax/其余渠道 | — | unknown |
