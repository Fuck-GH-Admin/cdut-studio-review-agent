---
path: apps/electron/src/renderer/lib/active-tab-content.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 351e2e3d72006a72c1f208f0b30d72ba7671cac9
sha256: 8ab7588e42ebf853577a1dad74aa3e58ec7db782c7f64012212f2dc913157e42
lines: 64
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/active-tab-content.test.ts

## 1. 测试目标

主区空态判定+顶栏标签可见性（对应源教程缺陷契约）。不运行（`NOT_RUN`）。

## 2. 用例清单

8 用例，2 describe：
- 「主区空态判定」（:24，6 用例）：仅教程不显启动页（:25）/只剩教程（:29）/仅 Scratch（:33）/有会话（:37）/**无任何标签才显示**（:41）/教程激活内容解析为自身（:45）。
- 「顶栏标签可见性」（:50，2 用例）：教程常驻可见（:51）/Scratch 未激活隐藏（:58）。

## 3. 真实断言

toBe/toEqual 级（bool 判定）。

## 4. 未覆盖与脆弱点

mock 边界：jotai createStore fixture。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例/主题如 §2 | 已证实 | 逐段读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 空态/可见性 | 8 用例 | covered |
