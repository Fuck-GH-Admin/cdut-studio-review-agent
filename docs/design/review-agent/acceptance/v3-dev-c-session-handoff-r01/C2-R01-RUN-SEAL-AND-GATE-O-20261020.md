# Dev-C C2-R01｜V3 Run 证据封存事务、真实来源信任条件与 Gate O

> **仅 Dev-C 专属工程交接**；不属于 ABCI 唯一共同协议。跨线授权以
> `acceptance/v3-integrator-i-r01/ABCI-UNIFIED-COORDINATION-AND-STATUS.md` 的 C 裁决为准。

## 1. 来源锚点和范围

- 工程仓库：`Fuck-GH-Admin/cdut-studio-review-agent`
- 工程 Draft PR：[Dev-C #144](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/144)
- 基线：C1-R10b + C2-R00 真五项 CI PASS `9a81b2c6b0022a20f82cb506b48b3b1baf298c4f`。
- 本批 C2-R01 工程测试源码提交锚点：`024fda41dc85067132fc45cfc0ace3d2bbb0f360`；**截至本交接初稿，最新本批 CI 仍未产生完整成功结果，不得继承前一绿 SHA。**
- 范围：新增 C-owned `review-v3-run/1` 类型、一次不可变 Case 权威 Run 快照、原有 C2 技术日志 SHA/回执严密重验和新的独立合成负例。无 A/B/I Owner 文件、无共享 C0 改版、无直接 Renderer/Main IPC 授权、无真实 Pi Provider 调用。
- 开发拥有者：C 独占；I 的 test-only lease 保持，Main read-only port lease inactive，business writer DENIED。

## 2. 本批交付的真实代码

| 路径 | 工程能力 |
| --- | --- |
| `packages/shared/src/types/review-v3-run.ts` | 新增明确版本 `review-v3-run/1`、`ReviewRunRecordV3`、有 Plan 来源的技术 Check 观察、真实 Read 证据和运行状态 `requires-human-review/incomplete/interrupted` |
| `packages/shared/src/types/index.ts` | 只导出新增版本类型，不动冻结 C0/1 |
| `packages/shared/src/types/review-v2-contracts.ts` | `CaseAggregateV2.v3ReviewRun?: ReviewRunRecordV3`；所有业务事件仍由唯一 `state.v2.json` + CAS Receipt 事务写入 |
| `apps/electron/src/main/lib/review/review-v3-technical-ledger.ts` | `assertV3TechnicalJournalIntegrity` 严核完整事件哈希、既有 Run admission Receipt、事件序号、绑定身份、精确 requestId/Receipt hash/revision、Host receipt ID 唯一性、技术终态位置、原件 raw SHA；`digestV3TechnicalEventChain` 对序列产生 SHA256；禁止更改精确事件身份以逃避幂等 |
| `apps/electron/src/main/lib/review/review-v3-run-writer.ts` | `sealV3ReviewRun` C Main-only：要求同案 reviewing、同 Plan/Run/Owner 输入冻结、最终 terminal 符合技术 Host 账、材料当前有效、原件 raw SHA、完整业务 CAS receipt 账、每条肯定性 Check 前需有真实 Host Read；以**一次 CAS+业务 Receipt**写入不可变 Run，禁止重复或覆盖 |
| `apps/electron/src/main/lib/review/review-v3-run-writer.test.ts` | 合成 Main/Host fixture：9 组以真实本地 `state.v2.json` 执行路径为底的正反例（无外部 Provider/学校），覆盖 Source Read→Check→Terminal→Seal、漏 Check 保留未观察、不读取即报 Check、重复 Check、错误阶段、主进程授权缺失、事件/原件篡改、封存二次覆盖、业务更改后失效 |

**业务权威分层**：
- 旧 C2-R00 是 `v3TechnicalExecution`：Host 的 read/check/terminal **技术候选持久账**。
- 新 C2-R01 是 `v3ReviewRun`：由 C Main 单案事务**封存的业务 Run 证据快照**，提供了明确的检查分母、技术产物绑定、不可变证据链和人工复核状态，但**技术 status='accepted' 不构成校规意义上的合规、评分或 BusinessDecision**。
- `state='requires-human-review'` **不是** Case stage `decided`；`incomplete` 和 `interrupted` 也不能自动继续获得 A Owner grant 或 Provider 重试许可。Run 封存不会生成 `CheckResult`、`BusinessDecision`、`OutboxReceipt`、学校 ACK 或 `runs-v2/{runId}.json` V2 影子。

## 3. 显式真实性限制和下一块 C2 工作

此切片**尚无实际 Main/Preload IPC 注册或真实 SDK Host 物理回执来源注册**：`sealV3ReviewRun` 内部入口的 mandatory `attestAtCommit(aggregate,run,events)` 必须由未来 C Main 独立检验真实 session owner-generation、不可变 inputManifest/hash、当前 grant 和 Host token 库；测试的 `()=>{}` 只证明事务合同，不能在生产路径当成认证。B1 Plan 冻结候选不是正式已签校方政策；A Pi SDK native request/receipt Hook 仍需独立证实。I 不得直接连接模拟 receipt 或放宽 C 当前边界。

暂限定**单案同时一笔封存 Run**，下轮须设计新 Run attempt/延续回合与 History、崩溃恢复、跨 PID 锁一致性、持久到外部文件系统时的 ENOSPC/EIO、以及真实用户工作台 Run 结果只读呈现；不得靠第二份 `runs-v2` writer 偷渡。C2 正式 Check/Decision ACK 和发布门禁仍独立。

## 4. 一次集中的精确 SHA Gate O

若本批仍是上述 SHA，使用下列命令；若任何首败修复产生新 SHA，**必须以修复后的新完整 40 位提交 SHA 重跑全部命令**：

```bash
git rev-parse HEAD
git status --porcelain
node --version
bun --version
bun install --frozen-lockfile
bun run typecheck
bun run check:boundaries
bun test --isolate \
  apps/electron/src/main/lib/review/review-v3-technical-ledger.test.ts \
  apps/electron/src/main/lib/review/review-v3-run-writer.test.ts \
  apps/electron/src/main/lib/review/review-v3-execution-contract.test.ts \
  apps/electron/src/main/lib/review/plan-binding-v3.test.ts
bun test --isolate --timeout 30000
bun run --filter='@profer/electron' build:main
bun run --filter='@profer/electron' build:preload
bun run --filter='@profer/electron' build:renderer
```

**证据**：PR CI + Baseline + Batch + D1 + D2 同 SHA `completed/success`、job ID/Runner/命令/exit + PASS/FAIL/SKIP；如跑不完只标 `PENDING/FAILED`，不得仅凭已有测试源文档记 PASS。Gate E 真 Electron 案卷、Case API/物理文件、双 PID/断电恢复；Gate L 校方身份/政策/Gold；Gate P 50 模板/7 Journeys/100 案 500 文件/51 套真人 UAT 独立。**现阶段 Gate E/L/P 不晋升**。

## 5. 关闭、授权、回滚

- 保留 `9a81b2c6b0022a20f82cb506b48b3b1baf298c4f` 旧 C 已通过的基线与这次 R01 新测试结果明确分开。
- 不从 A/B 目前失败的移动 HEAD 自动取新来源；I1 旧源已过 Gate O，但与 C2-R01 不是同一结合版本。
- C2-R01 可在 Gate O 绿后作为**C 主线技术候选**，并与 I 另行冻结、签署 *技术验证用* 新锚点。**任何正式 Host 入口与业务 writer 仍是 C 独占，须后续单独签来源信任与桥接 CR。**
- 回滚不得删除已持久化的 `state.v2.json`、`v3TechnicalExecution`、`v3ReviewRun`、原件 byteHash 或历史 Receipt；应保留法证副本并进行显式 schema reader 降级/迁移评估。


## R01 Gate O 首次真实失败及修复记录（后续追加，2026-10-20）

- **首败精确 SHA**：`e5329580484fcdc94b6fb330e8e2d5656c3c6b3b`；PR CI [#39291535211](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39291535211)，job `118193295130` 确实执行了安装与全仓 `bun run typecheck`，以 code 2 退出，后续步骤未执行。
- **四条真实 TypeScript 诊断**：`review-v3-run-writer.ts:74 TS2532`（历史 Receipt 的 Actor 可空）；`review-v3-technical-ledger.ts:106 TS2304`（缺少 `executionProposalId` 导入）；同文件 `:225 TS18048` 和 `:253 TS2322`（校验函数虽保证 Plan 存在，但 TS 跨函数控制流不能收窄可选 aggregate 字段）。
- **仅对首败的修复**：C writer `50cd7775160b33ef003c435dd5463ac6ecb14967` 用明确可空 Actor 比较（空 Actor 仍拒绝显示证据）；C ledger `3242b22a0825eec347b2748680bb746eb0f55215` 补纯函数导入并在验证后本地捕获经显式 fail-close 校验的 CanonicalPlan。没有放宽 Owner/Host/原件/Chain 信任门禁。
- **最新候选源码 SHA**：`3242b22a0825eec347b2748680bb746eb0f55215`，其完整 Gate O 必须单独运行；**不能从旧失败 SHA 或 C1 的旧绿色 SHA 借用任何成功结论**。
- 第一批源源码上的 12 项 C2 writer 负例和既有 C2 journal 测试都已提交，但在首次 CI 的 TS 步骤之前/之后未实际运行；如最新测试步骤出现新首败，保留日志再修，不接受删除安全断言作为捷径。
