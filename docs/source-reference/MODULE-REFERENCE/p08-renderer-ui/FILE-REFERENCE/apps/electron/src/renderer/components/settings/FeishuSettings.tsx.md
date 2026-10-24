---
path: apps/electron/src/renderer/components/settings/FeishuSettings.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ad4cefdaec59d56158de1977d2b09c06688f0940
sha256: b40572a954328b5ef0b2292b330ff838acc75b31b92a90a5104217b0bf7511e5
lines: 1842
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/FeishuSettings.tsx

## 1. 结论与边界

**飞书集成设置**（`:1-7`）：Bot 配置（凭证/连接/默认配置/创建引导/命令）+绑定管理（群/单聊的工作区会话分配）。主组件=FeishuConfigTab 默认展示+绑定管理折叠（`:1825-1842`，"绑定管理属维护功能不阻塞首次配置"）。

## 2. 导出与关键符号

1 导出：`FeishuSettings`（`:1825`）。常量：`STATUS_CONFIG` 4 态（`:55-60`）、`FEISHU_SCOPES_JSON` 17 tenant scopes（`:64-87`，一键复制到开放平台）、`FEISHU_TUTORIAL_VIDEO`（**url 留空不渲染+TODO 待回填**，`:89-102`）。内部：视频归一化组件（`:106`）、`FeishuConfigTab`/`FeishuBindingsTab`、扫码注册 Dialog（`:906-`）、CLI/MCP 隐藏段（`:1815`）等。

## 3. 内部逻辑与关键流程

- 多 Bot 管理：feishuBotStatesAtom 多桥状态、每 Bot 凭证（SettingsSecretInput）/启停（Power/PowerOff）/测试。
- **扫码注册**（`:906-940`）：`registerFeishuApp`+`onFeishuRegisterQrcode/onFeishuRegisterStatus` 事件→phase 状态机（idle/qrcode/success/error）；status 子态 `polling/slow_down/domain_switched`（`:988-990`，含**国际版域名切换**）；成功自动保存凭证并启动 Bot（`:957,1009`）；卸载 cleanup→`cancelFeishuRegistration`（`:938`）；abort 错误静默（`:928-929`）。
- 绑定管理：`feishuBindingsAtom` 列表（群/单聊）→工作区/会话分配、删除确认；会话镜像设置（FeishuSessionMirrorSettings/FeishuSessionSyncMode）。
- 手动引导段+命令说明+复制 appId 等便利交互（Copy/Check 图标态）。

## 4. 调用者与调用链

- 入向：`BotHubSettings.tsx:15`（飞书面板，本批）。
- 出向：feishu-atoms/agent-atoms（pendingPrompt/工作区会话）、`useCreateSession`、shared 飞书类型组、`window.electronAPI`（飞书 bridge/注册/绑定 API）。

## 5. 数据 I/O、读写与副作用

飞书 Bot 配置与绑定持久化（主进程 bridge）；注册流程网络交互（飞书后端创建 PersonalAgent 应用，`:957`）；起 Stream 连接。

## 6. 分支、失败、取消与恢复

注册 4 相位+3 状态子态（§3）；abort 静默；测试失败条；删除绑定确认；无自动回滚。

## 7. 权限与权威状态

权限面=17 tenant scopes 常量（`FEISHU_SCOPES_JSON`，`:64-87`）；用户授权在飞书侧完成。

## 8. 修改影响面

飞书接入全链（配置/注册/绑定/镜像）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 注册相位机/17 scopes/绑定管理/教程 TODO | 已证实 | `:1-1842` 全文（分段逐段） |
| 飞书后端注册行为 | 边界 | 远端域外 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+常量+双 Tab+注册机 | §2/§3 | 55-1842 | covered |
