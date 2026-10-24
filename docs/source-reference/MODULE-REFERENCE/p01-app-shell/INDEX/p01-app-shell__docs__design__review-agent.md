# p01-app-shell__docs__design__review-agent 索引（审核专区设计、验收构造与业务模板）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__docs__design__review-agent`（owner `p01-app-shell`，family `docs/design/review-agent`）共 194 个文件（24 docs + 170 resource），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。逐文件 hash 由封版流程按 `INDEX-SCOPE-LOCK.json` 机械列注入（与 MANIFEST.json 同源），职责/消费/影响/验证为人工调查结论。

家族一（设计文档，根目录 18 篇 + business-templates 6 篇 docs）：「通用审核 Agent」设计文档组（00 导航 + 01–19 编号篇章），性质自述「目标设计与验收契约，不是功能已完成声明」（`00-overview.md:3`）；消费=组内互引与工作区报告引用（逐篇落锚）。

家族二（acceptance/d4-g0X-build，159 个 JSON）：D4 冻结验收构造——50 套模板用例的三元组输入（`manifest.json` 构造清单 / `selection.json`|`synthetic-selection.json`|`fixtures/selection*.json` 对象与操作选择输入 / `workspace.json` D1 作者态工作区 `ReviewAuthoringWorkspaceV1`，schemaVersion 1、definitions{modules,templates} 单模板）。**加载链（实读证实）**：①构建期 `apps/electron/scripts/copy-resources.ts:15-33`——注释「随包保留原始字节与路径，客户端仍校验 catalog 中的 Git blob」，读 `acceptance/d4-unified-r01/catalog.json`（:18）并按 `catalog.templates` 的 `workspacePath`/`manifestPath` + 约定选择文件（`selection.json`/`synthetic-selection.json`/`fixtures/selection.json`/`fixtures/selections.json`/`fixtures/controlled-registry.json`，:21-27）拷入 `dist/resources/d4-unified/`（:30-33）；②运行期 `apps/electron/src/main/lib/review/review-d4-catalog.ts:1`「D4 冻结目录的客户端/CLI 共用加载器；校验原始 Git blob，禁止浮动来源」——`CATALOG_PATH :27`、SOURCE_ROOT 解析 :29-33（「源码测试与 Electron 构建均读取同一组冻结输入；发行包只读取随包资源」）、域计数 `EXPECTED :35`（G01:5/G02:3/G03:10/G04:8/G05:6/G06:9/G07:7/G08:2=50）、`COMMON technicalSha :36`（`a7a6a11d4840ad64cfc858c17b35f35180adf063`）、路径白名单 `resolveD4SourcePath :42-45`、目录校验 `loadD4UnifiedCatalog :55-83`（逐条要求 `publication==='candidate-held'`、`integrationStatus==='NOT_RUN'`、40hex `workspaceGitBlobSha` 等）、工作区校验 `loadD4UnifiedWorkspace :85-95`（`:87` Git blob 校验 + 单模板身份 + `validateReviewAuthoringV1`）；③消费方：`review-v3-d4-demo-publish.ts:15/:126`（D4 演示发布）、`review-v3-main-d4-local-plan.ts:13/:19/:31-39/:74/:101`（本地计划编排与选择文件查找）、`review-v3-main-local-product-intake.ts:24/:163/:306`（产品 intake 登记历史目录）、测试 `review-v3-main-d4-local-plan.test.ts:37/:86`、`template-asset-contract.test.ts:20`、`review-v3-d4-catalog-attach.test.ts:28/:40`。`LOCAL-INTEGRATION-20261022.md:15` 明示「50 套模板的目录、workspace、manifest 和关联 selection 是**实际运行输入**……加载器校验原始 Git blob，本轮保留其字节，不将它们作为历史产物删除」。打包：随 `build:resources` 入 `dist/resources/d4-unified/`（`electron-builder.yml:44-46` `files: dist/**/*` 进 asar）。

家族三（acceptance/d4-unified-r01/catalog.json）：50 用例统一目录（schemaVersion/catalogId/technicalBaseSha/mergeMethod/templateCount=50/domainCounts/publicationAllowed:false/authoritativeSchoolTemplate/clientLoadMode/integrationStatus/testStateNotice/domainShards）。

家族四（acceptance/v3-dev-c0-r01/C0-SCHEMA-FIXTURES，7 个 JSON）：C0 契约拒绝用例夹具，消费者=`packages/shared/src/types/review-v3-c0.test.ts:62-115`（「C0 committed schema fixtures are executable test inputs」逐文件断言）。

家族五（business-templates/G01，7 个文件）：G01 师生共有业务审核模板原始 Markdown 存档（`README.md:1`）；`source-manifest.json` 登记原件标准名称/版本/字节数/SHA-256/Git Blob SHA「供后续机器校验」（README:6，归档记录 :23/:28）；5 份 originals 为 D4 G01 五用例的业务源（各 `manifest.json` `businessSource` 登记 file/version/sha256/gitBlobSha）。

家族六（fixtures/，10 个 JSON）：D0.5/D1/D2 试点夹具。消费者：`semantic-module-demo.test.ts:252-258`（d05 四件）+ `review-d2-runtime.test.ts:28`（d05-synthetic-state）；`18-d1-authoring-contract-and-runtime-mapping-v1.md:49/:97`（d1-authoring-text-v1.json 作 `review-authoring-v1.ts candidate-save` CLI 输入）；`19-d2-scenario-scoped-pi-runtime.md:33-57`（d2-workspace-synthetic + d2-selection-* 作 D2 预审 CLI 输入）。`LOCAL-INTEGRATION-20261022.md:15`「`C0-SCHEMA-FIXTURES` 和 `fixtures` 同样是测试输入」。

## docs--design--review-agent--00-overview.md

- 职责：《通用审核 Agent 设计文档导航》（7463 字节）：文档组总入口——初版 2026-10-03（基线 `422aacdc`，:3）、补完/复查基线（`c6d92732`/`c2f4d901`/`ddd9b1e3`）、「目标设计与验收契约，不是功能已完成声明」；开工阅读顺序（:5：g-stage-recheck→05→06→07，04 判交付）；结论：16 项能力 2 具备/9 补齐/5 缺业务（:9）；阅读顺序表 01–07 用途（:33-:39）；与旧文档关系（:43-:44）。
- 消费：人类/Agent 阅读入口；被 `work/reports/2026-10-03-collaborator-sync-review.md:33` 等报告按图索骥；它消费 01–07 篇（:5/:9/:33-:39）与 `work/reports/2026-10-04-g-stage-recheck.md`、`2026-10-04-n-stage-recheck.md`、`2026-10-04-ui-functional-acceptance.md`、`docs/design/2026-10-01-cdut-studio-content-review-demo.md`、`docs/plans/2026-10-02-content-review-generalization.md`。
- 来源：设计文档组产出（2026-10-03 初版/10-04 更新）；sourceBlob `345c98005dd1f18460217930a7b96b05cb2b3995`；sourceSha256 `7f31d1f947361d084d0cae36d7837c4591865622c92ab86e47b805a7169f1100`。
- 打包：不进产物（electron-builder.yml:44-68/:70-122 无 docs/）。
- 影响：删除→设计组导航与基线声明断档、:33-:45 阅读链失效；对构建/运行无影响。
- 验证：核 :3/:5/:9/:33-:39/:43-:44 与链接目标存在、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：结构与链接=**证实**（实读）；「当前完成状态以最新复查为准」的复查结论本身=**未知**（未复核复查报告）。

## docs--design--review-agent--01-research-and-gap.md

- 职责：《通用审核 Agent：调研与能力差距》（20993 字节）：现有代码能力盘点与差距清单，含「6 补强计划合并与严重性校准」（H01–H16）。
- 消费：`00-overview.md:9/:33/:46`（导航/明细/H01–H16 指路）；`work/reports/2026-10-03-collaborator-sync-review.md:33`（「继续按 [设计差距 H01–H16](…01-research-and-gap.md#6-补强计划合并与严重性校准) 实施」）。
- 来源：调研产出（2026-10-03/04）；sourceBlob `5306e15bcfbad24dde11f36e8161e6414d970c34`；sourceSha256 `43c672b0ff730ac1e49cb968a6b9b191968c4fcd2199465a9470b879514646c2`。
- 打包：不进产物。
- 影响：删除→H01–H16 差距基线丢失，00-overview 与协作者复查报告引用悬空；对构建/运行无影响。
- 验证：核 :1 标题、#6 小节存在、两处引用行、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；差距项当前修复状态=**未知**。

## docs--design--review-agent--02-product-and-templates.md

- 职责：《通用审核 Agent：产品、角色与模板》（19725 字节）：最终用户视角的功能清单与「模板不用代码编排」的产品设计（00-overview:34 用途注）。
- 消费：`00-overview.md:34`（阅读顺序表）；`05-completion-roadmap-and-feasibility.md:13`（「完整目标仍是 [02 产品设计]…」）；`06-workflows-and-usability-design.md:3`（「完整范围沿用 [02]」）；`15-template-modules-and-runtime-boundary-spec.md:7`（相关文档）；`acceptance/d4-g07-build/T04/workspace/workspace.json:666`、`T06/workspace/workspace.json:673` 等 D4 工作区静态映射节引用。
- 来源：产品设计产出（2026-10-03/04）；sourceBlob `55abdf889e22a99c9e4b975242c25f89eed333c6`；sourceSha256 `62d8c95e87febcea14f2c04ddf8fc3f45aeb46a9d1f4841f33877e222b625ef2`。
- 打包：不进产物。
- 影响：删除→产品目标与模板编排设计断档、5 处引用悬空；对构建/运行无影响。
- 验证：核 :1 与五处引用行、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；设计实现度=**未知**。

## docs--design--review-agent--03-architecture-and-delivery.md

- 职责：《通用审核 Agent：架构、复用与交付依赖》（35556 字节）：数据/状态/执行/复用边界/校方接口/迁移与交付依赖；含「11.1 M0 修复契约」「11.2 补强实施依赖与现有代码落点」。
- 消费：`00-overview.md:35/:46`（导航与 :46 两锚点指路）；`work/reports/2026-10-03-collaborator-sync-review.md:33`（「[M0 修复契约](…#111-m0-修复契约)」）；`05-completion-roadmap-and-feasibility.md:13`；`07-application-and-execution-design.md:3`（「这是对 [03 架构设计] 的实施补充」）。
- 来源：架构设计产出（2026-10-03/04）；sourceBlob `4c8fceac9c5381777274e42b1e10035565153c68`；sourceSha256 `a8c30cb3f2a7b93dc3a9d64b856261276c97a5966a3cfde8f1588930daae7089`。
- 打包：不进产物。
- 影响：删除→M0 修复契约/实施依赖断档、4 处引用悬空；对构建/运行无影响。
- 验证：核 :1、#111/#112 小节、四处引用、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；契约执行状态=**未知**。

## docs--design--review-agent--04-acceptance-and-evaluation.md

- 职责：《通用审核 Agent：最终验收与评测》（30371 字节）：交付判定标准（材料/行为/易用性/漏审/评分/减负），含「10 补强回归用例与验证边界」（K01–K16）。
- 消费：`00-overview.md:5`（「以 [04 验收契约] 判断交付」）/`:36`/`:46`；`05:13`、`06:3`、`15:7`（相关文档）；`work/reports/2026-10-04-ui-functional-acceptance.md:142`（「以 [04-acceptance-and-evaluation.md] 的最终产品标准核对」）。
- 来源：验收契约产出（2026-10-04）；sourceBlob `35c4a54469334b95b82a6b94e2a6a55d741076e2`；sourceSha256 `956851e4863b09c4ce721c6875be6e0ae4b9f7a73102833493997ec805a1505c`。
- 打包：不进产物。
- 影响：删除→验收判定标准与 K01–K16 断档、6 处引用悬空；对构建/运行无影响。
- 验证：核 :1、#10 小节、六处引用、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；验收是否已执行=**未知**。

## docs--design--review-agent--05-completion-roadmap-and-feasibility.md

- 职责：《通用审核 Agent：补完路线与可行性》（15722 字节）：最新基础与缺口、N1–N7 依赖顺序、首轮任务、团队边界与可行性（:103-:107 给出 07/06 落地顺序）。
- 消费：`00-overview.md:5/:37`；`work/reports/2026-10-04-n-stage-recheck.md:15`（对照核查）；`06:3`（交付顺序）；`07:3`（依赖）。
- 来源：路线规划产出（2026-10-04）；sourceBlob `0a7b136c900fffffaa4cf2b9e4abf8136d45096f`；sourceSha256 `0cc16665e875ca46abdaf27daf61f69b94a494d0c03857b7f673272939d53ebc`。
- 打包：不进产物。
- 影响：删除→N1–N7 顺序与首轮任务清单断档、4 处引用悬空；对构建/运行无影响。
- 验证：核 :1/:13/:103/:106/:107 与四处引用、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；路线执行进度=**未知**。

## docs--design--review-agent--06-workflows-and-usability-design.md

- 职责：《通用审核 Agent：用户闭环与易用性设计》（23318 字节）：学生/老师/审核员/评委/组织者的页面、动作、状态、失败路径与操作脚本（含「3 单案三栏工作台」）。
- 消费：`00-overview.md:5/:38`；`work/reports/2026-10-04-n-stage-recheck.md:15`；`05:107`（「[06 的单案页面](…#3-单案三栏工作台)」）；`07:3`；`16-batch-review-automation-and-issue-clustering-spec.md:6`（对照文档）。
- 来源：易用性设计产出（2026-10-04）；sourceBlob `25cfd4abcb825b69e0da31e8e9e17a1e8f94e031`；sourceSha256 `8efe7abcbdc668dbb6b858516d90dcc1be92339acd592f10a43d0869b82b65f6`。
- 打包：不进产物。
- 影响：删除→用户闭环设计断档、5 处引用悬空；对构建/运行无影响。
- 验证：核 :1/:3 与五处引用、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；UI 落地一致性=**未知**。

## docs--design--review-agent--07-application-and-execution-design.md

- 职责：《通用审核 Agent：应用层、执行与数据设计》（39590 字节，本组第二大设计文档）：共享契约、命令事务、政策仓库、Pi、检查点、计算覆盖、OCR、离线包与代码落点（:3 自述「拟实现合同，不能按当前可调用 API 使用」；§2–3 共享契约、§4–6 自动执行与 Pi 接入）。
- 消费：`00-overview.md:5/:39`；`work/reports/2026-10-04-n-stage-recheck.md:15`；`05:103/:106`（两锚点指路）；`06:3`；`16:6`；D4 工作区静态映射节引用（`acceptance/d4-g07-build/T04/workspace/workspace.json:666`、`T06/workspace/workspace.json:673`）。
- 来源：应用执行设计产出（2026-10-04）；sourceBlob `3c42d44b376b4f48812f5ffc306caf3ed8c8637e`；sourceSha256 `4c7a1df96f910f5d077c63847ad3e667851c06444672c7bfb13f70f475bbf511`。
- 打包：不进产物。
- 影响：删除→应用/执行合同断档、7+ 处引用悬空（含 D4 构造产物内嵌引用）；对构建/运行无影响。
- 验证：核 :1/:3、§2–3/§4–6 标题、引用行、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；拟实现合同的实现度=**未知**。

## docs--design--review-agent--08-agent-integration-design.md

- 职责：《08 · 审核功能接入 Agent：可行性验证与设计（阶段 C）》（21187 字节）：审核专区接入 AI Agent 的可行性验证与设计（含团队修订）。
- 消费：`11-scope-and-boundary.md:31`（「接入设计（含团队修订）」）；`09-dev-agent-ops-implementation.md:4`（「设计依据：…08-agent-integration-design.md（含宝宝修订）」）。
- 来源：接入设计产出（阶段 C）；sourceBlob `cab848fa160492c478d5242ef24aaee314e29438`；sourceSha256 `8abdce6c7b0ae3f90fd83c217289b25f151e4573b8f9acd4037074e40b90c3b0`。
- 打包：不进产物。
- 影响：删除→Agent 接入设计断档、09/11 两处引用悬空；对构建/运行无影响。
- 验证：核 :1 与两处引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；C 阶段实现度=**未知**（09 自述 C1–C3 已交付，未复核）。

## docs--design--review-agent--09-dev-agent-ops-implementation.md

- 职责：《09 · 审核专区开发文档：AI Agent 接入实现（C1–C3 已交付）》（12567 字节）：代码地图/身份模型/授权链/已知边界（:4 设计依据=08）。
- 消费：`11-scope-and-boundary.md:32`（「开发文档（代码地图/身份模型/授权链/已知边界）」）；人类开发读者。
- 来源：开发文档产出（阶段 C）；sourceBlob `04220e01ac91865ce72c3280357936f831df5dd1`；sourceSha256 `f8c2d19a4a6ab65fea05c41f440f23a0a03db789ce441979596bb339ff92ff2c`。
- 打包：不进产物。
- 影响：删除→接入实现文档断档、11:32 引用悬空；对构建/运行无影响。
- 验证：核 :1/:4 与 11:32、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；「C1–C3 已交付」=**未复核**（自述）。

## docs--design--review-agent--10-user-guide-agent-ops.md

- 职责：《使用指南：让 AI Agent 帮你处理审核案卷》（11484 字节）：面向最终用户的 Agent 案卷操作指南。
- 消费：`11-scope-and-boundary.md:33`（「使用指南（面向最终用户）」）；人类用户。
- 来源：使用指南产出；sourceBlob `acbc030a3b7c2dfd0f55441b95aa40f6acdac646`；sourceSha256 `b66e0bdd642c9674879d8c118357ec3e98868ef774ca844929720bf8ae3701b8`。
- 打包：不进产物。
- 影响：删除→用户指南断档、11:33 引用悬空；对构建/运行无影响。
- 验证：核 :1 与 11:33、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；指南与现行 UI 一致性=**未知**。

## docs--design--review-agent--11-scope-and-boundary.md

- 职责：《团队工作边界说明（审核专区 AI Agent 接入线）》（5471 字节）：接入线团队分工与工作边界（:31-:33 列出 08/09/10 三篇配套文档）。
- 消费：人类/团队读者；全树检索除自身与 08/09/10 同族外无外部引用（证实：本轮 grep）。
- 来源：团队边界说明产出；sourceBlob `828caa97917023d83499a97ac8a32240a9a96fa6`；sourceSha256 `83177a78a763adc197ba2a7722dbfb1e39c8fb7109bf7c9012188361a806022f`。
- 打包：不进产物。
- 影响：删除→团队边界记录丢失；对构建/运行无影响。
- 验证：核 :1/:31-:33、hash；NOT_RUN。
- 证实/推断/未知：结构=**证实**；边界现状=**未知**。

## docs--design--review-agent--14-pi-native-review-and-simple-workspace-design.md

- 职责：《审核功能收敛设计：普通 Pi Agent 与简洁工作台》（30740 字节）：2026-10-09 设计核对快照（:3 基线 `60c25542`，「本文是设计核对快照，不是当前实现状态表」）；:36 批次/评委服务快照（batch-store/judging-service/rating-service/BatchPanel）；:260 对 15 号规范的实施建议。
- 消费：`16-batch-review-automation-and-issue-clustering-spec.md:6`（「对照：…[14 Pi 原生审核]」）；:3 引用 `13-single-agent-framework-trial.md`/`17-current-state-and-handoff.md`（两文件不在本 group）；D4 工作区内嵌引用（`acceptance/d4-g04-build/t05/workspace.json:435` 等静态映射节）。
- 来源：设计核对快照（2026-10-09/10）；sourceBlob `db4c01a9eb8129f39e9364f323e2a2d21edd32d0`；sourceSha256 `b0b242a4629a50066a8cafc4058cf3a5b7bb9bde0500f82d0606ae4ff32a7029`。
- 打包：不进产物。
- 影响：删除→Pi 原生审核收敛设计断档、16:6 引用悬空；对构建/运行无影响。
- 验证：核 :1/:3/:36/:260 与引用、hash；NOT_RUN。
- 证实/推断/未知：引用与自述边界=**证实**；快照与现状差异=**未知**（文档自注已被 A/B/C 阶段实现取代）。

## docs--design--review-agent--15-template-modules-and-runtime-boundary-spec.md

- 职责：《审核模板模块化与运行边界规范（v1）》（46172 字节，本 group 最大 docs）：模板目录/完整业务模板/复用模块三层边界定稿（三级工作树选模板、统一模板目录、模块制作与维护、运行时只消费兼容 `TemplateVersion` 固定快照）。
- 消费：`14-pi-native-review-and-simple-workspace-design.md:3/:260`（「已定稿，已阅读」）；`16:6`（对照）；`business-templates/G01/originals/g01_archive_utilization_template_editor_spec_v1_5.md:619`（「已有…15-template-modules-and-runtime-boundary-spec.md 明确区分…」）；D4 工作区静态映射节多处引用（`acceptance/d4-g03-build/g03-t03/workspace.json:624`、`g03-t06:554`、`g03-t07:659`、`g03-t08:666`、`g03-t12:603`、`d4-g04-build/t03/workspace.json:505`、`t05:435`、`t07:505`、`d4-g06-build/G06-T01:1240`、`G06-T02:1135`、`G06-T03:988`、`G06-T09:1051`、`d4-g07-build/T02:652`、`T04:666`、`T06:673`）。
- 来源：模块化边界规范（v1 定稿）；sourceBlob `13892a65256b61d20bc49fdb314cdd393c14d234`；sourceSha256 `ad1d078276eaee58b0ec7f07677150cb8d2e12bc0fe55ee4b1762d65391aa990`。
- 打包：不进产物。
- 影响：删除→模板/模块/运行边界定稿断档、15+ 处引用悬空（含 G01 原件与 D4 构造产物内嵌引用）；对构建/运行无影响。
- 验证：核 :1/:7、四处文档引用与 D4 内嵌引用抽样、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**（grep 逐条）；模块化实现状态=**未知**（文档自述「模块设计不等于已实现」）。

## docs--design--review-agent--16-batch-review-automation-and-issue-clustering-spec.md

- 职责：《批量审核自动化与相似问题聚类规范（v1）》（13598 字节）：批次审核自动化与问题聚类规范（:6 对照 06/07/14/15）。
- 消费：`14-pi-native-review-and-simple-workspace-design.md:36`（「当前批次队列、恢复/定向重试……见 [16 规范]」）；人类/开发读者。
- 来源：批量审核规范（v1）；sourceBlob `1e43320dd772df114a50b89193016a42c839a0c0`；sourceSha256 `eb8f37a90411e6816d13138d33bf8767fac00416e469214db0046b5e8beec18e`。
- 打包：不进产物。
- 影响：删除→批量/聚类规范断档、14:36 引用悬空；对构建/运行无影响。
- 验证：核 :1/:6 与 14:36、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；实现状态=**未知**。

## docs--design--review-agent--18-d1-authoring-contract-and-runtime-mapping-v1.md

- 职责：《D1 · 审核作者态最小数据契约与真实规则映射 v1》（13180 字节）：`ReviewAuthoringWorkspaceV1` 作者态契约与真实规则映射；:51-:65 静态校验/候选保存/不可变作者记录 CLI 示例；:49/:97 用 `fixtures/d1-authoring-text-v1.json` 作 `review-authoring-v1.ts candidate-save` 输入。
- 消费：①`19-d2-scenario-scoped-pi-runtime.md:33`（D1 workspace 引用）；②D4 工作区静态映射节（`acceptance/d4-g03-build/g03-t12/workspace.json:603`、`d4-g04-build/t05/workspace.json:435`、`d4-g07-build/T02/workspace/workspace.json:652`、`d4-g06-build/G06-T01/workspace.json:1240` 等）；③它消费 `fixtures/d1-authoring-text-v1.json`（:49/:97）。
- 来源：D1 契约规范（v1）；sourceBlob `e7e0fef86e7c86de0d70703bcd8eb4ecbd1f625b`；sourceSha256 `19b7e9411a5272505cc1d9d14cead8f95887e53d44142352b71cb887ba704ea6`。
- 打包：不进产物（其 CLI 示例涉及 `review-authoring-v1.ts`，脚本本身为 deep 线文件）。
- 影响：删除→D1 作者态契约断档、D2/D4 引用悬空、fixtures/d1 失去使用说明；对构建/运行无影响。
- 验证：核 :1/:49/:51-:65/:97 与引用、hash；NOT_RUN。
- 证实/推断/未知：引用与 CLI 形态=**证实**；D1 实现完整度=**未知**（文档自述候选态限制）。

## docs--design--review-agent--19-d2-scenario-scoped-pi-runtime.md

- 职责：《D2 · 情景/逐操作映射到真实 Pi 审核任务包（技术预审）》（9129 字节）：情景/逐操作对象映射 `ReviewCaseV2.subjects`/`reviewRules` 的技术预审；:33-:34 列输入夹具（`fixtures/d2-workspace-synthetic.json` + `d2-selection-{text,family,temporary,archive}.json`）；:37-:57 四组 CLI 调用示例（预览/隔离候选壳/创建技术预审案卷/attach+expectedRevision 修复）。
- 消费：D4 工作区静态映射节引用（`acceptance/d4-g07-build/T02/workspace/workspace.json:652`、`d4-g04-build/t05/workspace.json:435`、`d4-g03-build/g03-t12/workspace.json:603` 等）；它消费 `fixtures/d2-*` 五件（:33-:57）。
- 来源：D2 技术预审设计；sourceBlob `a8398f16af2abfdcb2b40c7402f5cad7030d80e1`；sourceSha256 `dc2ce6db00fd781ee4df9c22d70ec6c8aa8142b563887f6d65964ed181945a1d`。
- 打包：不进产物。
- 影响：删除→D2 映射设计断档、d2 夹具失去使用说明、D4 引用悬空；对构建/运行无影响。
- 验证：核 :1/:33-:34/:37-:57 与引用、hash；NOT_RUN。
- 证实/推断/未知：引用与夹具清单=**证实**；D2 试点结论=**未知**。

## docs--design--review-agent--LOCAL-INTEGRATION-20261022.md

- 职责：《审核模块本地整理（2026-10-22）》（2384 字节）：本地整理记录；:15 关键声明——「50 套模板的目录、workspace、manifest 和关联 selection 是实际运行输入，当前仍位于 `acceptance/d4-*` 路径。加载器校验原始 Git blob，本轮保留其字节，不将它们作为历史产物删除。`C0-SCHEMA-FIXTURES` 和 `fixtures` 同样是测试输入」（本 group 家族二/四/六的效力依据）。
- 消费：人类/Agent 读者（整理说明）；全树检索除自身外零引用（证实）。
- 来源：本地整理记录（2026-10-22）；sourceBlob `d8b6a6c9a463c6703e8129f21f58112a9984e0f6`；sourceSha256 `73aafe7e8e51291f1b7c3b63469452268f6ec9482ad9ab50faf8140f60593ff8`。
- 打包：不进产物。
- 影响：删除→「acceptance 是实际运行输入、不得当历史产物删除」的书面依据丢失；对构建/运行无影响。
- 验证：核 :15 声明原文、hash；NOT_RUN。
- 证实/推断/未知：声明原文=**证实**（实读）；执行遵守情况=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--A--manifest.json

- 职责：G01 用例 A（档案利用申请）构造清单（机械提取自本文件：templateId `g01-archive-utilization@1`、业务源 `g01_archive_utilization_template_editor_spec_v1_5.md:v1.5`、15 模块/146 检查定义/42 规则行、status `AUTHOR_CANDIDATE_NOT_YET_EXECUTED`、technicalSha `a7a6a11d…`、businessSource sha256/gitBlobSha 双哈希）。
- 消费：`catalog.json` 条目 `manifestPath`（:39-:41 区段）→ `review-d4-catalog.ts:55-77` 目录校验解析（调用方见家族二）；构建拷贝 `copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `bbb47d4a4767c19f8c1ba4eac8ce31acbdcc0cdc`；sourceSha256 `5afa4e6989196b3c4fc73230c44cff89e8cfe74bf369545a1e442b946cd1fd1b`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:30-33；yml:44-46）。
- 影响：删除→catalog 的 manifestPath 解析失败，D4 目录加载链报错（演示发布/本地计划/intake 及 3 个测试受影响）。
- 验证：JSON 字段与 catalog 条目一致、businessSource 双哈希可复算；NOT_RUN：产品测试/构建/GUI（本轮统一 NOT_RUN）。
- 证实/推断/未知：字段/加载链=**证实**；用例执行结果=**未知**（status 未执行）。

## docs--design--review-agent--acceptance--d4-g01-build--A--selection.json

- 职责：G01 用例 A 的对象/操作选择输入（顶层键 `templateId`/`version`/`targets`，3 键，2628 字节）：为本地计划编排固定被审对象与操作集合。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 按约定文件名（`selection.json` 等变体）在用例目录查找读取；构建拷贝 `copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `b0612e0c67d3bc6d8d00a6f20c76119bc1f9b75b`；sourceSha256 `7f7c7f202fb203a98fe981bbd1575e426c0564d6fb0d04afa9ac516a417bb10c`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:23-33）。
- 影响：删除→本地计划构建查无选择输入，该用例计划编排失败/退化；目录加载链本身仍可过。
- 验证：JSON 3 键齐全、targets 结构可解析、hash 一致；NOT_RUN。
- 证实/推断/未知：结构与消费点=**证实**；targets 与业务源一致性=**未知**（未逐项比对）。

## docs--design--review-agent--acceptance--d4-g01-build--A--workspace.json

- 职责：G01 用例 A 的 D1 作者态工作区（`ReviewAuthoringWorkspaceV1`：schemaVersion 1、`definitions{modules,templates}`，单模板 `g01-archive-utilization@1`；339162 字节，含模块/检查/来源绑定）。
- 消费：`review-d4-catalog.ts:85-95 loadD4UnifiedWorkspace`——`:87` 以 `entry.workspaceGitBlobSha` 做 Git blob 校验、单模板身份校验、`validateReviewAuthoringV1`；被 `review-v3-main-d4-local-plan.ts`/`review-v3-d4-demo-publish.ts`/`template-asset-contract.test.ts:20` 消费。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `1980df0a4406227197cbb8474115473fceb3b346`；sourceSha256 `cc1b9361434df974a08ccf37a09005bf6f89e8ebfc0405db59dfb73357241637`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:21-33）。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`（review-d4-catalog.ts:87），A 用例全部消费方失败。
- 验证：Git blob 与 catalog `workspaceGitBlobSha` 复算、单模板身份一致、hash 一致；NOT_RUN。
- 证实/推断/未知：加载与校验链=**证实**；内容质量=**未知**（未逐模块审）。

## docs--design--review-agent--acceptance--d4-g01-build--C--manifest.json

- 职责：G01 用例 C（特殊校园卡资格）构造清单（机械提取：templateId `g01-special-campus-card@1`、业务源 `special_campus_card_template_v1.4.md:v1.4`、14 模块/86 检查定义/27 规则行、status `AUTHOR_CANDIDATE_NOT_YET_EXECUTED`）。
- 消费：`catalog.json`（:55-:57 区段）→ `review-d4-catalog.ts:55-77`；构建拷贝 `copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `0b8c21f2fc7c08ff242067a7f880f5ba3acb5baf`；sourceSha256 `56b4117bf05673a6daffd927aa9af9e4a00f69e3609e81de745b35f7a9d870fd`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，C 用例加载链断。
- 验证：字段与 catalog 一致、哈希复算；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--C--selection.json

- 职责：G01 用例 C 的对象/操作选择输入（`templateId`/`version`/`targets` 3 键，4385 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定名查找；`copy-resources.ts:23-27` 构建拷贝。
- 来源：D4 冻结构造产出；sourceBlob `d1afe6bba1642f67607b2c693f80a6f6d9ace966`；sourceSha256 `619f1c5c53316084ba545ac2bd0a175042ccf26a9e6e70478875a146143e919d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→C 用例本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--C--workspace.json

- 职责：G01 用例 C 的 D1 作者态工作区（schemaVersion 1，单模板 `g01-special-campus-card@1`，228487 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二所列消费方。
- 来源：D4 冻结构造产出；sourceBlob `38e663128d3376283d186c307a61ce6f0c2f8550`；sourceSha256 `cb7560bfd86cc880e7df69a1b96ff244bf05bc4e84f5e2df7a4e26581c4b6c57`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，C 用例消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--I--fixtures--controlled-registry.json

- 职责：G01 用例 I（学籍身份更正）的受控台账夹具（顶层键 `schemaVersion`/`sourceKind`/`studentId`/`sourceId`/`snapshotVersionId`/`status`，325 字节）：模拟受控数据源快照。
- 消费：`copy-resources.ts:24-27` 约定名 `fixtures/controlled-registry.json` 构建拷贝；`review-v3-d4-catalog-attach.test.ts:40`——`readFileSync(resolveD4SourcePath(dir + '/fixtures/controlled-registry.json'))` 快照比对；本地计划构建 `review-v3-main-d4-local-plan.ts:31-39` 约定查找。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `a4928618bfea57e921bbaf1ca28e04a71bc65c51`；sourceSha256 `ff098e85d4878c881bda47a97481fec61338caf0a2e04d7c6f2d0d1e91409610`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→attach 测试快照与 I 用例受控台账输入缺失，加载链报错。
- 验证：JSON 6 键齐全、hash 一致；NOT_RUN（含 review-v3-d4-catalog-attach 测试）。
- 证实/推断/未知：结构/消费=**证实**；台账语义真实性=**未知**（合成夹具）。

## docs--design--review-agent--acceptance--d4-g01-build--I--fixtures--selections.json

- 职责：G01 用例 I 的双命名选择集（顶层键 `name`/`two`，2 键，1128 字节）：两组对象/操作选择输入。
- 消费：`copy-resources.ts:24-27` 约定名 `fixtures/selections.json` 构建拷贝；`review-v3-main-d4-local-plan.ts:31-39` 约定查找。
- 来源：D4 冻结构造产出；sourceBlob `9bd793b5beb141888dd5461db5befdf17f861f41`；sourceSha256 `fa833184b31c3a1e1523249119e27ee6639980980eaa9aaf05ce60712fa45919`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→I 用例选择输入缺失，本地计划编排失败。
- 验证：JSON 2 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；两组选择的业务对应=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--I--manifest.json

- 职责：G01 用例 I（学籍身份更正，v2）构造清单——**与同族异构**：顶层键 `schemaVersion/domain/templateKey/templateId/templateVersion/status/commonFixedSha/source/migratedFrom/workspace/coverage/sourceCatalog`；templateId `g01-student-identity-correction@2`、status `AUTHOR_CANDIDATE_PENDING_COMMON_RUNTIME`（机械提取）。
- 消费：`catalog.json`（:71-:73 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `f559296623c72cf5a897621a3267840397949ad2`；sourceSha256 `b13ed751a51cede2f716f49a81b96bced7f27f0a79b2b973f5072d311b20f155`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，I 用例链断（v2 模板身份登记丢失）。
- 验证：字段与 catalog 一致、commonFixedSha 与 technicalSha 同源、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PENDING_COMMON_RUNTIME 的后续动作=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--I--workspace--workspace.json

- 职责：G01 用例 I 的 D1 作者态工作区（schemaVersion 1，单模板 `g01-student-identity-correction@2`，107855 字节；位于 `workspace/` 子目录——家族二目录布局变体）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）；`copy-resources.ts:21-22`（workspacePath 直拷）。
- 来源：D4 冻结构造产出；sourceBlob `56b74e47c78bb874fc180a825ef41800a7562052`；sourceSha256 `d675fbc1797b37adc472fd5b0a884d88b5d9af80df6a57630a9eaf4486a687d5`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，I 用例消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--P--manifest.json

- 职责：G01 用例 P（政审程序）构造清单（机械提取：templateId `g01-political-procedure@1`、业务源 `G01_political_review_template_v0.3.md:v0.3`、15 模块/150 检查定义/36 规则行、runtimeStatus `NOT_RUN`、`independentGold: UNCHANGED_NOT_ACCESSED`、limitations 含「真实制度权限缺失」）。
- 消费：`catalog.json`（:87-:89 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `2f63b260f410f48e7eb9e01f2691f5f8dfadc2f0`；sourceSha256 `b5b39fd491d65866f38c55f2761aa22f31e10fef0bbe3a61fe4fbcede8e40eda`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，P 用例链断。
- 验证：字段/catalog 一致、businessSource 双哈希对 `business-templates/G01/originals/G01_political_review_template_v0.3.md` 可复算；NOT_RUN。
- 证实/推断/未知：字段/加载链/业务源指向=**证实**；执行结果=**未知**（NOT_RUN）。

## docs--design--review-agent--acceptance--d4-g01-build--P--selection.json

- 职责：G01 用例 P 的对象/操作选择输入（`templateId`/`version`/`targets` 3 键，4346 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `7a741049431176dec3104320f3a1b0a17df56cf8`；sourceSha256 `c24c344515e1d437005e4299426fd44fcd2fcb665325847948a9e9683d1701b5`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→P 用例本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--P--workspace.json

- 职责：G01 用例 P 的 D1 作者态工作区（schemaVersion 1，单模板 `g01-political-procedure@1`，341081 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `9f1cb03b56a05b566839e64c7844d604799cf0e3`；sourceSha256 `410f95cf665ffeb7a6b4b981176b07776b2e7230ef840679b3df19168d0a4da9`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，P 用例消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--S--manifest.json

- 职责：G01 用例 S（专项证明与用印）构造清单（机械提取：templateId `g01-special-proof-seal@1`、业务源 `G01_special_proof_seal_review_template_v1.4.md:v1.4`、10 模块/92 检查定义、runtimeStatus `NOT_RUN`）。
- 消费：`catalog.json`（:103-:105 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `f8fa3399c97ea95b2574e79a1fbeeff2d4f7bdaa`；sourceSha256 `265f7c547543c2d79fdb5d257cc9d1a3055a00e53fed6fa395a58de07553596c`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，S 用例链断。
- 验证：字段/catalog 一致、业务源双哈希对 `G01_special_proof_seal_review_template_v1.4.md` 可复算；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--S--selection.json

- 职责：G01 用例 S 的对象/操作选择输入（`templateId`/`version`/`targets` 3 键，2612 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `af5580ec6dfa2c0f9048c4e2b4f406e41b3cbc74`；sourceSha256 `3e18decf8bcfe76c701769be0688d4e40f782ab9d7f15d89e8e7f0efc71b2b53`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→S 用例本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g01-build--S--workspace.json

- 职责：G01 用例 S 的 D1 作者态工作区（schemaVersion 1，单模板 `g01-special-proof-seal@1`，255161 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `0905ac530da00926e1fd3406f1cc58619d5548b2`；sourceSha256 `ba83acee19729379f1116b493c351ca42b24e1920338a9ceb2dc9e1ae05909ae`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，S 用例消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T01--manifest.json

- 职责：G02 用例 T01 构造清单（机械提取：templateId `g02-t01-review`、status `PARTIAL`；4104 字节）。
- 消费：`catalog.json`（:119-:121 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `c33d1dbc4b37ea1169fff56b40021643d198c6a8`；sourceSha256 `76b9475c9321307d605e20cd78dde0142cab931b26da4dfa9984fa4a3bb7054e`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G02-T01 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项内容=**未知**（status 名义）。

## docs--design--review-agent--acceptance--d4-g02-build--T01--selection.json

- 职责：G02 用例 T01 的对象/操作选择输入（`templateId`/`version`/`targets` 3 键，5026 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `01d9ead7ea54d0ed1a9c08c8fc76c763db57ecfc`；sourceSha256 `6ab354f6dd9f26d458e29b7de7e897319d9a0c4a457776fb32bf9b06a6154716`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T01 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T01--workspace.json

- 职责：G02 用例 T01 的 D1 作者态工作区（schemaVersion 1，单模板 `g02-t01-review@1`，243198 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `31572edfb22f5cb4de2c0386d3403295247c484c`；sourceSha256 `ab831470f8e85fab86aaa40a182b9935da9c8fd4aef999383149426da2dd7ed9`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，T01 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T02--manifest.json

- 职责：G02 用例 T02 构造清单（机械提取：templateId `g02-t02-review`、status `PARTIAL`；3771 字节）。
- 消费：`catalog.json`（:135-:137 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `e211c62f94934bb110d25332df3854594995b3bd`；sourceSha256 `f76e8fa0fa28fb7f88fabec385a8d927aa79d342a9b3de0a69e049c6a4eadbbf`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G02-T02 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T02--selection.json

- 职责：G02 用例 T02 的对象/操作选择输入（3 键，3682 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `c553bb9ce6ed863a31667b221f4ccd01a383b956`；sourceSha256 `74e8e3bcbc6580e5543a29f74c3107a32278790f100068b06abe60c90fd55ec1`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T02 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T02--workspace.json

- 职责：G02 用例 T02 的 D1 作者态工作区（schemaVersion 1，单模板 `g02-t02-review@1`，221491 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `0485d13a86263412037d6a1a720d239826bb2d24`；sourceSha256 `31e6105b64f0c875ee9210ff4ab01b20303043b85283e9dd1b0a949a25055bf3`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，T02 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T03--manifest.json

- 职责：G02 用例 T03 构造清单（机械提取：templateId `g02-t03-review`、status `PARTIAL`；4058 字节）。
- 消费：`catalog.json`（:151-:153 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `d38dc825d2775a7b148f9624223e84a9b9870123`；sourceSha256 `779c9a4e384586427df336921d69b0b9edae670ef83f234602d8ca6ec8e0d6f5`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G02-T03 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T03--selection.json

- 职责：G02 用例 T03 的对象/操作选择输入（3 键，4579 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `10d6280bc1a007287f0e901b8cd598768038e353`；sourceSha256 `5ab2be6ff13fe420fc4697b4b3cf06ea29355f8a3d31245cbdaf44a9a816a3b0`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T03 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g02-build--T03--workspace.json

- 职责：G02 用例 T03 的 D1 作者态工作区（schemaVersion 1，单模板 `g02-t03-review@1`，232749 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `2502f25a5a6dc26ed045a85c6e1170a50a7da527`；sourceSha256 `21d41933156e66c6bf4436314457047832bd042cd4e2091d5d3db491a4d34436`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，T03 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t01--manifest.json

- 职责：G03 用例 g03-t01 构造清单（机械提取：templateId `g03-t01`、35 模块、status `GENERATED_NOT_RUN`；559 字节）。
- 消费：`catalog.json`（:167-:169 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `f170f6c6f05751d78bd3ed2da92b3015de7c7c9d`；sourceSha256 `03968107cccf774c7d44781ded5b5ffe0dc228df2e5bfbbb8f3a0235de75039e`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:30-33；yml:44-46）。
- 影响：删除→catalog manifestPath 解析失败，g03-t01 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN：产品测试/构建/GUI（本轮统一 NOT_RUN）。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**（GENERATED_NOT_RUN）。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t01--selection.json

- 职责：g03-t01 对象/操作选择输入（`templateId`/`version`/`targets` 3 键，4582 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `d25180314632e8442e3926c327d844d096d9e549`；sourceSha256 `9e0326598f1efac504a83ba042604d74dd7452361118a2c1655b7ddb89e7a9e7`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t01 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t01--workspace.json

- 职责：g03-t01 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t01@1`，199805 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `52dc1de11e585c12b4aa4f16b50a51b5379808b5`；sourceSha256 `7fcaeb49f62ac3df1881e4f6150f40217386ca0534595dacd8d83672ba22714b`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t01 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t02--manifest.json

- 职责：G03 用例 g03-t02 构造清单（机械提取：templateId `g03-t02`、37 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:183-:185 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `1e2a492c5d7dbf69a103421a41a052ff01eca904`；sourceSha256 `caec79f17d1d741d98c119f7e0e71f2a9928e40ead6b9d71dec525f7741b4d02`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t02 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t02--selection.json

- 职责：g03-t02 对象/操作选择输入（3 键，5495 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `c45bc75346ee06f73865f95e7345a6fcc9548fe6`；sourceSha256 `19a915963d33b91778865fb9c24c9ccb78d08c7d7148a664c8fd782384227170`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t02 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t02--workspace.json

- 职责：g03-t02 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t02@1`，184109 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `4dd3531645bd15d198ea97aa5bb799dfa2d530cf`；sourceSha256 `78e78680007962f85c450f6e35d36164a601bda3999b92538b3bd7efa1d64ee1`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t02 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t03--manifest.json

- 职责：G03 用例 g03-t03 构造清单（机械提取：templateId `g03-t03`、40 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:199-:201 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `1c7f2e49daf705d3397cae148063da0776cde4dc`；sourceSha256 `daad1333868eb78eda08137daff90ab4277d0c2c5773e52f11673848d73578f0`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t03 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t03--selection.json

- 职责：g03-t03 对象/操作选择输入（3 键，6855 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `6beb9501a68ca49c65bf063fec37a8b62145957a`；sourceSha256 `7151c4c6929ebbce75f119f41cc8ca1402cf15959d2686bd7278bd132b69eefd`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t03 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t03--workspace.json

- 职责：g03-t03 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t03@1`，217454 字节；内嵌「17 实际仓库能力映射（只做静态源码核对）」自述节 :624）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `f517166109667c72da9623c44575eb28515d05ea`；sourceSha256 `f1e543fdd034baebc5806e8708eba8ddd20cb8b78735cfd5d45cabcdcbf1f547`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t03 消费方失败。
- 验证：blob/身份/哈希复算、:624 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t06--manifest.json

- 职责：G03 用例 g03-t06 构造清单（机械提取：templateId `g03-t06`、35 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:215-:217 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `5f2c6cc6a2b553063fd58b23f726eb61a1208de4`；sourceSha256 `e6f4677d02ed1df77e026064cf282627dc1f7ccc37689217d509ba9b81e7fbc0`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t06 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t06--selection.json

- 职责：g03-t06 对象/操作选择输入（3 键，3705 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `a25870b6ea56dc83f66b638dd2686a26c8899e93`；sourceSha256 `c6698734382212ec98e83fd6b2f5ae046eca8b1c60b8a86e0fd90cc861aedce9`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t06 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t06--workspace.json

- 职责：g03-t06 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t06@1`，201878 字节；内嵌「17 当前编辑器/运行时能力映射」自述节 :554）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `41bdda0bea532d42faec017e7e15b6dedb05c783`；sourceSha256 `0151aa52ba81a7cf59deb3a16c29ee366cb72cbcfe6f7c44ee0546b04ee1668f`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t06 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t07--manifest.json

- 职责：G03 用例 g03-t07 构造清单（机械提取：templateId `g03-t07`、36 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:231-:233 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `53b661a40b85fccc013d5a61d18eaf6254fa88c5`；sourceSha256 `ff8838008918dfbdcfff9175db6127716717ee4a6d5f1e46552820f92adde9b4`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t07 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t07--selection.json

- 职责：g03-t07 对象/操作选择输入（3 键，4154 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `effdfbffa1750a670a61942b655ab01b06907f48`；sourceSha256 `2eece548dd6dc7db04d5dfe4c439acbe218ca6b523be93cc7692b09cdbeb4df3`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t07 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t07--workspace.json

- 职责：g03-t07 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t07@1`，223356 字节；内嵌「18 能力映射、完成状态与下一阶段交接」自述节 :659）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `619b9421f9292f8269334b7740869158512d7407`；sourceSha256 `f33bfb673287b613904f3b17db167fdb957f5bf56d6269ea6ef3f8beed4ae52a`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t07 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t08--manifest.json

- 职责：G03 用例 g03-t08 构造清单（机械提取：templateId `g03-t08`、36 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:247-:249 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `370bd8ef13da8efc6c4ba3f4fa1cde29736e1b24`；sourceSha256 `2e041f1b9ecb1696e01a00acfd9b39ae70897de3fb36c7be2a4003f05ea5218d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t08 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t08--selection.json

- 职责：g03-t08 对象/操作选择输入（3 键，5481 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `c05200e26e86192f3dc4f9b685bd780bc33cc6ca`；sourceSha256 `d547282939b2ed6b9027c1dc4a7da3b22986e93c70e2381ddbbfb90a42c506fb`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t08 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t08--workspace.json

- 职责：g03-t08 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t08@1`，198434 字节；内嵌「17 当前项目编辑器与运行时映射」自述节 :666）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `92fc09c62e660adafc78ba0cbf3ff6fb2028c257`；sourceSha256 `02900c7b7e620a01aad1143dee9ee50430efb9b1ae1639bce7588c0ae99dc299`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t08 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t09--manifest.json

- 职责：G03 用例 g03-t09 构造清单（机械提取：templateId `g03-t09`、37 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:263-:265 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `fa464d1662a78d454bcbdf7504823410d05623da`；sourceSha256 `d9e2fd9079dc217e6432e35664fbc42bca5e27862be8add8a6beb1d9540e5e4c`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t09 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t09--selection.json

- 职责：g03-t09 对象/操作选择输入（3 键，5496 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `6a8802e16d81c6c5d39f1dbbed19f4520afdac40`；sourceSha256 `61d8e0cb70b1520e03f40edb48b6c4e2df5b820da0294cf970df977af24bab9e`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t09 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t09--workspace.json

- 职责：g03-t09 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t09@1`，199673 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `1dcb97f3edf657693df60fc625c55293b9b40fdb`；sourceSha256 `bdb090a75f484ed483d02d02dde0a8e6aae44f5c0baee35f322e4b7ccc722644`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t09 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t10--manifest.json

- 职责：G03 用例 g03-t10 构造清单（机械提取：templateId `g03-t10`、36 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:279-:281 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `ab19131732984ba2dfc129dd349d3c61e11c3c2e`；sourceSha256 `6865dc46e5d7224ae4d031a9e97a8457137c22cd5816bc526f8f43daacf16322`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t10 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t10--selection.json

- 职责：g03-t10 对象/操作选择输入（3 键，5068 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `201627b1ac4f37e7c73b055f83b7d025b487dac3`；sourceSha256 `85253adb2825f80c434be1d7b61e91e151c72e0073232731954366efe2ed3ac9`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t10 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t10--workspace.json

- 职责：g03-t10 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t10@1`，216558 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `02eb3e413b145209a69779b9b381182653e4f7fe`；sourceSha256 `ce9188f944d13bbfa2ac6b5504332cb9ecdd3a50ef74ced8e3644839c7fd4322`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t10 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t11--manifest.json

- 职责：G03 用例 g03-t11 构造清单（机械提取：templateId `g03-t11`、35 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:295-:297 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `0a459f20008b780e34ee5fd8d76c08c6e57d3d5a`；sourceSha256 `c6f5c082ec10d32442b9e903565f8cf1ed3637c8b8718500af60cddd35cd50af`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t11 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t11--selection.json

- 职责：g03-t11 对象/操作选择输入（3 键，5039 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `a9b81fa8d2ca9ee5ce3aa0d9e338f661fedb47bd`；sourceSha256 `eeb7e50edb6d604d8d491ba2814ca22b742c181d5c13af23d0656e86124ee86e`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t11 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t11--workspace.json

- 职责：g03-t11 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t11@1`，188206 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `c55867f1d576112cb2815ec0476ae7a6fdfb675c`；sourceSha256 `f5f80a396792cd71df995809614a504bca9c3b9a69910d6adf7ecc52881ec743`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t11 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t12--manifest.json

- 职责：G03 用例 g03-t12 构造清单（机械提取：templateId `g03-t12`、35 模块、status `GENERATED_NOT_RUN`）。
- 消费：`catalog.json`（:311-:313 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `11a1c00397e156563c1eced57a074fdafac8271b`；sourceSha256 `73adada952eeb1dc210d04e5ca464764a5621b6f5d3098efe4af36ac4f4d0771`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g03-t12 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t12--selection.json

- 职责：g03-t12 对象/操作选择输入（3 键，4559 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `e16f7e0da6959f33b1ff0d293e78fcb099b20b54`；sourceSha256 `8a24dd04b963342661646a8af2828444df55351d61619e07d92596a708772f86`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g03-t12 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g03-build--g03-t12--workspace.json

- 职责：g03-t12 的 D1 作者态工作区（schemaVersion 1，单模板 `g03-t12@1`，206243 字节；内嵌「17 当前编辑器/运行时可表达性与不可删除的缺口」自述节 :603，标注 `SOURCE_INSPECTED_NOT_RUN`）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `7229c2e00a436d5a15d5ead047d610c24c3215da`；sourceSha256 `dc7b2cecb5e923258ac5cfcae5716ed4e92733c1e97ebc5e3ddea82a8aebef15`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g03-t12 消费方失败。
- 验证：blob/身份/哈希复算、:603 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t01--manifest.json

- 职责：G04 用例 t01 构造清单（机械提取：templateId `d4-g04-t01`、7 模块；4305 字节）。
- 消费：`catalog.json`（:327-:329 区段）→ `review-d4-catalog.ts:55-77`；构建拷贝 `copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `5d180ee390d102fbd494e66434694448f768a80d`；sourceSha256 `8458c64ab05674c16d57b27831b442423b75cc6d9dfc0f693cac84f9994e3a5a`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:30-33；yml:44-46）。
- 影响：删除→catalog manifestPath 解析失败，g04-t01 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t01--selection.json

- 职责：g04-t01 对象/操作选择输入（`templateId`/`version`/`targets` 3 键，1768 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `ed2ed13948c46ca7cb0b3652bb27d460325a332f`；sourceSha256 `36beb4903b6c4d9f169ca729aaa39499aacdb1ff20bf015f754d38f67ed18a11`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t01 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t01--workspace.json

- 职责：g04-t01 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t01@1`，255595 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `b682b609b406d540056d7d5cfc58d38da1d91f7c`；sourceSha256 `5d83e0b1abcd380e3dc6fd35f79d76f29cf8509d5668b2c221492264378b3f55`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t01 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t02--manifest.json

- 职责：G04 用例 t02 构造清单（机械提取：templateId `d4-g04-t02`、7 模块；3961 字节）。
- 消费：`catalog.json`（:343-:345 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `cf13ef4ec65af7f32e290425969cfa1e5ec74325`；sourceSha256 `f9b54f6e7b360cdb9a54f7cb5a736206eaf1b9e069007008a7d34f2cd408e9f7`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g04-t02 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t02--selection.json

- 职责：g04-t02 对象/操作选择输入（3 键，1803 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `9d86d5bbcfc5138fc5c248e96e74bb2cb6367955`；sourceSha256 `c0aaf1ecb1b5f33bd3c445fc1d960cd4423c4ca8f45430d426d537ea2528165d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t02 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t02--workspace.json

- 职责：g04-t02 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t02@1`，229272 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `2354d08de23792a0f447c0fcbd6208e0cac299c5`；sourceSha256 `b145bc171bab80ed78ec7271cb89f9a3e5656b692fab5d7ddd18602a893dc801`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t02 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t03--manifest.json

- 职责：G04 用例 t03 构造清单（机械提取：templateId `d4-g04-t03`、7 模块；3954 字节）。
- 消费：`catalog.json`（:359-:361 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `ca54e6d730cc2d654021c605253593ffffdb1173`；sourceSha256 `ed4291e2536e4a465500c7528e1a63b190629136c45368a2ce01e2b552b088cb`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g04-t03 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t03--selection.json

- 职责：g04-t03 对象/操作选择输入（3 键，1781 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `d96fd9a820c62798e844c10ff8d0471af7be7d46`；sourceSha256 `14e528b2c4e726234d1a5f9d55f38affd25368625a49065d00285942d2ce0e50`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t03 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t03--workspace.json

- 职责：g04-t03 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t03@1`，259286 字节；内嵌「17 仓库能力映射 C6」自述节 :505）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `d34bfa71aa3e4d36b6a8d1cd99836968c97cafd0`；sourceSha256 `ac675ed143da0c243fe625e513393457c089ac81d9a83a3d7b2bc06474f48000`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t03 消费方失败。
- 验证：blob/身份/哈希复算、:505 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t04--manifest.json

- 职责：G04 用例 t04 构造清单（机械提取：templateId `d4-g04-t04`、7 模块；3943 字节）。
- 消费：`catalog.json`（:375-:377 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `f4d3245134e1fcfe9e2128a6cc15bb157c556618`；sourceSha256 `a82c9eab3dd8eba86790d3f71d63efd033e50593d6e3e20be6edc382348b078d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g04-t04 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t04--selection.json

- 职责：g04-t04 对象/操作选择输入（3 键，1781 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `2b27328ffa51975dde90cceb525f6d3063a4c7f4`；sourceSha256 `a249e6a437be71d3d09f8e4e8ad4cc460a10de688017b5773d503542378ed4e9`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t04 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t04--workspace.json

- 职责：g04-t04 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t04@1`，223145 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `2a2464064d83b222215ade83336602995cb06b90`；sourceSha256 `57dba0076394f31cdbecba5dcd56cb36b629488b29541fb0a545c73ce89b80b7`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t04 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t05--manifest.json

- 职责：G04 用例 t05 构造清单（机械提取：templateId `d4-g04-t05`、7 模块；3824 字节）。
- 消费：`catalog.json`（:391-:393 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `3fe26dc784deb1130987dbf34f5161c0fd1f59b7`；sourceSha256 `31015b555290e1845f3c237068328c04ab905301cf934a635184f26890ccd2a7`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g04-t05 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t05--selection.json

- 职责：g04-t05 对象/操作选择输入（3 键，1793 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `cade3de457528ddc5309b31361edfaf8303f84c3`；sourceSha256 `608dbd7fbcd80cd821582ec65dc995e97eb14fd3695536ccb285f9f5d5a38858`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t05 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t05--workspace.json

- 职责：g04-t05 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t05@1`，241451 字节；内嵌「17 现有编辑器映射」自述节 :435）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `b771167e62a1494247745ce5761b8d2c16303a92`；sourceSha256 `279d5769c36968f1cd32d599a7b85d57bd9a45c31cac272f5af13b640bb1900e`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t05 消费方失败。
- 验证：blob/身份/哈希复算、:435 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t06--manifest.json

- 职责：G04 用例 t06 构造清单（机械提取：templateId `d4-g04-t06`、7 模块；4585 字节）。
- 消费：`catalog.json`（:407-:409 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `8aed4c7f16c52e1ae5b2a25aa555c24c24106c9d`；sourceSha256 `c2173f5e7704b8042539842ce7df25695fcd6326425db6e5b76692113fa8e4a7`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g04-t06 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t06--selection.json

- 职责：g04-t06 对象/操作选择输入（3 键，1809 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `26b130a86084de8a3b1e97efb9b38b6ac7b69b45`；sourceSha256 `a140287d41228f2f00a73856e3f209204f8261256b9e2800693577093dbb2a75`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t06 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t06--workspace.json

- 职责：g04-t06 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t06@1`，316739 字节，本域最大）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `c130989559e4f5d39a1e50d28327de843a37e0bf`；sourceSha256 `2e1b19889662e0369b4e6fa2ba0af6c4876b26163f19f8cd269b459a4a2b2ceb`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t06 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t07--manifest.json

- 职责：G04 用例 t07 构造清单（机械提取：templateId `d4-g04-t07`、7 模块；4082 字节）。
- 消费：`catalog.json`（:423-:425 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `04ab741ba952a771a0e09017d55fdc315d1e6b41`；sourceSha256 `e7e20e8fe4b29815669ee6e52a35c036e2a7bde1d600cf31fd3e99e0dca85118`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g04-t07 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t07--selection.json

- 职责：g04-t07 对象/操作选择输入（3 键，1781 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `143188b55d386f8bf6b56cf7ca91d2b0c4a70d75`；sourceSha256 `23228a3f1cd4d99d02557e8f986208eceed29919f6c61b3c19e50f76ec432578`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t07 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t07--workspace.json

- 职责：g04-t07 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t07@1`，300668 字节；内嵌「17 现有编辑器与运行时表达映射」自述节 :505）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `41fdfdb395841c968d0206055ce6def2d20b92a0`；sourceSha256 `2536088e1a13ea3bd612c3364d7b5130b646337196e3e0d9fff425b848a8f96e`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t07 消费方失败。
- 验证：blob/身份/哈希复算、:505 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t08--manifest.json

- 职责：G04 用例 t08 构造清单（机械提取：templateId `d4-g04-t08`、7 模块；3778 字节）。
- 消费：`catalog.json`（:439-:441 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `b3042ac39f44383d871464dcd1741fff4ab00a4d`；sourceSha256 `6e8b99efe7e6cbc8f4799e060066b0a2902a33fc25e8d2fefe973c57e7726038`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g04-t08 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t08--selection.json

- 职责：g04-t08 对象/操作选择输入（3 键，1785 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `ed0145b6464cbfbddcd46afba496ee97386ef706`；sourceSha256 `424c639ac4185d4c80c39a36de392954704a5990a5a0ff9fb4e379d0645800cb`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g04-t08 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g04-build--t08--workspace.json

- 职责：g04-t08 的 D1 作者态工作区（schemaVersion 1，单模板 `d4-g04-t08@1`，236373 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `413b4bd4cb27ef4a2475c6b37d864f5728eba18a`；sourceSha256 `d7cbaf87cf1bf83580b08f98abe24153cb3fbaa606262fb4ba22c668812e26c2`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g04-t08 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t01--manifest.json

- 职责：G05 模板用例 g05-t01 构造清单（机械提取：templateId `g05-t01`、25 模块、status `PARTIAL`；2092 字节）。
- 消费：`catalog.json`（:455-:457 区段）→ `review-d4-catalog.ts:55-77`；构建拷贝 `copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `e4aa40e5583318e59c677eee83c7e6d9d335b82a`；sourceSha256 `021e4109c1801ae288dcb1fe214b2cc7933bd6177db393e534e0d28a9d772cda`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:30-33；yml:44-46）。
- 影响：删除→catalog manifestPath 解析失败，g05-t01 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t01--synthetic-selection.json

- 职责：g05-t01 合成选择输入（`templateId`/`version`/`targets` 3 键，5696 字节；家族二 `synthetic-selection.json` 变体——合成对象而非真实对象引用）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定名查找（`synthetic-selection.json` 在变体清单）；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `6870c9cb2fd3fda35a88e742c32f46132feebd50`；sourceSha256 `17b7770fea72e05bda9a39f9772bce8c44e2907c93b0c712274a2e2fcab21c69`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g05-t01 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**（合成语义本身即声明非真实）。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t01--workspace.json

- 职责：g05-t01 的 D1 作者态工作区（schemaVersion 1，单模板 `g05-t01@1`，270639 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `4ba9bbfb27d039bdd2e97e45013c9cd2acc4b154`；sourceSha256 `dbcea48a33e56a1de073ee8af8f9f8d24b2911498a2029c2ca2497ec88082d37`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g05-t01 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t02--manifest.json

- 职责：G05 模板用例 g05-t02 构造清单（机械提取：templateId `g05-t02`、27 模块、status `PARTIAL`）。
- 消费：`catalog.json`（:471-:473 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `7fadd1cc2df69f6bed23b28df7d0ab7cb5509e97`；sourceSha256 `41b25cf1ce97f2d6893ae479a9916746f80dda1ea5be4abc8ea8e019a45a0b85`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g05-t02 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t02--synthetic-selection.json

- 职责：g05-t02 合成选择输入（3 键，6537 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `0920070f2c1b19755ae1a607254471ff5c15624e`；sourceSha256 `7843c575136df127218b793d90589ee7c5a52152f8f8b8c12a399f543bc22cc5`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g05-t02 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t02--workspace.json

- 职责：g05-t02 的 D1 作者态工作区（schemaVersion 1，单模板 `g05-t02@1`，245644 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `4a11397fcdf112a10bec40d0b1e75aea6d8d02a2`；sourceSha256 `236058ab99711f50bf0df3133386645148d4d4c4833cbc53b075d66cf45b9268`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g05-t02 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t03--manifest.json

- 职责：G05 模板用例 g05-t03 构造清单（机械提取：templateId `g05-t03`、27 模块、status `PARTIAL`）。
- 消费：`catalog.json`（:487-:489 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `7d2931f14401b8da9dbc3aab4427cc676f0fb25f`；sourceSha256 `b25c029275e5609e6ed820c98df714ff4e503eb12d61c0334deb63df03313e47`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g05-t03 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t03--synthetic-selection.json

- 职责：g05-t03 合成选择输入（3 键，6528 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `63060104d4f78ea297a420b655c3ea28b15f4d70`；sourceSha256 `184c0064549929a799c5aa8d4ffa046ac43922ed4e1991ce2bc711f910f4c3e5`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g05-t03 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t03--workspace.json

- 职责：g05-t03 的 D1 作者态工作区（schemaVersion 1，单模板 `g05-t03@1`，269597 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `0c682e45b8bfd4b089c076a3cbc9055406f99fae`；sourceSha256 `49669218f5adfbcdc9f9bf4ceda6d92df55216696ba44b1ba076a5138b3a7955`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g05-t03 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t04--manifest.json

- 职责：G05 模板用例 g05-t04 构造清单（机械提取：templateId `g05-t04`、24 模块、status `PARTIAL`）。
- 消费：`catalog.json`（:503-:505 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `58ac73d0045f2465a39b705e3dcf70f7a776438f`；sourceSha256 `01b705bbb19cc774559a0bd0f756727ceb930ed933b4d110af9dfadb4623654f`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g05-t04 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t04--synthetic-selection.json

- 职责：g05-t04 合成选择输入（3 键，5237 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `31f762faa9b9fb4b64d321ac9fc6cbd10a5e1bf6`；sourceSha256 `10166c17d933b7d9bf0259fe3535338c4c34be44ae8bf718a6bc3d70a25d1ce2`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g05-t04 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t04--workspace.json

- 职责：g05-t04 的 D1 作者态工作区（schemaVersion 1，单模板 `g05-t04@1`，198991 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `08c753d1409a7fec63382e32005047f7b7c8f9ad`；sourceSha256 `ee6f61f3b3d6ad518f8329d31883240f5cdeac05bcd4168e37267916a3d695c8`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g05-t04 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t05--manifest.json

- 职责：G05 模板用例 g05-t05 构造清单（机械提取：templateId `g05-t05`、24 模块、status `PARTIAL`）。
- 消费：`catalog.json`（:519-:521 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `dcd7c493bfd141136ddc79c944452ebbb4d51f24`；sourceSha256 `0ef6ab20c5f71ee1683852f90b595d6c9cddf55987ce48e40d9190aa46ce3d2b`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g05-t05 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t05--synthetic-selection.json

- 职责：g05-t05 合成选择输入（3 键，5656 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `174652f6852fff0cbb3ce07c4082bc246b25a359`；sourceSha256 `2f7eabca85cb098923b37435e3deb4d90e8e64b7ec182e3e952fa00b71e59bb9`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g05-t05 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t05--workspace.json

- 职责：g05-t05 的 D1 作者态工作区（schemaVersion 1，单模板 `g05-t05@1`，261567 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `51e95134e23a70e6286a460559794714e0e56de9`；sourceSha256 `88116ea51a9279da2a0700c388365f705d9994f6b5b99f1e83493e7f6939eaee`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g05-t05 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t06--manifest.json

- 职责：G05 模板用例 g05-t06 构造清单（机械提取：templateId `g05-t06`、27 模块、status `PARTIAL`）。
- 消费：`catalog.json`（:535-:537 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `164fb04001a2ad96ed07de69a564ec774db8e474`；sourceSha256 `4497c8743a4a0a71ae8ae75714e25a388ff1b0ed5196a6c9bb4ceb024b0f5e70`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g05-t06 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；PARTIAL 缺项=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t06--synthetic-selection.json

- 职责：g05-t06 合成选择输入（3 键，6120 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `9bdc715f4d88afe10b8c21c6975b9a719ecfcc9e`；sourceSha256 `ce2e2b366573ce141d4a056c7bfdbe1308bdfb9177fc7b8b0ae2783cc4c2f112`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g05-t06 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**。

## docs--design--review-agent--acceptance--d4-g05-build--templates--g05-t06--workspace.json

- 职责：g05-t06 的 D1 作者态工作区（schemaVersion 1，单模板 `g05-t06@1`，264432 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `6255b3e2d015511926665db59f710770dc45f2d8`；sourceSha256 `ba8f93fa12a5e779eda2eb5fb78cb34b853976bb63673e22ffe3b0bab98e689d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g05-t06 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T01--manifest.json

- 职责：G06 用例 G06-T01 构造清单（机械提取：templateId `g06-t01@1`；1408 字节）。
- 消费：`catalog.json`（:551-:553 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `14c030027a2a966e4bad8131fd2cdefd95069393`；sourceSha256 `b933c03232ce36b3ebf95220e04f0ef7519f6b813c9ee401f4244360a7b94d01`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:30-33；yml:44-46）。
- 影响：删除→catalog manifestPath 解析失败，G06-T01 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T01--selection.json

- 职责：G06-T01 对象/操作选择输入（`templateId`/`version`/`targets` 3 键，6348 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `c428d129958c0d188cc0cba0dbdc222df8c88110`；sourceSha256 `cd439d36471b32a49808cda8125f928b6bc8648df9f7de13042f8346a055e85b`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T01 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T01--workspace.json

- 职责：G06-T01 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t01@1`，258440 字节；内嵌「17 现有系统仓库表达映射及能力缺口」自述节 :1240）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `dc818e9bd9b8b5663b1d0ffabf0998c77e2bad5f`；sourceSha256 `0111c40488e0562fcff48ccfe1768e3acc03dc9bac08e9ee0b8a0dd5384dadf3`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T01 消费方失败。
- 验证：blob/身份/哈希复算、:1240 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T02--manifest.json

- 职责：G06 用例 G06-T02 构造清单（机械提取：templateId `g06-t02@1`；1477 字节）。
- 消费：`catalog.json`（:567-:569 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `03c220c225ab09f44feb554f0edf7b408e4de4a7`；sourceSha256 `05db5d22a51897b32258aa971604a49e6833cf4c885a077b09640dc35a615391`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T02 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T02--selection.json

- 职责：G06-T02 对象/操作选择输入（3 键，6817 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `27197bbd5ce1915ea6cebbc35b27935c42fa4d59`；sourceSha256 `3db076f50b211b0b33fd6c4d2da4a73bb9c23b02e402b05470c3e74583365bca`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T02 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T02--workspace.json

- 职责：G06-T02 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t02@1`，269856 字节；内嵌「17 当前仓库的表达映射」自述节 :1135）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `67b7b5195db4944e8970945f90fce49698161907`；sourceSha256 `1a448d2cac5ed1d805b555af961a33b5ffbad626a838a425773a44ebcd070db9`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T02 消费方失败。
- 验证：blob/身份/哈希复算、:1135 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T03--manifest.json

- 职责：G06 用例 G06-T03 构造清单（机械提取：templateId `g06-t03@1`；1408 字节）。
- 消费：`catalog.json`（:583-:585 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `1fc7994778437205c816e8f8b17fcb654c40591a`；sourceSha256 `76d084959470f2d74d33790ff08e5505fb0b84d6caba611e4d5b008e55786a8a`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T03 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T03--selection.json

- 职责：G06-T03 对象/操作选择输入（3 键，3678 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `40305d7aa1bb2deaaccb070d35f5ae0835ce4363`；sourceSha256 `b9b24b21be76d4174252f3c9ac52747b11d44f32a98d5b572715a5b2e01bda4f`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T03 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T03--workspace.json

- 职责：G06-T03 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t03@1`，241471 字节；内嵌「17 与当前仓库编辑器及运行态的表达映射」自述节 :988）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `2d2911f0051182f28913fe7773bd63ab8be176b8`；sourceSha256 `7e31934966265ada9481a8b78d18bcd5ffd9942811b927eb3e0cace8897277ce`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T03 消费方失败。
- 验证：blob/身份/哈希复算、:988 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T04--manifest.json

- 职责：G06 用例 G06-T04 构造清单（机械提取：templateId `g06-t04@1`；1408 字节）。
- 消费：`catalog.json`（:599-:601 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `5e3a72509b4e6eb3d89152ffdfca17f1e2c411c8`；sourceSha256 `b0ede6970f96eaccdab5c946941a3cc26232028027dcbd66e561438712fbe973`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T04 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T04--selection.json

- 职责：G06-T04 对象/操作选择输入（3 键，5899 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `7f59871e865d335d043c1d4fbb2dc249b58d733a`；sourceSha256 `577ee1a88b5db70540ed2033d23587381f260f8ecd84aabd693fc6abdcf4c4c7`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T04 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T04--workspace.json

- 职责：G06-T04 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t04@1`，269085 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `1225aa0bba3ecde4d8fe87f5f3ecefcc8a2510bb`；sourceSha256 `790bf1433ff460155a14e421eddea773238f93c0d443bbddd0c904621672e6a5`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T04 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T05--manifest.json

- 职责：G06 用例 G06-T05 构造清单（机械提取：templateId `g06-t05@1`；1408 字节）。
- 消费：`catalog.json`（:615-:617 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `43865ea836a738d5f3c88d641edfd75578408c9f`；sourceSha256 `1cd938988642948f4d4a4c1aab4c32da4a935d23a600c9ebdc63887285f9c8b4`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T05 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T05--selection.json

- 职责：G06-T05 对象/操作选择输入（3 键，6791 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `2346daed121c6b012d27b4775f79bf72fbef39cf`；sourceSha256 `82dee2c2cca333dfc5f26db04804ca54ac62a3509733bdc583ff3b4c88148d51`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T05 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T05--workspace.json

- 职责：G06-T05 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t05@1`，234469 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `2bca35969bbff219988e1c3b94d01bf0ea7f99e7`；sourceSha256 `6177314b1f24f358abcd69e267e88edff73f9051626da4579563b8961a314e63`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T05 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T06--manifest.json

- 职责：G06 用例 G06-T06 构造清单（机械提取：templateId `g06-t06@1`；1408 字节）。
- 消费：`catalog.json`（:631-:633 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `fb61059e6f56ac29508bd7f57c3dd8dcd6e0d6a9`；sourceSha256 `ea783be3dba4bbc160cc53f5262b9070f932ed76a7304b127847f0e46e549111`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T06 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T06--selection.json

- 职责：G06-T06 对象/操作选择输入（3 键，5440 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `25957eec697f5f0b4590cf35dc50a8b8a5dff03e`；sourceSha256 `2f7369edf8322ed77f7547fe7a13b61b1226af6551eb1014033c5ef39b906c42`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T06 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T06--workspace.json

- 职责：G06-T06 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t06@1`，205619 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `1bd4d1bc551d965d585b2fc10ed2a558d2de4d12`；sourceSha256 `27f4f61c76130b3b591c88ca2543da6d5f5f9e736c334532c2692cd98bb53d46`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T06 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T07--manifest.json

- 职责：G06 用例 G06-T07 构造清单（机械提取：templateId `g06-t07@1`；1408 字节）。
- 消费：`catalog.json`（:647-:649 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `1ea50edb9fec0fbf0c89d15a7268c8f89ed1f13d`；sourceSha256 `d10c346fa758400d2ae192590a13c759b26178cd65bb7a77f9a29b5abdfd4a92`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T07 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T07--selection.json

- 职责：G06-T07 对象/操作选择输入（3 键，5454 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `fd7d3ffb687a10fccbae74a4e2ccbcd4a3108c50`；sourceSha256 `e35db79d4ea0fd8e5bf221731c69159a1b214170bdf37c837289c618a374018c`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T07 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T07--workspace.json

- 职责：G06-T07 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t07@1`，243116 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `5134d910173083bc8d80032b702f25b23dc28931`；sourceSha256 `2ddbb8b1f9a0c1c9e7e8f3fd397acf3e96c775e48b66f9b8b4be820ff87946dd`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T07 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T08--manifest.json

- 职责：G06 用例 G06-T08 构造清单（机械提取：templateId `g06-t08@1`；1408 字节）。
- 消费：`catalog.json`（:663-:665 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `97edc397736a6b8f01768a20c795b70bb8539261`；sourceSha256 `4a5af9de41e8f44714dc082d7129df5c8a5291c6a1ecd500c70e60d996a8a438`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T08 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T08--selection.json

- 职责：G06-T08 对象/操作选择输入（3 键，6450 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `f860126cfd2fe94991ea8d5451ccb7404ba00adc`；sourceSha256 `f3432f3c1e9a2376b5c3420534687297bbda47d8695d1bb4828ddf8a9076426d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T08 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T08--workspace.json

- 职责：G06-T08 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t08@1`，237275 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `4d25aff95b737569f70ff4c113561adf00988be7`；sourceSha256 `932969b2e5030781dc2698d08e23c77f776775054e13b85c955ace488ea2321f`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T08 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T09--manifest.json

- 职责：G06 用例 G06-T09 构造清单（机械提取：templateId `g06-t09@1`；1456 字节）。
- 消费：`catalog.json`（:679-:681 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `5dce153d7645aa4ee46cf90c382d385866a62a14`；sourceSha256 `627969dbcdc15ee103a6bda5cae0a4540ec615d75e0fcba39cbeb01f3dd36cbd`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G06-T09 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T09--selection.json

- 职责：G06-T09 对象/操作选择输入（3 键，5943 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `94c345a9a2bf5f192ae8b3652f6c9a0958cea6f0`；sourceSha256 `b72d4ee79a19d33766341dc58ff69405fd08ea46f276b0dc977d5c8bc86807d1`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→G06-T09 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g06-build--G06-T09--workspace.json

- 职责：G06-T09 的 D1 作者态工作区（schemaVersion 1，单模板 `g06-t09@1`，257060 字节；内嵌「17 当前编辑器/运行时表达映射」自述节 :1051）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `56c0dd39b7260e359cd6ad2550fafb4450dbe8a2`；sourceSha256 `2fe2a20c5ce96cebfc67f32b7c1189bd22035040e0c3624c646c7d02c68ced1d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G06-T09 消费方失败。
- 验证：blob/身份/哈希复算、:1051 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T01--fixtures--selection.json

- 职责：G07 用例 T01 的对象/操作选择输入（`templateId`/`version`/`targets` 3 键，6481 字节；位于 `fixtures/` 子目录——家族二目录布局变体）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定名查找（`fixtures/selection.json` 在变体清单）；构建拷贝 `copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `d214d9bbb95d387779e278b13933bb400304e18f`；sourceSha256 `c6bf34240c2ccf387ab5c0efa7f2084da0c34c92ca70943ed7f7dbc25983a581`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:30-33；yml:44-46）。
- 影响：删除→T01 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T01--manifest.json

- 职责：G07 用例 T01 构造清单——**异构 schema**（机械提取：`businessTemplate`/`technicalTemplateId`/`commonCodeSha`/`original`/`objectBusinessType`/`ruleCount`/`extractedSourceLineCount`/`sourceMdLocation`/`moduleCount` 15/`authoredTaskCount`、status `PARTIAL`；5825 字节）；`sourceMdLocation` 指 `…/d4-g07-build/T01/source/frozen-C-v0.1.md`（不在 index-only 集）。
- 消费：`catalog.json`（:695-:697 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `61472c70a0ce4bcbec9b5885748805ddb53e143e`；sourceSha256 `5610bfce4a12e26d97addbb6deddf8b9bc47f334539866b493940bd2bfb8d5d5`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G07-T01 链断。
- 验证：字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；sourceMdLocation 目标存在性=**未知**（不在本清单）。

## docs--design--review-agent--acceptance--d4-g07-build--T01--workspace--workspace.json

- 职责：G07-T01 的 D1 作者态工作区（schemaVersion 1，单模板 `g07-t01@1`，280013 字节；含 R-01…R-32 规则锚点定位到 `business-templates/G07/C/G07-T01/originals/…v0.1.md` 行号，:805-:1195 等）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `404993427d55dbf36f4e552de574a026b0d5f20d`；sourceSha256 `7af92c17d936a0487f4cced289e5e0584738deb65e82affe99057943f7d211de`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G07-T01 消费方失败。
- 验证：blob/身份/哈希复算、:805 起定位串可读；NOT_RUN。
- 证实/推断/未知：加载链/定位结构=**证实**；被引 originals 行号准确性=**未知**（原件不在本清单）。

## docs--design--review-agent--acceptance--d4-g07-build--T02--fixtures--selection.json

- 职责：G07 用例 T02 的对象/操作选择输入（3 键，6473 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `b56bcedd4c68ccf2566d6729b044aee35f9ef60f`；sourceSha256 `59dfeba83c2c6e8d80979a30f028fcc7c863096ec03d1bf132976f3ea0d8c1c7`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T02 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T02--manifest.json

- 职责：G07 用例 T02 构造清单（异构 schema：moduleCount 15、status `PARTIAL`；3550 字节；sourceMdLocation→`…/T02/source/frozen-C-v0.1.md`）。
- 消费：`catalog.json`（:711-:713 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `87e0b3214536427d9f5df236d9a0bae1cf9a9d2e`；sourceSha256 `5ae50baf19c142d02b92d14e2f3936bc853baf4cc5e96448a76973639f744524`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G07-T02 链断。
- 验证：字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；sourceMdLocation 目标=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T02--workspace--workspace.json

- 职责：G07-T02 的 D1 作者态工作区（schemaVersion 1，单模板 `g07-t02@1`，224067 字节；:652 内嵌「16 实际编辑器/运行时能力映射」自述节，引用 15/18/19 号设计文档）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `aca9167e7339777e238d242515949b1ebddf9e68`；sourceSha256 `cd88162f00160846363ada3b8d238099abee24cfc82ca3621da9290f47ed5a09`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G07-T02 消费方失败。
- 验证：blob/身份/哈希复算、:652 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T03--fixtures--selection.json

- 职责：G07 用例 T03 的对象/操作选择输入（3 键，6489 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `7eda5a4a6dd7cd06da5529b186fd7b9c3aa5359e`；sourceSha256 `49ef905bd9ce9f374f30ea77a1d575a4433d41f98ce5950622f2193d90aa6458`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T03 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T03--manifest.json

- 职责：G07 用例 T03 构造清单（异构 schema：moduleCount 15、status `PARTIAL`；3577 字节；sourceMdLocation→`…/T03/source/frozen-C-v0.1.md`）。
- 消费：`catalog.json`（:727-:729 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `2dc5deed1d056f2bc95e5802b99f955a225b1077`；sourceSha256 `eef811585c21756513adbf787c472fca7eab88d4fec2e80538c90a38afe6bbff`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G07-T03 链断。
- 验证：字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；sourceMdLocation 目标=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T03--workspace--workspace.json

- 职责：G07-T03 的 D1 作者态工作区（schemaVersion 1，单模板 `g07-t03@1`，283906 字节；:638 内嵌「17 现有编辑器和运行时实际能力映射」自述节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `36dc3d18c6a853fafc6c135bb504c00038341908`；sourceSha256 `b7553e20ffa1b5e859df1b9b7de4c087bb623ed5cb16306e55de483b80653799`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G07-T03 消费方失败。
- 验证：blob/身份/哈希复算、:638 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T04--fixtures--selection.json

- 职责：G07 用例 T04 的对象/操作选择输入（3 键，6469 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `b64940c87b9100bb167d507dc2facffe6cea4989`；sourceSha256 `41c754394584d5a5b83be8f94a9f59b9b18f11e955dc5fa249eff6aac24fd2c3`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T04 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T04--manifest.json

- 职责：G07 用例 T04 构造清单（异构 schema：moduleCount 15、status `PARTIAL`；4709 字节；`original` 指 `business-templates/G07/G07-T04/C-e0-r02/C-v0.1-original/…v0.1.md`，:10）。
- 消费：`catalog.json`（:743-:745 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `9731f51d75275b5758cc0c086189237d8bf7a545`；sourceSha256 `2519324b063d2b79a56cd5bfa583b7952105a3fb914bfcf48e2be08f4108d8aa`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G07-T04 链断。
- 验证：字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；original 目标存在性=**未知**（G07 原件不在本清单）。

## docs--design--review-agent--acceptance--d4-g07-build--T04--workspace--workspace.json

- 职责：G07-T04 的 D1 作者态工作区（schemaVersion 1，单模板 `g07-t04@1`，387675 字节，本 group 最大 workspace；:840-:1685 含 R-01…R-36 规则定位到 G07-T04 原件行号）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `1db33be9fe0ae5f8b39b7ad536297d051234d4d5`；sourceSha256 `e09d60620d35ae1c1672b7b8c9d69e2c5e3d44ea50dfe75c54cf64fdda8ba470`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G07-T04 消费方失败。
- 验证：blob/身份/哈希复算、:840 起定位串可读；NOT_RUN。
- 证实/推断/未知：加载链/定位结构=**证实**；被引原件行号准确性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T05--fixtures--selection.json

- 职责：G07 用例 T05 的对象/操作选择输入（3 键，6489 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `7db43125354532ddc2464c2dd9b7a7d296779780`；sourceSha256 `c4f4407fba2566a0dfc82602365ef51edcb72fba5729b31220a8bdcdf251c20b`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T05 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T05--manifest.json

- 职责：G07 用例 T05 构造清单（异构 schema：moduleCount 15、status `PARTIAL`；3881 字节；sourceMdLocation→`…/T05/source/frozen-C-v0.1.md`）。
- 消费：`catalog.json`（:759-:761 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `0a3538fab15f71850b4003b2c85c378207221ed4`；sourceSha256 `326b28fef1f6a1f2111d508d31e62d8688e880d68ef471a0ec194076fa1f33b4`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G07-T05 链断。
- 验证：字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；sourceMdLocation 目标=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T05--workspace--workspace.json

- 职责：G07-T05 的 D1 作者态工作区（schemaVersion 1，单模板 `g07-t05@1`，253299 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `fd468aaf8fa6b0f3c9116442842889496406b06e`；sourceSha256 `7433b3207d2af530b8624e67a4dce940c97da2ba81ee9ed86feda857bd16481b`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G07-T05 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T06--fixtures--selection.json

- 职责：G07 用例 T06 的对象/操作选择输入（3 键，6463 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `688cec36a8e94bbca72534a3dc4983648ac85db6`；sourceSha256 `a80502ffa7a57e8162a595624b8ddeb24f1d9bbe3fbec02bfa1932e84afb8005`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T06 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T06--manifest.json

- 职责：G07 用例 T06 构造清单（异构 schema：moduleCount 15、status `PARTIAL`；4117 字节；sourceMdLocation→`…/T06/source/frozen-C-v0.1.md`）。
- 消费：`catalog.json`（:775-:777 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `1f0e01e456bff07c27d6f31019219ab8fd58ae75`；sourceSha256 `462c93a557bcfad26446e0f7209d4a66ecf71082f68145627a3b5d0135decc99`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G07-T06 链断。
- 验证：字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；sourceMdLocation 目标=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T06--workspace--workspace.json

- 职责：G07-T06 的 D1 作者态工作区（schemaVersion 1，单模板 `g07-t06@1`，328589 字节；:673 内嵌「17 对现有仓库的静态能力映射」自述节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `50a2445cd1d8e9d33dde88f7e91e053f46d20100`；sourceSha256 `bd8d8318f6cff1b0d4c9a368e5f535f20f7ff30b4b52a5c6383e7e2e49654b3d`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G07-T06 消费方失败。
- 验证：blob/身份/哈希复算、:673 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T07--fixtures--selection.json

- 职责：G07 用例 T07 的对象/操作选择输入（3 键，6467 字节）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `958c07898b6007429d368b85c338fbbebd7f5933`；sourceSha256 `88c317df57f26e6f30b2369ec67677ae73c9f2f41cd8f71d95548f4f50d312b1`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→T07 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；targets 一致性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T07--manifest.json

- 职责：G07 用例 T07 构造清单（异构 schema：moduleCount 15、status `PARTIAL`；4709 字节；`original` 指 `business-templates/G07/G07-T07/…v0.1.md`，:10）。
- 消费：`catalog.json`（:791-:793 区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `5acf7a67f44e3263dc0c80f851d3a4bfc99cabde`；sourceSha256 `86d8fdad78b426d74600bdc6093981a8f468dfd91855b5a6771eb82be0898cc8`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，G07-T07 链断。
- 验证：字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；original 目标存在性=**未知**。

## docs--design--review-agent--acceptance--d4-g07-build--T07--workspace--workspace.json

- 职责：G07-T07 的 D1 作者态工作区（schemaVersion 1，单模板 `g07-t07@1`，285464 字节；:701 内嵌「17 现有编辑器/运行时映射（C6）」自述节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `337bb4aa15d244d8511bd8c2385c1124b3198f7e`；sourceSha256 `bf4900e5a0e7e5eabb7a0fdee38138cbd97f67347909a347d2cb045a5a03c1d3`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，G07-T07 消费方失败。
- 验证：blob/身份/哈希复算、:701 自述节可读；NOT_RUN。
- 证实/推断/未知：加载链/自述节=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g08-build--g08-t02--manifest.json

- 职责：G08 用例 g08-t02 构造清单（机械提取：templateId `g08-t02`；1954 字节）。
- 消费：`catalog.json`（g08 条目区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出（家族二）；sourceBlob `af537a0fa8f96f80f22485ea3affecbfa141b152`；sourceSha256 `b88152cd1de66c99aaa1c6e6c611a4b96093fd594f11a58795719f011b870633`。
- 打包：进产物 `dist/resources/d4-unified/`（copy-resources.ts:30-33；yml:44-46）。
- 影响：删除→catalog manifestPath 解析失败，g08-t02 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g08-build--g08-t02--synthetic-selection.json

- 职责：g08-t02 合成选择输入（`templateId`/`version`/`targets` 3 键，3570 字节；`synthetic-selection.json` 变体）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `3880335733e80d7cb73fe01e5adb0a3b10fe50e3`；sourceSha256 `8ec9b9846122f2f901d4e7395b11706fc94c02742c8f5bccf097aa3f54a4db60`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g08-t02 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**。

## docs--design--review-agent--acceptance--d4-g08-build--g08-t02--workspace.json

- 职责：g08-t02 的 D1 作者态工作区（schemaVersion 1，单模板 `g08-t02@1`，164840 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `ef0e53e176da8181d3d5897d0f8dec513e61a350`；sourceSha256 `ba628a69d0faedc4be4eb7132171b48ba8e492dff9b148ae6db0738d9ec83039`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g08-t02 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-g08-build--g08-t03--manifest.json

- 职责：G08 用例 g08-t03 构造清单（机械提取：templateId `g08-t03`；2231 字节）。
- 消费：`catalog.json`（g08 条目区段）→ `review-d4-catalog.ts:55-77`；`copy-resources.ts:21-33`。
- 来源：D4 冻结构造产出；sourceBlob `263963a7cc5170078eccf1017ad1c05f1fa78af5`；sourceSha256 `ac4b3d02acbbb255f195fb5d519c7105de3a6ee234c4d9f731708484653bdf7e`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→catalog manifestPath 解析失败，g08-t03 链断。
- 验证：JSON 字段/catalog 一致、hash 一致；NOT_RUN。
- 证实/推断/未知：字段/加载链=**证实**；执行结果=**未知**。

## docs--design--review-agent--acceptance--d4-g08-build--g08-t03--synthetic-selection.json

- 职责：g08-t03 合成选择输入（3 键，4490 字节；`synthetic-selection.json` 变体）。
- 消费：`review-v3-main-d4-local-plan.ts:31-39` 约定查找；`copy-resources.ts:23-27`。
- 来源：D4 冻结构造产出；sourceBlob `242460885c33f8f0494ad28fbb03f72c7dc399b4`；sourceSha256 `b50ea05bc422502d5617f4c2588e4e07442ff56e499313615eebfc153ec44082`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除→g08-t03 本地计划编排缺选择输入。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；合成对象真实性=**未知**。

## docs--design--review-agent--acceptance--d4-g08-build--g08-t03--workspace.json

- 职责：g08-t03 的 D1 作者态工作区（schemaVersion 1，单模板 `g08-t03@1`，128261 字节）。
- 消费：`review-d4-catalog.ts:85-95`（:87 blob 校验）及家族二消费方。
- 来源：D4 冻结构造产出；sourceBlob `355d944791188a87e20f4ed9d7c7d664484328c2`；sourceSha256 `9bbdd5d702890cd7dd1baebad8469a9dcfb57cba0aacf07b7f18e03721708d54`。
- 打包：进产物 `dist/resources/d4-unified/`。
- 影响：删除/改动→`D4_WORKSPACE_BLOB_CHANGED`，g08-t03 消费方失败。
- 验证：blob/身份/哈希复算；NOT_RUN。
- 证实/推断/未知：加载链=**证实**；内容质量=**未知**。

## docs--design--review-agent--acceptance--d4-unified-r01--catalog.json

- 职责：D4 统一目录（38460 字节）：50 套模板用例的权威索引（顶层键 `schemaVersion/catalogId/technicalBaseSha/mergeMethod/templateCount=50/domainCounts/publicationAllowed:false/authoritativeSchoolTemplate/clientLoadMode/integrationStatus/testStateNotice/domainShards`；逐条 `D4UnifiedEntry` 含 workspacePath/manifestPath/workspaceGitBlobSha/sourceSha256 等，:39-:793 覆盖 G01–G07 全部条目）。
- 消费：①构建 `copy-resources.ts:18`（`catalogPath` 常量）→ :21-33 按条目拷贝全部三元组入包；②运行 `review-d4-catalog.ts:27`（CATALOG_PATH）→ :55-83 `loadD4UnifiedCatalog`（校验 `technicalBaseSha==COMMON :36`、`publicationAllowed===false`、templateCount/entries==50、域计数 `EXPECTED :35`=G01:5/G02:3/G03:10/G04:8/G05:6/G06:9/G07:7/G08:2）→ 家族二消费方。
- 来源：D4 目录整合产出（`mergeMethod` 字段记录整合方式）；sourceBlob `6be2833615e565c646583cb113ea55744dc13f3a`；sourceSha256 `955f4304c9a1816cf3f710a5076adf4d7236deb4cf402a61d60844c2111d0b6c`。
- 打包：进产物 `dist/resources/d4-unified/…/catalog.json`（copy-resources.ts:30-33）。
- 影响：删除→D4 全链断：copy-resources 抛错（构建失败）、`D4_RESOURCES_MISSING`/`D4_CATALOG_INVALID_HEADER`，50 用例全部不可达。
- 验证：JSON 头字段与 review-d4-catalog.ts:55-83 校验规则一致、50 条目路径全部存在、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/双消费点=**证实**（实读两处代码）；`mergeMethod`/`testStateNotice` 具体值语义=**未知**（未逐一展开）。

## docs--design--review-agent--acceptance--v3-dev-c0-r01--C0-SCHEMA-FIXTURES--L1-02-old-red-to-C0-rejection.json

- 职责：C0 契约夹具——L1-02 旧红灯探针到 C0 拒绝映射（957 字节；顶层键 `testId/oldStatus/oldProbeType/sourcePr/sourceSha/reportSha`+`oldEvidencePath`:8 指向 `v3-pre-round3-local-verification-r01/…L1-02-actor-and-appeal.json`（不在本清单））。
- 消费：`packages/shared/src/types/review-v3-c0.test.ts:86-90`——`fixture('L1-02-old-red-to-C0-rejection.json')`，断言 `mapping.channels` 长度 4、`oldProbeType==='Main-handler-harness'`、`liveElectronRendererAttackProven===false`。
- 来源：C0 拒绝用例夹具（v3-dev-c0-r01）；sourceBlob `3bbed83486d5badd8584cae2a794c1639d72e5b3`；sourceSha256 `a164703864805f3226e591d034d37d13c3f8d3b1a0da686a404553a3de4d5c98`。
- 打包：不进产物（copy-resources.ts:21-27 仅拷 d4-g 条目路径；C0 夹具不在清单，证实）。
- 影响：删除→review-v3-c0.test 夹具读取失败（测试红）；产品运行无影响。
- 验证：跑 `packages/shared` 的 review-v3-c0.test（本轮 NOT_RUN）、JSON 键齐全、hash 一致。
- 证实/推断/未知：测试消费行=**证实**（实读）；oldEvidencePath 目标=**未知**（不在本清单）。

## docs--design--review-agent--acceptance--v3-dev-c0-r01--C0-SCHEMA-FIXTURES--local-reviewer.json

- 职责：C0 契约夹具——本地合成审核员 principal（404 字节；键 `schemaVersion/synthetic/provenance/principal`），声明 synthetic 非学校凭据。
- 消费：`review-v3-c0.test.ts:68-80`——`assertC0CaseAuthorization` 三断言：合法 principal 不抛、改 `role:'teacher'` 抛 `ROLE_FORBIDDEN`、换 caseId 抛 `CASE_SCOPE_FORBIDDEN`、`source:'school'`+`assurance:'local-device'` 抛 `BLOCKED_AUTH`。
- 来源：C0 夹具（v3-dev-c0-r01）；sourceBlob `4162bae818ae61a51a8e5cc386d809f3e26b59c6`；sourceSha256 `c37ae8a47896af96688a23a2305fe6aeceb35ccd3fb0e2f75a6556de7e0f4e85`。
- 打包：不进产物。
- 影响：删除→C0 授权测试夹具缺失（测试红）；产品运行无影响。
- 验证：跑 review-v3-c0.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**；principal 字段语义=**证实**（synthetic 自述）。

## docs--design--review-agent--acceptance--v3-dev-c0-r01--C0-SCHEMA-FIXTURES--multi-target-unknown.json

- 职责：C0 契约夹具——多目标 applicability=unknown 的 CanonicalPlan（905 字节；键 `schemaVersion/planId/fingerprint/templateId/templateVersion/moduleDigests`）。
- 消费：`review-v3-c0.test.ts:93-95`——`assertC0CanonicalPlan(plan)` 不抛 + 断言全部 bindings `applicability==='unknown'`。
- 来源：C0 夹具；sourceBlob `aac991a3599088b39546b17f14abd835da007d7d`；sourceSha256 `dbc90c7896cea5e4ada15a8ec9abe76e105652c19d166fe9509303246460e1b8`。
- 打包：不进产物。
- 影响：删除→CanonicalPlan 三值/未知分支测试缺输入（测试红）。
- 验证：跑 review-v3-c0.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**。

## docs--design--review-agent--acceptance--v3-dev-c0-r01--C0-SCHEMA-FIXTURES--outbox-tiers.json

- 职责：C0 契约夹具——外部回执四档分级用例（1472 字节；键 `kind/schemaVersion/cases/note`，`cases` 5 项含 `expected`/`receipt`）。
- 消费：`review-v3-c0.test.ts:104-110`——5 用例循环：`expected==='valid'` 不抛、其余抛 `CONTRACT_INVALID`；并验证 mock 档不得冒充外部确认（:56-:58 trustTier 断言）。
- 来源：C0 夹具；sourceBlob `6a401a8664843ab8867a6491d6f44f25438ae7f0`；sourceSha256 `35a58a9db767f335ca3d83fabe09078aedd548baf0a2ae025b5b9de6da3deb32`。
- 打包：不进产物。
- 影响：删除→回执分级测试缺输入（测试红）。
- 验证：跑 review-v3-c0.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**。

## docs--design--review-agent--acceptance--v3-dev-c0-r01--C0-SCHEMA-FIXTURES--review-batch-missing-or-wrong-run.json

- 职责：C0 契约夹具——审核批次绑定错误 Run 的非法样例（649 字节；键 `schemaVersion/kind/batchAttemptId/entries/status/expected`）。
- 消费：`review-v3-c0.test.ts:100-102`——`assertC0ReviewBatchAttempt(bad)` 抛 `BATCH_ATTEMPT_MISMATCH`。
- 来源：C0 夹具；sourceBlob `ed1fd418151310cf2bbe59a8fe07e7ed48078f7b`；sourceSha256 `326a8c4eca76eba07a2bf5d937a6be7165dfae226a6a1d2147b10b27abfd70d3`。
- 打包：不进产物。
- 影响：删除→批次/Run 精确绑定测试缺反例（测试红）。
- 验证：跑 review-v3-c0.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**。

## docs--design--review-agent--acceptance--v3-dev-c0-r01--C0-SCHEMA-FIXTURES--school-spoof.json

- 职责：C0 契约夹具——四渠道 actor 冒充学校身份的不可信样例（202 字节；键 `synthetic/expected/actor/warning`，`expected='ACTOR_UNTRUSTED'`）。
- 消费：`review-v3-c0.test.ts:82-85`——断言 `f.expected==='ACTOR_UNTRUSTED'`、`actor.actorSource==='school'`、`actor.role==='teacher'`（显式不可信）。
- 来源：C0 夹具；sourceBlob `019548df0852e571c8eff607b2fac62f8c7c121a`；sourceSha256 `724baead5908b4e5d6dac8bdb78f559405b8d7c23acaece1ecc756f569017174`。
- 打包：不进产物。
- 影响：删除→身份冒充反例测试缺输入（测试红）。
- 验证：跑 review-v3-c0.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**。

## docs--design--review-agent--acceptance--v3-dev-c0-r01--C0-SCHEMA-FIXTURES--wrong-schema-version.json

- 职责：C0 契约夹具——错误 schemaVersion 反例（107 字节；键 `schemaVersion/expected/note`）。
- 消费：`review-v3-c0.test.ts:96-97`——`assertC0CanonicalPlan({...plan, schemaVersion: bad.schemaVersion})` 抛错（版本不容忍）。
- 来源：C0 夹具；sourceBlob `c7af579da29e80ddf3bf191fc8f8dc014f3e565c`；sourceSha256 `d0323ebd5c1a61966d3dacf04e9c87e8d074c4fe03e5af07e33f9879503ebe2d`。
- 打包：不进产物。
- 影响：删除→schema 版本拒绝测试缺反例（测试红）。
- 验证：跑 review-v3-c0.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**。

## docs--design--review-agent--business-templates--G01--README.md

- 职责：《G01｜师生共有业务审核模板原始 Markdown 存档》（3267 字节）：五份原件的归档说明——来源索引 `source-manifest.json`（:6，记录标准名称/版本/原始字节数/SHA-256/Git Blob SHA「供后续机器校验」）、归档记录（:23，2026-10-11 从原始 Markdown 资料库归档、Git Blob SHA 与源一致）、校验命令（:28 `sha256sum …/originals/*.md`）、D3-MD-Q1 Agent A/B 归档外链（:34-:35）。
- 消费：人类/Agent 归档说明；它消费 `source-manifest.json`（:6）与五份 originals（:23/:28）；被引用：无外部引用（全树检索证实）。
- 来源：归档说明产出（2026-10-11）；sourceBlob `87b7570c446c0d714e3ec5cdbb58155e584cd094`；sourceSha256 `5085549f1d027a5dccab9fbf6e632be3d5aa5c800393b401cd7bfb6fbe1812e4`。
- 打包：不进产物（electron-builder.yml:44-68/:70-122 无 docs/）。
- 影响：删除→归档口径/校验命令/外链丢失，五原件失去索引说明；对构建/运行无影响。
- 验证：核 :1/:6/:23/:28/:34-:35 与引用文件存在、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/引用=**证实**；外链可达性=**未知**。

## docs--design--review-agent--business-templates--G01--originals--G01_political_review_template_v0.3.md

- 职责：G01 政审材料程序审核原始模板（80810 字节）：《政审材料程序审核｜完整模板需求与规则测试稿 v0.3》（:1），G01-P 用例的业务源。
- 消费：`acceptance/d4-g01-build/P/manifest.json` `businessSource.file='G01_political_review_template_v0.3.md'`（v0.3 + sha256 `542e73dd…` + gitBlobSha `5ebc919c…` 双哈希登记）；`business-templates/G01/README.md:23`（归档五件之一）。
- 来源：业务模板原件 v0.3（原始 Markdown 资料库归档，README:23）；sourceBlob `5ebc919c6630a3b81aaf6a1e6c28b1d37de3671c`；sourceSha256 `542e73ddc26e861e1bc1d454841dc6096299f1a991e944f59a487d84d97304ec`。
- 打包：不进产物（原件仅作构建输入源，运行时消费的是派生 workspace）。
- 影响：删除→P 用例业务源断档（businessSource 指向悬空、哈希不可复核）；对构建/运行无影响。
- 验证：核 :1 标题、P/manifest.json businessSource 双哈希可复算（README:28 命令）、hash 一致；NOT_RUN。
- 证实/推断/未知：业务源关系/双哈希登记=**证实**；模板内容正确性=**未知**（未逐规则审）。

## docs--design--review-agent--business-templates--G01--originals--G01_special_proof_seal_review_template_v1.4.md

- 职责：G01 专项证明与用印审核原始模板（79026 字节）：《专项证明与用印审核｜完整审核模板（单文件 Markdown）v1.4》（:1），G01-S 用例的业务源。
- 消费：`acceptance/d4-g01-build/S/manifest.json` `businessSource.file='G01_special_proof_seal_review_template_v1.4.md'`（v1.4 + sha256 `bb9b11b7…` + gitBlobSha `6b931fb5…`）；`README.md:23`。
- 来源：业务模板原件 v1.4（归档）；sourceBlob `6b931fb5f7d00482cb551f58d4fbb9349bd33cd2`；sourceSha256 `bb9b11b7963e0cd7661afe12bb3a23eec1655153de2d122ffb59b26f10190c15`。
- 打包：不进产物。
- 影响：删除→S 用例业务源断档；对构建/运行无影响。
- 验证：核 :1、S/manifest.json 双哈希复算、hash 一致；NOT_RUN。
- 证实/推断/未知：业务源关系=**证实**；内容正确性=**未知**。

## docs--design--review-agent--business-templates--G01--originals--g01_archive_utilization_template_editor_spec_v1_5.md

- 职责：G01 档案利用申请审核原始模板（70413 字节）：《档案利用申请审核｜完整单模板规范 v1.5》（:1），G01-A 用例业务源；:260 自注「仅说明编辑器中的条件配置语义，不是目前已发布的 TemplateVersion JSON」；:619 引用 15 号模块化规范（M01—M16 候选模块契约）。
- 消费：`acceptance/d4-g01-build/A/manifest.json` `archivePath`（:13）与 `businessSource`（v1.5 双哈希）；`README.md:23`；A/workspace.json:925 内嵌原件行号定位（s13-p1 …L592）。
- 来源：业务模板原件 v1.5（归档）；sourceBlob `2f36f7de8eed196a1483e7410bf25575922117df`；sourceSha256 `65157e002dd4d1ccc08d32d341b4a1f7eacfc55d6a3c13a5da949aaf122f9785`。
- 打包：不进产物。
- 影响：删除→A 用例业务源断档、workspace 定位链失锚；对构建/运行无影响。
- 验证：核 :1/:260/:619、A/manifest.json:13 与 workspace:925 定位、hash 一致；NOT_RUN。
- 证实/推断/未知：业务源关系/自注/引用=**证实**；M01—M16 落地=**未知**。

## docs--design--review-agent--business-templates--G01--originals--g01_student_identity_complete_template_v1.7.md

- 职责：G01 学籍身份信息更正审核原始模板（61389 字节）：《学籍身份信息更正审核｜完整业务审核模板（独立 Markdown 版）》（:1），G01-I 用例业务源。
- 消费：`acceptance/d4-g01-build/I/manifest.json` `archivePath`（:13）；`README.md:23`。
- 来源：业务模板原件 v1.7（归档）；sourceBlob `aec737f471d4e648ab98a9243dcf4bc9939ce8a5`；sourceSha256 `52ae0cdc27a16bb46659cd43d3e78632c44d8b5ccc86a18559b263512f51f329`。
- 打包：不进产物。
- 影响：删除→I 用例业务源断档；对构建/运行无影响。
- 验证：核 :1、I/manifest.json:13、hash 一致；NOT_RUN。
- 证实/推断/未知：业务源关系=**证实**；内容正确性=**未知**。

## docs--design--review-agent--business-templates--G01--originals--special_campus_card_template_v1.4.md

- 职责：G01 特殊校园卡资格审核原始模板（57844 字节）：《特殊校园卡资格审核｜统一业务审核模板（v1.4，纯 Markdown 完整稿）》（:1），G01-C 用例业务源。
- 消费：`acceptance/d4-g01-build/C/manifest.json` `archivePath`（:13）与 `businessSource`（v1.4 双哈希）；`README.md:23`。
- 来源：业务模板原件 v1.4（归档）；sourceBlob `c76427d092e455a5a353ff25aade7ced4de189e5`；sourceSha256 `fa409cfa30ad0f0c624784f9beab4799cc1e31bbcf3d118c0e41a67deba8937f`。
- 打包：不进产物。
- 影响：删除→C 用例业务源断档；对构建/运行无影响。
- 验证：核 :1、C/manifest.json:13 与双哈希、hash 一致；NOT_RUN。
- 证实/推断/未知：业务源关系=**证实**；内容正确性=**未知**。

## docs--design--review-agent--business-templates--G01--source-manifest.json

- 职责：G01 原件来源索引（2642 字节；键 `schemaVersion/group/displayName/archiveDate/intent/templateCount/templates`）：逐原件登记标准名称/版本/字节数/SHA-256/Git Blob SHA，「供后续机器校验」（README:6）。
- 消费：`business-templates/G01/README.md:6`（来源索引入口）；机器校验入口（README:23 所述哈希核对）；与 d4-g01 各 manifest 的 `businessSource` 双哈希互为印证。
- 来源：归档索引产出（2026-10-11）；sourceBlob `cf9f79e0d4500307154a8948a16840a74e925cc4`；sourceSha256 `2bb49b81c2538658798acf0786da0e504cff8b93e3c564e49de846dacf357ad9`。
- 打包：不进产物。
- 影响：删除→五原件失去机器可核哈希索引，README:6 引用悬空；对构建/运行无影响。
- 验证：JSON 键齐全、`templates` 哈希与五原件逐一复算一致、hash 一致；NOT_RUN。
- 证实/推断/未知：结构/消费=**证实**；逐条哈希比对=**未逐项执行**（本轮仅抽样核 P/S 双哈希登记形态）。

## docs--design--review-agent--fixtures--d05-agent-edit.json

- 职责：D0.5 试点夹具——Agent 编辑操作序列（813 字节；键 `kind/expectedRevision/operations`）。
- 消费：`apps/electron/src/main/lib/review/semantic-module-demo.test.ts:258`——`execute(join(fixtureDir,'d05-agent-edit.json'))`（语义模块演示测试）。
- 来源：D0.5 试点夹具（家族六）；sourceBlob `755ab4169eee6c025db0039134f2931cdc65d6fd`；sourceSha256 `0ff42ef4654e0c5a5cdfccaf6bb8c1382c2696279d5d5c7673fb7e60b6f17110`。
- 打包：不进产物（copy-resources.ts:21-27 仅拷 d4-g 条目；`fixtures/` 不在清单，证实）。
- 影响：删除→semantic-module-demo.test 读夹具失败（测试红）；产品运行无影响。
- 验证：跑 semantic-module-demo.test（本轮 NOT_RUN）、JSON 键齐全、hash 一致。
- 证实/推断/未知：测试消费=**证实**（实读 :258）；operations 语义=**未逐项展开**。

## docs--design--review-agent--fixtures--d05-preview-archive.json

- 职责：D0.5 试点夹具——档案情景预览输入（74 字节；键 `kind/templateId/version`）。
- 消费：`semantic-module-demo.test.ts:256`——`execute(join(fixtureDir,'d05-preview-archive.json'))`。
- 来源：D0.5 试点夹具；sourceBlob `b2b2724b734a50e2999d6f9371dde896ae753f73`；sourceSha256 `2ee8e9231feb5cc00726dcd4c2bed0603d690b1611ae7a4bb229dc265db417d6`。
- 打包：不进产物。
- 影响：删除→预览演示测试缺输入（测试红）。
- 验证：跑 semantic-module-demo.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**。

## docs--design--review-agent--fixtures--d05-preview-card-family.json

- 职责：D0.5 试点夹具——卡族情景预览输入（103 字节；键 `kind/templateId/version/scenario`）。
- 消费：`semantic-module-demo.test.ts:253`——`execute(join(fixtureDir,'d05-preview-card-family.json'))`。
- 来源：D0.5 试点夹具；sourceBlob `d2ae275b05c43c45383905deae040a98427fdc7c`；sourceSha256 `52034ea848e0f347414e6690a83ade64ae490b53b0301b271500919013d57888`。
- 打包：不进产物。
- 影响：删除→卡族预览测试缺输入（测试红）。
- 验证：跑 semantic-module-demo.test（NOT_RUN）、hash 一致。
- 证实/推断/未知：测试消费=**证实**。

## docs--design--review-agent--fixtures--d05-synthetic-state.json

- 职责：D0.5 合成演示状态（8044 字节；键 `revision/modules/templates`）：语义模块演示的合成工作区状态。
- 消费：①`semantic-module-demo.test.ts:252`——`copyFileSync(join(fixtureDir,'d05-synthetic-state.json'), statePath)`（作为初始状态落盘）；②`review-d2-runtime.test.ts:28`——`readFileSync(.../fixtures/d05-synthetic-state.json')` 作为 `DemoState` 载入。
- 来源：D0.5 试点夹具；sourceBlob `0e2e0314f4f18eec6fa02d8c933629db5e187d57`；sourceSha256 `a55128afed622ba33931b1ee516b6cb8c0e0be567ea8a803c59a3ee14b89e78c`。
- 打包：不进产物。
- 影响：删除→两个测试文件的初始状态缺失（测试红）；产品运行无影响。
- 验证：跑两测试（NOT_RUN）、JSON 3 键、hash 一致。
- 证实/推断/未知：双测试消费=**证实**（实读 :252 与 :28）；合成状态真实性=**未知**（合成语义）。

## docs--design--review-agent--fixtures--d1-authoring-text-v1.json

- 职责：D1 作者态文本模板夹具（1813 字节；键 `schemaVersion/workspaceId/revision/definitions/sources/sourceBindings`——`ReviewAuthoringWorkspaceV1` 形态）。
- 消费：`docs/design/review-agent/18-d1-authoring-contract-and-runtime-mapping-v1.md:49`（`DOC=…fixtures/d1-authoring-text-v1.json` 命令示例）与 `:97`（`review-authoring-v1.ts candidate-save …/d1-authoring-text-v1.json text-review 1` CLI 输入）。
- 来源：D1 试点夹具；sourceBlob `f74f75735e567f489fdb8c3098a59492cff1d779`；sourceSha256 `7e9b096ce972c3229da0cefcfc35be0ed5c3500251bf6faa151a55ac81e844e8`。
- 打包：不进产物。
- 影响：删除→D1 CLI 示例断档（18 号文档 :49/:97 失效）；产品运行无影响。
- 验证：JSON 6 键、按 18 号 :51-:65 命令可复现（本轮 NOT_RUN）、hash 一致。
- 证实/推断/未知：文档消费=**证实**；CLI 实际可跑性=**未知**（NOT_RUN）。

## docs--design--review-agent--fixtures--d2-selection-archive.json

- 职责：D2 情景选择夹具——档案操作对象引用（644 字节；键 `templateId/version/targets`）。
- 消费：`docs/design/review-agent/19-d2-scenario-scoped-pi-runtime.md:34`（四件选择夹具之一）与 `:40/:46/:51/:57`（四组 CLI 示例的固定参数）。
- 来源：D2 试点夹具；sourceBlob `3b3369947726d9969d0559fbba6e30cb2f0bc9fa`；sourceSha256 `bf808780df62bf6b8aa1c746baed56d4b7ddac156bc2cc7231ea2afa261a2302`。
- 打包：不进产物。
- 影响：删除→D2 四组 CLI 示例全部失效；产品运行无影响。
- 验证：JSON 3 键、按 19 号命令可复现（NOT_RUN）、hash 一致。
- 证实/推断/未知：文档消费=**证实**；试点结论=**未知**。

## docs--design--review-agent--fixtures--d2-selection-family.json

- 职责：D2 情景选择夹具——卡族情景对象引用（314 字节；键 `templateId/version/scenario/scenarioObjectKey/targets`）。
- 消费：`19-d2-scenario-scoped-pi-runtime.md:34`（选择夹具名单）。
- 来源：D2 试点夹具；sourceBlob `fafa11be7a189b517a92e740a6892373c35caa93`；sourceSha256 `154b6038dd457951c4c383c322b5569cbeb0d8767a90479f281a9933c0c5ff14`。
- 打包：不进产物。
- 影响：删除→D2 卡族情景试点缺输入；产品运行无影响。
- 验证：JSON 5 键、hash 一致；NOT_RUN。
- 证实/推断/未知：文档消费=**证实**。

## docs--design--review-agent--fixtures--d2-selection-temporary.json

- 职责：D2 情景选择夹具——临时对象引用（348 字节；键 `templateId/version/scenario/scenarioObjectKey/targets`）。
- 消费：`19-d2-scenario-scoped-pi-runtime.md:34`（选择夹具名单）。
- 来源：D2 试点夹具；sourceBlob `46283c6c5572184183b852d3c3ec3873dafd679f`；sourceSha256 `78e02fbc42e91f48e212036dbe5e89333bacc8e5568ab16c77f4e1b9245eff9f`。
- 打包：不进产物。
- 影响：删除→D2 临时对象试点缺输入；产品运行无影响。
- 验证：JSON 5 键、hash 一致；NOT_RUN。
- 证实/推断/未知：文档消费=**证实**。

## docs--design--review-agent--fixtures--d2-selection-text.json

- 职责：D2 情景选择夹具——文本对象引用（67 字节；键 `templateId/version/targets`，最小夹具）。
- 消费：`19-d2-scenario-scoped-pi-runtime.md:34`（选择夹具名单）。
- 来源：D2 试点夹具；sourceBlob `354538a59f7772f0a7011a80b69340b531e1cfe2`；sourceSha256 `ee0e1eb07e0fc7d24d3cb7dceac37095b488522c64db6c5f231f42a677977ee0`。
- 打包：不进产物。
- 影响：删除→D2 文本情景试点缺输入；产品运行无影响。
- 验证：JSON 3 键、hash 一致；NOT_RUN。
- 证实/推断/未知：文档消费=**证实**。

## docs--design--review-agent--fixtures--d2-workspace-synthetic.json

- 职责：D2 合成工作区夹具（10428 字节；键 `schemaVersion/workspaceId/revision/definitions/sources/sourceBindings`）：含原始模块、情景、来源绑定（19 号 :33 自述「D1 workspace」形态）。
- 消费：`19-d2-scenario-scoped-pi-runtime.md:33/:39/:45/:50/:56`——四组 D2 预审 CLI（预览/候选壳/技术预审案卷/attach 修复）的固定 workspace 参数。
- 来源：D2 试点夹具；sourceBlob `a9c50f449d68ba1651b51e8ec2e0a24536e503f8`；sourceSha256 `4a9d2af729cbe894b10a7de7180710da48a9373c464b9bd723d2e895cf402abd`。
- 打包：不进产物。
- 影响：删除→D2 全部 CLI 示例失效、情景绑定试点断档；产品运行无影响。
- 验证：JSON 6 键、按 19 号命令可复现（NOT_RUN）、hash 一致。
- 证实/推断/未知：文档消费=**证实**；试点可复现性=**未知**（NOT_RUN）。

