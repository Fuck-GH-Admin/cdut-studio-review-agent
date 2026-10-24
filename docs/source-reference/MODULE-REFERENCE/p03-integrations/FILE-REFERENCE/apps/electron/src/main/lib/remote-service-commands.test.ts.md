---
path: apps/electron/src/main/lib/remote-service-commands.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 76800cfc74f36450f65e47af3c67e870070e3abd
sha256: d79a1676d12b890d8c0223005ebc3094408ae8d22c31a195660da9e0501dcd85
lines: 79
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-service-commands.test.ts

## 1. 测试目标

`remote-service.ts` 的 `handleRemoteCommand` 新增/改动分支（**功能级验证，不替代真机验收** `:5`）：参数校验、命令可达性、旧端兼容。

## 2. 用例清单

**7 个 `test()`**（describe `remote-service 新增 WS 命令`）：get_pi_reasoning_capability 缺 provider（`:11`）、已 await 能力对象（**:16，关键回归：未 await 时 data 是 Promise 序列化成 {}** `:24`）、无档位 provider 返回 undefined（`:32`）、search_workspace_files 缺 sessionId+**不接受客户端 roots**（`:42`）、未知会话错误（客户端 roots 不参与授权 `:55`）、send_message 缺参报错未启动 run（`:70`）、未知指令旧文案（`:75`）。

## 3. 真实断言

- `:13/:52/:72/:77` `toEqual` 错误文案（'缺少 provider'/'缺少 sessionId'/'缺少 channelId（无法确定 API Key）'/'未知指令: …'）。
- `:25-29` data 非 Promise（then 不为 function）、levels 数组含 'off'/'high'、defaultLevel string。
- `:39` 无档位 → `data` `toBeUndefined()`。
- `:65-67` 未知会话 → '会话不存在或未绑定工作区'。

## 4. 未覆盖与脆弱点

不依赖真实会话数据（`:6-8`）；真机端到端未做。错误文案断言耦合。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言如 §3 | 已证实 | 逐行读 `:1-79` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 参数校验/可达/兼容 | 7 | covered |
