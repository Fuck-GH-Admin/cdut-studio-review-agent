---
path: apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-revision-read.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8cee844fd71c68311ef36ec1f928004936d50073
sha256: 070f4ef56d373295405125dbc8852f404e1386e923f7c3690052fd6bc66ba5bf
lines: 106
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-revision-read.ts

## 1. 结论与边界

**Dev-B author 修订读取消费者**（`apps/electron/src/renderer/components/review-v3-dev-b/review-v3-author-revision-read.ts:1-6`）：**此处不派生 Main 权威**；只验证不受信传输形状——C Main 读端口必须**认证 session/frame/Owner、验证磁盘全修订链、返回新鲜副本**。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `B1CandidateReadResponse` | interface | `:10-17` | `{schemaVersion:'review-b1-author-read/1', templateId, …}` |
| `B1CandidateReadPreview` | interface | `:18-32` | 预览形状 |
| `prepareB1CandidateReadPreview` | 函数 | `:33-78` | 准备预览 |
| `assertB1CandidateReadAdoption` | 函数 | `:79-98` | 采纳断言（**同 revision+digest+全文一致**，ABA/重写 fail closed） |
| `assertB1CandidateBackupConfirmation` | 函数 | `:99-106` | 备份确认断言 |

## 3. 内部逻辑与关键流程

- `prepareB1CandidateReadPreview`（`:33-78`）：验证传输形状（非权威）。
- `assertB1CandidateReadAdoption`（`:79-98`）：显示快照仅预览——**接受前 C Main 必须重读实际 author 链**（`:35-39` 注释）；同 revision+digest+完整文档三同，否则 fail closed。
- `assertB1CandidateBackupConfirmation`（`:99-106`）：备份确认（配合 author-resume 纯净白名单）。

## 4. 调用者与调用链

- 消费方：`review-v3-author-resume`。
- 出向：`review-v3-author-diff`（`diffB1AuthorDocuments`，`:8`）。

## 5. 数据 I/O、读写与副作用

纯形状验证；读经 C Main 端口（`:3-5`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 形状非法 | `:33-78` | 抛 |
| ABA/重写 | `:79-98` | fail closed |

## 7. 权限与权威状态

**不派生 Main 权威**（`:3`）；C Main 认证/验证/新鲜副本（`:4-5`）；ABA 防御（`:38-39`）。

## 8. 修改影响面

- 传输形状契约；三同校验（revision/digest/文档）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个导出、ABA 防御 | 已证实 | `:1-106` |
| 测试实际通过 | 未知 | 无测试 |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 5 个导出 | `:10-106` | covered |
