# G04-T01｜D r01 provenance / ACL 定向证据补齐（公开摘要）

- **责任**：仅 G04-T01《楼宇门禁与特定区域通行授权》D 原作者；不修改 C 模板、Gold、A/B 校规或 E r01 结论。
- **目标审计项**：`E-G04-GLOBAL-0003 / BLOCKED_INPUT`。
- **审计原件**：`audit/g04-e-v1-r01@fc2ace5c874454ddbcfca731be7aa093416dab12` 下 `E4-issue-ledger.md`、`E-final-verdict.md`、`E0-coverage-and-isolation.md`；冻结原始三包的E0清单见 `E0-input-manifest.json`，其 E0 审计提交为 `f7881dc5bbbc07111e400a59c47618f3611ff8be`。

## 1. 原D字节冻结与不变声明

| 原始文件 | 原件 SHA-256 | 说明 |
|---|---|---|
| `G04-T01_INPUT_ONLY.zip` | `f2175e9c3407ad93b729e0bee2d61edd403495dd0609e7f058f2db846eaff1a9` | 24案、161个输入文件 |
| `G04-T01_EVALUATION_ONLY.zip` | `07cc9e38fb246652074daa78e51d369ae603e19cf8af701f8ed5a6ba28d9df8f` | 24份冻结Gold、24份可信模拟底账；**不得提交仓库** |
| `G04-T01_D_REPORTS.zip` | `894105d1b09c53ed5a15ccc60990aa8337a3a06d0f800476127147d98539a23d` | D0-D4五份原始报告 |

以上三份原 ZIP 在作者当前运行时均真实存在，SHA 与 E0 清单一致；包内逐文件哈希核验输入 **161/161**、Gold **24/24**、可信底账 **24/24**。**没有重新生成案例、修改旧金标、重压原包或更改冻结状态。**

- Gold 原版本：`FROZEN_GOLD_v1`；Gold 清单根摘要 `d2c317afb60bc559a4a569efff91498940908e46791dd63b92adfbe15b84e08b`。
- 原始 D 作者 Git commit/blob：`NOT_AVAILABLE`；E r01 HEAD **不是**原作者提交；本修复分支的提交只证明本轮公开增量。
- 新增的作者原件证据文档SHA：`gold_provenance_and_acl_status.md` `b5d709be6aa4268ba4ca10b629bfea21ae8907a3a823614c31f61d27ec5dc1fa`；`e_r02_fix_handoff.md` `04efdfbbac498fd27bcfe9be0bccb870b5bf37c6df47d5f1619d94effcab88ab`；以上文档由作者会话另行交付，**公开仓库不包含受控定位附件**。

## 2. 首次构建时间证据等级

- 作者原始 `frozen_manifest.json` 声明 `frozen_at=2026-10-13`，**不属于外部签名时间戳**。
- 原ZIP条目时间为 `2026-10-12 20:54:22–20:54:42`，字段**不带时区且可被打包程序修改**。
- 会话文件服务登记三包 `uploaded_at=2026-10-12T20:55:43.679546Z`，可作为上轮上传记录，但不证明构建开始时刻及访问名单。
- GitHub E0 manifest `checkedAt=2026-10-14`、E0 Git提交 `f7881dc...` 可作为独立审计已见该版本的锚点，但不是D制作现场见证。
- **首次构建时刻外部独立证明：`NOT_EXTERNALLY_ATTESTED`，不倒签。**

## 3. Gold独立性与 ACL：可证实状态

- 原D报告有明确作者自述：仅基于A/B、外部官方材料及模拟规则独立制定，未读C规则、C作者自检或答案。E0当时T01的C包未找到；**都不等于独立访问审计日志**。
- 已确证接触C正文/作者答案的案例：**无已观察证据**；但无法核验跨会话/历史访问，因此生产独立性状态仍 **`UNVERIFIED`**。所有24份Gold原则上均须接受E r02的独立性复核；不得断言任何案例已泄漏。
- 隐藏包原 `restricted_private_storage=NOT_CONFIGURED`；没有可核的受限对象 URI、访问白名单、主体实际拒绝访问测试、历史下载日志。
- C作者能否读取：`UNKNOWN`；公共CI能否在任意环境获取：`UNKNOWN`。当前默认分支未搜索到受控文件不能证明无其他公开镜像。**`LEAK_NOT_CONFIRMED` ≠ `NO_LEAK_PROVEN`**。
- Gold ACL 必须由有权存储管理员真正配置、导出权限与访问日志，使用 C/公共CI 身份复验拒访后再交E；**本轮没有宣称成功配置**。

## 4. E r02 需要重跑的项目

1. **E0**：原三包SHA与冻结清单重验；取得正式Gold隔离位置、ACL导出、时间日志及C/CI身份实际拒访的证据；核独立制作的作者声明和外部可核证据。
2. **E1**：只补T01适用的本校现行规则来源；2016试行废止问题回A，不得由D自行造2026门禁强制校规。校本未知保持 `SOURCE_PENDING/POLICY_PENDING`。
3. **E2**：由E授权人员访问受控Gold，独立复核T01受影响案的条件、权威底账与授权界线；不参照C重写Gold。若历史独立性不能证实且E有更严格门槛，交由**新的独立D作者**受控重建需要重建的Gold。
4. **E3**：必要时回归T01与T02/T03/T05/T07的身份、人员准入、施工驻场N18及许可边界。
5. **E4**：根据新固定修复版与实际复验日志才可变更问题状态；**原E r01 issue维持open**。

## 5. 仓库安全声明

只提交此公开摘要，不提交 `EVALUATION_ONLY`、可信底账、逐案答案、评分脚本、私有访问URL、受控文件ID和用户敏感信息。新的 Git commit 是**2026-10-15 增量证明**，不是历史D Gold作者SHA。

**本次最终状态：`T01_PROVENANCE_SUPPLEMENTED / ACL_EVIDENCE_PENDING_ADMIN / E_R02_NOT_RUN`。**
