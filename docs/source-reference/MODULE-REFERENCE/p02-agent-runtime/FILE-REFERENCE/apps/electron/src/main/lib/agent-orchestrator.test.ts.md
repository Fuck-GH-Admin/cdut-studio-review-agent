---
path: apps/electron/src/main/lib/agent-orchestrator.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: baae882eaa58a2daa76a37f4ce1a623902fa625d
sha256: d325d441db074bbe6599a881d4915edcb01f84b6742337a3cc673a7e21c81452
lines: 45
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-orchestrator.test.ts

## 1. 测试目标

**文件名与被测对象不一致（照实记录）**：本测试实测 `buildPiAdditionalDirectoriesPrompt`（`./pi-additional-directories-prompt`，**域外不在本批 scope**），不测 agent-orchestrator 本体（`agent-orchestrator.test.ts:2-3` import）。bun:test。

## 2. 用例清单

共 **4 个 `test(`**：Pi 注入授权绝对目录（`:6`）；检测到项目时注入候选与任务路由规则（`:18`）；空目录不增加提示词（`:38`）；XML 特殊字符转义（`:42`）。

## 3. 真实断言

`:12-15`（`<attached_directories>`/`use absolute paths directly`/`<directory index="1">…`）；`:29-35`（`<detected_project_candidates>`/`<root>`/`<type>`/`<name>`/`<relative_to_attached_directory>`/`repository_root`/`unique semantic match`）；`:39` `toBe('')`；`:43` `toContain('C:\\a&amp;b&lt;test&gt;')`。

## 4. 未覆盖与脆弱点

未覆盖：`agent-orchestrator` 本体（**无任何直接测试在本批**——该 45 行文件全部是 prompt 构造测试）；`buildPiAdditionalDirectoriesPrompt` 实现域外未回源。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例/断言/被测对象=prompt 构造器 | 已证实 | 全 45 行 |
| prompt 构造器实现行为 | 未知（域外未回源） | pi-additional-directories-prompt 不在本批 scope |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 用例 | §2/§3 | 6-44 | covered |
| 域外边界/命名不一致 | §1/§4 | — | covered（如实标注） |
