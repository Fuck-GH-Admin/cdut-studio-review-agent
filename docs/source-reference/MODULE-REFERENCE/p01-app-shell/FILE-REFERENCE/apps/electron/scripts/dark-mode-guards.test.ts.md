---
path: apps/electron/scripts/dark-mode-guards.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a18bd8d17cf53cd882060a340ddc825a8feb4afc
sha256: cc2898de2247c1dbaf7a5b302f274709c5c7c4dc3b41fdd297b7971e17ad6668
lines: 144
kind: test
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/dark-mode-guards.test.ts

## 1. 测试目标

深色模式静态守卫（144 行，bun:test + 纯文件扫描，不引额外依赖）：把「硬编码白底/黑字、低不透明度文字、暗色 Logo 死代码」挡在提交前；豁免必须在注释写明原因（`apps/electron/scripts/dark-mode-guards.test.ts:1-6`）。扫描面：`src/renderer` + `packages/ui/src` 的 `.ts/.tsx`（跳过 `node_modules`/`public`/`*.test.*`，`:35-47`）与 `src/renderer/lib/model-logo.ts`、`src/renderer/assets/models/`（`:14-15`）。

## 2. 用例清单

机械计数：本文件 `test(` 4 处、`it(` 0 处（grep `^\s*(it|test)\(` 逐行计数），`describe(` 3 处（`:71`、`:96`、`:118`）。

1. `apps/electron/scripts/dark-mode-guards.test.ts:72`（describe `:71` 硬编码白底与黑字）— bg-white / text-black 必须提供 dark: 变体或白名单豁免。
2. `apps/electron/scripts/dark-mode-guards.test.ts:97`（describe `:96` 低对比文字）— 禁止 text-foreground/20 与 /30 级别的弱化文字。
3. `apps/electron/scripts/dark-mode-guards.test.ts:119`（describe `:118` 暗色模型图标）— 每个导入的 `*_dark.png` 都必须注册进暗色映射表。
4. `apps/electron/scripts/dark-mode-guards.test.ts:132`（同 describe）— 每个 `*_dark.png` 资源都存在同名亮色资源。

## 3. 真实断言

- 用例 1（`:74-92`）：收集 `violations`（正则 `\bbg-white\b(?![/\w-])` 或 `\btext-black\b` 命中，`:80`；白名单 3 文件跳过，`:76-77`；命中行/上一行带 `dark-guard-ignore:` 豁免，`:82`；附近 6 行窗口含 `dark:` 变体则放过，`:83, 66-69`）；`expect(violations).toEqual([])`（`:92`）。
- 用例 2（`:99-114`）：正则 `\btext-(?:foreground|muted-foreground)\/(?:20|30)\b`（`:99`），同豁免逻辑后 `expect(violations).toEqual([])`（`:114`），detail 文案「不透明度低于 45%，深色下不满足 WCAG AA」。
- 用例 3（`:121-129`）：对 model-logo.ts 中 `import X from '..._dark.png'` 每个符号统计全文出现次数（`:125`），<2 视为死代码记入 violations（`:127`）；`expect(violations).toEqual([])`（`:129`）。
- 用例 4（`:133-142`）：`orphans` = assets/models 中 `*_dark.png` 且不在豁免表（`gpt_dark.png` 例外，`:135-137`）且无同名亮色 `.png`；`expect(orphans).toEqual([])`（`:142`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`bg-white` 出现在内联 style/其它类名体系（如 CSS 模块、`style={{background:'white'}}`）；`text-black` 变体（text-neutral-900 等近似弱化）；`dark:` 变体在 6 行窗口外的多行 className（`:67` 窗口 ±2/+4 行是启发式）；非 PNG 暗色资源（svg/webp）。
- 脆弱点：`hasIgnore` 用字符串 `includes(IGNORE_MARKER)`（`:57`），注释里提到该 marker 的说明文字也会被当豁免；豁免 reason 校验 `\S+` 仅要求非空白（`:19`）；用例 4 依赖目录文件名枚举（`readdirSync`，`:133`）。
- 白名单/例外表硬编码（`:22-26, 135-137`），新例外需改测试本体。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 用例的规则、豁免机制与断言内容 | 已证实 | `apps/electron/scripts/dark-mode-guards.test.ts:1-144` 全文 |
| 用例数=4（`test(` 机械计数 4 / `it(` 0），describe=3 | 已证实 | grep `^\s*(it|test)\(` |
| 当前代码库 0 违规 | 未知 | NOT_RUN（本轮未运行任何脚本/测试，纯静态阅读） |
| 6 行 dark: 窗口的漏报率 | 推断 | 启发式窗口（`:67`），无统计取证 |

## 6. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 规则一 bg-white/text-black + 白名单 + 豁免 + dark: 窗口 | §2/§3 | 71-94 | covered |
| 规则二 低对比文字 | §2/§3 | 96-116 | covered |
| 规则三 _dark.png 注册（死代码） | §2/§3 | 119-130 | covered |
| 规则四 _dark.png 亮色配对 + gpt 例外 | §2/§3 | 132-143 | covered |
| walk/toRepoPath/hasIgnore/hasDarkVariantNearby（内部工具） | §4 | 35-69 | covered |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
