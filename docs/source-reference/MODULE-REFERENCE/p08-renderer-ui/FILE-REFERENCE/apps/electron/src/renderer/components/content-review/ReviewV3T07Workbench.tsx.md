---
path: apps/electron/src/renderer/components/content-review/ReviewV3T07Workbench.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 210262bf2633883d8bbd170cd0a0a534f3d87d5e
sha256: 4461d8b99720b9db3bfbb65971264ab3460e34ec59eadff94ef27d42e78d7b30
lines: 152
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T07Workbench.tsx

## 1. 结论与边界

**T07 评委评分工作台容器（Local-L04 桥接层）**（`:1-11` 注释）：受控面板只接受 Main 投影的 T07View+onAction；容器负责选批次/以声明身份读视图（**角色只是声明，actor 由 Main 派生** `:7`）/带 expectedRevision 提交后重读。**不实现评分算法**（排名/同分/缺评门控/冻结全在 Main `:10`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T07Workbench` | function（export） | `:28-152` | 批次/身份选择+视图容器 |

内部：`Claim`（judge/organizer `:20`）、`loadBatches`（`:39-52`）、`refresh`（`:60-75`）、`startRound`（`:79-91`）、`onAction`（`:93-100`）、refreshSequence 防陈旧（`:37`）。

## 3. 内部逻辑与关键流程

1. 批次列表（`:39-52`）：`listBatchesV2` 映射（兼容 batch.id 包装 `:42-45`）；默认首项。
2. `refresh`（`:60-75`）：`getT07View({batchId, claim})`；**T07_STATE_NOT_INITIALIZED 是正常态**→「该批次还没有评分轮次」而非报错（`:70-72`）。
3. `startRound`（`:79-91`）：`initT07State`——**量表由 Main 从批次锁定的已发布模板派生，渲染层不构造状态**（`:84`）；仅组织者且无 view 可点（`:137`）。
4. `onAction`（`:93-100`）：`applyT07Action` 带 **expectedRevision**（`:97`）。
5. UI：批次/身份（organizer/judge+judgeId）选择；JudgePanel key 含批次+角色+评委（换身份重挂 `:144`）；空态「评分与冻结状态由 Main 持久保存」（`:147`）。

## 4. 调用者与调用链

入向：T07 挂载处。出向：`./ReviewV3T07JudgePanel`（同批）、`../../../main/lib/review/review-v3-t07-*`（类型/round-setup `:16-18`）、`window.reviewAPI` 4 接口。

## 5. 数据 I/O、读写与副作用

写：评分轮次初始化/动作（Main CAS）；读：视图。

## 6. 分支、失败、取消与恢复

未初始化提示（§3）；sequence 防陈旧（`:67-74`）。不适用取消/恢复。

## 7. 权限与权威状态

红线：actor 归 Main 派生（`:7`）；算法归 Main（`:10`）；量表不自造（`:84`）；CAS 修订（`:97`）。

## 8. 修改影响面

改容器 → T07 评分工作台入口与身份语义。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T07Workbench` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+4 内部+全链 | 已证实 | 逐行读 `:1-152` |
| Main T07 工作流 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+全链 | §2/§3 | `:28-152` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
