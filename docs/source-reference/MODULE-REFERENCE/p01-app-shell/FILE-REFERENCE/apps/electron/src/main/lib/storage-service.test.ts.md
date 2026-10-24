---
path: apps/electron/src/main/lib/storage-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1040045eb6f6a1fbc9f7b68a7051b2e8815ba792
sha256: 38547ea6724f366399ab6083472b1ebb4d4d68558087fbbb9543bed4c20ae2e6
lines: 159
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/storage-service.test.ts

## 1. 测试目标

`storage-service`（同批深读）的「会话外置内容（session-blobs）」统计与孤儿清理安全序：被引用 blob 计入不算孤儿、混有孤儿只计孤儿、清理只删孤儿**在用保留**、清理后归零。框架 `bun:test`；mock 边界=`mock.module('electron', …)` 整体替换 electron + 真实 fs 临时目录 + `PROFER_CONFIG_DIR` + 查询串模块隔离。

## 2. 用例清单

用例计数：`test(` **6**（`:73,83,95,104,121,133`），`it(` 0——与源码计数一致。2 describe：存储统计（3）、孤儿清理（3）。

装置：`mock.module('electron', …)`（BrowserWindow/app/clipboard 等全桩，`:7-21`）；`beforeEach` 临时根+`PROFER_CONFIG_DIR`+四模块同 key 重载+建 sessions 目录（`:29-38`）；`createSessionWithExternalizedPayload` 走**真实写入路径**造被引用 blob（`tool_use_result` 400k 字符触发外置化，`:46-54`）；`writeOrphanBlob` 手写孤儿（`:57-63`）；`blobsCategory` 统计助手（`:65-70`）；`findOnlyBlobPath` 排除 `.tmp-` 找唯一文件（`:147-159`）。

| # | describe | 用例 | 关键断言 |
| --- | --- | --- | --- |
| 1 | 统计 | 被引用 blob 计入且非孤儿（`:73-81`） | count=1、bytes=400_000、orphanCount=0 |
| 2 | 统计 | 混孤儿只计孤儿（`:83-93`） | count=3、orphanCount=2、orphanBytes>0 |
| 3 | 统计 | 空 blob 全 0（`:95-100`） | count/bytes/orphanCount=0 |
| 4 | 清理 | 混合清理在用保留孤儿删（`:104-119`） | used 存在、orphan 不存在、deletedCount=1、freed>0 |
| 5 | 清理 | 只有被引用则一个不删（`:121-131`） | deletedCount=0、count 不变 |
| 6 | 清理 | 清理后孤儿归零（`:133-143`） | orphanCount=0、count=1 |

## 3. 真实断言

（逐条引用 expect 行）

1. `expect(category.count).toBe(1)`、`expect(category.bytes).toBe(400_000)`、`expect(category.orphanCount).toBe(0)`（`:78-80`）。
2. `count).toBe(3)`、`orphanCount).toBe(2)`、`orphanBytes).toBeGreaterThan(0)`（`:90-92`）。
3. 三项均 `toBe(0)`（`:97-99`）。
4. **关键安全断言**：`expect(existsSync(usedPath)).toBe(true)`、`expect(existsSync(orphanPath)).toBe(false)`、`result.deletedCount).toBe(1)`、`result.freedBytes).toBeGreaterThan(0)`（`:115-118`，注释 `:114`：在用的绝不能被删）。
5. `result.deletedCount).toBe(0)`、`after.count).toBe(before.count)`、`after.count).toBe(1)`（`:127-130`）。
6. `category.orphanCount).toBe(0)`、`category.count).toBe(1)`（`:141-142`）。

## 4. 未覆盖与脆弱点

- 未覆盖（对照被测源码）：agent-sessions/sdk-config/workspaces/temp-files 四类统计与清理、`cleanupArchivedSessions`、`MAX_FILE_SCAN` 截断、`errors` 聚合、引用集正则的误匹配（单向安全分支）。
- 脆弱点：`mock.module('electron')` 为模块级桩（`app.getPath('temp')` 返回 `''`，temp-files 类在测试中不可达）；`findOnlyBlobPath` 排除 `.tmp-` 依赖 blob-store 命名约定；400k 外置化阈值依赖 `blob-store` 的外置策略（域外）。
- 真实写入路径造数（非纯 fixture），贴近生产行为。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3（含在用保留安全断言） | 已证实 | `storage-service.test.ts:78-142` |
| mock 边界=electron 桩+真实 fs+模块重载 | 已证实 | `:7-38` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 其余四类清理/归档 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| session-blobs 统计三态 | §2/§3 | 73-100 | covered |
| 孤儿清理安全序（在用保留） | §2/§3 | 104-131 | covered |
| 清理后归零 | §2/§3 | 133-143 | covered |
| 其余四类/归档 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
