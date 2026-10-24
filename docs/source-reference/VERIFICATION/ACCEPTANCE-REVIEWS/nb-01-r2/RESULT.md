# nb-01-r2 独立复核结果（QA：docs-r07-qa-nb-01-20261023）

- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对，worktree clean）
- 复核对象：**只** `deliveries/nb-01-r2/`；r0/r1 交付与报告字节未改
- scope：`manager/assignments/nb-01-r2-SCOPE.json`（8 文件 / 1760 行）
- 封版规范：`inventory/SEAL-DELIVERY.md` **v2**（ZIP 不含 READY/DONE）
- 复核时间：2026-10-23T14:05:00Z
- **NOT_RUN**：产品测试 / typecheck / build / Electron-GUI / 真实模型 / 并发与故障注入

## 总判定

| 门 | 结论 |
| --- | --- |
| G0 完整性 | **PASS** |
| G1 结构与可读性 | **PASS** |
| G2 源码真实性 | **PASS** |
| 批次判定 | **ACCEPTED**（8/8；0 revision_required / 0 unknown） |

## F-01 / F-02 / F-03 回源核验（不只看作者 response）

| finding | r1 问题 | 回源复核 | 状态 |
| --- | --- | --- | --- |
| **F-01**（blocking，授权描述） | 写成“目录里 candidate-held 的 D4 项被写成 authorized”“建议硬编码后被 B3 降级” | `catalog()` 对已发布（`review-v3-main-local-product-intake.ts:156`）与 50 套 D4（`:167`）**都**写死 `authorized-for-technical-selection`，全文无 `candidate-held` 的 availability 赋值；`:158-160` 注释的 “candidate-held identity” 指 `catalog.json` 的 `publication` 字段（`review-d4-catalog.ts:68`）；`evaluate` 建议亦硬编码（`:203`）且 key 必出同一 `items`（`:200-209`）；`allowedCatalog` 由同一 `items` 构成（`review-intake-routing-adapter-v3-b3.ts:191-202`），降级只对 `allowedCatalog` 外 key 触发（`:205-213`）→ **本组合不可达** | **resolved** |
| **F-02**（blocking，自相矛盾） | §3.2 “已证实” vs §10 “推断” | 两处统一为“已证实（静态控制流）”，同一依据 `review-v3-main-local-product-intake.ts:115-117,120-129,186-188` + `review-intake-routing-adapter-v3-b3.ts:66-72`（`m.role==='unassigned'` 在 `:69`），并注明未运行验证 | **resolved** |
| **F-03**（minor，计数） | §9 “四个通道” | §9/§10 均为“五个通道常量”，列全 5 个通道与注册点 `:238,240,253,261,282`，回源逐行属实 | **resolved** |

**一致性扫描**：异常链表（§6，14 条错误码+行号）未变且抽查属实；T02 临时目录写入/`finally` 清理、Main 门禁（`session→local→assertC0ReviewMainSender`、`authorizeAtCommit` 复验）、读写与恢复语义均与源码一致；`publication`/`availability`/`candidate-held` 术语已分离；无残留错述；§2「5 个 handler」/§3.7 表/§9「五个通道」互相一致。**未引入新矛盾。**

**残留非阻断备注（2 条，仍在 accepted 门槛内）**：

1. §1 `:19`「另提供中断、未匹配作者草稿、人工选择模板**三个** IPC」——除读取外还有 T02 暂存预览，共 4 个附加 handler（总 5）；摘要漏列 T02。建议改述。
2. §3.2 `:73` `review-v3-main-trust-port.ts:68-115`——`assertC2PhysicalOriginalBytes` 实为 `:68-104`。建议改 `68-104`。

## G0（机械核对，逐项实算）

- **哈希链**：READY `139a5d47…` / MANIFEST `191c0084…` / DONE `aacd141e…` / ZIP `14d4dc5b89cef8ffe40b72c80ec7c008336be1c461b23852de28f41dfadc9d5a`。
  READY.zip.sha256 = DONE.zipSha256 = QA 实算；READY.manifestSha256 = DONE.manifestSha256 = 实算；DONE.readySha256 = 实算。`sealId = seal-12e9a6388283933e` 两处一致。
- **ZIP（v2 布局）**：11 条目 = 8 `stage/**` + MANIFEST + 2 mechanical TSV；**不含 READY/DONE**（v2 规范如此，不按旧布局判缺陷）；逐条目与磁盘 0 mismatch；无穿越/符号链接；条目 mtime 全 1980-01-01（确定性打包）。57785 B = 声明。
- **返修链**：`changes.diff`（`30f10a02…`，2 文件）重放——手册：`before/`（= r1 stage）+patch → r2 stage 逐字节相等；UNVERIFIED：r1 `UNVERIFIED.md`+patch → r2 逐字节相等（0 mismatch）。
- **源绑定**：8 文件 blob+sha256+行数 = MANIFEST = SCOPE = `FILES.tsv`；元数据头 11 键 8/8。
- **7 篇继承**：与 r1 `acceptedHashes` 逐字节相同（见下）。

## 逐文件判定

| # | 手册 | verdict | 说明 |
| --- | --- | --- | --- |
| 1 | `review-d2-runtime.ts.md` | **accepted** | 继承 r1 字节；2 条 r1 N 备注保留 |
| 2 | `review-v3-main-d4-local-plan.ts.md` | **accepted** | 继承 r1 字节；2 条 r1 N 备注保留 |
| 3 | `review-v3-main-d4-local-plan.test.ts.md` | **accepted** | 继承 r1 字节；1 条 r1 N 备注保留 |
| 4 | `review-v3-main-local-product-intake.ts.md` | **accepted** | 新字节 `f98b50c2…`；F-01/02/03 全部 resolved；2 条新 N 备注 |
| 5 | `review-v3-d4-content-router.ts.md` | **accepted** | 继承 r1 字节 |
| 6 | `review-v3-d4-content-router.test.ts.md` | **accepted** | 继承 r1 字节 |
| 7 | `review-intake-routing-adapter-v3-b3.ts.md` | **accepted** | 继承 r1 字节 |
| 8 | `review-intake-routing-adapter-v3-b3.test.ts.md` | **accepted** | 继承 r1 字节 |

## exact acceptedHashes（8，供 lead 机械合入）

```
MODULE-REFERENCE/p04-review-case-core/FILE-REFERENCE/apps/electron/src/main/lib/review/review-d2-runtime.ts.md                    429a0a51a75c0d6e951ccb159e9928224300fd01a735bc5f7e96ac6293db9a2e
MODULE-REFERENCE/p04-review-case-core/FILE-REFERENCE/apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.ts.md          fd9ceffb2b316f8b6735eddaf93e9fd9c6f45d09ee0b7edd57e19cb73aca895e
MODULE-REFERENCE/p04-review-case-core/FILE-REFERENCE/apps/electron/src/main/lib/review/review-v3-main-d4-local-plan.test.ts.md     847a1a8bbac0f8b7634bc295244bb1bf9aa29b6c63abb6d2999fdbc7a1f5afc3
MODULE-REFERENCE/p04-review-case-core/FILE-REFERENCE/apps/electron/src/main/lib/review/review-v3-main-local-product-intake.ts.md   f98b50c20ad15772a54540591039bc776ee0c25ccb9e45816da74ffb4db00b53
MODULE-REFERENCE/p05-review-engine/FILE-REFERENCE/apps/electron/src/main/lib/review/review-v3-d4-content-router.ts.md              1907b32345cd6868113db0138547a350389a038c768ad3c832fc7e33cb2434cd
MODULE-REFERENCE/p05-review-engine/FILE-REFERENCE/apps/electron/src/main/lib/review/review-v3-d4-content-router.test.ts.md         4a428b706096f138cd72b6d116c08fa2c7000b39e933b06e338d2834458bcc15
MODULE-REFERENCE/p06-review-batch/FILE-REFERENCE/apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.ts.md       b6530366385b863ea78c6fae85aef1834f80725ec8cbb5da134f0023ecd00b28
MODULE-REFERENCE/p06-review-batch/FILE-REFERENCE/apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts.md  f31ae1a7de171ad736079581930a1ea85ec0dc271528a2a0c30c54505bbe588f
```

其中 7 条与 r1 `acceptedHashes` 相同；第 4 条为 r2 新字节（替换 r1 的 `9f25de4b…`）。`rejectedHashes` 为空。

## 交付边界

- 未改源码/测试/依赖/模板/案卷/candidate/作者正文；未写 `deliveries/`、`inventory/`、`manager/`、全局 `FILES.tsv`/COVERAGE/MANIFEST/INDEX；未 commit/push；未新建根、未切模型。
- 未回写 r1 已封的 QA 报告；r0/r1 交付字节未动。
- 新增：`reviews/nb-01-r2/{RESULT.json,RESULT.md,SOURCE-CHECKLIST.md,REVIEWED-HASHES.json,DONE.json}`、`handoffs/nb-01-r2-REVIEW-TO-AUTHOR.md`、`handoffs/nb-01-r2-REVIEW-TO-LEAD.md`；两本台账各追加一行。
- NB-10 预读为上一轮中断的**部分**证据（2/18 文件），按经理指示暂放、不计入本轮，待重派。

## 下一步

1. lead 按上述 8 个 exact manualSha256 机械合入 candidate（intake 篇用 r2 新字节 `f98b50c2…`，替换 r1 的 `9f25de4b…`）。
2. 2 条非阻断 N 备注 + r1 继承的 5 条 N 备注由经理裁决是否另开 rN 精修；不阻断本批合入。
3. 本批闭合，等经理续派（NB-10 重派或下一批）。
