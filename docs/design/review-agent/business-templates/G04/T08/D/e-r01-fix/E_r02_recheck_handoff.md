# G04-T08｜面向 E r02 的专项复验交接（仅 D 来源与 ACL 补证）

> 这是 D 原作者修复对接清单。**不改变 E r01 审计冻结内容，不声明 E 已重跑或任何设计通过。** E r01 关联：`E-G04-GLOBAL-0003`；相关作者版本依赖 `E-G04-GLOBAL-0002`。正式 E 审计入口：`audit/g04-e-v1-r01@fc2ace5c874454ddbcfca731be7aa093416dab12`。

## A. E r02 首先复验 T08 原件

1. 取回历史三个 ZIP 原字节；按本包的 `provenance_manifest_public.json` 重算整包 SHA。应等于 E r01 `E0-input-manifest.json` 中 T08 的三个归档 SHA。
2. 在 **受控环境** 运行 `python replay_verify_public.py /path/to/original-three-archives`（此脚本不输出Gold具体值），比对成员数、成员哈希、PDF图像层和 ZIP CRC。没有本地私有 Gold 权限则标 `BLOCKED_ACL`，**不要求C作者帮忙读取受控包**。
3. 针对原 D 报告 `02_Gold独立性与覆盖矩阵.md` 标错 v1 的问题，核对内部 `06_Gold版本修订记录.md` 与最终 `frozen_manifest.json` 皆为 v2，记录 `REPORT_LABEL_CORRECTED_BY_ADDENDUM`，不要修改旧报告字节。
4. 核实“首次构建日期”只能由内部自报为2026-10-13，第三方时间戳、C读取日志和原作者Git commit均 `NOT_AVAILABLE`；别用 E 审计 commit 冒充作者提交。

## B. 依检查阶段给出的复验义务

| E阶段 | E r02应当重跑的项目 | 本 D 已提交证据 | 仍然阻断或条件性触发 |
|---|---|---|---|
| **E0（必须）** | T08三包原件 SHA和成员哈希、24案结构；记录Gold原持有人、实际不可变私有位置、读取主体白名单、C/公共CI拒绝访问证据与审计日志 | 本补证公开SHA、回放脚本、制作声明、勘误 | **ACL、访问日志、首次制作的独立可信时间线未具备**；只能给 `STATIC_ISOLATION_PASS`，不能解除 E-G04-GLOBAL-0003 |
| **E1（条件性）** | 只在新A/B官方原始资料或校方现行政策确有更新时核 T08 年卡资格/费用/办理权和适用日期；否则保留E r01现行来源缺口 | B00、B07和历史2022本校来源版本保持不变 | `SOURCE_PENDING`，不得从他校或历史年卡强制拒件；不由 D 私自修本校校规 |
| **E2（条件性＋受控）** | 在证明独立制作过程与Gold访问控制后，再决定 T08 的 Gold有效性；必要时由独立于 C 的人员重新核对24案逐项Gold与模拟政策；存在实际泄漏证据时启用新的独立D重建受影响部分 | 原 v2的SHA和自洽检查，没有本次Gold内容改动 | 静态哈希一致不能证明无 C 污染；**C/D实质交叉仍归独立E** |
| **E3（条件性）** | 核查本次 D 不增删模板、不改 T08与T02临时车辆边界；仅当E2发现需修改权责依赖时再触发T02/T08跨模板回归 | 本次范围声明及无Gold/输入变化的SHA | 本轮不处理N18、T07、2016废止等其它A/E责任缺口 |
| **E4（E自行执行）** | 将上述新证据绑定 E-G04-GLOBAL-0003 新一轮差分；只有存储管理员ACL/日志和独立制作证据达门槛时，E才可讨论解除阻断 | 本包修订SHA、档案位置与核验证据 | **当前不得关闭 r01 原问题** |

## C. 必须交由有权方的实测任务

| 负责人 | 要提供的工件（不含逐案答案） | 缺失时状态 |
|---|---|---|
| Gold持有人/存储管理员 | 私有对象URI、对象版本、SHA、IAM/ACL读取列表、不可公开共享设置、历史访问日志可覆盖的时间范围 | `ACL_UNVERIFIED` |
| 存储管理员+被授权审计人员 | 在允许的D/E身份下读取成功、C作者帐号访问被拒、公共CI无凭证访问被拒的测试时间与请求ID | `C_AND_CI_REACHABILITY_UNKNOWN` |
| D作者/记录持有人 | 创建时的不可修改版本记录、最初构建流水、与 C 独立的日志/签名（若真的存在） | `INDEPENDENCE_PROCESS_UNPROVEN` |
| E独立审核人 | 逐案抽审过程、未泄漏判断与完整覆盖决定；如污染则决定新D重建并冻结 | `E2_GOLD_VALIDITY_PENDING` |
| 本校校规管理员/A-B持有人 | T08 2026真实年卡适用人群、校区、金额、效力起止及审批人 | `SOURCE_PENDING`（不拦阻虚构学校测试的结构复核） |

## D. 交接状态与边界

- 公开可获取：本补证包内 MD / JSON SHA摘要 / 脚本，和此前符合脱敏要求的输入包。
- 受控提供：`G04-T08_EVALUATION_ONLY.zip` 应由 Gold 持有人直接通过**已审核的私有通道**交给独立 E，不准让 C 作者或公共CI经手，也不通过公开 Git、PR附件或明文共享链接传递。
- **实际目前没有这个受控通道**：本会话仅能声明原受控 ZIP 的当前路径与 SHA，不能代替管理员配置私有 ACL。
- 必须保留：`E_R01_STATUS=BLOCKED_INPUT`、`T08_GOLD_ALONE_NOT_CLEARED`、`GIT_AUTHOR_COMMIT=NOT_AVAILABLE`、`E_R02_NOT_RUN`。

**建议 E r02 对 T08 暂时标记：`ORIGINAL_BYTES_VERIFIED; AUTHOR_STATEMENT_AVAILABLE; ACL_UNVERIFIED; INDEPENDENCE_PROCESS_UNPROVEN; SOURCE_PENDING`。**