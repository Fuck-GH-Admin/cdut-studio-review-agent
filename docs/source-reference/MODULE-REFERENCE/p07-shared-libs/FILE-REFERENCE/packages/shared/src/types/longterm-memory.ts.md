---
path: packages/shared/src/types/longterm-memory.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 745687da3dbd3447cf78ae9b87ca87913770d5d6
sha256: 139b7568c64c9d9e050ea5cc16c26fe553833d08de5eaee9d3b049032f854439
lines: 98
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/shared/src/types/longterm-memory.ts

## 1. 结论与边界

长期记忆图谱的**契约层**：5 个类型/接口 + 3 个常量（类别元信息、类别有序数组、6 个 IPC channel 名）。纯声明 + 冻结常量，无函数、无 I/O、无副作用。

不做的事：不做持久化（`apps/electron/src/main/lib/longterm-memory/longterm-memory-store.ts` 负责 `~/.cdutai/user-habit-graph.json` 的原子读写）；不做检索（`longterm-memory-rag.ts` 的 BM25）；不注册 IPC（`longterm-memory-ipc.ts`）；不实现 UI（`LongTermMemoryView.tsx`）。

## 2. 导出与关键符号

导出 9 条：5 个 `type`/`interface`、1 个 `const` 对象字面量（带类型注解）、1 个 `const` 数组、1 个 `const` 对象（`as const`）——即 6 个类型 + 3 个常量。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `LongTermMemoryCategory` | type（联合） | `:14-19` | `'coding_preference' \| 'workflow_habit' \| 'cdut_special_domain' \| 'tool_affinity' \| 'interaction_style'` | 5 个类别，顺序与 `LONGTERM_MEMORY_CATEGORIES` 一致 |
| `LongTermMemorySource` | type（联合） | `:22` | `'auto_inferred' \| 'user_manual'` | 手动节点永不被自动淘汰（`:10`） |
| `LongTermMemoryNode` | interface | `:25-39` | `{id, category, title, content, tags, weight, confidence, createdAt, updatedAt, source}` | `weight >= 0`（`:32`）、`confidence` 0~1（`:34`） |
| `LongTermMemoryGraph` | interface | `:42-46` | `{version: 1; updatedAt: number; nodes: LongTermMemoryNode[]}` | **字面量 `version: 1`**，不是 `number` |
| `LongTermMemoryHit` | interface | `:49-53` | `{node; score: number; excerpt: string}` | 检索命中 |
| `LongTermMemoryNodeInput` | interface | `:56-62` | `{category; title; content; tags?; confidence?}` | 新建/编辑入参；`id`/时间戳/`weight` 由主进程托管（`:55`） |
| `LONGTERM_MEMORY_CATEGORY_META` | const（`Record<Category,{label;promptLabel;accent}>`） | `:65-74` | 5 键 | UI 中文标签、提示词英文标签、Tailwind 主色名 |
| `LONGTERM_MEMORY_CATEGORIES` | const（`LongTermMemoryCategory[]`） | `:77-83` | 5 元素有序数组 | 注释：UI 遍历顺序固定（`:76`） |
| `LONGTERM_MEMORY_IPC_CHANNELS` | const（`as const`） | `:85-98` | 6 个键：`READ_GRAPH`/`ADD_NODE`/`UPDATE_NODE`/`DELETE_NODE`/`QUERY_TEST`/`CHANGED` | 字符串前缀 `longterm-memory:` |

## 3. 内部逻辑与关键流程

纯声明，无执行流程。可核对的契约事实：

1. `LongTermMemoryGraph.version` 是字面量类型 `1`（`:43`），因此**不存在 0/2 版本分支**；任何写 `version: 2` 的对象在类型层即不合法。运行时是否校验见 §6。
2. `LONGTERM_MEMORY_CATEGORIES`（`:77-83`）与 `LONGTERM_MEMORY_CATEGORY_META`（`:65-74`）键集合完全相同（5 个），但**顺序由数组决定**；`Record` 不保证顺序，故 UI 遍历必须用数组。
3. `LONGTERM_MEMORY_IPC_CHANNELS` 的 6 个值（`:87-97`）：`read-graph`、`add-node`、`update-node`、`delete-node`、`query-test`、`changed`。其中 `CHANGED` 是**主→渲染广播**，其余 5 个是 `invoke` 请求。
4. `LongTermMemoryNodeInput` 不含 `weight`/`source`/`id`/时间戳（`:56-62`），即调用方无法直接指定这些字段——权威在主进程（见 §7）。

## 4. 调用者与调用链

入向（`grep -rn "LONGTERM_MEMORY_\|LongTermMemoryNode\|LongTermMemoryGraph\|LongTermMemoryHit"` 覆盖 `apps/`、`packages/`）：

| 调用者 | 位置 | 用到什么 |
| --- | --- | --- |
| `longterm-memory-ipc.ts` | `:10` import；`:33` `CHANGED` 广播；`:42` `READ_GRAPH`；`:47` `ADD_NODE`；`:56` `UPDATE_NODE`；`:71` `DELETE_NODE`；`:80` `QUERY_TEST` | 5 个 handler + 1 个广播 |
| `preload/index.ts` | `:14` import（含 4 个类型）；`:4152`、`:4154` 起 | `getGraph`/`addNode` 等桥接 |
| `longterm-memory-rag.ts` | `:16` import；`:279` `LONGTERM_MEMORY_CATEGORY_META[hit.node.category].promptLabel` | 提示词里的类别英文标签 |
| `LongTermMemoryView.tsx` | `:24-25` import；`:121-122`、`:402-403`、`:659`、`:746` | 星图布局（用 `CATEGORIES.length` 算角度）、列表、详情、筛选 |
| `longterm-memory-store.ts` | `:140`、`:153`、`:161` 构造 `{version:1, updatedAt, nodes}` | 权威写方 |
| `longterm-memory-auditor.ts`、`-reflector.ts`（及其 `.test.ts`）、`longterm-memory-rag.test.ts`、`longterm-memory-atoms.ts` | 见 §4 说明 | 类型消费 |

出向：无（本文件不 import 任何模块）。

动态调用：无字符串拼接构造 channel；`CHANGED` 通过 `webContents.send(LONGTERM_MEMORY_IPC_CHANNELS.CHANGED)` 使用（`longterm-memory-ipc.ts:33`）。

## 5. 数据 I/O、读写与副作用

- 无 I/O、无磁盘、无网络、无缓存、无全局可变状态。
- 3 个常量是**编译期冻结值**：`LONGTERM_MEMORY_IPC_CHANNELS` 用 `as const`（`:98`），另两个是普通 `const` 引用（数组/对象本身可变——若消费者 `push` 会污染全局，但仓内未见此类写入）。
- 副作用：无。

## 6. 分支、失败、取消与恢复

不适用（无控制流）。类型层的约束面：

- `version: 1` 字面量（`:43`）使「旧版本迁移」在类型上无处表达；**运行时是否校验 `version` 未知**——`longterm-memory-store.ts` 读取逻辑未在本批阅读范围内逐行核对（只看到 `:140`/`:153`/`:161` 构造写入侧）。
- `category` 是联合类型，非法值需在运行时校验；本文件不提供校验函数（无 `isLongTermMemoryCategory` 之类），因此校验责任在 store/ipc。
- `confidence` 的 0~1 范围只在注释（`:34`），**无运行时钳制**；`weight >= 0` 同理（`:32`）。

## 7. 权限与权威状态

- 本文件**无权限分支**，依据：无 sender/role 检查、无 IPC 注册。
- 权威状态：`LongTermMemoryGraph` 的落盘权威是 `longterm-memory-store.ts`；`id`/`weight`/`source`/时间戳由主进程产生（`:55` 注释 + `LongTermMemoryNodeInput` 缺这些字段）。
- 谁可写：`ADD_NODE`/`UPDATE_NODE`/`DELETE_NODE` 三个 channel 由 `longterm-memory-ipc.ts` 注册（`:47`、`:55`、`:70`，另 `:42` READ_GRAPH、`:79` QUERY_TEST、`:33` CHANGED 广播）。**已核实这些 handler 没有任何 sender 校验**（全文件无 `assertMainWindowSender`/sender 判断），即任何能发 IPC 的渲染进程都可调用；运行时合法性校验在 `longterm-memory-store.ts:29-35`（`MAX_LONGTERM_MEMORY_NODES=500`、`MAX_TITLE_CHARS=48`、`MAX_CONTENT_CHARS=800`、`MAX_TAGS=8`、`MAX_TAG_CHARS=24`、`MAX_WEIGHT=50`，confidence/weight 用 `clamp` 限幅，`:118-119`、`:325-329`）。
- 常量本身是公开契约：渲染层与主进程共用同一份 channel 名，避免字符串漂移。

## 8. 修改影响面

- 改 `LongTermMemoryCategory`（增删类别）必须同步 `:65-74` 的 `Record`（否则类型报缺键）与 `:77-83` 的数组（否则 UI 少/多一类），并影响 `LongTermMemoryView.tsx:121-122` 的星图角度计算（依赖 `CATEGORIES.length`）与 `:402`、`:746` 的渲染循环。
- 改 `LONGTERM_MEMORY_IPC_CHANNELS` 的值会断开主进程 handler 与 preload 桥接（`preload/index.ts:4152+`）；主/渲染两侧必须同版本发布。
- 改 `LongTermMemoryGraph.version` 类型会牵动 `longterm-memory-store.ts:140`/`:153`/`:161` 的写入与所有读取方；属破坏性变更。
- 改 `LONGTERM_MEMORY_CATEGORY_META` 的 `promptLabel` 会改变 `longterm-memory-rag.ts:279` 生成的提示词文本（影响模型输入），属行为变更而非纯展示。
- 测试：`longterm-memory-rag.test.ts`、`-auditor.test.ts`、`-reflector.test.ts` 会因类型/常量变化受影响（本批未逐条读其断言）。

## 9. 测试证据

- 本文件**无直接测试**（纯类型 + 常量，无可断言行为）。
- 间接：`longterm-memory-rag.test.ts`、`longterm-memory-auditor.test.ts`、`longterm-memory-reflector.test.ts` 消费这些类型；`LongTermMemoryView.tsx` 消费两个常量。本批未展开这些测试的断言（不在 SCOPE 内），故不声称其覆盖。
- `NOT_RUN`：未执行任何测试/typecheck/build。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 条导出（6 类型 + 3 常量） | 已证实 | `longterm-memory.ts:14-98`；`grep -cE '^export '` = 9 |
| `version` 是字面量 `1`，无多版本分支 | 已证实 | `:43` |
| 5 个类别在 `CATEGORY_META` 与 `CATEGORIES` 中一致 | 已证实 | `:65-74`、`:77-83` |
| 6 个 IPC channel，`CHANGED` 为广播 | 已证实 | `:85-98`；`longterm-memory-ipc.ts:33`（send）vs `:42`/`:47`/`:56`/`:71`/`:80`（handle） |
| `LongTermMemoryNodeInput` 不允许调用方指定 id/weight/source | 已证实 | `:56-62` 对比 `:25-39` |
| `confidence`/`weight` 无运行时钳制（仅注释） | 已证实（限本文件） | `:32`、`:34` 仅注释 |
| 读取时是否校验 `version` | 未知 | 未逐行读 `longterm-memory-store.ts` 读取分支 |
| IPC handler 无 sender 校验；字段合法性由 store 常量限幅 | 已证实 | `longterm-memory-ipc.ts:33`、`:42`、`:47`、`:55`、`:70`、`:79` 全无 sender 判断；`longterm-memory-store.ts:29-35`、`:118-119`、`:325-329` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 9 条导出逐项 | §2 | `:14-98` | covered |
| `version:1` 字面量语义 | §3、§6 | `:43` | covered |
| 类别数组与元信息一致性 | §3、§8 | `:65-83` | covered |
| 6 个 channel 与广播方向 | §3、§4 | `:85-98`；`ipc.ts:33` | covered |
| 入参字段托管边界 | §3、§7 | `:56-62` | covered |
| 消费者清单 | §4 | 跨文件 | covered |
| 读取校验/sender | §10 | — | unknown |
