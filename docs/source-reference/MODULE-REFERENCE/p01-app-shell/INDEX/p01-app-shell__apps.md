# p01-app-shell__apps 索引（apps/electron 应用图标源文件）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__apps`（owner `p01-app-shell`，family `apps`）共 2 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：`apps/electron/` 根下的应用图标源文件，与 `apps/electron/resources/` 下的运行时图标副本（`resources/icon.ico|icon.png|icon.icns`，由 `resources/generate-icons.sh:51-135` 从 SVG 生成）是不同文件；本组 2 文件不进 extraResources 清单。

## apps--electron--icon.ico

- 职责：Windows 应用图标源（MS Windows icon resource，6 帧：16x16 至 256x256，PNG 编码帧 RGBA，87300 字节）。
- 消费：**无已知消费者（实测）**——electron-builder `win.icon: icon.ico`（electron-builder.yml:180）实际解析到 `apps/electron/resources/icon.ico`：本仓 `buildResources=resources`（yml:14），app-builder-lib `platformPackager.getResource` 先在 buildResourcesDir 列表命中即返回（`resolveIcon` 亦 `--root buildResourcesDir --root projectDir` 顺序），`resources/icon.ico` 存在即被采用，根 icon.ico 不参与；仅当 `resources/icon.ico` 缺失时才可能经 projectDir 兜底被解析（=推断）。无 TS 代码读取本文件（`set-exe-icon.ts:10`、`packaging-guards.test.ts:282` 用的是 `resources/icon.ico`，非本文件，实读证实）。与根 icon.png 同为「无已知消费者」。
- 来源：图标设计资产（与 `resources/generate-icons.sh:111-112` 由 icon.png 生成 .ico 的产线同源形态，具体生成记录=未知）；`change=unchanged_since_093f`。sourceBlob `e7ccd653e984a56f52ceab23b7c1a5be9bbb078b`；sourceSha256 `fc85c47b37322b04c94001926cd1a7edcb98db83c52a1ed52c4ed3ff20be616e`。
- 打包：**不进产物（已知范围内）**——`win.icon` 实输入=`resources/icon.ico`（buildResources 优先解析）；本文件不在 `files:`/`extraResources:`（electron-builder.yml:44-68/:70-122），仅 `resources/icon.ico` 缺失场景可能经 projectDir 兜底进入 win.icon（=推断）。
- 影响：删除→零已知影响（`resources/icon.ico` 仍供给 `win.icon`，图标产线 `generate-icons.sh`/`after-pack.cjs` 均不读本文件）；与 icon.png 一致属冗余源副本性质。
- 验证：①`file` 复核 6 帧 ICO 结构；②核 `electron-builder.yml:180` 指向存在；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实 Windows 打包（本轮统一 NOT_RUN）。
- 证实/推断/未知：文件结构、:180 引用、非 extraResources=**证实**；exe/安装器嵌入行为=**推断**（electron-builder 惯例，未跑打包）；图标设计来源=**未知**。

## apps--electron--icon.png

- 职责：1024x1024 RGBA PNG 应用图标源图（113900 字节），`resources/generate-icons.sh:51-57` 所述「icon.png (1024x1024) 从 SVG 生成」形态的同规格图标位图。
- 消费：**未发现消费者**——全树检索 `icon.png` 的全部引用均指向 `resources/icon.png` 或临时路径（`electron-builder.yml:102`、`main/index.ts:453`、`ipc.ts:1287`（resourcesDir 解析）、`detached-preview-window.ts:30`、`planning-window.ts:26`、`cslab-window-manager.ts:48`、`packaging-guards.test.ts:283`），无任何指向 `apps/electron/icon.png`（证实：逐条实读检索结果）；推测为开发期图标源副本或打包输入备份（推断）。
- 来源：图标设计资产（1024x1024 与 generate-icons.sh:56 的产线规格一致；具体生成记录=未知）；`change=unchanged_since_093f`。sourceBlob `62e892e15c6a5d6994f02953677cd485d2469a5f`；sourceSha256 `80ddd90c0b410c709e905b0370b88805a72eb9ede8336817c6c03fcee98bcfb6`。
- 打包：不进产物——不在 `files:`/`extraResources:`（electron-builder.yml:44-68/:70-122），亦无构建配置引用（证实）。
- 影响：删除对构建/运行无已知影响（零消费者）；若它是 generate-icons.sh 产线的人工源副本，删除仅损失再生成便利（推断）。
- 验证：①`file` 复核 1024x1024 RGBA；②全树检索 `icon.png` 引用逐条核对均非本文件；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：尺寸格式、零消费者=**证实**；「开发期源副本」=**推断**；是否曾被某构建脚本在树外引用=**未知**（仅检索了冻结树内引用面）。
