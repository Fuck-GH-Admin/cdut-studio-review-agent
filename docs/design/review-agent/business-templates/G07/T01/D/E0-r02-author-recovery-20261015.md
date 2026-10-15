# G07-T01 D 作者｜E0 r02 输入恢复与隔离证据（公开版）

> 本文件只用于 G07-T01「活动、竞赛与科研直接费用报销预审」D 作者定向补证。写入时间：2026-10-15。**不修改 G07 E r01 原裁定，不构成 E0/E1 验收通过。**

## E r01 正式依据
- E 审计冻结分支：`audit/g07-e-v1-r01`，审计 SHA `ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`。
- 已阅读固定版 `E0-decision.md`、`E0-coverage-and-isolation.md`、`E0-input-manifest.json`。
- 原裁定 `BLOCKED_INPUT`，是完整候选输入/Gold ACL/版本链不足，不是 D Gold 已被判错。

## 原始 D 资产找回（旧版原样保留）
| 文件 | SHA-256 | 内容规模 |
|---|---|---|
| `G07-T01_INPUT_ONLY.zip` | `d3194bd24fa5b8902ba04d395a400b2d3d1d54eaff86986a70b5baf1c26284cf` | 36案、271文件、126 PDF/129页 |
| `G07-T01_EVALUATION_ONLY.zip` | `bc1f91c0d4789952d5178d2bea51573b6801378393b6d8748aa00007c81188e4` | 36份 Gold、36份受控可信底账；不得公开 |
| `G07-T01_D_REPORTS.zip` | `6c3324751483b09fa4f70a0eb067c720eeebd0c9f8a7fb3a097f28b47de2cfed` | 5份原D报告 + 1份离线记录 |

- 原 Gold `FROZEN_GOLD_v1`，自述冻结日期 `2026-10-13`（未得到外部可信时间戳的独立证明）。原Gold汇总SHA `142ff0495ed9b75046178a6e5fb48e1c3c5f5ef0468a9fe42a03586b4ad8649e`，已使用逐案Gold哈希映射按键排序的JSON方式**实际复算一致**。
- 原 D 作者 Git 提交：`NOT_AVAILABLE`；审计 `ccbf9bd...` **不是原作者提交**。本作者新分支提交仅证明2026-10-15的补证版本。
- 完整原始三个 ZIP 目前仅在原 ChatGPT 会话附件/模型工作空间中，非 Git 可重放已归档资产。需要 E 收取原文件并逐个计算 SHA，不可凭此MD代替真实文件。

## 重新运行的可验性
- ZIP CRC与目录安全检查通过；271个输入、36个Gold、36个可信底账**逐文件**匹配原冻结清单；36个案内 manifest 的附件SHA重新核算匹配。
- 126份 PDF、129页有嵌入图像，无可直接提取文字层（不等于完整OCR准确率）。
- 新增对原 D4 中 `zip_separation=null` 的**包级检查**：`INPUT_ONLY` 中不存在 Gold/可信底账/评分目录，检查 `PASS_LOCAL_ONLY`。
- 本次新建 `G07-T01_D_REPORTS_PUBLIC_E0R02.zip`（SHA `f46f544829cbaf82cb8b964e851b5155353dc5cb161fd40325663a45cc732f66`）：原报告 `D4_机器核验记录.json` 中含Gold结果类别分布汇总，不宜公开；新公开副本删除该字段并补注包级隔离复验。**原始报告ZIP未改、Gold没改。**

## A/B 源哈希（已重新复查原字节）
- `G07_02_统一模板目录与边界.md` `64a771d60e7ea68a040c4d7fd551c246bf3cd123e0ca60a8f7d9d4ea245ee4c4`
- `G07_07_成都理工大学校本规则专项核验.md` `2bbad8fd845cf22ab3029c683ad760c86c6847f4d9c56cbf34fc1099e9e1f70f`
- `G07-T01_02_字段材料证据矩阵.md` `bddcb577c4d3bf3e394e811cd5a5df75fb554089f70bef31882c13fe768c0da7`
- `G07-T01_03_候选审核规则与权限边界.md` `892dd7c9c39339238db773c86e16d88890385d6831f6f28c48517d44944d42cd`
- `G07-T01_07_校本二轮补查与规则增量.md` `5ba9e3b338eb8e7c54151c4029bd564f6a82298c24d27e2f3822e0bff8121933`
- `04_D_独立金标_盲测材料_离线自检.md` `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1`
- 其他 B v0.1 完整源 `00/01/04/05/06` 本轮未全部重新找回：`SOURCE_PENDING`；不虚构全套冻结。

## 安全与E r02待办
- **Gold存储事实**：原会话 `G07-T01_EVALUATION_ONLY.zip` 已找回；受限持久归档和受权访问清单**未配置/未证实**，状态 `ACL_UNVERIFIED`。项目所有者/有权存储管理员须配置非公开库并留ACL核验日志。不可上传公开Git/PR。
- 原生制作独立性：原D自述不读取C实质内容；本轮只读A/B、原D资产、E审计三份公开文档；**没有独立可证明原制作全过程的可信第三方日志**，不能声称完全已证。
- E0 r02：重验原ZIP哈希、补齐 B 源与全G07其它T、C完整版本、受控Gold ACL；隔离未证时维持阻断。
- E1：仅E在其独立规则研究预先锁定后开展；E2/E3/E4按验收规范，作者不做。
- `C_CROSS_ACCEPTANCE=NOT_IN_SCOPE_FOR_D`；`RUNTIME_VALIDATION=NOT_IN_SCOPE_FOR_D`。
- 当前状态：**T01 原作者文件恢复及哈希验证已完成；G07 E0 `BLOCKED_INPUT` 维持至 E r02 正式复评。**
