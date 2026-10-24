---
path: apps/electron/src/renderer/atoms/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f3e12c9ea14cab80690838d9cf4c0cb49aa03c07
sha256: 8a64580743e5d6a3cc7f2b4e0a2643b587c65c25687ad1758e5d3247528b5d66
lines: 13
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/index.ts

## 1. 结论与边界

Atoms 模块 re-export 桶（13 行）：`export *` 转发 8 个子模块（app-mode/active-view/settings-tab/conversation-atoms/user-profile/theme/identity-atoms/team-atoms）。**当前冻结树内零消费者**（见 §4），属保留索引性质，不是活跃入口。

## 2. 导出与关键符号

8 条 `export *`（`:6-13`）：`./app-mode`、`./active-view`、`./settings-tab`、`./conversation-atoms`、`./user-profile`、`./theme`、`./identity-atoms`、`./team-atoms`。导出面=被转发模块的全部导出（逐符号不在此列举，各子模块另有主册/跨批）。

## 3. 内部逻辑与关键流程

无（不适用，依据：纯 re-export，无运行代码）。

## 4. 调用者与调用链

入向：**零消费者**。检索范围=baseline/source 全树，模式 `from '@/atoms'`、`from './atoms'`、`from '../atoms'`、`from '../../atoms'`、`from '@/atoms/index'` 全部 0 命中；各消费方直接 import 子模块（如 `@/atoms/identity-atoms`，见各自主册）。
出向：8 个兄弟模块（`export *`）。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯 re-export）。

## 6. 分支、失败、取消与恢复

无（不适用）。

## 7. 权限与权威状态

无（不适用）。

## 8. 修改影响面

无现存消费方，改动无运行影响；但作为索引面，删除前需确认是否为预留约定（意图未知）。被转发的 8 个模块各有直接消费方（跨批/本批 identity-atoms 主册）。

## 9. 测试证据

直接测试：**无**（全冻结树检索无测试命中）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 条转发/纯 re-export | 已证实 | `:1-13` 全文逐行 |
| 零消费者（含检索模式与范围） | 已证实 | 全树 5 模式检索 0 命中（§4） |
| 保留索引的意图 | 未知 | 无代码连接不能推断"不存在需求" |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 条 `export *` | §2 | 6-13 | covered |
| 零消费者否定 | §4/§8 | - | covered |
