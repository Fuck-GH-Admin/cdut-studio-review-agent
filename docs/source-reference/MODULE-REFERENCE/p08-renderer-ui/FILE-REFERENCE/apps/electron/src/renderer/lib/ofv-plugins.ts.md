---
path: apps/electron/src/renderer/lib/ofv-plugins.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 06e553e4c16b78b267af992af58980b5b3d4f482
sha256: c28ec2318468ab90e360f8c79b6eaad176a761dc5c41b9d2d30ab2e14336486c
lines: 53
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/ofv-plugins.ts

## 1. 结论与边界

Open File Viewer 的插件白名单**单一来源**（53 行，头注释 `:1-14`）：OFV `createViewer` 不传 plugins 只有 fallback 面板（`:8-9`）；其重依赖是字面量动态 import（three/mermaid/hls.js/ag-psd/xlsx/pdfjs-dist/leaflet/prismjs 等），白名单**同时决定运行期加载与打包体积**（`:9-11`）。

**边界**：**刻意不挂 `cadPlugin`**（`@mlightcad/*` 可选 peer 未安装，挂上打开 dwg 抛错，`:13`）；插件实现本身在 `@open-file-viewer/core`（外部包，未深读）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `createOfvPlugins` | 函数（导出） | 35-52 | `(): PreviewPlugin[]` | 15 插件按序数组 |

导出合计 1。导入面（`:15-32`）：`@open-file-viewer/core` 的 15 个插件工厂 + 类型 `PreviewPlugin`。

## 3. 内部逻辑与关键流程

单函数返回字面量数组，**顺序即匹配优先级**（`:34` 注释）：`officePlugin()`（docx/doc/xlsx/xls/pptx/ppt——老式 Office 是主要缺口，`:37`）→ `ofdPlugin()` → `xpsPlugin()` → `epubPlugin()` → `emailPlugin()` → `archivePlugin()`（zip/7z/rar/tar/gz…，`:42`）→ `assetPlugin()`（psd/psb/ai/eps/ps、字体、wasm、sqlite/parquet/avro 等，`:43`）→ `xmindPlugin()` → `drawingPlugin()` → `gisPlugin()` → `model3dPlugin()` → `audioPlugin()` → `videoPlugin()` → `imagePlugin()`（psd/ai/heic/tiff/ico…，`:50`）→ `textPlugin()`（文本兜底）。`fallbackPlugin` 由 OFV 自动追加（`:34`）。

## 4. 调用者与调用链

入向（全冻结树检索 `ofv-plugins`/`createOfvPlugins`）：`components/file-browser/ofv-preview/OfvPreview.tsx:30`（import）→ `OfvPreview.tsx:74` `plugins: createOfvPlugins()`（渲染进程回退预览面）；`viewer/main.ts:34`（import）→ `main.ts:139` `plugins: createOfvPlugins()`（浏览器列独立 viewer 页）。与头注释"两处使用"（`:4-6`）一致〔证实〕。
出向：`@open-file-viewer/core`（`:15-32`，外部包）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（不适用，依据：仅构造数组）。副作用：数组内容触发 OFV 运行期加载对应插件 chunk（打包体积影响，`:9-11`）。

## 6. 分支、失败、取消与恢复

无分支（不适用，依据：字面量返回）。失败面：`cadPlugin` 未挂是刻意失败规避（`:13`）；插件构造函数若抛错由调用方承担（本文件无 try/catch，〔证实〕）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。权威状态=白名单本身（格式准入的单一真源）。

## 8. 修改影响面

- 影响两个消费点的渲染能力面（`OfvPreview.tsx:74`/`viewer/main.ts:139`）与打包 chunk 图（新增插件=新增异步 chunk）。
- 与 `ofv-extensions.ts` 的扩展名准入配套；挂 `cadPlugin` 需先安装 `@mlightcad/*` 可选依赖（依赖变更不在文档范围）。
- 需同步修改的测试：批内无（见 §9）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `ofv-plugins`/`createOfvPlugins` 无测试文件命中；检索范围=baseline/source 全树）。间接证据：无断言级命中。

`NOT_RUN`：本轮未运行任何测试/构建（插件实际加载行为未验证）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 插件清单/顺序语义/不挂 cadPlugin | 已证实 | `:1-53` 全文逐行 |
| 两消费点与注释一致 | 已证实 | 全树检索（§4） |
| 各插件覆盖格式（注释行 `:37-50`） | 已证实（注释声明） | OFV 包行为未逐核 |
| OFV createViewer 的 fallback 追加语义 | 推断 | `:8-9` 注释（外部包未深读） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createOfvPlugins` 15 项+顺序 | §2/§3 | 35-52 | covered |
| cadPlugin 排除 | §1/§6 | 13 | covered |
| 消费点 | §4 | - | covered |
