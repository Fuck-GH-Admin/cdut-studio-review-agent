---
path: apps/electron/src/renderer/components/content-review/ReviewActionDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b5049fd2cb93fbe49247d3b2fd1c584312c7d2d7
sha256: 937bcdef5885c40df0afde2c63261c0c97a6f0a40b50f474cdc39393f92855d6
lines: 73
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewActionDialog.tsx

## 1. 结论与边界

**通用审核动作对话框**（`apps/electron/src/renderer/components/content-review/ReviewActionDialog.tsx`，73 行）：动态字段表单（`ReviewActionDialogField[]`）+ 必填校验 + 提交回调。复用于各类审核动作。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewActionDialogField` | interface | `:3-10` | 字段声明（key/label/placeholder/defaultValue/multiline/required） |
| `ReviewActionDialog` | 组件 | `:12-73` | `{title, description?, fields, onClose, onSubmit}` |

## 3. 内部逻辑与关键流程

- 初始化 `values` 为 `defaultValue ?? ''`（`:25`）。
- `submit`（`:29-48`）：`required !== false` 且空→`setError('请填写…')` 拒（`:32-37`）；`onSubmit(values)` 成功→`onClose()`；失败显示 `Error.message`。
- 遮罩点击关闭（busy 时忽略，`:51`）；`aria-modal`/`role="dialog"`（`:52`）。

## 4. 调用者与调用链

消费方：各审核动作入口（补件/退回/备注等）。出向：无（回调驱动）。

## 5. 数据 I/O、读写与副作用

无直接 I/O（`onSubmit` 由调用方决定）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 必填空 | `:32-37` | 错误提示 |
| 提交失败 | `:43-44` | 显示错误 |
| busy 中遮罩点击 | `:51` | 忽略 |

## 7. 权限与权威状态

无身份语义；`required !== false` 默认必填（`:33`、`:59`）。

## 8. 修改影响面

字段 schema 由调用方给定；校验口径（trim 后非空）与调用方一致。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、动态表单/校验 | 已证实 | `:3-73` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 2 个导出 | `:3-73` | covered |
