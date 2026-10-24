---
path: apps/electron/src/main/lib/global-skill-manager.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: be9fdb95d54cdb7a85e447f4e4eb8178541b67f5
sha256: 35fff2deb19f0dfe0be786bd6ce42919cd7c5a339802b0310e8d0674210d771c
lines: 1658
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/global-skill-manager.ts

## 1. 结论与边界

全局 Skill 唯一入口（头注 :1-6）：全局定义（builtin-meta/user-global）与工作区副本**永远分开存储**；运行时只消费 `resolve/prepare` 有效投影（不把全局+工作区目录同时给 SDK 防重复发现）。

## 2. 导出与关键符号

| 函数 | 行 | 说明 |
| --- | --- | --- |
| `configureGlobalSkillSystem` | 64-68 | 注入 bundle 根（主进程 IPC 前） |
| `ensureGlobalSkillSystemReady` | 73-80 | seed+迁移幂等（失败下轮重试） |
| `__setGlobalSkillRoots`/`__resetGlobalSkillRoots` | 83-95 | 测试替身 |
| `copySkillDirectorySafely` | 260-271 | 不跟随 symlink+工程目录过滤 |
| `__replaceStagedDirectoryForTest` | 296-304 | BDD 演练目录切换失败恢复 |
| `listGlobalSkills` | 330-363 | 全局清单+工作区状态投影 |
| `getGlobalSkill`/`getGlobalSkillForWorkspace` | 365-378 | 按 skillId 读 |
| `copyGlobalSkillToUserGlobal(WithSource)` | 381-460 | 复制为用户全局 |
| `createUserGlobalSkill` | 434-460 | 新建（不绑工作区） |
| `editGlobalSkill` | 466-545 | global/workspace 两 scope 事务编辑 |
| `readWorkspaceSkillCopyContent`/`saveWorkspaceSkillCopyContent` | 621-640 | 稳定 ID 读写副本 |
| `saveGlobalSkillContent` | 663-681 | bump patch 版本原子更新 |
| `getGlobalSkillDeleteBlockers` | 687-720 | 删除阻塞分析 |
| `deleteUserGlobalSkill` | 726-766 | 二次确认+可回滚删除 |
| `seedBuiltinGlobalSkills` | 768-792 | builtin seed（索引损坏自愈） |
| `migrateLegacyWorkspaceSkills` | 1030-1358 | B1-B7/A1-A2 分类迁移（可重入） |
| `resolveEffectiveSkills`/`prepareRuntimeSkills` | 1410-1495 | 有效投影+fingerprint 目录 |
| `preparePolicyRuntimeSkills` | 1566-1610 | policy 快照子投影（name→slug 重写） |

内部：`replaceStagedDirectory`（:232-253，先备份不先删、失败恢复）、`findWorkspaceSkillDirectory`（:608-618，**按 workspaceSkillId 不按 slug**）、`readWorkspaceSkillOverrides`（:922-968，副本已删→自动恢复全局源，注释 :958-962）、`resolveSkills`（:1418-1490，工作区优先+诊断）、`ensureRuntimeSkillCompatibilityLinks`（:1500-1545，扁平兼容 symlink/junction）、`cleanupStaleRuntimeProjections`（:1550-1560，仅清 >7 天）、`skillDirectoryHash(IgnoringVersion)`（:1628-1658）。

## 3. 内部逻辑与关键流程

1. **索引自愈**（:169-186）：manifest 是定义本身，索引每次从 manifest 重建（「不合并 stale index」，:181-183）。
2. **目录原子切换**（:232-253）：target 先 rename 备份再切 staged；失败恢复 backup（「绝不先删除」）。
3. **复制安全**（:260-271）：普通文件/目录 only；symlink 与 `.git/node_modules/…` 黑名单过滤。
4. **删除语义**（:726-766）：删除前 Manager 内重算 blockers（不信任 UI 快照）；须 `delete:{skillId}` 二次确认；副本/override 不写墓碑——失效 override 直接删（注释 :750-751）；失败全回滚（含各工作区 override 原文恢复）。
5. **迁移分类**（:1030-1358）：B1/B2 干净副本（与旧 master hash 一致）→转全局引用+retire 到 `.migration-backup/retired-skills/`；B3/B4 修改副本→保留独立副本+replacement override；B5（master 来源不可确认）→`uncertain-legacy-copy`；B6（疑似 builtin 无来源）→`unknown-legacy` 保守保留；A1/A2 用户自建→仅补 workspaceSkillId；**历史备份是不可变证据**（注释 :1104-1106「已有目录不能被当前副本覆盖」）；当前 builtin/backup 不得用于 clean retirement（:1157-1159）；失败→failed 可重入，不虚标 completed（:1348-1355）。
6. **运行时投影**（:1452-1495）：fingerprint=sha256(slug:path:version:hash)[:16]；`.claude-plugin/plugin.json`+`runtime-manifest.json`；扁平兼容链接（Windows junction）；>7 天旧投影才清。

## 4. 调用者与调用链

入向：`agent-orchestrator.ts`/`skill-runtime-routing.ts`/`migration-service.ts`/`ipc.ts`（全树 grep）。出向：`./skill-path-security`、`./config-paths`、`./safe-file`、`./default-skill-slugs`、`@profer/shared` 类型、`@earendil-works/pi-coding-agent`（`parseFrontmatter`，:1570）。

## 5. 数据 I/O、读写与副作用

读写全局/工作区 Skill 目录、`skill-overrides.json`、`skill-system-migration.json`、`.migration-backup/`；`writeJsonFileAtomic`；symlink/junction；无网络。

## 6. 分支、失败、取消与恢复

slug 冲突/内置只读/穿越→throw；删除需二次确认；override 读取自愈（副本删→全局恢复）；迁移 failedEntries 记录+重入；目录切换失败回滚。

## 7. 权限与权威状态

- 路径权威：`assertSafeSkillSegment/safeSkillPath` 全入口（穿越/绝对路径拒，测试 :171-181）。
- 副本身份权威：`workspaceSkillId` 不可变，目录改名后仍精确命中（:608-618 注释「绝不以 slug 猜测目标」）。
- builtin 只读（:658-660 `assertEditable`）。
- 迁移证据权威：历史备份不可变、不凭目录名伪造 skillId（:1181-1183）。

## 8. 修改影响面

Skill 发现/运行时加载/历史迁移全链。同测：`global-skill-manager.test.ts`（36 用例）。

## 9. 测试证据

直接测试 `global-skill-manager.test.ts`（36 用例 / 1 describe；真 mkdtemp 根替身+真迁移目录布局；NOT_RUN）要点（36 用例核心断言）：
- 首次 prepare 同步 seed+迁移且幂等（:43-68）；索引损坏/缺失仍从 manifest 恢复（:70-77）；builtin 只读+可复制 user-global（:79-90）；createUserGlobalSkill 不绑工作区+slug 唯一（:92-102）；大小写/Unicode 组合键拒绝（:104-112）；历史 canonical 冲突只投影一份（:114-140）；工作区命名 Windows 规则（CON/尾点/尾空格，:142-166）；工作区优先只投影一次+diagnostics（:150-168）；穿越/绝对路径全拒（:171-181）；副本稳定 ID 改名后覆盖/详情/恢复仍关联（:183-200）；副本读写不回写全局（:202-218）；复制替换只影响当前工作区（:220-231）；删除阻塞分析+副本不写墓碑（:233-256）；全局保存 bump 1.0.1 两工作区同新版本（:258-268）；workspace scope 事务编辑失败不留半成品（:270-282）；副本删除后自愈恢复全局（:284-297）；复制/投影过滤 node_modules/dist/symlink（:299-318）；fingerprint 新投影+仅清过期（8 天，:320-335）；投影兼容 Claude/Pi（:337-344）；目录切换失败恢复旧源（:346-361）；新旧 source 格式兼容（:363-398）；inactive 副本保留稳定 ID（:400-430）；schema3 误标 unknown 重分类（:432-456）；B1/B2 转全局引用+retire（:458-480）；repair 用历史备份证据+多工作区幂等（:482-518）；备份不可被当前副本覆盖（:520-545）；已退休不再迁移（:547-570）；local toggle 空 sourceSkillId 优先移动副本（:572-595）；无 metadata 经 legacy 内容识别转引用（:597-622）；source-less 修改版→modified-legacy-copy+replacement（:624-672）；inactive 修改副本→preserved-legacy-disabled-copy（:674-712）；无可靠旧 master 不退休（unknown-legacy，:714-735）；B3/B4 保留副本（:737-768）；B7 多工作区单 manifest（:770-780）；单工作区失败保持 failed 可重入（:782-797）；旧迁移保留正文+unknown 显式标记+重入 0（:799-… 尾部）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 稳定 ID/只读/自愈/原子切换 | 已证实 | 代码+测试族 |
| B1-B7/A1-A2 迁移语义 | 已证实 | 测试 17 个迁移用例 |
| Windows junction 行为 | 未知 | POSIX 下未验 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| seed/索引自愈/CRUD/删除 | §3.1-3.4/§9 | 169-792 | covered |
| 迁移 B1-B7/A1-A2 | §3.5/§9 | 1030-1358 | covered |
| 投影/兼容链接/清理 | §3.6 | 1452-1560 | covered |
| `preparePolicyRuntimeSkills` | §2 | 1566-1610 | covered（间接） |
