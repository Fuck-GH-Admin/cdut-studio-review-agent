---
path: apps/electron/src/main/lib/global-skill-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: c222f1bcc888c887c29ecd7d32d2a030d825835d
sha256: 311b3599a2e7ebcbffa380b596d225ec79fdbff762428140a547fa975f1bad78
lines: 801
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/global-skill-manager.test.ts

## 1. 测试目标

global-skill-manager BDD 全景：首次运行同步 seed/迁移、索引自愈、builtin 只读、Windows 命名、稳定 ID、删除阻塞、fingerprint 投影、目录切换恢复、B1-B7/A1-A2 迁移分类与幂等重入。

## 2. 用例清单

36 用例 / 1 describe（`global-skill-manager BDD` :37）。夹具 `setup()`（:28-38，bundle demo skill+根替身）；真 mkdtemp 目录布局（含 `.migration-backup`/`skill-overrides.json`）；无 mock（仅根替身 API）。

| # | 用例（行） | 核心断言 |
| --- | --- | --- |
| 1 | 首次 prepare 同步 seed+迁移（39-68） | 投影 `['first-run']`、幂等 `ensureGlobalSkillSystemReady` 后清单不变 |
| 2 | 索引损坏/缺失自愈（70-77） | `{not-json`/删除 index.json 后清单仍 `['demo']` |
| 3 | builtin 只读可复制（79-90） | 删/编辑 throw `只读`；复制 user-global 含 `name: "my-demo"`；删 throw `不可撤销` |
| 4 | createUserGlobalSkill 不绑工作区（92-102） | 1.0.0、blockers 0、重复 slug throw |
| 5 | Windows 唯一键（104-112） | `DEMO`/`cafe\u0301` 拒 |
| 6 | 历史 canonical 冲突只投影一份（114-140） | 投影 1 个 `demo` |
| 7 | 工作区命名规则（142-166） | `CON`→`Windows 保留设备名`；尾点/尾空格拒 |
| 8 | 工作区优先只投影一次（150-168） | scope workspace、diagnostics `workspace-slug-conflict` |
| 9 | 穿越/绝对路径全拒（171-181） | `../escaped`/`C:\\escaped`/`foo/bar` 全 throw |
| 10 | 稳定 ID 改名仍关联（183-200） | rename 后 resolve/list/restore 按 workspaceSkillId 命中 |
| 11 | 副本读写不回写全局（202-218） | 全局 `# 演示` 不变 |
| 12 | 复制替换只影响当前工作区（220-231） | a/b/c 三工作区独立 |
| 13 | 删除阻塞分析（233-256） | enabled 阻塞+copy 不阻塞；删后副本仍在、override 项消失（无墓碑） |
| 14 | 全局保存多工作区同步新版本（258-268） | 1.0.1 |
| 15 | workspace scope 事务编辑（270-282） | 失败不留半成品；二次提交不抛 |
| 16 | 副本删除自愈恢复（284-297） | 恢复全局 scope |
| 17 | 复制/投影过滤工程目录（299-318） | node_modules/dist 均不复制 |
| 18 | fingerprint 投影（320-335） | 新投影路径不同、旧 8 天投影被清 |
| 19 | Claude/Pi 双兼容（337-344） | `.claude-plugin/plugin.json`+skills 目录 |
| 20 | 目录切换失败恢复（346-361） | `__replaceStagedDirectoryForTest(failAfterBackup)`→旧源仍读、staged 清理 |
| 21 | 新旧 source 格式兼容（363-398） | 新副本 sourceSkillId/旧导入 importSource |
| 22 | inactive 副本列表（400-430） | enabled false、actualSource none、稳定 ID 保留 |
| 23 | schema3 误标重分类（432-456） | migrated 1、retire、actualSource global、schemaVersion 3 |
| 24 | B1/B2 干净转引用（458-480） | migrated 2、retired 目录、inactive 不进投影 |
| 25 | repair 历史证据+幂等（482-518） | 两工作区 migrated 2→二轮 0 |
| 26 | 备份不可覆盖（520-545） | 备份正文不变、migrated 0×2 |
| 27 | 已退休不再迁移（547-570） | 两轮 0、结构不变 |
| 28 | local toggle 空 sourceSkillId（572-595） | 移动副本不动全局 override |
| 29 | 无 metadata 识别转引用（597-622） | migrated 2、override enabled/按 active 状态 |
| 30 | source-less 修改版→modified-legacy-copy（624-672） | .source.json 字段全对、二轮 0 幂等 |
| 31 | inactive 修改副本→preserved-legacy-disabled-copy（674-712） | 不进 runtime、二轮 0 |
| 32 | 无旧 master 不退休（714-735） | unknown 1、`unknown-legacy`、二轮 0 |
| 33 | B3/B4 保留副本（737-768） | modified/preserved 状态+replacement override |
| 34 | B7 单 manifest（770-780） | builtin 1 个、两 override 文件 |
| 35 | 失败保持 failed 可重入（782-797） | `broken:` 失败→修复后 completed |
| 36 | 旧迁移保留正文+unknown 标记（799-801 尾部段） | migrated 2/unknown 1、正文保留、二轮全 0、`demo-legacy` user-global 存在、status completed |

## 3. 真实断言

如 §2 表（逐条读自 :39-801）。

## 4. 未覆盖与脆弱点

- 未覆盖：Windows junction 真实行为（POSIX symlink 替身）、`preparePolicyRuntimeSkills` 独立用例。
- 脆弱点：`process.env.PROFER_CONFIG_DIR` 切换还原（多用例 try/finally）；迁移断言依赖目录布局常量。
- **NOT_RUN**。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 36 用例断言如 §2 | 已证实 | 本文件逐行 |
| B1-B7/A1-A2/幂等重入被固定 | 已证实 | 用例 23-36 |
| 运行通过与否 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 状态 |
| --- | --- | --- |
| seed/索引/CRUD/删除/稳定 ID | §2 | covered |
| 迁移全分类+幂等 | §2 | covered |
| 投影/清理/目录切换 | §2 | covered |
| policy 子投影/junction | §4 | unknown（未测） |
