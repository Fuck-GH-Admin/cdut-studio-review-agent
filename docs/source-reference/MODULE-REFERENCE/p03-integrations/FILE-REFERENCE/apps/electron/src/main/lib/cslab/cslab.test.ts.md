---
path: apps/electron/src/main/lib/cslab/cslab.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3b9af58a5304792be7ae1593458476f5aef20c2d
sha256: 7918584643be56251a69e30b6d539651a19919de28f61b145913d63adc14ae59
lines: 33
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab.test.ts

## 1. 测试目标

CSLab 本地运行状态测试（`apps/electron/src/main/lib/cslab/cslab.test.ts:4`）：遥测只声明本地科研工作台、运行时节点仅本机、审计日志与心跳结构有效。被测 `csLabService`（`./cslab-service`，`:2`——**非本批**，跨文件归属登记）。无 mock。

## 2. 用例清单

1 describe、3 test：

1. `:5` 遥测只声明本地科研工作台。
2. `:17` 运行时节点仅包含本机工作台。
3. `:26` 审计日志与本地心跳结构有效。

## 3. 真实断言

- `:7-14` labCode==='CSLAB'、labName 含 'CDUT Science'、status==='operational'、**controllerMessage 不含「雫窝」**（`:10`）、历史契约字段不伪造（quantumCoherence=0、frequencyGhz=0、activeNodesCount=1，`:12-14`）。
- `:19-23` nodes 长度 1、id==='CDUT-LOCAL-01'、ip==='127.0.0.1'、loadPercent≥0。
- `:27-31` logs 非空、ping.timestamp>0、**latencyMs===0**（本地心跳）。

## 4. 未覆盖与脆弱点

未覆盖：IPC 面、cslab-service 其余方法、真实遥测序列化。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例锚点与断言文本 | 已证实 | `:4-32` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 遥测/节点/日志心跳 | §3 | covered |
| 实际运行 | §5 | unknown（NOT_RUN） |
