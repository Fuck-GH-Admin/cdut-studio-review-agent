---
path: packages/shared/src/utils/channel-plan-quota.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 66e8d636309f895412e7c98823f16ffc0c952a0b
sha256: 6ce61b113b2b9021ee4dec8e9f09d2f874c64f32dc22f98e036373b91d5a16dd
lines: 13
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/shared/src/utils/channel-plan-quota.ts

## 1. 结论与边界

「渠道是否有可查询的**窗口型订阅额度**官方接口」的判定表（13 行薄模块）：1 常量 + 1 函数。注释明示（`packages/shared/src/utils/channel-plan-quota.ts:3`）：普通 zhipu API **不等同于** GLM Coding Plan——故 `zhipu-coding` 在列而 `zhipu` 不在。

边界：只答「支持查询」，不查额度本身（查询实现不在本文件）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `supportsProviderPlanQuota` | function | 11-13 | `(provider: ProviderType) => boolean` | 唯一导出 |

内部：`PLAN_QUOTA_PROVIDERS`（`:4-9`，Set：`deepseek/kimi-coding/minimax/zhipu-coding` 四项）。

## 3. 内部逻辑与关键流程

本文件不适用（单行 Set 查询）——依据：函数体仅 `PLAN_QUOTA_PROVIDERS.has(provider)`。

## 4. 调用者与调用链

出向：类型 `../types/channel`（ProviderType，`:1`）。入向（检索=符号名+模块名，全冻结树）：`apps/electron/src/main/lib/channel-manager.ts:26,1495`（**唯一产品调用**，main）；barrel `packages/shared/src/utils/index.ts:54`。同名碰撞警示：`apps/electron/src/renderer/lib/channel-plan-quota.ts` 是**另一个同名模块**（导出 `supportsChannelPlanQuota`，被 renderer 本地引用），与本共享版无关。测试 `channel-plan-quota.test.ts` 本批。

## 5. 数据 I/O、读写与副作用

本文件不适用——依据：常量+纯函数。

## 6. 分支、失败、取消与恢复

本文件不适用——依据：无分支/异常。

## 7. 权限与权威状态

本文件不适用——依据：无权限代码。

## 8. 修改影响面

改名单 → 影响订阅额度查询入口的启用面（见 §10 caller）与本批测试断言。

## 9. 测试证据

直接测试 `packages/shared/src/utils/channel-plan-quota.test.ts`（12 行，1 用例；断言见该篇）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 四 provider 名单 | 已证实 | `:4-9` |
| zhipu ≠ zhipu-coding 语义 | 已证实（注释+名单） | `:3` |
| 生产 caller | 见 §10 补记（子 agent 调查+本会话复核后入 UNVERIFIED） | — |
| 测试通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `supportsProviderPlanQuota` | §2 | 11-13 | covered |
| `PLAN_QUOTA_PROVIDERS` | §2 | 4-9 | covered |
