# G05-T03 D v2.1｜E-G05-E0-002 定向补证（公开摘要）

> 文档增量日期：2026-10-15。D原作者单模板补证，**不是新Gold、不是E r02通过记录**。
> 原始E r01审计冻结HEAD：`0d5a1f493b2aeadcc6d65503a433e19a052ae539`；审计原文：`docs/design/review-agent/business-templates/G05/acceptance/E-v1.0/{E4-issue-ledger.md,E0-decision.md,E0-input-manifest.json}`。

## 责任边界与审计结论

- 本次只负责 `G05-T03｜校际交流及公派研修项目选拔推荐审核`，不修改其余G05 D、C模板及E r01审计。
- E r01中 `E-G05-E0-002` 是 `gold-access-gap / BLOCKED_INPUT`：审计方无法验证受控评估包的真实访问路径及ACL，**不是已证明Gold内容错误**。
- 当时 `E0-input-manifest.json` 对T03记 `GOLD_INPUTS_NOT_LOCATED_OR_VERIFIED`。本轮原会话恢复三份原始ZIP，字节级复核一致，问题仍为`ACL_UNVERIFIED`；不能据此宣布全G05 E0解阻。

## 原版资产固定SHA-256（原始内容不变）

| 类别 | 原始ZIP | SHA-256 |
|---|---|---|
| INPUT_ONLY | `G05-T03_INPUT_ONLY.zip` | `0345691064a0f0487dead197fe73d8035e05b0b091813cb326decce0b92c2f08` |
| EVALUATION_ONLY（**不在Git**） | `G05-T03_EVALUATION_ONLY.zip` | `5f7fbdc3411d258f157a72c1345e5e50bbf3d06d929cf92b46b00671f09677b7` |
| D_REPORTS | `G05-T03_D_REPORTS.zip` | `a0a4d6159cdca31267a43d366e5add424165fcfbf991ec9a55601d3c96025535` |
| A-v0.1 | `G05_A_领域总调研_v0.1_交接包.zip` | `a7c749c1702c573fc1459344d5885a5928393a629d170ffe384b2f25e37bbf42` |
| B-v0.2 | `G05-T03_B阶段深度调研_v0.2_校本补证交接包.zip` | `3c4b6201a9857d4e6f89ef57228c291d4795cfdfc84200e7b8b158615b61a128` |

`FROZEN_GOLD_v1` 的冻结索引文件SHA-256：
`be4daef8e7d1c95aac89e9a3a27560f710967e15ef4c59466e510e3f6eef8442`。

校验摘要：所有原始ZIP CRC通过；INPUT 28案、252文件；Evaluation内28个Gold JSON各自原SHA重算全部吻合。**上述只是原作者会话字节恢复和校验，非第三方ACL验证、非产品准确率**。

## 作者commit、Gold独立性和时间

- **原D作者Git commit：`NOT_AVAILABLE`**。旧D报告明确 `repository_upload=NOT_PERFORMED`，E冻结快照不存在G05/T03/D源资产。E审计HEAD不是D作者commit；本分支新增文件的commit也仅属`DOCUMENTATION_ONLY`。
- Gold初次冻结旧包自报日期：2026-10-13，版本 `FROZEN_GOLD_v1`。这是旧manifest/旧D报告中的作者声明，**没有认证时间戳、WORM或独立管理员写入日志**，不能据此还原精确UTC时分秒。本轮仅在2026-10-15重新校验旧字节，不倒签和重冻。
- **`NOT_STRICTLY_INDEPENDENT_OF_C`**：同一历史会话在D前制作过C模板、规则与作者自检；D旧报告声明生产D时没有再读C，这不消除历史暴露。E2必须独立从A+B和正式来源复核，不可仅凭C一致认定Gold正确。

## ACL核查及修复状态

- 原始Evaluation的挂载文件权限显示0644，但文件系统权限**不是**可核验的团队ACL。
- 未有经证明的私有对象URI和不可变版本ID、管理员ACL白名单导出、授权E2身份实际只读访问成功、匿名或未授权拒止结果、访问日志。
- `E-G05-E0-002(T03): PACKAGE_BYTES_RECOVERED / ACL_UNVERIFIED / E0_RECHECK_PENDING`。
- 详情见本目录的 `private-storage-admin-request.md` 和 `e-r02-readonly-handoff.md`。受控 `EVALUATION_ONLY.zip`、`gold/`、`trusted_fixtures/`、逐案标签/证据映射、scoring不可提交公共仓库/PR/普通共享Library。

## 差异范围

仅新增这些**公开无答案**的证据文档；原A/B/D整包、Gold、输入、C模板、E r01原裁定均未修改。任何公开文档都不包含逐案期待结果或隐藏评测索引。实际私有存储ACL配置由存储管理员完成；E r02独立重跑E0/E1/E2/E3，D作者不得签署其通过结论。
