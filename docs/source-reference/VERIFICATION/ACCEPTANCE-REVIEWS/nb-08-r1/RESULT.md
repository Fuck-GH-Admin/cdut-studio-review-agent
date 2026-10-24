# nb-08-r1 独立复验报告（accepted）

- batch nb-08-r1（revisionOf nb-08）/ frozenSha 05fb2565e20eb1760233696be1832f68196b37c2
- **batchVerdict: accepted**（18/18）；生成（机器 UTC）: 2026-10-23T17:33:37Z
- G0 pass：blob+sha256+lines 对冻结树、manual sha256 三方一致、seal 链互洽、sealId 重算一致。
- G1 pass：FINDINGS-RESPONSE.md before→after 与变更字节一致；父批 sealed 字节未动。
- G2 pass：NB08-EXP-01..04（导出计数 13/9/24/9）、NB08-PERM-01（:451 无 authorizeAtCommit 分列）、NB08-NOTE-01/02（untyped cast 标注） 逐条回源闭合（含 review-ipc :414/:444/:450-452/:1295-1302 逐行核）；变更文件恰为 findings 对象，未变文件与父批逐字节一致。
- NOT_RUN：bun test / tsc / build / GUI / 模型调用。resultSha256 e15d3b94bc09…
