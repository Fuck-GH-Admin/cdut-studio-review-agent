---
path: apps/electron/src/renderer/components/diff/preview-viewport-context.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 17594c68e119a3e966c468678de2ffd358d5e8a8
sha256: 05f14443ae2c5891b911cdebcdf4229683a030128147e2bc9261056a7730ced3
lines: 53
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/preview-viewport-context.ts

## 1. 结论与边界

**预览视口控制器契约**（53 行，纯类型+Context）：视口只管"手势"——平移交底层原生滚动、缩放交内容注册的控制器（头注释 `:2-13`，历史教训：整屏 CSS transform 会把工具栏/行列号/缩放条一起缩放）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PreviewViewController` | 接口 | `:18` | zoomIn/zoomOut + 可选 fit/reset/getScale/setScale/panBy(dx,dy)→boolean（true=已消费） |
| `PreviewViewportContextValue` | 接口 | `:39` | `tool:'select'|'hand'`、register(controller)→注销、reportScale |
| `PreviewViewportContext` | Context | `:48` | `createContext<…|null>` |
| `usePreviewViewport` | Hook | `:51` | 消费；不在视口内返回 null |

## 3. 内部逻辑与关键流程

不适用（契约层）；各内容原生实现映射（注释 `:4-8`）：PDF=pdf-zoom/pdf-scroll postMessage、Office=viewer.setScale/fitWidth、图片=useSmoothZoom、文本=仅滚动。

## 4. 调用者与调用链

- 入向：预览内容组件（PDF/Office/图片 NodeView 等）与视口宿主（域外）。
- 出向：react。

## 5. 数据 I/O、读写与副作用

无（类型+Context）。

## 6. 分支、失败、取消与恢复

可选方法语义：setScale 未实现→跳过缩放恢复只恢复滚动（`:28-30`）；panBy 未实现/false→回退滚动指针下最深可滚动元素（`:33-35`）。

## 7. 权限与权威状态

缩放/平移权威=内容自注册控制器（保证只有内容区缩放、固定 UI 不动，`:12-13`）。

## 8. 修改影响面

全部预览类型缩放/平移交互契约：上游=视口宿主与各内容控制器（PDF/Office/图片/文本，域外）；修改本文件（PreviewViewController/ContextValue 字段）波及所有预览类型的缩放记忆恢复与平移消费判定；回归面=setScale/panBy 可选回退语义（未实现→跳过缩放恢复/回退最深可滚动元素，`:28-35`）与"只有内容区缩放、固定 UI 不动"的不变量（`:12-13`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 契约字段与回退语义 | 已证实 | `:1-53` 全文 |
| 各内容控制器实现 | 边界 | 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 接口+Context+Hook | §2/§3 | 18-53 | covered |
