---
path: packages/shared/src/types/index.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 609d7382a0d9a9e04e1ca013e64a1ecb2b198334
sha256: df1f2333195aed12b7e2e43189b505eb09517eebb788844eee352a6cfbb721ff
lines: 117
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# packages/shared/src/types/index.ts

## 1. 结论与边界

`@profer/shared` 的**类型总 barrel**：声明 1 个 `Workspace` 占位接口，并把 46 个 `./types/*` 子模块整体再导出（`export *`）。纯类型入口，无运行时逻辑、无副作用；它是全仓 1143 处 `from '@profer/shared'` 导入的类型面来源（经 `packages/shared/src/index.ts:5` 转发）。

不做的事：不定义具体业务类型（都在子模块）；不做配置/常量/工具（由 `config/index`、`utils/index` 与 `constants/*` 在 `shared/src/index.ts` 并列导出）；不校验任何东西。

## 2. 导出与关键符号

导出 47 条 = 1 个 `interface` + 46 条 `export * from`。无 class/const/function/type 别名。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Workspace` | interface（export） | `:6-10` | `{ id: string; name: string; path: string }` | 注释 `:5` 自述 "Placeholder types - will be expanded as needed" |
| `./runtime` | re-export | `:13` | `export *` | 运行时相关 |
| `./channel` | re-export | `:16` | `export *` | 渠道（含 `PROVIDER_DEFAULT_URLS`、`Channel`） |
| `./proxy` | re-export | `:19` | `export *` | 代理配置 |
| `./chat` | re-export | `:22` | `export *` | Chat 消息/附件 |
| `./agent` | re-export | `:25` | `export *` | Agent（163 条导出，本 barrel 最大子模块） |
| `./remote-sync` | re-export | `:26` | `export *` | 远程同步 |
| `./agent-preview` | re-export | `:27` | `export *` | 预览 |
| `./global-skill` | re-export | `:28` | `export *` | 全局技能 |
| `./browser` | re-export | `:29` | `export *` | 浏览器能力 |
| `./pi-harness` | re-export | `:30` | `export *` | Pi Harness |
| `./ppt-deck` | re-export | `:31` | `export *` | PPT |
| `./lark` | re-export | `:34` | `export *` | 飞书/Lark |
| `./reasoning-profile` | re-export | `:37` | `export *` | 推理档位 |
| `./deepseek-model-alias` | re-export | `:40` | `export *` | 模型短名 ↔ 正式 ID |
| `./agent-provider` | re-export | `:43` | `export *` | Agent Provider 接口 |
| `./environment` | re-export | `:46` | `export *` | 环境检测 |
| `./installer` | re-export | `:49` | `export *` | 第三方安装包 |
| `./github` | re-export | `:52` | `export *` | GitHub Release |
| `./changelog` | re-export | `:55` | `export *` | 更新日志 |
| `./bulletin` | re-export | `:58` | `export *` | 本地公告栏 |
| `./agent-preset` | re-export | `:60` | `export *` | 预设（含 `review-operator`） |
| `./agent-preset-policy` | re-export | `:61` | `export *` | 预设策略（含权限模式解析） |
| `./chat-tool` | re-export | `:64` | `export *` | function calling |
| `./feishu` | re-export | `:67` | `export *` | 飞书 |
| `./dingtalk` | re-export | `:70` | `export *` | 钉钉 |
| `./wechat` | re-export | `:73` | `export *` | 微信 |
| `./automation` | re-export | `:76` | `export *` | 定时任务 |
| `./recommendation` | re-export | `:77` | `export *` | 推荐 |
| `./longterm-memory` | re-export | `:80` | `export *` | 长期记忆图谱（本批另有专篇） |
| `./knowledge-base` | re-export | `:83` | `export *` | 论文知识库 |
| `./planning` | re-export | `:86` | `export *` | 任务与日程 |
| `./review` | re-export | `:89` | `export *` | 内容审核（54 条导出，含 `REVIEW_MODEL_PROVIDERS`） |
| `./review-v2` | re-export | `:90` | `export *` | 审核 V2 |
| `./review-v2-contracts` | re-export | `:91` | `export *` | 审核 V2 契约 |
| `./review-authoring-v1` | re-export | `:92` | `export *` | 审核编写态 |
| `./review-d2` | re-export | `:93` | `export *` | D2 |
| `./review-d3` | re-export | `:94` | `export *` | D3 |
| `./cdut` | re-export | `:97` | `export *` | CDUT 专区账户 |
| `./study` | re-export | `:100` | `export *` | AI 速课堂 |
| `./pdf` | re-export | `:103` | `export *` | PDF AST 契约 |
| `./review-v3-c0` | re-export | `:106` | `export *` | Review V3 C0 冻结契约 |
| `./review-v3-execution` | re-export | `:109` | `export *` | Review V3 事件传输 |
| `./review-v3-run` | re-export | `:112` | `export *` | Review V3 运行证据 |
| `./cslab` | re-export | `:115` | `export *` | CSLab（含 `CsLabLab`） |
| `./cslab-origin-types` | re-export | `:116` | `export *` | CSLab 原始类型 |
| `./cslab-vesta-types` | re-export | `:117` | `export *` | CSLab Vesta 类型 |

## 3. 内部逻辑与关键流程

纯 re-export 文件，无执行流程。结构上只有两段：`:6-10` 的 `Workspace` 占位接口；`:13-117` 的 46 条 `export *`（按功能分组，注释为中文标签）。

可验证事实：

- 46 个被 re-export 的 `./types/<name>.ts` 全部存在于冻结树（逐名 `test -f` 检查，0 缺失）。
- `packages/shared/src/index.ts:5` `export * from './types/index'`，`:6` 又 `export * from './types/cdut'`；而本文件 `:97` 已经导出过 `./cdut`。**同一模块被两条路径重复 `export *`**——ES 模块对同一绑定重复再导出是合法的（不产生冲突），但会让"某符号从哪来"更难追踪；这是既定实现，不是错误。

## 4. 调用者与调用链

入向：

| 调用者 | 位置 | 说明 |
| --- | --- | --- |
| `packages/shared/src/index.ts` | `:5` | 包入口转发本 barrel |
| `apps/electron/src/**`、`packages/**` | `grep -rn "from '@profer/shared'"` = **1143** 处 | 绝大多数通过包入口间接消费本文件；`package.json` 的 `exports['./types']` 也直接指向 `./src/types/index.ts`（`packages/shared/package.json`） |

出向：46 个 `./types/*` 子模块（`:13-117`），以及它们各自的下级（本文件不直接引用）。

无动态/条件导出；`export *` 是静态的。

## 5. 数据 I/O、读写与副作用

- 无 I/O、无磁盘、无网络、无缓存、无全局状态、无日志。
- 纯编译期：所有导出都是类型或常量声明，`export *` 会把子模块的**运行时值**（如 `REVIEW_MODEL_PROVIDERS`、`LONGTERM_MEMORY_IPC_CHANNELS`、`PROVIDER_DEFAULT_URLS`）一并转出，因此本文件虽自身无逻辑，仍是这些常量的导入路径。
- 副作用：无（无顶层语句）。

## 6. 分支、失败、取消与恢复

不适用，依据：本文件无控制流。失败面在构建/类型解析期：若某子模块被删除或改名，`export *` 会在 typecheck/打包时报模块找不到；运行期不会因本文件抛错。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查、无配置读取。权威状态：子模块各自定义其领域权威；本文件只是聚合入口。

## 8. 修改影响面

- 新增/删除一条 `export *` 会改变 `@profer/shared` 的公开类型面，影响 1143 处导入点中的任意一处（无法逐一列举，只能靠 typecheck 发现）。
- 删除某个子模块 re-export 会让此前可用的类型/常量变成"未导出"，典型如 `LONGTERM_MEMORY_IPC_CHANNELS`（`preload/index.ts:14` 直接导入）、`REVIEW_MODEL_PROVIDERS`（`review-ipc.ts:20`、`review-model-gateway.ts:14`、`review-first-use-readiness.ts:2`）、`PROVIDER_DEFAULT_URLS`（`channel.ts:41`）。
- 改 `Workspace` 形状：全仓 `apps/`+`packages` 检索未发现以该类型注解/导入的消费者（`grep` 类型位置 + `import type { Workspace }` 均为 0），改动风险低，但它是对外公开类型，外部使用者未知。
- 与 `shared/src/index.ts:6` 的重复 `cdut` 导出：若将来把 `./types/cdut` 移出本 barrel，需同时清理 `packages/shared/src/index.ts:6`，否则会留下"从入口仍可用、从 types barrel 不可用"的不一致。

## 9. 测试证据

- 无直接测试（纯 barrel，无可断言行为）。
- 间接：全仓 typecheck 会验证 46 条 `export *` 的目标存在与无冲突；本轮**未运行** typecheck，故该结论标为未知（见 §10）。
- 已做静态核对：46 个目标文件全部存在（逐名 `test -f`），`grep -cE '^export'` 在本文件为 47（1 interface + 46 re-export）。
- `NOT_RUN`：typecheck/build 均未执行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 47 条导出 = 1 interface + 46 `export *` | 已证实 | `packages/shared/src/types/index.ts:6-117`；`grep -cE '^export'` = 47 |
| 46 个子模块文件全部存在 | 已证实 | 逐名 `test -f packages/shared/src/types/<name>.ts`，0 MISSING |
| 包入口转发本 barrel | 已证实 | `packages/shared/src/index.ts:5`；`package.json exports['./types']` |
| `./cdut` 被本文件与包入口重复 `export *` | 已证实 | `packages/shared/src/types/index.ts:97`；`packages/shared/src/index.ts:5-6` |
| `Workspace` 接口无仓内消费者 | 已证实（限 `apps/`+`packages` grep） | 类型位置与显式 import 检索均为 0；仓外消费者未知 |
| 1143 处 `@profer/shared` 导入 | 已证实 | `grep -rn "from '@profer/shared'"` 计数 |
| 类型面无冲突（可 typecheck 通过） | 未知 | 本轮未运行 typecheck |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 47 条导出逐项 | §2 | `:6-117` | covered |
| `Workspace` 占位接口 | §2、§8 | `:6-10` | covered |
| 46 个子模块存在性 | §3、§10 | `:13-117` | covered |
| 重复 `cdut` 导出 | §3、§8 | `packages/shared/src/types/index.ts:97`；`packages/shared/src/index.ts:5-6` | covered |
| 调用者规模 | §4 | 跨文件 grep | covered |
| typecheck 可过 | §10 | — | unknown（NOT_RUN） |
