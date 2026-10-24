---
path: apps/electron/scripts/check-skin-surface-contract.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 06471c43e17e901ef02adb3248f79e39ede9bedc
sha256: a27c8f9a8780d4989b62d1ecc0025398b4e4617adc729c6215f99b625009ec45
lines: 172
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/check-skin-surface-contract.mjs

## 1. 结论与边界

Skin Surface Contract v2 审计门禁（172 行，Node ESM，只读）：内置皮肤（`resources/skins/*`）与官方模板（`resources/skin-template`）必须声明 `manifest.contractVersion=2` 且覆写完整 v2 token 集；用户皮肤由运行时默认 token 兼容、不参与门禁（`apps/electron/scripts/check-skin-surface-contract.mjs:1-9`）。另附「普通中性色硬编码」非阻断审计（`:141-166`）。边界：不改任何文件、不校验用户皮肤、不检查主题运行时行为。

## 2. 导出与关键符号

无导出（CLI）。参数：无命令行参数（用法 `node scripts/check-skin-surface-contract.mjs`，`:8`）。

内部符号：
- 常量 `ROOT`（apps/electron/，`:14`）、`SKINS_DIR`/`TEMPLATE_DIR`（`:15-16`）、`COMPONENT_DIRS`（renderer/components + packages/ui/src，`:17-20`）、`REQUIRED_TOKENS`（34 个 v2 token 事实表，`:21-33`）、`SKIN_ID_RE`（kebab-case id 正则，`:34`）、`FORBIDDEN_CSS_RE`（`@import|@font-face|url(https?:|file:|data:|//)`，`:35`）、`hardcodedSurfaceRe`（`:153`）。
- 内部函数 `parseTokens(css)`（内部，`:37-43`）：正则提取 `--name: value;` 入 Map；token 存在性检查以**含注释原文**为输入（`parseTokens(css)` `:87`），仅禁用模式用去注释文本（`uncommentedCss` `:85`）——注释掉的 token 定义即可满足「存在」检查（怪癖）。
- 内部函数 `uncommentedCss(css)`（内部，`:45-47`）：剥 `/* */` 注释，供禁用模式检测。
- 内部函数 `collectTsxFiles(dir)`（内部，`:143-151`）：递归收集 `.tsx`（跳过测试文件不在过滤内，仅按扩展名）。

## 3. 内部逻辑与关键流程

1. 目录存在性（`:49-52`）：`SKINS_DIR` 缺失 → `console.error('✗ 找不到内置皮肤目录：…')` → `process.exit(2)`。
2. 内置皮肤逐目录审计（`:55-108`）：目录名排序遍历；每目录收集 `errors[]`：
   - id 正则（`:67`）；manifest.json 存在/JSON.parse（BOM 剥离 `:72`）/`manifest.id===目录名`（`:73`）/`contractVersion===2`（`:74`）/`tone∈{light,dark}`（`:75`）；解析失败文案 `manifest.json 无法解析：…`（`:77`）。
   - skin.css 存在（`:81`）；去注释后 `FORBIDDEN_CSS_RE` 命中 → `skin.css 包含禁止的 @import/@font-face/外链/file/data URL`（`:86`）；`REQUIRED_TOKENS` 缺失或空值 → `缺少 N 个 v2 token：…`（`:88-89`）；浅色皮肤 `--code-fg` 绑 `var(--foreground)` → 报错（`:92-94`，防止深色代码块+深色文字不可读）；token 值为空或含 `{}` → `--<t> 值无效`（`:95-97`）。
   - 有 errors → `failures += 1` 并打印 `✗ <id>` + 明细；否则 `✓ <id>: Surface Contract v2（N bytes）`（`:100-107`）。
3. 官方模板审计（`:111-139`）：与皮肤同规则（manifest 两项 + css 禁用模式 + token 完整性；不做 code-fg 检查），失败计入 `failures` 并打印 `✗ skin-template`。
4. 非阻断中性色审计（`:141-166`）：`collectTsxFiles` 扫两个 COMPONENT_DIRS，统计 `bg|border|text|from|to|via-(slate|zinc|neutral|gray|white|black)` 命中（`:153-158`），有命中打印 `ℹ 普通中性色审计（非阻断…）` 前 20 条 + 省略计数，无命中打印 `✓ 普通中性色审计未发现匹配项`；不计入 `failures`。
5. 汇总（`:168-172`）：`failures>0` → `console.error('N/M 个内置皮肤或官方模板不满足 Surface Contract v2。')` → `process.exit(1)`；否则打印 `全部 N 个内置皮肤与官方模板满足 Surface Contract v2 ✓`（exit 0）。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:49`（`"check:skin-contract": "node scripts/check-skin-surface-contract.mjs"`）；`.github/workflows/ci.yml:52`、`.github/workflows/release.yml:70`（`bun run check:skin-contract`）。
- 出向：`node:fs`（existsSync/readdirSync/readFileSync/statSync，全只读）、`node:url`/`node:path`；数据源 `apps/electron/resources/skins/*`（冻结树实测 8 个主题目录）、`apps/electron/resources/skin-template/`（manifest.json/skin.css/preview.svg）、`src/renderer/components`、`packages/ui/src`。

## 5. 数据 I/O、读写与副作用

- 输入输出形状：输入=皮肤目录树（manifest.json：id/contractVersion/tone；skin.css：`--token: value;` 声明）；输出=stdout/stderr 文本 + 退出码（0/1/2）。
- 磁盘：纯读；无写、无网络、无缓存、无全局状态。
- 幂等/锁：天然幂等（只读审计）；无锁。
- 副作用：console 输出（✓/✗/ℹ 行）。

## 6. 分支、失败、取消与恢复

- 退出码 2：`SKINS_DIR` 不存在（`:49-52`）。
- 退出码 1：任一皮肤/模板 errors（`:168-171`）；单目录错误不短路，全量收集后统一失败（failures 计数）。
- 退出码 0：全部通过（`:172`）。
- 用户可见文案：`✗ 找不到内置皮肤目录`、`缺少 manifest.json`、`manifest.contractVersion 必须为数字 2`、`manifest.tone 必须为 light 或 dark`、`缺少 N 个 v2 token：…`、`--code-fg 不能在浅色皮肤中复用 var(--foreground)`、`--<t> 值无效`、汇总句见 §3.5。
- 失败后状态：无磁盘变化；恢复=修正皮肤文件后重跑。取消：无异步，无取消态。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：v2 token 全集权威 = `REQUIRED_TOKENS`（`:21-33`，与运行时皮肤系统契约绑定）；「内置皮肤必须 v2、模板与内置同权」是公开合约（`:110` 注释）。

## 8. 修改影响面

- 皮肤门禁：`apps/electron/package.json:49`、CI `ci.yml:52` 与 `release.yml:70`（阻断 CI/发布）。
- 被审计面：`apps/electron/resources/skins/`、`apps/electron/resources/skin-template/`、token 契约（`src/renderer` 主题系统，域外）。
- `REQUIRED_TOKENS` 增删会同时改变皮肤/模板的合规要求与 `check-skin-token-sync.mjs` 的交集语义（相邻脚本，同域）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接单元测试（全树 grep `check-skin-surface` 于 *.test.ts 零命中）；CI 中的 `bun run check:skin-contract` 是脚本执行门禁而非测试断言。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 三段审计结构、错误文案、退出码 0/1/2 | 已证实 | `apps/electron/scripts/check-skin-surface-contract.mjs:1-172` 全文 |
| 冻结树 8 个内置皮肤目录 + skin-template 存在 | 已证实 | 目录列表核对（resources/skins 8 项） |
| 当前资产是否全部通过门禁 | 未知 | 需运行脚本，NOT_RUN |
| 中性色审计命中文件数 | 未知 | 依赖运行时扫描结果（`:161` 只在运行时打印） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parseTokens / uncommentedCss / collectTsxFiles | §2/§3 | 37-47, 143-151 | covered |
| SKINS_DIR 缺失 exit 2 | §3/§6 | 49-52 | covered |
| 皮肤逐目录审计（manifest+css 全规则） | §3/§6 | 60-108 | covered |
| skin-template 审计 | §3 | 111-139 | covered |
| 非阻断中性色审计 | §3/§5 | 141-166 | covered |
| 汇总 exit 1/0 | §3/§6 | 168-172 | covered |
| REQUIRED_TOKENS/SKIN_ID_RE/FORBIDDEN_CSS_RE | §2/§7 | 21-35 | covered |
