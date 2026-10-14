# G06｜E v1.0 独立交叉验收 r01 · 状态与续接

**当前正式状态：`BLOCKED_SOURCE`（E1 部分来源复核完成，E2/E3/E4 未进入）。不签 `PASS_DESIGN` 或 `PASS_WITH_LIMITATIONS`。**

- 审计者：独立 G06 E 会话，未参与该领域 A/B/C/D 制作。
- Git 审计分支：`audit/g06-e-v1-r01`；固定起点：`main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`。
- 领域目录：T01～T09 全部，T10 仅 A 待证候选。
- **E0（已完成）**：`E0-input-manifest.json`、`E0-coverage-and-isolation.md`、`E0-decision.md`，含 T08 B02 追加 `E0-addendum-T08-B02.md`。46 份原件 ZIP 已完成逐包 SHA-256 与 CRC；B/A/C/D 绝大部分仍在个人文件库，不能虚构作者 Git SHA。
- **E1（独立事实快照已锁、整体不满足全量出口）**：`E1-official-fact-register.md`、`E1-adversarial-hypotheses.md`、`E1-supplementary-evidence-20261014.md`、`E1-evidence-lock.json`。原始 B 候选义务 159（H142/M17/L0），基线 H 51 仅限已证情形，91 待补证；增量两项官方来源事实仍不改变整体阻断。
- **E2（阻断）**：未读取 C 的规则正文或 D 隐藏 Gold 答案；未制作虚假的来源→B→C→D→E 对照或逐模板 verdict。
- **E3（未开始）**：仅由 A 目录固定了九模板和 T10 待证候选，不把 A 目录复述算作横向实审。
- **E4（未开始）**：`E4-issue-ledger.md` 仅存来源/版本依赖阻断，`E4-retest-ledger.md` 只记录待复验入口，不以其名称声称 E4 已签署。
- 分维度临时裁定见 `E-final-verdict.md`；文件 SHA/版本清单见 `E-final-manifest.json`，该两文件均**标明中止状态**。

## 下一轮续接程序

1. 优先取回 T01/T09 校内权属和处分原 DOC、T02 软件著作权承诺表原 DOCX、T05 保密表及适用性原文、T07/T08 伦理机构/受理授权材料、T06 新闻审签管理文件、T03/T04 历史更正/身份权限文本。
2. 对每项补证固定原始 URL/本校档案、政策有效期、对象、时点、条款定位、SHA；作为 **E1 新增版本**追加裁定，不覆盖 r01。
3. 全部适用 H 条的真值和剩余限制处理到足够安全时，先生成新的 E1 evidence lock；只有达到规范的盲审前置条件，才允许打开 C 正文和隐藏 D Gold。
4. 如必须为来源待定、但边界完全独立的局部 E2 做有限比对，须先建立明确局部任务/范围新版本；仍不能给 G06 全范围 `PASS`。
5. 作者分支修订须以新 SHA、新批次提交；E 不代替 A/B/C/D 修文件，不把工程 D4、真实模型评分、学校正式行政授权计入本验收。

**红线**：`E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION`。
