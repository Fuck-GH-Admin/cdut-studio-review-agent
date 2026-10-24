---
path: packages/ui/src/primitives/loading-indicator.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 98c2d23df2fa0f1fee756e8a68d24d5e491692bc
sha256: 16c35e341f065222a3f697f276eee9d9967444b28af634cc51a4b82e62a0dfb1
lines: 112
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-47-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/ui/src/primitives/loading-indicator.tsx

## 1. 结论与边界

带标签与已用时间的加载指示器（头注释 :31-54）：Spinner/静态点 + 可选标签 + 可选耗时（自动追踪或传入起始时间戳）。唯一有状态原语之一。

## 2. 导出与关键符号

导出 1 条（`export` :56）：`LoadingIndicator(props: LoadingIndicatorProps)`（props :18-29 未导出：label?/animated=true/showElapsed: boolean|number=false/spinnerClassName?/size='sm'|'default'|'lg'）。内部：`formatDuration`（:10-16，<60s 显示 `N.Ns`、否则 `m:ss` 补零）。

## 3. 内部逻辑与关键流程

- 初始耗时（:65）：`showElapsed` 为数字时以其为开始时间戳（`Date.now()-showElapsed`）。
- 计时 effect（:70-88）：showElapsed 为数字→记 startTime=该值；true→首次记 `Date.now()`（:77-79）；`setInterval` 100ms 刷新（:81-85）；卸载 cleanup clearInterval（:87）。
- 渲染（:90-110）：`animated` 三元（Spinner :94 / 静态 ● :96-98）；label 可选（:102）；耗时仅 `elapsed>=1000` 显示（:105）。
- 不适用「权限/恢复」：依据=纯展示；取消语义=effect cleanup（:87）。

## 4. 调用者与调用链

入向（1，全生产）：`apps/electron/src/renderer/components/ai-elements/message.tsx:40`。出向：react、`../lib/cn`、`./spinner`（Spinner :3）。

## 5. 数据 I/O、读写与副作用

副作用：`setInterval` 定时器（100ms）+ cleanup；无 I/O。

## 6. 分支、失败、取消与恢复

showElapsed 数字/true/false 三分支（:65/:74-79）、animated 二分支（:93-99）、elapsed≥1s 才显示（:105）；无 throw。恢复不适用。

## 7. 权限与权威状态

不适用，依据：纯展示。

## 8. 修改影响面

`ai-elements/message.tsx`（agent 消息流加载态）；`./spinner` 契约。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；计时/三分支/cleanup | 已证实 | :56-112 |
| 1 使用点 | 已证实 | §4 |
| spinner 实现 | 未知（属 spinner.tsx，批外） | :94 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| LoadingIndicator+formatDuration | §2/§3 | :10-112 | covered |
| spinner 依赖 | §10 | :94 | unknown |
| 测试 | §9 | — | unknown |
