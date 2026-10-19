# CDUT Studio Review V3｜Round 2D 交叉系统独立核验

**总体：PARTIAL / docs-only / 不合并 / 不发布。** 在 #133/#134 和 #135/#136/#137 三份已固定独立报告成立后启动；从main `8989941b6fb5651564e32d11c4215b6a6d5a5209` 建立隔离审计分支。非生产材料仅限本目录，未执行仓库级测试、真实Provider或校方业务。

| 文件 | 内容 |
|---|---|
| 01-v3-72-capability-coverage.csv | 72行来源、主责、入口、权威状态、上/下游、处置、冲突、测试 |
| 02-cross-system-business-journeys.md | A–G七条链路及数据流/失败路径 |
| 03-source-and-interface-conflicts.md | 固定 SHA 函数级证据和同名服务差异 |
| 04-code-lineage-delta.md | merge-base metadata、R02→R03、PR#97 575文件、本地血缘待补 |
| 05-architecture-conflict-register.csv | 20项 ARCH 编号、影响、约束、测试及第三轮裁决 |
| 06-architecture-options-evidence.md | A/B/C/混合架构证据；不做选型 |
| 07-v3-preserved-behavior-and-tests.md | 历史保全与 Gate A/B/C 负例 |
| 08-third-round-decision-questions.md | 15项跨团队合同裁决 |
| 09-round2-integrated-handoff.md | 事实、阻断、阶段边界与第三轮交接 |
| 10-machine-readable-evidence.json | capability ID / Agent / SHA / test lookup |
| 11-conflict-index.json | ARCH / capability / SHA / priority索引 |

**分级声明**：VERIFIED 仅限固定源码片段或 GitHub metadata（不含执行）；PARTIAL 为静态证据未成产品闭环；FAILED 需实际可复现的失败；BLOCKED 为环境或授权门禁；UNKNOWN 为未充分检查。5个 P0_CANDIDATE 是影响候选，不是5个已验证漏洞。详情见 09。
