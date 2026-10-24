---
path: apps/electron/src/main/lib/cslab/cslab-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0645b23aa40e293479ea32585641496971f4ca90
sha256: d2a199ee174245db3d122197459baf4721fbcb816c28938596861a41cbdbbcd9
lines: 115
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-service.ts

## 1. 结论与边界

**CSLab 后端运行状态服务**（`cslab-service.ts:1-6` 注释）：统一管理本地工作台遥测指标、运行时节点状态与审计日志（内存态，单例）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabService` | class（export） | `:23-113` | 单例（`getInstance` `:52-57`）；方法：getTelemetry/getNodes/getLogs/ping |
| `csLabService` | const（export） | `:115` | `CsLabService.getInstance()` |

内部：`getMemoryLoadPercent`（`:16-21`，0-100 钳制）、3 条种子日志（`:28-50`，SYS/INFO/SEC）、`startTime`（`:26`）。

## 3. 内部逻辑与关键流程

1. `getTelemetry`（`:62-78`）：uptime 秒、`status:'operational'`、`quantumCoherence/frequencyGhz` 恒 0（**历史契约字段**注释 `:69-70`）、`sysLoadPercent`=内存占用率（`:16-21`）。
2. `getNodes`（`:83-95`）：本机单节点（CDUT-LOCAL-01/LOCAL_RUNTIME/online/latency 0）。
3. `getLogs`（`:100-102`）：返回副本（防外部改内部态）。
4. `ping`（`:107-112`）：本机调用 latencyMs=0。

## 4. 调用者与调用链

入向：CSLab IPC/前端遥测面板（跨文件）。出向：`./cslab-types`（类型 `:9-13`）、`node:os`。

## 5. 数据 I/O、读写与副作用

内存态（单例）；os.totalmem/freemem 读取；无持久化/网络。

## 6. 分支、失败、取消与恢复

totalmem≤0→0（`:18`）；钳制 0-100（`:20`）。不适用取消/恢复。

## 7. 权限与权威状态

不适用（状态服务）；"本机访问密码门禁"仅是种子日志文案（`:48`，真实门禁在别处）。

## 8. 修改影响面

改遥测/节点形状 → CSLab 前端面板；历史契约字段（quantumCoherence/frequencyGhz）不可随意删。

## 9. 测试证据

无直接测试（负向：冻结树 `*.test.*` 检索 `CsLabService|csLabService` → 0 命中）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+3 内部+4 方法 | 已证实 | 逐行读 `:1-115` |
| 前端消费方 | 未知 | 跨文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 类+单例 | §2/§3 | `:23-115` | covered |
| 测试 | §9 | — | covered（无测试，NOT_RUN） |
