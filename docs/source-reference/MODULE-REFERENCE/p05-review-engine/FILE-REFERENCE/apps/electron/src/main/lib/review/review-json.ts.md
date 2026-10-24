---
path: apps/electron/src/main/lib/review/review-json.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fe019f6ae05ac2770f9270f87273d223b7ae3df0
sha256: 5c9aec7282fbbd832d6f1e6dea7cb8cf554d4ede5789dc9662bdaa66ad00cf40
lines: 28
kind: source
package: p05-review-engine
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-json.ts

## 1. 结论与边界

与审核网关共享的**宽容 JSON 提取器**（`apps/electron/src/main/lib/review/review-json.ts:1`）：从模型输出文本中三级尝试提取 JSON 值。独立于网络/渠道配置模块。无 I/O、无副作用。

## 2. 导出与关键符号

`export` 共 **1 个**。

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `extractJson` | 导出函数 | `:2-28` | `(text: string) => unknown \| undefined` | 提取失败返回 `undefined` |

## 3. 内部逻辑与关键流程

三级提取（后者仅在前者抛错时尝试）：

1. **直接解析**（`:5-9`）：`JSON.parse(text.trim())`；非字符串或空白字符串直接返回 `undefined`（`:3`）。
2. **Markdown 围栏**（`:10-17`）：正则 ``/```(?:json)?\s*([\s\S]*?)```/i`` 取围栏内文本再 `JSON.parse`。
3. **首尾花括号**（`:18-26`）：`indexOf('{')`/`lastIndexOf('}')` 切片解析；`end > start` 才尝试，失败返回 `undefined`。

**注意**：三级都只对 JSON **对象/数组**形态友好——无花括号的裸数组（`[1,2]`）在第 3 级不会被提取（`indexOf('{')` 为 -1）；第 1 级若文本本身就是裸数组且无围栏则可直接解析成功。

## 4. 调用者与调用链

- 全冻结树检索（apps+packages，`*.ts`/`*.tsx`）：import `review-json` 的文件恰 2 个——`review-model-gateway.ts`（`:21` import、`:22` re-export `extractJson`）与 `v2-executor-factory.ts`。本批 `review-model-gateway.test.ts:84-107` 经 re-export 直接覆盖本函数（纯 JSON/围栏/解说包裹/残缺/空串）。
- 出向：仅 `JSON.parse`/正则。

## 5. 数据 I/O、读写与副作用

纯函数；无 I/O、无副作用、无状态。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 非字符串/空白 | `:3` | `undefined` |
| 直接解析失败 | `:7-9` | 进入第 2 级 |
| 围栏缺失/围栏内解析失败 | `:11-16` | 进入第 3 级 |
| 无花括号或切片解析失败 | `:20-26` | `undefined` |

全部失败都收敛到 `undefined`，不抛错（`catch` 吞掉 `SyntaxError`）。

## 7. 权限与权威状态

无身份/权限语义；输出是**未验证**的模型文本解析结果，权威性由调用方决定。

## 8. 修改影响面

- 改围栏正则或花括号规则会影响模型网关对非标准输出的容错率。
- 返回 `undefined` 的语义被调用方用于「解析失败」判定；改为抛错会波及网关。

## 9. 测试证据

- `review-model-gateway.test.ts`（125 行）经 `review-model-gateway.ts:22` 的 re-export **直接断言**本函数（`:85-107`：纯 JSON、```` ```json ````/无标记围栏、数组围栏、解说包裹取最外层 `{}`、非 JSON/空串/残缺→`undefined`）；本文件无专属测试文件（全树检索）。
- **NOT_RUN**：未运行测试/构建/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `extractJson` | 已证实 | `:2` |
| 三级提取顺序与兜底 | 已证实 | `:5-26` |
| 裸数组不被第 3 级提取 | 已证实 | `:18-19` `indexOf('{')` 逻辑 |
| 无专属测试 | 已证实 | 全冻结树检索 |
| 调用方恰为 gateway 与 v2-executor-factory | 已证实 | 全树检索 import `review-json` 仅 2 文件 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `extractJson` | 2、3 | `:2-28` | covered |
| 三级分支 | 6 | `:3-26` | covered |
| 调用链 | 4 | — | covered |
| 测试证据 | 9 | — | covered（无专属测试） |
