---
path: apps/electron/src/main/lib/browser-preview-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d416dff622cf2b6ab66756ea6666cdc8262e4ae2
sha256: fb9cc2f3cbdfbc2235514e0773e81c8f57cd254ceb792542ae2cc416ce86213e
lines: 130
kind: source
package: p03-integrations
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/browser-preview-service.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

本地预览 URL 构造（130 行）：授权根内 HTML→`cdut-file://` 目录 URL（不接受 file://、不暴露绝对路径给 renderer/模型，头注 :26-28）；其它格式→viewer 页（文件以 token 作 `?src=`、主题以 `?theme/?tokens=` 烘入——viewer 无 preload，注释 :104-106）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `createAuthorizedPreviewUrl` | fn | 35-68 | HTML 本地预览（授权根/只读策略双边界） |
| `isAuthorizedPreviewProtocol` | fn | 70-72 | `cdut-file://` 前缀 |
| `ViewerPreviewTheme` | type | 88 | = `OfvThemePayload` |
| `viewerPreviewThemeSignature` | fn | 96-98 | `theme|serializedTokens`——「判某标签 URL 烘的是不是这套主题的**唯一**口径」（注释 :90-94，同色调皮肤也可判差） |
| `createViewerPreviewUrl` | fn | 112-130 | viewer 页 URL（dev Vite/打包 renderer 目录） |

内部：`isInside`（:9-11）、`realDirectory/realDirectoryOrNull`（:13-25，失效根略过不拖垮整体，:23 注释）、`PACKAGED_RENDERER_DIR`（:75）。

## 3. 内部逻辑与关键流程

1. **`createAuthorizedPreviewUrl`**（:35-68）：空拒→`expandHomeDirectory`+realpath→授权根匹配（失效根跳过）→不在根时回退「只读预览策略放行，边界取文件所在目录」（:45-46，与聊天文件链接同构）→目录找 index.html→仅 .html/.htm→越界拒→`registerProferDirectoryPath`+相对路径 encodeURIComponent。
2. **`createViewerPreviewUrl`**（:112-130）：文件必须存在普通文件→授权（根内或只读策略）→`registerProferFilePath` 作 `?src=`→dev `VITE_DEV_SERVER_URL/viewer.html` 或打包 `cdut-file://<renderer>/viewer.html`→theme/tokens 烘 query。

## 4. 调用者与调用链

入向（生产）：`browser-controller.ts:11`（previewOpen/refreshLocalPreviewThemes）。测试：`browser-preview-service.test.ts`。出向：`./file-preview-service`（expandHomeDirectory）、`./preview-path-policy`、`./local-file-protocol`、`./config-paths`、`@profer/shared`、`electron`。

## 5. 数据 I/O、读写与副作用

`realpathSync/statSync` 只读；注册 cdut-file token（local-file-protocol）；无网络。

## 6. 分支、失败、取消与恢复

空路径/非目录根/非 HTML/缺 index/越界→throw 中文文案；失效授权根静默跳过。

## 7. 权限与权威状态

- 路径权威：不暴露绝对路径（token 化）；越界拒（:64）；只读预览策略兜底（`isReadOnlyPreviewPathAllowed`，系统/凭据敏感位置仍拒，:29-31）。
- 主题权威：`viewerPreviewThemeSignature` 是唯一判重口径（:90-94）；HTML 预览主题不参与（controller 侧签名 null）。

## 8. 修改影响面

浏览器本地预览/主题重载。同测：`browser-preview-service.test.ts`（7 用例）。

## 9. 测试证据

直接测试 `browser-preview-service.test.ts`（7 用例 / 1 describe；真 mkdtemp+realpath 夹具（注释 :8-9 macOS /var 差异）；NOT_RUN）：
1. `:22-28` 根内 HTML→`cdut-file://`+filePath。
2. `:30-35` 目录→index.html。
3. `:37-42` 根外 HTML 按只读预览放行。
4. `:44-48` 非 HTML 拒。
5. `:50-54` 目录缺 index 拒。
6. `:56-62` 失效/非目录根不拖垮整体。
7. `:64-68` 空路径拒。

未覆盖：`createViewerPreviewUrl`/`viewerPreviewThemeSignature` 独立断言（经 preview-theme 测试间接）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 授权/只读/越界/失效根语义 | 已证实 | 测试族逐条 |
| viewer 主题烘参 | 已证实（代码+间接测试） | :112-130 + preview-theme 测试 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `createAuthorizedPreviewUrl` | §3.1/§9 | 35-68 | covered |
| `createViewerPreviewUrl` | §3.2 | 112-130 | covered（间接） |
| `viewerPreviewThemeSignature` | §2 | 96-98 | covered（间接） |
