---
path: apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: de46ff9aa60008eec80e99b4add022d53703a45e
sha256: 3188b4bb88ec6803921db8b7042e8171bb429b3d370ba33ae96204cdfd032bbe
lines: 748
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx

## 1. 结论与边界

**Dev-B 自有无代码 authoring 界面**（`apps/electron/src/renderer/components/review-v3-dev-b/ReviewV3AuthorWizard.tsx:1-5`，748 行本批最大）：**不挂入 Dev-C 工作台**；Dev-C 必须提供 Main-authorized 保存/预览/冻结回调；**此渲染层只编辑 author 来源，不能安装 Case/发布政策/授予角色**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B1AuthorWizardProps` | interface | `:27-42` | wizard props（Dev-C 回调） |
| `emptyB1AuthorDocument` | 函数 | `:43-61` | 空白 B1 author 骨架（R33 纯净查询基准） |
| `ReviewV3AuthorWizard` | 组件 | `:62-748` | authoring 向导 |

## 3. 内部逻辑与关键流程

- 分步 authoring（业务/来源/字段/目标/模块/Check/阶段/输出——`B1AuthorChangeArea` 8 域）。
- `B1BufferedIdentityInput` 标识编辑（IME 防护）；试填（`review-v3-author-trial`）；diff（`review-v3-author-diff`）；导入（`review-v3-author-import`）。
- `emptyB1AuthorDocument`（`:43-61`）：空白骨架（R33 `isB1PristineReopenLookup` 比对基准）。

## 4. 调用者与调用链

- 消费方：Dev-B 自有入口（不入 Dev-C 工作台）。
- 出向：同批 author 模块（trial/diff/import/edit/resume/revision-read）、B1BufferedIdentityInput。

## 5. 数据 I/O、读写与副作用

本地编辑（返回 author 来源）；保存/预览/冻结经 Dev-C 回调（`:3-4`）。

## 6. 分支、失败、取消与恢复

编辑/试填/导入各模块错误（`B1_*` 错误族）。

## 7. 权限与权威状态

- **只编辑 author 来源**（`:4`）——不能安装 Case/发布政策/授予角色。
- **Dev-C 提供 Main-authorized 回调**（`:3`）——保存权威在 Main。

## 8. 修改影响面

- `B1AuthorWizardProps` 合同（Dev-C 集成面）。
- `emptyB1AuthorDocument` 是 R33 纯净比对基准（改动影响重开判定）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、只编辑红线 | 已证实 | `:1-748` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:27-748` | covered |
| 空白骨架 | `:43-61` | covered |
