---
path: apps/electron/src/main/lib/file-search-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 3659925b16e9b0082c2ab615451cfb92d915df5f
sha256: 696e4d597be9194b8ad8fc66a06e17463c1250f8e5a83e1f79df9f057a5308b8
lines: 214
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/file-search-service.ts

## 1. 结论与边界

授权根目录内异步查找同名文件（`searchFileCandidate`，头注 :55-58）：简单搜索 `maxResults=1`、深度搜索可多候选；受深度 16/条目 20000 上限约束；`denyPath` 为主进程派生的 owner 围栏（接口注释 :12「applies before traversal and before returning paths」）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `FileSearchRequest` | interface | 4-17 | targetName/targetPath/roots/maxDepth/alreadyFound/maxResults/signal/denyPath |
| `FileSearchCandidate` | interface | 19-21 | `{path}` |
| `FileSearchResult` | interface | 23-28 | candidate/candidates/done/cancelled |
| `searchFileCandidate` | fn | 60-214 | 主入口 |

内部：`SKIP_DIRECTORIES`（:30-40）、`SEARCHABLE_HIDDEN_DIRECTORIES={'.claude','.context'}`（:42）、`MAX_ENTRIES=20000`/`YIELD_EVERY=64`（:43-44）、`normalizePath`（:46-49，win32 小写）、`isPathInsideRoot`（:51-54）、`yieldToEventLoop`（:58-60）。

## 3. 内部逻辑与关键流程

1. **targetPath 完整路径模式**（:67-128）：取消检查→`denied(targetPath)`→已 found→`stat` 非文件→**`realpath` 双向校验**（目标与 roots 都取真实路径防 symlink 逃逸，注释 :87-88「已删除的附加目录不应让仍有效的授权根目录也失效」）→ 任一 denied→不在任何 realRoot 内→空结果；命中返回 `{candidate,candidates:[…]}`。
2. **同名递归模式**（:130-214）：`targetName` 归一（`basename`）；maxDepth clamp 0-16、maxResults clamp 1-50；`walk` 逐目录：取消/上限/denied 早退；每 64 条目 yield 事件循环；**只收普通文件**+名字全等（win32 小写）+`denied` 过滤+`isPathInsideRoot(candidate, directory)` 防链接穿越+`realpath` 复检（:190）；目录递归跳过 SKIP_DIRECTORIES 与隐藏目录（`.claude/.context` 除外，:200-201）。
3. 返回 `candidate=matches[0]`、`candidates`、`cancelled`。

## 4. 调用者与调用链

入向（r1 校订 NB66-F-02）：生产消费=`ipc.ts:427`（import+IPC 通道调用）与 `preload/index.ts`（渲染层桥）；另有 `file-search-service.test.ts`、`review-desktop-private-path.p04.test.ts` 测试引用。**`remote-service.ts` 零命中**（原归因错误已更正；「远程文件定位」为用途语义描述，消费点归 ipc/preload）。出向：`node:fs/promises`/`node:path`。

## 5. 数据 I/O、读写与副作用

只读目录遍历；yield 让出事件循环；无写盘/网络。

## 6. 分支、失败、取消与恢复

取消→`{done:true,cancelled:true}`；readdir/stat 异常→跳过继续；扫描期间删除的文件静默跳过（注释 :192-193）；无重试。

## 7. 权限与权威状态

- 围栏权威：`denyPath` 在遍历前和返回前双闸（:12 注释、:67/:74/:190）；`realpath` 防 symlink 逃逸（:87-88）。
- 隐藏目录默认跳过，仅 `.claude/.context` 可搜（Agent 上下文，:41-42）。
- 无 sender/role 检查（调用方注入 denyPath）。

## 8. 修改影响面

IPC 文件定位通道（`ipc.ts:427`）+渲染层桥（preload）；与 file-preview-service 的 `searchFileInDir`（同步、预检）互为补充。同测：`file-search-service.test.ts`（9 用例）+`review-desktop-private-path.p04.test.ts`（间接）。

## 9. 测试证据

直接测试 `file-search-service.test.ts`（9 用例 / 1 describe；真 mkdtemp+symlink；NOT_RUN）：
1. `:8-31` 深度逐个返回+alreadyFound 跳过（root→nested）。
2. `:33-54` 深度搜索一次收多候选（两嵌套路径）。
3. `:56-73` targetPath 命中只返回该路径（不搜同名）。
4. `:75-92` targetPath 不存在→空（不回退同名搜索）。
5. `:94-110` targetPath 在授权根外→空。
6. `:127-144` 深度查询最多返回该路径。
7. `:146-165` symlink 逃逸拒（根内链接指向根外文件→空）。
8. `:167-184` `.claude` 隐藏目录可搜。
9. `:186-202` 取消→`cancelled:true`+无候选。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| realpath 双防/symlink 拒/denyPath | 已证实 | :67-128 + 测试 :146-165 |
| 取消/上限/yield | 已证实（代码） | :130-214 + 测试 :186-202 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| targetPath 四拒+命中 | §3.1/§9 | 67-128 | covered |
| 同名递归+alreadyFound | §3.2/§9 | 130-214 | covered |
| denyPath 围栏 | §3 | 12/67/190 | covered（经测试 5/7） |
| MAX_ENTRIES/yield 极限 | §3 | 43-44 | covered（未测） |
