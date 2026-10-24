---
path: apps/electron/src/main/lib/agent-preset-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 215fb68dd2b2f3706243191f9fbc7500f048b60b
sha256: d5a47d7f1513984e330ed2d3d8d2ddfa6fa3cb92e9f979223015e36bf03ca5d3
lines: 1221
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-preset-manager.test.ts

## 1. 测试目标

`agent-preset-manager.ts` 单元测试（工作区级）：内置加载/未知回退/默认读写/会话规范化/工作区隔离/无工作区行为（`:1-6` 头注释，实际覆盖更广：CRUD 校验/全局预设/引用报告/改绑/导入导出/迁移）。bun:test；临时目录真文件 I/O（`__setAgentPresetsBaseDirForTest`，`:62-70`），无 mock 库。

## 2. 用例清单

共 **87 个 `test(`**（机械 grep 核；全 1221 行两段逐行读毕）。分组概览：

| 组 | 代表行 | 要点 |
| --- | --- | --- |
| Capability Registry 2 | `:81,88` | 能力组/工具名同源无重复；工具元数据 risk∈{read,write,external,destructive} |
| listAgentPresets 4 | `:100` | 极简内置关闭全部能力组+suppress 同步（`['subagents','memory','task-graph','automation']`，`:633`）；工作区合成/无工作区仅内置 |
| 默认预设 2 | `:331-` | 读写/缺失回 standard/工作区隔离 |
| 会话规范化 5 | `:1497-` | 未知→standard、空串保留、自定义保留 |
| CRUD 19 | `:596-` | 创建（skillSlugs/effort `:597`）；名称空拒（`:608-610`）；工作区隔离 A/B（`:612-616`）；无工作区拒（`:618-620`）；copy 三层一致（`:622-646`）；非法 suppress key/工具组拒且无残留（`:648-661`）；null 清除绕校验（`:663-671`）；历史脏数据读时过滤（`:673-694`）；mcpServerNames []=全禁 vs null=清除（`:696-`） |
| 全局/引用/改绑（含迁移）27 | `:798-1331` | 启用/停用/删除 blocker/`rebindAndDisableGlobalPresetScope`/`setDefaultPresetReference` |
| 导入导出 7 | `:1399-1486` | 重名改名（`renamedNames`）；`disabledTools` 非法短名拒（`:1203-1210`）；`filterDisabledTools` 双口径（`:1212-1220`） |
| getAgentPreset 2 | — | 读取/未知回退 |
| 派生预设 12 | — | basePresetId 合并基座 |
| 单工具裁剪 7 | — | disabledTools/filterDisabledTools |

> 注：此前概览小计偏差（list 6→4、默认 5→2、CRUD 20+→19、导入导出 8→7）已按 describe 实数修正；迁移类用例并入全局/引用/改绑组（27）计数。分组合计：Registry 2/list 4/全局 27/getAgentPreset 2/默认 2/规范化 5/CRUD 19/导出导入 7/派生 12/单工具 7=**87**（机械核）。 |

## 3. 真实断言

代表（逐条已读）：`:82-85` 注册表一致性三断言；`:91-93` 元数据/risk 值域；`:633-634` suppress 与 disabledToolGroups 精确 `toEqual`；`:609` `toThrow('预设名称不能为空')`；`:614-615` A 区 5 / B 区 4；`:653,658` 正则 `/非法的提示词段 key: bad-key/`、`/非法的工具组: bad-group/`；`:660` 无残留 `toBe(false)`；`:692-693` 脏数据过滤后 `toEqual(['memory'])`/`toEqual(['task-graph'])`；`:698-699` 空数组保留；`:1209` `toThrow('disabledTools 含非法单工具短名')`；`:1216-1219` filterDisabledTools 三断言（含未传返回同引用 `toBe`）。

## 4. 未覆盖与脆弱点

- 未覆盖：`restoreAgentPresetSnapshot` 独立用例、`writeJsonFileAtomic` 崩溃一致性（safe-file 域外）。
- mock 边界：真文件 I/O + 测试替身目录注入；无网络/无 Electron。
- 断言≠已运行：**NOT_RUN**（87 用例均为“断言存在/已读”）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 87 用例/断言/夹具/分组 | 已证实 | 全 1221 行两段逐行读 + 机械计数 |
| 与 preset-manager.ts 语义一致 | 已证实 | 逐条对照（CRUD/隔离/过滤/迁移） |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 87 用例 | §2/§3 | 全文件 | covered |
| 未覆盖点/替身边界 | §4 | — | covered（如实） |
