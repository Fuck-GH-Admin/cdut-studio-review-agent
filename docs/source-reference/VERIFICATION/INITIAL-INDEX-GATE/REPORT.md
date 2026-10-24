# Frozen source → current documentation verification

冻结基线 `05fb2565e20eb1760233696be1832f68196b37c2`。时间见 [SUMMARY.json](SUMMARY.json)。对真实 source tree 每文件重算 Git blob SHA-1 与 SHA256，并与 FILES.tsv / tracked-tree / 接受记录比较。对实际 candidate 文档重算 SHA256；index-only 使用真实 targetMd 中同名 heading 锚点，不将 FILES.tsv 的缺失 INDEX.md 当作可用链接。

这是可审查的索引快照，不把尚未接受的发布稿计入完成，也不将 legacy 922 当作当前权威。静态核对；运行 NOT_RUN。

- [全量 3083 文件 TSV](SOURCE-TO-DOCUMENT.tsv)：精确源与文档 hash、唯一 owner、作者/复审者、接受状态、实际锚点。
- [问题明细](GAPS.json)；[未接受清单](UNACCEPTED.json)；[全部实际 staged 版本](STAGED-DOCUMENTS.json)。
- 未接受版本仍可阅读；只有接受记录对应 hash 才是接受版本。历史多 revision 在 staged 表中保留，不当作 source 重复归属。

| Owner | Deep | Index-only | Accepted | Published unaccepted | Staged unaccepted | Absent |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| [p01-app-shell](p01-app-shell.md) | 297 | 439 | 736 | 0 | 0 | 0 |
| [p02-agent-runtime](p02-agent-runtime.md) | 355 | 173 | 511 | 0 | 17 | 0 |
| [p03-integrations](p03-integrations.md) | 272 | 7 | 245 | 0 | 34 | 0 |
| [p04-review-case-core](p04-review-case-core.md) | 108 | 0 | 108 | 0 | 0 | 0 |
| [p05-review-engine](p05-review-engine.md) | 191 | 3 | 187 | 0 | 7 | 0 |
| [p06-review-batch](p06-review-batch.md) | 80 | 0 | 80 | 0 | 0 | 0 |
| [p07-shared-libs](p07-shared-libs.md) | 294 | 0 | 261 | 0 | 33 | 0 |
| [p08-renderer-ui](p08-renderer-ui.md) | 781 | 83 | 837 | 0 | 27 | 0 |

## 实测结果

```json
{
  "atUtc": "2026-10-23T21:46:51.255169+00:00",
  "frozenSha": "05fb2565e20eb1760233696be1832f68196b37c2",
  "inventoryRows": 3083,
  "inventoryUnique": 3083,
  "actualFrozenFiles": 3083,
  "trackedSnapshotFiles": 3083,
  "actualNotInventory": [],
  "inventoryNotActual": [],
  "trackedNotInventory": [],
  "states": {
    "ACCEPTED": 2965,
    "STAGED_UNACCEPTED": 118
  },
  "deepStates": {
    "ACCEPTED": 2260,
    "STAGED_UNACCEPTED": 118
  },
  "indexStates": {
    "ACCEPTED": 705
  },
  "duplicateSourcePaths": {},
  "duplicateCurrentDocumentAnchors": {},
  "issueCounts": {},
  "owners": {
    "p01-app-shell": {
      "ACCEPTED": 736,
      "index": 439,
      "deep": 297
    },
    "p02-agent-runtime": {
      "ACCEPTED": 511,
      "index": 173,
      "deep": 355,
      "STAGED_UNACCEPTED": 17
    },
    "p03-integrations": {
      "ACCEPTED": 245,
      "deep": 272,
      "STAGED_UNACCEPTED": 34,
      "index": 7
    },
    "p05-review-engine": {
      "ACCEPTED": 187,
      "deep": 191,
      "STAGED_UNACCEPTED": 7,
      "index": 3
    },
    "p06-review-batch": {
      "ACCEPTED": 80,
      "deep": 80
    },
    "p04-review-case-core": {
      "ACCEPTED": 108,
      "deep": 108
    },
    "p08-renderer-ui": {
      "ACCEPTED": 837,
      "deep": 781,
      "index": 83,
      "STAGED_UNACCEPTED": 27
    },
    "p07-shared-libs": {
      "ACCEPTED": 261,
      "deep": 294,
      "STAGED_UNACCEPTED": 33
    }
  },
  "legacyAuthority": "EXCLUDED: only exact FILES.tsv paths and current accepted records count; historical MODULE-REFERENCE/g* and old922 not authority",
  "runtime": "NOT_RUN: static path/hash/ownership/anchor checks only"
}
```

## 使用边界

`inventoryLink` 保留原始台账引用，`actualLink` 指向真实存在的 index group 文档及 GitHub heading slug（Unicode字母/数字保留，标点移除；重复标题顺序加后缀），`anchor` 保留原始 heading 字段。对705个 index-only 条目，FILES.tsv/INDEX-ACCEPTED.anchor 中的 MODULE-REFERENCE/<owner>/INDEX.md 路径是失效的旧约定，已在可读导航中规范化至接受记录 targetMd；本报告未改写全局台账。

每个 deep 文件的 author/reviewer 来自 TEAM-FILE-OWNERSHIP；index-only 的 owner 与 reviewer 来自 FILES.tsv，作者/QA 根来自 INDEX-CONTRACT 的统一索引线分工。这里只证实文档接受/绑定与路径完整性，不复审所有自然语言正确性。
