---
path: apps/electron/src/main/lib/cslab/cslab-zotero-bridge.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a4d9b0402620e16634d75dcb3a5a6ed3d0073e84
sha256: d6ccc3a9f5c44464023039a04c4e416339ba0ac029877412f7b029cf7149fa02
lines: 74
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-zotero-bridge.ts

## 1. 结论与边界

**Zotero 写回桥接状态（预留，不实际写库）**：架构红线「外部进程绝不 INSERT/UPDATE zotero.sqlite」；只读用户可选配置+探活本地回环插件，为 WebExtension 写回预留；Phase 2 不提供任何写操作（`apps/electron/src/main/lib/cslab/cslab-zotero-bridge.ts:1-7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ZoteroBridgeConfig` | 接口 | 14-17 | `{enabled, port}` |
| `getZoteroBridgeConfigPath` | 函数 | 19-21 | `<configDir>/zotero-bridge.json` |
| `getZoteroBridgeStatus` | 异步函数 | 39-74 | 探活状态（500ms 超时） |

内部：`readBridgeConfig`（`:23-36`，不存在/未启用/端口非法→null 兜底）。

## 3. 内部逻辑与关键流程

`getZoteroBridgeStatus`：无配置→`{enabled:false,reachable:false,message:'写回桥接未配置（本阶段仅只读同步）'}`（`:41-47`）；否则 `fetch 127.0.0.1:{port}/ping`（AbortController 500ms、timer.unref，`:50-52`）→ok 则 reachable+「Phase 2 不会自动写入」（`:62`）；异常→「已配置但不可达」（`:65-73`）。

## 4. 调用者与调用链

入向：CSLab 状态面板/IPC（非本批，经 index re-export）。出向：`../config-paths`、`@profer/shared` 类型、全局 fetch。

## 5. 数据 I/O 与副作用

读配置 JSON；HTTP GET 本地回环（可选）。无写盘。

## 6. 分支、失败、取消与恢复

无 throw；三态返回（未配置/可达/不可达）；读配置全兜底 null。

## 7. 权限与权威状态

红线注释 `:3-6`（绝不写 zotero.sqlite）；仅探活本地回环。

## 8. 修改影响面

配置格式/端口约定与 Zotero 插件侧契约同步。

## 9. 测试证据

无专属测试（glob `**/cslab-zotero-bridge*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+三态+红线 | 已证实 | `:1-74` |
| 插件端 /ping 契约 | 推断 | 源码自述 |
| 运行行为 | 未知 | NOT_RUN（网络） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
| 测试/运行 | §9/§10 | unknown（NOT_RUN） |
