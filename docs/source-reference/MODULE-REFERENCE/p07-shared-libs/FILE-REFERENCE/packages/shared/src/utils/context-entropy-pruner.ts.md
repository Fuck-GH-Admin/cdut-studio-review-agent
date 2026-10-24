---
path: packages/shared/src/utils/context-entropy-pruner.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b6480920fb490ec136d87325ddfdef06db9119c1
sha256: fcecc4d1842bc8e1fa4cd8b39a72d30a0b8aa1835524fde3bd6bd45dd339cc5f
lines: 135
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/context-entropy-pruner.ts

## 1. 结论与边界

本地轻量**语义熵上下文剪枝引擎**（`packages/shared/src/utils/context-entropy-pruner.ts:1-3`）：对超长工具输出文本做「头尾保护 + 相似行折叠 + 行级信息熵择优保留」的压缩。135 行单模块：1 interface + 1 函数（内部 7 条不变式正则）。

边界：纯字符串进字符串出；不改语义结构行（import/报错/栈帧/文件路径等绝不剔除，`:16-25`）；不做语义理解（熵是字符分布近似，`:76`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `EntropyPruneOptions` | interface | 5-14 | `{targetRatio?=0.5; minCharsToPrune?=2000; keepHeadLines?=20; keepTailLines?=30}` | |
| `pruneToolOutputByEntropy` | function | 27-135 | `(rawText: string, options?) => string` | 唯一函数 |

内部：`INVARIANT_PATTERNS`（`:17-25`，7 正则：import/声明/错误关键词/调用栈帧/MD 列表/闭合括号/文件路径行号）。

## 3. 内部逻辑与关键流程

`pruneToolOutputByEntropy`（`:27-135`）：

1. `:35-42` 短路：空/长度 < minCharsToPrune 原样返回；行数 ≤ head+tail+10 原样返回。
2. `:44-47` 头尾保护：head 前 20 行、tail 后 30 行、middle 中段候选池。
3. `:49-73` **相似行折叠**：`normalizedPattern = line.replace(/\d+/g,'#').trim()`；归一化后 >5 字符且与上一行同模式 → 累计跳过，替换为 `[... 省略 N 行相似输出 ...]`（去重 npm 进度条/轮询/递归栈，`:49`）。
4. `:75-100` 行评分：不变式行 → score 9999；否则字符分布熵 `H=-Σp·log2(p)` × `log10(max(2,trim长度))`（`:90-98`）。
5. `:102-110` 预算裁剪：`budget=max(10, floor(行数×targetRatio))`；全部不变式保留 + 非不变式按 score 降序补足 `budget-不变式数`。
6. `:112-134` 按原顺序重建，被剔块替换为 `[... 语义剪枝省略 N 行低信息输出 ...]`；返回 `head+finalMiddle+tail` join `\n`。

## 4. 调用者与调用链

出向：无 import。入向（检索=符号名+模块名，全冻结树）：**零产品调用**——仅 barrel `index.ts:73-74` 再导出与本批单测 `context-entropy-pruner.test.ts:2,33-34,40,62,76,90`；`EntropyPruneOptions` 零外部引用。main/preload/renderer/core/cli 全无入口（死导出面，预留引擎）。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：纯函数，无 I/O/状态。

## 6. 分支、失败、取消与恢复

无异常路径（空/短文本短路）；无异步/取消。幂等性**非**保证（剪枝是有损变换，二次剪枝结果可能不同——推断，见 §10）。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

`INVARIANT_PATTERNS`/熵公式/预算语义改动会改变压缩产物文本；调用方若对输出做哈希/比对会失配（caller 见 §10）。测试：`context-entropy-pruner.test.ts`（本批）。

## 9. 测试证据

直接测试 `packages/shared/src/utils/context-entropy-pruner.test.ts`（本批，94 行；断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 头尾保护 + 不变式 9999 分必留 | 已证实 | `:44-47,84-88,104` |
| 数字归一化相似折叠 | 已证实 | `:56-66` |
| 熵评分公式 | 已证实 | `:90-98` |
| budget=max(10,…) 下限 | 已证实 | `:103` |
| 二次剪枝非幂等 | 推断 | 有损变换语义 |
| 生产 caller | 见 UNVERIFIED 补记 | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `EntropyPruneOptions` | §2 | 5-14 | covered |
| `pruneToolOutputByEntropy` 6 步 | §3 | 27-135 | covered |
| `INVARIANT_PATTERNS` 7 条 | §2 | 17-25 | covered |
