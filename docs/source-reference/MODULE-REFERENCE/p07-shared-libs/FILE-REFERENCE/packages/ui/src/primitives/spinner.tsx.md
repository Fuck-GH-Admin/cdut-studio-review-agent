---
path: packages/ui/src/primitives/spinner.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dbd7addb538b279b87ed525d930999db24107a46
sha256: 0974bbafc7ec1d88781c43a51b9ec46cd545133fb6f7e511d7a5e33f804112ce
lines: 49
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# packages/ui/src/primitives/spinner.tsx

## 1. 结论与边界

3x3 网格加载动画（SpinKit Grid 风格，自实现非 Radix；注释 `packages/ui/src/primitives/spinner.tsx:12-21`）：em 单位随 font-size 缩放，纯展示无状态。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `SpinnerProps` | 导出接口 | 4-10 | `extends React.HTMLAttributes<HTMLDivElement>` + `size?: 'sm'\|'default'\|'lg'` | |
| `Spinner` | 导出函数组件 | 22-49 | `(props): React.ReactElement` | `size` 默认 `'default'` |

## 3. 内部逻辑与关键流程

`sizeClasses` 映射（`:27-31`）：sm→`text-sm`（约 21px）、default→`text-base`（约 24px）、lg→`text-lg`（约 27px，注释给出换算）。渲染：外层 `div`（`spinner text-muted-foreground` + size 类 + className，`role="status"` `aria-label="加载中"`，`:34-43`）内 9 个 `div.spinner-cube`（`Array.from({length:9})`，`:44-46`）；动画由皮肤 CSS 的 `.spinner/.spinner-cube` 提供。

## 4. 调用者与调用链

入向：**4 个消费文件**——`apps/electron/src/renderer/components/agent/AgentMessages.tsx:38`、`apps/electron/src/renderer/components/content-review/AssistantDrawer.tsx:17`、`apps/electron/src/renderer/components/content-review/RightPanel.tsx:7`、包内 `packages/ui/src/primitives/loading-indicator.tsx:3`（`:94` 渲染）。出向：`../lib/cn`、React。

## 5. 数据 I/O、读写与副作用

无（纯渲染；可访问性属性为静态）。

## 6. 分支、失败、取消与恢复

仅 size 三分支类名映射；无错误路径。

## 7. 权限与权威状态

无权限分支（纯展示）。

## 8. 修改影响面

size/class 改动影响 4 个消费组件的加载态显示；`spinner-cube` 类名与皮肤 CSS 耦合。

## 9. 测试证据

无测试（primitives 无 `*.test.*`）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出、size 映射、9 子块、aria | 已证实 | `packages/ui/src/primitives/spinner.tsx:4-49` |
| 4 个消费者行号（含包内 loading-indicator.tsx:3/:94，QA F-NB39-02 补漏属实） | 已证实 | §4 检索 |
| 动画实际帧率/表现 | 未知 | 由皮肤 CSS 提供，NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Spinner`/`SpinnerProps` | §2/§3 | 4-49 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
