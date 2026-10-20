# Dev-B R33｜C 限定签收后续：完整来源版本、51st 持久作者恢复与全域人工缺口 UI

日期：2026-10-20。前置 C 正式核验 [#142 comment 6285078067](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6285078067)。上轮 B 精确已签父 `3682465902565205a16a88a00324dc42ecf8ccbd`（回滚锚）；C R10 `2cb8331b8fdff43da70a894ec597820595cb4d2d` 仅批准 **六个旧 B exact blobs 给 C 自己隔离产品分支**，**没有批准 I 或任何 R26–R29/R33 新来源**。本 R33 只在既有 B Draft #142 上开发，不编辑 C 自有 Main/IPC/Preload/shared/Case/Run/Host/School/BusinessWriter。

## 完整产品工作（R33 新增和加强）

1. `review-v3-b33-currentity-snapshot.ts`：对 **全量 B30 bytes-verified staged materials（最多 500）**、Owner generation 与 **B30 非凭证 scopeIdentity**、B3 technical route 选项、B20 真冻结作者修订/候选 SHA、B19 每个 Check×Target×Object×Subject 与精确 SourceRef、raw SHA、documentVersionId、parser block/read extent/input receipt、可选 B23 recovery 及 B26 历史证据当前摘要，计算排序稳定、可重复 `readVersion` SHA256；完全无 Main 身份认证权限。输入多/少材料、跨 ZIP 偷换来源、Subject/role/版本/解析、重复候选、501 项超限、变动的 Owner/scope 都不能按原候选继续。
2. B-owned 原 `ReviewV3ProductWorkspace`：**原件每页 25 项**，可处理多 ZIP、大集合而不同时渲染 500 张卡；候选 B27 的人工待办与 Check×SourceRef，B26 五大原因 UNKNOWN/Gold 总数摘要、筛选和分页。依旧不将观察文本自动变成“修复完成”或发布政策。
3. 新 `prepareB33PristineReopenLookup`：仅允许合法候选 ID 建立**revision 0 零编辑查询壳**；用户必须经已有 B1 作者 `onReadLatestCandidate` 的 Main-backed 两次读取和全历史链验证，主动比较/确认恢复。未接真实 C latest-author read 的恢复按钮禁用；已有活动作者编辑器时，禁止直接切换以防未保存内容被覆盖。不会创建新的 B1 持久影子库。
4. `assertB32StillCurrent` 进一步比较 B3 当前 routing、B27 readiness、B23 recovery、B20 完整候选快照以及所有 B30 byte identities 和 readVersion。改变来源后必须重新审查当前候选和回执，不能仅对比源 ID。

## R33 源码变更和精确依赖闭包（待最终工程 SHA 锁定）

**新增 R33 主要生产 blobs（本批若有后续修复须以后续最终 SHA 重核）**：

- Main B-owned helper `apps/electron/src/main/lib/review/review-v3-b33-currentity-snapshot.ts@e5c31573c6cd7a2f8a7169f92e3fcaf9ccd72fd8`。
- Renderer ID reopen helper `apps/electron/src/renderer/components/review-v3-dev-b/review-v3-b33-author-reopen.ts@fde0b281a8df90bd65cd1bfe584957f5fbb05938`。
- Main new test `review-v3-b33-currentity-snapshot.test.ts@0fa4e402698cc9727a11206fceb80e63b6b05dbe`；reopen test `review-v3-b33-author-reopen.test.ts@42ff1db730c17499789ff2f662b73d89e1a6b972`。
- 已改动的 B UI `ReviewV3ProductWorkspace.tsx@2bd9645cfb7ee0baffe55ae63fdff499fd84611d`、入口 `ReviewV3CandidateIntakeSurface.tsx@e0ec266a7c815c43d7b098b65895a91a99cc5c30`、Renderer helper `review-v3-product-workflow.ts@40558b169f3bde85e21af451b87aa8ef4ff40301`。

**此清单不是 C 的已授权重放合同**。上轮 C 准许的 R30–R32 固定六 blob 仍保持原 SHA，不应以新版浮动替换。R33 所需但**尚未获得 C 重放许可**的 B26–R29 深层生产依赖包括：
`review-v3-b4-bulk-evidence-workbench.ts@456192fc5932929b9193f6833cee0bd6e4fadd44`，
`review-v3-b-candidate-readiness-workbench.ts@426e93270e2a533575c83a7f1408adf7a577b2dc`，
`review-v3-b-bulk-remediation-cycle.ts@53e946327f7354e5a16fa5017779049bdcf682e3`，
`review-v3-b3-unmatched-author-bootstrap.ts@7af5fb6db342f3308257e1adf5232bc1ca5459ea`；以及这些模块依赖的旧 B19/B20/R25 和冻结 D4 八域 JSON。C/I 必须按单文件 Git blob+引用闭包独立审查，禁止仅按 R33 新文件去移植导致破损的运行依赖树。

## C Main 必须提供且 B 不可自行安装的端口

- 用真正 C-owned current Principal/session/frame/Owner/generation/epoch + B2 native Picker/staging/ZIP vault/parser/ledger 获取 **同一时刻的真实完整材料**，按授权范围调用 B30 与 B20。B33 `readVersion` 是内容哈希，不是 Principal/Token/业务资格；C 必须在每个 await/IPC 返回前再确认 Principal 和 actual grant。
- Main `onReadCurrent` 返回 B32ProductRead，`readVersion` 必须由可信物理与作者/解析/路由实际快照确定；B 的纯函数可作为一次校验与重算，但不能让 Renderer 提供假的版本当签名。
- Main `onPrepareUnmatchedDraft` 需要**单申请、单 Subject、全部 B2 来源、确实 unmatched、人明确确认**之后才可复用 B29+B1；B1 修改/保存/冻结/恢复仍经过原可信作者服务。
- `onProposeRemediation` 只有 C 明确接入有 actor、owner epoch、source/version 和幂等回执的持久观察账本后才能启用。此前保持 UNAVAILABLE，不能把浏览器事件当成已落库或学校认可。

## 历史缺口和验收要求

八域 50 原候选、3875 Check、49/50 原 frozen 字节（G08-T03 缺）、G01 34 scope 缺口、4163 UNKNOWN SourceRef、32 条高风险条款仅技术 pin 而非独立 Gold；全部按历史原版本不变。R33 不清零、不宣称政策语义通过。集中测试必须覆盖多 ZIP/Subject、版本/Owner/epoch/冻结 Check/Parser/SourceRef 改动、超 500 拒绝、作者重开不覆写、Main 未安装不虚构、分页不丢记录。仅在**最终精确 SHA 同一轮 PR CI + D2 + Baseline 3/3 通过**时签 B Gate O。Gate E NOT_RUN、校方 L BLOCKED_NO_AUTH、P NOT_RUN、Release NO_GO；#142 Draft、回滚上轮 B R32 绿 SHA `3682465902565205a16a88a00324dc42ecf8ccbd`。
