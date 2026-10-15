# G07 E r02 原审计会话｜定向取证与一次性作者/保管人交接

> 2026-10-15。本文件是 **r02 后新增的公开安全辅助证据**，不是 r03、不是新 E v1.1 的 E1 首次独立事实裁定。严格继承原 r01/r02，**不得**替换冻结记录、C 原件或受控 Gold。

## 0. 冻结锚点与本轮边界

- r01 `audit/g07-e-v1-r01@ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`，Draft PR #26，E0=`BLOCKED_INPUT`。
- r02 `audit/g07-e-v1-r02@ff8d55026f45b09d3d4955167a6cbc4b4e8e409e`，Draft PR #67，E0=`BLOCKED_INPUT`，E1～E3 `NOT_STARTED`，E4仅依赖台账。
- 逐项对照 r02 `E4-r02-issue-ledger.md`：`E-G07-R02-E0-001/002/003` 仍 `OPEN`，T06 `OBS-004` `UNTRIAGED`，T03 `OBS-005` `OPEN/PROVENANCE_GAP`。这些追踪号不是 r01 原编号。
- 检查 G07 专项 **14 个 C/D 作者/证据分支当前 HEAD**，均与 r02 manifest 一致；未发现分支新修订；`support/g07-e-r02-followup` 原本不存在。
- 不重复七份 C MD SHA-256；没有读取任何 C 业务正文、`EVALUATION_ONLY.zip`、私有 Gold、受控底账或可能含答案的 `D_REPORTS.zip`。
- 本轮仅新增：**T06 安全输入的 TC 身份及数量核验**、**T06 B07 原文件字节核验**、**七 T 精确来源缺口目录**、**已有官方网页的定位性复查**。无 E1 政策效力签署。

### 共同 A 依据（不要当作作者原始生产 Git commit）

- A 统一目录 `G07_02_统一模板目录与边界.md`，SHA-256 `64a771d60e7ea68a040c4d7fd551c246bf3cd123e0ca60a8f7d9d4ea245ee4c4`；固定 Git blob `f31d75d278ec1b4c4242eb955f58a8b9a395616d`；本域七模板业务边界以此为准。
- A 来源索引 `G07_03_来源索引.md`，作者登记 SHA-256 `17583564d18b1561b05ce6fd9104df86e132b6d34047ca78f85d1af75f8b3245`、Git blob `438f109db118af95e8f77c7f36d6b7ecc8478dbd`，在 T01/T02/T05 作者恢复分支见同一 blob。
- A `G07_07_成都理工大学校本规则专项核验.md`，作者登记 SHA-256 `2bbad8fd845cf22ab3029c683ad760c86c6847f4d9c56cbf34fc1099e9e1f70f`，Git blob `a057335ef12235e1774a1ab89d0bddec5f30d9ca`。
- 完整 A 领域基础文件 `G07_00/01/02/03/05/06/07` 可在 `author/g07-t05-e0-r02-input-recovery@780cd209cecd6b90cd568997530b47ddde32aa2a` 下的 `docs/design/review-agent/business-templates/G07/author-handoffs/G07-T05/E0-r02/A_recovered/` 找到；T01 作者分支亦保留大量 A 文件。**已归档副本存在不等于拥有 A 作者最初的生产 commit。**

以下表格的“缺”仅表示**本 E 当前固定位置/可访问 Library 未独立取得字节或原始来源链**，不是断言作者从未制作。

## 1. 七模板 A/B 可访问原件、正式来源与准确补索件

| TXX | 当前实际可访问的 A/B 字节入口 | 政策原文定位入口（原文效力仍待新 E 核实） | 具体缺口及责任 |
|---|---|---|---|
| **T01** 活动/竞赛/科研直接费用 | Git `author/g07-t01-c-e0-recovery-r01@0fff12c5b5330b72566d33d81283da603f687793`：`docs/design/review-agent/business-templates/G07/C/G07-T01/upstream/A-v0.2/G07-T01_研究交接卡.md` 及 `upstream/B-v0.2/G07-T01_00_独立业务深调研.md`、`_01_`～`_07_`、`_02_字段字典.csv`、`_02_字段材料证据矩阵.csv`；相关正式来源登记在 `G07-T01_04_官方来源与差异登记.md`。 | CD11 事业经费流程 `https://jcc.cdut.edu.cn/ywlc/5.htm`；CD01 2026 智能报销通知 `https://jcc.cdut.edu.cn/info/1012/2656.htm`；2025 校方“只跑一次”事项清单的原始 PDF URL 已列于 B04。外校 EX01 仅参考。 | **B 原作者/档案保管人**：给出上述 B v0.2 全文件的最初来源存档/制作顺序与原 SHA（目前 Git 是 C 作者恢复的字节副本）；补可校验的 CDUT 2026 真实活动直接费用审批/替代证据原始附件及生效日。**D-T01**：受控交付 `G07-T01_INPUT_ONLY.zip`，作者记载 SHA `d3194bd24fa5b8902ba04d395a400b2d3d1d54eaff86986a70b5baf1c26284cf`，本 E 尚未取得原字节。 |
| **T02** 因公与学术差旅 | Git `restore/g07-t02-c-e0-r01@1564a20fb99c5ff13fd78ce3162d0ac93005e65c` 的 `docs/design/review-agent/business-templates/G07/T02/A-reference/` 已有 A02/A03/A07。另有文件库实际 B ZIP `G07-T02_B阶段独立业务深度调研_v0.2_含校本二轮补证.zip`：**本 E 独立 SHA-256** `e0e75f79d3eb307123b2ddcfb29fc643d1a882ae8215802ca0e9c1d966a86956`，CRC PASS，实际 11 成员：`G07-T02_00_...`、`_01_`、`_02_.md/.csv`、`_03_`～`_07_`、两个 README。 | CD03 2024 非科研差旅指南 `https://jcc.cdut.edu.cn/info/1016/2201.htm`；CD04 成理校发〔2025〕33号的学校规章索引 `https://jcc.cdut.edu.cn/cwzd/xxgzzd.htm`；CD05 2025 差旅标准 `https://jcc.cdut.edu.cn/cyxx.htm`；2026 开账通知同 T01。 | **A-T02/档案保管人**：补 `G07_04_模板子任务卡/G07-T02_研究交接卡.md` 原字节与作者 SHA；**财务制度持有人**：提供成理校发〔2025〕33号办法全文原 PDF/附件、科研与非科研标准不同版本和学生适用条款的可验证版次；**B-T02**：补源作者时序/原生产 SHA（本 E 已有 B ZIP，不必重寄同包）。 |
| **T03** 采购事前合规 | 共同 A02/A03/A07 可由 T05 完整 A 归档只读取回；T03 C/D 公开作者登记称有 A v0.2 ZIP `9da75137b5a9cb3f948a623a655d99fa7b6ce11e9138107518272a42b799e213`、B v0.2 ZIP `6eeb5576e953a46179b9fcbfb0889d4a90b98c8cd69ccb63f213c3372bc983bf`；**两包原始字节目前未由本 E 独立收到/校验**。 | CD07 2023 采购方式补充说明 `https://cg.cdut.edu.cn/info/1008/3280.htm`；`https://cg.cdut.edu.cn/index.htm` 官方政策目录列有《成都理工大学非政府采购实施细则》。 | **B-T03/原档案人**：一次交付 B v0.2 原 ZIP、原 SHA、`G07-T03_00_独立业务深调研.md` 至 `_07_...` 及 B04 正式来源清单、制作时序；**A-T03** 补 `G07_04_模板子任务卡/G07-T03_研究交接卡.md`；**采购与招标主管部门**：提供当前适用非政府采购实施细则原 PDF、废止/替代关系、金额与事前审批权表。 |
| **T04** 采购履约结算 | 共同 A02/A03/A07 有恢复副本；文件库旧 `G07-T04_00_独立业务深调研.md` SHA-256 `2477c5656f58af0d0406772e60b24d29b7886f96c52c7ee24b6e936a9a20d5c8` 已在 r01 核；其余 B v0.2 原 ZIP `G07-T04_B阶段深调研_v0.2_校本补查交接包.zip` 仅 C 作者登记 SHA `87fc62c13b382e69decafe159f471412f8ccf172e20164cfe6efa0a9b83b39ba`。 | CD06《成都理工大学采购验收管理办法》成理校发〔2023〕11号原 PDF `https://gz.cdut.edu.cn/__local/2/CC/13/647DE095C814922158068435485_A6347BE6_67024.pdf`；CD08 `https://jcc.cdut.edu.cn/info/1016/2231.htm` 2024 检测加工指南。 | **B-T04/档案人**：交 B v0.2 原 ZIP 的实际字节、`G07-T04_01_办理情景与条件轴.md`、`_02_字段材料证据矩阵.md`、`_03_候选审核规则与权限边界.md`、`_04_官方来源与差异登记.md`、`_05_缺口及质量自审.md`、`_06_C与D双向交接卡.md`、`_07_校本二轮补查...`（末项若本版不存在请列 manifest）；**A-T04** 补 `G07_04_模板子任务卡/G07-T04_研究交接卡.md`；校方提供现行验收适用例外、进度款权限及2026合同付款材料原文。 |
| **T05** 科研劳务与酬金 | Git `author/g07-t05-e0-r02-input-recovery@780cd209cecd6b90cd568997530b47ddde32aa2a` 的 `docs/design/review-agent/business-templates/G07/author-handoffs/G07-T05/E0-r02/` 下：`A_recovered/G07_04_模板子任务卡/G07-T05_研究交接卡.md` 与 `B_recovered/G07-T05_00_独立业务深调研.md` 至 `_08_新增校本规则映射及回归审计.md`，含 `_04_官方来源与差异登记.md`。r01 核验 B00 SHA-256 `f261ff47209b082cfbed49ae0b8cab5fdde968e4f50298f77c9c2a466a6daca9`。 | CD02 2024 酬金指南 `https://jcc.cdut.edu.cn/info/1016/2233.htm`、2026 智能报销入口 `https://jcc.cdut.edu.cn/znbx.htm`；校本调研还登记科研/专家经费的最新专项制度及薪酬系统临时通知（详见 B04）。 | **B-T05 原作者/档案人**：核真实 B00～08 来源与 2026 增量时间链；**财务/人事/科技管理有权人**：补 2026 专家费资格、审批权限、薪酬系统现行角色及有效政策/适用资金；**D-T05**：提供盲输入 `G07-T05_INPUT_ONLY.zip` 原字节，作者 SHA `dda09b0c8028d6dea6cfdca602cd2ec91badd83c268389fa4c93068cfbce2b9b`，本 E 未独立取得。 |
| **T06** 主办会议培训结算 | 共同 A02/A03/A07 有恢复副本；原 `G07-T06_00_`～`_06_` 未取得。**本轮新从文件库取到 B 增量原字节** `G07-T06_07_成都理工大学二次补查与规则优先级修订.md`，SHA-256 **独立复算** `26d466351406bebe50292f7b891782dfeb37df2ab332e0b67acef0fc12437b48`，与作者登记一致。C 作者还登记 B v0.2 原 ZIP `G07-T06_B阶段_深度调研_v0.2_校本补查交接包.zip` SHA `64b43ee85391f121ec71591662c5ebcd207f1f5db930161b9ce0a6bf6085f3e7`，本 E 未取得该 ZIP。 | CD10/CD11 财务会议业务目录 `https://jcc.cdut.edu.cn/ywlc/7.htm`、`https://jcc.cdut.edu.cn/ywlc/5.htm`；B07 新列 2024 科研经费实施办法官方原 PDF `https://kjc.cdut.edu.cn/__local/0/81/F8/F213AF25A8DDE36DF9DC104CDD7_3BB8AB3B_3BB05.pdf`、国际会议管理说明 `https://dice.cdut.edu.cn/info/1030/1101.htm`、2025 专家咨询费办法 PDF `https://kjc.cdut.edu.cn/__local/6/57/10/ADAB3D32F806CCF82DDE89DD853_60A6D523_4194E.pdf`、培训报销标准 `https://jcc.cdut.edu.cn/info/1119/2584.htm`。这些 PDF 尚未由本 E 验全文。 | **B-T06/档案人**：交原 B v0.1 **`G07-T06_00_独立业务深调研.md`、`_01_办理情景与条件轴.md`、`_02_字段材料证据矩阵.md`、`_03_候选审核规则与权限边界.md`、`_04_官方来源与差异登记.md`、`_05_缺口及质量自审.md`、`_06_C与D双向交接卡.md`**；另交合并 v0.2 ZIP 与逐项 manifest。**A-T06** 补 `G07_04_模板子任务卡/G07-T06_研究交接卡.md`；政策主管提供真实2026会议/培训标准/审批分工。T06 D 计数定向复核见下。 |
| **T07** 借款与冲账 | Git `author/g07-t07-c-e0-input-recovery-20261014@41b88bab6f84363e1d111f8c464cbe37cffddbcd` 的 `docs/design/review-agent/business-templates/G07/author-deliverables/G07-T07/` 下 `A-reference/G07_02_统一模板目录与边界.md`、`G07_03_来源索引.md`；`B-v0.2/G07-T07_00_独立业务深调研.md` 至 `_07_本校第二轮补查_校本证据与修订建议.md`，含来源登记 B04。r01 B00 SHA-256 `3971dc75decc13617f959bdcdcd65ff350dfcee89091ba60a8d2fdcb6c5f1655`。 | CD13《成都理工大学借款管理办法》成理校发〔2022〕39号索引 `https://jcc.cdut.edu.cn/cwzd/xxgzzd.htm`（目前 **仅索引，不是全文**）；CD14 借款办理流程 `https://jcc.cdut.edu.cn/ywlc/7.htm`；2026 智能报销通知同 T01。 | **A-T07**：补 `G07_04_模板子任务卡/G07-T07_研究交接卡.md`；**B-T07/档案人**：补原 B v0.2 完整 ZIP `a3280f95bf62c35cd1568925dc7f807eac5849f842c262900297c0f8c89690bc` 的字节、Git 未覆盖的可选矩阵 CSV/README 与最初制作历史；**校方财务有权人**：补成理校发〔2022〕39号原 PDF、适用性/修订版、借款人资格、冲账时限/责任、2026系统角色。**D-T07**：交 `G07-T07_INPUT_ONLY.zip` 原字节，作者 SHA `52177215fe752f398a05a9370281be7b2935891a7831de8c9af85e0b5b9c99d5`，本 E 未独立取得。 |

注意：表内 B 原作者“补源”指最初独立 B 的制作/归档证据，不是让 C 作者把自己的恢复提交说成历史 B commit。所有只据 A/B 编目的官方链接都是**可定位的研究线索**，不是 E1 已认证的强制裁定。

## 2. T06 计数争议：本 E 真正完成的独立、无答案复核

**核验对象（未改字节）**：`G07-T06_INPUT_ONLY.zip`，旧 SHA-256 `1baecde6b48202c12642e2589e02435de5a8ca41cafb48cd5283ddd3be9d69f4`（本 E 现场重复核算与 r02 固定值一致）。`zipfile.testzip() == None`（CRC PASS），ZIP 条目总数 **206**，全部位于 `cases/`。

**输入案号的独立事实**：`cases/TC-001/` 至 `cases/TC-023/` 共 **23 个连续且互异目录**；每目录有 `manifest.json`，且其中 `case_id` 均等于自身目录号（23/23）。无 `TC-024`；`TC-021` 下 8 个 ZIP 成员，`TC-022` 10 个，`TC-023` 10 个。无任何需要读取 Gold 的步骤。

- `cases/TC-021/manifest.json` SHA-256：`443c95f085da0124f77b679f27c21950584bbc137128ea25c6d864a0beee6355`；
- `cases/TC-023/manifest.json` SHA-256：`b8257455e9f52375190d3c4d8743d29ddfd09b9e019fc149256b1c58c900a87d`。
- 不对外提交输入 ZIP、个人资料、逐案业务事实或附件正文；此处仅留可复现聚合计数和 manifest 的哈希。

最小复现（仅在有权访问 **INPUT_ONLY** 的本地环境运行，不读取 D_REPORTS/Gold）：

```python
from zipfile import ZipFile
import hashlib, json
p = "G07-T06_INPUT_ONLY.zip"
with open(p, "rb") as f:
    assert hashlib.sha256(f.read()).hexdigest() == "1baecde6b48202c12642e2589e02435de5a8ca41cafb48cd5283ddd3be9d69f4"
with ZipFile(p) as z:
    assert z.testzip() is None
    names = z.namelist()
    ids = sorted({n.split("/")[1] for n in names if n.startswith("cases/")})
    assert ids == [f"TC-{i:03d}" for i in range(1, 24)]
    assert len(names) == 206
    for case in ids:
        m = json.loads(z.read(f"cases/{case}/manifest.json"))
        assert m["case_id"] == case
```

**可纠正的客观事实**：该固定**输入包实际为 23 案，而非 21 案**。D-T06 作者的公开 E0 补证文档指出原 `D_REPORTS/04_交接给GXX独立验收E.md` 记为“21个案卷”，及原 `D_REPORTS/02_Gold独立性与覆盖矩阵.md` 写 `TC-001—TC-021`；**本 E 没有打开原 D_REPORTS，因此这两处原报告文字与其原 SHA 尚未独立复核**，也未独立核证 23 份受控 Gold 全部正确配对。故 `E-G07-R02-OBS-004` 仍 `UNTRIAGED`，不把其归因为“纯笔误且不影响 Gold”。

**D-T06 作者的精确补证请求**：提供两份原报告上述范围的无答案/无类别分布的脱敏引用、各原报告单文件 SHA-256 及原 `D_REPORTS.zip` 的外层摘要（作者先前登记 `34cf5a167d3f685dba7a5f6a7c6152cb2d52f4e7d44877779af92e7a5c6f5032`，本 E 尚未独立取得）。再由受权 D/私有存储管理员只在受控侧计算 **`TC-001…023` 是否都有 Gold 存在的布尔覆盖矩阵**、原 D1 冻结版本/哈希和生成时序，仅向公开 E 交安全签署的 `case_id × presence` 摘要、总数、验证代码 SHA；绝不公开预期结论。根据报告原文与受控覆盖核验再定问题等级。旧包/旧报告不得覆盖；需要勘误则提交新注记，`原 SHA` 原样保存，`修订注记 SHA` 新计算，不得称为旧版。

## 3. T03 Gold 两种摘要：请求原 D 与受控管理员定向核清

- D-T03 公开资料旧 Gold 聚合摘要（**作者记载，算法未定义**）：`9c03f719af1d097824056e9c6f596fdd2098a77bb6aad681e68a0061254cc382`。
- D-T03 在 2026-10-15 补证中新派生摘要：`6c0d00099ed4b8d15fcb6f0b90465599712a22d0cbd8befce9eee183019c7cf5`。作者描述为将 Gold 文件按文件名排序，逐条 `filename + NUL + lowercase_sha256_hex + LF` 拼接、对 UTF-8 字节做 SHA-256。**新算法摘要不是旧 D1 历史冻结的同义表达，更不是原冻结时序凭证。**
- 受控原 `G07-T03_EVALUATION_ONLY.zip` 外层作者摘要 `e0c87f5de33929be90992682eb19ef80df71876a203efaacab98d4bceaaa110e`，本 E 未打开、未独立重算。

**必须从 D-T03 与存储管理员一次索取**：

1. 原始 `gold_pre_input_freeze.json` 的固定 SHA/字节数、不可变受控对象 ID、原 D1 时序日志及原作者独立性记录；提供旧 `9c03...` 的**可执行原算法**（明确文件集合、路径名相对根、排序规则、hex 大小写、分隔符、编码、LF/CRLF、JSON 规范化/换行、是否拼原文件字节）；若历史算法确实丢失则正式标 `NOT_REPRODUCIBLE`，不得编造。
2. r02 新派生值 `6c0d...` 的可运行脚本、固定版本 SHA、**不含真实 Gold** 的合成输入测试向量及其期望输出，保证另一受授权执行者可以在私有环境复算。
3. 私有对象原字节 SHA-256、存储版本/只读 ACL allow/deny 测试、审查角色最小权限、访问审计日志。验证方仅在受控环境读取 Gold；公开文档只能保留汇总签署、算法 SHA 和状态，不能存答案。
4. 区分时间先后证据与字节一致性证据。即使 26/26 Gold 成员 SHA 一致，也不能凭 r02 新摘要倒签 D1 的冻结时间。

`E-G07-R02-OBS-005` 保持 `OPEN / PROVENANCE_GAP`，本会话不关闭、不读答案。

## 4. 一次性发给责任人的收件清单（最少重复劳动）

**A 原作者/领域资料保管人**：补 T02/T03/T04/T06/T07 五张 `G07_04_模板子任务卡/G07-Txx_研究交接卡.md` 原件和 SHA、A 各正式来源清单完整快照，注明存档副本 vs 原作者 commit。T01/T05 的卡已有可查 Git 副本，不要重复造新卡。

**B 原作者/文档保管人**：优先交 T03 完整 v0.2 B ZIP、T04 完整 v0.2 B ZIP、T06 B00～B06 原字节 + v0.2 合并 ZIP，及各文件 SHA-256/原始归档 ID；T01/T02/T05/T07 已有可读取 Git/ZIP 字节，重点补**原 B 作者来源链、遗漏配套 CSV/README、官方附件稳定来源**，不要重新写研究来代替旧字节。

**D-T01/T05/T07**：仅交原字节 `G07-T01_INPUT_ONLY.zip`、`G07-T05_INPUT_ONLY.zip`、`G07-T07_INPUT_ONLY.zip`（作者摘要见上表），附安全输入包 manifest/CRC 与不含 Gold 的内容隔离声明；不需要复制 Gold 给本原 E 会话。

**D-T06**：两条“21 / TC-021”原报告脱敏可核片段及固定 SHA、在受控侧验证的 23 案 Gold **存在性**（非答案）证明。**D-T03**：两种摘要算法/旧版链的脚本与日志。

**校方有权部门/原文保管人**：现行成理校发〔2025〕33号差旅全文、成理校发〔2022〕39号借款全文、适用的非政府采购实施细则及其生效/废止链、2026 智能报销/专家酬金/主办会议当前权限和附件规则。没有校本原文的具体数字/拒件条款继续 `SOURCE_PENDING`，外校政策不可转写为 CDUT 强制规则。

**独立私有存储管理员（七 T 共通）**：为 T01～T07 分别提供 `EVALUATION_ONLY.zip` 的不可变对象路径/ID、版本/对象 SHA、最小权限名单、真实 allow/deny ACL 测试、访问记录及公开安全的签署证明。存放在普通聊天文件库≠经独立验证的 Gold ACL。

## 5. 来源定位复查与新 E 签署隔离

本会话通过学校官方站点的公开搜索结果重新定位：`jcc.cdut.edu.cn/info/1012/2656.htm` 是 2026-01-13 开账通知，正文提到从 2026 开账起原则上使用智能报销；`jcc.cdut.edu.cn/cwzd/xxgzzd.htm` 的官网索引存在成理校发〔2025〕33号国内差旅办法、成理校发〔2022〕39号借款办法；`cg.cdut.edu.cn/info/1008/3280.htm` 为 2023-03-07 采购试行补充说明。**若直开返回 HTTP 412，仅记录公开索引命中，不把搜索摘要当完整制度 PDF。** 对 PDF 正文施行效力、金额门槛和例外未进行 E1 独立签署；新 E 必须自行取得正式原始版本并封存判断。

## 6. 最终状态及交接约束

- **新增有效证据**：T06 固定盲输入 ZIP 经本 E 复验确实含 23/23 连续案卷及独立 manifest；T06 B07 独立 SHA-256 与作者登记一致；T02 B 包继承 r02 已验证的 11 成员完整性；七 T 的缺件已具体定位到文件和责任。
- **不做升级**：r01/r02 固定 HEAD、原 PR 不变；E0 `BLOCKED_INPUT` 不改变；T06 仍 `UNTRIAGED`、T03 仍 `PROVENANCE_GAP`；没有独立查看 C/Gold 或签 E1。
- **旧 SHA vs 修订 SHA**：本轮不修改任何原始证据，故不存在“修订版 ZIP SHA”。新的只是这份公开安全复核记录及其独立 Git blob/提交版本。
- **交给新的独立 E v1.1**：仅把可取回的 A/B 索引、固定原始 SHA、T06 输入计数与缺口、T03 摘要未证边界交接；独立新 E 负责 E1 首次盲审和下一阶段签署。本原 E 不与之竞争资格。
