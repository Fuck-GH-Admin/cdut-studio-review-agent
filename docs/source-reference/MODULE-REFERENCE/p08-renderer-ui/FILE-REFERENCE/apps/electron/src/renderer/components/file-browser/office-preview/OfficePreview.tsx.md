---
path: apps/electron/src/renderer/components/file-browser/office-preview/OfficePreview.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fef6bf2fe367dece8543514c2f2aef6ce724684f
sha256: 03e77cd8556da9e6ab1a0d31e65f4466c9eb6a04186f11f2c39ae91407a1f1bf
lines: 298
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/office-preview/OfficePreview.tsx

## 1. 结论与边界

Office 高保真预览宿主（运行时组件）：Silurus viewer 挂载/销毁、revision 双检防过期（正式 PPTX 预览）、引用胶囊聚光灯高亮、预览视口原生缩放代理（避免整屏 CSS 缩放连带行列号栏，`:57-58` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `OfficePreviewProps` | 接口 | 20-31 | filePath/fileName?/access?/fallback?/onError?/onReady?/agentPreviewSession? |
| `OfficePreview` | 组件 | 39-298 | 唯一导出组件 |

内部：`errorMessage`（`:35-37`）、refs 群（viewerHost/viewer/registrationCleanup/currentSlide/scale/spotlightDispose，`:49-72`）、`reportPreview`（PPTX 正式预览回执 `reportAgentFilePreview`，`:74-85`）。

## 3. 内部逻辑与关键流程

- `load`（`:94-158`）：**revision 双检**——加载前/后各 `getAgentFilePreviewRevision` 比对，不一致抛「正式 PPTX 预览已过期」（`:100-103/:133-139`）；`resolveFilePath`→`createOfficeViewer`（回调：scale 上报视口/异步渲染错误回执/当前页记录，`:111-128`）；PPTX 注册 `registerOfficialPptxPreview`（`:143-151`）；xlsx `fitPage` 适配（`:152-154`）。
- 主 effect（`:160-182`）：AbortController 生命周期；格式不支持→error；失败→destroyViewer+error+回执。
- xlsx ResizeObserver 重适配（`:184-189`）。
- **引用聚光灯**（`:192-234`）：`documentHighlightTargetAtom` 命中同文件（路径归一/文件名兜底，`:199-203`）→80ms 延迟挂 `applyOfficeCitationSpotlight`（先销毁旧圈选框防 observer 泄漏 `:209-211`）→**成功挂载后才消费请求**（提前消费会闪没，`:224-226` 注释）。
- 视口注册（`:251-272`）：zoomIn/Out/fit/reset/getScale/setScale 代理 viewer 原生（clampOfficeScale）。

## 4. 调用者与调用链

入向：`FilePreviewDialog.tsx:224`、侧栏预览（非本批）。出向：`./silurus-bridge`（create/destroy/clamp/normalize/spotlight，非本批）、`./official-preview-session`（非本批）、`@/atoms/preview-atoms`、`@/components/diff/preview-viewport-context`、`window.electronAPI.{resolveFilePath,getAgentFilePreviewRevision,reportAgentFilePreview}`。

## 5. 数据 I/O 与副作用

IPC 解析路径/revision 查询/预览回执；viewer DOM 挂载。

## 6. 分支、失败、取消与恢复

error 态显示「高保真预览失败」+重试按钮（retryVersion 递增重载，`:285-293`）；fallback 可选渲染（`:274`）；卸载统一 destroy+spotlight 清理（`:178-181/:236-240`）。

## 7. 权限与权威状态

revision 双检保证预览与磁盘一致（防过期截图，`:100-102/:133-138`）；access 授权上下文透传。

## 8. 修改影响面

silurus-bridge viewer 接口；预览回执协议（sessionId/requestId/revision）与 Agent 预览链路同步。

## 9. 测试证据

无专属测试（glob `**/OfficePreview*test*` 零命中）；NOT_RUN（GUI）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+revision 双检+聚光灯+视口代理 | 已证实 | `:1-298` 逐行 |
| silurus-bridge 内部 | 未知 | 非本批 |
| 运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/流程 | §2/§3 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
