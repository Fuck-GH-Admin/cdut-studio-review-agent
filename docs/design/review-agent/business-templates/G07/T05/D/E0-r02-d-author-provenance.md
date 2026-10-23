# G07-T05 D v2.1｜E0 r02 作者资产补证（公开摘要）

核验日：2026-10-15。业务：G07-T05 科研劳务、助研及专家酬金发放预审。

本文件是 D 原作者对 **E r01 的 E0/BLOCKED_INPUT** 提供的定向证据，**不是** E r02 的放行结论，也不是 D 原作者历史 Git commit。审计冻结提交 `ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab` 只属于 E 原审计分支，原审计文件不修改。

## 已重新核验的原始完整产物（原包字节不变）

| 文件/依据 | SHA-256 |
|---|---|
| `G07-T05_INPUT_ONLY.zip` | `dda09b0c8028d6dea6cfdca602cd2ec91badd83c268389fa4c93068cfbce2b9b` |
| `G07-T05_EVALUATION_ONLY.zip` **私有，不得上传公开仓库** | `8be556e4cb8568b2da3203d632d33f3ba0377fa5508fe4873c484478f1a56486` |
| `G07-T05_D_REPORTS.zip` | `18c70b769442757ee4dfc892cd9688ebd59f2b40ef240193100b445b16cc0aeb` |
| Gold集合 `FROZEN_GOLD_v1.0` 的聚合摘要（不含答案） | `357c96f5c5a0950d9bb895edb065da9f0622999f5df00fb724e8e9a6d18033e4` |
| G07 A v0.2 研究 ZIP | `9da75137b5a9cb3f948a623a655d99fa7b6ce11e9138107518272a42b799e213` |
| G07-T05 B v0.2 研究 ZIP | `ec5459dff9acd8144509a59b87ec28520ff7fda02e2588534e827a55b0d76e6a` |
| D v2.1 正式规范 | `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1` |

核验证据：分别重新读取原附件三个 ZIP、A/B 研究 ZIP 与 D v2.1 规范；对 28/28 份 Gold 文件及 192/192 份盲输入逐文件计算 SHA-256，均与 `frozen_manifest.json` 逐项相符。输入案卷28案、申报30行、PDF61份共64页，PDF图像与无可提取正文层检查通过；三个ZIP CRC通过，输入与评估条目分离。**这只能证明当前字节和原自述冻结清单一致，不独立证明当年时间先后、业务 Gold 正确性或模型准确率。**

原 D 作者报告自述先冻 Gold 再造输入、未接触 C；本轮作者不读取 C 的正文，但没有第三方制作过程见证，**独立性强证明仍未获得**。原 D 作者的历史 Git SHA：`NOT_AVAILABLE`，不得使用审计提交号或本次证据补交 commit 伪装。

受控 Gold 当前完整字节仍可在 D 原作者对话附件取回，**没有已证明的远程密封存储、审查者 ACL 或访问日志**：`ACL_UNVERIFIED`，管理员 `STORAGE_OWNER_UNASSIGNED`。公开 Git **严禁**上传 Gold、trusted fixtures、case reasoning、任何逐案答案或可解题评分文件。

相关 E r01 原文：
- [E0 decision](../../acceptance/E-v1.0/E0-decision.md)
- [E0 isolation](../../acceptance/E-v1.0/E0-coverage-and-isolation.md)
- [E0 manifest](../../acceptance/E-v1.0/E0-input-manifest.json)

**当前状态**：`T05_D_ASSETS_RECOVERED_AND_HASHED_LOCAL`；`E0_G07=BLOCKED_INPUT`（保留），`E1-E4=NOT_RUN_BY_D`。本次仅补证T05，不代表另外六套已补全。
