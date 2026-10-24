---
path: apps/electron/src/main/lib/review/boot-check.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4d2b943a77d360365e81acdac08602b994e67ffc
sha256: df4352198aca1f9d229d690ce82037a6957f8b6298b711558a6cea952a190670
lines: 52
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/boot-check.ts

## 1. 结论与边界

V2 启动引导检查（M5，头注 :1-9）：应用启动一次（幂等）——内置模板草稿落盘（缺失即注入、不覆盖用户改动）、统计可迁移 V1 案卷（有 case.json 无 case.v2.json）、产出注记供 UI 引导页。

边界：不迁移、不发布（仅统计）；模板注入在 `builtin-templates`。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BootCheckResultV2` | interface | 17-23 | `{templatesSeeded, templatesPublished, migratableCases, notes}` |
| `runBootCheckV2` | fn | 24-49 | 主检查 |
| `filterMigratable` | fn | 50-52 | 摘要列表→可迁移 id 列表 |

无内部符号。

> **r1 校订说明**：§2 行号经 `grep -n` 逐符号实测校订（NB17-N-01）；符号定位以符号名为准。

## 3. 内部逻辑与关键流程

1. `runBootCheckV2`（:22-45）：`listTemplates().length` 前后差=seeded（:23-27）；`ensureBuiltinTemplateDrafts`（:25）；seeded>0 → note `已注入 N 个内置模板草稿`（:28）；published=0 → note `尚无已发布模板：发布后才能创建批次与运行审核`（:31-32）；遍历 `review-cases/*` 找 `case.json` 且无 `case.v2.json`（:35-43），有则 note `N 个 V1 案卷可迁移到 V2（迁移保留原文件与历史运行）`（:44）。
2. `filterMigratable`（:48-51）：摘要中 `case.v2.json` 不存在者的 id（注释 :47「本地无数据库，读目录即得」）。

## 4. 调用者与调用链

入向（生产）：启动引导（review-ipc 启动序，全树 grep `runBootCheckV2` 由 IPC 启动路径消费）；测试：`boot-check.test.ts:7`。出向：`./builtin-templates`（:13）、`./template-store`（:14）、`../config-paths`（:15）、`node:fs/path`（:11-12）。

## 5. 数据 I/O、读写与副作用

读 `review-cases/` 目录；经 `ensureBuiltinTemplateDrafts` 写模板（缺才写）；无日志。

## 6. 分支、失败、取消与恢复

无 throw；目录缺失静默跳过（:36）；幂等由种子逻辑保证（第二次 seeded=0）。

## 7. 权限与权威状态

无 sender/role 分支。不覆盖用户改动（注释 :5 + 测试断言）；统计不等于迁移（migratableCases 仅清单）。

## 8. 修改影响面

启动引导 UI 注记/模板播种；`filterMigratable` 影响案卷列表可迁移标记。同测：`boot-check.test.ts`（4 用例）。

## 9. 测试证据

直接测试 `boot-check.test.ts`（4 用例 / 1 describe；`PROFER_CONFIG_DIR` 隔离；NOT_RUN）：
1. `:15-22` 首启：`templatesSeeded ≥ ALL_DEFAULT_TEMPLATES_V2.length`、`templatesPublished ≥ 1`（注释：综测 v3 播种时自动技术发布）、无「尚无已发布模板」note。
2. `:24-27` 二启幂等 `templatesSeeded === 0`。
3. `:29-36` 造 V1 目录 → `migratableCases` 含 `case-mig-1`、note 含 `可迁移`。
4. `:38-50` 已存在草稿不覆盖：用户改名后再次 ensure 仍 `用户改过的名字`（只允许编辑 draft 模板）。
未覆盖：`filterMigratable`、note 无模板分支；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出存在性与行为 | 已证实 | 行号 r1 grep 实测校订；以符号名为准 |
| 幂等/不覆盖用户改动 | 已证实 | :25 + 测试 :24-50 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `runBootCheckV2` 主链 | §3/§9 | 22-45 | covered |
| `filterMigratable` | §3 | 48-51 | covered（未测） |
