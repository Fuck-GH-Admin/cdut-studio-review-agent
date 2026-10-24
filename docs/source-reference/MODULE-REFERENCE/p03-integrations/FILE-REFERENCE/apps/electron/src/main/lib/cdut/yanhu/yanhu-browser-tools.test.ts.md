---
path: apps/electron/src/main/lib/cdut/yanhu/yanhu-browser-tools.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d98904a9faf0fc7ffa605affbde199a7ae9daa3a
sha256: f1d213e2e96df530cef5551b273bb3a26cbffe33c56a197003af371bb5528f8e
lines: 2572
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cdut/yanhu/yanhu-browser-tools.test.ts

## 1. 测试目标

智联万站·专属门禁工具集单元测试（头注释 `apps/electron/src/main/lib/cdut/yanhu/yanhu-browser-tools.test.ts:1-6`，含 BOM）：门禁工具集装配、微胶囊标签、嵌套框架防扯脱守卫、Token 预算截断、拟人节流、指纹防重复读屏、熔断器、危险操作硬拦截、BUG-1~47 回归群。被测符号主要来自 `./yanhu-browser-tools`（`:11-31` 19 个符号）+ `./yanhu-dom-distillation`（`:32-37`）+ `./yanhu-stabilization`（`:38-42`）+ `./yanhu-context-pruning`（`:43`）+ `./yanhu-express-manager`（`:44`）+ `./yanhu-constants`（`:45`）——**被测文件均不在本批**（跨文件归属登记）。

mock 边界：`stubYanhuCausalityEdge()`（`:54-77`）桩定 `yanhuExpressManager.probeCrossFrameActivity/awaitStable`；各测试内联打桩 `getTabMeta/evalInPage/getFullAXTree` 并 **finally 手工恢复**（无 beforeEach/afterEach）；`evalInPage` 按 `expr === buildYanhuCollectorScript()` 子串路由；真实编排层（工具集/节流/熔断/蒸馏引擎）不 mock。

## 2. 用例清单

22 describe、**80 个 test( 调用点**（grep 与逐行双源一致；`it(`=0）：

- `:79` 门禁工具集与防扯脱守卫（4）：`:80` 装配 14 项工具+开发者级恰 4 项、`:110` 微胶囊标签、`:122` navigate 多层框架平滑承接（xsMainV→mainFrame）、`:155` 无 mainFrame 拦截指引。
- `:187` 网络日志净化（3）：`:188` 过滤 data/图片/脚本/favicon、`:211` 1000 字符硬熔断、`:224` 空/全静态提示。
- `:234` 开发者级暴露契约（1）`:235`（14=4+10）。
- `:243` Token 预算硬截断（3）：`:244` read_page 2500 token、`:275` eval_script 500 字符、`:289` inspect_element 600 字符。
- `:324` 拟人化节流（2）：`:325` 常量 500ms、`:329` 首快次强制间隔。
- `:344` 页面指纹防重复读屏（1）`:345`。
- `:389` 短路熔断器（2）：`:390` 两空读触发熔断、`:435` 有效动作解除。
- `:477` 熔断错误重置（1）`:478`（根除有错无解死锁）。
- `:523` 危险操作硬拦截+BID 回退（3）：`:529` 安全退出硬拦截、`:561` markDirty 后历史回退、`:602` forceRefresh 废弃契约。
- `:611` 深度审计修复回归 BUG-1~23（覆盖至 `:1227`，test 起点 `:626`…`:1183`）：BUG-1（eval_script undefined 不抛）、参数别名容错（`:640`，script/code/js≡expression）、BUG-2（熔断自释放）、BUG-3（校内域前置裁决拒 evil.com）、BUG-14（tab 幽灵标签明确错误）、BUG-15（limit=0 回落 30）、BUG-16（无变化全量控件索引含 [BID:12]）、BUG-17（未知 BID 台账）、BUG-18（pressEnter 默认禁表单提交）、BUG-19（合成回车仅 KeyboardEvent）、BUG-20/20b/20c（自定义下拉点选三分支）、BUG-21（非输入框 fill 零写入）、BUG-22/22b（内容指纹重复点击拦截/不误拦）、BUG-23（同 URL 标签去重）。
- `:1229` 白屏根除回归（BUG-24~26）：BUG-24（reload 票据剥离净化，`:1230`）、BUG-24b（无票据常规刷新对照，`:1273`）。
- `:1397` 2026 SOTA 范式回归（BUG-31~36）：语义命名/剪枝/DeadlockGuard 乒乓振荡/状态归一/CI4A 单选不回落/上下文剪枝 <30%。
- `:1616` 选中失败根治（BUG-37~43）：事件级联/鼠标流渗透/选项选择器/延迟渲染探针/超时回执/jqx API/箭头渗透/浮层判定。
- `:1780` 日期时间选择器回归：仅 BUG-47（常量 300/150ms）——**标题宣称 BUG-44~47/49~50 但无对应测试**（`:1788-1797` 空行疑似删测痕迹，如实登记）。
- `:1800` 复杂布局加固（5）：吸顶绕过/contenteditable 不覆写 textContent/fill 事件链+原型 setter/OOPIF 容错/8 脚本 V8 可编译。
- `:2026` buildUnchangedNotice（1）、`:2069` buildPickCustomOptionScript（4，含虚假成功回归 options=['吉林省','贵州省']）、`:2182` 只读控件 __unseal 通道（1）、`:2258` 选中后校验（2，显示未变如实报错/升级 CDP 硬件点击恰 1 次）、`:2392` EMAP 树形极速通道（2）、`:2484` 入参净化（5）、`:2516` BID 自愈重定位（2，无同名返 null 不盲猜）。

## 3. 真实断言（锚定）

`:82` tools 长度 14、`:89` 不含 yanhu_set_date、`:102-107` 开发者级恰 4 项、`:114` 标签文案、`:146-148` 平滑承接、`:176-178` 拦截提示、`:220-221` ≤1050+截断提示、`:326` 常量 500、`:375-381` 无变化短路带 [BID:1]、`:426-428` 熔断拦截、`:553-554` 安全拦截、`:606-607` forceRefresh undefined、`:683-684`/`:715`/`:788`/`:814-816`/`:872`/`:886`/`:944-945`/`:1087`/`:1128-1129`/`:1218`/`:1261-1263`（BUG-2~24b 组）、`:1354/:1378/:1385-1388/:1458/:1496/:1519-1521/:1577/:1612/:1729/:1744/:1793-1794/:1870/:1938/:2170-2172/:2373/:2554/:2570`（BUG-31~47 及后段组）。

## 4. 未覆盖与脆弱点

- 测试缺口：BUG-44/45/46/48/49/50、BUG-27~30 无对应测试（`:1780-1798` 标题与内容不符；前半亦无）。
- 字符串契约脆弱：大量 `toContain` 匹配生成脚本文本，模板措辞变动即碎；`:1986` 仅验可编译不验语义。
- mock 按 expr 子串路由，标识串变动静默走错分支；全打桩无真实浏览器/CDP 端到端。
- flaky 风险：`:1732-1744` 真实定时器+Date.now 差值；`yanhuDomDistillationEngine` 全局单例共享（`:2536/:2558` 用 tabId 规避串扰）。
- 假 DOM（runCollector `:1399-1417`）不验 iframe/shadow 真实执行。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 80 test/22 describe 清单与锚点 | 已证实 | 三段逐行（1-650/650-1300/1301-2572）+grep 双源一致 |
| 被测模块跨文件归属 | 已证实 | `:11-45` import |
| BUG-44~50 覆盖情况 | 未知 | 本文件无（前半已核） |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 装配/标签/守卫/截断/节流/熔断/拦截 | §2/§3 | 79-607 | covered |
| BUG-1~47 回归群 | §2/§3 | 611-2570 | covered |
| BUG-44~50 | §4 | — | unknown（无测试） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
