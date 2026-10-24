# NB-23-r1 独立 QA 验收报告（D0）

- 批次 `nb-23-r1`（revisionOf `nb-23`，p05-review-engine · p05.review-services，14 文件），冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 作者 seal `seal-3f1f77a0be79558f`（17:04:44Z）；QA `docs-r07-qa-nb-06-20261023`（18:45:00Z）
- **batchVerdict：`accepted`（14/14）**；G0/G1/G2 全 pass；**4 条父批 findings 全部核销**，无新增
- **NOT_RUN**

## G0

seal 链三层哈希独立重算全相等；ZIP 17 条目合规；14/14 manualHash 磁盘=MANIFEST=READY；对父批逐文件 diff 仅 2 篇变动（review-tools.ts.md 8 hunks、review-zip-staging-v3-b2.ts.md 1 hunk），全部落在 FINDINGS-RESPONSE 声明范围，12 篇字节=父批。

## G2 修复核销（4/4 verified）

| finding | 核销 |
| --- | --- |
| NB23-TALLY-01 | ✅ 12→13 工具（§2 表/清单/§11，`name:` 字面 13） |
| NB23-TALLY-02 | ✅ 12→11 read_rule 字段（:252 实测 11） |
| NB23-TALLY-03 | ✅ 13→12 测试用例（5 处同步，`test(` 实测 12） |
| NB23-REF-01 | ✅ intake-adapter 名称↔行号重排（B2MainContext:29/B2MaterialCandidate:48/B2ImportReceipt:65/ReviewB2StagingService:79，实测 export 行含 B2IntakeGrant:36） |

修正与源码复算全部一致，未引入新问题。

## 合入（lead）

全 14 篇 acceptedHashes 可合（`reviews/nb-23-r1/RESULT.json`，脚本生成 = READY 三方核验）；12 篇未动文件按合入规则由本子批记录同 hash。父批 `deliveries/nb-23` 保留。此批闭环：nb-23 D0(revision_required) → nb-23-r1(accepted)。
