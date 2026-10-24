---
path: apps/electron/src/renderer/components/cdut-science/CsLabDeleteLabDialog.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 76e7c8bdb75d226cfbd2eab9a2268929a60d5f68
sha256: 996a24aa15cfdfd5e884643c32a13528876aa31d4b285b4950827640b8f0388d
lines: 132
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/CsLabDeleteLabDialog.tsx

## 1. 结论与边界

**实验室防误触彻底删除**（`apps/electron/src/renderer/components/cdut-science/CsLabDeleteLabDialog.tsx:1-6`）：**红线：必须输入与实验室完整名称一致的文本才允许确认**；确认后主进程**停止监听、关闭 SQLite、物理删除沙箱目录**（`:5`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabDeleteLabDialog` | 组件 | `:27-132` | `{lab…}` 彻底删除确认 |

## 3. 内部逻辑与关键流程

AlertDialog 确认→**完整名称输入校验**（`:4`，防误触）→删除（主进程物理删除）。

## 4. 调用者与调用链

- 消费方：CsLabWorkspaceView（删除入口）。
- 出向：cslab API（物理删除）。

## 5. 数据 I/O、读写与副作用

经 API 物理删除（停监听/关 SQLite/删沙箱目录，`:5`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 名称不符 | `:4` | 确认禁用 |
| 删除失败 | — | 错误显示 |

## 7. 权限与权威状态

**完整名称一致才可删**（`:4`）——防误触红线；物理删除不可逆（`:5`）。

## 8. 修改影响面

删除 API 合同（物理删除链）。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

1 个导出、防误触红线已证实（`:1-132`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| `CsLabDeleteLabDialog` | `:27-132` | covered |
