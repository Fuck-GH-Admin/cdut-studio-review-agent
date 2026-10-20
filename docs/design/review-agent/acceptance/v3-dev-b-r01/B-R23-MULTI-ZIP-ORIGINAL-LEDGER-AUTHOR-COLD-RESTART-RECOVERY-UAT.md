# CDUT Studio Review V3｜Dev-B R23 多份物理 ZIP + 原件账本 + 第 51 套作者版本的重启恢复预检

**会话身份**：Dev-B，B1+B2 自有候选能力，基于 #142 上一全绿 R22 `8ff484a670932cacf23e8c1e7a2564043c2ac05f`。本次不是 C Main 接线，不是另起真实 CaseStore，不重造原始档案；R23 的单一输入是现有持久 B1 作者仓、B2 ArchiveVault + InputLedger /2 和 C Main 将来独立授权的当前 Owner/档案注册表。唯一四线协作协议：#145 `ABCI-UNIFIED-COORDINATION-AND-STATUS.md`；本文件 B-only，不要求 A/C/I 读取、复用或直接合并。

## 1. 确认的产品缺口

R19–R22 既有能力能够保留 ZIP 原始字节与人工输入 /2 receipt、B1 frozen 作者版、解析块及来源绑定；ZIP vault 有 `prepareRestage`、`recoverAfterMainPicker`，但**单份档案恢复能力不等于多档案联合当前可信恢复**。

一次业务可以有多个 ZIP、多个 role/Subject、其中一部分 confirmed，另一部分 pending/declined。重启后历史 owner generation 的 `accepted` 在账本中仍应作为历史依据，但**绝不可被 Main 自动当作新会话的可信 SourceIdentity 或 Case 中已应用的 MaterialVersion**。此外重新读档过程中，其他进程可能修改 append-only author、输入账或 C 的当前 Owner/frame/档案集合。需要完整、保守、不可部分成功的预检，向 C Main 和 B 作者页面分别提示下一步需执行的真正授权行为。

## 2. 实现与精确代码边界

新的 B-only service `apps/electron/src/main/lib/review/review-v3-b1-b2-recovery-preflight-v3-b.ts`，Git blob `7001e2e5baa7bdebb7c4ee852e9150e8c97af4e6`，仅导出：
- `readB23RecoveryPreflight(expected:B20ReadAuthorExpectation, deps:B23RecoveryDependencies):B23RecoveryPreflight`；
- C 注入的必需 `B23MainRecoveryAuthority.currentScope()`、`currentArchiveIds(scope,expected)` + 现有 `ReviewB2StagingService/ReviewB2ArchiveVault/ReviewB2InputLedger`；
- **不接收 Renderer 提供的 archive IDs、owner generation、previous receipt proof 或 native picker file path**。Reader 接口供 C 未来真正受信的 Main Principal/session/frame/Owner and epoch 认证器调用；这些入参是依赖合同，B 没有真实签发 C Principal 或安装 IPC；
- 真实 `readB1AuthorRevision` 完整作者历史链、`readB1FrozenCandidate` 当前保存 revision+fingerprint、`verifyReviewB1Descriptor` 校验。作者版本变动、旧冻稿、未保存编辑意外晋级皆 fail-closed；
- 每个 ZIP 用 **真正** `vault.inspect` 再读 original bytes/checkpoint；`ledger.snapshot` 使用真实 input.lock 读取 append-only /2 receipt。多档案注册表必须当前 C Main 认证、无重复/非法 ID、上限 32；先精确 snapshot，再逐档案二次读取 `archiveSha256/checkpoint manifest/ledgerHash/ledgerRevision/stagedOwnerGeneration`，最后复验 B1/冻结档案、C Main 身份 epoch 和完整档案集合；有任一变化直接拒绝整包而不是成功一部分；
- 仅列 `historic-accepted-needs-new-source-confirmation / previously-skipped / previously-rejected / not-yet-confirmed`。历史 `confirmedRole/Subject/receiptHash/ownerGeneration` 属只读历史，不是当前权限。全部 `sourceReuseAllowed=false`、`currentSourceIdentityVerified=false`、`requiresTrustedNativeRepick=true`、`requiresCurrentParserAndSourceReceipt=true`。Owner generation 未超过 archive 初始代数时 `freshOwnerGenerationRequired=true`（仅诊断；不能因此“默认允许恢复”）；
- 结果始终 `candidateOnly=true/publicationAllowed=false/businessWriteAllowed=false/schoolPolicyVerified=false/authorityInstalledByB=false`，只附不可信审计便利 hash；**没有** C NativePicker key、原件字节、正式 Case/Run/SourceLedger、Policy Issuer、Current Material ID、学校 Gold 或行政审核结论。

**注**：原 `ReviewB2ArchiveVault.recoverAfterMainPicker` 才可能在 C 授权新 generation、真实 NativePicker 重新选取且 checksum/文件相同时申请重新暂存（仍非材料应用）。本 R23 不执行它，不伪造系统文件选择，也不将旧 parser block/source proof 复活。基于纯 B 依赖接口只能完成离线读侧可靠性；C Main 在每个 await 之前/之后都必须独立验 Principal/frame/Owner/epoch，并在业务提交点另行锁住当前原件与 source identity。

## 3. Git blob 依赖图和回滚

| 实际文件 | 固定 Git blob | 作用 |
|---|---|---|
| `review-v3-b1-b2-recovery-preflight-v3-b.ts`（新 B service） | `7001e2e5baa7bdebb7c4ee852e9150e8c97af4e6` | 当前作者+冻结候选、各 ZIP 原件及历史 input ledger 多源保守诊断 |
| `review-v3-b1-b2-recovery-preflight-v3-b.test.ts`（新 B test） | `27da50b5a5a57b89027f4a3870d94bd0cdd48655` | 真 ZIP、多档案、真实修订/回执 /2、重启新 staging 与攻击负例 R23-01..13 |
| `review-v3-b1-b2-main-read-bundle-v3-b.ts`（R20，未改） | `2ff051fc5d18a2c0ef9465188a3611a71a0989ee` | 提供类型 `B20MainReadScope/B20ReadAuthorExpectation`，C Main 可信读取候选接线仍未由 B 安装 |
| `review-template-author-store-v3-b1.ts`（未改） | `065251ca843c51e68e225dc688bb7a8caab2fea7` | 真 append-only B1 保存、读回、冻结候选 |
| `review-import-checkpoint-v3-b2.ts`（未改） | `35b4d9e757b5b1530c7ca0407c405e8513b5caf7` | 真原件 archive.zip、ZIP central directory/CRC、解码策略封存 |
| `review-import-ledger-v3-b2.ts`（未改） | `273b8ea71ed739f01238c5bcf1f57be7a39a6502` | InputLedger /2 append-only input receipt、role/Subject/hash 当前和历史核验 |

R23 对 #142 的工程修改必须限定新增 B-owned service/test/本文档，不能更改 C-owned shared/Main/Preload/Case/Run/Business writer，也不能暗中合并 I 旧 source-lock；I/C 后续若需引入，须以本轮最终 Commit SHA **加上述精确 blob** 独立签收。

## 4. 真正离线案例矩阵与首败

测试 R23-01..13 覆盖：
- **R23-01** 2 份不同 ZIP、4 原件、accepted/pending/rejected 混合、历史 receipt，跨 staging 重启仍只能生成 candidate-only 需重新确认；
- **R23-02** 同 Owner generation 的重启请求明确不新鲜，即使旧 role+Subject 已确认也不重用；
- **R23-03** 空档案集合返回 `no-registered-archives`，不等同 material installed；
- **R23-04** 缺/伪 Principal/档案注册表、重复和超额档案拒绝；
- **R23-05** 跨 Owner/Case 读取已保存 ZIP 被拒；
- **R23-06** 2 ZIP 之一原件字节损坏导致整个预检拒绝；
- **R23-07** InputLedger receipt Role/Subject 更改，真实账本回读拒绝；
- **R23-08** 作者新修订使旧冻结版本期待失效；
- **R23-09** 伪造冻结 fingerprint/可信依赖缺失拒绝；
- **R23-10** 预检期间 C Main frame/epoch/Owner 变化拒绝；
- **R23-11** C 当前档案集合首次与二次读取不等拒绝；
- **R23-12** 首次账本快照后，真实旧 Main ledger writer 通过 CAS 写第二条 receipt，二次读取抓取历史账本变动并整体拒绝；
- **R23-13** 中途 revoke Owner，不能继续读历史权限。

**实际首败（必须保留证据）**：最初 `be99c27ba540e2f898a5ec2c81fdfcad61127464` GitHub Actions Baseline `39337465466` 成功，但 PR CI `39337465484` 与 D2 `39337465468` 均 TypeScript TS18048/TS18047/TS2488 编译失败：optional file/author/frozen/Main archives 未收窄。代码修复 `832cf1ba500158dca6984ceb0f9635ceb22d7d7b` 在 B-owned service 用明确 fail-closed `throw` 分支处理所有缺失依赖，**未放宽证据或权限**；其后需要全量测试实际通过并在最终新 SHA 重跑 3 workflows。旧失败不能作为验证成功。

## 5. 后续集中真实验收 Gate E/L/P

**Gate O**：PR CI (frozen install、全量 TS、package boundaries、main/preload/renderer build、全 Bun)、D2、Review Baseline 同一最终 SHA 全 SUCCESS，13 个 R23 原始单项 PASS + 总 Bun 0 FAIL。此时仅 B 候选物理恢复**只读**能力完成，不等于真实重启 UI/文件选择。

**Gate E**：NOT_RUN，集中在用户本机虚拟桌面/真 Electron 真实 C Main 认证 Owner/grant/frame、NativePicker/drop、3 OS/Office71/PDF/ZIP、20 秒无匹配 B3→B1 第51套→B2 原件两档案 + 非安全中断→冷启动→用户明确重新选择文件→Role/Subject 人工确认→重新解析与 B19/B20 来源快照、100案500原件、ENOSPC/断电/竞争事务/重启主程序、日志屏录/精确源 SHA。测试人员不可直接修改正式 Case/业务状态来模拟成功。

**School L**：BLOCKED_NO_AUTH；50 套中 3 项原字节冲突、34 项 G01 scope UNKNOWN、4163 applicable UNKNOWN、32 高危语义待校方原件核验，不允许历史 `user-declared` 自升 school policy verified。

**Product P**：NOT_RUN；五位独立非开发者×30min，实测完整第51套新模板与两份 ZIP 的临时候选提交流程，并测异常退出和恢复理解程度。

**Release：NO_GO**。#142 Draft/未合并，C Main 权限、原生文件选择与正式业务写入均需 C 独立授权签收。
