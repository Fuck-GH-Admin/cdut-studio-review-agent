# G03-T10｜D原作者对E r01 DEP-001/003的公开证据摘要

- **业务**：G03-04-T10，实体宣传品布设与公共位置使用申请。
- **本次性质**：2026-10-15原D作者增量证据补齐。**不修改原D资产，不读取C正文，不修改E r01原裁定，不执行E r02。**
- **E审计冻结HEAD**：`1be43d8bacc015e1fd21949796defcdd3ecb96fc`；这是独立E作者的审计提交，**不能**冒称D原作者提交。
- **原D Git提交**：`NOT_AVAILABLE`。本PR的补证Git提交是**本轮**提交，不能倒签为原D制作提交。

## 原始资产字节身份（SHA-256）

| 原始资产 | SHA-256 |
| --- | --- |
| A G03 v0.1 ZIP | `4728b8b9be2a067eca327aba346e68f567f8ec4f84f1df0ebb300f12c4c737b3` |
| B G03-T10 v0.2 ZIP | `2eef1b9d0ae6d88f3863d8a403bf35d73d192318063fc5a49ab4ca4ef83fb014` |
| D G03-T10_INPUT_ONLY.zip | `ce1e935e1f405564f84fda95d5e724a55fb364c42c853d75fe2df9124700e088` |
| D G03-T10_EVALUATION_ONLY.zip | `80df550bc6d13928fd197e607d4869ab3f126c9f9b936000d7102a68be0fac66` |
| D G03-T10_D_REPORTS.zip | `c2530f32aab59d075b07f22c3067579d01583c5f108738c35fe00263f1f8bade` |
| D G03-T10_D_FREEZE_SUMMARY.json | `6e5527bc69692ee9a9b4151be69f62c450f508f8acab3792e947a3cfaffb04ae` |
| Gold v2 JSON（**哈希，非内容**） | `60bdaee9d9c962d0071cbca8d68882c375c5e290e0f0dfaebec7c25625b8c30c` |

所有原始D ZIP SHA均与冻结E0清单一致；22个案卷、120个公开文件、48个PDF（26个图片型）保留不变。新作者补证资产通过单独对接包交付；没有把隐藏Gold、预期答案、mock底账或评分脚本推入公开仓库。

## 实际核查与增量发现

1. **恢复A/B原档案**：原始A ZIP与B v0.2 ZIP分别与E0登记SHA一致。A内`G03_00`、`G03_05`和T10 A任务卡本轮已恢复，属于**Gold冻结后的证据补齐**，不追称原D制作时已完整阅读。
2. **B单文件来源的版本差**：原Gold冻结清单中的B文档00、04、05、06的SHA对应早期独立文本；B v0.2整体ZIP中它们有**append-only**补证附录，原文前缀逐字节不变。不可悄悄改原冻结哈希；需E r02确认版本交接对应关系。
3. **离线QA元数据差**：原报告ZIP中的`offline_qa.json`记录Gold v1哈希，而原报告后增补段和独立冻结摘要明示生效Gold为`FROZEN_GOLD_v2`。这是**历史QA指针滞后**，原件保留并附勘误；尚无证据表明Gold判定有误。
4. **可公开输入泄漏核查**：实际对原输入ZIP的120个路径、ZIP头、72份文本文件及48份PDF可提取文字、元数据/XMP、注释及嵌入对象扫描；没有发现显式Gold/标准答案/预期动作标记和受控底账目录；26份图片型PDF没有可抽取文字层。**不声称已逐页人工检出所有像素潜在泄漏**。
5. **制作独立性**：A/B检索期间原作者曾意外看到少量C作者搜索摘要，未读C完整正文；`INDEPENDENCE=PARTIAL`，不能表述为C零接触。
6. **权限现状**：`GOLD_ACL=UNVERIFIED`、`PRIVATE_STORAGE_URI=NOT_CONFIGURED`、`WHITELIST_PROOF=NOT_AVAILABLE`、`READ_ACCESS_AUDIT=NOT_AVAILABLE`。普通Library出现Gold资产不等于已泄漏，**也不能证明已隔离**。配置和权限审计必须由有权存储管理员实际完成。

## 向E r02提交的最小复验票

- **E0**：锁定作者上列SHA，核B四份append-only差异、Gold v1/v2报表版本指针；证明作者原始Git SHA确实无证时标`NOT_AVAILABLE`。
- **E0 isolation**：存储管理员提供真实限制ACL、授权与未授权账号访问测试、访问日志、原公共副本处理与迁移后SHA；本轮**未解决**。
- **E1**：复核A/B校本与模拟学校范围、D作者接触C摘要的部分独立性及是否需独立重审。
- **E2**：仅在Gold真实受限授权后开展独立C/D追踪与跨模板边界检查。本轮未执行。
- **E3**：由E另行形成审计结果和变更票。本轮未执行。

**总状态**：`AUTHOR_EVIDENCE_RECONCILED_WITH_EXTERNAL_ACL_BLOCKER`；**不是E验收通过**。当前真实权限待配置应交有权存储管理员；禁止向公开PR或CI上传完整EVALUATION_ONLY、受控底账、逐案预期或评分逻辑。