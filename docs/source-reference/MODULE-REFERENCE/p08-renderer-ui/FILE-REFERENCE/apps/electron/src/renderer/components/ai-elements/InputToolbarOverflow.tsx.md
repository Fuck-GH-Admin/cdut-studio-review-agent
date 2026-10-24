---
path: apps/electron/src/renderer/components/ai-elements/InputToolbarOverflow.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8d93ed2aabd3ee98f90f1374bae2a148d113cf3c
sha256: 79ceb252f3e1b11ff0737c8dd44182c3ce5242b750d2864abbc8415f36be2532
lines: 233
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/ai-elements/InputToolbarOverflow.tsx

## 1. 结论与边界

输入框底部工具栏**响应式折叠容器**（233 行）：宽度不足时按尾部优先把多余按钮折叠进「更多」Popover（`:2-5`）。关键设计（`:7-14`）：每 item 任意时刻只挂载一次（防 IPC 订阅双挂载）；首帧全量测量→下帧算可见数；ResizeObserver 双监听（容器+各 item 宽度）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `ToolbarItemPlacement` | `:28` | 'toolbar'\|'overflow' |
| `ToolbarItem` | `:30-42` | `key`+`node?`（旧入口兼容 `:34-37`）+`render?(placement)`（**禁止为 overflow 复制第二个业务组件** `:38`）+`label?` |
| `InputToolbarOverflow` | `:60-233` | 主容器：测量/折叠/溢出 Popover |

内部：`DEFAULT_GAP_PX=6:57`、`DEFAULT_MORE_BUTTON_PX=36:58`、容器宽度监听（`:74-92`）、`readWidths:96-110`、item 观察（`:116-130`，**依赖键签名防死循环** `:114` 注释 React #185 教训）、`visibleCount:137-160`（累加超宽→为「更多」预留倒推；**缺失宽度按 0 计** `:139-141` 注释解释空态按钮）、`renderItem:167-169`。

## 3. 内部逻辑与关键流程

测量链：layout effect 注册 ResizeObserver→readWidths（0.5px 阈值）→visibleCount 计算→主行/溢出二分渲染（同一 render 函数按 placement 渲染一次）。

## 4. 调用者与调用链

Composer 输入框工具栏（模型选择/附件等）；出向 `@profer/ui`（Button/Popover/Tooltip）。

## 5. 数据 I/O、读写与副作用

DOM 测量（getBoundingClientRect/ResizeObserver）；无持久化。

## 6. 分支、失败、取消与恢复

containerWidth 0→全量显示再测量（`:135-138`）；raf 合帧防抖；observer 清理。

## 7. 权限与权威状态

**单次挂载契约**（`:8-9`）：item 仅在一处渲染（防副作用双跑）；`render(placement)` 强制声明式。

## 8. 修改影响面

改折叠算法影响窄窗体验；ResizeObserver 依赖键防死循环（`:112-114`）是稳定性关键。

## 9. 测试证据

无直接测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件测量/折叠/单挂载契约 | 已证实 | 233 行全读 |
| **历史 Bug 注释**（React #185 死循环 `:114`、空态按钮折叠失效 `:139-141`） | 已证实 | 注释原文 |
| 测量实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；实效 unknown。
