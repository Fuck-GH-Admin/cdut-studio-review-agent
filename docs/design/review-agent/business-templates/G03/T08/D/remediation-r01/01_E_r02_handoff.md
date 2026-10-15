# G03-T08｜E r02 补证移交（公开非敏感）

> 2026-10-15。依据 E r01 冻结 SHA `1be43d8bacc015e1fd21949796defcdd3ecb96fc` 的 `E0-E1-blockers.md`、`E0-input-manifest.json` 和 `E0-coverage-and-isolation.md`；本文件不覆盖、也不改写冻结 E 审计结论。

## 本次做了什么

**仅 T08 D 作者范围**：恢复并读取 A v0.1 与 B v0.2 原件、原 T08 A 交接卡、D v2.1 三分包、原校验单和 D 内部 `frozen_manifest.json`；原 D0–D4 ZIP 和 Gold 完全不修改。没有读取 C 规则，没有新造案例、没有重做 Gold。

- 原件三个 ZIP SHA 均与 E r01 E0 对照登记匹配，见同目录 `00_author_provenance_and_isolation.md`。
- Gold 冻结ID `FROZEN_GOLD_v1`；内部文件31个 Gold + 31个受控底账的逐项 SHA 均核对通过；31个盲测案例，公开输入成员249项，扫描PDF共62页且没有提取文字层。
- 旧交接仍记录 D3 全扫描页面**仅抽样视觉复核**，没有追加页页OCR检查。
- 文件确实存在；**缺陷是未证明私有 ACL、未归档、原始作者Git提交链未固定**，不是目前已实证的Gold业务错误、公开泄漏或全案缺失。

## 需要归档管理员完成

| ID | 授权侧待办 | 验收凭据 |
|---|---|---|
| ACL-01 | 设独立Gold存储，指定E审阅者白名单 | 存储目录/桶 ACL 策略导出、责任人、时间 |
| ACL-02 | 对 E 审阅者测试允许读，对未授权者测试拒绝读 | 审计日志/测试编号，不能仅自称私有 |
| ACL-03 | 对私有落点Gold ZIP核SHA | 完整字节SHA与旧值 `591a56b4af4282002a24b62b008bcf7265338f1020189d11ac651f84ec45d84f` 一致 |
| PROV-01 | 补明原始 D 作者提交 SHA（如存在）与原始文件基线 | 不得使用E审计HEAD或本轮补证commit替代；目前 `NOT_AVAILABLE` |
| PROV-02 | 独立固定C v2.1候选与作者链 | C正文未被本D作者读取；E侧独立处理 |
| SRC-01 | 取得校本管理办法13号全文与实时设备配置（如走真实制度核验） | 只作为本校应用补证；不以C改写旧合成Gold |

## E r02 重跑范围

- **E0**：原三ZIP签名和文件链、ACL/允许与拒绝访问、公开输入与隐藏评估边界。
- **E1**：在不依赖C的情况下对 A/B 事实、权限范围和 D 作者独立性声明做外部核验。
- **E2**：在Gold私有权限完成后，独立比较已冻结 C 候选与 D Gold 的状态、材料和权责；如有 Gold 缺陷需来源复核后显式另版，不改 `FROZEN_GOLD_v1`。
- **E3**：横向查 T06/T07/T08/T09 的入组、培训、实际机时、送样的边界及多场景覆盖。

**当前状态**：`E-G03-DEP-001 = OPEN / ACL_UNVERIFIED`；`E-G03-DEP-003 = PARTIAL_EVIDENCE / ORIGINAL_AUTHOR_SHA_NOT_AVAILABLE`；`E r02 = NOT_RUN`。

本仓库提交的只有非敏感来源、哈希和验收需求。**隐藏 Gold、预期答案、受控mock、评分工具绝不进入公开 Git 或公开 PR**。