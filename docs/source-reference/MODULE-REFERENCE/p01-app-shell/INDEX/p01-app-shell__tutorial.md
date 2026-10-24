# p01-app-shell__tutorial 索引（tutorial/tutorial-v2.md 使用教程正文）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__tutorial`（owner `p01-app-shell`，family `tutorial`）共 1 个文件，七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

## tutorial--tutorial-v2.md

- 职责：CDUT Studio 完整使用教程正文（Markdown，543 行 / 28703 字节）：产品上手指南（会话/工作区/技能/设置等），含「三类文件」说明（:419——会话文件（仅本会话）/工作区文件（所有会话共享）/附加文件，并约定过程文件沉淀在工作区 `.context/` 下）。
- 消费（谁加载→何时生效→行为约束）：①打包映射 `apps/electron/electron-builder.yml:77-78`——`from: ../../tutorial/tutorial-v2.md, to: tutorial.md`（注释「教程文件（教程查看器 + 欢迎对话使用）」）；②主进程 `apps/electron/src/main/lib/tutorial-service.ts:21-27 getTutorialFilePath`（prod `process.resourcesPath/tutorial.md`、dev `__dirname/resources/tutorial.md`）→ `:34-46 getTutorialContent` 读全文 → 两条通道：IPC `ipc.ts:249/:1902-1906`（`getTutorialContent`）→ renderer `tabs/TabContent.tsx:72/:92`（教程 Tab 渲染 markdown，失败显示「教程加载失败」）；以及 `createWelcomeConversation :53-97`（创建欢迎对话：教程存为附件「CDUT Studio 使用教程.md」:74、剥离图片链接 :80、作为 AI 参考知识库随首条消息注入 :91）；preload 桥 `preload/index.ts:484-489/:2400-2401`。③界面入口：教程 Tab 常驻（`tab-atoms.ts:37-39/:172-181`、`tab-activation.ts:74`、`active-tab-content.ts:16-21`）、右下角推荐横幅 `TutorialBanner.tsx:2-:7/:74/:100`、设置页「CDUT Studio 教程」入口 `SettingsPanel.tsx:98`。
- 来源：产品使用教程（团队撰写，v2）；sourceBlob `dfc5b059b39b3c6c2c360d958ee909bc4661beeb`；sourceSha256 `76b14920902bd8e093c7497f260200159a6c0a30b1f8586a50483a578ebe5115`。
- 打包：进产物——electron-builder 直接以本文件为源复制为安装包 `resources/tutorial.md`（yml:77-78）；注意 dev 态读的是 `apps/electron/resources/tutorial.md`（另一副本，sha `cbac2d9e…` ≠ 本文件 `76b14920…`，漂移已记录于 index-p01-app-shell__apps__electron 手册）。
- 影响：删除→打包映射源缺失（构建失败）、教程查看器与欢迎对话无内容；改动→用户可见教程与欢迎对话知识库同步变化；dev/prod 内容不一致风险见上。
- 验证：①核 yml:77-78 映射、tutorial-service.ts:21-46/:53-97、TabContent.tsx:72 全链；②核 :419 要点；③与 `resources/tutorial.md` 做 sha256 差异比对复核漂移；④hash 一致；NOT_RUN：产品测试/typecheck/构建/GUI/教程页渲染（本轮统一 NOT_RUN）。
- 证实/推断/未知：加载链/打包/漂移=**证实**（实读代码+机械哈希比对）；教程所述功能与实现一致性=**未知**（未逐章核对）。
