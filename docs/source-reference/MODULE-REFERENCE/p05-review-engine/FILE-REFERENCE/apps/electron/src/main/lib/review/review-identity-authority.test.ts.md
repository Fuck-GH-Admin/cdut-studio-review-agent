---
path: apps/electron/src/main/lib/review/review-identity-authority.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6e28758418136ee8ab0c761a2c0f853ace71e5aa
sha256: 603b5f8f8d743711f70e9bc976a470ae59f5cd3972111ca07f1c26193d982828
lines: 149
kind: test
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-identity-authority.test.ts

## 1. 测试目标

身份授权闭环回归（AUTH-01/06/07/08/09/18，`apps/electron/src/main/lib/review/review-identity-authority.test.ts:1-4`）：只验证 Main 侧合同与持久行为——**不伪造 GUI、不声称学校真人权限**。覆盖 `review-principal-service` 与 `review-agent-assignment` 的签发/重核/轮次/撤销/读范围。

## 2. 用例清单

6 describe / 8 test。夹具：临时 `PROFER_CONFIG_DIR`；动态 import 两服务（`:16-22`）。

**AUTH-01 统一 Principal（`:24-58`）**

| # | 名称 | 断言要点 | 行 |
| --- | --- | --- | --- |
| 1 | 教师/评委/校方角色不能由本机签发 | `issueLocalPrincipal({role:'teacher'/'school-admin'})` 抛 `PrincipalError` | `:25-30` |
| 2 | 本地 reviewer 显式标注模拟/外部阻断 | `assurance='local-device'`、`schoolAuthorized:false`、`externalAuthorization:'BLOCKED_EXTERNAL'`、`assuranceLabel='LOCAL_OPERATOR'`；审计 `simulationMarker`/`realPerson:false`/含「非校方认证」 | `:32-42` |
| 3 | 模拟教师主体审计不显示为真实人员 | `label='LOCAL_SIMULATION'`、`realPerson:false`、含「本机模拟」 | `:44-50` |
| 4 | Renderer claim 升级 teacher/judge/audience 被拒 | 三者抛；`role:'reviewer'` 返回 `'reviewer'` | `:52-57` |

**AUTH-01 写事务重核（`:60-71`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 5 | 越界/过期/缺主体全拒 | 合法不抛；`case-b`/`other` 动作/过期/`undefined` 均抛 `PrincipalError` | `:61-70` |

**AUTH-07 指派轮次绑定（`:73-101`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 6 | 跨轮复用拒、同轮放行 | `turnPolicy==='single-turn'`；`turn-2` 得 `TURN_MISMATCH`；缺 turn 且 `requireTurnMatch` 得 `TURN_UNVERIFIED`；篡改 `multi-turn` 无到期 → `ASSIGNMENT_EXPIRED` | `:74-100` |

**AUTH-08 撤销持久化（`:103-121`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 7 | 撤销意图独立落盘，主账本回退旧行仍拒 | `revokeAssignment` 返回 true；`review-agent-assignment-revocations.json` 含意图；手动删 `revokedAt` 模拟写盘失败后仍 `ASSIGNMENT_REVOKED` | `:104-120` |

**AUTH-09 读取范围（`:123-139`）**

| # | 断言要点 | 行 |
| --- | --- | --- |
| 8 | 无指派/未声明本地浏览拒读；指派只暴露绑定案卷 | `READ_SCOPE_UNVERIFIED`；`localOwnerBrowsing:true` 放行；`caseIds===['case-visible']`；`isCaseVisible` 一真一假 | `:124-138` |

**AUTH-06 旧通道 sender 收口（`:141-148`）**：`bindVerifiedLocalReviewerCommand` 对已销毁 sender 抛（guard 层不依赖 handler 自觉）。

## 3. 真实断言

- `expect(principal.externalAuthorization).toBe('BLOCKED_EXTERNAL')`（`:36`）。
- `expect(reuse.code).toBe('TURN_MISMATCH')`（`:80`）。
- `expect(afterRestart.code).toBe('ASSIGNMENT_REVOKED')`（`:119`）。
- `expect(scope.caseIds).toEqual(['case-visible'])`（`:135`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`SCHOOL_GRANTED` 路径（本地无法产生）；`ttlMs` 到期的定时行为（用 `expiresAt` 手改模拟）。
- 脆弱点：AUTH-08 直接改写账本 JSON 模拟写盘失败（`:113-115`）；错误码断言与 `review-agent-assignment` 文案耦合。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 8+1 用例覆盖 6 个 AUTH 面 | 已证实 | `:24-148` |
| 撤销意图独立于主账本 | 已证实（断言） | `:107-119` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| AUTH-01 签发/审计/升级 | 1-4 | `:24-58` | covered |
| AUTH-01 写重核 | 5 | `:60-71` | covered |
| AUTH-07 轮次 | 6 | `:73-101` | covered |
| AUTH-08 撤销 | 7 | `:103-121` | covered |
| AUTH-09 读范围 | 8 | `:123-139` | covered |
| AUTH-06 sender 收口 | 附加 | `:141-148` | covered |
