---
path: apps/electron/src/renderer/atoms/app-mode.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d6f5adfd34e1ac59d9534e478c287926ec19d86b
sha256: e3b0091853854a5fde789a2ad5547d26418d5f5ca19879f7629a20f5bded52e7
lines: 13
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-47-20261023
reviewer: p08-renderer-ui
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/app-mode.ts

## 1. 结论与边界

应用模式原子（头注释 :2-7）：**Chat 模式已从 CDUTAI 用户路径移除**；保留旧值读取兼容（防历史 `chat` localStorage 值恢复已删入口）。

## 2. 导出与关键符号

导出 2 条（`export` :10/:13）：`AppMode='chat'|'agent'|'scratch'`（:10，chat 保留兼容）、`appModeAtom = atomWithStorage('profer-app-mode','agent')`（:13）。

## 3-7. 不适用

不适用（纯原子+兼容契约）——依据：13 行全文核对。

## 8. 修改影响面

- 消费面：模式切换链。
- 依赖面：localStorage 'profer-app-mode'。
- 需同步测试：无专属。

## 9. 测试证据

无专属测试。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；chat 兼容契约 | 已证实 | :2-13 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 | §2 | :10-13 | covered |
