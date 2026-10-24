---
path: apps/electron/src/renderer/components/cdut-science/CsLabAuthGate.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 790acd602ecc0bab6ae56cb81045cd51b0e98119
sha256: c9a1b67b926aee322fe375dcc4bd8de9102427b672ce8da0312b56a19360093d
lines: 226
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabAuthGate.tsx

## 1. 结论与边界

**CDUT Science 本机访问密码门禁**（`apps/electron/src/renderer/components/cdut-science/CsLabAuthGate.tsx:1-10`）：双态——首次设密（两次确认，≥6 位）/日常验密。**验证与凭据存储全部主进程；渲染层只提交密码接收结果，不接触密文**（`:8`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabAuthGate` | 组件 | `:84-226` | 门禁组件 |

## 3. 内部逻辑与关键流程

双态渲染（`:4-6`）：设密（两次一致+≥6 位）/验密解锁；经主进程 API 提交/接收。

## 4. 调用者与调用链

- 消费方：`CdutScienceView`（门禁页）。
- 出向：`window.electronAPI.cslab`（设密/验密）。

## 5. 数据 I/O、读写与副作用

IPC 提交密码；**不接触密文**（`:8`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 设密不一致/<6 位 | `:5` | 拒 |
| 验密失败 | — | 错误显示 |

## 7. 权限与权威状态

**凭据存储/验证在主进程**（`:8`）——渲染层不接触密文（红线）。

## 8. 修改影响面

cslab auth IPC 合同。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、不接触密文红线已证实（`:1-226`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabAuthGate` | `:84-226` | covered |
