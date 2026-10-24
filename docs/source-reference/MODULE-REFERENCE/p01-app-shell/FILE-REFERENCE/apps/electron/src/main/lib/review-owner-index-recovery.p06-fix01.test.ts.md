---
path: apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 97a7b31d371ebf661b3f03f2c056e586b61a31f5
sha256: 4714f4fb6ac5a0ce6d51f5cdd08a59ec2267b57134c6a53cbce9c65dc01be55d
lines: 154
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts

## 1. 测试目标

P06-FIX-01 回归：旧 `.bak` 回滚/索引损坏**不得抹掉**审核 owner 身份与 deny 记录。真实落盘索引 + 真实 SDK JSONL getter + 事件/路径谓词；无生产用户数据、无 provider、无真实 socket（文件头 `apps/electron/src/main/lib/review-owner-index-recovery.p06-fix01.test.ts:1-5`）。被测面：`agent-session-manager`（owner 身份/journal）、`remote-service.mayPublishAgentEventToRemote`、`review-private-file-access.isReviewPrivateDesktopPath`（本批文件）。

## 2. 用例清单

用例数与源码一致：`test(` 9 个（`describe` 1 个；`it(` 0 个）。夹具：`mkdtempSync` 临时根 + `PROFER_CONFIG_DIR` 指向（`:14-15`）；`owned()` 建审核会话、`ordinary()` 建普通会话（`:25-28`）；`fencePath()=review-owner-ids.log`（`:23`）；afterAll 清理（`:16`）。注意：`manager` 等用 `await import()` 顶层加载（`:17-20`）。

| # | 用例 | 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | 旧 pre-owner .bak 回滚不能开普通 IPC/远程事件/私有路径 | 31-49 | 普通+owner 会话；写坏主索引 | 4 道 deny 仍生效，普通会话不受影响 |
| 2 | 墓碑删除的 owner 与在册 owner 都能从过时备份恢复 | 51-61 | 删 owner 后抹掉墓碑 | deny 仍 true、assert 抛错 |
| 3 | meta 缺 owner 字段不能把 journal owner 变普通 | 63-72 | 删 index.sessions[].owner | deny 仍 true、事件不发布、私有路径仍 true |
| 4 | 三个索引文件全损坏时 fail-closed | 74-90 | 主/.tmp/.bak 全写坏 | owner 与随机 UUID 都 deny；getAgentSessionMeta 抛'索引损坏' |
| 5 | 新 Bun 进程仍拒绝孤儿 owner | 93-106 | 从索引删掉 owner；spawnSync 子进程 | 子进程 exit 0（deny 生效） |
| 6 | deny journal 本身私有，普通工作区可用 | 108-114 | - | fencePath 私有 true；普通路径 false |
| 7 | 旧索引 owner 回填后可经后续备份回滚 | 116-127 | 注入 synthetic-legacy owner 再删 | journal 含 id；回滚后 deny true |
| 8 | journal 不可写/无效时在建索引前拒绝新 owner | 129-141 | fencePath 换成目录 | `owned()` 抛'审核会话身份安全记录' |
| 9 | 撕裂 journal fail-closed 不把半行当普通 | 143-153 | 追加 'bad-partial' | 随机 UUID deny true；`owned()` 抛'不完整条目' |

## 3. 真实断言

抽核（`expect` 行号）：`:35-39`（`.bak` 不含 owner.id、fence 存在、journal 含 owner.id 不含 caseId）；`:41-48`（`assertOrdinaryAgentSession` 抛'内部审核会话'、`mayPublishAgentEventToRemote` false/true、`isReviewPrivateDesktopPath` true/false、meta undefined/存在）；`:54-60`；`:69-71`；`:80-84`（含 `getAgentSessionMeta(randomUUID())` 抛'索引损坏'）；`:103-105`（`child.status===0`、`child.signal===null`）；`:110-113`；`:122-126`；`:134`（`expect(() => owned()).toThrow('审核会话身份安全记录')`）；`:147-148`（随机 UUID deny true + `owned()` 抛'不完整条目'）；`:152`（恢复后随机 UUID deny false）。

## 4. 未覆盖与脆弱点

- 未覆盖：`renameOrdinaryAgentFileEntry`/`isUnsafeAgentWorkspaceMutationPath`（本批另一文件的其余导出）、正常索引下的性能、多进程并发写。
- 脆弱点：用例 5 spawnSync 依赖 `test/preload-electron-mock.ts` 与 `process.execPath`（`:98-102`），环境缺 preload 即失败；`PROFER_CONFIG_DIR` 全局环境变量在测试间共享（afterAll 只清目录不还原 env）；断言依赖中文错误文案（`:41,:84,:134,:148`）。
- mock 边界：无 mock——真实 fs/真实 manager/真实 spawnSync；仅 `mock-channel` channelId 字面量；文件头声明无真实 socket/provider（`:4`）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例与断言行号 | 已证实 | `:31-153` 逐行读 |
| fail-closed 四道防线被断言 | 已证实 | §3 |
| 无 mock/真实 fs+spawnSync | 已证实 | `:1-20` + 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |
| manager 索引恢复内部实现 | 未知 | agent-session-manager 非本批 |

## 6. 覆盖表

| 被测行为 | 用例 | 状态 |
| --- | --- | --- |
| .bak 回滚 fail-closed | 1, 4 | covered |
| 墓碑/meta 缺字段鲁棒 | 2, 3, 7 | covered |
| 跨进程 deny 持久 | 5 | covered |
| journal 私有/不可写/撕裂 | 6, 8, 9 | covered |
| 变异守卫（rename 等） | - | unknown（未覆盖） |
