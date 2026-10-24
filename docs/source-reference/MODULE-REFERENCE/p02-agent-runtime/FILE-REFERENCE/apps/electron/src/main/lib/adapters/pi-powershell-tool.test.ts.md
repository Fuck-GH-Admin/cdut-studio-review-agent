---
path: apps/electron/src/main/lib/adapters/pi-powershell-tool.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5a6e2de872be6e516c68ef2a231fac93a3f83494
sha256: a64f4d17c7d9c935a8c22d751583731f5af8c9ca9a1ba1e4a7c1be0f6f53d3b4
lines: 188
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/adapters/pi-powershell-tool.test.ts

## 1. 测试目标

`pi-powershell-tool.ts` 的路径解析/命令行快照/真实执行（win32）/mock 子进程全链/工具定义。mock 边界=`spawnProcess` 注入假 child（`:68-168`）与 `pathExists`/`environment`/`platform`/`terminateProcessTree` 注入。

## 2. 用例清单

1 describe、**13 test 调用点**（QA F-NB54-02 校正——此前漏 5 例，根因读取截断段臆补，已重读 :68-170）：

1. `:14` SystemRoot 解析绝对路径（不查 PATH）。
2. `:21` 组件缺失返回 null 不回退 PATH。
3. `:26` 非交互安全参数快照。
4. `:33`（skipIf win32）真实执行 stdout。
5. `:46`（skipIf）stderr+非零退出码保留。
6. `:57`（skipIf）超时终止与 timedOut 报告。
7. `:68` mock 子进程双流+非零退出→统一结果（output='outerr'、errorKind undefined）。
8. `:101` never-closes 超时→**强制 settle+进程树终止**（timedOut/exitCode null/treePid=4242）。
9. `:131` **taskkill /T /F 参数断言**（taskkill.exe、['/pid','99','/T','/F']、unref）。
10. `:146` **DEFAULT_TIMEOUT_SECONDS=30**。
11. `:150`（skipIf）**abort 信号→aborted true/timedOut false**。
12. `:165` **非 Windows 不注册**（defineTool 不调用、返回 undefined）。
13. `:170` 工具定义命名/参数。

## 3. 真实断言

- `:18` 返回 `WINDOWS_POWERSHELL` 常量路径；`:22-23` 均 `toBeNull`。
- `:27-30` args 7 元数组 `toEqual`。
- `:40-43` exitCode 0/timedOut false/aborted false/output 含 `Win32NT`；`:53-54` exitCode 7+stderr 保留；`:64-65` timedOut true。
- `:180-186` `tool` 定义、`definition` `toMatchObject({name:'PowerShell', label:'执行 PowerShell'})`、parameters 含 command/timeout。

## 4. 未覆盖与脆弱点

未覆盖：`terminateWindowsProcessTree` 的 taskkill 实际效果（mock 只验调用）、grace period 兜底 settle（`:178-180` 源）、`piBackgroundTaskManager` 生命周期。win32 用例在非 Windows 上 skipIf 跳过（本批 NOT_RUN 全不跑）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例行号与断言文本 | 已证实 | `:14-187`（QA F-NB54-02 补 5 例） |
| win32 用例依赖平台 | 已证实 | `test.skipIf` 标注 |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| 解析/参数/mock 全链/强制 settle/taskkill/abort/门禁/定义 | §3 | covered |
| taskkill/grace/后台任务 | §4 | unknown |
| 实际运行 | §5 | unknown（NOT_RUN） |
