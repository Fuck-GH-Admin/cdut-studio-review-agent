---
path: apps/electron/src/main/lib/review/review-source-version-adapter-v3-b2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b2101be80e3dce561f6365c3378b2930245dda73
sha256: ee1d55b0aeea8a5a532c97adcc65c462a421f4c5786a2fcadf4bc97f818a116d
lines: 411
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-source-version-adapter-v3-b2.ts

## 1. 结论与边界

Dev-B B2 解析器核验的 SourceIdentity 适配器（头注 :1-6）：用生产 `document-service` 解析 staged 原始字节；**只有本解析器的块注册表**（非 Renderer/模型给的 ID 或坐标）才能铸造 C0 SourceIdentity。不写 CurrentCase/Run/ReviewBatch。

边界：staging 能力在 `review-intake-adapter-v3-b2`；解析在 `document-service`。

## 2. 导出与关键符号

类型：`B2Precision/B2ParseStatus/B2ParsedBlock/B2ParsedMaterial`（:17-36）、`B2CandidateReadExtent`（:39-51，`fullDocumentProven:false`）、`B2CandidateVersionTransition`（:54-70，`businessWriteAllowed:false`）、`B2ParserBlockLocationInput/B2LocatedBlock`（:78-91）。

| 函数/类 | 行 | 说明 |
| --- | --- | --- |
| `locateB2ParserBlock` | 97-171 | 几何→定位（精度分级） |
| `fingerprintB2ParserGeometry` | 174-183 | 解析修订指纹 |
| `ReviewB2SourceVersionAdapter` | 186-411 | `parse`/`candidateReadExtent`/`compareCandidateSourceVersions`/`sourceForBlock` |

内部：`sha256`（:14）、`PARSER_ID`（:15）、`allowed`（:16-17）、`hasRect`（:72-75）、`Stored`（:62-68）。

## 3. 内部逻辑与关键流程

1. **`locateB2ParserBlock`**（:97-171）：PDF 有效 bbox → `pdf-rect`（精确 locator）；XLSX 坐标齐 → `sheet-cell`；DOCX → `document-block`（`docx-parser-block`/`docx-table-cell`，注释 :93-95「paragraph 只是传输信封，不是 OOXML 段落/页」；表坐标缺失 → `approximate`+uncertainty）；txt/md/csv → `paragraph`；其余 → `file`/`approximate`（image `file`+「requires independent visual inspection; not OCR full-read」；回退/未证几何不伪造精确坐标，:163-170）。
2. **`fingerprintB2ParserGeometry`**（:174-183）：`parse-`+sha256([inputFingerprint,status,parseError,blocks 全几何])[:32]——「所有证明相关几何都参与 parse revision」。
3. **`parse`**（:194-289）：staging 授权/归属/状态核验（`B2_SOURCE_SCOPE_MISMATCH`，:196-199）；候选防篡改（`B2_SOURCE_CANDIDATE_TAMPERED`，:200-203）；字节哈希/长度核验（`B2_SOURCE_BYTES_MISMATCH`，:204-207）；扩展名白名单（`B2_SOURCE_FORMAT_UNSUPPORTED`）；缓存 identity 不符 `B2_SOURCE_CACHE_IDENTITY_MISMATCH`（:216-219）；**临时目录随机名写原始字节**（注释 :221-222 文件名不能逃出 staging）→ `parseFileIntoSourceDocument`；写中/解析后重查授权（:227/:231）；`failed` 却有块 → `B2_SOURCE_FAILED_HAS_BLOCKS`；块 ID=`src-`+sha256([documentVersionId,parseRevision,原 id,index])[:40]（注释 :238-239 消除同干跨文档别名）；重复 → `B2_SOURCE_BLOCK_COLLISION`；含 image 块即降 `partial`（`Contains image blocks not fully inspected`，:255-268，注释 :254「parsed 含图像块≠全文/视觉已核」）。
4. **`candidateReadExtent`**（:297-331）：仅 `single-parser-block`/`file-metadata`；单块须精确精度+非 image+非空文本（`B2_SOURCE_READ_EXTENT_NOT_PROVEN`，:313-315）；返回候选级回执（`fullDocumentProven:false`）。
5. **`compareCandidateSourceVersions`**（:340-387）：两次 lookup 核验身份+字节（`B2_SOURCE_TRANSITION_*`）；同版本（同 id/版本/哈希/指纹）保留块，否则**全部旧块作废**（`staleOldEvidenceMustNotBeReused`，注释 :336-338「字节相同的新物理身份也作废旧块，无文本启发式迁移」；重启后旧注册表缺失 → fail closed）。
6. **`sourceForBlock`**（:390-411）：注册表核验（`B2_SOURCE_STALE`/`B2_SOURCE_BLOCK_UNVERIFIED`）；**铸造时重验物理字节**（`B2_SOURCE_PHYSICAL_REVISION_MISMATCH`/`_BYTES_MISMATCH`，注释 :400-402 缓存不是未来替换/撤销的权威）；产出 `SourceIdentity`+`assertC0SourceIdentity`。

## 4. 调用者与调用链

入向（生产）：`review-v3-b1-b2-candidate-source-bridge.ts:19`、`review-v3-main-b20-current-registry.ts:19`、`review-v3-b1-b2-main-read-bundle-v3-b.ts:13`。测试：`review-source-version-adapter-v3-b2.test.ts:2-5`。出向：`./document-service`（:9）、`./review-intake-adapter-v3-b2`（:10-13）、`@profer/shared`（:8）、`node:crypto/fs/promises/os/path`（:5-7）。

## 5. 数据 I/O、读写与副作用

读 staging 字节；临时目录写原始文件（finally rm，:286-288）；内存注册表（`parsed` Map）；无网络。

## 6. 分支、失败、取消与恢复

15+ `B2_*` throw（fail-closed）；解析异常由 document-service 吸收为 parseStatus；临时目录必清理；注册表进程内存（重启失忆→fail closed，注释 :336-338）。

## 7. 权限与权威状态

- SourceIdentity 权威：只有本解析器注册表块可铸造（:390-411）；Renderer/模型 ID 不算（头注 :3-4）。
- 精度权威：几何未证不伪造精确坐标（:163-170）；DOCX 序数不冒充 OOXML 段落（:93-95）；image 不算 OCR 全读（:254/:168-169）。
- 物理权威：铸造时重验字节（:400-407）；staging 授权多点重查（:196/:227/:231/:287）。
- 业务边界：`candidateOnly:true`/`businessWriteAllowed:false`/`schoolPolicyVerified:false`（:39-70）。

## 8. 修改影响面

B1/B2 bridge、registry、read-bundle 的证据铸造；块 ID/指纹公式变更即旧证据失配。同测：`review-source-version-adapter-v3-b2.test.ts`（8 用例）。

## 9. 测试证据

直接测试 `review-source-version-adapter-v3-b2.test.ts`（8 用例 / 2 describe；真 staging/真文档解析（手写 PDF/PNG 字节）；NOT_RUN）要点：
1. `:36-56` TXT 全块解析+`sourceForBlock` 铸造（documentVersionId/rawSha256/parseRevision/location paragraph）；伪造块 `B2_SOURCE_BLOCK_UNVERIFIED`；旧 revision `B2_SOURCE_STALE`。
2. `:57-74` Office71 同名同字节不同物理源：块 ID/版本不互用；篡改候选 `B2_SOURCE_CANDIDATE_TAMPERED`。
3. `:75-87` PNG 真实字节 → `partial`、precision `file`、uncertainty 含 `visual inspection`。
4. `:88-105` PDF 有文本 → `parsed`+`Hello Review`、非 pdf-rect 块 location=file（无假几何）；空扫描 → `partial` 0 块+error 匹配 `/扫描|OCR|原件/`。
5. `:106-114` 撤销 owner → `B2_OWNER_INVALID_OR_REVOKED`。
6. `:117-133` DOCX 段落/表单元格 → `document-block`、locator `{docx-parser-block,parserBlockIndex:0}`（`paragraphIndex` undefined）+uncertainty；表坐标缺失→`approximate`；image→`file`。
7. `:134-141` DOCX 回退→`approximate`/file 级；`no verified parser`。
8. `:142-157` XLSX 坐标齐→`sheet-cell`、row 0→`approximate`；PDF bbox→`pdf-rect`、越界 bbox→`approximate`；`fingerprintB2ParserGeometry` 对 readingOrder/状态/parseError 变化均变。

未覆盖：`candidateReadExtent`/`compareCandidateSourceVersions` 无直接用例（bridge 侧间接）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/类型群/行号如 §2 | 已证实 | 逐条 |
| 注册表唯一铸造/物理重验 | 已证实 | :390-411 + 测试 :36-56/:106-114 |
| 精度分级不伪造 | 已证实 | :97-171 + 测试 :117-157 |
| image≠全读/failed 无块 | 已证实 | :254-268 |
| readExtent/版本过渡行为 | 未知（未测） | §9 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `locateB2ParserBlock` | §3.1/§9 | 97-171 | covered |
| `fingerprintB2ParserGeometry` | §3.2/§9 | 174-183 | covered |
| `parse` 全链 | §3.3/§9 | 194-289 | covered |
| `sourceForBlock` 重验 | §3.6/§9 | 390-411 | covered |
| `candidateReadExtent`/`compareCandidateSourceVersions` | §3.4-3.5 | 297-387 | covered（未测） |
