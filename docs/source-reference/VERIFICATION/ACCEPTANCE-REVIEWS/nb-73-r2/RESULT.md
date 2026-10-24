# nb-73-r2 返修复验报告（QA：docs-r07-qa-extra-01-20261024）

- 批次：nb-73-r2（revisionOf nb-73；p03-integrations·p03.cslab，18 文件 / 4517 行）
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 作者：docs-r07-author-extra-01-20261024；封版 `seal-22b44b0e335e3796`（2026-10-23T22:42:13Z）
- **batchVerdict：accepted（18/18）——F01-F05 全关闭，nb-73 批链闭环**

## G0 — PASS
MANIFEST→READY→DONE→ZIP 复算全对；sealId 按 `sha256(nb-73-r2|frozen|sorted)` 复算一致；18/18 源绑定=scope；ZIP 21 条目 0 漂移；`before/`=r1 stage 字节 **0 差异**；变更面=**恰 4 篇**（F01-F05 对应），14 篇未变 hash 与 r1 accepted 逐位一致。

## G1 — PASS
FINDINGS-RESPONSE 逐条承认回源（5 findings + 4 篇 before/after 全 sha256 入册）；`changes.diff`=4 文件仅锚/计数改动，语义文字零变动。

## G2 — PASS（4 篇变更全部新锚独立 grep 回源命中）

| finding | 修复 | 回源实测 |
| --- | --- | --- |
| NB73R1-F01 | `:511`→`:587-592` | = `resolveDerivedTableUri` 文档注释块 ✓ |
| NB73R1-F02 | `:375-378`→`:386-390`×2 | = 同名表沿用注释 :386-387 + `findEntityByTitle` :388-390 ✓ |
| NB73R1-F03 | `:46-67`→`:52-70` 等 4 锚 | :52-70 恰 12 expect（含 :70 `toBe(1.35)`）✓、:82-83 ✓、:94-99 ✓、:69-70 ✓ |
| NB73R1-F04 | `:44-60`→`:50-65` 等 5 锚 | :50-65 恰 10 expect（含 :65 双路一致）✓、:73-74 ✓、:82-83 ✓、:54 ✓、:65 ✓ |
| NB73R1-F05 | 「8 断言」→「9 断言」 | :85-93 实测 9 个 expect ✓ |

diff 精确=11 处修复零多余；「12/10 断言」计数声明与实测一致不改。

## 绑定声明（旧接受未套新字节）
- **4 篇变更**：按新 manualSha256 全新回源复验（上表）。
- **13 篇未变**：hash 等价绑定 r1 accepted 证据（本复验读取时刻 0 漂移）。
- **`cslab-hpc.ts.md`**：三版逐字节不变（`ddd8ace2…`），绑定父版独立 accepted（reviews/nb-73 之 1/18 + MERGE 已合入），不重做。

## 批链结论
**nb-73 闭环**：r0（1 accepted/17 revreq）→ r1（14/4）→ r2（4 修复）→ **18/18 当前字节全部 accepted**（`reviews/nb-73-r2/REVIEWED-HASHES.json` 的 `acceptedHashes` 为最终合入口径）。旧 QA 报告 reviews/nb-73 与 r0/r1/r2 三版封版全保留。

## NOT_RUN
产品测试 / typecheck / build / Electron-GUI / 真实 TLS/网络/SQLite/文件操作 / bun test（28 用例断言级阅读）。未改源码/旧 seal/已 DONE review；未 commit/push；未自审。
