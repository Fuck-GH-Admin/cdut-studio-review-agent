---
path: apps/electron/src/main/lib/remote-workspace-file-search.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f8428da8a6e96946c67be2fdc9bfcb0c80ed8a89
sha256: fda14c5b9600c5c290f6126306fd3fc3b576fe97559be36ae8f6d7eba88d8e92
lines: 251
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/remote-workspace-file-search.ts

## 1. 结论与边界

**Remote Workspace File Search——移动端（Pocket）`@` 引用检索**（`remote-workspace-file-search.ts:1-12`）：远程端无本地文件系统且**不允许客户端提交任何授权根**（与 remote-file-access 同策略 `:7-8`），**roots 由服务端从会话 meta 推导**；语义与桌面 `SEARCH_WORKSPACE_FILES` 一致（session/workspace 两组、目录优先、同名前缀优先 `:10-11`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `RemoteWorkspaceFileSearchInput` | interface（export） | `:46-59` | query?/limit?/sessionRoot/workspaceRoot/附加路径/**denyPath（review 栅栏，与后续 read 端点同源 `:57`）** |
| `searchRemoteWorkspaceFiles` | function（export） | `:145-215` | 检索（§3） |

内部：`IGNORE_DIRS`（8 项 `:18-27`）/`IGNORE_FILES`（`:28-34`）/`MAX_DEPTH=10`/每组 2000/总 3000/默认 200/上限 500（`:36-40`）、`scanDirectory`（`:61-97`）、`addAttachedPath`（`:100-124`，`workspace-files` 显示名'工作文件' `:118`）、`isDeniedRemoteSearchPath`（**搜索条目是可见元数据，加名前就查别名** `:126`；realpath 双查 `:129-131`；坏路径不列 `:133-134`）、`sortGroup`/`matchEntries`/`sortDirsFirst`（`:217-251`）。

## 3. 内部逻辑与关键流程

1. 扫描（`:146-161`）：session 组相对路径、workspace 组绝对路径；附加目录/文件逐条经 denyPath。
2. **空 query**（`:169-184`）：目录优先排序再截断（保证文件夹结构可见 `:170`），每组 ≤max(limit,2000)、总 3000。
3. **有 query**（`:186-214`）：匹配（前缀/子串/子序列 `:229-242`）→组内排序（前缀优先/目录优先/路径短优先 `:217-227`）→超限时**按两组命中占比分配配额**（保底各 ≥1 `:201-205`）。

## 4. 调用者与调用链

入向：remote-service（同批）Pocket `@` 检索端点。出向：`node:fs`/`node:path`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

只读目录遍历（readdir/stat/realpath）；无副作用。

## 6. 分支、失败、取消与恢复

无权限/已删目录跳过（`:74-78`）；坏路径不列（`:133-134`）；根不存在→空结果（`:97-105` 用例对应实现容错）。不适用取消/恢复。

## 7. 权限与权威状态

红线：客户端零授权根（`:7-8`）、denyPath 双查别名+realpath（`:126-135`）、边界与 `read_file_as_data_url` 同源（`:141-143`）。

## 8. 修改影响面

改检索语义 → Pocket `@` 候选集合与桌面一致性；改栅栏 → 私有目录元数据泄露面。

## 9. 测试证据

**直接测试 `remote-workspace-file-search.test.ts`（6 用例，NOT_RUN）**：双组路径形态、前缀目录优先、附加路径+忽略目录、缺失根容错、limit 配额、**根外不泄露**——断言见测试手册。未覆盖：denyPath 分支。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 2 导出+6 内部+两模式全链 | 已证实 | 逐行读 `:1-251` |
| 测试 6 用例断言 | 已证实 | 测试文件；NOT_RUN |
| 桌面端等价性 | 推断 | 注释自述 `:10-11` |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 检索全链 | §2/§3 | `:46-251` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
