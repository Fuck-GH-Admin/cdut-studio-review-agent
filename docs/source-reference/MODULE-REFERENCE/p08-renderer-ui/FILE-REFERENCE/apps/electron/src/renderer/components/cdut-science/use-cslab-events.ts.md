---
path: apps/electron/src/renderer/components/cdut-science/use-cslab-events.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 129b5c1c3d444c926e961cc5c04c76e1659f9385
sha256: d3f08ff2a1bb99d8af57db7fdfa1eb25abd2a20246a192f58c83f4bc29238697
lines: 175
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-science/use-cslab-events.ts

> **r1 校订说明**：行号经源文件逐行读取核对；符号定位以符号名为准。

## 1. 结论与边界

CSLab 主进程事件订阅 hook（175 行，头注 :1-5）：摄取进度/资产变更/胶囊陈旧等事件写入 Jotai 并回调工作台刷新。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `useCsLabEvents` | hook | 20-175 | 15 类事件订阅+清理 |

## 3. 内部逻辑与关键流程

1. 各 `on*` 订阅（progress/asset/stale/zoteroSynced/zoteroStatus/toolProgress/vaultChanged/dagJobsCancelled/toolsChanged/shareStatus/hpcJob/hpcMfa/plotUpdated/structureFocused）：过滤 labId→写 jotai 或 `handlersRef.current.*` 回调（ref 保鲜 :14-16）。
2. **科学助理窗口守卫**（注释 :84-86）：独立窗口没有 StageGrid——`window=science-agent` 时**静默忽略截图请求**（否则回传 error 误杀主工作台合法请求）。
3. 清理函数逐个 off（:108-127）。

## 4. 调用者与调用链

入向：CSLab 工作台/科学助理窗口。出向：`window.electronAPI.cslab.on*`（15 个）、jotai atoms、handlers 回调。

## 5. 数据 I/O、读写与副作用

IPC 事件订阅；写 jotai；无磁盘。

## 6. 分支、失败、取消与恢复

labId 不符跳过；卸载全 off；回调错误吞。

## 7. 权限与权威状态

- 事件路由权威：labId 过滤防串台；科学助理窗口静默降级（:84-86 注释明示原因）。无 sender/role 检查。

## 8. 修改影响面

工作台实时刷新/快照请求：CSLab 工作台/科学助理窗口的主进程事件→jotai/回调。
- 波及面：15 类事件的 labId 过滤、handlersRef 回调、卸载清理；`onRequestStructureSnapshot` 与 StageGrid 联动。
- 回归关注：科学助理窗口静默忽略截图请求（防误杀主工作台合法请求）不被「修整齐」删除。
- 无专属测试文件（全树检索确认）；回归须靠事件流人工验证。

## 9. 测试证据

直接测试：无。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出/行号 | 已证实 | 逐行核对 |
| 科学助理窗口守卫 | 已证实 | :84-96 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `useCsLabEvents` 订阅/清理 | §3 | 20-175 | covered（未测） |
| 快照请求守卫 | §3.2 | 84-96 | covered（未测） |
