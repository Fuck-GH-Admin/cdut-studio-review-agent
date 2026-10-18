# 75｜P06 L02-U1｜I/O 故障隔离受控验证与来源追溯（2026-10-18）

> **执行状态依赖 PR #116 的最终 Git HEAD 和 CI，不得预填 PASS。** 本轮为独立故障恢复工序，基于 PR #115 `74298aceb516999022d41b930a966b439cc163d4`，不改变原先 SDK 与 Provider 判词。所有子阶段均须记录 exact HEAD/tree、真实退出码、输入 hash、日志的 SHA-256 与错误类型。

## 为什么可以继续这一项

74 号真实 Pi 报告已证实 Electron Renderer→Preload→Main IPC 是 `PASS_SCOPED`、SDK 当前 active/model-facing 工具集合是严格五项；但没有授权测试 Provider 凭据，因此 `PI_PROVIDER BLOCKED_ENV`，模型实际工具调用与 A/B/C 不得假称 PASS。**Provider 缺项不妨碍独立检查真实 I/O 写盘与重启恢复**，但不能提前签完整 U1/L02-00。

先前已实现安全相关函数：
- `review-agent-assignment.ts`：`revokeAssignment` 在尝试磁盘写入之前置入 `pendingRevocations`；在本进程写入失败时保留该拒止意图；成功的后续原子写将该 revoke 转成持久 `revokedAt`。旧历史默认回归存在，但不能代表真实 ENOSPC 或重启。
- `run-store-v2.ts`：`markStaleRunsInterrupted` 在尝试写盘之前隔离旧 runId；落盘失败，旧运行的文件可能仍是 `running`，但本进程授权查询应拒绝。恢复存储后才能持久化 `failed`。
- `safe-file.ts`：assignment JSON 原子替换时先写 `.tmp` 再 rename；失败不等于实际完成撤权。任何仅因模拟 fs mock 通过而自称强崩溃恢复的结论均无效。
- `review-owner-index-recovery.p06-fix01.test.ts`：旧 metadata 备份恢复不得使审核 owner 变成普通 Agent；P04 journal/ID-only tombstone 不应被缩短生命周期或移除。

## 本轮新增的受控 Linux 核心机制验证

`apps/electron/src/main/lib/review/review-io-kernel-enospc.p06.test.ts`：
1. 使用**全新测试配置目录**创建真实合成 V2 模板、案卷、review-case owner、正在运行的 run 与可信 assignment，验证原先允许。仅在 Linux 的 `/dev/full` 存在时运行，并将私有 `runs-v2/<runId>.json.tmp` 符号链接到该内核设备。由**真实内核返回 ENOSPC**，调用真实 `markStaleRunsInterrupted`，确认：旧持久 run 原始字节不变，仍为 `running`，但是同进程的 Main binding 和 assignment 全部失效。拆除故障后重复恢复，run 持久变 `failed`，仍拒旧授权，可新建合法新 run。
2. 将私有 `review-agent-assignments.json.tmp` 定向到 `/dev/full`，调用真实 `revokeAssignment` 得到操作系统写入失败；确认主账本原始字节未损坏、同进程对撤销中的旧指派 fail closed。解除故障后创建另一个**合法普通只读指派**以触发原子写，核对原撤权已持久化、普通指派不被误拒止。

### 重要限制

`/dev/full` 是真实的 kernel ENOSPC，但**不是独立卷被填满**，也不代表进程崩溃/切换 PID 或 Electron 真实 main、preload、renderer。原记录应签 `IO_KERNEL_ENOSPC_CONTROLLED_PASS`，不能签 `IO_RECOVERY_LOCAL_REAL_PASS`。Linux 之外的运行若是 `SKIP` 必须如实注明，不当 PASS；涉及 Windows 的行为需单独验收。

故障设备链接只允许处在本任务新建的私有临时目录，绝不在真实学校材料目录或用户原 profile 中改动。不得对宿主磁盘用 `dd` 直接填满，不得模拟 `ENOSPC` 以顶替本阶段原生错误，也不得把 `errno` 断言“无论何种异常都通过”。

## 真实系统遗留风险与验收边界

受控验证**不能**回答以下真实问题：
- 对一个真的达到容量上限的**专用可卸载小容量卷**，原子写的 tmp/.bak、运行原件、指派账本和 owner journal 是否一起保持一致；
- 真实 Electron PID 切换后，启动代码是否在接受新 run/tool/IPC 之前完成 `markStaleRunsInterrupted`；之前撤权写盘未成功且跨 PID 丢失进程内 quarantine 时，旧工具授权是否可能复活；
- V2 checkpoint 和 run journal 双重失败、.tmp 不完整、旧 .bak rollback、symlink 路径改动、owner 普通会话泄露、stop-pending 旧回调是否误更新新 run；
- 故障排除后跨 PID 重启，新的合法 run 与普通 Agent 是否仍可正常工作。

这些必须按 [76 号实机任务书](76-p06-l02-u1-io-recovery-local-task-20261018.md) 执行，通过才可签 `IO_RECOVERY_LOCAL_REAL_PASS_SCOPED`。先验证隔离卷安全，环境不支持则 `BLOCKED_ENV` 而非在宿主强行填盘。

## 冻结与状态

PR #115 74 号及 #114/@main、Office #71 和 P02 历史报告均只读；本 PR 只允许新增受控测试及独立说明文档，不更改源权限实现、Gold、29 的 LIVE、正式业务模板或原 Profile。若找到生产缺陷，先记录 RED 和最小隔离修复分支，新 SHA 通过正反回归后再宣称修复。

`PI_MAIN_CONTROLLED_PASS / PI_SDK_REGISTERED_PASS_SCOPED / PI_PROVIDER_BLOCKED_ENV / A-B-C_NOT_RUN / IO_RECOVERY_LOCAL_NOT_RUN`。总体继续 `P06 PARTIAL / P06-S02 NOT ACCEPTED / U1_FULL NOT ACCEPTED / L02-00 EXIT NOT ACCEPTED / L02-01 NOT ADMITTED / MERGE NO-GO`。上游 Office #71 移植保留 `BLOCKED_UPSTREAM_ACCESS`。
