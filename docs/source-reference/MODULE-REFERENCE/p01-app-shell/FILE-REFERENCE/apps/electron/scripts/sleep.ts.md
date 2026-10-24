---
path: apps/electron/scripts/sleep.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b5f695f3ca9d68d437cc2eef6337375b8e05f662
sha256: dd68bb23ff7bcb13db0d5b5d71c33d17a2869ca41b0cdde5809c02902f69325e
lines: 6
kind: source
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/sleep.ts

## 1. 结论与边界

**跨平台 sleep 命令**（6 行，`sleep.ts:1-4` 注释）：`bun run scripts/sleep.ts <seconds>`，缺省 2 秒。

## 2. 导出与关键符号

无导出（脚本体）；`seconds = Number(process.argv[2]) || 2`（`:5`）。

## 3. 内部逻辑与关键流程

单行 await Promise setTimeout（`:6`）。

## 4. 调用者与调用链

- 入向：打包/发布脚本（构建流程延时步骤，域外 grep：npm scripts 引用）。
- 出向：无。

## 5. 数据 I/O、读写与副作用

无（延时）。

## 6. 分支、失败、取消与恢复

参数缺省/非法→2（`|| 2` 兜底）；无取消。

## 7. 权限与权威状态

无（工具脚本）。

## 8. 修改影响面

构建脚本链的延时步骤；`|| 2` 语义（0/NaN 均落 2）。

## 9. 测试证据

`NOT_RUN`。无直接测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 参数兜底/延时实现 | 已证实 | `:1-6` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 5-6 | covered |
