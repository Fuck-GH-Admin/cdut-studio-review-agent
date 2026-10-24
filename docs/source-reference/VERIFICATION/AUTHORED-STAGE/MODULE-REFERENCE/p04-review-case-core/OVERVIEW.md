# p04-review-case-core：案卷主账、命令、权限与技术计划边界

基线 `05fb2565e20eb1760233696be1832f68196b37c2`。前置 CODEBASE-MAP 独立 PASS；以下为**静态源码核对**，产品运行 **NOT_RUN**。

该分区维护原生/兼容案卷、命令事务、Main 身份/计划授权、阶段与恢复边界。物理 review 目录还跨 p05/p06，不能把整个目录归到本分区。

Main 接口链为 reviewAPI → review-ipc → C0 主窗/主帧验证 → native workspace/application service → case-store-v2.submitCommand。Main 自行派生 local-device Principal（[apps/electron/src/main/lib/review/review-c0-authority.ts:20](<../../../../baseline/source/apps/electron/src/main/lib/review/review-c0-authority.ts>)、:28/:58），拒绝 Renderer Actor/Principal 冒充教师、学校或系统。共享 C0 类型 [packages/shared/src/types/review-v3-c0.ts:31](<../../../../baseline/source/packages/shared/src/types/review-v3-c0.ts>) 明确 Principal/Plan/Source/Run 的职责，类型存在不授权限。

`state.v2.json` 的 CaseAggregateV2 是原生业务主账；legacy case.json 是并存兼容/投影路径，不能把二者独立修改后当作自动一致。submitCommand [apps/electron/src/main/lib/review/case-store-v2.ts:203](<../../../../baseline/source/apps/electron/src/main/lib/review/case-store-v2.ts>) 在同案 queue+OS lock 内读、按 requestId/type/payload hash 幂等、CAS、纯变更、revision+1并附 Receipt 后写同一聚合。先幂等后 CAS，旧请求重试不重复变更；异载荷撞 requestId 被拒。archived 只能 RestoreReviewCaseV3 解封。

跨进程磁盘边界 [apps/electron/src/main/lib/review/review-v3-case-disk-tx.ts:78](<../../../../baseline/source/apps/electron/src/main/lib/review/review-v3-case-disk-tx.ts>) 使用 mkdir lock+owner token，state 写采用 fsync/上一有效副本/rename/父目录同步 :118。锁残留默认拒绝，不按 age 偷取；离线人工核查恢复接口 :170 没有 IPC。readAggregate 可回退上一有效副本**读取**、不自动重写（[apps/electron/src/main/lib/review/case-store-v2.ts:49](<../../../../baseline/source/apps/electron/src/main/lib/review/case-store-v2.ts>)）。rename 后 fsync 失败可能已提交，重试须读 Receipt；不能声称任意异常都已回滚。

legacy updateCase [apps/electron/src/main/lib/review/case-store.ts:278](<../../../../baseline/source/apps/electron/src/main/lib/review/case-store.ts>) 只有 supplied expectedRevision 才做 CAS；省略跳过，且单文件 tmp+rename 不等价原生 OS lock。更改核心代码时必须辨认实际调用落在哪种 writer。

真实 bootstrap 仅安装 local author/native product/D4/B1 技术计划能力（[apps/electron/src/main/index.ts:948](<../../../../baseline/source/apps/electron/src/main/index.ts>)）。candidate-held 作者草稿、D2 技术预审固定快照不等于正式学校发布；CanonicalPlan 升级另需独立 publishedPlanSource 与删除 consent（[apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts:152](<../../../../baseline/source/apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts>)），缺来源 fail closed。T05 服务 [apps/electron/src/main/lib/review/review-v3-t05-main-service.ts:404](<../../../../baseline/source/apps/electron/src/main/lib/review/review-v3-t05-main-service.ts>) 在同一 Case 事务核当前运行/任务/模式再写决定，不能由 Renderer 的 capability 投影替代授权。

内部 C11 本地 execution orchestrator [apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.ts:48](<../../../../baseline/source/apps/electron/src/main/lib/review/review-v3-main-local-execution-orchestrator.ts>) 要求 Main/A/Host 注入、只给候选人工核验/恢复状态；它不自行接入 ordinary Pi/IPC，不能当作已运行的产品后台主链。

继续阅读：[逐文件导航与接受状态](<../../../INDEX-VERIFICATION/p04-review-case-core.md>)；[API合同与错误规则](<../../API-REFERENCE.md>)；[完整作用域接口注册表](<../../API-REGISTRY.md>)；[跨模块导航图](<../../CODEBASE-MAP.md>)。
