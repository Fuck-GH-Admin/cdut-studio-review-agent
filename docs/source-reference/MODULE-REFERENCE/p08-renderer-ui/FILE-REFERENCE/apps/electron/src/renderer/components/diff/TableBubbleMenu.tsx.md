---
path: apps/electron/src/renderer/components/diff/TableBubbleMenu.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e047f52c4c30af0c827f53931bef76e65f44c438
sha256: 7bc460e26adfb248c8df44bbdd426c34e699bb2aa2a0481c462825f2a83a1ad6
lines: 104
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/renderer/components/diff/TableBubbleMenu.tsx

## 1. 结论与边界

TipTap 编辑器的表格浮动菜单（BubbleMenu）：光标在表格内且可编辑时浮出 7 个操作按钮——上/下插入行、左/右插入列、删行、删列、删表格（`apps/electron/src/renderer/components/diff/TableBubbleMenu.tsx:80-104`）。

边界：

- 不创建/解析表格；所有操作经 TipTap command 链执行，撤销模型归 ProseMirror。
- 不处理单元格合并/拆分、不管理表格样式。
- 显示条件逻辑在本文件（`shouldShowTableMenu`），但编辑器实例由外部传入。

## 2. 导出与关键符号

`export` 逐条核对：1 个函数（类/接口/常量导出 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `TableBubbleMenu` | 函数（导出） | 80-104 | `({editor}: TableBubbleMenuProps) => React.ReactElement` | BubbleMenu 本体 |
| `selectionInsideNode` | 内部函数 | 24-33 | `(editor, nodeName) => boolean` | `$from`/`$to` 任一祖先链含该节点 |
| `isCellSelection` | 内部函数 | 36-38 | `(selection) => boolean` | duck-typing：`'$anchorCell' in s && '$headCell' in s`（避免跨包 instanceof 失败） |
| `shouldShowTableMenu` | 内部函数 | 40-44 | `(editor) => boolean` | 显示条件（见 §3） |
| `TableButton` | 内部组件 | 46-78 | `({icon,label,destructive?,disabled?,onClick})` | 带 Tooltip 的 ghost 图标按钮 |
| `TableBubbleMenuProps` | 内部接口 | 20-22 | `{editor: Editor}` | props |

## 3. 内部逻辑与关键流程

1. **显示条件** `shouldShowTableMenu`（`apps/electron/src/renderer/components/diff/TableBubbleMenu.tsx:40-44`）：`!editor.isEditable` → 不显示；selection 是 CellSelection → 不显示（`:42`，此时交给表格拖选交互）；否则 `isInTable(editor.state) || selectionInsideNode(editor, 'table')`（`:43`）。
2. **挂载**（`:82-86`）：`BubbleMenu editor pluginKey="tableBubbleMenu" shouldShow={({editor: ed}) => shouldShowTableMenu(ed)}`。
3. **按钮**（`:87-101`）：四个插入命令（`addRowBefore`/`addRowAfter`/`addColumnBefore`/`addColumnAfter`，`:88-91`）、分隔线、两个 destructive 删除命令（`deleteRow`/`deleteColumn`，`:95-96`）、分隔线、`deleteTable`（destructive，`:100`）。全部 `editor.chain().focus().<cmd>().run()`。
4. **TableButton**（`:46-78`）：`Tooltip > Button(variant='ghost', size='icon-sm')`；destructive 时红字（`:65`）；`onClick` 先 `e.preventDefault()` 再执行命令（`:67-70`）。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/renderer/components/diff/MarkdownRichEditor.tsx:25`（import）、`MarkdownRichEditor.tsx:225`（`{editing && editor && <TableBubbleMenu editor={editor} />}`——仅编辑态挂载）。无测试引用（见 §9）。

出向：`@tiptap/react/menus`（`BubbleMenu`）、`@tiptap/pm/tables`（`isInTable`）、`@tiptap/pm/state`（`Selection` 类型）、`@profer/ui/primitives/button|tooltip|separator`、`@/lib/utils`（`cn`）、`lucide-react` 图标。

## 5. 数据 I/O、读写与副作用

- 无磁盘/网络/IPC；纯 UI。
- 副作用：TipTap 命令链修改编辑器文档状态（表格结构变更，可经 Ctrl+Z 撤销）；`e.preventDefault()`（`:68`）抑制按钮默认行为（防丢焦点）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 行为 |
| --- | --- | --- |
| `!editor.isEditable` | 41 | 不显示 |
| CellSelection（拖选单元格） | 42 | 不显示 |
| 光标在表内 / selection 在 table 内 | 43 | 显示 |
| `disabled` 传入 | 66 | 按钮禁用（本文件所有调用点均未传） |

- 命令失败：TipTap 命令对非法状态（如无表格时删行）no-op 或局部执行，由 ProseMirror 事务模型保证不破坏文档；本文件无错误处理（无 try/catch）。
- 取消/恢复：文档修改可撤销（编辑器 undo），无本文件级恢复逻辑。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查、无 IPC；唯一“门”是 `editor.isEditable`（`:41`）——可编辑性权威在编辑器装配方（`MarkdownRichEditor` 的 editing 态）。

## 8. 修改影响面

- 改显示条件影响 `MarkdownRichEditor.tsx:225` 的浮出行为。
- 改命令集合影响表格编辑能力面（用户可见）。
- `pluginKey="tableBubbleMenu"` 是 ProseMirror 插件注册键，改动影响 BubbleMenu 插件查找。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `TableBubbleMenu` 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：显示条件三分支、7 个命令、destructive 样式均无自动化断言。维护者验证：Markdown 编辑态在表格内点击，验证浮出与增删行列/删表。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 仅 1 个导出 | 已证实 | 全文 `export` 逐条核（仅 `:80`） |
| CellSelection 不显示（duck-typing） | 已证实 | `:36-38,42` |
| `!isEditable` 不显示 | 已证实 | `:41` |
| 7 个表格命令逐一对应按钮 | 已证实 | `:88-100` |
| 仅编辑态挂载（editing && editor） | 已证实 | `MarkdownRichEditor.tsx:225` |
| TipTap 命令失败的内部行为 | 未知 | 依赖库实现，未读 |
| 运行表现 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `shouldShowTableMenu` 三分支 | §3,§6 | 40-44 | covered |
| `selectionInsideNode` | §2 | 24-33 | covered |
| `isCellSelection` | §2 | 36-38 | covered |
| 7 命令按钮 | §3 | 87-101 | covered |
| `TableButton` | §2,§3 | 46-78 | covered |
| 测试 | §9 | — | unknown |
