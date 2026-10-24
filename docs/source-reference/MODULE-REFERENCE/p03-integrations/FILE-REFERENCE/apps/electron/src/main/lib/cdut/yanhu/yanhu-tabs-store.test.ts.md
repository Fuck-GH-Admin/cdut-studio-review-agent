---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-tabs-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e7afea56f8596a7c5c40159f130229536615c542
sha256: 34211b9c12a52d5fb7f612c2529c233bc05f60a55111e2fbc4224a52144f2fe8
lines: 138
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-tabs-store.test.ts

## 1. 测试目标

测试智联万站**标签拓扑持久化**（规格书 7.1.2，`:2`）：JSON 拓扑读写、损坏修复兜底（恢复默认首页）、票据型 SSO 页恢复语义（空白空壳根因防护）。被测对象 `yanhu-tabs-store.ts`/`yanhu-constants.ts` **不在本批 SCOPE**（测试文件在）——本手册按测试反推契约。11 个 `test(`，3 个 describe（`:20`/`:62`/`:97`）。

## 2. 用例清单

真实 fs（mkdtempSync 嵌套路径测自动建父目录 `:49-53`，afterEach 清理）。

| # | 行 | 被测 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:21-25` | stripOneTimeTicket | 剔 `ticket=` 保 hash 路由（`not.toContain('ticket=')`/`toContain('#/wdqj')`） |
| 2 | `:28-30` | stripOneTimeTicket | 瑞数签名参数**逐字节恒等**（`toBe(raw)`） |
| 3 | `:33-35` | stripOneTimeTicket | 非法/空 URL 安全回退原值 |
| 4 | `:38-43` | isYanhuSsoAppUrl | 2 true（票据型应用页）/2 false（**站内入口页 YANHU_HOME_URL 不算** `:41`、baidu） |
| 5 | `:63-68` | YanhuTabsStore.load | 缺文件→默认首页单标签（url=YANHU_HOME_URL、id=activeTabId） |
| 6 | `:71-83` | save→load 往返 | 顺序/激活项/isDormant 保留；文件存在 |
| 7 | `:86-93` | 落盘结构 | `version` toBe(1)、updatedAt number、tabs 数组 |
| 8 | `:98-105` | 坏 JSON 兜底 | 回退默认首页 |
| 9 | `:108-110` | normalize | tabs 非数组/null→默认单标签 |
| 10 | `:113-123` | normalize | 丢非法标签、**失效 activeTabId 回退首个有效**（`:122`） |
| 11 | `:126-136` | normalize | 补字段复位运行时态（title '新标签页'/zoomFactor 1/loading false/canGoBack/canGoForward false） |

## 3. 真实断言

`toBe`/`toEqual`/`toHaveLength`/`toContain`/`not.toContain`/`Array.isArray`/`typeof`。无快照测试。

## 4. 未覆盖（子agent U8 摘要）

`yanhu-tabs-store.ts`/`yanhu-constants.ts` 实现不在范围：YANHU_HOME_URL 具体值、stripOneTimeTicket 解析实现、isYanhuSsoAppUrl 判定规则、原子写入/备份兜底（头注释称"原子写入安全性"但**无原子性断言**，M12）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 个 `test(`、断言如 §2 | 已证实 | 文件全读（子agent 逐用例） |
| M12 头注释"原子写入"无断言 | 已证实 | 全文核对 |
| 被测实现（tabs-store/constants） | 未知 | 不在 SCOPE |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 票据剥离/SSO 判定 | §2 用例 1-4 | `:21-43` | covered |
| 读写往返 | §2 用例 5-7 | `:63-93` | covered |
| 损坏兜底/归一化 | §2 用例 8-11 | `:98-136` | covered |
| §4 边缘 | — | — | unknown |
