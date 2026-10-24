---
path: apps/electron/src/main/lib/agent-model-selection.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 1559f94f01267319aaf2f935116c35c7a16427ff
sha256: f4ef49b0894e26d5542b94f6b75975e2df85f6b042db9721ed0574c92385b4a4
lines: 101
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-model-selection.test.ts

## 1. 测试目标

`assertEnabledModelForChannel`/`listEnabledAgentModelsForChannel`（`agent-model-selection.ts:24,54`）渠道/模型可用性校验。bun:test；**真实临时配置**（mkdtemp + 写 channels.json + `PROFER_CONFIG_DIR` 切换，`:11-47`），无 mock。

## 2. 用例清单

共 **6 个 `test(`**：Pi 渠道 Pi 模型通过（`:50`）；按当前 runtime 校验同（`:59`）；缺省 runtime 走默认 pi（`:68`）；列表仅启用模型（`:76`）；停用模型拒（`:83`）；写渠道后复验通过（`:92`）。beforeEach 重写配置（`:38-41`）。

## 3. 真实断言

`:56,:65,:73,:99` 返回 `'enabled-model'`；`:77-80` `toMatchObject({channelId, models:[{id:'enabled-model',...}]})`；`:89` `toThrow('模型不属于当前渠道或未启用')`。

## 4. 未覆盖与脆弱点

未覆盖：渠道不存在/未启用/未开放 runtime 三分支文案无独立断言；`modelId==null` 跳过分支。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 6 用例/断言/夹具 | 已证实 | 全 101 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 6 用例 | §2/§3 | 50-100 | covered |
