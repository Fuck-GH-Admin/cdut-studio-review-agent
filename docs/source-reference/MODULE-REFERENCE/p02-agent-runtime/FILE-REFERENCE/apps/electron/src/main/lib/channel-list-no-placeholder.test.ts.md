---
path: apps/electron/src/main/lib/channel-list-no-placeholder.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fecbef34909f3582fbdc21acd159d1535352dc05
sha256: 918df0dab3bc19961bf63b51cb19560783cc37eaac540402b45377ad6847f824
lines: 90
kind: test
package: p02-agent-runtime
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/channel-list-no-placeholder.test.ts

## 1. 测试目标

锁定 `listChannels` **不生成占位渠道**（`:1-8` 头注释记录历史行为：曾自动建 DeepSeek 占位渠道并预置 deepseek-v4-pro/flash——"预置清单冒充真实端点能力"，现锁定"渠道只来自用户自配或服务端下发"）；并测 `mergeServerChannelModels` 的本地状态保留。4 个 `test(`，2 个 describe（`:31` 占位渠道、`:62` 服务端同步保留）。

## 2. 用例清单

环境：`PROFER_CONFIG_DIR` 临时目录隔离（`:17-24`，`:21` 注释：配置根每次调用解析故可测试内隔离）；afterAll 清理（`:26-29`）。真实 fs 写入（仅临时目录）。

| # | 行 | 设置 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:32-34` | 空配置目录 | `listChannels()` `toEqual([])`（无 DeepSeek 占位） |
| 2 | `:36-59` | 写入仅 user-kimi 渠道 | `:57` ids `toEqual(['user-kimi'])`；`:58` `.some(provider==='deepseek')` `toBe(false)` |
| 3 | `:63-79` | mergeServerChannelModels(服务端 2 模型, 本地 2 模型带 enabled/context1m) | `:75` `toEqual` 两条（本地 enabled:false/context1m:false 与 enabled:true/context1m:true 全保留） |
| 4 | `:81-89` | 本地 undefined | `:87` `toEqual([{id:'glm-5.3',…enabled:true}])`；`:88` `'context1m' in merged[0]!` `toBe(false)`（不带 1M 覆盖） |

## 3. 真实断言

`toEqual`（全等数组）+ `toBe`（含 `in` 运算符否定）。无快照测试。

## 4. 未覆盖

- `mergeServerChannelModels` 匹配键边界（server 缺 id 只有 name 时匹配不到本地——实现缺陷见 channel-manager 手册矛盾表）。
- schema 迁移后的 listChannels（readConfig 回写路径）。
- 多渠道混合场景。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 `test(`、断言如 §2 | 已证实 | 文件全读（90 行） |
| 历史行为注释（占位渠道已移除） | 已证实 | `:1-8` |
| 实际执行结果 | 未知 | `NOT_RUN` |
| 测试文件混入 merge 用例（文件名主题不完全对齐） | 已证实 | `:62-89`（照实记录） |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 空列表不造占位 | §2 用例 1 | `:32-34` | covered |
| 自配原样返回 | §2 用例 2 | `:36-59` | covered |
| 本地状态保留 | §2 用例 3 | `:63-79` | covered |
| 无本地不虚构覆盖 | §2 用例 4 | `:81-89` | covered |
| §4 边缘 | — | — | unknown（未覆盖） |
