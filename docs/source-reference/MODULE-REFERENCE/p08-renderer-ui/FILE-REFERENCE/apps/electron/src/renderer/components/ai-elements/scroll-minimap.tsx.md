---
path: apps/electron/src/renderer/components/ai-elements/scroll-minimap.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d863221e0e6c14ee91f8202dd33cc824a3e3d56
sha256: ab29ee298fad313ca9fb451f729625bc51665ba85f181394d08041bc286d6006
lines: 523
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/scroll-minimap.tsx

## 1. 结论与边界

**消息导航迷你地图 + 滚动进度条**（523 行）：消息区右侧短横杠迷你地图（悬浮预览列表）+ 可拖拽进度条（`:2-8`）。"必须放在 StickToBottom（Conversation）内部使用"（`:7`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `MinimapItem` | `:23-29` | `{id, role:'user'\|'assistant'\|'status', preview, avatar?, model?}` |
| `ScrollMinimap` | `:61` | 唯一组件导出：`({items})`；`items<MIN_ITEMS(=1) \|\| !canScroll` → null（`:328`） |

内部：`MIN_ITEMS=1:36`（显示门槛实为 canScroll，照实）、`MAX_BARS=20:38`、`getOffsetTopRelativeTo:44-52`、`escapeRegExp:55`、`ItemIcon:475-494`（四分支含灰块兜底）、`HighlightedPreview:497-523`（搜索高亮/MarkdownPreview）。

## 3. 内部逻辑与关键流程

- **可见性追踪**（`:91-129`）：scroll+ResizeObserver→`[data-message-id]` 视口交集→visibleIds+centerVisibleId。
- **横杠区**（`:415-444`）：barCount=min(len,20)、分组切片、三态配色（可见/user/普通）。
- **面板**（`:347-413`）：hover 180ms 延迟开（防掠过闪烁）、离开 40+80ms、Cmd+F 快捷键（`useShortcut('file-find')` `:176`）、搜索过滤、点击 scrollToMessage。
- **滚动写入三路**：scrollToMessage（`:220-242`，居中或 -32）、滑块拖拽（`:262-304`）、轨道点击（`:308-326`）——三路均**直接改写 use-stick-to-bottom 内部 stickyState**（animation/velocity/accumulated，`:229-231` 等三处）强停吸附。

## 4. 调用者与调用链

会话消息区（Conversation 内）；出向 `@profer/ui`（MarkdownPreview）、model-logo、UserAvatar、channelsAtom、useShortcut、use-stick-to-bottom（内部状态）。

## 5. 数据 I/O、读写与副作用

DOM 测量/滚动写入/body style 临时改写（拖拽期 userSelect/cursor）。

## 6. 分支、失败、取消与恢复

canScroll 阈值（scrollHeight>clientHeight+10 `:97`）；空搜索"未找到匹配消息"；thumb 最小 10%。

## 7. 权限与权威状态

**stickyState 内部字段直改契约**（`:229-231`/`:272-274`/`:317-319`）：依赖第三方库内部结构无封装 API——升级脆弱点（照实）。

## 8. 修改影响面

改可见性算法影响导航精度；stickyState 直改与库版本联动。

## 9. 测试证据

**零测试**（无 scroll-minimap.test.ts）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/三路滚动/面板交互 | 已证实 | 523 行全读（字节核对） |
| **①** MIN_ITEMS=1 使守卫恒假（名实略不符，防御配置）；**②** stickyState 三处直改（升级脆弱）；**④** ItemIcon 灰块兜底与常规预期有落差 | 已证实 | `:36`/`:328`、`:229-231`、`:493` |
| use-stick-to-bottom 内部结构 | 未知 | 第三方不在冻结树 |
| 渲染实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9（零覆盖）、实效 unknown。
