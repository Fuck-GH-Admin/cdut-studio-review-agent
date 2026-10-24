---
path: apps/electron/src/renderer/components/settings/ModelAvailabilityBar.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4ee60dfc45a1a0014c82b58b68f153ab096549ad
sha256: 91f944c3f4ced17ab57f53fe828a4fde4d8f57723e56245f9d6a343dfd23309c
lines: 39
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-05-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/settings/ModelAvailabilityBar.tsx

## 1. 结论与边界

模型**可用率条**（39 行纯展示组件）：固定长度时间桶（默认 32）+ 可用率百分比色阶。纯渲染无副作用。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `ModelAvailabilityBar` | 组件 | `:18` | `({model, compact=false, samples?})` |
| `statusColor`（内部） | 函数 | `:12` | failure→红/degraded→琥珀/其余→青柠 |

Props：`compact`（隐藏重复标题+紧凑柱，`:6-8`）、`samples`（聚合桶，空桶灰 `:9`）。

## 3. 内部逻辑与关键流程

（`:19-37`）：tone 三段色阶——null→muted、≥90 青柠、≥70 琥珀、<70 红（`:20`）；samples 缺省=原样或 32 个 null（`:21`）；布局 grid 两/三列（compact 与否，`:24`）；tooltip/aria-label 语义一致（`:24,26`）。

## 4. 调用者与调用链

- 入向：`ChannelSettings.tsx:32`（官方渠道健康展开行 `:499`，本批）。
- 出向：`@profer/shared`（ModelAvailability 类型）。

## 5. 数据 I/O、读写与副作用

无（纯渲染）。

## 6. 分支、失败、取消与恢复

compact/空数据双分支；无抛错。

## 7. 权限与权威状态

无权限分支，依据：纯展示。

## 8. 修改影响面

渠道健康展示面：上游唯一挂载点=ChannelSettings 官方渠道卡展开行（本批 `:497-500`）；修改本文件（色阶阈值 90/70、compact 布局、32 桶缺省）直接改变渠道页健康观感；回归面=官方卡展开渲染与聚合健康数据形状（`ModelAvailability.samples`）。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 色阶阈值/32 桶缺省/compact 行为 | 已证实 | `:1-39` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 1 导出+内部 | §2/§3 | 12-37 | covered |
