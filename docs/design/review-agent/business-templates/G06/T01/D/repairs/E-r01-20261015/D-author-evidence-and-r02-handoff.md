# G06-T01 | D作者补证：E r01 → E r02（2026-10-15）

> **仅新增公开安全的后验溯源资料**。不修改C、D原资产、隐藏Gold、原E裁定或任何旧commit。
> 模板：G06-T01《专利申请与校内权属审查》。原审计冻结HEAD：`1dcf4033256121efd3dea62b1153592df1facd7c`（**不是**原D作者生产提交）。

## 1. 原产物字节锁定与来源身份

| 对象 | 原始SHA-256 |
|---|---|
| A统一基线ZIP v1.0 | `60e13c8f6805e65fa4bbec89f00f30e31bc4825884da298ffded0f096795b72b` |
| B深调ZIP v0.2 | `1a66bade6f3700961fd48b214a4fd477d70ce481d91a9f9deb233fb05f99bfe1` |
| D v2.1提示词 | `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1` |
| G06-T01_INPUT_ONLY.zip | `b307059d819bf86fa26c3d4a5b340a4e72e01fcb4fa18e7ccbbcae09012b61f6` |
| G06-T01_EVALUATION_ONLY.zip（受限） | `7537cb4b690c1f56ed7a0b9edef1eb243f3f8fcfa6f5958ffeb0b090c25d75c1` |
| G06-T01_D_REPORTS.zip | `dfe888189fc74f10eaf81594a669ddb737181a6d2cd39644be2bfc251029703e` |
| FROZEN_GOLD_v1 JSON | `618063933ca956097d96d71d3a0c19e1abb1a23b5cb7fad665dd156e5fe692f9` |
| FROZEN_GOLD_v2 JSON | `fe017202d7be963740694e85afd3b5ba083ed18a67cd06cc2e9e6274525c9007` |

实测：三份D ZIP CRC均通过；输入159/159成员与原冻结manifest SHA一一一致；Gold保留24案，v1→v2仅23案的`expected_components`字段发生增量；没有改写原三包。以上系**2026-10-15事后字节复核**，不能伪称2026-10-13已存在的操作日志。与E0固定的T01三个D包SHA一致。

`ORIGINAL_D_AUTHOR_PRODUCTION_COMMIT = NOT_AVAILABLE`：原产物来自会话/Library，没有可验证的原D生产Git SHA。本Git证据提交仅属于**当前增量归档**。

## 2. 独立性、ACL的可核事实及无法证明部分

- 原D报告已披露在Gold创建阶段曾由文件检索意外看到**C文件名及开头状态片段**，未引用C规则/作者自测推导Gold。当前复核又在Gold冻结后看到C文件名及少量摘要；均需披露。因此是`C_METADATA_EXPOSURE_LIMITED`，不能宣称“绝对零C接触”。
- 原D同时留存v1、v2及自报版本日期；**不存在可提供的同期全过程工具/权限日志**。本报告为事后重建，`ORIGINAL_PROCESS_LOG_NOT_AVAILABLE`。
- 原受控包manifest的`RESTRICTED_TO_AUTHORIZED_EVALUATOR`只表示设计意图，**不是有效ACL证明**。Library显示本会话可访问，但未能提供私有对象ACL白名单、权限拒绝策略、共享主体清单、访问记录及管理员签署；`GOLD_ACL=UNVERIFIED`。
- **行动责任**：存储/权限管理员需要给出真实私有对象ID及与上述评估包哈希的关联、授权E主体、限制C/公开CI主体的有效ACL/IAM快照、访问审计日志和签署时间。D作者没有配置或验证ACL，不声称已解决。

**禁止将评估包本身、可信模拟底账、逐案答案、原冻结清单中的逐件哈希/映射或任何打分索引提交公开Git**。本文件只有外层元数据。

## 3. E1来源缺口不等于D错误

- `E-G06-T01-0001`：校方2021快速预审细则仅限相应加速通道；普通专利申报、学校申请权/变更/放弃原表及审批授权未充分证实，记`SOURCE_PENDING; RECHECK_AFTER_SOURCE_FIX`。
- 2026国家第85号令优先审查与保护中心快审不同；还应关注施行前请求的过渡适用，以及申请日期、具体流程与有权部门。
- 代理机构**推荐不等于强制**；明确禁用需查真实法人和生效日期。
- `E-G06-ALL-0002`的 **91项H缺口为G06全域来源未核项**，不是已证的91个D Gold错误。T01只跟踪与自身场景对应的局部风险，不能凭E1部分事实重做24案或擅升Gold。

## 4. E r02复验清单

| 环节 | 必要核验 | 现状 |
|---|---|---|
| E0 原始字节 | 独立复算A/B/D SHA/CRC/受控包对应；不要用audit HEAD冒充生产SHA | 作者已核，E待复核 |
| E0 生产过程 | 原D作者提交、实际同期日志及C元数据暴露影响 | `NOT_AVAILABLE / RISK_DECLARED` |
| E0 Gold存储隔离 | 由**授权存储管理员**提供实际ACL/IAM和历史访问证据 | `BLOCKED_EXTERNAL_ADMIN` |
| E1 T01来源 | 由A/B及校方来源责任人获取普通专利/校内权属/变更原件、有效日期、签章权限；独立E重锁 | `SOURCE_PENDING / RECHECK_AFTER_SOURCE_FIX` |
| E2 原模板与Gold核验 | 新E1证据解阻后，E独立读取固定C和受控D，禁止以C校正Gold | `NOT_STARTED` |
| E3 跨领域界线 | T01↔T09权利处分、T03成果入库、T05公开合规 | `NOT_STARTED` |
| E4 最终裁定 | 真实E2/E3完成后另行发布，不更改r01 | `NOT_STARTED` |

原E r01的状态仍是`BLOCKED_SOURCE`，**并没有**发现经E2证实的C/D错误。本次增量不是E r02通过证明，`GOLD_v3=NOT_CREATED`。原公开输入、私有Gold和五份旧D报告都没有修改。

正式审计依据（冻结HEAD）：
- [E4-issue-ledger](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1dcf4033256121efd3dea62b1153592df1facd7c/docs/design/review-agent/business-templates/G06/acceptance/E-v1.0/E4-issue-ledger.md)
- [E-final-verdict](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1dcf4033256121efd3dea62b1153592df1facd7c/docs/design/review-agent/business-templates/G06/acceptance/E-v1.0/E-final-verdict.md)
- [E1-supplementary-evidence](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/1dcf4033256121efd3dea62b1153592df1facd7c/docs/design/review-agent/business-templates/G06/acceptance/E-v1.0/E1-supplementary-evidence-20261014.md)
