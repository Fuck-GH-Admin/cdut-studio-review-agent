---
path: apps/electron/src/renderer/atoms/dingtalk-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ee42106d039d34685388289801a05809d0dcc7bb
sha256: 7ee167e90177b6d1cddcf0f29064131bde892569ff5cfcc6bb666f40f0184746
lines: 27
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/dingtalk-atoms.ts

## 1. 结论与边界

钉钉多 Bot Bridge 连接状态的 Jotai 状态层（27 行，头注释 `:1-5`）：botId→状态映射 + 两个派生（任一已连接、向后兼容单状态视图）。纯状态声明，无 I/O。

**边界**：不做桥接通信（Bridge 逻辑在别处，跨批）；不持久化。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `dingtalkBotStatesAtom` | atom（导出） | 11 | `Record<string, DingTalkBotBridgeState>` 初值 `{}` | 全部 Bot 状态 |
| `dingtalkAnyConnectedAtom` | 派生 atom（导出） | 14-17 | `some((s) => s.status === 'connected')` | 任一已连接 |
| `dingtalkBridgeStateAtom` | 派生 atom（导出） | 20-24 | `DingTalkBridgeState` | 向后兼容：取第一个 Bot，空→`{status:'disconnected'}` |
| `dingtalkConnectedAtom` | 常量（导出） | 27 | `= dingtalkAnyConnectedAtom` | 别名 |

导出合计 4。`DingTalkBridgeState`/`DingTalkBotBridgeState` 来自 `@profer/shared`（`:8`）。

## 3. 内部逻辑与关键流程

1. `dingtalkAnyConnectedAtom`（`:14-17`）：`Object.values(states).some(status==='connected')`。
2. `dingtalkBridgeStateAtom`（`:20-24`）：`Object.values(states)[0] ?? {status:'disconnected'}`——**取第一个 Bot**（对象键序），空映射回退 disconnected。

## 4. 调用者与调用链

入向（全冻结树检索 `dingtalk-atoms`，3 文件）：`renderer/main.tsx:101`（`dingtalkBotStatesAtom`）、`components/settings/DingTalkSettings.tsx:17`、`components/settings/BotHubSettings.tsx:13`。`dingtalkAnyConnectedAtom`/`dingtalkBridgeStateAtom`/`dingtalkConnectedAtom` 除内部别名关系外无独立 import（检索范围=baseline/source 全树）。
出向：`jotai`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯 Jotai atom 声明）。状态在内存 store。

## 6. 分支、失败、取消与恢复

分支：空映射回退（`:23`）；无 throw（不适用，依据：全文无 throw）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。权威状态=Bridge 上报的 Bot 状态（写入方在 main.tsx 等，跨批）。

## 8. 修改影响面

3 个消费方的连接指示 UI（钉钉设置/BotHub/主入口）；`dingtalkBridgeStateAtom` 的"取第一个"语义与单 Bot 旧 UI 兼容（多 Bot 下不完整，照实）。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `dingtalk-atoms` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/派生语义/空回退 | 已证实 | `:1-27` 全文逐行 |
| 3 个调用方 | 已证实 | 全树检索（§4） |
| Bridge 状态写入时机 | 边界（跨批） | main.tsx 等 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 个导出 | §2/§3 | 11-27 | covered |
