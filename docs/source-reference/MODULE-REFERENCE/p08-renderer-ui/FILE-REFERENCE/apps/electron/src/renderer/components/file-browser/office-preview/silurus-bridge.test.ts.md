---
path: apps/electron/src/renderer/components/file-browser/office-preview/silurus-bridge.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1daf7f13b99d0d7b103bc34279a91c845aad994d
sha256: 570efca9916e08d7e4cf94bc49acad6cabfea9cf8ad1505ff45c95f048c1a06f
lines: 87
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/file-browser/office-preview/silurus-bridge.test.ts

## 1. 测试目标

silurus bridge helpers 单测：扩展名路由、缩放钳制、虚拟页就绪后才返回 canvas、XLSX 多格几何（{x,y,w,h} 兼容）、textLayer 引用标签精确行框匹配。被测：`normalizeOfficeFormat`/`clampOfficeScale`/`getRenderedPptxSlideCanvas`/`readXlsxGeometry`/聚光关键词匹配。纯内存（stub viewer/DOM 桩）。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**5 test**（`:10-87`）：

1. `:11-17` 支持的 Office 扩展路由（12 扩展→3 格式）。
2. `:18-24` 非法/越界缩放钳制（非有限→1、[0.25,4]）。
3. `:25-33` **仅当目标虚拟页渲染完成后才返回 canvas**（防复用旧帧）。
4. `:34-52` Given `getCellRect` 返回 `{x,y,w,h}` When 多格行几何 Then 有限包围盒**无 NaN**。
5. `:53-86` Given DocxScrollViewer textLayer spans When 匹配引用标签 Then **精确行包围框**。

## 3. 真实断言

- #3 是“虚拟列表旧帧”防御的直接回归。
- #4 断言有限性/无 NaN（{x,y,w,h} 与 {x,y,width,height} 双口径兼容的实证）。
- #5 精确行框匹配（聚光定位正确性）。

## 4. 未覆盖与脆弱点

**未覆盖**：动态 import/vendorBase（Node 环境仅纯函数可测——文件头口径）；`createOfficeViewer`/`destroyOfficeViewer`/`measureSlotPageBox` 全链；WASM 真实渲染。

**脆弱点**：DOM/viewer 桩与 Silurus 内部结构耦合（`_slots`/`textLayer`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、5 test | 已证实 | `:10`；`grep -c test(`=5 |
| 路由/钳制/旧帧/几何/行框 | 已证实 | `:11-86` |
| WASM 全链 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `normalizeOfficeFormat`/`clampOfficeScale` | #1/#2 | `:11-24` | covered |
| `getRenderedPptxSlideCanvas` | #3 | `:25-33` | covered |
| `readXlsxGeometry` | #4 | `:34-52` | covered |
| textLayer 匹配 | #5 | `:53-86` | covered |
