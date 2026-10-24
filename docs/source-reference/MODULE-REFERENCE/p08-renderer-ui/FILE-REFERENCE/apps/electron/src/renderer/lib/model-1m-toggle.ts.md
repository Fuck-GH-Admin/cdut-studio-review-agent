---
path: apps/electron/src/renderer/lib/model-1m-toggle.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d6929ea629165930c979a3bc6c32f8864621e19e
sha256: 7933852e3c7ee386390113e29252ea5f82234b4a512eda393b9f335710dbe7ff
lines: 51
kind: source
package: p08-renderer-ui
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/model-1m-toggle.ts

## 1. 结论与边界

渠道配置里「1M」勾选状态的解析（51 行，头注释 `:1-10`）：1M 上下文是模型+渠道能力，三态（缺省=自动判定 / true=强开 / false=强关）；UI 必须显示**生效结果**而非显式字段（否则自动开启的 DeepSeek V4 类模型会显示未勾选，`:8-9`）。纯计算。

**边界**：不写配置（调用方写 `context1m`）；判定规则在 `@profer/shared.resolveOneMillionContextDecision`（跨批）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `Model1MToggleState` | 接口（导出） | 15-24 | `{enabled: boolean; source: OneMillionContextSource; nextExplicit: boolean; title: string}` | 生效结果/来源/下一步取值/悬停说明 |
| `resolveModel1MToggleState` | 函数（导出） | 27-38 | `(model: Pick<ChannelModel,'id'\|'context1m'>, provider: ProviderType) => Model1MToggleState` | 状态解析 |
| `buildModel1MTitle` | 函数（内部） | 40-51 | `(enabled, source) => string` | 四种悬停文案 |

导出合计 2。

## 3. 内部逻辑与关键流程

1. **resolveModel1MToggleState**（`:27-38`）：`decision = resolveOneMillionContextDecision(model.id, provider, model.context1m)`（`:31`）；返回 `{enabled: decision.enabled, source: decision.source, nextExplicit: !decision.enabled, title: buildModel1MTitle(...)}`（`:32-37`）。`nextExplicit=!enabled`：点击即取反（`:35`）。
2. **buildModel1MTitle**（`:40-51`）：switch（source）四文案——`forced-on`（"已手动开启…能否真正协商由端点决定。点击改为关闭。" `:43`）、`forced-off`（"已手动关闭…即使模型与渠道都验证支持也不按 1M 处理。点击改为开启。" `:45`）、`auto`×enabled（已验证支持/未通过验证两分支，`:47-49`）。

## 4. 调用者与调用链

入向（全冻结树检索 `model-1m-toggle`/`resolveModel1MToggleState`）：`components/settings/ChannelForm.tsx:53`（import）→ `ChannelForm.tsx:226` `resolveModel1MToggleState(model, provider)`（渲染勾选状态）、`ChannelForm.tsx:466` 写回 `context1m: resolveModel1MToggleState(model, provider).nextExplicit`（点击取反落盘）。批内测试 `model-1m-toggle.test.ts:2`。出向：`@profer/shared`（`resolveOneMillionContextDecision`、类型 `OneMillionContextSource`/`ProviderType`/`ChannelModel`，`:12-13`）。

## 5. 数据 I/O、读写与副作用

无（不适用，依据：纯函数，无 I/O/全局状态）。副作用：无（写配置在调用方 `ChannelForm.tsx:466`）。

## 6. 分支、失败、取消与恢复

分支：`buildModel1MTitle` 的 switch 三分支（auto 内再二分）；无 throw（不适用，依据：全文无 throw）。TS 穷尽：`OneMillionContextSource` 若新增成员，switch 需补（当前无 default，返回值类型上 title 可能 undefined——`buildModel1MTitle` 签名声明 `string`，switch 全覆盖三个 source 值）。

## 7. 权限与权威状态

无权限分支，依据：无 sender/role 检查。权威状态=`resolveOneMillionContextDecision` 的三态裁决（显式 context1m 优先于自动判定，跨批实现）。

## 8. 修改影响面

- 影响 `ChannelForm.tsx` 模型行勾选 UI 与点击写回语义（`ChannelForm.tsx:226`/`ChannelForm.tsx:466`）；`Model1MToggleState` 形状是 UI 契约。
- title 文案是用户可见文本（4 条，`:43-49`）；与测试断言 `toContain('自动'/'手动开启'/'手动关闭')` 耦合。
- 需同步修改的测试：`model-1m-toggle.test.ts`（批内 4 用例）。

## 9. 测试证据

直接测试：`lib/model-1m-toggle.test.ts`（批内，4 test，详见其手册）：自动开（deepseek-v4-pro+deepseek）、第三方网关默认关（custom）、强开（context1m:true）、强关（context1m:false）四态断言。未覆盖：title 四文案仅按 `toContain` 子串验证；`resolveOneMillionContextDecision` 的判定规则本身（跨批）。

`NOT_RUN`：本轮未运行 bun test，断言≠已运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 接口/解析/取反/四文案 | 已证实 | `:1-51` 全文逐行 |
| 入向=ChannelForm.tsx:226/ChannelForm.tsx:466 + 批内测试 | 已证实 | 全树检索（§4） |
| `resolveOneMillionContextDecision` 判定规则（deepseek+V4 自动开、custom 自动关） | 推断 | 测试样例暗示（`model-1m-toggle.test.ts:6/15`），shared 实现跨批未深读 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `Model1MToggleState` | §2 | 15-24 | covered |
| `resolveModel1MToggleState` | §3.1/§9 | 27-38 | covered |
| `buildModel1MTitle` 四文案 | §3.2/§8 | 40-51 | covered |
