---
path: apps/electron/src/main/lib/bulletin-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ae1f9f4f4ac5a2de49f0f3e0f1b1dea4dd5c2e29
sha256: 1508b2e4746b3296ceeaa71068d060f17680ecda024ba219f357445b8e4b07de
lines: 42
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/bulletin-service.ts

## 1. 结论与边界

**本地系统公告栏服务**（42 行）：读内置 bulletin.json 返回公告列表；"零外部网络请求"（`:5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `getBulletins` | `:27-42` | 读公告；**文件缺失/解析失败返回空数组绝不抛错**（`:25`） |

内部：`getBundledResourcesDir:18-20`（dev `__dirname/resources`/prod `process.resourcesPath`）。

## 3. 内部逻辑与关键流程

资源目录判定→existsSync→readFileSync+JSON.parse→items 数组校验→try/catch 兜底。

## 4. 调用者与调用链

公告栏 UI（IPC 层）；出向 `electron` app、node:fs。

## 5. 数据 I/O、读写与副作用

读本地 JSON（无网络）。

## 6. 分支、失败、取消与恢复

缺失→warn+[]；解析失败→error+[]（绝不抛错契约）。

## 7. 权限与权威状态

**零网络契约**（`:5`）：数据随安装包本地维护。

## 8. 修改影响面

改读取影响公告展示；bulletin.json 随发版维护。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/绝不抛错契约 | 已证实 | 42 行全读 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
