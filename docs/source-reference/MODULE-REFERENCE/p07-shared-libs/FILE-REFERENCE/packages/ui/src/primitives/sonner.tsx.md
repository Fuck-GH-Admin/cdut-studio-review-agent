---
path: packages/ui/src/primitives/sonner.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cb9d9afa583e563d8c0c0e5effb32c06fa7e442d
sha256: c7b851d695bd3497af8664d065cc604681b43caca472723028b195e1f305ca0c
lines: 32
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/sonner.tsx

## 1. 结论与边界

sonner Toaster 的**通用纯 UI 基元**：默认主题 `"system"`、位置/偏移/皮肤 token classNames 预设（文件注释 `packages/ui/src/primitives/sonner.tsx:5-8`）：桌面壳应传入 `resolvedThemeAtom` 解析出的 light/dark 以与皮肤系统一致——本文件不读 atom。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Toaster` | 导出组件 | 9-30 | `({theme='system', ...props}: ToasterProps) => JSX` | 唯一导出（`:32`） |

内部类型 `ToasterProps = React.ComponentProps<typeof Sonner>`（`:3`）——注意 `React` 命名空间**未 import**（`:1` 仅 import sonner；依赖 UMD 全局类型解析，照实记录）。

## 3. 内部逻辑与关键流程

单 JSX（`:10-28`）：`theme` 默认 `'system'`；固定 `position="top-center"`、`offset={58}`、`className="toaster group"`；`toastOptions.classNames` 4 键（toast/description/actionButton/cancelButton）使用皮肤 token（`bg-surface-raised`/`text-foreground`/`border-surface-border`/`bg-primary`/`bg-control`/`text-muted-foreground`，`:16-26`）；`{...props}` 最后透传可覆盖全部预设（含 theme）。

## 4. 调用者与调用链

入向：**1 个消费者链**——`packages/ui/src/index.ts:5`（`@profer/ui` barrel 再导出）→ `apps/electron/src/renderer/main.tsx:105`（`import { Toaster } from '@profer/ui'`），经 `ProferToaster` 包装注入皮肤 theme（`:108-117`）并在各窗口覆盖 position/offset（`:1067/:1082/:1104/:1117/:1147` 五处使用）。注释所述桌面壳传 theme 的集成**已落地**（`main.tsx:111` `<Toaster theme={theme}>`）。出向：`sonner` 包。

## 5. 数据 I/O、读写与副作用

无（展示配置组件；toast 内容由调用方 `toast()` API 产生）。

## 6. 分支、失败、取消与恢复

仅 theme 默认值分支（`:9`）；无错误路径。

## 7. 权限与权威状态

无权限分支。主题权威=皮肤系统（经 props 注入，本文件不决定）。

## 8. 修改影响面

改预设影响未来接入的通知样式与皮肤一致性。

## 9. 测试证据

无测试（primitives 无 `*.test.*`）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出与预设值 | 已证实 | `packages/ui/src/primitives/sonner.tsx:9-32` |
| `React` 未 import（UMD 全局类型引用） | 已证实 | `:1` vs `:3` |
| 消费者经 barrel 1 条链 | 已证实 | `packages/ui/src/index.ts:5`；`apps/electron/src/renderer/main.tsx:105` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Toaster` | §2/§3 | 9-32 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
