---
path: packages/ui/src/primitives/alert-dialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 94f356758889f00db69d11d4995b8d08c13bab8f
sha256: 7be3895a4a018894824dd19f84c49997162d5372c867902841f89e052b41c9d6
lines: 152
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/primitives/alert-dialog.tsx

## 1. 结论与边界

**二次确认对话框原语**（Radix `@radix-ui/react-alert-dialog` 的样式封装，`packages/ui/src/primitives/alert-dialog.tsx:1-8`）：shadcn 风格 11 个导出。语义档位 = `Z_LAYER.confirm`（z-[110]，高特权阻断确认——`z-layers.ts` 阶梯注释）。无业务逻辑。

## 2. 导出与关键符号

导出 11 条（`:140-152`）：

| 符号 | 行 | 形状 | 说明 |
| --- | --- | --- | --- |
| `AlertDialog` | `:10` | `AlertDialogPrimitive.Root` 直接别名 | 受控/非控由 Root 提供 |
| `AlertDialogTrigger` | `:12` | `Primitive.Trigger` 别名 | — |
| `AlertDialogPortal` | `:14` | `Primitive.Portal` 别名 | Portal 到 body |
| `AlertDialogOverlay` | `:16-32` | forwardRef 包装 | `bg-overlay/40 backdrop-blur-sm` + `Z_LAYER.confirm` + 动画类 |
| `AlertDialogContent` | `:34-57` | forwardRef 包装 | 居中卡片 + `Z_LAYER.confirm` + `data-browser-blocking`（`:53`） |
| `AlertDialogHeader` | `:59-71` | div | `flex flex-col space-y-2 text-center sm:text-left` |
| `AlertDialogFooter` | `:73-85` | div | `flex-col-reverse sm:flex-row sm:justify-end` |
| `AlertDialogTitle` | `:87-97` | forwardRef | `text-lg font-semibold` |
| `AlertDialogDescription` | `:99-110` | forwardRef | `text-sm text-muted-foreground` |
| `AlertDialogAction` | `:112-122` | forwardRef | `buttonVariants()` 默认变体 |
| `AlertDialogCancel` | `:124-138` | forwardRef | `buttonVariants({variant:'outline'})` + `mt-2 sm:mt-0` |

## 3. 内部逻辑与关键流程

无组件逻辑——全部是 className 组合（`cn` `:6`）+ Radix 透传。`AlertDialogContent` 结构（`:38-55`）：Portal → Overlay → Content（居中 transform、动画 data-state 类、`titlebar-no-drag` 防拖拽区误触）。

## 4. 调用者与调用链

- 入向：**深路径导入** `@profer/ui/primitives/alert-dialog` 共 22 个外部文件（如 `file-browser/FileBrowser.tsx:42`、`planning/PlanningView.tsx:24`、`cdut-science/CsLabDeleteLabDialog.tsx:19`、`cdut-science/agent-window/ScienceAgentWindowView.tsx:53`）；本批 p08 交付中 `LongTermMemoryView.tsx:21`/`AgentView.tsx:53-62` 亦消费。**不经 `packages/ui/src/index.ts`**（该入口未导出本模块——`index.ts:5-26` 无 alert-dialog 行）。
- 出向：`@radix-ui/react-alert-dialog`（`:4`）、`../lib/cn`（`:6`）、`../lib/z-layers`（`:7`）、`./button` 的 `buttonVariants`（`:8`）。

## 5. 数据 I/O、读写与副作用

无 I/O；副作用=Portal 挂 DOM、Radix 焦点陷阱/滚动锁（上游原语行为）。

## 6. 分支、失败、取消与恢复

无自有分支；关闭/确认语义（onOpenChange）由 Radix Root 提供。不适用项依据：无异步/错误路径。

## 7. 权限与权威状态

无权限分支（纯展示原语）；`confirm` 层级（z-110）语义约定见 `z-layers.ts` 阶梯（本文件 `:24/:44` 引用）。

## 8. 修改影响面

改层级/类名 → 22 个深路径消费者的确认框外观与遮挡关系；改 `data-browser-blocking`（`:53`）→ 浏览视图阻断逻辑（消费方在浏览器集成层）；`buttonVariants` 变化连带按钮样式。

## 9. 测试证据

无直接测试（负向：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `alert-dialog|AlertDialog` → 0 专属命中）。间接：各业务确认框渲染存在。未覆盖：Overlay/Content 类名、层级、`data-browser-blocking`。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出、纯样式封装、无逻辑 | 已证实 | 逐行读 `:1-152` |
| 深路径消费 22 文件、不经包入口 | 已证实 | 全树检索 + `index.ts` 逐行核 |
| `data-browser-blocking` 语义 | 未知 | 消费实现跨层未读 |
| Radix 焦点陷阱行为 | 未知 | 上游依赖 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出 | §2 | `:10-152` | covered |
| Content/Overlay 结构 | §3 | `:16-57` | covered |
| 调用面/影响面 | §4/§8 | — | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
