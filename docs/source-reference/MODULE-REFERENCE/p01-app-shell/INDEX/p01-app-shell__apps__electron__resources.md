# p01-app-shell__apps__electron__resources 索引（demo 演示资产与托盘图标）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__apps__electron__resources`（owner `p01-app-shell`，family `apps/electron/resources`）共 7 个文件（1 docs + 6 resource），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：两族资产均随 `extraResources` 进包——`resources/demo`→`demo`（`electron-builder.yml:113-116`，注释「新手引导演示资产（《红楼梦》全书等；主进程按 process.resourcesPath/demo 解析）」）、`resources/tray-icons`→`tray-icons`（`electron-builder.yml:79-82`，注释「托盘图标素材（tray.ts 读取 process.resourcesPath/tray-icons）」）；dev 态经 `build:resources`（`copy-resources.ts:34`）拷到 `dist/resources` 后由 `__dirname/resources` 解析（tray.ts:23-25 注释）。

## apps--electron--resources--demo--hongloumeng-quan-shu.txt

- 职责：新手引导/「AI 速课堂」演示用《红楼梦》全书纯文本（2622979 字节 ≈2.5MB），`cdut-ai-class-manager.ts:214` `DEMO_NOVEL_FILE_NAME = 'hongloumeng-quan-shu.txt'` 对应的演示文档本体。
- 消费：①`apps/electron/src/main/lib/cdut/cdut-ai-class-manager.ts:230-241 resolveDemoNovelPath`——**五候选链**：env `CDUT_DEMO_NOVEL_PATH` > prod `process.resourcesPath/demo/<DEMO_NOVEL_FILE_NAME>` > dev `<appPath>/resources/demo/<同名>` > `<appPath>/../../《红楼梦》全书.txt` > `<cwd>/《红楼梦》全书.txt`，取首个存在者；全缺失返回 null 由调用方如实降级、绝不伪造导入成功（:228-229 注释）；`:268/:282/:290` 以 `document.fileName === DEMO_NOVEL_FILE_NAME` 识别演示文档；②`apps/electron/src/renderer/components/onboarding/coach-tour/coach-tour-steps.ts:45`（同名常量）、`:190`（新手引导步骤定位 `[data-document-name="hongloumeng-quan-shu.txt"]`）。
- 来源：《红楼梦》全书文本（公版文学文本，导入为演示资产）；`change=r03_pr44`。sourceBlob `29bf5be82355db939710eb5e1baa9e238329ca17`；sourceSha256 `50b22882745a2d17d227e4359e97fe74d7b854705d031f3e08707f836e8c2ba2`。
- 打包：进产物——`extraResources` 映射 `resources/demo/`→`demo/`（electron-builder.yml:113-116，filter `**/*`）。
- 影响：删除→AI 速课堂演示文档缺失、新手引导 :190 步骤定位失败（coach tour 找不到该文档名）；改动→演示内容变化；不影响主流程。
- 验证：①核 cdut-ai-class-manager.ts:214/:234-235 与 coach-tour-steps.ts:45/:190 引用；②文本可读、行数/字节与 manifest 一致；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实引导流程（本轮统一 NOT_RUN）。
- 证实/推断/未知：加载点与打包映射=**证实**；文本是否完整 120 回=**未知**（未校验回目）。

## apps--electron--resources--tray-icons--iconTemplate.png

- 职责：macOS 系统托盘图标（Template 单色底图，701 字节）：`tray.ts:20-21` 注释「macOS 使用单色 Template（系统自动着色）」。
- 消费：`apps/electron/src/main/tray.ts:26-28`——`getTrayIconPath()` 在 `process.platform === 'darwin'` 时取 `iconTemplate.png`（resourcesDir=`process.resourcesPath/tray-icons`（打包）/`__dirname/resources/tray-icons`（dev）:24-25）。
- 来源：托盘图标设计资产（Template 命名遵 macOS 托盘惯例）；`change=unchanged_since_093f`。sourceBlob `2b2f816b0f3434faf8c8f4e90a5d77cb882d2613`；sourceSha256 `df716936acecfdfd5921c60b435f92eba054172a1d802658bab5f5220129cb39`。
- 打包：进产物——`extraResources` `resources/tray-icons`→`tray-icons`（electron-builder.yml:79-82）。
- 影响：删除→macOS 托盘图标加载失败（tray 创建退化）；改动→mac 托盘视觉变化；Windows/Linux 不受影响（用 iconTray.png）。
- 验证：①核 tray.ts:26-28 平台选择逻辑；②PNG 头完好；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实 macOS 托盘显示。
- 证实/推断/未知：选择逻辑与打包=**证实**；「Template 系统自动着色」的显示效果=**推断**（macOS/Electron 惯例，未真机验证）。

## apps--electron--resources--tray-icons--iconTemplate--2x.png

- 职责：macOS 托盘图标 HiDPI @2x 变体（1278 字节），供 Retina 屏取用。
- 消费：Electron `nativeImage`/`Tray` 按同目录 `iconTemplate@2x.png` 命名约定在高 DPI 下自动配套加载（Electron/Chromium 资源倍率惯例=推断）；代码侧基准名由 `tray.ts:26-28` 选定 `iconTemplate.png`（本文件为其 @2x 同族，实读目录结构证实）。
- 来源：托盘图标设计资产（@2x 倍率导出）；`change=unchanged_since_093f`。sourceBlob `2cbbcf92cb975ae82a26289241ee3aa02a47c57a`；sourceSha256 `429156b980c72ef607d747aa1b4b911f29e467b5a620c64e50cb5ce67663aa5c`。
- 打包：进产物——`extraResources` `tray-icons/` 目录 filter `**/*`（electron-builder.yml:79-82）。
- 影响：删除→Retina 屏托盘图标模糊/放大失真（回退 @1x）；改动→高分屏视觉变化。
- 验证：①PNG 头完好、与基准图同族同名；②核 yml:79-82 目录打包；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真机 Retina 显示。
- 证实/推断/未知：存在性/打包=**证实**；@2x 自动配套加载=**推断**（Electron 命名惯例，代码未显式引用）。

## apps--electron--resources--tray-icons--iconTemplate--3x.png

- 职责：macOS 托盘图标 HiDPI @3x 变体（1866 字节），供超高分屏取用。
- 消费：同 `iconTemplate@2x.png`——Electron 按 `@3x` 命名约定自动配套（推断）；基准名见 `tray.ts:26-28`。
- 来源：托盘图标设计资产（@3x 倍率导出）；`change=unchanged_since_093f`。sourceBlob `072abf7235dc7fa4f5f9d96502ea3e5b044b82f4`；sourceSha256 `81b6832db11988ffb92f7f21e2cc84010a142a142b79eed25be7c3c210873852`。
- 打包：进产物——`extraResources` `tray-icons/`（electron-builder.yml:79-82）。
- 影响：删除→超高分屏托盘回退低倍率图；改动→该档位视觉变化。
- 验证：同 @2x 三项；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：存在性/打包=**证实**；自动配套=**推断**。

## apps--electron--resources--tray-icons--iconTray.png

- 职责：Windows/Linux 系统托盘彩色图标（3027 字节）：`tray.ts:20-21` 注释「其余平台使用彩色版本」。
- 消费：`apps/electron/src/main/tray.ts:26-28`——非 darwin 平台取 `iconTray.png`（resourcesDir 解析同上 :24-25）。
- 来源：托盘图标设计资产；`change=unchanged_since_093f`。sourceBlob `5d7c38f0404ca4e4dfd2965edf3c2325f7b1148c`；sourceSha256 `caa4950291beee0f184c4886f88ec4ed8821b5f63fcec3bbe5f6772970ff0264`。
- 打包：进产物——`extraResources` `tray-icons/`（electron-builder.yml:79-82）。
- 影响：删除→Windows/Linux 托盘图标加载失败；改动→两平台托盘视觉变化；macOS 不受影响。
- 验证：①核 tray.ts:26-28；②PNG 头完好；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真机托盘显示。
- 证实/推断/未知：选择逻辑与打包=**证实**；真机显示效果=**未知**。

## apps--electron--resources--tray-icons--iconTray--2x.png

- 职责：Windows/Linux 托盘图标 HiDPI @2x 变体（9100 字节）。
- 消费：Electron 按 `iconTray@2x.png` 命名约定自动配套（推断）；基准名由 `tray.ts:26-28` 选定。
- 来源：托盘图标设计资产（@2x 导出）；`change=unchanged_since_093f`。sourceBlob `0807b07ee720546a3e55f4b041a62fc9bef8d6c3`；sourceSha256 `d8e7d3f71d248d765c5e5f8500fc3c83746dd6367b8cde735abc0c14219a8d76`。
- 打包：进产物——`extraResources` `tray-icons/`（electron-builder.yml:79-82）。
- 影响：删除→高分屏托盘模糊回退；改动→该档位视觉变化。
- 验证：PNG 头/同族命名/目录打包/`hash` 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：存在性/打包=**证实**；自动配套=**推断**。

## apps--electron--resources--tray-icons--iconTray--3x.png

- 职责：Windows/Linux 托盘图标 HiDPI @3x 变体（16747 字节）。
- 消费：Electron 按 `iconTray@3x.png` 命名约定自动配套（推断）；基准名由 `tray.ts:26-28` 选定。
- 来源：托盘图标设计资产（@3x 导出）；`change=unchanged_since_093f`。sourceBlob `c63cf38cdea40a5613038a86a584856d9743be77`；sourceSha256 `14f0cc544ffd70f8c687f39177b1274bb9c315a9e159c726372ab829a3e2b04f`。
- 打包：进产物——`extraResources` `tray-icons/`（electron-builder.yml:79-82）。
- 影响：删除→超高分屏托盘回退低倍率；改动→该档位视觉变化。
- 验证：PNG 头/同族命名/目录打包/`hash` 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：存在性/打包=**证实**；自动配套=**推断**。
