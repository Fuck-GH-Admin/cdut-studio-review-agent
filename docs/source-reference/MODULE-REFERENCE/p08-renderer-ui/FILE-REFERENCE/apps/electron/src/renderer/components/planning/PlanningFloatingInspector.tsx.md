---
path: apps/electron/src/renderer/components/planning/PlanningFloatingInspector.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a9ecc2f613ede77fad7d8df197a5adb8a3917bd7
sha256: f3e0ccaecb12f629bfe55dfde8e4165db2cc6460db1217c89637472777ad18ff
lines: 33
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/planning/PlanningFloatingInspector.tsx

## 1. 结论与边界

覆盖在任务/日程内容区上的详情 Inspector（`:11-14`）：**不参与底层网格布局**（列表/日历保持原宽度）；点空白、Escape 或 × 关闭。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `PlanningFloatingInspector` | function 组件 | `:15-33` | `{label; onClose; children}` |

## 3. 内部逻辑与关键流程

- Escape 全局 keydown → `onClose`（effect 卸载移除，`:16-22`）。
- 遮罩层（`aria-hidden`、`inset-0 z-30`、微透明+1px 模糊）`onMouseDown=onClose`；面板 `aside role="dialog" aria-label=label`（右侧浮层 `w-[min(30rem,…)]`、滚动、阴影）`onMouseDown stopPropagation`（面板内点击不关）。
- × 按钮（`aria-label=关闭${label}`、title“关闭 (Esc)”）。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/src/renderer/**/*.{ts,tsx}`（排除测试）：PlanningView（任务/日程详情浮层）。出向：`@profer/ui`（Button）、`lucide-react`。

## 5. 数据 I/O、读写与副作用

window keydown 监听（卸载清理）。无 I/O。

## 6. 分支、失败、取消与恢复

三关闭通道（空白/Esc/×）；无异步。

## 7. 权限与权威状态

无障碍标注完整（role=dialog/aria-label/aria-hidden 遮罩）。

## 8. 修改影响面

改浮层 → 影响详情查看交互。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 不占网格/三关闭通道 | 已证实 | `:11-28` |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PlanningFloatingInspector` | 2/3 | `:15-33` | covered |
