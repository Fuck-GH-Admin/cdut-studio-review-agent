# G06-T08｜D 原作者定向补证（公开安全摘要）

日期：2026-10-15。只针对 `E-G06-ALL-0001` 及 T08 来源待核风险。**不修改 E r01 裁定、不开展 E2/E3/E4、不重做 Gold、不改 C。**

## 正式审计依据

- E r01 冻结 HEAD：`1dcf4033256121efd3dea62b1153592df1facd7c`，是 **E 审计提交，绝非 D 作者原生产提交**。
- 已读取：`E4-issue-ledger.md`、`E-final-verdict.md`、`E1-supplementary-evidence-20261014.md`，位于 `G06/acceptance/E-v1.0/`。
- `E-G06-T08-0001=BLOCKED_SOURCE`：本校动物伦理专用受理机构、申请表和权限仍待校方原文。
- `E1-25` 已确认本校2023实验室技术安全管理制度，但**安全论证≠动物伦理委员会正式批准**；仅登记 `RECHECK_AFTER_SOURCE_FIX`，不等于已确定D Gold错误。
- E r01 `E2/E3/E4=NOT_STARTED`；H91来源待证必须由A/B/来源责任人先核实。

## 原 D 资产（原字节未改）

| ZIP | SHA-256 | 内容 |
|---|---|---|
| `G06-T08_INPUT_ONLY.zip` | `c8e7867ca5b07e6e4eba567b1c76038de2fd7825eee30110582c6a1bc84ebc25` | 26案/218输入文件 |
| `G06-T08_EVALUATION_ONLY.zip` | `4a202a7577d18d2cd5289edc8fbd0329336aa97a02dd9b025eec00adb2556be4` | **私有 Gold、可信mock，严禁入公开Git** |
| `G06-T08_TEST_REPORTS.zip` | `a7563ba8b33a145e6275a537fec18d0655e31dd27780fd10b2284f6d00903301` | 历史报告含逐案预期状态，**不能直接公开** |

原 Gold 内部 SHA-256：`fd1aef54453e618e47cc025f11eeed54d78f5a80d4cffd17988b5dc809708e24`。本次复算了218个输入哈希、26份案卷manifest与Gold/政策/可信mock/覆盖表4项冻结内容哈希，均一致。

原 D1 元数据声明 `D1_BEFORE_INPUT_D2`、`C_template_read_before_freeze=false`；原报告与ZIP条目时间顺序相互一致。**此为作者历史声明与完整性证据，不是外部不可篡改的制作过程日志**。未见C污染正证，亦不能无条件证明零接触。

## 实际缺口及责任

| 项目 | 当前真实状态 | 责任 |
|---|---|---|
| 原 D 作者生产 Git commit | `NOT_AVAILABLE`，**本次补证提交不回填为旧D制作提交** | 原D作者/归档管理员继续查原日志；无法追溯则保留缺口 |
| Gold私有存储URI、ACL白名单、允许/拒绝访问测试 | `ACL_UNVERIFIED; NOT_CONFIGURED_BY_D_AUTHOR` | 受权存储管理员 |
| 历史独立制作过程签名日志 | `NOT_AVAILABLE`；不得倒签 | 原作者仅提供现存自述与哈希，由E评价可信度 |
| CDUT动物伦理委员会、实际表单、授权与适用时点 | `SOURCE_PENDING` | A/B/校方来源负责人 |
| T08伦理与实验安全双轨风险 | `RECHECK_AFTER_SOURCE_FIX`；**不是现存Gold缺陷** | E1源事实重新冻结后，独立E核对 |
| 全量图像视觉与逐案来源精确化 | `E_R02_REVIEW_PENDING` | 独立E |

**D0–D4状态**：D0 PARTIAL（A/B原版本SHA未固定）；D1原Gold资产 PASS、独立制作外部日志 PARTIAL；D2 PASS；D3 PARTIAL（未全量人工视觉核实）；D4 PARTIAL（受限定位桥已补但需独立E逐案复核）。E r01状态保持不变。

本公开文件不含逐案答案、Gold证据定位桥、可信底账或评分脚本。完整原件仅在原会话附件；私有存储/ACL待具权限的管理员配置。
