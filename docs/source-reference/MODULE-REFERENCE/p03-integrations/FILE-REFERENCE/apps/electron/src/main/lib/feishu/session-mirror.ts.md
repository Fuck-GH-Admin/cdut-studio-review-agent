---
path: apps/electron/src/main/lib/feishu/session-mirror.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d52a632a0ba84b8018eeb6794cc96b1a40f1cd5d
sha256: 048c637c90b7569db854f36c0144d189a3e7a9589a80e6009a200ed8ef44c0b7
lines: 39
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/session-mirror.ts

## 1. 结论与边界

飞书**会话镜像设置**纯函数（`apps/electron/src/main/lib/feishu/session-mirror.ts`）：镜像模式归一（off/stream）、镜像 Bot 解析、镜像群命名。默认 `mode:'off'`（`:6`）。

边界：stream 模式必须有 botId 且 Bot **enabled+appId+appSecret 齐全**才解析成功（`:22`）；群名截断 60（57+`...`，`:36-38`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DEFAULT_FEISHU_SESSION_MIRROR` | const | 6 | `{mode:'off'}` | |
| `normalizeFeishuSessionMirrorSettings` | function | 8-14 | 非 stream 一律归 'off'；stream 保留 botId | |
| `resolveSessionMirrorBot` | function | 16-24 | `(settings, bots) => FeishuBotConfig\|null` | 四条件缺一即 null |
| `buildSessionMirrorGroupName` | function | 26-31 | `Profer - {title}`；标题空/'新 Agent 会话' → `新会话 {id8}` | |

内部：`truncateGroupName`（`:33-38`）。

## 3. 内部逻辑与关键流程

`resolveSessionMirrorBot`（`:16-24`）：归一化→off/无 botId→null→按 id 查找→`enabled+appId+appSecret` 缺一即 null（fail-safe 不半开）。

## 4. 调用者与调用链

出向：`@profer/shared`（3 类型，`:1-5`）。入向（检索=符号名+模块名，全冻结树）：`feishu-bridge-manager.ts:20,134,153`（resolveSessionMirrorBot）、`feishu-bridge.ts:81,515,558,1149`（buildSessionMirrorGroupName）；`DEFAULT_FEISHU_SESSION_MIRROR`/`normalizeFeishuSessionMirrorSettings` **无生产调用**（仅自用+测试）。产品链：feishu-bridge-manager ← main/index.ts:235、main/ipc.ts:448。⚠ 碰撞：'session-mirror' 字符串字面量（binding.source 判别）多处命中非模块引用。测试：本批 session-mirror.test（5 test）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

失败=null（不抛）；无异步。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

Bot 解析四条件改动影响镜像会话建立；群名 60 上限为飞书 API 契约。

## 9. 测试证据

`feishu/session-mirror.test.ts`（本批 61 行，断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四条件 fail-safe | 已证实 | `:16-24` |
| 群名截断 60 | 已证实 | `:36-38` |
| 真实飞书 API 行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 导出 | §2 | 6-31 | covered |
