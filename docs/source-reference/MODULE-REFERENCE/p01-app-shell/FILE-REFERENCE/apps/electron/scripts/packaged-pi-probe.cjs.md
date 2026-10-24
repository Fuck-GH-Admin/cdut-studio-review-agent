---
path: apps/electron/scripts/packaged-pi-probe.cjs
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f1bbfd890ef540fd04e84abcd391afc7e8cd5a13
sha256: 489213c2daa38a887e343aea652b42219374c66e5990333ef25805be92b37684
lines: 154
kind: source
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/packaged-pi-probe.cjs

## 1. 结论与边界

离线验证 Windows packaged **Pi runtime 闭包**：用刚打包的 Electron 自带 Node ABI（`ELECTRON_RUN_AS_NODE=1`）从 `app.asar` 动态 ESM 导入 4 个 Pi 包、初始化内存 model runtime 与临时 session、并断言 native/WASM 文件全部位于 `app.asar.unpacked`（`apps/electron/scripts/packaged-pi-probe.cjs:2-11` 注释、`:72-139` `runProbe`）。最终输出机器可读 JSON（`:132-138`）。

边界：不发送真实渠道请求（注册的探针 provider 指向不可达的 `http://127.0.0.1:1`，`:101,106`，且 `allowModelNetwork:false`，`:94`）；不做 UI/Agent 冒烟、不做签名/公证断言（macOS 侧由 `verify-macos-package.cjs` 调用它补充，见 §4）；不验证 installer。

## 2. 导出与关键符号

`module.exports` 3 项（`apps/electron/scripts/packaged-pi-probe.cjs:141`，与源码一致）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `findUnpackedNativeFiles` | 导出函数 | 50-55 | `(nodeModulesRoot) => string[]` | 4 个 NATIVE_SCOPES 内按扩展名过滤出 native/WASM 文件并排序 |
| `resolvePackageImportEntry` | 导出函数 | 57-66 | `(appArchive, packageName) => string` | 从包 package.json 的 `exports['.']`/`main` 解析 ESM 入口 |
| `runProbe` | 导出异步函数 | 72-139 | `(resourcesDir) => Promise<void>` | 主流程（导入→runtime 断言→session→native 断言→JSON 输出） |

内部：`PI_PACKAGES`（`:17-22`，4 个 `@earendil-works/*`）、`NATIVE_SCOPES`（`:23-28`，`@earendil-works/pi-tui/native`/`@silvia-odwyer`/`@mariozechner`/`@napi-rs`）、`NATIVE_EXTENSIONS`（`:29`，`.node/.wasm/.dll/.dylib/.so`）、`assert`（`:31-33`）、`walkFiles`（`:35-48`）、`importFromArchive`（`:68-70`）。

## 3. 内部逻辑与关键流程

1. 路径与存在性断言：`resources/app.asar` 与 `resources/app.asar.unpacked/node_modules` 必须存在（`:73-77`）。
2. ESM 导入：对 `PI_PACKAGES` 逐个 `importFromArchive`——`resolvePackageImportEntry` 读包内 `package.json`，入口取 `exports['.']`（字符串直用，对象取 `.import`，否则 `manifest.main`），缺入口 assert 失败（`:57-66,79-82`）。
3. Pi runtime 能力断言：`sdk.ModelRuntime?.create`/`sdk.SessionManager?.create`/`sdk.SettingsManager?.inMemory` 均须为函数（`:84-89`，`sdk=@earendil-works/pi-coding-agent`）。
4. 内存 model runtime：`ModelRuntime.create({credentials: new piAi.InMemoryCredentialStore(), modelsPath: null, allowModelNetwork: false})`（`:91-95`）；注册离线探针 provider（id `cdut-studio-packaged-probe`，`api:'openai-completions'`，baseUrl `http://127.0.0.1:1`，单模型 `offline-model`）（`:96-113`）；`getModel` 断言注册成功（`:114`）。
5. 临时 session：`mkdtempSync(join(tmpdir(),'cdut-studio-packaged-pi-'))` 后 `SessionManager.create(cwd, sessionDir)`，断言生成 session ID 且 `getCwd()===cwd`（`:116-122`）；`finally` 中 `rmSync(tempRoot,{recursive:true,force:true})` 清理（`:123-125`）。
6. native 闭包断言：`findUnpackedNativeFiles` 结果非空（`:127-128`）且逐个以 `unpackedNodeModules + sep` 为前缀（防逸出）（`:129-130`）。
7. 输出 `JSON.stringify({ok:true, resources, imported: PI_PACKAGES, nativeFileCount, nativeFiles(相对路径)})`（`:132-138`）。

CLI 入口（`:143-154`）：`process.argv[2]` 为 resources 目录；缺参打印用法并 `process.exitCode = 2`（`:145-147`）；`runProbe(...).catch` 打印 `error.stack ?? error.message` 并 `process.exitCode = 1`（`:149-152`）。

## 4. 调用者与调用链

入向（全冻结树检索 `packaged-pi-probe|runProbe|findUnpackedNativeFiles|resolvePackageImportEntry`，排除自身与 node_modules 命中 4 文件 14 行）：
- `.github/workflows/release.yml:123-145`（`Probe packaged Pi runtime closure` job：`:127` 定位脚本、`:135` 设 `ELECTRON_RUN_AS_NODE=1`、`:141-144` `Start-Process 'CDUT Studio.exe'` 加载本脚本并重定向 stdout/stderr）。
- `apps/electron/scripts/verify-packaged-pi-runtime.ps1:6`（`$probePath`）、`:21-24` 以打包 exe+`ELECTRON_RUN_AS_NODE=1` 运行本脚本，`:26` 120s 超时强杀，`:36-49` 以 ExitCode/空 stderr/JSON `ok:true` 三重门禁判定（由 `apps/electron/package.json:38` `verify:packaged-pi-runtime` 触发）。
- `apps/electron/scripts/verify-macos-package.cjs:11` require `findUnpackedNativeFiles`（`:53-54` 用其数 native 文件）；`:59-63` 以 macOS 应用二进制 + `ELECTRON_RUN_AS_NODE=1` 运行本脚本（120s 超时）。
- 测试：`apps/electron/scripts/package-closure.test.ts:29-30,41`（`resolvePackageImportEntry`）、`:56-57,71`（`findUnpackedNativeFiles`）、`:48-53`（源码文本断言）。

出向：`node:fs`/`node:os`/`node:path`/`node:url`（`:12-15`）；动态 `import()` 打包产物内 Pi 包（`:68-70`）。

## 5. 数据 I/O、读写与副作用

- 读：`app.asar` 目录树（`readFileSync` 读各包 `package.json`，`:59`；`readdirSync` 遍历 unpacked，`:41`）。
- 写：仅临时目录 `mkdtempSync`（`:116`）并在 `finally` `rmSync` 清理（`:124`）；失败也不残留（`force:true`）。
- 执行副作用：`import()` 会真实执行打包产物中的 Pi 包模块代码（`:69`）——这是探针目的（验证闭包可加载），但意味着被测产物代码在探针进程内运行。
- 网络：显式禁用（`allowModelNetwork:false` `:94`；探针 provider 指向 `127.0.0.1:1` 不可达端口 `:101,106`）。
- 输出：stdout 一行 JSON（`:132-138`）；驱动脚本要求 stderr 为空（`verify-packaged-pi-runtime.ps1:39-41`）。

## 6. 分支、失败、取消与恢复

- 缺参 → 用法提示 + `exitCode 2`（`:145-147`）；探针内任何 assert/导入失败 → 捕获打印 stack + `exitCode 1`（`:149-152`，用 `exitCode` 而非 `exit()` 保证异步输出完成）。
- assert 失败消息逐条可辨：缺 `app.asar`/`unpacked`（`:76-77`）、缺 ESM 入口（`:64`）、Pi 能力缺失（`:87-89`）、provider 注册失败（`:114`）、session 初始化异常（`:121-122`）、native 缺失/逸出（`:128,130`）。
- 清理/恢复：临时目录 `finally` 清除（`:123-125`）；无持久状态，重跑幂等。
- 外层取消：ps1 驱动 120s 超时 `Stop-Process` 强杀并抛错（`verify-packaged-pi-runtime.ps1:26-30`）；CI 侧同样有超时保护（release.yml 注释 `:138`）。

## 7. 权限与权威状态

无权限分支，依据：本文件无 sender/role 检查（离线探针，运行者为构建机）。权威约束是“必须用打包产物自带 Node ABI 运行”（注释 `:5-7`、调用方均设 `ELECTRON_RUN_AS_NODE=1`）——脱离该 ABI 的运行结果不作数。凭据用 `InMemoryCredentialStore`（`:92`），不读写用户全局 Pi 目录（测试文本断言互证 `package-closure.test.ts:48-53`）。

## 8. 修改影响面

- 改 `PI_PACKAGES`/`NATIVE_SCOPES`/`NATIVE_EXTENSIONS` 会同时改变 Windows（release.yml、verify-packaged-pi-runtime.ps1）与 macOS（verify-macos-package.cjs）两条闭包验证链，并与 `apps/electron/electron-builder.yml` 的 unpacked 模式（`node_modules/@silvia-odwyer/**` 等 4 模式，测试互证 `package-closure.test.ts:16-23`）失配。
- 改 `resolvePackageImportEntry` 影响 `package-closure.test.ts:28-46`；改 `findUnpackedNativeFiles` 影响 `verify-macos-package.cjs:53-54` 与 `package-closure.test.ts:55-75`。
- JSON 输出 schema（`ok/resources/imported/nativeFileCount/nativeFiles`）是 ps1 驱动的门禁契约（`verify-packaged-pi-runtime.ps1:42-49`），改动需同步。

## 9. 测试证据

直接测试 `apps/electron/scripts/package-closure.test.ts`（describe `Pi packaged runtime 闭包`，4 用例）：
1. `:13-26`（间接）：断言 `electron-builder.yml` 含 4 个 unpacked scope 模式、`appId: com.cdutai.studio`、`afterPack: scripts/after-pack.cjs`（`expect(builder).toContain(...)`）。
2. `:28-46`：`resolvePackageImportEntry` 对 `exports:{'.':{import:'./dist/index.js'}}` 夹具 `toBe(join(packageDir,'dist/index.js'))`——验证按 ESM import 解析、不依赖 `require.resolve`。
3. `:48-53`：源码文本断言含 `credentials: new piAi.InMemoryCredentialStore()` 与 `modelsPath: null`（防读写 CI 用户全局 Pi 目录）。
4. `:55-75`：`findUnpackedNativeFiles` 只收 `@napi-rs/**`、`@silvia-odwyer/**` 内 `.node/.wasm`，忽略 scope 外文件（`toEqual([allowedNode, allowedWasm].sort())`）。

未覆盖：`runProbe` 主流程无直接测试（导入/断言链仅在真实打包产物上手动/CI 执行）；`manifest.main` 回退分支（`:63`）无断言。`NOT_RUN`：本轮未运行测试、未跑真实打包产物探针。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 Pi 包从 app.asar ESM 导入；入口解析 exports['.']→.import→main | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:17-22,57-66` |
| runtime 断言 ModelRuntime.create/SessionManager.create/SettingsManager.inMemory | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:84-89` |
| 离线性：InMemoryCredentialStore+modelsPath:null+allowModelNetwork:false+127.0.0.1:1 | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:91-113` |
| 临时目录 finally 清理、失败不残留 | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:116-125` |
| native 文件非空且不得逸出 unpacked 根 | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:127-130` |
| 退出码约定：缺参 2、失败 1、成功 0（exitCode 而非 exit） | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:143-154` |
| **注释版本漂移**：`:9`/`:86` 注释写“Pi 0.84.2”，实际锁定依赖为 **0.86.1** | 已证实（实现差异） | 注释 `apps/electron/scripts/packaged-pi-probe.cjs:9,86` vs `apps/electron/package.json:70-72`、`package.json:48-51`、`bun.lock:280-283` 均 0.86.1；`apps/electron/resources/CHANGELOG.json:361` 记“Pi 运行时升级到 0.86.1”。行为代码（`ModelRuntime.create` 等断言）与注释所述 API 形态一致，版本号字样陈旧，照实记录待维护者订正 |
| `SettingsManager.inMemory` 在 0.86.1 的实际可用性 | 未知 | 仅静态断言存在（`:89`），NOT_RUN 未实跑 |
| CI/probe 真实运行结果 | 未知 | 本轮 NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `PI_PACKAGES`/`NATIVE_SCOPES`/`NATIVE_EXTENSIONS` | §2、§3.2/3.6 | 17-29 | covered |
| `walkFiles`/`findUnpackedNativeFiles` | §3.6、§5 | 35-55 | covered（测试 :55-75） |
| `resolvePackageImportEntry` | §3.2 | 57-66 | covered（测试 :28-46；main 回退未测） |
| `runProbe` 主流程 | §3.1-3.7 | 72-139 | covered（无直接测试，§9 注明） |
| 内存/离线模型链 | §3.4、§5 | 91-114 | covered（测试 :48-53 文本断言） |
| 临时目录清理 | §3.5、§6 | 116-125 | covered |
| CLI 入口/退出码 | §3、§6 | 143-154 | covered |
| 注释版本漂移 | §10 | 9,86 | covered（实现差异） |
