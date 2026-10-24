---
path: apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuBlockedPage.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 950a96bf497c815255280ed7c4524a6728919d15
sha256: 52f30d73ae01ebf105d1adf612442898c956b57d1a13062a3f62b6f5a74687f4
lines: 89
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuBlockedPage.tsx

## 1. 结论与边界

智联万站内置拦截卡片（文件头 `apps/electron/src/renderer/components/cdut-zone/yanhu/YanhuBlockedPage.tsx:1-9`）：主进程安全网关阻断非网页协议（`mailto:`/`javascript:`/`file:`）后标签置 `yanhu://blocked?target=…` 哨兵，本组件渲染规定文案+三按钮（返回上一页/回到办事大厅/系统浏览器打开外链）。视觉：校徽安全护盾矢量（红金辉光+立体阴影，夜间降辉光）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `YanhuBlockedPage` | 组件（导出） | 23-89 | `{targetUrl,onBack,onGoHome,onOpenExternal}`（`:15-21`） |
| `YANHU_DEFAULT_HOME_URL` | 外部 | 13 | `@profer/shared`（可信入口展示 `:83-85`） |

## 3. 内部逻辑与关键流程

纯展示组件：规定文案（中英双语 `:40-45`）+targetUrl 条件展示（line-clamp 防长 URL，`:47-51`）+三按钮（外链按钮 `disabled={!targetUrl}`，`:74`）。

## 4. 调用者与调用链

入向：智联万站标签页（`yanhu://blocked` 哨兵匹配后渲染）；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@profer/shared`。

## 5. 数据 I/O、读写与副作用

纯渲染；回调交父级（导航/外开）。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| targetUrl 空 | 不展示+外开禁用 | 47-51,74 |

## 7. 权限与权威状态

拦截权威=主进程安全网关（哨兵 URL）；本组件仅呈现与引导。

## 8. 修改影响面

改文案/按钮影响拦截体验。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 哨兵契约/三按钮 | 已证实 | `:1-9,23-89` |
| 真实拦截流 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 单组件 | §2,§3 | 15-89 | covered |
| 断言 | §9,§10 | — | unknown |
