---
path: apps/electron/src/main/lib/agent-image-output-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9fa7f540a3a1735f81db97c94249f4f374985649
sha256: 3f8430505c62d4dd5c1cad2b74edfb5c7b5c07d6fb81c4729717960f868a4624
lines: 20
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-image-output-tools.ts

## 1. 结论与边界

本地图片输出工具结果格式化（20 行）：Pi 与 Claude 共用结构化结果（:17 注释）；**不再要求模型回显 marker**（:11 注释：details 由 Profer UI 直接消费）。

## 2. 导出与关键符号

导出 1 条（`export` :18）：`formatAgentImageOutputToolResult(payload)`（返回 `{content:[{type:'text',text}], details?}`）。内部：`result`（:5-14，文案含「文件相对路径…不要输出任何内部图片协议标记」:8）。

## 3. 内部逻辑与关键流程

单函数文案+details 透传（:5-14）。不适用取消/恢复/权限：纯格式化。

## 4. 调用者与调用链

入向（子agent 交叉核）：生产唯一 `lib/adapters/pi-builtin-tools.ts:102`（send_local_image 工具注册）。出向：`./agent-image-output-service`（sendAgentLocalImage 类型位 :5/:18，payload 由调用方传入）。

## 5. 数据 I/O、读写与副作用

无。

## 6-7. 分支/权限

不适用，依据：纯格式化；「不输出协议标记」是提示约束（:8）。

## 8. 修改影响面

pi-builtin-tools 注册面。无直接测试。

## 9. 测试证据

无直接测试（全树检索 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 1 条；无 marker 回显 | 已证实 | :5-18 |
| 无直接测试 | 已证实（否定） | 全树检索 |
| 测试通过与否 | 未知（NOT_RUN） | — |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `formatAgentImageOutputToolResult` | §2/§3 | :5-18 | covered |
| 测试 | §9 | — | unknown |
