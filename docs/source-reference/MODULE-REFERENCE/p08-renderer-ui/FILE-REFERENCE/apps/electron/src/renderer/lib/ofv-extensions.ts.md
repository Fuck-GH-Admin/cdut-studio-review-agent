---
path: apps/electron/src/renderer/lib/ofv-extensions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 62913c7c855059009ca688b0f5691a08331c2219
sha256: a70e5ca9ff4c6173e4bdace28d161884bb68810e4d4809d8513725d38709032a
lines: 73
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/ofv-extensions.ts

## 1. 结论与边界

交给 Open File Viewer（OFV）的扩展名**单一来源**（73 行，头注释 `:1-13`）：老式 Office（.doc/.xls/.ppt，此前渲染空白）、历史 `UNSUPPORTED_EXTS` 长尾、`OFV_EXTRA_EXTS`（OFV 有插件但漏在清单外、会渲成乱码的批）；**不含 `.docx/.xlsx/.pptx` 及 OOXML 变体**（走 Silurus WASM `<OfficePreview>`，`:12`）。纯集合+两个判定函数。

**边界**：不含可读文本格式（`.csv/.tsv/.json/.yaml/.xml`、`.geojson/.kml`、`.drawio`、`.dxf`、ASCII 三维等，`:33-35`）；不含 `.obj`（`NON_PREVIEWABLE_BINARY_EXTS` 按编译产物处理，`:36`）；不含 CAD 家族（本仓库刻意不挂 cadPlugin，`:37`）；三源集合 `preview-extension-sets`（跨批）内容未深读。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OFV_OFFICE_EXTS` | 常量（导出） | 17 | `ReadonlySet(['.doc','.xls','.ppt'])` | 97-2003 二进制 CFB（3 项，机械计数） |
| `OFV_EXTRA_EXTS` | 常量（导出） | 39-54 | `ReadonlySet`（**44 项**，机械计数） | 补齐清单 |
| `OFV_EXTS` | 常量（导出） | 56-61 | OFFICE+EXTRA+IMAGE_PREVIEW_EXTS+UNSUPPORTED_EXTS−NON_PREVIEWABLE_BINARY_EXTS | 总路由集合 |
| `fileExtension` | 函数（导出） | 64-68 | `(filePath: string) => string` | 末段 basename 取扩展小写（含点）；`dot > 0` 才算 |
| `isOfvBackedPath` | 函数（导出） | 71-73 | `(filePath: string) => boolean` | `OFV_EXTS.has(fileExtension(...))` |

导出合计 5（机械核对 `^export ` 计数）。

## 3. 内部逻辑与关键流程

1. `OFV_EXTRA_EXTS` 分组（`:39-54`）：电子书/版式/邮件/脑图 8（`.epub/.ofd/.xps/.oxps/.eml/.msg/.mbox/.xmind`）；需解码图片 6（`.tif/.tiff/.heic/.heif/.jxl/.cur`）；Office 长尾 15（`.dot/.xlsb/.xlt/.pps/.odt/.ods/.odp/.fodt/.fods/.fodp/.rtf/.wps/.et/.dps/.numbers/.key` 中含 `.pps` 共 15 项）；设计/资产 7（`.eps/.ps/.psb/.parquet/.avro/.webarchive/.eot`）；3D 7（`.stl/.ply/.3mf/.usd/.usda/.usdc/.usdz`）。入选口径唯一（`:22-23`）：今天会落文本兜底渲成乱码而 OFV 有插件。
2. `OFV_EXTS`（`:56-61`）：`[...UNSUPPORTED_EXTS].filter((e) => !NON_PREVIEWABLE_BINARY_EXTS.has(e))` 与其他三源合并（Set 自动去重）。
3. `fileExtension`（`:64-68`）：按 `/[\\/]/` 切最后一段；`lastIndexOf('.') > 0` 才返回小写扩展（点文件如 `.gitignore` 返回空串）。

## 4. 调用者与调用链

入向（全冻结树检索 `ofv-extensions`/`isOfvBackedPath`）：**仅 1 个生产消费点**——`components/diff/DiffTabContent.tsx:35`（import）→ `DiffTabContent.tsx:314` `isOfvBacked = previewOnly && isOfvBackedPath(filePath) && !isImageExt`。**注释不一致照实记录**：头注释 `:4-6` 声明"两处消费"（含 `components/diff/preview-opener.ts`），但全树检索 `preview-opener.ts` 的 import 块（`:15-28`，已逐行核）不含本模块（其 imports 为 preview-atoms/agent-atoms/agent-tab-access/active-view/cdut-account-atoms/study-atoms/file-utils 等）——第二消费点不存在于当前冻结树（注释与代码差异，〔证实〕）。另 `lib/preview-extension-sets.ts:46` 注释反向提及本文件。
出向：`./preview-extension-sets`（`:14`，三源集合，跨批）。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯集合与字符串函数）。

## 6. 分支、失败、取消与恢复

分支：`fileExtension` 的 `dot > 0` 判定（`:67`）；无 throw/异步（不适用，依据：全文无 throw）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。权威状态=三源集合的并/差运算结果（`preview-extension-sets` 为集合真源之一，跨批）。

## 8. 修改影响面

- 影响 `DiffTabContent.tsx:314` 的预览路由（OFV 预览面 vs 其他渲染）；改集合决定某扩展名走 OFV 还是文本/其他。
- 与 `ofv-plugins.ts`（插件白名单）语义配套：扩展名准入与插件存在性是两道闸（缺插件时 OFV 落 fallback 面板）。
- 头注释"两处消费"与实际一处的差异若要消除，需么补 preview-opener 接线要么改注释（照实记录，修改不在本批范围）。
- 需同步修改的测试：批内无（见 §9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `ofv-extensions`/`isOfvBackedPath`/`OFV_EXTRA_EXTS` 无测试文件命中；检索范围=baseline/source 全树）。间接证据：无断言级命中。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/44+3 项计数/合并运算/fileExtension 语义 | 已证实 | `:1-73` 全文逐行 + 机械计数 |
| 唯一消费点=DiffTabContent.tsx:314 | 已证实 | 全树检索（§4） |
| 头注释"两处消费"与 preview-opener 未 import 的差异 | 已证实 | `:4-6` vs `preview-opener.ts:15-28` import 块逐行核 |
| 头注释 Office 家族列举（`:27-29`）宽于实际集合（`.docm/.dotm/.dotx/.xlsm/.xltm/.xltx/.potx/.potm/.ppsx/.ppsm/.pptm` 不在 `OFV_EXTRA_EXTS`，`:44` 注 OOXML 变体走 Silurus） | 已证实 | `:27-29` vs `:39-54` |
| `preview-extension-sets` 三集合内容 | 边界（跨批） | `:14` 引入 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `OFV_OFFICE_EXTS` | §2/§3.1 | 17 | covered |
| `OFV_EXTRA_EXTS` 44 项+口径 | §2/§3.1/§10 | 39-54 | covered |
| `OFV_EXTS` 合并运算 | §3.2 | 56-61 | covered |
| `fileExtension`/`isOfvBackedPath` | §3.3/§2 | 64-73 | covered |
| 注释/代码差异两处 | §4/§10 | - | covered |
