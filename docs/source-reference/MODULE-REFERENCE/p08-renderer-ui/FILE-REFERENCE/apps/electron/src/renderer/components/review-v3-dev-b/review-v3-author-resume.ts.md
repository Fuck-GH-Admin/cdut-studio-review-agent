---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-resume.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5e2e5b03e3997fdc23bbd7c8777004a1f09bb164
sha256: e0caad612db0fa0b41d81013413eff63078c20949f24cdb772e98837e206f544
lines: 58
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-resume.ts

## 1. 结论与边界

**Dev-B R22 候选 author 恢复守卫**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-resume.ts:1-5`）：**两次读取必须来自已独立授权的 C Main reader**；浏览器来源不获得 Principal/Owner/磁盘历史权威/学校政策发布权。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isB1PristineReopenLookup` | 函数 | `:21-33` | 纯净重开查询判定 |

内部：`fail`（`:12`，`B1_RESUME_*` 错误）。

| `assertB1ResumeReadStillCurrent` | 函数 | `:41-…` | 恢复读当前性断言（ABA 防御配套） |
## 3. 内部逻辑与关键流程

**`isB1PristineReopenLookup`**（`:21-33`）：revision 须 0+saved 须 null+schemaVersion `review-b1/1`+status `candidate-held`+templateId 正则+blank 须纯净（`:25-29`）→`structuredClone(blank)+templateId` **JSON 逐字节比对**（`:30-32`）——**唯一可免导出备份加载的表单是字节级未编辑空白骨架+查询 templateId**（`:14-19`）；名称/来源/Checks/试填材料须显式备份确认；**无任意「看起来空」的文档合格**（`:19`）。

## 4. 调用者与调用链

- 消费方：`review-v3-b33-author-reopen`（R33）。
- 出向：`review-v3-author-revision-read`（`prepareB1CandidateReadPreview`，`:7-10`）。

## 5. 数据 I/O、读写与副作用

纯判定；读经 C Main reader（`:3`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 任一条件不符 | `:25-29` | false |
| JSON 不等 | `:32` | false |

## 7. 权限与权威状态

- **浏览器来源无 Principal/Owner/历史/政策发布权**（`:3-4`）。
- **纯净白名单**（`:14-19`）——ABA/重写快照 fail closed（`:35-39` 注释）。

## 8. 修改影响面

- JSON 逐字节比对口径（`:32`）。
- C Main reader 授权链（`:3`）。

## 9. 测试证据

无专属测试（全树检索命中 0）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、纯净白名单红线 | 已证实 | `:14-33` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `isB1PristineReopenLookup` | `:21-33` | covered |
