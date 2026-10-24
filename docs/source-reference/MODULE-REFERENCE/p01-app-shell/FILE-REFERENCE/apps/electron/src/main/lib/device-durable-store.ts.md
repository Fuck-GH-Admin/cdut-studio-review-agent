---
path: apps/electron/src/main/lib/device-durable-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b4c2bc0f0675103cd46b93da4c426be8b811787c
sha256: 83aa204e5127e76cb09b9a50aef10cb65400dc6b2860ee494858672a85bfd0d0
lines: 79
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/device-durable-store.ts

## 1. 结论与边界

**设备 ID OS 级持久化**（79 行）："扛住 `~/.cdutai` 被清空/应用重装"（`:2`）：Windows 注册表 HKCU/macOS login keychain/Linux 不支持回退（`:6-8`）；命名空间按 config 目录名区分 dev/正式版（`:10-11`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `readDurableDeviceId` | `:39-60` | 读 OS 级位置；不存在/不支持/失败→null |
| `writeDurableDeviceId` | `:63-79` | 写；失败静默降级仅 config 文件 |

内部：`ns:20-22`（`.cdutai`→`cdutai`）、`reg:28-36`（PATH 剥离 ENOENT 回退 System32 全路径 `:25-26`）。

## 3. 内部逻辑与关键流程

平台分支（reg.exe/security CLI）→正则解析输出→静默降级。

## 4. 调用者与调用链

设备身份（identity-service 链）；出向 config-paths（getConfigDirName）、child_process。

## 5. 数据 I/O、读写与副作用

注册表/keychain 读写（子进程）。

## 6. 分支、失败、取消与恢复

**全链静默降级**（`try/catch` 不抛不阻断登录 `:13-14`）。

## 7. 权限与权威状态

**"最坏退化为仅 device.json"契约**（`:13-14`）：仍能修复版本更新槽位 churn（清目录才丢）。

## 8. 修改影响面

改持久化影响设备槽位稳定性；命名空间联动 config-paths。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/降级契约 | 已证实 | 79 行全读 |
| **照实**：Linux 明示不支持（`:8`）；reg 输出正则依赖系统 locale 输出格式未核 | 已证实 | `:8`/`:46` |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
