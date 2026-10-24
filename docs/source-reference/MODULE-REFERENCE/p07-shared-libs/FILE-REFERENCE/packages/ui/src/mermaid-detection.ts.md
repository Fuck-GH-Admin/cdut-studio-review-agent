---
path: packages/ui/src/mermaid-detection.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c8a44ec56f49bebc1a6f74bb202976357efe293e
sha256: 0c4b5314610136addaadbee85fa2b9b65398f8b3a4029f65ad54f282172ad972
lines: 100
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/mermaid-detection.ts

## 1. 结论与边界

**代码块识别纯函数集**（`packages/ui/src/mermaid-detection.ts:1-100`）：判定代码块应否交给 MermaidBlock / 思维导图渲染器。设计红线（`:1-3` 注释）：`graph/flowchart/flowchart-elk` 因同为常见英文/代码词**不进起始关键字表**，改用"必须跟方向关键字"的 `MERMAID_DIRECTED_PATTERN`（零漏报且不误判普通文本）。纯函数、无副作用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `isMermaidLanguage` | function（export） | `:53-55` | `(language) => boolean` | `^(mermaid\|mmd)$` 大小写不敏感 |
| `looksLikeMermaidDefinition` | function（export） | `:57-64` | `(code) => boolean` | 首个非指令/非注释行匹配起始或方向模式 |
| `shouldInspectMermaidCodeBlock` | function（export） | `:66-70` | `(className?) => boolean` | 是否值得看内容（无语言类也 true） |
| `shouldRenderMermaidCodeBlock` | function（export） | `:72-76` | `(className?, code) => boolean` | 显式 mermaid 类 / 无语言类时看内容 |
| `isMindMapLanguage` | function（export） | `:83-85` | `(language) => boolean` | `^mindmap$` |
| `shouldRenderMindMapCodeBlock` | function（export） | `:95-100` | `(className?, code) => boolean` | 仅 `language-mindmap` 或无语言类且首行 `mindmap` |

内部常量：`MERMAID_START_KEYWORDS`（35 关键字，`:4-39`）、`MERMAID_START_PATTERN`（`:41-44`）、`MERMAID_DIRECTED_PATTERN`（`:47`，`^(flowchart-elk|flowchart|graph)\s+(TB|TD|BT|RL|LR)\b`）、`LANGUAGE_CLASS_PATTERN`（`:48`）、`MERMAID_LANGUAGE_CLASS_PATTERN`（`:49`）、`MERMAID_DIRECTIVE_PATTERN`/`MERMAID_COMMENT_PATTERN`（`:50-51`）、`MINDMAP_LANGUAGE_CLASS_PATTERN`（`:80`）。

## 3. 内部逻辑与关键流程

1. `looksLikeMermaidDefinition`（`:58-63`）：逐行 trim，跳过空行/`%%{…}%%` 指令/`%%` 注释（`:60`）；**第一个有效行**匹配方向模式或起始模式即 true（`:61`）；全跳过 → false。
2. `shouldInspectMermaidCodeBlock`（`:67-69`）：mermaid/mmd 类 → true；其他 `language-*` 类 → false；无语言类 → true（让内容嗅探决定）。
3. `shouldRenderMermaidCodeBlock`（`:73-75`）：mermaid/mmd 类 → true；其他语言类 → false；无语言类 → 交给 `looksLikeMermaidDefinition`。
4. `shouldRenderMindMapCodeBlock`（`:96-99`）：`language-mindmap` → true；其他语言类（含 `language-mermaid`）→ false（`:97`，mermaid 自带 mindmap 归 MermaidBlock，注释 `:93`）；无语言类 → 首行 `mindmap\b` 才 true（`:98-99`）。

## 4. 调用者与调用链

- 入向（包外 3+2+1 文件）：`apps/electron/src/renderer/components/ai-elements/message.tsx`（`shouldRenderMermaidCodeBlock`/`shouldRenderMindMapCodeBlock`/`shouldInspectMermaidCodeBlock`）、`diff/markdown-preview-extensions.tsx`（mermaid+mindmap 判定）、`packages/core/src/highlight/language-detector.ts`（`shouldRenderMermaidCodeBlock`）；`isMermaidLanguage/looksLikeMermaidDefinition/isMindMapLanguage` **无包外消费者**（负向检索）。
- 再导出：`packages/ui/src/index.ts:19-26`。
- 测试入向：`packages/ui/src/mermaid-detection.test.ts`（8 用例，§9）。
- 出向：无。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/状态/副作用。

## 6. 分支、失败、取消与恢复

不抛错。关键分支：语言类三态（mermaid 类/其他语言类/无类）、首行/首个有效行判定、指令与注释跳过。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支（纯工具）。

## 8. 修改影响面

改判定 → `message.tsx`/`markdown-preview-extensions.tsx` 的代码块分流（MermaidBlock vs MindMapBlock vs CodeBlock）、`packages/core` 的语言探测；`mermaid-detection.test.ts` 6+2 用例（§9）。关键字表新增会改变识别面。

## 9. 测试证据

**直接测试 `packages/ui/src/mermaid-detection.test.ts`（8 个 `test()`，bun:test，NOT_RUN；经 `./index` 导入，`:5-12`）**：

- `shouldRenderMindMapCodeBlock`（6 用例，`:14-44`）：`language-mindmap` 命中（`:16`）；`language-mermaid` + mindmap 内容不命中（`:20`，交 MermaidBlock）；无语言类首行 `mindmap`（含前导空格）命中（`:24-25`）；普通代码/`language-js` 不误判（`:29-30`）；`isMindMapLanguage` 判定（`mindmap`/`MINDMAP` true、`mermaid` false，`:34-36`）；`language-mermaid` + mindmap 时 `shouldRenderMermaidCodeBlock` true 且 mindmap 判定 false（`:41-42`）。
- z 阶梯（2 用例，`:46-65`）：测的是 `Z_INDEX/Z_LAYER`（`z-layers.ts`），见该手册 §9（同文件双主题）。

未覆盖：`looksLikeMermaidDefinition` 的方向模式（graph/flowchart）、注释/指令跳过路径、`shouldInspectMermaidCodeBlock`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出 + 7 内部常量；判定分支全览 | 已证实 | 逐行读 `:1-100` |
| graph/flowchart 方向模式设计动机 | 已证实（注释）/行为推断 | `:1-3`、`:45-46` 注释；无测试锁定 |
| `isMermaidLanguage/looksLikeMermaidDefinition/isMindMapLanguage` 无包外消费者 | 已证实（负向） | 冻结树全检索 |
| 误判率 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出判定函数 | §2/§3 | `:53-100` | covered |
| 常量族（关键字/模式） | §2 | `:4-51`、`:80` | covered |
| 测试（mindmap 6 + z 阶梯 2） | §9 | 测试行号 | covered（NOT_RUN） |
| 方向模式/指令跳过 | §9/§10 | `:58-63` | partial（无测试） |
