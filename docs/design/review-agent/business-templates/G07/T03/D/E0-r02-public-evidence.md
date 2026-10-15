# G07-T03 D作者｜E0-r02 证据恢复与受控交接

> 记录日期：2026-10-15。**仅负责 G07-T03 物资与服务采购事前经费合规预审**。只补齐D作者证据；不更改E r01、C模板或任何Gold。本文件公开可见，绝不含逐案答案/受控mock台账/Gold逐案索引。

## E r01事实与版本分离

E冻结HEAD：`ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`；Git审计基线：`dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。**以上均不是D作者原始提交 SHA**。原E0裁定 `BLOCKED_INPUT` 未改变；本分支新增提交只是本次（r02）证据说明，不是2026-10-14制作历史证明。

已读取原E文档：
`docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-decision.md`、
`E0-coverage-and-isolation.md`、
`E0-input-manifest.json`，均于E冻结HEAD取证。

## 已找到并原字节复核的 G07-T03 产物

| 资料 | SHA-256 | 存放情况 |
|---|---|---|
| A v0.2 领域研究ZIP | `9da75137b5a9cb3f948a623a655d99fa7b6ce11e9138107518272a42b799e213` | ChatGPT Library/作者工作区副本 |
| B v0.2 本模板完整研究ZIP | `6eeb5576e953a46179b9fcbfb0889d4a90b98c8cd69ccb63f213c3372bc983bf` | ChatGPT Library/作者工作区副本 |
| D v2.1正式规范MD | `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1` | ChatGPT Library/作者工作区副本 |
| `G07-T03_INPUT_ONLY.zip` | `ab00deb7ab6f01e22fdb383ac6cb4f9ca937677d6534c022f19d521b97f8e14a` | 原会话附件/作者工作区，未附于Git |
| `G07-T03_EVALUATION_ONLY.zip` | `e0c87f5de33929be90992682eb19ef80df71876a203efaacab98d4bceaaa110e` | **仅原会话附件/作者工作区；ACL_UNVERIFIED；绝不放公开仓库** |
| `G07-T03_D_REPORTS.zip` | `42a856102086335ca66c5d2727ae1467f30712c9ce4df29bab56f8c9777743df` | 原会话附件/作者工作区 |

D原作者仓库commit：`NOT_AVAILABLE`。仓库检索未发现可证实上述D ZIP历史来源的作者commit。**新提交也不充当旧作者commit**。

## 本轮验证（不等于系统测评）

- 26套申请；218份盲输入文件 SHA-256 **218/218** 与原冻结manifest一致；完整ZIP CRC与26份案卷manifest路径验证通过。
- 26份Gold JSON SHA-256 **26/26** 与原`gold_pre_input_freeze.json`逐文件hash一致；26份受控可信mock只在隐藏评估包内，输入包不包含它们。
- 88份图像PDF、95页：结构验证页面嵌入图片且PDF无可直接提取的文本；未全量逐页肉眼/OCR语义核实。
- 模拟政策包标识 `SYNTHETIC-SY-2026` 与Gold内部版次 `2026.1` 属不同语义字段，**不是相同字符串**；此次补充版本映射，不修改旧Gold。
- 历史Gold汇总 `9c03f719af1d097824056e9c6f596fdd2098a77bb6aad681e68a0061254cc382`：其汇总算法未在旧档案明确，不能独立重算。旧的26份单文件冻结SHA可核；本轮增加明确算法的**新派生校验值** `6c0d00099ed4b8d15fcb6f0b90465599712a22d0cbd8befce9eee183019c7cf5`，**只是r02新证据，不替换旧Gold哈希，不回溯冻结日期**。算法：按Gold JSON文件名升序，将每行`filename + NUL + sha256hex + LF`串联后做SHA-256。
- 原预冻结文件对“先Gold、后造材料”的时间顺序仅有作者自述；缺独立可信时间戳/第三方过程日志，不得说已证实。
- Gold与底账ACL权限名单、长期私有保存位置、E读取授权均不可验证：`ACL_UNVERIFIED`。官方校本附件原件和年份版本部分未保存：`SOURCE_PENDING`。
- 当前仅有作者对未读C正文的声明，**E未验证独立性**。C/D/E系统真实执行均未在本轮进行。

## 存储管理人和E r02对接

受限存储管理员需配置密封评估材料保管位置、受限ACL、E读取授权与审计日志，并回填证据。E r02：**E0**重新审阅各T全量输入、原始作者哈希/位置、真正ACL及私有可读性；**E1**由独立审查者基于A/B和原始官方制度事前冻结H/M/L，不从D案反推；**E2**仅在E1锁定和有权读取后才对照C/D；**E3**独立复验ZIP隔离、内容抽样与来源；必要后续E4另行执行。

本次公开Git只放**元数据和状态**，不放任何Gold、逐案答案、评分脚本或可信底账。原 `audit/g07-e-v1-r01` 不修改，`BLOCKED_INPUT` 维持，直到E r02依据实际完整证据另行裁定。
