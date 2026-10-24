# nb-104-r1 返修复验报告（QA：docs-r07-qa-extra-01-20261024）

- 批次：nb-104-r1（revisionOf nb-104；T7，p08-renderer-ui · p08.shell-onboarding，16 文件 / 4795 行）
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 作者：docs-r07-author-extra-01-20261024；封版 `seal-93a7782c22f19564`（sealedAt 2026-10-23T20:12:49Z）
- **batchVerdict：accepted（16/16）——NB104-F-01/N-02 关闭，nb-104 链闭环**

## G0 — PASS

- revisionOf=nb-104 链正确；MANIFEST→READY→DONE→ZIP 复算全对；`sealId` 按 `sha256(nb-104-r1|frozen|sorted manualHashes)[:16]` 复算一致；16/16 源绑定=scope；ZIP 19 条目干净、zip-vs-stage 0 漂移；`before/` 父批快照与父批 accepted 字节 **0 差异**。

## G1 — PASS

- `FINDINGS-RESPONSE.md` 逐条承认并回源（F-01/N-02 显式 before/after hash；N-01 机制性说明交 lead）；`UNVERIFIED.md` §6 登记归属偏差；START.json `changedManuals=1/unchangedManuals=15` 与实测一致。

## G2 — PASS

- **变更面实测 = 仅 2 行**（diff before/ vs stage/）：§5（`:89`）与 §10 表行（`:133`）。修复内容与源码 `use-left-sidebar.ts:487-495` 实测完全一致：`.remove(id)` **8 个**逐名列举（streamingState/liveMessages/draft/draftHtml/pendingFiles/backgroundTasks/persistedPermissionMode/sessionExists）+ `:494 store.set(tabMinimapCacheAtom, deleteKey)` 标注 **set 语义键删**、合计 9 项缓存清理——计数语义闭合，**F-01 关闭**。
- **N-02 关闭**：UNVERIFIED 头部/START.json 均改 **4537/258**（原 4566/229 加法笔误，总数 4795 不变）。
- **未触碰 15 篇**：manualSha256 与父批 acceptedHashes 逐位一致（hash 等价 + before/ 快照双证），无未授权漂移；沿用父批 G2 结论（旧接受不套新字节原则的合规运用：未触碰=hash 等价沿用，触碰=全文重验）。
- 变更篇全文重读对照：除计数修复外行为事实不变，与冻结源一致。

## Findings 状态

| id | 状态 | 证据 |
| --- | --- | --- |
| NB104-F-01 | **closed** | 新字节 `392a3a72…`（:89/:133 两行），8 remove 逐名列举+set 键删区分，与源码实测一致 |
| NB104-N-02 | **closed** | UNVERIFIED:3 + START.json:24 → 4537/258 |
| NB104-N-01 | 登记级（交 lead） | UNVERIFIED §6 声明真实归属以团队 JSON 为准；与 NB130-N-01 一并裁决登记口径 |

## 批链结论

**nb-104 闭环**：r0 15 accepted（未触碰、hash 等价）+ r1 1 accepted（修复）→ **16/16 当前字节全部 accepted**（`reviews/nb-104-r1/REVIEWED-HASHES.json` 的 `acceptedHashes` 为最终合入口径）。

## NOT_RUN

产品测试 / typecheck / build / Electron-GUI / 真实模型 / CDUT 登录 / CSLab / 桌宠 / WebGL / 多窗口实测 / bun test（34 用例仅断言级阅读）。未改源码/作者正文/candidate/全局总账/旧 seal（父批 r0 字节全保留）；未 commit/push；未自审。
