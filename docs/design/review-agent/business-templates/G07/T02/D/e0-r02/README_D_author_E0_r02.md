# G07-T02 D作者｜E r01 E0 输入恢复证据（2026-10-15）

- 业务：**G07-T02 因公与学术交流差旅费用核销预审**。仅处理本T02的D原始资产，不代其他TXX补证、不改C模板、不执行E1/E2/系统测试。
- 已阅读的E原审计：`audit/g07-e-v1-r01@ccbf9bd6b16c9472bb35b03cd8b676d87c6cd6ab` 中 `E0-decision.md`、`E0-coverage-and-isolation.md`、`E0-input-manifest.json`。其裁定是 **`BLOCKED_INPUT`**，不是发现业务答案错误或金标泄漏。
- **该审计 commit 绝不是 D 原作者 commit。D 原作者 Git commit：`NOT_AVAILABLE`。本恢复分支的任何新 commit 也只能证明当次公开证据入仓，不溯及此前资产生成。**

## 恢复成功且保持原字节的 D 文件

| 文件 | SHA-256 | 状态 |
|---|---|---|
| `G07-T02_INPUT_ONLY.zip` | `9d51bd46d5ebdd0b0d130df7aca4373baa6109fd2a71a9907134e02b92e84873` | 原字节未改，37案/433文件 |
| `G07-T02_EVALUATION_ONLY.zip` **（禁止上传公库）** | `0cd84b95b0f642b8bc2c6cec0205c9f3dbd7774acddf67b2ffc13ec3d751e495` | 会话附件能恢复，ACL未证 |
| `G07-T02_D_REPORTS.zip` | `b137c2f6f484654359ac0141471f2dc79fda100ceefc6fbd06af40bb871a75c4` | 原字节未改 |
| `G07-T02_D0-D4_验收摘要.md` | `1e7be897470a9e278605bf41850aa9aeaf1edbb6af1f8ac9a71d8a1961a0a24c` | 原字节未改 |

本地独立复验：37案普通 manifest 文件SHA/字节一致；202份PDF 241页可解析且图像存在，无抽取文字层；隐藏 Gold 原版 `FROZEN_GOLD_v1` SHA-256 为 `754c9eb738beda5e0561edfaca3c516fdfe3ae92d15dc33e3d107660196f9591`，与原冻结清单一致；36条B候选规则有覆盖映射。**这只是离线文件验证，不代表产品准确率，也不证明Gold历史冻结时间获第三方背书。**

## 原D1 A/B来源哈希复验

- `G07_02_统一模板目录与边界.md`: `64a771d60e7ea68a040c4d7fd551c246bf3cd123e0ca60a8f7d9d4ea245ee4c4` = MATCH
- `G07-T02_02_字段材料证据矩阵.md`: `58f37a6d547870f9d39d726cb28f1c64100db159f70bd90df25e96b01ffb7749` = MATCH
- `G07-T02_03_候选审核规则与权限边界.md`: `ed4c5270e5de814072d753659288f53bf17d200f572a71f358f07a1837cc0013` = MATCH
- `G07-T02_06_C与D双向交接卡.md`: `8065c73fd5339c88a52ed4b304ab9cc9d34540b02da73c2220467b47c3f18fc0` = MATCH
- `G07-T02_07_第二轮成都理工大学校本补证.md`: `1cb3a1a9a09fd154bf033191f2bedefd91d9ddd812857834cacccb7b20959053` = MATCH

原D报告的“来源9项可用”应准确解释为 **5份可重算SHA的本地文件 + 4个未固定网页快照的官方来源URL**。本轮从文件库另找回A来源索引，不得将新恢复文件倒填至原D1冻结时点。A-T02独立任务卡及B 00/01/04/05仍为 `SOURCE_PENDING`。

## 隔离/独立性实际级别

- `ACL_UNVERIFIED`：本轮只证实本会话容器能读到隐藏评估包，**没有**受控对象ID、独立私库ACL快照、E读权限/C拒绝权限证明、访问日志。不能写 `SEALED_ACL_PASS`。
- 原 `gold/D1_PREINPUT_FREEZE.json` 声明日期 `2026-10-13`、`C_seen=false`；属于作者既有内部记录，不能凭本轮提交证明当时确实无C接触，且不倒签日期。
- Gold、可信mock账簿、逐案预期与评分文件 **不得**上传公开Git/PR。这个分支只有脱敏摘要和哈希元数据，完整评估包仍由私有存储管理员接收、配置ACL和固定对象版本。
- 无实际原 D Git commit 可证：`D_AUTHOR_COMMIT_NOT_AVAILABLE`；本校2025年第33号制度完整文本和部分学生适用性未完全恢复：`SOURCE_PENDING`。原D0 `PARTIAL` 与E r01 `BLOCKED_INPUT` 原样保留。

## E r02独立复验门槛

1. **E0**：按原始四件的SHA、37案清单、5份A/B哈希重算；独立取得其他六T、C作者提交和完整来源。若Gold受控ACL未配置，继续保留E0隔离阻断。
2. **E1**：E验收者先锁 H全查、M机制、L抽样与官方来源原文，再依规范读取C/D；本D作者没有执行E1。
3. **E2**：只有合法获准访问已冻结Gold及C正式候选后，由E独立交叉对照；不依C结果暗改本Gold。
4. **E3/E4**：由E评估可信mock注入、真实运行与最终裁定；未运行标 `NOT_RUN`，不引用离线脚本宣称产品通过。

**本轮唯一整改效果**：从“只见T02文件名”恢复到“原四件资产及其哈希链可复验”；`ACL_UNVERIFIED`、部分`SOURCE_PENDING`和作者Git提交未知仍需独立负责方处理。**不是E0 r02通过声明。**
