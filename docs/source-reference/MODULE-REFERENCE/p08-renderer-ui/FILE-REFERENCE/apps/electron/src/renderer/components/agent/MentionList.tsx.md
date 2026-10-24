---
path: apps/electron/src/renderer/components/agent/MentionList.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0f4f157459c45aee1790e563f514bca8292e0f7f
sha256: 85e9e3cbd4355efd35078d798af5f44fbb1fd46fd2433044804c55a41d38a335
lines: 122
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/MentionList.tsx

## 1. 结论与边界

**泛型 Mention 下拉列表**（`apps/electron/src/renderer/components/agent/MentionList.tsx:1-6`）：统一键盘导航（上/下/Enter/Escape）、选中高亮、滚动定位；`renderItem`/`keyExtractor` 适配不同 Mention 类型（Skill/MCP 等）；`useImperativeHandle` 暴露 `onKeyDown` 给 TipTap Suggestion。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MentionListProps<T>` | interface | `:12-24` | 泛型 props（renderItem/keyExtractor 等） |
| `MentionListRef` | interface | `:35-…` | ref 接口（`onKeyDown`） |
| `MentionList` | 组件 | `:120-122` | `forwardRef` 泛型包装 |

内部：标题栏（面板类型标签+快捷键提示，`:25-34`）、`MentionListInner`。

## 3. 内部逻辑与关键流程

键盘导航（↑/↓/Enter/Escape）+ 选中滚动定位；TipTap Suggestion 经 ref 调 `onKeyDown`；泛型适配（`renderItem`/`keyExtractor`）。

## 4. 调用者与调用链

- 消费方：TipTap Mention Suggestion（Skill/MCP 输入）。
- 出向：React。

## 5. 数据 I/O、读写与副作用

无 I/O（展示+回调）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 键盘导航 | — | ↑/↓/Enter/Escape |
| 空列表 | — | 空态 |

## 7. 权限与权威状态

无身份语义；纯 UI 交互。

## 8. 修改影响面

- `MentionListRef.onKeyDown` 是 TipTap 合同；泛型 props 形状。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出、键盘导航/泛型适配 | 已证实 | `:1-122` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:12-122` | covered |
