# Dev-B R18｜重启材料恢复再授权、解压清单保全与来源版本失效

**分支/归属**：Dev-B Draft [#142](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142)，`feat/v3-dev-b-template-intake-r01`。以上一独立 Gate O 全绿 **R17 `e9215affaf536757d4b63ffcb012bb53006a1821`** 为只读回滚基线。跨线规则以 [#145 统一协调](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/145) 为准，C 的 B-CR-002 离线读/删除 Check 正式 ACK 生产写入权限不下放给 B。

## 1. 实际代码开发

### B2 原始 ZIP 检查点恢复：受控重新选择，非自动复活

在现有 `ReviewB2ArchiveVault` 上新增 `recoverAfterMainPicker(ctx,archiveId,reselected)`，**不创建第二套存储或覆盖旧检查点**：

- 先在 owner-scoped read 中复验原始持久 bytes、checkpoint manifest、ZIP CRC、条目和当前历史解压策略。原有 `/2` decodeLimits 原样锁定。
- 只接受 **严格大于历史 `stagedOwnerGeneration`** 的新 Main owner generation（同/低 generation 拒绝）、新 Main Picker 重新确认的 `B2TrustedZipInput`（实际 native picker 信任取决于 C Main 接入，Renderer 不得自称授权）。
- 重新选择的输入必须与旧 `requestId`、`archiveSha256`、总长度、原始 bytes **完全一致**，且 physicalArchiveKey 不是空值；每个压缩条目的旧 `status/reason/sha256/name/index` 逐项一致。原件不一致、历史 `/1` 未锁解压策略、失权、非法 owner、假原件均 fail closed，不能自行从旧 archive bytes 重新签可信 token。
- 恢复用独立新的 `ReviewB2StagingService` 发放新的 `candidateId/materialId`，`role=unassigned`、receipt `needs-user-confirmation`。返回 `businessWriteAllowed=false`，**只表示待确认候选已暂存，不表示安装 MaterialVersion 或进入 CurrentCase/ReviewBatch/ReviewRun**。
- 原始 `checkpoint.json` 和 `archive.zip` 历史清单与哈希不改变；恢复后旧原件 Checkpoint 保留可核验。没有执行任何隐式修复/清理/批准。

### B2 解析来源版本：保守整体失效

`ReviewB2SourceVersionAdapter.compareCandidateSourceVersions(ctx,previousCandidateId,currentCandidateId)`：
- 两份候选都必须处于**当前相同 Main Owner/generation/case 的已验证 staging + 本实例 parser registry**，重新哈希现存原件；撤权、未解析、重启后不存在旧 registry、伪物理版本、旧/新字节篡改全部失败拒绝。
- 只有 **完全相同的 candidateId、parseRevision、inputFingerprint、documentVersionId 和 rawSHA** 才能把旧块列为 `retainedOldBlockIds`。
- 不同物理原件（即使文件名、大小甚至原始文本字节一致）全部标记为 `invalidatedOldBlockIds`，禁止仅按 block 文本/索引推断不同 MaterialVersion 的旧 SourceIdentity 仍有效。
- 结果 `candidateOnly=true/businessWriteAllowed=false/schoolPolicyVerified=false`；不是业务 Case 的正式 SourceLedger mutation。后续由 C 决定是否将这个 conservative invalidation 投影到正式合同。

## 2. 工程专项与 Gate 定义

- `review-import-checkpoint-v3-b2.test.ts` 扩 5 类正反例：新 owner、新 native key、同字节重选、旧候选 ID 不继承、旧解压限制严格保留、同代/撤权/不同原件/不同 request/legacy 原件拒绝，不产生新正式 Material。
- `review-v3-b2-version-transition.test.ts` 新增 6 类真实 TXT Main staging + 真正 `document-service` parser 的正反例：当前源不失效、版本替换全旧块失效、同字节不同物理版本分离、未解析/重启 registry 空失败、白盒 fault injection 字节/identity 篡改、撤权拒绝。
- 只准对最新精确 #142 SHA 的 GitHub PR CI / D2 / Review Baseline **同 SHA `completed/success`** 签 Gate O，并核对冻 Bun install、TS、package boundary、skin、Main/Preload/Renderer build、全量 Bun 原始日志和新专项用例。CI 首败保留后只能修 B-owned file 并重跑；不能拿 R17 旧绿充数。
- 待本轮 Gate O 通过后，再向 #145 的 `STATUS:B` 写 source SHA、完整 CI Run IDs、用例结果、失败及修复证据。除 B 自己的状态区，不得编辑 ABCI 其它线签署。

## 3. 留待 Gate E/L/P 与跨线签收

本批运行时新接口仍要求 **可信 C Main 传入 ctx/native picker 的真实身份证据**。没有把生产 IPC、Preload、CurrentCase/UpgradePlan、正式 durable ACK、SchoolPort、TemplatePublisher、运行执行器交给 B；没有隐式导入 I 的集成来源锁。恢复、重选、离线证据仅处于 candidate-held。

原有 50 套模板依然 candidate-held，47/50 raw match、三份隔离冲突、G01 34 Scope UNKNOWN、4163 Source applicability UNKNOWN、32 高危来源语义未核准；Gate E 本机真实跨平台、Gate L 校方政策、Gate P 第51套真人试用均未完成，Release NO-GO。
