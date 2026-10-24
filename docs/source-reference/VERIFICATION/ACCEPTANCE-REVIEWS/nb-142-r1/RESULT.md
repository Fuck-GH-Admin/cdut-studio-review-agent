# NB-142-R1 独立 QA 复核报告（RESULT.md）

- 批次：nb-142-r1（revisionOf nb-142；18 文件 / 5446 行）
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（只读）
- 作者：docs-r07-author-extra-03-20261024 ｜ 独立 QA：docs-r07-qa-extra-03-20261024
- 封版：sealId `seal-8cd5d68f0d5ebf83`（2026-10-23T20:15:13Z）；ZIP `9d92b7aa…`（82841B/21 条目）
- 复核时间：2026-10-23T20:35Z
- **batchVerdict：accepted（18/18；G0/G1/G2 全 PASS）**

## 判定摘要

r0 五条 findings（NB142-F-01/02/03 + N-01/N-02）**全部确认并修复**；修订面 2 篇手册 diff 逐行核对**恰好**为声称修改、零多余改动；其余 16 篇与 r0 **逐字节一致**。nb-142 批经 r1 全闭合（r0 revision_required → r1 accepted）。

## G0（PASS）

- revisionOf=nb-142 绑定正确；r0（seal-32d3b13346a46d7a）交付字节保留未动。
- 哈希链：MANIFEST `9f6bafcb…`、READY `78a95046…`、ZIP `9d92b7aa…` 三方重算全对；manualSha256 18/18 = MANIFEST = READY = stage = ZIP；机械 TSV zip==disk。
- 源绑定 18/18 blob+sha256+lines == manager scope（独立重算）；SCOPE 清单==manager 锁。

## G1（PASS）

- FINDINGS-RESPONSE.md 5/5 逐条认领、回源确认属实、before/after hash 齐全。
- COVERAGE.tsv 重发**完整备注列**（18/18 行 11-106 字符，manualSha256 与 MANIFEST 对账一致）；SOURCE-EVIDENCE 同步重发；UNVERIFIED/SOURCE-EVIDENCE 无残留旧计数（"17 顶层/15 条/5 收录" 检索为空）。

## G2（PASS）

| 项 | 实测 |
|---|---|
| electron-builder.yml.md | 4 hunk/5 处修改（:25 17→19、:40 5+11→3+12、:41 15→13、:117 17→19、:137 15→13），与源复算 19/3+12/13 一致，无其它改动 |
| cdut-jw-parsers.test.ts.md | 3 处行号 :448-451/:451 → **:446**（源码 :446 实证），无其它改动 |
| 其余 16 篇 | `diff -q` 与 r0 逐字节一致（16/16）+ hash 对账一致 |

## findings 关闭表

| id | 严重度 | 内容 | 状态 |
|---|---|---|---|
| NB142-F-01 | major | 顶层键 17→19 | **closed@r1** |
| NB142-F-02 | major | files 5+11→3+12 | **closed@r1** |
| NB142-F-03 | major | extraResources 15→13 | **closed@r1** |
| NB142-N-01 | minor | 断言行号 :451→:446 | **closed@r1** |
| NB142-N-02 | minor | COVERAGE.tsv 人工列截断 | **closed@r1** |

## NOT_RUN

产品测试/typecheck/build/Electron-GUI/真实模型网络（口径与 r0 一致，未改写为已运行）。

## 合入指引

lead 按 `reviews/nb-142-r1/REVIEWED-HASHES.json` 的 acceptedHashes（**18 篇 r1 字节**）合入；r0 表中 electron-builder.yml.md/cdut-jw-parsers.test.ts.md 两篇已被 r1 新 hash 取代，勿混用。nb-142 批关闭。
