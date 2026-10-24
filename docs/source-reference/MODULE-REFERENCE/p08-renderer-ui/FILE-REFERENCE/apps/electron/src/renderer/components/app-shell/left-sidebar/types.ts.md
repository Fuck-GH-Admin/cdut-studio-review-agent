---
path: apps/electron/src/renderer/components/app-shell/left-sidebar/types.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 67d3a94af320d2b0591cfcdcf8a12d8038074a35
sha256: 632640503af55c0929486f117a1999a6bad47efa9113fc47ceca2a7983edaf7e
lines: 16
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/app-shell/left-sidebar/types.ts

## 1. 结论与边界

侧边栏共享类型（文件头 `:1-5`）：从 `LeftSidebar.tsx` 抽离的公共接口，供主文件与 `use-left-sidebar` hook 共用。纯类型，无运行时代码。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `LeftSidebarProps` | interface | `:7-16` | `{width?（缺省 CSS 响应式）; noTransition?（拖拽禁用过渡保即时）; renderSearchDialog?}` |

**关键注释**（`:12-14`）：`renderSearchDialog` 存在原因——移动版有横屏固定侧栏+竖屏抽屉两个 LeftSidebar 实例，SearchDialog 绑定全局 atom 且 Portal 到 body，**必须只渲染一份**，否则双实例同时打开叠双遮罩、互相触发 interactOutside 导致搜索框“一闪即逝”。

## 3. 内部逻辑与关键流程

无运行时逻辑（纯类型声明文件，编译期擦除后无任何可执行代码）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：`LeftSidebar.tsx` 与 `use-left-sidebar` hook。

## 5. 数据 I/O、读写与副作用

无数据 I/O：纯类型声明，运行时不存在，无副作用、无持久化、无 IPC。

## 6. 分支、失败、取消与恢复

无运行时分支与失败/取消/恢复语义（声明性接口，行为在使用方组件）。

## 7. 权限与权威状态

诚实边界：双实例 SearchDialog 风险在注释明示（防回归）。

## 8. 修改影响面

改接口 → 影响 LeftSidebar 全部调用处。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试（纯类型）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 纯类型+SearchDialog 单实例约束 | 已证实 | `:7-16` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `LeftSidebarProps` | 2 | `:7-16` | covered |
