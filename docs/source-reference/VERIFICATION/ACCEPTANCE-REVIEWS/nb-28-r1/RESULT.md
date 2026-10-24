# nb-28-r1 独立复验报告（accepted）

- batch nb-28-r1（revisionOf nb-28）/ frozenSha 05fb2565e20eb1760233696be1832f68196b37c2
- **batchVerdict: accepted**（18/18）；生成（机器 UTC）: 2026-10-23T17:48:20Z
- G0 pass：blob+sha256+lines 对冻结树、manual sha256 三方一致、seal 链互洽、sealId 重算一致。
- G1 pass（NB28-G1-01 闭合）：r1 changes.diff（before→stage 描述式 8 变更行）与实际字节差异逐行一致；全树（stage/before/diff）无“后者不在本批？”草稿残留；t07-main-service.ts.md 为润色版未再变。
- G2 pass（NB28-COUNT-01/02 闭合）：visual-material.test、precision-rounds.test 均改“7 test”（摘要+§10 证据行），与源及 7 条用例清单一致；16 篇未改与父批逐字节一致。
- NOT_RUN：bun test / tsc / build / GUI / 模型。resultSha256 cb19679e98b6…
