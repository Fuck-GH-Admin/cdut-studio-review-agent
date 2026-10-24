---
path: apps/electron/src/main/lib/agent-file-preview-session.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0200a569474334844d927012f068ae92415eed2d
sha256: c16e3e0fb84fb2d789d624b66a9391a1cd12b354f3be370eeca8d7014686d5b4
lines: 78
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-file-preview-session.test.ts

## 1. 测试目标

`AgentFilePreviewSessionManager` 配对等待：ready 解析、回执校验拒绝、超时、inspect 链。不运行（`NOT_RUN`）。

## 2. 用例清单

6 用例（:14/:32/:39/:46/:53/:58），1 describe（:13）；fixture `openEvent`（:4-11）。
1. 匹配 revision ready 解析（:14-30）：emit 事件回显（:18）、reportReady true（:28）、resolve matchObject ready/slideCount 3。
2. 缺有效页数拒（:32-37）：slideCount 0→reject「缺少有效页数」。
3. viewer error 拒（:39-44）：透传 'WASM parse failed'。
4. stale revision 拒（:46-51）：「viewer revision 与磁盘文件不一致」。
5. 超时拒（:53-56）：timeoutMs 5，「加载超时」。
6. inspect 匹配解析（:58-77）：emit inspection_requested（:69）、images 匹配 resolve。

## 3. 真实断言

`:18`/`:28-29`/`:36`/`:43`/`:50`/`:55`/`:69`/`:76`（toEqual/toBe/resolves/rejects.toThrow 如 §2）。

## 4. 未覆盖与脆弱点

未覆盖：dispose、reportInspection 负例（页码无效/空图）。mock 边界：真实管理器+假 emit。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| ready/缺页数/error/stale/超时/inspect | #1-#6 | covered |
| dispose/inspect 负例 | — | unknown |
