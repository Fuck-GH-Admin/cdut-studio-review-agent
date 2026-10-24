---
path: apps/electron/src/main/lib/dev-instance.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 09de514a3d4dd151135ba5ee8fff28fddcc38801
sha256: 65b32c9132f4446b5aeb0a89f2b696b235f2ac82c83e0d721ddd3e6e64099a0c
lines: 40
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/dev-instance.test.ts

## 1. 测试目标

`dev-instance.ts` 开发隔离实例解析（describe `开发隔离实例` `:5`）。被测逻辑见同组手册。

## 2. 用例清单

**4 个 `test()`**：instance id 隔离 userData+锁名（`:6-12`）、显式 userData 优先（`:14-22`）、打包态忽略开发覆盖（`:24-32`）、端口缺省/非法/合法（`:34-39`）。

## 3. 真实断言

- `:9-11` win32 路径解析为 `.../@cdutai/electron-dev-migration-preview-20260902`、appName `cdutai-dev-migration-preview-20260902`。
- `:20-21` 显式 `PROFER_USER_DATA_DIR` 胜出。
- `:30-31` isPackaged=true → `.../@cdutai/electron`（忽略开发 env）。
- `:35-38` `{}`/'80'/'not-a-port' → 5174；'5187' → 5187。

## 4. 未覆盖与脆弱点

未覆盖 `getDevInstanceId` 非法字符的直接断言（经 userData 间接）。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例断言如 §3 | 已证实 | 逐行读 `:1-40` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 隔离/优先级/打包态/端口 | 4 | covered |
