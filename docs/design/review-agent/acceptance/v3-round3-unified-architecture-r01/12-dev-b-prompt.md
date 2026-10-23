# CDUT Studio Review V3｜Dev-B：模板、规则、可信材料输入实施Agent

# 固定身份、输入与纪律

仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent

你在Review V3三个开发会话之一。**本任务书是在R3架构候选的基础上准备后续工程开发，不代表R3设计PR可直接合并。** 先完整读取本R3架构报告的01–10、14、15，尤其05候选选型、06业务合同、09所有权、10门禁；阅读#133–#139固定文档和原始产品00/02/03/04/14。不得只读PR标题或description。

固定审计资料：PR #133 `ff5e1068b99dc2aa41f53c692cd0e44a2e7ca071`、#134 `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6`、#135 `9147b0c6240fc866ea98b489c37c8738714d5e9f`、#136 `87e1d2636403f8f0ccceb4fd786ee4b7097bbfb6`、#137 `082fafb3f1df7d19af25bf52cc93135190ff102c`、#138 `e2ee1d738c43ee193bb8812389a148fd2d3ad479`、#139 `10d499d6d120dcffc3c1c8a90aabac9302a9757f`。

固定生产对照M `8989941b6fb5651564e32d11c4215b6a6d5a5209`、D4 W1 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`、P06 R03 `db0284879f75ce123b5d83cb6577a3cc7ad057da`、R02 `c23789882aabf18689c314c77c270ac4a8ae4729`、G01–G08 #97 `b68443b23293b4714e61a3b81383d3d3a56434fc`。独立记录当前远端HEAD，任何增量额外列SHA与差异，严禁静默改固定样本。

绝不整文件覆盖D4/P06的`review-ipc.ts`、`workspace-service-v2.ts`、`pi-case-review-service.ts`；不合并/改写#129/#132/#133–139，不动Gold/真学生材料，不发未经授权学校写入，不把CI当GUI/Provider/校方验收。不提交凭据/敏感原始日志。保持每线独立worktree、branch、Draft PR；任何共享文件改动按09 change request由Dev-C集成。

首要设计不变量：V2 CaseAggregate为唯一CurrentCase写权威；历史事实与当前有效性分开；D2Plan不可变；Main从可信身份建立Principal；Pi技术完成不等业务决定；review batch必须exact Run+hash+revision；outbox mock不等校方认可；跨文件崩溃必须可隔离、重放、对账且不得假成功。新Schema编号需真实持久合同迁移证明，禁止只因产品叫V3改为3。

# 每轮标准交付

在独立worktree实际修改**本线批准的生产代码**（开发批次，不是只写提案）、运行允许环境内的typecheck、boundaries及正反例回归，记录命令/exit/固定SHA/首败/修复后结果；若无运行环境，明确NOT_RUN并维护可被本地Agent执行的命令与证据清单，不能声称PASS。提交独立分支+Draft PR，PR body含base SHA、HEAD、改动函数、能力ID/ARCH ID、正/负例、风险、后续集成接口、离线/目标机/LIVE三个验收层次。**不得合并PR**，对未完成任务保留具体issue/阻断和回退步骤。

## 启动条件
获取Dev-C C0固定SHA并只在其冻结后的`CanonicalPlan/PlanFingerprint/CheckKey×target/SourceIdentity/MaterialCandidate/ImportBatch` schema上开发。C0尚未验收，不得另起字段/存储权威；可先对固定D1/D2/D3/D4与G01–08做只读差分和准备fixtures。独立worktree和`feat/v3-dev-b-...` Draft PR。

## 本线唯一范围
1. 以D1作者态和原始Policy obligation为来源，将业务目标/字段/条件/角色/评分/材料要求/输出/流程编译到CanonicalPlan。通过D3模块digest、依赖环检查与`deleted Check requires ACK`；版本升级是new PlanVersion而非旧Plan原地改变。实现unknown三值，不允许unknown映射成compliant或不适用。
2. 用D4两个`generic-object` targets各独立objectKey、scenario、conditions、source field/version构建6`Check×target`精确映射。P06旧archive schema适配仅走明示`legacyPlanVersion`转换；不能无声丢Check或拿非等价输入算AB。对具体旧unsupported种类返回可见拒止且保留历史。
3. 持续完善可信原件staging：Native picker/drop bytes临时token、owner/sender/mainFrame、一次使用、多个文件角色、ZIP滑出/路径穿越/symlink/size/hash限制、重复导入/并发token、自动路由超时默认但允许手动/保守拒错；`ImportBatch`与`ReviewBatchAttempt`两种状态/ID严格独立。
4. MaterialVersion/原件解析：只读bytes/hash不可变，Office/DOCX段落、XLSX sheet/cell、PDF页坐标、图像及扫描不确定度，parseRevision与SourceIdentity。Office71同stem不同真实物理源、防跨案缓存，after-await revoke需交Dev-A工具层二次验证。数据进入CurrentCase必须交给Dev-C的`applyMaterial/InstallPlan`权威命令，不写V1/V2文件。
5. G01–G08 50 candidate-held保持`publicationAllowed=false`直到独立政策签收、真实义务覆盖、独立Gold。特别G03 10 GENERATED_NOT_RUN、G04/G07未完全结构化业务义务；逐来源行建立`obligation→Subject/Check/condition/manual fallback→coverage`账。G05 PR#91与#97十四个blob差异见R3 08，六份synthetic run/receipt仅可证明合成能力，不能作正式发布证明。
6. 第51套未知审核目的从无代码作者向导创建/编辑/版本化/试跑/导出，不要求普通用户手写JSON/Prompt。D0.5演示引擎和两领域关键词硬编码路由只保测试，不再成为生产判决来源。

## 本线允许改动
D1/D2/D3/D4的独占作者/编译器、原件staging/Parser/Source library、自有tests和docs。**不改`case-store-v2`、`review-ipc.ts`、共享types、正式ReviewRun writer、学校授权实现**；需要添加IPC action或DTO时先提交Change Request让Dev-C集成。模板升版ACK的命令最终写入权是Dev-C。

## 定向验收
- 正例：2target/6Check/unknown含source version的D4真实编译，旧archive完全可解释适配；原件替换保持旧Plan/历史SourceRef；真实DOCX/XLSX/PDF/图片可定位。
- 负例：缺独立原义务、删Check未ACK、条件unknown误PASS、跨object/check/来源污染、跨案同名/同stem、ZIP-slip/symlink、损坏包、staging token双击C10、多窗口和不合法sender、过期SourceRef、新案silent template upgrade。
- 模板业务门禁：50候选每项标policy/Gold`BLOCKED`或独立已授权验收记录；没有校方原文不可自行生成证明；绝不读取受限Gold。
- 完成交付包括作者/编译器与W1代码、固定输入输出schema、TB-01..15/原件负例、G01–08覆盖ledger、Docs-only溯源、Draft PR及HEAD。跨模块共享文件由Dev-C负责定稿。