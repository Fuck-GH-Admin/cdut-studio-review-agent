---
path: apps/electron/src/renderer/components/cdut-science/CsLabCreateLabDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e11daa1563ea3e673ea528aea79a498b1e53e6ad
sha256: 22eea0eb8967ea0c54d5633a5972e6396476a49d657b4d93171a2b9d18f922e7
lines: 161
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabCreateLabDialog.tsx

## 1. 结论与边界

**新建实验室对话框**（`apps/electron/src/renderer/components/cdut-science/CsLabCreateLabDialog.tsx:1-5`）：社论式极简（暖白卡片/发丝边框/赤陶主操作/无浓重阴影）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabCreateLabDialog` | 组件 | `:17-161` | `{open, onClose, onCreated}` |

内部：`CsLabCreateLabDialogProps`（`:11-16`）。

## 3. 内部逻辑与关键流程

表单（名称等）→创建（经 API）→`onCreated(lab)`。错误显示。

## 4. 调用者与调用链

- 消费方：CsLabPreparationView（实验室选择页）。
- 出向：cslab API（创建）。

## 5. 数据 I/O、读写与副作用

经 API 创建；无本地写。

## 6. 分支、失败、取消与恢复

创建失败 toast；取消关闭。

## 7. 权限与权威状态

创建经主进程（沙箱目录建立）。

## 8. 修改影响面

`CsLabLab` 契约；视觉语言（`:4`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出已证实（`:17-161`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabCreateLabDialog` | `:17-161` | covered |
