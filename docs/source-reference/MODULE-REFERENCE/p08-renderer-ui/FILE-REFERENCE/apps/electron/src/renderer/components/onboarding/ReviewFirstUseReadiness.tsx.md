---
path: apps/electron/src/renderer/components/onboarding/ReviewFirstUseReadiness.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6a464b734466f3bae6d59852ada50f56bba5d2cc
sha256: 3d3d25ae2c8f3b7f67206727d8d127974cc3baf44a6ae5c1f1bb8175f2e8975f
lines: 155
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/onboarding/ReviewFirstUseReadiness.tsx

## 1. 结论与边界

「材料审核 · 模型准备」面板：列出可用审核渠道/模型、把选择保存到审核模块设置、展示 Main 的出口自检结果，并提供一次**真实模型请求**的文本/JSON 自检（`apps/electron/src/renderer/components/onboarding/ReviewFirstUseReadiness.tsx:17-154`）。

它是运行时 UI 组件，同时被「首次进入浮层」与「审核设置页」复用（调用点见第 4 节）。

**本轮的关键语义（模型默认渠道回退 / 显式配置）**：

- 下拉首项「自动沿用应用当前渠道与模型」对应 `selection = null`（`:116`）；保存时把 `agentModelSelection: null` 写入 Main（`:59`）。
- Main 收到 `null` 后走 `getEffectiveReviewModelSelection()`：先读审核专属设置，没有则沿用应用主 Agent 的 `agentChannelId/agentModelId`，并标记 `explicit: false`（`apps/electron/src/main/lib/review/module-settings-store.ts:41-50`）。
- 因此「默认」不是本文件挑渠道，而是 Main 决定；本文件只显示 `getModelGatewayStatus()` 的结果（`:35`、`:62`）。
- 用户显式选某渠道/模型时保存的是具体 ID（`:104-114`、`:59`）；Main 保存前会二次校验渠道已启用、provider 在白名单、模型已启用（`apps/electron/src/main/lib/review/review-ipc.ts:1504-1523`）。

明确不做的事：

- **不创建渠道/密钥**：注释「沿用应用已有渠道和密钥……不创建第二套配置」（`:1`、`:94`）；渠道与密钥由应用模型设置管理。
- **不写案卷、不发布规则**：自检请求只是普通模型调用（`:76`）。
- **不自行判定「可用」**：`available` 来自 Main（`:40`、`:62`）。

## 2. 导出与关键符号

顶层 `export` 仅 1 个函数；`Props`、`ProbeState` 未导出。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `ReviewFirstUseReadiness` | 导出函数组件 | `:17` | `({onSaved?, onConfigureChannels?}: Props): React.ReactElement` | 唯一导出 |
| `Props` | 内部 interface | `:11-14` | `{onSaved?: () => void; onConfigureChannels?: () => void}` | 两个回调都可选 |
| `ProbeState` | 内部 type | `:15` | `ReviewTextProbe \| {status:'running'}` | 自检状态 |
| `reload` | 内部 useCallback | `:28-44` | `() => Promise<void>` | 并行读渠道/设置/网关 |
| `save` | 内部 async | `:52-67` | `() => Promise<void>` | 保存审核模型选择 |
| `testTextAndJson` | 内部 async | `:69-87` | `() => Promise<void>` | 真实模型自检 |
| `probeGeneration` | 内部 useRef | `:26` | `number` | 自检代次，丢弃过期结果 |

依赖的纯函数来自 `apps/electron/src/renderer/components/onboarding/review-first-use-readiness.ts`：`eligibleReviewChannels`（`:7-11`）、`isReviewSelectionAvailable`（`:13-17`）、`selectionKey`（`:19-21`）、`interpretReviewTextProbe`（`:28-52`）。

## 3. 内部逻辑与关键流程

### 3.1 加载（`:28-46`）

```ts
const [newChannels, settings, status] = await Promise.all([
  window.electronAPI.listChannels(), window.reviewAPI.getModuleSettingsV2(), window.reviewAPI.getModelGatewayStatus(),
])
```

- 进入前先 `setLoading(true)`、清 `error`、`probeGeneration.current += 1`、清 `probe`（`:29-32`）——**任何刷新都会作废进行中的自检**。
- 成功：写 `channels`、`selection`、`savedSelection`（都用 `settings.agentModelSelection`）、`gateway`（`:37-40`）。
- 失败：`setError('读取已有配置失败：' + message)`（`:41-43`）；`finally` 复位 `loading`（`:43`）。
- 挂载时执行一次（`:46`），依赖 `reload`（`useCallback([])`，`:44`），因此实际只跑一次。

### 3.2 派生状态（`:47-50`）

| 名称 | 计算 | 含义 |
| --- | --- | --- |
| `options` | `eligibleReviewChannels(channels)`（`:47`） | 已启用 + provider 在白名单 + 至少一个启用模型 |
| `dirty` | `selectionKey(selection) !== selectionKey(savedSelection)`（`:48`） | 选择是否未保存 |
| `selectedAvailable` | `isReviewSelectionAvailable(channels, selection)`（`:49`） | 当前选择是否仍可用；`null` 视为可用 |
| `savedAvailable` | `isReviewSelectionAvailable(channels, savedSelection)`（`:50`） | 已保存选择是否仍可用 |

白名单常量是 `REVIEW_MODEL_PROVIDERS = ['openai','deepseek','custom','ollama']`（`packages/shared/src/types/review.ts:478`），与 Main 网关/保存校验共用同一常量（`review-model-gateway.ts:156-158`、`review-ipc.ts:1515`）。

### 3.3 保存（`:52-67`）

1. `if (!selectedAvailable) return`（`:53`）——不可用的选择不会提交。
2. 置 `saving`、清 `error`、作废自检、清 `probe`（`:54-57`）。
3. `saveModuleSettingsV2({agentModelSelection: selection})`（`:59`）。
4. 用**回执**覆盖 `selection` 与 `savedSelection`（`:60-61`），再重新取网关状态（`:62`），最后 `onSaved?.()`（`:63`）。
5. 失败：`setError('保存审核模型失败：' + message)`（`:64-66`）；`finally` 复位 `saving`（`:66`）。

保存 `null` 是合法路径：Main 只校验「非 null 时必须完整且可用」（`review-ipc.ts:1506-1523`）。

### 3.4 文本/JSON 自检（`:69-87`）

- 守卫：`dirty || !savedAvailable || !gateway?.available || saving` 任一为真即返回（`:70`）——**必须先保存且出口可用**。
- `generation = ++probeGeneration.current`；`route = gateway`（快照，`:71-72`）。
- 置 `running`、清 `error`（`:73-74`）。
- 调用 `requestT01ModelDraft({system, user})`，system 要求「只输出严格 JSON：`{"ready":"CDUT_REVIEW_PROBE"}`，禁止 Markdown 和额外文字」（`:77-80`）。
- 成功且代次未变：`setProbe(interpretReviewTextProbe(result, route))`（`:81`）。
- 失败且代次未变：`{status:'failed', reason: message}`（`:82-86`）。

`interpretReviewTextProbe`（`review-first-use-readiness.ts:28-52`）要求：`JSON.parse` 成功、是对象、非数组、`ready === 'CDUT_REVIEW_PROBE'`；否则返回 failed 及具体原因。`identityConfirmed` 仅在 `gateway.available && gateway.channelName === result.channelName && gateway.modelId === result.modelId` 时为真（`:47-50`）。

Main 侧 `requestT01ModelDraft` 的实际行为（`apps/electron/src/main/lib/review/review-v3-t01-model-draft-service.ts:31-56`）：

- `system/user` 去空后必须非空，否则 `T01_MODEL_PROMPT_REQUIRED`（`:32-34`）；
- `resolveReviewGatewayChannel()` 取不到渠道 → `T01_MODEL_GATEWAY_UNAVAILABLE`（`:36-37`）；
- 超时 120s、输出上限 60,000 字符，空响应/超长分别抛 `T01_MODEL_EMPTY_RESPONSE` / `T01_MODEL_RESPONSE_TOO_LONG`（`:27-29`、`:48-49`）；
- 返回 `{raw, channelName: resolved.channel.name, modelId: resolveReviewGatewayModelId(resolved.channel)}`（`:51-55`）。

### 3.5 渲染分支（`:89-153`）

- 刷新按钮在 `loading || saving || probe?.status === 'running'` 时禁用（`:96`）。
- 下拉：`value = selectionKey(selection)`（`:104`）；禁用条件同上（`:106`）；`onChange` 在 `options` 展开的 `(channelId, modelId)` 中按 key 反查，找不到则 `setSelection(null)`（`:107-114`）；任何选择变化都会作废自检（`:112-113`）。
- 首项 `value=""` = 自动（`:116`）。
- 若 `!selectedAvailable && selection`，插入一条 `value={selectionKey(selection)}` 的提示项「先前选择已禁用或删除，必须重新选择」（`:117`）。
- 每个渠道一个 `optgroup`，只列 `model.enabled !== false` 的模型（`:118-121`）。
- 保存按钮：`disabled={loading || saving || !dirty || !selectedAvailable}`（`:125`）。
- 「打开现有模型配置」只在 `onConfigureChannels` 存在时渲染（`:126`）——**当前两个调用方都没有传该 prop**（`ContentReviewView.tsx:209`、`ReviewSettingsPanel.tsx:10`），所以该按钮在实际界面中不会出现（已证实）。
- 状态框图标与主文案：`gateway?.available && !dirty && savedAvailable` → 绿勾 +「配置检查：存在可用出口」，否则琥珀叹号 +「配置尚未就绪」；`loading` 时文案为「正在读取配置」（`:132-134`）。
- 状态明细按优先级：`dirty` →「请先保存所选模型，再检查实际出口。」；`!savedAvailable` →「当前保存的审核模型已不可用，请重新选择。」；`gateway.available` → `${channelName ?? '未知渠道'} · ${modelId ?? '尚未确定模型'} · ${protocol}（仅配置检查）`；否则 `gateway.reason ?? '尚未取得出口状态。'`（`:136-138`）。
- 自检按钮禁用条件叠加 `dirty || !savedAvailable || !gateway?.available || probe?.status === 'running'`（`:141`）；旁边常驻提示「会产生一次真实模型请求及可能的费用」（`:145`）。
- 通过：显示渠道/模型，并按 `identityConfirmed` 二选一文案（「模型标识与配置吻合。」/「回传型号与配置不一致，具体型号尚未核实。」）（`:147-149`）。
- 失败：`role="alert"` 的「自检未通过：…。请检查渠道、配额和网络后重试。」（`:150`）。
- 组件级 `error` 另起 `role="alert"`（`:152`）。

## 4. 调用者与调用链

**入向（2 处）**

| 调用方 | 行 | 传入 |
| --- | --- | --- |
| `apps/electron/src/renderer/components/content-review/ContentReviewView.tsx` | `:209` | 无 props（首次准备浮层内） |
| `apps/electron/src/renderer/components/content-review/ReviewSettingsPanel.tsx` | `:10` | `onSaved={onSaved}` |

**出向（IPC）**

| 调用 | 本文件行 | preload | Main |
| --- | --- | --- | --- |
| `window.electronAPI.listChannels()` | `:35` | `preload/index.ts:2291-2293` → `CHANNEL_IPC_CHANNELS.LIST` | 渠道管理 |
| `getModuleSettingsV2()` | `:35` | `preload/index.ts:5095` → `review-v2:get-module-settings`（`packages/shared/src/types/review.ts:668`） | `review-ipc.ts:1500-1503` |
| `getModelGatewayStatus()` | `:35`、`:62` | `preload/index.ts` 的 `reviewAPI` → `review:get-model-gateway-status`（`packages/shared/src/types/review.ts:666`） | `review-ipc.ts:1495-1497` → `review-model-gateway.ts:207-238` |
| `saveModuleSettingsV2()` | `:59` | `preload/index.ts:5096` → `review-v2:save-module-settings`（`packages/shared/src/types/review.ts:669`） | `review-ipc.ts:1504-1523` → `module-settings-store.ts:55-58` |
| `requestT01ModelDraft()` | `:77` | `preload/index.ts:4947-4951` → `review-v3:t01-model-draft`（`packages/shared/src/types/review.ts:614`） | `review-ipc.ts:980-981` → `review-v3-t01-model-draft-service.ts:31` |

## 5. 数据 I/O、读写与副作用

- **读**：渠道列表、审核模块设置、网关状态。
- **写**：`review-module-settings.json`（Main 侧 `module-settings-store.ts:16-18`、`:55-58`，临时文件 + `renameSync`，原子替换）；**不写密钥**（`:1` 注释，仅存 channelId/modelId）。
- **真实网络副作用**：`testTextAndJson` 会发起一次真实模型请求，可能计费（`:145` 明示）；由 Main 持有密钥（`:76` 注释）。
- **无** localStorage/剪贴板/定时器/全局监听。
- **并发**：`probeGeneration` 保证刷新/改选后旧响应不落地（`:31`、`:56`、`:71`、`:81-86`）；`saving` 与 `probe running` 互斥按钮（`:96`、`:106`、`:141`）。
- **幂等**：保存是覆盖写，同一选择重复保存结果一致；自检不是幂等操作（每次都发请求、可能计费）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 读取失败 | `:41-43` | 错误上屏；`channels` 保持旧值（首次为空） |
| 选择已失效 | `:117` | 下拉插入「先前选择已禁用或删除」提示项 |
| 选择不可用仍点保存 | `:53` | 直接 return（按钮也已禁用） |
| 保存失败 | `:64-66` | 错误上屏，`selection` 不回滚（仍为用户所选） |
| 保存成功 | `:60-63` | 用 Main 回执覆盖本地选择并刷新网关 |
| 自检被刷新/改选打断 | `:31-32`、`:56`、`:71`、`:81` | 代次不匹配的结果被丢弃 |
| 自检请求失败 | `:82-86` | `{status:'failed', reason}`，UI 显示「自检未通过」 |
| 自检返回非 JSON/无标记 | `review-first-use-readiness.ts:32-40` | failed，原因分别为「不是有效 JSON」「没有按约定返回 JSON 自检标记」 |
| 网关不可用 | `:141` | 自检按钮禁用，明细显示 `gateway.reason` |
| 组件卸载 | — | 无显式清理；进行中的 `await` 返回后仍会 `setState`（React 18 下不再告警）——**推断**，本文件无 `mounted` 标志 |

**恢复**：设置持久化在 Main，重开应用后 `reload()` 重新读取；「自动」选择（`null`）会随应用主 Agent 渠道变化而变化（`module-settings-store.ts:46-49`），不需要重新保存。

**不可恢复/需人工**：显式选择失效时不会静默换模型，Main 直接返回不可用（`review-model-gateway.ts:207-220` 的 `hasExplicitSelection` 分支），用户必须重新选择。

## 7. 权限与权威状态

- 本文件无 sender/role/actor 检查；保存与请求都由 Main 校验。
- 权威状态：
  - 渠道可用性 = `listChannels()` 的 `enabled`/`provider`/`models`；
  - 「哪些 provider 可做审核出口」= `REVIEW_MODEL_PROVIDERS`（`packages/shared/src/types/review.ts:478`），本文件与 Main 共用；
  - 「最终用哪个渠道/模型」= Main 的 `getEffectiveReviewModelSelection()`（`module-settings-store.ts:41-50`）；
  - 「当前是否可用」= `getReviewModelGatewayStatus()`（`review-model-gateway.ts:207-238`）。
- 前端只做可用性过滤（`:107-114`、`:125`），不是授权；即使绕过 UI，Main 仍会拒绝非法选择（`review-ipc.ts:1504-1523`）。

## 8. 修改影响面

- **两个调用方**：`ContentReviewView.tsx:209`（浮层）、`ReviewSettingsPanel.tsx:10`（设置页）。改 props 需同步；`onConfigureChannels` 目前无人传入。
- **默认回退语义**：本文件的 `null` 选项 + Main 的 `getEffectiveReviewModelSelection` 是同一特性的两端。只改一端会破坏「默认沿用应用渠道」：例如把 `null` 改成显式首渠道，会让审核模块不再跟随应用主 Agent 换渠道。
- **`review-first-use-readiness.ts`**：`eligibleReviewChannels`/`isReviewSelectionAvailable`/`interpretReviewTextProbe` 的判定变化会同时影响下拉列表、保存按钮与自检结论。
- **`requestT01ModelDraft`**：本文件把它当「探针」用，但它是通用 T01 起草端口（`review-v3-t01-model-draft-service.ts:1-10`）。改该端口的超时/上限/返回字段会影响自检文案与 `identityConfirmed`。
- **测试同步**：无直接测试（见第 9 节）；改动需补 UI 或纯函数测试。
- 无存储格式迁移；设置文件只有 `agentModelSelection` 一个键（`module-settings-store.ts:14`）。

## 9. 测试证据

- **直接测试**：无。`grep -rln "ReviewFirstUseReadiness" apps/electron/src --include=*.test.*` 无命中。
- **间接（只读断言，未运行）**：
  - `apps/electron/src/main/lib/review/review-model-gateway.test.ts:110-113`：`getReviewModelGatewayStatus()` 在空配置下 `available:false`——对应本文件 `:133` 的「配置尚未就绪」分支。
  - 同文件 `:51-63`：断言 `REVIEW_MODEL_PROVIDERS` 含 `openai/deepseek/custom/ollama`、不含 `anthropic/google/openai-responses`、长度为 4——对应本文件 `:47` 的 `options` 过滤。
  - `review-error-text.test.ts` 与本文件无直接关系。
- **未覆盖**：下拉选项构造、失效选择提示项、保存成功/失败、自检代次丢弃、`interpretReviewTextProbe` 的三个失败分支、`identityConfirmed` 的真/假两种文案、`onConfigureChannels` 条件渲染、真实模型请求（无 mock）。
- **NOT_RUN**：本轮未执行测试/构建/GUI；真实模型自检会产生费用，明确未运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出，props 两个可选回调 | 已证实 | `:11-17` |
| 首项「自动」对应 `selection=null` 并原样保存 | 已证实 | `:116`、`:59` |
| `null` 时 Main 回退到应用主 Agent 渠道/模型并标 `explicit:false` | 已证实 | `module-settings-store.ts:41-50` |
| 显式选择失效时 Main 报「审核专属渠道或模型已不可用」而非静默换模型 | 已证实 | `review-model-gateway.ts:207-220` |
| 白名单为 4 个 provider，前后端共用 | 已证实 | `packages/shared/src/types/review.ts:478`、`review-model-gateway.ts:156-158`、本文件 `:47` |
| 保存前 Main 会二次校验渠道/模型 | 已证实 | `review-ipc.ts:1504-1523` |
| `onConfigureChannels` 当前无人传入，按钮不渲染 | 已证实 | 两个调用点 `ContentReviewView.tsx:209`、`ReviewSettingsPanel.tsx:10`；grep 仅本文件 3 处 |
| 自检走 T01 起草端口，120s 超时、60k 上限 | 已证实 | `review-v3-t01-model-draft-service.ts:27-29`、`:31-56` |
| 首次准备浮层保存后不通知父级，顶栏徽标可能保持旧值 | 推断 | `ContentReviewView.tsx:209` 未传 `onSaved`；父级只读 `reviewGatewayStatusAtom` |
| 应用主 Agent 渠道不是审核白名单 provider 时，状态文案显示「未配置」而非「渠道不支持」 | 推断 | `findFirstAllowedChannel` 在 `configuredSelection` 存在但不可用时返回 `undefined`（`review-model-gateway.ts:169-181`），`explicit=false` 走「未配置…」分支（`:214-216`） |
| 自检进行中卸载组件后是否仍 setState | 未知 | 无 `mounted` 标志；React 版本行为未读 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| props 与唯一导出 | 2 | `:11-17` | covered |
| `reload` 三路并行与失败 | 3.1、6 | `:28-46` | covered |
| 派生 `options/dirty/available` | 3.2 | `:47-50` | covered |
| `save` 守卫与回执 | 3.3、6 | `:52-67` | covered |
| `testTextAndJson` 守卫与代次 | 3.4、6 | `:69-87` | covered |
| 自检判定（纯函数） | 3.4 | `review-first-use-readiness.ts:28-52` | covered |
| T01 端口错误码 | 3.4、6 | `review-v3-t01-model-draft-service.ts:31-56` | covered |
| 下拉与失效提示 | 3.5 | `:103-122` | covered |
| 保存按钮禁用 | 3.5 | `:125` | covered |
| `onConfigureChannels` 条件渲染 | 3.5、8 | `:126` | covered |
| 状态框文案优先级 | 3.5 | `:130-139` | covered |
| 自检按钮与费用提示 | 3.5 | `:141-146` | covered |
| 通过/失败展示 | 3.5 | `:147-150` | covered |
| 权限与权威 | 7 | — | covered |
| 测试证据 | 9 | — | partial |
| 卸载后 setState | 10 | — | unknown |
