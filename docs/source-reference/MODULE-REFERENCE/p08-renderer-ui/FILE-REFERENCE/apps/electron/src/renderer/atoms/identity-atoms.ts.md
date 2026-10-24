---
path: apps/electron/src/renderer/atoms/identity-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e84caa0efa01347978165cdc82bd0e76aaaac705
sha256: c7fffa54ac12a183899ca34decf5eed213da95650ed046080c58c09784ff37c9
lines: 24
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/identity-atoms.ts

## 1. 结论与边界

设备身份/用户身份/认证状态的 Jotai 状态（24 行，头注释 `:1-2`）：前两者内存态，**认证状态经 `atomWithStorage` 持久化到 localStorage**（防刷新丢失，`:21`）。本批少数带存储副作用的文件。

**边界**：不校验/刷新凭证（认证流程在别处，跨批）；持久化仅 `authStatusAtom`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `deviceIdentityAtom` | atom（导出） | 10 | `DeviceIdentity \| null` 初值 null | 设备身份 |
| `userIdentityAtom` | atom（导出） | 13 | `UserIdentity \| null` 初值 null | 用户身份 |
| `authStatusAtom` | atomWithStorage（导出） | 22-24 | `AuthStatusState`（`{isLoggedIn, teamAccountId?, teamEmail?}` `:15-19`），键 `'profer-auth-status'`，默认 `{isLoggedIn:false}` | 认证状态（localStorage 持久化） |

导出合计 3。类型 `DeviceIdentity`/`UserIdentity` 来自 `../../types/identity`（`:7`）。

## 3. 内部逻辑与关键流程

无函数逻辑（不适用，依据：纯 atom 声明）。`atomWithStorage('profer-auth-status', …)`（`:22`）：读写经 localStorage（jotai/utils 实现，跨库）。

## 4. 调用者与调用链

入向（全冻结树检索 `identity-atoms`，4 文件，均用 `authStatusAtom`）：`components/app-shell/left-sidebar/use-left-sidebar.ts:89`、`components/shared/ModelSelector.tsx:27`、`components/settings/ChannelSettings.tsx:19`、`components/settings/SettingsPanel.tsx:32`。`deviceIdentityAtom`/`userIdentityAtom` 无独立 import（全树检索，另 index.ts:12 re-export）。
出向：`jotai`、`jotai/utils`、类型文件。

## 5. 数据 I/O、读写与副作用

- **localStorage 读写**：键 `profer-auth-status`（`atomWithStorage`，`:22`）；写发生在消费方 set 时（jotai 自动同步）。
- 内存：两个 null 初值 atom。
- 副作用：持久化是本批少见的存储面（照实记录）。

## 6. 分支、失败、取消与恢复

无本文件分支（不适用）。localStorage 不可用时的行为由 `atomWithStorage`（jotai/utils，跨库）决定，〔未知〕其降级路径。

## 7. 权限与权威状态

无守卫逻辑（不适用，依据：本文件无 sender/role 检查）。数据本身是身份/登录状态（敏感面照实：`teamAccountId`/`teamEmail` 存 localStorage 明文）；权威来源=认证流程写入（跨批）。

## 8. 修改影响面

4 个消费方的登录态 UI（侧边栏/模型选择器/渠道设置/设置面板）；localStorage 键名变更会使旧持久值丢失；`AuthStatusState` 形状是契约。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `identity-atoms` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出/键名/默认值/形状 | 已证实 | `:1-24` 全文逐行 |
| 4 个调用方（均 authStatusAtom） | 已证实 | 全树检索（§4） |
| atomWithStorage 降级行为 | 边界（跨库） | `:6`/`:22` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `deviceIdentityAtom`/`userIdentityAtom` | §2 | 10-13 | covered |
| `authStatusAtom`（持久化面） | §2/§5/§7 | 15-24 | covered |
