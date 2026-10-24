---
path: apps/electron/src/renderer/components/content-review/ReviewMaterialControls.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6bd8ac1955f79cb9ea927b9be0c765e6e3cc7acf
sha256: 760d3e48eb8b02a122d5709532944ba348b1cef3406f6ab607177b119ad0a16d
lines: 322
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/ReviewMaterialControls.tsx

## 1. 结论与边界

**材料操作控件集**（`apps/electron/src/renderer/components/content-review/ReviewMaterialControls.tsx`，322 行）：中栏申报/证明材料的拖放导入、删除、移动按钮组。导入进度经 `window.reviewAPI?.onImportProgress` 订阅（`:34`）。

## 2. 导出与关键符号

`export` 共 **4 个**。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ReviewMaterialLaneActions` | 组件 | `:38-…` | 泳道材料操作 |
| `ReviewMaterialDropZone` | 组件 | `:150-233` | 中栏统一拖放导入框（`:149` 注释） |
| `RemoveReviewDocumentButton` | 组件 | `:234-284` | 删除材料 |
| `MoveReviewDocumentButtons` | 组件 | `:285-322` | 移动材料 |

## 3. 内部逻辑与关键流程

- `ReviewMaterialDropZone`（`:150-233`）：拖入经 `window.electronAPI.getPathForFile(file)` 取路径（`:183`）→ 登记 IPC（与 `MaterialDropZone` 同链路）。
- 删除/移动按钮走对应 reviewAPI 命令；导入进度订阅（`:34`）。

## 4. 调用者与调用链

- 消费方：CenterPanel（中栏材料区）。
- 出向：`window.reviewAPI`/`window.electronAPI`（webUtils 路径）。

## 5. 数据 I/O、读写与副作用

IPC 材料登记/删除/移动；进度事件订阅。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 路径取不到 | `:183` 区段 | 提示（同 MaterialDropZone 语义） |
| 导入进度 | `:34` | 订阅展示 |

## 7. 权限与权威状态

材料写经 reviewAPI（主进程校验）；无渲染层直写。

## 8. 修改影响面

- 材料命令契约（登记/删除/移动）。
- 与 `MaterialDropZone` 的登记链一致性。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个导出 | 已证实 | `:34-322` |
| 登记链细节 | 已证实（结构） | `:150-233` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 4 个导出 | `:38-322` | covered |
| 拖放/进度 | `:34`、`:150-233` | covered |
