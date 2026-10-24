---
path: apps/electron/src/main/lib/review/review-desktop-private-path.p04.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 4be591f3b2e02170e1ddaac7b4694e6a5a0b82c4
sha256: dfbc8e3632aa45edc60f3603acc197827ecbf012b43f7eba7590c1ef710c2d73
lines: 196
kind: test
package: p05-review-engine
author: docs-r07-author-nb-30-20261023
reviewer: p04-review-case-core
status: authored
evidence: static
---
# apps/electron/src/main/lib/review/review-desktop-private-path.p04.test.ts

## 1. 测试目标

P04-PATH-01 **path-only** 桌面预览/文件系统协议边界（`apps/electron/src/main/lib/review/review-desktop-private-path.p04.test.ts:2-3`）：合成夹具、无真实 Electron 窗口与用户文件。被测对象（批外）：`review-private-file-access`（4 函数）、`preview-path-policy`、`local-file-protocol`、`file-search-service`。

夹具（`:20-40`）：tmp 沙箱 + `fixture()`（真实 workspace/双会话 + 私有/普通/共享三文件）；`file()` 写合成文件。真实文件操作（rename/HTTP Request）在沙箱内实测。

## 2. 用例清单

共 **14 个 `test(`**（1 个 `describe`）：

| # | 行 | 用例 | 要点 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | 42-51 | 私有目录/文件拒，同工作区普通文件放行 | `isReviewPrivateDesktopPath`/`isReadOnlyPreviewPathAllowed` 6 断言 | 独立 |
| 2 | 53-67 | realpath 符号链接别名（共享区/配置外）不可绕围栏 | 文件/目录/子文件/外部别名 4 路径 | 独立 |
| 3 | 69-80 | 转写/检查点路径拒绝；删除后墓碑仍守卫 | 删 owner 后重写残留再断言 | 独立 |
| 4 | 82-91 | 列表策略隐藏私有子项**名字**（非仅内容） | `filterOrdinaryDesktopFileEntries` | 独立 |
| 5 | 93-101 | 破坏性 IPC 不得改私有根/共享容器 | `isUnsafeAgentWorkspaceMutationPath` 6 断言 | 独立 |
| 6 | 103-108 | token 门控协议拒注册私有文件/根 | 2 toThrow + 共享注册成功 | 独立 |
| 7 | 110-118 | 普通父目录 URL 不可取私有后代 | `handleProferFileRequest` → 403 | 独立 |
| 8 | 120-129 | 文件候选搜索不回隐藏私有名 | `searchFileCandidate` 3 断言（含显式 targetPath） | 独立 |
| 9 | 131-138 | owner 删除后目录 URL 仍拒（token 有效） | 403 | 独立 |
| 10 | 139-151 | 守卫 rename 不可覆盖既有转写；普通 rename 正常 | toThrow + 双文件内容不变 + 正常 rename | 独立 |
| 11 | 153-160 | 守卫 move 不可在 review 工作区造新文件 | toThrow + 目标不存在 | 独立 |
| 12 | 162-176 | 符号链接父下缺失目标也守卫；普通移动成功 | 2 toThrow/放行 | 独立 |
| 13 | 178-187 | 删除墓碑挡 rename 进残留私有路径 | toThrow + 残留不存在 | 独立 |
| 14 | 189-194 | 守卫变更拒共享工作区容器 | toThrow | 独立 |

## 3. 真实断言

（抽样锚；全 14 用例逐条见 §2 要点）：`:44-50` 六布尔断言；`:62-65` 4 别名路径双断言；`:73-79` 删前后守卫恒真；`:90` `toEqual(['normal.md','shared.md'])`；`:95-100` 六布尔；`:105-107` toThrow `'审核内部会话路径不可注册'`×2 + `toMatch(/^cdut-file:\/\//)`；`:116` `response.status` toBe 403；`:124-128` `candidates` toEqual `[]`×2 + toContain 真实路径；`:143-150` toThrow `'审核内部或共享容器路径不可操作'` + 双内容不变 + 普通 rename 成功；`:157-159,168-175,184-186,191-193` 各拒/放行断言。

## 4. 未覆盖与脆弱点

- 被测 4 模块全批外；本文件只锚边界行为。
- `registerProferFilePath(shared)` 只断言前缀（token 语义未测）。
- Windows 路径分隔符/大小写不敏感性未测（沙箱为 POSIX）。
- 并发 rename 竞态未测。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 14 test/1 describe、真实文件操作断言 | 已证实 | `:41-195` |
| 符号链接 realpath 围栏 | 已证实 | `:53-67` |
| 墓碑跨删除守卫 | 已证实 | `:69-80,178-187` |
| 列表名字级隐藏 | 已证实 | `:82-91` |
| 测试通过与否 | 未知 | NOT_RUN |
| 被测实现/Win32 行为 | 未知 | 批外/未测 |

## 6. 覆盖表

| 被测分支 | 章节 | 用例 | 状态 |
| --- | --- | --- | --- |
| 路径判定/预览放行 | §2/§3 | 1-3 | covered |
| 列表过滤 | §2/§3 | 4 | covered |
| 变更守卫 | §2/§3 | 5,10-14 | covered |
| 协议注册/取文件/搜索 | §2/§3 | 6-9 | covered |
| Win32/并发 | §4 | — | unknown |
