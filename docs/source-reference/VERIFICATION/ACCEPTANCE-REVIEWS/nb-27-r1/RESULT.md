# nb-27-r1 独立复验报告（accepted）

- batch nb-27-r1（revisionOf nb-27）/ frozenSha 05fb2565e20eb1760233696be1832f68196b37c2
- **batchVerdict: accepted**（18/18）；生成（机器 UTC）: 2026-10-23T17:40:01Z
- G0 pass：blob+sha256+lines 对冻结树、manual sha256 三方一致、seal 链互洽、sealId 重算一致。
- G1 pass：changes.diff（before→stage，10 变更行）与实际字节差异逐行一致；FINDINGS-RESPONSE 逐条闭合。
- G2 pass：NB27-COUNT-01（9 test）、NB27-COUNT-02（20 test）与源及自身用例表一致，闭合；16 篇未改与父批逐字节一致。
- NOT_RUN：bun test / tsc / build / GUI / 模型。resultSha256 4ba65587a26f…
