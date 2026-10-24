# 设计与当前实现差异

基线：`05fb2565e20eb1760233696be1832f68196b37c2`。本文在 [源码地图](CODEBASE-MAP.md)、[模块／API 参考](API-REFERENCE.md)、[当前架构](CURRENT-ARCHITECTURE.md) 和 [业务流程](BUSINESS-FLOW.md) 相应前置门禁通过后编写。对照依据是冻结树内设计文件、实际生产调用方和本轮源码核对，不能把旧审计的结论直接搬成当前缺陷。

设计文件 [03-architecture-and-delivery.md:3](../../baseline/source/docs/design/review-agent/03-architecture-and-delivery.md) 已明确：未标“现有”的接口／模块可能是拟新增设计。因此本文区分 **已落实、兼容路径、部分实现、当前缺口、待验证**；“类型存在”“单测调用”“IPC 已注册”分别不能代替“生产调用已接线”“运行验证通过”“依赖权威已安装”。真实模型、GUI、外部服务及故障运行验证均为 **NOT_RUN**。

## 1. 已落实的边界与仍需区分的旧路径

### D01　文件主账、命令事务与旧 CAS 注释

设计 [03 §2／§7](../../baseline/source/docs/design/review-agent/03-architecture-and-delivery.md) 和 [07 应用事务设计](../../baseline/source/docs/design/review-agent/07-application-and-execution-design.md) 要求审核文件优先、版本并发和回执一致。当前 V2 `submitCommand` 在逐案队列／C2 磁盘事务内检查 requestId、payloadHash、expectedRevision、归档状态，revision 统一递增，业务变化和 receipt 同次写入。这部分已有真实服务实现。

但 V1 `updateCase` 的注释声称省略 expectedRevision 视为 0，实际代码只在值不为 undefined 时检查，省略就跳过 CAS。V2 的约束不能推广到全部 V1 兼容写。**状态：V2 已落实；V1 存在注释与实现差异。** 修改旧调用时应传明确修订号并核对兼容写屏障，而不是依赖注释默认值。证据：[case-store-v2.ts:203–259](../../baseline/source/apps/electron/src/main/lib/review/case-store-v2.ts)、[case-store.ts:270–300](../../baseline/source/apps/electron/src/main/lib/review/case-store.ts)。

### D02　当前业务运行的回退问题已有修正

当前 `resolveCurrentBusinessRun` 排除模板／诊断及合成 ID，取最新业务 attempt；最新一次仍运行、失败或取消时，不回退到旧成功，并核验 T03 当前性。T04 的 `run-tpl-*` 已被归为 diagnostic，不能再把历史审计中“所有 Run 都争夺当前业务身份”原样视作已证实的现状。

旧 V2 普通 `run-*` 仍可能属于 business-attempt，并非只有 Pi。**状态：最新失败不回退的选择策略已落实；多执行入口仍属兼容事实。** 真实并发／中断场景未实跑。证据：[review-runtime-contract.ts:20–49、134–194](../../baseline/source/apps/electron/src/main/lib/review/review-runtime-contract.ts)、[workspace-business-service-v2.ts:87–110](../../baseline/source/apps/electron/src/main/lib/review/workspace-business-service-v2.ts)。

### D03　技术完成、业务可办理与正式决定已经分层

设计要求模型意见不直接成为正式决定。当前 Pi 提交保存技术状态和独立 business-readiness 产物；`businessReady` 要求 completed、检查无待确认／失败／未执行且材料全读，但不表示全部检查 compliant。正式决定仍是独立业务命令，D2 技术预审拒绝正式阶段决定。

**状态：分层已落实，不能把它重新描述成“completed 就批准”的未修问题。** UI、报告和新增调用仍须保留这些区别。证据：[pi-case-review-service.ts:819–836、1039–1163](../../baseline/source/apps/electron/src/main/lib/review/pi-case-review-service.ts)、[stage-workflow.ts:81–112](../../baseline/source/apps/electron/src/main/lib/review/stage-workflow.ts)。

## 2. 执行身份、计划与入口尚未完全统一

### D04　逻辑阶段已有隔离，物理 Run 与冻结计划仍有差异

普通统一审核 UI 可分别尝试提交、模板规则和 Pi；这几步各自保存结果或错误，不是一个全有或全无的提交。T04 与 Pi 仍有独立 Run 文件。当前普通 Pi `buildRun` 写 input hash、规则集 hash 和文档版本，却未写 `inputManifest.planFingerprint`；`freezeAttemptIdentity` 在缺计划指纹时返回 undefined，不能拿 input hash 代替计划指纹。

**状态：部分实现。** 已有业务／诊断身份隔离，不代表所有入口共享完整冻结 attempt 或单一物理运行。若后续统一身份，需同时修改生成、受理、当前运行解析、业务决定和报告消费方。证据：[ReviewV3UnifiedRun.tsx:65–115](../../baseline/source/apps/electron/src/renderer/components/content-review/ReviewV3UnifiedRun.tsx)、[pi-case-review-service.ts:274–309](../../baseline/source/apps/electron/src/main/lib/review/pi-case-review-service.ts)、[review-runtime-contract.ts:55–88](../../baseline/source/apps/electron/src/main/lib/review/review-runtime-contract.ts)。

### D05　入口起跑条件和 T03 不能一概而论

旧图 `assertCaseReadyForReview` 拒绝 draft／archived 和必填输入缺失。Pi 准备会拒绝 archived 并核验规则／计划等，但没有同样的 draft 拒绝；统一审核界面明确允许正式提交失败后继续本地预审。当前 T05／原生办理还加 Run／T03 门禁，而旧 `recordStageDecision` 本身只含角色、任务、模板、CAS、理由和 D2 等检查，并生成 `run@rev...` 形式的依据。

**状态：兼容与局部预审边界并存。** 不能声称所有“开始审核”或所有 stage-pass 都走同一门禁。改入口必须审查其实际调用，不用相邻 handler 的守卫代证。证据：[run-async-service.ts:82–105](../../baseline/source/apps/electron/src/main/lib/review/run-async-service.ts)、[pi-case-review-service.ts:452–486](../../baseline/source/apps/electron/src/main/lib/review/pi-case-review-service.ts)、[review-runtime-contract.ts:178–194](../../baseline/source/apps/electron/src/main/lib/review/review-runtime-contract.ts)、[stage-workflow.ts:81–195](../../baseline/source/apps/electron/src/main/lib/review/stage-workflow.ts)。

### D06　D2 辅助验证器并不等于生产提交门禁

设计 [19-D2](../../baseline/source/docs/design/review-agent/19-d2-scenario-scoped-pi-runtime.md) 中的 `verifyD2PiRun.complete` 是技术核验口径，不是行政批准。当前准备和结果提交实际调用 `verifyD2InstalledPlan`；`validateD2GuardSubmission` 则在 `verifyD2PiRun` 内部调用。

在冻结 `apps/` 与 `packages/` 的 TS／JS 非 test/spec 文件中按符号检索，未发现 `verifyD2PiRun` 的生产调用；测试调用不能升级成生产接线证明。**状态：辅助能力存在，完整辅助验证器的生产接线未证实。** 生产提交仍有自身的 assignment、Run 状态、输入 hash、来源与检查校验，不能反过来声称它完全无门禁。证据：[review-d2-runtime.ts:498–533](../../baseline/source/apps/electron/src/main/lib/review/review-d2-runtime.ts)、[pi-case-review-service.ts:452–466、915–938](../../baseline/source/apps/electron/src/main/lib/review/pi-case-review-service.ts)。

## 3. 权威、工具接口与当前产品边界

### D07　本地 Main 能力已装配，学校发布者不是本地角色别名

真实 bootstrap 安装 C11 本地作者、材料接入和 D4／B1 技术计划能力。正式 Plan 升级接口另要求独立 publishedPlanSource／grant；缺依赖应拒绝。静态检索上述生产源码，三个正式升级安装函数的命中集中在 `review-v3-main-author-plan-ipc.ts` 的定义／内部组合，未见外部生产调用；这不是学校发布链已经默认上线的证据，动态外部装配亦未验证。

**状态：本地技术能力已接入；正式权威来源是独立依赖。** `candidate-held`／freeze／本地 reviewer 不能冒充学校制度认证。证据：[main/index.ts:945–951](../../baseline/source/apps/electron/src/main/index.ts)、[review-c0-authority.ts:21–86](../../baseline/source/apps/electron/src/main/lib/review/review-c0-authority.ts)、[review-v3-main-author-plan-ipc.ts:64–80、131–187](../../baseline/source/apps/electron/src/main/lib/review/review-v3-main-author-plan-ipc.ts)。

### D08　普通工具的轮次／读取范围帮助函数并未普遍接线

assignment 实现支持 turnId 和 requireTurnMatch，但普通业务工具 `requireAssignment` 未传两者；`review_list_cases` 不带 assignment 时返回摘要列表，`review_get_case` 按 caseId 读摘要，未调用通用 read-scope 帮助函数。这描述的是普通业务工具分支，不能据此混淆绑定案卷 Pi 模式的专用工具集合。

**状态：局部约束存在，不能宣传全接口逐轮匹配或多租户隔离。** 如需强化，应明确调用方必须传入的可信轮次和阅读范围，并对实际工具接线验证。证据：[review-agent-assignment.ts:265–303、354–373](../../baseline/source/apps/electron/src/main/lib/review/review-agent-assignment.ts)、[pi-review-ops-tools.ts:197–205、270–310](../../baseline/source/apps/electron/src/main/lib/adapters/pi-review-ops-tools.ts)。

### D09　工具描述中的幂等与取消范围有真实契约缺口

`review_create_case` 描述声称同 requestId 重试返回原案，但其 schema 没有 requestId，执行生成新 caseId，已有绑定会返回错误。`review_cancel_run` 校验 assignment.caseId 与所传 caseId，再按 runId 调取消函数；工具层未先证明该 runId 属于该 caseId。

**状态：当前缺口。** 调用者不能按描述盲目重试建案；取消入口也不能只验证独立传入的两个字段就推导它们的关联。应修描述或接稳定幂等输入，并把 Run→Case 核验放入可信服务／工具边界。证据：[pi-review-ops-tools.ts:318–352、493–512](../../baseline/source/apps/electron/src/main/lib/adapters/pi-review-ops-tools.ts)。本项不宣称已复现跨案取消，运行验证未做。

### D10　报告的“最新／最终决定”与实际选择相反

`latestReportDecision` 的比较器按时间降序排列，随后 `.at(-1)` 实际取得最早决定，同时间再按 ID；也未筛选 finality。`resolveReportRun` 缺显式 Run 时按这条记录找依据运行，而不是按名字／提示宣称的最新最终决定。没有任何决定时才取最新技术 Run；有决定但找不到其 Run 则拒绝替代。

**状态：已证实的当前实现缺陷。** 可能导出旧阶段依据，或因旧决定引用 `run@rev` 而拒绝默认导出；后者是由源码推导，未实跑。修复需同时定义决定的时间排序、finality、归档代次和显式历史导出语义，并保持正文反馈与所选 Run 的关系可说明。证据：[review-v3-report-snapshot.ts:26–76](../../baseline/source/apps/electron/src/main/lib/review/review-v3-report-snapshot.ts)、[report-export-v2-service.ts:39–63](../../baseline/source/apps/electron/src/main/lib/review/report-export-v2-service.ts)。内容摘要 hash 不是学校签章，本地报告写成也不是外部系统已签收。

## 4. 基础设施的不同保证范围

| ID／状态 | 真实边界与修改注意 | 直接证据 |
|---|---|---|
| D11　兼容差异：配置根 | Electron 默认正式 `.cdutai`／开发 `.cdutai-dev`，支持 PROFER_CONFIG_DIR；CLI 默认 `.profer`／`.profer-dev`，通过 `--config-dir` 显式选根。默认不能假定读取同一会话库。 | [config-paths.ts:24–80](../../baseline/source/apps/electron/src/main/lib/config-paths.ts)、[cli/paths.ts:25–28](../../baseline/source/apps/cli/src/paths.ts)、[cli/index.ts:66](../../baseline/source/apps/cli/src/index.ts) |
| D12　实现边界：跨文件／DB 事务 | 审核 C2 主账耐久写并非全仓承诺；settings 直接覆盖，Run 独立文件保存，实验室 md/sidecar 先写再提交 DB。后者文件写失败／DB 失败可能产生分叉，DB rollback 不会撤销已写文件。 | [review-v3-case-disk-tx.ts:118–153](../../baseline/source/apps/electron/src/main/lib/review/review-v3-case-disk-tx.ts)、[settings-service.ts:93–117](../../baseline/source/apps/electron/src/main/lib/settings-service.ts)、[cslab-manuscript.ts:244–306](../../baseline/source/apps/electron/src/main/lib/cslab/cslab-manuscript.ts) |
| D13　实现边界：Worker 与路径 | OOXML 缺 worker bundle 时直接进程内执行，30 秒 watchdog 只属 worker 分支。实验室 resolveLabRelativePath 是词法包含检查，不能据此宣称处理所有 symlink 物理逃逸。 | [cslab-ooxml.ts:1120–1137](../../baseline/source/apps/electron/src/main/lib/cslab/cslab-ooxml.ts)、[cslab-paths.ts:320–333](../../baseline/source/apps/electron/src/main/lib/cslab/cslab-paths.ts) |
| D14　已落实但有限：冷启动续交 | 遗留运行标 failed＋interrupted 诊断，显式续交复用检查点但属新回合；不证明中断前未知 Provider 请求已恢复／重放。Windows 目录 fsync 不承诺 POSIX 同等语义。 | [run-store-v2.ts:32–127](../../baseline/source/apps/electron/src/main/lib/review/run-store-v2.ts)、[review-pi-run-bridge.ts:66–96](../../baseline/source/apps/electron/src/main/lib/review/review-pi-run-bridge.ts)、[review-v3-case-disk-tx.ts:118–153](../../baseline/source/apps/electron/src/main/lib/review/review-v3-case-disk-tx.ts) |

审核文件优先与实验室 SQLite 同时存在并非设计自相矛盾：[03 设计](../../baseline/source/docs/design/review-agent/03-architecture-and-delivery.md) 的文件优先指审核责任范围，不能扩成“全项目不得有数据库”。同样，导入原件、实验室沙箱 linked Word 副本和导出副本是不同对象，不能把覆盖同步副本错误记录为改写用户原件。

## 5. 验证与后续处理

上述“证实”指冻结源码和实际调用方，未替代真实材料／模型质量、GUI、HPC、Windows 文件占用、进程中断或断电测试。源码测试声明、mock 成功和静态接口注册都不能直接写成这些场景通过。

后续改造建议按影响排序：先核报告选择与工具参数关联；再定义普通 Pi／旧图／模板阶段的统一身份及计划绑定；然后完善正式权威来源和逐轮／读取范围接线；最后分别处理设置、Run、实验室跨介质一致性及平台故障。每项应补与真实风险对应的回归场景，不以新增类型、更多报告或导出数量代替接线验收。

本轮不修改这些产品实现。已有单文件手册的定向纠错与接受状态由交付清单单列；不能把历史重复问题数当成当前独立缺陷数，也不能因本文通过就自动关闭尚未复核的单文件文档。
