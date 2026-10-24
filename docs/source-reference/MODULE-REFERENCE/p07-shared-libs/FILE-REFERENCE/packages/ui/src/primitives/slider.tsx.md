---
path: packages/ui/src/primitives/slider.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4714bee23074fbff29a89dd5338dd04b33042ae7
sha256: a0aae74eb47981a7274748bd9529d546d46a554bed1f3186dc9364de897f004b
lines: 26
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/slider.tsx

## 1. 结论与边界

Radix Slider 的**纯 UI 样式包装**（forwardRef）：Root+Track+Range+Thumb 组合与皮肤 token 类名，无逻辑/状态/副作用。不处理值/受控语义（透传 `SliderPrimitive.Root` props）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Slider` | 导出组件 | 6-24 | `forwardRef<SliderPrimitive.Root>` | 唯一导出（`:26` `export { Slider }`） |

`Slider.displayName = SliderPrimitive.Root.displayName`（`:24`）。内部无函数/常量；依赖 `cn`（`packages/ui/src/lib/cn`）与 `@radix-ui/react-slider`（`:1-4`）。

## 3. 内部逻辑与关键流程

单 JSX 组件（`:9-23`）：Root 透传 `className,...props` 并 `ref`；Track 固定 `h-1.5 w-full rounded-full bg-primary/20`（`:18`）；Range `bg-primary`（`:19`）；Thumb `h-4 w-4` + `disabled:pointer-events-none disabled:opacity-50`（`:21`）。className 经 `cn` 合并可覆盖。

## 4. 调用者与调用链

入向：冻结树（`apps/**`、`packages/**`，单双引号 import 全搜）**零消费者**——当前无任何文件 import `primitives/slider`（否定范围见 §10）。出向：`@radix-ui/react-slider`、`../lib/cn`。

## 5. 数据 I/O、读写与副作用

无（无状态组件；样式经 class token 依赖皮肤 CSS）。

## 6. 分支、失败、取消与恢复

仅 Radix 内置 `disabled` 样态分支（`:21`）；无错误路径。

## 7. 权限与权威状态

无权限分支（纯展示组件，无 sender/role）。

## 8. 修改影响面

当前无调用方受影响；若未来接入，值语义由 Radix Root props（`value/onChange`）决定。改样式类名影响皮肤一致性。

## 9. 测试证据

无测试（`packages/ui/src/primitives/**` glob 无 `*.test.*`，全批一致）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出与样式结构 | 已证实 | `packages/ui/src/primitives/slider.tsx:6-26` |
| 零消费者 | 已证实（静态） | 冻结树 `apps/**`+`packages/**` 全扩展名检索 `primitives/slider`（单双引号）仅命中本文件 |
| 运行/渲染行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Slider` | §2/§3 | 6-26 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
