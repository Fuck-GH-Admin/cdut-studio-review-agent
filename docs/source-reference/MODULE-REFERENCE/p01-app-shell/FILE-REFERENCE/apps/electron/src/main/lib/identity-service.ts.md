---
path: apps/electron/src/main/lib/identity-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 286887cb8c6876c0dfbe32e780a6b857454e90ad
sha256: 96967f278c131afe75aa761801b7fe9c47bc323a413b72b10188dd0b58b5944a
lines: 136
kind: source
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/identity-service.ts

## 1. 结论与边界

**设备/用户身份服务**（136 行，Phase 1）：设备 ID 生成与双写持久化（OS 级持久位置 + `device.json`）、设备名维护、登录请求用设备信息、本地用户档案投影。

边界：无团队账户绑定（`getUserIdentity` 仅读本地 `user-profile.json`，注释 `:110-112` Phase 2 扩展）；不做登录/令牌（`auth-service` 负责）；不校验调用方权限。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `getOrCreateDeviceIdentity` | 导出函数 | 40-79 | `(): DeviceIdentity` | 读取/创建设备身份（内存缓存） |
| `getDeviceAuthInfo` | 导出函数 | 84-89 | `(): {deviceId, deviceName, platform, appVersion}` | 登录/刷新请求携带信息 |
| `updateDeviceName` | 导出函数 | 94-105 | `(name: string): DeviceIdentity` | 改设备名并持久化 |
| `getUserIdentity` | 导出函数 | 113-136 | `(): UserIdentity` | 本地用户档案投影 |
| `generateDeviceName` | 内部函数 | 16-30 | `(): string` | `平台 (hostname)` |
| `_deviceIdentity` | 内部变量 | 32 | `DeviceIdentity\|null` | 模块级缓存 |

导出计数：`export` 4 条（`:40`、`:84`、`:94`、`:113`），与源码一致。

## 3. 内部逻辑与关键流程

- **generateDeviceName**（`:16-30`）：`require('node:os').hostname()`（失败→`'unknown'`）；platform 前缀 darwin→`Mac`、win32→`Windows`、其余→`Linux`；返回 `` `${platform} (${hostname})` ``。
- **getOrCreateDeviceIdentity**（`:40-79`）：
  1. `_deviceIdentity` 命中直接返回（`:41`）。
  2. 读 `device.json`（`getDeviceIdentityPath()`，`config-paths.ts:1350-1357`）：存在则 `JSON.parse`，损坏忽略（`:48-54`）。
  3. `require('./device-durable-store')` 动态取 `readDurableDeviceId/writeDurableDeviceId`（`:44`）；**deviceId 优先级：OS 级持久（注册表/keychain）> device.json > `randomUUID()` 新生成**（`:57-58`）。
  4. 无缓存 identity → 新建 `{deviceId: finalId, deviceName: generateDeviceName(), registeredAt: Date.now()}`；有但 id 不一致 → 覆盖为 `finalId`（`:60-64`）。
  5. `durableId` 缺失则回填 `writeDurableDeviceId(finalId)`（失败静默降级，`:67-69`）；随后**无条件双写** `device.json`（`JSON.stringify(identity,null,2)`，失败仅 warn，`:70-74`）。
  6. 缓存并返回；日志带 `[OS级持久]` 标记（`:76-78`）。
- **getDeviceAuthInfo**（`:84-89`）：`getOrCreateDeviceIdentity()` + `require('electron').app.getVersion()`（非 Electron 环境 catch → `appVersion:''`，`:87`）。
- **updateDeviceName**（`:94-105`）：改 `identity.deviceName`（经缓存对象引用，直接变异）→ 写 `device.json`（失败 warn 不抛）→ 返回 identity。
- **getUserIdentity**（`:113-136`）：`require('./user-profile-service').getUserProfilePath()`（动态 require，`:115-116`）；读 `user-profile.json` 取 `userName`/`avatar`，缺省 `'用户'`/`'🧑‍💻'`（`:117-129`）；返回 `{displayName, avatar, createdAt: Date.now()}`——**`createdAt` 是每次调用的当前时间**（照实记录）。

## 4. 调用者与调用链

- 入向（全冻结树 `grep identity-service|getOrCreateDeviceIdentity|getDeviceAuthInfo|updateDeviceName|getUserIdentity`，apps+packages 全文件类型）：
  - `apps/electron/src/main/ipc.ts:7337` 动态 require；`:7342` `auth:get-device-identity` handler → `getOrCreateDeviceIdentity()`；`:7347` `auth:get-user-identity` → `getUserIdentity()`；`:7350-7356` `auth:update-profile` → 直接 `return getUserIdentity()`（**不写远程档案**，注释 `:7353` Phase 3）。通道值 `packages/shared/src/types/agent.ts:2432-2434`。
  - `apps/electron/src/main/lib/auth-service.ts:16` import `getDeviceAuthInfo`；`:231`（登录 body）、`:420`（注册 body）、`:617`（`{deviceId}`）、`:754`（刷新 body）、`:957`、`:984`（取 `deviceId`）。
  - `apps/electron/src/main/lib/token-crypto.ts:21` import `getOrCreateDeviceIdentity`；`:34` 取 `deviceId` 作令牌加密绑定。
  - 渲染链路：`preload/index.ts:1535`（类型）、`:3919` `getUserIdentity` invoke。
  - `updateDeviceName`：**全冻结树仅本文件定义**，0 外部调用点（检索范围同上）。
- 出向：`node:crypto.randomUUID`（`:8`）、`node:fs`（`:9`）、`./config-paths.getDeviceIdentityPath`（`:10`）、`../../types/identity` 类型（`:11`）、动态 `./device-durable-store`（`:44`）、动态 `require('electron').app`（`:87`）、动态 `./user-profile-service`（`:115`）。

## 5. 数据 I/O、读写与副作用

- 输入：`updateDeviceName(name)`；输出：`DeviceIdentity`/`UserIdentity`/auth info 对象。
- 磁盘写：`device.json`（`getDeviceIdentityPath()`，`:71`、`:99`）；OS 级持久（Windows 注册表 `HKCU\Software\<ns>\DeviceId`、macOS keychain，经 `device-durable-store.ts:39-79`，失败静默）。
- 磁盘读：`device.json`、`user-profile.json`（`:120-129`）。
- 网络：无（auth-service 拿到 auth info 后自行发请求）。
- 副作用：注册表/keychain 写入；console 日志（`:73`、`:77`、`:101`）；`_deviceIdentity` 模块级缓存（进程内）。

## 6. 分支、失败、取消与恢复

- `device.json` 损坏 → 忽略重建（`:51-53`）；写失败 → warn 不抛（`:72-74`、`:100-102`）。
- OS 级持久读失败 → null → 用 `device.json`/新 UUID；写失败静默降级（`device-durable-store.ts:76-78`）。
- 双写策略保证两处一致（注释 `:37-38`）；清 `~/.cdutai` 后仍能凭注册表/keychain 认回同一 deviceId（注释 `:56`）。
- 取消/恢复：无异步、无锁；并发调用在 JS 单线程下串行（推断自运行模型）。重启后 `_deviceIdentity` 清空，下次调用重读。
- 不可恢复点：两处持久都失败且内存丢失 → deviceId 变化（最坏情况，`randomUUID()` 路径）。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查；IPC handler（`ipc.ts:7340-7356`）直接暴露给 renderer。
- 权威状态：deviceId 权威=OS 级持久位置（优先级最高，`:57-58`）；`deviceName` 权威=`device.json`/`updateDeviceName`；`UserIdentity` 权威=`user-profile.json`（本地），非远端账户。

## 8. 修改影响面

- `auth-service.ts`（`:231`、`:420`、`:617`、`:754`、`:957`、`:984`）：deviceId 变化会导致服务端「注册设备数」模型槽位变化（device-durable-store 注释 `:14`「修复版本更新导致的槽位 churn」）。
- `token-crypto.ts:34`：deviceId 参与令牌加密绑定，改 ID 影响已存令牌解密。
- IPC `auth:get-device-identity`/`get-user-identity`/`update-profile`（`agent.ts:2432-2434`）与 preload `:3919`。
- 测试缺口：无专属测试（§9）。

## 9. 测试证据

- 直接测试：**无**。检索范围：冻结树全文件 `grep identity-service|getOrCreateDeviceIdentity|getDeviceAuthInfo|updateDeviceName|getUserIdentity`，无 `*.test.ts` 命中。
- 间接证据：无。
- 未覆盖：双写优先级、损坏 JSON 回退、注册表/keychain 降级、`updateDeviceName`。
- `NOT_RUN`：未运行 bun test/产品测试/typecheck/build/GUI/Windows/macOS 实机持久化；测试断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出签名/优先级链 | 已证实 | `:40-79` |
| deviceId 三级来源（OS>json>uuid） | 已证实 | `:57-58` |
| 双写回填与失败降级 | 已证实 | `:66-74`、`device-durable-store.ts:62-79` |
| `updateDeviceName` 0 外部调用点 | 已证实 | 全冻结树检索（§4 范围） |
| `auth:update-profile` 不写远程 | 已证实 | `ipc.ts:7350-7356` |
| `getUserIdentity.createdAt` 每次=now | 已证实 | `:134` |
| 注册表/keychain 实际持久效果 | 未知 | NOT_RUN（非 Windows/macOS 实机） |
| auth-service 槽位 churn 修复效果 | 推断 | `device-durable-store.ts:12-14` 注释 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `generateDeviceName` | §3 | 16-30 | covered |
| `getOrCreateDeviceIdentity` 全分支 | §3/§6 | 40-79 | covered |
| `getDeviceAuthInfo` | §3/§4 | 84-89 | covered |
| `updateDeviceName` | §3/§4 | 94-105 | covered |
| `getUserIdentity` | §3 | 113-136 | covered |
| 双写/降级路径 | §6 | 66-74 | covered |
| OS 级持久实际行为 | §10 | — | unknown（NOT_RUN） |
