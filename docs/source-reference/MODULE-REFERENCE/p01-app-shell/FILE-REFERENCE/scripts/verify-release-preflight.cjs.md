---
path: scripts/verify-release-preflight.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 6b882acfc94fc9e42ed96afcb80cd01665634106
sha256: b041c93b4340b0a71b91321949c3038f1022a461eada62a6ea83a75c8d338b72
lines: 96
kind: source
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/verify-release-preflight.cjs

## 1. 结论与边界

**发布前置只读校验 CLI**（96 行 CJS）：在任何 SSH/SCP、git push/tag 或 GitHub Release 写入之前执行，防止 tag/Release 冲突留下半发布状态（头注释 `scripts/verify-release-preflight.cjs:2-8`）。校验五道门禁：版本元数据一致（package.json/CHANGELOG.json）、工作树干净、HEAD 包含 origin/main（或显式回填豁免）、本地/远端 tag 均不指向别的提交、GitHub Release 未被发布（或显式豁免）。边界：不执行任何发布写入——不建 tag、不 push、不写 Release；`gh release view` 只读（`scripts/verify-release-preflight.cjs:69`）。用法：`node scripts/verify-release-preflight.cjs <版本号> [--allow-published-release]`（`scripts/verify-release-preflight.cjs:7`、`:15`）。

## 2. 导出与关键符号

无导出（CLI）：参数 `<版本号>`（`process.argv[2]`，`scripts/verify-release-preflight.cjs:13`）与开关 `--allow-published-release`（`scripts/verify-release-preflight.cjs:14`，允许 HEAD 落后 origin/main 且放行已发布 Release 的「补资产回填」场景）。
关键内部符号（均标内部）：
- `run(command, cwd)`（内部，`scripts/verify-release-preflight.cjs:22-24`）：execSync，utf8，stdio:pipe，trim。
- `tryRun(command, cwd)`（内部，`scripts/verify-release-preflight.cjs:26-32`）：返回 `{ok, out}`，失败时 out 合并 stdout+stderr 或 error.message。
- `remoteTagTarget()`（内部，`scripts/verify-release-preflight.cjs:34-40`）：`git ls-remote --tags origin refs/tags/${tag} refs/tags/${tag}^{}`，优先取 peeled `^{}` 行的 SHA，无输出返回 null。
- `localTagTarget()`（内部，`scripts/verify-release-preflight.cjs:42-45`）：`git rev-list -n 1 refs/tags/${tag}`，失败返回 null。
- `assertMetadata()`（内部，`scripts/verify-release-preflight.cjs:47-54`）、`assertCleanWorktree()`（内部，`:56-59`）、`assertTagTargets(head)`（内部，`:61-66`）、`assertExistingRelease()`（内部，`:68-78`）。
- 常量：`root`/`electron`/`tag`/`repo='Nya-Angle/CDUT-Studio'`（`scripts/verify-release-preflight.cjs:17-20`）。

## 3. 内部逻辑与关键流程

按真实执行顺序（`scripts/verify-release-preflight.cjs:80-96` 主流程 + 前置声明）：
1. 参数校验：无版本号 → 抛用法错误（`scripts/verify-release-preflight.cjs:15`），短路。
2. `assertMetadata()`（`scripts/verify-release-preflight.cjs:80`→`:47-54`）：读 `apps/electron/package.json` 与 `apps/electron/resources/CHANGELOG.json`；`pkg.version !== version` → 抛（`:50`）；`changelog.releases` 非数组或首条版本不等于 version → 抛（`:51-53`）。状态：两文件版本必须与 CLI 参数一致。
3. `assertCleanWorktree()`（`scripts/verify-release-preflight.cjs:81`→`:56-59`）：`git status --porcelain=v1` 非空 → 抛「工作树不干净」（`:57`）；`git diff --check` 失败 → 抛「存在空白错误」（`:58`）。
4. `run('git fetch origin --prune')`（`scripts/verify-release-preflight.cjs:82`）：网络同步远端引用。
5. 分叉检查（`scripts/verify-release-preflight.cjs:83-92`）：`git merge-base --is-ancestor origin/main HEAD` 失败时，若无 `--allow-published-release` → 抛「本地 main 未包含最新 origin/main」（`:88-89`）短路；有开关 → `console.warn` 回填提示并继续（`:91`）。
6. `head = run('git rev-parse HEAD')`（`scripts/verify-release-preflight.cjs:93`）。
7. `assertTagTargets(head)`（`scripts/verify-release-preflight.cjs:94`→`:61-66`）：本地 tag 或远端 tag 存在但 ≠ head → 各抛「拒绝覆盖已有 tag」（`:64`、`:65`）。
8. `assertExistingRelease()`（`scripts/verify-release-preflight.cjs:95`→`:68-78`）：`gh release view` 失败时仅当输出匹配 `/not found|release not found|HTTP 404/i` 视为不存在放行（`:70-71`），否则抛「无法确认…」（`:72`）；已存在且 `isDraft===false` 且无开关 → 抛「拒绝覆盖已发布版本」（`:75-76`）。
9. 全部通过 → 打印 `[release-preflight] ${tag} -> ${head} OK`（可带「（允许补充已发布 Release 资产）」后缀，`scripts/verify-release-preflight.cjs:96`），进程 exit 0（隐式）。

## 4. 调用者与调用链

- 入向（grep 冻结树 `verify-release-preflight`）：
  - `scripts/push-release.cjs:235` `run('node scripts/verify-release-preflight.cjs ${VERSION}')`（Windows 发布第 0 步，`scripts/push-release.cjs:234` 注释：必须先完成所有只读预检）。
  - `scripts/push-mac-release.cjs:98` `run('node scripts/verify-release-preflight.cjs ${VERSION} --allow-published-release')`（macOS 补资产第 0 步）。
  - 文档提及：`work/reports/2026-10-03-collaborator-sync-review.md`（非调用）。
- 出向：`require('node:child_process')`（`scripts/verify-release-preflight.cjs:9`）、`require('node:fs')`（`:10`）、`require('node:path')`（`:11`）；关键调用点：`git ls-remote`（`:35`）、`git rev-list`（`:43`）、`git status`/`git diff --check`（`:57-58`）、`git fetch`（`:82`）、`git merge-base`（`:83`）、`git rev-parse`（`:93`）、`gh release view`（`:69`）、`fs.readFileSync`×2（`:48-49`）。
- 否定结论检索范围：冻结树全量 grep `verify-release-preflight`，无测试文件引用本脚本（0 个 `it(`/`test(` 消费点）；`.github/workflows/` 8 个 workflow 全量 grep 无命中（发布链路刻意本地化，参见 `apps/electron/electron-builder.yml:214` 注释）。

## 5. 数据 I/O、读写与副作用

- 磁盘读：`apps/electron/package.json`、`apps/electron/resources/CHANGELOG.json`（`scripts/verify-release-preflight.cjs:48-49`，只读）。
- 网络：`git ls-remote`（`:35`）、`git fetch origin --prune`（`:82`）、`gh release view`（`:69`）。唯一本地状态写入是 `git fetch` 更新 remote-tracking refs（git 内部写，`:82`）；对发布面（tag/Release/更新源）零写入——符合「只读预检」定位。
- 幂等：是——重复执行结果一致（不改发布面）；无原子性问题（不产出文件）。

## 6. 分支、失败、取消与恢复

- 无显式 exit code 语句；失败路径全部 `throw` → 未捕获异常 → node 退出码 1；成功退出码 0（隐式，`scripts/verify-release-preflight.cjs:96`）。
- 失败分支与错误文案：用法（`:15`）、package.json 版本不符（`:50`）、CHANGELOG 首条版本不符（`:52`）、工作树不干净（`:57`）、空白错误（`:58`）、本地 tag 冲突（`:64`）、远端 tag 冲突（`:65`）、gh 状态不可确认（`:72`）、Release 已发布（`:76`）、main 分叉（`:89`）。
- 失败后状态：无发布面残留（§5）；`git fetch` 已更新的 remote-tracking refs 不回滚（属良性）。
- 重试/恢复：人工修复后重跑（提交/清理工作树、修正版本文件、处理分叉、删除冲突 tag 等）；无自动重试。取消：不适用，依据：无异步/信号处理（同步 execSync 串行执行）。

## 7. 权限与权威状态

- 权限读取点：`gh release view`（`scripts/verify-release-preflight.cjs:69`）依赖 gh CLI 登录态（GH_TOKEN/GITHUB_TOKEN 或 gh auth 凭据，具体来源未知——本文件不读任何凭据变量，经检索全文无 env 引用）；`git ls-remote`/`git fetch`（`:35`、`:82`）依赖 `origin` 远端凭据（间接）。
- 权威状态：tag 归属以「tag 必须指向 HEAD」为权威（`:61-66`）；Release 权威状态取自 gh CLI 的 `isDraft`（`:69-77`）；`--allow-published-release`（`:14`）是唯一豁免开关，仅放宽「HEAD 落后 origin/main」与「Release 已发布」两门禁，不放宽 tag/工作树约束（注释 `scripts/verify-release-preflight.cjs:84-87` 明示）。

## 8. 修改影响面

- 门禁语义变化直接影响两条发布主链的第 0 步：`scripts/push-release.cjs:235`（Windows）、`scripts/push-mac-release.cjs:98`（macOS 补资产）；放宽校验会重新引入头注释（`scripts/verify-release-preflight.cjs:5-6`）警示的半发布状态。
- 改动 `repo` 常量（`:20`）影响 `gh release view` 目标仓库；改动 `assertMetadata` 读取路径（`:48-49`）影响版本一致性门禁覆盖面。
- 具体路径：`apps/electron/package.json`、`apps/electron/resources/CHANGELOG.json`（被读）；`scripts/push-release.cjs`、`scripts/push-mac-release.cjs`（被调用方）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。直接测试：无（grep `verify-release-preflight` 无任何 `*.test.*` 命中；本文件 `it(`/`test(` 用例声明 0——字面 `.test(` 命中 1 处为正则 `.test(result.out)`（`scripts/verify-release-preflight.cjs:71`），非测试用例）。间接证据：无测试断言覆盖本脚本；仅 `work/reports/2026-10-03-collaborator-sync-review.md` 有叙述性提及（非测试）。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 五道门禁逻辑、错误文案、flag 语义 | 已证实 | `scripts/verify-release-preflight.cjs:1-96` 全文 |
| 两个调用点及参数差异 | 已证实 | `scripts/push-release.cjs:235`、`scripts/push-mac-release.cjs:98` |
| 退出码 1=throw/0=隐式成功 | 推断 | 全文无 process.exit，node 未捕获异常语义 |
| gh CLI 凭据来源 | 未知 | 全文无 env/凭据引用，检索无果 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| CLI 参数与开关 | §2 | 13-15 | covered |
| `run`/`tryRun`（内部） | §2/§3 | 22-32 | covered |
| `remoteTagTarget`/`localTagTarget`（内部） | §2/§3 | 34-45 | covered |
| `assertMetadata` | §3/§6 | 47-54 | covered |
| `assertCleanWorktree` | §3/§6 | 56-59 | covered |
| `assertTagTargets` | §3/§6 | 61-66 | covered |
| `assertExistingRelease`（含 404 放行分支） | §3/§6 | 68-78 | covered |
| 主流程与分叉豁免 | §3/§6 | 80-96 | covered |
| 调用链 | §4 | 235/98 | covered |
| 运行验证 | §10 | - | unknown（NOT_RUN） |
