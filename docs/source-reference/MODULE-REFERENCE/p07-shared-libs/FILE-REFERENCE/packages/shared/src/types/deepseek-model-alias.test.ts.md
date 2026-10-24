---
path: packages/shared/src/types/deepseek-model-alias.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 860117c2c92994d27b7c8e56766d5157b33f10b9
sha256: 133be384df607fff3541cb87f4755d6ac9c064d8d210dbbddb53c04cf5644f78
lines: 60
kind: test
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/deepseek-model-alias.test.ts

## 1. 测试目标

直接测试 `deepseek-model-alias.ts` 的 5 个导出：模型 ID 归一（别名映射/正式 ID 不改写/网关前缀与 `[1m]` 后缀剥离/新旧写法收敛/无关模型不误改/别名判定/短名表分离）。7 个 `test(`，1 个 `describe('DeepSeek 模型 ID 归一')`（`:10`）。

不测试：context-window 的 1M 规则（消费方自测）；provider 链路。

## 2. 用例清单

夹具：无（纯函数直调）；导入被测 5 符号（`:2-8`）。用例间无顺序依赖。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:11-17` | 旧代/短名 | `resolveDeepSeekV4ModelId` ×2 + 表查 ×2 | `:13` `('deepseek-v4-flash')` `toBe('deepseek-flash')`；`:14` `('deepseek-pro')` `toBe('deepseek-v4-pro')`；`:15-16` `ALIASES[...]` 同值 |
| 2 | `:19-23` | 正式 ID | resolve ×2 + 表查 | `:20-21` 原样返回；`:22` `ALIASES['deepseek-flash']` `toBeUndefined()` |
| 3 | `:25-30` | 网关/大小写/后缀 | `normalizeModelIdTail` + resolve ×3 | `:26` `' Gateway/DeepSeek-Flash[1m] '`→`'deepseek-flash'`；`:27` `'Gateway/DeepSeek-Pro'`→`'deepseek-v4-pro'`；`:28-29` 带 `[1m]`/前缀 → `deepseek-flash` |
| 4 | `:32-36` | 新旧写法 | 相等比较 | `:34-35` 新旧 resolve 结果 `toBe` 相同 |
| 5 | `:38-44` | 无关/空 | resolve ×5 | `:39-41` `deepseek-chat`/`deepseek-reasoner`/`deepseek-turbo` 原样；`:42` `undefined`→`undefined`；`:43` `'   '`→`undefined` |
| 6 | `:46-52` | 别名判定 | `isDeepSeekV4Alias` ×4 | `:47` 旧写法 true；`:48` `'gateway/deepseek-pro[1m]'` true；`:50` `'deepseek-flash'` **false**（正式 ID 非别名）；`:51` `'deepseek-chat'` false |
| 7 | `:54-59` | 短名表 | 表内容/表分离 | `:56-57` 短名表 `toContain` 两项；`:58` 别名表键 `not.toContain('deepseek-flash')` |

## 3. 真实断言

全部 `toBe`/`toBeUndefined`/`toContain`/`not.toContain`（精确断言，非快照）。无 mock/无 spy/无 IO。核心契约断言在 用例 4（`:33` 注释"同一个模型不因写法不同而拿到不同窗口/价格/图片能力"）。

## 4. 未覆盖

- `normalizeModelIdTail` 的多段路径（如 `a/b/c`）与尾段为空（`'gateway/'`）行为。
- `[1M]` 大写后缀（正则 `/\[1m\]$/i` 应匹配，但无断言）。
- `isDeepSeekV4Alias(undefined/'   ')` 空输入。
- `Object.freeze` 防改性。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 个 `test(`、断言全为精确匹配 | 已证实 | 文件全读 |
| 无 mock/IO/顺序依赖 | 已证实 | 全文核对 |
| 实际执行结果 | 未知 | `NOT_RUN`（本轮未跑 bun test） |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 别名映射 | §2 用例1 | `:11-17` | covered |
| 正式 ID 不改写 | §2 用例2 | `:19-23` | covered |
| 前缀/后缀归一 | §2 用例3 | `:25-30` | covered |
| 新旧收敛 | §2 用例4 | `:32-36` | covered |
| 空输入/无关模型 | §2 用例5 | `:38-44` | covered |
| 别名判定边界 | §2 用例6 | `:46-52` | covered |
| 双表分离 | §2 用例7 | `:54-59` | covered |
| §4 列出的边缘 | — | — | unknown（未覆盖） |
