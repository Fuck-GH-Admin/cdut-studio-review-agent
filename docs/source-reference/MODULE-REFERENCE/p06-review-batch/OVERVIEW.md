# p06-review-batch：入库、批次、评分、离线回件与同步

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

本分区承接物理来源/路由/模板与设置、材料登记、批次队列和自动化、评分轮次、离线包、SchoolPort/outbox。它复用 Case 事务，不能另建影子 Case 主账。

T06 是实际文件入库边界：OS picker [apps/electron/src/main/lib/review/review-v3-t06-main-service.ts:321](<../../SOURCE/apps/electron/src/main/lib/review/review-v3-t06-main-service.ts>) →不透明 selectionId/entryId+previewFingerprint → commit :524 →逐组建案/逐原件登记→request ledger/逐项回执→仅完整案卷列入成功批次成员。B staging/read preview 不产生 DocumentVersion；已经复制文件不等于业务入库。部分失败保留已建案/已登记原件，返回失败项，不承诺整批回滚。

批次创建 [apps/electron/src/main/lib/review/batch-store.ts:148](<../../SOURCE/apps/electron/src/main/lib/review/batch-store.ts>) 校模板/成员/政策锁；runBatchQueue :645 每成员保存 batchAttemptId、entryRunId、inputHash 及 Run 提供的可选 planFingerprint，再推进状态；缺失计划指纹不能据此宣称已拥有完整冻结 attempt 身份。async run 服务 [apps/electron/src/main/lib/review/run-async-service.ts:144](<../../SOURCE/apps/electron/src/main/lib/review/run-async-service.ts>) 先落 queued 再后台执行，取消 :215 同时触发图注册表与 AbortController。与工作台 review-owned 普通 Pi 后台 bridge 是两条具体入口，不因注释“Pi”就当同一条调用。

自动化 [apps/electron/src/main/lib/review/batch-automation-service.ts:38](<../../SOURCE/apps/electron/src/main/lib/review/batch-automation-service.ts>) 只消费批次绑定 Run，显式 assist/auto-return/auto-approve 策略与 revision 每步重核，业务动作仍交 Case CAS。group apply [apps/electron/src/main/lib/review/batch-group-action-service.ts:173](<../../SOURCE/apps/electron/src/main/lib/review/batch-group-action-service.ts>) 要 confirmed=true、operationId、预览 hash，范围变化要求重新预览。finalize 另查业务准备度，completed 技术运行不能自动充当正式决定（[apps/electron/src/main/lib/review/batch-store.ts:229](<../../SOURCE/apps/electron/src/main/lib/review/batch-store.ts>)）。

T07 评分轮次有单独 state authority 与 revision，Case/材料登记/决定由 CaseAggregate 管理，Run 独立写入 runs-v2 文件与 artifacts，并按 caseId/输入身份关联。Main 从已发布 rubric 和当前成员集合派生 round，init 仅 organizer；action 从当前 actor/状态校验，Renderer safeMaterials/naEligible 兼容字段不提供可信事实（[apps/electron/src/main/lib/review/review-v3-t07-main-service.ts:150](<../../SOURCE/apps/electron/src/main/lib/review/review-v3-t07-main-service.ts>)）。评分 store [apps/electron/src/main/lib/review/review-v3-t07-state-store.ts:70](<../../SOURCE/apps/electron/src/main/lib/review/review-v3-t07-state-store.ts>) CAS+tmp/rename，没有据此证明跨PID互斥。

T09 preview 只校验；import [apps/electron/src/main/lib/review/review-v3-t09-main-service.ts:435](<../../SOURCE/apps/electron/src/main/lib/review/review-v3-t09-main-service.ts>) 以 actionId/包hash/基础revision/本action附件staging 处理 accepted/duplicate/conflict/rejected。附件先登记而答复未提交时按精确 stagedRevision 核验续办；未知 applying effect 不静默重复。学生和评委包的权限/可见性不是包中任意身份自声明。

学校同步独立经过 SchoolPort + outbox（[apps/electron/src/main/lib/review/batch-store.ts:403](<../../SOURCE/apps/electron/src/main/lib/review/batch-store.ts>)、:461）。pending/重试/unknown 与真实 delivered receipt 分开；local/mock/不支持 push-decision 的适配器不等于已连学校系统。物理入库、评分轮次、Case事务、离线 staging 和学校 outbox 都有各自恢复边界，不能合称一笔跨系统事务。

继续阅读：[逐文件导航与接受状态](<../../INDEXES/p06-review-batch.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
