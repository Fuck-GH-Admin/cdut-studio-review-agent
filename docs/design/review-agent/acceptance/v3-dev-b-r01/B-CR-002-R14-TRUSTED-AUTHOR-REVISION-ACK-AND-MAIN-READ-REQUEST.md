# Dev-B → Dev-C 正式裁决请求 B-CR-002｜作者修订可信读取、删除 Check ACK 与工作台安全接线

**申请身份**：`V3-DEV-B-R14-CROSSLINE-REQUEST`；申请人 Dev-B；最终裁决 Owner Dev-C。  
**已有合同**：唯一 ABCI 协议 `B-CR-001 / APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`，特别是 B-2 的正式 `UpgradePlan` Check 删除 ACK/CAS/Receipt；**本文件不重复申请该既有原则，而是请求它的具体端口、持久语义和接线边界。**  
**Dev-B PR**：#142，R13 已独立通过的可回滚 source SHA `f4cb0bc5b8417107d315db157554c66536ca1bb8`；R14 作者差分本地 UI checkpoint `7884b8171ad5e6703da8948c6c24113fa7141bae`，R14 B4 深审 source checkpoint `25f8594ad7b12df9de0904aee0a75d246a962fe1`。**R14 O Gate 须查新 exact HEAD CI，不得把 R13 绿色结果迁移。**  
**C 目前可依赖的正式 C/Main 起点**：从统一协调文件 `C-I3-ANCHOR-003` 仅锁定 `e87f75e044becc35c28292cc835a2c2ec41df48a` 技术集成基础；当前 #144 浮动 HEAD 不能当做签收；I Main port lease 仍 CONDITIONAL_NOT_ACTIVE、正式 business writer DENIED。

## 1. 请求 C 明确裁决的事项（默认全部未授权）

### B-CR-002-A｜可信作者最新修订读取/冲突恢复端口

目前 B1 作者界面可检测修订 CAS 冲突、保留未保存草稿、导出备份及显示本次打开快照的差异，但**无真实 Main 授权的 latest-revision reader**，因此不能自动重开真实新修订、更不能在冲突后自行 merge/save。

申请 C 决定是否由 C 独占在 Main/Preload/工作台建立只读 AuthorRead 能力：
- 由 Main 的 `sender/senderFrame`、当前 session、Principal、Owner generation 和 template scope 授权；绝不采信 Renderer 传入的 actorId/ownerId/签名；只接受明确的模板标识，不可遍历别人的草稿；
- 返回只读 `templateId/revision/persisted source digest/source document(canonical candidate-held only)`，并绑定实际 Main AuthorLedger 当前修订/Owner；Author source 与 policy publication 分离，校方来源未验证仍候选；
- 异步读取期间窗口关闭、Owner 撤权、跨 frame/另案以及版本变化必须拒绝晚到数据；不得自动三方 merge 覆盖当前未保存编辑；
- UI 使用回执进行**用户可见的两版本 compare / 选择保留或导出**，其后再经 C 的可信 Writer + revision CAS 保存新 revision；禁止默默覆盖。

请 C 决定接口归属/函数级变更位置、是否以新 channel 实施、以及是否需要独立 I adapter Gate O；**无明确 hunk 租约不允许 B/I 修改 C IPC、Preload、CurrentCase。**

### B-CR-002-B｜删 Check 升级 ACK 的 durable 业务载荷及签收

R14 B-owned 作者 UI 新增危险操作二次确认与既有 Check 删除前的本地 ACK 检查，且在 UI 文案中明确 **并非正式持久业务 ACK**。保存草稿仅需 `onSaveDraft(document,expectedRevision)`；目前 B 的输入组件**没有渠道提交正式 UpgradePlan 删除 ACK**。

请求 C 在 `B-CR-001/B-2` 已裁决原则下具体确定：
- 正式升级时 ACK 的精确绑定对象：`oldPlanFingerprint/newImmutableCandidateFingerprint + oldRevision/newRevision + removedCheckKeys/Check×target×sourceVersion + CurrentCase/Subject + MainPrincipal + reason + requestId + expectedRevision + payloadHash`；
- ACK 的接受只应由 C 主进程验证身份、正式发布政策/Gold 门禁、旧 Plan 仍有效的 CAS、删除后的旧 Run/Receipt 历史保全；ACK 只认可显式用户操作，**不可由 UI diff、源文件 JSON 声明、自动迁移推断、I synthetic test 签发**；
- 无删 Check 则不能误要求删除 ACK；删 Check、跨 Subject/来源撤权/版本回滚/旧值改变/丢审核人授权时必须 fail closed；
- 可由 B 提供独立技术 `proposedRemovalDiff`，但**业务真值的升级载荷/Receipt schema、InstallPlan/UpgradePlan 及正式 commit 仍属 C**；如需扩展 shared DTO，请由 C 自行版本化而非 B 修改。

### B-CR-002-C｜第 51 套真实作者 UI 安装/集中 Gate E/P

是否允许 C/I 在新的**冻结 C/I 锚点**下接入 B-owned `ReviewV3AuthorWizard`、`review-v3-author-import.ts`、`review-v3-author-diff.ts` 与 B1 Main-only author adapter 的有界技术能力，用于 **candidate-held only** 作者保存/读回/预览/冻结？B1 组件不得调用学校发布、CurrentCase InstallPlan 或伪造 Principal。

明确最小集成验证并非“降低质量”：Main 可信会话、CAS 冲突、IME 组合输入、导入伪 source/actor、旧 Check 删除、异步保存预览撤权、用户操作录屏/日志/source digest/receipt；5 位非开发真实用户各 30 分钟的完整 UAT 必须等真正 Electron 界面 + Main 接线后执行。B 可先独立 Gate O 并提交 I source blobs，不要求因 Gate P 阻断停止独立开发。

## 2. 对 C 的请求格式与边界

建议 C 在唯一 ABCI 协调文件 `DECISIONS:C` 区中以 `B-CR-002-A/B/C` 分别返回 `APPROVED_SCOPED` / `CHANGES_REQUIRED` / `DEFERRED_BLOCKED`，附明确接口 Owner、修改路径/hunk、允许的技术只读或候选写范围、固定 source SHA、必要联合负例、Gate O/E/L/P，任何未批准子项继续 `PENDING_C_DECISION`。

**本请求不要求 C 立即合并或发布，不改变既有 I3 C 锚点或 B 在 I2 的 R10 固定来源，也不授权 I Main/Preload/Business writer 写入。** Dev-B R14 工程代码仍全部留在 #142 Draft，独立验收及跟进在 B `STATUS:B` 记录；C 决议才可改共享接口。
