---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuErrorPage.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a7aa96f107d5051b3f10520e8a12fb320c98fecb
sha256: d193ca49eb4c6252898768f7c78d87285fcef202dee604761f29b5fde824531e
lines: 82
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuErrorPage.tsx

## 1. 结论与边界

智联万站网络故障自愈诊断卡片（文件头 `apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuErrorPage.tsx:1-8`）：主框架加载失败（`did-fail-load`，**非用户主动取消**）→主进程置错误态广播→渲染错误码/失败 URL/人性化排查指引+「净化缓存并重试」与「系统浏览器打开」两种自愈操作。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuErrorPage` | 组件（导出） | 24-82 | `{error:YanhuTabError,onRetry,onOpenExternal}`（`:15-22`） |
| `YanhuTabError` | 外部 | 13 | `@profer/shared`（errorCode/errorDescription/failedUrl） |

## 3. 内部逻辑与关键流程

纯展示：错误描述+错误码（`:42-43`）；failedUrl 条件展示（`:45-49`）；固定排查清单（校园网/VPN/维护/网络，`:51-58`）；重试按钮（净化陈旧动态签名缓存后重载，`:18` 注释）；外开按钮 `disabled={!error.failedUrl}`（`:72`）。

## 4. 调用者与调用链

入向：智联万站标签页（error 态渲染）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@profer/shared`。

## 5. 数据 I/O、读写与副作用

纯渲染；回调交父级。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| failedUrl 空 | 不展示+外开禁用 | 45-49,72 |

## 7. 权限与权威状态

错误态权威=主进程 `did-fail-load` 判定（排除用户取消）；自愈=净化缓存重试语义。

## 8. 修改影响面

改排查文案/自愈操作影响网络故障体验。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 诊断/自愈契约 | 已证实 | `:1-8,24-82` |
| 真实故障流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 15-82 | covered |
| 断言 | §9,§10 | — | unknown |
