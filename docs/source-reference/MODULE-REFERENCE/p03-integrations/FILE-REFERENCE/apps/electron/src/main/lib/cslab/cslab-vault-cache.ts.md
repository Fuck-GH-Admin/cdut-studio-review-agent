---
path: apps/electron/src/main/lib/cslab/cslab-vault-cache.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 097d5c84497f316be8988f6c59eb13d31d34d8c1
sha256: 2e6735cfb3891afbcc65c2385ef3f330f08d01b6fea88148da550f9ab54bd166
lines: 230
kind: source
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-vault-cache.ts

## 1. 结论与边界

**Vault 笔记索引缓存**（node:sqlite）：每实验室独立 `db/vault_cache.sqlite`，与 central_meta 完全隔离；payload 紧凑 JSON 文本——读取必须 try-catch、坏行回退物理文件重解析（`apps/electron/src/main/lib/cslab/cslab-vault-cache.ts:1-6`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabVaultCache` | 接口 | 28-31 | `{dbPath, raw: SqliteDatabase}` |
| `CsLabVaultIndexRow` | 接口 | 33-40 | 索引行（relPath/mtimeMs/size/contentHash/payload/updatedAt） |
| `getVaultCachePath` | 函数 | 67-70 | `<labDir>/db/vault_cache.sqlite`（assertLabId 校验） |
| `getCsLabVaultCache` | 函数 | 72-87 | **连接单例**（`connections` Map，`:42`；require('node:sqlite')+建表） |
| `closeCsLabVaultCache`/`closeAllCsLabVaultCaches` | 函数 | 89-114 | 关闭（异常忽略） |
| `getVaultIndexRow`/`listVaultIndexRows`/`upsertVaultIndexRow`/`deleteVaultIndexRow` | 函数 | 127-161 | 索引 CRUD（upsert=ON CONFLICT DO UPDATE） |
| `VaultLinkEntry` | 接口 | 163-166 | |
| `replaceVaultLinks` | 函数 | 172-182 | 全量重建双链（**不自开事务**，须外裹 `withVaultCacheTransaction`，`:168-171` 注释） |
| `countVaultBacklinks` | 函数 | 185-199 | 反链计数（空键返 0——SQLite 不支持 IN ()，`:184`） |
| `setVaultMeta`/`getVaultMeta` | 函数 | 201-214 | KV 元数据 |
| `withVaultCacheTransaction` | 函数 | 216-230 | BEGIN IMMEDIATE/COMMIT/ROLLBACK（ROLLBACK 失败吞） |

内部：`SqliteStatement/SqliteDatabase/SqliteModule` 结构接口（`:12-26`）、`SCHEMA_SQL`（WAL+busy_timeout 5000+3 表+索引，`:44-65`）、`rowToIndex`（`:116-125`）。

## 3. 内部逻辑与关键流程

连接管理：`getCsLabVaultCache` 按 dbPath 复用（`:74-75`）；建目录+DatabaseSync+SCHEMA_SQL（`:77-82`）。双链表 `vault_links(rel_path,target_key)` 主键对+target 索引（`:59-64`）。

## 4. 调用者与调用链

入向：CSLab vault-index/literature-index 等（非本批，经 index）。出向：`./cslab-paths`（assertLabId/resolveLabDir）、node:sqlite（require 延迟加载）。

## 5. 数据 I/O 与副作用

SQLite 读写（WAL 模式）；mkdir。

## 6. 分支、失败、取消与恢复

close 异常忽略（`:96-101`）；事务失败 ROLLBACK 后 rethrow（`:222-228`）；读坏行由消费方 try-catch（头注释约定）。

## 7. 权限与权威状态

每实验室 DB 隔离（`:4`）；labId 经 assertLabId 白名单校验。

## 8. 修改影响面

SCHEMA 变更需迁移策略（CREATE IF NOT EXISTS 仅增表）；`withVaultCacheTransaction` 嵌套约定影响调用方。

## 9. 测试证据

无专属测试（glob `**/cslab-vault-cache*test*` 零命中）；NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 导出+SCHEMA+事务约定 | 已证实 | `:1-230` 逐行 |
| 消费方坏行回退实现 | 未知 | 非本批 |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 项 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 全部导出/SCHEMA/事务 | §2/§3 | 28-230 | covered |
| 测试/运行 | §9/§10 | — | unknown（NOT_RUN） |
