---
path: apps/electron/default-skills/pptx/scripts/add_slide.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13700df012007ae73e63e12555182b75d3899a4a
sha256: 04233ba3932c6b8611677347891616456e243cc09b7f9769408b8c83d9acfe64
lines: 195
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/add_slide.py

## 1. 结论与边界

解包 PPTX 目录**加页工具**（`add_slide.py:1-19`）：source 可为 slide 文件（复制页）或 slideLayout 文件（按版式建页）；打印待加入 `presentation.xml` 的 `<p:sldId>` 片段（**不自动改 presentation.xml 的 sldIdLst**——照实记录 `:18,87`）。副作用=写 slide/rels/Content_Types/presentation.rels。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `get_next_slide_number` | 函数 | `:27` | `slide*.xml` 编号 max+1（空则 1） |
| `create_slide_from_layout` | 函数 | `:33` | 空白 slide 骨架+rels 指向 layout |
| `duplicate_slide` | 函数 | `:90` | 复制 slide+rels（**剔除 notesSlide 关系** `:113-117`） |
| `parse_source` | 函数 | `:165` | `slideLayout*.xml`→('layout',…)；否则 ('slide',None) |
| `_add_to_content_types` | 内部 | `:130` | 幂等追加 Override（已存在跳过 `:136`） |
| `_add_to_presentation_rels` | 内部 | `:141` | 分配下一个 rId 并追加 Relationship（幂等 `:151`） |
| `_get_next_slide_id` | 内部 | `:158` | presentation.xml `<p:sldId id>` max+1（空则 256） |

## 3. 内部逻辑与关键流程

CLI（`:172-195`）：两参数校验（`:173-181`）→目录存在（`:186-188`）→`parse_source` 分派（`:190-195`）。两条建页路径均：建 slide 文件→content_types+presentation.rels→打印 `<p:sldId id="{next}" r:id="{rid}"/>` 建议（`:87,127`）。

## 4. 调用者与调用链

- 入向：pptx 技能流程（Agent CLI，域外）。
- 出向：shutil/re/pathlib（无三方依赖）。

## 5. 数据 I/O、读写与副作用

写 `ppt/slides/slideN.xml`+`_rels`、`[Content_Types].xml`、`ppt/_rels/presentation.xml.rels`（全部幂等追加）。

## 6. 分支、失败、取消与恢复

source 缺失→stderr+exit 1（`:39-41,96-98`）；用法错误→usage+exit 1；无回滚（追加式）。

## 7. 权限与权威状态

无权限分支，依据：本地文件编辑；**sldIdLst 由调用方手工加入**（工具只给片段）为设计边界。

## 8. 修改影响面

加页链；rId/slideId 分配逻辑影响 presentation 一致性（校验由 validators 兜底）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 双路径/幂等追加/编号策略 | 已证实 | `:1-195` 全文 |
| sldIdLst 手工步骤遗漏风险 | 已证实（设计边界） | `:18,87` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出+3 内部+CLI | §2/§3 | 27-195 | covered |
