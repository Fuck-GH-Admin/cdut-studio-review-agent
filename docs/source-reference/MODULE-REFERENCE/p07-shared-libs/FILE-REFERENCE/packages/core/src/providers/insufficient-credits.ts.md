---
path: packages/core/src/providers/insufficient-credits.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3c6202ffcd7c5d9fe2fe3f8debc39e1f9ad50116
sha256: a79ca73c3589583c68a08e76cbc78fab2d9bfa9e51a50b5b6bb2a0db50f33f1a
lines: 113
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-05-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---

# packages/core/src/providers/insufficient-credits.ts

## 1. 结论与边界

**额度不足（HTTP 402）纯文本检测与解析**：从 sse-reader `HTTPError` 抛出的混合文本（状态码+body JSON 拼接）还原"额度不足"结构化信息（balance/required/message），供聊天/Agent/渲染层复用（`insufficient-credits.ts:1-12`）。纯文本解析、不依赖运行时类型、无 I/O。

## 2. 导出与关键符号

`export` 逐条核：2 个导出（1 接口 + 1 函数）+ 2 内部函数。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `InsufficientCreditsInfo` | 导出接口 | `:15` | `balance?`/`required?`/`message` | 解析失败 balance/required 为 undefined（`:17-20`） |
| `detectInsufficientCredits` | 导出函数 | `:57` | `(error: unknown, status?: number): InsufficientCreditsInfo \| null` | 唯一入口 |
| `extractStatus`（内部） | 函数 | `:25` | 文本→状态码 | 3 正则（`:27-30`），限 400-599（`:34`） |
| `extractEmbeddedJson`（内部） | 函数 | `:40` | 首 `{` 至末 `}` JSON.parse | 失败 null（`:43-48`） |

## 3. 内部逻辑与关键流程

`detectInsufficientCredits`（`:57-113`）：
1. 文本提取序（`:61-68`）：`Error.message` → 字符串原样 → `{message}` 对象 → `''`；
2. 状态码优先级（`:71-75`）：**显式 `status` 实参 > 对象 `.status` > `extractStatus(text)`**；
3. 文本特征（`:83-88`）：先判 `isUpstreamChannelBalance = /insufficient\s+account\s+balance/i`（**:83**，上游渠道账户不足≠用户额度不足，注释 `:81-82` 与实现一致）；`quotaTextHit` = 非上游余额 且（`/额度不足|预扣费|平台额度|insufficient[\s_]*(credits|quota|balance)?/i` 或 `/[＄$]\s*[0-9]/`）（`:84-88`）；
4. 判定（`:94-98`）：`httpStatus===402` **或**（`403` 且 quotaTextHit）**或**（`httpStatus==null` 且 quotaTextHit）；否则返 null；
5. 结果（`:100-112`）：`extractEmbeddedJson` 抠 `balance`/`required`（仅 number 才收，`:101-104`）与 `serverMsg`（`:105-106`）；`message` 兜底 `'账户额度不足，请联系管理员充值'`（`:111`）。

## 4. 调用者与调用链

- 入向（生产 1 处，grep 全树）：`apps/electron/src/main/lib/adapters/pi-agent-adapter.ts`（具体行未摘=边界）；另经 `providers/index.ts:21` 再导出供聊天/渲染层复用（注释 `:10-11`）。
- 出向：无（纯函数）。
- 测试：`providers/insufficient-credits.test.ts` 14 用例（见 §9）。

## 5. 数据 I/O、读写与副作用

无 I/O、无副作用、无状态（纯文本解析）。

## 6. 分支、失败、取消与恢复

三分支判定（`:94-98`）+ 文本提取四分支（`:61-68`）+ JSON 解析失败返 null（`:46-48`）；无抛错、无取消。**易被简化写错的细节**（照实记录）：显式非 402 状态码会**压制**纯文本兜底（`('额度不足',500)` → null，因 `httpStatus=500` 不满足三条件）；403 必须叠加文本特征；`insufficient account balance` 明确排除。

## 7. 权限与权威状态

无权限分支，依据：纯函数。

## 8. 修改影响面

判定口径影响 pi-agent-adapter 的错误引导（"额度不足请充值"替换原始报错）；正则改动需同步 14 个测试断言与聊天/渲染层复用方。

## 9. 测试证据

`NOT_RUN`（未运行）。直接测试 `insufficient-credits.test.ts`（86 行/**14 用例**，断言逐条读）：真实 402 文本解析 balance=30/required=120/含"当前余额 30 credits"（`:9-15`）；Error 实例（`:17-20`）；显式 status=402 无 JSON→兜底 message（`:22-26`）；`{message,status}` 对象（`:28-31`）；纯文本兜底（`:33-36`）；429/500/普通网络错误不误判（`:38-48`）；**显式非 402 状态码即使含"额度不足"不判**（`('额度不足',500)`→null，`:50-52`）；空/null/undefined 安全（`:54-58`）；New API 403+＄金额判额度不足（`:60-65`）；403 纯认证失败不判（`:67-69`）；`Insufficient account balance` 不判（`:71-73`）；server 翻译 `平台额度暂时不足`+`code:insufficient_credits`（403）判（`:75-78`）；402 无 balance 字段→undefined+兜底 message（`:80-85`）。无 mock（纯函数直测）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| §3 判定序/正则/排除/兜底 | 已证实 | `:25-113` 逐行 |
| 显式状态码压制文本兜底 | 已证实 | `:75,94-98` + 测试 `:50-52` |
| `insufficient account balance` 排除 | 已证实 | `:83` + 测试 `:71-73` |
| pi-agent-adapter 消费行为 | 边界 | 调用点未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/域 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 导出 + 2 内部 | §2 | 15-49 | covered |
| 判定流程 | §3 | 57-113 | covered |
| 14 测试断言 | §9 | test 文件 | covered（NOT_RUN） |
