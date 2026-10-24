---
path: apps/electron/src/renderer/lib/channel-model-groups.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 79a938582524a903de26cff111ac7bda99dbb084
sha256: d7c46182862b34a98d9aca9d1a491102fc26dd9e8c925f96cd6236457a77112b
lines: 168
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-model-groups.test.ts

## 1. 测试目标

验证渠道内核勾选判定与 `apps/electron/src/renderer/lib/channel-model-groups.ts` 展示/过滤函数的行为契约：老配置迁移等价性（不静默丢能力）、勾选优先于渠道类型、协议过滤语义、模型池命名兼容、xAI Pi 内核标签回归锁。注意：约半数断言实际验证 `@profer/shared` 的 `inferAgentRuntimeModes`/`isChannelEnabledForRuntime`/`isAgentEnabledForChannel`（域外依赖，间接证据）。

## 2. 用例清单

机械计数：`test(` = 16、`it(` = 0（grep `^\s*(it|test)\(` 于 `apps/electron/src/renderer/lib/channel-model-groups.test.ts`），与下表一致（行号 = `apps/electron/src/renderer/lib/channel-model-groups.test.ts:<行>`）：

- describe「渠道的 Agent 内核勾选」（`:31`）：`:33` 老配置推导与迁移前等价；`:46` 勾选为准而非渠道类型；`:57` 渠道未启用两内核都不可用；`:63` 老配置回退 provider 推导。
- describe「运行时的渠道协议过滤」（`:70`）：`:71` enabled Pi channel 放行两种协议；`:76` anthropic 过滤放行；`:80` 老配置行为与迁移前一致；`:89` 未启用渠道一律拦截。
- describe「getChannelProtocol 展示值」（`:94`）：`:95` 保持单一展示值。
- describe「官方模型池展示元数据」（`:102`）：`:103` model-family 显示模型池；`:109` 旧版官方渠道保持名称；`:115` 无 managedType 但稳定模型池 ID 仍识别。
- describe「渠道列表的 Pi 内核标签」（`:122`）：`:123` xAI 开实验+勾选 → experimental-active；`:132` 未开实验或停用 → experimental-inactive；`:147` 非 xAI → active；`:156` 回归锁：旧判据对 xAI 恒 false，标签不得再用它。

## 3. 真实断言

- `apps/electron/src/renderer/lib/channel-model-groups.test.ts:34-43`：`expect(inferAgentRuntimeModes({...})).toEqual(['pi'])`/`toEqual([])`/`toEqual(['pi'])`（8 条推导断言，含 xai 需实验开关）。
- `:48,51,54,59-60,64-66`：`isChannelEnabledForRuntime(...)` `toBe(true/false)` 勾选与回退族。
- `:72-73,77,81-86,90`：`supportsChannelProtocol(...)` `toBe(true/false)` 过滤族。
- `:96-98`：`expect(getChannelProtocol('deepseek')).toBe('openai')` 等 3 条展示值。
- `:105-106,111-112,117-118`：`isModelFamilyChannel` `toBe(true/false)` 与 `getOfficialChannelDisplayName` `toBe('GPT 模型池')/('GPT')/('Claude 模型池')`。
- `:124-129,133-144,148-153`：`resolvePiCoreState(...)` `toBe('experimental-active'/'experimental-inactive'/'active')`；`:165-166`：`expect(isAgentEnabledForChannel(xai)).toBe(true)` + `expect(resolvePiCoreState(xai)).toBe('experimental-active')`（回归锁）。

## 4. 未覆盖与脆弱点

- 未覆盖（本文件）：`groupChannelModels`、`getChannelSource`、`getModelSourceLabel`、`getEnabledModelCount`、`isOfficialChannel` 无任何断言（检索范围：本文件全文 + 全树测试文件 grep 这些符号仅命中定义处）。
- 未覆盖：`supportsChannelProtocol` 的 protocol 形参差异性（`:72-73` 断言两种协议同真，未证伪差异分支）；`getChannelProtocol` 对 10 个 anthropic provider 仅抽样 1 个（`:97`）。
- 脆弱点：`:34-66` 大量断言锁 `@profer/shared` 内部推导（域外，`packages/shared/src/types/channel.ts:155-187`），shared 改动会连带打破本文件；`:33` 注释明言"迁移必须与升级前行为等价"，属等价性契约锁。全同步断言，无时序脆弱性。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 用例、断言行如 §3 所列 | 已证实 | 机械计数 + `channel-model-groups.test.ts:34-166` |
| xAI 标签回归锁与根因注释 | 已证实 | `channel-model-groups.test.ts:156-167` |
| shared 推导断言的实际行为 | 间接 | 断言目标在 `@profer/shared`（域外实现） |
| 测试实际运行结果 | 未知 | NOT_RUN（本轮未运行测试，纯静态阅读） |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `resolvePiCoreState` 三分支 | §2,§3 | `channel-model-groups.test.ts:122-167` | covered |
| `supportsChannelProtocol` | §2,§3 | `channel-model-groups.test.ts:70-91` | covered |
| `getChannelProtocol` | §2,§3 | `channel-model-groups.test.ts:94-99` | partial（1/10 provider 抽样） |
| `isModelFamilyChannel`/`getOfficialChannelDisplayName` | §2,§3 | `channel-model-groups.test.ts:102-119` | covered |
| `isChannelEnabledForRuntime`/`inferAgentRuntimeModes`（shared） | §3 | `channel-model-groups.test.ts:31-67` | covered（间接） |
| `groupChannelModels`/`getChannelSource`/`getModelSourceLabel`/`getEnabledModelCount` | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
