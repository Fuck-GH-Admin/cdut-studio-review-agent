---
path: apps/electron/src/renderer/lib/channel-model-groups.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9982e761392687583a307eb31c77958b5b8eb6f2
sha256: 49a3d0789415a05737e915015482ac20fdd90a7ecaa3e5fe8fa004ddb63a6a40
lines: 119
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-model-groups.ts

## 1. 结论与边界

渠道/模型分组展示与内核能力判定的纯函数集合（119 行）：官方渠道识别、模型池命名、协议（内核）映射、Pi 内核标签状态、Agent 运行时协议过滤、跨渠道模型分组。边界：不做 I/O、不持状态、不查权限；Agent 可用性判定委托 `@profer/shared` 的 `isChannelEnabledForRuntime`（`apps/electron/src/renderer/lib/channel-model-groups.ts:2,78`），**不按渠道类型加门禁**，由用户勾选 `agentRuntimes` 决定（`:69-70` 注释）。`getChannelProtocol` 仅作单一展示值（`:72`）。

## 2. 导出与关键符号

- 类型导出 5 个：`ChannelSource`（`:4`）、`ChannelProtocol`（`:5`）、`ChannelRuntimeCapability`（`:8-11`，Pick 别名）、`ChannelModelGroup`（`:13-22` 接口）、`PiCoreState`（`:56`）。
- 函数导出 10 个：`isOfficialChannel`（`:24`）、`isModelFamilyChannel`（`:28`）、`getOfficialChannelDisplayName`（`:32`）、`getChannelSource`（`:36`）、`getChannelProtocol`（`:40`）、`resolvePiCoreState`（`:58`）、`supportsChannelProtocol`（`:74`）、`groupChannelModels`（`:81`）、`getModelSourceLabel`（`:113`）、`getEnabledModelCount`（`:117`）。
- 常量导出 0 个；`anthropicProviders` Set 为 `getChannelProtocol` 内部局部（`:41-45`，标注"内部"）。合计导出 15 个符号，与源码逐条一致。

## 3. 内部逻辑与关键流程

- `isOfficialChannel`（`:24-26`）：`serverManaged === true` 或 id 前缀 `newapi-`。`isModelFamilyChannel`（`:28-30`）：`managedType === 'model-family'` 或前缀 `newapi-family-`（服务端未返回 managedType 时按稳定 ID 兜底）。
- `getOfficialChannelDisplayName`（`:32-34`）：模型池显示 `${name} 模型池`，否则原名。`getChannelSource`（`:36-38`）：official/self-configured 二分。
- `getChannelProtocol`（`:40-47`）：provider ∈ `anthropicProviders` 集合（`:41-45`，10 个 provider）→ 'anthropic'，否则 'openai'。
- `resolvePiCoreState`（`:58-63`）：非 xai 恒 'active'（`:61`）；xai 按 `isChannelEnabledForRuntime(channel,'pi')` 给 'experimental-active'/'experimental-inactive'（`:62`）。设计根因见注释 `:49-55`（不得沿用 `isAgentEnabledForChannel`，否则 xAI 已开实验被误标未启用）。
- `supportsChannelProtocol`（`:74-79`）：忽略 protocol 形参，统一返回 `isChannelEnabledForRuntime(channel,'pi')`（`:78`）。
- `groupChannelModels`（`:81-111`）：跳过未启用渠道（`:84`）/未启用模型（`:87`）；键 `${source}:${model.id}`（`:88`）聚合；已有组追加 channelIds/channelNames（去重 push，`:92-93`）、enabledChannelIds 直接 push（`:94`）、protocols 去重（`:95`）；新组初始化 enabled 恒 true（`:105`）；返回按 `modelName.localeCompare` 排序（`:110`）。
- `getModelSourceLabel`（`:113-115`）：'官方托管'/'自配渠道'。`getEnabledModelCount`（`:117-119`）：enabled 模型计数。

## 4. 调用者与调用链

- 入向（冻结树全量 grep，逐符号）：
  - `isOfficialChannel`/`isModelFamilyChannel`/`getOfficialChannelDisplayName`：`apps/electron/src/renderer/components/settings/ChannelSettings.tsx:34`（import；调用 `:55,:302-303,:353,:384,:413`）、`apps/electron/src/renderer/components/shared/ModelSelector.tsx:38`（import；调用 `:185,:253,:453,:510`）。
  - `getChannelProtocol`：`ModelSelector.tsx:38,64`；`apps/electron/src/renderer/lib/agent-channel-selection.ts:3`（import，调用 `:51-52` 为 openai 协议优先排序）。
  - `getChannelSource`：`ModelSelector.tsx:38,69`（主进程注释佐证契约：`apps/electron/src/main/lib/remote-service.ts:761`）。
  - `supportsChannelProtocol`：`ModelSelector.tsx:38,65`（strictProtocolFilter 过滤）。
  - `resolvePiCoreState`：仅本批测试 `apps/electron/src/renderer/lib/channel-model-groups.test.ts:8,124-166`。
  - `groupChannelModels`、`getModelSourceLabel`、`getEnabledModelCount`、`ChannelModelGroup`/`PiCoreState`/`ChannelRuntimeCapability` 类型：**全树未检索到调用者**（检索方式：冻结树 `grep -rn --include=*.{ts,tsx,js}` 逐符号全文，仅命中定义处 `apps/electron/src/renderer/lib/channel-model-groups.ts:81,113,117`）。
- 出向：类型 `Channel`/`ChannelModel` + 值 `isChannelEnabledForRuntime`（`@profer/shared`，`:1-2`；定义 `packages/shared/src/types/channel.ts:169`）；`inferAgentRuntimeModes`/`isAgentEnabledForChannel` 本文件不 import（仅注释 `:52` 提及），测试从 `@profer/shared` 引用做对照断言（`channel-model-groups.test.ts:3`）；同名导出（定义 `packages/shared/src/types/channel.ts:155,187`）的全树生产引用为 `channel-manager.ts:26,463`、`channel-url-routing.ts:2,126`、`ChannelSettings.tsx:13,131,222`、`ChannelForm.tsx:36-37,208`（均经 `@profer/shared` 来源）。无动态调用。

## 5. 数据 I/O、读写与副作用

纯函数集合：无模块级状态（`anthropicProviders` Set 在 `getChannelProtocol` 每次调用重建，`:41`）；`groupChannelModels` 用局部 `Map` 聚合（`:82`）后展开为数组，不改入参。无 DOM/存储/Worker/IPC 副作用。

## 6. 分支、失败、取消与恢复

- `isModelFamilyChannel` 双判据分支（`:29`）：managedType 缺失（undefined）时靠 ID 前缀兜底；`getOfficialChannelDisplayName` 二分支（`:33`）。
- `resolvePiCoreState` 三分支（`:61-62`）；`supportsChannelProtocol` 对 protocol 形参不敏感（`:78`，注释 `:65-73` 说明协议=内核语义）。
- `groupChannelModels` 短路：渠道未启用（`:84`）、模型未启用（`:87`）、同键已存在走追加分支（`:91-96`）。
- 空输入：`groupChannelModels([])` 返回空数组（`:110`）；`getEnabledModelCount({models:[]})` 返回 0（`:118`）。无 throw、无异步、无取消概念（本文件不适用，依据：全文无 Promise/AbortSignal/定时器）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。能力权威来自用户勾选 `agentRuntimes`（老配置回退 provider 推导，`:69-70` 注释；`packages/shared/src/types/channel.ts:155,169` 实现推导），xAI 的 Pi 内核需实验开关（`:54`）。

## 8. 修改影响面

- `ModelSelector.tsx:64-69,185,253,453,510`（模型选择器的协议过滤/来源分组/官方命名）；`ChannelSettings.tsx:55,302-303,353,384,413`（渠道列表分组与模型池命名）；`agent-channel-selection.ts:51-52`（Agent 渠道排序）。
- `getChannelProtocol` 的 provider 集合（`:41-45`）改变会影响分组标签与 openai 优先排序；`supportsChannelProtocol`/`resolvePiCoreState` 改动会影响 xAI 实验标签与严格协议过滤（回归锁见 `channel-model-groups.test.ts:156-167`）。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试文件 `apps/electron/src/renderer/lib/channel-model-groups.test.ts`（本批次内）：机械计数 `test(` = 16、`it(` = 0。真实断言：`apps/electron/src/renderer/lib/channel-model-groups.test.ts:34-43`（inferAgentRuntimeModes 推导族）、`:48-66`（isChannelEnabledForRuntime 勾选/回退）、`:72-90`（supportsChannelProtocol 过滤族）、`:96-98`（getChannelProtocol 展示值）、`:105-118`（模型池命名）、`:124-166`（resolvePiCoreState 与回归锁 `isAgentEnabledForChannel(xai)`）。断言引用≠运行；上述断言同时覆盖 `@profer/shared` 行为（域外依赖，标"间接"）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 15 个导出符号与语义 | 已证实 | `apps/electron/src/renderer/lib/channel-model-groups.ts:4-117` 全文 |
| xAI 标签回归根因与判定路径 | 已证实 | `:49-63` 注释 + `channel-model-groups.test.ts:156-167` |
| `groupChannelModels`/`getModelSourceLabel`/`getEnabledModelCount` 无入向调用者 | 已证实 | 全树逐符号 grep 仅命中定义处（检索范围见 §4） |
| 这三个函数的真实运行行为 | 未知 | 无测试覆盖且未运行（NOT_RUN） |
| 测试实际运行结果 | 未知 | NOT_RUN，本轮未执行任何测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `isOfficialChannel` | §3 | `channel-model-groups.ts:24-26` | partial（无测试，仅生产调用） |
| `isModelFamilyChannel` 双判据 | §3,§6 | `channel-model-groups.ts:28-30` | covered |
| `getOfficialChannelDisplayName` | §3,§9 | `channel-model-groups.ts:32-34` | covered |
| `getChannelSource` | §3 | `channel-model-groups.ts:36-38` | partial（无测试） |
| `getChannelProtocol` 集合 | §3,§9 | `channel-model-groups.ts:40-47` | covered |
| `resolvePiCoreState` 三分支 | §3,§9 | `channel-model-groups.ts:58-63` | covered |
| `supportsChannelProtocol` | §3,§9 | `channel-model-groups.ts:74-79` | covered |
| `groupChannelModels` 聚合/排序 | §3,§6 | `channel-model-groups.ts:81-111` | unknown（无测试、无调用者） |
| `getModelSourceLabel`/`getEnabledModelCount` | §3 | `channel-model-groups.ts:113-119` | unknown（无测试、无调用者） |
| 运行结果 | §9 | — | unknown（NOT_RUN） |
