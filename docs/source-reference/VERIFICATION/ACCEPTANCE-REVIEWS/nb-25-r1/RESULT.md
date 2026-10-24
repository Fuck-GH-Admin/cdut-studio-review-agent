# nb-25-r1 独立复验报告（accepted）

- batch nb-25-r1（revisionOf nb-25）/ frozenSha 05fb2565e20eb1760233696be1832f68196b37c2
- **batchVerdict: accepted**（11/11）；生成（机器 UTC）: 2026-10-23T17:33:37Z
- G0 pass：blob+sha256+lines 对冻结树、manual sha256 三方一致、seal 链互洽、sealId 重算一致。
- G1 pass：FINDINGS-RESPONSE.md before→after 与变更字节一致；父批 sealed 字节未动。
- G2 pass：NB25-EXP-01（29 项）、NB25-EXP-02（13 项） 逐条回源闭合（含 review-ipc :414/:444/:450-452/:1295-1302 逐行核）；变更文件恰为 findings 对象，未变文件与父批逐字节一致。
- NOT_RUN：bun test / tsc / build / GUI / 模型调用。resultSha256 469ec4a4cdcb…
