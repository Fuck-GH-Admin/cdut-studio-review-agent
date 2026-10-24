---
path: apps/electron/src/renderer/atoms/ui-scale.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d77b5a369f53c44b7124f3b034dab4f964112aab
sha256: ed0d72aae87bb0ba345d22888a93d530fda2028092235233007740c20dc853f4
lines: 107
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/atoms/ui-scale.ts

## 1. 结论与边界

**界面缩放状态原子**（`apps/electron/src/renderer/atoms/ui-scale.ts:1-15`）：六档（100%…200%），缩放实现为**传统网页等比缩放**——`<UiScaleContainer>` 把内容整体 `transform: scale(s)`（px/rem 一起放大无畸变），容器宽高反补偿 `(100/s)%` 占满视口不溢出。**⚠️ 不要改回 documentElement 级缩放**（zoom 布局一起放大打破视口约束、根 font-size 固定 px 不跟随畸变，`:9-11`）；transform:scale+反补偿是**同时满足等比+区域保持的唯一正解**（`:12`）。桌面与移动端共用（`:14`）：桌面 localStorage 缓存（同步防闪烁）+settings.json 持久化（权威）。

## 2. 导出与关键符号

`export` 共 **5 个**（按真实行号）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `UI_SCALE_VALUES` | const | `:24` | — |
| `UI_SCALE_OPTIONS` | const | `:34` | — |
| `uiScaleAtom` | const | `:73` | — |
| `updateUiScale` | async | `:79` | — |
| `initializeUiScale` | async | `:94` | — |

## 3. 内部逻辑与关键流程

六档缩放；`transform:scale`+反补偿（`:4-7`）；桌面双层持久化（localStorage 同步+settings.json 权威，`:14-15`）。

## 4. 调用者与调用链

- 消费方：`<UiScaleContainer>`。
- 出向：localStorage/settings IPC。

## 5. 数据 I/O、读写与副作用

纯内存状态（或经注明的持久化）；无 I/O。

## 6. 分支、失败、取消与恢复

N/A（纯状态 atom，无分支逻辑）。

## 7. 权限与权威状态

**「唯一正解」注释（`:12`）是实现契约**（勿改 zoom/rem——用户反馈明确）；settings.json 是权威持久化（`:15`）。

## 8. 修改影响面

- 缩放实现方案（`:9-12` 警告）。
- 桌面/移动双端持久化协议。

## 9. 测试证据

无专属测试。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

缩放契约已证实（`:1-15`）；测试实际通过未知（无测试）。

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 缩放契约 | `:1-15` | covered |
| 原子集 | 全文 | covered |
