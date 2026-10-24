---
path: packages/shared/src/utils/url-nul-safety.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 582581aa53145d158ee42572cac4ec9916f4b1e7
sha256: 0e3c7b35ea7105e02f967fd4b3abde54de371ffa76561d0616ed19d292d8c803
lines: 50
kind: source
package: p07-shared-libs
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# packages/shared/src/utils/url-nul-safety.ts

## 1. 结论与边界

URL 空字符（NUL）截断防御（**CVE-2026-105482 加固**，`packages/shared/src/utils/url-nul-safety.ts:1-12`）：在任何 URL 进入「解析→DNS→网络」链路前，对原始串与解析后 hostname 做硬校验，命中 NUL/百分号编码 NUL/C0 控制字符直接抛错。纯函数、零运行时依赖，主/渲染进程共用。

## 2. 导出与关键符号

`export` 共 **2 个**（1 class + 1 函数）。

| 符号 | 行 | 签名 | 说明 |
| --- | --- | --- | --- |
| `UnsafeUrlCharacterError` | `:20-25` | `Error` 子类（`name='UnsafeUrlCharacterError'`） | 断言错误 |
| `assertSafeUrlNoNul` | `:33-50` | `(rawUrl: string) => string` | 安全原样返回，否则抛 |

内部：`CONTROL_CHARS = /[\u0000-\u001f\u007f]/`（`:15`）、`ENCODED_CONTROL_CHARS = /%(?:[01][\da-f]|7f)/i`（`:17`）。

## 3. 内部逻辑与关键流程

1. 非字符串/空串 → 抛「URL 不能为空。」（`:34-36`）。
2. **双重检查**（`:37-44`）：原始串命中 `CONTROL_CHARS` 或 `ENCODED_CONTROL_CHARS` → 抛（捕获裸控制字符与编码 NUL）；`new URL(rawUrl)` 后再检 `parsed.hostname`（捕获 WHATWG 解析阶段可能保留的编码残留，`:41-44`）。
3. `URL` 构造抛出的**其它**错误被吞掉（`:45-48`）：无法解析的 URL 交给调用方既有解析逻辑，本工具只负责字符级防线。
4. 返回 `rawUrl`（`:49`）。

## 4. 调用者与调用链

- 消费方：URL 进入网络链路前的调用方（provider/网络层/远程服务）；主/渲染共用（`:11`）。
- 出向：无模块依赖。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O、无状态。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 空/非字符串 | `:34-36` | 抛「URL 不能为空。」 |
| 原始串含控制字符 | `:37-39` | 抛 |
| hostname 含控制字符 | `:42-44` | 抛 |
| URL 不可解析 | `:45-48` | 吞解析错，返回原串（交调用方） |
| 安全 | `:49` | 原样返回 |

## 7. 权限与权威状态

安全边界（非权限）：阻断 `%00`/裸 `\0` 欺骗 DNS/绕过主机名校验（`:4-5`）。

## 8. 修改影响面

- 正则放宽会重新打开 CVE 面；`ENCODED_CONTROL_CHARS` 只覆盖 `%00-%1f/%7f`（不含 `%80+`，按 C0 定义）。
- 「URL 不可解析则放行」语义改变会影响调用方错误归属。

## 9. 测试证据

- 本批 `url-utils.test.ts`（417 行）与 `url-nul-safety` 相邻主题；本文件断言分布见该测试手册（`usage-parsing.test.ts` 不含）。
- **NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个导出、双重检查 | 已证实 | `:33-49` |
| 不可解析 URL 放行给调用方 | 已证实 | `:45-48` |
| CVE 背景 | 已证实（注释） | `:1-9` |
| 调用方清单 | 未知 | 未列全 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 2 个导出 | 2 | — | covered |
| 5 分支 | 6 | `:33-49` | covered |
| 双正则 | 3 | `:15-17` | covered |
| 测试证据 | 9 | — | covered |
