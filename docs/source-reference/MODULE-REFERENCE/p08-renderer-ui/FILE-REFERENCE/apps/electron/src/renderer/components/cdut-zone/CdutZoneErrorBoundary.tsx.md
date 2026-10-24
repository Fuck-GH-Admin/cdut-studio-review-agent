---
path: apps/electron/src/renderer/components/cdut-zone/CdutZoneErrorBoundary.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: aafeed8c43783304d424eab888729b6d67f45ac9
sha256: ba9636c0a64ae05c252534cc4ce843927e1c9e2cf6fb3f5ae4c676385560fea7
lines: 72
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/CdutZoneErrorBoundary.tsx

## 1. 结论与边界

CDUT 专区局部异常熔断保护器（文件头 `apps/electron/src/renderer/components/cdut-zone/CdutZoneErrorBoundary.tsx:1-6`）：拦截业务域抽屉/Bento 卡片/子页面未捕获异常，**杜绝单组件崩溃致整个 Electron 窗口白屏**；友好错误卡+一键重试复位。

## 2. 导出与关键符号

`export` 逐条核对：1 个类 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CdutZoneErrorBoundary` | 类（导出） | 24-72 | `getDerivedStateFromError:30-32`；`componentDidCatch:34-36`（console.error）；`handleReset:38-40`（setState 清错）；`render:42-72`（降级卡/children） |
| `Props`/`State` | 内部接口 | 14-22 | `{children,fallbackTitle?}`/`{hasError,error}` |

## 3. 内部逻辑与关键流程

异常→`getDerivedStateFromError` 置态→降级卡（错误图标+`fallbackTitle ?? 'CDUT 专区组件加载异常'`+`error.message` 兜底文案+「重新加载组件」按钮复位）。正常→`children`。

## 4. 调用者与调用链

入向：CDUT 专区各业务域抽屉/卡片包裹；测试：`CdutZoneErrorBoundary.test.ts`（28 行，本批）。出向：`lucide-react`、`@profer/ui/primitives/button`。

## 5. 数据 I/O、读写与副作用

`console.error` 上报（`:35`）；本地 state。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 渲染异常 | 降级卡 | 42-56 |
| message 缺 | 兜底文案 | 51 |
| 重试 | setState 清错重渲染 | 38-40 |

## 7. 权限与权威状态

熔断边界权威=本组件（局部降级优于全局白屏）。

## 8. 修改影响面

影响专区容错；错误文案与复位交互。

## 9. 测试证据

直接测试：`CdutZoneErrorBoundary.test.ts`（28 行，详见其手册）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 熔断/复位契约 | 已证实 | `:1-6,24-72` |
| 真实崩溃恢复 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单类 | §2,§3 | 14-72 | covered |
