---
path: apps/electron/src/renderer/lib/composer-compact-height.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2fc38ddcc84704f7e6d49b5fc62959d3d25efdf
sha256: 92e2dd37ed1c47073814c90df9659c1a6df456462438b21e5684f692d4e64e5d
lines: 140
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/composer-compact-height.test.ts

## 1. 测试目标

验证 `apps/electron/src/renderer/lib/composer-compact-height.ts` 的纯逻辑契约：三个设置值归一化（非法回退、0 语义、取整、区间夹取）、迟滞紧凑档判定（进入/退出双阈值、阈值附近抖动只切换一次）、输入框档位高度解析（手动折叠优先、紧凑档压缩与展开 2 倍封顶）。全部用例同步纯函数断言，无 DOM/定时器依赖。

## 2. 用例清单

机械计数：`test(` = 16、`it(` = 0、`describe(` = 5（grep `^\s*(it|test|describe)\(` 于 `apps/electron/src/renderer/lib/composer-compact-height.test.ts`），与下表一致（行号 = `apps/electron/src/renderer/lib/composer-compact-height.test.ts:<行>`）：

- describe「紧凑档阈值归一化」（`:19`）：`:20` 缺省/非法值回退默认 700；`:28` 0 是合法值表示关闭该行为；`:32` 合法值取整并收敛到可配置范围。
- describe「紧凑档上限归一化」（`:41`）：`:42` 缺省/非法值回退默认 140；`:48` 收敛到 80–200。
- describe「紧凑档最小高度（空内容时的可见高度）」（`:55`）：`:56` 缺省/非法值回退默认 60；`:62` 收敛到 40–101；`:68` 常规档 101px、紧凑档降到配置值。
- describe「迟滞判定（消除拖拽窗口时的反复切换）」（`:76`）：`:77` 未处于紧凑档仅低于阈值才进入；`:83` 已处于紧凑档需高出阈值+余量才退出；`:91` 阈值附近来回抖动只切换一次；`:104` 阈值 <= 0 或高度非法时不进入紧凑档。
- describe「输入框档位高度解析」（`:111`）：`:112` 非紧凑档保持既有三档行为；`:119` 手动折叠优先于窗口高度；`:124` 紧凑档默认档压到配置上限、展开档为 2 倍；`:131` 紧凑档上限非法按默认 140 且不超常规档。

## 3. 真实断言

- `apps/electron/src/renderer/lib/composer-compact-height.test.ts:21-25`：`normalizeCompactViewportHeight(undefined|null|'abc'|NaN|-1)` 5 条 `toBe(DEFAULT_COMPACT_VIEWPORT_HEIGHT)`；`:29` `toBe(0)`；`:33-37` `820→820`、`820.6→821`、`'900'→900`、`10→400`、`99999→1600`。
- `:43-45`：`normalizeCompactMaxHeight(undefined|0|'x')` 3 条 `toBe(DEFAULT_COMPACT_MAX_HEIGHT)`；`:49-51` `120→120`、`10→COMPACT_MAX_HEIGHT_RANGE.min`、`4000→COMPACT_MAX_HEIGHT_RANGE.max`。
- `:57-59`：`normalizeCompactMinHeight(undefined|0|'x')` 3 条回退默认 60；`:63-65` `80→80`、`10→min`、`999→COMPOSER_EDITOR_MIN_HEIGHT`。
- `:69-72`：`resolveComposerMinHeight({compact:false,...})` `toBe(COMPOSER_EDITOR_MIN_HEIGHT)`、`{compact:true,...}` `toBe(60)`、`expect(COMPOSER_EDITOR_MIN_HEIGHT - 60).toBeGreaterThanOrEqual(39)`、NaN 配置 `toBe(DEFAULT_COMPACT_MIN_HEIGHT)`。
- `:78-80`：`resolveCompactViewport(false, 699|700|900, 700)` → `true/false/false`；`:85-88`：`previous=true` 时 `720→true`、`exitLine-1→true`、`exitLine→false`、`1000→false`（`exitLine = 700 + COMPACT_EXIT_HYSTERESIS_PX`，`:84`）。
- `:100-101`：抖动序列 `[720,695,710,720,690,705,715,698]` 后 `expect(switches).toEqual([1])` + `expect(compact).toBe(true)`；`:105-107` 阈值 0 恒 false、NaN 高度保持 previous=true。
- `:113-116`：非紧凑档 `toBe(COMPOSER_TIER_HEIGHTS.default)`/`toBe(COMPOSER_TIER_HEIGHTS.expanded)`；`:120-121` 手动折叠 `toBe(COMPOSER_TIER_HEIGHTS.collapsed)`；`:125-128` 紧凑 `toBe(140)`/`toBe(280)`；`:132-138` NaN 上限 `toBe(DEFAULT_COMPACT_MAX_HEIGHT)`、`999` 上限默认档 `toBe(COMPOSER_TIER_HEIGHTS.default)`、展开档 `toBe(400)`。

## 4. 未覆盖与脆弱点

- 未覆盖（检索范围：本文件全文）：`resolveCompactViewport` 的 `previous=false` + `viewportHeight=NaN` 分支（`:107` 只测 previous=true 路径，源码 `:98` 两向返回 previous）；`normalizeCompactMinHeight`/`normalizeCompactMaxHeight` 的字符串数字合法输入（仅测 `'x'` 非法与数值输入，`'900'` 只在阈值函数测过）；`resolveComposerMaxHeight` 的 `manuallyCollapsed` + 非紧凑组合（`:120` 仅测三真组合）；紧凑档展开档 `min(500, 2×)` 的 500 封顶分支（`:128` 得 280 未顶到 500）。
- 脆弱点：`:71` `expect(COMPOSER_EDITOR_MIN_HEIGHT - 60).toBeGreaterThanOrEqual(39)` 把"变矮约 40px"的产品规格变成断言，改默认 60 会打破；`:91-102` 的 `switches` 等于 `[1]` 锁死特定抖动数组与迟滞常量（60px 余量），任一常量调整都会打破；`:138` `toBe(400)` 隐含 `2×200` 与 500 封顶的算术耦合。全同步断言，无时序脆弱性；无全局状态（每次调用纯函数）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例、断言行如 §3 所列 | 已证实 | 机械计数 + `apps/electron/src/renderer/lib/composer-compact-height.test.ts:19-139` |
| 迟滞单次切换回归锁 | 已证实 | `composer-compact-height.test.ts:91-102`（断言文本） |
| 归一化三函数全部分支 | 已证实 | `composer-compact-height.test.ts:19-73` 覆盖回退/0/夹取/取整 |
| 测试实际运行结果 | 未知 | NOT_RUN（本轮未运行测试，纯静态阅读） |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `normalizeCompactViewportHeight` | §2,§3 | `composer-compact-height.test.ts:19-39` | covered |
| `normalizeCompactMaxHeight` | §2,§3 | `composer-compact-height.test.ts:41-53` | covered |
| `normalizeCompactMinHeight` | §2,§3 | `composer-compact-height.test.ts:55-66` | covered |
| `resolveCompactViewport` 迟滞/关闭/NaN | §2,§3 | `composer-compact-height.test.ts:76-108` | covered |
| `resolveComposerMinHeight` | §2,§3 | `composer-compact-height.test.ts:68-73` | covered |
| `resolveComposerMaxHeight` | §2,§3 | `composer-compact-height.test.ts:111-139` | covered |
| `resolveCompactViewport` previous=false+NaN | §4 | — | unknown |
| 500 封顶展开档分支 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
