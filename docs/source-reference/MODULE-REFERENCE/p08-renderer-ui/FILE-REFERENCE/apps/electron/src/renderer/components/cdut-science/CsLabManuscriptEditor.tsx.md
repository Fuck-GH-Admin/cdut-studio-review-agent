---
path: apps/electron/src/renderer/components/cdut-science/CsLabManuscriptEditor.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f82ebfffc8fa6f5d6ad50d237c611206b5a7ca12
sha256: 0e93d01c37254c7e4489ef7b5a75bfb1ac6a3b449e4853f2fe974b64036e2b20
lines: 996
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabManuscriptEditor.tsx

## 1. 结论与边界

**Microsoft Word 级论文编辑器**（`apps/electron/src/renderer/components/cdut-science/CsLabManuscriptEditor.tsx:1-10`，996 行本批最大）：①真实 A4 页面视图（794px/物理投影/边距刻度）②Word Ribbon 选项卡（开始/插入/排版与视图）③物理厘米标尺④**显式分离「保存 (Ctrl+S)」与「另存为 (Ctrl+Shift+S)」**（`:8`）⑤Word 底部状态栏（页码/字数/字符/胶囊/保存状态/缩放）⑥数据表单元格（`application/x-cslab-ref`）拖入正文生成**活体胶囊**（`:10`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabManuscriptEditor` | 组件 | `:130-996` | 论文编辑器 |

## 3. 内部逻辑与关键流程

A4 编辑（`:5`）；Ribbon（`:6`）；标尺（`:7`）；保存/另存分离（`:8`）；状态栏（`:9`）；拖入活体胶囊（`:10`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（文稿区）。
- 出向：文稿 API。

## 5. 数据 I/O、读写与副作用

经 API 保存/另存。

## 6. 分支、失败、取消与恢复

保存失败提示。

## 7. 权限与权威状态

**保存/另存显式分离**（`:8`）——防误覆盖；活体胶囊（`application/x-cslab-ref`）引用权威。

## 8. 修改影响面

- 保存语义（`:8`）；胶囊 MIME（`:10`）。
- A4 物理投影（`:5`）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、六特性已证实（`:1-996`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabManuscriptEditor` | `:130-996` | covered |
