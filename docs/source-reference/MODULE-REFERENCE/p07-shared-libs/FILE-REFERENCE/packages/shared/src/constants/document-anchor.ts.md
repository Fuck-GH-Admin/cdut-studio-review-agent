---
path: packages/shared/src/constants/document-anchor.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c8dca8f94a7eca744c1ca55c6179935857622f8
sha256: 7c28f643ce3801e5c9a6a7b58cbf1905560a998da37a91c3ff6ff4235d83e207
lines: 21
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/document-anchor.ts

## 1. 结论与边界

双轨定位锚点语法的**单一事实源**：两个正则模式串（锚定匹配 + 文内扫描）与统一 flag，供主进程系统提示词与渲染进程胶囊解析共用，避免提示词契约与前端口径各自演进静默漂移（`packages/shared/src/constants/document-anchor.ts:1-5`）。21 行薄文件：3 个常量、无函数。

边界：不含解析/渲染实现（渲染层包装 `apps/electron/src/renderer/lib/document-anchor.ts` 加图标推断；提示词组装在 `apps/electron/src/main/lib/agent-prompt-builder.ts`）；锚点语法（`#f1:p1-b11` 等 9 形态）由模式串定义，语法说明见 `:7-8` 注释。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DOCUMENT_ANCHOR_PATTERN` | const | 13-14 | 字符串模式（`^#(?:([a-zA-Z]+\d+)[:\-])?(p(\d+)(?:-(?:b\d+\|tbl\d+\|r\d+\|c[a-zA-Z]+\d+(?::[a-zA-Z]+\d+)?\|[a-zA-Z]+\d+:[a-zA-Z]+\d+))?)$`） | 锚定（`^…$`），3 捕获组：1=文件标识、2=页+块后缀、3=页码 |
| `DOCUMENT_ANCHOR_IN_TEXT_PATTERN` | const | 17-18 | 同语义非锚定（无 `^$`，`p\d+` 外层不再可选） | 裸锚点提取 |
| `DOCUMENT_ANCHOR_PATTERN_FLAGS` | const | 21 | `'i'` | 大小写不敏感 |

导出计数：const 3。无函数/类型/内部符号。

## 3. 内部逻辑与关键流程

本文件不适用（无逻辑）——依据：3 行常量声明。但有**结构性约定**：可选量词 `?` 挂在块后缀组 `(?:-(?:…))?` 而非外层 `(p…)` 组——注释明示否则纯页面锚点（`#f1:p2`）整体失配、全部退化为死链接（`:10-11`）。块后缀 5 形态：`b\d+`（块）、`tbl\d+`（表）、`r\d+`（行）、`c[a-zA-Z]+\d+(?::[a-zA-Z]+\d+)?`（单元格/范围）、`[a-zA-Z]+\d+:[a-zA-Z]+\d+`（无 c 前缀范围）。

## 4. 调用者与调用链

出向：无 import。入向（grep 全冻结树）：

- 渲染层包装：`apps/electron/src/renderer/lib/document-anchor.ts:7-11,18,21`——`DOCUMENT_ANCHOR_RE = new RegExp(DOCUMENT_ANCHOR_PATTERN, DOCUMENT_ANCHOR_PATTERN_FLAGS)`（`:18`）、`DOCUMENT_ANCHOR_IN_TEXT_RE`（`:21`）。包装的消费者：`apps/electron/src/renderer/components/ai-elements/message.tsx:31,536`（对话流胶囊）、`apps/electron/src/renderer/components/cdut-zone/ai-class-tabs/StudySourceTrace.tsx:16,18`（速课堂溯源胶囊）。
- 主进程提示词：`apps/electron/src/main/lib/agent-prompt-builder.ts:16,94`——`DOCUMENT_ANCHOR_PATTERN` 内嵌进系统提示词的 Anchor Grammar 段（`` \`${DOCUMENT_ANCHOR_PATTERN}` ``，`:94`）。
- 间接测试：`apps/electron/src/renderer/lib/document-anchor.test.ts:2,7`（`expect(DOCUMENT_ANCHOR_RE.source).toBe(DOCUMENT_ANCHOR_PATTERN)`——锁定包装不改源串）、`apps/electron/src/main/lib/agent-prompt-builder.test.ts:2,1013`（`expect(prompt).toContain(DOCUMENT_ANCHOR_PATTERN)`——提示词含同一模式）。
- 相关但**非**本文件消费：IPC 名 `file:resolve-document-anchor`（`apps/electron/src/main/ipc.ts:5118`、`apps/electron/src/preload/index.ts:3441`）是通道字符串，与本文件无 import 关系（防混淆，照实记录）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：常量声明，无 I/O/副作用；正则构造在消费方。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：无分支/异常。模式串的匹配行为（失配即死链接）见 `:10-11` 注释与测试篇。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。契约权威：「单一事实源」由两处消费测试锁（`document-anchor.test.ts:7`、`agent-prompt-builder.test.ts:1013`）。

## 8. 修改影响面

- 改任一模式串：提示词（`agent-prompt-builder.ts:94`）与渲染解析（`document-anchor.ts:18,21`）必须同步；两处间接测试会红（`:7` source 相等、`:1013` prompt 含串）；锚点失配直接导致胶囊死链（`:10-11` 注释的历史事故面）。
- 改 FLAGS：影响大小写语义（`#F1` 等）；无直接断言（见测试篇）。

## 9. 测试证据

本批直接测试 `packages/shared/src/constants/document-anchor.test.ts`（见该篇：14 运行时用例/3 调用点，9 合法 + 4 非法 + 文内提取 1）。间接：`apps/electron/src/renderer/lib/document-anchor.test.ts:2,7`（包装 source 相等）、`apps/electron/src/main/lib/agent-prompt-builder.test.ts:1013`（提示词含串）。`#f1:p2`（带前缀纯页面）防回归用例缺失——见测试篇 §4。**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 常量与 3 捕获组结构 | 已证实 | `:13-21` |
| 量词挂载位置约定（防 `#f1:p2` 失配） | 已证实（注释+模式串逐字符核对） | `:10-14` |
| 提示词与前端共用同一模式（双锁定） | 已证实 | `agent-prompt-builder.ts:94`、`renderer/lib/document-anchor.ts:18` + 两测试 |
| 块后缀 5 形态 | 已证实 | `:14` |
| `file:resolve-document-anchor` IPC 与本文件无关 | 已证实 | grep：无 import 关系 |
| 模式串对 9 形态全接受 | 已证实（测试用例存在）/NOT_RUN | `document-anchor.test.ts:12-27` |
| 运行时真实锚点分布 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DOCUMENT_ANCHOR_PATTERN` | §2, §3 | 13-14 | covered |
| `DOCUMENT_ANCHOR_IN_TEXT_PATTERN` | §2 | 17-18 | covered（单测试例） |
| `DOCUMENT_ANCHOR_PATTERN_FLAGS` | §2 | 21 | partial（无直接断言） |
| 量词挂载约定 | §3 | 10-11 | covered（注释级） |
