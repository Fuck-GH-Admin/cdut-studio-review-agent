# G05-T01｜D 原作者 E-G05-E0-002 证据补齐（r01）

- 日期：2026-10-15；范围：仅 G05-T01《学术会议专项资助与成果履约审核》。
- 对照审计：`audit/g05-e-v1-r01`，冻结审计 HEAD `0d5a1f493b2aeadcc6d65503a433e19a052ae539`（**不是 D 作者提交**）。
- 正式依据：`G05/acceptance/E-v1.0/E4-issue-ledger.md`、`E0-decision.md`、`E0-input-manifest.json`。
- 审计条款：`E-G05-E0-002` 的 `gold-access-gap / BLOCKED_INPUT`。本轮找回 T01 原始包并校验哈希，**仍未验证私有存储 ACL**，不得宣布解决或 E 通过。
- 未读取 C 实质规则、未修改 Gold、未变更 A/B 定义、未跑 E 或产品测试。

## 原始字节锁定

| 原资产 | SHA-256 | 说明 |
|---|---|---|
| `G05-T01_INPUT_ONLY.zip` | `5fe9ba49dc79df027e3dd3dadac61a6f7d3c79547368ea305d1e61b612e43c1d` | 226/226 子文件复算一致 |
| `G05-T01_EVALUATION_ONLY.zip` | `d835cf1d0592d161612c7d8d074c33dcc9ddb6e2fe1ace36425985af9eb722bb` | 28/28 Gold、33/33 其它受控文件一致；**禁止上传公开 Git** |
| `G05-T01_D_REPORTS.zip` | `82aaf90a52e835594ce2e77ed7771112505e9c1cc515bc72df0b24643112c73b` | 原报告含聚合结果标签，**不可原样公开** |

原始 Gold `FROZEN_GOLD_v1` 保持不变。原受控 manifest 自报初次冻结日期 `2026-10-13`，ZIP成员时间相符；**不构成第三方可信时间戳**。已核7/7份本轮恢复的 A/B 文件哈希与原受控清单一致，但原 D 既有 B01/B03 与 A 独立交接卡缺口并未据此补齐。

原作者 Git commit：`NOT_AVAILABLE`。本分支任何提交 SHA 仅代表 2026-10-15 的增量元数据。

## 独立性与访问状态

- 原 D 作者报告声称未读过 C 业务正文，搜索结果曾出现 C 标题。本次未读 C 正文；该结论为 `AUTHOR_SELF_DECLARED_NO_C_SEMANTIC_EXPOSURE`，**尚未经独立外部审计确认**。
- `private_object_id=NOT_ASSIGNED`; `ACL_WHITELIST=NOT_PROVIDED`; `E_READ_ALLOWED=NOT_RUN`; `UNAUTHORIZED_READ_DENIED=NOT_RUN`。
- 公开 Git 与普通共享 Library 不等于带 ACL 的受控 Gold 存储；正式 E r01 `BLOCKED_INPUT` 不改变。

## 交接路径

1. 见 `ACL-admin-request.md`，由有权限的私有存储管理员建立实际只读受控对象并出具正反向权限测试。
2. 见 `E-r02-readonly-handoff.md`，E r02 复核 E0→E1→E2→E3/E4；本分支不能代替 E 正式验收。
3. 受控 ZIP 本轮只在 D 作者会话附件中可读，没有任何已核实的第三方私有访问 URL。须私下交管理员，不得在 PR 附件泄漏。

**公开限制**：此分支只允许不含逐案 Gold、可信 fixtures、评分映射、分类数量的脱敏哈希及需求文档。