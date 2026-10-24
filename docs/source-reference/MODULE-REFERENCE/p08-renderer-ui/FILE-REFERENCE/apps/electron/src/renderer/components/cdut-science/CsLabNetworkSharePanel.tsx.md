---
path: apps/electron/src/renderer/components/cdut-science/CsLabNetworkSharePanel.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a0ae2aa57c76d79e2ccb8a2bec5a24c7406a478
sha256: 186d6f71fa84153e6387bf1ea2665b6cfeeb6967284c4d6ad06d2383b7e0bcfd
lines: 452
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabNetworkSharePanel.tsx

## 1. 结论与边界

**局域网仪器共享盘**（`apps/electron/src/renderer/components/cdut-science/CsLabNetworkSharePanel.tsx:1-6`）：只做三件事——登记源/观察候选生命周期/必要时手动扫描。**租约等级必须如实展示**（独占读租约/内联租约/流式稳定性校验，`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabNetworkSharePanel` | 组件 | `:80-452` | 共享盘面板 |

## 3. 内部逻辑与关键流程

登记源→候选生命周期观察→手动扫描（`:4`）；租约等级如实展示（`:5`）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（共享区）。
- 出向：共享盘 API。

## 5. 数据 I/O、读写与副作用

经 API 登记/扫描；无本地写。

## 6. 分支、失败、取消与恢复

加载/空态；扫描失败。

## 7. 权限与权威状态

**租约等级如实展示**（`:5`）——不虚报租约。

## 8. 修改影响面

租约等级三态；共享盘 API 合同。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、租约如实红线已证实（`:1-452`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabNetworkSharePanel` | `:80-452` | covered |
