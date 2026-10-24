---
path: apps/electron/src/main/lib/feishu/group-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3609491908593a9e54d666f9fb2a79647d083e20
sha256: dfd43266452d56ae07352b573e9258675d24f200bd18f729e1f3d7d7ac002276
lines: 173
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/group-utils.ts

## 1. 结论与边界

飞书群聊辅助工具函数（`apps/electron/src/main/lib/feishu/group-utils.ts:1-5`）：从 feishu-bridge.ts 提取的群聊纯函数/工具（缓存 TTL、有界去重、mention 提取、群信息/成员/用户名拉取、@Bot 检测）。**死模块事实（照实记录）**：本模块**全树零 import**（8 导出全部零外部引用）——feishu-bridge.ts 保留**私有同名副本**实际服务产品链（`GROUP_CACHE_TTL` bridge:191/`DEDUP_MAX`:199/`addToDedup`:2003/`extractMentionOpenId`:2018/`fetchGroupMembers`:2123）；本文件 4 导出（addToDedup/fetchGroupInfo/fetchUserName/isBotMentionedWithId）连模块内也无调用点。

边界：群成员拉取上限 100 人（`:84`）；botOpenId 未获取时**跳过消息不精确匹配**（fail-safe，`:168-170`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GROUP_CACHE_TTL` | const | 8 | 1 小时 |
| `DEDUP_MAX` | const | 11 | 2000 |
| `addToDedup` | function | 14-20 | 有界去重（超限淘汰最旧） |
| `extractMentionOpenId` | function | 23-28 | mention.id 字符串/对象双形态 |
| `fetchGroupInfo` | function | 31-81 | chat.get+成员并发、user_count 缺失 warn（权限提示文案 `:56-59`） |
| `fetchGroupMembers` | function | 84-98 | chatMembers.get ≤100 人 |
| `fetchUserName` | function | 101-123 | contact.user.get+缓存、失败回退 `openId.slice(0,8)` |
| `isBotMentionedWithId` | function | 128-173 | @Bot 检测+**延迟获取 Bot open_id**（bot/v3/info） |

## 3. 内部逻辑与关键流程

- `fetchGroupInfo`（`:31-81`）：TTL 缓存→chat.get+fetchGroupMembers 并发→user_count 归一（缺失 warn 提示 im:chat 权限）→成员名写入 userNameCache。
- `isBotMentionedWithId`（`:128-173`）：mention 提取（排除 'all'）→botOpenId 缺失时延迟拉取→精确匹配→未获取则 warn+跳过。

## 4. 调用者与调用链

出向：`@profer/shared`（3 类型，`:6`）。入向（检索=符号名+模块名 `group-utils`，全冻结树）：**NO_CALLER_FOUND——模块全树零 import**（死模块）；私有同名副本在 feishu-bridge.ts 实际被调（碰撞警示见 §1）。`remote-service.ts` 的 `SEND_MESSAGE_DEDUP_MAX` 为子串误命中（不同符号）。

## 5. 数据 I/O、读写与副作用

飞书 API 三接口（chat.get/chatMembers.get/contact.user.get+bot/v3/info）——但**无生产调用路径**；console.warn/log。

## 6. 分支、失败、取消与恢复

API 失败均 warn+空值/回退（fail-safe）；botOpenId 未获取→跳过消息（`:168-170`）。

## 7. 权限与权威状态

本文件不适用（无权限代码）；user_count 权限提示文案（`:56-59`）与 group-message-policy 口径一致。

## 8. 修改影响面

死模块（无生产影响）；若未来接线须与 feishu-bridge.ts 私有副本去重。

## 9. 测试证据

**无任何测试**（0 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| **死模块**（全树零 import） | 已证实（检索式见 §4，全冻结树） | caller 图 |
| 与 bridge 私有副本并存（5 同名符号） | 已证实 | caller 图碰撞清单 |
| user_count 权限提示 | 已证实 | `:56-59` |
| botOpenId 缺失跳过 | 已证实 | `:168-170` |
| **零测试** | 已证实 | caller 图 |
| 接线后行为 | 未知 | 未接线 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 8 导出 | §2 | 8-173 | covered |
| 缓存/拉取/检测 | §3 | 31-173 | covered |
| 消费面 | §4 | — | covered（死模块结论） |
