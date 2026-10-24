---
path: apps/electron/src/main/lib/pi-harness/tool-facts.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 50a052c292319be3effa0a2762967b314aae2329
sha256: d06c201fbb038bf2c2638a5ee612c2082a067e587d7bfd8c53daaeedb7d43df0
lines: 179
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/tool-facts.test.ts

## 1. 测试目标

直接测试 `createToolFact`（tool-facts.ts）的五族分类、证据优先级与脱敏承诺：文件写事实不泄内容、命令退出证据分类、结构化进程证据压过矛盾文本、审核域真实 outcome、外部工具非验证。8 个 `test(`，1 个 `describe('Pi Harness tool facts')`（`:6`）。

不测试：fingerprint 哈希分布、evaluation 侧消费。

## 2. 用例清单

夹具：`context`（goalId/turnId/taskId，`:4`）。无 mock/无 IO。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:7-14` | Write（`file_path:'src\\secret.ts'`，content 含 `api_key=sk_…`） | create | `:11` `toMatchObject{kind:'file_mutation',outcome:'success',subject:{path:'src/secret.ts'},fingerprint:'write-1'}`（反斜杠归一 + toolUseId 直取）；`:12-13` 序列化 `not.toContain` 'sk_should_not_appear'/'api_key=' |
| 2 | `:16-25` | Bash test 命令文本 'exit code 0' / '退出码 1' | create ×2 | `:23` 成功 `toMatchObject{kind:'verification_command',outcome:'success',subject:{category:'test',exitCode:0}}`；`:24` 失败同构 exitCode:1/outcome:'failure' |
| 3 | `:27-58` | 文本说 exit 0 但 executionResult{signal:'SIGKILL',timedOut:true,exitCode:null} | create | `:46` `outcome:'failure'`、`subject:{category:'test',executionEvidence:'structured_execution',signal:'SIGKILL',timedOut:true,shell:'/bin/bash'}`；`:57` `subject` `not.toHaveProperty('exitCode')` |
| 4 | `:60-92` | executionResult{errorKind:'shell_not_found',errorCode:'ENOENT'}+isError | create | `:82` `outcome:'failure'`、`subject:{executionEvidence:'structured_execution',errorKind:'shell_not_found',errorCode:'ENOENT'}`；`:91` 序列化 `not.toContain('spawn ENOENT')`（stderr 不落盘） |
| 5 | `:94-118` | `bun run typecheck` + executionResult{exitCode:0}、文本无退出标记 | create | `:113` `outcome:'success'`、`subject:{category:'typecheck',exitCode:0,executionEvidence:'structured_execution'}` |
| 6 | `:120-130` | result 为 text block 数组（`[{type:'text',text:'1 pass'}]`）、isError:false、无 executionResult | create | `:124` `outcome:'success'`、`subject:{category:'test',executionEvidence:'tool_result_success'}`；`:129` `not.toHaveProperty('exitCode')` |
| 7 | `:132-135` | BrowserClick、result 'ok' | create | `:134` `toMatchObject{kind:'external_or_unknown',outcome:'unknown'}` |
| 8 | `:137-178` | 审核族 4 情形 | create ×4 | `:145` read 成功批次 `{kind:'review_operation',outcome:'success',fingerprint:'chatcmpl-tool-a46e656b26e652fb'}` + `:150` `summary` `toBe('review_read_documents success')` + `:152` 序列化 `not.toContain('doc-1-v1')`；`:160` 整批被拒 `outcome:'failure'`；`:168` 提交被拒 failure；`:177` isError 协议错误 failure |

## 3. 真实断言

`toMatchObject`（kind/outcome/subject 逐字段）+ `toHaveProperty` 否定（无 exitCode）+ `not.toContain`（脱敏）+ `toBe`（summary 精确）。无快照测试。

## 4. 未覆盖

- `read/grep/glob/find/ls` 观察族（kind file_read/observation、path 缺失→unknown）。
- `taskcreate/taskupdate/proma_task_*` 任务族。
- legacy 退出码正则边界（`退出码:1`/`exit code:1`）。
- `commandCategory` build 分类、`command` 兜底类（kind 'command'）。
- `reviewToolOutcome` 解析失败→success 的保守分支。
- fingerprint 无 toolUseId 时的 digest 构造。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 证据优先级（结构化压文本）由用例 3 锁定 | 已证实 | `:27-58` |
| 脱敏（密钥/stderr/材料 ID）三重断言 | 已证实 | `:12-13`、`:91`、`:152` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 写族脱敏+归一 | §2 用例 1 | `:7-14` | covered |
| 退出码文本分类 | §2 用例 2 | `:16-25` | covered |
| 结构化压矛盾文本 | §2 用例 3 | `:27-58` | covered |
| 结构化失败分类 | §2 用例 4 | `:60-92` | covered |
| exit0 结构化成功 | §2 用例 5 | `:94-118` | covered |
| 无退出码有限类成功 | §2 用例 6 | `:120-130` | covered |
| 外部非验证 | §2 用例 7 | `:132-135` | covered |
| 审核族 4 情形 | §2 用例 8 | `:137-178` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |
