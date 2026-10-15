# G03-T03 Gold私有访问边界｜2026-10-15

此文件仅为公开可见的阻断/待办证据，**不是ACL配置成功证明**。

## 本轮实际观察
- 两代评估ZIP均能由原D会话从普通ChatGPT Library读取并验证原始哈希。
- 目前**不能核验**独立受限存储路径、资源级权限、用户allowlist、访问审计日志与有效拒绝测试。
- 状态：`GOLD_ACL_UNVERIFIED`、`EXTERNAL_STORAGE_ACTION_REQUIRED`，**不等于已发生信息泄漏**。
- 公开仓/PR严禁完整`EVALUATION_ONLY.zip`、任何`gold/`答案、`trusted_fixtures/`模拟权威数据、可反推出答案的索引或评分结果。

## 外部存储管理员待办

| 任务 | 可复验交付物 | 状态 |
|---|---|---|
| 私有存储位置 | 有权管理员确认受限空间，公共文件中只记录非密钥句柄 | PENDING |
| 最小授权 | D原作者和指定独立E验收者allowlist，其他默认拒绝 | PENDING |
| 访问验证 | E账号正例、非授权账号拒绝、访问审计日志和时间戳 | PENDING |
| 数据完整性 | 已选Gold哈希与`D_FREEZE_SELECTION.md`中的正式Gold字节SHA相同 | PENDING |
| 权限撤销 | E完成后的权限回收责任人与时间 | PENDING |
| 公开仓核验 | E检查Git树和PR差异，确认无Gold正文、可信底账与答案清单 | PENDING |

管理员完成并由独立E复核前，不能标`ACL_PASS`，不能打开E2受控Gold对照环节。
