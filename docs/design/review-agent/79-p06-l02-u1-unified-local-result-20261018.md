# 79｜P06 L02-U1｜统一本机集中验收结果 R01（2026-10-18）

## 结论

本轮从 PR #116 固定 HEAD 9601bd2181ee1e25f599b1dd44d39bf23b1a924f、tree 6b0212090693d3686a41312e7b9490acfb8f865e 建立独立工作树 audit/p06-u1-unified-local-r01 与全新私有 Electron profile，按 78 号任务书运行。冻结 SHA 未变，工作树没有生产源码修改。

远程受控测试通过：PR #105/#108/#110/#113/#114/#115 的对应 PR CI，以及 #116 的 PR CI、Review Baseline CI、D2 Scoped Pi Review Tests 均完成且成功。PR #116 当时仍为 Draft；并发 #117 是无关 D4 Draft。远端绿灯只说明这些固定版本的受控测试，不表示本机 Provider 闭环完成。

本机一次 frozen install、typecheck、边界检查、Electron build 和全仓测试通过；全仓为 4014 pass、5 skip、0 fail、16682 assertions。真实 Electron 43.7.7 的 Main/Renderer/Preload 已通过 loopback CDP 与 IPC 运行；Main 内 Pi SDK 0.86.1 的 active 与 model-facing 工具集一致，为四项 review 工具加 CompactContext。SDK getAllTools 还包含八项未激活内建工具。真实 Main 启动 ACK 与 V2 runId 一致，探针在 Provider transport 前失败并生成可见的 failed/incomplete V2 状态。

本机可签范围如下：P02 删除后迟到 Main 查询与只读 Preview 隔离 PASS_SCOPED；Office #71 两个案卷的同名 DOCX/XLSX/PPTX 哈希、版本和解析锚点隔离 PASS_SCOPED；真实 Main 通过 review_read_documents 记录 DOCX blockId，V2 检查接受 alpha 的精确 SourceRef，拒绝 beta 跨案版本，且待确认结果在应用重启后仍保留；Owner 列表/检索/元数据/会话路径/消息/跨 Owner 文件读取及 Preview 隔离 PASS_SCOPED；普通 Agent 本机读和 cdut-file Preview 正例 PASS_SCOPED。隐藏 Renderer 原件预览在本轮先因临时 Vite 端口与安全白名单不匹配而失败；确认 localhost:5174 空闲后仅重跑该点，当时的 Main SDK 捕获显示一张预览图，V2 持久覆盖为 partially-read；SDK 捕获文件在下次启动时被覆盖，故图数属于本轮暂存观察，未当作可独立复核的原始日志。

真实 Provider 工具调用、运行中 revoke/stop/跨案/改版旧 handle、普通 Agent Provider 与实际 CompactContext 压缩、A/B/C 均没有执行。系统没有获授权 Provider 凭据，测试 hook 在任何网络 transport 之前中止；不得把受控 Main callback 或旧 WitnessAdapter 当作 Provider receipt。环境也禁止 mount namespace，无法创建独立受限卷，因此本地真实容量 ENOSPC 和故障后的跨 PID 恢复 BLOCKED_ENV。历史 PR #116 的 /dev/full 为远程 CONTROLLED_KERNEL_IO，只能单独记为受控内核 ENOSPC，通过，不替代本地真实满卷。

CDUT 专区真实 UI 导航到达校园 SSO 登录门；没有使用校方账户或真实材料，审核业务页面 UI 未进入，记 BLOCKED_ENV。Office #71 上游移植历史状态仍为 BLOCKED_UPSTREAM（PR #110 曾收到 403），本轮没有重复尝试权限操作。

**最终状态保持 P06 PARTIAL / P06-S02 NOT ACCEPTED / U1_FULL NOT ACCEPTED / L02-00 EXIT NOT ACCEPTED / L02-01 NOT ADMITTED / MERGE NO-GO。** 不修改权威 LIVE 台账，不合并 PR，不进入 P07/P08。

## 独立判定

| 项目 | 判定 | 证据边界 |
| --- | --- | --- |
| REMOTE_CONTROLLED | PASS | #105/#108/#110/#113/#114/#115/#116 固定 SHA CI；#116 三条工作流均成功 |
| P02_COMPAT | PASS_SCOPED | 普通会话删除、迟到 metadata/read/Preview 不复活；一条定向兼容烟测 |
| OFFICE71_COMPAT | PASS_SCOPED | 合成同名双案 DOCX/XLSX/PPTX 解析/哈希/锚点/SourceRef；不是完整 O71-01–09 |
| PI_MAIN_IPC | PASS_SCOPED | 真实 Renderer→Preload→Main ACK、V2 run、Owner/普通会话 IPC 与重启持久化 |
| PI_SDK_ACTIVE_TOOLS | PASS_SCOPED | 真实 SDK active/model-facing 完全一致的五项；八项 inactive builtin 明示 |
| PI_MAIN_AUTH | CONTROLLED_PARTIAL | 当前 Main wrapper 下 review 允许路径有受控调用证据；Provider 生成与通用工具拒绝未本机签署。旧 raw Bash 探针绕过 wrapper，判 HARNESS_FAIL |
| PI_PROVIDER_TOOL_RECEIPTS | BLOCKED_ENV | 无授权凭据，providerRequestsIssued=0，Provider receipts 为空 |
| IO_KERNEL_ENOSPC | PASS_REMOTE_CONTROLLED_SCOPED | #116 对 /dev/full 的受控历史测试 |
| IO_REAL_SMALL_VOLUME | BLOCKED_ENV | mount namespace Operation not permitted，无安全私有测试卷 |
| IO_CROSS_PID | BLOCKED_ENV | 满卷故障门禁不可进入；普通 V2/会话重启持久化在 U-08 独立通过 |
| A/B/C | NOT-RUN_GATE | U-09/U-10 Provider 安全门未通过，未创建案卷 |
| OFFICE71_UPSTREAM_PORT | BLOCKED_UPSTREAM | 继承 #110 的 403；本轮未重试 |
| U1_FULL | NOT ACCEPTED | 真 Provider、真实满卷和完整 UI 流程缺失 |
| L02-00 EXIT | NOT ACCEPTED | 无本轮真实 Provider 业务闭环；A/B/C 未运行 |
| L02-01 ENTRY | NOT ADMITTED | 前置条件未齐 |

## 本机运行与证据

候选锁、预检、统一矩阵、IO 时间线、Pi 工具/SourceRef 索引、A/B/C 门禁、首败归因与校验和位于本目录的 acceptance 包。command-ledger 收录每条 runner 命令的参数摘要、候选 SHA/tree、起止时间、退出码和私有 stdout/stderr SHA-256；所有底层原始日志仍在本机私有目录。

首败均保留，包括参数解析器、Electron 启动驱动的路径/版本字段、初次 synthetic template、错误 CDP target、预览目标不存在、预览端口错配，以及第一次 SourceRef 提交误用未加 section 前缀的 rule ID。每次修正限定在本地 QA 驱动或证据配置，随后只对失败项重跑；生产实现没有修改。早期手工调用 runner 路径错误未经统一 runner 保存原始日志，已在 defects 文件注明；r09/r10b 的 SDK capture JSON 被下一次进程启动覆盖，相关 V2/Main 查询日志仍可核对，报告未据此声称 Provider 收据。

证据路径仅引用私有别名与 SHA-256；实际 session/run/assignment/case ID、材料和本地绝对路径均不公开。原始三份合成 Office 文件均由本轮创建，未接触真实校方材料或隐藏 Gold。
