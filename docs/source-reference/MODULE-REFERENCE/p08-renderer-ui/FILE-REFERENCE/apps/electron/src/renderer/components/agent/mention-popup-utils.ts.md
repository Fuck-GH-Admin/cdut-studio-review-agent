---
path: apps/electron/src/renderer/components/agent/mention-popup-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ac33f7a5544c9cae1f796f1f45167db4f3dc966a
sha256: 1438ca1a32ea63c6b5491e48a0beb072c0e516b9f0c7cc99d6d97894a9044f6b
lines: 96
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/mention-popup-utils.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

Mention 弹窗公共逻辑（96 行，头注 :1-8）：初始隐藏防闪烁、rAF 定位后显示、视口边界限制、可选底部锚定（向上生长）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `isSuggestionTriggerPresent` | fn | 23-28 | 防 TipTap suggestion 异步竞态（详 §3） |
| `createMentionPopup` | fn | 31-45 | 建容器挂 body（同触发符旧弹窗先清） |
| `PositionOptions` | interface | 47-50 | `anchorBottom?` |
| `positionPopup` | fn | 53-96 | rAF 定位（右/上边界限制） |

内部：`POPUP_GAP=4`/`VIEWPORT_PADDING=8`（:10-11）。

## 3. 内部逻辑与关键流程

1. **`isSuggestionTriggerPresent`**（:23-28）：range 校验后 `textBetween(from,to)` 须以触发符开头——防御「await items()（IPC 耗时）期间用户删了触发符，插件仍用过期 props 调 onStart」的幽灵弹窗（注释 :13-22，Esc 都关不掉）。
2. **`createMentionPopup`**（:31-45）：`data-profer-mention-popup="{char}"` 同触发符旧弹窗先移除（多保活 Tab/异步残留）；初始 `visibility:hidden`。
3. **`positionPopup`**（:53-96）：rAF 内测量→水平不超右边界；`anchorBottom` 底对齐光标上方向上生长（顶到界钳制）；否则优先向上、空间不足向下→显示。

## 4. 调用者与调用链

入向：`mention-suggestions.tsx`（工厂 onStart/onUpdate）、`MentionList` 弹窗族。出向：`@tiptap/react` 类型（:10）。

## 5. 数据 I/O、读写与副作用

DOM 创建/挂 body/rAF；无网络。

## 6. 分支、失败、取消与恢复

null popup/rect 早退；不抛。

## 7. 权限与权威状态

- UI 竞态防御权威：过期 suggestion 不建弹窗（幽灵弹窗不可关闭是明确回归口径，:13-22）。无 sender/role 检查。

## 8. 修改影响面

Skill/MCP/会话引用三类 mention 弹窗。无专属测试文件。

## 9. 测试证据

直接测试：无独立文件（全树检索 mention-popup-utils.test = 0）；经 mention-suggestions 组件行为间接。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 竞态防御/定位语义 | 已证实（代码） | :23-28/:53-96 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `isSuggestionTriggerPresent` | §3.1 | 23-28 | covered（未测） |
| `createMentionPopup` | §3.2 | 31-45 | covered（未测） |
| `positionPopup` 双模式 | §3.3 | 53-96 | covered（未测） |
