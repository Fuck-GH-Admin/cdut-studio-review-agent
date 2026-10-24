---
path: apps/electron/scripts/check-skin-token-sync.mjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5614914afbae4bab488f9aa47f3d81c10488207f
sha256: 3f24e3fb1bfcbdbc99c49e602ee5ce334210ce7e5319f299cba24b03ff687603
lines: 75
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/check-skin-token-sync.mjs

## 1. 结论与边界

皮肤 token 双写一致性校验（75 行，只读）：`globals.css` 的 `.theme-*` 块与 `resources/skins/<t>/skin.css` 定义同一批主题 token——脚本头注释声称双写是设计必要（移动端/无皮肤注册场景需要 globals.css fallback，`apps/electron/scripts/check-skin-token-sync.mjs:2-7` 注释）；但 `renderer/atoms/theme.ts:302-303` 注释标注 theme-* legacy 双写规则仅服务已退役的无 IPC 平板入口（2026-09-11 移除）——两处口径相悖，照实并列（现状以 theme.ts 注释为准，双写必要性属脚本注释自述）。本脚本校验交集 token 值完全一致防漂移。边界：只比对 8 个固定 THEMES、只看 token 名/值字符串、不看语义；纯 fallback 主题（无 skin 目录）跳过对比。

## 2. 导出与关键符号

无导出（CLI）。参数：无（用法 `node scripts/check-skin-token-sync.mjs`，`:9`）。退出码契约见文件头（`:10`）。

内部符号：常量 `ROOT`（apps/electron/，`:15`）、`GLOBALS`（`src/renderer/styles/globals.css`，`:16`）、`SKINS`（`resources/skins`，`:17`）、`THEMES`（8 主题：ocean/forest/slate × light/dark + terminal-dark + mist-paper-dark，`:19`）。
- 内部函数 `parseTokens(css)`（内部，`:21-25`）：正则 `--name:value;` 提取到对象（值 trim）。
- 内部函数 `themeBlock(css, name)`（内部，`:28-42`）：定位 `.theme-<name> {` 后按花括号深度扫描取整块，容忍嵌套；找不到返回 null。

## 3. 内部逻辑与关键流程

1. 主循环（`:45-69`）：对每个 THEMES：
   - `themeBlock(readFileSync(GLOBALS,'utf8'), t)` 为 null → `console.error('✗ <t>: globals.css 缺少 .theme-<t> 块')`、`failures++`、continue（`:47-51`）。
   - skin 文件 `${SKINS}/${t}/skin.css` 不存在 → `console.warn('⚠ <t>: 无 skin 目录（纯 fallback 主题，跳过 skin 对比）')`、continue 不计失败（`:52-56`）。
   - 双侧 `parseTokens`（`:57-58`）；`drift` = globals 有且 skin 也有但值不同的项，`onlyGlobals` = globals 有而 skin 缺的键（`:59-60`）。
   - 任一非空 → `console.error('✗ <t>: 双写漂移')` + 各打印前 8 条（`--<k>: globals=<gv> | skin=<sv>` / `--<k>: 仅 globals 定义，skin 缺失`）、`failures++`（`:61-65`）；否则 `✓ <t>: 交集 token 一致（globals N / skin M）`（`:67`）。
2. 汇总（`:71-75`）：`failures>0` → `console.error('N 个主题双写漂移。修改 token 时必须同步 globals.css 与 resources/skins/*/skin.css。')` → `process.exit(1)`；否则 `全部主题双写一致 ✓`（exit 0）。
3. 静态事实：`:63` 对 `drift.slice(0,8)` 解构 `[k, gv, sv]`，但 drift 元素是二元 `[key, globalsValue]`，`sv` 恒为 `undefined`，漂移打印的 skin 侧值恒显示 `undefined`（仅影响错误信息可读性，不影响判定）。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:48`（`"check:skin-token-sync": "node scripts/check-skin-token-sync.mjs"`）。全树 grep（工具：ripgrep，pattern `check-skin-token-sync`）另有 `apps/electron/src/renderer/styles/globals.css:272` 注释引用（说明 theme-* 块保留原因），非调用。无 CI workflow 引用（`.github/workflows` 内 grep 零命中）。
- 出向：`node:fs.readFileSync`/`existsSync`、`node:url.fileURLToPath`；数据源 `globals.css` 与 `resources/skins/<t>/skin.css`。

## 5. 数据 I/O、读写与副作用

- 输入：globals.css 的 `.theme-*` 块、8 个 skin.css 的 `--token: value;` 声明；输出：stdout/stderr + 退出码（0/1）。
- 磁盘：纯读；无写、无网络、无缓存、无全局状态。
- 幂等/锁：天然幂等（只读）；无锁。副作用：console 输出。

## 6. 分支、失败、取消与恢复

- 失败分支：globals 块缺失（exit 1 路径，`:47-51`）、drift/onlyGlobals 非空（`:61-65`）→ 最终 `process.exit(1)`（`:73`）。
- 跳过分支：无 skin 目录仅 warn（`:53-55`）。
- 文档/代码不一致（已证实）：文件头声称「2=结构错误（块缺失）」（`:10`），但代码对块缺失走 `failures++` → exit 1，从未 `process.exit(2)`；GLOBALS 文件缺失时 readFileSync 未捕获抛出，Node 默认以 1 退出。实际退出码集合={0,1}。
- 失败后状态：无磁盘变化；恢复=同步修改两侧 token 后重跑。无取消概念（同步脚本）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：token 双写一致性权威 = 本脚本交集比对结果；漂移打印前 8 条上限（`:63-64`）即取证上限。

## 8. 修改影响面

- `apps/electron/package.json:48`（check:skin-token-sync）。
- 双写资产：`apps/electron/src/renderer/styles/globals.css`（theme-* 块，`:272` 注释绑定本脚本）与 `apps/electron/resources/skins/*/skin.css`；改任一侧 token 需同步另一侧，否则本门禁失败。
- 与 `check-skin-surface-contract.mjs`（token 全集门禁）共同约束皮肤契约。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接测试（全树 grep `check-skin-token-sync` 于 *.test.ts 零命中）；package.json script 执行是门禁而非测试断言。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 主循环判定、跳过分支、exit 0/1 | 已证实 | `apps/electron/scripts/check-skin-token-sync.mjs:1-75` 全文 |
| 头注释 exit 2 与代码不符（实际仅 0/1） | 已证实 | `:10` 声明 vs `:47-51,71-75` 无 exit(2)（静态核对） |
| drift 打印 skin 值恒 undefined（解构越界） | 已证实 | `:59` 二元组 vs `:63` 三元解构（静态核对） |
| 当前 8 主题是否全部一致 | 未知 | 需运行，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| parseTokens / themeBlock | §2/§3 | 21-42 | covered |
| 块缺失失败分支 | §3/§6 | 47-51 | covered |
| 无 skin 目录跳过分支 | §3/§6 | 52-56 | covered |
| drift/onlyGlobals 判定与打印 | §3/§6 | 57-67 | covered |
| 汇总 exit 1/0 + 头注释 exit 2 不一致 | §6 | 10, 71-75 | covered |
