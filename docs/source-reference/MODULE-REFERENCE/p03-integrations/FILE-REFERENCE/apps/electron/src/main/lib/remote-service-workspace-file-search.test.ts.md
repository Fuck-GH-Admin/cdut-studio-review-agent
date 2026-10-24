---
path: apps/electron/src/main/lib/remote-service-workspace-file-search.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1c4f06382fd52ca1b8092883013d4cbbeb9581a4
sha256: a7b22d5edfa7d7f2d49928825a7dfc75b22b56dabd544c46c0614d4655b75ae1
lines: 202
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-service-workspace-file-search.test.ts

## 1. 测试目标

`search_workspace_files` **成功路径**（WS 命令级）——**缺口来源 quality-report-server.md §7.2 条目 3（此前只有错误分支）**（`:13-14`）。策略：**保留 searchRemoteWorkspaceFiles 真实实现与真实临时目录树**，只 mock 三个数据边界（会话/工作区索引、配置路径 `:16-18/:68-91`），断言真实扫描条目+服务端实际 roots。

## 2. 用例清单

**2 个 `test()`**（describe `search_workspace_files 成功路径（会话存在）`）：服务端推导 roots+**客户端 rootPath 被忽略**（`:133-176`）、附加路径参与推导按组返回（`:178-201`）。夹具：真实目录树+**诱饵目录**（`decoy-secret.ts` `:101/:115-117`）、入参记录（requestedWorkspaceSlugs/requestedSessionPathArgs `:31-33`）。

## 3. 真实断言

- `:149-152` session 组**相对路径**（index.ts/README.md/src/app.ts）、source 全 'session'（只有 roots 真来自 getAgentSessionWorkspacePath 才可能 `:147`）。
- `:156-163` workspace 组首条 `toMatchObject({name:'工作文件', path:workspaceRoot, type:'dir'})`、含 docs/guide.md、source 全 'workspace'。
- `:166-167` 推导入参含 `{slug: WORKSPACE_SLUG, sessionId: SESSION_ID}` 与 slug（服务端推导、不接受客户端 roots）。
- `:171-172` **诱饵目录与 decoy-secret.ts 均不泄露**。
- `:174-175` total>0、entries=两组之和。
- `:187-198` 会话级附加目录→session 组绝对路径；工作区级附加目录→workspace 组且 slug 透传。

## 4. 未覆盖与脆弱点

mock 三边界（`:67` 注明动态导入时机）；denyPath 未测。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 用例断言如 §3 | 已证实 | 逐行读 `:1-202` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| 成功主链+roots 推导+防泄露 | 2 | covered |
| denyPath | — | unknown |
