---
path: apps/electron/src/renderer/lib/clipboard-text-attachment.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4b478a0e52fbd0464faad56e70649d59aed91840
sha256: 4cc042d45e98842663050e3a0103c5176ce1ee19bf1b66398f0486ecaa436890
lines: 70
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/clipboard-text-attachment.ts

## 1. 结论与边界

长文本粘贴转附件的纯逻辑模块（70 行）：判定是否把粘贴文本转成附件、生成唯一附件文件名、生成剪贴板草稿元数据（Markdown/纯文本识别 + UTF-8 字节数 + 时间戳文件名）、组装 `AgentPendingFile`。边界：不落盘、不读剪贴板——文件名含 clipboard 但本文件零 I/O，临时文件写入在调用方 `AgentView.tsx` 经 `window.electronAPI.writeClipboardPreview` 完成（`apps/electron/src/renderer/components/agent/AgentView.tsx:1734`）；`sourcePath` 是发送时的唯一真实数据源约定写在 `apps/electron/src/renderer/lib/clipboard-text-attachment.ts:48` 注释。

## 2. 导出与关键符号

- 函数导出 4 个：`shouldConvertClipboardTextToAttachment`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:16-19`）、`makeUniqueAttachmentName`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:21-31`）、`createClipboardTextDraft`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:33-40`）、`createClipboardPendingFile`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:42-52`）。
- 类型导出 2 个：`ClipboardTextDraft`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:3-7`：filename/mediaType/size）、`ShouldConvertClipboardTextInput`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:9-14`：enabled/plainText/normalizedText/threshold）。常量导出 0 个。合计导出 6 个符号。
- 内部符号（标注"内部"）：`formatClipboardTimestamp`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:54-57`）、`looksLikeMarkdown` 及其 8 条正则（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:59-70`）。

## 3. 内部逻辑与关键流程

1. 转附件判定 `shouldConvertClipboardTextToAttachment`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:16-19`）：`!enabled || threshold <= 0` 短路 false（`:17`）；否则 `plainText.length >= threshold || normalizedText.length >= threshold`（`:18`），原文或 Markdown 归一化文任一超阈值即转。
2. 唯一命名 `makeUniqueAttachmentName`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:21-31`）：不在 `existingNames` 中直接返回原名（`:22`）；`lastIndexOf('.')` 且 `dotIdx > 0` 才拆扩展名（`:23-25`，点开头文件名不拆）；`-counter` 循环递增至不冲突（`:27-29`）；返回 `${baseName}-${counter}${ext}`（`:30`）。
3. 草稿生成 `createClipboardTextDraft`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:33-40`）：`looksLikeMarkdown(text)` 决定扩展名 md/txt 与 mediaType `text/markdown`/`text/plain`（`:34-36`）；文件名 = `clipboard-${formatClipboardTimestamp(now)}.${extension}` 经 `makeUniqueAttachmentName` 去重（`:37`）；`size = new TextEncoder().encode(text).byteLength`（UTF-8 字节数，`:38`）；返回三字段对象（`:39`）。
4. 附件组装 `createClipboardPendingFile`（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:42-52`）：返回 `AgentPendingFile`，透传 id/filename/mediaType/size，写入 `sourcePath` 与 `isClipboardDraft: true`（`:43-51`）。
5. `formatClipboardTimestamp`（内部，`:54-57`）：`YYYYMMDD-HHMMSS` 补零格式；`looksLikeMarkdown`（内部，`:59-70`）：标题/围栏代码/表格/`---` front matter/引用/无序列表/有序列表/链接 8 条正则 `.some()` 命中其一即 Markdown。

## 4. 调用者与调用链

- 入向（冻结树全量 grep 四个导出函数名 + 路径串 `clipboard-text-attachment`）：`apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:40`（import `shouldConvertClipboardTextToAttachment`，调用 `apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:516`，粘贴长文本转附件判定）；`apps/electron/src/renderer/components/agent/AgentView.tsx:158`（import 三函数）：`makeUniqueAttachmentName` 调用 `apps/electron/src/renderer/components/agent/AgentView.tsx:1497`（附件唯一命名）、`createClipboardTextDraft`/`createClipboardPendingFile` 调用 `apps/electron/src/renderer/components/agent/AgentView.tsx:1733,1735`（`addClipboardTextDraft` 回调内）。测试 import：`apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts:2`。
- 出向：类型 `AgentPendingFile`（`@profer/shared`，`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:1`，字段契约见 `packages/shared/src/types/agent.ts:1773` `isClipboardDraft`）；运行时 API 仅 `TextEncoder`（`:38`）与 `Date` 方法（`:56`）。无 IPC/Worker/动态 import。
- 否定结论检索范围：冻结树 `**/*.{ts,tsx,js}`（含 preload）；`AgentView.tsx:1723` 的 `isClipboardDraft: true` 是对同名字段的手工赋值，非本模块调用者。

## 5. 数据 I/O、读写与副作用

纯函数模块：无模块级状态/缓存/Map，四函数对相同输入恒等输出。副作用仅内存级 `new TextEncoder().encode` 编码计算（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:38`）。无 navigator.clipboard、无 DOM、无 IPC、无文件读写（依据：全文无上述 API 调用语句）；临时文件落盘由调用方 `apps/electron/src/renderer/components/agent/AgentView.tsx:1734` 的 `window.electronAPI.writeClipboardPreview` 承担。

## 6. 分支、失败、取消与恢复

- 边界条件：`enabled=false` 或 `threshold<=0` 恒 false（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:17`）；空文本两长度均 0，达阈值判定自然 false（`:18`）；无扩展名/点开头名不拆 ext（`:24-25`）；同秒时间戳碰撞靠 `-counter` 后缀避免覆盖（`:27-30`，测试 `clipboard-text-attachment.test.ts:15-23` 证实 `-1` 后缀）；size 按 UTF-8 计（中文 3 字节/字，测试 `:11` 断言 16）。
- throw 约定：本文件无显式 throw（全文无 throw 语句）；无状态故无恢复/取消问题；`existingNames` 含重复冲突时循环必然终止（counter 单调递增）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威约定：`sourcePath` 指向的临时文件为待发送长文本的唯一真实数据源，预览/外部编辑后发送端读该路径最新内容（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts:48` 注释）。

## 8. 修改影响面

- `apps/electron/src/renderer/components/ai-elements/rich-text-input.tsx:516`（粘贴长文本是否转附件的门控，影响粘贴行为）。
- `apps/electron/src/renderer/components/agent/AgentView.tsx:1497,1733-1735`（附件唯一命名、长文本转附件链路，含 toast 提示 `apps/electron/src/renderer/components/agent/AgentView.tsx:1757`）。
- `packages/shared/src/types/agent.ts:1773` `isClipboardDraft` 字段语义；文件名格式 `clipboard-YYYYMMDD-HHMMSS` 被 `AgentView.tsx` 预览/发送链路按 `sourcePath` 依赖。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件 `apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts`：机械计数 `test(` = 3、`it(` = 0。真实断言：`apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts:8-12`（`toEqual({ filename: 'clipboard-20260528-123456.md', mediaType: 'text/markdown', size: 16 })`）、`:22`（`toBe('clipboard-20260528-123456-1.txt')`）、`:29-35`（`toMatchObject` 含 `sourcePath` 与 `isClipboardDraft: true`）。`makeUniqueAttachmentName`/`looksLikeMarkdown` 经 `createClipboardTextDraft` 间接覆盖（标"间接"）；`shouldConvertClipboardTextToAttachment` 无断言。断言引用≠运行，不得写"测试通过"。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 个导出符号、命名去重/Markdown 识别/UTF-8 size 语义 | 已证实 | `apps/electron/src/renderer/lib/clipboard-text-attachment.ts:1-70` 全文 |
| 同秒碰撞追加 `-1` 后缀 | 已证实 | `clipboard-text-attachment.test.ts:15-23`（断言文本，非运行） |
| `sourcePath` 为发送时真实数据源 | 已证实 | `apps/electron/src/renderer/lib/clipboard-text-attachment.ts:48` 注释 + `AgentView.tsx:1734` 落盘调用 |
| `looksLikeMarkdown` 8 条正则的逐条准确率 | 未知 | 测试仅覆盖标题命中路径（间接），7 条正则无样本 |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `shouldConvertClipboardTextToAttachment` | §3 | `clipboard-text-attachment.ts:16-19` | unknown（无测试断言） |
| `makeUniqueAttachmentName` | §3,§9 | `clipboard-text-attachment.ts:21-31` | partial（`-1` 后缀间接覆盖，多级递增/无扩展名分支未测） |
| `createClipboardTextDraft` | §3,§9 | `clipboard-text-attachment.ts:33-40` | covered（md/txt 两路径） |
| `createClipboardPendingFile` | §3,§9 | `clipboard-text-attachment.ts:42-52` | covered |
| `formatClipboardTimestamp`（内部） | §3,§9 | `clipboard-text-attachment.ts:54-57` | covered（间接） |
| `looksLikeMarkdown`（内部）8 正则 | §3,§6 | `clipboard-text-attachment.ts:59-70` | partial（仅标题正则命中样本） |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
