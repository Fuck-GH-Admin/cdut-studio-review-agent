---
path: apps/electron/src/main/lib/review/review-zip-intake-v3-b2.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2289f2fb2ca395fb81d93270e3d33116359993c4
sha256: eff575b34644b76b52233ad985c08e515d7c2a1cbabe7a3c74fb9c7fd390e381
lines: 270
kind: source
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-zip-intake-v3-b2.ts

## 1. 结论与边界

B2 **ZIP 内存解码器**（文件头 `apps/electron/src/main/lib/review/review-zip-intake-v3-b2.ts:1-8`）：输入是可信 Main picker/drop 适配器拿到的**原始字节**（绝不接受模型提供的文件名/路径）；不解压到文件系统、不改 CurrentCase、不建 ReviewBatchAttempt。边界、中央/本地一致性、CRC、Unix 符号链接、数据描述符、Windows 等价重复路径、压缩炸弹全部 **fail-closed**。唯一导出 `decodeReviewB2Zip`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `B2ZipLimits` | interface（export） | `:27-33` | 5 个可选上限 | 覆盖值只能更严（`safeLimit` `:81-85`） |
| `B2ZipEntry` | interface（export） | `:34-39` | `{ index; entryName; rawSha256; bytes: Buffer }` | 已接受条目 |
| `B2ZipFileReceipt` | interface（export） | `:40-47` | `{ index; entryName; status:'accepted'\|'skipped'\|'rejected'; reason?; rawSha256?; compressedSha256 }` | 逐文件回执 |
| `B2ZipDecodeResult` | interface（export） | `:48-54` | `{ archiveSha256; accepted; receipts; compressedBytes; expandedBytes }` | 结果 |
| `decodeReviewB2Zip` | function（export） | `:114-270` | `(raw: Uint8Array, limits?) => B2ZipDecodeResult` | 唯一入口 |
| 常量/内部 | const/function（内部） | `:12-25`、`:70-112` | 见 §3.1 | 签名/CRC/名称/EOCD |

## 3. 内部逻辑与关键流程

### 3.1 常量与内部工具

上限（`:16-20`）：归档 256MB、单条目 50MB、总展开 200MB、1000 条目、压缩比 100。签名 `SIG_EOCD/CENTRAL/LOCAL/DESCRIPTOR`（`:12-15`）；`crcTable/crc32`（`:70-80`）；`safeLimit`（`:81-85`，非法覆盖值 `LIMIT_INVALID`）；`safeName`（`:86-93`）：拒空/超 1024/NUL/反斜杠/绝对路径/盘符/冒号/控制字符/`.` `..` 空段/尾点尾空格/`<>?"|*`；`hasZip64`（`:94-104`，extra 截断 `EXTRA_TRUNCATED`，出现 zip64 即拒）；`lastEOCD`（`:105-112`，从尾部 22~65557 字节找 EOCD，`B2_ZIP_EOCD_NOT_FOUND`）。

### 3.2 `decodeReviewB2Zip` 主流程（`:114-270`）

1. 尺寸门槛（`:120`）：非 Uint8Array / <22 / >maxArchive → `ARCHIVE_SIZE`。
2. EOCD/多盘/zip64/条目数/中央目录范围（`:122-129`）：`MULTIDISK_UNSUPPORTED`/`ZIP64_UNSUPPORTED`/`CENTRAL_INVALID`（含 `count===0`）。
3. 中央目录逐条解析（`:130-159`）：签名/越界 → `CENTRAL_TRUNCATED`；extra 含 zip64 → 拒；名称 UTF-8 `fatal` 解码，失败记 `invalidNameEncoding` + 占位名（`:145-147`）；末尾偏移不闭合 → `CENTRAL_SIZE_MISMATCH`（`:159`）。
4. 逐条目处理（`:165-268`），每个条目产出一条 receipt：
   - **压缩数据定位**（`:166-171`）：可定位时 `compressedSha256` 取压缩字节哈希，否则取 entry-name 哈希作"回退证据"（`:171` 注释：被拒条目无已验证载荷）。
   - 目录项：`invalidNameEncoding`/名称不安全/Unix 模式为 symlink → `rejected('UNSAFE_DIRECTORY')`，否则 `skipped('DIRECTORY')`（`:178-187`）。
   - 名称非法/重复（**NFC 规范化 + en-US 小写折叠**去重 `:179-192`）→ `INVALID_NAME_ENCODING`/`DUPLICATE_PATH`/`UNSAFE_PATH`。
   - 文件类型：Unix 模式非 0/非常规文件 → `SYMLINK`(0xa000)/`SPECIAL_FILE`（`:193-198`）。
   - 标志位：加密/UTF-8 位/强加密/掩码等 → `UNSUPPORTED_FLAGS`（`:199-202`，允许集为 `~0x808` 内且不含 `1|0x20|0x40|0x2000`）。
   - 压缩方法非 store/deflate → `UNSUPPORTED_COMPRESSION`（`:203-206`）。
   - 大小/比率/总量 → `BOMB_OR_SIZE_LIMIT`（`:207-213`，比值 = uncompressed/compressed > 100 即炸弹）。
   - 本地头/中央一致（`:214-227`）：签名、flags/method、名称字节全等，否则 `LOCAL_HEADER_INVALID`/`LOCAL_CENTRAL_MISMATCH`；本地 extra 含 zip64 → 拒（`:228`）。
   - 数据描述符（flags&0x8，`:230-240`）：可选 `0x08074b50` 签名 + CRC/两尺寸比对，`DESCRIPTOR_TRUNCATED`/`DESCRIPTOR_MISMATCH`；否则本地头内 CRC/尺寸比对 `LOCAL_SIZE_CRC_MISMATCH`（`:241-245`）。
   - **区间重叠检测**（`:246-249`）：`OVERLAPPING_DATA`。
   - 解压（`:250-258`）：store 直拷 / `inflateRawSync` 限 `maxEntry+1`，异常 `DECOMPRESSION_FAILED`。
   - 长度+CRC 复核（`:259-262`）：`CRC_OR_LENGTH_MISMATCH`。
   - 通过则累计字节、`rawSha256 = SHA(extracted)`、入 accepted + `accepted` receipt（`:263-267`）。
5. 返回 `{archiveSha256: SHA(bytes), …}`（`:269`）。

## 4. 调用者与调用链

- **入向**：`review-zip-staging-v3-b2.ts:12/:43`（B2 staging 主线）、`review-import-checkpoint-v3-b2.ts`、`review-v3-main-local-product-intake.ts`、`review-v3-t06-main-service.ts`（三处生产消费）；测试 `review-zip-intake-v3-b2.test.ts`（7 用例）。
- **出向**：`node:crypto` 的 `createHash`（`:9`）、`node:zlib` 的 `inflateRawSync`（`:10`）、`TextDecoder('utf-8',{fatal:true})`（`:25`）。无动态调用。

## 5. 数据 I/O、读写与副作用

- 纯内存：输入字节 → entries（Buffer 子串）+ receipts；**不落盘**（`:113` 注释"no unsafe partial extraction to disk"）。
- 副作用：无（无日志/网络/全局状态）。
- 确定性：同一输入+limits 恒同输出（无时间戳/随机）。
- 内存上限：解压单条目限 `maxEntry+1`（`:254`）防解压炸弹逃逸；总展开预算 `maxTotal` 累计（`:263`）。

## 6. 分支、失败、取消与恢复

- **整档失败**（throw `B2_ZIP_*`）：`ARCHIVE_SIZE`/`MULTIDISK_UNSUPPORTED`/`ZIP64_UNSUPPORTED`/`CENTRAL_INVALID`/`CENTRAL_TRUNCATED`/`CENTRAL_SIZE_MISMATCH`/`EOCD_NOT_FOUND`/`EXTRA_TRUNCATED`/`LIMIT_INVALID`（测试 `:120-125` 证明截断/篡改中央目录整档拒绝、无部分成功）。
- **逐文件失败隔离**（receipt 记 reason，循环继续）：§3.2 的 12 类 reason（`UNSAFE_DIRECTORY`/`DIRECTORY`/`INVALID_NAME_ENCODING`/`DUPLICATE_PATH`/`UNSAFE_PATH`/`SYMLINK`/`SPECIAL_FILE`/`UNSUPPORTED_FLAGS`/`UNSUPPORTED_COMPRESSION`/`BOMB_OR_SIZE_LIMIT`/`LOCAL_HEADER_INVALID`/`LOCAL_CENTRAL_MISMATCH`/`DESCRIPTOR_*`/`LOCAL_SIZE_CRC_MISMATCH`/`OVERLAPPING_DATA`/`DECOMPRESSION_FAILED`/`CRC_OR_LENGTH_MISMATCH`）。
- 无取消机制；恢复=调用方换输入重试（函数无状态）。

## 7. 权限与权威状态

- 信任边界：输入字节来自可信 Main 适配器（文件头 `:2-4`）；本文件不校验来源（上游职责）。
- 无 sender/role 分支（依据：全文无权限检查）。
- `rawSha256` 是后续 staging/证据链的字节权威锚（`review-zip-staging-v3-b2.ts:80-84` 消费）。

## 8. 修改影响面

- 改 receipts/reason 集 → `review-zip-staging-v3-b2.ts`（透传 rejected 条目 `:58-65`）、导入 UI、`review-import-checkpoint-v3-b2.ts`。
- 放宽任何安全判定（名称/标志/重叠/比率）→ 直接扩大攻击面；`review-zip-intake-v3-b2.test.ts` 7 用例是回归锁（§9）。
- limits 语义变化 → 3 个生产调用方的限额配置。

## 9. 测试证据

**直接测试 `review-zip-intake-v3-b2.test.ts`（7 用例，describe `B-IN-01`，bun:test，NOT_RUN；测试内合成 zip 构造器 `zip()` `:25-69` 可伪造尺寸/CRC/标志/属性）**：

1. `:74-82` 合法双文件：accepted 2、回执 `['accepted','accepted']`、字节精确 `:79`、rawSha256/archiveSha256 64hex。
2. `:83-92` ZIP-slip/Windows 分隔符/盘符/UNC：4 拒 1 收，`['rejected','rejected','rejected','rejected','accepted']`，幸存 `ok/form.txt`。
3. `:93-102` symlink 拒（`SYMLINK`）、Windows 等价重复（`Proof/CERT.txt` vs `proof/cert.TXT`）拒（`DUPLICATE_PATH`）、目录 `skipped('DIRECTORY')`。
4. `:103-112` 伪造 uncompressedSize → `BOMB_OR_SIZE_LIMIT` 逐文件隔离；可压缩炸弹（100k 'x'）同 reason。
5. `:113-119` CRC 篡改 → `CRC_OR_LENGTH_MISMATCH` 隔离，另一文件正常。
6. `:120-125` 截断 EOCD → `toThrow('B2_ZIP_EOCD_NOT_FOUND')`；篡改中央目录计数 → `toThrow('B2_ZIP_CENTRAL_INVALID')`（整档失败，无部分成功）。
7. `:127-135` 加密标志（`UNSUPPORTED_FLAGS`）/冒号名（`UNSAFE_PATH`）拒，正常文件收。

未覆盖：`OVERLAPPING_DATA`、`DESCRIPTOR_*`、`LOCAL_CENTRAL_MISMATCH`、`SPECIAL_FILE`、`EXTRA_TRUNCATED`、`LIMIT_INVALID`、zip64 拒绝分支。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出 + 常量/内部工具；fail-closed 判定链 | 已证实 | 逐行读 `:1-270` |
| 滑窗/重复/炸弹/CRC/整档失败语义 | 已证实 | 测试 `:74-135` 断言 |
| 不落盘、确定性、解压内存限幅 | 已证实 | `:113`、`:254`、全文无 fs |
| 未测分支（重叠/描述符/中央本地不一致）行为 | 已证实（代码）/未测 | 分支行号 §3.2；测试缺口 §9 |
| Windows 小写折叠的区域设置边界 | 推断 | `toLocaleLowerCase('en-US')` `:180` 固定区域 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `decodeReviewB2Zip` 全流程 | §3.2 | `:114-270` | covered |
| 5 导出接口 + 内部工具 | §2/§3.1 | `:12-112` | covered |
| 12+ reject/skip reason | §6 | 分支行号 | covered |
| 测试 7 用例断言 | §9 | 测试行号 | covered（NOT_RUN） |
| 未测 reason 分支 | §9/§10 | — | partial（代码 covered，无测试） |
