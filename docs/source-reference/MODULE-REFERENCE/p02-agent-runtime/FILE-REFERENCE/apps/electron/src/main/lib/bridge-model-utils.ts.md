---
path: apps/electron/src/main/lib/bridge-model-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4f73eee30349bc50f93092e2b54c51a6533069d6
sha256: a12b967eba03578d0f5bf835ee70967de3173b8ba594e865534037b9dd3a7174
lines: 62
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/bridge-model-utils.ts

## 1. 结论与边界

**IM Bridge 模型切换共享工具**（`bridge-model-utils.ts:1-8` 注释）：为飞书/钉钉/微信 Bridge 提供统一「渠道/模型」数据逻辑（过滤可用渠道、按序号解析、解析当前绑定）。**纯数据逻辑，不耦合任何平台的消息呈现**（`:7`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `getEnabledModels` | function（export） | `:14-16` | 渠道下 enabled 模型 |
| `listSwitchableChannels` | function（export） | `:22-24` | 已启用且至少 1 启用模型（防切到用不了的渠道 `:20`） |
| `resolveChannelByIndex` | function（export） | `:27-31` | 1 起始序号，越界/非整数→undefined |
| `resolveModelByIndex` | function（export） | `:34-38` | 同上（渠道内） |
| `BindingModelDescription` | interface（export） | `:41-48` | `{channelName, modelName, valid}`（失败回显原值/「未设置」`:42-45`） |
| `describeBindingModel` | function（export） | `:50-62` | `/now` 展示信息 |

## 3. 内部逻辑与关键流程

`describeBindingModel`（`:50-62`）：`getChannelById` 找渠道→渠道内找 model；channelName/modelName 失败回显 id 或'未设置'（`:57-58`）；`valid=渠道与模型都存在`（`:59`）。

## 4. 调用者与调用链

入向：飞书/钉钉/微信 Bridge 消息命令（跨文件）。出向：`./channel-manager`（listChannels/getChannelById `:11`）、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

纯查询（读 channel-manager 内存态）；无副作用。

## 6. 分支、失败、取消与恢复

越界/非整数→undefined（`:29/:36`）；解析失败回显（`:57-58`）。不适用取消/恢复。

## 7. 权限与权威状态

不适用（数据工具）。

## 8. 修改影响面

改解析 → 各 IM Bridge 的 /model /now 命令行为。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索本文件 6 符号 → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 导出+回显语义 | 已证实 | 逐行读 `:1-62` |
| Bridge 调用方行为 | 未知 | 跨文件未读 |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 导出 | §2/§3 | `:14-62` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
