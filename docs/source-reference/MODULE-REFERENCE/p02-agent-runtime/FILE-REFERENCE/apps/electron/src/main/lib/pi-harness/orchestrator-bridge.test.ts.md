---
path: apps/electron/src/main/lib/pi-harness/orchestrator-bridge.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8cc0058516c64cbd514de83704f77fb80e8cf913
sha256: f010ad68a3b256a7ebc1c488b931e82b90cf4ed4afd2e39297088666896393ab
lines: 264
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-harness/orchestrator-bridge.test.ts

## 1. 测试目标

`orchestrator-bridge.ts` 主链：Goal/Turn 生命周期、focus packet、marker 归因、retry/compaction 同 Turn、stop/failed、用量防双计、手动继续票据三态。bun:test；临时 PROFER_CONFIG_DIR+真实 store/graph-service（`:21-25`），无 mock 库；`afterEach` 清理（`:33-38`）。

## 2. 用例清单

共 **13 个 `test(`**（机械核）：

| 行 | 用例要点 |
| --- | --- |
| `:41` | 单 Goal+单 Turn+packet 前缀+root 仅一次（`rootTaskId===activeTaskId`、零迁移） |
| `:57` | marker 声明→同 Turn 事实归因 verified+单 Turn+零迁移 |
| `:77` | `/compact` 零 Goal/Turn/scope |
| `:88` | retry+compaction 同 Turn 用量合账（modelCalls 1/retries 1/compactions 1/usage tokens） |
| `:109` | stop→goal paused+turn interrupted('user_stop')+单 Turn |
| `:121` | failed 如实落 failed、goal 保持 active |
| `:132` | Stop 压掉 agent_end→工具轮记 1 model call |
| `:146` | 推断后 lifecycle 确认不双计 |
| `:157` | 已有图不建第二 root（activeTaskId 继承） |
| `:172` | Write/Read/Bash 事实→verified+3 facts+单 Turn+零迁移 |
| `:195` | 仅用户选中 ready_task 候选续跑（票据三态：重复继续拒/会话处理中拒/结束后“不是可继续”） |
| `:227` | 陈旧票据拒（“候选任务已失效”）且零 Turn 写入 |
| `:249` | 非就绪/伪造候选拒（“不是可继续”）且账本零改动 |

## 3. 真实断言

代表：`:47-54`（packet 含 `<graph_focus>`/`用户原始请求`、goals/turns 各 1、`taskTransitions` `toBe(0)`）；`:72-74`（verified+零迁移+单 Turn）；`:103-106`（usage 合账 toMatchObject+单 Turn+scope 释放）；`:139-143`（interrupted+modelCalls:1）；`:210-224`（`ready:follow` 指纹入手动表+三态 toThrow 文案）；`:246,261`（零 Turn/`manuallyContinuedCandidateFingerprints` `toEqual([])`）。

## 4. 未覆盖与脆弱点

`harness_setup_failed` 兜底路径无断言；真实 Pi 生命周期流为合成事件。断言≠已运行：**NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例/断言/票据三态 | 已证实 | 全 264 行 |
| 测试通过状态 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 13 用例 | §2/§3 | 41-263 | covered |
