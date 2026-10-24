---
path: packages/core/src/highlight/language-detector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d16db1f692b1b965cc8ab3a1b8f6e7b11b532099
sha256: a818ab12db177fbe5c04745abbc18f27105a8f6f28520751e1b6ad9e341f56b3
lines: 96
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/highlight/language-detector.ts

## 1. 结论与边界

代码语言**自动检测**（`packages/core/src/highlight/language-detector.ts:1-13`）：fenced code block 无显式语言时猜测最可能语言；highlight.js 按需注册 20 常用语言做 `highlightAuto`，**置信度门槛 5**。**Mermaid 不在此识别**——调用方先用 `@profer/ui` 的 `shouldRenderMermaidCodeBlock`（单一真源 `packages/ui/src/mermaid-detection.ts`），未命中再调本函数。仅在 language 为空串时调用；识别失败回退 `'text'`（`:11-12`）。

边界：不注册 Mermaid；hljs 解析异常静默回退（`:91-93`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `detectLanguage` | function | 84-96 | `(code: string) => string` | 唯一导出 |

内部：`ensureRegistered`（`:34-58`，一次性注册 20 语言）、`DETECT_LANGS`（`:61-66`，20 语言子集，与注册表一致）、`RELEVANCE_THRESHOLD=5`（`:69`）。

## 3. 内部逻辑与关键流程

`detectLanguage`（`:84-96`）：空串→`'text'`；`ensureRegistered`（幂等 flag `:33`）；`hljs.highlightAuto(trimmed, DETECT_LANGS)`——`relevance≥5 且 language` 命中→返回语言名；否则/异常→`'text'`。

## 4. 调用者与调用链

出向：`highlight.js/lib/core` + 20 语言子模块（`:15-35`）。入向（检索=符号名+模块名，全冻结树）：`apps/electron/src/renderer/components/ai-elements/message.tsx:42,893`（**唯一产品调用**）+ `highlight/index.ts:18` 转发。无测试。

## 5. 数据 I/O、读写与副作用

模块级可变状态 `registered`（`:33`，一次性注册 flag）；hljs 全局注册表写入（`ensureRegistered`）；无 I/O。

## 6. 分支、失败、取消与恢复

无异常路径（try/catch 静默回退 `'text'`，`:91-93`）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；Mermaid 单一真源权威在 `@profer/ui`（`:6-9` 注释声明分工）。

## 8. 修改影响面

- 注册语言表/门槛改动影响无标注代码块的渲染语言猜测。
- 与 `DETECT_LANGS` 双表须同步（`:60` 注释自认一致性要求）。
- 测试：无本批直接测试（见 §9）。

## 9. 测试证据

无同名测试文件。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 置信度门槛 5+回退 'text' | 已证实 | `:69,84-96` |
| Mermaid 分工（ui 单一真源） | 已证实（注释） | `:6-9` |
| 注册/检测双表一致 | 已证实（人工核对两清单） | `:36-56,61-66` |
| 生产消费者 | 见 UNVERIFIED 补记 | — |
| 真实代码语料准确率 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `detectLanguage` | §2-§3 | 84-96 | covered |
| 注册表 | §3 | 33-66 | covered |
