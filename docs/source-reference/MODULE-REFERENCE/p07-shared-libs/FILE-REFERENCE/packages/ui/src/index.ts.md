---
path: packages/ui/src/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e1bfe09fe42332cdf3aeff8af64a409ff4f19410
sha256: 2c6679e2b98e0788b6685f56d4918d9f06277b49640777787c6dc34b3d458081
lines: 26
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/index.ts

## 1. 结论与边界

`@profer/ui` **包公共入口 barrel**（`packages/ui/src/index.ts:1-26`）：集中再导出组件/Hooks/工具/常量共 20 个符号。无逻辑。注意 `useSmoothZoom` 直连 `./hooks/use-smooth-zoom.ts`（`:11`，不经 `hooks/index.ts`）。

## 2. 导出与关键符号

导出 20 条（全为 re-export）：

| 符号 | 来源（行） | 说明 |
| --- | --- | --- |
| `Toaster` | `./primitives/sonner.tsx`（`:5`） | Sonner Toaster |
| `MarkdownPreview` / `MARKDOWN_PREVIEW_LIGHT_COMPONENTS` / `MarkdownPreviewProps` | `./markdown-preview.tsx`（`:6-7`） | 轻量 Markdown 预览 |
| `CodeBlock` | `./code-block/index.ts`（`:8`） | 代码块 |
| `MermaidBlock` | `./mermaid-block/index.ts`（`:9`） | 图表 |
| `useSmoothStream` | `./hooks/index.ts`（`:10`） | 流式平滑 |
| `useSmoothZoom` / `SmoothZoom` / `SmoothZoomOptions` | `./hooks/use-smooth-zoom.ts`（`:11-12`） | 缩放 hook |
| `applyWheelZoom` / `DEFAULT_WHEEL_ZOOM` / `WheelZoomOptions` | `./lib/wheel-zoom.ts`（`:13-14`） | 滚轮缩放纯函数 |
| `cn` | `./lib/cn.ts`（`:15`） | 类名合并 |
| `detectIsMac` / `detectIsWindows` | `./lib/platform.ts`（`:16`） | 平台探测 |
| `Z_INDEX` / `Z_LAYER` / `ZLayerName` | `./lib/z-layers.ts`（`:17-18`） | 图层阶梯 |
| `isMermaidLanguage`/`looksLikeMermaidDefinition`/`shouldInspectMermaidCodeBlock`/`shouldRenderMermaidCodeBlock`/`isMindMapLanguage`/`shouldRenderMindMapCodeBlock` | `./mermaid-detection.ts`（`:19-26`） | 代码块识别 6 函数 |

## 3. 内部逻辑与关键流程

无（纯 re-export）。

## 4. 调用者与调用链

入向：全仓 `from '@profer/ui'` 44 个文件（另有 `@profer/ui/primitives/*` 深路径消费者，如 alert-dialog 22 文件）。出向：见 §2 来源列（各文件主手册在本批）。

## 5. 数据 I/O、读写与副作用

无（barrel 本身；被导出模块的副作用见各自手册）。

## 6. 分支、失败、取消与恢复

不适用，依据：纯 re-export 无分支。

## 7. 权限与权威状态

无。

## 8. 修改影响面

增删/改名任一导出 → 44 个包入口消费者与深路径消费者的导入面；`WheelZoomOptions`/`SmoothZoom` 等类型导出影响类型兼容。

## 9. 测试证据

无直接测试（barrel 无逻辑）；被导出符号的测试见各自主手册（`wheel-zoom.test.ts`/`markdown-preview.test.tsx`/`mermaid-detection.test.ts` 均直连源文件或经本入口）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 20 条 re-export 清单与来源 | 已证实 | 逐行读 `:1-26` |
| useSmoothZoom 直连路径 | 已证实 | `:11-12` vs `hooks/index.ts`（仅 useSmoothStream） |
| 深路径消费规模（alert-dialog 22 文件） | 已证实 | 全树检索 `@profer/ui/primitives/alert-dialog` |

## 11. 覆盖表

| 符号组 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 20 条导出 | §2 | `:5-26` | covered |
| 调用面 | §4/§8 | — | covered |
