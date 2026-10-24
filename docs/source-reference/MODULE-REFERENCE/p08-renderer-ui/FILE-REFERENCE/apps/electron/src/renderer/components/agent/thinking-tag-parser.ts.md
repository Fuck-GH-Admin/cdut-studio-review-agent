---
path: apps/electron/src/renderer/components/agent/thinking-tag-parser.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 732978a6c8ab85eda4061ac6ad8ae8a2c20afdbe
sha256: 47bb6c62ac29f548a15a92d21cc94314734b4f2991ad170fc656b93206409477
lines: 98
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/agent/thinking-tag-parser.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

思考标签解析（98 行）：兼容部分模型把思考包在 `<think>`/`<thinking>` 内（头注 :1-4）；**未闭合标签流式阶段按思考块**，闭合标签到达后自然拆出正文；终态可用 `unclosedTagAsText` 兜底（注释 :37-43——遗留开标签时正文不应被折叠进思考区）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ThinkTagParserOptions` | interface | 38-43 | `unclosedTagAsText?` |
| `parseThinkTagsFromText` | fn | 45-82 | 文本→`SDKContentBlock[]` |
| `splitThinkTagsInTextBlock` | fn | 84-87 | 含开标签才拆，否则原样 |
| `normalizeThinkTagsInContentBlocks` | fn | 89-98 | 批量归一（text 块拆分，其余透传） |

内部：`THINK_TAG_NAMES=['think','thinking']`（:3）、`findNextThinkOpenTag`（:7-17，取最早开标签）、`containsThinkOpenTag`（:19-21）、`appendTextBlock/appendThinkingBlock`（:23-30，空白块丢弃）。

## 3. 内部逻辑与关键流程

`parseThinkTagsFromText`：小写镜像定位（大小写不敏感）；开标签前文本→text 块；找闭标签→thinking 块+游标后移；未闭合→按 `unclosedTagAsText` 决定 text/thinking 后终止。

## 4. 调用者与调用链

入向：消息渲染管线（SDKMessageRenderer 侧，全树 grep）。出向：`@profer/shared` 类型（:1）。

## 5. 数据 I/O、读写与副作用

纯函数。

## 6. 分支、失败、取消与恢复

无 throw；空文本/纯空白块跳过。

## 7. 权限与权威状态

- 呈现诚实权威：终态未闭合标签不得把正文错折叠进思考区（:37-43 兜底语义）。无 sender/role 检查。

## 8. 修改影响面

思考块/正文拆分展示。同测：`thinking-tag-parser.test.ts`（5 用例）。

## 9. 测试证据

直接测试 `thinking-tag-parser.test.ts`（5 用例 / 1 describe；纯函数；NOT_RUN）：
1. `:6-13` `<thinking>…</thinking>`+正文 → thinking+text 两块。
2. `:15-21` 流式未闭合 → 剩余为 thinking 块。
3. `:23-31` 终态未闭合+`unclosedTagAsText` → 剩余为 text。
4. `:33-41` 终态完整标签+兜底 → 仍拆 thinking/text。
5. `:43-51` `<think>` 旧格式兼容。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号/行号 | 已证实 | 逐行核对 |
| 未闭合双语义/兼容旧标签 | 已证实 | 测试族逐条 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `parseThinkTagsFromText` | §3/§9 | 45-82 | covered |
| `splitThinkTagsInTextBlock`/`normalize…` | §2/§9 | 84-98 | covered |
| `unclosedTagAsText` 双分支 | §3/§9 | 38-82 | covered |
