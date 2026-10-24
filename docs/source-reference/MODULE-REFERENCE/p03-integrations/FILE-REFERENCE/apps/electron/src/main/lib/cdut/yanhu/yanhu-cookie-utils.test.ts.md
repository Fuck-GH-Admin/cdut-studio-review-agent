---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-cookie-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cecf2938348ce2b1a533e31d574659f1918394d3
sha256: 69e8cffb753287e13ff35f5e2b0075a177e64aab9b4fceacb8ab9f4d73f163aa
lines: 173
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-cookie-utils.test.ts

## 1. 测试目标

瑞数陈旧签名清洗单测（文件头 `:1-6`）：成对 *O/*P 识别与单向精准剔除、独立 P 与非瑞数 Cookie 不受影响、目标域透传/默认回落、异常兜底不抛。被测：`stripStaleRuiShuCookies`/`DEFAULT_RUISHU_DOMAIN`。夹具：`createFakeSession`（`:28-48`，伪造 Session 仅实现 cookies.get/remove + 记录调用）。本轮 `NOT_RUN`。

## 2. 用例清单

2 describe、**9 test**：

### 2.1 成对签名识别（6，`:50-142`）
| # | test 行 | 断言要点 |
| --- | --- | --- |
| 1 | `:51-65` | 成对（`sMLAeTqisZbFO/P`）+JSESSIONID：removed 1；removeCalls 精确 `[{url:'https://jw.cdut.edu.cn/', name:'sMLAeTqisZbFP'}]`（缺省路径按根路径） |
| 2 | `:67-74` | 独立 `abcP`（无配对 O）：removed 0、removeCalls 0 |
| 3 | `:76-87` | JSESSIONID/SERVERID/themeSkinColor：removed 0、removeCalls 0 |
| 4 | `:89-102` | 多对（aaa/bbb 各一对 + cccO）：removed 2、names `['aaaP','bbbP']` |
| 5 | `:104-116` | cookie 自带 domain `.jw.cdut.edu.cn`+path `/jsxsd`：删除 URL `'https://jw.cdut.edu.cn/jsxsd'`（去点、路径保留） |
| 6 | `:118-141` | 根路径删除抛错 → 兜底成功于 `'https://jw.cdut.edu.cn/jsxsd/'`（末次 removeCalls 断言） |

### 2.2 目标域与兜底（3，`:144-173`）
7. `:145-151` 默认过滤 `[{domain: DEFAULT_RUISHU_DOMAIN}]`。
8. `:153-166` 指定 `'bsdt.cdut.edu.cn'`：过滤/删除 URL 同步该域、removed 1。
9. `:168-172` get 抛错（`onGetError`）→ `resolves.toBe(0)`（静默不抛）。

## 3. 真实断言

- #1/#5/#6 断言删除 URL 全字符串精确（路径作用域语义）。
- #2/#3 是“绝不误删”的反证。
- #9 用 `resolves.toBe(0)` 断言异常兜底。
- fake Session 记录 getFilters/removeCalls（副作用可观察）。

## 4. 未覆盖与脆弱点

**未覆盖**：`http` 协议回退分支（fake remove 不抛时 https 先成功）；删除失败 warn 路径；`/jsxsd`（无斜杠）候选；`path` 缺斜杠规范化。

**脆弱点**：伪造 Session `as unknown as Session`；#6 手工 session 字面量。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 describe、9 test、伪造 Session | 已证实 | `:50/:144`；`grep -c test(`=9 |
| 成对剔除/保守不误删 | 已证实 | `:51-102` |
| 域/路径作用域保真+兜底 | 已证实 | `:104-141` |
| 域透传/异常兜底 | 已证实 | `:145-172` |
| http 回退/warn 分支 | 未知 | 未覆盖 |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 成对识别/计数 | #1/#4 | `:51-65`、`:89-102` | covered |
| 不误删 | #2/#3 | `:67-87` | covered |
| URL 构造/兜底 | #5/#6 | `:104-141` | covered |
| 域参数/异常 | #7-#9 | `:145-172` | covered |
