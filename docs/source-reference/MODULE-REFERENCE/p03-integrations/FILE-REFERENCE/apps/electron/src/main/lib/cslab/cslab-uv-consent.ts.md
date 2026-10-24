---
path: apps/electron/src/main/lib/cslab/cslab-uv-consent.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6eec6aad8985a4bf9a7896dfff350a280bfd3776
sha256: c91108b317082b6dd720ebbfb04373cb2acdf555e70d6038c68fa278b248d7c0
lines: 86
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-uv-consent.ts

## 1. 结论与边界

uv **非官方指纹安装的用户确认与审计**（`apps/electron/src/main/lib/cslab/cslab-uv-consent.ts:1-8`）：①不静态 import electron（避免 Bun 单测导入链加载 electron——`await import` 延迟，`:52`）；②仅「镜像自证一致但无官方指纹」才允许确认（哈希不符不会到此）；③允许/拒绝都写 `tools/uv/install-audit.jsonl`，写盘失败不影响安装结果。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UvInstallAuditEntry` | 接口 | 14-20 | `{asset, source, sha256, verdict, decision:'auto'\|'allowed'\|'declined'}` |
| `appendUvInstallAudit` | 函数 | 29-41 | 串行追加审计（`auditQueue` Promise 链保行序，`:25-26`；吞写盘异常 warn，`:37-39`） |
| `confirmUvUntrustedInstall` | 异步函数 | 47-86 | 原生警告框确认（返回 true=明确继续） |

## 3. 内部逻辑与关键流程

`confirmUvUntrustedInstall`：动态 import electron dialog（`:52`）→warning 框「取消安装/仍然信任并安装」**默认=取消**（defaultId/cancelId 0，`:55-57`）→详情含资产/来源/SHA-256（`:61-68`）→焦点窗口优先（`:71-74`）→审计写 verdict:'mirror-consent'+decision（`:77-83`）→`response===1` 才放行（`:75`）。

## 4. 调用者与调用链

入向：`cslab-uv.ts:19`（审计）+ confirm 经 `UvUntrustedInstallGuard` 注入（调用方给）。出向：`node:fs`、`../config-paths`、electron（延迟）。

## 5. 数据 I/O 与副作用

追加写 `<configDir>/tools/uv/install-audit.jsonl`（mkdir recursive+appendFile）；弹原生对话框。

## 6. 分支、失败、取消与恢复

写盘异常→warn 吞掉（`:37-39`）；用户拒绝→返回 false（调用方抛 UvConsentDeniedError 终止整轮）。

## 7. 权限与权威状态

安全闸口：默认拒绝（defaultId 0）；审计留痕双向记录。

## 8. 修改影响面

审计文件格式与合规核查工具契约；弹窗文案。

## 9. 测试证据

`cslab-uv.test.ts`（判定分级另篇；本文件弹窗未单测）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出+默认拒绝+双向审计 | 已证实 | `:1-86` |
| 弹窗运行行为 | 未知 | NOT_RUN（GUI） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 全部导出/流程 | §2/§3 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
