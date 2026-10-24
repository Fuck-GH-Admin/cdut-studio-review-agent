# p01-app-shell__work__reports 索引（work/reports 验收报告与证据包）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__work__reports`（owner `p01-app-shell`，family `work/reports`）共 72 个文件（21 docs + 51 resource），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。逐文件 hash 由封版流程按 `INDEX-SCOPE-LOCK.json` 机械列注入（与 MANIFEST.json 同源）。

家族背景：`work/reports/` 是 2026-10-02–10-05 内容审核专区工作期的验收/复查报告（12 篇）与其证据包（`assets/2026-10-04-g-stage-recheck/` 15 件、`assets/2026-10-04-n-stage-recheck/` 19 件、`assets/2026-10-04-ui-acceptance/` 26 件）。证据包结构惯例：步骤编号截图（`NN-*.png`）+ 目录索引（`index.md`/`README.md`）+ 机器探查（`service-probe*.json`、`ui-actions.jsonl`、`verification*.json|txt`）+ 复现脚本说明。全组不进安装包（`electron-builder.yml:44-68` `files:`、`:70-122` `extraResources:` 无 `work/`）。报告互链与对设计文档的引用逐条落锚；「打包」行均指此结论。

## work--reports--2026-10-02-acceptance-report.md

- 职责：《内容审核专区 Demo 验收报告》（140 行 / 14322 字节）：§一-§七 验收记录；:3「设计依据 `docs/design/2026-10-01-cdut-studio-content-review-demo.md`」；:4「实施决策档案 `docs/plans/2026-10-02-content-review-demo-implementation.md`；过程决策 `work/decision-log/2026-10-02-decision-log.md`（41 条；验收时为 28 条）」。
- 消费：`work/reports/2026-10-02-code-review.md:3`（F1-F15 修复去向指向本报告 §三/§四/§八·一）；人类/验收读者。
- 来源：验收产出（2026-10-02）；sourceBlob `9455b91f6b5020db8602d56de2c6d777d572a8c4`；sourceSha256 `6e768e0a4bf306acdc4125cf009eed0d9c9b40895a4e03b076370a3727962bfc`。
- 打包：不进产物（yml:44-68/:70-122 无 work/）。
- 影响：删除→Demo 验收记录断档、code-review:3 修复去向悬空；对构建/运行无影响。
- 验证：核 :1/:3/:4 与 code-review:3、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：结构/互链=**证实**；验收结论正确性=**未知**（未复跑验收）。

## work--reports--2026-10-02-code-review.md

- 职责：《CDUT-Studio「内容审核专区」代码审查报告》（201 行 / 31386 字节）：F1-F15 问题清单；:3 自注「时间点快照，发现内容不随后续修复改写……数字均为当时事实（现行 14/14/14、3 出口、56 用例）」。
- 消费：人类/评审读者；与 `2026-10-02-acceptance-report.md`（F1-F15 修复去向）及 `work/decision-log/2026-10-02-decision-log.md`（#27/#28/#38/#39）互链（:3）。
- 来源：代码审查产出（2026-10-02）；sourceBlob `b9ffe955ee40fb677316529ba15560316d6d62e7`；sourceSha256 `8b292ebdc895c941c763028e31335da48520085588d584a266a7d61b62acade1`。
- 打包：不进产物。
- 影响：删除→审查问题台账与修复去向链断档；对构建/运行无影响。
- 验证：核 :1/:3、互链文件存在、hash；NOT_RUN。
- 证实/推断/未知：结构/互链=**证实**；F1-F15 当前修复状态=**未知**。

## work--reports--2026-10-02-module-porting-guide.md

- 职责：《内容审核专区模块拆解与移植指南》（132 行 / 9669 字节）：模块拆解与移植步骤说明。
- 消费：人类/开发读者；全树检索除自身外零引用（证实）。
- 来源：移植指南产出（2026-10-02）；sourceBlob `fa6bad37da70843fb530259e90e3a8817c239f4a`；sourceSha256 `716580e1462846f9d78665bf1e429989015eb5214f20b9189717b7e2dfd42c46`。
- 打包：不进产物。
- 影响：删除→移植口径丢失；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；指南可执行性=**未知**。

## work--reports--2026-10-03-collaborator-sync-review.md

- 职责：《协作者更新同步与本地适配检查》（54 行 / 7041 字节）：协作者更新审查；:33 指「继续按 [设计差距 H01–H16](…01-research-and-gap.md#6…) 与 [M0 修复契约](…03-architecture-and-delivery.md#111…) 实施。全量单元测试通过不能代替这些业务验收」。
- 消费：人类/评审读者；它消费 `docs/design/review-agent/01-research-and-gap.md`（:33 两锚点）与 `03-architecture-and-delivery.md`。
- 来源：同步审查产出（2026-10-03）；sourceBlob `b38719e6f4e1d981cd64eae44df2c18310cb8d08`；sourceSha256 `9b5d7a70e039757e138313978aecc186d1c542b355ec153890d50943896f4555`。
- 打包：不进产物。
- 影响：删除→协作者同步审查记录丢失（H01-H16/M0 指路失效）；对构建/运行无影响。
- 验证：核 :1/:33 与两设计文档锚点、hash；NOT_RUN。
- 证实/推断/未知：结构/引用=**证实**；审查结论=**未知**。

## work--reports--2026-10-03-content-review-user-audit.md

- 职责：《内容审核专区：用户业务审查》（169 行 / 17134 字节）：用户视角业务问题审查（证明漏审/多依据/错误降级/串案/过期/引用问题等回归要求来源）。
- 消费：`docs/design/review-agent/00-overview.md:21`（「[10 月 3 日用户业务审查](…) 记录的证明、多依据、错误降级、串案、过期和引用问题继续作为回归要求」）；人类读者。
- 来源：用户业务审查产出（2026-10-03）；sourceBlob `e748e03e1dae692614492200e3d54b8712fa5ab7`；sourceSha256 `be23c995c91d7adca3e1c8c976a565089901c2d26de56e39959dae4685966e50`。
- 打包：不进产物。
- 影响：删除→回归要求基线丢失、00-overview:27 引用悬空；对构建/运行无影响。
- 验证：核 :1 与 00-overview:27、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；问题项当前状态=**未知**。

## work--reports--2026-10-04-g-stage-recheck.md

- 职责：《G01–G13 实施后的第二轮复查》（166 行 / 18447 字节）：G01–G13 实施后复查（案卷恢复/提交冲突/自有规则/补件回流/批次无执行入口等）；证据链：:33（index.md/service-probe.json/ui-results.json）、:62（03/04/07 截图）、:70（05/06/08 截图）。
- 消费：`docs/design/review-agent/00-overview.md:5`（「现在开工先读 [G01–G13 实际复查及下一轮顺序]…」）；人类读者；它消费 `assets/2026-10-04-g-stage-recheck/` 证据包（:33/:62/:70）。
- 来源：复查报告（2026-10-04）；sourceBlob `2cccec82542b910e46989c5397bb30437c3e136e`；sourceSha256 `2483d4eca23349962c8d7c1997ac9562bf74ae88782057496f459fd63035b77e`。
- 打包：不进产物。
- 影响：删除→G 复查结论与证据链断档（00-overview:5 指路失效）；对构建/运行无影响。
- 验证：核 :1/:33/:62/:70 与证据文件存在、hash；NOT_RUN。
- 证实/推断/未知：结构/证据链=**证实**；复查结论=**未复跑**。

## work--reports--2026-10-04-m1-m5-summary.md

- 职责：《通用审核 Agent M1–M5 实施汇总（本地批次，2026-10-04）》（50 行 / 4359 字节）：M1–M5 本地批次实施汇总。
- 消费：人类读者；全树检索除自身外零引用（证实）。
- 来源：实施汇总（2026-10-04）；sourceBlob `dfad361da5748562b65b7db3a9e52c23625aa713`；sourceSha256 `89a4180f495a184d1835f41ed9cb6bc99963e636576d19d4d3ce0f7c1a453d00`。
- 打包：不进产物。
- 影响：删除→M1-M5 汇总丢失；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；汇总准确性=**未知**。

## work--reports--2026-10-04-n-stage-recheck.md

- 职责：《N1–N7 补完后的实际复查》（216 行 / 21499 字节，本目录最大报告）：N1–N7 复查；:21 证据目录（assets/2026-10-04-n-stage-recheck/README.md，自注「未接真实模型、未完成生产安装包验收，不能据此声明模型准确率或目标机可用性」）、:120 评分探查（rating-outbox-probe.json）。
- 消费：`docs/design/review-agent/00-overview.md:5`（「[N1–N7 复查] 保留历史记录」）；`work/reports/2026-10-05-n1-n7-progress.md:3`（「…实际缺口及本轮修复见 [N 阶段实际复查](…)」）实引本报告；`work/reports/2026-10-04-m1-m5-summary.md` 全文未引本报告（:3 为「范围：03 §11 M1→M5」）；`work/reports/2026-10-05-real-chain-addendum.md:1` 仅概念关联「针对第二轮复查」、未直引本报告（指向存疑）；它消费 n-stage 证据包（:21/:120）。
- 来源：复查报告（2026-10-04）；sourceBlob `6a5ababbf9b22021d6b9f80af4618b194c336740`；sourceSha256 `04c9a20e71f3ae777eee03c5d6c54914f3ce1f4d4729cf8bd67577dcd32d038e`。
- 打包：不进产物。
- 影响：删除→N 复查基准断档、三篇后续报告失去基准；对构建/运行无影响。
- 验证：核 :1/:21/:120 与后续三报告基准自述、hash；NOT_RUN。
- 证实/推断/未知：结构/基准关系=**证实**；复查结论=**未复跑**。

## work--reports--2026-10-04-ui-functional-acceptance.md

- 职责：《CDUT Studio 合并后功能与界面验收》（179 行 / 18904 字节）：合并后 UI 功能验收；:44 引用旧文档效力（`team-workspace-file-management.md` 等）；:142 以 `04-acceptance-and-evaluation.md` 标准核对（「本轮没有任何一条 A 类被证明全部完成」）；:169-:177 证据目录与七张代表性截图逐一点名。
- 消费：`docs/design/review-agent/00-overview.md:5`（「前轮 UI 验收保留历史记录」）；人类读者；它消费 `assets/2026-10-04-ui-acceptance/` 证据包（:169-:177）。
- 来源：UI 验收报告（2026-10-04）；sourceBlob `ec947f3f44ed6a29e21a09fca367f4431e160176`；sourceSha256 `1dad5fe8fff410572a42d74f53b0a389011a090d0489d59b834d30aadbfbb959`。
- 打包：不进产物。
- 影响：删除→UI 验收记录与证据链断档；对构建/运行无影响。
- 验证：核 :1/:44/:142/:169-:177 与七截图、hash；NOT_RUN。
- 证实/推断/未知：结构/证据链=**证实**；验收结论=**未复跑**。

## work--reports--2026-10-05-g-loop-closure.md

- 职责：《G01–G13 闭环收口报告（2026-10-05，本地批次）》（38 行 / 4663 字节）：G 复查问题闭环收口记录。
- 消费：人类读者；全树检索除自身外零引用（证实）。
- 来源：收口报告（2026-10-05）；sourceBlob `67cf11aea7d6a5bb2c78f103d876b57808a2e894`；sourceSha256 `71c3a6a1af01e3f29c6a194ae4c5ea483c685874f5f286dc16c827c8dcde3985`。
- 打包：不进产物。
- 影响：删除→闭环记录丢失；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；收口真实性=**未知**。

## work--reports--2026-10-05-n1-n7-progress.md

- 职责：《N1–N7 补完进度与差距（2026-10-05，本地批次）》（48 行 / 4788 字节）：N 系进度与差距（:3 自述以 `2026-10-04-n-stage-recheck.md` 为基准）。
- 消费：人类读者；零外部引用（证实）。
- 来源：进度报告（2026-10-05）；sourceBlob `6cbddbf6beba0ff15a41af7838b9fda6007b3af8`；sourceSha256 `b03dab157b78d1e08e892fca1d4a7581b4924196185cafbf944913a15bd1696c`。
- 打包：不进产物。
- 影响：删除→N 进度记录丢失；对构建/运行无影响。
- 验证：核 :1/:3、hash；NOT_RUN。
- 证实/推断/未知：基准关系=**证实**；进度数字=**未知**。

## work--reports--2026-10-05-real-chain-addendum.md

- 职责：《真实主链路交付附记（2026-10-05，针对第二轮复查）》（24 行 / 2257 字节）：针对第二轮复查的真实主链路交付补充记录。
- 消费：人类读者；零外部引用（证实）。
- 来源：附记（2026-10-05）；sourceBlob `d5cf3503728ca0c95ee63e785fe50aa30e528a02`；sourceSha256 `eac8e0f4b6c40e60158138b63c51ffa42982af8406e5ed99e058b89cfc8ff391`。
- 打包：不进产物。
- 影响：删除→主链路交付补充记录丢失；对构建/运行无影响。
- 验证：核 :1、hash；NOT_RUN。
- 证实/推断/未知：零引用=**证实**；交付真实性=**未知**。

## work--reports--assets--2026-10-04-g-stage-recheck--01-restored-list.png

- 职责：G 复查证据截图 01（PNG，67437 字节）：「重启后旧 V2 案卷可从列表恢复」（`index.md:9` 条目自述）。
- 消费：`work/reports/assets/2026-10-04-g-stage-recheck/index.md:9`（证据目录表格行）；`work/reports/2026-10-04-g-stage-recheck.md` 经 index.md 汇总引用（:33）。
- 来源：UI 复查截图（2026-10-04 证据采集）；sourceBlob `e4d7489f40449b35a7b1578444088c2f5d5901b8`；sourceSha256 `4a92667804d81d5d155f0f8523a890d0c1280b567d88418eded3255488c1507b`。
- 打包：不进产物（yml:44-68/:70-122 无 work/）。
- 影响：删除→案卷恢复证据缺失（index.md:9 描述失锚）；对构建/运行无影响。
- 验证：PNG 头完好、index.md:9 条目对应、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：目录条目/引用=**证实**；画面内容=**推断**（据条目自述，未逐像素核对）。

## work--reports--assets--2026-10-04-g-stage-recheck--03-submit-conflict.png

- 职责：G 复查证据截图 03（PNG，88148 字节）：提交冲突场景（`2026-10-04-g-stage-recheck.md:62`「[冲突]」）。
- 消费：`2026-10-04-g-stage-recheck.md:62`（证据链「冲突」）；index.md:10 条目。
- 来源：UI 复查截图；sourceBlob `44ca280dfc5483208b692cec60f839dc03177d2d`；sourceSha256 `52bacada2cb7b65b27cf1bb12d73d45d28a91b7b6c73cb657da618d83dfba4f0`。
- 打包：不进产物。
- 影响：删除→提交冲突证据缺失（:62 失锚）；对构建/运行无影响。
- 验证：PNG 头、:62 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--04-submitted-without-task.png

- 职责：G 复查证据截图 04（PNG，87626 字节）：已提交但无任务状态（`2026-10-04-g-stage-recheck.md:62`「[无任务状态]」）。
- 消费：`2026-10-04-g-stage-recheck.md:62`；index.md:10 条目。
- 来源：UI 复查截图；sourceBlob `e837e0c5e0e341ba5b2ec15d8c208e33c941d200`；sourceSha256 `6f9919f621444c5c905b3bfd318b18d14a645d9cf1bc8f7f2d8979dc74b485f1`。
- 打包：不进产物。
- 影响：删除→无任务状态证据缺失；对构建/运行无影响。
- 验证：PNG 头、:62 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--05-owner-rule-input.png

- 职责：G 复查证据截图 05（PNG，76193 字节）：自有规则输入场景（`2026-10-04-g-stage-recheck.md:70`「[输入]」）。
- 消费：`2026-10-04-g-stage-recheck.md:70`；index.md:11 条目。
- 来源：UI 复查截图；sourceBlob `2ac4c5508d3f4f35dba4ef2aee31cc8ff5efed9b`；sourceSha256 `57bfe8eb24cf9e7af279fb44cceffacdb55fe6e77c34515e01d993bc99783c2d`。
- 打包：不进产物。
- 影响：删除→规则输入证据缺失；对构建/运行无影响。
- 验证：PNG 头、:70 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--06-owner-rule-published-before.png

- 职责：G 复查证据截图 06（PNG，70463 字节）：自有规则修复前发布状态（`2026-10-04-g-stage-recheck.md:70`「[修复前发布]」）。
- 消费：`2026-10-04-g-stage-recheck.md:70`；index.md:11 条目。
- 来源：UI 复查截图；sourceBlob `de000e3854ed082e4c72034a7efa6d5fec9c7910`；sourceSha256 `ce22fa49c00b892d6857aa250679ad732924b22ca16b4b6005cc98c723fbfdee`。
- 打包：不进产物。
- 影响：删除→修复前对照证据缺失；对构建/运行无影响。
- 验证：PNG 头、:70 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--07-submit-recovered.png

- 职责：G 复查证据截图 07（PNG，90298 字节）：提交冲突恢复后状态（`2026-10-04-g-stage-recheck.md:62`「[恢复后]」）。
- 消费：`2026-10-04-g-stage-recheck.md:62`；index.md:12 条目。
- 来源：UI 复查截图；sourceBlob `766acc3a4f2249a378aed83e32aba04df1937250`；sourceSha256 `aac737789c1badd5e8af757afd31e25bcbb36a505b8b4b868839bcec293da069`。
- 打包：不进产物。
- 影响：删除→恢复路径证据缺失；对构建/运行无影响。
- 验证：PNG 头、:62 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--08-owner-rule-fixed.png

- 职责：G 复查证据截图 08（PNG，71679 字节）：自有规则修复后发布状态（`2026-10-04-g-stage-recheck.md:70`「[修复后发布]」）。
- 消费：`2026-10-04-g-stage-recheck.md:70`；index.md:13 条目。
- 来源：UI 复查截图；sourceBlob `392ac2835cd8918b3888e2b4bd532af769d205bb`；sourceSha256 `7b19836e9c9c6a7696656e254f39fdb9e41f85e9c6a66fe44234e3f070e3a59d`。
- 打包：不进产物。
- 影响：删除→修复后对照证据缺失；对构建/运行无影响。
- 验证：PNG 头、:70 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--09-supplement-response.png

- 职责：G 复查证据截图 09（PNG，90866 字节）：快捷补件回复落盘（`index.md:14` 条目，与 10 成对）。
- 消费：`index.md:14`（「快捷补件回复落盘，判满足后回流任务」）。
- 来源：UI 复查截图；sourceBlob `363178eba1386f143766be5317734702fd222d0d`；sourceSha256 `450a9e225a273b23b04f82ed159b6f1c669acfa027ea9c5540f2b0ce872e6328`。
- 打包：不进产物。
- 影响：删除→补件回复证据缺失；对构建/运行无影响。
- 验证：PNG 头、index.md:14、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--10-supplement-returned-task.png

- 职责：G 复查证据截图 10（PNG，91195 字节）：判满足后任务回流（`index.md:14` 条目）。
- 消费：`index.md:14`。
- 来源：UI 复查截图；sourceBlob `8ad033dd137d41a13e34c680f8bbf990cfabd357`；sourceSha256 `bd57145ec0d186787653ab3d6b4f19ccee1a42e46e94dd6dfe2e4ef4716b1434`。
- 打包：不进产物。
- 影响：删除→任务回流证据缺失；对构建/运行无影响。
- 验证：PNG 头、index.md:14、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--11-batch-no-run.png

- 职责：G 复查证据截图 11（PNG，73934 字节）：「创建固定示例批次后 queued，没有执行入口」（`index.md:15`）。
- 消费：`index.md:15`。
- 来源：UI 复查截图；sourceBlob `ff101bb183e121dd9d9c1009fc9d0a5b2b43dedb`；sourceSha256 `83bc34b2962d6dcd2701da0f8640dfb0a9ab646604817046bb63a115f1ee53fd`。
- 打包：不进产物。
- 影响：删除→批次无执行入口证据缺失；对构建/运行无影响。
- 验证：PNG 头、index.md:15、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-g-stage-recheck--index.md

- 职责：G 证据包目录索引（28 行 / 2291 字节）：逐截图条目（:9-:15 表格）、UI 操作记录说明（:17）、探查文件清单（:23 service-probe.json、:24 service-probe.ts 复跑命令、:26 verification.json）。
- 消费：`2026-10-04-g-stage-recheck.md:33`（「[目录索引](assets/2026-10-04-g-stage-recheck/index.md)」）；它消费包内 10 张截图 + 4 个机器证据文件。
- 来源：证据目录产出（2026-10-04）；sourceBlob `7beced8d487037b86896c982d89ccf501b78555a`；sourceSha256 `10f63d65eed6e64a6919528744903e27dafdfeb3e4fa14a74328fd74c85ce265`。
- 打包：不进产物。
- 影响：删除→证据包导航断档（:33 失锚、截图条目说明丢失）；对构建/运行无影响。
- 验证：核 :9-:17/:23-:26 与包内文件一一对应、hash；NOT_RUN。
- 证实/推断/未知：结构/引用=**证实**；条目结论=**未知**。

## work--reports--assets--2026-10-04-g-stage-recheck--service-probe.json

- 职责：服务层反例探查结果（JSON，2183 字节 / 94 行）：「新评分、补件、离线回复、字段与 outbox 的真实服务反例」（`index.md:23`）。
- 消费：`2026-10-04-g-stage-recheck.md:33`（「[服务结果]」）；`index.md:23`；复跑脚本 `service-probe.ts`（index.md:24，不在 index-only 集）。
- 来源：服务探查执行输出（2026-10-04）；sourceBlob `0313d35ef9b52d76222ee2a12871d06a49295427`；sourceSha256 `251d50b65135372c502b665c936c1e07bcbb62b28ed1ea9193d2c36221fcce74`。
- 打包：不进产物。
- 影响：删除→服务反例证据缺失（:33 失锚）；对构建/运行无影响。
- 验证：JSON 可解析、index.md:23 描述一致、hash；NOT_RUN（含探查复跑）。
- 证实/推断/未知：引用=**证实**；反例结论=**未复跑**。

## work--reports--assets--2026-10-04-g-stage-recheck--ui-actions.jsonl

- 职责：UI 操作轨迹（JSONL，5984 字节 / 70 行）：「记录鼠标/键盘及只读探查；原生文件选择由系统鼠标/键盘操作」（`index.md:17`）。
- 消费：`index.md:17`；审计用操作记录。
- 来源：UI 操作录制输出；sourceBlob `31c99ca9c54b9478660ed4220e150504d3d24af7`；sourceSha256 `a23b9b52b9ffe770168620c9627f0921f107fa5a676c54ffd0afacd384fd5386`。
- 打包：不进产物。
- 影响：删除→操作轨迹证据缺失；对构建/运行无影响。
- 验证：JSONL 逐行可解析、index.md:17 描述一致、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；轨迹完整性=**未知**。

## work--reports--assets--2026-10-04-g-stage-recheck--ui-results.json

- 职责：UI 落盘摘要（JSON，2426 字节 / 74 行）：文件选择/落盘结果摘要（`index.md:17`「细节见 UI 落盘摘要」）。
- 消费：`2026-10-04-g-stage-recheck.md:33`（「[UI 落盘摘要]」）与 `:70`（文件摘要）；`index.md:17`。
- 来源：UI 落盘验证输出；sourceBlob `4ebf6f1081771267ea4dfc6190be2684424ff81c`；sourceSha256 `2e35c4419dfc67776d010820c8a9b84cc04cb2e839c6df78b9e7151f89f206b2`。
- 打包：不进产物。
- 影响：删除→落盘摘要证据缺失（:33/:70 失锚）；对构建/运行无影响。
- 验证：JSON 可解析、:33/:70 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；摘要结论=**未复跑**。

## work--reports--assets--2026-10-04-g-stage-recheck--verification.json

- 职责：最终校验结果（JSON，760 字节 / 37 行）：「最终全量测试、类型检查、边界与构建结果」（`index.md:26`）。
- 消费：`index.md:26`。
- 来源：验证执行输出（2026-10-04）；sourceBlob `4c8ecd6699795f54cb1b1f233f9bebbeca887b3e`；sourceSha256 `26376ef94d5d8bf069cd62adcd6c41deef4cff48aba18a4f6672342e8e1231c2`。
- 打包：不进产物。
- 影响：删除→校验结果证据缺失；对构建/运行无影响。
- 验证：JSON 可解析、index.md:26 描述一致、hash；NOT_RUN（运行验证本轮统一 NOT_RUN，此为历史运行输出归档）。
- 证实/推断/未知：引用=**证实**；所记测试结果=**历史输出，未复跑**。

## work--reports--assets--2026-10-04-n-stage-recheck--02-review-before.png

- 职责：N 复查证据截图 02（PNG，136422 字节）：「修复前三栏各追加三份管理面板」（`README.md:11` 条目自述）。
- 消费：`work/reports/assets/2026-10-04-n-stage-recheck/README.md:11`（证据表格行）；`2026-10-04-n-stage-recheck.md:21` 经 README 汇总引用。
- 来源：UI 复查截图（2026-10-04）；sourceBlob `9c2cd7f6e3f0a4781410e6d0392d5d1a18de97cb`；sourceSha256 `41c01370c955cecc82f64ea16d68360644f4714ad33befc02eed4ccb5626a823`。
- 打包：不进产物（yml:44-68/:70-122 无 work/）。
- 影响：删除→修复前对照证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:11 对应、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：目录条目/引用=**证实**；画面内容=**推断**（条目自述）。

## work--reports--assets--2026-10-04-n-stage-recheck--03-v2-created-before.png

- 职责：N 复查证据截图 03（PNG，153880 字节）：「V2 创建后无任务，V1 工作台仍无材料」（`README.md:12`）。
- 消费：`README.md:12`。
- 来源：UI 复查截图；sourceBlob `f6eb7dadff976a8ef6d00fc77fb53a9899b574c9`；sourceSha256 `de98b4ca567be39eeb0a96d7b1c56c29c6d7f61ca8a9d9ec226cab67ee48025a`。
- 打包：不进产物。
- 影响：删除→V2 无任务证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:12、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--04-premature-finalization.png

- 职责：N 复查证据截图 04（PNG，193489 字节）：「未处理批次可定稿的旧错误」（`README.md:13`）。
- 消费：`README.md:13`。
- 来源：UI 复查截图；sourceBlob `e8ae6c560399e9ed101f2b531be442871491f07f`；sourceSha256 `15ae9e3359f110a0851eacb4dc403d3823bfeecdd0e13c2e45162a77c72aecde`。
- 打包：不进产物。
- 影响：删除→过早定稿缺陷证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:13、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--05-wizard-result.png

- 职责：N 复查证据截图 05（PNG，196628 字节）：「简化向导发布结果，缺模板使用入口」（`README.md:14`）。
- 消费：`README.md:14`。
- 来源：UI 复查截图；sourceBlob `f2f2664c7aa79f73b23a3212555a6ae54a0e3548`；sourceSha256 `e55ff19d44d707d2c41175a5972e1ee07d367b8556d44de89b169b2579ec42f2`。
- 打包：不进产物。
- 影响：删除→向导结果证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:14、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--06-workbench-fixed.png

- 职责：N 复查证据截图 06（PNG，105823 字节）：「修复后的独立工作页与三栏布局」（`README.md:15`）。
- 消费：`README.md:15`。
- 来源：UI 复查截图；sourceBlob `9d2ff13141585102e8e61b0f46badb79111f0f9c`；sourceSha256 `17c76c348cac5fbb036ae98665a4ced8611e7b09262d334ffe2f65e55b017b6a`。
- 打包：不进产物。
- 影响：删除→修复后对照证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:15、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--09-v1-demo-reviewed.png

- 职责：N 复查证据截图 09（PNG，314832 字节）：「模拟引擎、6 条事项、7 张问题卡」（`README.md:16`）。
- 消费：`README.md:16`。
- 来源：UI 复查截图；sourceBlob `0794c6267c206a97473572a2dfa0e3f8797f03db`；sourceSha256 `7ebf64695d1e56d744b67e270be2b79342be46daf7a42ea18fccd8a43d706910`。
- 打包：不进产物。
- 影响：删除→V1 演示审核证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:16、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--10-linked-finding.png

- 职责：N 复查证据截图 10（PNG，339001 字节）：「问题卡联动蓝色依据/红色证明」（`README.md:17`）。
- 消费：`README.md:17`。
- 来源：UI 复查截图；sourceBlob `64350237003e8d17bc06973639c7a6db9ef58529`；sourceSha256 `47ba552218ea876241bc8a7e276417559e572f11d835f71f5f87a60079a46983`。
- 打包：不进产物。
- 影响：删除→问题卡联动证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:17、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--11-assistant.png

- 职责：N 复查证据截图 11（PNG，328622 字节）：「快捷助手，当前问题及明确离线回答」（`README.md:18`）。
- 消费：`README.md:18`。
- 来源：UI 复查截图；sourceBlob `7879c07e276ba5b7fab9fc798966c786c1ce5e13`；sourceSha256 `edf636097ac0085380583e6466555843aebc05f2d02fd5f9f141bd557c5b6903`。
- 打包：不进产物。
- 影响：删除→快捷助手证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:18、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--12-workbench-narrow.png

- 职责：N 复查证据截图 12（PNG，120043 字节）：「实际缩小窗口后的工作台栏目切换」（`README.md:19`；:25 注「截图 12/13 使用 X11 的真实窗口尺寸调整」）。
- 消费：`README.md:19/:25`。
- 来源：UI 复查截图（X11 真实窗口尺寸）；sourceBlob `4632a2717179298e286ed66f1b5030b8bfb99e4d`；sourceSha256 `54cf2aa8391dffb2a507411fbb7d23d0fc61f3f81b052f9bf82ac03dd4b3528c`。
- 打包：不进产物。
- 影响：删除→窄屏工作台证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:19/:25、hash；NOT_RUN。
- 证实/推断/未知：引用/采集方式=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--13-template-narrow-fixed.png

- 职责：N 复查证据截图 13（PNG，63038 字节）：「实际窄屏管理页，切换后表单步骤保留」（`README.md:20`）。
- 消费：`README.md:20/:25`。
- 来源：UI 复查截图（X11 真实窗口尺寸）；sourceBlob `77f5c324c66d873b99bed117072521382b06c58d`；sourceSha256 `b1725ea27e8e4ee27ac6552a525f95e2df1e18c9d6fc8891baec6ede707b581f`。
- 打包：不进产物。
- 影响：删除→窄屏表单保留证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:20、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--14-v2-after-restart.png

- 职责：N 复查证据截图 14（PNG，61308 字节）：「重启后 V2 页只能新建，旧案文件仍在」（`README.md:21`）。
- 消费：`README.md:21`。
- 来源：UI 复查截图；sourceBlob `3aa9c1222b3e028a7f4715a5c0cd410fe2d1f631`；sourceSha256 `72dd0ee730f5ef5af044085c7b959e0c9a4789fed87fbe37feade4ef4d706cd8`。
- 打包：不进产物。
- 影响：删除→重启后 V2 状态证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:21、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--15-batch-after-restart-fixed.png

- 职责：N 复查证据截图 15（PNG，74030 字节）：「重启后 queued 批次定稿禁用」（`README.md:22`）。
- 消费：`README.md:22`。
- 来源：UI 复查截图；sourceBlob `c2036d8b92489bf439a10d75eb2d882f619354f4`；sourceSha256 `6229bd276b30d37f602e3b7d28006f7aff979b3700e1527b78c523b5e81e2327`。
- 打包：不进产物。
- 影响：删除→批次定稿禁用证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:22、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--16-case-list-after-restart.png

- 职责：N 复查证据截图 16（PNG，108777 字节）：「案卷选择只列出 V1，无 V2 恢复入口」（`README.md:23`）。
- 消费：`README.md:23`。
- 来源：UI 复查截图；sourceBlob `ff7fe10241d6d6f7f72e02dd3de7d1f6ed5276f4`；sourceSha256 `bbf202a93c9a72c464e82ce59fa06b68389168143a2b753e85ef588698845317`。
- 打包：不进产物。
- 影响：删除→案卷列表证据缺失；对构建/运行无影响。
- 验证：PNG 头、README:23、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-n-stage-recheck--README.md

- 职责：N 证据包目录说明（42 行 / 2934 字节）：截图条目表（:11-:23）、verification.json 说明（:5）、ui-actions.jsonl 说明与 X11 采集注（:25）、service-probe 说明（:29-:30）与复跑命令（:36）。
- 消费：`2026-10-04-n-stage-recheck.md:21`（「[截图、操作记录和可复跑探查脚本](assets/2026-10-04-n-stage-recheck/README.md)」）；它消费包内 13 截图 + 5 机器证据文件。
- 来源：证据目录产出（2026-10-04）；sourceBlob `040416a195a5ef14b4a5725871426847e4bbe257`；sourceSha256 `eab9541f4abf15ab94895a09dac1ccde0d98bdb62feaac1180507934e0552603`。
- 打包：不进产物。
- 影响：删除→证据包导航断档（:21 失锚）；对构建/运行无影响。
- 验证：核 :5/:11-:25/:29-:36 与包内文件对应、hash；NOT_RUN。
- 证实/推断/未知：结构/引用=**证实**；条目结论=**未知**。

## work--reports--assets--2026-10-04-n-stage-recheck--rating-outbox-probe.json

- 职责：评分 outbox 探查结果（JSON，200 字节 / 9 行，最小探查件）：评分回执通道复现数据。
- 消费：`2026-10-04-n-stage-recheck.md:120`（「[评分探查](assets/…/rating-outbox-probe.json) 复现」）；`README.md:29-:30` 探查族。
- 来源：服务探查输出；sourceBlob `2dab9d0a4271cead1d660762c9c9e2dbfda7add5`；sourceSha256 `c900707eb76a12cdfe655999f34059de2c296b85f138b27b431e91226a2bdc73`。
- 打包：不进产物。
- 影响：删除→评分探查复现数据缺失（:120 失锚）；对构建/运行无影响。
- 验证：JSON 可解析、:120 引用、hash；NOT_RUN（含复跑）。
- 证实/推断/未知：引用=**证实**；复现结论=**未复跑**。

## work--reports--assets--2026-10-04-n-stage-recheck--service-probe-after.json

- 职责：检查点修复后复探结果（JSON，1843 字节 / 76 行）：「检查点修复后，其余缺口仍存在」（`README.md:30`）。
- 消费：`README.md:30`。
- 来源：服务探查输出（第二次）；sourceBlob `3f59f56ffb0b8fb53493659cebe77244b378bf9f`；sourceSha256 `f5ad32c1c8ae2acf2da3814ff7e8f359a2cade57e217cf613836a9836935d766`。
- 打包：不进产物。
- 影响：删除→修复后复探证据缺失；对构建/运行无影响。
- 验证：JSON 可解析、README:30 描述一致、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；结论=**未复跑**。

## work--reports--assets--2026-10-04-n-stage-recheck--service-probe.json

- 职责：修复前服务探查结果（JSON，1731 字节 / 75 行）：「修复前的字段/事实/绑定、流程、离线包、检查点和资源探查」（`README.md:29`）。
- 消费：`README.md:29`；复跑命令 `README.md:36`（`bun work/reports/assets/…/service-probe.ts`，脚本不在 index-only 集）。
- 来源：服务探查输出（第一次）；sourceBlob `ffe38360f59206de6e8bf99cc6a2865116386bb8`；sourceSha256 `e2ba188940d3140be9a5cdc4c9b99d0fa3ff1e623d3f062f99d5d62200154d68`。
- 打包：不进产物。
- 影响：删除→修复前基线探查缺失；对构建/运行无影响。
- 验证：JSON 可解析、README:29 描述一致、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；结论=**未复跑**。

## work--reports--assets--2026-10-04-n-stage-recheck--ui-actions.jsonl

- 职责：UI 操作轨迹（JSONL，8239 字节 / 101 行）：「记录已执行的 UI 操作；DOM eval 仅用于读状态」（`README.md:25`）。
- 消费：`README.md:25`；审计用操作记录。
- 来源：UI 操作录制输出；sourceBlob `4bf35f1c596d6984f3ead87d870f2f054160dcd2`；sourceSha256 `fbf783bc79d8e53e5592954ea50f58f62ec2f6529f5dd9f04bb04bc933a82954`。
- 打包：不进产物。
- 影响：删除→操作轨迹证据缺失；对构建/运行无影响。
- 验证：JSONL 逐行可解析、README:25 描述一致、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；轨迹完整性=**未知**。

## work--reports--assets--2026-10-04-n-stage-recheck--verification.json

- 职责：最终校验结果（JSON，1213 字节 / 59 行）：「最终检查命令、计数、构建和测试环境关闭结果」（`README.md:5`；:5 注「完整开发日志保留在临时 QA 目录，未加入仓库」）。
- 消费：`README.md:5`。
- 来源：验证执行输出；sourceBlob `6bf11a2f9ea52eca5611c5070a5fd3011de73349`；sourceSha256 `e03a49ac5f2244abe0e2e4e2681c623100c3500c7ce80ef1b91b34b90f24e99e`。
- 打包：不进产物。
- 影响：删除→校验结果证据缺失；对构建/运行无影响。
- 验证：JSON 可解析、README:5 描述一致、hash；NOT_RUN（历史运行输出归档，本轮未复跑）。
- 证实/推断/未知：引用=**证实**；所记测试结果=**历史输出，未复跑**。

## work--reports--assets--2026-10-04-ui-acceptance--08-fixed-linked.png

- 职责：UI 验收证据截图 08（PNG，205460 字节）：「修复后的第二份依据/证明联动」（`2026-10-04-ui-functional-acceptance.md:171` 条目自述）。
- 消费：`2026-10-04-ui-functional-acceptance.md:171`（证据清单逐条链接）；`assets/2026-10-04-ui-acceptance/README.md` 证据包。
- 来源：UI 验收截图（2026-10-04）；sourceBlob `b949bca10057bb0db6892c87f461d95c3dd66a09`；sourceSha256 `41b564231bec1111c48fd2a5d4c07db22189d5f9432f49a3770abd7a17801b1e`。
- 打包：不进产物（yml:44-68/:70-122 无 work/）。
- 影响：删除→联动证据缺失（:171 失锚）；对构建/运行无影响。
- 验证：PNG 头、:171 引用、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**（条目自述）。

## work--reports--assets--2026-10-04-ui-acceptance--12-model-failure.png

- 职责：UI 验收证据截图 12（PNG，211621 字节）：「模型故障明确失败」（`2026-10-04-ui-functional-acceptance.md:172`）。
- 消费：`2026-10-04-ui-functional-acceptance.md:172`。
- 来源：UI 验收截图；sourceBlob `922389f859dd5fbb3cb183725d77fccc0a7f2957`；sourceSha256 `8853f2724f080340528e571416c8d1f4043a17de0fd533ab13816019b014c674`。
- 打包：不进产物。
- 影响：删除→模型失败态证据缺失；对构建/运行无影响。
- 验证：PNG 头、:172 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-ui-acceptance--14c-unprocessed-rechecked.png

- 职责：UI 验收证据截图 14c（PNG，224291 字节）：「损坏文件列入未处理范围」（`2026-10-04-ui-functional-acceptance.md:173`；对应 fixtures/broken.docx 场景）。
- 消费：`2026-10-04-ui-functional-acceptance.md:173`。
- 来源：UI 验收截图；sourceBlob `36c920d6b5c23796395d00f506d420a6c546bad3`；sourceSha256 `4085b1f61d6835d8f47b29dcd9a8237c8eaf1b3185dd257a5b5b0a606a842cf6`。
- 打包：不进产物。
- 影响：删除→未处理范围证据缺失；对构建/运行无影响。
- 验证：PNG 头、:173 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-ui-acceptance--15-nine-images-cap.png

- 职责：UI 验收证据截图 15（PNG，223102 字节）：「第九张图片超限提示」（`2026-10-04-ui-functional-acceptance.md:174`；对应 fixtures/image-1..9.png 上限测试）。
- 消费：`2026-10-04-ui-functional-acceptance.md:174`。
- 来源：UI 验收截图；sourceBlob `d8314920d75e5b1945c19b7093069ec4aabea21d`；sourceSha256 `5431bccf7231694cf4e0ca68c8c5ab446d71f3aae127b0f1db39464b2999f5e2`。
- 打包：不进产物。
- 影响：删除→图片上限提示证据缺失；对构建/运行无影响。
- 验证：PNG 头、:174 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-ui-acceptance--17-narrow-fixed-rule.png

- 职责：UI 验收证据截图 17（PNG，91705 字节）：「窄屏切栏后的依据高亮」（`2026-10-04-ui-functional-acceptance.md:175`）。
- 消费：`2026-10-04-ui-functional-acceptance.md:175`。
- 来源：UI 验收截图；sourceBlob `304d2751a8bcf2dc9265502efa50c14746e71ee6`；sourceSha256 `25e56e658728003973a3981d9adecc936ff543164381b9bdbdc09c9d4a43bc8c`。
- 打包：不进产物。
- 影响：删除→窄屏高亮证据缺失；对构建/运行无影响。
- 验证：PNG 头、:175 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-ui-acceptance--20-agent-filepanel-fixed.png

- 职责：UI 验收证据截图 20（PNG，134182 字节）：「独立会话文件面板恢复」（`2026-10-04-ui-functional-acceptance.md:176`）。
- 消费：`2026-10-04-ui-functional-acceptance.md:176`。
- 来源：UI 验收截图；sourceBlob `bdbd09029c3d328a09f4240ee76cf808b91ac108`；sourceSha256 `5a2e22869fad11878f002e620746bdf8f9dfa8b90a51aabea013b1c780a37313`。
- 打包：不进产物。
- 影响：删除→文件面板恢复证据缺失；对构建/运行无影响。
- 验证：PNG 头、:176 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-ui-acceptance--24b-dark-review-layout-fixed.png

- 职责：UI 验收证据截图 24b（PNG，229275 字节）：「深色审核页独立布局」（`2026-10-04-ui-functional-acceptance.md:177`）。
- 消费：`2026-10-04-ui-functional-acceptance.md:177`。
- 来源：UI 验收截图；sourceBlob `71f52189e630d767ade7997d2d61efaf2cbfdf14`；sourceSha256 `5821e7d776b132b325297fccd501eb0416660b68f61df9b533d1c61eefb89f68`。
- 打包：不进产物。
- 影响：删除→深色布局证据缺失；对构建/运行无影响。
- 验证：PNG 头、:177 引用、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；画面内容=**推断**。

## work--reports--assets--2026-10-04-ui-acceptance--README.md

- 职责：UI 证据包目录说明（22 行 / 2619 字节）：manifest.json 说明（:5，「代码基线、修改文件 SHA256、案卷材料清单，以及公开 RDA 样本的本地来源和解析结果」）、verification-summary.txt（:6）、fixtures 说明（:7，「两份虚构依据、申请与补充说明、文本证明、损坏 DOCX、9 张可解码的 1×1 PNG……不是 OCR 样本」）、actions-sanitized.jsonl（:8，「密钥输入占位值已隐藏……需结合报告、截图和持久化数据复核」）。
- 消费：`2026-10-04-ui-functional-acceptance.md:169`（「证据目录：[assets/2026-10-04-ui-acceptance]」）；它消费包内全部 25 件。
- 来源：证据目录产出（2026-10-04）；sourceBlob `413576a773bcfe936352d86c77da7563c69d991b`；sourceSha256 `b9ce5ffdae75db7f23a19609054196295789e1782c18afb53910c0729fbde61c`。
- 打包：不进产物。
- 影响：删除→证据包导航断档（:169 失锚）；对构建/运行无影响。
- 验证：核 :5-:8 与包内文件对应、hash；NOT_RUN。
- 证实/推断/未知：结构/引用=**证实**；条目结论=**未知**。

## work--reports--assets--2026-10-04-ui-acceptance--actions-sanitized.jsonl

- 职责：UI 操作轨迹（脱敏）（JSONL，27192 字节 / 311 行）：验收操作记录，密钥输入占位值已隐藏（`README.md:8`）。
- 消费：`README.md:8`（自注「鼠标输入记录本身不代表功能断言通过，需结合报告、截图和持久化数据复核」）；审计用。
- 来源：UI 操作录制+脱敏输出；sourceBlob `ca55d813bfd85371996caa94de66f865533743e4`；sourceSha256 `c66ccc15d5b530ebfcb75b0ed1d21c28673db40770e50fcb724bc98a2e37e751`。
- 打包：不进产物。
- 影响：删除→脱敏操作轨迹缺失；对构建/运行无影响。
- 验证：JSONL 逐行可解析、抽查无明文密钥、hash；NOT_RUN。
- 证实/推断/未知：引用/脱敏声明=**证实**（README 自注+结构抽查）；轨迹完整性=**未知**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--application.txt

- 职责：验收虚构申请材料（文本，146 字节 / 3 行）：审核案卷「申请」输入夹具（`README.md:7`「申请与补充说明」）。
- 消费：`README.md:7`（fixtures 清单）；UI 验收导入流程输入（`2026-10-04-ui-functional-acceptance.md` 案卷构建）。
- 来源：验收夹具（虚构材料）；sourceBlob `e8086dac8ddc154e422617275d121fcaffdf2b8e`；sourceSha256 `66306ef170fc38693e574191c76476b2fae819b3444d7c0ccdc34ec77843d879`。
- 打包：不进产物。
- 影响：删除→申请夹具缺失（验收重放缺输入）；对构建/运行无影响。
- 验证：文本可读、README:7 清单一致、hash；NOT_RUN。
- 证实/推断/未知：清单/结构=**证实**；内容=虚构材料自明。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--broken.docx

- 职责：损坏 DOCX 反例夹具（32 字节 / 1 行）：验证「损坏文件列入未处理范围」（`README.md:7`；`2026-10-04-ui-functional-acceptance.md:173` 对应截图 14c）。
- 消费：`README.md:7`；`:173` 证据链；验收导入异常路径输入。
- 来源：验收夹具（人为损坏文件）；sourceBlob `8ce012339c14ee5ad96a19ff19d1f616c4f9a442`；sourceSha256 `f0ae9b87d14d9366e91f4e18f04c7e28446f79f0b7e6a545bd41a6daac38e7b0`。
- 打包：不进产物。
- 影响：删除→损坏文件反例缺失（异常路径验收不可重放）；对构建/运行无影响。
- 验证：文件非有效 zip/docx（32 字节自证）、:173 引用、hash；NOT_RUN。
- 证实/推断/未知：引用/损坏性=**证实**；异常处理表现=**未复跑**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--certificate.txt

- 职责：验收虚构证明材料（文本，197 字节 / 5 行）：案卷「证明」输入夹具（`README.md:7`「文本证明」）。
- 消费：`README.md:7`；UI 验收证明链路输入。
- 来源：验收夹具（虚构材料）；sourceBlob `0856abda7dcd3afb8028a14232e770b3fd60f4ef`；sourceSha256 `61d739345a47feb8242c2febd4bb4542acdc92088f79ce96b7bfb38ee45e0b7e`。
- 打包：不进产物。
- 影响：删除→证明夹具缺失；对构建/运行无影响。
- 验证：文本可读、README:7 清单一致、hash；NOT_RUN。
- 证实/推断/未知：清单/结构=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-1.png

- 职责：图片上限测试夹具 1（PNG 1×1，68 字节）：九张可解码 1×1 PNG 之一，用于请求上限测试（`README.md:7` 明示「不是 OCR 样本」）。
- 消费：`README.md:7`（fixtures 清单）；九图上限场景（`2026-10-04-ui-functional-acceptance.md:174`「第九张图片超限提示」）。
- 来源：验收夹具（1×1 PNG）；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→上限测试夹具缺一（9 张计数不再成立）；对构建/运行无影响。
- 验证：PNG 头可解码、README:7 清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**；上限表现=**未复跑**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-2.png

- 职责：图片上限测试夹具 2（PNG 1×1，68 字节）：同上九图族。
- 消费：`README.md:7`；`2026-10-04-ui-functional-acceptance.md:174` 场景。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→九图计数不成立；对构建/运行无影响。
- 验证：PNG 头、清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-3.png

- 职责：图片上限测试夹具 3（PNG 1×1，68 字节）：同上九图族。
- 消费：`README.md:7`；`:174` 场景。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→九图计数不成立；对构建/运行无影响。
- 验证：PNG 头、清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-4.png

- 职责：图片上限测试夹具 4（PNG 1×1，68 字节）：同上九图族。
- 消费：`README.md:7`；`:174` 场景。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→九图计数不成立；对构建/运行无影响。
- 验证：PNG 头、清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-5.png

- 职责：图片上限测试夹具 5（PNG 1×1，68 字节）：同上九图族。
- 消费：`README.md:7`；`:174` 场景。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→九图计数不成立；对构建/运行无影响。
- 验证：PNG 头、清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-6.png

- 职责：图片上限测试夹具 6（PNG 1×1，68 字节）：同上九图族。
- 消费：`README.md:7`；`:174` 场景。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→九图计数不成立；对构建/运行无影响。
- 验证：PNG 头、清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-7.png

- 职责：图片上限测试夹具 7（PNG 1×1，68 字节）：同上九图族。
- 消费：`README.md:7`；`:174` 场景。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→九图计数不成立；对构建/运行无影响。
- 验证：PNG 头、清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-8.png

- 职责：图片上限测试夹具 8（PNG 1×1，68 字节）：同上九图族。
- 消费：`README.md:7`；`:174` 场景。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→九图计数不成立；对构建/运行无影响。
- 验证：PNG 头、清单、hash；NOT_RUN。
- 证实/推断/未知：清单/格式=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--image-9.png

- 职责：图片上限测试夹具 9（PNG 1×1，68 字节）：九图族末张——「第九张图片超限提示」（`2026-10-04-ui-functional-acceptance.md:174`）触发者。
- 消费：`README.md:7`；`:174` 证据链（截图 15-nine-images-cap.png 对应）。
- 来源：验收夹具；sourceBlob `415e629c344bc6812ff7f13f68ab017de2f5ff75`；sourceSha256 `a8ac25ffb430cd9b01b4ba5c4a743a506c6dd78384ae90b87c556e7e1d72179b`。
- 打包：不进产物。
- 影响：删除→上限场景无法复现（缺第 9 张）；对构建/运行无影响。
- 验证：PNG 头、:174 引用、hash；NOT_RUN。
- 证实/推断/未知：引用/格式=**证实**；上限表现=**未复跑**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--policy.md

- 职责：验收虚构审核依据（Markdown，152 字节 / 5 行）：「两份虚构依据」之一（`README.md:7`）。
- 消费：`README.md:7`；UI 验收依据链路输入（依据/证明联动场景）。
- 来源：验收夹具（虚构依据）；sourceBlob `07e32fa2cdf05126d13851f45c4b80da06c3e6ee`；sourceSha256 `dba5f55605bea4866b1d7e0989e914ab6bd0bde5aa9d084695c7927038be1355`。
- 打包：不进产物。
- 影响：删除→依据夹具缺失（联动场景不可重放）；对构建/运行无影响。
- 验证：文本可读、README:7 清单、hash；NOT_RUN。
- 证实/推断/未知：清单/结构=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--supplement.txt

- 职责：验收虚构补充说明（文本，98 字节 / 1 行）：补件回复输入夹具（`README.md:7`）。
- 消费：`README.md:7`；补件链路验收输入。
- 来源：验收夹具；sourceBlob `b1b467159ae82b41525383157b7c3831970d3d63`；sourceSha256 `c48ff997a7f1a13fd10399aab9e6ae72a09760945d8025ded2e97d2b55ea45ee`。
- 打包：不进产物。
- 影响：删除→补件夹具缺失；对构建/运行无影响。
- 验证：文本可读、README:7、hash；NOT_RUN。
- 证实/推断/未知：清单/结构=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--fixtures--time-policy.md

- 职责：验收虚构时间类审核依据（Markdown，126 字节 / 5 行）：「两份虚构依据」之二（`README.md:7`，与 policy.md 成对）。
- 消费：`README.md:7`；依据链路验收输入。
- 来源：验收夹具（虚构依据）；sourceBlob `7a25550ca71280bfaec97a736b2b094022bd5a08`；sourceSha256 `4e719d75056422237f2b2a0da0f134250eb6505e940263029336e372e2774d9d`。
- 打包：不进产物。
- 影响：删除→第二份依据缺失（多依据联动场景不可重放）；对构建/运行无影响。
- 验证：文本可读、README:7、hash；NOT_RUN。
- 证实/推断/未知：清单/结构=**证实**。

## work--reports--assets--2026-10-04-ui-acceptance--manifest.json

- 职责：证据包清单（JSON，6307 字节 / 157 行）：「代码基线、修改文件 SHA256、案卷材料清单，以及公开 RDA 样本的本地来源和解析结果」（`README.md:5`）；含对 `apps/electron/resources/CHANGELOG.json` 等源文件的 SHA256 登记（:134）。
- 消费：`README.md:5`；防漂移机器清单（哈希复核入口）。
- 来源：验收清单产出（2026-10-04）；sourceBlob `8c70a631c0898eddd06e9eb4020e3795fe5c4cf0`；sourceSha256 `37f6a5bd08c25eb06362489d73513d65888125a99877669983522001e64993d3`。
- 打包：不进产物。
- 影响：删除→验收基线哈希清单缺失（漂移不可核）；对构建/运行无影响。
- 验证：JSON 可解析、抽样哈希（CHANGELOG.json :134）与冻结源复算一致、hash；NOT_RUN。
- 证实/推断/未知：结构/引用=**证实**；逐条哈希复核=**抽样**。

## work--reports--assets--2026-10-04-ui-acceptance--verification-summary.txt

- 职责：最终校验摘要（文本，555 字节 / 13 行）：「最终测试、类型、边界及构建结果；不收录宿主环境变量或完整日志」（`README.md:6`）。
- 消费：`README.md:6`。
- 来源：验证执行输出摘要；sourceBlob `14ab4d68e05d434312aa8b8238e1e001adda6e01`；sourceSha256 `0133c73fe1f5e94b99366102840c4011c4990b844adf55422c6cdcdf17c02c75`。
- 打包：不进产物。
- 影响：删除→校验摘要证据缺失；对构建/运行无影响。
- 验证：文本可读、README:6 描述一致、hash；NOT_RUN（历史运行输出归档，本轮未复跑）。
- 证实/推断/未知：引用=**证实**；所记测试结果=**历史输出，未复跑**。
