# G02 研究 E r04｜问题、互斥假设与固定范围

- 轨道：`RESEARCH_CROSSCHECK_ONLY`，不是正式 E v1.0 的 E1/E2/E3/E4 签署。
- r03 研究冻结提交：`research/g02-e-v1p1-r03@3f0579a96588fd3fdf930774ddc8d0385a5e6b28`；本轮沿用其结论，不把旧发现算为新增成果。
- 研究案例：G02-T03 / `BR-02`、`BR-03`、`SC-06`、`R-10/R-17`；研究用 RC04，不使用 D Gold 或真人。
- 本轮不是首次盲审：r03 已静态读过 C，故只允许事后跨核和工程能力调查。

## 唯一核心问题

假设 `School-Z`、`Contractor-Q`、`Sponsor-P`、资源 `R1`、动作 `connect`、相同有效期限：在校内担保有效 (`I=true`) 且网络部门已同意通道 (`N=true`) 的情况下，目标 R1 的资源属主尚无有效授权 (`A=missing`)，能否被现有 C→转换器→运行时的**完整绑定路径**处理为 `PENDING_RESOURCE_OWNER`，且不得被标为已批准/已开通？

**互斥实现假设：**

- `H_AND`：`BR-03` 身份担保和 `BR-02` 目标资源许可是可叠加的独立义务，`SC-06` 同时核验两者；缺资源许可必有 `PENDING_RESOURCE_OWNER`、不实施。
- `H_EXCLUSIVE`：按受益身份选择 `BR-03` 后跳过 `BR-02`；若仅依身份与通道同意作许可判断，则同一输入有错误放行风险。
- `H_UNBOUND`：规则仅存在 Markdown/作者澄清，缺少真实可观测的 C 条款→条件树→最终状态映射，当前无法对实际行为择一裁定。**这不等于已证明产品错误**。

## 受控 2×2：只改变 I/A，保持 N=true

`P`（分项完整正式许可）未被独立验证，`T`（可信后台精确映射）未验证；因此不能把 `I∧A` 本身直接提升为 `PROVISIONED`。

| 身份担保 I | 资源属主 A | 研究用等待状态（可并列） | 可实施? |
|---|---|---|---|
| missing | missing | `PENDING_ROLE_CONFIRMATION` + `PENDING_RESOURCE_OWNER` + `PENDING_APPROVAL` | 否 |
| missing | granted | `PENDING_ROLE_CONFIRMATION` + `PENDING_APPROVAL` | 否 |
| granted | missing | **`PENDING_RESOURCE_OWNER` + `PENDING_APPROVAL`**（RC04） | 否 |
| granted | granted | `PENDING_APPROVAL`（P 尚待核） | 否 |

反事实：仅将 RC04 的 A 由 missing 改为 granted，只能移除资源属主待办；还需要独立可信 P，才能称已批准。P 已获且 T 未实施 → `APPROVED_NOT_PROVISIONED`；P 与 T 均获且范围精确匹配 → 只可称该网络层 `PROVISIONED`，不外推堡垒机/业务权限。正式拒批/撤权/到期优先，不应被待核覆盖。

## 来源分层与边界

- **F-CDUT-HISTORICAL**：成都理工大学官网《网络安全管理办法（试行）》§11（PDF 文本页索引 7、印刷 p9）要求特权最小化、对外来公司管理账号及权限严格控制和收回；§10（PDF 页索引 5）规定系统上线登记备案。两者均**不能独立证明 CDUT 2026 专项网络申报单具体审批链**。官方原文：<https://wxc.cdut.edu.cn/__local/9/8F/4D/EDCE5568A88F519606DEA2F2537_C718DC5C_C843B.pdf>。
- **S-CLOSED**：School-Z 的 `I∧A∧N` 必备条件、具体等待状态以及所有合成输入仅用于检验逻辑，不能用于校本实际拒件。
- **U**：CDUT 2026 现行专项服务授权流程；C 新版完整母版和 SHA 的独立字节核验；运行时 BR-02/BR-03 联合门控绑定；真实账号配置和 Gold 权限。

历史源锁的「外校 S」不得等同本轮的 S-CLOSED。观察、推断与反事实分开记录于本目录其它两份报告。
