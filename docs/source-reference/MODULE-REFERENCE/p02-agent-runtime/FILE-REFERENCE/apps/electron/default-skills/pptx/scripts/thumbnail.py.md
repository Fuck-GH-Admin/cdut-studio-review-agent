---
path: apps/electron/default-skills/pptx/scripts/thumbnail.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: edcbdc0f81e7919fb2e6bb5b4a9f15bfa131f036
sha256: e959ecd4f19735161218bc44d0648a46da17874323fb3e19c2e9cb50cefe6ce7
lines: 289
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/thumbnail.py

## 1. 结论与边界

PPTX **缩略图网格生成器**（`apps/electron/default-skills/pptx/scripts/thumbnail.py:1-16`）：soffice 转 PDF→pdftoppm 转图→PIL 排版网格（每图标注 XML 文件名、隐藏页用占位图案）。CLI（`:40-92`、`:288-289`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `main` | 函数 | `:40-92` | CLI 主流程 |
| `get_slide_info` | 函数 | `:95-118` | `(pptx_path) => list[dict]` | 从 rels+presentation.xml 读幻灯片顺序与 `show="0"` 隐藏标记 |
| `build_slide_list` | 函数 | `:121-146` | 隐藏页插占位图（`(hidden)` 标注） |
| `create_hidden_placeholder` | 函数 | `:149-155` | 灰底 X 交叉占位图 |
| `convert_to_images` | 函数 | `:158-193` | soffice→PDF→`pdftoppm -jpeg`（100 DPI） |
| `create_grids` | 函数 | `:196-222` | 分页网格（每格 `cols*(cols+1)` 张，多页命名 `stem-N`） |
| `create_grid` | 函数 | `:225-285` | 单网格排版（标签+缩略图+边框） |

常量：`THUMBNAIL_WIDTH=300`、`CONVERSION_DPI=100`、`MAX_COLS=6`、`DEFAULT_COLS=3`、`JPEG_QUALITY=95`、`GRID_PADDING=20`、`BORDER_WIDTH=2`、`FONT_SIZE_RATIO=0.10`、`LABEL_PADDING_RATIO=0.4`（`:29-37`）。

## 3. 内部逻辑与关键流程

1. 参数：`input`（.pptx）、`output_prefix`（默认 `thumbnails`）、`--cols`（钳到 6，`:60-62`）。
2. `get_slide_info`（`:95-118`）：`ppt/_rels/presentation.xml.rels` 建 rId→slide 映射，`ppt/presentation.xml` 的 `p:sldId` 顺序输出 `{name, hidden}`（`show=="0"`）。
3. `convert_to_images`（`:158-193`）：`soffice --headless --convert-to pdf`（`get_soffice_env()`，`:161-176`，失败抛「PDF conversion failed」）→ `pdftoppm -jpeg -r 100`（`:178-191`）→ `sorted(glob("slide-*.jpg"))`。
4. `build_slide_list`（`:121-146`）：隐藏页生成占位图（尺寸取首图或 1920×1080，`:126-130`）并标注 `(hidden)`；可见图按序配对。
5. `create_grids`（`:196-222`）：`max_per_grid = cols*(cols+1)`；单页→`<prefix>.jpg`，多页→`<prefix>-N.jpg`（`:211-216`）。
6. `create_grid`（`:225-285`）：字体 `ImageFont.load_default(size)`（失败回退默认，`:244-247`）；每格标签居中+LANCZOS 缩放+灰色边框（`:249-283`）。

## 4. 调用者与调用链

- CLI/`pptx` skill 编排。
- 出向：`office.soffice.get_soffice_env`（本批）、`PIL`、`defusedxml.minidom`、系统 `soffice`/`pdftoppm`。

## 5. 数据 I/O、读写与副作用

- **进程**：`soffice`、`pdftoppm` 两步转换（临时目录）。
- **写**：输出 `.jpg` 网格（可多张）。
- **读**：PPTX ZIP 内 XML（defusedxml）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非 .pptx/不存在 | `:65-67` | 错误 exit 1 |
| `--cols>6` | `:60-62` | 钳制+警告 |
| 无幻灯片（无可见图且无隐藏页） | `:78-80` | 「No slides found」exit 1 |
| PDF/图片转换失败 | `:175-176`、`:190-191` | RuntimeError→`main` 捕获 exit 1（`:90-92`） |
| 字体加载失败 | `:246-247` | 回退默认字体 |

## 7. 权限与权威状态

无身份校验；隐藏页显式占位（`(hidden)` 标注，`:140`）保持信息不丢失。

## 8. 修改影响面

- `soffice`/`pdftoppm` 外部依赖与 LibreOffice/poppler 版本耦合。
- `max_per_grid = cols*(cols+1)` 分页口径影响输出张数。
- `get_soffice_env` 的沙箱 shim（soffice.py）间接影响本脚本可用性。

## 9. 测试证据

无专属测试（全树检索 `thumbnail` 测试命中 0）。**NOT_RUN**：未运行 Python/soffice/pdftoppm/PIL/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全流程（读 XML→转换→排版→输出） | 已证实 | `:40-285` |
| 隐藏页占位+标注 | 已证实 | `:135-140`、`:149-155` |
| 多网格分页命名 | 已证实 | `:211-216` |
| 转换链实际效果 | 未知 | 未运行 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `main` | `:40-92` | covered |
| `get_slide_info` | `:95-118` | covered |
| 幻灯片列表/占位 | `:121-155` | covered |
| 转换 | `:158-193` | covered |
| 网格排版 | `:196-285` | covered |
