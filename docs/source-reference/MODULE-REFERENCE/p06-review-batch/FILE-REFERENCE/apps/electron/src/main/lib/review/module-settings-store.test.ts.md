---
path: apps/electron/src/main/lib/review/module-settings-store.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3e23492076dcb57e04aa1f58ddae7ea4bbe9e1b8
sha256: 531ed84eaaf278bf1f1c4f098af8b347cdc252ac06ab1ff8b51e50d1dc899dc1
lines: 24
kind: test
package: p06-review-batch
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/module-settings-store.test.ts

## 1. 测试目标

直接测试 `module-settings-store.ts` 的**持久化往返**：默认值为 `{agentModelSelection:null}`、保存后能读回同一选择、清除后回到 null、配置文件确实落盘。2 个 `test(`，均在 `describe('审核专区独立设置')`（`:10`）内。

不测试：`getEffectiveReviewModelSelection()` 的显式/全局回退（本文件 0 断言）、非法 JSON、空串清洗、并发/原子性、写失败。

## 2. 用例清单

夹具（模块级，`:6-8`）：

- `CONFIG_DIR = join(import.meta.dir, '../../../../../../work/tmp', 'review-module-settings-' + Date.now())`（`:6`）。`import.meta.dir` 为 `apps/electron/src/main/lib/review`，上溯 6 层到仓库根，再拼 `work/tmp`。
- `process.env.PROFER_CONFIG_DIR = CONFIG_DIR`（`:7`），在 import 被测模块（`:4`）之后、任何测试之前执行；`getConfigDir()` 运行时才读 env（`config-paths.ts:57-59`），因此隔离有效。
- `afterAll(() => rmSync(CONFIG_DIR, {recursive:true, force:true}))`（`:8`）。
- 无 `beforeEach` 清理：两个用例共享同一配置文件，**依赖执行顺序**。

| # | 行 | 设置 | 动作 | 真实断言 |
| --- | --- | --- | --- | --- |
| 1 | `:11-17` | 空配置目录（首次运行） | 先读，再保存 `{channelId:'channel-a',modelId:'model-a'}`，再读，再查文件 | `:12` `expect(getReviewModuleSettings()).toEqual({agentModelSelection:null})`；`:14` `expect(saved).toEqual({agentModelSelection:{channelId:'channel-a',modelId:'model-a'}})`；`:15` `expect(getReviewModuleSettings()).toEqual(saved)`；`:16` `expect(existsSync(join(CONFIG_DIR,'review-module-settings.json'))).toBeTrue()` |
| 2 | `:19-23` | 已保存过选择（用例 1 留下） | 再保存选择，再保存 `{agentModelSelection:null}`，读回 | `:22` `expect(getReviewModuleSettings()).toEqual({agentModelSelection:null})` |

## 3. 真实断言

- 用例 1 的四条断言分别覆盖：默认值、保存返回值、磁盘往返、文件路径存在。**没有**读取文件内容断言"只存 channel/model"，因此文件里是否夹带额外字段并未被证明；"只存 ID"目前只有实现 `module-settings-store.ts:30`、`:55` 的静态依据。
- 用例 2 只断言清除后读回 null；没有断言文件中 `agentModelSelection` 字段为 `null`（`toEqual` 的是函数返回值）。
- 断言均用 `toEqual`（深比较），不是 `toBe`；`saved` 是 `saveReviewModuleSettings` 的入参对象，`:15` 的相等不能证明"从磁盘重建"，因为 `getReviewModuleSettings` 确实重新读文件并重建对象（`module-settings-store.ts:24-30`），但断言本身不区分"读缓存"与"读磁盘"。

## 4. 未覆盖与脆弱点

未覆盖：

- `getEffectiveReviewModelSelection()` 的全部行为（显式优先、全局回退、`modelId:''`）——由 `review-pi-run-bridge.main.test.ts:182-207` 间接覆盖。
- 损坏 JSON/读取异常 → 默认值的 `catch` 分支（`module-settings-store.ts:31-34`）。
- 空串 `channelId/modelId` 被清洗为 null（`:27-29`）。
- 文件含额外键时被丢弃（`:30`）。
- `saveReviewModuleSettings` 的 tmp+rename 原子性、写失败、并发。
- 目录不存在时 `getConfigDir()` 的创建行为（仅间接依赖）。

脆弱点：

- `Date.now()` 命名（`:6`）在同一毫秒并发启动两个同名测试进程时会撞目录；`force:true` 清理会删掉对方文件。
- 路径上溯 6 层写死仓库布局（`:6`），目录移动即失效。
- 用例 2 依赖用例 1 的文件状态；若测试框架改为并发执行同文件用例，顺序假设不成立。
- 共享 `PROFER_CONFIG_DIR` 进程环境变量：Bun 1.4 的 `bun test` **默认不保证跨文件隔离**，需要时用 `--isolate`（每个测试文件一个 fresh global object）或 `--parallel`/`--no-isolate` 显式控制；同文件内 env 与模块状态必然共享。因此本文件对 `PROFER_CONFIG_DIR` 的赋值可能影响同进程其它测试文件，反之亦然。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 个用例，均直接调用真实存储（无 mock） | 已证实 | `module-settings-store.test.ts:4`、`:11`、`:19` |
| 配置根通过 `PROFER_CONFIG_DIR` 隔离并在 afterAll 删除 | 已证实 | `:6-8`；`config-paths.ts:57-59` |
| 默认值/保存往返/清除后回退 null 被断言 | 已证实 | `:12`、`:14-16`、`:22` |
| 回退全局 Agent 的行为未被本文件断言 | 已证实 | 本文件仅 import `getReviewModuleSettings`/`saveReviewModuleSettings`（`:4`） |
| 用例间存在顺序依赖 | 已证实 | 共享 `CONFIG_DIR`，无 `beforeEach` |
| 实际运行结果 | 未知 | 本轮 `NOT_RUN` |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `getReviewModuleSettings` 默认分支 | §2、§3 | `module-settings-store.ts:22` | covered |
| `saveReviewModuleSettings` 正常路径 | §2、§3 | `module-settings-store.ts:52-57` | covered |
| 磁盘文件存在 | §3 | `:16` | covered |
| `getEffectiveReviewModelSelection` | §4 | `module-settings-store.ts:41-50` | unknown（本文件未覆盖） |
| 异常/清洗/原子性 | §4 | `module-settings-store.ts:27-34`、`:54-56` | unknown |
