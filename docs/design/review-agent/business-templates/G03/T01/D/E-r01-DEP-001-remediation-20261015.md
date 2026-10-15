# G03-T01 D｜E-G03-DEP-001 定向整改公开记录（2026-10-15）

> 本文件只包含可公开的证据摘要与后续动作；没有Gold、预期答案、可信底账、评分索引或可访问私有文件的凭据。原 E r01 裁定与冻结 HEAD 不变。

## 审计与作者归属

- 事项：`E-G03-DEP-001`（原 D 交接明确 Gold 私有存储与白名单未配置）。
- E r01 原分支：`audit/g03-e-v1-r01`；E冻结HEAD：`1be43d8bacc015e1fd21949796defcdd3ecb96fc`，**不是 A/B/C/D 原作者 commit**。
- D 原始作者 Git commit：`NOT_AVAILABLE`；本次新增提交只能代表定向整改，不得倒签为2026-10-13原D冻结版本。
- 已打开核对：`acceptance/E-v1.0/E0-E1-blockers.md`、`E0-coverage-and-isolation.md`、`E1-decision.md`及`E0-input-manifest.json`。
- E r01 E1：`INCOMPLETE / BLOCKED_SOURCE_FOR_FULL_H`，不得宣称已经解除或进入 E2。

## 原始资产字节级保全

| 产物 | SHA-256 |
|---|---|
| A v0.1 调研 ZIP | `4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3` |
| B v0.2 调研 ZIP | `3dc41661e387342e80399fc8d0778ec2ed82f2113bd0a77f30ff30a712a14d57` |
| D 盲输入 ZIP | `44215c4fc1aba4a8ee6ece429ae9ba67bae29fb491de7c6f6edb4870156c68a8` |
| D 受控评估 ZIP（**不可上传公开仓库**） | `4a8f854b03b89d042cbf53e570dfc76345f9de4134232845f03408bbb13e8e9f` |
| D 原报告 ZIP | `62ce5c341ddf44c9c82a38205bf7f905ecbda6759be824f6819fbdb59ced235b` |

原Gold：`FROZEN_GOLD_v1`，30份逐案文件SHA与原冻结manifest一一匹配；30份mock可信底账也一一匹配。原记录的Gold汇总hash：`7dc1110b5aba5ef5f0792942102c2b0283454bd3b41f34af5dc00e320a0424c7`；汇总算法未单独复原，状态 `AGGREGATE_METHOD_UNVERIFIED`，不能据此宣称文件损坏。所有原D ZIP、Gold、fixture及评分文件**未更改**。

## A/B恢复发现的版本差异

已从 E0 原始Library ID找回 A、B两个ZIP，CRC通过。原D冻结中引用的两份B文件为旧字节，恢复的B-v0.2两份文档追加了第二轮本校补证：
- `G03-T01_00_独立业务深调研.md`：旧 `f07e639f62d70a6e41b74a82662451ac240e5892080153a55ea97aa7469fcd76` → B-v0.2 `542936b95ff6a06d6c4e6cc99dee641d9fe855567c91283918b19afbf79a505d`。
- `G03-T01_06_C与D双向交接卡.md`：旧 `057effd08b04cdc13abdd8eb41b7792004baeca0c43f92ebef527541f724d48b` → B-v0.2 `7e06e45edc61acdf5029517c520d29e7872d62f637d78a1e05282bb8b4759d5e`。

旧D时点不追溯改写；是否影响Gold须由E r02复核B差异及证据，不能拿后版B反向调整Gold。B字段字典和B07补证报告的哈希与原冻结一致。

## 独立性声明与访问控制缺口

- 原D作者于2026-10-13**自述**冻结前未读取本T01 C规则实质内容；本轮核对仅读E审计、A/B与原D文件，不读取C正文/作者自检。
- 完整历史零污染无法独立证明，因此状态保留 `INDEPENDENCE_UNVERIFIED`。若E发现真实接触C，应独立重建受污染Gold并显式升版，不覆盖v1。
- Gold存储与白名单：`ACL_NOT_CONFIGURED` / `WHITELIST_NOT_PROVIDED` / `ACCESS_AUDIT_NOT_PERFORMED`。**不是已证明泄漏，也不是已证明安全**。文件叫`EVALUATION_ONLY`不是访问权限证据。
- 有权存储管理员须创建真正私有的评估仓或对象存储；按最小权限允许管理员、Gold保管人、经批准的E只读审查员，排除匿名与公共CI；留实际私有URI、授权账号/批准单、读回SHA、成功/拒绝访问测试、审核记录与撤权证据。不得在本公开文档写真实账号、令牌、私有路径或个人信息。

## E r02 对接（不代替E执行）

1. **E0**：重新比对原包hash、A/B来源版本，检查真实私有URI、ACL白名单、审计日志、匿名/未授权拒绝测试。未配置前继续`BLOCKED_INPUT`。
2. **E1**：独立完成原规范H/M/L事实与2026本校权限/资源来源复核；历史C接触证明仍`INDEPENDENCE_UNVERIFIED`，不能自签通过。
3. **E2**：仅在E1完整锁与ACL实证完成后，按获授权的私有渠道读取C与Gold，核查B→C→D；本轮没有执行。
4. **E3**：核对slot级授权、模拟政策/真实校规边界、过期、可信日历、合法替代、人工签批限制；本轮没有执行。

本次仅在独立修复分支写入**公开安全证据摘要**。E r01审计文件、C模板、模拟盲输入、受控Gold和可信fixture均未在本提交修改或上传。完整增量对接文件由原D作者另行交付，只有存储管理员完成ACL才有资格供E关闭DEP-001。
