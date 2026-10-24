---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-domain-gatekeeper.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 13afcdcf704cd4c347a5ff3e6cb894c4f1c240ea
sha256: 6539d3641ce78c2700ba76f583b33da094af9d5131fc2d01cd5f0b4f7563ad72
lines: 99
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-domain-gatekeeper.test.ts

## 1. 测试目标

直接测试 `yanhu-domain-gatekeeper.ts` 4 个导出+单例：校内域判定（防伪装域）、网页地址判定、地址栏规范化、类裁决。11 个 `test(`，4 个 describe（`:18`/`:41`/`:57`/`:75`）。

## 2. 用例清单

无 mock/无 IO；`buildYanhuBlockedUrl`（shared）造哨兵 URL。

| # | 行 | describe | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:19-27` | isCdutDomain | 7 个 `toBe(true)`（bsdt/jw/library/gra/主域/深层子域:8443） |
| 2 | `:29-38` | isCdutDomain | 8 个 `toBe(false)`（baidu/cdut.com/**evil-cdut.edu.cn.phishing.com**/**cdut.edu.cn.evil.com**/javascript:/file:/非 URL/空） |
| 3 | `:42-46` | isWebUrl | 3 `toBe(true)`（站外 https/http/带端口） |
| 4 | `:48-54` | isWebUrl | 5 `toBe(false)`（mailto/javascript/file/非 URL/空） |
| 5 | `:58-61` | normalizeInputUrl | 带协议原样 2 |
| 6 | `:63-66` | normalizeInputUrl | 裸域名补 https 2（含端口路径） |
| 7 | `:68-72` | normalizeInputUrl | `toBeNull()` 3（中文/英文含空格/空——不猜搜索） |
| 8 | `:76-85` | Gatekeeper | evaluate 放行 3/阻断 2（mailto/file） |
| 9 | `:87-98` | Gatekeeper | 哨兵 `isInternalYanhuUrl` true + `isAllowed` true；`resolveAddressInput('baidu.com')` → `url:'https://baidu.com'`、`allowed:true` |

## 3. 真实断言

`toBe`/`toBeNull`/`not.toBeNull`——精确布尔/字符串。无快照测试。

## 4. 未覆盖

- `evaluate` 的 url 回传值（放行与阻断都规范化——`:78` 注释语义未断言）。
- `resolveAddressInput` 不可规范化→null 分支。
- 哨兵+WebUrl 组合优先级。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个 `test(`、断言如 §2 | 已证实 | 文件全读 |
| 伪装域防线（用例 2）锁定 | 已证实 | `:32-33` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 校内判定 | §2 用例 1/2 | `:19-38` | covered |
| 网页判定 | §2 用例 3/4 | `:42-54` | covered |
| 输入规范化 | §2 用例 5-7 | `:58-72` | covered |
| 类裁决/哨兵 | §2 用例 8/9 | `:76-98` | covered |
| §4 边缘 | — | — | unknown |
