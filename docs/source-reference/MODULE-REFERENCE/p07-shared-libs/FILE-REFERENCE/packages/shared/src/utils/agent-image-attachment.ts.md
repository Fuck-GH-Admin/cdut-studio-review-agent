---
path: packages/shared/src/utils/agent-image-attachment.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ac3a76a4f8efce4a9d0b9f10d805f8c214184bea
sha256: 986aafbce5e9a80a58b8c04e89f61a2490c26bcf44073b087778c9adf2853efb
lines: 32
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/agent-image-attachment.ts

## 1. 结论与边界

Agent 图片附件的**默认任务文本策略**：纯图片无文字时注入「读图并结合上下文推断任务」的默认指令；用户给了文字则文字优先；非图片附件维持「查看附件」语义（`packages/shared/src/utils/agent-image-attachment.ts:1-6,11-17`）。32 行薄模块：1 类型 + 1 常量 + 2 纯函数。

边界：不构造消息、不做附件上传——只决定「有效用户任务文本」；拼接 `<attached_files>` 块在消费方（`apps/electron/src/main/lib/bridge-command-handler.ts:696-698`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `AgentAttachmentKind` | type | 7 | `'image' \| 'file'` | |
| `DEFAULT_IMAGE_ATTACHMENT_PROMPT` | const | 9 | 模板字符串（中文指令，约 200 字） | 要求「立即使用 Read 工具读取所有图片」并推断任务，禁止默认「描述图片」/先反问 |
| `resolveAgentAttachmentPrompt` | function | 18-27 | `(text: string, attachmentKinds: readonly AgentAttachmentKind[]) => string` | 有效任务文本 |
| `isImageAttachmentMediaType` | function | 30-32 | `(mediaType: string \| undefined) => boolean` | `!!mediaType && mediaType.toLowerCase().startsWith('image/')` |

导出计数：type 1 + const 1 + function 2。

## 3. 内部逻辑与关键流程

`resolveAgentAttachmentPrompt`（`:18-27`）顺序：

1. `:22-23` `text.trim()` 非空 → 原样返回用户文字（严格保留用户任务，不 trim 返回？——返回的是 `userText` 即 trim 后文本，注意：有文字时返回的是**trim 后**的文本，`' 提取 '` → `'提取'`，已证实行为）。
2. `:24` 无附件（`attachmentKinds.length === 0`）→ `''`。
3. `:25` **全部**为 `image`（`every`）→ `DEFAULT_IMAGE_ATTACHMENT_PROMPT`。
4. `:26` 其它（含 image+file 混合）→ `'请查看上面附加的文件。'`。

`isImageAttachmentMediaType`（`:30-32`）：小写后前缀 `image/`；`undefined`/空串 → false。

## 4. 调用者与调用链

出向：无 import。入向（grep 全冻结树）：

- `apps/electron/src/main/lib/bridge-command-handler.ts:12,700-703`（IM 桥命令）：`resolveAgentAttachmentPrompt(text, attachments?.map(a => a.kind) ?? [])`，结果与 `<attached_files>` 块拼接成 `userMessage`（`:696-704`）。
- `apps/electron/src/main/lib/feishu-bridge.ts:30,1659-1662`（飞书桥）：`resolveAgentAttachmentPrompt(text, [...imageAttachments.map(()=>'image'), ...fileAttachments.map(()=>'file')])`。
- 转导出：`packages/shared/src/utils/index.ts:49-53` → `packages/shared/src/index.ts:8`（包根）。
- `isImageAttachmentMediaType`：grep 全冻结树仅命中定义（`:30`）、测试（`agent-image-attachment.test.ts:27-30`）与 `utils/index.ts:51` 转导出——**未检出生产调用点**（检索范围=冻结树全文该标识符）。
- `DEFAULT_IMAGE_ATTACHMENT_PROMPT` 生产引用仅 `:25`（模块内）；对外经导出供测试。

## 5. 数据 I/O、读写与副作用

无。纯函数 + 常量。

## 6. 分支、失败、取消与恢复

无异常路径（对任意字符串/数组输入均返回字符串）。无取消/恢复概念。空文字+空附件返回 `''`（调用方决定是否仍发消息，`bridge-command-handler.ts:704` 会拼空文本）。

## 7. 权限与权威状态

无权限分支（依据：全文无 sender/role/actor 检查）。默认指令本身不授予权限；Read 工具能否执行由 Agent 权限系统（`agent-permission-service.ts`）判定。

## 8. 修改影响面

- 改默认指令文本：影响两个 IM 桥（bridge-command-handler、feishu-bridge）下用户「只发图」时的 Agent 行为；本批测试对文本有 4 处 `toContain` 断言（§9），会红。
- 改判定顺序（如混合附件也注入读图指令）：`feishu-bridge.ts:1659-1662` 的 kind 组装语义需复核。
- `isImageAttachmentMediaType` 无调用者，改动当前无生产影响（但它是导出 API）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/agent-image-attachment.test.ts`（32 行，4 个 `test(`，Given/When/Then 命名）：

- `:9-15` 仅图片无文字 → `DEFAULT_IMAGE_ATTACHMENT_PROMPT`；空白文字+两个 image → 含「立即使用 Read 工具读取所有图片」；常量文本含「结合当前对话上下文、用户近期目标和图片内容」「不要将“描述图片”作为默认目标」「仅当上下文和图片内容均不足以可靠推断任务时」三断言。
- `:17-19` 有文字 → 原样返回（`'提取图片里的表格'`）。
- `:21-24` `['file']` 与 `['image','file']` 无文字 → `'请查看上面附加的文件。'`（混合不注入读图指令）。
- `:26-31` MIME 判断：`image/png`→true、`IMAGE/WEBP`→true（大小写不敏感）、`application/pdf`→false、`undefined`→false。

缺口：`resolveAgentAttachmentPrompt` 的「无附件 → `''`」分支（`:24`）无断言；有文字时 trim 行为无断言；`isImageAttachmentMediaType('')` 无断言。

**NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四分支优先级（文字 > 无附件 > 全 image > 其它） | 已证实 | `:22-26` |
| 有文字时返回 trim 后文本 | 已证实 | `:22-23`（`userText = text.trim()` 后返回） |
| 混合附件走「查看附件」 | 已证实 | `:25` `every` 语义；测试 `:21-24` |
| 两桥为真实生产调用点 | 已证实 | `bridge-command-handler.ts:700-703`、`feishu-bridge.ts:1659-1662` |
| `isImageAttachmentMediaType` 无生产调用点 | 已证实（否定结论，检索范围=冻结树全文标识符） | grep 仅定义/测试/转导出 |
| MIME 前缀判断对 `image/` 之外的伪装串（如 `image/png.exe`）会命中 | 已证实（前缀语义） | `:31` `startsWith` |
| 真实 IM 会话行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `AgentAttachmentKind`/`DEFAULT_IMAGE_ATTACHMENT_PROMPT` | §2 | 7-9 | covered |
| `resolveAgentAttachmentPrompt` 四分支 | §3 | 18-27 | covered（`:24` 分支无测试） |
| `isImageAttachmentMediaType` | §2, §3 | 30-32 | covered（无生产调用） |
