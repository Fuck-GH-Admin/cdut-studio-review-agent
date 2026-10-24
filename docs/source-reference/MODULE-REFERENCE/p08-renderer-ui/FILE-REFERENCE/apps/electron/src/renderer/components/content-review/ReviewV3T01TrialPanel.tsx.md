---
path: apps/electron/src/renderer/components/content-review/ReviewV3T01TrialPanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eb766689f64052694b5f91e6855197486826105e
sha256: 47ddafc5e1f6df39089c42847fea7b68588033bd423ee08da3ea507ba930ba59
lines: 75
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewV3T01TrialPanel.tsx

## 1. 结论与边界

**T01 无代码配置试跑**（`ReviewV3T01TrialPanel.tsx:1-4` 注释）：**纯本地表单校验，不是 Run/决定/评分/真实材料解析**；页面明示「不调用真实 AI、不读取证明、不产生审批结论」（`:27`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewV3T01TrialPanel` | function（export） | `:10-75` | `({template: TemplateVersion})` |

内部：`values/counts/showResults` state（`:11-13`）、`result=useMemo(trialT01Template)`（`:14`）、`caseFields`（scope==='case' `:15`）、`setField/setMaterial`（改值即收起结果 `:16-21`）。

## 3. 内部逻辑与关键流程

- 两按钮：载入虚构样例（`exampleT01TrialInput` `:30-32`）/清空（`:33`）。
- 案卷字段表单：boolean/enum 下拉（「未填写」空值语义 `:42/:46`）、number/date/text 输入（number 带 min/max `:49`）；无字段提示「配置事项级字段需在实际案卷内完成」（`:53`）。
- 材料份数：按 materialSlots 显示上下限（`:58`）。
- 业务流程行：stages 串联+有无评分量表（`:64`）。
- 结果块（`role="status"` `:67`）：incomplete→「尚不能进入人工审核」否则「形式齐备，可交人工审核」（`:68`）；必填覆盖 `coveredFields/totalRequiredFields`、**审核检查项「尚未执行」**（`:69`）；issues 列表+note。

## 4. 调用者与调用链

入向：模板编辑器（挂载点 `:2` 注释）。出向：`./review-v3-t01-business-presets`（trialT01Template/exampleT01TrialInput `:7`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯本地 state；无 I/O。

## 6. 分支、失败、取消与恢复

编辑即收起结果（防陈旧结论）；不适用取消/恢复。

## 7. 权限与权威状态

红线：试跑≠Run/决定（`:3`）；虚构样例明示。

## 8. 修改影响面

改面板 → T01 模板配置自检 UX。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `ReviewV3T01TrialPanel` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+表单/结果全链 | 已证实 | 逐行读 `:1-75` |
| trialT01Template 判定 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件 | §2/§3 | `:10-75` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
