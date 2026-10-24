---
path: packages/core/src/providers/insufficient-credits.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 868da97d95f258c1a80c9fe1e55ecf37f1eef224
sha256: f6e48f9ab9a0a595ca52f8487b8ac85e746c48750b3d49e4a2b8e2b4c8f154f9
lines: 86
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/providers/insufficient-credits.test.ts

## 1. 测试目标

`detectInsufficientCredits`（`insufficient-credits.ts:57`）的判定矩阵：402/403/无状态码三类入口 × 额度文本特征 × 嵌入 JSON 解析 × 排除规则（上游账户余额不足/纯认证失败/非 402 显式状态码）。bun:test；被测对象为纯函数（真实源码，无 mock）。

## 2. 用例清单

共 **14 个 `test(`**（逐条计数核对）。夹具：`realError`（sse-reader 真实格式 `<provider> API 错误 (402)，请求端点：<url>: <body>`，`:6-7`）。

| 行 | 用例 | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| `:9` | 识别真实 402 并解析余额/所需额度 | `realError` 文本 | detect | 独立 |
| `:17` | 接受 Error 实例 | `new Error(realError)` | detect | 独立 |
| `:22` | 显式 status=402 无 JSON 也识别 | `'账户额度不足', 402` | detect | 独立 |
| `:28` | 带 status 字段的对象 | `{message:'额度不足',status:402}` | detect | 独立 |
| `:33` | 文本含「额度不足」无矛盾状态码兜底 | `'Error: 额度不足，请充值'` | detect | 独立 |
| `:38` | 429 限流不误判 | `'API 错误 (429)…'` | detect | 独立 |
| `:42` | 500 不误判 | `'API 错误 (500): internal error'` | detect | 独立 |
| `:46` | 普通网络错误不误判 | `'fetch failed: ECONNRESET'` | detect | 独立 |
| `:50` | **显式 status 非 402 时即使含额度字样也不判** | `('额度不足', 500)` | detect | 独立 |
| `:54` | 空输入安全 | `''/null/undefined` | detect×3 | 独立 |
| `:60` | New API 403 预扣费（含 ＄ 金额）判额度不足 | 文本+403 | detect | 独立 |
| `:67` | 403 纯认证失败不判 | `'API Error: 403 invalid api key', 403` | detect | 独立 |
| `:71` | 上游 `Insufficient account balance` 不判 | 文本+403 | detect | 独立 |
| `:75` | server 翻译 `平台额度暂时不足`+`code:insufficient_credits` 判 | JSON 文本+403 | detect | 独立 |
| `:80` | 402 无 balance 字段→undefined+兜底 message | `'API 错误 (402): {"error":"额度不足"}'` | detect | 独立 |

（表 15 行含 `:54` 内 3 次断言行；`test(` 计数=14。）

## 3. 真实断言

逐条 expect 行号（已读）：`:11-14`（`not.toBeNull`/`balance=30`/`required=120`/`message` contains '当前余额 30 credits'）；`:19`（`balance=30`）；`:24-25`（`not.toBeNull` + `message` 精确 `'账户额度不足，请联系管理员充值'`）；`:30`（`not.toBeNull`）；`:35`；`:39/:43/:47`（`toBeNull`）；`:51`（`toBeNull`——压制语义）；`:55-57`（三输入 `toBeNull`）；`:63-64`（`not.toBeNull` + message contains '额度'）；`:68/:72`（`toBeNull`）；`:77`（`not.toBeNull`）；`:82-84`（`not.toBeNull`/`balance` `toBeUndefined`/message 兜底精确值）。

## 4. 未覆盖与脆弱点

- 未覆盖组合（检索=本文件全文）：`extractStatus` 3 正则各自唯一命中场景未逐一断言（`(NNN)`/`HTTP|status|statusCode`/`API Error: NNN` 仅经夹具间接）；嵌入 JSON 非法（`extractEmbeddedJson` parse 失败）无断言；`balance` 为非 number 类型无断言。
- 脆弱点：断言依赖中文文案精确值（`:25,:84`）与正则字面；message 文案改动会破测试。
- 断言≠已运行：**本轮 NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 用例、断言行、夹具形状 | 已证实 | 全 86 行逐行读 |
| 判定语义与被测实现一致 | 已证实 | 逐用例对照 `insufficient-credits.ts:57-113` |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 14 用例 | §2/§3 | 9-85 | covered |
| 未覆盖组合 | §4 | — | covered（如实） |
