---
path: apps/electron/src/main/lib/agent-gpt-image-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ee579d832a230d9f3366675cc25ae7cbee52c075
sha256: 5076905be054a7046ae1fe6de95f4e26f33a4114fc7a0ad313cc7894d1ff3f1c
lines: 148
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-gpt-image-service.test.ts

## 1. 测试目标

`generateAgentGptImage`：授权委托+落盘、前拒边界、诚实卡片、last_generated 语义。不运行（`NOT_RUN`）。

## 2. 用例清单

7 用例（:52/:68/:89/:102/:112/:124/:141），1 describe（:51）；注入 provider seam（:14 动态 import）。
1. 相对授权参考委托+落盘（:52-66）：ok true、calls 1、references 1、无 marker、absolutePath 含 agent-output-images、存在。
2. 授权根边界前拒（:68-87）：额外授权根通过（:73）、越权/目录/symlink 均 `ok:false` 含「授权目录/普通文件」（:78-82），provider calls 0（:86）。
3. 伪图/超大/超 4 张前拒（:89-99）：「不支持/20MB/最多」，calls 0。
4. provider 失败不落产物（:102-110）：`upstream rejected`、updates requesting→failed（:108）、输出目录不存在。
5. 诚实三卡（:112-122）：updates requesting/saving/succeeded（:120）、chargedCredits 5+localPath（:121）。
6. last_generated 仅用本会话最新成功图（:124-139）：edited true、references 1、卡 reference `{kind:'last_generated'}`。
7. last_generated 缺失/冲突前拒（:141-147）：「没有/不能」，calls 0。

## 3. 真实断言

如 §2（toMatchObject/expect.stringContaining/existsSync/toHaveLength）。

## 4. 未覆盖与脆弱点

未覆盖：retryAgentGptImage 全路径、referenceGenerationId 定点回放。mock 边界：注入 provider seam（测试面）+真实文件系统。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例/断言如 §2-3 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 分支 | 用例 | 状态 |
| --- | --- | --- |
| 委托/前拒/失败/卡片/last_generated | #1-#7 | covered |
| retry 路径 | — | unknown |
