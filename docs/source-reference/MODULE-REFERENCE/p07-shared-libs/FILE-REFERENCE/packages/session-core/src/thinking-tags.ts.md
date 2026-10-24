---
path: packages/session-core/src/thinking-tags.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 05ecc2decc4181654274d488cf8da3ed246d4aa8
sha256: fef7e2858d56edb7871c29b59bd89c5fd8d5825dba580485f4129e4d15ed86dd
lines: 64
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/session-core/src/thinking-tags.ts

## 1. 结论与边界

**本文件是 session-core 侧的思考标签拆分实现**（`packages/session-core/src/thinking-tags.ts:1-64`）：兼容部分模型把思考内容包在思考标签（符号 THINK_OPEN_TAG/THINK_CLOSE_TAG）内的返回格式，拆分为 `thinking`/`text` 内容块（`:17-20` 注释）。纯函数、无副作用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `parseThinkTagsFromText` | function（export） | `:21-47` | `(text: string) => SDKContentBlock[]` | 全文本拆块 |
| `splitThinkTagsInTextBlock` | function（export） | `:49-52` | `(block: SDKTextBlock) => SDKContentBlock[]` | 单 text 块拆分 |
| `normalizeThinkTagsInContentBlocks` | function（export） | `:54-64` | `(blocks) => SDKContentBlock[]` | 批量归一 |
| `THINK_OPEN_TAG`/`THINK_CLOSE_TAG` | const（内部） | `:3-4` | 思考标签开/闭字面量（原文见源码 `:3-4`） |
| `appendTextBlock`/`appendThinkingBlock` | function（内部） | `:6-9`/`:11-15` | 空白不入块 | trim 后空即丢 |

## 3. 内部逻辑与关键流程

1. `parseThinkTagsFromText`（`:21-47`）：`lowerText` 供大小写不敏感定位（`:22`、`:27`）；游标循环（`:26-44`）——无开标签 → 尾部进 text 收束（`:28-31`）；开标签前文本进 text（`:33`）；找闭标签（`:36`）：未闭合 → 剩余全部进 thinking（**:37-40，注释 `:19`："未闭合的 在流式阶段按思考块处理，等闭合标签到达后自然拆出后续正文"）；闭合 → thinking 块 + 游标跳过闭标签（`:42-43`）。
2. `splitThinkTagsInTextBlock`（`:50-51`）：小写文本不含开标签 → 原块返回（**快速短路**）。
3. `normalizeThinkTagsInContentBlocks`（`:55-63`）：text 块（`'text' in block` 且为字符串）→ 拆分展开；其余块原样透传。

## 4. 调用者与调用链

- 入向（包外 3 文件）：`apps/electron/src/renderer/components/agent/AgentMessages.tsx`（`parseThinkTagsFromText`）、`components/agent/thinking-tag-parser.ts`（三个函数的渲染层适配）、`components/agent/SDKMessageRenderer.tsx`（`normalizeThinkTagsInContentBlocks`）；包内 `group.ts`（`normalizeThinkTagsInContentBlocks`）；`index.ts` 再导出。
- 测试入向：`components/agent/thinking-tag-parser.test.ts`（经渲染层适配层间接）、`session-core.test.ts`（不经本文件）。
- 出向：`@profer/shared` 类型（`:1`）。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O/状态；确定性。

## 6. 分支、失败、取消与恢复

分支：开/闭标签四态（有开有闭/有开无闭/无开/多段）、空白块丢弃（`:7-8`、`:12-13`）、快速短路（`:50`）。不抛错。不适用取消/恢复。

## 7. 权限与权威状态

无权限分支（纯工具）。

## 8. 修改影响面

改拆分语义 → AgentMessages/SDKMessageRenderer 的思考块展示、`group.ts` 归一、渲染层 `thinking-tag-parser` 适配与其测试。

## 9. 测试证据

- **直接测试：无**（`session-core.test.ts` 未断言本文件）。
- **间接**：`apps/electron/src/renderer/components/agent/thinking-tag-parser.test.ts`（渲染层适配路径）。负向检索：冻结树 `*.test.*` 检索 `parseThinkTagsFromText|normalizeThinkTagsInContentBlocks` → 仅该间接测试命中。
- 未覆盖：未闭合标签、多段、大小写变体。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出 + 4 内部；四态拆分 | 已证实 | 逐行读 `:1-64` |
| 流式未闭合语义（注释） | 已证实（代码行为） | `:37-40` |
| 渲染层适配测试的实际覆盖 | 未知 | thinking-tag-parser.test.ts 未逐条读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 + 拆分四态 | §2/§3 | `:21-64` | covered |
| 内部 4 符号 | §2 | `:3-15` | covered |
| 测试 | §9 | — | covered（间接，NOT_RUN） |
