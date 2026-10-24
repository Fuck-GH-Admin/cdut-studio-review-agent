---
path: apps/electron/src/renderer/components/shared/UserAvatar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3462e5c4ce56dc3dc109223bfa240d986a5bdfa8
sha256: 29493f4c043d30adfa12beed94129c0e665dcad124dd2488731e9680bc3ebc39
lines: 71
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/shared/UserAvatar.tsx

## 1. 结论与边界

用户头像组件（头注释 :2-9）：对标 Cherry Studio EmojiAvatar——emoji 文本或 data:image/http 图片；默认 35px、圆角 20%。

## 2. 导出与关键符号

导出 1 条（`export` :28）：`UserAvatar({avatar, size=35, className, onClick})`（:28-71）。内部：`isImageUrl`（:24-26，data:image 或 http 前缀）。

## 3. 内部逻辑与关键流程

二分支（:36-70）：图片→img 渲染（:37-53）；emoji→文本渲染 fontSize=size*0.5（:34/:57-69）。可点击态 hover（:41/:62）。

## 4. 调用者与调用链

入向（子agent 交叉核）：**8 生产**（TabPreviewPanel:14/SessionMiniMapPopover:15/rail:14/expanded-sidebar:16/sticky-user-message:17/scroll-minimap:16/SDKMessageRenderer:41/GeneralSettings:23）。出向：react、`@/lib/utils`（cn）。

## 5-7. 数据/分支/权限

纯渲染；二分支；不适用。

## 8. 修改影响面

- 消费面：用户展示点。
- 依赖面：user-profile 原子（上游数据）。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；二分支 | 已证实 | :24-70 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+二分支 | §2/§3 | :28-70 | covered |
