# OPEN-ISSUES 对账汇总（p04/p05/p06 分区）

- 生成：2026-10-23T21:57:02Z ｜ 对账人：docs-r07-qa-extra-05-20261024 ｜ frozenSha 05fb2565e20eb1760233696be1832f68196b37c2（只读）
- 划区：按 inventory/FILES.tsv `owner` ∈ {p04-review-case-core, p05-review-engine, p06-review-batch}（按 source 路径，不按旧会话名）
- 依据：inventory/OPEN-ISSUES.json（活文件，初读 1317 items@21:40:51Z，落盘时快照分区 **195 条**）、FILES.tsv、ACCEPTED.json、INDEX-ACCEPTED.json、candidate/source-reference（逐文件 exact hash 核对）、baseline/source@05fb…（关键计数/参数本人回源）

## 判定分布（195 条，零静默丢弃）

| 类别 | 数 | 说明 |
|---|---|---|
| CLOSED 族（历史沿用+三证闭合+覆盖） | 117 | PRIOR_CLOSED_INHERITED 83（沿台账原态+映射）/CLOSED_MERGED 23（三证齐+当前文本复核）/CLOSED_SUPERSEDED_BY_NB24_R1_EXTRA 8/CLOSED_TEXT_FIXED_INDEX_GAP 2/HISTORICAL_MAPPING 1 |
| OPEN_CONFIRMED_AUTHOR_ACTION | 10 | **当前文档仍错，已举证**（当前 manual 行号+hash+源码证据） |
| OPEN_OPTIONAL（行号收准/备注） | 26 | 原件自判非阻断；合并同根因；下次触碰顺带，不堆任务 |
| OPEN_DOCUMENTED_GAP_NOTE | 1 | NB14-N-04 实现死比较怪癖：手册补记录；实现留阶段三设计差异报告 |
| UNVERIFIED | 41 | 7=claim 原文未取回（nb-09 系 findingsClosure 无 claim，schema 缺字段→审计待核）+34=id 异形未匹配判定（nb-01-r1 系 OPEN，审计回源，不派作者） |

## 质量纠偏执行记录（最高优先级口径）

1. 先核当前 candidate/最新 rN 再比历史：所有"已修"声明均核到当前手册具体行文本（如 review-tools.ts.md:30/:53/:91）+ ACCEPTED.manualSha256=candidate hash 一致后才闭合。
2. 已索引 r1 修正并独立接受者未重派：NB23-TALLY×3、NB18×4、NB20×2、NB28-G1-01、NB24R1-BIND×8 等按当前文本举证已修/或 hash 未变，零作者动作。
3. schema 字段缺失（type 1214 空、claim 599 空、file 136 空、manual 314 空）按审计待核处理，兼容解析，未输出 OPEN_AWAITING_AUTHOR_FIX。
4. 新版复核未自动抹旧 finding：逐条查当前具体 claim（如 nb-13 vs nb-13-r1 同根因 N13-1 合并为 1 当前项+历史映射）。
5. 证据不足处列 UNVERIFIED 并写明查证范围（查过哪个文件哪段），不往作者堆垃圾任务。

## 本人亲自核源的关键证据（静态，NOT_RUN）

- review-identity-authority.test.ts `test(` 计 **12**（N21-1 判定依据）
- pi-review-agent-client.ts:148 `toolProfile: 'review'`（NB14-N-02 判定）
- review-v3-t04-rules-scoring.ts `^export` 计 **19**（NB14-N-03）
- review-v3-t07-rating-workflow.ts export type=**16**/function=**4**（F-NB29-01）
- template-store.ts `^export` 计 **18**（F-NB29-02）
- review-tools.ts buildReviewTools `name:` 计 **13**（NB23-TALLY-01 闭合依据）

## 残差与证据缺口（不虚报完整）

- nb-09 系 7 条 claim 原文需从父批 reviews/nb-09/RESULT.json 回源（窗口时限未展开）→ lead/审计补。
- 34 条 id 异形（nb-01-r1 系 N-xx/F-xx 与他批复用 id 冲突）需按 (batch,manual) 定位原文 claim → 审计补。
- NB-24R1-V 系 4 文件（demo/comprehensive/submit/v2-executor）未登记 ACCEPTED.json、candidate 文本与 hash 本窗未全核 → lead 索引审计（nb-24-r1-extra-02 复核记录已证实修文存在）。
- NB23-REF-01 已闭但四导出行号仅抽验 :29，逐行完整复核留残差。
- 真实运行 NOT_RUN（测试计数均为静态 grep）。
