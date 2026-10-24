---
path: apps/electron/src/renderer/components/ai-elements/message.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3570cc68b50f3de7dda820a80358056fd1459b9c
sha256: ca535e5540776560625a369660c2401c8546d1b87049e8f031b7327bcc4f569b
lines: 109
kind: test
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/message.test.ts

## 1. 测试目标

直接测试 `message.tsx` 的 4 个纯函数导出：`localFileUrlToPath`（本地文件 URL 归一/安全拒绝）、`parseTableChildren`（React 表格→文本网格）、`rowsToTsv`/`rowsToMarkdown`（表格复制降级）。11 个 `test(`，4 个 describe（`:5`/`:26`/`:85`/`:96`）。

## 2. 用例清单

**localFileUrlToPath（4 例 `:6-23`）**：Windows file URL 解码（`%20`→空格）→`C:/...`；Unix 保留 `/tmp/...`；**localhost 允许/远程主机拒绝**（`file://server/share/secret.md`→null）；非 file 协议→null。

**parseTableChildren（2 例 `:27-82`）**：thead/tbody→tr→th/td 二维网格 `toEqual`；嵌套 inline（strong）拍平纯文本。

**rowsToTsv（2 例 `:86-93`）**：制表符+换行拼接；**单元格内换行折叠为空格**（防粘贴撑破）。

**rowsToMarkdown（3 例 `:97-108`）**：GFM 表格+分隔行；**管道符转义**（`a|b`→`a\|b`）；空行→空串。

## 3. 真实断言

`toBe`（精确字符串）/`toEqual`（二维数组）/`toBeNull`。React.createElement 构造表格树；无 mock 框架。

## 4. 未覆盖

- message.tsx 其余 1768 行渲染面（本测试仅 4 纯函数）。
- `localFileUrlToPath` 的 IPv6/端口变体；parseTableChildren colspan/rowspan。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个 `test(`、断言如 §2 | 已证实 | 文件全读（109 行） |
| **安全断言锁定**：远程主机 file URL 拒绝（`:18`） | 已证实 | 用例 3 |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| file URL 归一/拒绝 | §2 A | `:6-23` | covered |
| 表格解析 | §2 B | `:27-82` | covered |
| TSV/MD 降级 | §2 C/D | `:86-108` | covered |
| §4 边缘 | — | — | unknown |
