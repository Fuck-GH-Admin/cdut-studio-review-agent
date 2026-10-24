---
path: packages/shared/src/constants/ofv-theme-bridge.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 17c62663213fb3603600467050845eb0faf2d6d0
sha256: e8288d75150288be2c38781c41db1def52b3fb04e0a4ebcccbe792d274088b6a
lines: 116
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/constants/ofv-theme-bridge.test.ts

## 1. 测试目标

验证 `packages/shared/src/constants/ofv-theme-bridge.ts` 的载荷契约：token 值白名单（合法/可疑值）、序列化↔解析往返与键序确定性、名单外键丢弃、畸形载荷 fail-closed、长度上限、`normalizeOfvThemePayload` 的 IPC 边界收口。bun:test（`:1`），被测 8 符号经相对导入（`:3-12`）。NOT_RUN，只读断言。

## 2. 用例清单

共 **10 个 `test(`**（外层 describe 8 + 嵌套 describe 2）：

| # | 行 | 用例（标题节选） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- | --- |
| 1 | 15 | 常见 token 值都能通过校验 | 8 个值（HSL 三元组/hsl()/rgb()/hex/oklch/长度） | `isTrustedOfvThemeTokenValue` | 独立 |
| 2 | 30 | 可疑值一律不通过 | 8 个值（空串/超长/分号/花括号/引号×2/反斜杠/换行） | `isTrustedOfvThemeTokenValue` | 独立 |
| 3 | 45 | 往返+键序固定 | 4 token（含 selection-bg） | serialize→parse→toEqual + 二次 serialize toBe | 独立 |
| 4 | 59 | 名单外键被丢掉 | `{background, 'evil-token'}` 的 JSON | `parseOfvThemeTokens` | 独立 |
| 5 | 64 | 畸形载荷 fail closed | null/undefined/`''`/`'{not json'`/`'"字符串不是对象"'`/非法值 JSON | 6 次 parse | 独立 |
| 6 | 73 | 极端合法载荷在上限内 | 12 token×64 字符 | serialize + 长度断言 | 独立 |
| 7 | 83 | 全空/全非法返回 null | `{}`、非法值 | serialize→null；sanitize(null/'字符串')→{} | 独立 |
| 8 | 90 | 超长载荷在解析入口被拒 | 超 2048 的 JSON 串 | parse→{} | 独立 |
| 9 | 95 | 只认 light/dark；非法明暗当没给 | 3 组 payload | `normalizeOfvThemePayload` | 独立 |
| 10 | 106 | 两项都空/非对象返回 null | 7 组输入（undefined/null/'light'/{}/sepia/名单外/非法值） | `normalizeOfvThemePayload` | 独立 |

## 3. 真实断言

- `:26` 8 值 `expect(isTrustedOfvThemeTokenValue(value)).toBe(true)`。
- `:41` 8 值 `.toBe(false)`。
- `:53-56` `expect(serialized).not.toBeNull()`、`expect(parseOfvThemeTokens(serialized)).toEqual(tokens)`、`expect(serializeOfvThemeTokens({...tokens})).toBe(serialized)`（键序确定）。
- `:61` `expect(parsed).toEqual({ background: '0 0% 0%' })`（evil-token 不存在）。
- `:65-70` 6 断言 `.toEqual({})`。
- `:79-80` `expect(serialized).not.toBeNull()`、`expect(serialized!.length).toBeLessThanOrEqual(OFV_THEME_TOKENS_MAX_LENGTH)`。
- `:84-87` serialize 空/非法 → `toBeNull()`；sanitize(null/'字符串') → `toEqual({})`。
- `:91` 超长 → `toEqual({})`。
- `:96-103` normalize 三组 toEqual（`{theme:'light',tokens:{radius:'2px'}}`、`{theme:'dark'}`、`{tokens:{radius:'2px'}}`——sepia 被丢但 tokens 照收）。
- `:107-113` 7 组 `toBeNull()`。

## 4. 未覆盖与脆弱点

- `isEmptyOfvThemeTokens` 无直接断言（经 serialize/normalize 间接覆盖）。
- `OFV_PREVIEW_THEMES` 常量与 `OfvPreviewTheme` 类型本身无断言。
- 用例 2 的换行值 `'red\nnewline'` 命中 `TOKEN_VALUE_RE` 白名单（`\t` 与空格在字符类内、`\n` 不在）——测试把换行列为可疑值，实现确实拒绝；但制表符 `\t` 是**允许**的，无对应用例（边界不对称未测）。
- `normalizeOfvThemePayload` 对「theme 合法 + tokens 全非法」（返回仅 theme）无直接用例（用例 9-10 组合面未全交叉）。
- 真实断言不含键序全排列测试（只有同输入两次序列化）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例/嵌套 describe 结构 | 已证实 | `:14,94` 及各 test 行 |
| 值白名单合法/可疑两面 | 已证实 | `:15-43` |
| 序列化确定性与往返 | 已证实 | `:45-57` |
| fail-closed 覆盖 null/坏 JSON/非对象/超长 | 已证实 | `:64-71,90-92` |
| 12×64 最大载荷 ≤2048 | 已证实 | `:73-81` |
| `\t` 允许而 `\n` 拒绝的不对称 | 已证实（正则+用例对照） | `ofv-theme-bridge.ts:66` + `:39` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测符号/分支 | 手册章节 | 用例 # | 状态 |
| --- | --- | --- | --- |
| `isTrustedOfvThemeTokenValue` | §2/§3 | 1,2 | covered |
| `serializeOfvThemeTokens` | §2/§3 | 3,6,7 | covered |
| `parseOfvThemeTokens` | §2/§3 | 3,4,5,8 | covered |
| `sanitizeOfvThemeTokens` | §2/§3 | 4,7 | covered |
| `normalizeOfvThemePayload` | §2/§3 | 9,10 | covered（组合面 partial） |
| `isEmptyOfvThemeTokens`/`OFV_PREVIEW_THEMES` | §4 | — | partial |
