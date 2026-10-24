---
path: apps/electron/src/main/lib/memory-wikilink-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2254491a6c550dafa2d4d6565056b8a9a5216a02
sha256: 2f45680d055d7a31e39618aedc1790b34c219f85ff77fdfe4a25d0a657d83ddd
lines: 182
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/memory-wikilink-service.ts

## 1. 结论与边界

记忆双链（`[[...]]`）解析（头注释 :1-14）：Obsidian 式双链渲染/跳转/反链查询。解析优先级：frontmatter `name:` 精确→文件名精确→包含匹配兜底（:8-11）。范围：memory-archive 主题+`.cdutai/memory`（旧 `.claude/memory` 由上层迁移）。

## 2. 导出与关键符号

导出 3 条（`export` :114/:155/:180）：

| 符号 | 行 | 说明 |
| --- | --- | --- |
| `resolveMemoryWikilink(archiveDir, autoDir, rawName)` | `:114-138` | 三级解析（:125-137），返回 `MemoryWikilinkTarget`（matchedBy name/filename/contains） |
| `findMemoryBacklinks(archiveDir, autoDir, currentAbsolutePath, currentLinkName)` | `:155-177` | 全文正则 `[[name]]`/`[[name|label]]`（:171，转义 :104-106），排除自身（:165/:168） |
| `memoryKindOfPath(autoDir, absolutePath)` | `:180-182` | 'auto'\|'archive' 域判别 |

内部：`MAX_FILE_BYTES=2MB`（:21）、`collectMdFiles`（:28-44，递归跳过点目录）、`extractFrontmatter`（:55-72，name/title/description）、`readSafe`（:74-80，超限/异常→''）、`indexMemoryDir`/`indexAll`（:82-102，name ?? title ?? stem :92）。

## 3. 内部逻辑与关键流程

索引双目录→三级匹配/正则反链（§2）。纯只读。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `ipc.ts:425` → 调用 `:4284`（RESOLVE_MEMORY_WIKILINK）/:4293（GET_MEMORY_BACKLINKS）；测试 `memory-wikilink-service.test.ts:5`。否定：`memoryKindOfPath` 仅模块内自用（:181），无外部消费者。出向：`node:fs`/`node:path`/`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

只读 md 文件（readSafe 2MB 上限）。无写。

## 6. 分支、失败、取消与恢复

读失败/超限→''（:74-80）；匹配三级+null。不适用取消/恢复。

## 7. 权限与权威状态

2MB 上限+跳过隐藏目录（:21/:34）；解析优先级为语义权威。

## 8. 修改影响面

- 消费面：`ipc.ts:4284`（RESOLVE_MEMORY_WIKILINK）/:4293（GET_MEMORY_BACKLINKS）——记忆面板双链跳转与反链列表。
- 依赖面：memory-archive 与 .cdutai/memory 目录布局、frontmatter 约定（name/title/description）；`memoryKindOfPath` 域判别。
- 需同步测试：`memory-wikilink-service.test.ts`（10 用例，批内姊妹手册）；memoryKindOfPath/2MB 上限分支未覆盖。

## 9. 测试证据

`memory-wikilink-service.test.ts`（批内，87 行，断言细节见姊妹手册）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；三级解析/反链 | 已证实 | :55-182 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出+索引/匹配 | §2/§3 | :28-182 | covered |
