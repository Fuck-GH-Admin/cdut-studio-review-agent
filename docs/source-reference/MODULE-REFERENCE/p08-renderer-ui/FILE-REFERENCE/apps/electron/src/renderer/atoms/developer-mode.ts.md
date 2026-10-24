---
path: apps/electron/src/renderer/atoms/developer-mode.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1e71deefd4742c9e3d3b1fda7efc1b22473ac23e
sha256: 458b17bd8d82fb5380880e8cb79ac74720ac87bc5df3f7c4b3a282b1aa6f8f40
lines: 5
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/developer-mode.ts

## 1. 结论与边界

开发者模式/实验性行为跨界面状态（5 行）。**本文件不适用**（无逻辑）——依据：5 行全文核对。

## 2. 导出与关键符号

导出 2 条（`export` :4/:5）：`developerModeEnabledAtom`、`openEpistemicModeEnabledAtom`（均 `atom(false)`，非持久化）。

## 3-7. 不适用

纯原子声明。注意：与 main 侧 `agent-system-prompt-policy` 双门禁（developerMode&&openEpistemic）联动的渲染端状态源。

## 8. 修改影响面

- 消费面：开发者设置/认识论开关 UI。
- 依赖面：无。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条 | 已证实 | :4-5 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | :4-5 | covered |
