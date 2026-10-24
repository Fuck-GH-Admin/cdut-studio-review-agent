---
path: apps/electron/src/renderer/components/settings/ChannelForm.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 66336e2d33111bd994c70b6246b7af51794171e4
sha256: c839064de169185ba60d751b0b4e58587145341d8e80ef0461e29c7f4769c6fe
lines: 1064
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/ChannelForm.tsx

## 1. 结论与边界

**渠道创建/编辑表单**（`:1-10`）：基本信息（名称/供应商/Base URL/API Key）+模型清单（**来自端点发现，不预置**，`:521`）+连接测试。**编辑模式即时保存（auto-save），创建模式手动提交**（`:9`）；`apiKeyOnly` 模式只许填 Key（官方渠道，`:79-80`）。

## 2. 导出与关键符号

1 导出：`ChannelForm`（`:~130`）。常量：`CN_PROVIDERS` 10 项（`:84`）/`GLOBAL_PROVIDERS` 3 项（`:87`）/`PROVIDER_OPTIONS`（`:90`）/`PROVIDER_CHAT_PATHS`（`:105`，各供应商 Chat 端点路径预览）；`buildProviderSelectOptions`（`:93`，图标按主题解析）。

## 3. 内部逻辑与关键流程

- 模型自动发现（`:518-543`）：`shouldAutoDiscoverModels`+`buildModelDiscoveryAttemptKey`（**同"供应商+地址+凭证"只试一次，改址/改 Key/手动获取重置**）→debounce `AUTO_DISCOVERY_DELAY`。
- `handleTest`（`:546-565`）：`testChannelDirect`（免保存直接测）；xai+oauth 跳过、非 ollama 需 Key。
- `doCreate`（`:568-600`）：`ChannelCreateInput` 含 agentBaseUrl/agentRuntimes/xai 特化；xai oauth 创建后接 `loginXaiOAuth`（`:585-587`）；Agent 资格→`onAgentEligibilityChange`（`:588-590`）。
- `handleCreate`（`:603-616`）：**必须至少启用一个模型**否则 toast warning 拦截（`:605-613`）。
- dirty/拦截：`isDirty`（创建态 `:619`）→`channelFormDirtyAtom` 同步（`:651-653`）供 SettingsPanel 拦截；退出弹窗（保存并关闭/放弃，`:1044-1058`）。
- Anthropic 形端点归一（`isAnthropicShapedEndpoint/normalizeAnthropicProviderUrl`，`:48`）；1M 上下文开关 `resolveModel1MToggleState`（`:53`）。

## 4. 调用者与调用链

- 入向：`ChannelSettings.tsx:31`（本批）。
- 出向：shared（PROVIDER_*）、core/providers、channel-model-discovery/channel-manual-model/model-1m-toggle libs、settings primitives、`window.electronAPI.createChannel/testChannelDirect/loginXaiOAuth/fetchModels*`。

## 5. 数据 I/O、读写与副作用

创建写渠道（主进程）；发现模型调供应商端点（经主进程代理）；OAuth 流程（xai）。

## 6. 分支、失败、取消与恢复

创建失败 toast+返回 null；退出拦截（isDirty→弹窗三选）；测试失败显示结果；无自动回滚（auto-save 逐字段保存，照实）。

## 7. 权限与权威状态

凭证 UI=Key/OAuth 双模（xai）；模型权威=端点发现结果（"渠道不再预置任何模型" `:521`）。

## 8. 修改影响面

渠道创建/编辑全链；Agent 资格联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 发现去重/测试门槛/创建校验/dirty 拦截 | 已证实 | `:1-1064` 全文（中段表单 UI 分段读） |
| 发现/1M/lib 实现 | 边界 | lib 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+常量组+处理函数 | §2/§3 | 73-1061 | covered |
