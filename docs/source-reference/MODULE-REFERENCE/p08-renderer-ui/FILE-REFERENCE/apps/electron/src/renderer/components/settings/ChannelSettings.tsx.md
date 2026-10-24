---
path: apps/electron/src/renderer/components/settings/ChannelSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e8a61fc088dd671f863fc6a3a5eb13f5dffe3697
sha256: 46b3df3cb9d55ae8feb9fad5fea20a049f13362a74b09dd3acc402dcbeeb794b
lines: 504
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/ChannelSettings.tsx

## 1. 结论与边界

**渠道配置页**（`:1-6`）：所有渠道增删改+启用状态；Chat 与 Agent 视觉统一为一个列表。三视图模式 list/create/edit（`:38`）。

## 2. 导出与关键符号

1 导出：`ChannelSettings`（`:40`）。状态：channels/officialHealth/viewMode/editingChannel/commercialMode/canSelfConfig/deleteTarget（`:41-53`）；`managedFamilyNames`（模型族名去重 `:54-56`）。

## 3. 内部逻辑与关键流程

- 能力加载 `loadCaps`（`:72-83`）：`getAccountCapabilities(force)`→commercialMode/canSelfConfig，失败双 false。
- **未登录隐藏官方渠道**（`:104`：`authStatus.isLoggedIn ? list : list.filter((c) => !isOfficialChannel(c))`，注释：避免残留缓存展示给未登录用户）。
- 列表视图：渠道卡（logo/名称/启用 Switch/编辑/删除 AlertDialog）；官方渠道卡（`isOfficialChannel`）展开显示 `aggregateModelHealth` 聚合健康 + `ModelAvailabilityBar` 列（`:497-500`）。
- 创建/编辑：切 `ChannelForm`（本批）；编辑回填 editingChannel。
- Agent 联动：`agentChannelIdAtom/agentModelIdAtom/agentChannelIdsAtom` 与 `agentChannelIdRef/agentChannelIdsRef` 同步（`:58-67`）；`isAgentEnabledForChannel` 过滤 Agent 可用性。
- `onAgentEligibilityChange` 回调把 Agent 资格变化上抛（ChannelForm 提交后调用）。

## 4. 调用者与调用链

- 入向：`SettingsPanel.tsx`（channels 标签，本批）。
- 出向：ChannelForm/ModelAvailabilityBar（本批）、YanhuPetModelSettings（域外）、conversation/agent/identity atoms、`channel-model-groups`/`channel-health-aggregation` lib、`window.electronAPI`（渠道 CRUD+账号能力）。

## 5. 数据 I/O、读写与副作用

渠道 CRUD（主进程）；官方健康数据（OfficialChannelHealth）；Agent 偏好 atoms 持久化。

## 6. 分支、失败、取消与恢复

删除 AlertDialog 确认（不可恢复语义）；加载失败 console；商业化/自配能力回落 false（`:78-81`）。

## 7. 权限与权威状态

自配权限=canSelfConfig（账号能力决定可否自建渠道，`:72-83`）；商业模式=commercialMode。

## 8. 修改影响面

渠道管理主入口；Agent 渠道/模型偏好。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三视图/能力 gates/官方健康聚合展开 | 已证实 | `:1-504` 全文 |
| `channel-health-aggregation` 聚合算法 | 边界 | lib 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+官方卡内部 | §2/§3 | 40-504 | covered |
