---
path: apps/electron/scripts/package-closure.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7c97807ea968d687173e9077c1e81a964bf1e585
sha256: bc3bd35184b1a049378c8d675fc0aad4018d2a8abd2e6e0b28f7855fff49cbcb
lines: 76
kind: test
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/scripts/package-closure.test.ts

## 1. 测试目标

验证 **Pi packaged runtime 闭包**契约：①electron-builder.yml 必须把 Pi 生态 native/WASM 依赖打进 unpacked 范围（`asarUnpack` 类清单）并保留 CDUT Studio 打包契约；②`apps/electron/scripts/packaged-pi-probe.cjs` 按 ESM `exports['.'].import` 解析包入口、不依赖 CJS `require.resolve`；③probe 用内存凭据/禁模型缓存，不污染 CI 用户全局 Pi 目录；④probe 只枚举目标 unpacked scope 内的 native/WASM 文件。

被测对象：`apps/electron/scripts/packaged-pi-probe.cjs`（真实 `require`，`apps/electron/scripts/package-closure.test.ts:29,56`）与冻结仓 `apps/electron/electron-builder.yml`、`apps/electron/scripts/packaged-pi-probe.cjs` 源文本。无 mock；断言为静态阅读所得，本轮 `NOT_RUN`。

## 2. 用例清单

实测计数：`test(` 4 个、`it(` 0 个（grep 实测），1 个 `describe('Pi packaged runtime 闭包')`（`apps/electron/scripts/package-closure.test.ts:12`）。用例独立无顺序耦合；临时目录用 try/finally 清理。

| # | 用例（行） | 设置 | 动作 | 断言要点 |
| --- | --- | --- | --- | --- |
| 1 | builder Pi 闭包与品牌契约（:13-26，async） | 读 electron-builder.yml | 逐 pattern 文本断言 | 4 个 `- "node_modules/@silvia-odwyer/**"` 等 pattern 存在；`appId: com.cdutai.studio`；`afterPack: scripts/after-pack.cjs` |
| 2 | ESM import 入口解析（:28-46） | mkdtemp 假 node_modules/@earendil-works/pi-ai，package.json `{type:'module', exports:{'.':{import:'./dist/index.js'}}}` | `resolvePackageImportEntry(root, '@earendil-works/pi-ai')` | toBe(join(packageDir,'dist/index.js'))；finally rmSync |
| 3 | 内存凭据/禁模型缓存（:48-53，async） | 读 probe 源文本 | 字符串断言 | 含 `credentials: new piAi.InMemoryCredentialStore()`、`modelsPath: null` |
| 4 | native 枚举不越界（:55-75） | 造 `@napi-rs/canvas/binding.node`、`@silvia-odwyer/photon-node/binding.wasm`、`other/binding.node` | `findUnpackedNativeFiles(root)` | toEqual([allowedNode, allowedWasm].sort())——`other/` 越界文件被排除 |

内部辅助：`appDir` 常量（`:6`，`resolve(import.meta.dir,'..')`）、`read()`（`:8-10`，`Bun.file().text()`）。

## 3. 真实断言

- 用例 1：`apps/electron/scripts/package-closure.test.ts:22`（`toContain('- "node_modules/@silvia-odwyer/**"')` 等 4 pattern）、`:24`（appId）、`:25`（afterPack）。实测 `apps/electron/electron-builder.yml:35-38`（四个 pattern 逐字存在）、`:4`（`appId: com.cdutai.studio`）、`:20`（`afterPack: scripts/after-pack.cjs`）。
- 用例 2：`apps/electron/scripts/package-closure.test.ts:41-42`。实测实现 `apps/electron/scripts/packaged-pi-probe.cjs:57-66`：读包内 package.json，`exports['.']` 为字符串直接用、对象取 `.import`、缺省回落 `manifest.main`，非字符串抛「缺少可导入的 ESM 入口」，返回 `join(packageDir, entry)`——与断言的 join 形状一致（不走 `require.resolve`）。
- 用例 3：`apps/electron/scripts/package-closure.test.ts:51-52`。实测 probe 源 `apps/electron/scripts/packaged-pi-probe.cjs:92-93`（`credentials: new piAi.InMemoryCredentialStore()`、`modelsPath: null`，位于 `ModelRuntime.create` 调用内 `:91-95`），注释动机：probe 不读写 CI 用户全局 Pi 目录。
- 用例 4：`apps/electron/scripts/package-closure.test.ts:71`。实测实现 `apps/electron/scripts/packaged-pi-probe.cjs:50-55`：仅在 `NATIVE_SCOPES`（`:23-28`：`@earendil-works/pi-tui/native`、`@silvia-odwyer`、`@mariozechner`、`@napi-rs`）下递归（`walkFiles` `:35-48`），按 `NATIVE_EXTENSIONS`（`.node/.wasm/.dll/.dylib/.so`，`:29`）过滤后 sort——`other/binding.node` 因 scope 不在列表被排除，断言与实现一致。

## 4. 未覆盖与脆弱点

未覆盖：
1. `runProbe` 全链（`apps/electron/scripts/packaged-pi-probe.cjs:72-139`）：app.asar/app.asar.unpacked 存在性断言（`:76-77`）、4 个 `PI_PACKAGES` ESM 导入（`:80-82`）、Pi 0.84.2 API 断言（`ModelRuntime.create`/`SessionManager.create`/`SettingsManager.inMemory`，`:87-89`）、临时 provider 注册（`:97-114`）、SessionManager 行为（`:120-122`）、native 逃逸检查（`:127-130`）——无任何测试用例覆盖（需真实打包产物，运行验证 `NOT_RUN`）。
2. `resolvePackageImportEntry` 的 `manifest.main` 回落分支与「exports 对象无 `.import`」分支（`:62-64`）无用例；`importFromArchive`（`:68-70`）未测。
3. probe CLI 入口（`:143-153`：缺参数 exitCode=2、runProbe 失败 exitCode=1）未测。
4. 用例 1 的 4 个 pattern 是存在性断言，未验证这些 unpack 规则在 electron-builder 打包后**实际生效**（属运行验证）。

脆弱点：
- 用例 3 是**源文本字符串断言**（重构/格式化/改写 `ModelRuntime.create` 参数对象换行即碎）；换 Pi 版本若改 API（注释自述 0.84.2 起 AuthStorage/ModelRegistry.inMemory 已移除）需同步。
- 用例 2 的假包 fixture 只覆盖 `exports['.'].import` 对象形态；真实 Pi 包 manifest 形态变化不在此测试射程。
- 用例 4 依赖 `NATIVE_SCOPES`/`NATIVE_EXTENSIONS` 常量口径（`packaged-pi-probe.cjs:23-29`），probe 改 scope 清单会改变断言语义。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 test、1 个 describe、0 个 it | 已证实 | `apps/electron/scripts/package-closure.test.ts:12-75`（grep 实测计数 4） |
| probe 经真实 require 加载，无 mock | 已证实 | `apps/electron/scripts/package-closure.test.ts:29,56`；全文无 mock/spy |
| 4 个 unpack pattern/appId/afterPack 与 builder 配置逐字一致 | 已证实 | `apps/electron/scripts/package-closure.test.ts:16-25` ↔ `apps/electron/electron-builder.yml:35-38,4,20` |
| ESM 入口解析逻辑与断言 join 结果一致 | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:57-66` |
| probe 内存凭据/禁缓存行真实存在 | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:91-95` |
| native 枚举限 scope+扩展名过滤 | 已证实 | `apps/electron/scripts/packaged-pi-probe.cjs:23-29,50-55` |
| runProbe 端到端在真实打包产物上通过 | 未知（NOT_RUN） | 未执行，见 §4.1 |
| fixture 中假包行为与真实 Pi 包一致 | 推断 | fixture 仅含 exports['.'].import（`apps/electron/scripts/package-closure.test.ts:36-39`），真实包未逐一核 |
| CI 中本测试的运行 runner | 未知 | 本文件不声明；未检索全 CI 调用面 |

## 6. 覆盖表

| 符号/用例组 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| describe 1 组 / test 4 用例 | §2 | 12-75 | covered |
| `read`/`appDir` 辅助 | §2 | 6-10 | covered |
| builder pattern/appId/afterPack 断言 | §3 | 13-26 | covered |
| `resolvePackageImportEntry` 断言 | §3 | 28-46 | covered（main 回落分支未覆盖） |
| 源文本凭据断言 | §3 | 48-53 | covered |
| `findUnpackedNativeFiles` 断言 | §3 | 55-75 | covered |
| `runProbe`/`importFromArchive`/CLI 入口 | §4 | packaged-pi-probe.cjs:68-153 | unknown（未覆盖） |
| 打包后实际生效验证 | §5 | - | unknown（NOT_RUN） |
