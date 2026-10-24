---
path: apps/electron/src/renderer/components/ai-elements/session-mention.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3bd0c994afed310684c2a8f333af16e96c9b9342
sha256: 8d8b158715fc0f8af74f997c21f9172feaa34a51126e701a45cde63702c14f93
lines: 69
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/session-mention.ts

## 1. 结论与边界

会话引用（`&` 唤起 mention）**渲染与删除**纯逻辑（69 行，ProseMirror 层）：DOMOutputSpec 渲染芯片（含移除按钮）+ 三路删除入口（中键/点击/键盘）。关键设计（`:35`）："按 DOM 对应位置删除单颗原子节点，**不按 ID 删除**，避免重复引用一起消失"。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `renderSessionMention` | `:5-28` | `(id, label) => DOMOutputSpec`：mention 芯片（data-* 契约 + label span + 移除按钮 aria-label）；`:4` 注释：兄弟节点必须直接放父数组 |
| `handleSessionMentionMouseDown` | `:51-58` | 中键→删除；左键命中移除钮→preventDefault（防 PM 改选区，删除交给 click） |
| `handleSessionMentionClick` | `:60-63` | 左键移除钮→删除 |
| `handleSessionMentionKeyDown` | `:65-69` | Enter/空格激活移除钮→删除（键盘可达） |

内部：`getTarget:30-33`、`removeSessionMention:36-49`（chip 定位→attrs 三重校验（type/mentionSuggestionChar/&/id 一致）→`tr.delete` 原子删除→focus）。

## 3. 内部逻辑与关键流程

删除链：closest 定位→合法性校验（`view.dom.contains`+attrs 匹配）→preventDefault/stopPropagation→posAtDOM→单原子 delete→scrollIntoView+focus。非编辑态只拦截不删（`:41`）。

## 4. 调用者与调用链

rich-text-input（PM 事件处理接线，批内）；出向 `@tiptap/pm`（DOMOutputSpec/EditorView）。

## 5. 数据 I/O、读写与副作用

ProseMirror 事务 dispatch+焦点管理；无 IO。

## 6. 分支、失败、取消与恢复

chip 不在文档→false 放行；attrs 不匹配→true（吞事件不删）；不可编辑→true 不删。

## 7. 权限与权威状态

**单颗删除契约**（`:35`）：按位置删防误伤重复引用；`mentionSuggestionChar==='&'` 限定会话 mention 类型。

## 8. 修改影响面

改删除语义影响引用编辑体验；data-* 契约联动 rich-text-input 序列化。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件四导出/删除链/三重校验 | 已证实 | 69 行全读 |
| PM 行为实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
