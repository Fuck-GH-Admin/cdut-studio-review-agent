# P06 U1 Pi/provider 本机独立验收 R01

本证据包按 73 号任务书，在 PR #114 固定 HEAD `cf8c5f36cebf1f22362eabd58d28275412f6f9f8` 上执行。隔离工作树和分支为 `audit/p06-u1-pi-provider-local-r01`，初始树为 `df27656c56a5147ebfb4e1cd67f1645919522147`。本轮没有修改生产源代码。

**结论：受控与静态检查通过；真实 Electron Renderer→preload→Main IPC 和 Pi SDK 活动工具集取得限范围通过；真实 Provider 工具调用链因缺少授权测试凭据而 `BLOCKED_ENV`。S0 未完成，A/B/C 不运行。**

真实 Electron 内的 Pi SDK active/model-facing 工具集为五项，且两组名称一致。SDK `getAllTools()` 同时能看到八项 inactive 通用内建工具；它们没有出现在 active 工具表或模型请求上下文。该区别已记录，不能把“未暴露给模型”简写成“SDK 内部不存在”。

Renderer 通过 preload IPC 启动合成案卷，收到 `accepted` ACK，随后 Main V2 状态中的 runId 哈希与 ACK 相同。传输前的私有证据栅栏阻断了 Provider 请求；Main 将该合成运行持久化为 `failed`，状态为 `incomplete`，只有一个 `execution-failed` 检查，没有意见、用量、工具活动、SourceRef 或读取回执。该结果只证明隔离边界和故障记录，不能作为业务审核结论。

## 判定口径

- `PASS`：该层所要求的检查实际通过。
- `PASS_SCOPED`：证据是真实客户端/SDK，但只覆盖列出的子集。
- `PASS_CONTROLLED`：生产函数在受控测试驱动中通过；不等于真实 Electron 或 Provider 证据。
- `BLOCKED_ENV`：缺少执行该检查所需的授权 Provider 环境。
- `NOT-RUN`：本轮没有执行该项目。
- `BLOCKED_UPSTREAM`：依赖的上游访问/移植仍阻断。

## 文件

- `candidate-lock.json`：固定候选、只读历史 SHA、PR #114 CI 与 checkout tree 对照。
- `environment-redacted.json`：主机、隔离 profile、端口和 Provider 环境摘要。
- `command-ledger.json`：命令、固定源码 SHA、退出码及原始 stdout/stderr 哈希。测试驱动/失败尝试均保留。
- `pi-s0-matrix.json`：PI-M01、PI-T01～T06、S1 与 IO_RECOVERY 独立判定。
- `pi-a-b-c-matrix.json`：本轮未创建 A/B/C 案卷的记录。
- `provider-tool-receipt-index.json`：真实请求、Main 授权、执行回执、SourceRef 与 V2 结果之间可核验的对应情况。
- `known-failures.json`：首败和 harness 无效尝试，不覆盖历史结果。
- `SHA256SUMS`：公开证据文件校验和。
- [74 号正式结果](../../74-p06-l02-u1-pi-provider-local-result-20261018.md)：最终门禁判词。

`raw-log://...` 指向本机受限目录内的原始文件。包含完整会话/案卷/指派 ID 或 Electron 原始日志的文件仅保存在 mode 0700 私有证据目录，不在本仓库和 Draft PR 中；命令台账提供 SHA-256 供本地核验。无 Provider request ID、tool_use、tool_result 或执行回执时，本包明确保留为空。
