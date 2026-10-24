---
path: apps/electron/src/renderer/components/content-review/ReviewV3SourceLinks.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e04f666e39da01af3727a9d86a55e63d014d5e9
sha256: 8ec832f62dfbeaddb4047cc4219e442b872993378a7a89146afd48ba048ce059
lines: 45
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3SourceLinks.tsx

## 1. 结论与边界

**逐处核查来源链接**（`ReviewV3SourceLinks.tsx:12` 注释）：**展示每一处可核查引用，不再按依据/申报/证明各取第一项**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3SourceLinks` | function（export） | `:13-45` | `({aggregate, refs, onNavigate})`；Props `:6-10` |

内部：`uniqueReviewSourceRefs` 去重（`:14`）。

## 3. 内部逻辑与关键流程

空→null（`:15`）；逐 ref：`resolveT08Source` 解析状态、`reviewSourcePurpose` 判用途（rule→依据/application→申报/else→证明 `:23`）、`reviewSourceStatusLabel` 状态文案。**有用途→可点按钮**（onNavigate，`:25-35`；非 located 显示琥珀色状态行 `:34`）；**无用途→只读 span**（`:36-40`）。key 用 `documentVersionId:parseRevision:location` 组合（`:27`）。

## 4. 调用者与调用链

入向：T08 报告等引用展示处（跨文件）。出向：`./review-v3-t08-case-report`（resolveT08Source）、`./review-v3-source-navigation`（3 符号 `:4`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯渲染；点击回调 onNavigate。

## 6. 分支、失败、取消与恢复

无用途只读（`:36-40`）；状态非 located 高亮。不适用。

## 7. 权限与权威状态

不适用（展示层）；语义红线=逐处展示不折叠（`:12`）。

## 8. 修改影响面

改链接 → 引用核查导航 UX。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3SourceLinks` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+双分支 | 已证实 | 逐行读 `:1-45` |
| 解析函数行为 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:13-45` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
