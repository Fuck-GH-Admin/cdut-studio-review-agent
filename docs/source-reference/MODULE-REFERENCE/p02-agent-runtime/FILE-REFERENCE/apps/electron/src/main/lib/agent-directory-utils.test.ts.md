---
path: apps/electron/src/main/lib/agent-directory-utils.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 12fa197484d91493f369888c598e165bb0285c43
sha256: b6a5c30fc739dcdef10dac741a11cd62d94127693142aeb12d6749822079f918
lines: 120
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/agent-directory-utils.test.ts

## 1. 测试目标

验证 `apps/electron/src/main/lib/agent-directory-utils.ts`：`collectAttachedDirectories` 的空值过滤/去重/来源聚合/工作区目录注入，`collectProductArtifactDirectories` 的存在性过滤与不含凭据目录。用 `PROFER_CONFIG_DIR` 环境变量隔离 config 根。不运行测试（`NOT_RUN`）。

## 2. 用例清单

用例数 9（`test(` 计数：:30/:35/:42/:49/:64/:79/:95/:106/:114），2 个 describe（:29/:105）。公共设置：`beforeEach` 保存并改写 `process.env.PROFER_CONFIG_DIR` 指向 mkdtemp 目录（:15-19）；`afterEach` 还原/删除环境变量并 rmSync（:21-27）。

`collectAttachedDirectories`（7 用例）：

| # | 用例（行） | 设置/动作 | 断言 |
| --- | --- | --- | --- |
| 1 | 空参数（:30） | `collectAttachedDirectories({})` | `toEqual([])`（:31-33） |
| 2 | extraDirs 去重（:35） | `['/a','/b','/a']` | `toEqual(['/a','/b'])`（:38-40） |
| 3 | 过滤 null/undefined（:42） | `['/a', undefined, null, '/b']`（as any） | `toEqual(['/a','/b'])`（:45-47） |
| 4 | 含会话级 attachedDirectories（:49） | sessionMeta 带 `['/session-a']` | `toContain('/session-a')`（:61-62） |
| 5 | attachedFiles 取父目录（:64） | `['/parent/file.txt','/other/doc.pdf']` | `toContain('/parent')`、`('/other')`（:75-77） |
| 6 | 合并去重保序（:79） | extraDirs ['/shared'] + session ['/shared','/unique/file.txt'] | `toEqual(['/shared','/unique'])`（:91-93） |
| 7 | 工作区注入（:95） | `workspaceSlug: directory-utils-<uuid>`（不创建目录） | `toContain(getAgentWorkspacePath(slug))`、`toContain(getWorkspaceFilesDir(slug))`（:100-102） |

`collectProductArtifactDirectories`（2 用例）：

| # | 用例（行） | 设置/动作 | 断言 |
| --- | --- | --- | --- |
| 8 | 只返回存在目录（:106） | mkdir `skins` 后调用（无参） | `toEqual([join(testDir,'skins')])`（:110-112） |
| 9 | 不含凭据路径（:114） | mkdir `skins` 后调用 | `some(dir => dir 含 channels/auth-tokens/sdk-config)` 为 `false`（:118） |

依赖顺序：独立（每用例新 tmp 根）。

## 3. 真实断言

- `:31-33`：`expect(result).toEqual([])`。
- `:38-40`：`expect(result).toEqual(['/a', '/b'])`。
- `:45-47`：`expect(result).toEqual(['/a', '/b'])`。
- `:61-62`：`expect(result).toContain('/session-a')`。
- `:75-77`：`expect(result).toContain('/parent')`、`expect(result).toContain('/other')`。
- `:91-93`：`expect(result).toEqual(['/shared', '/unique'])`。
- `:100-102`：`expect(result).toContain(workspaceDir)`、`expect(result).toContain(getWorkspaceFilesDir(slug))`。
- `:110-112`：`expect(result).toEqual([join(testDir!, 'skins')])`。
- `:118`：`expect(result.some((dir) => dir.includes('channels') || dir.includes('auth-tokens') || dir.includes('sdk-config'))).toBe(false)`。

## 4. 未覆盖与脆弱点

- 未覆盖：workspace 级 attached 目录/文件来源（用例 7 未创建 workspace，只断言根与 workspace-files 两个注入）、`statSync` 遇同名文件（非目录）的过滤、`dirname` 对相对/无目录路径、顺序断言（除 #6 外用 toContain 不锁顺序）。
- 脆弱点：用例 7 依赖 `getAgentWorkspacePath`/`getWorkspaceFilesDir` 的拼接结果与被测函数一致（同源调用 config-paths），本质是同构断言；用例 9 用字符串 `includes` 排除，若将来产物目录名含子串会误报。环境变量隔离是关键防线（beforeEach/afterEach 严格还原 :21-27）。
- mock/真实边界：真实文件系统 tmp 目录 + 真实 config-paths；无 mock 框架；workspace-manager 的 attached 来源返回空（未建 workspace）。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 9 用例计数与 `test(` 一致 | 已证实 | :30-114 |
| 断言行如 §3 | 已证实 | 逐行读 :31-118 |
| 去重/空值/父目录/工作区注入被断言 | 已证实 | #1-#7 |
| 存在性过滤/凭据排除被断言 | 已证实 | #8/#9 |
| 测试通过与否 | 未知（NOT_RUN） | 本轮未执行 |

## 6. 覆盖表

| 被测分支 | 用例 | 状态 |
| --- | --- | --- |
| 5 来源聚合/去重/空值 | #1-#6 | covered |
| workspace 注入 | #7 | partial |
| 产物目录过滤 | #8 | covered |
| 凭据排除 | #9 | covered |
| statSync 非目录/workspace attached 来源 | — | unknown |
