# p01-app-shell__apps__electron__resources__ppt-style-packs 索引（PPT 风格包缩略图）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__apps__electron__resources__ppt-style-packs`（owner `p01-app-shell`，family `apps/electron/resources/ppt-style-packs`）共 2 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景（实读证实）：`resources/ppt-style-packs/` 是 PPT 风格包目录，`electron-builder.yml:89-92`（`from: resources/ppt-style-packs to: ppt-style-packs filter **/*`，注释「PPT Style Pack（风格注册表与固定视觉缩略图；运行时路径 process.resourcesPath/ppt-style-packs）」）整目录进包；运行时根解析 `ppt-style-pack-service.ts:110-111`（prod `process.resourcesPath/ppt-style-packs` / dev `__dirname/resources/ppt-style-packs`）。风格包 id 恰两个=`academic-editorial`、`profer-cloud-dancer`（`ppt-style-pack-service.ts:8` `EXPECTED_PACK_IDS`）。每包的 `pack.json` 声明 `preview.asset: "preview.webp"`（两包实读均为 `"preview.webp"`，alt 分别为「Academic Editorial 风格缩略图」「Profer Cloud Dancer 风格缩略图」）。

## apps--electron--resources--ppt-style-packs--academic-editorial--preview.webp

- 职责：风格包 `academic-editorial`（Academic Editorial，学术编辑风）的固定视觉缩略图（webp，38976 字节），PPT 风格选择界面的卡片预览。
- 消费：`ppt-style-pack-service.ts:168-178` 解析同包 `pack.json` 的 `preview.asset`（实读=`"preview.webp"`）并强制「包目录内受控图片文件名」（禁绝对路径/`..`，:177-178）→ `:197-199` `resolve(packDir, asset)` 且必须在包目录内、必须是存在文件 → `:201-211` 经 `registerProferFilePath` 注册为 opaque `cdut-file://` URL，输出 `preview: ![Academic Editorial 风格缩略图](cdut-file://…)` 供界面渲染；`getPptStylePack('academic-editorial')`（测试 `ppt-style-pack-service.test.ts:42-44` 验证 URL 形态）。
- 来源：风格包设计资产（webp 缩略图导出）；`change=unchanged_since_093f`。sourceBlob `6d009c03ebf90d6cba688e2971aa63bb50f5742d`；sourceSha256 `e4fd8cb4951af0e5bf2045e248c56ec91c4f2fe3915d537ac11f01832cdcfcbf`。
- 打包：进产物——`extraResources` `ppt-style-packs/` 整目录 filter `**/*`（electron-builder.yml:89-92），运行时路径 `process.resourcesPath/ppt-style-packs/academic-editorial/preview.webp`。
- 影响：删除→`ppt-style-pack-service.ts:199`「Style Pack 预览资源不存在」抛错，风格包加载失败、PPT 风格选择界面缺该卡；改动→缩略图视觉变化。
- 验证：①核 :168-178/:197-211 消费链与 pack.json `preview.asset` 值；②webp 头完好；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/真实界面渲染（本轮统一 NOT_RUN）。
- 证实/推断/未知：消费链/字段值/打包=**证实**；缩略图与实际风格输出的一致性=**未知**（未渲染 PPT 比对）。

## apps--electron--resources--ppt-style-packs--profer-cloud-dancer--preview.webp

- 职责：风格包 `profer-cloud-dancer`（Profer Cloud Dancer，云端舞者学术风——`pptx/SKILL.md:12` 所述默认生成风格）的固定视觉缩略图（webp，137122 字节）。
- 消费：同消费链——`ppt-style-pack-service.ts:168-178`（pack.json `preview.asset="preview.webp"`）→ `:197-199` 越界/存在校验 → `:201-211` 注册 `cdut-file://` URL 输出 `preview`（alt「Profer Cloud Dancer 风格缩略图」）；`getPptStylePack('profer-cloud-dancer')`（测试 :66-68）；风格本体被 `ppt-slide-components.ts:168/:181/:202` 按 pack id 特化（motif 渲染），缩略图是其视觉入口。
- 来源：风格包设计资产（webp 缩略图导出）；`change=unchanged_since_093f`。sourceBlob `be1f23dd371f3a72bef522a2a7821ffcca526ebc`；sourceSha256 `267454c9b301ffd1de61a7169b553b12554da320df36d7d8801fb420b2ff1ac3`。
- 打包：进产物——`extraResources` `ppt-style-packs/` filter `**/*`（electron-builder.yml:89-92）。
- 影响：删除→`ppt-style-pack-service.ts:199` 抛错、默认风格包加载失败；改动→默认风格卡视觉变化。
- 验证：核 :168-178/:197-211 链、pack.json 字段、webp 头、hash；NOT_RUN。
- 证实/推断/未知：消费链/字段/打包=**证实**；与 pptx SKILL 默认风格描述的视觉一致性=**未知**。
