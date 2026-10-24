---
path: apps/electron/src/main/lib/feishu-bridge-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f194fce04d4514c702b2750f2abfd60265e58592
sha256: b83c3f73ae67eb5a0461404bcc8d78ec3efbac4bdb5a9e2ba2d86d8d26cca82a
lines: 219
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/feishu-bridge-manager.ts

## 1. 结论与边界

**飞书 Bridge 多 Bot 管理器**（219 行）：管理多个 FeishuBridge 实例生命周期/状态汇总/聚合查询，替代原单例（`:1-6`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `feishuBridgeManager` | `:219` | **唯一 export**（单例；类 `:23` 未导出） |

方法族：`startAll:30`（enabled+凭证过滤 `:32`，单 bot 失败不影响其余）、`stopAll:48`、`startBot:61`（先停旧再校验 `:63-75`）、`stopBot:83`/`restartBot:92`、`getStates:100`（遍历 **config.bots** 非 bridges `:100`，无实例给默认 disconnected）、`getBridge:121`/`getAllBridges:126`（**返回内部 Map 照实**）、`ensureSessionMirror:131`（review 守卫+未连接 warn 跳过）、`startSessionMirrorRun:147`（mode!=='stream' return）、`stopSessionMirrorRun:162`（**广播所有 bridges**）、`listAllBindings:172`/`findBridgeByChatId:181`、`sendCardToChat:192`（botId 缺失 fallback chatId 反查；未连接 throw）、`testConnection:205`（临时实例明文验证）。

## 3. 内部逻辑与关键流程

botId→FeishuBridge Map；生命周期单点+聚合查询+镜像路由（resolveSessionMirrorBot）。

## 4. 调用者与调用链

主进程 IPC/启动钩子+`automation-notification-service`（sendCardToChat）；出向 feishu-bridge/feishu-config/session-mirror/settings-service/agent-session-manager。

## 5. 数据 I/O、读写与副作用

Bot 实例启停；无持久化（配置在 feishu-config）。

## 6. 分支、失败、取消与恢复

单 bot 失败隔离；startBot throw 两处（不存在/未启用）；stop 链 try/catch 继续。

## 7. 权限与权威状态

review-owned 守卫（`:132`/`:148`/`:163`）与 bridge 层 19 闸口联动；镜像 bot 选取权威在 resolveSessionMirrorBot。

## 8. 修改影响面

改生命周期影响多 Bot 稳定性；sendCardToChat 契约联动通知服务。

## 9. 测试证据

**有直接测试（镜像守卫面）**：`apps/electron/src/main/lib/review/review-feishu-owner-boundary.p05.test.ts`（159 行，7 个 `test(`）直接 import feishuBridgeManager，用例 `:140` 验证 manager 与 bridge 双层镜像守卫对 owner 不分发到已连接 bridges；生命周期/startBot 失败残留等面仍无测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（矛盾照实记录，子agent 精读+字节核对）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单例/方法族/守卫 | 已证实 | 219 行全读 |
| **①** startBot 失败残留（`:78` 先 set 后 await `:79`，抛错留未启动实例）；先停后校验（`:63-75`）restart 抛错致 bot 停态丢失 | 已证实 | `:61-79` |
| **②** sendCardToChat 已存在但未连接直接 throw 不回退（fallback 仅 bridge undefined `:193`）；**③** 未连接失败口径不一（warn `:139` vs 静默 `:157`）；**④** getAllBridges 泄漏内部 Map；**⑤** stop 广播 vs start 定向不对称 | 已证实 | `:193-199`/`:139`/`:157`/`:126`/`:162` |
| FeishuBridge.testConnection 用参数还是 config | 未知 | 未验证（照实） |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 单例/方法族 | §2/§3 | covered |
| 5 矛盾 | §10 | covered |
