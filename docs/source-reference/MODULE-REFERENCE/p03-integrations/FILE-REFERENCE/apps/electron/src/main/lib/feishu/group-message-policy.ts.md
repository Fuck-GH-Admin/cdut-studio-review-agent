---
path: apps/electron/src/main/lib/feishu/group-message-policy.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5fdc7920816b2504f7c4c57c232bef311b819467
sha256: 30580dcdf1b4c64a34ccf343857923892e3ca31b4aa4e82894c0caf0d541906e
lines: 70
kind: source
package: p03-integrations
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# apps/electron/src/main/lib/feishu/group-message-policy.ts

## 1. 结论与边界

飞书**群消息准入策略**纯函数（`apps/electron/src/main/lib/feishu/group-message-policy.ts`）：判定群消息是否免 @ 放行。优先级：session-mirror 群 → bot 被 @ → 单人真人群 → 否则 `needs-mention`。单人判定（`:22-32` 注释）：**优先用 chat.get 的 `user_count`**（飞书侧权威真人数量不含机器人，甩掉 botOpenId/成员读取权限依赖）；不可用时回退「成员列表减 bot」。预期口径：「只有 2 人群免 @，多人群谁都要 @（含建群者）」。

边界：binding 归属不符（bindingMismatch）直接 false（`:35-38`）；user_count ≥2 自动回到「必须 @」。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `SingleUserGroupInput` | interface | 6-11 | `{groupInfo; senderOpenId; botOpenId?; binding?}` |
| `GroupMessageAccessInput` | interface | 13-16 | +`isSessionMirrorGroup/isBotMentioned` |
| `GroupMessageAccessResult` | interface | 18-21 | `{accepted; reason: 4 态}` |
| `isSingleUserGroupForSender` | function | 33-59 | 单人判定（主/回退双路径） |
| `resolveGroupMessageAccess` | function | 61-70 | 四级准入判定 |

## 3. 内部逻辑与关键流程

- `isSingleUserGroupForSender`（`:33-59`）：bindingMismatch→false；`user_count===1` 主路径；回退=成员减 bot 后恰 1 人**且是发送者**。
- `resolveGroupMessageAccess`（`:61-70`）：mirror→accepted；@bot→accepted；单人→accepted；否则 `needs-mention`。

## 4. 调用者与调用链

出向：`@profer/shared`（FeishuChatBinding/FeishuGroupInfo，`:1-4`）。入向（检索=符号名+模块名，全冻结树）：`feishu-bridge.ts:82,715`（resolveGroupMessageAccess，**唯一模块引用**）；`isSingleUserGroupForSender`+3 类型零外部引用（仅自用）。产品链：feishu-bridge ← feishu-bridge-manager ← main/index.ts:235、main/ipc.ts:448。间接测试：批外 `review-feishu-owner-boundary.p05.test.ts`（7 test）。⚠ 碰撞：'session-mirror' reason 字面量与模块名同词不同物。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数。

## 6. 分支、失败、取消与恢复

无异常路径（fail-safe false）；无异步。

## 7. 权限与权威状态

本文件不适用（无权限代码）；`user_count` 权威口径（`:23-26` 注释）是判定依据声明。

## 8. 修改影响面

准入判定改动影响飞书桥免 @ 行为（owner-boundary 批外测试锚）。

## 9. 测试证据

无同名测试；间接批外 `review-feishu-owner-boundary.p05.test.ts`（7 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| user_count 主路径+回退 | 已证实 | `:22-26,40-58` |
| 四级准入 | 已证实 | `:61-70` |
| 4 导出零外部引用（含 isSingleUserGroupForSender） | 已证实（检索式见 §4，全冻结树） | caller 图 |
| 真实飞书群行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 5 导出 | §2 | 6-70 | covered |
| 双路径/四级判定 | §3 | 33-70 | covered |
