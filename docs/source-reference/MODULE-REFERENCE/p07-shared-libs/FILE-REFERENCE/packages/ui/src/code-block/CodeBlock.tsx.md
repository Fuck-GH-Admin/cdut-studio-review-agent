---
path: packages/ui/src/code-block/CodeBlock.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 68cbc4679ab4124fdb3abe7933f54193c4f80b48
sha256: 8607b993c037f5d36da580f5f02a14feaf495bfa4bc70de8fc3411cf85f8b9f4
lines: 253
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/ui/src/code-block/CodeBlock.tsx

## 1. 结论与边界

**代码块组件**（`packages/ui/src/code-block/CodeBlock.tsx:1-20` 注释）：Shiki 语法高亮 + 语言标签 + 复制按钮，供 react-markdown 的 `pre` 自定义渲染。流式策略（类 Cherry Studio）：`highlightToTokens` 结构化 token 逐行渲染（`:8`）、稳定行级 key（`:9`）、80ms 节流（`:10`）、首挂异步初始化后全同步（`:11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CodeBlock` | function（export） | `:140-253` | `({children, headerActions?, bodyOverride?}) => JSX` | 唯一导出 |
| `CodeElementProps` | interface（内部） | `:27-30` | `{ className?; children? }` | react-markdown code props |
| `CodeBlockProps` | interface（内部） | `:32-39` | children/headerActions/bodyOverride | bodyOverride 整体替换代码区 |
| `extractText` | function（内部） | `:47-56` | 递归取纯文本 | 处理数组/元素 |
| `extractCodeInfo` | function（内部） | `:59-83` | `(children) => {language, code}` | 识别 code 子元素 |
| `CodeLine` | component（内部，memo） | `:111-128` | `({tokens, rawLine})` | 单行渲染 + token 未覆盖尾部兜底 |
| `THROTTLE_MS`/`ICON_ATTRS`/`copyIconPath`/`checkIconPath` | const（内部） | `:42`、`:87-100` | 80ms / 图标 | — |

## 3. 内部逻辑与关键流程

1. `extractCodeInfo`（`:59-83`）：在 children 中找 code 元素——type 为 `'code'` 字符串（react-markdown v9）或函数/对象组件（v10+），过滤其他原生元素防误认（`:60-70` 注释+`:64-70`）；`language-<x>` 正则取语言（`:77`）；无 code 元素回退 `extractText(children)`（`:72-74`）。
2. `CodeLine`（`:111-128`）：token 逐个 span（key=index，`:118`）；`tokenLen < rawLine.length` 时补尾部纯文本（流式中 token 未覆盖，`:122-125`）；`React.memo` 防稳定行重渲（`:111`）。
3. **节流高亮 effect**（`:158-191`）：`highlightToTokens` 同步结果可用时——距上次 ≥80ms 立即更新（`:174-177`），否则排 `setTimeout(THROTTLE_MS-elapsed)` 单例延迟（`:178-184`）；同步不可用（高亮器未初始化）→ `onHighlighterReady` 订阅，就绪后补一次（`:188-190`）。
4. 定时器清理（`:194-198`）；复制（`:201-209`）：`navigator.clipboard.writeText(trimmedCode)`，成功 2s 的"已复制"态，失败 `console.error`。
5. 渲染（`:211-252`）：头部栏（语言 `getDisplayName(language)` `:215`、`headerActions` `:217`、复制按钮 `:218-225`，整条 `select-none` `:214`）；`bodyOverride ??` 逐行 `<pre>`（`:230-250`）：`tokenResult.fgColor` 兜底 `#e1e4e8`（`:234`）、行 key=index（`:240`）、行间 `'\n'`（`:241`）。

## 4. 调用者与调用链

- 入向：`packages/ui/src/code-block/index.ts:7`、`packages/ui/src/index.ts:8` 再导出；包外 2 文件：`ai-elements/message.tsx`（消息代码块）、`settings/ReleaseNotesViewer.tsx`。
- 出向：`@profer/core/highlight` 的 `getDisplayName/highlightToTokens/onHighlighterReady`（`:23`）与类型（`:24`）、React、`navigator.clipboard`。

## 5. 数据 I/O、读写与副作用

- 读：children（React 节点）→ 文本；写：`navigator.clipboard`（用户复制）。
- 副作用：`setTimeout` 节流（`:180`）、`onHighlighterReady` 订阅/退订（`:189-190`）、console.error（`:207`）。
- 状态：`copied`/`tokenResult` + 3 个 ref（pendingCode/timer/lastUpdate）。无持久化。

## 6. 分支、失败、取消与恢复

- 分支：code 元素识别两代兼容（`:64-70`）、节流立即/延迟（`:174-184`）、高亮器未就绪订阅（`:188-190`）、token 尾部兜底（`:123-125`）、`bodyOverride` 替换（`:230`）。
- 失败：复制失败仅日志（`:206-208`）；`highlightToTokens` 返回 null 走订阅兜底；`extractCodeInfo` 无 code 元素回退全文提取。
- 取消/恢复：卸载清定时器（`:194-198`）；订阅 cleanup 退订（`:190`）。

## 7. 权限与权威状态

无权限分支（纯展示）；复制受浏览器剪贴板权限约束（失败即日志）。

## 8. 修改影响面

改 token 渲染/节流 → 2 个消费者流式代码块观感；改 `extractCodeInfo` 的 v9/v10 兼容 → react-markdown 升级回归；`headerActions/bodyOverride` 契约 → `message.tsx` 的 HTML 渲染切换等扩展。无直接测试（§9）。

## 9. 测试证据

无直接测试（负向：冻结树 `apps/`+`packages/` 全部 `*.test.*` 检索 `CodeBlock` → 0 专属命中）。未覆盖：extractCodeInfo 两代兼容、节流时序、onHighlighterReady 兜底、bodyOverride、复制态。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出 + 6 内部符号；节流/兜底/复制全分支 | 已证实 | 逐行读 `:1-253` |
| react-markdown v9/v10 双兼容识别 | 已证实 | `:60-70` |
| 唯一导出且 2 外部消费者 | 已证实（负向检索） | 全树检索 |
| Shiki 高亮器初始化时序 | 未知 | `@profer/core/highlight` 跨批未读 |
| 节流观感 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CodeBlock` 全流程 | §3 | `:140-253` | covered |
| 内部 6 符号 | §2 | `:27-128` | covered |
| 节流/兜底/清理 | §3/§6 | `:158-198` | covered |
| 调用链 | §4 | 两侧行号 | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
