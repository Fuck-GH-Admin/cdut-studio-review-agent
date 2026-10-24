---
path: apps/electron/src/main/lib/agent-session-manager.pi-fork.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 66e131101144ab55c3d4ebb1a1f169634e99c725
sha256: 373a6ab158035192bb4782e2a33c859fd4dd6e30fb82c6215ca5a2a2345f4801
lines: 520
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-manager.pi-fork.test.ts

## 1. 测试目标

`forkAgentSession`→`forkPiAgentSession`（`agent-session-manager.ts:2557,1911`）：运行/并发守卫、branch 元数据、检查点迁移、中断上下文、默认沙箱+路径重写、分叉点完成态还原、取消下一轮不误还原。bun:test；mock 边界=**仅 `./pi-session-fork` 本地分叉边界**（注释禁 mock 正式 Pi SDK 防污染 `:22-23`）+electron+node:os homedir（`:24-66`）。

## 2. 用例清单

共 **11 个 `test(`**（机械核，`:132-519`）：运行中拒（`:132`）；并发 fork 锁（`:156`）；branch 元数据持久化（`:186`）；检查点迁移且源删除后仍可回退（`:254`）；缺 bindings 拒（`:303`）；缺 artifact 拒（`:321`）；无目标消息拒（`:339`）；中断消息上下文（`:357`）；缺 workspaceId 落默认沙箱+路径重写（`:391`）；分叉点完成态还原（`:437`）；下一轮取消不误还原（`:484`）。

## 3. 真实断言

- `:149,181` `rejects.toThrow('Agent 正在运行'/'正在创建分叉')`。
- `:233-251` sdkSessionId/piSessionFile/bindings=`{'assistant-1':'entry-keep'}`（分支外 entry 不带）/harness 仅 settled 目标/exploration 三元持久化。
- `:285-300` 检查点迁到分叉自己目录（`startsWith(checkpointRoot/forked.id)`）+源删除后 `restorePiFileCheckpoint` 还原“分叉点之前的基线”。
- `:318,336,354` 三类拒绝文案精确。
- `:383-388` `appendCustomMessageEntry` `customType:'profer-interrupted-assistant-context'`+含中断文本+`display:false`。
- `:425-434` 默认工作区绑定+文件复制+消息内源路径改写（含反斜杠转义归一）。
- `:474-481` 第一轮分叉回“分叉点完成态”且无 later.txt；最后一轮分叉保留当前现场。
- `:518` 下一轮无 entry→保留“当前现场”不误还原。

## 4. 未覆盖与脆弱点

真实 Pi SDK forkSession 语义（mock 边界外，域外）；`copyTruncatedGraphJsonl` 无直接断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例/断言/守卫与还原语义 | 已证实 | 全 520 行 |
| 真实 Pi SDK 行为 | 边界 | mock 边界外域外 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 用例 | §2/§3 | 132-519 | covered |
| mock 边界 | §1/§4 | — | covered（如实） |
