---
path: apps/electron/src/renderer/components/settings/DingTalkSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bc32918424ac3fcf7c7b2a63ff3474aa974a98bd
sha256: 7e8a2c1d803f938b5301c68e7427622f6ce2eee25e2d43da2bf2216aecb62b3f
lines: 412
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/DingTalkSettings.tsx

## 1. 结论与边界

**钉钉集成设置（多 Bot）**（`:1-6`）：多 Bot 配置管理、连接状态、创建引导；保存后自动起 Stream 连接（声明 `:5`）。

## 2. 导出与关键符号

1 导出：`DingTalkSettings`（`:61`）。内部：`openLink`（`:33`）、`Link`（`:38`）、`STATUS_CONFIG` 4 态（`:52-57`）。

## 3. 内部逻辑与关键流程

- `loadBots`（`:66-87`）：`getDingTalkMultiConfig` 优先；**fallback 旧 API `getDingTalkConfig`** 包成单 'legacy' Bot（`:71-83`，兼容迁移照实）。
- `handleAddBot`（`:91-103`）：`saveDingTalkBotConfig` 新建（默认 disabled+空凭证，名字自增）。
- 中段（`:114-`）：Bot 卡（启用开关/凭证 SecretInput/保存/删除 AlertDialog/连接状态点）；每 Bot 测试连接按钮+`DingTalkTestResult` 结果条（`success` 绿/失败红，`:390-401`）；error 状态显 errorMessage（`:403-407`）。

## 4. 调用者与调用链

- 入向：`BotHubSettings.tsx:16`（钉钉面板，本批）。
- 出向：`dingtalkBotStatesAtom`、`window.electronAPI.getDingTalkMultiConfig/getDingTalkConfig/saveDingTalkBotConfig/…`（主进程钉钉 bridge，域外）。

## 5. 数据 I/O、读写与副作用

钉钉 Bot 配置持久化（主进程）；保存触发 Stream 连接（声明 `:5`）。

## 6. 分支、失败、取消与恢复

多配置读取失败→旧 API fallback（`:70-83`）；新建失败 toast；删除 AlertDialog 确认；无自动回滚。

## 7. 权限与权威状态

凭证输入用 SettingsSecretInput（遮蔽显示）；连接状态权威=dinngtalkBotStatesAtom（主进程 bridge 推送）。

## 8. 修改影响面

钉钉 Bot 接入链路：上游=BotHubSettings 钉钉面板（本批）+主进程钉钉 bridge（域外）；修改本文件波及多 Bot CRUD、旧 API fallback 兼容（`:66-87`）、保存起 Stream 的链路入口（头注释声明 `:5`）；回归面=凭证 SecretInput 遮蔽与测试结果条状态机。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 旧 API fallback/多 Bot CRUD/测试结果条 | 已证实 | `:1-412` 全文 |
| "保存后自动启动 Stream" 实际行为 | 推断（头注释声明） | `:5`；bridge 域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+3 内部 | §2/§3 | 33-407 | covered |
