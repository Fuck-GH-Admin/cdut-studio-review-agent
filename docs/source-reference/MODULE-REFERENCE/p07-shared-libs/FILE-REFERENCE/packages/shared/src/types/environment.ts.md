---
path: packages/shared/src/types/environment.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: be003f1d30fea56af35392715e56feb1af7d5a9a
sha256: d8401d75d4c189b8b7368af4335816f48e68cad0e2553083d507037abad9b193
lines: 60
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/environment.ts

## 1. 结论与边界

环境检测（Node.js/Git）共享契约：3 个结果接口 + 1 个 IPC 通道常量。供主进程环境检测（`initializeRuntime`/设置页环境面板）与渲染层共用。

不做的事：不执行检测（检测逻辑在主进程）；无版本号常量（阈值只写在注释：Node ≥18 最低 / ≥22 推荐、Git ≥2.0）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `NodeJsCheckResult` | interface | `:11-22` | `{installed; version?; meetsMinimum(≥18); meetsRecommended(≥22); downloadUrl}` |
| `GitCheckResult` | interface | `:27-36` | `{installed; version?; meetsRequirement(≥2.0); downloadUrl}` |
| `EnvironmentCheckResult` | interface | `:41-52` | `{nodejs; git; platform:Platform; hasIssues; checkedAt}` |
| `ENVIRONMENT_IPC_CHANNELS` | const `as const` | `:57-60` | 1 键：`CHECK='environment:check'` |

import：`Platform` 自 `./runtime`（`:6`）。

## 3. 内部逻辑与关键流程

纯声明。`hasIssues`（`:48-49` 注释：未安装或版本不满足）由主进程计算后写入，非派生属性。阈值（18/22/2.0）只在注释（`:18-19`、`:33`），**类型层不含阈值常量**——改阈值要改主进程检测实现，本文件注释需人工同步。

## 4. 调用者与调用链

preload `checkEnvironment`（`preload/index.ts:2651-2653`，invoke `environment:check`）；主进程环境检测服务（`runtime-init`/`environment` 检测器）；设置页环境面板。出向：`./runtime` 的 `Platform`。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。

## 6. 分支、失败、取消与恢复

不适用；失败语义（检测命令不存在等）收敛为 `installed:false` 结果，不抛错（注释语义，实现在主进程）。

## 7. 权限与权威状态

无权限语义；`hasIssues`/`meets*` 的裁决权威在主进程检测实现。

## 8. 修改影响面

改字段影响环境面板 UI 与一键安装联动（`installer.ts` 的 downloadUrl 同源）；阈值注释改动需同步主进程检测逻辑（无编译期关联）。

## 9. 测试证据

无直接测试（检索 `NodeJsCheckResult`/`ENVIRONMENT_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出、字段/常量值如 §2 | 已证实 | 文件全读 |
| 阈值仅存于注释 | 已证实 | `:18-19`、`:33` |
| 主进程检测的实际阈值与注释一致 | 未知 | 检测实现不在本批，未逐行核 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 4 导出全量 | §2 | covered |
| hasIssues 语义/阈值边界 | §3 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |
