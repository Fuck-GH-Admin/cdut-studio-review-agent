# G04-T03｜Gold 溯源、独立性与 ACL 状态（E r01 定向补证）

> 本文仅代表 G04-T03 原 D 作者的脱敏溯源陈述与内容指纹复核；针对 `E-G04-GLOBAL-0003 / BLOCKED_INPUT`。**不修改 E r01 裁定、不改 Gold、不认定 ACL PASS。**

## 原始制品与作者 SHA

| 原文件 | SHA-256 | 本轮 |
|---|---|---|
| `G04-T03_INPUT_ONLY.zip` | `3aeb2f6fec08d4e34e1ab6f78fce4bd033ac957f664aae7c3acf6092256c1bcd` | 原样保留 |
| `G04-T03_EVALUATION_ONLY.zip` | `3d877f439fb9e7a589f81d727d317fcefcf09bba3f37deaa08eec418b4d54350` | 原样保留，**不得公开** |
| `G04-T03_D_REPORTS.zip` | `0b35c5ee2339cc3c01c11257b89a27c707128a645568096a55c2575456c63676` | 原样保留 |

以上与 E r01 `E0-input-manifest.json` 的 G04-T03 三项一致。原 Gold `FROZEN_GOLD_v1`，30 个逐案文件 SHA 30/30 匹配原冻结清单。公开可公布的整组摘要：`30466f7622633f836903f67a4e68f1bb2ca1445cd404e1f0f2ac080e476c44bc`。A/B 冻结清单中的 12 份研究文件，在本轮恢复环境中 SHA 12/12 一致。**本轮不改原案卷、测试输入、可信底账或 Gold。**

原 D 作者 Git commit：`NOT_AVAILABLE`。E r01 审计 HEAD `fc2ace5c874454ddbcfca731be7aa093416dab12` 是 E 审计提交，**不是**原 D 作者提交；本分支新增提交也只能证明这次元数据补证。

## 时间来源（明确证据等级）

- 原 `frozen_manifest.json` 自填 `frozen_at: 2026-10-13`，只证明作者曾作此记录。
- 原评估 ZIP 成员时间是 `2026-10-12 21:01:38`（ZIP 时间无签名/可信时区）；原输入成员为 `2026-10-12 21:01:28…21:01:38`。容器后续挂载时间不代表原制作时间。
- **首次制作的外部可信时间证明：`NOT_EXTERNALLY_VERIFIABLE`。** 不依据上述值倒签或编造首次冻结时刻。

## Gold 独立性与 C 接触说明

原 D 报告和冻结清单均由作者**自述未读取** C 正文、C 规则及自检答案；此次定向补证也**没有读取 C 正文**，仅阅读 E r01 三份审计原文中提及 C 的高层审计状态。没有取得可核验的历史会话访问/第三方审计日志，因此必须写作 `SELF_ATTESTED_NO_C_READ / EXTERNALLY_UNVERIFIED`，不能声称“已独立证明整个历史过程无 C 信息暴露”。

目前没有发现可归责的某个 Gold 案例级污染证据。**缺 ACL ≠ 已泄漏 ≠ Gold 语义错误**。如后续证明制作过程确曾依赖 C，先固定污染时间线和受影响集合，交新的独立 D 作者重建，旧版本不覆盖。

## 路径、C 作者/公共 CI 访问与 ACL

| 实际或计划位置 | C 作者能否读取 | 公共 CI 能否读取 | 可核 ACL /日志 |
|---|---|---|---|
| 会话 `/mnt/data/G04-T03_EVALUATION_ONLY.zip` | `UNKNOWN`；会话容器非跨用户 ACL 证明 | 未发现经 Git 工作树自动读取，不能证明别处无复制 | `NOT_AVAILABLE` |
| ChatGPT 会话附件 / Library 原件 | `UNKNOWN`；共享或下载范围未核 | `UNKNOWN`；未发现公开 CI 使用原件证据 | 历史访问日志 `NOT_AVAILABLE` |
| 公开 Git main（E r01 冻结状态） | 只含公开审计摘要，E0 报告旧 D 原件未在仓库 | 只能认定 CI 可读公开仓库，不证明能读受控评估包 | 公开内容可读，非私有 Gold 的 ACL |
| 未来受限归档 | 待管理员明确拒绝 C 作者及未授权服务账号 | 公共 CI 应无凭证，待负向实测 | `ACL_UNVERIFIED` |

正式字段：`private_acl_storage_configured=UNVERIFIED`；`C_author_actual_read=UNKNOWN`；`public_CI_gold_access=NOT_DEMONSTRATED/NOT_PROVEN_IMPOSSIBLE`；`access_log=NOT_AVAILABLE`；`historical_link_exposure=UNKNOWN`。

## 公布边界与剩余动作

可公开事项名称、来源和原包整体 SHA、Gold 整组摘要、30 案的统计、缺口和 E r02 复验条件。**不得公开** `EVALUATION_ONLY.zip`、逐案 `gold/*.json`、`trusted_fixtures/*`、含答案配对信息的 `coverage/*` 或评分参考答案。

受控存储管理员须提供真实资源 ID、D/E 授权人名单、C/公共 CI 禁止访问的实际负向测试、共享链接和访问日志、可核不可变版本。任何今日新设置的 ACL 只能证明**今日起**的受控状态，不可追溯证明 2026-10-13 已安全。取得证据后由独立 E r02 复判 E0/E2；原 r01 仍然 open。
