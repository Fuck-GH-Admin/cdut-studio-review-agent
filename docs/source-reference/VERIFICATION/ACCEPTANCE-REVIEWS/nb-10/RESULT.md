# nb-10 独立复核结果（QA：docs-r07-qa-nb-01-20261023）

- 批次：`nb-10`（T3，p04-review-case-core · p04.main-authority，18 文件 / 3958 行）
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 作者：`docs-r07-author-nb-01-20261023`；复核：`docs-r07-qa-nb-01-20261023`
- 交付：`deliveries/nb-10/`（sealId `seal-00afeee06089b3c8`，`seal_delivery.py/1` / SEAL-DELIVERY **v2**）
- 复核时间：2026-10-23T16:05:00Z
- **NOT_RUN**：产品测试 / typecheck / build / Electron-GUI / 真实模型 / 并发与故障注入

## 总判定

| 门 | 结论 |
| --- | --- |
| G0 完整性 | **PASS** |
| G1 结构与可读性 | **PASS** |
| G2 源码真实性 | **PASS** |
| 批次判定 | **accepted**（18 accepted / 0 revision_required / 0 unknown） |

## G0（逐项实算）

- 源绑定 18/18：blob + sha256 + bytes + 行数 = MANIFEST = scope = `FILES.tsv`。
- 手册 18/18：stage 实算 = MANIFEST = READY.`manualHashes`；manual 路径集 == scope manual 集。
- **ZIP**：`R07-nb-10-05fb2565.zip` = **`76046604960b1e0f0bfd1c3d87d06b5f019d781189207d91d4f4e96b46c6d981`**（98055 B / 21 条目 = 18 `stage/**` + MANIFEST + 2 mechanical TSV）。**v2 布局不含 READY/DONE**（设计如此，非缺件）。逐条目与磁盘 0 mismatch；无穿越/符号链接；mtime 全 1980-01-01。
- **哈希链自绑**：READY.manifestSha256 = DONE.manifestSha256 = MANIFEST 实算（`ad861393…`）；DONE.readySha256 = READY 实算（`e7941f98…`）；DONE.zipSha256 = ZIP 实算；sealId 两处一致。

## G1

- 元数据 11 键 18/18；source 手册 11 章 / test 手册 6 章；`NOT_RUN` 18/18。
- 导出计数与源码 `grep '^export'` 全等：16 / 6 / 1 / 3 / 3 / 5 / 3 / 1 / 3 / 4。
- **0 条越界 `path:line` 引用**（全 18 篇脚本校验）；`index.ts` 引用均以 `main/index.ts`/`preload/index.ts` 限定，无歧义裸引用。
- 无旧 batch / 旧 hash 残留；无自评 accepted。

## G2（逐文件事实，详单见 `SOURCE-CHECKLIST.md`）

18/18 文件在冻结树逐行读完（8 source 2118 行 + 8 test 1840 行）后比对手册：

- **导出/符号/行号**：全部一致（含 `review-ipc.ts:4,110`→`main/ipc.ts:146,6220`→`main/index.ts:945,1208` 注册链；`review.ts:512,525,527,529,531,514-516` 通道常量；B1 库 `:120,145,177,211`；`template-store.ts:23,253,358,372`）。
- **权限逐入口实证**：4 个 `handleCMain*` 首行 `liveFrame`（含 `assertC0ReviewMainSender` + 主窗口 + `senderFrame.processId/routingId`）；b1-local-plan 三处 sender（`:21,121,128`）；local-author-workbench 三 handler 前后双验；升级在 CAS 两回调内多次 `recheck`；B20 双读 + token/identity/pinned 三重再认证；Host registry 每次读回再验 Owner/grant/manifest。未把别的 handler 的 assert 借给本 handler。
- **读写/副作用**：author-plan-ipc 与 revision-read 无磁盘写（持久化经 `upgradeCanonicalPlanV3` 的 Case CAS）；b1-local-plan 两处写（模板壳 `:64` + 案卷事务 `:122-141`，**非同一事务**，失败留壳）；current-registry/physical-composition/trusted-candidate-read/host-receipt-registry/orchestrator/local-technical-review 无落盘；Host registry **刻意无磁盘再水化**（重启即失，等跨 PID Gate E）。
- **异常恢复**：Host 墓碑 `[caseId,runId]` + 容量 8192 满即封死不淘汰；orchestrator 不重放、`close` 不取消已派出请求；B20 双读失败即拒；revision-read 冲突要求 reopen；B1 冻结要求逐字节一致。
- **真实 caller**：生产注册链、preload、渲染层调用点逐条核；4 个"无生产调用者"否定结论（Plan 升级三安装器、B20 链、`review-v3-main-trusted-assembly`、`createC11MainLocalReview`）全树复验成立。
- **测试边界**：8 篇测试共 69 用例（实测 `grep`）；mock 边界（Electron hook Map + 伪造主窗口）与真实边界（`case-store-v2`/`plan-binding-v3`/B1 库/ZIP CRC 真实落盘）手册均写明，未把 mock 冒充真实 IPC。

## 发现（2 条非阻断精确性，均 ≤2 → 不阻断）

| # | 手册 | claim | 实际 | action |
| --- | --- | --- | --- | --- |
| **N-01** | `review-v3-main-author-revision-read.ts.md` §10 | `new CMainTrustedAuthorRevisionRead` 全树命中 2（生产 1、测试 1） | 4 处：生产 1（`review-v3-main-author-plan-ipc.ts:282`）+ 测试 3（`review-v3-main-author-revision-read.test.ts:38,107,109`）；实质结论"生产实例化点唯一"成立 | 改为"命中 4（生产 1、测试 3）" |
| **N-02** | `review-v3-main-local-technical-review.ts.md` §7 | `v3ReviewRun` 未写断言在测试 `:150` | 断言在 `:151` | 行号改 `:151` |

无 blocking 项：无事实性错误、无路径/权限/恢复/测试存在性错误、无冒充已验。

## exact acceptedHashes（18，供 lead 机械合入）

见 `REVIEWED-HASHES.json.acceptedHashes`（manual → sha256）。`rejectedHashes` 为空。

## 交付边界

- 未改源码/测试/依赖/根 README/AGENTS；未写 `deliveries/`、`inventory/`、`manager/`、`candidate/`、全局 FILES/COVERAGE/MANIFEST/INDEX；未 commit/push；未动用户窗口；未新建 ACP 根、未切模型。
- 新增：`reviews/nb-10/{RESULT.json,RESULT.md,SOURCE-CHECKLIST.md,REVIEWED-HASHES.json,DONE.json}`、`handoffs/nb-10-REVIEW-TO-AUTHOR.md`、`handoffs/nb-10-REVIEW-TO-LEAD.md`、`handoffs/teams/qa-nb-01-STATUS.json`；两本台账各追加一行。
- 旧 922 手册仅作线索，不继承 verified。

## 下一步

1. lead 按 18 个 exact manualSha256 机械合入 candidate。
2. N-01/N-02 为非阻断精确性备注，可并入后续 rN 精修（不阻断本批）。
3. 继续组内下一批：`nb-11`（18 文件 / 3345 行）——作者未交则进入独立源码预读。
