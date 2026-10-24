---
path: apps/electron/src/main/lib/review/review-v3-t06-main-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fc7fa9e7b4a83105e5726029a7c75f136ed737eb
sha256: ac2bc0c9071eada16765a5f9f0377ca9b82651d87c0e76c7c5e474051d7dc696
lines: 751
kind: source
package: p06-review-batch
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-t06-main-service.ts

## 1. 结论与边界

T06 物理入库 Main 端口（文件头 `:1-15`，Local-L04 R02 桥接）：`pickT06PhysicalSource` 真实 OS 选择器（目录/ZIP），枚举原件并把**不透明 entryId** 交给渲染层（渲染层永远拿不到本地绝对路径）；`commitT06PhysicalImport` 核对 selectionId 与来源指纹，用既有 Case/DocumentVersion/Batch writer 建案、逐原件入库、生成批次回执。可靠性：每原件单独入库、部分失败照实返回但保留已建案卷与已入库原件、同 requestId 幂等、绝不把“文件躺在磁盘上”当作已入库。运行时模块，含真实文件 I/O、OS 弹窗与持久账本。

不做的事：不做 ZIP 第二套解包（`review-zip-intake-v3-b2.decodeReviewB2Zip`）；不做材料事务本身（`registerMaterial`/`registerNativeWorkspaceMaterialV3`）；不校验模板字段业务语义（`application-service`）；不定义批次锁（`batch-store`）。

## 2. 导出与关键符号

类型（与渲染层 `review-v3-t06-physical-intake` 结构契约一一对应，Main 本地声明，`:33-38`）：`T06SourceKind`（`:39`）、`T06PhysicalEntry`（`:41-46`）、`T06PhysicalExcludedEntry`（`:48-51`）、`T06PhysicalSelection`（`:52-60`）、`T06MaterialRole`（`:62`）、`T06EntryAssignment`（`:65-69`）、`T06CommitSubject`（`:72-78`）、`T06CommitGroup`（`:80-96`）、`T06PhysicalCommitRequest`（`:98-107`）、`T06ItemReceipt`（`:109-114`）、`T06CaseReceipt`（`:115-123`）、`T06CommitReceipt`（`:124-133`）。

函数导出 4 个：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `buildT06SelectionFromPath` | `:245-318` | 枚举已知路径并登记选择（弹窗分离，测试可对真实目录/ZIP 验证） |
| `pickT06PhysicalSource` | `:321-330` | 真实 OS 选择器（Main 弹窗；无窗口 throw） |
| `commitT06PhysicalImport` | `:524-751` | 提交物理入库（幂等+部分失败+批次） |
| `__resetT06ProcessCachesForTest` | `:181-187` | 仅故障注入测试用（清进程内缓存、保留磁盘账本；生产不得调用，`:177-180` 注释） |

关键内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `MAIN_ACTOR` | `:135` | `local-reviewer/local/reviewer` |
| `MAX_ENTRY_BYTES`/`MAX_ENTRIES` | `:138-139` | 单条 512MB、单次 2000 条（防误选整盘） |
| `StoredEntry`/`StoredSelection` | `:141-165` | 进程内选择状态（含 zipBytes/zipDecodedCache） |
| `selections/receipts/receiptRequests/registered/activeRequests` | `:168-175` | 进程内缓存：选择、回执、回执指纹、登记去重、执行中请求 |
| `sha256/fingerprintOf/hashFile` | `:189-210` | 指纹：条目 `path\0len\0hash` 排序拼接再 sha256（`:192-198`）；64KiB 分块读（`:200-210`） |
| `walkDirectory` | `:213-237` | 递归枚举：跳过隐藏/符号链接/非普通文件/超大文件并记 excluded |
| `loadSelection` | `:336-385` | 缓存优先，否则账本恢复+重新核对哈希 |
| `bytesOf` | `:387-406` | 取条目字节（文件直读/ZIP 惰性解压缓存）+ 长度/哈希双核 |
| `registerEntry` | `:409-478` | 单条入库（复用/原生/V2 双通道） |
| `resolveEntryAssignments` | `:481-500` | 角色/槽位归属校验 |
| `intakeWarnings` | `:503-515` | 入库后未满足的提交条件（warning，不伪装就绪） |

## 3. 内部逻辑与关键流程

### 3.1 选择登记 `buildT06SelectionFromPath`（`:245-318`）

folder：`walkDirectory` 枚举（超 2000 截断+警告 `:255`），逐文件 `hashFile` 生成 `entryId = e-${sha256(relativePath\0contentSha256).slice(0,24)}`（`:258`）。zip：`readFileSync` 全量常驻 `zipBytes`（`:261-262`）、`decodeReviewB2Zip` 解包；rejected 回执进 warnings/excluded（`:264-269`）；accepted 逐条入 entries（同 entryId 派生，`:270-282`）。空来源 → “选中的来源里没有可入库的原件”（`:285-287`）。选择含 `selectionId=sel-${randomUUID}`、`fingerprint`、zip 时 `zipPath/zipBytes`；**预览也落盘** `saveT06SelectionRecord`（RUN-45/BATCH-07，`:295-307`），恢复须重核 SHA-256。返回给渲染层仅 `{entryId, relativePath, byteLength}`（`:312-314`）+warnings/excluded（逐文件未入库清单，`:58` 注释）。

### 3.2 恢复 `loadSelection`（`:336-385`）

缓存优先（`:337-338`）；账本恢复：zip 须 `zipPath` 存在、重读重解包、逐条目比对 `byteLength+contentSha256`，不符 → “ZIP 来源在预览后已变化”（`:342-356`）；folder 逐条 `existsSync`+`hashFile` 重核（`:357-365`）；恢复后 `fingerprintOf(entries)` 与账本指纹再比对（`:380-382`）。全部通过才回填缓存。

### 3.3 单条入库 `registerEntry`（`:409-478`）

1. **去重键** `identity = selectionId\0caseId\0entryId\0role\0slot`（`:415`）：进程内缓存命中直接返回（`:416-420`）。
2. `bytesOf` 重核字节（`:421`）；displayName 取 basename（`:422`）。
3. **恢复复用**（`:425-436`）：同案卷内同名+同角色+同槽位+同内容哈希的 active 版本即上次已登记结果，复用不复制（“不能因为进程内缓存丢失再复制一份原件”）。
4. 写临时文件 `tmpdir()/t06-…`（`:437-438`）；**双通道**（`:440-471`）：原生 V3 案卷（`isNativeWorkspaceCaseV3`）且非 attachment → `registerNativeWorkspaceMaterialV3`（attachment 映射为 evidence 走 V2 事务，不为投影改写用户角色，`:441-444`）；否则 `registerMaterial`（`requestId=t06-register-…`、`expectedRevision` 快照、payload 带 sourcePath/role/materialSlotId/fileName）。成功后从聚合找回版本（原生通道）或取 `written.entity.versionId`（V2 通道）。
5. `registered.set(identity, versionId)`；finally 删临时文件（失败不掩盖原错误，`:475-477`）。

### 3.4 归属与警告（`:481-515`）

`resolveEntryAssignments`：归属 entryId 须在本组、不重复、role ∈ 4 值、`materialSlotId` 须在模板槽内（`:487-496`）；未声明 → `evidence`/无槽（`:492/:656`）。`intakeWarnings`：`requiredAt==='submission'` 且 `minCount>0` 且无 `requiredWhen` 的槽不足 → warning“必交材料槽「名」未满足（需 N，现有 M）”；`collectMissingIntakeInputs` 缺项 → “提交审核前需补齐：…”（`:503-515`）。

### 3.5 提交 `commitT06PhysicalImport`（`:524-751`）

1. **请求校验**（`:525-528`）：requestId/batchName/groups 非空。
2. **幂等三层**（`:529-557`）：进程内 `receipts` 同 requestId——指纹不同 → “相同请求号包含不同的分案内容”（`:532-534`），相同 → 返回既有回执；持久账本 `priorLedger`——指纹不同同拒、completed+receipt → 回填缓存返回（`:540-549`）、`isRequestLedgerBusy`（另一存活进程）→ “相同请求号正在其他进程处理中…不能并行重做”（`:550-553`）；`activeRequests` 本进程互斥（`:555-557`）。
3. **来源核对**（`:559-563`）：`loadSelection` + `selection.fingerprint===request.previewFingerprint`，否则“来源内容在预览后发生变化”。
4. **分组校验**（`:564-579`）：groupId 唯一非空、action ∈ create/existing、entryIds 非空；entryId 跨组重复 → “同一原件不能分配给不同案卷”；未知 entryId 不在此层拒绝（留给逐条失败，`:574-575`）。
5. **账本启动**（`:581-597`）：`ownerPid=process.pid`、status running、逐组 pending。
6. **逐组**（`:601-699`）：模板须存在且 published（`:604-609`）；`resolveEntryAssignments`；`create` → 确定性 `caseId=case-${sha256(requestId\0groupId).slice(0,24)}`（`:612`），**只提交模板真实 case 字段**（applicant 仅当模板有该字段；RUN-38 注释 `:613-620`），subjects 缺省 `subject-{n}`（`:621-627`）；已存在聚合（重启续跑）→ 核对模板一致否则“该请求号已存在不同模板的案卷”（`:628-633`），否则 `createCaseFromTemplate(..., {allowIncompleteIntake:true})`（`:635-640`）；`existing` 绑定须模板一致（`:645-650`）。逐条 `registerEntry`，失败收进 `failures` 不回滚（`:653-662`）。有失败 → 组 `status:'failed'`+保留已入库文档+warnings（不进批次成功成员，`:664-667`）；全成功 → `done` 并按 `templateId@version` 归入 `succeededByTemplate`（`:668-675`）。建案前失败不谎报 caseId（仅聚合落盘时才带 caseId，`:676-684`）。每组后回写账本（`:685-698`）。
7. **建批**（`:701-730`）：按模板分组建真实批次（不伪造跨模板锁，`:128` 注释）；`batchId=batch-${sha256(requestId\0templateKey).slice(0,20)}`；已存在（续跑）→ 核对模板与成员一致后复用（`:708-716`）；否则 `createBatchV2Validated`（政策锁 `resolvePolicyVersionLock(template)`，BATCH-06 不臆造 v1，`:718-724`）；失败记 `batchError` 不掩盖（`:727-729`）。
8. **回执**（`:732-747`）：`{requestId, cases, batchId/batches, batchError?，inventory:{accepted, excluded, warnings}}`；账本 completed+receipt 落盘；缓存回执；释放 zipDecodedCache（`:746`）；finally 释放 activeRequests。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/**/*.{ts,tsx}`、`packages/**/*.ts`（排除测试）。

| 调用者 | 位置 | 调用 |
| --- | --- | --- |
| IPC | `review-ipc.ts:991` `pickT06PhysicalSource`；`:996-998` `commitT06PhysicalImport` | 唯一生产入口 |
| Preload | `preload/index.ts:4959-4964` | 类型暴露（T06PhysicalSelection/T06PhysicalCommitRequest/T06CommitReceipt） |
| 测试 | `review-v3-t06-main-service.test.ts` | 直接调用（含 `__resetT06ProcessCachesForTest`） |

出向：`case-store-v2.{CommandValidationError,readAggregate}`、`application-service.{collectMissingIntakeInputs,createCaseFromTemplate}`、`template-store.getTemplate`、`batch-store.{createBatchV2Validated,readBatchStateV2,resolvePolicyVersionLock}`、`review-v3-t06-ledger.*`、`native-workspace-case-v3.{isNativeWorkspaceCaseV3,registerNativeWorkspaceMaterialV3}`、`material-service.registerMaterial`、`review-zip-intake-v3-b2.decodeReviewB2Zip`、`electron.{BrowserWindow,dialog}`、`node:fs/crypto/os/path`。

## 5. 数据 I/O、读写与副作用

- **读**：用户目录/ZIP 字节（枚举+哈希）、持久账本、聚合、模板、批次。
- **写**：材料临时文件（tmpdir，finally 删）；材料事务写案卷与物理原件；`review-t06-intake/*` 账本（每次选择/每组后）；批次 `batch.json`。
- **副作用**：OS 弹窗（`:325-327`）；无网络/日志打印。
- **幂等**：三层（进程缓存/持久账本/执行中集合，`:529-557`）；`registered` 按 identity 复用；恢复时按内容哈希复用既有版本（`:427-436`）。
- **并发**：同 requestId 本进程 `activeRequests` + 跨进程账本 `ownerPid`；同案卷多版本由材料事务自身 CAS。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 来源类型非法/无窗口 | `:246/:322/:324` | `CommandValidationError` |
| 空来源/超限/隐藏/符号链接 | `:285-287/:222-231` | throw / excluded 留痕 |
| 账本恢复源缺失/变化 | `:343-365/:380-382` | `NOT_FOUND`/`VALIDATION_FAILED` |
| 预览指纹不符 | `:561-563` | `VALIDATION_FAILED` |
| 同 requestId 异内容/并发 | `:532-534/:550-557` | `VALIDATION_FAILED`/`INVALID_TRANSITION` |
| 模板缺失/未发布 | `:607-609` | `DEPENDENCY_UNRESOLVED`（组 failed，含 caseId 已建则保留） |
| 归属越界/重复/槽位非法 | `:488-495` | `VALIDATION_FAILED` |
| 单条入库失败 | `:659-661` | 组 failed，已入库保留 |
| 建案前失败 | `:676-684` | 组 failed 且无 caseId |
| 建批失败 | `:727-729` | `batchError` 照实记录 |
| 原件字节变化 | `:402-404` | `VALIDATION_FAILED` |
| 取消 | 无 | 无 AbortSignal；中断靠账本续跑 |
| 重启恢复 | `:336-385/:540-549/:628-633/:708-716` | 账本+哈希重核+确定性 ID 复用，不重复建案/入库/建批 |

## 7. 权限与权威状态

- **路径边界**：渲染层只能拿不透明 `entryId`（`:42-43`）；绝对路径/ZIP 字节只在 Main（`StoredEntry.absolutePath`，`:146`）；OS 弹窗必须 Main（`:320` 注释）。
- **actor**：统一 `MAIN_ACTOR`（`:135`）。
- **权威状态**：来源以内容哈希为凭（预览后任何字节变化都拒绝）；入库以真实 `DocumentVersion` 为准（“绝不把文件躺在磁盘上当作已入库”，`:14`）；批次政策锁来自已发布模板权威引用。
- **部分失败语义**：失败组不进批次成功成员，但案卷/原件保留（`:664-667` 注释）。

## 8. 修改影响面

- 改 `commitT06PhysicalImport` → 影响 IPC 入库、T02 对接、批次创建；测试 `review-v3-t06-main-service.test.ts` 18 例。
- 改 entryId/指纹派生 → 渲染层契约与账本恢复。
- 改双通道（原生/V2）→ 联动 `native-workspace-case-v3` 与 `material-service`。
- 需同步：`review-v3-t06-main-service.test.ts`、`review-v3-t06-ledger` 记录形状。

## 9. 测试证据

本轮 `NOT_RUN`：未执行 `bun test`。直接测试 `review-v3-t06-main-service.test.ts`（1 describe、**17 test**；真实目录/文件、真实模板发布、`PROFER_CONFIG_DIR` mkdtemp）：

1. `:67-74` 指纹不符拒绝“来源内容在预览后发生变化”。
2. `:76-89` 同 requestId 幂等：两次结果相等、1 组 done、有 batchId。
3. `:91-111` 部分失败：坏组 failed（“不在本次来源中”）**仍保留 caseId**、好组 done。
4. `:113-129` 混合模板独立分案+2 个真实批次、成员不交叉。
5. `:131-146` 模板缺失组隔离：`['failed','done']`、批次只含好案卷。
6. `:148-162` 同名同大小不同内容 → 不同 DocumentVersion。
7. `:164-187` RUN-38/39：必填模板建案 warnings 含“必交材料槽”“申报金额”、`caseFields.amount` undefined、`submitCaseV2` 拒“尚未补齐必填输入”、`assembleAndRunReview` 拒 `/尚未提交审核|尚未补齐/`（MANAGER-INTAKE-GATE #2）。
8. `:189-215` 显式字段/事项/归属入库：无 warnings、文档 role/slot/fileName 正确、提交成功 → `submitted`。
9. `:217-230` 非法槽位拒组“材料槽不在所选模板中”。
10. `:232-271` B1 返修：补录字段+事项后原件不丢、提交成功。
11. `:273-316` B1 负例：未知分项“审核分项不存在”、错误类型“必须是有效数字”；T06 建案阶段同拒且 **caseId undefined**（不落 `[object Object]`）。
12. `:318-325` BATCH-17：隐藏文件进 excluded（“隐藏”），不静默成功。
13. `:327-340` BATCH-15：同 requestId 并发第二单“正在本进程处理中”。
14. `:342-359` RUN-45/BATCH-07：`__resetT06ProcessCachesForTest` 模拟重启后同请求恢复、revision/文档数不变。
15. `:361-384` RUN-45：伪造死进程 ownerPid 的 running 账本 → 接管续跑完成、有 batchId。
16. `:386-404` BATCH-09：`createBatchV2Validated` 拒不存在案卷/政策锁不一致；合法案卷可建批。
17. `:406-418` 预览后同长换内容 → “内容已变化”拒入库。

**未覆盖**：`pickT06PhysicalSource`（OS 弹窗，测试注释 `:3` 说明无法单测）；ZIP 来源路径（恢复重核、zipDecodedCache）；`attachment` 角色双通道映射；`existing` 组绑定分支；`isRequestLedgerBusy` 超龄接管；512MB/2000 条上限。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 渲染层拿不到绝对路径 | 已证实 | `:42-43/:312-314` |
| 预览后字节变化必拒（含同长换内容） | 已证实 | `:402-404/:362-364`；测试 1/17 |
| 同 requestId 三层幂等+跨进程 busy | 已证实 | `:529-557`；测试 2/13/14/15 |
| 部分失败保留已入库、不进批次成员 | 已证实 | `:664-667`；测试 3 |
| RUN-38 只提交模板真实字段；必填缺失不伪装可提交 | 已证实 | `:613-620/:503-515`；测试 7/8/10/11 |
| 混合模板拆真实批次、政策锁不臆造 | 已证实 | `:701-724`；测试 4/5/16 |
| 恢复复用同内容版本，不重复入库 | 已证实 | `:425-436`；测试 14 |
| attachment→evidence 走 V2 事务 | 已证实（代码） | `:443-444` |
| ZIP 恢复路径/解压缓存 | 已证实（代码）/未知（测试） | `:342-356/:394-397` |
| `pickT06PhysicalSource` 运行行为 | 未知 | NOT_RUN、无测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `buildT06SelectionFromPath` | 3.1 | `:245-318` | covered |
| `pickT06PhysicalSource` | 2 | `:321-330` | unknown |
| `loadSelection` | 3.2 | `:336-385` | covered（folder 路径） |
| `bytesOf`/`registerEntry` | 3.3 | `:387-478` | covered |
| `resolveEntryAssignments`/`intakeWarnings` | 3.4 | `:481-515` | covered |
| `commitT06PhysicalImport` 幂等/组/建批/回执 | 3.5 | `:524-751` | covered |
| `__resetT06ProcessCachesForTest` | 2 | `:181-187` | covered（测试专用） |
