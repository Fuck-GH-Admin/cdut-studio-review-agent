# p01-app-shell__apps__electron 索引（apps/electron/resources 应用级运行资源）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__apps__electron`（owner `p01-app-shell`，family `apps/electron`）共 8 个文件（7 resource + 1 docs），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：`apps/electron/resources/` 是应用资源根。加载约定（实读证实）：打包态由 electron-builder `extraResources` 复制到 `process.resourcesPath/`（`apps/electron/electron-builder.yml:70-122`），开发态由 `build:resources`（`apps/electron/scripts/copy-resources.ts:34`，"resources → dist/resources"）拷到 `dist/resources`，运行时代码按 `app.isPackaged` 二选一解析（如 `changelog-service.ts:15-19`、`bulletin-service.ts:15-19`、`ipc.ts:929-933`）。本篇逐文件写具体加载点。

## apps--electron--resources--CDUT_Studio.svg

- 职责：应用图标矢量源图（SVG，101440 字节），`resources/generate-icons.sh:4`「Generates all required icon formats from CDUT_Studio.svg」的唯一源（`APP_SVG="CDUT_Studio.svg"` `:13`、`TRAY_SVG="CDUT_Studio.svg"` `:14`）——由它派生 icon.png/icns/ico 与托盘图标全家桶。
- 消费：①`resources/generate-icons.sh:13-14`（图标产线输入，渲染 1024 icon.png :55-57、icns iconset :88-100、ico :111-112）；②`apps/electron/scripts/packaging-guards.test.ts:285`（打包守卫测试断言该 SVG 存在）。无运行时加载（产品运行不读它）。
- 来源：图标设计源（Profer/CDUT Studio 标识 SVG）；`change=unchanged_since_093f`。sourceBlob `ca3fe8f1091a9006f15c234a03a2a33c3fcb160f`；sourceSha256 `ffb559cc4fee56ac312ed664b4f2b520b907b372c9636739aa9c32cc755f37c4`。
- 打包：不直接进产物——不在 `files:`/`extraResources:`（electron-builder.yml:44-68/:70-122）；但它是全部打包图标的上游源（推断自产线关系）。
- 影响：删除→图标产线无法再生成各格式图标、`packaging-guards.test.ts:285` 失败；现有图标产物不受影响（已生成）。
- 验证：①核 generate-icons.sh:4/:13/:14 引用与文件存在；②SVG 根元素可解析；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/图标重生成（本轮统一 NOT_RUN）。
- 证实/推断/未知：引用关系与用途=**证实**（实读产线脚本与守卫测试）；各图标产物与其逐一对应关系=**推断**（未重跑生成脚本比对）；设计定稿时间=**未知**。

## apps--electron--resources--CHANGELOG.json

- 职责：版本更新日志数据（39434 字节 JSON，顶层键 `releases`），供「设置 → 软件更新 → 版本历史」展示。
- 消费：`apps/electron/src/main/lib/changelog-service.ts:15-19`——prod 读 `process.resourcesPath/CHANGELOG.json`、dev 读 `__dirname/resources/CHANGELOG.json`（build:resources 拷贝）；打包映射 `electron-builder.yml:104-106`（`from: resources/CHANGELOG.json to: CHANGELOG.json`，注释即「设置 → 软件更新 → 版本历史；changelog-service 读取」）。
- 来源：随版本发布维护的更新日志数据（团队撰写）；`change=r03_pr44`。sourceBlob `914b14fba9b4bb747ac732a7e7c127a0cead7102`；sourceSha256 `2fbf6454959f0abda9c2757a88f3a21c75370bc4d1f9bfd12178bc9118cbb047`。
- 打包：进产物——`extraResources` 映射到安装包 `resources/CHANGELOG.json`（electron-builder.yml:104-106，证实）。
- 影响：删除/改坏→「版本历史」页加载失败或内容缺失（changelog-service 直读该 JSON）；不影响其它功能。
- 验证：①JSON 可解析且 `releases` 键存在；②核 changelog-service.ts:15-19 与 yml:104-106 映射；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：加载点与打包映射=**证实**；`releases` 各条目与 git tag 的一致性=**未知**（未逐版比对）。

## apps--electron--resources--background.png

- 职责：界面背景图（PNG，11177293 字节 ≈10.7MB，本组最大资源），聊天界面背景视觉资产。
- 消费：`apps/electron/src/renderer/components/agent/AgentMessages.tsx:986`——`<img src="cdut-resource://background.png">`；该协议由 `apps/electron/src/main/lib/local-resource-protocol.ts:3,21` 把 `cdut-resource://<path>` 映射到 `process.resourcesPath/`（打包）或 `__dirname/resources`（开发，`ipc.ts:929-933` 同约定）。打包映射 `electron-builder.yml:111-112`（`from: resources/background.png to: background.png`，注释「背景图」）。
- 来源：界面视觉设计资产；`change=unchanged_since_093f`。sourceBlob `9bd9babc3e5ce4c81440eace3c831dbd35722cf7`；sourceSha256 `5ac4966faa4b44f93316eb66d5accc8fd83a56db0514964f45f1ef9058145858`。
- 打包：进产物——`extraResources` 映射到 `resources/background.png`（electron-builder.yml:111-112，证实）。
- 影响：删除→AgentMessages.tsx:986 背景图 404、聊天界面背景缺失；改动→视觉变化并增大安装包（当前 10.7MB，占 extraResources 大头）。
- 验证：①`cdut-resource://background.png` 经 local-resource-protocol 可解析到该文件（协议映射实读）；②PNG 头完好；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：加载点/协议/打包映射=**证实**；图片视觉内容与设计稿一致性=**未知**（未做像素级核对）。

## apps--electron--resources--bulletin.json

- 职责：本地系统公告栏数据（5403 字节 JSON）：顶层 `version: 1.1.0` + `items[]`（id/title/date/category/summary/tag/content/pinned），含 2026-10-21 安全公告（pinned）、2026-10-08 欢迎公告、隐私原则 tip 等，供「设置 → 关于 → 查看系统公告」翻阅。
- 消费：`apps/electron/src/main/lib/bulletin-service.ts:15-19`——prod 读 `process.resourcesPath/bulletin.json`、dev 读 `__dirname/resources/bulletin.json`；打包映射 `electron-builder.yml:107-109`（注释「本地系统公告栏；bulletin-service 读取」）。
- 来源：随安装包内置的公告内容（团队撰写，:29 自述「公告与更新日志随安装包内置发布……不发起新闻类网络请求」）；`change=r03_pr44`。sourceBlob `a047bf3bc230da8e9fa5c1ee6717197da553465d`；sourceSha256 `226d400d612e3e8e4e2c814e37d9029cc94d6c8b09acfbff514843e9aaf08548`。
- 打包：进产物——`extraResources` 映射到 `resources/bulletin.json`（electron-builder.yml:107-109，证实）。
- 影响：删除/改坏→公告栏加载失败；改动→用户可见公告内容变化（含安全公告的对外口径）。
- 验证：①JSON 可解析、`version`/`items` 结构完整（实读 :1-:30）；②核 bulletin-service.ts:15-19 与 yml:107-109；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：结构/加载/打包=**证实**；公告所述安全修复的技术真实性=**未知**（公告文本是调查对象，不当作安全结论）。

## apps--electron--resources--icon.icns

- 职责：macOS 应用图标（Apple iconset 格式，84334 字节），由 `generate-icons.sh:81-105` 从 icon.png 生成的 iconset（16→1024 各档 :88-:97）经 `iconutil` 打包（:100）。
- 消费：①`electron-builder.yml:131`——mac 段 `icon: resources/icon.icns`（打包时嵌入 .app/Dock 图标）；②运行时窗口图标解析按平台取名 `icon.icns`：`main/index.ts:449`、`ipc.ts:977`（候选 AppIcon.icns/app.icns/icon.icns）、`detached-preview-window.ts:27`、`planning-window.ts:23`、`cslab-window-manager.ts:45`（均在 resourcesDir 下解析）；③`packaging-guards.test.ts:284` 存在性断言。
- 来源：generate-icons.sh:81-105 产线生成（源=CDUT_Studio.svg→icon.png）；`change=unchanged_since_093f`。sourceBlob `bd2324bd0936dbf8dee565fc6e15db2e1a323188`；sourceSha256 `ecbab8d6d15b18346c79274d50301e74b65bb877d1ee21bf11d6a010039055ba`。
- 打包：进产物——mac 构建 `icon:` 输入（yml:131）+ `extraResources`（yml:100-103 仅 ico/png；icns 由 buildResources `resources` 目录供 mac 图标，yml:14 `buildResources: resources`）；运行时窗口图标从 resourcesDir 读取（证实加载点，嵌入机制=electron-builder 行为推断）。
- 影响：删除→mac 打包失败或回退默认图标、mac 窗口/Dock 图标缺失（多处解析点退化）；改动→mac 图标视觉变化。
- 验证：①核 yml:131、main/index.ts:449 等引用；②`file` 复核 icns 结构；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实 macOS 打包。
- 证实/推断/未知：引用与产线=**证实**；mac 嵌入行为细节=**推断**；与 SVG 源的像素一致性=**未知**（未重跑产线）。

## apps--electron--resources--icon.ico

- 职责：Windows 应用图标（408142 字节，多档 .ico），`generate-icons.sh:111-112`「magick icon.png -define icon:auto-resize=… icon.ico」产线生成；另作 `set-exe-icon.ts` 的 exe 图标写入源。
- 消费：①`electron-builder.yml:100-101`（`extraResources: from: resources/icon.ico to: icon.ico`）；②`electron-builder.yml:192/:195`——win `fileAssociations`（profer-backup / profer-share 扩展名关联图标）；③`apps/electron/scripts/set-exe-icon.ts:10`（`resources/icon.ico` 写入 exe 图标，:17 缺失报错）；④`packaging-guards.test.ts:282` 存在性断言；⑤运行时窗口图标按平台取 `icon.ico`（`main/index.ts:451`、`detached-preview-window.ts:29`、`planning-window.ts:25`、`cslab-window-manager.ts:47`、dev 快捷方式 `dev-shell-shortcut.ts:50`）。
- 来源：generate-icons.sh:111-112 产线生成（源 icon.png）；`change=unchanged_since_093f`。sourceBlob `3e273c448e2bf26cfc16bb7b521cf297e5101bde`；sourceSha256 `89b1b6225c91967838f7c19d3ca7bd800325b2e76bb8fce80b68f23ab2bcbfe6`。
- 打包：进产物——`extraResources` 映射 `resources/icon.ico`（yml:100-101）+ 文件关联图标（yml:192/:195）+ exe 图标写入（set-exe-icon.ts）。
- 影响：删除→Windows 打包/文件关联图标缺失、set-exe-icon.ts:17 报错、多处窗口图标退化；改动→Windows 图标视觉变化。
- 验证：①核五处引用；②`file` 复核 .ico 多档结构；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实 Windows 打包。
- 证实/推断/未知：引用与打包映射=**证实**；exe 图标写入的最终效果=**推断**（未跑 set-exe-icon）。

## apps--electron--resources--icon.png

- 职责：1024 级应用图标 PNG（478850 字节），图标产线中间产物与 Linux/通用窗口图标源（generate-icons.sh:133「icon.png (1024x1024) - Linux & macOS Dock」）。
- 消费：①`electron-builder.yml:102-103`（`extraResources: from: resources/icon.png to: icon.png`）；②运行时窗口图标解析 `main/index.ts:453`、`ipc.ts:1287`（resourcesDir 下 icon.png）；③平台兜底 `detached-preview-window.ts:30`、`planning-window.ts:26`、`cslab-window-manager.ts:48`；④`packaging-guards.test.ts:283` 存在性断言。无 renderer 引用（检索证实）。
- 来源：generate-icons.sh:55-57 产线生成（`render_svg 1024` + magick 居中）；`change=unchanged_since_093f`。sourceBlob `f423fe3eafbf5d612a24777da53ab9d02c03bbe7`；sourceSha256 `02907b294ffbbe9c8a8e9f8571a3eb030e1eefa02f6684888a05486ce52407d7`。
- 打包：进产物——`extraResources` 映射 `resources/icon.png`（yml:102-103，证实）。
- 影响：删除→extraResources 缺项、Linux/兜底窗口图标缺失、守卫测试失败；改动→通用窗口图标视觉变化。
- 验证：①核四处引用与 yml:102-103；②PNG 尺寸/格式复核；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：引用与打包=**证实**；「1024 级」精确尺寸=**推断**（generate-icons.sh:116 自检 1024x1024 的规格，本轮未跑 identify 复核本文件）。

## apps--electron--resources--tutorial.md

- 职责：开发态教程正文副本（29002 字节 Markdown），教程查看器/欢迎对话在 dev 模式下的内容来源。
- 消费：`apps/electron/src/main/lib/tutorial-service.ts:25-26`——dev 模式读 `join(__dirname, 'resources/tutorial.md')`（:25 注释「开发模式：resources/ 经 build:resources 复制到 dist/resources/」）；打包态教程**不读本文件**，读 `process.resourcesPath/tutorial.md`（:23），后者由 `electron-builder.yml:77-78` 从 `../../tutorial/tutorial-v2.md` 复制（即打包内容来自 tutorial-v2.md）。**两者内容不同**：本文件 sha256 `cbac2d9e…` vs `tutorial/tutorial-v2.md` `76b14920…`（机械比对证实）——dev/prod 教程正文存在漂移。
- 来源：教程文档（与 `tutorial/tutorial-v2.md` 同源演化的副本，产生机制=未知，未见同步脚本）；`change=r03_pr44`。sourceBlob `208a2ddf06cb034de5f68850ea3e96617d567bcc`；sourceSha256 `cbac2d9ec4607843b865916e37f5134a9807fd6141af13ad6ebba7c6e141df6a`。
- 打包：不进产物本体——不在 `extraResources` 清单（打包教程来自 tutorial-v2.md，yml:77-78）；dev 经 build:resources 拷入 dist/resources（copy-resources.ts:34）。
- 影响：删除→dev 模式教程查看器无内容（prod 不受影响）；改动→只影响 dev 教程（若误以为它是打包源会造成 dev/prod 内容不一致——当前已不一致）。
- 验证：①核 tutorial-service.ts:23/:25-26 双路径；②sha256 与 tutorial-v2.md 比对确认漂移成立；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI。
- 证实/推断/未知：双路径与 hash 漂移=**证实**；副本产生机制/应否统一=**未知**（已记为待决问题）。
