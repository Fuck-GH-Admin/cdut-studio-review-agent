---
path: apps/electron/src/renderer/components/welcome/BeijingAnalogClock.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f1e7c8042bbd72d1d0704b9e41ac15291bab1f1f
sha256: 137642b044d03fee455b81a59b3067fbed2f626eb0621cf432b94ac7c01d177f
lines: 203
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/welcome/BeijingAnalogClock.tsx

## 1. 结论与边界

**立体拟物表盘**（203 行 SVG）：恒为 Asia/Shanghai 时刻；旋转角=「挂载锚点+真实时间差」纯推导——**严禁浮点取模累加**（头注释 `:4-8`：历史 Bug=0.1°/0.0083° 增量浮点误差→取模 359.999°→整圈跳闪）；休眠唤醒/时间回拨必须重锚瞬时归位。

## 2. 导出与关键符号

1 导出：`BeijingAnalogClock`（`:47`，props `now:Date` 父级 1s 定时器驱动）。常量：`TICK_INDEXES` 12（`:26`）、`HAND_SHADOW_OFFSET`（`:29`）、`SECOND_HAND_COLOR` 朱砂红（`:32`，不随主题漂移）、`REBASE_GAP_MS=1500`（`:35`）。内部 `handStyle`（`:38`，viewBox 中心轴）。

## 3. 内部逻辑与关键流程

- 重锚判定（`:54-56`）：`shouldRebaseClockAnchor(lastNow, now, 1500)`→临时新锚点算角度；**锚点 setState 收敛到 effect 不在渲染期派发**（`:52-53` 注释）；effect 复用渲染期 effectiveAnchor 引用防微秒偏差（`:60-61`）。
- 过渡（`:64-71`）：秒针 150ms 机械跳动（无过冲防回弹判跳闪）/分时针 300ms；重锚帧禁过渡瞬时归位。
- 渲染：外壳/盘面双渐变（uid 隔离多实例 `:73-74`）、12 刻度（3/6/9/12 主刻度条）、三针+投影、轴心金属盖；全主题 token（`hsl(var(--card))` 等）。

## 4. 调用者与调用链

- 入向：`WelcomeEmptyState.tsx:33`（本批）。
- 出向：`@/lib/beijing-greeting`（createBeijingClockAnchor/getBeijingClockAngles/resolveBeijingClockRotations/shouldRebaseClockAnchor）。

## 5. 数据 I/O、读写与副作用

无（纯渲染；props.now 驱动）。

## 6. 分支、失败、取消与恢复

重锚/常态双分支（§3）；卸载 effect 清理（setState 防泄漏）。

## 7. 权限与权威状态

时区权威=Asia/Shanghai 固定（注释 `:4`）；角度权威=锚点推导（防历史跳闪 Bug）。

## 8. 修改影响面

欢迎页时钟；若改角度计算方式会回归历史跳闪 Bug（注释锁定）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无该文件测试）；角度函数在 beijing-greeting（域外）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 重锚语义/过渡矩阵/角度来源 | 已证实 | `:1-203` 全文 |
| 历史 Bug 复现细节 | 推断（头注释记录） | `:5-8` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+常量+SVG 渲染 | §2/§3 | 26-203 | covered |
