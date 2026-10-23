# G04-T04｜D r01 原成果保留与最小差分清单

审计关联：`E-G04-GLOBAL-0003`，责任仅为 `G04-T04｜实验项目安全风险评估审核` D 作者。E 审计冻结 HEAD：`fc2ace5c874454ddbcfca731be7aa093416dab12`，仅用作审计参照，**不属于原D作者版本**。

## 一、审计正式原文定位

- `E4-issue-ledger.md` 中 `E-G04-GLOBAL-0003`：静态发现 `INPUT_ONLY/EVALUATION_ONLY` 分包、结构对齐；缺独立 Gold 制作过程、C 完全隔离证明、Library ACL/访问记录，属 `BLOCKED_INPUT`；D 主责；需要访问人表、制作过程/泄漏复盘与路径证据，必要时污染用例独立重做。
- `E0-coverage-and-isolation.md`：**尚未打开 C 或 Gold 正文时**只检查目录、文件数量、SHA 和典型字段；E0 的包装结构检测本身不能证明语义无泄漏、访问权限隔离或历史独立性。
- `E-final-verdict.md`：G04全域为 `BLOCKED_INPUT`，T04的来源、Gold、跨模板检查为受限 `PARTIAL`，证据来源为 `BLOCKED_INPUT`；**本轮无权更改裁定**。

原文定位：`docs/design/review-agent/business-templates/G04/acceptance/E-v1.0/`，固定读取于审计 HEAD（非作者 SHA）。

## 二、D0—D4原成果的真实版本与原件完整性

| 对象 | 原版本 | SHA-256 | 变更和本轮处理 |
|---|---|---|---|
| `G04-T04_INPUT_ONLY.zip` | D v2.1 / 30案，197成员 | `4dd6444d725e9abca750b871fe34355e3f2527de5c33c73179dea17a6773a71d` | **0字节变更**；未重制 |
| `G04-T04_EVALUATION_ONLY.zip` | `FROZEN_GOLD_v1` / 30份Gold + 30份底账 | `bcb195006e89d77d4fd2481afd28f43ad77510580fef23092e9438a1e486bc95` | **0字节变更**；未读C反校；未重冻/重签 |
| `G04-T04_D_REPORTS.zip` | D0—D4五份报告与一份离线记录 | `806a2fd037a16b96cac043811ed196804a3511c97fd6e9f9fea47d8be503fe4b` | **0字节变更**；不覆盖原历史自述 |

上述哈希是本轮直接对用户会话挂载文件计算的 SHA-256，和 `E0-input-manifest.json` 的 G04-T04三个 D 档案哈希完全一致。`frozen_manifest` 对197条输入文件、30个Gold文件、30个受控底账 SHA 的逐一比对为 **257/257 PASS**，ZIP CRC校验及输入/评估成员路径隔离也通过。**这不等于 D3 语义泄漏或ACL独立性已获第三方认证**。

D0：前次报告声明7份A/B原始文件已读并固定 SHA；原A T04交接卡与B的00/01/03/05仍未在原D运行时完整恢复，记录为 `BASELINE_GAP`。D1：`FROZEN_GOLD_v1`；制作日期原作者标签`2026-10-13`，**无首次构建可信时间戳**。D2：30案输入。D3：静态分包与图像PDF无文本层（旧报告抽样限制不变）。D4：离线资产自检，**未运行产品**。

D作者commit：`NOT_AVAILABLE`；作者Git Blob：`NOT_AVAILABLE`。E r01的E0/E1/E2/E3或 `fc2ace5c...` 均不得填写成作者版SHA。

## 三、本轮新增文件及影响（全部仅元数据/证据，不含Gold答案）

| 新增文件 | 类型 | 改动范围 | Gold影响 |
|---|---|---|---|
| `gold_provenance_and_acl_status.md` | 公开可读元数据/保密状态 | 时间来源、过程自述、后冻结E摘要、C接触风险、ACL/访客/CI状态、公开限制 | **无**，不重算答案 |
| `D_r01_original_assets_and_change_log.md` | 作者公开变更台账 | 冻结原件、哈希追溯、差分与责任隔离 | **无** |
| `E_r02_recheck_handoff.md` | E复查交接卡 | 必须复验E0—E3哪些事项以及管理员待办 | **无** |
| `d_r01_public_manifest.json` | 脱敏文件哈希摘要 | 原三分包与本轮新公开文档哈希、审计固定 SHA；无逐案映射 | **无** |

**源政策处理**：原B已以成理校发〔2023〕40号（2024-01-01施行）取代2016试行办法。E `E-G04-A-0005` 归 A 源索引修订，不能让 D 按2016建立2026强制规则。`E-G04-SOURCE-0006` 仍为校本 `SOURCE_PENDING`，不得凭外校案例给本次既有Gold偷偷换规则。未取得新的经A/B正式确认的校本实施细则，故**本轮不存在有证据支持的Gold语义升级**。

**外部受控档案**：旧 ZIP 仍仅确认在 ChatGPT 会话/Library 被找到，真实私有 ACL 尚不具备证据。新增公开文件可放Git；原完整隐藏Gold/底账/评分器仍不允许上传公共分支。