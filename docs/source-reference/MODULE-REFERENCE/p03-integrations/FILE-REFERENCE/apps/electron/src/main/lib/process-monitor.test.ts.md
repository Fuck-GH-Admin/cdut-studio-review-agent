---
path: apps/electron/src/main/lib/process-monitor.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cfad599f36b847ac4d4dba3948fd1fdead35c911
sha256: 13fafdbdfe09dd738ca399b13f7580a2065fd3d57537fd20f749c5d2e81699d4
lines: 79
kind: test
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/process-monitor.test.ts

## 1. 测试目标

`process-monitor.ts` 的 `extractRequestedPort`（锚定+范围校验）与 `process-monitor-posix` 的 ps/lsof 输出解析（跨文件函数，`:3`）。被测逻辑见 process-monitor 手册（POSIX 解析源不在本批）。

## 2. 用例清单

2 个 describe + **8 个 `test()`**：端口提取 6（参数形态 `:6-11`、URL/主机形态 `:13-16`、无关数字不误判 `:18-25`、参数后跟词 `:27-30`、超范围非法 `:32-37`、空命令 `:39-42`）、POSIX 解析 2（ps 行 `:46-62`、lsof 端口去重 `:64-78`）。

## 3. 真实断言

- `:7-15` `--port 5177`/`-p 4321`/`--port=8080`/`-p=3000`/`http://localhost:8080`/`0.0.0.0:5177` 各取端口。
- `:20-24` `git status`/`sleep 5`/`ls 12345`/`echo retry 3`/`cat /var/log/2026` 全 `toBeUndefined()`（**锚定防误判**）。
- `:33-41` 0/70000/-1/abc/空/undefined → undefined。
- `:53-61` ps 解析 2 行（bad row 跳过）：pid/ppid/name/cmd/startTime（`Date.parse` 比对）。
- `:77` lsof → `Map([[5177,[123]],[4321,[456]]])`（双栈同端口去重、非法 99999 丢弃）。

## 4. 未覆盖与脆弱点

未覆盖：Windows 管道/快照/匹配/终止链；parsePsOutput/parseLsofListenOutput 源不在本批。**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 用例断言如 §3 | 已证实 | 逐行读 `:1-79` |
| 通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测环节 | 用例 | 状态 |
| --- | --- | --- |
| extractRequestedPort | 6 | covered |
| POSIX 解析 | 2 | covered |
| Windows 链/终止 | — | unknown |
