---
path: apps/electron/src/renderer/components/file-browser/ofv-preview/OfvPreview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4e1bf24184bfadc408ce3a68e80b14815813c69d
sha256: 982b2183dfcf4c94ccedd9d8b88615461c2e92b97594dc830fccc64b5fba7ebe
lines: 142
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/ofv-preview/OfvPreview.tsx

## 1. 结论与边界

Open File Viewer（`@open-file-viewer/core`）在预览面的宿主（文件头 `:1-22`）：覆盖既有链路缺口——老式 Office（.doc/.xls/.ppt，此前 `DiffTabContent` 渲染 **null 白屏**）与长尾格式（归档/设计/3D/GIS/电子书/邮件/OFD·XPS/绘图/数据，此前 `UNSUPPORTED_EXTS`）。现有可用路径（markdown/html/pdf/图片/WASM Office）不经本组件——**纯增益接线，不改任何当前可用预览行为**。**回退路径**（历史预览 tab/拖入组合），文件面主路径在浏览器列 viewer 页（`:21`）。

**四个刻意取舍**（`:10-18`）：①插件白名单（OFV 默认只挂 fallbackPlugin，重依赖是字面量动态 import（three/mermaid/hls.js 等 45 语言）——白名单同时决定运行期加载与打包体积）；②不挂 cadPlugin（`@mlightcad/*` 可选 peer 未装，挂上 dwg 报错）；③源用 `cdut-file://`（主进程 token 化本地 URL，不把绝对路径带进渲染进程）；④必须显式传 `fileName`（cdut-file URL 无扩展名，OFV 靠 fileName 选插件）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `OfvPreviewProps` | interface | `:36-40` | `{filePath; access?: FileAccessOptions; className?}` |
| `OfvPreview` | function 组件 | `:49-142` | 状态机 loading/ready/error |

内部：`Status`（`:43`）；`errorMessage`（`:45-47`，Error.message 回退“文件预览失败”）。

## 3. 内部逻辑与关键流程

- effect（依赖 `access/filePath/retryVersion/theme`）：`resolveFilePath`（**不在授权目录/不存在→明确报错**，`:69`）→ `createViewer`（plugins=`createOfvPlugins()` 白名单、theme、locale zh-CN、toolbar=`createOfvToolbarOptions`——`showDefaultAppAction:false`（预览面已有文件头）、`onOpenInDefaultApp` 保留 handler 不展示，`:77-84`）。
- **竞态防护**：`cancelled` 标记；卸载/重跑时 `viewer.destroy()`（**必须销毁：OFV 挂 canvas/video/WebGL/worker**，`:106`）。
- 渲染：loading 覆盖层（spinner“正在解析文件…”）；error 覆盖层（消息+“重试”按钮（`retryVersion+1` 重跑））。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：file-browser 预览面（历史预览 tab/拖入组合回退路径）。出向：`@open-file-viewer/core`、`@/lib/ofv-plugins`/`ofv-toolbar`、`window.electronAPI.{resolveFilePath,systemOpenFile}`、`@/atoms/theme`。

## 5. 数据 I/O、读写与副作用

IPC 解析文件路径/系统打开；OFV 自行 fetch `cdut-file://`（scheme 已声明 secure+supportFetchAPI）；DOM/WebGL/worker 挂载销毁。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 解析失败 | `:69` | 明确报错（授权/存在性） |
| viewer 错误 | `:88-92` | error 态 |
| 卸载/竞态 | `:60-68/:94-107` | cancelled+destroy |
| 重试 | `:134` | retryVersion 重跑 |

## 7. 权限与权威状态

- 授权口径：`resolveFilePath` 门禁（不越权读盘）。
- 四取舍如实（白名单体积/不装 cad/不带绝对路径/fileName 选插件）。
- 工具栏去重（预览面已有文件头，不重复展示默认应用动作）。

## 8. 修改影响面

改接线 → 影响长尾格式预览；`ofv-plugins`/`ofv-toolbar`/shared FileAccessOptions 联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯增益口径/四取舍 | 已证实 | 文件头 |
| 竞态防护+强制销毁 | 已证实 | `:60-107` |
| 授权门禁/重试 | 已证实 | `:69/:134` |
| 运行表现 | 未知 | NOT_RUN（OFV/WebGL） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Props/状态机 | 2 | `:36-54` | covered |
| effect/竞态/销毁 | 3 | `:56-108` | covered |
| 渲染三态 | 3 | `:110-142` | covered |
