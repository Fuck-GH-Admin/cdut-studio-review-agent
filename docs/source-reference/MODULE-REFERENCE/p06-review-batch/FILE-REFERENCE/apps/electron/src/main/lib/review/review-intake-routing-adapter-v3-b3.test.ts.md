---
path: apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d1d2b994d22c4da48b7703f30f30bf09d5d58690
sha256: 8f6f1714040d49630e83f3816a28c4fc54c507840404de96d2de003c7b98899a
lines: 65
kind: test
package: p06-review-batch
author: docs-r07-author-nb-01-20261023
reviewer: p07-shared-libs
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts

## 1. 测试目标

验证 B3 保守路由在多文件拖入场景下的 5 条核心判定：同组多份申请件可倒计时、倒计时结束默认选中、跨主体必须人工确认、无申请件必须人工确认、多个建议必须人工选择（文件头 `apps/electron/src/main/lib/review/review-intake-routing-adapter-v3-b3.test.ts:1-4`）。只调用纯函数 `planB3ConservativeRouting`，不涉及会话类、暂存服务或 IPC。

`NOT_RUN`：本轮未执行 Bun 测试、typecheck、构建、GUI 或真实模型请求；本手册只记录静态读到的断言，不表示测试通过。

## 2. 用例清单

共 5 个 `test(`。夹具：`sha='a'.repeat(64)`（`:9`）；`material(id,patch)` 生成 `accepted`/`application`/`subjectId='case-scope-case-1'`/`ownerId='local-reviewer'`/`ownerGeneration=1` 的材料（`:10-16`）；`suggestion(materials)` 生成 `g03-t01@1`、`availability='authorized-for-technical-selection'`、`confidence:1`、证据覆盖全部材料的建议（`:18-25`）；`base(materials)` 固定 `startedAtMs:0, nowMs:1000, automaticSelectionEnabled:true, userInterrupted:false`（`:27-30`）。

| # | 用例（行） | 设置 | 动作 | 断言 | 依赖 |
| --- | --- | --- | --- | --- | --- |
| 1 | 主表+附件都是申请件，同属本案路由组时进入倒计时（`:33-38`） | 两份材料：`form`、`attachment`，同 subject | `planB3ConservativeRouting(base(materials))` | `status='countdown'`；`remainingMs=19000` | 建议证据覆盖两份材料 |
| 2 | 倒计时结束后默认选中（`:40-45`） | 同上，`nowMs:20000` | 同上 | `status='default-selected'`；`chosen={templateId:'g03-t01',templateVersion:'1'}` | `remainingMs=0` |
| 3 | 多份材料指向不同主体仍然必须人工确认（`:47-51`） | 第二份 `subjectId:'student-2'` | 同上 | `status='needs-user-confirmation'` | 主体集合不唯一 |
| 4 | 没有申请件时不能自动路由（`:53-57`） | 唯一材料 `role:'supporting'` | 同上 | `status='needs-user-confirmation'` | 无 application |
| 5 | 两个不同建议仍然必须人工选择（`:59-64`） | 两份建议：`g03-t01` 与 `g06-t01`，材料一份 | 同上 | `status='needs-user-confirmation'` | 建议集合不唯一 |

## 3. 真实断言

- 用例 1：`expect(route.status).toBe('countdown')`（`:36`）；`expect(route.remainingMs).toBe(19_000)`（`:37`）。
- 用例 2：`expect(route.status).toBe('default-selected')`（`:43`）；`expect(route.chosen).toEqual({ templateId: 'g03-t01', templateVersion: '1' })`（`:44`）。
- 用例 3：`expect(route.status).toBe('needs-user-confirmation')`（`:50`）。
- 用例 4：`expect(route.status).toBe('needs-user-confirmation')`（`:56`）。
- 用例 5：`expect(route.status).toBe('needs-user-confirmation')`（`:63`）。

## 4. 未覆盖与脆弱点

未覆盖：

- 会话类 `ReviewB3OwnerBoundRouteSession` 的所有行为（构造、时钟、scope、完整暂存集、身份/字节复核、目录校验、降级、人工选择、中断粘性、指纹重置）。
- 纯函数的非法输入（`B3_ROUTING_INVALID`）、空/重复材料（`awaiting-evidence`）、无建议（`unmatched`）、人工选择（`manually-selected`/版本缺失）、`userInterrupted`、`automaticSelectionEnabled=false`。
- 证据不完整/重复/缺 reason/sha 不符；`confidence<0.95`；`availability` 非 authorized；`role='unassigned'`；`status!=='accepted'`；`subjectId` 为空；`rawSha256` 非 64 hex。
- 材料数 >2、同一模板多份材料命中、倒计时中间态（如 `remainingMs=1`）。

脆弱点：

- 用例 1 断言精确 `19000`，依赖 20 秒常量与 `now-started` 计算；改常量或改为 `<` 边界会失败。
- `base` 每次重新生成建议，证据与材料列表强绑定；若未来要求证据顺序或额外字段，helper 需同步。
- 用例 3 只改 `subjectId`，其它字段仍相同；若实现改为按 `materialId` 分组，该用例仍会失败（符合预期），但无法区分具体拒绝原因。
- 测试没有断言 `reason` 文本，因此“为什么人工确认”不受保护。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 5 个用例 | 已证实 | `grep test(` 计数；`:33,40,47,53,59` |
| 同组多申请件进入倒计时 | 已证实 | `:33-38` |
| 20 秒后默认选中 | 已证实 | `:40-45` |
| 跨主体拒绝自动 | 已证实 | `:47-51` |
| 无申请件拒绝自动 | 已证实 | `:53-57` |
| 多建议拒绝自动 | 已证实 | `:59-64` |
| 测试只覆盖纯函数，不覆盖会话类 | 已证实 | import 仅 `planB3ConservativeRouting`（`:7`） |
| 证据完整性/降级/目录授权未覆盖 | 已证实（本文件检索） | 无相关构造 |
| 测试不读写磁盘/不启动 Electron | 已证实 | 仅纯函数与类型导入（`:5-7`） |
| `material()` 的 `byteLength:10` 与真实字节无关 | 推断 | 纯函数只校验 sha 格式与相等，不读字节（`review-intake-routing-adapter-v3-b3.ts:69,97`） |

## 6. 覆盖表

| 行为/分支 | 用例 | 行 | 状态 |
| --- | --- | --- | --- |
| 同组多申请件 → countdown | 1 | 33-38 | covered |
| 倒计时结束 → default-selected | 2 | 40-45 | covered |
| 跨主体 → needs-user-confirmation | 3 | 47-51 | covered |
| 无申请件 → needs-user-confirmation | 4 | 53-57 | covered |
| 多建议 → needs-user-confirmation | 5 | 59-64 | covered |
| 非法输入/awaiting-evidence/unmatched | 无 | — | unknown |
| 人工选择/中断/自动关闭 | 无 | — | unknown |
| 证据/置信度/授权校验 | 无 | — | unknown |
| 会话类全部行为 | 无 | — | unknown |
