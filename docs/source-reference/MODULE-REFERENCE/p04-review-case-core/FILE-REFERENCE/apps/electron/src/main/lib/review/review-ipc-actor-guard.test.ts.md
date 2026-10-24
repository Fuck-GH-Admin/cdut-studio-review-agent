---
path: apps/electron/src/main/lib/review/review-ipc-actor-guard.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c656ba9e61ea9b7d2dc296243c9ed92ab18eb144
sha256: 04c9b7e8f3c03f1fee45baa0853311b60bcc26c476be533bb2bbaacc64f5b894
lines: 53
kind: test
package: p04-review-case-core
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-ipc-actor-guard.test.ts

## 1. 测试目标

`review-ipc-actor-guard.ts` 的**纯函数身份边界**：`bindLocalReviewerCommand`（:46-53）与 `bindLocalSubmitterCommand`（:107-116）对渲染层伪造来源/角色的拒绝，以及 Main 固定 actor 覆盖（`LOCAL_REVIEWER_ACTOR`/`LOCAL_SUBMITTER_ACTOR`）与入参不可变。不覆盖 `bindVerified*`（见 §4）。

## 2. 用例清单

7 用例 / 2 describe；纯函数直调，无 I/O、无 mock、无夹具文件（:1-2）。

| # | 用例 | 行 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 渲染器不得声明 system/agent/school/mock 来源 | 5-10 | 4 种 `actorSource`，role=reviewer | `bindLocalReviewerCommand` | 独立 |
| 2 | 未经机构验证的 teacher/admin/student 等角色不得进 reviewer 入口 | 11-15 | 5 种 `role`，actorSource=local | 同上 | 独立 |
| 3 | 未知/缺失操作者不能作凭据 | 16-20 | `{}` / `actor:null` / `actor:'reviewer'` | 同上 | 独立 |
| 4 | 本地 reviewer 也不得自填审计身份 | 21-27 | 自造 `actorId:'some-school-official'` | 绑定并检查返回/输入 | 独立 |
| 5 | student 可补件但审计身份由 Main 绑定 | 31-37 | `role:'student'`, `actorId:'forged-name'` | `bindLocalSubmitterCommand` | 独立 |
| 6 | 审核员代提交保留，身份也来自 Main | 38-43 | `role:'reviewer'` | 同上 | 独立 |
| 7 | 校方/教师/Agent 不得用于学生回件 | 44-52 | 3 role + 3 source + 空命令 | 同上 | 独立 |

## 3. 真实断言

- 用例 1：对每个 actorSource `expect(...).toThrow('本地审核 IPC')`（:7-8）。
- 用例 2：对每个 role `toThrow('本地审核 IPC')`（:13）。
- 用例 3：三种非法入参均 `toThrow()`（:17-19）。
- 用例 4：`result.actor` `toEqual(LOCAL_REVIEWER_ACTOR)`（:24）、`result.requestId === 'r1'`（:25）、`command.actor.actorId === 'some-school-official'`（:26，**输入不可变**）。
- 用例 5：`result.actor` `toEqual(LOCAL_SUBMITTER_ACTOR)`（:34）、`result.requestId === 'reply-1'`（:35）、`claim.actor.actorId === 'forged-name'`（:36）。
- 用例 6：`bound.actor` `toEqual(LOCAL_REVIEWER_ACTOR)`（:42）。
- 用例 7：3 种 role 与 3 种 source `toThrow('本地补件应答 IPC')`（:46/:49），空命令 `toThrow()`（:51）。

## 4. 未覆盖与脆弱点

- 未覆盖：`assertReviewMainSender`/`bindVerifiedLocalReviewerCommand`/`bindVerifiedSubmitterCommand`（事件/Principal 分支，`review-identity-authority.test.ts:143-146` 仅 smoke destroyed-sender）、`deriveLocalSupplementResolverActor`（在 `review-ipc-legacy-sender.test.ts:108-112`）、`LOCAL_PROXY_AUTHORIZATION`/`proxy` 形状、`assertNoRendererRoleEscalation` 交互。
- 脆弱点：`toThrow('本地审核 IPC')` 为子串匹配；用例 2 的 role 表若源码放宽需同步；未断言返回对象是新实例（只证入参不可变）。
- **NOT_RUN**：本轮未执行 bun test。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 用例断言/行号如 §3 | 已证实 | 本文件逐行 |
| 覆盖面=纯凭据绑定两函数 | 已证实 | :2 import 仅 4 符号 |
| `bindVerified*` 无测试 | 已证实（否定） | 全树 `.test.ts` 检索仅 identity-authority smoke |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| reviewer 非法来源/角色拒绝 | §3 | 7-13 | covered |
| reviewer actor 覆盖 + 输入不可变 | §3 | 24-26 | covered |
| submitter 学生/代提交绑定 | §3 | 34-42 | covered |
| submitter 非法身份拒绝 | §3 | 46-51 | covered |
| `bindVerified*`/sender 校验 | §4 | — | unknown（本文件不测） |
