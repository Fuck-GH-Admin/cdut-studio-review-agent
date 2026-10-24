---
path: .github/workflows/release.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 86ea3fea4e5beaa5d2b35fdf74c6784f028bd0d4
sha256: 9d52cc757d5509ddb94d7f08173bca9b23b550b5acf64973bf1fc2b167aa33ae
lines: 198
kind: config
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# .github/workflows/release.yml

## 1. 结论与边界

GitHub Actions workflow `Windows Release Verification`（198 行）：手动 dispatch 的 Windows x64 发布验证——在 `windows-latest` 上对指定 ref 完成版本/tag 一致性、门禁检查、全量测试、GitHub 构建、打包签名、冒烟、Pi 闭包探针、更新元数据签名与资产核验。它是**验证**工作流：`--publish never`（`.github/workflows/release.yml:95`）、无 release/upload 动作，不实际发布。本轮 `NOT_RUN`（纯静态阅读，未运行任何 CI）。

## 2. 导出与关键符号

键清单：

| 键 | 行 | 值/摘要 |
| --- | --- | --- |
| name | `.github/workflows/release.yml:1` | Windows Release Verification |
| on.workflow_dispatch.inputs.ref | `:4-9` | required: true，default: main（"要验证的分支、tag 或 commit SHA"） |
| permissions | `:11-12` | contents: read |
| concurrency | `:14-16` | group `release-verification-${{ inputs.ref }}`，cancel-in-progress: true |
| jobs.build-windows-x64 | `:18-21` | name `build (windows-latest, win, x64)`，runs-on windows-latest |
| secrets 使用点 | `:87-88`、`:98-99`、`:168`、`:175` | WIN_CSC_LINK、WIN_CSC_KEY_PASSWORD、PROFER_UPDATE_METADATA_PRIVATE_KEY、PROFER_UPDATE_METADATA_PUBLIC_KEY |
| steps | `:23-198` | 18 步（见 §3） |

无 matrix（单 runner 单架构）、无 actions/cache、无上传/发布动作、无 `if:`/`continue-on-error`（依据：全文无这些键）。

## 3. 内部逻辑与关键流程

job `build-windows-x64` 的 18 个 step（`.github/workflows/release.yml:23-198`）：
1. Checkout `actions/checkout@v4`，`ref: ${{ inputs.ref }}`（`:24-27`）；
2. Setup Bun `oven-sh/setup-bun@v2`，`bun-version: 1.4.2`（`:29-34`，注释 `:32-33`：与本地开发一致、可解析 lockfileVersion 2 的 bun.lock）；
3. Setup Node.js `actions/setup-node@v4`，node 22（`:36-41`，注释 `:39-40`：避免 better-sqlite3 prebuilt node24 ABI 137 与运行时 node22 ABI 127 不匹配）；
4. Install dependencies `bun install --frozen-lockfile`（`:43-44`）；
5. Verify app version and tag consistency（`:46-60`，shell pwsh）：`node -p` 取 `apps/electron/package.json` version，正则 `^\d+\.\d+\.\d+$` 校验 semver（`:50-52`）；若 `inputs.ref` 以 `v` 开头则去 `v` 后必须与 version 相等（`:54-59`）；
6. Typecheck workspace `bun run typecheck`（`:62-63`）→ 根 `package.json:24`；
7. Check package boundaries `bun run check:boundaries`（`:65-66`）→ 根 `package.json:25`；
8. Verify built-in skin surface contract（`:68-70`，working-directory `apps/electron`，`bun run check:skin-contract` → `apps/electron/package.json:49`）；
9. Run unit and regression tests `bun test --isolate --timeout 30000`（`:72-74`，注释 `:73` 解释 `--isolate` 防 mock.module 串扰）；
10. Build GitHub app `bun run electron:build:github`（`:76-78`）→ 根 `package.json:18` → `apps/electron/package.json:42`（build:github 组合构建）；
11. Sync external Agent runtime dependencies（`:81-83`，working-directory `apps/electron`，`bun run sync:runtime-deps` → `apps/electron/package.json:30` → `scripts/sync-runtime-deps.ts`；注释 `:80`：Pi runtime 为外部依赖，打包前复制闭包进 appDir）；
12. Verify Windows signing secrets（`:84-92`，shell pwsh，env `CSC_LINK←secrets.WIN_CSC_LINK`、`CSC_KEY_PASSWORD←secrets.WIN_CSC_KEY_PASSWORD`，`:87-88`）：任一空白即 `throw '缺少 WIN_CSC_LINK 或 WIN_CSC_KEY_PASSWORD；禁止构建未签名 Windows 发布包。'`（`:90-92`）；
13. Package Windows release（`:94-99`，working-directory `apps/electron`）：`node scripts/run-electron-builder.cjs --win --x64 --publish never`（`:95`），env 继承同两个签名 secrets（`:98-99`）；
14. Smoke test unpacked Windows app（`:101-121`，shell pwsh）：校验 `out/win-unpacked/CDUT Studio.exe` 存在（`:105-108`），`Start-Process --disable-gpu` 启动后 `Start-Sleep 12`（`:110-111`）；观察窗内已退出→非零退出码或提前退出均 `throw`（`:112-117`）；存活→`Stop-Process -Force` 强制终止，注释 `:119` 明确清理退出码不代表启动失败；
15. Probe packaged Pi runtime closure（`:123-162`，shell pwsh）：校验 `scripts/packaged-pi-probe.cjs`（`:127-130`）与 `out/win-unpacked/resources`（`:131-134`）存在；`ELECTRON_RUN_AS_NODE=1`（`:135`）以 `Start-Process -PassThru -NoNewWindow` 捕获重定向 stdout/stderr 执行探针（`:141-144`，注释 `:136-138`：Electron exe 是 GUI 子系统程序必须同步等待）；`Wait-Process -Timeout 120` 超时→强杀+dump stderr+`throw 'Pi runtime closure probe timed out after 120s'`（`:146-152`）；非零退出→dump stdout/stderr+throw（`:154-160`）；通过→打印 `Pi runtime closure verified` 与 stdout（`:161-162`）；
16. Sign update metadata（`:164-169`，shell pwsh，working-directory `apps/electron`）：env `PROFER_UPDATE_METADATA_PRIVATE_KEY←secrets.PROFER_UPDATE_METADATA_PRIVATE_KEY`（`:168`），`bun run sign:update-metadata`（`:169`）→ `apps/electron/package.json:36` → `scripts/sign-update-metadata.cjs`；
17. Verify Authenticode and update metadata（`:171-176`）：env `PROFER_UPDATE_METADATA_PUBLIC_KEY←secrets.PROFER_UPDATE_METADATA_PUBLIC_KEY`（`:175`），`bun run verify:release-assets`（`:176`）→ `apps/electron/package.json:33` → `scripts/verify-release-assets.cjs`；
18. Verify Windows release assets（`:178-198`，shell pwsh）：按 `apps/electron/package.json` version 构造必需资产清单 `latest.yml`、`latest.yml.sig`、`CDUT-Studio-Setup-$version.exe`、`CDUT-Studio-Setup-$version.exe.blockmap`（`:182-188`），逐个校验 `out/` 下存在，缺失则列出 `out` 全部文件并 `throw`（`:190-197`）。

## 4. 调用者与调用链

- 入向：仅 `workflow_dispatch`（`.github/workflows/release.yml:4`，inputs.ref）；无 `workflow_call`，冻结树检索无其它 workflow 调用它。文档引用：`work/reports/2026-10-03-collaborator-sync-review.md:18`（ci.yml/release.yml 命令执行方式修复）、`work/reports/2026-10-02-code-review.md:119`（引用 `release.yml:72` 全量测试步骤的触发条件讨论）；`release-notes/v0.9.8.md:13` 描述的三 runner 矩阵是**历史版本**叙述，与当前单 `windows-latest` x64 结构不同。
- 出向：`actions/checkout@v4`/`oven-sh/setup-bun@v2`/`actions/setup-node@v4`（`:25`、`:30`、`:37`）；npm 脚本 `typecheck`/`check:boundaries`（根 `package.json:24-25`）、`check:skin-contract`（`apps/electron/package.json:49`）、`electron:build:github`（根 `package.json:18`）、`sync:runtime-deps`（`apps/electron/package.json:30`）、`sign:update-metadata`（`:36`）、`verify:release-assets`（`:33`）；直接执行 `scripts/run-electron-builder.cjs`（`:95`）、`scripts/packaged-pi-probe.cjs`（`:127`，经 `out/win-unpacked/CDUT Studio.exe` 以 ELECTRON_RUN_AS_NODE 执行，`:141-142`）。上述脚本在冻结树均存在（已核对）。不调用其它 workflow。

## 5. 数据 I/O、读写与副作用

读 `apps/electron/package.json`（`:49`、`:182`）；写 `node_modules`（`:44`）、构建产物 `dist/`、打包产物 `apps/electron/out/`（安装包、blockmap、latest.yml、latest.yml.sig、`probe-out.txt`/`probe-err.txt`（`:139-140`））。无 artifact 上传、无 cache（依据：全文无相关键）；`--publish never` 不向任何 registry/release 发布。

## 6. 分支、失败、取消与恢复

`concurrency` 按 `inputs.ref` 分组、同 ref 新运行取消旧运行（`.github/workflows/release.yml:14-16`）。任一 step 失败即 job 失败，无 `continue-on-error`/`if:` 容错；显式 `throw` 点：semver/tag 不一致（`:51`、`:57`）、签名 secrets 缺失（`:91`）、打包 exe 缺失/冒烟失败（`:107`、`:114`、`:116`）、探针缺失/超时/失败（`:129`、`:133`、`:151`、`:159`）、资产缺失（`:195`）。探针超时 120 s 有强杀兜底（`:146-152`），冒烟进程有强停清理（`:120-121`）。无 step/job 超时配置（未知上限；注释 `:138` 提及防 job 卡到 6h 的动机）。

## 7. 权限与权威状态

GITHUB_TOKEN 仅 `contents: read`（`.github/workflows/release.yml:11-12`）。secrets 使用点：`WIN_CSC_LINK`/`WIN_CSC_KEY_PASSWORD`（`:87-88`、`:98-99`，Windows 签名）、`PROFER_UPDATE_METADATA_PRIVATE_KEY`（`:168`，更新元数据签名）、`PROFER_UPDATE_METADATA_PUBLIC_KEY`（`:175`，验签）；`:84-92` 明确"禁止构建未签名 Windows 发布包"的硬门禁。版本/tag 一致性为发布权威校验（`:46-60`）。

## 8. 修改影响面

Windows 发布包（签名安装包+更新元数据）的验证门；对应本地链路 `apps/electron/package.json:39`（`release:verify:windows`）同款步骤序列。改动 secrets 名、资产命名（`CDUT-Studio-Setup-$version.exe`，`:186-187`）或打包参数会影响发布验证全流程。

## 9. 测试证据

`NOT_RUN`。无直接测试，依据：冻结树 `*.test.*` 检索 `.github/workflows|workflows/` 无引用。间接：`work/reports/2026-10-02-code-review.md:119` 与 `work/reports/2026-10-03-collaborator-sync-review.md:18` 记录过本文件/相关步骤的缺陷与修复（间接证据）；step 9 的全量 `bun test` 测的是产品代码而非 workflow 本身。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 触发/权限/并发/18 步/secrets 使用点/失败 throw 点 | 已证实 | `.github/workflows/release.yml:1-198` 全文 |
| 出向脚本映射与存在性 | 已证实 | `apps/electron/package.json:30`/`:33`/`:36`/`:49`、根 `package.json:18`、冻结树核对 |
| 实际运行/签名/打包结果 | 未知 | NOT_RUN |
| job 实际耗时与 6h 上限行为 | 未知 | 注释 `:138` 仅为动机说明 |

## 11. 覆盖表

| 键/步骤 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| on/permissions/concurrency | §2/§4/§6/§7 | 3-16 | covered |
| steps 1-5（检出/工具链/版本） | §3 | 24-60 | covered |
| steps 6-9（门禁/测试） | §3 | 62-74 | covered |
| steps 10-13（构建/同步/签名/打包） | §3 | 76-99 | covered |
| steps 14-15（冒烟/Pi 探针） | §3 | 101-162 | covered |
| steps 16-18（元数据/资产核验） | §3 | 164-198 | covered |
| secrets/权限模型 | §7 | 84-99、164-176 | covered |
| 运行验证 | §9 | - | unknown |
