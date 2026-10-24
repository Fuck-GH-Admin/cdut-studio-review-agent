---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-product-workflow.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 477427d145e24c9e8db48c98f29d45099e6c2385
sha256: d31bcd9108e24f01d36923f34987383876591a16ed3943e95c5bb11ed5c0d3bd
lines: 243
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-product-workflow.ts

## 1. 结论与边界

**Dev-B R30-R32 仅展示组合**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-product-workflow.ts:1-5`）：真值是 **C Main 新鲜读**（B20/B30/R26/R27 接口），非浏览器提供身份；**视图模型永不制造 Case/grant/Gold/Check PASS/source**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| （re-export） | `:16` | `B29HumanAuthorIntent`/`B29UnmatchedAuthorDraft` |
| `B32ProductRead` | interface | `:17-33` | 输入形状 |
| `B32MaterialRow` | interface | `:34-39` | 材料行 |
| `B32CheckRow` | interface | `:40-49` | Check 行 |
| `B32ProductView` | interface | `:50-72` | 视图 |
| `buildB32ProductView` | 函数 | `:73-187` | 构造视图 |
| `filterB32Materials` | 函数 | `:188-195` | 材料过滤 |
| `filterB32Checks` | 函数 | `:196-243` | Check 过滤 |

| `pageB32Checks` | 函数 | `:206-212` | Check 分页 |
| `pageB32Issues` | 函数 | `:213-226` | Issue 分页 |
| `assertB32StillCurrent` | 函数 | `:227-…` | 前后读一致性断言 |
## 3. 内部逻辑与关键流程

`buildB32ProductView`（`:73-187`）：C Main 读数据→纯投影（材料/Check/工作台/就绪）；**不制造任何权威**（`:4`）。

## 4. 调用者与调用链

- 消费方：产品工作流 UI。
- 出向：B20/B30/B26/B27/B23 主进程类型（`:6-10`）。

## 5. 数据 I/O、读写与副作用

纯投影（读 C Main）；无写。

## 6. 分支、失败、取消与恢复

输入校验/过滤（`:188-243`）。

## 7. 权限与权威状态

**永不制造 Case/grant/Gold/Check PASS/source**（`:4`）——仅展示红线；真值 C Main 新鲜读（`:2-3`）。

## 8. 修改影响面

- B20/B30/B26/B27/B23 接口合同。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个导出、仅展示红线 | 已证实 | `:16-243` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 11 个导出 | `:16-243` | covered |
