---
path: packages/shared/src/types/channel.codex.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e96d2a356fe3ee21472e62054228fdc3f636933
sha256: e2ab21141aa03f5db423a01c3bd2ea98896af49dd6524da9c8525fdb00cd206c
lines: 66
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/channel.codex.test.ts

## 1. 测试目标

Codex OAuth 凭据**序列化/解析/过期判定**（`packages/shared/src/types/channel.codex.test.ts:16`、`:28`、`:49`）：`serializeCodexCredentials`/`parseCodexCredentials`/`isCodexCredentialExpired`（`channel.ts`）。

## 2. 用例清单

3 describe / 10 test。夹具 `sample: CodexOAuthCredentials`（access/refresh/expires/accountId，`:9-14`）。

| describe | # | 断言要点 | 行 |
| --- | --- | --- | --- |
| 序列化 | 1-2 | 往返一致（含 `accountId`）；无 `accountId` 省略可选字段往返一致 | `:17-25` |
| 解析 | 3-6 | 空串/空白→`null`；非 JSON（`sk-plain-api-key`）→`null` 不抛；缺必需字段（3 组）→`null`；`expires` 非数字→`null` | `:29-46` |
| 过期判定 | 7-10 | 远期→未过期；已过期→过期；**skew 余量内（30s 后到期，60s 默认余量）→判过期**（防边界请求）；`skew=0` 恰好 5s 后→未过期 | `:50-65` |

## 3. 真实断言

- `expect(parseCodexCredentials(serializeCodexCredentials(sample))).toEqual(sample)`（`:18-19`）。
- `expect(parseCodexCredentials('{"access":"a","refresh":"r","expires":"soon"}')).toBeNull()`（`:45`）。
- `expect(isCodexCredentialExpired({ ...sample, expires: Date.now() + 30_000 })).toBe(true)`（`:60`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`serializeCodexCredentials` 对非法输入的行为；过期判定的时钟注入（用 `Date.now()` 真时钟）。
- 脆弱点：skew 语义断言依赖实现默认 60s（`:59` 注释）。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例覆盖往返/失败/skew | 已证实 | `:17-65` |
| 解析失败全部 `null` 不抛 | 已证实 | `:29-46` |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 面 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 往返序列化 | 1-2 | `:17-25` | covered |
| 解析失败集 | 3-6 | `:29-46` | covered |
| 过期/skew | 7-10 | `:50-65` | covered |
