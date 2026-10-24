---
path: apps/electron/src/renderer/components/file-browser/office-preview/official-preview-session.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 69fcad6468d532a6add3740de61218afc14b86eb
sha256: d1f02d76e747606a146ecb4a2713698cfa294b82070f562429883cfd061ccfcf
lines: 120
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/office-preview/official-preview-session.ts

## 1. 结论与边界

正式 PPTX 预览的会话注册与 AI 观察接口：注册用户可见的正式预览实例（filePath/revision/viewer/host），供 `inspectOfficialPptxPreview` 逐页截取画布 PNG。**拒绝返回空白图/完全相同多页图**（视觉评价依据的诚实口径）。

不做的事：不渲染 PPTX（`silurus-bridge` 负责）；不做预览 UI。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `registerOfficialPptxPreview` | function | `:18-23` | 注册（返回幂等注销闭包——仅当仍是同一实例才删） |
| `inspectOfficialPptxPreview` | function | `:70-120` | `(AgentFilePreviewInspectRequest) => Result`（截页 PNG base64） |

内部：`sessions` Map（`:16`）；`nextFrames`（rAF 两帧）；`canvasHasVisualContent`（`:37-53`，64×36 采样、亮度极差 ≥2 判有效像素）；`waitForRenderedCanvas`（`:55-65`，3s 轮询，超时抛“拒绝返回空白图”）；`capturePage`（scrollToSlide→等画布→toDataURL 去前缀）。

## 3. 内部逻辑与关键流程

`inspectOfficialPptxPreview` 守卫链（`:71-84`）：无注册实例→抛；**filePath/revision 不符→抛**（revision 过期请重调 open_file_preview）；页数 <1→抛；`scope==='all'` 且页数超 `AGENT_PREVIEW_LIMITS.maxPages`→抛（改用 overview/page）；`scope==='page'` 页码越界→抛。

页选择：page=单页；overview=`{1, 中页, 末页}`（去重）；all=全页。逐页 `capturePage` 累计载荷（0.75×base64 长度）超 `maxPayloadBytes`→抛；**多页图完全相同→抛**（`:111-112`）。`finally` 恢复原 scale/原页（`:116-118`）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：AI 文件观察链路（AgentFilePreviewInspect IPC 侧调用）。出向：`@profer/shared`（limits/请求结果类型）、`./silurus-bridge`（`getRenderedPptxSlideCanvas`/`OfficeViewerHandle`）。

## 5. 数据 I/O、读写与副作用

读渲染画布像素（getImageData）；scrollToSlide/setScale 副作用但 finally 复原。无持久化。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 未注册/文件/revision 不符 | `:71-73` | 抛（明确原因） |
| 3s 无有效像素 | `:63-64` | 抛（拒空白图） |
| 载荷超限 | `:106-108` | 抛（请缩小范围） |
| 多页全同 | `:111-112` | 抛（拒作视觉依据） |
| 恢复 | `:116-118` | finally 复原 scale/页 |

## 7. 权限与权威状态

诚实边界三连：拒空白图、拒全同多页图、revision 过期明示重开；页数/载荷上限引 shared 常量。

## 8. 修改影响面

改观察语义 → 影响 AI 视觉评价数据可信度；`silurus-bridge`/limits 联动。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 守卫链/复原 | 已证实 | `:70-120` |
| 拒空白/全同图 | 已证实 | `:63-64/:111-112` |
| 有效像素判定 | 已证实 | `:37-53` |
| 运行表现 | 未知 | NOT_RUN（canvas/DOM） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 注册/内部三件 | 2/3 | `:16-65` | covered |
| `inspectOfficialPptxPreview` | 3 | `:70-120` | covered |
