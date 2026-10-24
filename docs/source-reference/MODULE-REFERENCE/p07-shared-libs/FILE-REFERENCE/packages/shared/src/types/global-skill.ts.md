---
path: packages/shared/src/types/global-skill.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 135205deb966e6d99e53fda79d8714fad0b91c24
sha256: 03ac0cbe5aa995def779ab179f35c613419f72f00f69a5b4d87337973d821ee7
lines: 160
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/global-skill.ts

## 1. 结论与边界

全局 Skill 体系契约（`:1`）：Global Skill（builtin-meta/user-global）与工作区 Skill 的来源追踪、覆盖（override）、解析投影、迁移诊断。核心红线（`:39`/`:49`）：**workspaceSkillId 是稳定 UUID 绝不从 slug 推导**；未知来源不猜测。

不做的事：不实现解析/迁移（global-skill-manager）；无运行时代码（纯类型）。

## 2. 导出与关键符号

4 枚举 + 14 接口（18 导出）：

| 符号 | 行 | 要点 |
| --- | --- | --- |
| `GlobalSkillType` | `:3` | `'builtin-meta'\|'user-global'` |
| `SkillScope` | `:4` | `'global'\|'workspace'` |
| `SkillSourceStatus` | `:5-10` | 5 值（available/unknown-legacy/modified-legacy-copy/preserved-legacy-disabled-copy/uncertain-legacy-copy） |
| `WorkspaceOverrideReason` | `:11-16` | 5 值（user-disabled/replaced-by-workspace-copy/legacy-*） |
| `GlobalSkillSource` | `:18-23` | 来源四元组（sourceSkillId/Type/Version/copiedAt） |
| `GlobalSkillManifest` | `:25-36` | `schemaVersion:1` + slug/type/version/name/source? |
| `WorkspaceSkillSource` | `:38-51` | **`workspaceSkillId?` 稳定 UUID 绝不从 slug 推导**（`:39`）；`migrationReason?` 仅迁移诊断（`:49`） |
| `WorkspaceGlobalSkillOverride` | `:53-60` | enabled/replacement*/disabledReason?/sourceStatus?/updatedAt |
| `WorkspaceSkillOverridesFile` | `:62-65` | `schemaVersion:1` + `globalSkills: Record<slug, override>` |
| `GlobalSkillMeta` | `:67-80` | Manifest + `enabledInWorkspace/replacedInWorkspace/actualSource('workspace'\|'global'\|'none')` + 展平来源字段（`:73` 供详情 UI/IPC） |
| `WorkspaceGlobalSkillMeta` | `:82-91` | 工作区投影（`sourceStatus:'available'` 字面量） |
| `ResolvedSkillMeta` | `:93-108` | 解析结果（`path`/`scope`/`actualSource`；workspaceSkillId=目录 `.source.json` 稳定 UUID `:94`） |
| `SkillResolutionDiagnostic` | `:110-115` | `code: 'workspace-slug-conflict'\|'replacement-missing'` |
| `RuntimeSkillsProjection` | `:117-121` | `{path; skills[]; diagnostics[]}` |
| `WorkspaceSkillCopyResult` | `:123-129` | 复制结果五元组 |
| `GlobalSkillEditRequest` | `:131-136` | `{skillId; workspaceSlug; scope:'global'\|'workspace'; content}` |
| `GlobalSkillDeleteRequest` | `:138-141` | `{skillId; confirmationToken?}` |

## 3. 内部逻辑与关键流程

纯声明。解析语义（类型级）：`GlobalSkillManifest`（源头）→ 复制/覆盖（`WorkspaceGlobalSkillOverride`）→ `ResolvedSkillMeta`（投影，`actualSource` 三层）→ `RuntimeSkillsProjection`（+诊断）。诊断二值（`:111`）：slug 冲突/替换缺失。

## 4. 调用者与调用链

main `global-skill-manager`/skill 解析（`config-paths` 的 `getWorkspaceSkillOverridesPath`/`getWorkspaceRuntimeSkillsDir` 承载 override 文件与投影目录）；preload `globalSkill`/`skillMaster` 命名空间（`preload/index.ts:4041-4075`）；设置页全局能力页（`GlobalSkillEditRequest` 注释 `:143` 起）。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O。持久化线索：`skill-overrides.json`（`WorkspaceSkillOverridesFile`）、`.source.json`（`:94`）。

## 6. 分支、失败、取消与恢复

不适用。失败语义：`SkillResolutionDiagnostic.code` 二值；`SkillSourceStatus` 五值承载遗留来源的不确定态（`unknown-legacy`/`uncertain-legacy-copy`——降级为保护而非覆盖）。

## 7. 权限与权威状态

- **ID 权威**：`workspaceSkillId` 稳定 UUID 绝不从 slug 推导（`:39`）；未知来源不猜测为某全局 Skill（`:49`）。
- **删除确认**：`GlobalSkillDeleteRequest.confirmationToken?`（`:140`）——高危操作门。
- **覆盖裁决**：`WorkspaceGlobalSkillOverride.disabledReason/sourceStatus` 是工作区对全局的裁决记录；`actualSource` 是最终生效层权威（`:71`）。

## 8. 修改影响面

改枚举/字段影响 skill 解析、迁移与全局能力页；`schemaVersion:1` 两处（`:26`/`:63`）是持久化格式；`ResolvedSkillMeta` 改动牵连投影目录消费（Agent ready gate/`prepareRuntimeSkills`）。

## 9. 测试证据

无直接测试（检索 `ResolvedSkillMeta`/`GlobalSkillManifest` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 18 导出（4 枚举 + 14 接口） | 已证实 | 文件全读 |
| UUID 红线/不猜测红线 | 已证实 | `:39`、`:49` |
| `actualSource` 三层权威 | 已证实 | `:71`、`:107` |
| 诊断二值 | 已证实 | `:111` |
| 解析/迁移实现的实际一致性 | 未知 | manager 不在本批 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 18 导出全量 | §2 | covered |
| 解析语义链 | §3 | covered |
| 红线/权威 | §7 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |
