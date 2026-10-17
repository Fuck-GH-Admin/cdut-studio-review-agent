# G07-T07｜第一轮 E r01 后 C 作者定向补证与 E r02 对接

## 一、所依据的原 E r01 正式文件
- `docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-decision.md`
- `docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-coverage-and-isolation.md`
- `docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-input-manifest.json`
- 冻结审计 `audit/g07-e-v1-r01@ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`；其结论是 `BLOCKED_INPUT`，**只说明未取得完整可冻结输入和隔离证据，不是 T07 规则被证伪。**

## 二、本会话定位和恢复结果
- 责任仅 `G07-T07 项目借款与事后冲账结清预审`。
- **文件确实缺失？** 否。C v0.1 MD母版、规则追踪MD/CSV、自检、编辑器候选、E交接、历史D说明、迁移审计和两个README均在原作者工作区存在。
- **主要缺陷类型**：`NOT_ARCHIVED_IN_GIT`；原 C v2.1 ZIP 文件SHA `29861b27482df8344db1020cc6123fd1286c553f022b3537ae4660577299eb26`，原 C v0.1 ZIP文件SHA `9137f2927476a759d8fd3646c215e6df9665e68eeadc1416e146449a50010523`。
- **业务内容缺陷**：本轮没有证据支持修改 R-01—R-42；母版仍 v0.1，作者成熟度 `BUSINESS_MD_DRAFT_WITH_GAPS`。没有补造2022校本借款期限、批准金额门槛或已到账数据。
- **原始 C 作者提交**：`NOT_COMMITTED`（先前存在于会话工作区）；**本轮归档提交**：`ee36fdb7a46defe07ab14337f5d887f11616160c`。
- **C 变更范围**：`0` 条规则、`0` 个字段、`0` 个材料槽修改；新增 public Git 归档与本对接说明。A/B来源文档亦按原字节复制，未重写。
- **证据哈希**：以同目录 `artifact-manifest.json` 为权威冻结索引，并依 SHA-256 对每个文件复算。 Git blob SHA 与 SHA-256 是**不同的哈希算法**，不可混用。

## 三、财务阶段/身份专属自检
- 借款事前申请不要求尚未产生的费用发票，不把审批通过当作学校已实际拨款。
- 学生代录≠学生为借款人；经费负责人自借需按适用制度核验互签资格，未知条件记 `SOURCE_PENDING`。
- 凭票冲账应引用所属费种的有效审核，不由 T07 替代差旅/采购/会议审批。
- 余款退回银行转账发起≠学校已入账；销账和结清以真实会计事件为准；部分冲销不自动清零。
- 2022《借款管理办法》未取得全文、2026系统权限未完全证实，保持 `SOURCE_PENDING/POLICY_UNRESOLVED`，不能把其他高校或历史通知作为现行强制拒件依据。
- 不上传受限借款主账或学生个人敏感信息。

## 四、建议独立 E r02 执行的复验项目（非本会话执行）
| E 阶段 | 需要复查 | 本作者能提供 | 尚不能替其他人证明 |
|---|---|---|---|
| E0-r02 | 仅定位并冻结 T07 的 C v0.1 十个文件的路径、Git对象与SHA-256，不预读 C 业务规则正文；核 B/A 公开来源元数据、原工作区ZIP指纹 | Git路径、SHA、归档提交、文件清单和差异范围 | 其余六套 C/B 包、全部 D Gold/盲测、Gold ACL和A全文均已冻结 |
| E1 | 在读取 C/D 业务判断正文前先自行锁 H/M/L、独立读校方原文；检查 T07 借款责任与冲账政策 | A/B公开线索、C作者标明的未证实来源 | 独立校本结论、H/M/L分母和证据冻结已经完成 |
| E2 | E1 锁定后核 C 母版各规则与 D 测试的业务语义 | C 母版/规则矩阵/作者自检（仅参考） | D Gold真实性、独立性与隐藏答案 |
| E3 | 核真实变更缺陷、合法替代及金额状态一致性，形成可追溯事实问题 | 事前/后不混同的规则及版本哈希 | 已执行系统运行或完成金标试验 |

**E4 发布/结论亦由 E 独立评估；本 C 不签 E 结论。**

## 五、安全边界与未关闭缺口
- **不能读** D 私有金标、预期答案、敏感财务底账；此目录不包括 Gold 索引或可反推答案的信息。
- **不能修改** E r01 `BLOCKED_INPUT` 裁定与冻结 `ccbf9bd6...`。不修改 D 文件，不参与 E1—E4 的裁决。
- 公有仓库只收经检查的业务作者资料、来源引用、SHA和公开索引；真实受限 ACL 不能配置时应由存储管理员提供隔离证明。
- 原先 A 完整分支卡、B v0.2附加CSV及README、全域剩余六套 C/B/D、Gold隔离，仍需各责任人/有权存储者补齐。**不要据本作者归档就将全域 `BLOCKED_INPUT` 改成 `READY_E1`。**

## 六、当前状态
`G07-T07 C INPUT_RECOVERED_IN_PUBLIC_GIT`；`E r01=BLOCKED_INPUT（未改）`；`E r02=NOT_RUN`；`D Gold=NOT_ACCESSED`；`real_runtime=NOT_RUN`。
