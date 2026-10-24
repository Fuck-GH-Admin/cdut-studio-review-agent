---
path: apps/electron/src/renderer/components/content-review/ReviewV3LocalManualItem.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d79515c4e25ca662bd09df46f249e78147bbb0f
sha256: c31bcfe29fdf79196bd3856244b106b028a29a99c5b2b23ca3701463a1531e3d
lines: 212
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3LocalManualItem.tsx

## 1. 结论与边界

**C-owned 本地人工 Check 登记**（`:1-5` 注释）：基于真实原生案卷+当前原件；**用既有原生 Case CAS 与来源版本校验，不是第二结果库/合成技术 Run/学校 Decision**。页面红线：不把模型推断/分数/申报声明当正式审批（`:136`）；来源锚点不虚构精确段落（`:164`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3LocalManualItem` | function（export） | `:9-212` | `({caseId})` |

内部：`editableItems`（type 'item'+有 sourceRefs `:24-25`）、`sources/supporting`（application/evidence 分列 `:34-38`）、`retry`（signature+requestId 幂等 `:19`）。

## 3. 内部逻辑与关键流程

1. **登记**（`submit` `:101-133`）：分数 0-1000000 校验（`:103-106`）；intent+signature 幂等 requestId（`:108-114`）；**revision 取自当前权威 aggregate 而非 Renderer 计数**（`:116-118`）；原件有效性复查（已替换即拒 `:119-123`）；`createNativeReviewItemV3` CAS（expectedRevision `:124-127`）。
2. **修正**（`saveEdit` `:63-90`）：重取 aggregate；**仅 draft 阶段且事项仍在**（`:76-78`）；`updateReviewItem`（**保留原来源锚点，仍待审核认定** `:79-86`）。
3. **归档**（`archive` `:91-100`）：confirm 弹窗（原件历史保留、旧证据失效 `:92`）；`removeDocuments`。
4. UI：原件/证明双列表+归档（`:142-156`）；来源选择（**「文件级来源（不虚构精确段落）」缺省** `:164`）；登记表单（draft 才可提交 `:176`）；已登记事项列表（**「已登记来源≠审核通过」** `:185`）；编辑区（不修改来源 `:191`）；非 draft 提示走正式变更/重审（`:210`）。

## 4. 调用者与调用链

入向：本地 V3 工作台。出向：`window.reviewAPI`（getAggregateV2/createNativeReviewItemV3/updateReviewItem/removeDocuments）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

写：原生事项登记/修正/归档（Main CAS）；读：aggregate。

## 6. 分支、失败、取消与恢复

校验失败 setError；幂等重试（retry.current 复用 requestId `:113-114`）；busy 防重。不适用取消/恢复。

## 7. 权限与权威状态

红线：CAS+来源版本校验（`:3-4`）；revision 权威取数（`:116-117`）；锚点不替换（`:79-80/:191`）；声明≠审批（`:136/:185`）。

## 8. 修改影响面

改组件 → 人工声明登记链与草稿期编辑语义。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3LocalManualItem` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+登记/修正/归档全链 | 已证实 | 逐行读 `:1-212` |
| 原生写入器校验 | 未知 | Main 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件+三写链 | §2/§3 | `:9-212` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
