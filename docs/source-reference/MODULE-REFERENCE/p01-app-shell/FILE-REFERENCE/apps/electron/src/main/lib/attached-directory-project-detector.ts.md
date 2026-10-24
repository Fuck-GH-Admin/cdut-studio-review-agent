---
path: apps/electron/src/main/lib/attached-directory-project-detector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ae06c31c779f61464dfae79d7c0f4010aed38a3a
sha256: aaa2c0e0ac77175ec9282de8e16d8002a966db4b2962d756fdd36134a71067a7
lines: 195
kind: source
package: p01-app-shell
author: docs-r07-author-models-20261023
reviewer: docs-r07-qa-models-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/attached-directory-project-detector.ts

## 1. 结论与边界

**附加目录项目探测**（195 行）："对已授权附加目录做有限深度、只读的项目标志扫描。扫描结果只用于 Agent 上下文，不会改变 cwd 或写入用户目录"（`:126-127`）。

## 2. 导出与关键符号

| 符号 | 行 | 形状/行为 |
| --- | --- | --- |
| `AttachedProjectType` | `:4` | 'obsidian-vault'\|'git-repository'\|'node-project'\|'python-project' |
| `AttachedDirectoryProjectCandidate` | `:6-21` | 候选形状（name 不是路径不能替代 rootPath `:11`） |
| `detectAttachedDirectoryProjects` | `:129-195` | 有限深度扫描主函数 |

内部：`SKIPPED_DIRECTORY_NAMES:23-32`、`MAX_VISITED_DIRECTORIES=2000:34`（防巨型挂载盘+防旧"前 200 随机漏项目"）、`MAX_SCAN_DEPTH=3:35`、`hasNodeProjectIdentity:55-62`（**须有项目身份**防依赖缓存误报 `:54`）、`readGitRemote:64-80`（支持 worktree gitdir 文件 `:69-73`）、`detectProjectAt:82-123`（优先级 obsidian>git>node>python）。

## 3. 内部逻辑与关键流程

DFS 限深访问（`visitedDirectories` 预算+**排序后再受预算限制**防 readdir 顺序漏项目 `:155`）→逐目录四型判定→git 根注入子项目（repositoryRoot 最近 Git 根 `:173-187`）→按源目录序+路径序输出。

## 4. 调用者与调用链

附加目录上下文构建（Agent prompt 注入）；被 `attached-directory-project-detector.test.ts`（5 个 `test(`）覆盖。

## 5. 数据 I/O、读写与副作用

只读文件系统（stat/readdir/readFileSync）。

## 6. 分支、失败、取消与恢复

stat/readdir/JSON 解析失败静默跳过；预算耗尽即停。

## 7. 权限与权威状态

- **只读契约**（`:127`）：不改 cwd 不写用户目录。
- 优先级即判定权威（obsidian>git>node>python 单选）。

## 8. 修改影响面

改判定/预算影响 Agent 上下文项目清单；测试 5 用例锁定。

## 9. 测试证据

`attached-directory-project-detector.test.ts`（同批，5 个 `test(`）：Obsidian 嵌套识别/三型识别/node_modules 排除/依赖字段不误报/gitRemote+repositoryRoot 注入。`NOT_RUN`。

## 10. 已证实 / 推断 / 未知（照实记录）

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全文件/优先级/预算/只读契约 | 已证实 | 195 行全读（主根自读兜底） |
| 行为锁定 | 已证实 | 测试 5 用例 |
| **照实**：同目录多标志时 obsidian 赢（git 等被压掉，单选语义照实） | 已证实 | `:90-105` |
| 实效 | 未知 | NOT_RUN |

## 11. 覆盖表

全文件 covered；测试 §9。
