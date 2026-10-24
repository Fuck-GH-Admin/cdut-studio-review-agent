---
path: packages/ui/src/primitives/command.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ebfe7eddc3d1ab528cdc8446e9608c9122e3a2cf
sha256: 3027920a892ef89e7570b66fff9b6096308be3916b8954fbfb36b6ddaaab0785
lines: 152
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/command.tsx

## 1. 结论与边界

命令面板组件（cmdk 封装，shadcn Command 套件）：Command 系列 9 件套。**现状：无任何使用者**（子agent 全仓库检索 + 作者抽查吻合，潜在死代码，照实记录）。

## 2. 导出与关键符号

导出 9 条（`export` :142-152）：`Command`（:9-22，CommandPrimitive 转发+cn）、`CommandDialog`（:24-35，组合 `./dialog` 的 Dialog/DialogContent/DialogTitle :7，`aria-describedby={undefined}` :27）、`CommandInput`（:37-54，含 Search 图标 :42 与 `cmdk-input-wrapper` 容器）、`CommandList`（:56-67，max-h-300）、`CommandEmpty`（:69-80）、`CommandGroup`（:82-96）、`CommandSeparator`（:98-108）、`CommandItem`（:110-124，data-selected/data-disabled 态样式）、`CommandShortcut`（:126-140，纯 span）。

## 3. 内部逻辑与关键流程

各组件 forwardRef+cn 透传；`CommandDialog` 是唯一有组合逻辑者（复用本地 dialog :26-33）。不适用「取消/恢复/权限」：依据=纯展示。

## 4. 调用者与调用链

入向：**检索无命中**（范围 apps/+packages/ 全部 ts/tsx + 全仓库复核（排 node_modules），模式 `primitives/command`/`CommandDialog`/`from 'cmdk'`，仅自身命中）。出向：react、`@radix-ui/react-dialog`（type DialogProps :2）、`cmdk`（:3）、lucide-react（Search）、`../lib/cn`、`./dialog`（:7）。

## 5. 数据 I/O、读写与副作用

无。

## 6. 分支、失败、取消与恢复

无业务分支。不适用。

## 7. 权限与权威状态

不适用，依据：纯展示。

## 8. 修改影响面

无消费方（删除/改造无影响，但属产品决策不做）；`cmdk` 依赖仅此文件使用。

## 9. 测试证据

无（检索无命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 9 条；CommandDialog 组合 dialog | 已证实 | :7/:24-35/:142-152 |
| 无使用者（潜在死代码） | 已证实（否定） | 全仓库模式检索（§4） |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 导出 | §2/§3 | :9-152 | covered |
| 使用者 | §4/§10 | — | covered（否定） |
