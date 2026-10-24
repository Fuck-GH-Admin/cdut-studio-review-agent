---
path: apps/electron/src/main/lib/review/module-settings-store.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 40f7e86e7dc88b35171b0b778a9dc4ae8f807efd
sha256: 46194f15b6623a0d2123e4d1810f427f7ab142c5cbad7b4549d2afad642f6816
lines: 58
kind: source
package: p06-review-batch
author: docs-r07-author-models-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/module-settings-store.ts

## 1. 结论与边界

审核专区的**独立模型偏好存储**：只持久化 `{ channelId, modelId }` 这一对选择，不保存任何凭证；并向上提供"审核未单独选择时沿用应用全局 Agent 渠道/模型"的解析结果。运行时模块（文件 I/O + 纯解析），无网络、无 IPC 注册。

不做的事：不校验渠道是否存在/启用/模型可用（校验在 `review-ipc.ts:1505-1521` 的 IPC handler）；不解密密钥（`channel-manager`）；不决定网关实际发哪个请求（`review-model-gateway.ts:170-182`）。

## 2. 导出与关键符号

导出 4 条：1 个 interface、3 个 function。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `EffectiveReviewModelSelection` | interface | `module-settings-store.ts:8-12` | `{ selection: {channelId;modelId} \| null; explicit: boolean }` | `explicit=true` 表示来自审核模块显式选择；false 表示回退全局 |
| `getReviewModuleSettings` | function | `:20-35` | `() => ReviewModuleSettingsV2` | 读文件；缺失/非法/异常均返回默认 `{agentModelSelection:null}` |
| `getEffectiveReviewModelSelection` | function | `:41-50` | `() => EffectiveReviewModelSelection` | 显式优先，否则全局回退 |
| `saveReviewModuleSettings` | function | `:52-58` | `(settings: ReviewModuleSettingsV2) => ReviewModuleSettingsV2` | 临时文件 + rename 覆盖写；原样返回入参 |

内部符号：

| 符号 | 行 | 作用 |
| --- | --- | --- |
| `DEFAULT_SETTINGS` | `:14` | 模块级常量对象 `{ agentModelSelection: null }`，被直接返回（同一引用） |
| `settingsPath`（内部） | `:16-18` | `join(getConfigDir(), 'review-module-settings.json')`；`getConfigDir()` 会按需创建目录（`config-paths.ts:80-90`） |

## 3. 内部逻辑与关键流程

### 3.1 读取与清洗 `getReviewModuleSettings`（`:20-35`）

1. 文件不存在 → 返回 `DEFAULT_SETTINGS`（`:22`）。
2. `JSON.parse` 后取 `agentModelSelection`（`:24-25`）；为 `null`/`undefined` → 默认（`:26`）。
3. 校验 `channelId`、`modelId` 均为**非空字符串**（`:27`），否则默认（`:28`）。
4. 合法时**重建**对象，只保留两个字段（`:30`）——文件里的额外键会被丢弃。
5. 任何异常（读失败/JSON 损坏）→ `console.warn('[审核设置] 设置文件无法读取，使用全局 Agent 默认模型:', error)` 后返回默认（`:31-34`）。注意日志文案说"使用全局默认"，但本函数本身只返回 null，真正回退发生在 `getEffectiveReviewModelSelection`。

### 3.2 有效选择 `getEffectiveReviewModelSelection`（`:41-50`）

1. 有审核显式选择 → `{ selection: reviewSelection, explicit: true }`（`:42-43`）。
2. 否则读应用设置 `getSettings()`（`:44`，`settings-service.ts:45-47` 有内存缓存）。
3. `agentChannelId` 为空 → `{ selection: null, explicit: false }`（`:45`）。
4. 否则 `{ selection: { channelId: agentChannelId, modelId: agentModelId ?? '' }, explicit: false }`（`:46-49`）。**`agentModelId` 缺失时会得到空字符串 modelId**，不是 null；下游 `findFirstAllowedChannel` 用 `models.some(id === '')` 判定必然失败，最终表现为"未配置可用渠道"，而不是"全局渠道缺模型"的精确提示（见 `review-model-gateway.ts:172-181`、`:210-217`）。

### 3.3 写入 `saveReviewModuleSettings`（`:52-58`）

1. `settingsPath()`（`:53`）；
2. 写 `${path}.tmp`（`:54-55`），`JSON.stringify(settings, null, 2)`；
3. `renameSync(tempPath, path)`（`:56`）——同目录 rename，POSIX 原子替换；
4. 返回入参对象（`:57`）。

**没有**：`mkdirSync`（依赖 `getConfigDir()` 已建目录）、`fsync`（崩溃时可能丢最后一次写）、字段校验、锁。同一进程内并发保存会共用同一个 `.tmp` 路径，存在互相覆盖/`ENOENT` 的窗口。

## 4. 调用者与调用链

入向（grep 全 `apps/electron/src`）：

| 调用者 | 位置 | 用途 |
| --- | --- | --- |
| `review-ipc.ts` | `:1501-1502` `GET_MODULE_SETTINGS_V2` | 渲染层读设置 |
| `review-ipc.ts` | `:1522-1523` `SAVE_MODULE_SETTINGS_V2` | 校验后保存（`selection` 可为 null） |
| `review-model-gateway.ts` | `:172`、`:194`、`:199`、`:210` | 渠道/模型解析、状态自检 |
| `review-pi-run-bridge.ts` | `:37` | 后台 Pi 审核启动前解析渠道/模型 |
| `run-async-service.ts` | `:40` | V2 运行装配模型 client |
| `module-settings-store.test.ts` | `:4` | 直接测试（见 §9） |
| `review-pi-run-bridge.main.test.ts` | `:39`、`:51`、`:184`、`:193`、`:197`、`:206` | 间接覆盖回退/显式切换 |

出向：`getConfigDir`（`config-paths.ts:80`）、`getSettings`（`settings-service.ts:45`）、`node:fs` 同步 API。无动态字符串调用。

## 5. 数据 I/O、读写与副作用

- 文件：`<configDir>/review-module-settings.json`，内容形如 `{"agentModelSelection":{"channelId":"...","modelId":"..."}}` 或 `{"agentModelSelection":null}`。
- 读：每次 `getReviewModuleSettings()` 都 `existsSync` + `readFileSync`，无缓存；`getSettings()` 有进程内缓存。
- 写：tmp + rename；无 fsync；无备份/版本号；覆盖式，无合并。
- 副作用：仅 `console.warn`（`:32`）；`getConfigDir()` 在目录不存在时会 `mkdirSync` 并打印日志（`config-paths.ts:84-87`）。
- 幂等：同一 settings 重复保存结果一致；但并发保存不保证顺序。
- 引用风险：无文件/非法时返回模块级 `DEFAULT_SETTINGS` 同一对象（`:14`、`:22`、`:26`、`:28`、`:33`），调用方若原地修改返回值会污染后续所有默认读取。当前已知调用方都只读。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| 文件不存在 | `:22` | 默认 null |
| JSON 解析/读取异常 | `:31-34` | warn + 默认 null |
| `agentModelSelection` 为 null/undefined | `:26` | 默认 null |
| 字段非字符串或空串 | `:27-29` | 默认 null |
| 显式选择存在 | `:43` | `explicit:true` |
| 全局无渠道 | `:45` | `selection:null, explicit:false` |
| 全局有渠道无模型 | `:47` | `modelId:''` |
| 保存 | `:55-56` | tmp 写入后 rename；异常向上抛 |

无取消/重试概念；写失败（权限/磁盘满）直接抛给 IPC 调用方，旧文件保持不变（rename 前失败）。无恢复逻辑；损坏文件按"无设置"处理，不自动修复/备份。

## 7. 权限与权威状态

- 本文件**无 sender/role 检查**，依据：不含 Electron/IPC 代码，所有入口都是普通函数。
- 权威状态：磁盘上的 `review-module-settings.json` 是审核模块显式选择的唯一权威；应用全局选择由 `settings-service` 的 `settings.json` 权威。本文件不缓存，读时以磁盘为准。
- 写入合法性由 `review-ipc.ts:1505-1521` 把关（渠道存在、`enabled===true`、provider 在白名单、模型存在且 `enabled !== false`）；绕过 IPC 直接调用 `saveReviewModuleSettings` 可写入任意字符串，但 `getReviewModuleSettings` 只做形状校验，不做存在性校验——存在性仍由网关解析时失败关闭。

## 8. 修改影响面

- `review-model-gateway.ts:170-217`：改回退语义/返回形状会改变自检文案与渠道选择；特别是 `explicit` 字段决定"重新选择"提示。
- `review-pi-run-bridge.ts:37-46`、`run-async-service.ts:40-46`：两处都用 `{selection, explicit}` 并在显式失效时抛错；改 `explicit` 语义会同时改变两条运行链的失败关闭。
- `review-ipc.ts:1501-1523`：IPC 契约 `ReviewModuleSettingsV2`（`packages/shared/src/types/review.ts:721-723`）；加字段需同步 preload/renderer。
- 测试：`module-settings-store.test.ts`（默认/保存/清除）、`review-pi-run-bridge.main.test.ts:196-207`（全局回退）、`:182-194`（显式优先）。改文件名/路径会使这些测试的隔离目录断言失效。

## 9. 测试证据

直接测试 `apps/electron/src/main/lib/review/module-settings-store.test.ts`（24 行，2 个 `test(`）：

- 夹具：`:6-8` 把 `PROFER_CONFIG_DIR` 指到 `work/tmp/review-module-settings-<Date.now()>`（`import.meta.dir` 上溯 6 层到仓库根），`afterAll` 递归删除。env 在第 7 行赋值，模块在第 4 行 import——因为 `getConfigDir()` 在调用时才读 env（`config-paths.ts:57-59`），所以隔离仍生效。
- 用例 1（`:11-17`）：先 `expect(getReviewModuleSettings()).toEqual({agentModelSelection:null})`；`saveReviewModuleSettings({channelId:'channel-a',modelId:'model-a'})` 返回等值；再读回等值；`existsSync(<CONFIG_DIR>/review-module-settings.json)` 为 true。
- 用例 2（`:19-23`）：先保存选择，再保存 `{agentModelSelection:null}`，读回等于 null。
- 顺序依赖：两个用例共享同一配置文件，用例 2 依赖用例 1 已建目录/文件；单独跑用例 2 仍可（save 会建文件），但目录由 `getConfigDir()` 创建。
- **未覆盖**：`getEffectiveReviewModelSelection`（本文件 0 断言）、损坏 JSON、空串字段清洗、额外键丢弃、rename 原子性、并发保存、写失败。回退/显式语义只由 `review-pi-run-bridge.main.test.ts:182-207` 间接断言（见该篇）。

`NOT_RUN`：本轮未执行 `bun test`/typecheck；以上为静态阅读，不表示测试已通过。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 只持久化 channelId/modelId，不存密钥 | 已证实 | `module-settings-store.ts:1`、`:14`、`:30`、`:55` |
| 读失败/损坏回退默认且不抛 | 已证实 | `:22-34` |
| 显式选择优先，否则回退全局 `agentChannelId/agentModelId` | 已证实 | `:41-50` |
| 全局缺 modelId 时返回空串而非 null | 已证实 | `:47` |
| 写采用 tmp+rename，无 fsync/锁 | 已证实 | `:54-56` |
| 默认对象被多处直接返回（共享引用） | 已证实 | `:14`、`:22`、`:26`、`:28`、`:33` |
| 并发保存可能共用 `.tmp` 互相覆盖 | 推断 | `:54` 固定临时路径 + 无锁 |
| 渲染层如何展示"审核专属失效"提示 | 未知 | 未读 renderer 消费点 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 4 条导出 | §2 | `:8-58` | covered |
| 读/清洗/异常 | §3.1、§6 | `:20-35` | covered |
| 有效选择与回退 | §3.2 | `:41-50` | covered |
| 写入与原子性 | §3.3、§5 | `:52-58` | covered |
| IPC 校验边界 | §7 | `review-ipc.ts:1505-1521` | covered（跨文件） |
| 测试 2 用例 | §9 | `module-settings-store.test.ts:11-23` | covered |
| 并发/损坏恢复 | §6 | — | unknown |
