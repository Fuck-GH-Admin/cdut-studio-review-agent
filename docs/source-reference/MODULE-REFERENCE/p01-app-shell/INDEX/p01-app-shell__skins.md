# p01-app-shell__skins 索引（内置皮肤包与皮肤模板预览图）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__skins`（owner `p01-app-shell`，family `skins`）共 9 个文件（9 resource），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。逐文件 hash 由封版流程按 `INDEX-SCOPE-LOCK.json` 机械列注入（与 MANIFEST.json 同源）。

家族背景（实读证实）：`apps/electron/resources/skins/`（8 个内置皮肤包，各含预览图）与 `resources/skin-template/`（新建/导入皮肤的模板）是「设置 → 外观设置 → 特殊风格」的视觉资源。加载链：①目录解析 `skin-service.ts:269-272`（「内置皮肤目录：dev 为 dist/resources/skins（build:resources 拷贝），打包为 process.resourcesPath/skins」）；②预览图读取 `skin-service.ts:595-617 getSkinPreview`——按 `PREVIEW_PRIORITY :103`（`.webp→.png→.svg→.jpg→.jpeg`）找皮肤目录下 `preview<ext>`（:61-:64 签名）并转 data URL（MIME 表 :94-:97），缓存按预览文件 mtime+size 失效（:38-:52）；皮肤包结构自述 `preview.*` =「设置页预览图（可选）」（:10）；③模板目录 `skin-manager-service.ts:207`（`getSkinTemplateDir()`：打包 `process.resourcesPath/skin-template`、dev `__dirname/resources/skin-template`，新建/导入皮肤时复制）。命名/限额校验（用户皮肤安装同规范）：`skin-manager-service.ts:29` `PREVIEW_RE=/^preview\.(webp|png|svg|jpe?g)$/i`、`:20` `MAX_PREVIEW_BYTES=2MB`。打包映射：`electron-builder.yml:84-88`（`resources/skins`→`skins` filter `**/*`，注释「内置皮肤包（设置 → 外观设置 → 特殊风格）」）、`:94-97`（`resources/skin-template`→`skin-template`，注释「皮肤模板（skin-manager 新建/导入皮肤时复制）」）。「打包」行均指此结论。

## apps--electron--resources--skin-template--preview.svg

- 职责：皮肤模板预览图（SVG，837 字节）：`skin-template/` 包的卡片缩略图，随模板复制流程进入用户新建/导入的皮肤包（`skin-manager-service.ts:207` 模板根）。
- 消费：`skin-manager-service.ts:207`（模板目录解析）→ 新建/导入皮肤时整包复制（同文件安装校验 :115-:117 按 `PREVIEW_RE`/2MB 限额约定预览图）；`skin-service.ts:61-64/:103`（`preview.svg` 落在 PREVIEW_PRIORITY 第 3 位，被 `getSkinPreview :595-617` 可读）。
- 来源：皮肤模板设计资产；sourceBlob `4d93fd2747f53dd588551ac3a5c5e251f91a41e4`；sourceSha256 `84e7af41935a565bdc25c15ec778bd2128b62e8242ebc4c7dce8cdb08f371715`。
- 打包：进产物 `process.resourcesPath/skin-template/preview.svg`（yml:94-97 filter `**/*`）。
- 影响：删除→模板复制出的皮肤包缺预览图（卡片灰条；agent-prompt-builder.ts:1091 所述「卡片不空白」目标受损）；改动→模板预览视觉变化。
- 验证：①核 skin-manager-service.ts:207/:115-117 与 skin-service.ts:61-64/:103；②SVG 根元素可解析；③hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：加载链/打包=**证实**；预览图与模板风格一致性=**未知**。

## apps--electron--resources--skins--forest-dark--preview.webp

- 职责：内置皮肤「forest-dark」（森林·深色）预览图（webp，7892 字节）：设置页皮肤卡片缩略图。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('forest-dark')` 按 `PREVIEW_PRIORITY :103` 首选 `.webp` 命中本文件，转 `image/webp` data URL :94-:96）；目录根 `skin-service.ts:269-272`。
- 来源：皮肤设计资产；sourceBlob `5d327dcc1e60c95d6fe4bc83c14e2316d710fd86`；sourceSha256 `285a971de72b9ac8a9c0ae771fb2ae717a35a6007ead4be1c55bb16088263fac`。
- 打包：进产物 `process.resourcesPath/skins/forest-dark/preview.webp`（yml:84-88 filter `**/*`）。
- 影响：删除→该皮肤卡预览降级（`getSkinPreview` 返回 null/灰条）；改动→卡片视觉变化。
- 验证：核 :595-617/:103 加载链、webp 头、hash 一致；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；与皮肤 CSS 输出一致性=**未知**。

## apps--electron--resources--skins--forest-light--preview.webp

- 职责：内置皮肤「forest-light」（森林·浅色）预览图（webp，18410 字节）。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('forest-light')` 首选 `.webp` 命中）；目录根 :269-272。
- 来源：皮肤设计资产；sourceBlob `66b5ca2c9753541d9a50cf53381f771bca0d35e8`；sourceSha256 `7bf206d5cfbcd9df73f4636450abe20503d47d41f9a155c9ce7423602fdd8518`。
- 打包：进产物 `process.resourcesPath/skins/forest-light/preview.webp`（yml:84-88）。
- 影响：删除→该皮肤卡预览降级；改动→卡片视觉变化。
- 验证：加载链/webp 头/hash；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；风格一致性=**未知**。

## apps--electron--resources--skins--mist-paper-dark--preview.svg

- 职责：内置皮肤「mist-paper-dark」（雾纸·深色）预览图（SVG，1943 字节）——本组唯一 webp 之外的内置预览（`PREVIEW_PRIORITY :103` 第 3 档 `.svg` 命中）。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('mist-paper-dark')` 扩展名回退到 `.svg`，MIME `image/svg+xml` :97）；目录根 :269-272。
- 来源：皮肤设计资产；sourceBlob `c3cb3cf7c727d5c135fcea363598ac082cbc9bdf`；sourceSha256 `7c1ba304593a3181bb0efb52cdeb23db4a0bad09fc8bddbcd988f798d7dd58aa`。
- 打包：进产物 `process.resourcesPath/skins/mist-paper-dark/preview.svg`（yml:84-88）。
- 影响：删除→该皮肤卡预览降级；改动→卡片视觉变化。
- 验证：加载链（含 .svg 回退分支）/SVG 可解析/hash；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；风格一致性=**未知**。

## apps--electron--resources--skins--ocean-dark--preview.webp

- 职责：内置皮肤「ocean-dark」（海洋·深色）预览图（webp，132890 字节，内置预览最大）。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('ocean-dark')` 首选 `.webp` 命中）；目录根 :269-272。
- 来源：皮肤设计资产；sourceBlob `6963dff7e5c6b37273f4493b77194eaa95a4af8d`；sourceSha256 `ed7c8b58d2f2395b09f98c58139e1218fdf2cb4da3283cdd3db849f2d30ac1b1`。
- 打包：进产物 `process.resourcesPath/skins/ocean-dark/preview.webp`（yml:84-88）。
- 影响：删除→该皮肤卡预览降级；改动→卡片视觉变化（注意 130KB 体积）。
- 验证：加载链/webp 头/hash；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；风格一致性=**未知**。

## apps--electron--resources--skins--ocean-light--preview.webp

- 职责：内置皮肤「ocean-light」（海洋·浅色）预览图（webp，20546 字节）。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('ocean-light')` 首选 `.webp` 命中）；目录根 :269-272。
- 来源：皮肤设计资产；sourceBlob `95cd56de53e93500c6e5a92f13870cf30691f500`；sourceSha256 `a58c7834db01792d5d14c9f0d77316ae296b96e3ae718db57ab84d3021a9037f`。
- 打包：进产物 `process.resourcesPath/skins/ocean-light/preview.webp`（yml:84-88）。
- 影响：删除→该皮肤卡预览降级；改动→卡片视觉变化。
- 验证：加载链/webp 头/hash；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；风格一致性=**未知**。

## apps--electron--resources--skins--slate-dark--preview.webp

- 职责：内置皮肤「slate-dark」（石板·深色）预览图（webp，12634 字节）。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('slate-dark')` 首选 `.webp` 命中）；目录根 :269-272。
- 来源：皮肤设计资产；sourceBlob `32dc5d8c08dc7bcfaf62ad2fe30ffd1de38caa6d`；sourceSha256 `6236610e824277d8c8807838b224f4c8c466aa28915aed61032c5f29059203c7`。
- 打包：进产物 `process.resourcesPath/skins/slate-dark/preview.webp`（yml:84-88）。
- 影响：删除→该皮肤卡预览降级；改动→卡片视觉变化。
- 验证：加载链/webp 头/hash；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；风格一致性=**未知**。

## apps--electron--resources--skins--slate-light--preview.webp

- 职责：内置皮肤「slate-light」（石板·浅色）预览图（webp，10032 字节）。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('slate-light')` 首选 `.webp` 命中）；目录根 :269-272。
- 来源：皮肤设计资产；sourceBlob `a8b00570f77d2e506cd887902178cc95b6f3bcdf`；sourceSha256 `61eb0429828f2ea7d4fa3c1f77a6f7f3d3e436995cb6f47285a0ccfaf0a8c9bd`。
- 打包：进产物 `process.resourcesPath/skins/slate-light/preview.webp`（yml:84-88）。
- 影响：删除→该皮肤卡预览降级；改动→卡片视觉变化。
- 验证：加载链/webp 头/hash；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；风格一致性=**未知**。

## apps--electron--resources--skins--terminal-dark--preview.png

- 职责：内置皮肤「terminal-dark」（终端·深色）预览图（PNG，87663 字节）——`PREVIEW_PRIORITY :103` 第 2 档 `.png` 命中；主题风格与 `release-notes/v0.12.26.md:5` 所述「旧屏微光（CRT 终端风）」特殊主题系列同族（推断）。
- 消费：`skin-service.ts:595-617`（`getSkinPreview('terminal-dark')` 扩展名取 `.png`，MIME `image/png` :95）；目录根 :269-272。
- 来源：皮肤设计资产；sourceBlob `fdb6397f8e9da3dbf5493ea458d69c9e4842b198`；sourceSha256 `1838361119a8496dc21a3ccbfb9d7f2ee731862571670156b64bcc6662542836`。
- 打包：进产物 `process.resourcesPath/skins/terminal-dark/preview.png`（yml:84-88）。
- 影响：删除→该皮肤卡预览降级；改动→卡片视觉变化。
- 验证：加载链（.png 分支）/PNG 头/hash；NOT_RUN。
- 证实/推断/未知：加载链/打包=**证实**；与 v0.12.26 主题叙述的对应=**推断**（按命名）。
