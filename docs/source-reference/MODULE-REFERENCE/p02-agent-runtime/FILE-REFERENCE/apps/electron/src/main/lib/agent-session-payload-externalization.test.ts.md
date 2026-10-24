---
path: apps/electron/src/main/lib/agent-session-payload-externalization.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cf33e4cde02a3a3cabfb15e461dc75f58922d648
sha256: 68dc5c7c5890c4adec6e3711cc9abf4cb03770ddb839ee44a271bb5e2afd84a0
lines: 223
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-session-payload-externalization.test.ts

## 1. 测试目标

写入路径外部化（`externalizeSerializedSessionLine`/`resolveMessageBlobs`）：未超限一字节不动、超限搬 blob+片段+引用表、还原逐字节、去重、幂等、降级不抛。bun:test；electron mock+临时目录+动态 import；常量与源码一致（MAX=256K/PREVIEW=2000/`_proferBlobs`，`:23-27`）。

## 2. 用例清单

共 **10 个 `test(`**，三 describe：未超限不动 2（`:91,100`）；超限搬 blob 4（`:112,128,140,158`）；幂等与降级 4（`:181,191,207,218`）。

## 3. 真实断言

- `:95-97` 普通消息无引用表、blob 0、内容原样。
- `:105-107` 200K<上限原样保留。
- `:116-125` 引用表 1 条、`path` `toBe('tool_use_result.content[0].text')`、片段长度=2000 且是原文前缀。
- `:134-137` 还原逐字节+无引用表/缺失字段。
- `:152-155` 两引用同 hash、磁盘 blob=1。
- `:169-176` 多字段各还原原文。
- `:188` 幂等再跑零改动（`toBe(serialized)`）。
- `:201-204` blob 删后 `_proferBlobsMissing` 记路径、片段保留不抛。
- `:215` 坏引用记缺失不抛；`:221` 无引用返回同一对象（`toBe`）。

## 4. 未覆盖与脆弱点

第二级抽取（512/200）在 oversized-sanitize 测试覆盖（互补）；blob 写失败退截断分支无断言。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例/断言 | 已证实 | 全 223 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 10 用例 | §2/§3 | 91-222 | covered |
