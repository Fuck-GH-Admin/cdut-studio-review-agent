---
path: apps/electron/src/renderer/lib/capabilities-toast.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eb9114e901a305435dece6cd077d2dc61f47f582
sha256: 508f75f3f5441ccae17dfa5e406ca383ec661de9bec0968a57cedee81ff4f574
lines: 44
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/capabilities-toast.ts

## 1. 结论与边界

**能力变化 toast 通知**（44 行）：把工作区能力（MCP/Skill）变更渲染为中文 toast；1-3 条逐条、4+ 条合并摘要（`capabilities-toast.ts:18-21`）。边界：只消费 `CapabilityChange[]`，不计算 diff（diff 在 main.tsx 的 `diffCapabilities`）。

## 2. 导出与关键符号

导出 1 个函数、0 常量、0 类型：`showCapabilityChangeToasts`（`capabilities-toast.ts:22`）。内部符号 1 个：`CHANGE_LABELS: Record<CapabilityChange['type'], string>`（`capabilities-toast.ts:5`，内部，8 种 type 的中文标签表）。

## 3. 内部逻辑与关键流程

单函数（`capabilities-toast.ts:22-44`）：`:23` 空数组短路返回；`:25-34` ≤3 条分支逐条遍历——`:28` 以 `_added`/`_enabled` 后缀判正向，`:30` toast.success、`:32` toast.info；`:35-43` ≥4 条分支统计 `mcp_`/`skill_` 前缀数量（`:37-38`），拼 `parts`（`:40-41`），`:42` 一条 toast.info 摘要「工作区配置已更新：…」。

## 4. 调用者与调用链

- 入向：`apps/electron/src/renderer/main.tsx:116` import、`:377` 调用（getWorkspaceCapabilities().then 内，diffCapabilities 结果传入）。
- 出向：`toast` from `sonner`（`capabilities-toast.ts:1`）；类型 `CapabilityChange` from `@profer/shared`（`:2`）。
- 动态调用：未知；检索方式——冻结树 grep `capabilities-toast|showCapabilityChangeToasts`（*.ts/*.tsx），无 import()/require()，preload 桥无引用。

## 5. 数据 I/O、读写与副作用

无模块级状态。副作用：调用 sonner `toast.success`/`toast.info` 弹出 UI 通知（`:30`、`:32`、`:42`）。无 DOM/窗口/IPC。

## 6. 分支、失败、取消与恢复

空数组 → 直接返回（`:23`）；≤3 条逐条（`:25`）；≥4 条合并（`:35`）；正向/负向 toast 分流（`:28-33`）。无 throw、无异步、无取消路径。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。

## 8. 修改影响面

`main.tsx:377` 工作区能力变化通知；`CHANGE_LABELS` 或阈值（3↔4）改动直接影响通知密度与文案。

## 9. 测试证据

`NOT_RUN`（本轮未运行测试，纯静态阅读）。直接测试：无（冻结树 grep `showCapabilityChangeToasts` 仅 main.tsx 与本文件，未见测试 import）。断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 阈值分流与文案拼装 | 已证实 | `capabilities-toast.ts:25-43` |
| toast 实际弹出效果 | 未知 | NOT_RUN，UI 运行态未验证 |
| 测试实际通过 | 未知 | 无测试文件 |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| showCapabilityChangeToasts | §2/§3/§6 | 22-44 | covered |
| CHANGE_LABELS | §2 | 5-14 | covered |
