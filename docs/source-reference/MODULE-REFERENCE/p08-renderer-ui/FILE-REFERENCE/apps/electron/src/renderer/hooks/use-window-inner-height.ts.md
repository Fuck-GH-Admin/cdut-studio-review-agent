---
path: apps/electron/src/renderer/hooks/use-window-inner-height.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 77281e0aac091c818060b54dc9858fe84c016b57
sha256: 73feacc84ca622f46c4bb5b32ce614345e01c2b14b53475b060e3adc2eafea92
lines: 34
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/hooks/use-window-inner-height.ts

## 1. 结论与边界

**窗口内高订阅 hook**（34 行）：驱动高度布局档位（输入框紧凑档等）；resize 走 **rAF 节流一帧一判**，高度未变返回原值跳过重渲染（注释 `:4-9`）。

## 2. 导出与关键符号

1 导出：`useWindowInnerHeight(): number`（`:10`）。

## 3. 内部逻辑与关键流程

（`:11-33`）：初值 `window.innerHeight`（SSR=+∞，`:12`）；effect 内 `evaluate` 用函数式 setState 保引用稳定（`:19`）；resize handler 仅在无挂起帧时排 rAF（`:23-25`）；cleanup 移除监听+cancelAnimationFrame。

## 4. 调用者与调用链

- 入向：布局档位组件/设置页实时提示（注释 `:6`，域外）。
- 出向：react。

## 5. 数据 I/O、读写与副作用

window resize 监听+rAF 调度（无其它副作用）。

## 6. 分支、失败、取消与恢复

SSR 分支；卸载清理帧与监听；无抛错。

## 7. 权限与权威状态

高度权威=`window.innerHeight` 实时值。

## 8. 修改影响面

高度驱动的布局档位与设置页提示；节流口径（rAF）变更影响 resize 期间的判定频率与重渲染次数。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批该文件无 test）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| rAF 节流/引用稳定/SSR 回落 | 已证实 | `:1-34` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出 | §2/§3 | 10-33 | covered |
