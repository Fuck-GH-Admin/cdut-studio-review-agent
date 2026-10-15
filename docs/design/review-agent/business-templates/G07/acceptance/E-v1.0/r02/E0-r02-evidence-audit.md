# G07 E v1.0 r02｜正式差分证据盘点与 E0 裁定

> 审核日期：2026-10-15；本次是 **r01 后的差分续审**，非重新开展首轮 E。基础 Git: `main@dd5a553c34a92b559559a7cb3c4e9c3f67fd9c8e`；r01 审计冻结 `ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab`、Draft PR #26（保留不改）；新分支 `audit/g07-e-v1-r02` 仅写独立审计。 

**结论：E0 取得可核验增量，但 `BLOCKED_INPUT` 未解除。E1 尚未启动，E2/E3/E4 没有业务验收结果。**

## 一、r01 证据继承与校验

- r01 分支、PR #26、冻结 HEAD 和 `E0-input-manifest.json`、`E0-coverage-and-isolation.md`、`E0-decision.md`、`README.md` 均实际读取验证。
- r01 唯一已正式执行的阶段是 E0。其 E0=BLOCKED_INPUT；E1–E4 未开始。r01 没有编号式正式 P0/P1 缺陷票，只有 E0-decision 中三个依赖门槛。本轮给它们编 r02 追踪 ID（见 issue ledger），不可追认成 r01 原票号。
- r01 A 统一目录 7 模板 SHA256=`64a771d60e7ea68a040c4d7fd551c246bf3cd123e0ca60a8f7d9d4ea245ee4c4`；r01 已核的 B-T04 `2477c565…`、B-T05 `f261ff47…`、B-T07 `3971dc75…` 重新对同一当前 Library 字节核对，无差异。r01 SHA 不算新的作者提交。
- Git main 未因为这些作者分支产生自动发布。所有作者恢复分支相对于冻结 main 为 *ahead* 的独立快照，不得混合提交形成“原作者统一基线”。

## 二、各模板本轮新交付与复核深度

| ID | 业务审核目的 | C 冻结候选所在新分支及 SHA | E实测 C母版 Git blob SHA-1 | D补证分支 HEAD | E独立 D 输入完整性 | Gold安全 |
|---|---|---|---|---|---|---|
| G07-T01 | 活动、竞赛与科研直接费用报销 | [author/g07-t01-c-e0-recovery-r01](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/author%2Fg07-t01-c-e0-recovery-r01) @ `0fff12c5b5` | `8a998496a49fff82fbb57bd8894c2f7bf646ec6f` | D证据@ `d5ebbf133b` | D仍为作者单方报告 | ACL未核 |
| G07-T02 | 因公与学术交流差旅核销 | [restore/g07-t02-c-e0-r01](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/restore%2Fg07-t02-c-e0-r01) @ `1564a20fb9` | `46c48f80df90e99274986633ae29d7d407ed84b9` | D证据@ `75172204f0` | 输入ZIP独立hash/CRC相符 | ACL未核 |
| G07-T03 | 物资与服务采购事前合规 | [fix/g07-t03-c-e0-r02-handoff](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/fix%2Fg07-t03-c-e0-r02-handoff) @ `e9f4db8217` | `734f9fdeb16ee25c8b4e5b339b02a2af9baf1aee` | D证据@ `6423f658c4` | 输入ZIP独立hash/CRC相符 | ACL未核 |
| G07-T04 | 采购及委托服务履约结算 | [handoff/g07-t04-c-e0-r02](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/handoff%2Fg07-t04-c-e0-r02) @ `4f914de38e` | `9a629e8c6e6e9bf4c348fe413c32b564e50f580d` | D证据@ `759c8f0aa0` | 输入ZIP独立hash/CRC相符 | ACL未核 |
| G07-T05 | 科研劳务、助研与专家酬金 | [author/g07-t05-e0-r02-input-recovery](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/author%2Fg07-t05-e0-r02-input-recovery) @ `780cd209ce` | `6a7ef0cdd10ecaa7e851d6dc43a728a669484106` | D证据@ `7930ec3104` | D仍为作者单方报告 | ACL未核 |
| G07-T06 | 主办会议与培训经费结算 | [author/g07-t06-c-r01-e0-input-recovery](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/author%2Fg07-t06-c-r01-e0-input-recovery) @ `0fbd811f9f` | `c3be13c801a56300e71e2a468632d263f8fa2de8` | D证据@ `9ead5d8034` | 输入ZIP独立hash/CRC相符 | ACL未核 |
| G07-T07 | 项目借款与事后冲账 | [author/g07-t07-c-e0-input-recovery-20261014](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/tree/author%2Fg07-t07-c-e0-input-recovery-20261014) @ `41b88bab6f` | `f6d9c8c2820b165b6010fecddc1dde5a478a9ac2` | D证据@ `5c43a7058c` | D仍为作者单方报告 | ACL未核 |

- **C**：七份 `正式业务模板_MD_v0.1.md` 均已经在各自分支上定位，并从 Git contents API 获取不可变 Git blob SHA。业务正文仍未阅读。七份“SHA256”来自作者源 manifest，本 E 独立核验的是 *Git blob 路径存在和 blob SHA*，**未把作者所报 SHA256 伪称本 E 已独立重算**。旧 r01 没有同一 C 文件已冻结 SHA，无法计算真正的“旧C→新C”语义 diff；本轮实质是 **E0 再现性恢复，不是 C 规则整改已合格**。
- **D**：全部七套有公开补证提交；均写明原作者 D Git SHA `NOT_AVAILABLE` 或同义。外层 `EVALUATION_ONLY.zip` 作者 SHA 放在 `E0-r02-delta-manifest.json`，本 E 仅作 **AUTHOR_REPORTED**，绝不打开 Gold。
- **本 E 实测**：T02 INPUT `9d51bd46…`、T03 INPUT `ab00deb7…`、T04 INPUT `2b4e2a4e…`、T06 INPUT `1baecde6…`，均逐字节 SHA-256 与 D 作者公开 manifest 相符，CRC PASS，ZIP 条目数分别 **433 / 218 / 329 / 206**；对文件路径做 traversal 与敏感名称初筛均零触发。仅是包级检查，**没有逐案结论、Gold 检验、OCR 或模型运行**。
- T02 B v0.2 ZIP `e0e75f79d3eb307123b2ddcfb29fc643d1a882ae8215802ca0e9c1d966a86956` 由本 E 独立算出，CRC PASS、11条成员。
- T01、T05、T07 的完整 `INPUT_ONLY.zip` 未在本 E 可检索 Library 中定位，不能宣称本 E 独立重算；其 D 作者给出的结果仅是作者补证，等待完整字节受控接收。
- A `G07_03_来源索引.md` 在至少 T01/T02/T05 的新存档可读，三份检得相同 Git blob `438f109db118af95e8f77c7f36d6b7ecc8478dbd`。记录的 SHA256 `17583564…` 是作者清单声明；未审原政策效力。
- **重要边界**：原 C、D 多在 ChatGPT 对话/原工作区生成，再归档 Git。**新恢复提交可以证明这一次归档状态，但不能逆向创造原制作时的作者 Git commit 或 Gold 时间戳**。

## 三、差分问题处置

r01 E0 的三类阻断逐项保持：① 全套不可变 A/B/C/D 版本与来源链；② Gold ACL/独立制作先后；③ E1 先审来源再开 C/D 的门禁。

- ① **部分补证**：七套 C 母版 Git 可重放；某些 A/B 和四套输入 ZIP E 已计算；B 缺件与 D 授权保存方式未完全恢复，不可关闭整类。
- ② **仍受阻**：七套 D 作者全部表示 `ACL_UNVERIFIED`；有 EVALUATION_ONLY 文件名/原作者自证哈希不是权限证据；新哈希不能证明旧 Gold 冻结早于 C。
- ③ **未满足**：本轮未读 C 正文/Gold，盲审尚未污染；但 H 全查分母、全部 B 原始索引、当前校本原文及版本尚未锁定。E1 不可签已开始或已通过。
- 新观察（未裁定为业务缺陷）：T06 D 作者指出既有报告把 23 案写为 21 案，以及 TC-021/TC-023 范围表述不一致；需核验原公开安全记录后再决定 P2，不以作者单方陈述直接定级。T03 “新算法生成的 Gold 摘要”不能替代原 D1 历史摘要与时间证据。

## 四、无法实质开展的阶段

- **E1**：NOT_STARTED。没有独立官方原文义务矩阵与 `E1-evidence-lock.json`；已恢复 A 目录和来源索引不足以让 7 套强制审核义务得到 `SCHOOL_CONFIRMED`。
- **E2**：NOT_STARTED。未开 C 实质规则或 D Gold；不能签任何 C/D 一致性、独立 Gold 准确性或 COMMON_MODE_ERROR。
- **E3**：NOT_STARTED（仅继承 A 七模板目录边界，未开展正式横向核验）。
- **E4**：仅形成**依赖类问题台账及归责**，没有可声称实际修复完成的业务 P0/P1 验收票；真实系统/工程运行均 NOT_RUN。

## 五、E0 裁定与继续条件

决定：**`BLOCKED_INPUT`（有经本 E 复算的有效子项）**。须由作者/资料负责人补齐缺失 B 原始研究、所有 D 原包不可变访问证据，以及由安全存储负责人提供七套 Gold 的私有对象ID、版本、原字节 SHA256、授权/拒绝 ACL 实测、访问日志和制作独立性可核的时序记录。保证 E1 仅看 A/B/原始官方资料锁 H/M/L 和 E1 事实，再允许 E2 读取 C、私有 Gold；没有授权不能读取敏感评价包。

> E_DESIGN_ACCEPTANCE ≠ D4_EXECUTION_ACCEPTANCE ≠ PRODUCT_END_TO_END_ACCEPTANCE ≠ UNIVERSITY_ADMINISTRATIVE_AUTHORIZATION

**禁止**把本轮输入 CRC PASS 或某 C 文件 Git 可回放说成设计 PASS 或模型通过。
