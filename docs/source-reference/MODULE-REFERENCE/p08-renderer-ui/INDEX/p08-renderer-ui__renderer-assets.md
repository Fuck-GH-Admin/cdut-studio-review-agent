# p08-renderer-ui__renderer-assets 索引（renderer 静态素材：模型/供应商图标、CDUT 品牌标识、Bot 平台图标、通知音与主题预览图）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p08-renderer-ui__renderer-assets`（owner `p08-renderer-ui`，family `renderer-assets`）共 82 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：82 个文件全部位于 `apps/electron/src/renderer/assets/`（bots/ 3、根 2、models/ 61、sound/ 8、theme-previews/ 8），是渲染进程 UI 的静态视觉/音频素材，本身无逻辑。**打包方式**：经 Vite 静态资源管线进产物——`apps/electron/vite.config.ts:13` `base:'./'`、`:35` `outDir=dist/renderer`，`apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）把**被 import 的**资源发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）与 `scripts/copy-resources.ts`（只拷 `apps/electron/resources`→`dist/resources`）均不涉及本目录。**共同加载机制**：统一为 ESM 静态 import `@/assets/…`（别名 `@`→`src/renderer`，vite.config.ts resolve.alias），编译后得到资源 URL 字符串，由 `<img src>` 或 `new Audio(url)` 消费；因此 82 个文件中仅 58 个被 import（models 45 + sound 8 + bots 3 + logo 2）进产物，24 个零引用文件（models/ 16 + theme-previews/ 8）不会进任何构建产物。**models/ 命名与模型名映射**：文件按品牌命名，加载集中在 `apps/electron/src/renderer/lib/model-logo.ts:15-103`（45 张静态 import）；`MODEL_LOGO_MAP`（:118-214）的 key 是模型 ID 正则（大小写不敏感、按表序优先，:382-387 预编译），`MODEL_LOGO_DARK_MAP`（:223-319）是同 key 同序的暗色表（无暗色素材的品牌回退亮色，防深色下误命中更宽规则），未命中再按供应商 `PROVIDER_LOGO_MAP`/`PROVIDER_LOGO_DARK_MAP`（:326-377），泛化 provider（anthropic/anthropic-compatible/custom，:490-494）再按 Base-URL 域名走 `URL_LOGO_MAP`/`URL_LOGO_DARK_MAP`（:448-487，注意故意不含 anthropic 域名防误判，:444-446），最终 `getModelLogo`（:421-425）兜底 `default.png`；`default.png` 是全局兜底图，`embedding.png` 专用于 text-embedding/embedding 模型（:212-213），`CDUT_Studio.png` 仅经域名表匹配 proma.cool（:449/:470）并由 :568 导出。运行时渲染点（每次调用传 isDark 决定亮/暗资源）：`components/ai-elements/scroll-minimap.tsx:484`、`components/tabs/TabPreviewPanel.tsx:39`、`components/settings/ChannelSettings.tsx:382/:473/:490`、`components/settings/ChannelForm.tsx:96`、`components/shared/ModelSelector.tsx:366/:385/:445/:488`、`components/agent/SDKMessageRenderer.tsx:305`、`components/agent/AgentMessages.tsx:251`、`components/session-preview/SessionMiniMapPopover.tsx:402`；断言在 `lib/model-logo.test.ts:15`/`:22`/`:31`/`:38`/`:43`/`:48`；深色一致性守卫 `apps/electron/scripts/dark-mode-guards.test.ts:116-145`（`bun run test:dark-mode`，校验导入的 `*_dark.png` 都注册暗表且存在同名亮色）。**sound/ 的播放点**：8 个 mp3 全部由 `apps/electron/src/renderer/atoms/notifications.ts:15-22` 静态 import，注册 `BUILTIN_NOTIFICATION_SOUNDS`（:36-45，id 即文件名去扩展）→ `SOUND_URL_MAP`（:51-53），播放走 `new Audio(url)`（:224 内置 / :250 自定义，带缓存池）+ `audio.play()`（:272/:294），场景选择 `playNotificationSoundForType`（:315-321，默认映射 `DEFAULT_NOTIFICATION_SOUNDS` :59-64）；触发时机：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`，仅正常完成才响）、工具权限请求 :1219 与 AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。**theme-previews/ 的展示点**：未发现任何代码展示点（逐文件消费栏有完整检索记录）；应用的皮肤/主题预览实际走皮肤包 `preview.<ext>`（`components/settings/SkinManager.tsx:74-82` → `getSkinPreview` IPC → 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90`）。**bots/**：`components/settings/BotHubSettings.tsx:19-21` 静态 import，注册 `PLATFORMS`（:44 飞书/:50 微信/:56 钉钉），:131 `<img src={platform.iconSrc}>` 渲染于设置页 Bot 平台卡片（`SettingsPanel.tsx:126` 挂载）。**cdut-logo**：`components/shared/CdutLogo.tsx:13-14` 静态 import，`CdutMark` 组件（:37-48）按 `useIsDarkTheme()`（`hooks/use-is-dark-theme.ts:12`）在 :41 `src={isDark ? cdutMarkDark : cdutMarkColor}` 切换深浅；使用点 `components/app-shell/left-sidebar/expanded-sidebar.tsx:125`（侧边栏标识）与 `components/cdut-zone/AiClassChatPanel.tsx:23`（CDUT 专区 AI 课堂面板）。**行为约束**：素材只读、运行时零逻辑；改/删的直接后果是构建期 import 断链（`vite build` 失败）或运行时 UI 破图/静音；运行时行为本轮一律 NOT_RUN。

## apps--electron--src--renderer--assets--bots--dingding.png

- 职责：设置页「Bot 平台」卡片的钉钉平台图标（BotHubSettings 的 `PLATFORMS` 条目 iconSrc）。`file` 实测 PNG 256×256 RGBA，22564 字节。
- 消费：`apps/electron/src/renderer/components/settings/BotHubSettings.tsx:20` 静态 import（符号 `dingtalkLogo`）；注册 `:56`（PLATFORMS 钉钉项 iconSrc）（`PLATFORMS` 数组，:38-57）；渲染点 `BotHubSettings.tsx:131` `<img src={platform.iconSrc} alt={platform.name} className="w-8 h-8 rounded-lg object-contain">`；触发时机：设置面板切到 Bot 分区时（`components/settings/SettingsPanel.tsx:52` import、`:126` `return <BotHubSettings />`）。
- 来源：钉钉品牌图标素材，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `10df8a3a0e6954674d6568f3d1bc984eebd8b2f0`；sourceSha256 `1379fdbfa04c81ace242fa49eac036ee618efeb6f72b74c690746c1a4c66ad45`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 设置页 钉钉 卡片图标变形/破图；删文件 → `BotHubSettings.tsx:20` import 断链、`vite build` 失败；不影响 Bot 接入协议与消息收发（图标纯展示，兜底为 `iconChar` 字符方案 :31-33）。
- 验证：`file -b apps/electron/src/renderer/assets/bots/dingding.png` 核对 PNG 256×256 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与 iconSrc 注册行；设置页目视需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/PLATFORMS 定义/渲染行实读、`file`/`sha256sum` 实测）；推断（各平台品牌官方图标素材）；未知（素材来源/授权）。

## apps--electron--src--renderer--assets--bots--feishu.png

- 职责：设置页「Bot 平台」卡片的飞书平台图标（BotHubSettings 的 `PLATFORMS` 条目 iconSrc）。`file` 实测 PNG 1024×1024 RGBA，130162 字节。
- 消费：`apps/electron/src/renderer/components/settings/BotHubSettings.tsx:19` 静态 import（符号 `feishuLogo`）；注册 `:44`（PLATFORMS 飞书项 iconSrc）（`PLATFORMS` 数组，:38-57）；渲染点 `BotHubSettings.tsx:131` `<img src={platform.iconSrc} alt={platform.name} className="w-8 h-8 rounded-lg object-contain">`；触发时机：设置面板切到 Bot 分区时（`components/settings/SettingsPanel.tsx:52` import、`:126` `return <BotHubSettings />`）。
- 来源：飞书品牌图标素材，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `d0183e001636e6229d8f50187a6737768060c8d5`；sourceSha256 `41a1b460e85aa460e4d75f29d3c36fee2fe0f61389694ce97edef3955bd3d4ca`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 设置页 飞书 卡片图标变形/破图；删文件 → `BotHubSettings.tsx:19` import 断链、`vite build` 失败；不影响 Bot 接入协议与消息收发（图标纯展示，兜底为 `iconChar` 字符方案 :31-33）。
- 验证：`file -b apps/electron/src/renderer/assets/bots/feishu.png` 核对 PNG 1024×1024 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与 iconSrc 注册行；设置页目视需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/PLATFORMS 定义/渲染行实读、`file`/`sha256sum` 实测）；推断（各平台品牌官方图标素材）；未知（素材来源/授权）。

## apps--electron--src--renderer--assets--bots--wechat.png

- 职责：设置页「Bot 平台」卡片的微信平台图标（BotHubSettings 的 `PLATFORMS` 条目 iconSrc）。`file` 实测 PNG 1024×1024 RGBA，171699 字节。
- 消费：`apps/electron/src/renderer/components/settings/BotHubSettings.tsx:21` 静态 import（符号 `wechatLogo`）；注册 `:50`（PLATFORMS 微信项 iconSrc）（`PLATFORMS` 数组，:38-57）；渲染点 `BotHubSettings.tsx:131` `<img src={platform.iconSrc} alt={platform.name} className="w-8 h-8 rounded-lg object-contain">`；触发时机：设置面板切到 Bot 分区时（`components/settings/SettingsPanel.tsx:52` import、`:126` `return <BotHubSettings />`）。
- 来源：微信品牌图标素材，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `b85284f2f39c76d884addd42e4443afdd95bd152`；sourceSha256 `d2950dc500dd6b3309d3242aa2edc8b70e05eba889feb1ea8dd279fd587429c5`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 设置页 微信 卡片图标变形/破图；删文件 → `BotHubSettings.tsx:21` import 断链、`vite build` 失败；不影响 Bot 接入协议与消息收发（图标纯展示，兜底为 `iconChar` 字符方案 :31-33）。
- 验证：`file -b apps/electron/src/renderer/assets/bots/wechat.png` 核对 PNG 1024×1024 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与 iconSrc 注册行；设置页目视需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/PLATFORMS 定义/渲染行实读、`file`/`sha256sum` 实测）；推断（各平台品牌官方图标素材）；未知（素材来源/授权）。

## apps--electron--src--renderer--assets--cdut-logo-dark.svg

- 职责：CDUT Studio 矢量标识的**深色主题反白版**：`CdutMark` 在深色主题下显示。`file` 实测 SVG 1240×1190 viewBox（12 行文本，UTF-8 带 BOM；fill `#ffffff` 反白版，与亮色版几何完全重合），101443 字节。
- 消费：`apps/electron/src/renderer/components/shared/CdutLogo.tsx:14` 静态 import（符号 `cdutMarkDark`）；选择逻辑 `CdutLogo.tsx:37-48` 的 `CdutMark`，`:41` `src={isDark ? cdutMarkDark : cdutMarkColor}`（本文件即 isDark=true 时的取值）；`isDark` 来自 `hooks/use-is-dark-theme.ts:12` `useIsDarkTheme()`（跟随主题切换即时生效）。渲染点：`components/app-shell/left-sidebar/expanded-sidebar.tsx:125`（侧边栏 `<CdutMark className="size-5">`）与 `components/cdut-zone/AiClassChatPanel.tsx:23`（AI 课堂面板 `<CdutMark className="size-28">`）。
- 来源：CDUT Studio 品牌矢量标识（SVG 描摹自参考图的可编辑路径），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `65496853f6677cde64b0bbad4b12171e4f5a8f95`；sourceSha256 `1128842480ec4e7ae67e5c7a8a4d98c7e95f194ef0a6ec0c531b4a0790e8cf1e`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 侧边栏与 CDUT 专区标识变形；删文件 → `CdutLogo.tsx:14` import 断链、`vite build` 失败；深浅两版须保持几何重合（`CdutLogo.tsx:2-6` 注释要求同尺寸裁切、反白替换），否则主题切换时标识跳动/错位。
- 验证：`file -b apps/electron/src/renderer/assets/cdut-logo-dark.svg` 核对 SVG 结构；diff 两版应仅 fill（`#25302d`/`#ffffff`）与 BOM 差异（实测如此）；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与 :41 选择逻辑；目视核对需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/组件/使用点实读、`file`/`sha256sum` 实测；SVG `<desc>` 自述为 traced from the supplied reference 的可编辑矢量）；推断（两版同几何仅换 fill 的反白关系）；未知（描摹参考图的出处）。

## apps--electron--src--renderer--assets--cdut-logo.svg

- 职责：CDUT Studio 矢量标识的**浅色主题版**：`CdutMark` 在浅色主题下显示。`file` 实测 SVG 1240×1190 viewBox（12 行文本，UTF-8；fill `#25302d` 墨绿版；`<title>` 自述 CDUT Studio — editable vector logo、`<desc>` 自述 traced from the supplied reference 的可编辑描摹路径），101440 字节。
- 消费：`apps/electron/src/renderer/components/shared/CdutLogo.tsx:13` 静态 import（符号 `cdutMarkColor`）；选择逻辑 `CdutLogo.tsx:37-48` 的 `CdutMark`，`:41` `src={isDark ? cdutMarkDark : cdutMarkColor}`（本文件即 isDark=false 时的取值）；`isDark` 来自 `hooks/use-is-dark-theme.ts:12` `useIsDarkTheme()`（跟随主题切换即时生效）。渲染点：`components/app-shell/left-sidebar/expanded-sidebar.tsx:125`（侧边栏 `<CdutMark className="size-5">`）与 `components/cdut-zone/AiClassChatPanel.tsx:23`（AI 课堂面板 `<CdutMark className="size-28">`）。
- 来源：CDUT Studio 品牌矢量标识（SVG 描摹自参考图的可编辑路径），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `ca3fe8f1091a9006f15c234a03a2a33c3fcb160f`；sourceSha256 `ffb559cc4fee56ac312ed664b4f2b520b907b372c9636739aa9c32cc755f37c4`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 侧边栏与 CDUT 专区标识变形；删文件 → `CdutLogo.tsx:13` import 断链、`vite build` 失败；深浅两版须保持几何重合（`CdutLogo.tsx:2-6` 注释要求同尺寸裁切、反白替换），否则主题切换时标识跳动/错位。
- 验证：`file -b apps/electron/src/renderer/assets/cdut-logo.svg` 核对 SVG 结构；diff 两版应仅 fill（`#25302d`/`#ffffff`）与 BOM 差异（实测如此）；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与 :41 选择逻辑；目视核对需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/组件/使用点实读、`file`/`sha256sum` 实测；SVG `<desc>` 自述为 traced from the supplied reference 的可编辑矢量）；推断（两版同几何仅换 fill 的反白关系）；未知（描摹参考图的出处）。

## apps--electron--src--renderer--assets--models--CDUT_Studio.png

- 职责：CDUT Studio 自有品牌图标：仅当渠道是泛化 provider 且 Base-URL 域名命中 `proma.cool`（`getChannelLogo` 域名识别层）或被显式导出使用时显示。`file` 实测 PNG 256×256 RGBA，49385 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:96` 静态 import（符号 `CDUTStudioLogo`）；映射注册 URL_LOGO_MAP/URL_LOGO_DARK_MAP 的 proma.cool 项 `:449`/`:470`；模块导出 `:568`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：CDUT Studio 自有品牌，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/default.png` 字节相同（同一 sourceBlob `e54076e5…`、同 sha256）；sourceBlob `e54076e5e41fd2248d3ab9010c56943264ef4838`；sourceSha256 `0e458b1e453c99d1df6df33e9dc4d78de0aa27f55210cef24faf18c487be0616`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → CDUT Studio 自有品牌 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:96` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/CDUT_Studio.png` 核对 PNG 256×256 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--chatglm.png

- 职责：智谱 ChatGLM 品牌/型号图标素材（`file` 实测 PNG 200×200 RGBA，11130 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：无任何正则键/映射指向本图；`chatglm` 一词全树零命中（智谱系规则 `'zhipu'`/`'cogview'`/`'glm'`（model-logo.ts:170-172）实际取 zhipu.png）。
- 来源：智谱 ChatGLM，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/zhipu.png` 字节相同（同一 sourceBlob `1cbf1682…`），推断为 ChatGLM 品牌别名下留存的同素材副本；sourceBlob `1cbf1682dca0a5d83515da17571bbcf1aca9fc10`；sourceSha256 `9826ee53d8ba793a25ce576c4f6e88a0aa2e47b732ec0c967ac853b20f412618`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `chatglm` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/chatglm.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--chatglm_dark.png

- 职责：智谱 ChatGLM（深色） 品牌/型号图标素材（`file` 实测 PNG 200×200 RGBA，11130 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：无任何正则键/映射指向本图；`chatglm` 一词全树零命中；暗色映射 `:274`-`:277` 取 ZhipuDarkLogo。
- 来源：智谱 ChatGLM（深色），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/zhipu_dark.png` 字节相同（同一 sourceBlob `1cbf1682…`）；sourceBlob `1cbf1682dca0a5d83515da17571bbcf1aca9fc10`；sourceSha256 `9826ee53d8ba793a25ce576c4f6e88a0aa2e47b732ec0c967ac853b20f412618`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `chatglm_dark` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/chatglm_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--claude.png

- 职责：模型/供应商品牌图标（Anthropic Claude）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，14350 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:18` 静态 import（符号 `ClaudeLogo`）；映射注册 MODEL_LOGO_MAP `'(claude|anthropic-)'` `:139`；PROVIDER_LOGO_MAP anthropic `:327`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Anthropic Claude，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `560598ed1ffe3df6f6e4bc37f880f1065c00c614`；sourceSha256 `d56dc11e7d7251b45db5ee26c2a5669f92499d7ab6cb16e5bf3493db076a7a79`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Anthropic Claude 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:18` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/claude.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--claude_dark.png

- 职责：模型/供应商品牌图标（Anthropic Claude（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，10626 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:19` 静态 import（符号 `ClaudeDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:244`；PROVIDER_LOGO_DARK_MAP `:354`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Anthropic Claude（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `71fbdb6ba17cfa31b64ed97a3b70e4cf3d9f2f27`；sourceSha256 `d16ba02c0ee0c9716d88e0e1036748ae4e6d11be476372380f6f386dbf7b9924`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Anthropic Claude（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:19` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/claude_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--codestral.png

- 职责：模型/供应商品牌图标（Mistral Codestral）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 100×100 colormap，1198 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:67` 静态 import（符号 `CodestralLogo`）；映射注册 MODEL_LOGO_MAP codestral `:178`；MODEL_LOGO_DARK_MAP `:283`（无暗色素材，暗色表回退本亮色图）（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Mistral Codestral，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `26d0e6ebd191c880a23259af4533e9228eea9fe4`；sourceSha256 `7fe3a74434b87297a9ee03c2f3274bbdb7306237ad7b20470aac6f18e97edf7c`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Mistral Codestral 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:67` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/codestral.png` 核对 PNG 100×100 colormap；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--cohere.png

- 职责：模型/供应商品牌图标（Cohere）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，7220 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:99` 静态 import（符号 `CohereLogo`）；映射注册 MODEL_LOGO_MAP cohere/command `:208`-`:209`；URL_LOGO_MAP `:461`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Cohere，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `e26f46d19930ac7c9dce2f98827425d2a1e24431`；sourceSha256 `10d95c53deae945dd84b6d5108521c3ab9c399728a4ba9be0ff9ff50d496a8af`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Cohere 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:99` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/cohere.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--cohere_dark.png

- 职责：模型/供应商品牌图标（Cohere（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，6977 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:100` 静态 import（符号 `CohereDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:313`-`:314`；URL_LOGO_DARK_MAP `:482`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Cohere（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `7cb99d8a32501597c2c4de609d1a065d82f8f9bd`；sourceSha256 `98a23840e2b99bb4b36c9d4c2dfe9c617354ee80b511d3b7702ad46511b3e325`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Cohere（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:100` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/cohere_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--deepgemini.png

- 职责：自定义 Gemini 衍生（第三方 Gemini 兼容聚合）品牌图标。`file` 实测 扩展名 .png 但实测内容为 JPEG（progressive 250×250，JFIF 1.01）——`file` 命令复核；浏览器按内容嗅探正常显示，11292 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:36` 静态 import（符号 `DeepGeminiLogo`）；映射注册 MODEL_LOGO_MAP deepgemini `:145`（注释要求置于通用 gemini 规则之前）；MODEL_LOGO_DARK_MAP `:250`（无暗色素材，回退亮色）（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：自定义 Gemini 衍生品牌 DeepGemini，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `c4d74b630c2a3b8df4d4809b47af04b3f94d978d`；sourceSha256 `406ae46ff491ede05a29d10fa608b474b04f03cfc5a29f136986d18d4a1ff852`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 自定义 Gemini 衍生品牌 DeepGemini 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:36` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/deepgemini.png` 核对 扩展名 .png 但实测内容为 JPEG（progressive 250×250；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--deepseek.png

- 职责：模型/供应商品牌图标（DeepSeek）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，7267 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:26` 静态 import（符号 `DeepSeekLogo`）；映射注册 MODEL_LOGO_MAP deepseek `:142`；PROVIDER_LOGO_MAP `:331`；URL_LOGO_MAP `:456`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：DeepSeek，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `04b181f2a86a43ee5a6a873a8507e7205ba29dbf`；sourceSha256 `ddf6a24bef50748b3becccbbe753b02095fdf86b709a91c0c6840f1879155a09`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → DeepSeek 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:26` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/deepseek.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--deepseek_dark.png

- 职责：模型/供应商品牌图标（DeepSeek（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，8756 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:27` 静态 import（符号 `DeepSeekDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:247`；PROVIDER_LOGO_DARK_MAP `:360`；URL_LOGO_DARK_MAP `:476`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：DeepSeek（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `2a76e2ac20b3ee29ca01aa3a4124c97a4ae6491c`；sourceSha256 `6a4eadc53477f55d49b0dbf6ca1cb56cea3b40b02809a493ce08182ef43eb905`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → DeepSeek（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:27` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/deepseek_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--default.png

- 职责：模型/渠道图标的**全局兜底图**：模型 ID 正则、供应商、域名都匹配不上时的最终默认图标（也是 ollama/custom/anthropic-compatible 的供应商图标）。`file` 实测 PNG 256×256 RGBA，49385 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:15` 静态 import（符号 `DefaultLogo`）；映射注册 全局兜底：`getModelLogo` `:424`、`getProviderLogo` `:435`；PROVIDER_LOGO_MAP `:328`/`:348`/`:349` 与 DARK `:355`/`:375`/`:376`（anthropic-compatible/ollama/custom）；模块导出 `:568`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：CDUT Studio 默认图标，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/CDUT_Studio.png` 字节相同（同一 sourceBlob `e54076e5…`）；sourceBlob `e54076e5e41fd2248d3ab9010c56943264ef4838`；sourceSha256 `0e458b1e453c99d1df6df33e9dc4d78de0aa27f55210cef24faf18c487be0616`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → CDUT Studio 默认图标 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:15` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/default.png` 核对 PNG 256×256 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--doubao.png

- 职责：模型/供应商品牌图标（字节跳动豆包/火山）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，8753 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:53` 静态 import（符号 `DoubaoLogo`）；映射注册 MODEL_LOGO_MAP doubao/`ep-202`/seed `:165`-`:167`；PROVIDER_LOGO_MAP `:339`/`:341`；URL_LOGO_MAP `:454`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：字节跳动豆包/火山，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `d673efd8d8e865e918daf93315e392de78fb2528`；sourceSha256 `84166e167c209552fdc9a9801842b9351ad6d5752d278d6acd4b335d0a9da96c`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 字节跳动豆包/火山 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:53` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/doubao.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--doubao_dark.png

- 职责：模型/供应商品牌图标（字节跳动豆包/火山（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，4895 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:54` 静态 import（符号 `DoubaoDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:270`-`:272`；PROVIDER_LOGO_DARK_MAP `:366`/`:368`；URL_LOGO_DARK_MAP `:474`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：字节跳动豆包/火山（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `e0df3021d17e98cb78361c42d7e0926f0f5f6e48`；sourceSha256 `0ef73001cb61bfd57ca6e93a93f9d601a347d7d83a1aa20f498569c2aebdfa23`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 字节跳动豆包/火山（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:54` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/doubao_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--embedding.png

- 职责：**Embedding 类模型专属图标**：模型 ID 命中 `text-embedding*`/`embedding*` 时显示，与对话模型品牌图标区分。`file` 实测 PNG 251×250 RGBA，6287 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:103` 静态 import（符号 `EmbeddingLogo`）；映射注册 MODEL_LOGO_MAP `'text-embedding'`/embedding `:212`-`:213`；MODEL_LOGO_DARK_MAP `:317`-`:318`（无暗色素材，回退亮色）（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Embedding 通用，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `00e4903636b641ab3652ad45982e7cf5160a6173`；sourceSha256 `b91ecadc72c350156d93b3bd77e1d6a6471312569b61b3b6f6eff04ece737f5c`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Embedding 通用 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:103` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/embedding.png` 核对 PNG 251×250 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--gemini.png

- 职责：模型/供应商品牌图标（Google Gemini）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 250×250 RGBA，34435 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:30` 静态 import（符号 `GeminiLogo`）；映射注册 MODEL_LOGO_MAP veo `:151`、gemini `:153`；PROVIDER_LOGO_MAP google `:332`；URL_LOGO_MAP `:458`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Google Gemini，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `612677081b1bb21f832643024a2f932462e84b56`；sourceSha256 `37788acef5838dc7bc4d45caa90ee13c70dfb78f8160ab742eaa67f684c37a08`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Google Gemini 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:30` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/gemini.png` 核对 PNG 250×250 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--gemini_dark.png

- 职责：模型/供应商品牌图标（Google Gemini（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，3707 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:31` 静态 import（符号 `GeminiDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:256`/`:258`；PROVIDER_LOGO_DARK_MAP `:358`；URL_LOGO_DARK_MAP `:479`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Google Gemini（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `f3075796ee0cd5a8767cf5466bc60d6489a3e4ba`；sourceSha256 `3e03bef2b383a5cbe90a525f25e72d7d771dbddb1d5f1beb61e976d40eb3634f`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Google Gemini（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:31` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/gemini_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--gemma.png

- 职责：模型/供应商品牌图标（Google Gemma）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，9667 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:32` 静态 import（符号 `GemmaLogo`）；映射注册 MODEL_LOGO_MAP gemma `:152`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Google Gemma，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `26a1d9017de3163cc32934d78e85ec4102b9baa4`；sourceSha256 `0730ed340d89e037d166711486c6664c4e0fcee318adfa10914521df0daa4ebb`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Google Gemma 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:32` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/gemma.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--gemma_dark.png

- 职责：模型/供应商品牌图标（Google Gemma（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，12570 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:33` 静态 import（符号 `GemmaDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:257`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Google Gemma（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `4a95c3abd00d7e916163de0f9a5da8e5d6d5a586`；sourceSha256 `a1909cb665b1783bd0f9c72972bb8a86cb0a6f57de434a1b8616f43da5727435`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Google Gemma（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:33` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/gemma_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--gpt-5-chat.png

- 职责：OpenAI GPT-5 Chat 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，30445 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5-chat'`（model-logo.ts:129 亮色 / :234 暗色）映射到 OpenAILogo（openai.png）/GPTDarkLogo（gpt_dark.png），本型号图未被引用。
- 来源：OpenAI GPT-5 Chat，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `3a6a5c393782dd1fb122e56452a7c0a051e336cd`；sourceSha256 `cfb74f51fc5fca65c60e9ede5aa4a8cb29c04cc948251d31b946deea27d88645`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5-chat` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5-chat.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5-codex.png

- 职责：OpenAI GPT-5 Codex 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，25983 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5-codex'`（:130 / :235）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT-5 Codex，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `688d187349d1db41b72008b3da01ec01766253b3`；sourceSha256 `ab8bfee9320eb6aaeee78d86f16502cca55bde3d8358a9481f52612ebfa27d78`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5-codex` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5-codex.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5-mini.png

- 职责：OpenAI GPT-5 mini 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，28301 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5-mini'`（:127 / :232）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT-5 mini，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `0ac07a3a262155445c5d2c6a078d4db10d63f53c`；sourceSha256 `ed2c3c0827b104bcdd6a05e8d129a90b15ccf1d369e143b232fefda118c83cc5`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5-mini` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5-mini.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5-nano.png

- 职责：OpenAI GPT-5 nano 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，29021 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5-nano'`（:128 / :233）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT-5 nano，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `e3cc1ae8710562bb9c51e73a5938e821f624947d`；sourceSha256 `29a3819c097eacbbf621d5bf9147208ebfd14970a703cc125dee12d81905c869`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5-nano` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5-nano.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5.1-chat.png

- 职责：OpenAI GPT-5.1 Chat 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，19329 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5\.1-chat'`（:133 / :238）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT-5.1 Chat，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `52ddd61136d78eff68e26519424228eeee8e2e54`；sourceSha256 `01750b02f89dcc33cf1eb742a71a4071847edafd4dbaad661b74df419103608c`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5.1-chat` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5.1-chat.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5.1-codex-mini.png

- 职责：OpenAI GPT-5.1 Codex mini 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，21832 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5\.1-codex-mini'`（:131 / :236）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT-5.1 Codex mini，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `638c3fea9223b3cf7b818aa752a7bec61af12f32`；sourceSha256 `343d2fb3668b18348954857b3d4ef684e66aff654338096c1e64a347169a2ce4`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5.1-codex-mini` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5.1-codex-mini.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5.1-codex.png

- 职责：OpenAI GPT-5.1 Codex 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，20993 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5\.1-codex'`（:132 / :237）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT-5.1 Codex，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `ec12a5e9017d7c0362e681af0ebddf8346f0f647`；sourceSha256 `26d42317c7751332dbf5bfbb61c3a0ae8241c586923117d04275e9ca70eda72d`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5.1-codex` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5.1-codex.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5.1.png

- 职责：OpenAI GPT-5.1 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，18269 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5\.1'`（:134 / :239）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT-5.1，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `d7f57f8c58dc561a3d31d501e17bf2ebf777ad09`；sourceSha256 `0b689eb02995e9dcaa5ea0ae058ed993fabd7bc184d1bdb36d4a0ce8cf87503a`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5.1` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5.1.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt-5.png

- 职责：OpenAI GPT-5 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，26610 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-5'`（:135 / :240）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用（grep `gpt-5.png` 全树零命中）。
- 来源：OpenAI GPT-5，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `188df6068f28bb0bcaa070d12c873fd9ad9fd346`；sourceSha256 `5a6432262081a08136917b01321f53ce71acf3a17def7f16c6af67b7caa03b8c`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt-5` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt-5.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt_3.5.png

- 职责：OpenAI GPT-3.5 品牌/型号图标素材（`file` 实测 PNG 200×200 RGBA，13494 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-3'`（:121 / :226）映射到 OpenAILogo/GPTDarkLogo；本文件名仅在 `scripts/dark-mode-guards.test.ts:136` 的豁免说明文案中被提及（非加载）。
- 来源：OpenAI GPT-3.5，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `153ff3f6d6ad223170233a240e9acffda8995df8`；sourceSha256 `1f7aac13dd287ee2dc6bca5fa4a172eeda6bb363f0462fa27a5de5538ec2e8df`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt_3.5` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt_3.5.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt_4.png

- 职责：OpenAI GPT-4 品牌/型号图标素材（`file` 实测 PNG 200×200 RGBA，10217 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-4'`（:122 / :227）映射到 OpenAILogo/GPTDarkLogo；本文件名仅在 `scripts/dark-mode-guards.test.ts:136` 文案中被提及（非加载）。
- 来源：OpenAI GPT-4，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `07d445d9367f415eae2c1a34335f38bcc1b7f806`；sourceSha256 `8905b7464d84aa1ed89371ad6b2329c0ee80e1c474e96c9426501c23b80f80b0`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt_4` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt_4.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt_dark.png

- 职责：模型/供应商品牌图标（OpenAI GPT（深色反白位））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，13451 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:23` 静态 import（符号 `GPTDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP 全 GPT 系 `:225`-`:241`；PROVIDER_LOGO_DARK_MAP `:356`/`:357`/`:362`/`:373`；URL_LOGO_DARK_MAP `:478`；`model-logo.test.ts:43` 断言（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：OpenAI GPT（深色反白位），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/openai.png` 字节相同（同一 sourceBlob `394ebc75…`）；`scripts/dark-mode-guards.test.ts:136` 把它列为「亮色侧拆成型号图、无同名亮色基准」的唯一豁免；sourceBlob `394ebc75b6e91fc040b089048f2c92adb2fa619b`；sourceSha256 `9bf729cf67e057e764af4536d21912c686654e9c9f314cdf3145c0d954bac418`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → OpenAI GPT（深色反白位） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:23` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--gpt_image_1.png

- 职责：OpenAI GPT Image-1 品牌/型号图标素材（`file` 实测 PNG 128×128 RGBA，20281 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `'gpt-image'`（:120 / :225）映射到 OpenAILogo/GPTDarkLogo，本型号图未被引用。
- 来源：OpenAI GPT Image-1，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `30f2f2708f1d4fe2337ab9bca5aea05ea3b679ea`；sourceSha256 `6066bb3146f9a0ba1723bb0bb5b7246364e9d4c4b6533f918ab7a23f1c73bd94`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt_image_1` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt_image_1.png` 核对 PNG 128×128 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--gpt_o1.png

- 职责：OpenAI o1 品牌/型号图标素材（`file` 实测 PNG 200×200 RGBA，11721 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：同名模型 ID 规则 `o1`（:123 / :228）映射到 OpenAILogo/GPTDarkLogo；本文件名仅在 `scripts/dark-mode-guards.test.ts:136` 文案中被提及（非加载）。
- 来源：OpenAI o1，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `ba95f765d91d2e51c4ecf42d86fc221d9440b252`；sourceSha256 `bc3ffb5af6e38fdac7eb1b4dc406f7dd3fe618a218f6bc02157f8b6e567e3a30`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `gpt_o1` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/gpt_o1.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--grok.png

- 职责：模型/供应商品牌图标（xAI Grok）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，8067 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:46` 静态 import（符号 `GrokLogo`）；映射注册 MODEL_LOGO_MAP grok `:159`；PROVIDER_LOGO_MAP xai `:347`；URL_LOGO_MAP `:459`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：xAI Grok，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `4aca44247cfc5640f8db60fbbf20a3615d1803ce`；sourceSha256 `7ff8af845b5b7ef19381c99b49e75d22c022405f67ef677e943d2208dbd88024`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → xAI Grok 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:46` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/grok.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--grok_dark.png

- 职责：模型/供应商品牌图标（xAI Grok（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，7708 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:47` 静态 import（符号 `GrokDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:264`；PROVIDER_LOGO_DARK_MAP `:374`；URL_LOGO_DARK_MAP `:480`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：xAI Grok（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `11a8c8d035d7270f67cd8776e266542a9f55eec7`；sourceSha256 `fb3e5625cc553cb64d3d7937b3ef4917ab2822ea703cdbceaea1e9316b5e7f47`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → xAI Grok（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:47` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/grok_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--hunyuan.png

- 职责：模型/供应商品牌图标（腾讯混元）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，11329 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:74` 静态 import（符号 `HunyuanLogo`）；映射注册 MODEL_LOGO_MAP hunyuan `:192`；URL_LOGO_MAP `:463`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：腾讯混元，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `6d8f259adfc3a7b1f87a8423cafaf45cfb4e6400`；sourceSha256 `5609f7ef2a3219d4ed67a1fec0abd51f433d68073f36747448d507d6323621de`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 腾讯混元 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:74` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/hunyuan.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--hunyuan_dark.png

- 职责：模型/供应商品牌图标（腾讯混元（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，11754 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:75` 静态 import（符号 `HunyuanDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:297`；URL_LOGO_DARK_MAP `:484`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：腾讯混元（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `8f936736a1ac4ec3978fe1b86eac7f32797a2acf`；sourceSha256 `d8ea52794d03c21ad726495a9ff8b86ab8b16f587a9228c07b1bba95d8d8e2f9`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 腾讯混元（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:75` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/hunyuan_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--kimigemini.png

- 职责：自定义 Gemini 衍生（Kimi 走 Gemini 协议聚合）品牌图标。`file` 实测 PNG 250×250 RGB（无 alpha），47531 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:37` 静态 import（符号 `KimiGeminiLogo`）；映射注册 MODEL_LOGO_MAP kimigemini `:146`；MODEL_LOGO_DARK_MAP `:251`（无暗色素材，回退亮色）（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Kimi×Gemini 衍生品牌，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `7d782cae0dec1516703004c6b5b4abd2d5d410bc`；sourceSha256 `add65223f0938ab93cce244638bb8affd051b2f30532803660062a501823204c`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Kimi×Gemini 衍生品牌 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:37` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/kimigemini.png` 核对 PNG 250×250 RGB（无 alpha）；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--llama.png

- 职责：模型/供应商品牌图标（Meta Llama）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，7871 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:61` 静态 import（符号 `LlamaLogo`）；映射注册 MODEL_LOGO_MAP llama `:175`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Meta Llama，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `708cf36d2d0724a536ab87a8a3736de2fa2a10bc`；sourceSha256 `f0b31e52a1798af3dceeb6abe214c2e197821c1ba921d99ed2f591da968bcc4a`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Meta Llama 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:61` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/llama.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--llama_dark.png

- 职责：模型/供应商品牌图标（Meta Llama（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，7912 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:62` 静态 import（符号 `LlamaDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:280`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Meta Llama（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `15554b9356f588c139a944970358b641a7817b92`；sourceSha256 `14c80843a3fe598414872c9fb8ac986a68a7291b53a20bb9af7f206f73f0e177`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Meta Llama（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:62` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/llama_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--minimax.png

- 职责：模型/供应商品牌图标（MiniMax）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 250×250 colormap，5505 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:90` 静态 import（符号 `MiniMaxLogo`）；映射注册 MODEL_LOGO_MAP minimax `:202`；MODEL_LOGO_DARK_MAP `:307`；PROVIDER_LOGO_MAP `:340`/ DARK `:367`（无暗色素材，回退亮色）；URL_LOGO_MAP `:452`/`:473`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：MiniMax，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `aa45cdc1cb6e7bf96542ac80e72b19df7a8c4aa8`；sourceSha256 `dac3a5032bf0ef5f5a5228c3ffdc26e2ae6a4748dab98e265a8e7699f3cffeb3`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → MiniMax 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:90` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/minimax.png` 核对 PNG 250×250 colormap；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--mixtral.png

- 职责：模型/供应商品牌图标（Mistral/Mixtral）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，2861 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:65` 静态 import（符号 `MistralLogo`）；映射注册 MODEL_LOGO_MAP mixtral/mistral/ministral/magistral `:179`-`:182`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Mistral/Mixtral，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `0ed97c8194d48bea0a46745549cebf934e1f2708`；sourceSha256 `e3df6dc2fd1922b21e8d062a00cb1741fb0092ed0737b13a67de00dcdde4fdfd`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Mistral/Mixtral 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:65` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/mixtral.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--mixtral_dark.png

- 职责：模型/供应商品牌图标（Mistral/Mixtral（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，2449 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:66` 静态 import（符号 `MistralDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:284`-`:287`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Mistral/Mixtral（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `53ffae84b201e8753af8ef3aef73000bc3e13cff`；sourceSha256 `77e625e61114e0f46f485a96dc16354a207d7cea874f159011b84d074c6818b0`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Mistral/Mixtral（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:66` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/mixtral_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--moonshot.png

- 职责：模型/供应商品牌图标（月之暗面 Kimi（Moonshot））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，10345 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:50` 静态 import（符号 `KimiLogo`）；映射注册 MODEL_LOGO_MAP kimi `:162`；PROVIDER_LOGO_MAP kimi-api/kimi-coding `:333`-`:334`；URL_LOGO_MAP moonshot.cn|kimi `:450`；`model-logo.test.ts:15`/`:22`/`:48` 断言（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：月之暗面 Kimi（Moonshot），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；另有同名 `models/moonshot.webp`（未被引用，见其小节）；sourceBlob `c77e05726faf541ec43227252cf202b69634a615`；sourceSha256 `9571df1d1217ac1e64557b7bb66a0e798e0245adddd8ca97a675adf89cd7aef8`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 月之暗面 Kimi（Moonshot） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:50` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/moonshot.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--moonshot.webp

- 职责：月之暗面 Kimi（Moonshot） 品牌/型号图标素材（`file` 实测 WebP（VP8+alpha）499×499，28184 字节）。按命名本应作模型图标，但当前无任何加载路径，属未启用/预留素材；非"资源/无逻辑"一句话可概括——其同名模型 ID 的实际显示走别的图（见消费栏）。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`，ts/tsx/js/json/css/html/md/yml 全扩展）grep `assets/models`、`@/assets/models/`、本文件名（去扩展与全名）、`import.meta.glob`、`new URL(…assets`、CSS `url()`；`assets/models` 的命中只有 `lib/model-logo.ts:15-103`（45 张他图）、`lib/model-logo.test.ts`（moonshot/openai/claude_dark/gpt_dark）与 `scripts/dark-mode-guards.test.ts:14`（读目录做守卫），本文件名零命中。具体：Kimi 品牌实际加载 `models/moonshot.png`（model-logo.ts:50 KimiLogo）；grep `moonshot.webp` 全树零命中，无 import/字符串/动态 URL 引用。
- 来源：月之暗面 Kimi（Moonshot），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/moonshot.png` 同名不同格式、不同内容（png 为 200×200 RGBA，本文件 499×499 带 alpha）；sourceBlob `fbc0128187237bfd509a4ec6a4a83c80480cc24a`；sourceSha256 `05e6224597e98a83e80eba369bff153198b04d447b4cf31c3637ca6536f2994e`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：删/改当前不影响任何运行时行为、构建与产物（零引用）；影响面仅限素材库完整性与未来启用成本——若日后想按型号细分 GPT/ChatGLM 图标（例如把 `moonshot` 接进 MODEL_LOGO_MAP），本文件是现成素材；误当成"已被使用"而改动则无人受益。
- 验证：`file -b apps/electron/src/renderer/assets/models/moonshot.webp` 核对 WebP（VP8+alpha）499×499；`sha256sum` 应等于 sourceSha256；引用复核：全树 grep 本文件名应零命中（关键词见消费栏）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测、model-logo.ts 映射表实读）；推断（预留/历史素材——同名型号规则实际取 openai.png/gpt_dark.png 等他图）；未知（当初引入用途、是否有启用计划）。

## apps--electron--src--renderer--assets--models--openai.png

- 职责：模型/供应商品牌图标（OpenAI）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，13451 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:22` 静态 import（符号 `OpenAILogo`）；映射注册 MODEL_LOGO_MAP 全 GPT 系 `:120`-`:136`（含 `'gpt-5-chat'` `:129` 等，规则复用本图而非同名型号图）；PROVIDER_LOGO_MAP `:329`/`:330`/`:335`/`:346`；URL_LOGO_MAP `:457`；`model-logo.test.ts:31` 断言（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：OpenAI，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/gpt_dark.png` 字节相同（同一 sourceBlob `394ebc75…`）；sourceBlob `394ebc75b6e91fc040b089048f2c92adb2fa619b`；sourceSha256 `9bf729cf67e057e764af4536d21912c686654e9c9f314cdf3145c0d954bac418`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → OpenAI 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:22` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/openai.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--qwen.png

- 职责：模型/供应商品牌图标（阿里通义千问）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，5697 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:42` 静态 import（符号 `QwenLogo`）；映射注册 MODEL_LOGO_MAP `'(qwen|qwq|qvq|wan-)'` `:156`；PROVIDER_LOGO_MAP `:342`/`:343`；URL_LOGO_MAP `:455`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：阿里通义千问，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `f1f33c3231524642a7bfca38862f1dbe81da5a71`；sourceSha256 `efd7a0ec7a053e77954575e195446be792d8784b3959a529811c14a5f527f31d`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 阿里通义千问 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:42` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/qwen.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--qwen_dark.png

- 职责：模型/供应商品牌图标（阿里通义千问（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，5952 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:43` 静态 import（符号 `QwenDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:261`；PROVIDER_LOGO_DARK_MAP `:369`/`:370`；URL_LOGO_DARK_MAP `:475`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：阿里通义千问（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `ce504e0ac15d23029b8a84859e03955414cbf615`；sourceSha256 `c61afec38aa161539744fbd92185130d981da3214480d00cda5b34a6acab0c21`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 阿里通义千问（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:43` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/qwen_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--qwengemini.png

- 职责：自定义 Gemini 衍生（Qwen 走 Gemini 协议聚合）品牌图标。`file` 实测 PNG 250×250 RGB（无 alpha），56844 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:38` 静态 import（符号 `QwenGeminiLogo`）；映射注册 MODEL_LOGO_MAP qwengemini `:147`；MODEL_LOGO_DARK_MAP `:252`（无暗色素材，回退亮色）（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Qwen×Gemini 衍生品牌，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `0889cee2eee3af34209d4bb06f8aa121b72c8900`；sourceSha256 `147594aa8175257d8aef989ea7c32b28665985d1166b9d533df4518dbffd5407`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Qwen×Gemini 衍生品牌 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:38` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/qwengemini.png` 核对 PNG 250×250 RGB（无 alpha）；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--seedgemini.png

- 职责：自定义 Gemini 衍生（豆包 Seed 走 Gemini 协议聚合）品牌图标。`file` 实测 PNG 250×250 RGB（无 alpha），50613 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:39` 静态 import（符号 `SeedGeminiLogo`）；映射注册 MODEL_LOGO_MAP seedgemini `:148`；MODEL_LOGO_DARK_MAP `:253`（无暗色素材，回退亮色）（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：Seed×Gemini 衍生品牌，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `ae8a8f2d36ff5ce41231673b86381c1c5cb849c7`；sourceSha256 `d37ccabd8277b8676cc7a2d1de2f27e01ae8a6406e027694c9b018d62e2b5cf6`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → Seed×Gemini 衍生品牌 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:39` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/seedgemini.png` 核对 PNG 250×250 RGB（无 alpha）；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--sparkdesk.png

- 职责：模型/供应商品牌图标（讯飞星火 SparkDesk）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，7571 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:82` 静态 import（符号 `SparkDeskLogo`）；映射注册 MODEL_LOGO_MAP sparkdesk/generalv `:195`-`:196`；URL_LOGO_MAP `:462`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：讯飞星火 SparkDesk，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `2bc8154a75284e0406a7b4e8578fd7f30ea3ab29`；sourceSha256 `187e67aabec0001a478e2959bff519e7812b1821ef35ab21dc1efce87b0e710b`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 讯飞星火 SparkDesk 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:82` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/sparkdesk.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--sparkdesk_dark.png

- 职责：模型/供应商品牌图标（讯飞星火 SparkDesk（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，8176 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:83` 静态 import（符号 `SparkDeskDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:300`-`:301`；URL_LOGO_DARK_MAP `:483`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：讯飞星火 SparkDesk（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `ac8e2d2a0c028c4f20ecb1cf446b5fa745a0c443`；sourceSha256 `94fcbc504a5063d980d811c6da30cad742aa91380972e787d232ab704f96923e`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 讯飞星火 SparkDesk（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:83` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/sparkdesk_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--step.png

- 职责：模型/供应商品牌图标（阶跃星辰 Step）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，1556 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:86` 静态 import（符号 `StepLogo`）；映射注册 MODEL_LOGO_MAP step `:199`；URL_LOGO_MAP stepfun `:460`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：阶跃星辰 Step，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `a69d97309d654a2848725de0a2d66e1e6c3682ab`；sourceSha256 `fcf44d575057abfca9e2815fa097bc7a455c988163f8f64bdad6db8e2c404ec2`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 阶跃星辰 Step 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:86` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/step.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--step_dark.png

- 职责：模型/供应商品牌图标（阶跃星辰 Step（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，1640 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:87` 静态 import（符号 `StepDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:304`；URL_LOGO_DARK_MAP `:481`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：阶跃星辰 Step（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `ca995b667f774464a19c4b312f9273e30e2aedff`；sourceSha256 `363d9530b7c164057081738fc0ffc74f7956aed01d5938afd90d29c8d1cf3482`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 阶跃星辰 Step（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:87` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/step_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--wenxin.png

- 职责：模型/供应商品牌图标（百度文心/ERNIE）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，6300 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:78` 静态 import（符号 `WenxinLogo`）；映射注册 MODEL_LOGO_MAP `'ernie-'`/`'tao-'` `:188`-`:189`；URL_LOGO_MAP ernie|baidu `:464`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：百度文心/ERNIE，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `10ab60a5765351c22845a62e56d736f4223e0c1f`；sourceSha256 `d20323de952cc0f0108cc33f8b1c3215ab94d0516865b08d6b50b278644d03cd`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 百度文心/ERNIE 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:78` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/wenxin.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--wenxin_dark.png

- 职责：模型/供应商品牌图标（百度文心/ERNIE（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，6577 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:79` 静态 import（符号 `WenxinDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:293`-`:294`；URL_LOGO_DARK_MAP `:485`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：百度文心/ERNIE（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `a5dddc3280a3856da2817a8417158efb484cafc3`；sourceSha256 `9aa0190e8003aea475e91f4076790c6aefdd62c514ae10129f70c03f447620eb`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 百度文心/ERNIE（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:79` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/wenxin_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--xiaomi.png

- 职责：模型/供应商品牌图标（小米 MiMo）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，8897 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:93` 静态 import（符号 `XiaomiLogo`）；映射注册 MODEL_LOGO_MAP mimo `:205`；MODEL_LOGO_DARK_MAP `:310`；PROVIDER_LOGO_MAP `:344`/`:345` 与 DARK `:371`/`:372`（无暗色素材，两表同用本图）；URL_LOGO_MAP `:453`/`:470`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：小米 MiMo，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `4231594442d235ed92c2b85a5262691a619f8d24`；sourceSha256 `58a54b8d77ced4fed54ece3ae47a2e0f9abef22520d557465e05a117a822656e`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 小米 MiMo 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:93` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/xiaomi.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--yi.png

- 职责：模型/供应商品牌图标（零一万物 Yi）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，5387 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:70` 静态 import（符号 `YiLogo`）；映射注册 MODEL_LOGO_MAP `'yi-'` `:185`；URL_LOGO_MAP `:465`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：零一万物 Yi，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `5a476bd06ba2f60db750b9915323ce8d39bd09b7`；sourceSha256 `a1f7117acaa1c80e1ee240b8d511fec7bdb4bfacef01e7610dbc2c0d8f19bece`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 零一万物 Yi 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:70` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/yi.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--yi_dark.png

- 职责：模型/供应商品牌图标（零一万物 Yi（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，5205 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:71` 静态 import（符号 `YiDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:290`；URL_LOGO_DARK_MAP `:486`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：零一万物 Yi（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `74d89c55ed1f22c90ba74814bb39c29b90471fca`；sourceSha256 `8c11fe7b507708fc6ce23cdd629103e41ca0813eaf6b7b4915876b4cf5c6b5e7`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 零一万物 Yi（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:71` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/yi_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--zhipu.png

- 职责：模型/供应商品牌图标（智谱 Zhipu）：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，11130 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:57` 静态 import（符号 `ZhipuLogo`）；映射注册 MODEL_LOGO_MAP zhipu/cogview/glm `:170`-`:172`；PROVIDER_LOGO_MAP `:336`-`:338`；URL_LOGO_MAP `:451`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：智谱 Zhipu，上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/chatglm.png` 字节相同（同一 sourceBlob `1cbf1682…`）；sourceBlob `1cbf1682dca0a5d83515da17571bbcf1aca9fc10`；sourceSha256 `9826ee53d8ba793a25ce576c4f6e88a0aa2e47b732ec0c967ac853b20f412618`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 智谱 Zhipu 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:57` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；暗/亮配套关系见 MODEL_LOGO_DARK_MAP 同序回退约束（:216-222 注释）。
- 验证：`file -b apps/electron/src/renderer/assets/models/zhipu.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--models--zhipu_dark.png

- 职责：模型/供应商品牌图标（智谱 Zhipu（深色反白））：由 model-logo 映射表按模型 ID 正则/供应商/Base-URL 域名选出，显示在模型选择器、会话消息、渠道设置等处的 `<img>` 上。`file` 实测 PNG 200×200 RGBA，11130 字节。
- 消费：`apps/electron/src/renderer/lib/model-logo.ts:58` 静态 import（符号 `ZhipuDarkLogo`）；映射注册 MODEL_LOGO_DARK_MAP `:274`-`:277`；PROVIDER_LOGO_DARK_MAP `:363`-`:365`；URL_LOGO_DARK_MAP `:472`（解析链与触发时机见家族总述）。运行时渲染点与触发时机引用家族总述（`getModelLogo`/`getChannelLogo`/`getProviderLogo` 的 8 处组件 `<img>`：scroll-minimap.tsx:484、TabPreviewPanel.tsx:39、ChannelSettings.tsx:382/:473/:490、ChannelForm.tsx:96、ModelSelector.tsx:366/:385/:445/:488、SDKMessageRenderer.tsx:305、AgentMessages.tsx:251、SessionMiniMapPopover.tsx:402）。
- 来源：智谱 Zhipu（深色反白），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；与 `models/chatglm_dark.png` 字节相同（同一 sourceBlob `1cbf1682…`）；sourceBlob `1cbf1682dca0a5d83515da17571bbcf1aca9fc10`；sourceSha256 `9826ee53d8ba793a25ce576c4f6e88a0aa2e47b732ec0c967ac853b20f412618`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改图 → 智谱 Zhipu（深色反白） 相关模型/渠道在各渲染点图标变形或错色；删文件 → `model-logo.ts:58` 的静态 import 断链、`vite build` 失败（`build:renderer` 挂），即便绕过构建，`getModelLogo` 返回失效 URL 导致 `<img>` 破图；删除 `*_dark.png` 还会触发/破坏 `scripts/dark-mode-guards.test.ts:116-145` 的暗色守卫（导入暗图必须注册暗表、且存在同名亮色资源）。
- 验证：`file -b apps/electron/src/renderer/assets/models/zhipu_dark.png` 核对 PNG 200×200 RGBA；`sha256sum` 应等于 sourceSha256；grep 复核 import 行与映射行；`bun test src/renderer/lib/model-logo.test.ts` 与 `bun run test:dark-mode` 可回归（均 NOT_RUN）。本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（import 行/映射表实读、`file`/`sha256sum` 实测、冻结源核对一致）；推断（Vite 产物路径按默认 assetsDir、素材身份按文件命名与画面）；未知（图片素材的原始来源/授权版本）。

## apps--electron--src--renderer--assets--sound--ding-dong.mp3

- 职责：内置通知提示音（id `ding-dong`，默认「权限审批/计划审批/规划提醒」音（`DEFAULT_NOTIFICATION_SOUNDS` :61-:63））。`file` 实测 MP3 192 kbps 44.1 kHz 联合立体声，ID3v2.3，77294 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:16` 静态 import（符号 `soundDingDong`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:38`（id `ding-dong`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 ding-dong），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `d4be6723efd306477a86d7e85f21a7f9cbd7a152`；sourceSha256 `c65cad3b081325f652197ed68cebc24e49facbbd204901cacdfd7ceb46beeb12`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/ding-dong.mp3` 核对 MP3 192 kbps 44.1 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:16）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--sound--ding.mp3

- 职责：内置通知提示音（id `ding`，默认「任务完成」音：`DEFAULT_NOTIFICATION_SOUNDS.taskComplete='ding'`（:60））。`file` 实测 MP3 192 kbps 44.1 kHz 联合立体声，ID3v2.3，55978 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:15` 静态 import（符号 `soundDing`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:37`（id `ding`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 ding），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `47e382dc2852de0a50f46a45ebcb316fbbd86b44`；sourceSha256 `d38eb2747f7135b7524d96a65e68b232ca8b9d2b689af21cb5b8744fb93ad499`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/ding.mp3` 核对 MP3 192 kbps 44.1 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:15）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--sound--discord.mp3

- 职责：内置通知提示音（id `discord`，可选通知音（设置页选择后按场景播放））。`file` 实测 MP3 256 kbps 48 kHz 联合立体声，59136 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:17` 静态 import（符号 `soundDiscord`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:39`（id `discord`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 discord），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `e48192c72cb6e74965128e340b19d63104593066`；sourceSha256 `335958dfc8423f1feb356f80fa09794e2a853ac84c64d8fd372bdc9d1fe7b04a`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/discord.mp3` 核对 MP3 256 kbps 48 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:17）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--sound--done.mp3

- 职责：内置通知提示音（id `done`，可选通知音（本目录最大文件，384768 字节））。`file` 实测 MP3 256 kbps 48 kHz 联合立体声，384768 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:18` 静态 import（符号 `soundDone`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:40`（id `done`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 done），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `a0cca96052f284f62161a6df7a8cf9f0caac34a5`；sourceSha256 `7a1334fa5af3a65c25cfb6351cd3ec202bf42ce78d74a8f600204a32a718b208`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/done.mp3` 核对 MP3 256 kbps 48 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:18）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--sound--down-power.mp3

- 职责：内置通知提示音（id `down-power`，可选通知音）。`file` 实测 MP3 256 kbps 48 kHz 联合立体声，165888 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:19` 静态 import（符号 `soundDownPower`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:41`（id `down-power`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 down-power），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `df7681fb40f0b0fd48a267b1286b6f1d87d6b712`；sourceSha256 `fbd32f66953bc6b9c0ab398595fcc76ba81082d75ed20182daa42e68a9264056`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/down-power.mp3` 核对 MP3 256 kbps 48 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:19）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--sound--food.mp3

- 职责：内置通知提示音（id `food`，可选通知音（与 quiet.mp3 同字节数但内容不同、sha 不同））。`file` 实测 MP3 256 kbps 44.1 kHz 联合立体声，78576 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:20` 静态 import（符号 `soundFood`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:42`（id `food`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 food），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `2777a302675317203c1ff744235349a8097ba543`；sourceSha256 `f7687a9f91dec6c79b4dca2963debb60828bb433dc0b469c6e32e0566bfb71e1`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/food.mp3` 核对 MP3 256 kbps 44.1 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:20）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--sound--lite.mp3

- 职责：内置通知提示音（id `lite`，可选通知音）。`file` 实测 MP3 256 kbps 48 kHz 联合立体声，46811 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:21` 静态 import（符号 `soundLite`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:43`（id `lite`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 lite），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `fe4859efcc0f215243f960677b9de894d07ab9d7`；sourceSha256 `44c077ce28a0a48cec29da204beb627fd17140e5bde1f92dbaecf3d478bdda6f`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/lite.mp3` 核对 MP3 256 kbps 48 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:21）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--sound--quiet.mp3

- 职责：内置通知提示音（id `quiet`，可选通知音（与 food.mp3 同字节数但内容不同、sha 不同））。`file` 实测 MP3 256 kbps 48 kHz 联合立体声，78576 字节。
- 消费：`apps/electron/src/renderer/atoms/notifications.ts:22` 静态 import（符号 `soundQuiet`），注册 `BUILTIN_NOTIFICATION_SOUNDS` `:44`（id `quiet`）；播放链：注册 `BUILTIN_NOTIFICATION_SOUNDS`（`atoms/notifications.ts:36-45`）→ `SOUND_URL_MAP`（:51-53）→ `getBuiltinAudioElement`（:218-228，:224 `new Audio(url)` 并缓存）→ `playNotificationSound`（:264-281，:272 `audio.play()`）/ `playNotificationSoundAsync`（:286-310，:294）；场景选择 `playNotificationSoundForType`（:315-321）。触发时机（家族总述）：任务完成 `hooks/useGlobalAgentListeners.ts:1443-1455`（`soundType:'taskComplete'`）、工具权限请求 :1219、AskUser 提问 :1234（`permissionRequest`）、计划待审批 :1301（`exitPlanMode`）、规划提醒 `components/planning/PlanningReminderRail.tsx:51`（`planningReminder`）、设置页试听 `components/settings/UsageSettings.tsx:504-506`。
- 来源：通知音效素材（注册表标签 quiet），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；sourceBlob `94ff90ebe5270bc3708a487898a93c6e89f63021`；sourceSha256 `a854275553b207b613df05894303bfbf3d2cf74b595c298417c172facbf5c7a0`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：进产物。经 `@/assets/…` 静态 import 进入 Vite 资源管线：`apps/electron/vite.config.ts:35` `outDir=dist/renderer`、`:13` `base:'./'`，构建链 `apps/electron/package.json` 的 `build:renderer`（`scripts/build-renderer.mjs` 包装 `vite build`）将其发射为 `dist/renderer/assets/<文件名>-<hash><扩展>`（Vite 默认 `assetsDir='assets'`，推断），再由 `electron-builder.yml:44-45` `files: dist/**/*` 打进 `app.asar`（`:31` `asar: true`）；`extraResources`（`electron-builder.yml:70` 起）不含 renderer assets。
- 影响：改音：通知提示音音色变化；删文件：`atoms/notifications.ts:15-22` 的静态 import 断链，`vite build` 失败；即便绕过构建，`SOUND_URL_MAP` 缺项使 `getBuiltinAudioElement` 返回 null（:219-220）→ 对应场景静音、设置页试听（UsageSettings.tsx:504-506）无声。
- 验证：`file -b apps/electron/src/renderer/assets/sound/quiet.mp3` 核对 MP3 256 kbps 48 kHz 联合立体声；`sha256sum` 应等于 sourceSha256；grep 复核 import 行（notifications.ts:22）与注册行；试听需运行产品（本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。）
- 证实/推断/未知：证实（import/注册表/播放链实读、`file`/`sha256sum` 实测）；推断（音色身份按注册表英文标签与文件名）；未知（音频素材来源/授权）。

## apps--electron--src--renderer--assets--theme-previews--theme-cloud-dancer.webp

- 职责：「云朵舞者」主题预览图（竖版 400×600 预览卡素材）。`file` 实测 WebP（VP8）400×600，10032 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；推断对应 PPT 风格包 `profer-cloud-dancer`（`resources/ppt-style-packs/profer-cloud-dancer/preview.webp` 才是实际展示的缩略图）；sourceBlob `a8b00570f77d2e506cd887902178cc95b6f3bcdf`；sourceSha256 `61eb0429828f2ea7d4fa3c1f77a6f7f3d3e436995cb6f47285a0ccfaf0a8c9bd`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 推断对应 PPT 风格包 `profer-cloud-dancer`（`resources/ppt-style-packs/profer-cloud-dancer/preview.webp` 才是实际展示的缩略图）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-cloud-dancer.webp` 核对 WebP（VP8）400×600；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

## apps--electron--src--renderer--assets--theme-previews--theme-forest-morning.webp

- 职责：「森林清晨」主题预览图。`file` 实测 WebP（VP8）400×600，18410 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；推断近似对应内置皮肤 `resources/skins/forest-light/`（命名不完全一致）；sourceBlob `66b5ca2c9753541d9a50cf53381f771bca0d35e8`；sourceSha256 `7bf206d5cfbcd9df73f4636450abe20503d47d41f9a155c9ce7423602fdd8518`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 推断近似对应内置皮肤 `resources/skins/forest-light/`（命名不完全一致）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-forest-morning.webp` 核对 WebP（VP8）400×600；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

## apps--electron--src--renderer--assets--theme-previews--theme-forest-night.webp

- 职责：「森林夜晚」主题预览图。`file` 实测 WebP（VP8）400×600，7892 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；推断近似对应内置皮肤 `resources/skins/forest-dark/`（命名不完全一致）；sourceBlob `5d327dcc1e60c95d6fe4bc83c14e2316d710fd86`；sourceSha256 `285a971de72b9ac8a9c0ae771fb2ae717a35a6007ead4be1c55bb16088263fac`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 推断近似对应内置皮肤 `resources/skins/forest-dark/`（命名不完全一致）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-forest-night.webp` 核对 WebP（VP8）400×600；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

## apps--electron--src--renderer--assets--theme-previews--theme-mist-paper-dark.svg

- 职责：「雾纸暖灰」主题预览图（矢量线稿版）。`file` 实测 SVG 198×366（25 行 ASCII 文本；内容为手绘界面预览线稿：暖石墨底 #211F1D、陶土点缀 #A0624B 的 UI 版式示意图），1943 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；对应内置皮肤 `resources/skins/mist-paper-dark/`（同名，推断为该皮肤的设计预览稿）；sourceBlob `c3cb3cf7c727d5c135fcea363598ac082cbc9bdf`；sourceSha256 `7c1ba304593a3181bb0efb52cdeb23db4a0bad09fc8bddbcd988f798d7dd58aa`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 对应内置皮肤 `resources/skins/mist-paper-dark/`（同名，推断为该皮肤的设计预览稿）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-mist-paper-dark.svg` 核对 SVG 198×366（25 行 ASCII 文本；内容为手绘界面预览线稿：暖石墨底 #211F1D、陶土点缀 #A0624B 的 UI 版式示意图）；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

## apps--electron--src--renderer--assets--theme-previews--theme-morandi-night.webp

- 职责：「莫兰迪夜色」主题预览图。`file` 实测 WebP（VP8）400×600，12634 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；无对应内置皮肤或风格包（resources/skins 无 morandi-*）；sourceBlob `32dc5d8c08dc7bcfaf62ad2fe30ffd1de38caa6d`；sourceSha256 `6236610e824277d8c8807838b224f4c8c466aa28915aed61032c5f29059203c7`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 无对应内置皮肤或风格包（resources/skins 无 morandi-*）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-morandi-night.webp` 核对 WebP（VP8）400×600；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

## apps--electron--src--renderer--assets--theme-previews--theme-ocean-dark.webp

- 职责：「远山暮霭/深海玻璃」主题预览图。`file` 实测 WebP（VP8）1024×1536（本组唯一非 400×600 的 webp），132890 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；对应内置皮肤 `resources/skins/ocean-dark/`（同名）；sourceBlob `6963dff7e5c6b37273f4493b77194eaa95a4af8d`；sourceSha256 `ed7c8b58d2f2395b09f98c58139e1218fdf2cb4da3283cdd3db849f2d30ac1b1`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 对应内置皮肤 `resources/skins/ocean-dark/`（同名）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-ocean-dark.webp` 核对 WebP（VP8）1024×1536（本组唯一非 400×600 的 webp）；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

## apps--electron--src--renderer--assets--theme-previews--theme-ocean-light.webp

- 职责：「晴空碧海」主题预览图。`file` 实测 WebP（VP8）400×600，20546 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；对应内置皮肤 `resources/skins/ocean-light/`（同名）；sourceBlob `95cd56de53e93500c6e5a92f13870cf30691f500`；sourceSha256 `a58c7834db01792d5d14c9f0d77316ae296b96e3ae718db57ab84d3021a9037f`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 对应内置皮肤 `resources/skins/ocean-light/`（同名）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-ocean-light.webp` 核对 WebP（VP8）400×600；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

## apps--electron--src--renderer--assets--theme-previews--theme-terminal-dark.png

- 职责：「CRT 终端」主题预览图。`file` 实测 PNG 198×366 RGB（与 theme-mist-paper-dark.svg 同画幅的线稿栅格版），87663 字节。
- 消费：**未发现消费者**。已检索：全树（`apps/`、`packages/`、`resources/`、`scripts`、docs，ts/tsx/js/json/css/html/md/yml 全扩展）grep `theme-previews`、本文件名与去扩展名、`import.meta.glob`、`new URL(…assets`、CSS `url()` —— `theme-previews` 零命中；主题名的命中仅为 CSS 主题类名 `.theme-*`（`renderer/styles/globals.css`、`apps/electron/tailwind.config.js:23-30`）与 PPT 风格包 `profer-cloud-dancer`（`src/main/lib/ppt-style-pack-service.ts:8`，其缩略图是`resources/ppt-style-packs/*/preview.webp`），均非本文件。主题/皮肤选择器的真实预览走皮肤包协议：`renderer/components/settings/SkinManager.tsx:74-82`（`SkinPreview`，:77 `window.electronAPI.getSkinPreview(skin.id)`）→ 主进程 `src/main/lib/skin-manager-service.ts:29` `PREVIEW_RE` 读皮肤根 `preview.<ext>`（另见 `agent-skin-tools.ts:216-233`），内置皮肤在 `apps/electron/resources/skins/<id>/`（`electron-builder.yml:86-90` extraResources `resources/skins`→`skins`），与本目录无引用关系。
- 来源：主题预览图素材（文件名对应主题/皮肤 id），上游/生成方/授权版本线索未知（推断按文件命名与画面识别）；对应内置皮肤 `resources/skins/terminal-dark/`（同名）；sourceBlob `fdb6397f8e9da3dbf5493ea458d69c9e4842b198`；sourceSha256 `1838361119a8496dc21a3ccbfb9d7f2ee731862571670156b64bcc6662542836`（INDEX-SCOPE-LOCK.json 机械列；已 `sha256sum` 对冻结源抽样核对一致）。
- 打包：不进产物：Vite 只发射被 import 的资源，本文件零 import/零字符串引用（检索见消费栏）；`src/renderer/public` 不存在（无 publicDir 整目录拷贝），`scripts/copy-resources.ts` 仅拷 `apps/electron/resources`→`dist/resources`，`electron-builder.yml:44-45`（`files: dist/**/*`）与 `:70` 起（`extraResources`）都不会带上未被构建引用的素材——即该文件不在打包清单。
- 影响：零运行时影响：改/删不触及任何功能、构建与产物（不进构建，且零引用）；仅损失素材完整性与潜在设计参考价值。 对应内置皮肤 `resources/skins/terminal-dark/`（同名）；若未来主题选择器要展示预览卡，本文件是候选素材（推断）。
- 验证：`file -b apps/electron/src/renderer/assets/theme-previews/theme-terminal-dark.png` 核对 PNG 198×366 RGB（与 theme-mist-paper-dark.svg 同画幅的线稿栅格版）；`sha256sum` 应等于 sourceSha256；零引用复核：全树 grep `theme-previews` 与本文件名应零命中（详见消费栏检索清单）；本轮产品测试/typecheck/构建/GUI 统一 NOT_RUN。
- 证实/推断/未知：证实（全树零引用检索、`file`/`sha256sum` 实测）；推断（内置主题预览设计稿，命名与 resources/skins 内置皮肤及 profer-cloud-dancer 风格包对应）；未知（生成来源、是否有接入主题选择器的计划）。

**未运行 / 未知**：本轮统一 NOT_RUN——产品测试（含 `bun test`、`bun run test:dark-mode`）、typecheck、`build:renderer`/electron-builder 构建、GUI 目视核对均未运行；「打包位置」依据构建配置（vite.config.ts:35、electron-builder.yml:44-45）实读推导，未实际产出 dist 核对（Vite 默认 `assetsDir='assets'` 的具体 hashed 路径为推断）。本组遗留未知：① 全部 82 个素材的原始来源/授权版本不可考（仅 cdut-logo*.svg 的 `<desc>` 自述描摹来源）；② models/ 16 个零引用型号图（chatglm×2、gpt-5 系 8、gpt_3.5/gpt_4/gpt_image_1/gpt_o1、moonshot.webp）的引入意图与启用计划未知；③ theme-previews/ 8 个零引用预览图的生成来源、以及是否有接入主题/皮肤选择器的计划未知（当前皮肤预览走皮肤包 preview.<ext> 协议）；④ `models/deepgemini.png` 实为 JPEG 内容配 .png 扩展名的兼容性处理是否为有意为之，未见证据。
