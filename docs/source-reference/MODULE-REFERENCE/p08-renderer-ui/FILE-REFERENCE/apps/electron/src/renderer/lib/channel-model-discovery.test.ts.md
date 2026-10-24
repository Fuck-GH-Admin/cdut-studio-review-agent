---
path: apps/electron/src/renderer/lib/channel-model-discovery.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f6f24b759a5398a4a517e68a217c4c0b204993c7
sha256: b37b47607d0f645947f7d0baf526cd2954bf6c2263f4d08f19a529f9e1b5c028
lines: 111
kind: test
package: p08-renderer-ui
author: docs-r07-author-extra-02-20261024
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/channel-model-discovery.test.ts

## 1. 测试目标

验证 `apps/electron/src/renderer/lib/channel-model-discovery.ts` 三个纯函数的合并/幂等/门控语义：远端发现失败不丢本地配置、成功刷新替换 fetched 模型并保留用户 enabled 与 1M 勾选、尝试键对首尾空白归一、自动发现门控不重复打点不覆盖用户配置。全部为同步纯函数断言（`bun:test`，`apps/electron/src/renderer/lib/channel-model-discovery.test.ts:1`）。

## 2. 用例清单

机械计数：`test(` = 10、`it(` = 0（grep `^\s*(it|test)\(` 于 `apps/electron/src/renderer/lib/channel-model-discovery.test.ts`），与下表一致：

1. `:18` keeps every configured model when remote discovery fails（describe `applyModelDiscoveryResult`，`:17`）。
2. `:28` updates discovered models only after a successful remote response。
3. `:46` Given 用户给模型勾选过 1M When 重新拉取 Then 保留该勾选。
4. `:66` Given 同一凭证与地址 When 只差首尾空白 Then 视为同一次尝试（describe `buildModelDiscoveryAttemptKey`，`:65`）。
5. `:71` Given 已尝试失败 When 换地址或换 Key Then 视为新的尝试。
6. `:90` Given 就绪且无模型 When 未尝试过 Then 自动发现（describe `shouldAutoDiscoverModels`，`:79`）。
7. `:94` Given 已尝试同一组合 When 再渲染 Then 不重复请求。
8. `:98` Given 已有模型清单 Then 不覆盖已有配置。
9. `:102` Given 凭证缺失或正在请求 Then 不发起自动发现。
10. `:107` Given 凭证未加载或用户手动增删过 Then 不介入用户配置。

（上表行号均相对 `apps/electron/src/renderer/lib/channel-model-discovery.test.ts`，如 `:18` = `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:18`。）

## 3. 真实断言

- `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:25`：`expect(applyModelDiscoveryResult(configured, result(false))).toBe(configured)`（同一引用，失败不动列表）。
- `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:39-43`：`toEqual([...])` 三元素精确列表：local-custom 保留、shared-model 换新名、stale-model 移除、new-model 默认 `enabled: false`。
- `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:57-61`：`toEqual([...])` 断言 `context1m: true/false` 两条均保留、brand-new 为 false。
- `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:67-68`：trim 前后 `buildModelDiscoveryAttemptKey` `.toBe` 相等；`:74-75`：`.not.toBe(base)`（换地址/换 Key）。
- `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:91,95,99`：`shouldAutoDiscoverModels(ready)` 分别 `toBe(true)/toBe(false)/toBe(false)`；`:103-104,108-109`：四组变体均 `toBe(false)`。

## 4. 未覆盖与脆弱点

- 未覆盖：成功刷新时"无 source 历史模型"保留分支（`apps/electron/src/renderer/lib/channel-model-discovery.ts:18-20`）——用例 1 的无 source 条目 `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:20` 只走失败短路；`discoveredById` 对重复 id 的行为未测。
- 未覆盖：`shouldAutoDiscoverModels` 各短路条件的组合优先级（如 awaitingCredentials 与 modelCount>0 同时成立）；`buildModelDiscoveryAttemptKey` 对 provider 变化未单列断言。
- 脆弱点：全部同步断言、无 timer/网络 mock，无时序脆弱性；用例 2/3 的 toEqual 对象字面量把"字段集合"当契约，`ChannelModel` 加字段会同时打破多条断言（有意的回归锁）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 用例、断言行如 §3 所列 | 已证实 | 机械计数 + `apps/electron/src/renderer/lib/channel-model-discovery.test.ts:25-109` |
| 失败同引用/成功合并/键归一/门控 false 族 | 已证实 | 同上 expect 行 |
| 测试实际运行结果 | 未知 | NOT_RUN（本轮未运行测试，纯静态阅读） |

## 6. 覆盖表

| 符号/分支 | 章节 | 行 | 覆盖 |
| --- | --- | --- | --- |
| `applyModelDiscoveryResult` 失败短路 | §2,§3 | `channel-model-discovery.test.ts:18-26` | covered |
| 成功合并 + enabled/1M 继承 | §2,§3 | `channel-model-discovery.test.ts:28-62` | covered |
| 无 source 历史模型保留（成功路径） | §4 | — | unknown |
| `buildModelDiscoveryAttemptKey` trim/换键 | §2,§3 | `channel-model-discovery.test.ts:65-77` | covered |
| `shouldAutoDiscoverModels` 6 入参门控 | §2,§3 | `channel-model-discovery.test.ts:79-110` | covered |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
