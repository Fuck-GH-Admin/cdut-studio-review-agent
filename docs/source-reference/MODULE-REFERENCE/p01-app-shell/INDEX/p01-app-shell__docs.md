# p01-app-shell__docs 索引（仓根 docs/ 设计、计划与说明文档）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__docs`（owner `p01-app-shell`，family `docs`）共 33 个文件（31 docs + 2 resource），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：仓根 `docs/` 是设计/计划/验收文档库（与 `docs/design/review-agent/` 审核专区专库分组另计）。全部不进安装包（`electron-builder.yml:44-68` `files:` 仅 dist/package.json/node_modules、`:70-122` `extraResources:` 清单无 `docs/`；教程包只取 `tutorial/tutorial-v2.md` :77-78）。消费通道均为文档间引用或代码注释中的设计指路（`file:line` 逐条落锚）；无运行时加载。下文「打包」行以此共同结论为准，逐文件复述要点。

## docs--Advanced--Computational--Linguistics--and--Neuro-Symbolic--Architectures--in--EdTech--Cognitive--Engines--2024--2026--Breakthroughs.md

- 职责：英文调研报告（193 行）《Advanced Computational Linguistics and Neuro-Symbolic Architectures in EdTech Cognitive Engines: 2024–2026 Breakthroughs》（:1），教育技术认知引擎方向 2024–2026 进展综述。
- 消费：全树检索文件名/标题关键词除自身外零命中（证实）；人类读者（研究参考资料）。
- 来源：调研产出（团队/研究整理）；`change=unchanged_since_093f`。sourceBlob `4c0662f1a28556314c6f373d6328b7f8a9eeb416`；sourceSha256 `201ffa7465a1e7d174847a8ed4353337cf09fd4d761f09d27d9b5f85f8d53781`。
- 打包：不进产物（electron-builder.yml:44-68/:70-122 无 docs/）。
- 影响：删除丢失调研综述；对构建/运行无影响。
- 验证：核 :1 标题、行数 193、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：零引用=**证实**（全树检索）；报告结论准确性=**未知**（未对外部文献核实）。

## docs--assets--profer-banner-en.svg

- 职责：Profer 英文版品牌横幅 SVG（64 行 / 4206 字节）。
- 消费：全树检索 `profer-banner` 除自身目录外零命中（证实）；推测供官网/宣传页使用（未见仓内引用，推断），仓内消费者=未知。
- 来源：品牌横幅设计资产（英文版）；`change=unchanged_since_093f`。sourceBlob `0053c76d251b4f6f2166022b27daa583a3984812`；sourceSha256 `177b0d0ef98237c13f612ef7a7c33e0166428f57c3c6950712d5b00b444f6d59`。
- 打包：不进产物（无导入、无构建配置引用）。
- 影响：删除对构建/运行无影响；损失英文横幅素材。
- 验证：SVG 根元素可解析、hash 一致；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；对外用途=**推断**；设计来源=**未知**。

## docs--assets--profer-banner.svg

- 职责：Profer 中文版品牌横幅 SVG（64 行 / 4239 字节）。
- 消费：全树检索 `profer-banner` 零命中（证实）；仓内消费者=未知（同英文版，推测对外物料）。
- 来源：品牌横幅设计资产（中文版）；`change=unchanged_since_093f`。sourceBlob `dd2713fdba118a16987423b3cae85d7971f272fc`；sourceSha256 `abcbd4e0de0f6c3f0d43cb44389feb22558a6e67e40ce1eef2e3ee8e068f3926`。
- 打包：不进产物。
- 影响：删除对构建/运行无影响；损失中文横幅素材。
- 验证：SVG 可解析、hash 一致；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；对外用途=**推断**。

## docs--design--2026-07-22-project-start-page-design.md

- 职责：设计文档《项目导航与隐藏 Draft Agent 会话》（2026-07-22，49 行）：项目启动页导航与 Draft Agent 会话隐藏行为设计。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者（设计留档）。
- 来源：产品设计产出（2026-07-22）；`change=unchanged_since_093f`。sourceBlob `a7f80cb6dc49d3609d6661697b1d7b33228f8505`；sourceSha256 `17d2689b47d2e14c61c4f6ed719330201a6f83716e55c3b5397d75d7b684b234`。
- 打包：不进产物。
- 影响：删除丢失启动页/Draft 会话设计依据；对构建/运行无影响。
- 验证：核 :1 标题、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；设计与现行实现一致性=**未知**。

## docs--design--2026-10-01-cdut-studio-content-review-demo.md

- 职责：内容审核专区产品设计《CDUT Studio 内容审核专区：完整产品设计与现状分析》（188 行）：:3 自述审核对象=学生综测申报与活动申请等「依据—申请—证明—审批」材料、文件导入为案卷来源、三栏体验；声明「不规定开发顺序」。代码契约对齐点见 `packages/shared/src/types/review.ts:4`（§9 四个内部契约）。
- 消费：①`packages/shared/src/types/review.ts:4`（「对应设计文档……（§9 四个内部契约）」）；②`apps/electron/src/main/lib/review/report-service.ts:7`（「设计对齐：…§6」）；③`work/reports/2026-10-02-acceptance-report.md:3`（验收设计依据）；④`docs/design/review-agent/00-overview.md:43`（导航引用）；⑤`docs/plans/2026-10-02-content-review-demo-implementation.md:3`（上游设计）。
- 来源：产品设计产出（2026-10-01；:3 附 2026-10-02 状态注）；`change=unchanged_since_093f`。sourceBlob `af0436fac629230b0b394789e1dd2f6c5b0e8adc`；sourceSha256 `8c0c1528c8d29c1de0783dacdcdc95d707003e300be8baa8e20f615d55bbe8f3`。
- 打包：不进产物。
- 影响：删除→审核专区设计依据断档，上述 5 处引用悬空（含 2 处代码注释指路）；对构建/运行无影响。
- 验证：核 :1/:3 与 5 处引用行存在、hash 一致；NOT_RUN。
- 证实/推断/未知：引用面=**证实**（逐条 grep）；设计与代码一致性=**未知**（未逐条比对 §6/§9）。

## docs--plans--2026-06-02-im-model-switch-design.md

- 职责：设计文档《IM 模型切换能力设计（飞书 / 钉钉 / 微信）》（102 行）：三大 IM 渠道的模型切换能力设计，:4 记分支 `feat-im-model-switch`。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者。
- 来源：IM 渠道设计产出（2026-06-02）；`change=unchanged_since_093f`。sourceBlob `cd5fb34b649d10b0326b07f5157dd2b2c6761e26`；sourceSha256 `2589034f7b688bd00b3a28d825dd9090991551e5321cb31e73fc838a2a498a8b`。
- 打包：不进产物。
- 影响：删除丢失 IM 模型切换设计；对构建/运行无影响。
- 验证：核 :1/:4、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；实现状态=**未知**。

## docs--plans--2026-08-07-tablet-settings-design.md

- 职责：设计文档《平板版设置页面设计（2026-08-07）》（94 行）；:6 注「历史设计，当前远程服务说明见 `docs/profer-remote-service.md`」，平板线已归档（`archive/tablet-line-pre-reset-20260911`，:6）。
- 消费：`docs/profer-remote-service.md:5`——「历史设计见 `docs/plans/2026-08-07-tablet-settings-design.md`」（实读证实）；无代码引用。
- 来源：平板线设计产出（2026-08-07，已标注为历史）；`change=unchanged_since_093f`。sourceBlob `48b5fd7c5c2b6f1ee41380979a5251cab4018f9b`；sourceSha256 `8dc00dff82956e557ecf319b7be4ca7134df57dc538fc89605f808be61bec3bb`。
- 打包：不进产物。
- 影响：删除→profer-remote-service.md:5 引用悬空、平板线历史丢失；对构建/运行无影响。
- 验证：核 :1/:6 与 profer-remote-service.md:5、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；平板线现状=**未知**。

## docs--plans--2026-08-16-agent-preset-phase-b-plan.md

- 职责：《Phase B 计划 — Agent Preset 与 Pi Harness 深化》（72 行 / 13015 字节）：Agent Preset 与 Pi Harness 深化任务清单。
- 消费：`docs/plans/2026-08-16-session-handoff.md:5`（「关联文档…以它为准」）、`:23`（交接清单「新增:Phase B 计划」）引用（实读证实）；无代码引用。
- 来源：Phase B 规划产出（2026-08-16）；`change=unchanged_since_093f`。sourceBlob `5f816d74b6f34f593db194d4c3692d1aa6eb6b61`；sourceSha256 `bbbdd01dba64136fd4e6addda918cfb963d3c0db7c8647f07eab15ca7c255588`。
- 打包：不进产物。
- 影响：删除→session-handoff 两处引用悬空、Phase B 清单丢失；对构建/运行无影响。
- 验证：核 :1 与 session-handoff.md:5/:23、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；任务完成度=**未知**。

## docs--plans--2026-08-16-session-handoff.md

- 职责：《会话交接快照(2026-08-16) — 新会话/子代理接手起点》（49 行）：会话交接记录（含关联文档表 :23）。
- 消费：全树检索文件名除自身外零命中（证实）；人类/Agent 接手起点文档。
- 来源：会话交接产出（2026-08-16）；`change=unchanged_since_093f`。sourceBlob `56e0375ff0cdf6fa09ec47af01362aebf8d6db1f`；sourceSha256 `03ff0fa43d2cc2fd0259375731906a13ab77c21dee5eea97cbc848186530f071`。
- 打包：不进产物。
- 影响：删除丢失 2026-08-16 交接上下文；对构建/运行无影响。
- 验证：核 :1/:5/:23、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；交接事项完成状态=**未知**。

## docs--plans--2026-08-20-agent-planning-todo-tools.md

- 职责：《Agent Planning Todo Tools Implementation Plan》（61 行）：Agent 规划/Todo 工具实现计划。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者。
- 来源：实现计划产出（2026-08-20）；`change=unchanged_since_093f`。sourceBlob `2c8b917f52e8d2a65269e17568048ba317a9db94`；sourceSha256 `bf83de10e7bd2c8f5b342985e9004fd4362cd8ed737aadf9f6d418e0b1ea45b3`。
- 打包：不进产物。
- 影响：删除丢失该实现计划；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；实现状态=**未知**。

## docs--plans--2026-08-24-student-pptx-design.md

- 职责：《Profer 学生 PPTX 生成系统设计》（315 行）：学生 PPTX 生成系统设计（含 `.context/deck-projects/<deck-id>/` 工作目录设计 :184）。
- 消费：`docs/plans/2026-08-24-student-pptx-implementation.md:135-136`（实施计划 Read/Copy 本设计）、`:157`（拷入 worktree）、`:178`（git add 记录）引用（实读证实）；无代码引用。
- 来源：PPTX 生成系统设计产出（2026-08-24）；`change=unchanged_since_093f`。sourceBlob `65363db87e3b9d0c6893220da1ff393c52659c6b`；sourceSha256 `3f30a6c21cf685c58b4836c2148c80575692e8b69be3d72bf00a2e2582c6aa53`。
- 打包：不进产物。
- 影响：删除→实施计划 4 处引用悬空、PPTX 系统设计断档；对构建/运行无影响。
- 验证：核 :1/:184 与 implementation:135-136/:157/:178、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计落地一致性=**未知**。

## docs--plans--2026-08-24-student-pptx-implementation.md

- 职责：《Profer 学生 PPTX 首个纵向版本实施计划》（1141 行 / 56KB）：v1 纵向版本的逐步实施命令单（worktree 建立 :156、验证脚本 `verify-student-pptx-fixture.ts` :909/:945/:968、验收文档 `2026-08-24-student-pptx-v1-acceptance.md` :988/:1033）。
- 消费：全树检索文件名除自身/同族文档外零命中（证实）；人类/Agent 执行手册。
- 来源：实施计划产出（2026-08-24）；`change=unchanged_since_093f`。sourceBlob `bf5cd7172a340ff6bf8e65712c528825edf64064`；sourceSha256 `478dc04b1357bef6e4684c66b179727b084e077c605cc740ad2a8fbfd8a11f37`。
- 打包：不进产物。
- 影响：删除丢失 PPTX v1 实施步骤（含命令与验收要求）；对构建/运行无影响。
- 验证：核 :1/:156/:909/:988、hash；NOT_RUN。
- 证实/推断/未知：零外部引用=**证实**；计划执行完成度=**未知**（提及的 acceptance 文档不在本 group 清单）。

## docs--plans--2026-08-24-student-pptx-v1-freeze.md

- 职责：《学生 PPTX v1 冻结说明》（62 行）：v1 冻结范围与验证命令记录（:57 worktree 路径）。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者。
- 来源：冻结说明产出（2026-08-24 后）；`change=unchanged_since_093f`。sourceBlob `f25e437ed8d146a90865f1177e8ecab8d7a0b02b`；sourceSha256 `6c85a002d17b59ecbdb1df4fb5e991add8b16ef03c60942218d093f3141767ee`。
- 打包：不进产物。
- 影响：删除丢失 v1 冻结口径；对构建/运行无影响。
- 验证：核 :1/:57、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；冻结范围执行情况=**未知**。

## docs--plans--2026-08-27-cross-platform-process-monitoring.md

- 职责：《Cross-Platform Process Monitoring Implementation Plan》（157 行）：跨平台进程监控实现计划。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者。
- 来源：实现计划产出（2026-08-27）；`change=unchanged_since_093f`。sourceBlob `b1f5214a555d3db2db1a5b8624072c928b910437`；sourceSha256 `cce38ee02b15823d13316f831b95b571a03e433cd1326a392d826e7ca5fca7e5`。
- 打包：不进产物。
- 影响：删除丢失该实现计划；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；实现状态=**未知**。

## docs--plans--2026-08-30-ollama-local-channel.md

- 职责：《Ollama 本地渠道 Implementation Plan》（101 行）：Ollama 本地模型渠道接入计划；:95 自记「Modify: 本文件」的过程记录。
- 消费：全树检索文件名除自身（:95 自引用）外零命中（证实）；人类读者。
- 来源：实现计划产出（2026-08-30）；`change=unchanged_since_093f`。sourceBlob `de116c1a73eb4953673069e471dde474a9cfc997`；sourceSha256 `2401d70b3959ba274b13ba433d8460e0549c9eb8b0febe763344698067e7466f`。
- 打包：不进产物。
- 影响：删除丢失 Ollama 渠道计划；对构建/运行无影响。
- 验证：核 :1/:95、hash；NOT_RUN。
- 证实/推断/未知：零外部引用=**证实**；实现状态=**未知**。

## docs--plans--2026-09-03-agent-preview-design.md

- 职责：《Agent 文件视觉预览设计》（175 行）：Agent 文件视觉预览功能设计。
- 消费：`docs/plans/2026-09-03-agent-preview-implementation.md:341`——「Create: `docs/plans/2026-09-03-agent-preview-design.md`（已完成）」（实读证实）；无代码引用。
- 来源：功能设计产出（2026-09-03）；`change=unchanged_since_093f`。sourceBlob `82568f049a26e0b672d1de928fda020a10247b3c`；sourceSha256 `21a2e8c31843bf37f8d7d38fb22eb5a6a70be782a4bca0d8a1e19841f899578b`。
- 打包：不进产物。
- 影响：删除→implementation:341 引用悬空、预览设计断档；对构建/运行无影响。
- 验证：核 :1 与 implementation:341、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计与现行 preview 代码一致性=**未知**。

## docs--plans--2026-09-03-agent-preview-implementation.md

- 职责：《Agent 文件视觉预览 Implementation Plan》（405 行）：预览功能实现计划（:341 记设计文档创建）。
- 消费：全树检索文件名除自身外零命中（证实）；人类/Agent 执行手册。
- 来源：实现计划产出（2026-09-03）；`change=unchanged_since_093f`。sourceBlob `42c7550db867c44c37f243e762579c0aa42e7edf`；sourceSha256 `fe2de3e142699132d42d301a60240ba8dec2c973d6aafc3b30de1a46ced6a4c7`。
- 打包：不进产物。
- 影响：删除丢失预览实现步骤；对构建/运行无影响。
- 验证：核 :1/:341、hash；NOT_RUN。
- 证实/推断/未知：零外部引用=**证实**；执行完成度=**未知**。

## docs--plans--2026-09-05-capability-gating-unification.md

- 职责：《Capability Gating Unification Implementation Plan》（121 行）：能力门禁统一化实现计划。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者。
- 来源：实现计划产出（2026-09-05）；`change=unchanged_since_093f`。sourceBlob `a3ded33592206906700b8346bd3cd3c014d5b5c3`；sourceSha256 `c43d9d413f83be952f397cc4a7bb631c46a408f2845b5c92b143b4cef4dbf153`。
- 打包：不进产物。
- 影响：删除丢失门禁统一计划；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；实现状态=**未知**。

## docs--plans--2026-09-07-xai-grok-adaptation-design.md

- 职责：《Profer xAI / Grok 适配设计》（311 行）：xAI/Grok 模型渠道适配设计。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者。
- 来源：渠道适配设计产出（2026-09-07）；`change=unchanged_since_093f`。sourceBlob `d9b8a82cd8c03f75a8002c67a625a1edae280c02`；sourceSha256 `1153b826db98a836c45058e9cae3a8944cdd7eb1b7f7454280f6bcd0fe644f7e`。
- 打包：不进产物。
- 影响：删除丢失 Grok 适配设计；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；与现行渠道实现一致性=**未知**。

## docs--plans--2026-09-27-profer-agent-fabric-design.md

- 职责：《Profer Agent Fabric 设计》（827 行 / 26.9KB）：Agent Fabric（子代理协作织构）整体设计。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者（注意 `packages/agent-fabric` 为独立包，但无代码注释引用本设计文档）。
- 来源：架构设计产出（2026-09-27）；`change=unchanged_since_093f`。sourceBlob `6ea5083ff4e5925f9395578e6e6b5ae4483db286`；sourceSha256 `0600ac421fe437747928ad7a75848ca66527fb0223af590c14393ced6dded3ba`。
- 打包：不进产物。
- 影响：删除丢失 Agent Fabric 设计依据；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；设计与 `packages/agent-fabric` 实现一致性=**未知**（未比对）。

## docs--plans--2026-09-28-settings-subdivision-plan.md

- 职责：《Profer 设置页细分规划：拆分「使用偏好」》（114 行）：设置页细分重构规划。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者。
- 来源：产品规划产出（2026-09-28）；`change=unchanged_since_093f`。sourceBlob `ebf2d1e5cdb9e1f97575f708b371cf770f0d6b30`；sourceSha256 `89e93f87b8c8be382972a065c27ad2eafe756f4a836259b5f37df15b21415fe7`。
- 打包：不进产物。
- 影响：删除丢失设置页细分规划；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；执行状态=**未知**。

## docs--plans--2026-10-02-content-review-demo-implementation.md

- 职责：《内容审核专区 Demo 实施计划与决策记录》（107 行）：:3 自述「状态：已完成（T1-T10 全部交付；后续通用化升级见 `docs/plans/2026-10-02-content-review-generalization.md`）」，含 D 系列决策（D2/D3/D5/D8 被代码引用）。
- 消费：①`packages/shared/src/types/review.ts:5`（「实施决策：…（D2/D3/D5）」）；②`apps/electron/src/renderer/atoms/review-atoms.ts:4`（「设计约定（…D8）」）；③`apps/electron/src/main/lib/review/review-ipc.ts:11`（「设计决策（…D2）」）；④`work/decision-log/2026-10-02-decision-log.md:4`（「正式决策档案见…」）；⑤`work/reports/2026-10-02-acceptance-report.md:4`（实施决策档案）；⑥`docs/design/2026-10-01-cdut-studio-content-review-demo.md:3`（状态注）。
- 来源：实施决策档案（2026-10-02）；`change=unchanged_since_093f`。sourceBlob `a23dcfd30c3f0b25d8a99cb6e76cb52010743744`；sourceSha256 `4c6db6048f25669b6eae906337ced62c6f8dc76ddba472511dfb2c90b2e10d86`。
- 打包：不进产物。
- 影响：删除→审核专区 6 处引用悬空（含 3 处代码注释决策指路）；对构建/运行无影响。
- 验证：核 :3 与 6 处引用行、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；D 系列决策与代码一致性=**未知**（未逐条比对）。

## docs--plans--2026-10-02-content-review-generalization.md

- 职责：《内容审核专区升级：从「综测专用」到「通用文件审批引擎」》（75 行）：通用化升级评估（格式墙/领域墙/入口墙「三堵墙」定性与 P0/P1/P2 改造范围）。
- 消费：①`work/decision-log/2026-10-02-decision-log.md:36`（决策 33 引用评估文档）；②`docs/plans/2026-10-02-content-review-demo-implementation.md:3`（后续升级指向）；③`docs/design/2026-10-01-cdut-studio-content-review-demo.md:3`（状态注）；④`docs/design/review-agent/00-overview.md:44`（「10 月 2 日领域化计划……是当时实施记录」）。
- 来源：升级评估产出（2026-10-02）；`change=unchanged_since_093f`。sourceBlob `1790dfd6c2e605cf559638225870c743da08ce91`；sourceSha256 `5bddc50ccf30c36b542104facc9861ffbfe391f2410adf1af147552511d7ff0b`。
- 打包：不进产物。
- 影响：删除→4 处引用悬空、通用化改造范围记录丢失；对构建/运行无影响。
- 验证：核 :1 与 4 处引用、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；P0/P1/P2 执行状态=**未知**。

## docs--plans--2026-10-08-yanhu-express-ruishu-frameset-remediation-plan.md

- 职责：《「智联万站」多层框架瑞数防护白屏根治与纯文本 Agent 数据底座实施方案》（131 行）：内嵌浏览器瑞数防护白屏问题的根治方案；:3 自记「文件归档：本文件」。
- 消费：全树检索文件名除自身（:3 自归档行）外零命中（证实）；人类/Agent 执行手册。
- 来源：修复实施方案产出（2026-10-08）；`change=unchanged_since_093f`。sourceBlob `28ee1252a59b40efbdc0038cc80e01bcb56ac87b`；sourceSha256 `c9ddb327d21663a4afda7da47667bc5c8e9693e22ae0c867a3bee405730f5415`。
- 打包：不进产物。
- 影响：删除丢失瑞数白屏根治方案；对构建/运行无影响。
- 验证：核 :1/:3、hash；NOT_RUN。
- 证实/推断/未知：零外部引用=**证实**；方案执行状态=**未知**。

## docs--plans--2026-10-09-yanhu-datepicker-speed-optimization-guide.md

- 职责：《「智联万站」日期时间选择器根治与探索速度全链路提速实施方案》（304 行）：日期时间控件问题根治与提速方案。
- 消费：全树检索文件名除自身外零命中（证实）；人类/Agent 执行手册。
- 来源：修复实施方案产出（2026-10-09）；`change=unchanged_since_093f`。sourceBlob `bad2d52efc358e7736926864d06aa13f9a853d1c`；sourceSha256 `4c2c399965fd1da6cfab45aaf7025544b8dcf3b82712e25c323c992ed1fc3210`。
- 打包：不进产物。
- 影响：删除丢失该提速方案；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；执行状态=**未知**。

## docs--plans--2026-10-09-yanhu-deterministic-synchronization-and-causal-engine-plan.md

- 职责：《砚小龙确定性同步与高保真因果交互引擎实施方案》（116 行）：桌宠/自动化确定性同步与因果引擎方案。
- 消费：全树检索文件名除自身外零命中（证实）；人类/Agent 执行手册。
- 来源：实施方案产出（2026-10-09）；`change=unchanged_since_093f`。sourceBlob `c76ca6dcd640c2cc1e63315a3e52dbd64dc5adf5`；sourceSha256 `a04a4797aca02eb5e701d6c36ec06222e6e1dd19c225101c4fd2d15714341164`。
- 打包：不进产物。
- 影响：删除丢失该方案；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；执行状态=**未知**。

## docs--plans--2026-10-09-yanhu-select-leave-type-fix-guide.md

- 职责：《彻底根治「智联万站」选中事假/病假失败及同向表单异常技术实施与修改指导规范》（477 行）：表单选择失败根治规范。
- 消费：全树检索文件名除自身外零命中（证实）；人类/Agent 执行手册。
- 来源：修复规范产出（2026-10-09）；`change=unchanged_since_093f`。sourceBlob `f24fef1f9b06349139a06ed21957966659565204`；sourceSha256 `35c231b01bffcd6ab2b8447fbf9693dcc68d4f9b4b631deea0bb24c069c6cac6`。
- 打包：不进产物。
- 影响：删除丢失该规范；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；执行状态=**未知**。

## docs--plans--2026-10-09-yanhu-universal-date-and-speed-root-cause-guide.md

- 职责：《「智联万站」日期时间控件通用根治与全链路极致提速实施方案》（322 行）：日期控件通用根治与提速方案（与 datepicker-speed 方案同族互补）。
- 消费：全树检索文件名除自身外零命中（证实）；人类/Agent 执行手册。
- 来源：实施方案产出（2026-10-09）；`change=unchanged_since_093f`。sourceBlob `12e25fc3254b597e0e709d2a0542ee0a917e578e`；sourceSha256 `35df18d8025e1009ee991236a514e8ca29a3981830026f3b61b01266506f3963`。
- 打包：不进产物。
- 影响：删除丢失该方案；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；执行状态=**未知**。

## docs--proactive-scheduler-monitor-design.md

- 职责：《Proma Proactive Center 设计文档》（1349 行 / 39.3KB，本 group 最大文档）：主动协作中心（Schedule/Monitor/Routine/Memory 插件化与 UI）的产品与工程设计。
- 消费：`release-notes/v0.9.39.md:50`——「Proactive Center 设计文档 — 新增 `docs/proactive-scheduler-monitor-design.md`，整理……产品和工程方向」（实读证实）；无代码引用。
- 来源：产品设计产出（随 v0.9.39 发布记录）；`change=unchanged_since_093f`。sourceBlob `1d4278599904942fe21b6345a97d6aaff0fbc195`；sourceSha256 `c4ad582200080564c647925c386c5a114b060f5227c0103600fd5aad31779278`。
- 打包：不进产物。
- 影响：删除→release-notes/v0.9.39.md:50 引用悬空、Proactive Center 设计断档；对构建/运行无影响。
- 验证：核 :1 与 release-notes/v0.9.39.md:50、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计落地状态=**未知**（automation-scheduler.ts 存在但无注释指回本文）。

## docs--profer-remote-service.md

- 职责：《Profer 远程服务（Remote Service）使用说明》（87 行）：桌面端远程服务使用说明；:5 自述「只描述仍然保留在桌面端的远程服务本身。历史设计见 `docs/plans/2026-08-07-tablet-settings-design.md`」。
- 消费：①`docs/plans/2026-08-07-tablet-settings-design.md:6`（「当前远程服务说明见 `docs/profer-remote-service.md`」）；②`work/reports/2026-10-04-ui-functional-acceptance.md:44`（「独立远程服务/平板文档不能作为现在必须补回的产品清单」）。
- 来源：使用说明产出（远程服务线）；`change=unchanged_since_093f`。sourceBlob `1935e1ecbf741991cc212306473b0d8839c813c5`；sourceSha256 `c67419dd325d17b55a5ee4bd65140fe493d4de21f6f060516575f3e89494ebe6`。
- 打包：不进产物。
- 影响：删除→两处引用悬空、远程服务使用说明丢失；对构建/运行无影响。
- 验证：核 :1/:5 与两处引用、hash；NOT_RUN。
- 证实/推断/未知：引用面=**证实**；服务现状=**未知**（报告 :44 提示该线可能已收缩）。

## docs--skill-routing.md

- 职责：《Skill 路由与门禁》（49 行）：技能路由与工具门禁的规则说明（对应代码 `apps/electron/src/main/lib/skill-routing.ts`/`skill-routing-rules.ts` 一族，实现存在但无注释回指本文）。
- 消费：全树检索文件名除自身外零命中（证实）；人类读者（对 skill-routing 代码族的说明文档）。
- 来源：规则说明产出（团队撰写）；`change=unchanged_since_093f`。sourceBlob `3084747a4ac883c4e226278fcb7993833d2240e2`；sourceSha256 `8b5bdf38c41a2ebab6cdd78143da11d60a850966a16cab1830aad60aff3d030d`。
- 打包：不进产物。
- 影响：删除丢失技能路由/门禁规则说明；对构建/运行无影响（无程序读取）。
- 验证：核 :1、与 `skill-routing-rules.ts:16`（pptx requiredToolGroups 门禁示例）对照阅读、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；文档与代码一致性=**未知**（未逐条比对）。

## docs--team-workspace-file-management.md

- 职责：《团队工作区文件管理》（40 行）：团队工作区文件管理约定说明。
- 消费：`work/reports/2026-10-04-ui-functional-acceptance.md:44`——「旧 `docs/team-workspace-file-management.md`、独立远程服务/平板文档不能作为现在必须补回的产品清单……」（被点名为「旧」文档）。
- 来源：团队约定说明产出；`change=unchanged_since_093f`。sourceBlob `c16e14b8cd9b4796f31a0d44183a0c5a0e6e0a42`；sourceSha256 `1f35a1e3b6ce0a07dc3140d08e451241843d79ffd9b8e5f1fa8103970dd5dff6`。
- 打包：不进产物。
- 影响：删除→报告 :44 引用悬空、工作区管理约定丢失；对构建/运行无影响。
- 验证：核 :1 与报告 :44、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；约定现行效力=**未知**（报告称「旧」文档）。

## docs--windows-execution-acceptance-guide.md

- 职责：《Profer Windows 执行能力验收指南》（340 行）：Windows 执行环境（Git Bash/BusyBox/WSL/PowerShell 自适应）验收指南；:297 内嵌「Profer Windows 执行能力验收报告」模板/记录。
- 消费：全树检索文件名除自身外零命中（证实）；人类执行验收手册。
- 来源：验收指南产出（团队撰写）；`change=unchanged_since_093f`。sourceBlob `e9c3aa99f0541695ff4fbab023ddef60227286bf`；sourceSha256 `506c40d8ab50945d2a6818a3aa90ec7b211f6976e69274a8323e576f77068e19`。
- 打包：不进产物。
- 影响：删除丢失 Windows 执行验收口径；对构建/运行无影响。
- 验证：核 :1/:297、hash；NOT_RUN（验收本身即运行类操作，本轮统一 NOT_RUN）。
- 证实/推断/未知：零引用=**证实**；验收是否已执行=**未知**。
