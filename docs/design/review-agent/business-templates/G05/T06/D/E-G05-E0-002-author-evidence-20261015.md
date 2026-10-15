# G05-T06｜E-G05-E0-002 D 原作者证据补齐（公开元数据）

日期：2026-10-15。仅对应 **G05-T06 主办承办国际学术会议申报审核**。本文件仅是作者侧元数据补证，不是 E r02 审计结论，不含隐藏 Gold、逐案预期、可信底账或评分文件。

## 审计依据与旧文件保存

E r01 冻结 HEAD：`0d5a1f493b2aeadcc6d65503a433e19a052ae539`，**只属于 E 审计**，不可充作 A/B/C/D 作者 commit。已读取该 HEAD 的 `E4-issue-ledger.md`、`E0-decision.md` 和 `E0-input-manifest.json`，其中 `E-G05-E0-002 = gold-access-gap / BLOCKED_INPUT`，需要真实可访问的私有评估包及授权证据。

原 D 作者 Git commit：**NOT_AVAILABLE**。本业务原 D 三个 ZIP 在原会话文件中找回，ZIP CRC 均通过；两个主要包与原 D 报告自述的 SHA 完全相符。

| 原始 D 包 | SHA-256 |
|---|---|
| `G05-T06_INPUT_ONLY.zip` | `922e3ac6fb20a1314594728cf7cec5cc5bc6fd0b4ec8cec9f27c10f123ddba60` |
| `G05-T06_EVALUATION_ONLY.zip` | `5b5276df379ed79ba03c8d5d6ae49b840736543fa11d536c92407cac0566c810` |
| `G05-T06_D_REPORTS.zip` | `03d3a66f5d84c88b0c9d0055414084907d35788fe8b817f20211102179232b2d` |

原 Gold 版本：`FROZEN_GOLD_v1`；原 `frozen_manifest.json` 声明冻结日为 **2026-10-13**，这是作者记录与 ZIP 时间信息，**不构成独立可信时间戳**。原金标集合摘要为 `db8d10bc570bc9cddc26feacb1849ff7a090764c3d1e56eea63e4efcdea6637b`；22份 Gold 文件的逐文件SHA重新匹配原冻结清单。本次没有修改、重建或升版任何 Gold，也没有读取 C 阶段业务模板。

已恢复 A v0.1 总论/候选矩阵与 B v0.1（00—06）、B v0.2（07）共10份MD，原字节SHA全部与 `D_REPORTS/source_baseline.json` 一致。原作者D文件声明 `C_access=NOT_READ`，原 Gold 声明 `no_C_read=true`；该独立性证据目前是**作者声明而非第三方不可篡改访问日志**。

## ACL状态：阻断仍在

原评估包清楚声明 `private_storage_access=NOT_CONFIGURED` 与 `storage=LOCAL_SESSION_ONLY__NOT_PUBLIC_REPO`。没有经验证的私有对象地址、真实授权白名单、E2只读主体、ACL策略版本、成功读取的哈希记录或未经授权读取被拒证据。

**当前：`ACL_UNVERIFIED / STORAGE_ADMIN_PENDING`。E r01原`BLOCKED_INPUT`不变；原始受限EVALUATION ZIP绝不能提交公开仓库、公开PR或普通共享Library。**

## 私有存储管理员行动请求

1. 为 `G05-T06_EVALUATION_ONLY.zip` 提供真正私有、可版本化、可记录访问日志的存储，并保留原始字节 SHA，不重新压缩或重新生成 Gold。
2. 实际配置最小权限白名单：D资产保管者有受控写权限；E r02 指定独立 E2 审查者仅对冻结对象只读；匿名访客、C作者、被测Agent、公开PR审查者默认无权读取。记录**精确主体ID**、有效期、授权审批人与ACL版本。
3. 使用E2实际只读身份下载校验，记录对象版本及计算SHA（须为 `5b5276df379ed79ba03c8d5d6ae49b840736543fa11d536c92407cac0566c810`）；使用未授权身份测试明确拒绝。保留可复验成功/失败日志，**勿把长期令牌贴到公开文档**。
4. 管理员提供只读交付办法、撤权机制和签署的访问证据。作者没有配置ACL的权限，不得替管理员声明完成。

## E r02接续

- E0：复核整套原包的真实可达性、固定SHA、ACL白名单和拒绝访问证据，正式决定是否解除本项输入阻断。
- E1：在不读取 Gold 情况下作独立来源/风险复核，校本2017/2025政策衔接仍标 `SOURCE_PENDING`。
- E2：E1锁定后由独立审查者通过受控只读路径取得 Gold，正式核 C/D 事实而不反向改 Gold。
- E3：由独立 E r02 复核与G05-T01/T04/T05及邻近财务审批的业务边界；本作者不代表E签字。

此提交是**2026-10-15新修复元数据版本**，绝非原D冻结提交。它不修改 `audit/g05-e-v1-r01` 原裁定和原三个D包；未来E r02需自行裁定。
