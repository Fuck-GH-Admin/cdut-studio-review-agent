# 76｜P06 L02-U1｜真实 Electron + 独立文件系统 I/O 故障与跨进程恢复（R01）

> 任务性质：**本机实际执行与独立验收**。完成后创建新的本机 Draft PR + 77 号结果，不能把本任务书视为已经运行。上一阶段 #115 的 Provider 仍 BLOCKED_ENV，不能因此撤销 S0 门禁或偷偷跑 A/B/C。

## 0. 优先安全约束

**仅允许以本轮新建的、已证明隔离的、可卸载的、容量严格受限的小文件系统或容器测试挂载为故障对象。绝不能填满宿主根卷、home、共享 /tmp、用户个人资料、CI runner 的真实卷或装真实学校文件的目录。** 必须在注入前记录挂载源、mount namespace、major/minor、设备或卷 ID、容量、挂载点 realpath，且确认与真实用户目录、Git 仓库和宿主盘不共卷。未确认这些条件时跳过完整 ENOSPC 注入，标 `BLOCKED_ENV`；可运行 75 号 `/dev/full` 受控测试，但绝不冒充全卷填满。

不得修改数据层安全策略、关闭签名或注释权限检查来“让测试通过”。不得把 provider key、用户真实 profile、Gold、学校材料、完整原始技术 ID 和敏感路径上传公共 GitHub/Actions。故障清理必须在 `umount`、PID 校验和目录归属校验后完成；失败时保留受保护证据并停止，不要通过 `rm -rf` 猜测任何非私有目录。

## 1. 源码版本和准备

1. 读取 `AGENTS.md`、55、59～63、65、68、71、72～75，#115 74 号本机报告与 `acceptance/p06-u1-pi-provider-local-r01`，阅读 `run-store-v2.ts`、`review-agent-assignment.ts`、`safe-file.ts`、`agent-session-manager.ts`、`review-pi-run-bridge.ts`、P04 tombstone/journal 的生产入口。
2. 核对 #116 **最新固定 HEAD/tree**、父 #115 `74298aceb516999022d41b930a966b439cc163d4`、#114、#113、main 与对应 PR CI。不要因为 PR 合并预览 SHA 变化而混用旧 source；记录 Source SHA/tree、真实执行 checkout、checkout tree、工作树首次 status 与原始命令日志哈希。
3. 从 #116 冻结 HEAD 创建独立 worktree + `audit/p06-u1-io-recovery-local-r01`；新建独立 `PROFER_CONFIG_DIR`、`PROFER_USER_DATA_DIR`、`piSessionDir`、临时合成 V2 案卷/文档，使用与主用户 profile 彻底隔离的配置和文件系统；不调用在线 Provider。
4. 环境命令按项目真实脚本执行：`bun install --frozen-lockfile`、`bun run typecheck`、`bun run check:boundaries`、`bun run electron:build`；独立执行 `bun test --isolate --timeout 30000 apps/electron/src/main/lib/review/review-io-kernel-enospc.p06.test.ts apps/electron/src/main/lib/review/review-startup-io-recovery.p06.test.ts apps/electron/src/main/lib/review/review-deleted-owner-tombstone.p04.test.ts apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts`。保存逐命令原始 exit、stdout/stderr SHA256，不能将受控回归替代实机运行。

## 2. 真正物理 I/O 故障矩阵（每一案都必须有 Main 生产入口与原始证据）

| ID | 必须真实执行 | 通过的可观察不变量 |
| --- | --- | --- |
| IO-01 独立容量故障 | 启动真实 Electron Main/Preload，使用新 V2 `running` run、有效 assignment 和 review-case owner。只在**安全独立小卷**填满允许的合成剩余空间，验证 errno=ENOSPC、挂载卷达到容量限制。由真实 Main 的启动恢复 / atomic write 执行路径触发写盘失败 | 运行 JSON 主文件可读、原始 hash 没变；新运行/工具不能在状态未确认时取得旧授权；真实 Main `getPiReviewBindingForSession` 为空，`checkAssignment` 拒绝，即使磁盘 run JSON 尚标 running；不得显示“撤权已持久化”虚假成功 |
| IO-02 撤权双失写 | 在独立小卷构造原 assignment 持久主文件，同时让 `.tmp`/备份或当前写入出现真实 ENOSPC；调用真实 `revokeAssignment`，记录投影与底层错误，再做宿主工具请求 | 当前 Main **进程内**旧指派立即拒绝，不假称原子写成功；主账本不被截断、不会错误覆盖历史；退出 Main 前捕获 marker/errno/hash |
| IO-03 跨 PID/重启 | 故障期间正常结束或强制终止**仅隔离测试 Electron PID**，保留挂载卷已存在的合成文件；在保持/移除容量故障两种情况下重新启动隔离 Main，不能启动用户主程序 | 新 PID 真实不同，旧 owner、旧 run、旧 assignment 不因进程内拒止 marker 消失而获得权限；启动恢复发生在接受任何新工具/运行授权之前。哪怕磁盘仍 running 也要 fail closed；如果磁盘无法安全恢复则 `BLOCKED_ENV`，不能写 PASS |
| IO-04 故障消除后恢复 | 在不更动原始合成 run/assignment 的前提下释放独立卷容量，再次启动/恢复；读取持久数据与 UI V2 状态 | 旧 run 最终持久化 failed/interrupted，旧 binding/assignment 依旧拒止；新的合法 run/assignment 可以成功执行受控真实 Main 生命周期，不冒用旧 turn。正常普通 Agent 保持能读其合法文件 |
| IO-05 journal 与备份回滚 | 构造早期版本 .bak、损坏当前 index、残缺 tmp、owner ID-only journal、已删 owner tombstone，用已有安全 IPC 验证恢复 | review owner 不能被普通列表、预览/读取、普通远程事件重新看见；若可信 journal 损坏不可恢复则 **fail closed**，不得猜普通身份或无限期启用旧 run |
| IO-06 stale callback / stop-pending | 新 run 刚创建、旧 run 异步通知抵达，及 stop pending 期间发起新的轮次；需要观察 Main 事件和持久 V2 | 旧 callback 不结束新 run，不允许新的 stop-pending run；旧撤销授权不会因为新会话复用缓存而复活；业务状态按真实 runId 对账，不允许用截图替代状态机证据 |
| IO-07 恢复后的正例 | 新合成普通 Pi 与单案 Reviewer 的可信身份/合法只读 Preview 正例 | 恢复时不能把合法新会话全部拒绝；普通 Agent 工具行为不被五工具规则误伤，审核仍仅五工具，不需 online provider |
| IO-08 跨平台范围 | 如本机仅 Linux/Xvfb，明确注明 Windows/macOS 未验证；按对应平台能否安全创建测试卷决定 | 没有真实故障注入的系统不得被“Linux PASS”扩展签署，平台差异列为后续任务 |

如果宿主缺少创建私有 mount namespace/容器卷的权限，**停止在受控测试层，保留 IO-01～04 `BLOCKED_ENV`**，不建议为了跑测试临时授权挂载整个系统或对真实主盘做容量测试。

## 3. 真实首败、取证与交付

- 原始证据使用仅本地私有 `mode 0700` 目录。每次记录 UTC、pid、cwd、真实端点/IPC、命令和 exit、mount ID、fs 类型、目标 volume 真实 capacity/free blocks、error.name/code/errno、运行与指派主文件前后字节大小及 SHA-256、Main 回执与事件时间线、身份的脱敏 hash、预期/实际、是否有人工恢复。
- 正反两组必须交错执行：预防误判 **单纯 JSON 不可读** 或 **单测 mock** 为真实 ENOSPC；若注入发生在错误文件或 Main 实际没有写入，整个项目记 NOT-RUN，不可假称容错生效。
- 工程损坏/测试夹具失败分别标 `PRODUCT_FAIL`、`HARNESS_FAIL`、`BLOCKED_ENV`、`NOT-RUN`，首败和复跑都必须保留。失败归因不可通过修改 Gold、生产结果或旧证据重写。
- 在本地全新分支只提交 `docs/design/review-agent/acceptance/p06-u1-io-recovery-local-r01/{README.md,candidate-lock.json,environment-redacted.json,command-ledger.json,io-real-matrix.json,known-failures.json,SHA256SUMS}` 与新 `77-p06-l02-u1-io-recovery-local-result-20261018.md`。必要的新 QA driver 可以提交，但不能修改 #115 的 Provider 报告或业务生产源。上传新独立 Draft PR；完整原始日志、截图、挂载诊断、用户资料不提交。
- 结果明确分 `IO_KERNEL_ENOSPC_CONTROLLED`、`IO_REAL_SMALL_VOLUME`、`IO_REAL_CROSS_PID`、`IO_OWNER_IDENTITY`、`PI_PROVIDER`、`U1_FULL`。**只有同一候选的真实小容量故障+跨 PID+所有核心拒止正反例通过，才能签 `IO_RECOVERY_LOCAL_REAL_PASS_SCOPED`。** 否则报告局部通过和未覆盖项即可。
- 不改 main、已有 Draft PR、隐藏 Gold、权威 29 LIVE；P06 `PARTIAL` / P06-S02 `NOT ACCEPTED` / L02-01 `NOT ADMITTED` / U1 FULL `NOT ACCEPTED` / `MERGE NO-GO` 不因单项 PASS 自动改变。

## 4. 本地 Agent 直接接手提示词

从 `Fuck-GH-Admin/cdut-studio-review-agent` 的 Draft PR #116 固定最终 HEAD 建独立 worktree，完整阅读 `docs/design/review-agent/76-p06-l02-u1-io-recovery-local-task-20261018.md`、75/74/63/AGENTS.md，执行真实 Linux/Electron/小独立卷 ENOSPC 与跨 PID 恢复验收，不用任何真实 profile、学校材料或 Provider 凭据。先锁定 SHA/tree/CI、确认隔离卷安全才故障注入，严禁填满宿主真实盘。按 IO-01～IO-08 存原始日志 SHA 与脱敏公开证据，创建独立本地 Draft PR、77 号正式结果。平台无法隔离时 BLOCKED_ENV、不使用 /dev/full 受控用例顶替真实磁盘/重启。历史 PR 和 Gold 只读；绝不擅自合并或宣告 P06/U1 PASS。
