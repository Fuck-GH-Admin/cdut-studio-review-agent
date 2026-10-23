# G03-T02 D 作者补证（E r01 / 2026-10-15）

> PUBLIC_METADATA_ONLY。只含非敏感来源、哈希与阻断状态。禁止向本公开仓库上传 EVALUATION_ONLY、Gold、trusted_fixtures 或 scoring。**不修改 E r01 原审计结论；不声称本次已过 E r02。**

## 范围与审计来源

- 业务：G03-T02 / G03-01-T02，部门会议室与会议用途预约。原 D v2.1 的30案不变。
- 对应 E-G03-DEP-001（受控访问未证实）和 DEP-003（作者原始 Git 提交及配套证据链未固定）。
- 审计分支 `audit/g03-e-v1-r01`；冻结 HEAD `1be43d8bacc015e1fd21949796defcdd3ecb96fc` 是 **E 审计提交，绝非 D 作者提交**。
- 正式证据位于 `G03/acceptance/E-v1.0/E0-E1-blockers.md`、`E0-input-manifest.json`、`E0-coverage-and-isolation.md`，均在上述 HEAD 读取。

## T02 D 原件不变（本轮独立按原字节核 SHA-256）

| 原始产物 | SHA-256 | 字节 | 状态 |
|---|---|---:|---|
| `G03-T02_INPUT_ONLY.zip` | `4f1c428e23a829ab68449af0d5cbc4e051687ae2f619a2965a65c687bfc6e3a4` | 6910182 | 原件保留 |
| `G03-T02_EVALUATION_ONLY.zip` | `4fa10f278165acf288b9189e7fc773da51ccf4a4506cf615045280946f19c207` | 62935 | 原件保留，**ACL_UNVERIFIED**；禁止提交Git |
| `G03-T02_D_REPORTS.zip` | `1b7d1911b707e54e6e004fc143012f4dd288768cd53a2035ac3f5e14f8698abf` | 7273 | 原件保留 |

- `FROZEN_GOLD_v1`、`INPUT_v1`、30案例不变，无新场景，无Gold改写；原包内部 `frozen_manifest.json` SHA-256：`9bd19015cb84ed8013be2610afcc38f31558b4f1298165757b2f89bf456d11cb`。
- ZIP CRC均通过；输入成员157/157、评估成员（不含manifest）66/66哈希均匹配；输入路径不含Gold/评分/可信mock；67份PDF共70页可渲染，文字层为零；显式泄漏词静态扫描0命中。**静态检查并不证明图像全部语义没有暗示，也不证明Library有安全ACL。**
- `G03_A_领域总调研_研究交接包_v0.1_20261011.zip` SHA-256：`4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3`。
- `G03-T02_B阶段深调研_校本二轮补证_v0.2.zip` SHA-256：`0385bf72385236d0469063e054c0dbc25bcf40e7f8cdf278a76d013dea2a28cf`。
- C 上游仅引用 E0 清单**元数据**：`G03-T02_正式业务模板_MD_v0.1.md` SHA `ccc47640de8023e4b258abdcd6cd17603b99a43f501e14fea7712655de3652ae`。**D没有读取C正文**，也不据此修Gold。

## 独立性、权限与仓库证明

- 原始 D 作者提交 `AUTHOR_GIT_COMMIT=NOT_AVAILABLE`。**本次PR所生成的新commit仅为2026-10-15补证增量提交，不能冒充原D作者提交或倒签2026-10-13。**
- 原 `frozen_manifest.json` 中 `issued_at=2026-10-13` 为包内自述时间，不是可信外部时间戳。
- 当前Gold仍在普通Library候选资产中，**没有获得私有存储位置、可访问者白名单、匿名拒绝测试和读访问审计日志的证明**。状态：`ACL_UNVERIFIED / PENDING_STORAGE_ADMIN`，不等于已证实泄漏。
- 由有权存储管理员配置受限位置、最小可读角色（必要D作者、指定E验收者、存储管理员），迁移原字节后重算SHA并保存实际时间的ACL审计证据；D不能代签完成。
- 2026本校会议室实时权限与OA规则仍 `SOURCE_PENDING`，不得将外校案例变成本校强制拒件条件。

## E r02 必须复验

1. **E0** 对比三原包SHA/作者版本，补验实际受控Gold权限、是否匿名可读/权限继承/审计日志；将新Git补证SHA与旧D作者commit分开记录。
2. **E1** 独立核对A/B的来源和校本未核事项；普通会议室和会议本体上游审批的权限不得混淆。
3. **E2** 由获授权的独立E验收者固定C原作者版本后受控对照D；D作者不接触C规则，不改Gold迎合C。
4. **E3** 在受控E环境核对Gold可用性、盲输入泄漏和后续系统/权限表现。当前未执行E3，也未计算产品准确率。

**状态：D原件/内部清单已重新确认；E r01裁定不变；E r02未执行；ACL等待有权管理员。**
