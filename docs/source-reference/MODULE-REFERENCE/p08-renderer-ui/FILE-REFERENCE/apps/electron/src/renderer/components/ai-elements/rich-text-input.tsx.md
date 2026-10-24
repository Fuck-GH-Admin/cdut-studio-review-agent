---
path: apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d1764aac8a1a78024f867511c129b4e4f0ebf67
sha256: c5754f13668b9be580b3c0e86038ea014f64aa0383caaf2e9946be21384ac515
lines: 1085
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx

## 1. 结论与边界

**TipTap 富文本输入组件**（1085 行）："独立受控组件，不依赖 PromptInput Provider"（`:1-14`）：StarterKit+Link+CodeBlockLowlight+可选 Mention（@ 文件/`/` Skill/`#` MCP/`&` 会话）；htmlToMarkdown 双向序列化；IME 处理；Enter 提交/Shift+Enter 换行（**sendWithCmdEnter 双模式头注释未提**，矛盾 M10）；自动扩高+紧凑档+折叠。

## 2. 导出与关键符号（仅 2 个 export，字节核实 `:199`/`:211`）

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `RichTextInputHandle` | `:199-203` | `{getMarkdown, insertFileMentions, insertSessionMention}` 命令接口 |
| `RichTextInput` | `:211-1085` | forwardRef 主体 |

内部：`plainTextToEditorHtml:45-57`（HTML 转义防草稿注入）、`setEditorContentSafely:60-70`/`clearEditorContentSafely:72-81`（销毁竞态吞错/真错误重抛）、`countEditorLines:94-122`（粗估）、`useCompactViewport:134-144`（迟滞防抖，`:126-133` 记 2026-09-13 跳档事故）、props `:148-196`、20+ refs（回调 ref 保活模式）。

## 3. 内部逻辑与关键流程

- **Mention 链**：`hasMentionSupport:301`（**首次渲染定型**——扩展不补注册）；四工厂 suggestion（`:314-335`）；Mention.extend 增 `mentionSuggestionChar` 属性（`:372-414`，'&' 走 `renderSessionMention` 早退 `:390`）；Enter 与弹窗互斥经 `[data-decoration-id]` 查询（`:587-593`，替代旧 ref 竞态方案）。
- **序列化**（B 链）：HTML doc↔Markdown 受控值；onUpdate 180ms 防抖 flushDraft（`:690-692`）+`<p></p>` 空判定（`:665`）；外部同步 effect（`:743-798`）四重跳过闸（自写值/本地未上浮草稿/重建/模式切换）；提交前强制 flush（`:602-603` 防丢字）。
- **粘贴**（C 链 `:475-547`）：文件→onPasteFiles；纯文本模式超长→附件；富文本→`normalizeClipboardHtml`（注释 `:506-509`：不能 HTML↔MD 往返防 Windows 路径双转义）→富结构 insertContent/非富结构取可见文本再解析（`:535-538` Electron span 壳注释）。
- **键盘**（E 链 `:548-660`）：macOS Ctrl+B/S 替代（`:552-563`）；Enter 四分派（代码块/IME/弹窗/发送判定 `:597-598`）；列表续项/退列表；Backspace 空列表项退列表。
- **高度**：`resolveComposerMaxHeight/MinHeight` 优先级（手动折叠>紧凑档>展开）；min-height 走 CSS 变量（`:872-876` 注释：max-height 无过渡防 ResizeObserver 抖动）。

## 4. 调用者与调用链

Composer 输入框（AgentView 等）；出向 @tiptap 族、session-mention（4 函数）、四 suggestion 工厂、markdown-rich-text/clipboard-text-attachment/session-reference-drag/composer-compact-height、ui-preferences atoms。

## 5. 数据 I/O、读写与副作用

剪贴板读写、拖拽载荷、IPC（suggestion items 工厂内）、atoms 读。

## 6. 分支、失败、取消与恢复

销毁竞态双保险（`:60-81`）；flushDraft 卸载兜底（`:728-736`）；全 editor 命令可选链；无全局错误边界（照实）。

## 7. 权限与权威状态

- **schema 恒定契约**（`:339-348` 注释）：不能按 Markdown 开关增删扩展（否则 TipTap 销毁重建）。
- `disabledMentionChars` 白名单过滤（`:413`）；拖拽仅拦截会话引用（`:422-429`）。
- tabindex:'0' 可达性（`:431-433`）。

## 8. 修改影响面

改序列化影响草稿保真；键盘链影响提交体验；Mention 注册门（`:301`）是能力开关关键。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 3 段精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/五链状态机/双保险 | 已证实 | 1085 行全读（export 字节核实 2 处） |
| **M1** `:394`/`:403` '&' 分支死代码（早退后不可达）；**M2** mentionActiveRef/mentionItemCountRef 写后即弃（注释描述的 Enter 拦截行为已被 `:593` 方案取代） | 已证实 | 字节核实 |
| **M3** `:620` 注释仅 cmdEnterMode 成立；**M4** onDraftPresenceChange 空/非空通知不对称；**M5** getMarkdown 不带 skipMarkdownEscape 与 flushDraft 不一致（Windows 路径多转义风险） | 已证实 | `:620`/`:771-795`/`:845` vs `:713` |
| **M6** 空判定两套标准（trim vs `<p></p>`）；**M7** insertFileMentions 不查 isEditable；**M8** focus 空操作+inputIdRef 孤儿；**M10** 头注释未覆盖 sendWithCmdEnter（Ctrl+Enter 既不发也不换行而是分段）；**M13** handlePaste 恒 true 吞空粘贴 | 已证实 | `:250`/`:665`、`:847`、`:449`/`:238`、`:598`、`:546` |
| **M11** navigator.platform 已废弃+placeholder hack；**M12** 纯文本/富文本长文本阈值两套 | 已证实 | `:552`/`:806-816`、`:484-527` |
| 依赖（markdown-rich-text/suggestion 工厂/tiptap 内部） | 未知 | 见 UNVERIFIED |
| 行为实效（防抖/IME/紧凑档） | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 2 导出/五链 | §2/§3 | covered |
| schema 恒定/拖拽/可达性 | §7 | covered |
| 13 矛盾 | §10 | covered |
