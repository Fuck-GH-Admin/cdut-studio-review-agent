---
path: apps/electron/src/main/lib/review/review-zip-intake-v3-b2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1aa380afcb83078025f25d2ce1ce15816db0b5e8
sha256: c50043f4dc9b09a9a4a0c16f7013eb2ccfffa4603bd478d1e77c3e130fea83b2
lines: 136
kind: test
package: p05-review-engine
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-zip-intake-v3-b2.test.ts

## 1. 测试目标

验证 `decodeReviewB2Zip`（`apps/electron/src/main/lib/review/review-zip-intake-v3-b2.ts:114`）的**真实有界 ZIP 字节解码**（describe 名 `B-IN-01`，`:73`）：不落盘解压、恶意路径/符号链接/炸弹/CRC/中央目录篡改全部 fail-closed 或逐文件隔离。被测对象是本批同名源文件（主手册见 `review-zip-intake-v3-b2.ts.md`）。

## 2. 用例清单

共 **7 个 `test()`**（`test(` 计数 7，bun:test）。夹具（设置）：

- 测试内合成 ZIP 构造器 `zip(entries)`（`:25-69`）：手工写 local/central/EOCD，可伪造 `forgedUncompressedSize`、`corruptCrc`、`flags`、`externalAttributes`；`crc32` 本地重实现（`:5-15`）；默认 `method:8` deflate、`flags:0x800`。
- `entry(name, content)` 默认内容 `'synthetic-material'`（`:70-72`）。

| # | 用例（动作 → 断言主题） | 行 |
| --- | --- | --- |
| 1 | 合法双文件 ZIP → 精确字节/哈希/独立回执 | `:74-82` |
| 2 | ZIP-slip/Windows 分隔符/盘符/UNC → 逐文件拒，安全邻居保留 | `:83-92` |
| 3 | Unix symlink 与 Windows 等价重复 → 永不 accepted | `:93-102` |
| 4 | 恶意 uncompressedSize/比率/总量预算 → 逐文件拒 | `:103-112` |
| 5 | CRC 不匹配 → 隔离单条目，无假成功回执 | `:113-119` |
| 6 | 截断/伪造中央目录 → 整档失败，无部分成功 | `:120-126` |
| 7 | 加密标志与冒号/控制字符文件名 → 拒绝不安全解压 | `:127-135` |

## 3. 真实断言

- 用例 1：`expect(result.accepted).toHaveLength(2)`（`:77`）；`receipts.map(status)` `toEqual(['accepted','accepted'])`（`:78`）；`accepted[0].bytes.toString()` `toBe('synthetic-material')`（`:79`）；rawSha256/archiveSha256 `toMatch(/^[a-f0-9]{64}$/)`（`:80-81`）。
- 用例 2：状态序列 `toEqual(['rejected','rejected','rejected','rejected','accepted'])`（`:88-90`）；幸存名 `toEqual(['ok/form.txt'])`（`:91`）。
- 用例 3：`receipts.map(reason ?? status)` `toEqual(['SYMLINK','accepted','DUPLICATE_PATH','DIRECTORY'])`（`:98-100`）；`accepted` 长度 1（`:101`）。
- 用例 4：`['rejected','accepted']`（`:108`）+ `receipts[0].reason` `toBe('BOMB_OR_SIZE_LIMIT')`（`:109`）；可压缩炸弹同 reason（`:110-111`）。
- 用例 5：`accepted` 长度 1；`['CRC_OR_LENGTH_MISMATCH','accepted']`（`:117-118`）。
- 用例 6：`expect(() => …).toThrow('B2_ZIP_EOCD_NOT_FOUND')`（`:122`）；`toThrow('B2_ZIP_CENTRAL_INVALID')`（`:125`）。
- 用例 7：`['UNSUPPORTED_FLAGS','UNSAFE_PATH','accepted']`（`:132-134`）。

## 4. 未覆盖与脆弱点

- 未测 reason：`OVERLAPPING_DATA`、`DESCRIPTOR_TRUNCATED/DESCRIPTOR_MISMATCH`、`LOCAL_CENTRAL_MISMATCH`、`LOCAL_SIZE_CRC_MISMATCH`、`SPECIAL_FILE`、`INVALID_NAME_ENCODING`、`UNSAFE_DIRECTORY`、`EXTRA_TRUNCATED`、`LIMIT_INVALID`、`ZIP64_UNSUPPORTED`、`MULTIDISK_UNSUPPORTED`、`ARCHIVE_SIZE`。
- 脆弱点：合成 zip 构造器与源实现共享假设（如 flags 掩码 `0x808`），构造器 bug 会双盲；`crc32` 双实现无互校。
- 无真实第三方 zip 工具产物样本（全部合成字节）。
- **NOT_RUN**：本轮未执行本文件；断言为静态阅读所得，不代表通过。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例与断言如 §3 | 已证实 | 逐行读 `:1-136` |
| 合成 zip 构造器支持 5 种篡改 | 已证实 | `:16-24`、`:33-34`、`:56` |
| 未测分支清单 | 已证实（负向） | 对照源文件 reason 全集逐项核对 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支（源文件） | 用例 | 状态 |
| --- | --- | --- |
| 正常接受/哈希 | 1 | covered |
| safeName 路径族 | 2、7 | covered |
| symlink/重复/目录 | 3 | covered |
| BOMB_OR_SIZE_LIMIT | 4 | covered |
| CRC_OR_LENGTH_MISMATCH | 5 | covered |
| EOCD/CENTRAL 整档失败 | 6 | covered |
| 描述符/重叠/中央本地不一致等 | — | unknown（无用例） |
