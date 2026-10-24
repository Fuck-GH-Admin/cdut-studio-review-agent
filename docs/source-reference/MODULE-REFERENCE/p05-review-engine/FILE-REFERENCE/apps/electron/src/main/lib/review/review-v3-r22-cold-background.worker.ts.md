---
path: apps/electron/src/main/lib/review/review-v3-r22-cold-background.worker.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 21a7455f3c88ed6e4413c16b03800d0ca76d9c88
sha256: 9a2c24e79fd982284df3a67f31ec3b01f1b956be0bdf913f929f5841c99396df
lines: 21
kind: source
package: p05-review-engine
author: docs-r07-author-nb-47-20261023
reviewer: p05-review-engine
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-r22-cold-background.worker.ts

## 1. 结论与边界

R22 冷读 worker（21 行，独立 Bun 进程脚本）：只读 A 层持久后台 spool 的 `background.json`，输出 `R22_COLD` JSON 行。文件头 :2-4：永不打开 Provider、不接管旧 Main 任务。模块级副作用脚本（无导出、import 即执行）。

## 2. 导出与关键符号

无导出（`export` 0 命中）。结构：argv 解析（:10-11）→ `trust` 端口对象（:12-17）→ `inspect` 输出（:18-21）。

| 片段 | 行 | 说明 |
| --- | --- | --- |
| argv 校验 | `:10-11` | `const [dir,caseId]=process.argv.slice(2)`；缺任一抛 `Error('R22 cold worker requires exact root/case')` |
| `trust: A22BackgroundTrustPort` | `:12-17` | `storeForCase` 返回 `createFileOwnerPersistence(dir+'/background.json')`；`assertCurrent`/`driverForCase` 直接抛（cold worker 不能授权执行/调 SDK） |
| 输出 | `:18-21` | `new V3ABackgroundTechnicalCoordinator(trust).inspect(caseId)` → stdout `R22_COLD {pid,state,reason,requestId,caseId}` |

## 3. 内部逻辑与关键流程

构造协调器（其构造校验 `A22BackgroundTrustPort` 三方法存在，见 `review-v3-background-technical-coordinator.ts:96-102`）→ `inspect(caseId)`：冷 PID 对他进程 running/stopping 投影 `recovery-required`/`COLD_PID_OR_UNKNOWN_PROVIDER_EFFECT`（coordinator :128-139）→ 单行 JSON 写 stdout。

## 4. 调用者与调用链

入向：仅 `apps/electron/src/main/lib/review/review-v3-r22-concentrated.test.ts:120`（路径字符串引用，`spawnSync` 子 PID 冷读 :246-248）。**否定**：无生产启动方（`review-v3-r22-cold-background\.worker` 全树字符串检索仅该测试 1 命中）。出向：`review-pi-owner-adapter`（`createFileOwnerPersistence` :13）、`review-v3-background-technical-coordinator`（:17 new、类型 :12）。

## 5. 数据 I/O、读写与副作用

只读 `dir+'/background.json'`（经 `createFileOwnerPersistence`）；写 stdout 一行。无网络、无写盘。副作用：进程启动/退出即结束。

## 6. 分支、失败、取消与恢复

argv 缺失抛错（:11）；`assertCurrent`/`driverForCase` 若被调用即抛（:14-15，防御性——`inspect` 不触达它们）。无恢复语义（一次性脚本）。

## 7. 权限与权威状态

冷读模型：本进程无 Owner/授权（:14-15 抛错设计即权威声明）；读到的 running/stopping 一律不接管（coordinator 冷读语义）。

## 8. 修改影响面

被 `review-v3-r22-concentrated.test.ts`（R22-C-03）spawnSync 使用；输出格式 `R22_COLD ` 前缀 + JSON 字段是测试契约（:250-254 断言 state/reason/pid）。

## 9. 测试证据

直接测试：`review-v3-r22-concentrated.test.ts`（批内）R22-C-03（:231-269，NOT_RUN）：linux-only（:232 守卫，非 linux 静默跳过）、真子 PID、断言输出 `recovery-required`/`COLD_PID_OR_UNKNOWN_PROVIDER_EFFECT`、`pid !== process.pid`、journal 字节不变。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 无导出；import 即执行 | 已证实 | 全文件 :1-21 |
| assertCurrent/driverForCase 防御性抛错 | 已证实 | :14-15 |
| 无生产启动方（仅 r22 测试 spawnSync） | 已证实（否定） | 全树字符串检索（§4） |
| 实际 spawn 执行行为（Bun 进程模型） | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| argv 校验/输出 | §2/§3 | :10-21 | covered |
| trust 端口抛错防御 | §2/§6 | :12-17 | covered |
| 生产调用者 | §4 | — | covered（否定，检索见 §4） |
| 运行行为 | §10 | — | unknown（NOT_RUN） |
