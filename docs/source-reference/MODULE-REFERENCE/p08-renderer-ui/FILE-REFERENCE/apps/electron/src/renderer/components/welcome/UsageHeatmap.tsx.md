---
path: apps/electron/src/renderer/components/welcome/UsageHeatmap.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 32fe6105f2dc0fedc16468d01538723bfd102a88
sha256: cf97f47491bad1b6e3d87543fbfa8123d414783993f25380bcbd5680b8ca575f
lines: 234
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/welcome/UsageHeatmap.tsx

## 1. 结论与边界

**工作区编码活跃热力图**（234 行）：GitHub 贡献图式 7 行×26 周（约半年，`:21`；注释 `:9` 称 53 列约一年——**与实现 WEEKS=26 不一致照实**）；色阶走 `--primary` token 自动适配主题。空数据也渲染完整网格（`:150` 注释）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UsageHeatmapProps` | 接口 | `:115` | `workspaceId?`（显式指定否则当前工作区） |
| `UsageHeatmap` | memo 组件 | `:234` | memo 隔离防欢迎页秒级重渲染（注释 `:230-233`：182 Tooltip 节点） |

常量：CELL=11/GAP=3/WEEKS=26（`:18-21`）、`LEVEL_CLASSES` 5 档（`:27-33`，muted→primary/20/40/65/full）。内部：`formatLocalDate`（`:38`，**本机时区**避免 toISOString 东八区回退）、`buildWeekGrid`（`:45`，百分位 level 经 `toCalendarData`）、`formatTokens/formatLabel`（`:102,108`）。

## 3. 内部逻辑与关键流程

- 数据（`:127-139`）：`getWorkspaceHeatmapDaily(targetWorkspaceId)`；含当天实时增量（注释 `:126`）；cancelled 防竞态；失败→空数组照常渲染。
- 网格（`:45-100`）：Mon=0 对齐（`:49`）、未来格 null、月份标签 3 列内合并（`:87-91`）。
- 渲染（`:153-227`）：月份行/星期标签/网格（Tooltip 200ms delay，`:197`）/图例；level 0 格 `heatmap-empty-cell` 类。

## 4. 调用者与调用链

- 入向：`WelcomeEmptyState.tsx:34`（本批，showHeatmap 条件=agent 模式且非 team 工作区）。
- 出向：agent atoms、`@/lib/heatmap-utils`（toCalendarData）、shadcn Tooltip、`window.electronAPI.getWorkspaceHeatmapDaily`。

## 5. 数据 I/O、读写与副作用

读工作区热力日数据（IPC）；无写。

## 6. 分支、失败、取消与恢复

无 workspaceId→loading 结束；失败→空数组（`:136`）；unmount cancelled。

## 7. 权限与权威状态

无权限分支，依据：读展示数据。

## 8. 修改影响面

欢迎页活跃展示；memo 与秒级时钟渲染隔离联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| WEEKS=26/5 档色阶/网格算法/memo | 已证实 | `:1-234` 全文 |
| **注释 53 列与实现 WEEKS=26 不一致** | 已证实（照实记录） | `:9` vs `:21` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出+内部 | §2/§3 | 18-234 | covered |
