---
path: apps/electron/src/renderer/components/cdut-zone/GatekeeperNoticeModal.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f3c6f257db9d63a9b40b2f453e4e930585679eed
sha256: ec1512f71beab9c6100000aeaaf5dcd3846846ba5bdabcac5fa0817c7fc50efb
lines: 116
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/GatekeeperNoticeModal.tsx

## 1. 结论与边界

CDUT 专区统一门禁引导弹窗（文件头 `apps/electron/src/renderer/components/cdut-zone/GatekeeperNoticeModal.tsx:1-12`）：未登录特区账户调用 CDUT 工具集（8+1）→主进程派发 `cdut-zone:gatekeeper-blocked`→浮层（校徽+提示+【前往登录】/【稍后再说】+版权微标）。决策回传：前往登录→跳专区+`navigate_login`；稍后再说→`decline`（**大模型识别意图后自主安抚**）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GatekeeperNoticeModal` | 组件（导出） | 24-116 | 事件订阅+响应弹窗 |

## 3. 内部逻辑与关键流程

- 事件订阅（`:32-38`）：`onGatekeeperBlocked` 置 notice；卸载 unsub。
- `respond`（`:40-53`）：navigate_login **先切视图再回传**（`:44` 注释：保证放行后已在专区可直接登录）；`gatekeeperRespond({requestId,action})`；finally 清态。
- `useGlobalOverlay(!!notice)`（`:29-30`）：弹出时智联万站原生视口让位。
- 凭据承诺文案：「仅经操作系统安全加密保存在本地，绝不上云」（`:78-79`）。

## 4. 调用者与调用链

入向：全局（门禁事件）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：jotai（activeViewAtom/overlay-atoms）、`window.electronAPI.cdutZone`、`@/components/shared/CdutLogo`、`@profer/ui`（`Z_LAYER.confirm`）。

## 5. 数据 I/O、读写与副作用

IPC 事件订阅+`gatekeeperRespond`；视图切换副作用；全局 overlay 登记。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 无 notice | null | 55 |
| 提交中 | 按钮 disabled | 87,97 |
| respond 异常 | finally 清态 | 47-52 |

## 7. 权限与权威状态

门禁权威=主进程工具调用拦截；决策回传由主进程放行链消费；decline 意图交大模型自主安抚（`:11`）。

## 8. 修改影响面

改回传语义影响登录放行链；改文案影响引导。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 事件契约/决策回传 | 已证实 | `:1-12,40-53` |
| 先切视图后放行 | 已证实 | `:44` |
| overlay 让位 | 已证实 | `:29-30` |
| 真实门禁流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 24-116 | covered |
| 断言 | §9,§10 | — | unknown |
