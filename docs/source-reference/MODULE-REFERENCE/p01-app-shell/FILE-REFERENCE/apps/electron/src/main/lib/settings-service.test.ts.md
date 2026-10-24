---
path: apps/electron/src/main/lib/settings-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 082e49f0d5d2db9f18e21d6eceab5d0cdcdc61a3
sha256: 06ea4c91fa172bb7631f4a32a3133956f6b4144f49543cd201f7e4ed3040b5de
lines: 145
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/settings-service.test.ts

## 1. 测试目标

`settings-service`（同批深读）的命名收敛兼容与联动语义：`Tablet*→Pocket*` 归一（不回写旧键）、`pluginSystemEnabled→developerModeEnabled` 迁移、新旧键并存新键优先、空配置兜底、`openEpistemicModeEnabled` 随开发者模式联动关闭、端口 0 语义。框架 `bun:test`；mock 边界=真实 fs + `PROFER_CONFIG_DIR` 临时目录 + `clearSettingsCache()` 逐例重置（读盘路径真实生效，注释 `:32`）。

## 2. 用例清单

用例计数：`test(` **7**（`:44,63,78,93,107,120,135`），`it(` 0——与源码计数一致。单一 describe「设置服务命名收敛兼容（Tablet* → Pocket*）」（`:43`）。

装置：`makeTempConfigDir`（mkdtemp）+ `writeSettingsFile`/`readSettingsFile` 助手（`:21-28`）；`beforeEach` 重置 env+缓存（`:30-34`）；`afterEach` 还原 env+清目录（`:36-41`）。

| # | 用例 | 设置 | 关键断言 |
| --- | --- | --- | --- |
| 1 | 旧 tabletMode* 归一且不暴露旧键（`:44-61`） | `{themeMode:'dark', tabletModeEnabled:true, tabletModePort:8899}` | pocketMode 两键映射、旧键 `in` 为 false |
| 2 | 归一后更新落盘只留新键（`:63-76`） | 旧键 + `updateSettings({pocketModeEnabled:false})` | 落盘 pocketMode*/无 tablet* |
| 3 | 新旧并存新键为准（`:78-91`） | 新旧四键并存 | 新键值胜出 |
| 4 | 空配置兜底（`:93-105`） | `{}` | pocketMode undefined、developer 关、notifications true |
| 5 | pluginSystemEnabled 迁移开发者模式（`:107-117`） | `{pluginSystemEnabled:true}` | developer true、旧键不写回 |
| 6 | 关开发者模式连带关 openEpistemic（`:120-133`） | 两 true + 关 developer | 两键均 false（内存+落盘） |
| 7 | 端口 0 写入 0+路径形状（`:135-144`） | `{pocketModePort:8899}` + 更新为 0 | 落盘 0、`getSettingsPath()` 形状 |

## 3. 真实断言

（逐条引用 expect 行）

1. `settings.pocketModeEnabled).toBe(true)`、`pocketModePort).toBe(8899)`、`themeMode).toBe('dark')`、`'tabletModeEnabled' in settings).toBe(false)`、`'tabletModePort' in settings).toBe(false)`（`:54-60`）。
2. `persisted.pocketModeEnabled).toBe(false)`、`pocketModePort).toBe(8899)`、两旧键 `in` false（`:71-75`）。
3. `pocketModeEnabled).toBe(false)`、`pocketModePort).toBe(7788)`（`:89-90`）。
4. `pocketModeEnabled).toBeUndefined()`、`pocketModePort).toBeUndefined()`、`developerModeEnabled).toBe(false)`、`openEpistemicModeEnabled).toBe(false)`、`notificationsEnabled).toBe(true)`（`:99-104`）。
5. `developerModeEnabled).toBe(true)`、`openEpistemicModeEnabled).toBe(false)`、`'pluginSystemEnabled' in settings).toBe(false)`、写回后 `developerModeEnabled` true 且无旧键（`:111-116`）。
6. 两键 get/落盘均 false（`:130-132`）。
7. `persisted.pocketModePort).toBe(0)`、`getSettingsPath()).toBe(join(configDir,'settings.json'))`（`:142-143`）。

## 4. 未覆盖与脆弱点

- 未覆盖（对照被测源码）：`updateSettings` 写失败 throw、`reviewAgentAutoApproval` 严格归一、`feishuSessionMirror`/`agentRuntime` 兜底、损坏 JSON 回默认值、缓存命中短路。
- 脆弱点：用例 7 的路径断言依赖 `config-paths` 的 `PROFER_CONFIG_DIR` 覆盖机制（跨模块约定）；旧键不回写语义由「读侧解构剔除」保证，测试锁内存+落盘双层。
- 真实 fs 无 mock：每个用例独立临时目录。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 7 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `settings-service.test.ts:54-143` |
| mock 边界=真实 fs+临时配置根+缓存重置 | 已证实 | `:29-41` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 写失败/代批归一/损坏 JSON | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| Tablet*→Pocket* 归一（读/写双层） | §2/§3 | 44-76 | covered |
| 新旧并存/空配置兜底 | §2/§3 | 78-105 | covered |
| pluginSystemEnabled 迁移 | §2/§3 | 107-117 | covered |
| openEpistemic 联动关 | §2/§3 | 120-133 | covered |
| 端口 0/路径形状 | §2/§3 | 135-144 | covered |
| 写失败/代批归一 | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
