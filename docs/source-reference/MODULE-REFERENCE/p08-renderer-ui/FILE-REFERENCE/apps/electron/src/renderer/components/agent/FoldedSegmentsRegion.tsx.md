---
path: apps/electron/src/renderer/components/agent/FoldedSegmentsRegion.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 35216460dd0309e5456287c6251bb510f39caf3f
sha256: d697bd7334f78ecc54ed099a51993355e56bdfe9f5b6df05b4a43d304573eae4
lines: 96
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/FoldedSegmentsRegion.tsx

## 1. 结论与边界

**被折叠段展开区**（`apps/electron/src/renderer/components/agent/FoldedSegmentsRegion.tsx:32-42`）：三条行为约束（用户明确要求）——①展开/收起**下方内容不位移**（零高度锚点+`useLayoutEffect` 同帧补偿滚动，paint 前完成不闪）②展开后有收起入口（主动折叠闭环）③展开状态由调用方按 turn 生命周期持有（流式窗口重挂载不覆盖用户选择）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `findScrollParent` | 函数 | `:11-19` | 找最近纵向可滚动祖先（只看 `overflowY`，`:8-9` 注释防漏判） |
| `FoldedSegmentsRegionProps` | interface | `:21-30` | `{count, renderRevealed, expanded?, onExpandedChange?}` |
| `FoldedSegmentsRegion` | 组件 | `:43-96` | 折叠段展开区 |

## 3. 内部逻辑与关键流程

- `toggle`（`:49-57`）：记录锚点视口位置（`pendingRef`）→受控/内部状态切换。
- `useLayoutEffect` 无依赖数组（`:59-69`）：每次渲染后检查待补偿滚动量——`delta = anchor.top - pending.top`，`scroller.scrollTop += delta`（**paint 前同帧补偿**）。
- `count <= 0` 返回 null（`:71`）。

## 4. 调用者与调用链

- 消费方：过程块渲染（折叠段展示）。
- 出向：React、lucide 图标。

## 5. 数据 I/O、读写与副作用

DOM 测量/滚动补偿；无 I/O。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 无锚点/无 scroller | `:52-54` | 跳过补偿 |
| 受控模式 | `:55` | 只回调不改内部态 |
| count≤0 | `:71` | null |

## 7. 权限与权威状态

无身份语义；三条约束是 UX 契约（`:35-41`）。

## 8. 修改影响面

- 滚动补偿时机（`useLayoutEffect` 无依赖）改动会引入跳动。
- 受控展开协议（`expanded`/`onExpandedChange`）与流式重挂载耦合。

## 9. 测试证据

无专属测试（`ProcessBlockGroup.test` 间接）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、三约束实现 | 已证实 | `:11-96` |
| 补偿不闪（paint 前） | 已证实 | `:59-69` |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:11-96` | covered |
| 补偿/受控 | `:49-69` | covered |
