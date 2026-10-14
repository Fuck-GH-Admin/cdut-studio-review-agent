# 46｜P06-RECHECK 当前会话终点、并行本地验收与安全交接（2026-10-15）

> **读取顺序：本 46 → 47 下一会话正式提示 → 45 R1B → 44 独立复演 → 29 唯一验收台账 → 30/31 当前交接 → 39/40/41 实现 → 37/38 历史失败。** 本交接是基于 PR #21 的 `3227bc715fc99005d54495967dbcbe8b277c8295` 冻结快照；它不取代后续真实最新 HEAD、当地任务日志和 CI。**交接专用分支** `handoff/p06-recheck-20261015`，不直接修改仍有运行中自托管 CI 的工作分支。

## 1. 代码仓库、工作范围、为什么另起交接分支

- 公开测试仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent；工作分支 `feat/review-owned-background-sessions`；[Draft PR #21](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/21)。**不得写原上游 Nya-Angle/CDUT-Studio、main 或并行 agent 的未提交工作树；不得合并或解除 Draft。**
- 本次会话从 P06-S02 验收文档 37/38 看出四类问题，用户随后要求启动 P06-FIX-01。本会话先读取 `agent-session-manager.ts`、`safe-file.ts`、Owner/路径/事件守卫及原失败探针，定位旧 `.bak` 可回滚掉新 owner 分类这一根因，提出持久单调 UUID deny 方向；**本会话这一段并未推送修复代码、也没有亲自在本地跑真实 Electron**。其他会话随后已实际完成了 FIX-01/02/03 及 RECHECK，不可把本会话早期调查说成新提交，也不可再重复实现已完成的三个 FIX。
- 用户明确表示“本地还在跑”，且源码 PR 分支最近存在并行推送和自托管 Runner 工作。**为防止向 `feat/review-owned-background-sessions` 推送文档触发 push CI 或取消正在运行的任务，本文件和 47 号单独提交到 `handoff/p06-recheck-20261015`。** 后续等本地验收运行结束、新 SHA 与结论核对后，再按实际需要将交接信息纳入 29/30/31；勿未经比较直接 cherry-pick 或覆盖。

## 2. 冻结事实，不能与当前验证混淆

| 事项 | 证据与实际边界 |
| --- | --- |
| P06-S02 原始实机 | [37](37-p06-s02-local-acceptance-20261013.md)：真实 Electron/Main/Pi/DeepSeek E01 update 和 E02 restart **2/2 PASS**；跨页面迟到旧回执 E05 **FAIL**；E03 未命中真实 stop-in-flight，E04 未做获授权迟到回调注入，E06 只有部分普通 Pi 正例 |
| 原独立累计审计 | [38](38-p01-p06-s02-cumulative-risk-audit-20261013.md)：旧 SHA 四个保护探针 **0 PASS / 4 FAIL**，失败事实与原始 JSON/log/哈希不可覆盖 |
| P06-FIX-01 | [39](39-p06-fix01-owner-index-recovery-20261013.md)：UUID-only `review-owner-ids.log` owner 安全 deny、旧索引回退保护，代码 `c8c84681`、**9/9 受控 PASS**；不等于真实灾难恢复已签收 |
| P06-FIX-02 | [40](40-p06-fix02-renderer-write-fence-20261014.md)：Controller/Hook/Jotai store+case 共享写入资格，代码 `414f2066`、**5/5 受控 PASS**；旧真实 E05 FAIL 继续保留直至实机复验 |
| P06-FIX-03 | [41](41-p06-fix03-settlement-io-resilience-20261014.md)：assignment 原子写、持久撤销故障下内存拒绝及 Promise 可观察收尾，代码 `b5f9db17`、**7/7 受控 PASS**；真实 ENOSPC/双失写重启恢复未签收 |
| R1 旧探针精确复演 | [44](44-p06-recheck-independent-acceptance-20261014.md)：代码 `960163c7`，原四个旧探针 **3 PASS / 1 FAIL，exit 1**。旧 WORKSPACE-WRITER 裸 `store.set` 非当前生产写入者，旧失败**如实保留**；旧 SETTLE `chmod` 没打中 `.tmp`，其 PASS 对真实故障注入是 **INVALID**。新的真正 Hook/Controller 等效 2/2 PASS，四套标准 CI SUCCESS；原审计 CI #38538200712 真实 FAILURE，artifact #11881142752 包含日志/哈希 |
| R1B 当前代码 | [45](45-p06-current-writer-probes-and-live-gates-20261015.md)：冻结检查 HEAD `3227bc71` 新加 Hook→Controller、Hook→Hook、Controller→Hook、延迟 validity **四项生产写入者门禁**及独立 CI 双轨分流。**提交已推送，但此冻结时新 HEAD 对应完整 CI 未验证成功，不能从旧结果推断 PASS** |
| R1B 之前并行新增 | `36625a28` 中断授权及真实 Pi permission callback + real-live QA 脚本；`d24d1c2d` 终态持久化异常隔离；`b95b44f7` case-scoped Pi 批量规则和 QA 实机脚本改动。**源码已存在，不代表真实 provider、批量/视觉和故障恢复已被验收** |

## 3. 用户本地当前在跑什么——只描述可验证事实

- **用户报告**本地 Agent 仍在执行；此会话无法直接观察用户机器上的进程、屏幕、私有测试 profile 或完整运行日志。因此**无法断言此刻运行的具体脚本、当前轮次、成功数或是否已经完成真实 E05**。
- **云端可观察到的任务**：`3227bc71` 的 GitHub Actions 包含 PR CI、D0.5、D1、D2、Review Baseline、focused；最近一次查看 D0.5 为 SUCCESS，D1 IN_PROGRESS，D2/Baseline QUEUED，PR CI/focused CANCELLED（可能被并行推送的 concurrency 规则取消，不能称为测试失败或代码成功）。独立 `.github/workflows/p06-recheck-independent.yml` 指定 `[self-hosted, Linux, X64]`，R1B 当前 writers 与未修改的旧四探针通过不同门禁记录，不得将原旧探针 exit 1 粉饰成 0。**每个状态仅是本交接时快照，开工务必重新查询准确 HEAD/每套 run**。
- 仓库已有 `scripts/qa/review-live-e05.mjs`、`review-live-races.mjs`、`review-live-e06.mjs`、`review-live-io.mjs`、`review-live-preview-restore.mjs`、`review-live-batch.mjs`、`review-live-launch.py` / `review-live-gates.py` 等真机驱动。**文件存在 ≠ 本地已经执行 ≠ 已证明 E05/E03/E04/E06 或 ENOSPC PASS**。这些脚本随 `36625a28`、`d24d1c2d`、`b95b44f7` 推入，先按最新参数/环境与日志实际核实。
- **新会话对本地执行的第一件事**：先查用户或本地 agent 当前 `git rev-parse HEAD`、`git status --short`、正在运行的命令/进程、隔离 profile 路径、产出 JSON/日志与截图/哈希。若测试还在执行，继续观察其实际结果，**不重复启动占用同一 profile、CDP 端口或 runner**。不要凭云端 Workflow 状态推断用户本地命令已经结束。

## 4. 现阶段严格门禁和下一批动作

1. **R0 更新基线**：查 PR #21 最新 HEAD（可能已不再是 `3227bc71`）、相对本交接的新增提交、Draft/Open、每个实际 SHA 的 CI 及自托管 runner 队列。检查当前本地运行是否占用 repo/worktree/profile；避免重复 CI 或并发写入。
2. **R1B 精确验收**：读 45 号、`.github/workflows/p06-recheck-independent.yml`、`review-workspace-recheck-independent.test.ts`；必须核实四项 `R1_EQUIV_*` 实际生产调用见证以及 typecheck/focused，原 38 四事实 ID、原始 verdict/exit/log/sha256 完整。原旧 WORKSPACE FAIL 若属已知非等效裸写入，只能作为单独 legacy FAIL 存档；SETTLE 旧 PASS 的故障注入判 INVALID。未知新失败不得豁免。
3. **R2/R3 真机验收**：以 37/44/45 为合同，安全授权的隔离 Electron/Pi + 合成案卷测试 **E05 实际关页重进旧回执**、E03 真正 stop pending/busy、E04 可控旧 executor 迟到、E06 普通 Pi/Claude/批量/预览兼容、ENOSPC 和双持久失败恢复。未跑或只有 mock/SSR/静态脚本则 `NOT-RUN`；失败保留原始证据。
4. **R4 收口**：测试中的真实 bug 最小修复、对应独立正负例进入正式门禁；每个修复固定新 SHA，在新 SHA 上执行真实 CI/typecheck/边界/Electron main+preload+renderer；按实际证据更新 29 唯一验收账本、30/31、44/45 或新报告、PR 正文，注明日志/UTC/退出码/sha256。**旧 SHA 的绿灯不能转借给新 SHA**。

## 5. 永久工作原则与风险

- **最小复用**：沿用 Main 原有 owner/assignment/V2 账本、`onRunOwned` ACK、SDK/Pi 工具限制与共享写入 token；不再造第二个 runner/store，不将后台内部 owner 会话公开给 Renderer/Pocket/Feishu，不把审核模型完成认作行政审批通过。
- **安全 fail-closed、正负例同测**：未知/损坏 owner 索引与被撤销的授权不能当普通会话；写盘失败不等于持久成功；原始保护断言和普通 Agent/Pi/Claude 正例同时保留。
- **证据优先**：PASS/FAIL/PARTIAL/NOT-RUN/BLOCKED 分明，固定 SHA、命令、真正执行的测试数、原始 stdout/stderr、exit code、环境、UTC、文件 SHA-256；旧 37 E05 FAIL、38 原始四 FAIL、44 真实旧回放 FAILURE **不得改绿或删除**；保证见证 Hook/模型/IPC 真调用发生。
- **禁止扰动并行测试**：不强推、不覆盖、不重置别人工作树；文档只在本独立 handoff 分支，等待正在跑的任务结束之后再决定合并入口。新 agent 若发现工作分支比本文件更新，应先对比。
- **持久阻断**：P05 中心 Relay 仍 BLOCKED、独立 Pocket 补丁 PATCH READY / TARGET NOT-RUN；P04 永久 tombstone + UUID owner journal 不做缺乏安全证明的 TTL/GC，容量持续跟踪；P06-S02 **NOT ACCEPTED**、P06 **PARTIAL**、LIVE-07 **PARTIAL**；P07/P08 不启动，PR #21 Draft/Open、**MERGE NO-GO**。
- **隐私隔离**：只用隔离 `PROFER_CONFIG_DIR`/`PROFER_USER_DATA_DIR` 和合成案卷；不要向公共日志/artifact 提交 API key、用户 profile、私有 transcript、内部 owner ID、真实学校材料。CDP 必须只在本机授权环境监听。

## 6. 一次性恢复与本交接的使用方法

1. 新会话先读取 **此分支的 46 和 47**，按本文第 2、3 节理解“源码已经做过什么”和“尚无证据证明什么”。主开发依然以 `feat/review-owned-background-sessions` 实际最新 HEAD 为准，不以 handoff 分支旧代码替代。
2. 随后读开发分支的 45、44、29、30/31，只有需要追溯底层实现或历史失败时再按 41→40→39→38→37 查看。完成本地验收之前不要改 29 中的 LIVE 状态。
3. 如果要同步文档，先基于最新 PR 分支比较这份 handoff；仅移植需要的交接文字，避免覆盖随后发生的工作。此次 handoff 是**文档提交**，不代表新增受控/真机 PASS。

**交接结论：已准备好让新会话接续当前本地验收和 RECHECK，而不是重做 P06-FIX-01；当前仍 NO-GO。**
