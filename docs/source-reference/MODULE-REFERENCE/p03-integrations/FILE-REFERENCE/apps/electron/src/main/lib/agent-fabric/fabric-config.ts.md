---
path: apps/electron/src/main/lib/agent-fabric/fabric-config.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ec74b2ec0c11f15bee738bba3e13c7a3b34ee16
sha256: f551684124673cedc824666fdb4094136fb8918d3550792989500c1e02d6503a
lines: 86
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-fabric/fabric-config.ts

## 1. 结论与边界

**Agent Fabric 本地服务配置**（纯配置模块，不 import electron 供 bun test 直跑——`:10`）：设计文档 §4 第一阶段只监听 127.0.0.1、LAN/Tailscale 须显式配置；启用显式 opt-in（`PROFER_AGENT_FABRIC=1` 或 `agent-fabric.json enabled=true`）；端口正式版 4788/开发版 4789（与 remote-service 7788/7789 隔离）（`apps/electron/src/main/lib/agent-fabric/fabric-config.ts:1-11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `AgentFabricConfig` | 接口 | 18-28 | enabled/host/port/agentId/defaultChannelId/ModelId/WorkspaceId |
| `getFabricConfigFilePath` | 函数 | 38-40 | `<configDir>/agent-fabric.json` |
| `isDevProfile` | 函数 | 42-44 | 配置目录名 === '.cdutai-dev' |
| `getDefaultFabricPort` | 函数 | 46-48 | dev 4789 / stable 4788 |
| `getLocalFabricAgentId` | 函数 | 51-53 | `WELL_KNOWN_AGENT_IDS.DEV/STABLE` |
| `loadAgentFabricConfig` | 函数 | 66-86 | 聚合加载 |

内部：`FabricConfigFile`（`:30-36`）、`readConfigFile`（解析失败按空配置，`:55-64`）。

## 3. 内部逻辑

`loadAgentFabricConfig`：enabled=env 或 file（`:68`）；port 优先 `PROFER_AGENT_FABRIC_PORT`→file→默认（`:69-74`）；**host 恒 '127.0.0.1'——「PROFER_AGENT_FABRIC_HOST 属显式风险操作，不在此处支持」**（`:77-79` 注释）。

## 4. 调用者与调用链

入向：`agent-fabric-service.ts:20`、`fabric-executor-headless.ts:28`。出向：`../config-paths`、`@profer/agent-fabric`。

## 5. 数据 I/O 与副作用

读 JSON 配置文件。

## 6. 分支、失败、取消与恢复

配置缺失/解析失败→空配置默认（`:57-63`）；端口非法逐级回退。

## 7. 权限与权威状态

安全默认值：仅 loopback（`:78`）；显式 opt-in 启用。

## 8. 修改影响面

端口/agentId 契约与 fabric-server、配对脚本同步。

## 9. 测试证据

无专属测试（glob 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出+端口/身份规则 | 已证实 | `:1-86` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/分支 | §2/§3 | covered |
