# G07-T06｜C 作者原件恢复与 E r02 交接（r01 补证）

> **责任模板**：G07-T06「主办会议与培训经费结算预审」，不是 G07 全部 7 套模板。作者业务版本 **v0.1**，C 阶段交付规范 **v2.1**。本分支用于补齐第一轮 E0 的**可定位、可复验的完整 C 输入**；**不修改** E r01 原 `BLOCKED_INPUT` 裁定。

## 1. E r01 原文及冻结边界

- E0 正式裁定：`docs/design/review-agent/business-templates/G07/acceptance/E-v1.0/E0-decision.md`
- E0 覆盖与隔离：同目录 `E0-coverage-and-isolation.md`
- E0 原输入清单：同目录 `E0-input-manifest.json`
- 冻结审计 HEAD：`ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`，**这不是 C 作者 commit**。
- 源库基线：`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。本次**另开 C 作者归档分支**，没有在审计分支写入任何内容。

## 2. 复验文件

本目录提供完整 C 母版（178786 原始字节）、规则矩阵 MD/CSV（36 条）、作者自检（18 条走查）、编辑器模块候选、C→E 验收对接、历史 C→D 说明和 C v2.1 迁移核验报告。所有原始文件**字节未改**。

`C-E0-recovery-manifest.json` 逐文件提供仓库相对路径、SHA-256、原作者本地路径、作者版本与完整隔离说明。**以实际 SHA-256 检查原始 Git 仓库文件字节**。CSV 特别保留了 UTF-8 BOM 和 CRLF 换行格式。

原始 C v0.1 ZIP：`/mnt/data/G07-T06_C阶段_完整业务MD模板_v0.1_交付包.zip`，SHA-256 `c81dbee78c1fc1894b6ef6cb63f58b5c45cc1ff9729d68ffb5cc61dbdce7067a`。
原始 C v2.1 迁移 ZIP：`/mnt/data/G07-T06_C_v2.1_最小迁移验收交接包.zip`，SHA-256 `0dbc49dfe657a68350573dd97d0da3825f1d89a68991cec97bc1643536461ec3`。
**原始 C 制作当时的 Git author commit 未发现：`NOT_AVAILABLE`**。本分支的 Git commit 是**事后归档提交**，不能冒称当年 C 制作提交。

## 3. A/B 研究基线与本次边界

已恢复 A 统一目录、A 来源索引、A 校本核验及 B v0.2 八份研究文件与增量。其元数据和 SHA-256 在 `C-E0-recovery-manifest.json` 的 `sourceDependencies` 中。**这份归档只提交了 T06 C 作者公开材料，未冒充 A/B 原作者进行重新提交**；E 仍须从独立 A/B 输入通道冻结完整研究条款后方可 E1。

原 C 母版及矩阵原样保留。未发现此次 E0 可以据以裁定的 C 内容缺陷，因此**没有任何业务规则文字 diff**。若后续审计发现 B 条款不足则回 B 补证；2026 定额、酒店合同门槛、线上签到和审批权限仍为 `SOURCE_PENDING`，不能编造强制金额。

## 4. 与 D Gold / E 阶段隔离

- 本次 C 作者未读取/改动 D 隐藏 Gold、未进行 D 测试，也未执行 E1—E4。
- 公共仓库仅放 C 规则/作者自检/公开安全证据摘要，**不含** D 预期答案、隐私财务底账、管理员密钥、密封 Gold 位置或泄漏答案的索引。
- Gold 隔离在 E r01 为 `UNVERIFIED`，应由 D 和有权存储管理员独立确认，不能由 C 作者自证通过。

## 5. E r02 需要重新执行的门槛

| E 阶段 | E r02 处理 | 该 C 作者交付的作用 |
|---|---|---|
| E0 | **必须重查** C v0.1 全部 5 个核心产物、迁移交接与 sha/commit、A/B/D 其余输入冻结与 Gold 独立存放权限 | 此目录解决 T06 的 C 可定位性，但不解除 G07 七套输入及 Gold 隔离总阻断 |
| E1 | **仅 E0 门槛满足后**，按 A/B 独立冻结 H/M/L 和官方证据 | 作者不参与 E1，不向 E 提前泄漏 C 规则正文 |
| E2 | E1 锁定后才可读 C/D 对照规则映射、盲输入与授权的金标 | C 版本及 R-01—R-36 可逐件比对 |
| E3 | 后续按 E 规范检查实际包/状态/能力缺口 | C 作者没有运行系统，不提前签署结果 |
| E4 | 后续综合判定并签名版本 | 不把 C 的单项归档说成 E 已验收 |

**当前结论**：`C_G07_T06_RESTORED_FOR_E0_RECHECK`。正式 E r01 保持 `BLOCKED_INPUT`，E r02 是否可进入 E1 由独立 E 审计会话决定。
