---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-devtools-hub.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9118230912aeb15cfe2e6c1f6323353388b20426
sha256: 401d526182bcfd8d328acdd1cc1e4c8eb3b901bfb0dc2826ec1b6d6d6be43e76
lines: 30
kind: test
package: p03-integrations
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-devtools-hub.test.ts

## 1. 测试目标

CDP 异常信息提取单测（文件头 `:1-6`）：优先取 `exception.description`（真实异常如 TypeError: Illegal invocation）而非 Chrome 笼统 `text:"Uncaught"`。被测：`resolveCdpExceptionMessage`（纯函数）。纯内存。本轮 `NOT_RUN`。

## 2. 用例清单

1 describe、**3 test**（`:11-29`）：

1. `:12-18` `{text:'Uncaught', exception:{description:'TypeError: Illegal invocation\n    at …'}}` → `'TypeError: Illegal invocation'`（description 首行）。
2. `:20-22` 无 description → 回退 text（`'SyntaxError: Unexpected token'`）。
3. `:24-29` `undefined`/`null`/`{}`/`{text:'   '}` → 均 `toBeNull`（调用方据此不抛出）。

## 3. 真实断言

- #1 是“不吞成 Uncaught”的直接反证（历史缺陷口径）。
- #3 四种空值边界逐一断言。

## 4. 未覆盖与脆弱点

**未覆盖**：`YanhuDevToolsHub` 类全部（Electron/CDP 依赖）；description 多行首行 trim 边界。

**脆弱点**：纯函数测试，无 CDP mock。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 describe、3 test、纯内存 | 已证实 | `:11`；`grep -c test(`=3 |
| description 优先/回退/null | 已证实 | `:12-29` |
| 总线主体 | 未知 | 未覆盖（Electron） |
| 测试未运行 | 未知 | 本轮 NOT_RUN |

## 6. 覆盖表

| 被测分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| `resolveCdpExceptionMessage` 全分支 | #1-#3 | `:12-29` | covered |
| `YanhuDevToolsHub` | — | — | unknown |
