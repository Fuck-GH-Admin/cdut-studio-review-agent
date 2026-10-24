---
path: apps/electron/src/renderer/lib/navigation-actions.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b66f33c13e53ad56fdf8cfd3131f2c564795b18
sha256: acaa7792599ebafadf5dcc01c6cc20003792da291544c1f3e6f851231a2d5fb2
lines: 11
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/navigation-actions.ts

## 1. 结论与边界

键盘导航的语义动作联合类型（11 行）：`NavigationAction` = `previous|next|left|right|confirm|back|altLeft|altRight` 八值。**纯类型文件，无任何运行代码**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `NavigationAction` | 类型（导出） | 2-11 | 8 字面量联合 | 导航动作枚举 |

导出合计 1（类型）。`altLeft`/`altRight` 语义注释（`:9`）：Alt/Option+左右在模式切换区直接切换 Agent↔Chat（区别于普通左右只预选）。

## 3. 内部逻辑与关键流程

不适用，依据：纯类型声明（`export type`），编译期擦除，无运行逻辑。

## 4. 调用者与调用链

入向（全冻结树检索 `navigation-actions`，4 处 type import）：`lib/navigation-controller.ts:1`、`lib/spatial-navigation.ts:1`、`components/app-shell/left-sidebar/use-left-sidebar.ts:99`、`components/navigation/NavigationInputProvider.tsx:2`。出向：无。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯类型）。

## 6. 分支、失败、取消与恢复

无（不适用，依据：无运行代码）。

## 7. 权限与权威状态

无（不适用，依据：纯类型）。

## 8. 修改影响面

改联合成员会影响 4 个消费方的 switch/分支穷尽性（`navigation-controller` 的 dispatch 契约、`spatial-navigation` 的方向映射、`NavigationInputProvider` 的按键映射、`use-left-sidebar` 的动作处理）；TS 穷尽检查会在各消费方暴露遗漏。

## 9. 测试证据

直接测试：无（全冻结树检索 `navigation-actions` 无测试文件命中；检索范围=baseline/source 全树）。间接证据：消费方测试（`navigation-controller.test.ts`）以字面量 `'next'`/`'confirm'` 间接使用该类型。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 值联合与 altLeft/altRight 注释语义 | 已证实 | `:1-11` 全文 |
| 4 个 type 消费方 | 已证实 | 全树检索（§4） |
| altLeft/altRight 的实际按键映射 | 边界（消费方文件） | `NavigationInputProvider`（跨批） |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `NavigationAction` 8 值 | §2/§8 | 2-11 | covered |
