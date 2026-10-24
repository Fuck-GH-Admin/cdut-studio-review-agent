---
path: packages/shared/src/types/deepseek-model-alias.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0645e7b531e4bd1881d1e8f19a22eb4ac87e47c7
sha256: 9ef3cebe8dbe86805e097a9c21dadb662c900165a3052ca901d1a87d458f1ba4
lines: 68
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/deepseek-model-alias.ts

## 1. 结论与边界

DeepSeek 模型 ID 归一的**单一 source of truth**（`:2`）：把历史写法/官方短名归一为 Pi catalog 正式 ID。动机（`:4-16` 注释）：0.86 起 catalog 把 Flash 正式 ID 改为 `deepseek-flash`（原 `deepseek-v4-flash` 移除），不归一会导致同一模型拿不同窗口/价格/图片能力/思考档位。

不做的事：只做 ID 归一，**不代表 provider 链路已验证 1M 协商**（`:18-19` 注释：能力判定在 context-window 的 `supportsVerified1MContext`）；不做请求。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状/行为 |
| --- | --- | --- | --- |
| `DEEPSEEK_V4_MODEL_ALIASES` | const（`Object.freeze`） | `:23-29` | `{'deepseek-v4-flash':'deepseek-flash', 'deepseek-pro':'deepseek-v4-pro'}` 2 键 |
| `DEEPSEEK_V4_SHORT_MODEL_NAMES` | const（`Object.freeze`） | `:38-41` | `['deepseek-flash','deepseek-pro']`（`:33-37` 注释：刻意与别名表分离——`deepseek-flash` 已是正式 ID 不入别名表，但属"按代际继承 1M"的官方短名） |
| `normalizeModelIdTail` | function | `:47-52` | `(modelId?) => string\|undefined`：trim+小写+剥 `[1m]` 后缀（`:48`），取 `/` 分段最后一段（`:50-51`）；空→undefined。语义与 context-window 的 `normalizeContextModelId` 一致（后者复用本函数，`:45`） |
| `resolveDeepSeekV4ModelId` | function | `:58-62` | 归一：`ALIASES[model] ?? model`；空→undefined |
| `isDeepSeekV4Alias` | function | `:65-68` | `Object.hasOwn(ALIASES, model)`（只认别名表，短名/正式 ID 不算） |

## 3. 内部逻辑与关键流程

`normalizeModelIdTail` 流水线：`trim → toLowerCase → replace(/\[1m\]$/i,'') → split('/').filter(Boolean).at(-1)`（`:48-51`）。`resolveDeepSeekV4ModelId` = tail 归一 + 别名查表回退原值（`:59-61`）。全部纯函数、无副作用、输入输出确定。

## 4. 调用者与调用链

消费方（全冻结树检索 `deepseek-model-alias`/`resolveDeepSeekV4ModelId`）：context-window 的代际 1M 规则（`packages/shared/src/utils/context-window.ts`，复用 `normalizeModelIdTail`）、按 V4 SKU 判定/取元数据的调用点（`:15-16` 注释要求"凡是按 V4 代 SKU 判定…都必须先过这里"）。测试：`deepseek-model-alias.test.ts`（同批）。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯函数 + 两个冻结常量；无 I/O、无日志、无全局可变状态（`Object.freeze` 防改）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| 空/全空白输入 | `:48-49`、`:59-60` | `undefined` |
| 网关前缀/大小写/`[1m]` 后缀 | `:48-51` | tail 归一后照常解析 |
| 别名命中 | `:61` | 映射为 catalog ID |
| 非别名 | `:61` | 原样返回（不误改其它 DeepSeek 型号） |

无异常抛出、无取消/恢复概念。

## 7. 权限与权威状态

本文件是**模型 ID 归一权威**（`:2` "单一 source of truth"）；但 1M 能力权威在 `context-window.supportsVerified1MContext`（`:19`）——两级权威分离照实记录。

## 8. 修改影响面

改别名表影响所有按 V4 SKU 判定/取元数据的链路（窗口/价格/图片能力/思考档位，`:15-16`）；`normalizeModelIdTail` 与 `context-window.normalizeContextModelId` 语义绑定（`:45` 注释），改任一侧需同步。与 `deepseek-model-alias.test.ts`（同批）直接耦合。

## 9. 测试证据

直接测试 `deepseek-model-alias.test.ts`（7 个 `test(`，同批手册逐条核对）：别名映射（`:13-16`）、正式 ID 原样（`:20-22`）、网关/大小写/后缀归一（`:26-29`）、新旧收敛（`:34-35`）、无关模型不误改与空输入 undefined（`:39-43`）、`isDeepSeekV4Alias` 只认别名表（`:47-51`）、短名清单与别名表分离（`:56-58`）。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 导出、2 键别名、2 项短名 | 已证实 | `:23-41` |
| `[1m]` 剥除 + 网关尾段取法 | 已证实 | `:47-52` |
| `deepseek-flash` 不在别名表（只在短名表） | 已证实 | `:26`、`:39` |
| 与 context-window 归一语义一致 | 已证实（注释声明+函数复用） | `:45` |
| 0.86 catalog 变更的历史陈述 | 推断 | 注释自述（`:4-9`），未对 pi-ai catalog 文件逐字核（不在冻结树） |
| 1M 协商是否通过 | 未知 | 明示不在本文件职责（`:18-19`） |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 5 导出全量 | §2 | covered |
| 归一流水线/分支 | §3/§6 | covered |
| 两级权威分离 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 7 测试用例 | §9 | covered |
