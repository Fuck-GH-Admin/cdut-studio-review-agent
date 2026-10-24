---
path: packages/shared/src/utils/context-window.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 77548f7358ce347038141a16a5c406a7ed60cbab
sha256: 20e2efbfe065ff315f7fe71efe8c148ea851b8f616916f5d88b75a1e85dcd2f4
lines: 298
kind: test
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/context-window.test.ts

## 1. 测试目标

1M 上下文窗口判定的全矩阵（`packages/shared/src/utils/context-window.test.ts:2-19`，17 个被测符号）：DeepSeek V4/短名识别、代际默认规则、Agent SDK 后缀转换、多模型 usage 选窗、三态偏好、后缀+beta 同步。bun:test；被测同目录 `context-window.ts`。无外部夹具（全部内联字符串模型 ID）。

## 2. 用例清单

共 **39 个 `test(`**（6 个 `describe`）：

### D1「DeepSeek V4 1M 上下文能力」（7）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 1 | 22-27 | V4 Pro/Flash 均 1M | isDeepSeekV4Model 2 + inferContextWindow 2 |
| 2 | 29-32 | 网关前缀/大小写/SDK 后缀规范化 | `normalizeContextModelId(' Gateway/DeepSeek-V4-Pro[1m] ')`→`'deepseek-v4-pro'` |
| 3 | 34-41 | 非精确 V4 按精确匹配 | 5 假（含 `:free`、前缀 `my-`）+ reasoner→200K |
| 4 | 43-50 | 官方短名同等处理 | flash/pro/[1m] 真；chat/turbo 假 |
| 5 | 52-56 | GLM-5.3/[1m] 变体保留 1M | supports1M/infer |
| 6 | 58-60 | Codex Terra → 1.05M | |
| 7 | 62-65 | GPT-6 Astra → 1.05M | |

### D2「代际默认 1M 规则」（9）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 8 | 69-79 | 九家族新版本自动继承 | deepseek-v5/kimi-k3/k4/glm-5.4/6/mimo-v3/minimax-m4/grok-4.6/5 |
| 9 | 81-94 | 短名按同代（含新变体） | flash/pro/flash-latest 真；**custom 网关保守 false**（`:92`）+ SDK 后缀对比 `:90,93` |
| 10 | 96-103 | 旧世代短名不误升 | chat/reasoner 假+200K+verified false |
| 11 | 105-114 | 低于基线旧 SKU 保 200K | 8 例（含 claude-opus-4-5） |
| 12 | 116-119 | 已确认低版本 SKU 按 1M | mimo-v2-pro/claude-opus-4-6 |
| 13 | 121-124 | GPT-5.4 mini → 400K 非 1M | |
| 14 | 126-128 | 显式开启未知模型 → 1M | `inferAgentSdkContextWindow('glm-4.6','custom',true)` |
| 15 | 130-132 | 显式关闭 1M 模型 → 默认窗 | |
| 16 | 134-142 | 已验证组合白名单 4 真 3 假 | deepseek/zhipu-coding/kimi-api/k3 真；custom/anthropic-compatible/k2.6 假 |

### D3「Agent SDK 1M 模型转换」（8）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 17 | 146-148 | 显式启用 → 追加 `[1m]` | |
| 18 | 150-152 | 禁用 → 保持原 ID | |
| 19 | 154-156 | 幂等（已带后缀不重复） | |
| 20 | 158-160 | custom 网关不擅自加后缀 | |
| 21 | 162-165 | GLM-5.3 已验证双 provider 加后缀 | zhipu/zhipu-coding |
| 22 | 167-171 | DeepSeek 世代（含新版本/网关前缀）加后缀 | 3 例 |
| 23 | 173-177 | 低基线不误加 | reasoner/k2.6/glm-5.1 |
| 24 | 179-183 | 新版本自动继承 | glm-5.4/minimax-m4/mimo-v2.5-pro |

### D4「多模型 result 上下文窗口解析」（6）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 25 | 187-192 | 子模型在前仍选主模型 1M | |
| 26 | 194-199 | usage 缺失不按名称臆测 | → 200K / undefined |
| 27 | 201-206 | 完整 ID 精确匹配优先 | gateway-b → 1M |
| 28 | 208-213 | 尾段多同名 → 最大实测窗 | 400_000 |
| 29 | 215-220 | 未知主模型 → 最大实测兜底 | 400_000 |
| 30 | 222-226 | GLM-X-Preview key 失后缀仍保 1M | |

### D5「渠道模型 1M 三态偏好」（4）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 31 | 230-236 | 未设置 → auto | toEqual `{enabled:true,source:'auto',autoEnabled:true}` |
| 32 | 238-244 | custom 强开 → forced-on | `autoEnabled:false` |
| 33 | 246-252 | 手动关 → forced-off | `autoEnabled:true` |
| 34 | 254-256 | null 等同未设置 | source 'auto' |

### D6「Agent SDK 1M 选择（ID+beta 同步）」（5）

| # | 行 | 用例 | 断言要点 |
| --- | --- | --- | --- |
| 35 | 260-265 | strip 只去 `[1m]`，网关路径保留 | `[1M]` 大写也去 |
| 36 | 267-273 | 自动 → 后缀+beta | toEqual 三元组 |
| 37 | 275-281 | forced-on → 后缀+beta | |
| 38 | 283-289 | forced-off → 不改 ID 不发 beta | |
| 39 | 291-297 | 已带后缀不重复+补 beta | |

## 3. 真实断言

全 39 用例逐条见 §2（关键锚）：`:30` normalize 完整串、`:90-93` 网关保守对比、`:198` toBeUndefined、`:231-235` 三态 toEqual、`:268-272` 三元组 toEqual、`:291-296` 幂等+beta。

## 4. 未覆盖与脆弱点

- `resolveAgentSdk1MSelection` 的「已带后缀但 forced-off」组合未锚。
- haiku 排除分支在 `supports1MContext`/`isNextGeneration1MContextModel` 无直接用例（源 `:144`）。
- `parseVersionSegments` 非法版本串边界未测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 39 test/6 describe 全矩阵 | 已证实 | 全文 |
| 网关保守（custom 不加后缀） | 已证实 | `:92-93,139,158-160` |
| 后缀+beta 同决策 | 已证实 | `:267-297` |
| 不臆测（usage 缺失） | 已证实 | `:194-199` |
| 测试通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| DeepSeek V4/短名 | §2 | 1-4,9-10 | covered |
| 代际规则/白名单 | §2 | 8,11-16 | covered |
| SDK 后缀转换 | §2 | 17-24 | covered |
| usage 选窗 | §2 | 25-30 | covered |
| 三态偏好 | §2 | 31-34 | covered |
| 同步选择 | §2 | 35-39 | covered |
| haiku/边界 | §4 | — | unknown |
