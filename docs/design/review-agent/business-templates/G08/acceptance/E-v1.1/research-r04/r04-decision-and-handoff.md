# G08 E v1.1 r04｜研究裁定与责任回流

> 2026-10-16 | `RESEARCH_FIX_STATIC_CONFIRMED / GOLD_NOT_RUN / PI_NOT_RUN / FORMAL_E_UNCHANGED`。研究 E，**并非正式 E0–E4 签署**，已看过 C，不能冒称首次 clean-room E1。

## 有证据的裁定

`R03-G08-T03-CM-01` 的**旧 B/C R31 共同过窄条件**，在本轮已固定的**作者修订候选文本**中得到修复：山东平台首轮正式答复后 `rating=一般` 或 `不满意`，只要用户**另行明确** `continue=true` 且权威原案/权限/评价窗口/原因齐全，都可给出 `RC-17` 二次上报**建议**。官方来源 2025-08-20 §（五）支持这两个分支；新版 B R30/R31、C REL-06/R30/R31、追踪矩阵一致。二次办理后的评价不能再循环套用首次 R31。第7/10日时钟从处理结果反馈后算，规则仅对山东平台有效。

核对来源：[山东农业工程学院官方操作指南](https://www.sdaeu.edu.cn/bgs/info/1008/1912.htm)；研究旧版 `research/g08-e-v1p1-r03@eb5924012432532146d29d9bebd1ef768bb3936c`；新作者版本 `author/g08-t03-bc-r31-r01-20261016@1df64a1a9b7f994deaa596e0f05cb877770235a4`，以及独立取得并逐字节校验的公开作者整改 ZIP。

研究假设：**H1静态表达已修复**得到支持；H2（候选 B/C 仍只有“不满意＋继续”）在已读固定文本中被排除；H3（新作者修订完全不可取证）被排除。**不推断**实际审核引擎已经正确执行，更不称 Gold 得分或校方真实权威动作已经验证。

## 测量口径

| 项目 | 本轮实测状态 |
|---|---|
| ZIP 本体及9项 manifest | 公开字节可核对；ZIP SHA-256=`f365a98d6dfbc1fd903b41174422fb2a8096d61fafd12f49b92b67ee91fd8574` |
| B/C/追踪矩阵静态合同 | `10/10` 最终断言；对照旧版发现旧漏映射在新文本中已更正 |
| 公开 F+S 合成 oracle | `19/19` 输入执行相符；**仅小脚本，不是产品系统** |
| 正式 E、受控 Gold 和可信 backend | `NOT_RUN / NOT_VERIFIED` |
| 实际 Pi / D4 / 成都理工校方授权 | `NOT_RUN / UNKNOWN` |

公开 ZIP 新版 C SHA-256 `000158b147308735f20ce1d51707d20d3ff5cd1414c61a2d99b7fe536a829506`；GitHub作者新母版 SHA-256 `f8acf03994262e621d4afac6e608d34d90b114b7103372bef25fc7a4b50f88ec`。**内容版本不同，不能共享一个版本锁或互代实验结果**。原 B/C/C矩阵及研究 r01/r02/r03 提交保持只读。

## 谁做下一步（不得提前关单）

| 责任人 | 最小行动 | 未完成状态 |
|---|---|---|
| **B/C-T03 原作者** | 选择作者 GitHub commit 或 ZIP 唯一新候选，给出新修订 SHA/版本、来源与追踪矩阵一致的冻结索引；旧版不覆写 | `AUTHOR_STATIC_FIX_RECORDED` |
| **D-T03 作者** | 独立构造严格只变评分的对抗材料与必要可信模拟底账；采用本次作者样本只能标`受控回归样本`，不得自动算独立 Gold | `D_INDEPENDENT_GOLD_NOT_VERIFIED` |
| **D-T02 作者和存储管理员** | 修复 T02 PUBLIC handoff 所记私有 manifest SHA 与实有对象不一致的问题 `E-G08-T02-R02-0001`；完整保留旧修订史，完成有权/无权访问、撤权、审计及私有对象版本试验 | `T02_R02_P1_OPEN / ACL_NOT_VERIFIED` |
| **授权正式 E** | 只在组织权限隔离、Gold合法访问、原案可信 fixture 到位后逐案对证据锚点和语义评分；新争议的首次 E1 交未经 C/D 差异提示者独立源锁 | `GOLD_SEMANTIC_NOT_RUN` |
| **成都理工有权部门** | 出具现行真实渠道、受理机关、后端工单/评价接口及权限依据 | `CDUT_POLICY_AND_API_UNKNOWN` |
| **工程 D4 / Pi 团队** | 另行执行实际编译器、授权业务接口、端到端和安全测试，留下运行日志 | `D4_PI_NOT_RUN` |

此轮既没有读取隐藏 Gold，也没有获得可信后台权限，**不能用42个可读增量 INPUT 推断 Gold 判别力或业务正确率**。不新开海量材料，不把单个旧缺陷反复计算为新发现。正式 E v1.0 r02 `NEEDS_REWORK`、原有 P1/来源/ACL 阻断均保留，未签 PASS、未动历史冻结资产，无必要新增 PR。

## 公开记录

- `r04-question-and-hypotheses.md`
- `r04-evidence-and-reproduction.md`
- `r04-decision-and-handoff.md`

可单独复现的离线附件是研究会话的 `r04-contract-check.py`、`r04-contract-results.json`；若正式入仓，应仅复用公开安全版本并注明执行环境与输入 SHA。
