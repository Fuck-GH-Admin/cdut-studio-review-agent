---
path: apps/electron/src/renderer/components/content-review/CaseManagerBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b89e213620ac97f74843eb67327d3d5b8e99b7e1
sha256: 7dca2fa5907d535e7f99c106ee808d9f45a12f05e17a3a51e42f674831a2e3d5
lines: 343
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/CaseManagerBar.tsx

## 1. 结论与边界

**审核工作台唯一任务上下文条**（`apps/electron/src/renderer/components/content-review/CaseManagerBar.tsx:1-12`，即 `ReviewContextBar`）：①案卷选择器（标题+领域包+材料数+演示标记）②新建案卷 ③审核类型切换+删除（二次确认，演示案卷不可删）。材料按角色在左/中栏各自导入（不在上下文条放全局入口，`:8`）。数据源 `reviewCaseListAtom`/`reviewCaseAtom`；**写全经 `use-review-actions`；唯一直接读取是只读存储诊断 `listCaseStorageIssuesV3`，不写任何业务状态**（`:10-12`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewContextBar` | 组件 | `:33-343` | 同 `ReviewContextBar.tsx` re-export 的实现 |

内部：领域包名取值辅助（`:38-…`）。

## 3. 内部逻辑与关键流程

- 案卷列表（`reviewCaseListAtom`）；切换/新建/删除（二次确认）；演示案卷删除禁用。
- 只读诊断 `listCaseStorageIssuesV3`（不写业务状态，`:11-12`）。
- 审核类型切换。

## 4. 调用者与调用链

- 消费方：审核工作台顶栏（`ReviewContextBar` 别名被引用）。
- 出向：`use-review-actions`（写）、`window.reviewAPI.listCaseStorageIssuesV3`（只读诊断）。

## 5. 数据 I/O、读写与副作用

IPC 只读诊断；业务写全经 actions（主进程 CAS）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 删除案卷 | — | 二次确认 |
| 演示案卷 | — | 不可删除 |

## 7. 权限与权威状态

「唯一任务上下文条」定位（`:2`）；写通道唯一化（`use-review-actions`）是渲染层权威边界（`:10-12`）。

## 8. 修改影响面

- `listCaseStorageIssuesV3` 只读约定（不得改为写）。
- 案卷选择/新建/删除交互契约。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个导出、四职责 | 已证实 | `:1-343` |
| 只读诊断约定 | 已证实 | `:10-12` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `ReviewContextBar` | `:33-343` | covered |
| 只读诊断约定 | `:10-12` | covered |
