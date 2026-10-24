---
path: packages/shared/src/types/github.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: fbfc18b8a351c1c486d9a70acdb8c854fd1f0447
sha256: e2220cd8f09ffd45653198dd2c3107409a6df46b38b8d9318698b5ddd0455139
lines: 45
kind: source
package: p07-shared-libs
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# packages/shared/src/types/github.ts

## 1. 结论与边界

GitHub Release 查询的共享契约（薄类型文件）：1 个 Release 简化模型 + 列表查询选项 + 3 个 IPC 通道常量。供主进程 release 服务与渲染层更新 UI 共用。

不做的事：不发请求（GitHub API 调用在主进程服务侧）；不含完整 GitHub Release schema（只有 9 字段简化版）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 形状 |
| --- | --- | --- | --- |
| `GitHubRelease` | interface | `:6-25` | `{id:number; tag_name; name; body(Markdown); draft; prerelease; created_at; published_at; html_url}`（9 字段，时间戳为字符串） |
| `GitHubReleaseListOptions` | interface | `:28-35` | `{perPage?(默认10); page?(默认1); includePrerelease?(默认false)}` |
| `GITHUB_RELEASE_IPC_CHANNELS` | const `as const` | `:38-45` | 3 键：`GET_LATEST_RELEASE='github-release:get-latest'`、`LIST_RELEASES='github-release:list'`、`GET_RELEASE_BY_TAG='github-release:get-by-tag'` |

## 3. 内部逻辑与关键流程

纯声明。`draft`/`prerelease` 布尔区分正式/预发布；`body` 注释标注 Markdown 格式（渲染侧负责解析）。无运行时代码。

## 4. 调用者与调用链

preload `getLatestRelease/listReleases/getReleaseByTag`（`preload/index.ts:3512-3522`，注意 `listReleases(options)` 与 `getReleaseByTag(tag)` 参数在桥上无类型标注）；主进程 handler（ipc.ts 侧注册）；设置页更新 UI。出向：无 import。

## 5. 数据 I/O、读写与副作用

纯类型，无 I/O、无副作用。

## 6. 分支、失败、取消与恢复

不适用（无控制流）；失败语义在调用方（如 manifest 失败回退内置，见 `INSTALLER_IPC_CHANNELS.MANIFEST` 注释模式）。

## 7. 权限与权威状态

无权限语义；字段即 GitHub API 响应的直通映射。

## 8. 修改影响面

改 `GitHubRelease` 字段影响更新 UI 与 release 服务；改通道字符串需同步 preload `:3512-3522` 与 main 注册（键值符合 `github-release:<kebab>` 规则，无例外）。

## 9. 测试证据

无直接测试（全冻结树检索 `GitHubRelease`/`GITHUB_RELEASE_IPC_CHANNELS` 于 `*.test.ts` 为 0 命中）。`NOT_RUN`：本轮未执行测试/typecheck/build。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 3 导出、字段/常量值如 §2 | 已证实 | 文件全读 |
| 通道键值无例外 | 已证实 | `:38-45` |
| `listReleases` 桥参数无类型标注 | 已证实 | `preload/index.ts:3518` |
| 字段与 GitHub API 实际响应的一致性 | 未知 | 未运行网络 |

## 11. 覆盖表

| 项 | 章节 | 状态 |
| --- | --- | --- |
| 3 导出全量 | §2 | covered |
| 消费者/影响面 | §4/§8 | covered |
| 测试/未知 | §9/§10 | covered |
