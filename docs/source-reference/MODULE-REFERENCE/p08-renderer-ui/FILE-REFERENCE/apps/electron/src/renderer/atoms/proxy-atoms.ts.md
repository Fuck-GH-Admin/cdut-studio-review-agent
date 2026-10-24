---
path: apps/electron/src/renderer/atoms/proxy-atoms.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d781dc2e3387a97145564d07124c920da000bff9
sha256: ce19ff29176df36313ddad1a7b53b74f0fec4691a1b4dc4b16eb2d4d0cf5229e
lines: 43
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/proxy-atoms.ts

## 1. 结论与边界

**代理配置 Atoms**（`apps/electron/src/renderer/atoms/proxy-atoms.ts:1-4`）：系统代理自动检测+手动配置。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `proxyConfigAtom` | atom | `:15` | 代理配置（从主进程获取） |
| `loadProxyConfigAtom` | atom | `:20-…` | 异步加载（async write） |
| `updateProxyConfigAtom` | atom | `:30-…` | 更新配置 |

## 3. 内部逻辑与关键流程

`loadProxyConfigAtom` 异步从主进程取；`updateProxyConfigAtom` 更新。

## 4. 调用者与调用链

- 消费方：设置页（代理）。
- 出向：主进程 IPC。

## 5. 数据 I/O、读写与副作用

IPC 读写代理配置。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

无身份语义。

## 8. 修改影响面

atom 形状与消费组件耦合。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

3 个导出已证实（`:15-43`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 3 个导出 | `:15-43` | covered |
