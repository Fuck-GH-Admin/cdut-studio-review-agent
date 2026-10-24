---
path: apps/electron/src/main/lib/pi-task-prompt.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 111a4c8468bd9f7a9b78382172e956722f3e5a5b
sha256: 5fba8fd8bbb87b9748270af40b8bb3ca39228701c693bea3c4de6584683c3763
lines: 293
kind: test
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-task-prompt.test.ts

## 1. 测试目标

验证 `buildPiTaskPrompt`（`pi-task-prompt.ts`）的静态化裁剪契约：①低频 SOP 只按工具挂载/能力开关保留；②同会话输出字节级稳定（前缀缓存友好）；③裁剪只做原位删除、XML 拓扑与近因提醒位置不变；④回归保护：8/9/10 条动态生成缺席时裁剪链不失效。不运行测试，只读断言（NOT_RUN）。

## 2. 用例清单

用例数与源码一致：`test(` 13 个（`describe` 1 个；`it(` 0 个）。夹具：`BASE_PROMPT` 字面量（`:4-44`，含各 SOP 段与标记 token）、`ALL_TOOLS` 12 工具名（`:46-59`）。

| # | 用例 | 行 | 设置/动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | Tier 0（无产品工具）只保留核心规则与常驻知识治理 | 62-81 | tools=[] | 含 CORE/UNCERTAINTY/DELIVERY/KNOWLEDGE，不含 8 类 SOP |
| 2 | 第 8 条缺失时定时任务 SOP 仍被裁剪（回归） | 84-109 | 自定义 prompt 缺第 8 条；tools=generate_image/create_skin/BrowserObserve | 无 AUTOMATION，有 IMAGE/SKIN/BROWSER |
| 3 | 图像能力全缺席仅剩关闭标签时第 7 条被裁且标签完整 | 111-126 | minimal prompt；tools=[] | 无 AUTOMATION，含 `</guidelines>` |
| 4 | 输出只随工具集合变化（前缀缓存） | 130-134 | 同 tools 不同 userMessage | `expect(b).toBe(a)` |
| 5 | 挂载对应工具时恢复各自低频 SOP | 136-145 | ALL_TOOLS | 含 7 类 SOP |
| 6 | 仅浏览器工具时只恢复浏览器 SOP | 147-155 | tools=[BrowserObserve] | 仅 BROWSER+KNOWLEDGE |
| 7 | 裁剪浏览器 SOP 不吞后续段落 | 157-179 | 扩展 prompt 含嵌套/禁用/常驻段 | 保留 DISABLED/ALWAYS_PRESENT；两种 tools 分别验证 |
| 8 | PPT 未激活不恢复 PPT SOP | 181-189 | 2 个 PPT 工具名但 `pptCapabilityActive:false` | 无 PPT_VISUAL_GATE |
| 9 | PPT 激活且四工具齐备恢复 PPT SOP | 191-199 | 4 工具 + active:true | 含 PPT_VISUAL_GATE |
| 10 | 图片/皮肤/发送工具恢复交付 SOP | 201-206 | 逐工具单测 4 个内联 expect | generate/create_skin→IMAGE；send_local_image→LOCAL_IMAGE；空→无 |
| 11 | forceAutomation 强制保留 automation SOP | 208-216 | tools=[] + forceAutomation:true | 含 AUTOMATION_RULES |
| 12 | 无工具时不注入暗示存在工具的 SOP | 218-230 | tools=[] | 无 BROWSER/AUTOMATION/COLLABORATION，含 KNOWLEDGE |
| 13 | 裁剪不搬移段落，XML 拓扑与近因提醒位置不变（回归） | 234-292 | TAGGED_PROMPT（带 `<subagents>`/`<guidelines>`）+ ALL_TOOLS + PPT active | 标签计数各 1；段落位于父标签内；近因提醒恒为最后 |

## 3. 真实断言

抽核（`expect` 行号）：`:69-80`（8 组 contains/not.toContain）；`:105-108`；`:124-125`；`:133` `expect(b).toBe(a)`；`:138-144`；`:149-154`；`:170-178`；`:188`；`:198`；`:202-205`（4 个内联 `buildPiTaskPrompt(...).toContain/not.toContain`）；`:215`；`:225-229`；`:280-283`（`count(prompt,'<subagents>')===1` 等 4 项）；`:286-288`（`indexOf` 次序断言）；`:291`（`prompt.trimEnd().endsWith('> **CRITICAL EXECUTION REMINDER**: …')` 为 true）。

## 4. 未覆盖与脆弱点

- 未覆盖：`removeSection` 多 endMarker 全缺失路径、真实 `buildSystemPrompt` 文档形态（夹具是字面量）、`userMessage` 兼容字段、输出 `.trim()` 前后空白边界。
- 脆弱点：夹具 token（AUTOMATION_RULES 等）与真实 prompt 文案解耦——真实文案改名不会被本测试发现；用例 2/3 是对历史回归（裁剪链静默失效）的定点防护。
- mock 边界：无 mock；纯函数直测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 13 用例与断言行号 | 已证实 | `:62-292` 逐行读 |
| 用例 4 字节稳定断言 | 已证实 | `:133` |
| 用例 13 拓扑守恒断言 | 已证实 | `:279-291` |
| 无 mock/纯函数直测 | 已证实 | 全文读 |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行） |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 六段裁剪条件 | 1,2,3,5,6,8,9,10,11,12 | covered |
| 字节稳定 | 4 | covered |
| 原位删除/XML 拓扑 | 7,13 | covered |
| marker 全缺失保守保留 | - | unknown（未覆盖） |
| 真实 prompt 形态 | - | unknown（夹具字面量） |
