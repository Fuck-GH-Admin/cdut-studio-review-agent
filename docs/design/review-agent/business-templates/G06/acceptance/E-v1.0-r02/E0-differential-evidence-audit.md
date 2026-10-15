# G06 E r02｜E0 差分版本与独立性复核

**审计日期：2026-10-15。结论：`E0_INCREMENTAL_EVIDENCE_VERIFIED_WITH_GAPS`，不等于 E0 来源/隔离阻断已解除。**

## 1. 冻结和版本保护
- r01：`audit/g06-e-v1-r01@1dcf4033256121efd3dea62b1153592df1facd7c`，Draft PR #28；起始 `main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。
- r01 `E0-input-manifest.json` 是46个 A/B/C/D ZIP 实字节 SHA256的来源；`E-final-manifest.json` 是 E 审计产物签署，**均不是原作者生产 commit**。
- 新审计独立分支 `audit/g06-e-v1-r02` 从旧 HEAD 分叉，新产物全部写 `acceptance/E-v1.0-r02/`，不覆盖 r01、不碰作者包和 Gold。
- r02 新发现 9 个 TXX 专属 D 作者增量分支，其全部 HEAD 与新增公开文档 Git blob SHA 已在 `E0-delta-manifest.json` 逐项固定。
- T01/T03/T05/T06 的新增作者分支从 r01 提交之后分叉，因此它们相对主分支的14/15个变更文件多数是**继承的 r01 审计文件**；真正新作者产物分别仅1/1/2/2个公开文档，严禁将 r01 全集算作 D 生产提交。

## 2. 复算范围与文件差异
- 从文件库独立拷出 2026-10-15 新增的 **10个ZIP**，均运行 SHA-256 计算、`zipfile.testzip()` 完整性检查，结果 CRC 全通过。
- 九份标记公开的作者交接包为新归档，原9×(INPUT/EVALUATION/REPORTS)的 SHA256与 r01 的正式 manifest 固定值一致；独立打开对应作者 Git 文档，对每份验证其文字报告确实列出 r01 三个旧 D SHA256（一共27次逐值匹配）。
- 这说明“新作者报告准确引用**旧版**外层哈希”，不等于E亲自重新阅读旧Gold，也不等于新ZIP曾覆盖旧包，更不是Gold业务正确性验证。
- 新公开ZIP内容仅在本轮做**文件名层**检查；未对每份文本逐字开展敏感信息查漏，故 `PUBLICATION_SAFETY_CONTENT_AUDIT=NOT_COMPLETED`。这些ZIP均仅保留在本地授权文件库，**未上传新审计分支**。
- T08另有 `G06-T08_D_Er01_LOCAL_HANDOFF_20261015.zip`（SHA256、CRC已记E0 manifest），内含 `RESTRICTED_NOT_FOR_PUBLIC_GIT/` 名称空间。只查字节、CRC、成员名，明确 `PUBLIC_GIT_EXCLUDED`，没有打开其中受限条目或把它复制到Git。

## 3. 九个分支已回答和仍未回答的核心问题
- **可限定确认**：旧D包与作者事后声明的 SHA 对得上；T09公开D21迁移原 commit `3a4ade5fcc36a5c9fc90117f5ce90cee400373ef` 存在；新作者证据 commit 已记录。**不存在本轮可验证的新C母版或新Gold**（以本次已检查的仓库分支、文件库最近新增产物范围为限）。
- **不能确认**：原 Gold 生产 Git commit、2026-10-11～13 D制作期第三方不可修改日志、原 Gold 的真实受限存储对象/IAM、E可访问而C/匿名无法访问的允许/拒绝审计、旧 C 内容是否以任何非声明方式泄漏。
- T01/T03 披露历史/事后检索 C 文件名、局部摘要暴露，分类 `D_INDEPENDENCE_QUALIFIED`，**不足以据此判定全部Gold污染**，但不能标为完全盲审证明；若未来发现涉及Gold预期制作前 C实质接触，则受影响范围须更换未污染独立制作/裁定者。
- 其他D分支普遍只有作者自述“未读C正文”而无不可篡改的生成/读取日志。正式状态 `AUTHOR_ASSERTION_ONLY`，不作时间戳回填。
- 有关 D0–D4 是**D业务测试资产生产各阶段**的自检，不等于工程 D4 技术实施或 E2 实审；禁止将报告里的“D4通过”升格为研究 E 通过。

## 4. 后续 E0 闭环需验证的真实证据
| 检查 | 责任 | r02状态 | 完成条件 |
|---|---|---|---|
| 原D生产身份和固定提交 | D原作者/项目档案责任人 | `NOT_AVAILABLE` | 原始有权来源时戳的 commit/独立过程日志，不得用此次Git增量冒名 |
| Gold持久受控对象+ACL | 私有存储管理员 | `BLOCKED_INPUT` | 对象ID、旧内容哈希、授权E只读、C/匿名拒读、访问日志与有效时间 |
| D盲审历史独立性 | D作者+第三方证据保管人 | `PARTIAL_SELF_ATTESTED` | 内容访问日志/时间证据；T01/T03暴露范围逐项说明 |
| 历史作者B/C固定版本 | 各作者+档案管理人 | `LIBRARY_SHA256_ONLY` | 可复验生产 commit 或准确说明缺失，保持旧ZIP SHA |
| 9套语义交叉复核 | E2 | `NOT_STARTED` | 新锁定独立E1+受控 Gold 访问门禁 |

**E0差分判断：新增文件真实存在、归档哈希可复算，但缺口没有因文件改名、作者补述或新 Git 分支自动关闭。**
