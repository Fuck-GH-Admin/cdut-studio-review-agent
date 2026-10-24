---
path: apps/electron/src/main/lib/changelog-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9d6053f84ad96ce9495931aa568902f929ff7e09
sha256: f94cd8502fc0466d4121ed48ffc129c3d1b29721513d85097949638ee2e4a2ba
lines: 42
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/changelog-service.ts

## 1. 结论与边界

**版本更新日志服务**（42 行）：读内置 CHANGELOG.json 返回版本记录（新版本在前）；"不依赖 GitHub 等外部服务"（`:5`）。

## 2. 导出与关键符号

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `getChangelog` | `:27-42` | 读 releases 数组；缺失/失败返回空数组（`:25`） |

内部：`getBundledResourcesDir:18-20`（与 bulletin 同构——同文件内重复实现，照实）。

## 3. 内部逻辑与关键流程

与 bulletin-service 完全同构（资源目录→读→解析→兜底）。

## 4. 调用者与调用链

更新日志 UI（IPC 层）；出向 `electron`、node:fs。

## 5. 数据 I/O、读写与副作用

读本地 JSON。

## 6. 分支、失败、取消与恢复

缺失→warn+[]；失败→error+[]。

## 7. 权限与权威状态

本地数据契约（发版时维护）。

## 8. 修改影响面

改读取影响更新日志展示；release 数据随发版维护在 CHANGELOG.json，与 bulletin-service 共用 getBundledResourcesDir 同构实现（dev/prod 路径判定）。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件 | 已证实 | 42 行全读 |
| **照实**：getBundledResourcesDir 与 bulletin-service 逐字重复（`:18-20`） | 已证实 | 两文件对拍 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
