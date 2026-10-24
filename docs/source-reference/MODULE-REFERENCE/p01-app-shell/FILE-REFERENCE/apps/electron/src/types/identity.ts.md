---
path: apps/electron/src/types/identity.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 99dd52b8dcd629af32ad73419c4a88001ae84a70
sha256: b52dec0c8d9b61a24dd5ca9b37416ada3a921b012bf6dc8bd303a25e6f20ea56
lines: 44
kind: source
package: p01-app-shell
author: docs-r07-author-extra-04-20261024
reviewer: docs-r07-qa-extra-04-20261024
status: authored
evidence: static
---

# apps/electron/src/types/identity.ts

## 1. 结论与边界

纯类型/常量文件：设备身份与用户（团队账户）身份的 TypeScript 形状 + 一组身份 IPC 通道名常量（`apps/electron/src/types/identity.ts:1-5`）。无运行时逻辑。

边界：不含任何读写/校验/加密实现（`encryptedAuthToken` 只是字段名，加解密在服务层）；不含 IPC handler 注册。

## 2. 导出与关键符号

`export` 逐条核对：3 个（接口 2 + 常量 1；无函数/类）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `DeviceIdentity` | 接口（导出） | 8-15 | `{deviceId: string; deviceName: string; registeredAt: number}` | 设备唯一标识（首次运行生成 deviceId） |
| `UserIdentity` | 接口（导出） | 18-37 | `{displayName; avatar; bio?; teamAccountId?; encryptedAuthToken?; tokenExpiresAt?; teamEmail?; createdAt?}` | UserProfile 增强版 + 团队账户绑定（可选） |
| `DEVICE_IDENTITY_IPC_CHANNELS` | 常量（导出） | 40-44 | `{GET:'identity:get-device', GET_USER:'identity:get-user', UPDATE_USER:'identity:update-user'} as const` | 身份 IPC 通道名 |

## 3. 内部逻辑与关键流程

本文件不适用（纯类型/常量声明，无内部逻辑），依据：全文仅接口与 `as const` 对象，无语句级代码。

## 4. 调用者与调用链

入向（冻结树 grep）：`apps/electron/src/main/lib/identity-service.ts:11`（`import type { DeviceIdentity, UserIdentity }`）。`DEVICE_IDENTITY_IPC_CHANNELS` **全冻结树 0 消费者**（检索 `*.ts/*.tsx`，含通道字面量 `identity:get-device|get-user|update-user` 0 命中，范围声明见 §10）。

出向：无（纯声明文件）。

## 5. 数据 I/O、读写与副作用

无：纯类型/常量，无副作用。`UserIdentity.encryptedAuthToken`/`tokenExpiresAt` 的存储与加解密在消费者侧（identity-service，未在本文件）。

## 6. 分支、失败、取消与恢复

本文件不适用，依据：无控制流。

## 7. 权限与权威状态

本文件无权限分支，依据：无 sender/role 检查。`UserIdentity` 的团队账户字段（teamAccountId/encryptedAuthToken）是身份权威的数据形状，权威产生/消费在 identity-service（文件外）。

## 8. 修改影响面

- 改 `DeviceIdentity`/`UserIdentity` 影响 `identity-service.ts` 的读写实现与其 IPC 载荷。
- 改通道常量当前无消费者受影响（见 §4 否定结论）；若接线需同步 IPC 注册端。

## 9. 测试证据

**无直接测试**：冻结树 `*.test.ts`/`*.test.tsx` 对 `identity.ts` 导出 0 命中（检索范围：冻结树 apps/ 与 packages/，不含 docs）。间接：无。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI。测试断言仅指静态读到的 expect 行——本文件没有。

缺口（静态判断）：类型形状由编译期锁定，无运行断言可缺。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 个导出（2 接口 + 1 常量） | 已证实 | `grep -c '^export'`=3，`:8,18,40` |
| `DEVICE_IDENTITY_IPC_CHANNELS` 0 消费者 | 已证实（检索：冻结树 `*.ts/*.tsx` 全文，符号名与 3 个通道字符串均 0 命中，不含 docs/） | — |
| identity-service 消费两接口 | 已证实 | `identity-service.ts:11` |
| 通道常量是否为预留接线 | 推断 | 命名规范但无消费点 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `DeviceIdentity` | §2 | 8-15 | covered |
| `UserIdentity` | §2 | 18-37 | covered |
| `DEVICE_IDENTITY_IPC_CHANNELS` | §2,§4 | 40-44 | covered |
| 测试 | §9 | — | unknown |
