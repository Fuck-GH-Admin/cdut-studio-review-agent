---
path: apps/electron/src/main/lib/agent-directory-utils.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7449bcd239b54e0ea7879dd0452420c6edffdc67
sha256: 0170c56f79d492cbcf1a86f721fbf7ce6e48a74f3975945c0358e94545d529b2
lines: 68
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-directory-utils.ts

## 1. 结论与边界

Agent 附加目录聚合纯函数（文件头 :3-5：从 `agent-orchestrator.ts` 提取）：`collectAttachedDirectories` 聚合一次 SDK 调用涉及的附加目录（去重保序）；`collectProductArtifactDirectories` 列出 Profer 产品自有产物目录（仅真实存在的）。

不做的事：不写盘（只 `statSync` 存在性探测）；不并入产品产物目录到附加清单（注释 :51-53 明示刻意分开，避免进提示词/项目探测）；不含配置与凭据目录（:50）。

## 2. 导出与关键符号

导出 2 条（`export` 逐条核 :17/:55）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `collectAttachedDirectories` | function | `:17-43` | `(params: {sessionMeta?: AgentSessionMeta, workspaceSlug?: string, extraDirs?: string[]}) => string[]` | 去重（`result.includes`）保插入顺序 |
| `collectProductArtifactDirectories` | function | `:55-68` | `(productArtifactConfigDir: string = getConfigDir()) => string[]` | `skins/default-skills/global-skills/attachments` 中真实存在者 |

内部符号：`push` 闭包（:24-27，跳过空值并去重）。

## 3. 内部逻辑与关键流程

`collectAttachedDirectories`（:17-43）聚合顺序（决定返回顺序）：
1. `extraDirs` 逐项（:29）。
2. `sessionMeta.attachedDirectories`（:30）。
3. `sessionMeta.attachedFiles` 各取 `dirname(file)`（:31）。
4. 若有 `workspaceSlug`（:33）：工作区根 `getAgentWorkspacePath(workspaceSlug)`（:36，注释 :34-35：cwd 是会话子目录，显式加根目录供读 `workspace-profile.md` 等）→ `getWorkspaceAttachedDirectories`（:37）→ `getWorkspaceAttachedFiles` 各取 `dirname`（:38）→ `getWorkspaceFilesDir(workspaceSlug)`（:39）。

`collectProductArtifactDirectories`（:55-68）：对 `join(configDir, name)`（name ∈ :57 四个）做 `statSync(dir).isDirectory()` 过滤（:59-66，异常→false，注释 :61-62：调用方 realpath 不存在的根会整体失败，故先滤掉）。

## 4. 调用者与调用链

入向（grep 全冻结树 `*.ts`）：
- `apps/electron/src/main/lib/agent-orchestrator.ts:171` 导入；4 个调用点：`:1529`（内核附件摄入的 `allowedRoots`，与 `input.additionalDirectories`/`sessionMeta`/`workspaceSlug` 组合）、`:1642-1647`（受管浏览器 `browserAllowedRoots`，另并入 `collectProductArtifactDirectories()` :1647 与 `agentCwd`）、`:2018`（`allAdditionalDirectories` 传给 SDK 查询选项，注释 :2230 提及合并口径）、`:3834`（文件回退 rewind 的 `rewindAttachedDirs`，注释 :3830-3831 强调必须与 sendMessage 传给 SDK 的一致，否则路径越界检查跳过）。
- `apps/electron/src/main/lib/adapters/pi-review-ops-tools.ts:53` 注释提及复用同源清单（无直接调用）。
- 直接测试：`apps/electron/src/main/lib/agent-directory-utils.test.ts:10`（本批内）。

出向：`node:path` `dirname/join`（:6）、`node:fs` `statSync`（:7）；`apps/electron/src/main/lib/agent-workspace-manager.ts` `getWorkspaceAttachedDirectories`（:9，定义 :1684）/`getWorkspaceAttachedFiles`（定义 :1714）；`apps/electron/src/main/lib/config-paths.ts` `getAgentWorkspacePath`（:10，定义 :442）/`getConfigDir`（定义 :80）/`getWorkspaceFilesDir`（定义 :503）。

## 5. 数据 I/O、读写与副作用

- 只读：`statSync` 存在性/目录探测（:63），不写盘（依据：无写 API）。
- 输入输出形状：输入为会话元数据/工作区 slug/额外目录；输出字符串数组（绝对目录路径）。无缓存、无全局状态。
- 「本文件不写盘」≠「调用链无写副作用」限定：被调的 `getWorkspaceAttached*`/`getAgentWorkspacePath` 是否含迁移写入未逐行读（属 `agent-workspace-manager.ts`/`config-paths.ts`，非本批）；本文件只声明自身无写（见 §10）。
- 幂等：纯函数，同输入同输出（顺序由 :24-27 去重保序保证）。

## 6. 分支、失败、取消与恢复

- 分支：`push` 空值跳过（:25）与去重（:26）；`workspaceSlug` 有无（:33）；`statSync` try/catch 过滤（:60-66）。
- 失败语义：`statSync` 异常静默归为「不存在」（:64-65 返回 false）；其余函数无 throw 路径（依据：本文件无 throw）。
- 不适用「取消/恢复」：依据同步纯函数无状态。

## 7. 权限与权威状态

无权限分支（依据：无 sender/role 检查）。语义上的安全边界：产品产物目录**不含**配置/凭据（:50，注释列举 `channels.json`、`auth-tokens.enc`、`sdk-config` 不在列表）；附加目录清单作为下游 `allowedRoots`/SDK 附加目录的输入（orchestrator :1529/:1642），授权判定在下游消费方。

## 8. 修改影响面

- 改聚合顺序/去重语义影响 SDK 附加目录与提示词（orchestrator :2018）、受管浏览器根（:1642）、附件摄入（:1529）、rewind 一致性（:3834 与 :2018 必须同源，注释 :3830-3831）。
- 改产物目录清单影响内置浏览器预览可读根（:1647）与皮肤/Skill 产物可见性。
- 需同步修改的测试：`agent-directory-utils.test.ts`（本批内，9 用例）。

## 9. 测试证据

直接测试：`apps/electron/src/main/lib/agent-directory-utils.test.ts`（本批内，9 用例；beforeEach 以 `PROFER_CONFIG_DIR` 指向 tmp 目录 :15-19，afterEach 还原 :21-27）。
- `collectAttachedDirectories` 7 用例：空参数 `toEqual([])`（:30-33）；extraDirs 去重（:35-40）；过滤 null/undefined（:42-47）；会话级 attachedDirectories 含入（:49-62）；attachedFiles 取父目录（:64-77，断言 `/parent`、`/other`）；合并去重保序 `toEqual(['/shared','/unique'])`（:79-93）；工作区加入根目录与 workspace-files（:95-102）。
- `collectProductArtifactDirectories` 2 用例：只返回真实存在目录（:106-112，仅建 `skins` 时 `toEqual([skins])`）；不含 channels/auth-tokens/sdk-config 字样的路径（:114-119）。
- mock/边界：真实文件系统 tmp 目录 + 环境变量改 config 根；无 mock 框架。未覆盖：workspace attached 目录来源、`dirname` 对相对路径的行为、statSync 非目录文件过滤（如名为 skins 的文件）。`NOT_RUN`：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出 2 条；聚合顺序与去重保序 | 已证实 | `:24-39`；测试 :79-93 |
| 产物目录仅 4 个固定名且过滤不存在者 | 已证实 | `:57-66`；测试 :106-112 |
| 产物清单不含配置/凭据目录 | 已证实 | `:50` 注释 + :57 清单；测试 :114-119 |
| `statSync` 异常静默过滤 | 已证实 | `:60-66` |
| 本文件自身无写盘 | 已证实 | 无写 API（仅 statSync :63） |
| `getWorkspaceAttached*`/config-paths 读依赖是否迁移写盘 | 未知 | 属他文件（非本批范围），未逐行读 |
| rewind 与 SDK 附加目录实际一致性 | 推断 | 依赖调用方传参一致（orchestrator :3830-3831 注释 + :2018/:3834 两处调用形态一致） |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `collectAttachedDirectories` 5 来源 | §3 | :29-39 | covered |
| 去重/空值短路 | §3/§9 | :24-27 | covered |
| `collectProductArtifactDirectories` 过滤 | §3/§9 | :55-67 | covered |
| 4 个调用点用途 | §4 | orchestrator:1529/:1642/:2018/:3834 | covered |
| workspace attached 来源实现 | §10 | — | unknown |
| 被调路径函数的迁移写入 | §5/§10 | config-paths/workspace-manager | unknown |
