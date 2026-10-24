---
path: apps/electron/src/main/lib/pi-file-checkpoint.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 5be8d0ae5215993bfa73736e63482e68e327408d
sha256: 5837a47813109eaf607a93e87f1dd022b4892f01a1f567f91445aa844775f261
lines: 698
kind: test
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/pi-file-checkpoint.test.ts

## 1. 测试目标

`pi-file-checkpoint`（检查点引擎主模块，跨批）与其 git 层 `pi-checkpoint-git`（批内）的行为契约（698 行，bun:test）：改/建/删回退、排除规则、超大/超量/不可读/符号链接保护、git 引擎 dedup/防篡改/用户仓库零接触/逐字节还原、引擎降级与 legacy manifest 兼容、分叉基线迁移、检查点回收。**mock 边界**：无 `mock.module`——`__setGitExecutableForTest(null)` 是被测模块自带测试钩子（模拟"无 git"），git 引擎用例经 `sh()`（`execSync`，`:17`）**真实执行 git**；文件系统全部真实（mkdtemp 临时根）。被测对象：`./pi-file-checkpoint` 7 个导出（`:6-14`）+ `./pi-checkpoint-git` 4 个导出（`:15`）。

## 2. 用例清单

前置（`:17-46`）：`hasGit = isGitSnapshotAvailable()`（`:20`）；`gitOnly = test.skipIf(!hasGit)`（`:21`）；`ENGINES = hasGit ? ['git','copy'] : ['copy']`（`:24`）；`afterEach` 清临时根+`__setGitExecutableForTest(undefined)` 复位（`:27-31`）；`makeTempRoot`（`:33-37`）；`writeBrowserProfile` 造 Chromium user-data-dir 特征（`Local State`+`Default/Network/Cookies`，`:39-46`）。

**计数口径**（机械计数 + skipIf 语义）：源码声明 **32 test**（`for (const engine of ENGINES)` 循环体 8（`:48-230`）+ 固定 24：git 引擎特性 6（5 `gitOnly`+1 普通，`:232-350`）、沙箱路径校验 1（`test.skipIf(process.platform!=='win32')`，`:352-376`）、引擎降级与历史兼容 6（`:378-475`）、分叉基线迁移 4（3 普通+1 `gitOnly`，`:477-567`）、回收 7（4 普通+3 `gitOnly`，`:569-698`）。`it(` 计数 0。运行实例数=声明按引擎循环展开并扣除 skipIf：**有 git：win32 40 / 非 win32 39**（沙箱用例跳过）；**无 git：win32 23 / 非 win32 22**（9 个 gitOnly 跳过）。

**循环体 8 用例**（每个引擎各跑一遍；设置统一：temp root + `cwd` + `checkpointRoot`）：

| # | 用例 | 行 | 动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | 修改/新建/删除后回退到本轮基线 | 50-70 | 基线 2 文件→checkpoint({mode:engine})→改/建/删→restore | changed 含三文件；内容回基线；created 抛错 |
| 2 | 依赖/构建产物/浏览器 profile 只抓 agent 产物 | 72-103 | .git/node_modules/dist/LOCK/.context/evidence+Cookies→checkpoint→restore | files==['.context/evidence/report.md']；skipped==[]（静默排除）；Cookies/node_modules/dist 存活；changed 按引擎差异（git 空/copy 重写报告） |
| 3 | 超大文件不入基线但存活且回退不完备 | 105-126 | maxFileBytes:4→checkpoint→改大文件→restore | files==['small.txt']；skipped 含 big.bin；big.bin 保持 turn 值；incomplete==true |
| 4 | 总量预算超限→partial 且回退跳过删除 | 128-143 | maxTotalBytes:3→checkpoint→建新文件→restore | partial==true；files==[]；created.txt 存活（不删） |
| 5 | 不可读目录→目录级保护 | 145-167 | chmod 0o000 blocked/→checkpoint→restore→chmod 恢复 | files==[]；skipped 含 {path:'blocked',kind:'dir'}；secret.txt 存活（win32/root 直接 return 跳过） |
| 6 | 整目录删除可回退 | 169-183 | 基线嵌套目录→删整个 .context/evidence→restore | 两文件内容恢复 |
| 7 | 外部 symlink 不遍历不删除 | 185-210 | symlink cwd/external→outside→checkpoint→外部写文件→restore | files==['tracked.txt']；skipped 含 {path:'external',kind:'dir'}；outside/new.txt 存活；external 仍 symlink；incomplete==true |
| 8 | 基线文件变目录→文件替换目录 | 212-228 | 基线 node 为文件→换成目录+新文件→restore | node 恢复为文件；skipped 不含 node |

**固定 24 用例**（要点）：

| # | 用例 | 行 | 断言要点 |
| --- | --- | --- | --- |
| 9 | git：未变快照复用 dedup | 233-247 | second.path===first.path；改动后 third.path!==first.path |
| 10 | git：同为空树但保护语义不同不去重 | 249-266 | partial.path!==empty.path；partial==true；基线遗漏文件存活、turn 文件不删；incomplete==true |
| 11 | git：篡改 treeSha→报失败不空成功 | 268-286 | manifest.treeSha 清零→restore：failed==true；changed==[]；skipped 含 {path:'.'}；文件保持 turn 值 |
| 12 | git：用户仓库 HEAD/索引/对象/stash 零变化 | 288-321 | 真 git init+commit；checkpoint 后 HEAD/status/count-objects 不变、stash==''；.gitignore 不豁免（ignored.txt/pages 入基线）；回退逐字节 |
| 13 | git：二进制/CRLF 逐字节还原 | 323-339 | Buffer.equals(binary)==true；crlf 原样 |
| 14 | toGitPath/fromGitPath 分隔符 | 341-349 | win32 双向转换；非 win32 恒等 |
| 15 | 沙箱路径校验（win32-only） | 353-375 | 盘符大小写不同仍判定合法（toLowerCase 后 isAgentWorkspaceSandbox true/false）；临时删除 NODE_ENV/BUN_TEST 关容错 |
| 16 | 无 git 自动降级 copy | 379-393 | 钩子 null→engine=='copy'；回退成功 |
| 17 | 无 git 强制 git→显式失败 | 395-401 | createPiFileCheckpoint 抛错 |
| 18 | .gitattributes 改写→跳 git 用 copy 保字节 | 403-417 | engine=='copy'；crlf 逐字节 |
| 19 | legacy v1（纯数组 manifest）可回退 | 419-432 | changed==['file.txt']；内容回基线 |
| 20 | legacy v2（skipped 保留） | 434-459 | file.txt 回基线；locked.bin 保持 turn 值；incomplete==true；skipped 含 locked.bin |
| 21 | legacy 路径逃逸→写前拒绝 | 461-474 | loadPiFileCheckpoint 抛'无效路径'；外部 victim.txt 不变 |
| 22 | 分叉迁移后源删仍可回退 | 478-510 | failed==[]；adopted 2 项均在 fork-session 下；源目录删除后回退成功；manifest.dir 指向目标影子仓库 |
| 23 | copy 引擎 adopt 复制 | 512-532 | 源删后回退仍回基线 |
| 24 | git fetch 只带可达对象 | 534-554 | 目标 cat-file 成功；later commit 抛错（不在目标） |
| 25 | 缺失基线→报 failed 不静默 | 556-566 | adopted=={}；failed 有 1 项 |
| 26 | 回收：未引用回收+超限从最旧删 | 570-600 | removed==[oldest]；他会话不受影响；maxCount:1 时 removed==[middle]、removedBound==1、newest 存活 |
| 27 | git：全删释放 shadow.git | 602-616 | releasedRepo==true；shadow.git 不存在 |
| 28 | git：孤儿 ref 清理 | 618-631 | prune 后 show-ref 抛错（ref 已删） |
| 29 | git→copy 回退遗留空仓库释放 | 633-653 | fallback.engine=='copy'；releasedRepo==true；dir 不存在 |
| 30 | 他会话引用保留（迁移失败兼容路径） | 655-667 | removed==[]；shared.path 存活 |
| 31 | 无 manifest 陈旧目录 GC、新鲜保留 | 669-682 | removed==[stale]（1 小时前 mtime）；fresh 存活 |
| 32 | remove 只删本会话 | 684-697 | 本会话目录不存在；other.path 存活 |

依赖顺序：循环体用例各自独立；固定用例中 22/23/24 依赖 adopt/prune 语义；26-32 依赖 utimesSync 操控 mtime（`:583-586`/`:677-678`）；15 保存/恢复 3 个环境变量（`:354-356`/`:367-374`）。

## 3. 真实断言

逐用例断言引用（节选关键 expect 行，全部用例的断言面见 §2 表）：
- `:66-69` `changed` toEqual arrayContaining(modified/created/deleted)；`modified.txt` toBe 'before'；`deleted.txt` toBe 'still here'；readFileSync(created) toThrow。
- `:89-102` `files` toEqual ['.context/evidence/report.md']；`skipped` toEqual []；Cookies/node_modules/dist 存活；`changed` not.toContain 排除项；引擎差异断言 `engine === 'git' ? [] : ['.context/evidence/report.md']`。
- `:115-125` `files` toEqual ['small.txt']；`skipped.map(path)` toEqual ['big.bin']；big.bin toBe 'turn-blob'；`incomplete` toBe(true)。
- `:136-142` `partial` toBe(true)；`files` toEqual []；created.txt toBe 'new'（不删）。
- `:157-163` `files` toEqual []；skipped toEqual [objectContaining({path:'blocked',kind:'dir'})]；secret.txt toBe 'cannot read'。
- `:196-209` `files` toEqual ['tracked.txt']；skipped arrayContaining({path:'external',kind:'dir'})；outside/new.txt 存活；`lstatSync(external).isSymbolicLink()` toBe(true)；`incomplete` toBe(true)。
- `:225-227` `lstatSync(node).isFile()` toBe(true)；node toBe 'baseline-file'；skipped not.toContain 'node'。
- `:242-246`/`:258-265` dedup 与 partial 不去重断言（path 比较+incomplete）。
- `:282-285` `failed` toBe(true)；`changed` toEqual []；skipped arrayContaining({path:'.'})；file.txt toBe 'turn value'。
- `:308-320` 用户仓库 `rev-parse HEAD`/`status --porcelain`/`count-objects -v` 三者 toBe before 值；`stash list` toBe ''；files arrayContaining(ignored.txt/pages/index.md/src/app.ts)；回退后内容 toBe 基线值。
- `:337-338` `readFileSync(blob.bin).equals(binary)` toBe(true)；crlf toBe 'line1\r\nline2\r\n'。
- `:365-366` `isAgentWorkspaceSandbox(lowercase)` toBe(true)/toBe(false)。
- `:388-400` engine toBe 'copy'；forced git toThrow。
- `:430-431`/`:455-458`/`:472-473` legacy 三用例断言（changed==['file.txt']、skipped 含 locked.bin、toThrow('无效路径')+外部文件不变）。
- `:493-509` failed==[]；adopted keys length 2；targetPath startsWith(fork-session)；回退后 toBe 'turn-1 baseline'；manifest.dir startsWith(fork-session)。
- `:552-553` `git cat-file -e <commitSha>^{commit}` toBe ''；later commitSha toThrow。
- `:564-565` adopted toEqual {}；failed length 1。
- `:589-599` removed toEqual [oldest.path]；otherSession 存活；maxCount 时 removed==[middle.path]、removedBound toBe(1)。
- `:613-615` releasedRepo toBe(true)；shadow.git 不存在。
- `:630` show-ref toThrow（孤儿 ref 已删）。
- `:651-652` releasedRepo toBe(true)；空仓库目录不存在。
- `:665-666`/`:680-681`/`:694-696` 引用保留/GC 新鲜保留/只删本会话断言。

## 4. 未覆盖与脆弱点

- **未覆盖**：`pi-file-checkpoint.ts` 的部分内部实现面（跨批，见 §5 边界）；`createPiFileCheckpoint` 默认排除清单的完整枚举（用例 2 只样本验证 .git/node_modules/dist/LOCK/profile Cookies）；`adoptPiFileCheckpoints` 的 git fetch 失败分支；`prunePiFileCheckpoints` 的 maxCount≤0/负值；并发快照/回退交错。
- **脆弱点**：用例 12 依赖本机 git 配置行为（`sh()` 真实执行）；用例 15 仅 win32 运行（非 win32 恒跳过）；用例 5 在 root/Windows 直接 return（`:146`，用例退化为无断言通过）；mtime 操控（`:583-586`/`:677`）依赖文件系统时间精度；`gitOnly` 在无 git 环境整体跳过 9 用例。
- 断言≠运行：本轮 `NOT_RUN`，bun test 未执行；若执行将真实 spawn git/写临时目录。Windows/root 分支（用例内 return）实际行为未知。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 32 声明的结构/计数、各用例设置动作断言 | 已证实 | `:1-698` 全文逐行 + 机械计数（test( 22 + test.skipIf( 1 + gitOnly( 9 + it( 0） |
| 运行实例口径（40/39/23/22） | 已证实（推导） | `:20-24` ENGINES/gitOnly/skipIf 语义 |
| mock 边界=无 mock.module、git 引擎真实执行 | 已证实 | `:1-17` 全文 |
| `pi-file-checkpoint.ts` 内部实现 | 边界（跨批未深读） | `:6-14` 引入（另一批主册） |
| 真实运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 循环体 8（两引擎） | §2 表 1-8 | 50-228 | covered |
| git 引擎特性 6 | §2.9-14/§3 | 233-349 | covered |
| 沙箱校验 1 | §2.15 | 353-375 | covered |
| 降级/兼容 6 | §2.16-21 | 379-474 | covered |
| 分叉迁移 4 | §2.22-25 | 478-566 | covered |
| 回收 7 | §2.26-32 | 570-697 | covered |
| win32/root 分支实际行为 | §4 | - | unknown |
