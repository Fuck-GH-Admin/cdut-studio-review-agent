---
path: apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 184a9cf59a3fe67d30f4b7252fafed587397a105
sha256: 3699cc14ba605bb465fb778b61caed0b5bae788e3bd5fa5fe5ccdac9abdf3520
lines: 37
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts

## 1. 测试目标

验证长文本粘贴转附件的草稿元数据契约（`apps/electron/src/renderer/lib/clipboard-text-attachment.ts`）：Markdown 长文本生成可编辑 Markdown 文件元数据（文件名/mediaType/size）、同秒同名草稿追加序号避免覆盖、落盘后 `sourcePath` 成为发送时真实数据源（`isClipboardDraft: true`）。3 个用例全同步，固定 `Date` 注入无时序依赖。

## 2. 用例清单

机械计数：`test(` = 3、`it(` = 0、`describe(` = 1（grep `^\s*(it|test|describe)\(` 于 `apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts`），与下表一致（行号 = `apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts:<行>`）：

- describe「长文本粘贴附件」（`:4`）：`:5` Given Markdown 长文本 When 转为草稿文件 Then 使用可编辑的 Markdown 文件元数据；`:15` Given 同一秒内已有同名草稿 When 再次转为草稿文件 Then 文件名追加序号避免覆盖；`:25` Given 草稿文件已经落盘 When 创建待发送附件 Then sourcePath 成为发送时的真实数据源。

## 3. 真实断言

- `apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts:8-12`：`expect(draft).toEqual({ filename: 'clipboard-20260528-123456.md', mediaType: 'text/markdown', size: 16 })`（对象全等断言；size=16 为 `'# 标题\n\n内容'` 的 UTF-8 字节数）。
- `:22`：`expect(draft.filename).toBe('clipboard-20260528-123456-1.txt')`（同秒同名碰撞追加 `-1`，纯文本走 `.txt`）。
- `:29-35`：`expect(pending).toMatchObject({ id: 'pending-1', filename: 'clipboard-20260528-123456.txt', mediaType: 'text/plain', sourcePath: '/tmp/profer-preview/clipboard-20260528-123456.txt', isClipboardDraft: true })`。

## 4. 未覆盖与脆弱点

- 未覆盖（检索范围：本文件全文 + 冻结树 `**/*.test.ts` grep `shouldConvertClipboardTextToAttachment|makeUniqueAttachmentName`）：`shouldConvertClipboardTextToAttachment` 无任何断言（enabled/threshold 门控、双长度判定均未测）；`looksLikeMarkdown` 的 8 条正则仅标题 1 条命中样本（`:6`），围栏代码/表格/front matter/引用/列表/链接 7 条未测；`makeUniqueAttachmentName` 多级递增（`-2`、`-3`）与无扩展名分支（`dotIdx<=0`）未测。
- 脆弱点：`:11` 的 `size: 16` 与 `'# 标题\n\n内容'` 的 UTF-8 编码字节数硬耦合（中文每字 3 字节），文本或编码改动会打破；`:6,:19,:26` 三处固定 `new Date('2026-05-28T12:34:56')` 注入（本地时区解析，跨时区跑 `getFullYear` 等本地取值可能产生偏移，文件名断言依赖运行机时区）。全同步无异步竞态。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 用例、断言行如 §3 所列 | 已证实 | 机械计数 + `apps/electron/src/renderer/lib/clipboard-text-attachment.test.ts:5-36` |
| md/txt 双路径元数据与 `-1` 去重 | 已证实 | `clipboard-text-attachment.test.ts:8-12,22`（断言文本） |
| 固定 Date 注入的跨时区稳定性 | 未知 | NOT_RUN，无多时区运行数据 |
| 测试实际运行结果 | 未知 | NOT_RUN（本轮未运行测试，纯静态阅读） |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `createClipboardTextDraft` md 路径 | §2,§3 | `clipboard-text-attachment.test.ts:5-13` | covered |
| `createClipboardTextDraft` txt 路径 + 同秒去重 | §2,§3 | `clipboard-text-attachment.test.ts:15-23` | covered |
| `createClipboardPendingFile` | §2,§3 | `clipboard-text-attachment.test.ts:25-36` | covered |
| `makeUniqueAttachmentName` 多级递增/无扩展名 | §4 | — | unknown |
| `shouldConvertClipboardTextToAttachment` | §4 | — | unknown |
| `looksLikeMarkdown` 其余 7 正则 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
