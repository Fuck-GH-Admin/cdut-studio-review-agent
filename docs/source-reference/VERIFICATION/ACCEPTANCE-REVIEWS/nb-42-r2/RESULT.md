# NB-42-R2 复验报告（QA：docs-r07-qa-nb-47-20261023，2026-10-23T21:28:22Z）

- revisionOf `nb-42-r1`（rootRevisionOf nb-42；两代父批未动，2 篇 before/=r1 字节）
- **判定：accepted（18 accepted / 0 revision_required）**——r1 两残留项全闭合（逐字节）
- NOT_RUN

| 残留项 | 核验 |
| --- | --- |
| F-01 types :23/:62 | 「33 个导出」+「33 导出+8 事件 union」✓；残留 36 仅行号子串（:336/:368） |
| F-05 graph-parser/graph-state | 17 用例（stripMetaTags 2 含 :118）/12 用例 ✓；分组 17+12+6+6+18+6+5=70 自洽 |

N-01：r2 附 diff+残留扫描自查，好评留档。绑定：18 新 acceptedHashes（2 superseded）。
