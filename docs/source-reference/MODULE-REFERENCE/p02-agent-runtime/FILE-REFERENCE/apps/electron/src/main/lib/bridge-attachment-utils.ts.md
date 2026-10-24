---
path: apps/electron/src/main/lib/bridge-attachment-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 570ae26e6acc38c8450e7393dab13fa983951806
sha256: 98b897377bbb771602e9d0bc361b31ca985b6709c8790f88626612ade3622f31
lines: 245
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/bridge-attachment-utils.ts

## 1. 结论与边界

**Bridge 附件处理工具**（`bridge-attachment-utils.ts:1-6` 注释）：为微信/钉钉/飞书 Bridge 提供图片/文件保存、类型推断与 `<attached_files>` XML 构建、文件树渲染。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MAX_IMAGE_SIZE` | const | `:13` | 10MB 警告阈值 |
| `inferImageMediaType` | function | `:29-45` | magic bytes 推断（JPEG/PNG/GIF/WebP；<4 字节/未识别回退 `image/jpeg`） |
| `inferExtension` | function | `:50-53` | MIME→扩展名白名单（`SAFE_IMAGE_EXTENSIONS` `:16-24`，不识别回退 jpg） |
| `saveImageToSession` | function | `:79-97` | 存图到会话工作目录（sanitize 文件名+扩展名） |
| `saveFileToSession` | function | `:104-119` | 存文件（同路径守卫） |
| `buildAttachedFilesBlock` | function | `:126-130` | `<attached_files>` 块（空→''） |
| `buildFileTree` | function | `:215-229` | 目录文件树文本行（选项默认：📁/📄 图标、深度 3、上限 50） |
| `buildSessionFileTree` | function | `:238-245` | 会话目录树（只读不创建 `:234`） |

内部：`ensurePathWithin`（**防路径穿越**，rel 越界即抛 `:58-65`）、`sanitizeFileName`（basename+危险字符替换 `_` `:70-72`）、`FILE_TREE_IGNORE`（node_modules `:133`）、树形连接符（全角空格对齐防飞书 markdown 折叠 `:147-151`）、`TREE_TRUNCATED_NOTICE`（`:154`）、`walkFileTree`（`:156-203`）。

## 3. 内部逻辑与关键流程

1. 保存链（`:79-119`）：sessionDir → sanitize 文件名 → **`ensurePathWithin` 把关**（`:90/:112`）→ mkdir+write。
2. `walkFileTree`（`:156-203`）：深度/截断短路（`:164-165`）；readdir 失败静默跳过（`:170-172`）；过滤点文件+node_modules、目录优先+名称排序（`:174-181`）；**触顶即停并在顶层统一追加单次提示**（`:186-189/:225-227`）；目录前缀延伸（isLast 用 TREE_BLANK `:196`）。

## 4. 调用者与调用链

入向：微信/钉钉/飞书 Bridge（附件保存/文件树命令，跨文件）。出向：`./config-paths`（getAgentSessionWorkspacePath/resolveAgentSessionWorkspacePath `:10`）、`node:fs`/`node:path`。

## 5. 数据 I/O、读写与副作用

写：会话工作目录文件（mkdirSync/writeFileSync）；读：目录树（readdirSync）；console.log。

## 6. 分支、失败、取消与恢复

路径穿越即抛（`:62-64`）；readdir 失败静默（`:170-172`）；截断单次提示。不适用取消/恢复。

## 7. 权限与权威状态

安全红线：`ensurePathWithin` 防穿越（`:55-65`）、`sanitizeFileName` 剥路径分隔符（`:68-72`）、树只读不创建（`:234`）。

## 8. 修改影响面

改保存/树渲染 → 各 Bridge 附件与文件树命令；树形连接符牵动飞书 markdown 展示。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索本文件 8 符号 → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 导出+6 内部+保存/树全分支 | 已证实 | 逐行读 `:1-245` |
| 飞书折叠行为 | 推断 | `:147` 注释自述 |
| Bridge 调用方 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2 | `:13-245` | covered |
| 保存链/树遍历 | §3 | `:79-229` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
