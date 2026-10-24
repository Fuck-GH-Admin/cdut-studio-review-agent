---
path: apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f0d0b442e59ab1dc75089b592a6f449481577383
sha256: 6bba64cb0ed7f7067a799fa74b905baf872c61ca4ab6b5e3c60a063d019d38a7
lines: 88
kind: test
package: p06-review-batch
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-intake-adapter-v3-b2.test.ts

## 1. 测试目标

`review-intake-adapter-v3-b2.ts` 的 B2 scoped staging（describe `:14`，名含「Main-issued token integration still pending」）：令牌单次消费与 scope fail-closed、请求重放幂等、文档版本按物理源区分、import 非评审批次、revoke 阻断、显示名安全。无 mock（内存服务 + 注入时钟）。

## 2. 用例清单

6 个 test（`:15/:32/:43/:51/:62/:75`）。夹具：`a` 上下文（`:4-5`）、`input()` 工厂（默认 `proof.pdf`/`picker-file-id-1`/`synthetic-source-v1` 字节，`:6-13`）。用例独立（各建 `ReviewB2StagingService`）。

1. `:15-31` B-IN-02 令牌单次消费；sender/frame/owner/case/超时 fail-closed（注入时钟 `tick`）。
2. `:32-42` B-IN-02 请求重放幂等、改字节碰撞。
3. `:43-50` B-DOC-02 同 stem+字节但不同物理源=不同文档版本。
4. `:51-61` B-IN-03 import 不是评审批次且不能跨 owner 组装。
5. `:62-74` B-IN-02 revoke 阻断读/暂存/挂起后续。
6. `:75-86` B-IN-01 拒绝路径/Windows 设备名/NUL/反斜杠/控制字符显示名。

## 3. 真实断言

- `:19-30`：senderId 11/frameId 4/owner-b/case-b 四种 scope 均抛 `B2_TOKEN_SCOPE_MISMATCH`；成功 staging 的 `rawSha256` 匹配 `/^[a-f0-9]{64}$/`；重用 token 抛 `B2_TOKEN_INVALID_OR_CONSUMED`；`read` 返回原文 `'synthetic-source-v1'`；跨 case read 抛 `B2_MATERIAL_SCOPE_MISMATCH`；`tick=1010` 过期 token 抛 `B2_TOKEN_INVALID_OR_CONSUMED`。
- `:36-41`：同 input 两次 `toEqual`；改字节同 requestId 抛 `B2_REQUEST_ID_COLLISION`；读出 buffer 首字节置 0 后再读仍原文（副本语义）。
- `:48-49`：`rawSha256` 相同、`documentVersionId` 不同。
- `:55-60`：`batch.kind==='import'`、`status==='staged'`、`materialIds` 一致；重复 id 抛 `B2_DUPLICATE_CANDIDATE`；跨 owner 抛 `B2_MATERIAL_SCOPE_MISMATCH`。
- `:67-73`：revoke 后 read/stage/assertStillGranted 均抛 `B2_OWNER_INVALID_OR_REVOKED`；换代 grant 可用（token 匹配 64 hex）但读旧候选抛 `B2_MATERIAL_SCOPE_MISMATCH`。
- `:77-85`：`../escape.pdf`/`C:\foo.pdf`/`CON.txt`/`NUL`/`bad/name.txt`/`trailing.`/含 NUL 七类名称抛 `B2_MATERIAL_INVALID`；`科研材料（正式）.pdf` 通过且原样返回。

## 4. 未覆盖与脆弱点

未覆盖：`claimArchiveRequest`、`listScopedCandidateIds`、`getCandidate`、TTL 上界（60000）/非法 TTL、`previewImportBatch` 的 `assertC0ImportBatch` 失败路径。时钟注入（`:17`）是唯一测试缝；describe 名自述 Main-issued token 集成待 Dev-C（与源文件头注释一致）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例行号与断言文本 | 已证实 | `:15-86` 逐条核对 |
| 七类显示名拒绝清单 | 已证实 | `:77-82` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| token 单次/scope/过期 | §3 | test:15-31 | covered |
| requestId 幂等/碰撞/读副本 | §3 | test:32-42 | covered |
| documentVersionId 物理源 | §3 | test:43-50 | covered |
| previewImportBatch | §3 | test:51-61 | covered |
| revoke/换代 | §3 | test:62-74 | covered |
| safeDisplayName | §3 | test:75-86 | covered |
| claimArchive/listScoped/getCandidate | §4 | — | unknown（无断言） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
