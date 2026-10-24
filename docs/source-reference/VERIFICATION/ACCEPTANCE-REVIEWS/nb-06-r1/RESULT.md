# NB-06-r1 独立 QA 验收报告（D0）

- 批次 `nb-06-r1`（revisionOf `nb-06`），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 `docs-r07-author-nb-06-20261023`（sealId `seal-5bc74f4b630910a5`，16:38:33Z）；QA `docs-r07-qa-nb-06-20261023`（16:55:00Z）
- **batchVerdict：`accepted`（7/7）**；G0 pass / G1 pass / G2 pass_with_findings（1 minor 非阻断）
- **NOT_RUN**（产品测试/typecheck/build/GUI/网络均未执行）

## 复验范围

父批 `reviews/nb-06` D0 证据复用；本轮对 r1 改动逐 hunk 回源复核 + 未动文件双重确认（diff 为空 + hash=父批 acceptedHashes）。

## G0

- seal 链 manifest→READY→DONE 三层哈希独立重算全相等；ZIP 58436 B / 10 条目合 SEAL-DELIVERY §4；7/7 manualHash 磁盘=MANIFEST=READY。
- 改动范围与 FINDINGS-RESPONSE 声明完全一致：仅 3 篇改动（agent-atoms 4 hunks、longterm-memory-atoms 1、AgentView 1），4 篇 diff 为空；before/after sha256 与实测一致。

## G2 修复核销（5/5 verified）

| finding | 核销结果 |
| --- | --- |
| NB06-TEST-01（major） | ✅ 修复：§4.1 测试入向 12（8 子串+4 相对导入，实测 8/4）、§9 直接测试 3 文件 9 用例（新增 agent-live-messages.test.ts 条目）、§11 同步 |
| NB06-TEST-02 | ✅ 修复：agent-autosend-turn.test 补 `applyAgentEvent :56/:68` 边界夹具描述，agent-stream-completion.test.ts 入册 |
| NB06-COUNT-01 | ✅ 修复：100→98（同口径复算一致） |
| NB06-COUNT-02 | ✅ 修复：toast 9 处=失败 7+成功 2（grep -c 实测 9） |
| NB06-COUNT-03 | ✅ 修复：38 个不同方法=30 单行字面+8 跨行/别名（枚举 38 项与 QA 计数一致） |

## 新发现（不阻断）

- **NB06R1-L1（minor）**：新增 §9 第 3 条自身漂移——"30 行"实为 **28 行**；断言 ":21/:22/:23" 实为 **:24/:25/:26**。其余（import :4、1 用例、语义）正确。随 ACCEPTED-ERRATA 或下次触碰关闭。

## 合入（lead）

7 篇全部 accepted，`RESULT.json.acceptedHashes` 为当前字节的 manual→hash（3 篇新 hash + 4 篇=父批同 hash，已按合入规则由本子批记录）。可全量合入 candidate；NB06R1-L1 记入 ACCEPTED-ERRATA 于 G4 前关闭。父批 `deliveries/nb-06` 封版保留未动。
