---
path: apps/electron/default-skills/pptx/scripts/clean.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3d13994cfeb46b70ca2d8ba2839688bc85021fd0
sha256: 3e3966a17f488a1ddc7145f0b7ec9f25595afa1f3a427ab05e610f1a328feea9
lines: 286
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/clean.py

## 1. 结论与边界

解包 PPTX 目录**无引用清理**（`clean.py:1-16`）：删孤儿 slide 及其 rels、`[trash]` 目录、孤儿 rels、无引用 media/embeddings/charts/diagrams/drawings/ink/theme/notesSlides，及被删文件的 Content-Type Override。副作用=删文件+改写 XML。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `get_slides_in_sldidlst` | 函数 | `:27` | presentation.rels rId→slide 映射 ∩ presentation.xml `<p:sldId r:id>` 引用集 |
| `remove_orphaned_slides` | 函数 | `:49` | 删不在 sldIdLst 的 slide+rels，并清 presentation.rels 对应项（`:71-86`） |
| `remove_trash_directory` | 函数 | `:91` | 删 `[trash]` 内文件与目录 |
| `get_slide_referenced_files` | 函数 | `:106` | 递归收集 slide 链引用的文件集 |
| `clean_unused_files` | 函数 | `:251` | 主循环（见 §3） |
| `remove_orphaned_rels_files` | 导出（公共） | — | 清理孤儿 `.rels` 文件 |
| `get_referenced_files` | 导出（公共） | — | 收集引用文件集 |
| `remove_orphaned_files` | 导出（公共） | — | 删除无引用文件（级联 `_rels`） |
| `update_content_types` | 导出（公共） | — | 清除被删文件的 Override（`:262` 调用） |

## 3. 内部逻辑与关键流程

`clean_unused_files`（`:251-264`）：**固定点循环**——每轮 `remove_orphaned_slides + remove_trash_directory + removed_files`（级联删除 `_rels`+孤儿文件，`:255`），无新删除即停（`:256-257`）；结束后 `update_content_types`（`:261-262`）。引用闭包=从 sldIdLst 存活 slide 出发经 `.rels` 递归收集（`get_slide_referenced_files`）。CLI（`:267-286`）：单参数，打印删除清单或 "No unreferenced files found"。

## 4. 调用者与调用链

- 入向：pptx 技能流程（Agent CLI，域外）。
- 出向：defusedxml.minidom/re/pathlib。

## 5. 数据 I/O、读写与副作用

删文件/目录；改写 `presentation.xml.rels` 与 `[Content_Types].xml`。**无备份/回收站**（删除不可逆，照实记录）。

## 6. 分支、失败、取消与恢复

级联固定点防单轮残留；无取消；误删风险由调用方先行复制缓解（域外约定）。

## 7. 权限与权威状态

无权限分支，依据：本地清理；存活权威=sldIdLst 引用闭包。

## 8. 修改影响面

打包前瘦身；与 add_slide 的孤儿页清理互为配套。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 引用闭包/固定点级联/清理面 | 已证实 | `:1-286` 全文（中间段抽查递归引用收集） |
| 删除不可逆（无备份） | 已证实（照实记录） | 全文无 backup 调用 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 公共函数+CLI | §2/§3 | 27-286 | covered |
