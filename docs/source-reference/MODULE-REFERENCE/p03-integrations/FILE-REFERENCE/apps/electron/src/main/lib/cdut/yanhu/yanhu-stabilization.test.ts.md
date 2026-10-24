---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-stabilization.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 99ded4ce3a219f1af43040b5cb4e7fedfd5f601c
sha256: 277ab4811fa9cc56f4822edd93de517b3dd1bf38fb347d2d60729c860f62f8e1
lines: 358
kind: test
package: p03-integrations
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-stabilization.test.ts

## 1. 测试目标

直接测试 `yanhu-stabilization.ts` 三基元（`:4-8` 头注释）：双平面静止、坐标递归投影、两阶梯分派状态机（因果命中/No-Op 升级/终端失败/新标签接管/同步捷径）、排空脚本与归一化契约。16 个 `test(`，4 个 describe（`:99`/`:144`/`:164`/`:184`）。伪时钟+假 Probe/Adapter 测试替身（`:27-95`），无 Electron。

## 2. 用例清单

替身：`createFakeClock:30-37`、`createFakeProbe:40-56`（drain 模拟 minMs 阻塞）、`TEST_RECORD:58-64`（bid 172 课程成绩查询）、`NO_EDGE:66-72`（evidence 文本"观察窗 2000ms 内零因果边"——M1 历史表述）、`QUIESCENT:74-82`、`createFakeAdapter:85-95`。

| # | 行 | 被测 | 真实断言 |
| --- | --- | --- | --- |
| 1 | `:100-107` | Watcher 静止结算 | settled true/timedOut false/inflight 0/elapsedMs ≥500 |
| 2 | `:110-120` | 在途不清零不结算 | inflightCalls ≥2 后才 settled |
| 3 | `:123-130` | 突变刷新计时 | mutations 1、elapsedMs ≥1000 |
| 4 | `:133-138` | 硬超时 | settled false/timedOut true |
| 5 | `:145-153` | 坐标投影 | `toEqual({x:155,y:123})`（手工复核 50-5+10+100 ✓） |
| 6 | `:156-158` | 空链原点/DPR | `{x:10,y:21}`（取整）/dpr 2 → `{x:20,y:40}` |
| 7 | `:165-170` | 排空脚本 | `toContain` MessageChannel/requestIdleCallback/MutationObserver/'FIRST = true' |
| 8 | `:173-178` | 归一化降级 | null→全 0 settled true；正常对象 mutated/mutations/frames 保留 |
| 9 | `:185-206` | 合成命中不升级 | outcome 'verified-success'/escalated false/hardwareCalls 0/evidence 含文本/quiescence.settled true |
| 10 | `:209-234` | No-Op 升级二次探测 | 'escalated-success'/escalated true/hardware 1/observations 2/'第二阶梯' |
| 11 | `:237-243` | 两阶梯全败 | 'terminal-failed'/quiescence toBeNull/evidence 含'零因果边'（M11 文本耦合） |
| 12 | `:246-266` | 新标签接管 | activeTabId 'tab-new-opened'/waitedTabId 同/newTab true |
| 13 | `:269-282` | 双派发失败不做二次探测 | method '定位失败'/observations 1 |
| 14 | `:285-305` | 同步突变捷径 | observations **0**/hardware 0/evidence 含'同步捕获 3 处 DOM 突变' |
| 15 | `:308-328` | 状态同步变更防反切 | observations 0/hardware 0/'控件状态同步变更' |
| 16 | `:331-356` | 同步捷径下新标签补漏 | newTab true/接管 tab-new-opened/'新标签页创建' |

## 3. 真实断言

`toBe`/`toEqual`/`toBeGreaterThanOrEqual`/`toBeNull`/`toContain`（evidence 文本）。无快照测试。

## 4. 未覆盖（子agent U1-U7 摘要）

DeadlockGuard 全零覆盖；排空脚本仅 4 字符串断言（行为未执行）；normalize 钳制路径、Watcher 缺省参数/降级分支、投影 dpr≤0/多层、dispatcher 异常路径/waitForNavigation/M14 组合均未断言。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 个 `test(`、断言如 §2 | 已证实 | 文件全读（子agent）+抽查坐标复核 |
| M11 文本耦合（'零因果边'断言依赖常量文案） | 已证实 | `:243` |
| 实际执行结果 | 未知 | `NOT_RUN` |

## 6. 覆盖表

| 被测行为 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 双平面静止 | §2 用例 1-4 | `:100-138` | covered |
| 坐标投影 | §2 用例 5/6 | `:145-158` | covered |
| 排空/归一 | §2 用例 7/8 | `:165-178` | covered |
| 分派状态机 | §2 用例 9-16 | `:185-356` | covered |
| §4 边缘/DeadlockGuard | — | — | unknown |
