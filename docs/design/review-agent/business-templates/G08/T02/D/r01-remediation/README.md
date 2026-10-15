# G08-T02｜D作者针对 E r01 的定向修复记录

2026-10-15。原E r01审计冻结HEAD `d5901f1d6ed03454fe1c00201e20d4a373834b75` **是审计者提交，绝非D作者成果提交**。

**本分支不是E r02复验结论。** E r01状态仍为 `NEEDS_REWORK`；当前D作者只提交影响范围内的增量资产及可公开证据摘要。

## 核对的原始版本 SHA-256（全部未改）
- `G08-T02_INPUT_ONLY.zip`：`86d3ac2c002cdf24d362caa4fc28199e492bc32f04b8067917a3b083791c1d14`
- `G08-T02_EVALUATION_ONLY.zip`：`cf3fe933ea19e66bae209df4c858d70860358d75dbf9250cde501602b1c3b8ed`
- `G08-T02_D21_EVALUATION_OVERLAY_PRIVATE.zip`：`8e7c4caa9241612c1adc3ec6e2361469c29c89b3d40385887bccda834680878d`
- `G08-T02_TEST_REPORTS.zip`：`38a8fa28a4e0d011ec41883f09355d14fd91ab13acbe0d80c1395c039a2995e3`

## 定向增量资产（另在本会话交付）
- 公开新增14案盲测输入：`G08-T02_E_r01_TARGETED_INPUT_ONLY_v1.zip`，SHA-256 `be657d17755c429825aa9c2dfc084895834ef64951da4ac49456b7f38201a571`。
- 仅授权验收方使用的独立私有补丁：`G08-T02_E_r01_PRIVATE_DELTA_v1.1.zip`，SHA-256 `ad95f70925c81e70ce9c001b7cf51218a12c0de6e2e3a3709c8e088ad00c69c9`。**该文件未提交到任何Git分支**，含新增Gold、mock与旧32案事实锚点。

新案由B研究和明示的封闭模拟学校规则独立制作；对成都理工普通非校园卡失物的资格、委托与保管条件仍为 `BLOCKED_SOURCE`。不会拿外校规则硬套本校，不会擅自出库、处置或断定违法。

## 历史原作者提交与来源时间
- 原D1/D2私有Gold与原始输入的不可变作者Git commit：`NOT_AVAILABLE`。
- 可证明的D21公开迁移作者commit：`4c04a4ec02e104c573b601000c054dcfb8bba409`；该提交不含原私有Gold，Git时间**不可以回填成原D1冻结时刻**。
- D1外部可信绝对冻结时戳：`NOT_AVAILABLE`；始终保留 `PROVENANCE_PARTIAL`。

## 禁止公开的内容
`gold/`、`trusted_fixtures/`、`semantic_evidence_anchors_v1.json`、规则到具体案卷的Gold映射、评分脚本和所有含答案索引。当前受限文件仅以用户对话文件形式提供，**尚未验证/配置组织ACL**；后续需要授权存储管理员落实。

仅可由独立E执行 r02 的 E0–E3必要复测；未执行E0–E4或真实系统运行。
