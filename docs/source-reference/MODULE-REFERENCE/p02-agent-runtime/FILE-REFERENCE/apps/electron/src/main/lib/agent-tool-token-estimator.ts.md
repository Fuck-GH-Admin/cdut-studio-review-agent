---
path: apps/electron/src/main/lib/agent-tool-token-estimator.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 57cc99f49b70d732e20aa8d24e7e313418391a19
sha256: 8e331bd147136f7e9a28f4d15be850c7118290458a934ada95d4cb434b744a2d
lines: 56
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-tool-token-estimator.ts

## 1. 结论与边界

工具内容 Token 估算（头注释 :1-6）：字符级启发式，canUseTool 拦截大文件写入防 token 截断。保守高估（:37 注释：宁可触发分块不要低估）。

## 2. 导出与关键符号

导出 3 条（`export` :9/:17/:39）：`WRITE_CONTENT_TOKEN_THRESHOLD=16000`（:9）、`isCjkCodePoint(cp)`（:17-27，7 区间：CJK 汉字/符号/全角/韩文/假名/扩展 A/B）、`estimateTokenCount(text)`（:39-56，CJK×1.5+ASCII×0.25+其他×0.75 后 ceil）。

## 3. 内部逻辑与关键流程

逐码点三分类累计加权（:44-55）。纯函数。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `agent-orchestrator.ts:145` → 调用 `:1859-1860`（estimateTokenCount 与 WRITE_CONTENT_TOKEN_THRESHOLD 比较）。**无测试文件**（ls 确认）。出向：无 import（自包含）。

## 5-7. 数据/分支/权限

纯函数不适用。

## 8. 修改影响面

大文件写入拦截阈值。无专属测试（待检索核实）。

## 9. 测试证据

无测试文件（ls 确认无 agent-tool-token-estimator.test.ts）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 3 条；估算公式 | 已证实 | :39-55 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 3 导出 | §2/§3 | :9-56 | covered |
