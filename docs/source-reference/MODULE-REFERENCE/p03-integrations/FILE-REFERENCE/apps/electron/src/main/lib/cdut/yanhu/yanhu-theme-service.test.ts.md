---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-theme-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 45e101dfd967796a1213c9b19f3d48686ae6df6f
sha256: 08e30d182d7f84de53aa9b02208d31a0b31eed4514d3961fe9aceaaecda87c3f
lines: 47
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-theme-service.test.ts

## 1. 测试目标

主题跟随单测（文件头 `:1-6`，规格书 7.1.4）：三态（浅/深/跟随系统）下底层视图底色解析准确（深 #09090b/浅 #ffffff）。被测：`resolveYanhuIsDark`/`resolveYanhuThemeBackground` + `yanhu-constants` 常量族。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**5 test**：

### 2.1 `resolveYanhuIsDark`（2，`:16-28`）
1. `:17-22` light 恒浅（system 输入两值均 false）、dark 恒深（均 true）。
2. `:24-27` system 跟随系统（true/false 各一）。

### 2.2 `resolveYanhuThemeBackground` 底色防白闪（3，`:30-47`）
3. `:31-34` 深色解析 `'#09090b'`（dark/system+真）。
4. `:36-39` 浅色解析 `'#ffffff'`（light/system+假）。
5. `:41-46` 常量与解析函数口径一致（`YANHU_DARK/LIGHT_VIEW_BACKGROUND` + `resolveYanhuViewBackground` 真/假）。

## 3. 真实断言

- 精确色值断言（`#09090b`/`#ffffff`）×4 处。
- #5 是“常量↔函数口径一致”的交叉验证。

## 4. 未覆盖与脆弱点

**未覆盖**：`syncThemeToWebContents`（Electron 依赖）；`YanhuThemeService` 类；special 皮肤路径（归 app-theme-service）。

**脆弱点**：纯函数测试，无 Electron mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、5 test、纯内存 | 已证实 | `:16/:30`；`grep -c test(`=5 |
| 三态判定 | 已证实 | `:17-27` |
| 色值口径 | 已证实 | `:31-46` |
| 运行时同步链 | 未知 | 未覆盖（Electron） |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveYanhuIsDark` | #1/#2 | `:17-27` | covered |
| `resolveYanhuThemeBackground` | #3/#4 | `:31-39` | covered |
| 常量口径 | #5 | `:41-46` | covered |
| `syncThemeToWebContents`/类 | — | — | unknown |
