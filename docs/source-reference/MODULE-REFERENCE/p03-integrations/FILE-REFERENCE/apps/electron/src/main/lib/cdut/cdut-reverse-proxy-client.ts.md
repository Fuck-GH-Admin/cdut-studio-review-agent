---
path: apps/electron/src/main/lib/cdut/cdut-reverse-proxy-client.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fb41320f7877760d3bbffd37bccbd927e2a03858
sha256: 4bbffbfbdb38a11d0867443629b5f379ae5361680a98d6c48b75d36fffb4fdd6
lines: 124
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/cdut-reverse-proxy-client.ts

## 1. 结论与边界

CDUT **逆向反代大模型客户端**（第 9 个内置 Tool 的业务预留桩，运行时代码）：发起 AI 自构提问经主进程转发到反代大模型取结构化回答；继承特区账户门禁。预留状态如实标注：HTTP 转发框架完整、**端点尚未绑定**——缺失时返回结构化「预留未接入」响应，**绝不伪造回答**；端点/Token 经环境变量注入（`apps/electron/src/main/lib/cdut/cdut-reverse-proxy-client.ts:1-12`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `executeCdutReverseProxy` | 导出异步函数 | 58-124 | `(params: CdutReverseProxyParams): Promise<CdutReverseProxyResult>` | 唯一导出 |

内部：`REVERSE_PROXY_ENDPOINT`（`:17`，env `CDUT_REVERSE_PROXY_ENDPOINT`）、`REVERSE_PROXY_TOKEN`（`:20`，env `CDUT_REVERSE_PROXY_TOKEN`）、`REVERSE_PROXY_TIMEOUT_MS=60_000`（`:23`）、`normalizeReverseProxyBody`（`:36-50`，answer/content/text 三字段兼容；空→`empty_response` 失败）。

## 3. 内部逻辑与关键流程

`executeCdutReverseProxy`（`:58-124`）：queryPrompt 空→`invalid_params/empty_query_prompt`（`:61-68`）；**端点未配置→`reserved/endpoint_not_configured`** 结构化预留返回（回显提问内容，`:70-81`）；否则 AbortController 60s 硬超时（`:83-84`）+POST JSON（Bearer 可选，`:87-99`）；非 2xx→`http_error`（detail 截 500 字符，`:101-109`）；异常→`request_failed`（`:113-120`）；finally 清定时器（`:121-123`）。

## 4. 调用者与调用链

入向：第 9 工具注册处（非本批）。出向：`@profer/shared`（`CdutReverseProxyParams/Result` 类型）；全局 `fetch`。

## 5. 数据 I/O 与副作用

网络 POST（仅当端点配置）；读 2 个环境变量。无磁盘。

## 6. 分支、失败、取消与恢复

五状态全枚举：invalid_params/empty_query_prompt、reserved、empty_response、http_error、request_failed——失败皆结构化不抛（`:62/:39/:103/:115`）；超时 abort→request_failed。

## 7. 权限与权威状态

门禁继承声明（`:6`，挂载点在调用方）；Token 走 Bearer（仅配置时）；「绝不伪造回答」红线（`:10`）。

## 8. 修改影响面

端点绑定后即激活转发链路；`normalizeReverseProxyBody` 字段兼容性影响真实服务接入。

## 9. 测试证据

无专属测试（冻结树 glob `**/cdut-reverse-proxy*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+五状态+预留红线 | 已证实 | `:1-124` |
| 端点实配状态 | 未知 | 运行时 env 依赖 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
