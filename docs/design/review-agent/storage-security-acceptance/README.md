# CDUT Studio｜storage-security-acceptance v0.1（跨 G02–G08）

> 独立的**存储保管与权限治理基础设施**；不是 E v1.0/v1.1 的替代规范，不参与 E1/E2，不编造 Gold、不迁移/覆盖旧 Gold。公开安全审计入口，不含任何私有 Gold 真值、内部对象 URL、私库精确路径或认证凭据。
>
> 首次治理记录：2026-10-16；公共代码基线 `main@8989941b6fb5651564e32d11c4215b6a6d5a5209`（本分支创建时）。跨域旧 E r02 原有裁定一律有效。此报告的时间仅说明**本次**操作；不得倒填原 D 生产/冻结时间。

## 0. 总裁定和证据层级

**真实 Gold 私库接入：`NOT_CONFIGURED`（截至本验收，无可核实的统一云/组织级保管系统及逐身份授权/拒绝证明）。**

**沙盒权限机制：`ACL_PARTIAL / SYNTHETIC_ONLY`。** 在隔离 Linux 临时目录，以不同 UID 实际执行两版测试对象的只读允许、C/D/CI/普通读者的权限拒绝、撤权后 E 拒绝；17/17 操作符合预期。证明仅限该机器的 POSIX DAC，不代表云 IAM、私有 Library、存储提供商或者真实 Gold 已完成 ACL 验收。真实执行细节见 `synthetic-posix-observed.json`，复跑工具见 `scripts/storage-security/posix_acl_probe.py`。该测试不接触任何原始 Gold。

术语不可混用：

| 标记 | 严格含义 | 当前使用范围 |
| --- | --- | --- |
| `ACL_VERIFIED` | 针对**实际受保护对象及固定对象版本**，可独立核实存储策略/身份快照、真实 E 成功取回并核对字节、C/D/公有 CI/匿名拒绝、撤权后 E 拒绝、分享链接排查、提供商端操作日志；审计证据加密留存 | **无** |
| `ACL_PARTIAL` | 有真实执行的某些 ACL 正反例，但尚未达到上述全部条件；明确试验环境及缺口 | **仅本地测试对象机制试验**，不得转记为 GXX Gold 状态 |
| `NOT_CONFIGURED` | 尚无此对象对应的、足以验证的实际统一受控存储配置和身份/访问试验；不推断历史副本是否仍存在 | **G02–G08 实际 Gold 接入** |

不以「Library/文件库中有东西」「private 命名」「GitHub Draft PR」「仅下载哈希」「作者声明」「公有 Repo 仓库管理员权限」「Mock 身份切换」「本地 POSIX 测试」升级为实际 `ACL_VERIFIED`。

## 1. 接入母集（同一套系统，不是七份库）

基于 r02 审计核实的研究范围；不将仅条件研究的 G02-T03 自动批准发布。逐项对象采用 `template_id + asset_class + immutable_version_ref`，未枚举的历史版本必须另外盘点。

| 领域 | r02 范围 | 历史 E 审计入口 | 受保护真实 Gold 当前状态 |
| --- | --- | --- | --- |
| G02 | T01、T02、T03（条件候选） | PR #63 / `audit/g02-e-v1-r02@345666f1d2a60c93a3ea4525663aba4ba03112a0` | `NOT_CONFIGURED` |
| G03 | T01/T02/T03/T12/T06/T07/T08/T09/T10/T11 | PR #69 / `audit/g03-e-v1-r02@ad74aa70fa284af71973d3344e6ff8caeb089156` | `NOT_CONFIGURED` |
| G04 | T01–T08 | PR #68 / `audit/g04-e-v1-r02@742d2aa63dfac4eac3d07374369ad9f038d6838e` | `NOT_CONFIGURED` |
| G05 | T01–T06 | PR #65 / `audit/g05-e-v1-r02@20a65e5f47626e438a050852b19bf0643eeed3be` | `NOT_CONFIGURED` |
| G06 | T01–T09 | PR #70 / `audit/g06-e-v1-r02@1eabfb9490257f77f81a2401430bb71c76e0c683` | `NOT_CONFIGURED` |
| G07 | T01–T07 | PR #67 / `audit/g07-e-v1-r02@ff8d55026f45b09d3d4955167a6cbc4b4e8e409e` | `NOT_CONFIGURED` |
| G08 | 本轮 E 的 T02/T03 | PR #66 / `audit/g08-e-v1-r02@f44f91c2cea545176d87bcc3ec517be7678ad779` | `NOT_CONFIGURED` |

此表是**单一跨域基础设施状态表**，不是各 E 主审提交新的 ACL 报告；后续通过增量清单添加对象和证据，不覆盖原 E 裁定。对象数随模板及历史版本展开，不可把上表的模板数冒充已接管对象数。

## 2. 对象、身份、权限矩阵（默认拒绝）

每个 `GXX-TXX` 单独创建以下**逻辑对象类型**，每次修订新对象版本，不重用标签覆盖原字节：

- `PUBLIC_INPUT`：公开、经脱敏的 D 输入包；完整 ZIP 字节 SHA-256 可公开登记。
- `C_AUTHOR_PACKAGE`：C 母版及作者来源；由 C 作者发布，独立 E 仅在其 E1 事实锁形成后按相应流程查看。若 C 本身已经公开，存储 ACL 不能实现「此前 D 从未看见」。
- `D_GOLD_RESTRICTED`：隐藏答案、逐案预期、可信 Mock、精确锚点及包含结果分布的元数据。生产者 D 可在隔离写入环境生成并**只追加上传新的独立版本**；上传结束后不得通过共享库列出或读回。另行管理原制作工作区的接触证据。
- `E_PRIVATE_FINDINGS`：E 的受限交叉验收过程与逐案对照，仅已授权 E 可读/创建自己的新版本。
- `AUDIT_RESTRICTED`：提供商原始权限策略、主体 ID、版本 ID、访问请求/响应、真实对象清单和历史时间戳证据；存储管理员+指定独立安全复核者可读。
- `PUBLIC_ACCEPTANCE`：本文件、脱敏状态、不可逆对象引用、公共格式日志，不含 Gold/精确私库定位。

| 身份 / 动作 | PUBLIC_INPUT | C_AUTHOR_PACKAGE | D_GOLD_RESTRICTED | E_PRIVATE_FINDINGS | AUDIT_RESTRICTED | PUBLIC_ACCEPTANCE |
| --- | --- | --- | --- | --- | --- | --- |
| 匿名普通仓库读者 | GET | 仅 C 已公开版 GET | **DENY ALL** | **DENY ALL** | **DENY ALL** | GET |
| 公有 CI（含 fork/PR） | GET | 可读公开版 | **DENY ALL** | **DENY ALL** | **DENY ALL** | GET/无权限扫描 |
| C 原作者具名主体 | GET | 自己的范围内 CREATE new revision | **DENY ALL** | **DENY ALL** | **DENY ALL** | GET |
| D 原制作者具名主体 | GET | 仅公开版 GET，访问时间须记账 | **CREATE-ONLY single new version after approval; GET/LIST/DELETE DENY** | **DENY ALL** | **DENY ALL** | GET |
| E 独立评测者具名主体 | GET | 仅流程准入后范围化 GET | **限定 GXX-TXX + versionRef + 时段的 GET；LIST/PUT/DELETE DENY** | 自己案卷的 ADD/GET | 默认 DENY；只能读脱敏回执 | GET |
| 存储保管管理员具名主体 | 管理元数据 | 管理元数据 | 管理策略，Break-glass 正文读取须双人批准与审计 | 管理策略 | 管理，限职责 | GET/发布 |
| 独立安全审计者具名主体 | GET | 仅元数据 | 默认**不读答案**；只查元数据与拒访证据 | 受控审计摘要 | READ 审计必要范围 | GET |

`ALLOW` 仅指服务端实际身份授权；浏览器隐藏按钮、客户端筛选、环境变量检查均不能代替。不得授予 repo-wide GitHub token 可从公共 workflow 拉取私库 Gold。D 的 create-only 权限须绑定不可覆盖的随机对象 key/服务端版本，禁止复制现存 Gold 的内容或更新旧版本。E 的授权要在**E1 正式独立冻结 + 存储主管许可**后开放；本合同本身没有授权任何 E 立即进入 E2。

## 3. 推荐真实存储拓扑及配置前置条件

**推荐独立私有 S3 兼容对象存储或具备等价 IAM/版本冻结/访问事件审计能力的服务**，与公共 GitHub 和当前普通 Library 分离；不是要求各领域自建存储。若使用 AWS S3，则上线前需实际核实：bucket public access block、账号级 public block、versioning、Object Lock（需要在建桶时按提供商要求启用）、retention/legal hold、SSE-KMS、按主体短期凭证及 `s3:GetObjectVersion` 严格限制、CloudTrail S3 *data events*（仅管理事件不够）、事件保留与导出。非 AWS 应逐条给出等价能力证据，不得凭品牌名称默认合格。

**前置：**指定唯一存储 owner；注册 C/D/E/CI/安全审计具名主体及证书/SSO 映射；建立两个物理安全域（公开素材、独立 Gold 私域）和版本不可变策略；使用无案例信息的随机对象引用；设置服务端自动化权限快照/数据访问审计；确认备份、旧副本、恢复、删除/保留和泄漏应对。禁止在普通 GitHub Actions、公有 PR、公共 issue 放身份令牌、私有 URI、完整策略里包含的私有 key、受限 manifest 或 Gold 样本。

存储对象登记至少区分：

1. `archive_ledger`：**旧** ZIP 的 SHA-256、字节长度、实际取得渠道、历史原件版本、`verified_by` 和 `verified_at`，未真正取得的标 `CLAIM_ONLY`。这项不等同云存储新版本字节哈希。
2. `custody_ledger`：**新**存储对象的 opaqueRef、提供商对象版本 ID（仅私账）、独立下载 SHA-256、upload/verification timestamps、WORM/retention 证据、谁有权限；用 `content_equivalence=VERIFIED/MISMATCH/NOT_TESTED` 明示旧/新字节关系。
3. `history_ledger`：首次 D 制作时间、当时是否见 C、C 搜索片段/摘要暴露、原 D SHA/外部时间戳/会话日志、是否真正新独立 D。此账不得由现在创建的对象时间/ACL/log 补全过去。
4. `access_ledger`：真实 IAM principal ID→role 映射（私账）、操作名、版本、结果、服务端 request/event ID、时间、策略版本、撤权前后窗口；公共只放抽象 role+结果及完整审计证据的 opaque 索引。

对象元数据的**公开版**采用 `public-object-register.schema.json`，私有版本/真实路径单独留在受保护账簿，不采用「完整私账传 Git 再删除」的工作方式。Git 历史删除不能抹掉已被 fork/cache/download 的内容。

## 4. 真正部署后的单次集中 ACL 验收（只需一次机制验收，之后逐对象接入）

由**独立存储管理员**创建一个完全人工虚构的受限 test-only 对象（至少两个不可变版本），单独测试，不复制任何旧 Gold 真值。让 SSO/提供商真正的 E、C、D、CI、匿名/仓库普通读者五种身份各自持有**相互独立**的真实临时令牌；记录 identity provider issuer、principal ID、认证方式、STS 身份以及 policy snapshot SHA 到**私有审计账**。同一管理员改换前端 UI 角色不算试验。

最低真试验记录（须含服务端 request/event ID 与对象版本/字节）：

1. 公有 INPUT：匿名和公共 CI **GET 成功**；检查包内无隐藏答案及推断真值的 metadata。
2. 私有测试对象 E：只授权 E 的确切 GXX/TXX+版本+时间窗口 `GetObjectVersion`；实际 GET 回来并比对 provider 对象与旧/新双 SHA，不能仅 HEAD/看见文件名。
3. 私有测试对象 C/D/公共 CI/匿名：分别对 `GET/HEAD/LIST/LIST_VERSIONS/GET_OBJECT_VERSION` 以及 share/presign 或等价 URL 途径进行拒绝访问验证（提供商可能以 403/404 隐藏存在，须结合服务端日志判定）。
4. 撤销 E 对同一测试对象访问，清除/等待有效凭证与缓存窗口，再**实际 GET 拒绝**；不能只展示 ACL 表更新。必须测试旧预签名链接过期/吊销策略，确认链接仍有效的窗口并停止扩大授权。
5. 核实公开分享/组织链接/匿名 ACL/桶策略/公开静态网站/镜像 CDN 及复制副本；逐项提供实际检查动作、结果和快照。如提供商不支持 URL 枚举，记录只能证明检查到的范围；`NOT_VERIFIED` 不得写 `NONE`。
6. 核证访问审计从服务端独立回读，涵盖成功与拒绝、策略修改与撤权；对事件缺失明示 `LOG_GAP`，不能根据客户端输出伪造服务端日志。

**升级 `ACL_VERIFIED` 的条件**：上述实测通过 + 原始受限证据具有防篡改存档与复核人签名 + 真实 Gold 的特定对象/版本迁移和权限继承经单独检查。先做 test-only 环境只是**机制**验证；若云端仅测试了匿名拒绝，状态为 `ACL_PARTIAL`。每个新 TXX只做导入清单、绑定版本/权限继承和抽样 GET/DENY，而不是从头发明系统。

本次因没有用户授权可操作的真实私库/IAM/具名独立身份及提供商审计接口，**上述线上步骤尚未执行**；不把本地 UID 试验写成云端/Library 审计。真实对象原始日志必须留在受控账簿，不在 PR 上传。

## 5. 历史 Gold 独立性不因 ACL 追认

- **G03-T06**：原 D 明示先见 C 实质规则并在同会话制作，旧 `FROZEN_GOLD_v0_PROVISIONAL_CONTAMINATED` 永远不恢复 `STRICT_INDEPENDENT`。原件只冻结保全；交未接触 C 的新 D 建新的唯一版本及制作过程证据。见 PR #69。
- **G05-T02/T03**：原 D 创建前见 C，不能以新哈希、今日上传时间或独立 E 的后续读取洗白。新 D 另建版本，保留旧版本风险标签。见 PR #65、D 补证 PR #52/#55。
- **G04-T05/T06/T08**：重复冻结标签/报告版本漂移，先按历史 snapshots 的对象版本/字节/真实制作时点逐一重放，不能把同名 `FROZEN_GOLD_v1` 当作不可变对象证明；见 PR #68 与 G04 研究性 PR #75。
- **G05-T04**：r01 旧 manifest/report 曾公开聚合预期标签/案例结果频数；后续 `E0_SAFE_MANIFEST` 无该数据只是**向前减少泄漏**，不恢复已暴露的旧审查者盲态，下一轮源事实应给未见该统计的新 E1。见 PR #65。

不对未证实受污染的其他 TXX进行扩张推定；采用 `INDEPENDENCE_UNPROVEN`、`CONTAMINATED`、`CLEAN_NEW_D_VERIFIED` 区分，且只允许凭历史制作证据/真正全新 D 升级，不允许因 ACL_VERIFIED 自动升级。

## 6. 公共外泄面最小化

公共清单允许：领域/模板代号、对象**不含真实存储定位的随机 opaqueRef**、公共包字节 SHA-256、外部证据的非敏感引用、接入状态、是否复验。**默认禁止**：Gold 聚合标签、单例预期、精确案例结果分布、可逆案例映射、trusted Mock、Gold 成员路径、完整云对象 key、精确私有路径、签名 URL、访问令牌、云策略里可见的受保护定位、审计正文。细小样本的聚合统计也可能泄漏，应默认只报 `REDACTED` 而非设一个不适用的固定 k 阈值。

附 `scripts/storage-security/public_manifest_guard.py` 对待发布 JSON 的危险字段、URL/token 形态做**预防性静态拒绝**；必须在审核候选 manifest 后运行，检测 PASS 不构成历史仓库无泄漏证明。历史 PR、commit、附件、fork、缓存、旧 Library 的审计为**尚未完成的独立暴露处置**，不能在公共报告把已经存在的敏感值二次引用或贴真实链接。发现外泄应记录非敏感 issue ID 和受限处置记录、撤销可用链接/凭证、评估盲态并决定是否换 E；不要仅删当前文件后宣称清除。

## 7. 本次真实沙盒试验与它不能说明什么

`synthetic-posix-observed.json`来自本次实际执行 `python3 scripts/storage-security/posix_acl_probe.py` 的本地临时目录：单机 Linux root 管理员创建两个版本；E_GROUP 可读，两类公开输入可被 CI/普通用户读；C、D、CI、读者对私有版本的真实 Unix UID 进程读请求被拒；root 收回 E 文件夹遍历权后重新试读失败。原始工具执行结果可复跑，公开日志只含 UID/动作/预期结果、内容的虚构 SHA，不含路径或数据。**17/17** 属真实 POSIX OS 权限检查，但**没有**提供商身份、云策略快照、公开链接机制、云端数据事件、旧 Gold。

本脚本严格只创建固定虚构字节，不接收用户目录/真实 Gold 路径。需 root + `setpriv` + Python3；独立评测机器无 root 则记 `NOT_RUN_ENVIRONMENT`，不可替换成 `chmod` 静态截图。

## 8. 后续接入责任与最短路径

存储管理员部署单个真实私域并建立私有证据账 → 指派独立 IAM principal、完成真实 allow/deny/revoke/share-link 提供商端试验 → 升级**基础设施机制状态** → 各 D 只追加导入受限历史 Gold **且保留污染标签**，对每个 objectRef 独立 hash+version+历史来源分账 → 存储审计员复核继承权限 → 具备 E1 正式门槛的 E 由管理员定向临时授权，适当时才另行进入 E2。

**当前要做的是接入真实受控存储；不是让七个领域 E 主审再写七份 `ACL_UNVERIFIED`。** 在真实身份与提供商 API 缺席时，本 PR 只接受合同、静态扫描工具、隔离 UID 实测和真实阻断状态，绝不推动 E PASS。
