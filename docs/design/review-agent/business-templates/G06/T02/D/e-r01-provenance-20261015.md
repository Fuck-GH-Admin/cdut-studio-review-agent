# G06-T02｜D 作者 E r01 定向来源链补证（2026-10-15）

> **只记录新增公开安全的来源、哈希、独立性证据缺口。** 本提交不是2026-10-13 D原作者生产提交；不修改E r01冻结裁定，不打开C规则，不包含逐案Gold、可信底账、案卷预期或评分映射。

## 审计上下文
- 业务：G06-T02 软件著作权申请与校内权属审查。
- E r01固定审计提交：`1dcf4033256121efd3dea62b1153592df1facd7c`（**不能冒充D生产commit**）。
- 原作者生产Git commit：`NOT_AVAILABLE`（旧D资产是会话/Library来源；Git历史按T02 D相关关键字搜索未定位可归属的原生产commit）。
- 归档前提：E正式结论仍为 `BLOCKED_SOURCE` / `BLOCKED_INPUT`，E2/E3/E4尚未执行。

## 原始产物字节证明（本轮重新计算，并与 E0-input-manifest.json核对）

| 原资产 | SHA-256 |
|---|---|
| A统一基线v1.0 ZIP | `60e13c8f6805e65fa4bbec89f00f30e31bc4825884da298ffded0f096795b72b` |
| B深调v1.1 ZIP | `ed71f3122e4e00d9db0e595bd0cedcf3328239cc77a4c55c85ef3546debdb955` |
| D INPUT_ONLY ZIP | `059827a9a4b4e81edb9a38aef6ebcfe012c75c898ae7f03d8e4908a06da3ad80` |
| D EVALUATION_ONLY ZIP（**内容不得公开**） | `f22ba8229e4c1bff58b2a2dee1c2bfc014eef9c3f5204af93df4ba519ae862a8` |
| D REPORTS ZIP | `f0855fad2f3dcfc9894e5079d484d382e90fc8946ccdab21614a38f300ac298f` |
| D原交付索引 | `08d57ae7a11658f4befaf88cbb6b7879a5b3ad1345de93b89f932933a3be1043` |
| 受控历史v1备份 ZIP（**内容不得公开**） | `f58a4d52331dd4266fbd40158ae961d1228d1f68f9a21ee33a38be004cacb49b` |
| Gold v1受控冻结清单SHA | `79c212043b7bcc842934534a7e6a7d9b2f2d629b7ee198ee3d2ae8237910559f` |
| Gold v2受控冻结清单SHA | `2d7db0dc702fad96bacb2523fe0eabdf7d5416001fdca939a8417bd74b9a7164` |

ZIP CRC均通过。评估侧逐文件核对22个Gold、2个模拟可信底账、173个输入文件的SHA与原v2冻结清单完全一致。旧包字节**未在本轮修改**。

## 原有v1→v2的差异声明（仅摘要）
22案业务预期动作与分项判断状态逐案对比保持不变；v2在 `gold_version` 与 `findings`中补充 `evidence_locations` 26处和 `absence_verification` 7处及修订记录。不公开任何案例—结果映射。上述字节可复验，但不能充当不可抵赖的生产时间戳。

## D制作独立性限定
- 原D报告在2026-10-13**自述**只读A/B及三个官方原始依据，已见C文件名但**未读C实质**；本轮仍未读取C。
- 当前可验证的包括A/B绑定SHA、旧v1备份以及v1/v2无业务结论变化；**没有**独立可核签的制作全过程日志和历史访问日志。
- 故 `C_CONTENT_NOT_READ_IN_THIS_REMEDIATION`，而 `FULL_INDEPENDENCE_PROVEN=false`，不得倒签。

## Gold ACL与权源
- 独立ZIP ≠ 真实私有ACL。原资产在会话文件/Library；未取得真实访问主体、受限对象ID、ACL导出与访问日志。`GOLD_ACL=NOT_VERIFIED`，移交项目指定**私有存储管理员**，需证明E可读/C与匿名不可读并保留日志。
- E1对T02学校2026申请表及承诺原DOCX记 `POLICY_PENDING`；A/B/校本来源负责人先补原件、版本、适用日期/角色和签章责任。不得从未核校规推断既有Gold错误。
- E r01 `E-G06-ALL-0001`与`E-G06-T02-0001`仍为未解阻；复验留E r02。

**禁止把任何 Gold正文、旧v1备份、逐案判定矩阵、内部冻结清单JSON或可信fixture上传此公开分支。**
