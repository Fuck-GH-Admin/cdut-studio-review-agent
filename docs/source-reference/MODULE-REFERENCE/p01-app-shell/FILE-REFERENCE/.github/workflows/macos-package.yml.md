---
path: .github/workflows/macos-package.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 0b65f0575a4b4cde07f9b8be0da02d26dfacc158
sha256: 04a875e0ad2a3a1859e9137d75b4e40b474be021199b1df427e0eaa53d9eea1a
lines: 105
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/macos-package.yml

## 1. 结论与边界

GitHub Actions workflow `macOS Package Verification`（105 行）：手动 dispatch 的 macOS arm64 打包验证——在 `macos-14` 上对指定 ref 做安装/版本一致性/typecheck/边界检查/跨平台打包测试、`dist:mac` 打包、updater 元数据校验，并上传可安装产物。单 job `build-macos-arm64`，无发布动作（仅 upload-artifact）。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/macos-package.yml:1` | macOS Package Verification |
| on.workflow_dispatch.inputs.ref | `:4-9` | required: true，default: main（"要构建的分支、tag 或 commit SHA"） |
| permissions | `:11-12` | contents: read |
| concurrency | `:14-16` | group `macos-package-${{ inputs.ref }}`，cancel-in-progress: true |
| jobs.build-macos-arm64 | `:18-21` | name `build (macos-14, darwin, arm64)`，runs-on macos-14 |
| env.NODE_OPTIONS | `:23-24` | `--max-old-space-size=6144`（注释 `:22`：renderer 含 OOXML/WASM，Node 默认约 2 GiB 堆不足） |
| steps | `:26-105` | 11 步（见 §3） |
| 上传动作 | `:96` | actions/upload-artifact@v4 |

无 secrets、无 matrix（单 runner 单架构）、无 actions/cache、无 `if:`/`continue-on-error`（依据：全文无这些键）。

## 3. 内部逻辑与关键流程

job `build-macos-arm64` 的 11 个 step（`.github/workflows/macos-package.yml:26-105`）：
1. Checkout `actions/checkout@v4`，`ref: ${{ inputs.ref }}`（`:27-30`）；
2. Setup Bun `oven-sh/setup-bun@v2`，`bun-version: 1.4.2`（`:32-35`）；
3. Setup Node.js `actions/setup-node@v4`，node 22（`:37-40`）；
4. Install dependencies（`:42-52`）：优先 `bun install --frozen-lockfile`，失败则 `::warning::` 降级 `bun install` 并打印 `bun.lock` 差异（`git --no-pager diff --stat/-- bun.lock`，`:46-52`）；注释 `:43-45` 说明 darwin 与 Windows 生成的 bun.lock 有平台级物化差异；
5. Verify app version and changelog（`:54-59`）：`node -p` 取 `apps/electron/package.json` 的 version 与 `apps/electron/resources/CHANGELOG.json` 的 `releases[0].version`，`test` 相等否则失败；
6. Typecheck workspace（`:61-62`，`bun run typecheck` → 根 `package.json:24`）；
7. Check package boundaries（`:64-65`，`bun run check:boundaries` → 根 `package.json:25` → `scripts/check-boundaries.ts`）；
8. Run cross-platform packaging tests（`:67-78`）：`bun test --isolate --max-concurrency=1 --timeout 30000` 指定 6 个测试文件——`apps/electron/scripts/package-closure.test.ts`（`:73`）、`build-cli-runtime.test.ts`（`:74`）、`ui-workspace-contract.test.ts`（`:75`）、`packages/ui/src/markdown-preview.test.tsx`（`:76`）、`packages/session-core/src/session-core.test.ts`（`:77`）、`packages/project-core/src/project-core.test.ts`（`:78`）；注释 `:68-70` 说明全量集合含 Windows PowerShell 专用与 macOS `/private/var` 别名路径比较测试，不应阻断 macOS 包构建；
9. Build and package macOS arm64（`:80-89`，working-directory `apps/electron`）：打印 `HEAD=$(git rev-parse HEAD)`、worktree 脏状态、`sed -n '1,18p' scripts/build-ooxml.mjs` 头部、`node -e "console.log(require.resolve('@silurus/ooxml'))"`（`:83-88`），然后 `bun run dist:mac`（`:89`）→ `apps/electron/package.json:60`（`scripts/dist.ts --mac --current-arch --no-sign`）；
10. Verify macOS updater metadata（`:91-93`，working-directory `apps/electron`，`bun run verify:mac-update-assets` → `apps/electron/package.json:35` → `scripts/verify-macos-update-assets.cjs`）；
11. Upload macOS installable artifacts（`:95-105`）：`actions/upload-artifact@v4`，name `CDUT-Studio-macOS-arm64-${{ inputs.ref }}`（`:98`），路径 `apps/electron/out/latest-mac.yml`、`out/*.dmg`、`out/*.zip`、`out/*.blockmap`（`:100-103`），`if-no-files-found: error`（`:104`），`retention-days: 14`（`:105`）。

## 4. 调用者与调用链

- 入向：仅 `workflow_dispatch`（`.github/workflows/macos-package.yml:4`，inputs.ref）；无 `workflow_call`，冻结树检索无其它 workflow/文档引用本文件（`macos-package` 字符串命中仅为 `scripts/verify-macos-package.cjs` 及 `apps/electron/package.json:62` 的 `verify:mac-package` 脚本名，与本 workflow 无引用关系）。
- 出向：`actions/checkout@v4`/`oven-sh/setup-bun@v2`/`actions/setup-node@v4`/`actions/upload-artifact@v4`（`:28`、`:33`、`:38`、`:96`）；npm 脚本 `typecheck`（`package.json:24`）、`check:boundaries`（`package.json:25`）、`dist:mac`（`apps/electron/package.json:60`）、`verify:mac-update-assets`（`apps/electron/package.json:35`）；直接展示 `apps/electron/scripts/build-ooxml.mjs`（`:86`）与 `@silurus/ooxml` 解析（`:88`）；读 `apps/electron/package.json`、`apps/electron/resources/CHANGELOG.json`（`:56-57`）。不调用其它 workflow。

## 5. 数据 I/O、读写与副作用

写 `node_modules`（`:47`/`:49`）、构建/打包产物 `apps/electron/out/`（`dist:mac`，`:89`）；上传 4 类产物到 Actions artifact（`:95-105`）。无 actions/cache（依据：全文无 cache 键）。降级安装分支会打印 lockfile 差异但不回写（`:50-51` 仅 diff 输出）。

## 6. 分支、失败、取消与恢复

`concurrency` 按 `inputs.ref` 分组、同 ref 新运行取消旧运行（`.github/workflows/macos-package.yml:14-16`）。唯一容错点：frozen 安装失败降级非冻结安装（`:46-52`，`|| true` 保护 diff 命令）；其余步骤失败即 job 失败，无 `continue-on-error`。版本一致性用 `test` 失败即中止（`:58`）；产物缺失 `if-no-files-found: error`（`:104`）。无超时配置（未知上限）。

## 7. 权限与权威状态

GITHUB_TOKEN 仅 `contents: read`（`.github/workflows/macos-package.yml:11-12`）；无 secrets（全文无 `secrets.`），且 `dist:mac` 为 `--no-sign`（`apps/electron/package.json:60`），不涉及签名凭据。版本权威=`apps/electron/package.json` version 与 `CHANGELOG.json` `releases[0].version` 一致（`:54-59`）。

## 8. 修改影响面

macOS arm64 可安装产物（dmg/zip/latest-mac.yml/blockmap）的构建验证与留存；跨平台打包测试子集（§3 第 8 步 6 文件）是安装包/CLI/Pi 闭包/核心会话-任务图的回归面；降级安装分支掩盖 darwin lockfile 漂移（`:46-52`）。

## 9. 测试证据

`NOT_RUN`。无直接测试，依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：step 8 执行的 6 个测试文件均存在（已核对），其中 `apps/electron/scripts/package-closure.test.ts:29` 复用 `packaged-pi-probe.cjs`（间接证据，测的是打包闭包而非本 workflow）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发/权限/并发/11 步/上传配置 | 已证实 | `.github/workflows/macos-package.yml:1-105` 全文 |
| 调用脚本映射 dist:mac/verify:mac-update-assets | 已证实 | `apps/electron/package.json:60`、`:35` |
| 实际打包/测试运行结果 | 未知 | NOT_RUN |
| bun.lock 降级分支实际触发频率 | 未知 | 静态阅读无运行数据 |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on.workflow_dispatch.inputs | §2 | 4-9 | covered |
| permissions/concurrency/env | §2/§6/§7 | 11-24 | covered |
| 11 个 steps（1-4 安装） | §3 | 26-52 | covered |
| 11 个 steps（5-8 校验测试） | §3 | 54-78 | covered |
| 11 个 steps（9-11 打包上传） | §3 | 80-105 | covered |
| 运行验证 | §9 | - | unknown |
