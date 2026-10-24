---
path: apps/electron/src/main/lib/codex-plan-quota.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e839e9702f909a38e0ca026804a0c47533c0a1dc
sha256: e7c6f49c7f4843d01042f3d9a0e89339ee2af57100f361aa795a0bfbd9770abe
lines: 109
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/codex-plan-quota.ts

## 1. 结论与边界

**ChatGPT Codex `GET /backend-api/wham/usage` → 统一订阅 Plan 额度格式转换**（`codex-plan-quota.ts:78-83` 注释）：OpenAI 返回 primary/secondary 两滚动窗口（通常 5 小时/每周），**按实际 duration 映射以兼容未来套餐窗口变更**（`:82`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `parseCodexPlanQuotaResponse` | function（export） | `:84-109` | `(data: unknown) => ChannelPlanQuotaResult` |

内部：`CodexUsageWindow/Response`（`:3-16`，全 unknown 字段防御式）、`asFiniteNumber`（`:18-22`）、`clampPercent`（0-100 取整 `:24-26`）、`toTimestamp`（秒/毫秒自判 `<10_000_000_000` 乘 1000，`:28-32`）、`formatWindow`（`:34-53`）、`parseWindow`（`:55-70`）、`formatPlanName`（`:72-76`）。

## 3. 内部逻辑与关键流程

1. `formatWindow`（`:34-53`）：**只给已知精确窗口专用标签**（5h=18000s `:37`、weekly=604800s `:40`），其他按实际时长 custom（整数天→"每 N 天" `:43-45`、整点小时→"每 N 小时"（4.5 小时会落此支，`:46-48`）、整分钟、兜底"用量额度" `:52`）——注释红线：避免把 4.5 小时/6 天误显示为 5 小时/每周（`:35-36`）。
2. `parseWindow`（`:55-70`）：缺 used/duration → null；resetAt 优先 `reset_at`（toTimestamp）否则 `reset_after_seconds` 推导（`:62-63`）；used/remaining 均 clamp。
3. 主函数（`:84-109`）：两窗口解析过滤；**空 → `supported:false` + 可展示 message**（'ChatGPT 未返回 Codex 订阅额度数据' `:92-100`）；否则 `supported:true` + `formatPlanName`（默认 'ChatGPT 订阅 (Codex)'、plan_type 标题化 `:72-76`）。

## 4. 调用者与调用链

入向：Codex OAuth 订阅额度展示链（跨文件，与 codex-oauth-service 同域）；测试 `codex-plan-quota.test.ts`（同批 5 用例）。出向：`@profer/shared` 类型（`ChannelPlanQuotaResult/Window` `:1`）。

## 5. 数据 I/O、读写与副作用

纯函数；`updatedAt/resetAt` 用 `Date.now()`（时间基准副作用，测试用区间断言）。

## 6. 分支、失败、取消与恢复

缺失/损坏响应 → 可展示失败原因（不抛错）；window 缺字段 → null 过滤。不适用取消/恢复。

## 7. 权限与权威状态

不适用（解析转换）；准确性红线=不误标窗口类型（`:35-36`）。

## 8. 修改影响面

改映射 → 订阅额度 UI 展示；5 用例锁定（含 4.5 小时/6 天不误标）。

## 9. 测试证据

**直接测试 `codex-plan-quota.test.ts`（5 用例，NOT_RUN）**：5h+weekly 映射、custom 保留、4.5h/6d 不误标、reset_after_seconds 推导、损坏响应 message——断言见测试手册。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出+6 内部+全分支 | 已证实 | 逐行读 `:1-109` |
| 测试 5 用例断言 | 已证实 | 测试 `:1-84`；NOT_RUN |
| 真实 API 响应形态 | 未知 | 未抓包 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 解析链 | §2/§3 | `:18-109` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
