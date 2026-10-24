---
path: apps/electron/src/main/lib/tutorial-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 58f75e6eb0d6eb7ab2a8383ad24a8f79f86c6719
sha256: 93a07b9d6a88868b7cab5b6701ed1c1d514557ca3e70e57651408feec11233e9
lines: 141
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/tutorial-service.ts

## 1. 结论与边界

教程服务（141 行，头注释 `:1-5`）：读教程 markdown + 创建预填教程的欢迎对话（createConversation→教程去图存附件→user 消息带附件→assistant 欢迎消息→activePath 初始化）。全 catch 返回 null 不抛。

**边界**：对话存储在 `conversation-manager`（跨批）；附件目录在 `config-paths`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getTutorialContent` | 函数（导出） | 34-48 | `() => string \| null` | 教程文本（失败 null） |
| `createWelcomeConversation` | 函数（导出） | 61-141 | `() => ConversationMeta \| null` | 欢迎对话（失败 null） |

内部：`getTutorialFilePath`（`:21-27`）。导出合计 2。

## 3. 内部逻辑与关键流程

1. **getTutorialFilePath**（`:21-27`）：`app.isPackaged` → `join(process.resourcesPath, 'tutorial.md')`（`:23`）；开发 → `join(__dirname, 'resources/tutorial.md')`（build:resources 复制到 dist，`:25-26` 注释）。
2. **getTutorialContent**（`:34-48`）：不存在 → warn+null（`:37-40`）；readFileSync catch → error+null（`:44-46`）。
3. **createWelcomeConversation**（`:61-141`）：
   - 无教程 → null（`:63-66`）。
   - createConversation `'了解 CDUT Studio'`（`:70`）；附件 id=randomUUID，去图片标记 `replace(/!\[.*?\]\(.*?\)\n*/g, '')`（`:80`）写 `<attachmentsDir>/<attachmentId>.md`（`:77`/`:81`）；FileAttachment（`text/markdown`，`:83-89`）。
   - user 消息（`:93-100`，content 为"新用户上手"话术）+ assistant 欢迎消息（`:104-127`，parentId 指 user）——**内含演示账号学工号/密码明文硬编码于源码 `:118`**（照实记录事实，手册不复制凭据值）与内置浏览器演练话术。
   - `updateConversationMeta` `activePath: [user.id, assistant.id]`（`:131-133`）。
   - 外层 catch → error+null（`:137-139`）。

## 4. 调用者与调用链

入向（全冻结树检索 `tutorial-service`）：`main/ipc.ts:249`（`getTutorialContent`+`createWelcomeConversation`）。出向：`node:fs`、`node:path`、`node:crypto`、`electron.app`、`./conversation-manager`、`./config-paths`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

- 读：教程文件（resources）。
- 写：附件 markdown；conversation-manager 三调用（create/append×2/updateMeta）。
- 副作用：console.log/warn/error 四条。

## 6. 分支、失败、取消与恢复

- 教程缺失/读失败 → null（两层降级，`:37-46`/`:63-66`）。
- 创建任一步失败 → catch → null（**不回滚已建对话**——照实：createConversation 成功后写附件失败会残留空对话）。
- 无取消机制。

## 7. 权限与权威状态

无权限分支（不适用）。敏感面（照实）：`:118` 欢迎文案硬编码**演示账号凭据**（学工号/密码）在源码明文；属演示数据说明（`"均为演示用途，不会写入任何真实数据"` `:116`），但值在分发包内可见。不扩散具体值。

## 8. 修改影响面

ipc 教程/欢迎对话入口（首启体验）；附件格式（`text/markdown`）与去图正则影响 AI 读取内容；欢迎文案是用户可见产品文案。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `tutorial-service` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出/四步创建流程/降级链/演示凭据硬编码事实 | 已证实 | `:1-141` 全文逐行 |
| 调用方=ipc.ts:249 | 已证实 | 全树检索（§4） |
| 失败残留空对话 | 已证实（代码路径） | `:68-139` 无回滚 |
| 演示凭据的有效性/归属 | 未知 | 不验证、不扩散 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getTutorialFilePath`/`getTutorialContent` | §3.1-3.2 | 21-48 | covered |
| `createWelcomeConversation` 四步 | §3.3 | 61-141 | covered |
| 演示凭据硬编码面 | §7/§10 | 118 | covered |
