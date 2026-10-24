---
path: apps/electron/src/main/lib/file-preview-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 47a8091a7c46aaf734f506bdb2b47dd085a4b704
sha256: 40239195167048875a8627bc34b48f3122fd44bdcf0da2361a9cb12c898981b4
lines: 741
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/file-preview-service.ts

## 1. 结论与边界

文件预览服务（头注 :1-6）：路径解析、PDF 预览 HTML 生成（`cdut-file://` 协议加载、无体积膨胀）、DOCX/XLSX/PPTX 转 HTML。50MB 上限（`MAX_FILE_SIZE` :19）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `cleanPreviewTmpDir` | fn | 38-49 | 清临时预览文件 |
| `expandHomeDirectory` | fn | 53-59 | 仅当前用户 `~`（不猜 `~other-user`） |
| `resolveTargetPath` | fn | 196-268 | 路径解析（含预检 skipGlobalSearch 模式） |
| `PreparePdfPreviewOptions` | interface | 285-294 | `pages?:number[]` 仅栅格化目标页 |
| `preparePdfPreview` | fn | 297-… | 生成 PDF 查看器 HTML（cdut-file://） |
| `convertOfficeToHtml` | fn | ~700-741 | XLSX/PPTX→HTML（office-engine 驱动） |

内部：`getPreviewTmpDir/writeTempHtml`（:22-35，md5 哈希命名复用）、`searchFileInDir`（:62-84，深度 8/扫 500 上限）、`searchCommonDirs`（:87-98）、`collectGlobalSearchDirs`（:101-192，agent-workspaces+attachedDirectories，30s 缓存）、`renderOfficeBlocksHtml`、`resolveFilePath`。

## 3. 内部逻辑与关键流程

1. **`resolveTargetPath`**（:196-268）：绝对路径直查→fallback 按名搜索（basePaths→agent-workspaces 根）；相对路径：首段匹配 base→base 拼接→home→常用目录→全局 fallback（`skipGlobalSearch` 时仅 basePaths 内浅层深度 3，注释 :186-190 避免批量预检阻塞主进程）。
2. **`preparePdfPreview`**（:297-…）：50MB 拒；`local-file-protocol` 注册文件/脚本/字体 URL；`initialPages` 去重保序（:402，仅渲染目标页——头注 :286-293：26 页 PDF 全量栅格化实测约 34 秒、逐页截图放大几十倍等待，历史「登记卡住」根因）；生成 viewer HTML（bbox 聚光灯 CSS/`agent-preview:pdf-ready` 信号）。
3. **`convertOfficeToHtml`**：`.xlsx/.pptx` 限定→`parseOfficeBuffer`→渲染 HTML+text（AST blocks 拼接）。

## 4. 调用者与调用链

入向：`browser-preview-service.ts`/预览面板 IPC（全树 grep）。出向：`./config-paths`、`@profer/core/office-engine`（:14）、`./local-file-protocol`（动态 :406）。

## 5. 数据 I/O、读写与副作用

读文件/写临时 HTML（`{tmpdir}/profer-preview/`）；`cdut-file://` 注册；无网络。

## 6. 分支、失败、取消与恢复

解析失败/超限→null；资产解析失败→console.error+null；临时文件按内容哈希复用。

## 7. 权限与权威状态

- 路径权威：`~` 仅当前用户（:53-55 注释）；跳过 `~other-user`；预检/完整两档搜索但**不做跨边界授权判定**（授权由调用方 preview-inspection 上下文负责）。
- 性能权威：逐页栅格化（pages 限定）是登记性能不变量（:286-293）。

## 8. 修改影响面

内联预览面板/审核材料登记单页截图。同测：`file-preview-service.test.ts`（8 用例）。

## 9. 测试证据

直接测试 `file-preview-service.test.ts`（8 用例 / 3 describe；真 mkdtemp+假 PDF 字节；NOT_RUN）：
- `:18-22` home 缩写仅当前用户（`~other-user` 原样）。
- `:24-28` `~/.xxx` 解析展开。
- `:33-63` 预检浅层三态：深度 2 命中（:44-47）、不存在 null（:49-52）、深度 5 不命中（:54-58）。
- `:67-124` 逐页栅格化护栏：`pages:[7]`→`initialPages = [7]`+guarded 分支无 `renderAll`（:80-95）；不限页→`renderAll()`（:97-103）；`[3,3,0,-1,2.5,5]`→`[3,5]`（:105-111）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 逐页栅格化/去重保序 | 已证实 | :402 + 测试 :67-124 |
| 预检浅层深度 3 | 已证实 | 测试 :33-63 |
| 全局 fallback/Office 转换 | 已证实（代码）/未知（行为） | :101-268/~700-741（无直接用例） |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `expandHomeDirectory` | §3.1/§9 | 53-59 | covered |
| `resolveTargetPath` 预检模式 | §3.1/§9 | 196-268 | covered |
| `preparePdfPreview` pages | §3.2/§9 | 285-402 | covered |
| 全局搜索/Office 转换 | §3.1/§3.3 | 101-192/~700 | covered（未测） |
