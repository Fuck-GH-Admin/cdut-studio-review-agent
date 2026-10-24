---
path: packages/shared/src/utils/agent-image-attachment.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 77f0e09b7744ed9b22a7cb06abce6105dbc272f9
sha256: 603757be7c9caac34213a33580acdbf222780092d81ad9ee297c7a4bdb839259
lines: 32
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/agent-image-attachment.test.ts

## 1. 测试目标

验证 `packages/shared/src/utils/agent-image-attachment.ts`：纯图片默认任务指令注入、用户文字优先、混合/非图片附件保持「查看附件」语义、MIME 图片判定。bun:test（`:1`），3 符号经相对导入（`:2-6`）。NOT_RUN，只读断言。

## 2. 用例清单

共 **4 个 `test(`**（1 个 `describe`，Given/When/Then 命名）：

| # | 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 9 | 仅图片且无文字 → 要求读图并推断任务 | `('', ['image'])`、`('   ', ['image','image'])` | `resolveAgentAttachmentPrompt` + 常量文本 3 处 `toContain` | 独立 |
| 2 | 17 | 用户提供文字 → 保留用户任务 | `('提取图片里的表格', ['image'])` | resolve | 独立 |
| 3 | 21 | 非图片或混合附件且无文字 → 查看附件语义 | `('', ['file'])`、`('', ['image','file'])` | resolve | 独立 |
| 4 | 26 | MIME type 图片识别 | `image/png`、`IMAGE/WEBP`、`application/pdf`、`undefined` | `isImageAttachmentMediaType` | 独立 |

## 3. 真实断言

- `:10` `expect(resolveAgentAttachmentPrompt('', ['image'])).toBe(DEFAULT_IMAGE_ATTACHMENT_PROMPT)`。
- `:11` 空白文字+双 image `.toContain('立即使用 Read 工具读取所有图片')`。
- `:12-14` 常量文本 `.toContain('结合当前对话上下文、用户近期目标和图片内容')`、`.toContain('不要将“描述图片”作为默认目标')`、`.toContain('仅当上下文和图片内容均不足以可靠推断任务时')`。
- `:18` `toBe('提取图片里的表格')`。
- `:22-23` 2× `toBe('请查看上面附加的文件。')`。
- `:27-30` `toBe(true)`、`toBe(true)`（大小写不敏感）、`toBe(false)`、`toBe(false)`。

## 4. 未覆盖与脆弱点

- `resolveAgentAttachmentPrompt` 的「无附件 → `''`」分支（源 `:24`）无用例；有文字时 trim 行为（源 `:22-23` 返回 trim 后文本）无用例（`' 提取 '` 形态未测）。
- `isImageAttachmentMediaType('')` 无用例；`'image/'` 前缀语义（`image/png.exe` 会命中）未测。
- 文本断言用 `toContain` 锁定关键句而非全文——重排默认指令不红，删句才红（脆弱点定位）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例结构与断言清单 | 已证实 | `:8-31` |
| 混合附件不注入读图指令 | 已证实 | `:21-24` |
| MIME 大小写不敏感 | 已证实 | `:28` |
| 空附件/trim 分支无用例 | 已证实（核对用例清单） | 源 `:22-24` 无对应 |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测符号/分支 | 手册章节 | 用例 # | 状态 |
| --- | --- | --- | --- |
| `resolveAgentAttachmentPrompt`（文字/全 image/混合） | §2/§3 | 1-3 | covered |
| `resolveAgentAttachmentPrompt`（空附件/trim） | §4 | — | unknown |
| `DEFAULT_IMAGE_ATTACHMENT_PROMPT` 关键句 | §2/§3 | 1 | covered（toContain 级） |
| `isImageAttachmentMediaType` | §2/§3 | 4 | partial（空串/伪装前缀未测） |
