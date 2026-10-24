---
path: apps/electron/src/renderer/components/content-review/RuleOutlineList.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 2b8646e8a4e7d3af083f7766cf81b2b931f54ec9
sha256: 609b98bf99618df61f97c8aa471a8600d0a44fad0e7a201ad7ecf965a35429de
lines: 111
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/RuleOutlineList.tsx

## 1. 结论与边界

**审核规则摘要列表**（`:1` 注释）：AI 生成/人工调整后按类别折叠、支持定位原文。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RuleOutlineList` | function（export） | `:21-39` | `({outline, onLocate, onUpdate?})`；空态提示「开始审核时从已载入依据准备」（`:32`） |

内部：`GENERATED_BY_LABELS`（ai/fixture/manual 三来源 `:9-13`）、`OutlineGroup`（Collapsible 折叠组 `:41-62`）、`OutlineItem`（`:64-111`）。

## 3. 内部逻辑与关键流程

- 分组（`:22-30`）：按 category 归组保持插入序。
- `OutlineItem`：展示态=点击主体→`onLocate(item.anchors)` 定位原文（`:99`）；来源徽标（AI 带 Sparkles、fixture 灰、manual 琥珀 `:102-104`）；摘要 line-clamp-2（`:106`）。
- 编辑态（`:84-95`）：标题 maxLength 160/摘要 8000（`:87-88`）；保存经 `onUpdate` 返回 true 才退出（`:79-82`）；props 变更时非编辑态回同步（防陈旧 `:73-77`）。

## 4. 调用者与调用链

入向：T08/规则工作台（跨文件）。出向：`@profer/ui/primitives/collapsible`、lucide-react、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯渲染；更新经 onUpdate 回调（跨文件持久化）。

## 6. 分支、失败、取消与恢复

空态/分组/编辑-展示两态。不适用取消/恢复。

## 7. 权限与权威状态

不适用（展示层）；来源徽标如实标注生成方式。

## 8. 修改影响面

改列表 → 规则摘要浏览/编辑/定位 UX。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `RuleOutlineList` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+3 内部+两态 | 已证实 | 逐行读 `:1-111` |
| onUpdate 持久化 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 组件组 | §2/§3 | `:21-111` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
