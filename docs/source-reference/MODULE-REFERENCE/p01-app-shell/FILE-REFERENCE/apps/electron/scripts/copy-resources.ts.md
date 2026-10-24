---
path: apps/electron/scripts/copy-resources.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 99ae0155627c24b1dd23e1050378c9408c9f67f8
sha256: c7106ec13c96438d4bc0213ae9ad8e4a0ecc3643e4a2d8068f8a801b89466fac
lines: 38
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/scripts/copy-resources.ts

## 1. 结论与边界

构建资源复制脚本（38 行）：把 `apps/electron/resources/` 整目录复制到 `dist/resources/`，并按 `docs/design/review-agent/acceptance/d4-unified-r01/catalog.json` 把 D4 验收模板工作区的原始文件（workspace/manifest/selection/fixture 等）逐条复制到 `dist/resources/d4-unified/<path>`，保留原始字节与路径，客户端仍校验 catalog 中的 Git blob（`apps/electron/scripts/copy-resources.ts:1-2, 16`）。边界：不做打包压缩、不校验 blob 哈希（客户端职责）、只服务 dist 构建。

## 2. 导出与关键符号

无导出（CLI）。参数：无命令行参数。内部常量：`src`（`<script>/../resources`，`:4`）、`dest`（`<script>/../dist/resources`，`:5`）、`root`（仓库根 `resolve(import.meta.dirname, '../../..')`，`:17`）、`catalogPath`（`:18`）、`catalog`（解析后的 JSON，`:19`）、`paths`（收集集合，`:20-28`）。无内部函数。

## 3. 内部逻辑与关键流程

1. 源存在性（`:7-10`）：`src` 不存在 → `console.error('resources/ not found')` → `process.exit(1)`。
2. 建 dist（`:12`）：`mkdirSync(<script>/../dist, {recursive:true})`。
3. 整目录复制（`:15`）：`cpSync(src, dest, {recursive, force})`。
4. catalog 驱动补充复制（`:16-33`）：解析 catalog.json；`paths` 初始含 catalogPath；对每个 `catalog.templates` 条目加入 `entry.workspacePath`、`entry.manifestPath`，并按 `workspacePath.replace(/\/workspace(?:\/workspace)?\.json$/, '')` 得 base 后探测 5 个候选名（`selection.json`/`synthetic-selection.json`/`fixtures/selection.json`/`fixtures/selections.json`/`fixtures/controlled-registry.json`，存在才加入，`:24-27`）；随后逐条 `mkdirSync(dirname(target))` + `cpSync(join(root, path), target)` 到 `dest/d4-unified/<path>`（`:29-33`）。
5. 成功日志（`:34`）：`resources → dist/resources`。整体包裹 try/catch（`:14-37`）：任何异常 → `console.error('copy failed:', err)` → `process.exit(1)`。返回值：进程退出码。

## 4. 调用者与调用链

- 入向（真实调用点）：`apps/electron/package.json:28`（`"build:resources": "bun run scripts/copy-resources.ts"`）；被链引用：`:16`（dev:electron）、`:32`（build）、`:42`（build:github）、`:43`（build:commercial）。
- 间接链：`dist.ts` 步骤 5（`apps/electron/scripts/dist.ts:246`，`bun run build:resources`，失败即中断，`:249-250`）。
- 出向：`node:fs`（cpSync/existsSync/mkdirSync/readFileSync）、`node:path`；数据源 `resources/`、`docs/design/review-agent/acceptance/d4-unified-r01/catalog.json`（冻结树实测存在）。

## 5. 数据 I/O、读写与副作用

- 输入：`resources/` 全量、catalog.json 的 `templates[]`（workspacePath/manifestPath 形状，`:21-27`）。
- 写：`dist/resources/`（整目录 force 覆盖）、`dist/resources/d4-unified/<原始路径>`（逐条复制，保持目录结构）。
- 原子性：cpSync 直写，无 tmp+rename；中断留半成品 dist/resources。幂等：force 覆盖 + 重跑结果确定。
- 无网络/缓存/全局状态；副作用：console 日志 ×2（成功 1 失败 1）。

## 6. 分支、失败、取消与恢复

- early-exit：`resources/` 缺失（exit 1，文案 `resources/ not found`，`:7-10`）。
- 统一失败出口：try 内任一异常（catalog 缺失/JSON 解析失败/任一 cpSync ENOENT）→ `copy failed: <err>` → exit 1（`:35-37`）。
- 失败后状态：dist/resources 可能半成品（后续打包缺 skins/icon 等——`apps/electron/scripts/dist.ts:249` 注释明确资源缺失必须中断而非继续）。恢复：修复源文件后重跑；无自动清理。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查。权威状态：随包验收资产的权威清单 = catalog.json（`:16` 注释：客户端仍校验 catalog 中的 Git blob，复制保持原始字节）。

## 8. 修改影响面

- 打包流程：`build:resources`（`apps/electron/package.json:28`）→ build/build:github/build:commercial/dev:electron → `dist.ts` 步骤 5 → 安装包资源（skins/icon/内置技能等）。
- D4 验收链：`docs/design/review-agent/acceptance/d4-unified-r01/catalog.json` 及其指向的工作区文件（改路径会致本脚本 ENOENT 中断打包）。
- 下游运行时资源加载（`process.resourcesPath`，域外）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。无直接测试（全树 grep `copy-resources` 于 *.test.ts 零命中）。间接证据：`apps/electron/scripts/packaging-guards.test.ts:266`（`Given 应用打包依赖 When 检查核心打包配置与关键资源 Then 配置文件和图标必须存在且非空`）对资源存在性做断言——标注"间接"，不覆盖本脚本复制逻辑。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 两段复制逻辑、候选名清单、失败出口 | 已证实 | `apps/electron/scripts/copy-resources.ts:1-38` 全文 |
| catalog.json 在冻结树存在 | 已证实 | 路径核对 |
| catalog.templates 实际条目数与路径有效性 | 未知 | 未展开 JSON 内容核对 |
| dist/resources 实际产物完整性 | 未知 | 需运行，NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| resources 缺失 exit 1 | §3/§6 | 7-10 | covered |
| cpSync 整目录复制 | §3/§5 | 12-15 | covered |
| catalog 路径收集（templates+5 候选） | §3 | 16-28 | covered |
| d4-unified 逐条复制 | §3/§5 | 29-33 | covered |
| try/catch 失败出口 | §3/§6 | 14, 35-37 | covered |
