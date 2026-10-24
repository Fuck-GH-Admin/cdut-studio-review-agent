# p01-app-shell__assets 索引（仓根 assets/ 品牌、IP、评测与团队资产）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__assets`（owner `p01-app-shell`，family `assets`）共 16 个文件（15 resource + 1 docs），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景（实读证实）：仓根 `assets/` 是品牌/吉祥物/评测/团队素材库。两种消费通道：①renderer 静态导入——`apps/electron/vite.config.ts:66` 把别名 `@assets` 解析到 `../../assets`（仓根 assets），被 `import` 的图片经 Vite 打进 `dist/`（`electron-builder.yml:44-46` `files: dist/**/*` 随 asar 进包）；②纯文档引用——README 相对链接/`<img>`，仅供人读不进产物。逐文件标注走哪条通道。

## assets--CDUT--CDUT-CE-white.png

- 职责：成都理工大学（CDUT）计算机学院标识白色反相版 PNG（130532 字节），深色背景场景使用。
- 消费：`apps/electron/src/renderer/components/shared/CdutLogo.tsx:12`——`import cdutCeWhite from '@assets/CDUT/CDUT-CE-white.png'`（vite alias `@assets`→仓根 assets，vite.config.ts:66）；生成侧：`apps/electron/scripts/crop-cdut-white-logo.ts:15` 默认输出 `../../assets/CDUT/CDUT-CE-white.png`、`:17`「与 assets/CDUT/CDUT-CE.png 完全一致的裁切窗口」。
- 来源：由 `CDUT-CE.png` 经 `crop-cdut-white-logo.ts` 裁切/反相生成（脚本自述）；`change=r03_pr44`。sourceBlob `7dfb204e72472d0aa1eb179a9ef14a9a5f5d0fc9`；sourceSha256 `ada60ea91d7f05735e520b2f3d9cea85e589729cdcc1d426705a9f61271010c4`。
- 打包：进产物——renderer 导入经 Vite 打入 `dist/`（yml:44-46 `files: dist/**/*`，随 asar）；导入链=证实，Vite 产出路径=构建机制推断。
- 影响：删除→`CdutLogo.tsx:12` 构建失败（import 解析失败）；改动→深色底标识视觉变化。
- 验证：①核 CdutLogo.tsx:12 与 crop-cdut-white-logo.ts:15/:17；②PNG 头完好；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI（本轮统一 NOT_RUN）。
- 证实/推断/未知：导入/生成脚本=**证实**；与 CDUT 官方标识一致性=**未知**（未对照官方矢量源）。

## assets--CDUT--CDUT-CE.png

- 职责：成都理工大学（CDUT）计算机学院标识彩色版 PNG（176404 字节），品牌标识主图。
- 消费：`CdutLogo.tsx:11`——`import cdutCeColor from '@assets/CDUT/CDUT-CE.png'`；亦是白色版的裁切源（`crop-cdut-white-logo.ts:17`）。
- 来源：品牌标识设计资产；`change=unchanged_since_093f`。sourceBlob `d1a83acee3b74c0293ef297695ee666e9bafef44`；sourceSha256 `166c92e19320d595b8a5ac096f17a3256928d12a9cc0d7294f2dfc57a8d4cccc`。
- 打包：进产物——renderer 导入经 Vite 打入 `dist/`（yml:44-46）。
- 影响：删除→CdutLogo.tsx:11 构建失败、白色版再生成无源；改动→品牌标识视觉变化。
- 验证：核 :11 导入、crop 脚本引用、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：导入/生成关系=**证实**；官方一致性=**未知**。

## assets--IP--IP_1.jpg

- 职责：「砚小龙」IP 吉祥物立绘 JPG（1070614 字节 ≈1MB），浅色主题水印背景图。
- 消费：`apps/electron/src/renderer/components/cdut-zone/CdutWatermarkBackground.tsx:13`——`import lightMascotImg from '@assets/IP/IP_1.jpg'`（浅色 mascot；同文件 :14 深色用 `Cute_IP/Breathing.png`）。
- 来源：IP 形象设计资产；`change=unchanged_since_093f`。sourceBlob `769339f5d84b9fb80879c05d47ac9694060ca5cc`；sourceSha256 `5e377f94533f70f59b1456cb4fd839a86e5013d9fe34936902c853c885f95faa`。
- 打包：进产物——renderer 导入经 Vite 打入 `dist/`（yml:44-46）。
- 影响：删除→CdutWatermarkBackground.tsx:13 构建失败、浅色水印缺失；改动→水印视觉变化（注意体积 1MB）。
- 验证：核 :13 导入、JPG 头、hash；NOT_RUN。
- 证实/推断/未知：导入=**证实**；形象设计定稿=**未知**。

## assets--MultiHop-RAG-Scores--multihop-rag-report.csv

- 职责：MultiHop-RAG 基准评测逐题结果数据（CSV，7188798 字节 ≈7MB）：官方全集 2556 题的评测明细导出。
- 消费：无人类之外消费者——全树检索 `multihop-rag-report.csv` 零命中（证实）；其同名导出机制在 `packages/benchmark-multihop/src/server.ts:195`（`Content-Disposition: attachment; filename="multihop-rag-report.${extension}"`，看板导出按钮产物），即本文件是评测看板导出的归档（推断自命名与生成器）。
- 来源：`packages/benchmark-multihop` 评测工具产出（dataset=`huggingface:yixuantt/MultiHopRAG` 官方全集，`multihop-rag-report.md:3` 自述；指标口径 `src/metrics.ts:4`）；`change=unchanged_since_093f`。sourceBlob `2e01a21a7f4760eacb763fcff0329d22068f0cf6`；sourceSha256 `991b44e63666063c7c3df7028fb09fc6238c4588449a798e5cee31605fc08dba`。
- 打包：不进产物——无 renderer/主进程导入、不在 electron-builder `files:`/`extraResources:`（yml:44-68/:70-122）；仅仓库存档。
- 影响：删除→评测明细审计数据丢失（README:188 报告的底层数据断档）；构建/运行无影响。
- 验证：①CSV 表头/行数抽查；②核生成器 server.ts:195；③hash 一致；NOT_RUN：评测重跑（NOT_RUN）。
- 证实/推断/未知：零代码消费者/生成器存在=**证实**；「本文件确由该导出生成」=**推断**（未见提交记录）；数据真实性=**未知**（未复跑评测）。

## assets--MultiHop-RAG-Scores--multihop-rag-report.json

- 职责：MultiHop-RAG 评测结果结构化数据（JSON，11942009 字节 ≈11.9MB）：含 `datasetLabel: 官方全集 MultiHop-RAG（2556 题）`（:3）等指标/明细。
- 消费：零代码消费者（全树检索 `multihop-rag-report.json` 零命中，证实）；同上，看板导出归档（`server.ts:195` 同名机制，推断）。
- 来源：`packages/benchmark-multihop` 评测产出；`change=r03_pr44`。sourceBlob `3e2328b1113af37118026975e3ef90bfe2cd2f8c`；sourceSha256 `51249052ea792269b82fd2d24d61c52dd6f12c07799f6be1c702150ec25ae015`。
- 打包：不进产物（同上）。
- 影响：删除→结构化评测数据丢失；构建/运行无影响。
- 验证：JSON 可解析、`datasetLabel` 存在、hash 一致；NOT_RUN：评测重跑。
- 证实/推断/未知：零消费者/结构=**证实**；生成归因=**推断**；数据真实性=**未知**。

## assets--MultiHop-RAG-Scores--multihop-rag-report.md

- 职责：MultiHop-RAG 评测完整技术报告（4264 字节）：`# MultiHop-RAG 检索增强生成评测报告`（:1）、数据集=官方全集 2556 题（`huggingface:yixuantt/MultiHopRAG`，:3），README:188 链接的「详细评测指标定义、分题型雷达及数据审计」正文。
- 消费：`README.md:188` 相对链接引用（实读证实）；生成侧：`packages/benchmark-multihop/src/report.ts:46` `lines.push('# MultiHop-RAG 检索增强生成评测报告')`（同标题，报告生成器）。
- 来源：`benchmark-multihop` 报告生成器产出 + 人工定稿（推断混合）；`change=r03_pr44`。sourceBlob `55c94894eb21de08a3a10fe64e9413ccfa3ac64f`；sourceSha256 `e3850b5523fc336d7e3d7e831c0b9effcfe60337a9104be6e74493445cca61b2`。
- 打包：不进产物（纯文档，README 引用）。
- 影响：删除→README:188 链接 404、对外评测结论失去正文依据；构建/运行无影响。
- 验证：核 :1/:3、README:188 链接目标存在、report.ts:46 生成标题、hash 一致；NOT_RUN。
- 证实/推断/未知：引用与生成器=**证实**；报告指标与 csv/json 数据一致性=**未知**（未逐项比对）。

## assets--README.svg

- 职责：README 顶部横幅 Banner（SVG，6462 字节，alt「CDUT Studio Banner」）。
- 消费：`README.md:2`——`<img src="assets/README.svg" width="100%" alt="CDUT Studio Banner" />`（实读证实）；无代码消费者（全树检索 `README.svg` 仅命中 README:2）。
- 来源：品牌横幅设计资产；`change=unchanged_since_093f`。sourceBlob `68b1e55b147eb40a71afd537a61494983b17ac56`；sourceSha256 `258c8a8b0ef15ad419ae32c93065c766b66e10b0bbf8f84087bc8eec0810fdc0`。
- 打包：不进产物（README 专用，不在 files/extraResources）。
- 影响：删除→README:2 横幅裂图；构建/运行无影响。
- 验证：核 README:2、SVG 根元素、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计来源=**未知**。

## assets--mascot_back.png

- 职责：「砚小龙」吉祥物背面三视图 PNG（275209 字节）。
- 消费：`README.md:357`——`<img src="assets/mascot_back.png" width="30%" alt="Back View"/>`（实读证实）；无代码消费者。
- 来源：IP 形象设计资产（三视图）；`change=unchanged_since_093f`。sourceBlob `4107b77e8517e3d71b643a20980b5d08b81dec80`；sourceSha256 `18f4fb675c09c3b0d90003ad7757352743bfa311e50487eaac98ad1bbf63f766`。
- 打包：不进产物（README 专用）。
- 影响：删除→README:357 裂图；构建/运行无影响。
- 验证：核 README:357、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计来源=**未知**。

## assets--mascot_front.png

- 职责：「砚小龙」吉祥物正面三视图 PNG（300098 字节）。
- 消费：`README.md:355`——`<img src="assets/mascot_front.png" width="30%" alt="Front View"/>`（实读证实）；无代码消费者。
- 来源：IP 形象设计资产（三视图）；`change=unchanged_since_093f`。sourceBlob `76a429d4a0c7abdd8e77586d808bd95311167e8e`；sourceSha256 `5647494f15c96e58f76411fc74a22b90728b079b8bdac970b5361e64c1e66510`。
- 打包：不进产物（README 专用）。
- 影响：删除→README:355 裂图；构建/运行无影响。
- 验证：核 README:355、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计来源=**未知**。

## assets--mascot_side.png

- 职责：「砚小龙」吉祥物侧面三视图 PNG（267829 字节）。
- 消费：`README.md:356`——`<img src="assets/mascot_side.png" width="30%" alt="Side View"/>`（实读证实）；无代码消费者。
- 来源：IP 形象设计资产（三视图）；`change=unchanged_since_093f`。sourceBlob `074fc2c6c6d4d78f59364220a72002da727547ed`；sourceSha256 `700eea0c2c5de4834de60e137855091404683334abc1eb61cdec56056ad07c68`。
- 打包：不进产物（README 专用）。
- 影响：删除→README:356 裂图；构建/运行无影响。
- 验证：核 README:356、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计来源=**未知**。

## assets--mascot_sitting.png

- 职责：「砚小龙」吉祥物坐姿图 PNG（398455 字节），README「遇见"砚小龙"」章节主图（alt「砚小龙 - CDUT Studio 专属伴学助手」）。
- 消费：`README.md:334`——`<img src="assets/mascot_sitting.png" width="220px" alt="砚小龙 - CDUT Studio 专属伴学助手" />`（实读证实）；无代码消费者。
- 来源：IP 形象设计资产；`change=unchanged_since_093f`。sourceBlob `c6ac54befedc3d2f461d03eb42a645415e28c7c7`；sourceSha256 `c10da064f37901e94f8063307b2b37a1ebf0a686f3ecb45b5d2c6cce98fd664e`。
- 打包：不进产物（README 专用）。
- 影响：删除→README:334 裂图、吉祥物章节失图；构建/运行无影响。
- 验证：核 README:334、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：引用=**证实**；设计来源=**未知**。

## assets--team--team-1.jpg

- 职责：开发团队成员展示图 1（JPG，40590 字节），「设置 → 关于」团队区素材。
- 消费：`apps/electron/src/renderer/components/settings/AboutSettings.tsx:25`——`import team1 from '@assets/team/team-1.jpg'`（实读证实）。
- 来源：团队照片/头像素材；`change=unchanged_since_093f`。sourceBlob `e742f60da960bf412865e5af89be9ba613bca5cc`；sourceSha256 `ad5b8ec9ec03e1e688b9c8867fb4c408d4d22a723a63c131f2e3647d3f4426fa`。
- 打包：进产物——renderer 导入经 Vite 打入 `dist/`（yml:44-46）。
- 影响：删除→AboutSettings.tsx:25 构建失败、团队区缺图；改动→关于页视觉变化。
- 验证：核 :25 导入、JPG 头、hash；NOT_RUN。
- 证实/推断/未知：导入=**证实**；素材授权/来源=**未知**。

## assets--team--team-2.gif

- 职责：开发团队成员展示图 2（GIF，296977 字节）。
- 消费：`AboutSettings.tsx:26`——`import team2 from '@assets/team/team-2.gif'`（实读证实）。
- 来源：团队照片/头像素材；`change=unchanged_since_093f`。sourceBlob `0703eedaf086ae6dd967e45638ed55e79f29b260`；sourceSha256 `789e58de2b7cff8ac7f7beb9f0d674b82cbbb94a3551de4f17fbebc92be4b84d`。
- 打包：进产物——renderer 导入入 `dist/`（yml:44-46）。
- 影响：删除→AboutSettings.tsx:26 构建失败；改动→关于页视觉变化（GIF 可能为动图）。
- 验证：核 :26 导入、GIF 头、hash；NOT_RUN。
- 证实/推断/未知：导入=**证实**；是否动图=**推断**（GIF 格式）；素材授权=**未知**。

## assets--team--team-3.png

- 职责：开发团队成员展示图 3（PNG，1689770 字节 ≈1.6MB，本组团队图最大）。
- 消费：`AboutSettings.tsx:27`——`import team3 from '@assets/team/team-3.png'`（实读证实）。
- 来源：团队照片/头像素材；`change=unchanged_since_093f`。sourceBlob `b2b48f55adb1b03e95c259e95753e6e909281e1a`；sourceSha256 `d4b431c405a2f94da1e107ba0ff0f8e7877374341556ff690b498663039b7684`。
- 打包：进产物——renderer 导入入 `dist/`（yml:44-46）。
- 影响：删除→AboutSettings.tsx:27 构建失败；改动/压缩→体积与视觉变化（1.6MB 属大图）。
- 验证：核 :27 导入、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：导入=**证实**；素材授权=**未知**。

## assets--team--team-4.png

- 职责：开发团队成员展示图 4（PNG，1160539 字节 ≈1.1MB）。
- 消费：`AboutSettings.tsx:28`——`import team4 from '@assets/team/team-4.png'`（实读证实）。
- 来源：团队照片/头像素材；`change=unchanged_since_093f`。sourceBlob `eb8fcdf985d903d4308e5c7443a5b953770a53f0`；sourceSha256 `5fdf158fc9b14346e6c2a5e60624cd2c0708384afc2480c0a5dac8c0a4b4acf1`。
- 打包：进产物——renderer 导入入 `dist/`（yml:44-46）。
- 影响：删除→AboutSettings.tsx:28 构建失败；改动→关于页视觉变化。
- 验证：核 :28 导入、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：导入=**证实**；素材授权=**未知**。

## assets--team--team-5.jpg

- 职责：开发团队成员展示图 5（JPG，60131 字节）。
- 消费：`AboutSettings.tsx:29`——`import team5 from '@assets/team/team-5.jpg'`（实读证实）。
- 来源：团队照片/头像素材；`change=unchanged_since_093f`。sourceBlob `80ffc291a6ff30d11cf253d3f4efb7bc984ad826`；sourceSha256 `27ab263cfaf9d56fe666b6a4f2c89720cd2b945e054218f39e2c97620cbc5543`。
- 打包：进产物——renderer 导入入 `dist/`（yml:44-46）。
- 影响：删除→AboutSettings.tsx:29 构建失败；改动→关于页视觉变化。
- 验证：核 :29 导入、JPG 头、hash；NOT_RUN。
- 证实/推断/未知：导入=**证实**；素材授权=**未知**。
