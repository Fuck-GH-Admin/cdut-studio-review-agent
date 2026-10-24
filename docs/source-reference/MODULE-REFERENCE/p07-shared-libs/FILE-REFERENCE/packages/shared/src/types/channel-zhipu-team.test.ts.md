---
path: packages/shared/src/types/channel-zhipu-team.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d374cbcf254798323bc3cf30e6069ee46d262805
sha256: 73147333c307267db1812b7de6f92a933e1f455c1f97d33969151049cfdbc32c
lines: 22
kind: test
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/types/channel-zhipu-team.test.ts

## 1. 测试目标

智谱 Coding Plan **团队凭证解析**（`packages/shared/src/types/channel-zhipu-team.test.ts:7`）：分号分隔密文/JSON/纯 token 三种形态的 API key 提取（`parseZhipuTeamCredentials`/`extractZhipuCodingTeamApiToken`，`channel.ts`）。

## 2. 用例清单

1 describe / 2 test。

| # | 名称 | 动作 | 断言 | 行 |
| --- | --- | --- | --- | --- |
| 1 | 分号分隔密文提取 | `apiKey=team-token; bigmodel_organization=org-1; bigmodel_project=project-1` | `parseZhipuTeamCredentials` → `{apiKey:'team-token', organization:'org-1', project:'project-1'}`；`extract…`→`'team-token'` | `:8-16` |
| 2 | JSON 与纯 legacy token | `{"token":"json-token","organization":"org-2"}`、`'legacy-token'` | 分别 `'json-token'`、`'legacy-token'` | `:18-21` |

## 3. 真实断言

- `expect(parseZhipuTeamCredentials(secret)).toEqual({ apiKey: 'team-token', organization: 'org-1', project: 'project-1' })`（`:10-14`）。
- `expect(extractZhipuCodingTeamApiToken('legacy-token')).toBe('legacy-token')`（`:20`）。

## 4. 未覆盖与脆弱点

- 未覆盖：空串/畸形 JSON/`apiKey` 缺失等失败分支。
- 脆弱点：三种形态优先级（分号→JSON→原样）由实现决定，测试只覆盖各自命中。

## 5. 已证实/推断/未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 形态提取语义 | 已证实 | `:8-21` |
| 失败分支行为 | 未知 | 未测 |
| 测试实际通过 | 未知 | NOT_RUN |

## 6. 覆盖表

| 形态 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 分号分隔 | 1 | `:8-16` | covered |
| JSON | 2 | `:19` | covered |
| 纯 token | 2 | `:20` | covered |
