# p01-app-shell__assets__IP 索引（砚小龙桌宠四态精灵）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__assets__IP`（owner `p01-app-shell`，family `assets/IP`）共 4 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景（实读证实）：`assets/IP/Cute_IP/` 是「砚小龙」桌宠立绘四态精灵库，`apps/electron/src/renderer/components/cdut-zone/yanhu/pet/YanhuPetAvatar.tsx:11-14` 静态导入四帧并经 `SPRITE_SOURCES`（:17-22）按 `YanhuPetSpriteState`（blinking/breathing/walking/yawning）映射，组件自述「渲染 88x88 高清四态精灵，并在挂载时预加载全部帧，杜绝切换时的白闪」（:4-5），中文无障碍标签见 :25-30（「砚小龙正在眨眼/呼吸/忙碌/打哈欠」）。别名 `@assets`→仓根 assets（`vite.config.ts:66`），导入后经 Vite 打入 `dist/`（`electron-builder.yml:44-46`）。

## assets--IP--Cute_IP--Blinking.png

- 职责：砚小龙桌宠「眨眼」态精灵图（PNG，577589 字节），`YanhuPetAvatar.tsx:11` `import blinkingImg`，:18 `SPRITE_SOURCES.blinking`，标签「砚小龙正在眨眼」（:26）。
- 消费：`YanhuPetAvatar.tsx:11`（静态导入）→ `:17-22` 精灵映射 → 挂载预加载（:33-34 注释「预加载全部精灵，避免切图白闪」）；被 `CdutWatermarkBackground.tsx` 同族引用（该文件用 Breathing，:14）。Vite alias `@assets`（vite.config.ts:66）。
- 来源：IP 形象设计资产（桌宠精灵帧）；`change=unchanged_since_093f`。sourceBlob `574cb933569dedffbaad68298b7c321647378690`；sourceSha256 `a2a2eab67838503be1a508e9ff7b6e7f59de4a423e8996e6d03d22412782ef49`。
- 打包：进产物——renderer 导入经 Vite 打入 `dist/`（yml:44-46 `files: dist/**/*`）。
- 影响：删除→YanhuPetAvatar.tsx:11 构建失败、桌宠眨眼态缺失；改动→精灵视觉变化。
- 验证：①核 :11/:18/:26 引用链；②PNG 头完好；③hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI（本轮统一 NOT_RUN）。
- 证实/推断/未知：导入链与四态映射=**证实**；88x88 实际尺寸=**推断**（组件注述，未跑 identify）；素材授权=**未知**。

## assets--IP--Cute_IP--Breathing.png

- 职责：砚小龙桌宠「呼吸」态精灵图（PNG，605553 字节），`YanhuPetAvatar.tsx:12` `import breathingImg`，:19 `SPRITE_SOURCES.breathing`，标签「砚小龙正在呼吸」（:27）。
- 消费：①`YanhuPetAvatar.tsx:12`→:17-22 映射→预加载；②`apps/electron/src/renderer/components/cdut-zone/CdutWatermarkBackground.tsx:14`——`import darkMascotImg from '@assets/IP/Cute_IP/Breathing.png'`（深色主题水印吉祥物图）。
- 来源：IP 形象设计资产（桌宠精灵帧）；`change=unchanged_since_093f`。sourceBlob `8a42087aad5d39abec0efe7ae50fe35c453dd645`；sourceSha256 `3e168e66d34c3d26cae5c8411b63b0b5c829fe018751e311beb25bd557782a43`。
- 打包：进产物——renderer 导入经 Vite 打入 `dist/`（yml:44-46）。
- 影响：删除→YanhuPetAvatar.tsx:12 与 CdutWatermarkBackground.tsx:14 两处构建失败、桌宠呼吸态+深色水印缺失；改动→两处视觉变化。
- 验证：核 :12/:19/:27 与 CdutWatermarkBackground.tsx:14、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：双消费点=**证实**；尺寸=**推断**；素材授权=**未知**。

## assets--IP--Cute_IP--Walking.png

- 职责：砚小龙桌宠「行走/忙碌」态精灵图（PNG，639204 字节），`YanhuPetAvatar.tsx:13` `import walkingImg`，:20 `SPRITE_SOURCES.walking`，标签「砚小龙正在忙碌」（:28）；`YanhuPetAvatar.tsx:35-36` props 注释「是否处于忙碌（Walking）——附加轻微脉动」。
- 消费：`YanhuPetAvatar.tsx:13`→:17-22 映射→预加载（:33-34）。
- 来源：IP 形象设计资产（桌宠精灵帧）；`change=unchanged_since_093f`。sourceBlob `615858c0f8bcbba6a8d118b611b82e5dec95e0d6`；sourceSha256 `30baf58abc4a887e89d2fee48f0a037ec150c462e1d5cbd048dec760222219e9`。
- 打包：进产物——renderer 导入入 `dist/`（yml:44-46）。
- 影响：删除→YanhuPetAvatar.tsx:13 构建失败、忙碌态缺失；改动→视觉变化。
- 验证：核 :13/:20/:28 引用链、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：消费链=**证实**；尺寸=**推断**；素材授权=**未知**。

## assets--IP--Cute_IP--Yawning.png

- 职责：砚小龙桌宠「打哈欠」态精灵图（PNG，560773 字节），`YanhuPetAvatar.tsx:14` `import yawningImg`，:21 `SPRITE_SOURCES.yawning`，标签「砚小龙正在打哈欠」（:29）。
- 消费：`YanhuPetAvatar.tsx:14`→:17-22 映射→预加载（:33-34）。
- 来源：IP 形象设计资产（桌宠精灵帧）；`change=unchanged_since_093f`。sourceBlob `1fbb590ed82593b6198e8b00b4995b9767cc4c8d`；sourceSha256 `1501b00ad96d124856b8b78b152c72ce2a5c8fe9da8482af50d0d2f1d1767258`。
- 打包：进产物——renderer 导入入 `dist/`（yml:44-46）。
- 影响：删除→YanhuPetAvatar.tsx:14 构建失败、哈欠态缺失；改动→视觉变化。
- 验证：核 :14/:21/:29 引用链、PNG 头、hash；NOT_RUN。
- 证实/推断/未知：消费链=**证实**；尺寸=**推断**；素材授权=**未知**。
