---
path: apps/electron/src/renderer/components/tabs/topbar-layout.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1ea31360e0780c32e70cb39525a1a9336f969990
sha256: 8685201a22f06dbf67b0ad783916d9232bab85aec992989908bb8110ebbb9258
lines: 86
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/components/tabs/topbar-layout.test.ts

## 1. 测试目标

顶栏几何整数像素契约+拖拽层不重叠。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:11/:24/:49/:58/:68/:83）：
1. 40/37 外框内容行+垂直偏移取整（:11）。
2. 常见组合下恒整数 CSS px（:24）。
3. 操作区宽只影响横向视口（:49）。
4. 异常尺寸无负值（:58）。
5. **拖拽层紧贴操作胶囊不重叠**（:68）。
6. 常量关系稳定（:83）。

## 3. 真实断言

toBe/toEqual 级（几何数值/整数性断言；:68 断言 inset=width+gap 且不重叠）。

## 4. 未覆盖与脆弱点

mock 边界：纯函数。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 整数几何/不重叠 | 6 用例 | covered |
