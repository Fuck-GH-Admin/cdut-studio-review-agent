# NB-46-r1 独立 QA 验收报告（D0）

- 批次 `nb-46-r1`（revisionOf `nb-46`，p07.shared-types，18 文件），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-cbb44e139b497dc3`（19:34:09Z）；QA `docs-r07-qa-nb-06-20261023`（10:40:00Z）
- **batchVerdict：`accepted`（18/18）**；G0/G1/G2 pass；**NB46-N1..N10 全部核销**
- **NOT_RUN**

## G0

seal 链三层哈希独立重算全相等；ZIP 21 条目；18/18 manualHash；对父批 diff 仅 8 篇（全落 FINDINGS-RESPONSE 声明），10 篇字节=父批。

## G2 修复核销（10/10 verified）

| finding | 核销 |
| --- | --- |
| NB46-N1（review.ts） | ✅ 通道键"约 180"→**123**（两处，脚本双法复核一致） |
| NB46-N2/N3/N4（reasoning-profile） | ✅ 15→16 导出、LEVELS 6→9 组（补 GROK `:165`/ASTRA `:306`/PI_EXTENDED `:383`）、EFFORT_MAP 8→9（区间含 GROK；§10 "10 map" 含 ASTRA 单列——口径自洽且比 QA 原 finding 更精确） |
| NB46-N5（remote-sync） | ✅ 7→8 + 表行合并口径注明 |
| NB46-N6（review-d2） | ✅ 14→13 |
| NB46-N7（review-domain-packs） | ✅ 11→13 + 合并行口径注明 |
| NB46-N8（review-v2-contracts） | ✅ 35→44 |
| NB46-N9（review-v2） | ✅ 44→49 |
| NB46-N10（review-v3-c0） | ✅ 21→25 + 合并行口径注明 |

作者 FINDINGS-RESPONSE 独立复算（grep 计数/键名计数）与 QA 结果完全一致；修正只动计数不动事实，未引入新问题。

## 合入（lead）

全 18 篇 acceptedHashes 可合（`reviews/nb-46-r1/RESULT.json`，脚本生成=READY 三方核验；10 篇未动文件按合入规则由本子批记录同 hash）。父批 `deliveries/nb-46` 封版保留。此批闭环：nb-46 D0(revision_required) → nb-46-r1(accepted)——**本组 14 批清单内已无待返修项**。
