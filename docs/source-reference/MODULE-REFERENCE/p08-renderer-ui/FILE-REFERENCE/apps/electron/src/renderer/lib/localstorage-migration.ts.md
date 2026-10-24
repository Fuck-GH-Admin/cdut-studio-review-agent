---
path: apps/electron/src/renderer/lib/localstorage-migration.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6ba4557628ebfea75252ce1b27060219ed803415
sha256: 08eb9428707aff9ab67859dbdb02e22a647769fae45aa60a3af9c398ab292b9e
lines: 50
kind: source
package: p08-renderer-ui
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/lib/localstorage-migration.ts

## 1. 结论与边界

**localStorage key 迁移**（50 行）：`proma-*`→`profer-*`（一次性、幂等，B 阶段去 proma 化 2026-07-10 `:4`）；"读旧写新，一两个版本后移除旧读"（`:5`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `migrateLocalStorageKeys` | `:36-50` | 幂等迁移：新 key 已有值跳过；旧值拷贝；**不删旧 key**；localStorage 不可用静默降级（`:47-48`） |

内部：`KEY_MAP:9-31`（22 对映射）、模块级 `migrated:33` 防重。

## 3. 内部逻辑与关键流程

migrated 短路→逐对：新 key 非 null 跳过→旧值非 null 拷贝→try/catch 静默。

## 4. 调用者与调用链

应用启动（bootstrap）；被 `localstorage-migration.test.ts`（4 个 `test(`）覆盖（fresh import 打破模块缓存）。

## 5. 数据 I/O、读写与副作用

localStorage 读写；模块级标志位。

## 6. 分支、失败、取消与恢复

localStorage 抛错（无痕模式）→静默降级不炸启动。

## 7. 权限与权威状态

**数据安全契约**（测试 `apps/electron/src/renderer/lib/localstorage-migration.test.ts:47-52` 锁定）：无旧 key 不写新 key；新旧并存时新 key 优先（不覆盖）。

## 8. 修改影响面

改 KEY_MAP 影响存量用户配置保留；22 键清单即迁移契约。

## 9. 测试证据

`localstorage-migration.test.ts`（同批，4 个 `test(`）：split-ratio/preview-mode/file-panel 三键迁移+无旧不写。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/幂等/数据安全 | 已证实 | 50 行全读 |
| **边界**：`migrated` 为进程级一次性——同一会话内后加的旧 key 不会再迁（设计照实） | 已证实 | `:33`/`:37` |
| 3 新键覆盖测试，其余 19 键未测 | 已证实 | 测试 4 用例 |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9（4/22 键）。
