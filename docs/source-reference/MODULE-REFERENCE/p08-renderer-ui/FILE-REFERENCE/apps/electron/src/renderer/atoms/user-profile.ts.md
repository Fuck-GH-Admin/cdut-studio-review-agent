---
path: apps/electron/src/renderer/atoms/user-profile.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b577a61554111138b6d1c102c0e4d13961acf851
sha256: 0c1ac6ce4f1d587a71802ccd5a99fa90a3897c034775fc9a9e377b5d7e2c3896
lines: 15
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/user-profile.ts

## 1. 结论与边界

用户档案原子（头注释 :2-5）：用户名+头像，IPC 从本地配置加载/保存。

## 2. 导出与关键符号

导出 1 条（`export` :12）：`userProfileAtom = atom<UserProfile>({userName: DEFAULT_USER_NAME, avatar: DEFAULT_USER_AVATAR})`。

## 3-7. 不适用

纯原子声明（无逻辑分支）——依据：15 行全文核对。

## 4. 调用者与调用链

入向（子agent 交叉核）：**7 生产**（AgentMessages:32/SDKMessageRenderer:49/sticky-user-message:18/use-left-sidebar:88/SessionMiniMapPopover:17/GeneralSettings:24/WelcomeEmptyState:21）；atoms/index.ts:10 桶再导出但无经桶消费者（死桶）。出向：`../../types`（与 types/user-profile.ts 为两文件）。

## 8. 修改影响面

- 消费面：用户展示链。
- 依赖面：types 默认值。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条 | 已证实 | :12-15 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2 | :12-15 | covered |
