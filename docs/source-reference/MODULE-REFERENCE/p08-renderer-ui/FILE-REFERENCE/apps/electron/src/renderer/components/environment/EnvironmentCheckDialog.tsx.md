---
path: apps/electron/src/renderer/components/environment/EnvironmentCheckDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8b8a9b7158e97b9a5941edc302fcefc760ef71b6
sha256: 962b09b1d66b270eef04839c062db48305c88e3aa9c2500cf74220a269c9ac58
lines: 36
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/environment/EnvironmentCheckDialog.tsx

## 1. 结论与边界

本地环境检测 Dialog（渲染层运行时，薄壳）：聊天错误卡片「打开环境检测」按钮/设置页入口打开，复用 `EnvironmentCheckPanel`（文件头 `apps/electron/src/renderer/components/environment/EnvironmentCheckDialog.tsx:1-6`）。

边界：检测逻辑/卡片全在 Panel；本文件只做 Dialog 外壳。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `EnvironmentCheckDialog` | 函数/组件（导出） | 22-36 | `({open, onOpenChange}) => JSX` | Dialog 外壳 |

`EnvironmentCheckDialogProps`（内部接口 `:17-20`）。

## 3. 内部逻辑与关键流程

`Dialog` 包 `DialogContent`（`max-w-xl`）+ 标题/描述（`:24-32`）；`<EnvironmentCheckPanel autoDetectOnMount={open}/>`（`:32`）——**autoDetectOnMount 绑定 open**：打开即自动检测（注意：Panel 的该 effect 只跑一次，`:32` 与 Panel `:54-68` 的 `[]` deps 组合语义见 Panel 手册）。

## 4. 调用者与调用链

入向（全树检索，证实）：`renderer/App.tsx:21`（`React.lazy` 动态 import）、`:210`（`<EnvironmentCheckDialog open={…} onOpenChange={…}/>`，由错误卡片/设置入口控制）。唯一调用方。

出向：`./EnvironmentCheckPanel`（`:15,32`）、`@profer/ui` Dialog 原子（`:8-14`）。

## 5. 数据 I/O、读写与副作用

无直接 I/O；副作用在 Panel。无状态。

## 6. 分支、失败、取消与恢复

无分支（纯壳）；开关由 props 控制。不适用项：失败/取消/恢复——依据：本文件无异步/无状态。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

- App.tsx:210 一处；Panel props 契约。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树测试检索 `EnvironmentCheckDialog` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 薄壳结构 | 已证实 | `:22-36` 逐行读 |
| 唯一调用方 lazy 挂载 | 已证实 | `App.tsx:21,210` |
| autoDetectOnMount=open 语义 | 已证实 | `:32`（组合行为见 Panel 手册） |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `EnvironmentCheckDialog` | §2-3 | 22-36 | covered |
| 调用链 | §4 | - | covered |
| 运行期行为 | §9-10 | - | unknown（NOT_RUN） |
