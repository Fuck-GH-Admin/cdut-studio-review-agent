# 74｜P06 L02-U1｜Pi/provider 本机独立验收结果 R01（2026-10-18）

## 结论

本轮从 PR #114 固定 HEAD `cf8c5f36cebf1f22362eabd58d28275412f6f9f8` 建立独立工作树和 `audit/p06-u1-pi-provider-local-r01` 分支，按 73 号任务执行了静态/受控测试，以及真实 Electron Main、Renderer、preload IPC 和 Pi SDK 的无 Provider 子集。工作树初始 tree 与固定候选一致，没有改生产源代码、Office #71 上游实现、Gold、权威 LIVE 台账或 PR #114。

本机没有获授权的测试 Provider 凭据。真实 Pi SDK 的 stream boundary 到达后，私有栅栏在 HTTP/Provider transport 之前中止；没有发出 Provider 请求，没有构造或伪造 tool transcript。故本轮不能验证 Provider tool_use 与 Main `canUseTool`、实际 execute 回执、SourceRef/read receipt 和 V2 业务记录的一致性。此核心闭环为 **`BLOCKED_ENV`**，不是通过。

## 独立判定

| 层 | 判定 | 证据和限制 |
|---|---|---|
| Remote controlled | `PASS` | PR #114 的 run `39112696729` / job `117632053211` 成功，4012 pass、5 skipped、0 fail、461 files。workflow merge checkout 的 tree 与固定候选 tree 相同；没有 CI artifact。 |
| Static | `PASS` | `bun install --frozen-lockfile`、`bun run typecheck`、`bun run check:boundaries`、`bun run electron:build` 和 OOXML build 的正确目录重跑退出码均为 0。 |
| Controlled | `PASS` | 固定候选的三文件 Main/permission/V2 测试 13/13；额外受控 Main IPC/state/driver 测试 23/23。直接 Main callback 的受控探针五项允许、八项禁止，撤权后五项均拒绝。它们不是 Provider 调用，也不是 Electron live callback 证据。 |
| Main/IPC | `PASS_SCOPED` | Xvfb 中启动实际 Electron 应用；实际 Renderer `window.reviewAPI` 经 preload IPC 请求后台启动，收到 `accepted` ACK。ACK 的 runId 哈希与下一次 V2 state 一致。ACK 不含 sessionId、assignmentId 或路径；普通 session 列表/搜索未暴露内部会话，review session lookup 返回 null，Renderer assignment 列表不暴露内部指派。通过 CDP 调用 Renderer API，不是点击 GUI 按钮；离开页面期间持续运行后返回的场景未执行。 |
| Pi SDK registered | `PASS_SCOPED` | 实际 Pi SDK 0.86.1 `AgentSession.prompt` 与 Provider 请求上下文边界被触发。active set 和实际模型上下文均只有五工具且完全相同：`review_read_documents`、`review_inspect_document_image`、`review_submit_result`、`review_inspect_original`、`CompactContext`。SDK `getAllTools()` 还显示八项 inactive 通用工具定义（bash/edit/find/grep/ls/powershell/read/write）；它们不在 active set 或模型上下文。本轮未验证模型能否发出工具调用，也未在真实 Electron 回调中单独采集 Host 决策。 |
| Pi Provider | `BLOCKED_ENV` | 无授权测试凭据；transport 调用、Provider request ID、tool_use/tool_result、live Main 授权、执行回执、SourceRef/read receipt 和 Provider usage 均为 0。 |
| Office #71 | `BLOCKED_UPSTREAM` | 仅继承 PR #113 已记录的上游移植阻断，不改上游共享实现，也不重复 Office 实机轮次。 |
| Preview / IO recovery | `NOT-RUN` | 未运行只读 Preview、文档 IO、缓存/应用重启恢复或真实会话继续检查。 |
| S1 A/B/C | `NOT-RUN` | S0 的 Provider/Host 工具门禁没有完成，按任务书未创建新案卷；没有复用历史 A/B/C。 |

## 实际 Electron 与 V2 对照

独立 profile 中使用一份新的合成模板、合成案卷和 loopback-only 合成渠道。Renderer 调用 Main 后，ACK phase 为 `accepted`、runStatus 为 `running`；随后 Main `GET_BACKGROUND_PI_REVIEW_STATE_V2` 返回相同 runId 哈希。Main 的 V2 记录在预传输栅栏触发后成为 `failed`，页面状态为 `incomplete`：1 个 `execution-failed` 检查、0 opinions、0 model usage、0 agentActivity；覆盖统计为 planned 1 / completed 0 / effective 0 / pending 1。没有材料、SourceRef、读取回执或审核结论。该失败由本地证据栅栏预期触发，不能归因成候选代码的产品失败，也不能包装成审核成功。

内部指派在隔离 profile 的持久账本中记录为撤销状态；普通 Renderer assignment 列表隐藏内部项。原始 ID、会话日志和测试 profile 数据只留在私有本机证据目录。公开证据只含哈希和脱敏摘要。

## 门禁结论

- `S0` 未完成：PI-M01、PI-T01 有限范围通过；PI-T02/PI-T03 因缺授权 Provider 而阻断；PI-T04～T06 与真实普通 Agent/压缩场景未运行。
- `U1_FULL NOT ACCEPTED`。
- `L02-00 NOT ACCEPTED`。
- `L02-01 NOT ADMITTED`。
- 总体保持 `P06 PARTIAL / P06-S02 NOT ACCEPTED / MERGE NO-GO`。

证据文件与逐命令退出码、stdout/stderr SHA-256 见 [`acceptance/p06-u1-pi-provider-local-r01/README.md`](acceptance/p06-u1-pi-provider-local-r01/README.md)。不合并 PR #114，不进入 P07/P08。
