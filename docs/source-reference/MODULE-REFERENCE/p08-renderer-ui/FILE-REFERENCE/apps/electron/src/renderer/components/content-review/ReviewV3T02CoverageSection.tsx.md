---
path: apps/electron/src/renderer/components/content-review/ReviewV3T02CoverageSection.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ec100ae5a0929a4699a665e938c889345cdaffac
sha256: 16298f8d08e9bacffd4fd4efee1bf2f7ac14b43141be243714fbeddc270c5c9c
lines: 112
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T02CoverageSection.tsx

## 1. 结论与边界

**T02 材料覆盖区容器（Local-L04 桥接）**（`:1-6` 注释）：**只读**，从 Main 取暂存来源预览交展示组件；**预览 staging-only，不产生 DocumentVersion、不改变案卷**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T02CoverageSection` | function（export） | `:21-112` | `({caseId})` |

内部：`StagedInventory`（`:12-19`）、五 state+`readRequest` 竞态计数（`:22-27`）、`load`（`:29-53`）。

## 3. 内部逻辑与关键流程

1. `load`：`Promise.allSettled` 三查询（**正式原件与暂存预览分别查，一方失败不隐藏另一方** `:34-39`）；竞态丢弃过期响应（`:40`）；失败项拼接为错误行（`:44-49`）。
2. 覆盖账本：currentDocuments（active!==false `:61`）；runCoverage/runVersions 对照最新运行（`:62-63`）；**needsAttention=解析非 parsed 或缺读取凭证**（`:87-88`）→琥珀提示「尚不能依据这份材料宣称完整审核」（`:98`）。
3. 解析状态 4 文案（`:64-66`）；`manualReadReceipt` 优先显示「已由人工核验」（`:96`）；运行覆盖账本行（历史运行保留，改原件需重审 `:101`）。
4. 暂存区：「不计入当前正式审核结果」（`:105`）；空态文案（`:108`）。

## 4. 调用者与调用链

入向：T02 案卷工作台（跨文件）。出向：`./ReviewV3T02MaterialCoveragePanel`（同批）、`window.reviewAPI` 三接口、`@profer/shared`/`@profer/ui`。

## 5. 数据 I/O、读写与副作用

读三接口；无写入；刷新按钮重查。

## 6. 分支、失败、取消与恢复

三查询独立成败（allSettled）；卸载递增 readRequest 取消陈旧应用（`:58`）。不适用 AbortController。

## 7. 权限与权威状态

红线：staging-only 不动案卷（`:5`）；暂存≠正式审核（`:105/:84`）。

## 8. 修改影响面

改容器 → T02 材料覆盖核对 UX 与账本口径。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T02CoverageSection` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+2 内部+三查询/账本链 | 已证实 | 逐行读 `:1-112` |
| reviewAPI 返回形态 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:21-112` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
