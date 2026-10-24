# p01-app-shell__work 索引（work/decision-log 过程决策日志）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__work`（owner `p01-app-shell`，family `work`）共 1 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

## work--decision-log--2026-10-02-decision-log.md

- 职责：《决策日志（追加式）》（2026-10-02，49 行表格 / 12788 字节）：内容审核专区工作期间的过程决策逐条追加记录（至 41 条；`work/reports/2026-10-02-acceptance-report.md:4` 记「41 条；验收时为 28 条」）；首条（:8）定「中间产物目录 `CDUT-Studio/work/`（decision-log / demo-data / reports / tmp）」；:4 自注「本目录是过程文档；正式决策档案见 `docs/plans/2026-10-02-content-review-demo-implementation.md`」；:36 记决策 33（通用化升级立项三堵墙定性）指向 `docs/plans/2026-10-02-content-review-generalization.md`。
- 消费：①`work/reports/2026-10-02-acceptance-report.md:4`（「过程决策：…（41 条）」）；②`work/reports/2026-10-02-code-review.md:3`（F1-F15 修复去向引用「#27、#28、#38、#39」四条决策）；③`docs/plans/2026-10-02-content-review-demo-implementation.md:5/:74`（「细粒度的过程决策追加在…」）。无代码消费者（全树检索证实）。
- 来源：过程决策记录（2026-10-02 工作期，追加式）；sourceBlob `eca84b8d0f18df8493d919cfe02a76f24a2fadf5`；sourceSha256 `adc5423d0da65d8e21bed88777a58c8e59c07713a5afa0370467281564cd41e7`。
- 打包：不进产物（electron-builder.yml:44-68 `files:`、:70-122 `extraResources:` 无 `work/`）。
- 影响：删除→2026-10-02 过程决策链断裂（三处引用悬空，code-review F1-F15 修复去向 #27/#28/#38/#39 失锚）；对构建/运行无影响。
- 验证：核 :1/:4/:8/:36 与三处引用行存在、条目表格式完整、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：结构/引用面=**证实**（实读+grep）；各决策条目技术结论正确性=**未知**（未逐条复核）。
