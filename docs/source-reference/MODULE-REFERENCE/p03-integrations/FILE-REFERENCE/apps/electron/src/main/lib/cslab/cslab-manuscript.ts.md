---
path: apps/electron/src/main/lib/cslab/cslab-manuscript.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc53a315cacac33f1857b2529ccd7cd72f3d03f2
sha256: cb8404c048d4ab1d2456781a470f8d1b2ab2277bd8ed6caaa43163350634bb60
lines: 596
kind: source
package: p03-integrations
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-manuscript.ts

## 1. 结论与边界

CSLab 论文文稿管理（文件头 `apps/electron/src/main/lib/cslab/cslab-manuscript.ts:1-8`）。存储三件套：`vault/manuscripts/{uuid}.md`（人类可读 Markdown，胶囊序列化为 `{{capsule:id}}`）、`.json`（TipTap doc JSON+胶囊快照，**编辑器单一事实源**）、`.docx`（可选关联 Word）。

## 2. 导出与关键符号

`export` 逐条核对：15 个函数 + 1 个 const 别名 + 1 个 re-export = 16 个导出符号（类/接口导出 0）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `tipTapToMarkdown` | 函数（导出） | 68-119 | TipTap JSON→Markdown（heading/bullet/ordered/paragraph；`scienceCapsule`→`{{capsule:id}}`） |
| `listManuscripts` | 函数（导出） | 146-154 | 摘要（含 `hasDocx`） |
| `createManuscript` | 函数（导出） | 156-205 | 标题截 120；`doc-<uuid8>`；md+json 双写（原子）+事务登记（manuscript+entity） |
| `getManuscript` | 函数（导出） | 207-242 | sidecar 读取+胶囊状态从 `listLabCapsules` 重算（`:218-222`）；坏 sidecar 回退空文档（`:233-241`） |
| `saveManuscript` | 函数（导出） | 244-317 | 双写+事务（manuscript/entity 更新、`deleteCapsulesByManuscript` 后重建、`binds` 边去重插入 `:299-306`） |
| `saveManuscriptAs` | 函数（导出） | 320-379 | 先同步沙箱副本（`:328-335`）；`.md`/`format:'md'`→Markdown 写出；默认 docx 经 `runOoxmlTask export` + `writeBufferAtomic` |
| `getLinkedDocxPath` | 函数（导出） | 381-387 | 关联 docx 路径或 null |
| `getManuscriptDocxPath` | const 别名（导出） | 389 | 兼容旧命名 |
| `attachDocx` | 函数（导出） | 392-414 | 复制进沙箱+登记（长期同步目标） |
| `writeLinkedDocx` | 函数（导出） | 417-423 | 覆盖写回=attachDocx |
| `writeExportDocx` | 函数（导出） | 430-453 | **已有 linked docx→写独立 `.export.docx` 绝不覆盖原件**；无→建链（`:426-429` 注释） |
| `writeDocxBuffer` | 函数（导出） | 456-462 | 兼容旧命名（→writeLinkedDocx） |
| `readDocxBuffer` | 函数（导出） | 465-477 | 读 linked docx 或 null |
| `paragraphsToDocJson` | 函数（导出） | 480-495 | 纯文本段落兜底导入 |
| `blocksToDocJson` | 函数（导出） | 497-593 | 结构化导入块→TipTap（胶囊保留原位标 `orphan`、Word 修订→track marks、批注→comment marks、`\n`→hardBreak） |
| `manuscriptExists` | re-export（导出） | 596 | 内部 `:142-144` |
| `ManuscriptSidecar`/`writeTextAtomic`/`writeBufferAtomic`/`emptyDoc`/`labDb` | 内部 | 41-140 | sidecar 形状；原子写（buffer 版 EBUSY/EPERM/EACCES→`Word 正在占用该文件，请关闭 Word 后重试`，`:134-136`） |

## 3. 内部逻辑与关键流程

### 3.1 保存（`saveManuscript`，`:244-317`）

记录不存在抛 `文稿不存在`；标题截 120；md 由 `tipTapToMarkdown` 生成+json sidecar 原子双写；事务内 revision 递增、entity 同步、胶囊全删重建（`status:'fresh'`）、`binds` 边仅在不存在时插入（带 column/rowIndex）。

### 3.2 另存（`saveManuscriptAs`，`:320-379`）

①同步沙箱副本；②扩展名/`format` 判定（`.md` 或 `format:'md'`）→Markdown 原子写；③默认 docx：`runOoxmlTask({type:'export',…})`（胶囊序列化 id/label/unit/value）→结果类型校验（`OOXML 导出结果类型异常`）→`writeBufferAtomic`。

### 3.3 Word 关联（`:381-477`）

attachDocx 复制进 `vault/manuscripts/{uuid}.docx`（首建时）；writeExportDocx 双分支（绝不覆盖 linked 原件）；readDocxBuffer 容错 null。

### 3.4 导入（`:480-593`）

`blocksToDocJson`：capsule 行内→`scienceCapsule`（`status:'orphan'` 待重绑定，`:562`）；marks（bold/italic/code/underline）；Word 修订→track marks（同类型一个，防 ProseMirror 非法组合，`:573`）；首条批注→comment mark；`\n`→hardBreak；heading level clamp 1-6。

## 4. 调用者与调用链

入向：文稿 IPC（CRUD/另存/Word 同步/导入）+ OOXML 导入链（`blocksToDocJson` 消费 `OoxmlImportBlock`）；测试：`cslab-manuscript.test.ts`（190 行，本批）。出向：`node:fs/crypto/path`、`@profer/shared`（类型）、`./cslab-db.ts`、`./cslab-paths.ts`、`./cslab-uri.ts`、`./cslab-capsule.ts`、`./cslab-ooxml.ts`（类型+动态 `runOoxmlTask`）。

## 5. 数据 I/O、读写与副作用

读写：`vault/manuscripts/*.{md,json,docx}`（原子写）+ sqlite（manuscript/entity/capsule/edges 事务）。副作用：Word 占用检测报错；`deleteCapsulesByManuscript` 重建。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 文稿不存在 | 抛 `文稿不存在` | 248,342,459 |
| sidecar 坏 | 回退空文档 | 233-241 |
| Word 占用 | `Word 正在占用该文件，请关闭 Word 后重试` | 134-136 |
| 导出类型异常 | 抛 | 370 |
| 目标路径无效 | 抛 `另存为目标路径无效` | 324-326 |
| linked docx 已存在 | 导出走 `.export.docx` 不覆盖 | 439-446 |

## 7. 权限与权威状态

- 编辑器单一事实源=json sidecar（`:6`）；md 为互通视图。
- linked docx 为长期同步原件，导出绝不覆盖（`:426-429`）。
- 路径全经 `resolveLabRelativePath`（沙箱内）。

## 8. 修改影响面

改双写/事务影响文稿一致性；改 marks 映射影响 Word 往返保真；影响 `cslab-manuscript.test.ts` 与 OOXML 导入。

## 9. 测试证据

直接测试：`cslab-manuscript.test.ts`（190 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三件套存储/单一事实源 | 已证实 | `:1-8` |
| 胶囊 orphan/修订/批注映射 | 已证实 | `:549-598` 区段 |
| 导出不覆盖原件 | 已证实 | `:426-429,439-446` |
| Word 占用报错 | 已证实 | `:134-136` |
| OOXML 导出内部 | 未知 | cslab-ooxml |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Markdown/CRUD | §2,§3.1 | 68-317 | covered |
| 另存 | §3.2 | 320-379 | covered |
| Word 关联族 | §3.3 | 381-477 | covered |
| 导入族 | §3.4 | 480-596 | covered |
| 断言 | §9,§10 | — | 见测试手册 |
