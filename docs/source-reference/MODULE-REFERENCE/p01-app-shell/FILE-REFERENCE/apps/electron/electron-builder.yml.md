---
path: apps/electron/electron-builder.yml
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d7ab69972da9afb7f1d2fe6c9031ecaab53796db
sha256: 4922c4267d787ecd148948c3f326e90894375015f0fa8c1da4ec8e014e8d52c9
lines: 221
kind: config
package: p01-app-shell
author: docs-r07-author-extra-03-20261024
reviewer: docs-r07-qa-extra-03-20261024
status: authored
evidence: static
---

# apps/electron/electron-builder.yml

## 1. 结论与边界

electron-builder 的**打包契约**（纯 YAML 配置，无运行时代码）：品牌身份（`appId: com.cdutai.studio`、`productName: CDUT Studio`）、三平台产物目标（mac dmg/zip arm64、win nsis x64、linux 仅 CLI 资源）、ASAR 解包范围、`files`/`extraResources` 打包边界、两个打包钩子（`afterPack` 修 Windows exe 图标、`afterSign` 补 macOS ad-hoc 签名）、NSIS 安装器行为与 GitHub 发布源（`apps/electron/electron-builder.yml:4-6,20-27,31-38,44-67,70-122,129-153,179-199,202-210,217-221`）。

边界：不定义构建管线（scripts 链见 `apps/electron/package.json:9-67`）；不含任何签名凭据（CSC_LINK 等由 CI 注入，`.github/workflows/release.yml:86-94`）；不承诺 macOS 发布（`apps/electron/electron-builder.yml:124-128,212-216` 注释明确当前仅本地 arm64 无签名验收、Linux 不构建不发布、Windows 发布走 `scripts/push-release.cjs`）。

## 2. 导出与关键符号

顶层键清单（19 项，`apps/electron/electron-builder.yml:4-221`）：

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `appId` | 键 | 4 | `com.cdutai.studio` | bundle/应用标识（测试钉死，见 §8） |
| `productName` | 键 | 5 | `CDUT Studio` | 产物/进程名（测试钉死 `:130-137`） |
| `copyright` | 键 | 6 | `By 雫窝中央实验室 · 2026` | 安装包版权串 |
| `electronVersion` | 键 | 9 | `43.2.0` | 显式指定（注释：CI bun workspace 无法自动检测 `:8`） |
| `directories` | 键 | 12-14 | `output: out`、`buildResources: resources` | 产物目录/资源目录 |
| `compression` | 键 | 17 | `normal` | 压缩级别 |
| `afterPack` | 键 | 20 | `scripts/after-pack.cjs` | 打包后钩子（Windows exe 图标/版本信息） |
| `afterSign` | 键 | 27 | `scripts/after-sign-mac.cjs` | 签名后钩子（mac ad-hoc 补签） |
| `asar` | 键 | 31 | `true` | 启用 ASAR |
| `asarUnpack` | 键 | 32-38 | 5 条 glob | `@anthropic-ai/**`、`@silvia-odwyer/**`、`@mariozechner/**`、`@napi-rs/**`、`@earendil-works/pi-tui/native/**` |
| `npmRebuild` | 键 | 41 | `false` | 跳过 npm install/rebuild（注释 `:40`：代码已 bundle，npm 不识别 `workspace:*`） |
| `files` | 键 | 44-67 | 3 收录 + 12 排除 | 打包边界（见 §3.2） |
| `extraResources` | 键 | 70-122 | 13 条映射 | 公共额外资源（见 §3.3） |
| `mac` | 键 | 129-153 | category/icon/artifactName/hardenedRuntime/entitlements/binaries/extendInfo/target | 仅 arm64 dmg+zip（`:147-153`） |
| `dmg` | 键 | 157-167 | contents/window | 应用 + /Applications 链接布局 |
| `linux` | 键 | 170-174 | artifactName/extraResources | 仅 CLI 复制，不设 target |
| `win` | 键 | 179-199 | icon/extraResources/fileAssociations/target | nsis x64（`:196-199`） |
| `nsis` | 键 | 202-210 | artifactName/oneClick:false/allowToChangeInstallationDirectory/include | 自定义段 `scripts/nsis-icon-refresh.nsh`（`:210`） |
| `publish` | 键 | 217-221 | provider:github/owner:Nya-Angle/repo:CDUT-Studio/releaseType:release | 发布源声明 |

## 3. 内部逻辑与关键流程

### 3.1 钩子链（`apps/electron/electron-builder.yml:19-27`）
`afterPack: scripts/after-pack.cjs`：打包完成后用 rcedit 给 Windows exe 写图标/版本信息（ProductName/FileDescription/CompanyName = CDUT Studio），失败必须抛出阻断打包（`scripts/after-pack.cjs:1-7`，rcedit 定位 `:12-24`）。`afterSign: scripts/after-sign-mac.cjs`：无签名身份时在 DMG/ZIP 打包前补 ad-hoc 签名并钉死 designated requirement，已有 Developer ID 签名则跳过不覆盖（`scripts/after-sign-mac.cjs:1-25`，契约实现 `scripts/macos-signature.cjs`）。

### 3.2 files 打包边界（`apps/electron/electron-builder.yml:44-67`）
收录 `dist/**/*`、`package.json`、`node_modules/**/*`；排除 `dist/resources/**`（避免与 buildResources 重复打包 `:46-48`）、构建期大件（electron/electron-builder/electronmon/esbuild/@electron*/@esbuild* `:54-60`）、Pi 文档与示例（`:61-62`）、全部 `*.map`（约 36MB，pdfjs 约 19MB `:63-65`）、workspace symlink `@proma/**`（`:66-67`）。`asarUnpack` 将 Pi/Claude 运行时 WASM/native 解包到 `app.asar.unpacked` 避免加载失败（`:29-38`）。

### 3.3 extraResources 映射与运行时消费者（`apps/electron/electron-builder.yml:70-122`）
`default-skills` → 首启同步 `~/.proma/default-skills/`（`apps/electron/src/main/index.ts:940-941`）；`../../tutorial/tutorial-v2.md` → `tutorial.md`（消费者 `apps/electron/src/main/lib/tutorial-service.ts:23-26`）；`resources/tray-icons` → 托盘（`apps/electron/src/main/tray.ts:26`）；`resources/skins` → 皮肤（`apps/electron/src/main/lib/skin-service.ts:269-272`）；`resources/ppt-style-packs`（`apps/electron/src/main/lib/ppt-style-pack-service.ts:110`）；`resources/skin-template`（`apps/electron/src/main/lib/skin-manager-service.ts:207`）；`resources/icon.ico`/`icon.png`（`:99-103`）；`resources/CHANGELOG.json`（`apps/electron/src/main/lib/changelog-service.ts:16-19`）；`resources/bulletin.json`（`apps/electron/src/main/lib/bulletin-service.ts:16-19`）；`resources/background.png`（`:110-112`）；`resources/demo`（`apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts:234`）；`resources/cslab`（`apps/electron/src/main/lib/cslab/cslab-python-runtime.ts:69-82`、`cslab-demo.ts:62`）。平台专属 CLI：mac/linux `resources/bin/profer`、win `resources/bin/profer.exe` + MinGit `resources/bin/git`（`:135-137,172-174,182-188`；Git 探测消费方 `apps/electron/src/main/lib/git-detector.ts:88-93`）。

### 3.4 平台块语义
mac（`:129-153`）：`hardenedRuntime: true`、`gatekeeperAssess: false`、entitlements 双指向 `resources/entitlements.mac.plist`（`:140-141`）、`binaries: resources/bin/profer`（`:143-144`）、麦克风用途文案 `extendInfo`（`:145-146`）、target=dmg+zip arm64。win（`:179-199`）：`fileAssociations` 注册 `.profer-backup`/`.profer-share`（`:189-195`）、target=nsis x64。nsis（`:202-210`）：`oneClick: false`、可选安装目录、桌面/开始菜单快捷方式、`include: scripts/nsis-icon-refresh.nsh` 刷新 Shell 图标缓存（`:208-210`）。publish（`:217-221`）：GitHub `Nya-Angle/CDUT-Studio`，releaseType=release。

## 4. 调用者与调用链

入向（谁加载本配置）：
- electron-builder CLI 经 `package.json` `build.extends`（`apps/electron/package.json:200-202`）自动加载；启动点 `scripts/run-electron-builder.cjs:38-45`（cwd=apps/electron）。
- 调用链：`.github/workflows/release.yml:95`（`node scripts/run-electron-builder.cjs --win --x64 --publish never`）、`dist.ts` 步骤 7（`scripts/dist.ts:261-300` 组参数后 `node scripts/run-electron-builder.cjs …`）、package.json scripts `pack/dist/dist:win*`（`apps/electron/package.json:55-59`）。
- 静态读者（测试）：`apps/electron/scripts/packaging-guards.test.ts:126,142-159,270-271`、`apps/electron/scripts/package-closure.test.ts:14-25`（断言见 §9）。
- 契约同步读者：`apps/electron/src/main/lib/github-release-service.ts:15-19` 硬编码 owner/repo 与 `publish` 段（`:218-220`）保持一致（注释自述「从 electron-builder.yml」）。
出向：本文件不调用代码；被引用的钩子/脚本为 `scripts/after-pack.cjs`、`scripts/after-sign-mac.cjs`、`scripts/nsis-icon-refresh.nsh`（均存在于冻结树）。

## 5. 数据 I/O、读写与副作用

纯声明式 YAML，自身不执行 I/O。消费方副作用：
- electron-builder 写 `out/`（`directories.output` `:12-13`；macOS 产物 `out/mac-arm64` 等——具体布局为工具语义，推断级）；`asar:true` 生成 `app.asar`，`asarUnpack` 产生 `app.asar.unpacked/`（`:31-38`）。
- `extraResources` 把源路径复制进安装包 `Resources/`（消费者读 `process.resourcesPath`，见 §3.3 双侧行号）。
- `afterPack` 写 exe 元数据（rcedit，`scripts/after-pack.cjs:1-7`）；`afterSign` 改变包签名与 designated requirement（`scripts/after-sign-mac.cjs:1-10`）。
- `npmRebuild: false` 意味着打包期不装不编译原生模块，依赖闭包由 `sync:runtime-deps` 预先复制（`scripts/sync-runtime-deps.ts:1-7`）。

## 6. 分支、失败、取消与恢复

- 无代码分支（配置文件）。失败语义来自被引用脚本：`afterPack` 中 rcedit 缺失/写入失败**抛错阻断打包**（`scripts/after-pack.cjs:1-7`）；`afterSign` 对已验证的 app 无条件跳过（不覆盖真实签名）（`scripts/after-sign-mac.cjs:8-10`）。
- `files`/`extraResources` 源路径缺失时 electron-builder 构建报错（工具语义，推断级）。注意：`resources/bin/profer`、`resources/bin/profer.exe`、`resources/bin/git` **不在冻结树**（全树存在性实测缺失），必须先由 `build:cli`（`scripts/build-cli.ts:1-15,45`）或 `scripts/ensure-mingit.ts:4-15` 产出后才能打包成功——见 §10 否定检索。
- 不可恢复点：`afterSign` 钉死 DR 后「后续版本必须保持同一 DR，否则用户必须手动重装一次」（`scripts/after-sign-mac.cjs:9-10`）。
- 发布失败恢复不在本文件（`publish` 只声明源；实际上传走 `scripts/push-release.cjs`，`apps/electron/electron-builder.yml:212-216` 注释）。

## 7. 权限与权威状态

- 签名权限：Windows 签名凭据 `CSC_LINK`/`CSC_KEY_PASSWORD` 由 `.github/workflows/release.yml:86-94` 注入且缺失即拒绝（不得构建未签名发布包）；macOS 无签名身份时走 ad-hoc 补签（§3.1），`dist:mac` 显式 `--no-sign`（`apps/electron/package.json:60`）。
- 权威状态：`appId`/DR 钉死决定更新信任链（`scripts/after-sign-mac.cjs:1-10`）；`publish` owner/repo 是发布目标声明，上传仍由本地 `scripts/push-release.cjs` 执行（`:212-216` 注释）。
- 本文件自身无 sender/role 检查，依据：纯 YAML 无执行逻辑。

## 8. 修改影响面

- `productName`/`nsis.artifactName`（`:5,203`）：`packaging-guards.test.ts:130-137` 断言 release.yml 中出现 `out/win-unpacked/${productName}.exe` 与安装包/blockmap 名（`:133-136`），且 `PRODUCT_APP_NAME` 必须为 `${productName}.app`（`:137`）。
- `extraResources` 平台专属 CLI 形状：`packaging-guards.test.ts:148-151` 断言公共段**不得**含 `resources/bin`、mac/linux 段含 `from: resources/bin/profer\n      to: bin/profer`、win 段含 `from: resources/bin/profer.exe\n      to: bin/profer.exe`。
- 钩子两行：`packaging-guards.test.ts:158-159` 断言 `afterSign: scripts/after-sign-mac.cjs` 与 `afterPack: scripts/after-pack.cjs` 必须原样存在。
- `asarUnpack`/`appId`/`afterPack`：`package-closure.test.ts:16-25` 断言 4 个 Pi native/WASM scope 字符串与 `appId: com.cdutai.studio`、`afterPack: scripts/after-pack.cjs`。
- `publish.owner/repo`（`:218-220`）与 `apps/electron/src/main/lib/github-release-service.ts:16-19` 的硬编码需同步。
- `files`/`asarUnpack` 与 `package.json` external 闭包（`apps/electron/package.json:17,50-52`）联动；改 `artifactName`/目录会破坏 `.github/workflows/release.yml:178-185` 的产物校验与 `verify:mac-update-assets`/`verify:release-assets`。
- 同步修改的测试：`packaging-guards.test.ts`、`package-closure.test.ts`（均属 nb-137 批文件）。

## 9. 测试证据

直接断言本文件的测试（均 kind=test、本批外文件，属 nb-137 批；本轮 `NOT_RUN`，静态阅读）：
- `apps/electron/scripts/packaging-guards.test.ts:140-151`：「Given electron-builder 配置 When 选择平台 Then 只复制对应 CLI 文件名」——断言 §8 所列 4 个字符串（`:148-151`）。
- `apps/electron/scripts/packaging-guards.test.ts:154-159`：断言 afterSign/afterPack 两行。
- `apps/electron/scripts/packaging-guards.test.ts:125-137`：productName/artifactName 与 release.yml 产物名互证。
- `apps/electron/scripts/packaging-guards.test.ts:264-280`：断言本文件存在、长度 >1000、含 `appId:`/`productName:`/`directories:`/`win:`/`nsis:`。
- `apps/electron/scripts/package-closure.test.ts:13-26`：断言 asarUnpack 4 个 Pi scope + `appId` + `afterPack`。
未覆盖：钩子脚本行为无自动化断言（after-pack/after-sign 的运行效果只由 `verify:mac-*`/`verify:release-assets` 产物校验兜底，未读其断言细节）；三平台实际打包 `NOT_RUN`。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 19 顶层键与全部值 | 已证实 | `apps/electron/electron-builder.yml:4-221` 逐行读 |
| extraResources 各映射的运行时消费者 | 已证实 | §3.3 双侧行号（tray/skin/tutorial/changelog/bulletin/cslab 等） |
| `resources/bin/profer`、`profer.exe`、`git` 不在冻结树 | 已证实（否定） | 全冻结树存在性实测缺失；产出方 `scripts/build-cli.ts:1-15,45`（`build:cli`）、`scripts/ensure-mingit.ts:4-15`（MinGit 2.47.1 下载） |
| `scripts/ensure-mingit.ts` 无任何调用者 | 已证实（否定） | 全冻结树检索 `ensure-mingit`（含大小写变体 `ensureMinGit`，全扩展名，排除 node_modules/.git），仅命中脚本自身 `:17,31,66` |
| afterPack 失败抛错阻断打包 | 已证实 | `scripts/after-pack.cjs:1-7` |
| afterSign 跳过真实签名/钉死 DR | 已证实 | `scripts/after-sign-mac.cjs:1-25` |
| publish owner/repo 与 github-release-service 一致 | 已证实 | `:218-220` vs `apps/electron/src/main/lib/github-release-service.ts:15-19` |
| electron-builder 对缺失 files 源的失败行为、`out/` 具体布局、icon 路径解析基准（project vs buildResources） | 推断/未知 | 工具语义，未读 electron-builder 源码；`win.icon: icon.ico`（`:180`）按 `buildResources: resources`（`:14`）指向 `resources/icon.ico`（存在）属推断 |
| `compression: normal` 的实际压缩比 | 未知 | 工具内部实现 |
| mac 发布/公证/Intel 支持 | 未知（显式未支持） | `:124-128,212-216` 注释声明待真机验收后接入，不以本配置暗示已支持 |

## 11. 覆盖表

| 符号/分支 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| appId/productName/copyright/electronVersion | §2 | 4-9 | covered |
| directories/compression/npmRebuild | §2/§5 | 12-17,41 | covered |
| afterPack/afterSign 钩子 | §3.1/§6 | 20-27 | covered |
| asar/asarUnpack | §3.2 | 29-38 | covered |
| files 收录/排除 | §3.2 | 44-67 | covered |
| extraResources 13 条映射 + 消费者 | §3.3 | 70-122 | covered |
| mac 块（target/entitlements/binaries/extendInfo） | §3.4 | 129-153 | covered |
| dmg 布局 | §3.4 | 157-167 | covered |
| linux 块 | §3.4 | 170-174 | covered |
| win 块（icon/fileAssociations/target） | §3.4 | 179-199 | covered |
| nsis 块（include nsh） | §3.4 | 202-210 | covered |
| publish 块 | §3.4/§7 | 217-221 | covered |
| 测试钉死的字符串契约 | §8/§9 | — | covered |
| resources/bin 缺失与产出方 | §6/§10 | 135-137,182-188 | covered |
| 工具内部语义（icon 解析基准/压缩比/out 布局） | §10 | — | unknown |
