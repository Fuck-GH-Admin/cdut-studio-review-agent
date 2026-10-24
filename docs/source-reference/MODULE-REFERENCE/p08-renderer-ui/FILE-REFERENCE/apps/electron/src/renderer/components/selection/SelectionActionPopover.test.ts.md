---
path: apps/electron/src/renderer/components/selection/SelectionActionPopover.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8c5539088e30f3b9dfa4b7d753554adba47a1899
sha256: 6b25491cc78b472897789ba7d48002aefc927d12fbbf8f7543edb61f4ce814e1
lines: 52
kind: test
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/selection/SelectionActionPopover.test.ts

## 1. 测试目标

**测试文件**（bun:test，52 行）：覆盖 `computeViewportShift`（气泡钳制回视口+绕开"回到底端"禁区）。断言≠运行（NOT_RUN）。

## 2. 用例清单

| 项 | 值 | 核法 |
| --- | --- | --- |
| `test(` 计数 | **10** | `grep -c '^\s*test('` |
| `it(` 计数 | **0** | 同上 |
| describe | 1（'computeViewportShift' `:4`） | 全文 |

## 3. 真实断言

1. `:5-7` 视口内→{0,0}；2. `:9-11` 顶部越界→dy=30；3. `:13-15` 左越界→dx=10；4. `:17-19` 右越界→dx=-40；5. `:21-23` 底越界→dy=-24；6. `:25-27` 宽于视口→钳到左缘 dx=50；7. `:29-33` 与禁区重叠→右移至禁区右缘+12 空隙（dx=70）；8. `:35-39` 不重叠→不动；9. `:41-45` 禁区靠左→右移含空隙 dx=38；10. `:47-51` 右移超视口→钳到右缘 dx=10。

## 4. 测试替身与依赖

无替身；纯函数直测（`./SelectionActionPopover` 导出，本批）。

## 4. 未覆盖

- 断言级：`computeViewportShift` 四向钳制+禁区右移绕行+空隙 12 语义（10 输入形状）。
- 未覆盖：`rectIntersects` 独立边界、组件渲染（createPortal/translateClass/`findScrollToBottomRect` DOM 查询）。

## 5. 已证实

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 test/0 it 计数与断言内容 | 已证实 | 全文+机械计数 |
| 测试通过 | 未知 | NOT_RUN（断言≠运行） |

## 6. 覆盖表

| 用例 | 节 | 状态 |
| --- | --- | --- |
| 全部用例 | §2/§3 | covered（断言级；NOT_RUN） |
