# G04-T04｜Gold provenance 与 ACL 状态说明（E r01 定向补证）

- 业务：`G04-T04`｜实验项目安全风险评估审核。
- 本文件责任：原 D v2.1 作者对 `E-G04-GLOBAL-0003 / BLOCKED_INPUT` 进行证据补齐；**不改 E r01 裁定，不代表 E 已验收**。
- 审计定位：`audit/g04-e-v1-r01`，E 审计冻结 `fc2ace5c874454ddbcfca731be7aa093416dab12`。**这是 E 的冻结 HEAD，不是 A/B/C/D 作者 commit**。
- 当前材料核查日期：2026-10-15；原 D 案件规格与 Gold 未改动。

## 1. 原始 D 资产与完整性证明

| 身份 | 作者当时交付名 | 本轮找到的真实位置 | 原封不动 SHA-256 | 本次状态 |
|---|---|---|---|---|
| 可给受测者的模拟输入 | `G04-T04_INPUT_ONLY.zip` | 本会话自动挂载 `/mnt/data/G04-T04_INPUT_ONLY.zip`，原交付亦为 ChatGPT 会话/Library 资产 | `4dd6444d725e9abca750b871fe34355e3f2527de5c33c73179dea17a6773a71d` | 原件校验一致，**未更新** |
| 仅授权者可读的 Gold + mock + 评分器 | `G04-T04_EVALUATION_ONLY.zip` | 本会话自动挂载 `/mnt/data/G04-T04_EVALUATION_ONLY.zip`，原交付亦为 ChatGPT 会话/Library 资产 | `bcb195006e89d77d4fd2481afd28f43ad77510580fef23092e9438a1e486bc95` | 原件校验一致，**未更新** |
| D0–D4 完成报告 | `G04-T04_D_REPORTS.zip` | 本会话自动挂载 `/mnt/data/G04-T04_D_REPORTS.zip`，原交付亦为 ChatGPT 会话/Library 资产 | `806a2fd037a16b96cac043811ed196804a3511c97fd6e9f9fea47d8be503fe4b` | 原件校验一致，**未更新** |

以上三个整包哈希与 E r01 原始 `E0-input-manifest.json` 中 G04-T04 所列 `D_input_archiveSHA256`、`D_evaluation_archiveSHA256`、`D_reports_archiveSHA256` **完全一致**。本轮再次验证 ZIP CRC 全部通过、INPUT 197 个文件逐个对齐受控冻结清单、Gold 30 个 JSON 与模拟可信底账 30 个 JSON 的逐文件 SHA-256 对齐，两个包同名相对路径交集为 0。这是**内容一致性及静态分包证据**，不是独立制作或权限隔离的证明。

原件内部：Gold 标签 `FROZEN_GOLD_v1`，`frozen_manifest.json.frozen_at` 字面值 `2026-10-13`；输入总计 30 案。**新版本没有产生，仍是 FROZEN_GOLD_v1**。

- D 原作者 Git commit：`NOT_AVAILABLE`；本轮发现的 ZIP 属于 ChatGPT 会话/Library 交付，仓库 main 原来未包含作者的 G04-T04 D 源产物。
- D 原作者 Git blob SHA：`NOT_AVAILABLE`。
- A/B 原作者 Git commit：`NOT_AVAILABLE`。本轮能校验此前恢复的 7 个 A/B 文档 SHA，详见下方基线说明；A/B 原作者提交链不完整。
- E r01 冻结审计 commit 不是上述任何一个原作者 SHA。不得用它补缺。

## 2. Gold 原始制作时间及不可倒签原则

| 证据/时间类型 | 记录与证据力 |
|---|---|
| 作者原 D 报告自述 | `2026-10-13` 冻结 `FROZEN_GOLD_v1`。属于**同期作者自述/包内版本标签**，不是第三方签署时间。 |
| 受控包 `frozen_manifest.json.frozen_at` | `2026-10-13`，只有**日期精度**，未记录可验证时区、精确首次生成时刻、签署机构或受信任时间戳。 |
| ZIP 成员的时间 | 所有成员均为 `2026-10-13 00:00:00`；整批相同，符合重现性打包的**人为固定值**特征，不作为原始写入/首次生成时间证据。 |
| 当前容器 mtime | 是 2026-10-15 本会话挂载时间；**不能用作源资产2026-10-13产生时间**。 |
| 外部最迟见证（E r01） | E0 在 `2026-10-14` 留有上述三个完全相同的 SHA，形成**最迟已存在同字节产物的独立审计记录**。不证实 Gold 最初构建时刻。 |
| 首次生成的可独立验证日志/可信时间戳 | `NOT_AVAILABLE`。不能由 ZIP 固定成员时间、D 报告写入时间或审计冻结 HEAD 推导。 |

**冻结版本维护结论**：既有完整包按 SHA 锚定且原案答案未改；版本自述的日期保留为历史标签，不把它提升为已经独立验证的时间事实。未来若需外部可证明时间，应从今往后增加不可变对象、签名及受信任时间戳；不得倒填这些新证据到2026-10-13。

## 3. Gold 制作与 C 阶段独立性：支持与未证实事项

1. 原 D 当时 `00/01/02/04` 报告均自述：依据 A+B、直接官方源及明确的虚构学校政策建立 Gold，**没有读取 C 正式模板、C 作者自测或答案**。原报告和当前 Gold 的源版本记录相互一致。
2. 本次恢复时，**未主动打开 C 的完整 MD、规则、作者自检或答案**。本次按照用户指令读取了 E r01 官方审计的 `E4-issue-ledger`、`E-final-verdict`、`E0-coverage-and-isolation`，其中含有 E 对 C 的少量二手概述（例如审计提到 T03/T04/T05 C 正确认识2016废止）。这些审计摘要是在 `FROZEN_GOLD_v1` 既有字节固定之后阅读，**不能当成 C 原文已在初次制作前接触**；为严谨起见仍记录为`POST_FREEZE_E_SUMMARY_SEEN`。
3. 本会话可见的原 D 作业链以及当前恢复的报告支持“**原 D 作者自述未直接读取 C**”，但没有不可变的工具访问全量日志、原 D 外部工作环境日志或独立第三方对全部模型上下文的签证。故**不能对外保证历史全程完全独立**。
4. 初始 D 原作者可能接触 C 的实际证据：`NONE_OBSERVED_IN_AVAILABLE_RECORDS`；外部完整性确认：`NOT_EXTERNALLY_ATTESTED`。这两个状态不可混为“绝对未接触”。本轮**不以 C 规则反推或校正 Gold**。
5. 没有发现 Gold 已泄漏给 C 作者的直接证据，亦**不因 ACL 不明认定已泄漏**。如发现具体 C 作者在 Gold 冻结前已读取私包，应立即记录读者、时间、访问对象和可能影响的案卷；必要时按被污染范围交新的独立 D 会话重建，不由本作者照 C 修改原 Gold。

## 4. Gold 路径、可访问主体、ACL 和访问日志

| 安全问题 | 本轮事实 | 核查状态 |
|---|---|---|
| 创建当时存储方式 | 原报告为`LOCAL_DELIVERY_ONLY`；Gold ZIP 通过原会话文件交付，E 将同内容纳入 ChatGPT Library ZIP 快照 | `CONFIRMED_BY_REPORTS_AND_SHA` |
| 当前受控包路径 | 工作容器 `/mnt/data/G04-T04_EVALUATION_ONLY.zip`，属于会话临时挂载；无已验证的企业级私有存储 URL/对象版本/访问主体约束 | `EPHEMERAL_CONTAINER_ONLY` |
| C 作者能否读取 Gold | 没有可核的 ChatGPT Library 文件对象 ACL、参与者独立账号列表、分享/访问授权表和访问日志；不能断言 C 作者可访问或不可访问 | `UNKNOWN` |
| 公共 Git / 公共 CI 能否访问 | 该 Gold ZIP **不在本轮已核仓库 Git tree/提交**，因此无法仅通过当前仓库 checkout 获得；但未经核对 CI secrets、外部文件同步/连接器配置，不证明 CI 不可能有其他访问路径 | `NO_PUBLIC_GIT_COPY_OBSERVED; EXTERNAL_CI_ACCESS_UNKNOWN` |
| 验证过的细粒度 ACL | **没有** `private_gold_acl_evidence.json`、云存储策略输出或明确的人员/角色授权列表 | `ACL_UNVERIFIED` |
| Gold 真实读取/下载日志 | 没有可验证的 provider-side audit events / access log；不能推断历史无人下载 | `ACCESS_LOG_UNAVAILABLE` |
| 归档已实现的只读或不可变锁 | 未取得 WORM/object-lock/版本保护证据 | `IMMUTABLE_STORAGE_UNVERIFIED` |
| 可否把 SHA 当作 ACL 证明 | 不能。SHA只核完整性，不核谁可访问 | `NOT_PROVEN` |

**当前总状态**：`PROVENANCE_PARTIALLY_CORROBORATED / ACL_UNVERIFIED / INDEPENDENCE_NOT_EXTERNALLY_ATTESTED / LEAK_NOT_ESTABLISHED`。

### 建议有权存储管理员补交的受控证据（不得放公开 PR）

- 后台对象存储位置、不可变`object_id+version_id`与该对象整包 SHA 的匹配证据；提供给 E 的授权通路。
- ACL/成员角色快照（至少：D独立作者、E独立验收者、项目保密管理员；排除公开匿名者与 C 编辑者），以及可复验的存储服务 `GetPolicy/GetACL` 输出；只发布**不泄露路径与敏感读者信息**的脱敏结论。
- 按可用时段的真实 provider 访问审计日志（读、写、授权变更；按主体身份）。历史日志不存在时**不得补造**，标明`HISTORICAL_LOG_NOT_RETAINED`。
- 如原 ChatGPT Library 无法配置或证明细粒度 ACL，将当前**原始字节**迁入受权私有存储，原地保存 SHA 与迁移后的时间；迁移只证明**今后的访问隔离**，不追认历史一直隔离。
- E 须复核 Gold 是否曾进公开分支、公共CI工件、日志、Issue/PR附件或 C 作者可共享目录；仅凭 ZIP 名称分离不算权限隔离。

## 5. 可公开信息 vs 保密边界

允许公开：`G04-T04`业务名、D v2.1版本、案件计数30、原始整包 SHA-256、规则覆盖数量16、**不含逐案ID→规则/结果映射的**高层覆盖类别、原件是否存在及静态完整性结果、`ACL_UNVERIFIED` 与 E r02 重审动作。

禁止公开：`gold/TC-xxx.json` 全文及逐案预期、`trusted_fixtures`、`coverage/rule_case_matrix.json`、反事实配对案号与对应结果、带案号答案的评分脚本输出、受控评分器与可反推正确结果的关联索引、未经脱敏的私有访问日志/对象URL。公开修复文档不包含上述内容。

## 6. 对 E-G04-GLOBAL-0003 的修复状态

**本 D 作者已完成的是**：找回 T04 D 原始三分包、与 E r01 所记原件 SHA 逐一对齐、查原始报告与冻结清单、检查时间证明层级、公开独立性声明与未知状态、形成公开合规的 ACL 证据需求、保留原 Gold 不改并提供 E r02 重检入口。

**没有完成/没有权限替代的是**：可验证的 Library/私有存储 ACL、provider 访问日志、独立第三方对 Gold 首次构建前未读取 C 的完整证明。该事项保持 `BLOCKED_INPUT` 的相关依赖，**不得宣告 E-G04-GLOBAL-0003 已关闭**。本作者无法单方面签发外部ACL证据，也不能冒称原会话交付即私有存储。