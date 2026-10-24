# p01-app-shell__release-notes 索引（仓根 release-notes/ 版本发布说明归档）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__release-notes`（owner `p01-app-shell`，family `release-notes`）共 22 个文件（21 docs + 1 resource），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。逐文件 hash 由封版流程按 `INDEX-SCOPE-LOCK.json` 机械列注入（与 MANIFEST.json 同源）。

家族背景（实读证实）：`release-notes/` 是逐版本发布说明归档——`releases.json`（40 条 GitHub release 对象捕获）+ 21 篇版本 md（标题沿革：v0.7.1–v0.12.26 时期 `# Proma vX`，v0.12.69 起 `# Profer vX`=品牌迁移）。消费面：全树检索 `release-notes/` 在代码中**零命中**（证实）；应用内「版本历史」读的是 `apps/electron/resources/CHANGELOG.json`（`changelog-service.ts:4/:29`），自动更新 feed 是**远端** `https://updates.profer.cn/releases.json`（`ipc.ts:5669-5671`，`PROFER_UPDATE_FEED_URL` 可覆盖）——本目录 `releases.json` 疑为其捕获/上传源（推断）。全组不进安装包（`electron-builder.yml:44-68` `files:`、`:70-122` `extraResources:` 均无 `release-notes/`）。「打包」行均指此结论。

## release-notes--releases.json

- 职责：GitHub Releases API 捕获数据（30249 字节 / 442 行，**list 40 项**）：每项 `{id, tag_name, name, body, draft, prerelease, created_at, published_at, html_url}`，指向 `github.com/Yuan-lai-ru-ci/ProferAI`（首条 `v0.15.85`，body 为 compare 链接），供更新发布流程/网站版本列表使用的结构化版本清单。
- 消费：全树检索 `release-notes/|releases.json` 零代码命中（证实）；应用更新 feed 指远端 `https://updates.profer.cn/releases.json`（`ipc.ts:5669-5671`），本文件为同名 feed 的仓内数据源/捕获（推断）。人类/发布流程读者。
- 来源：GitHub Releases API 导出/捕获（发布流程产出）；sourceBlob `5f858b09b91a286deb615bd6eea0e67973ef93a0`；sourceSha256 `d95ccac4289eeea3b0811c20ca37aac2ede240ccd010019acdabcf0f67fa8b72`。
- 打包：不进产物（electron-builder.yml:44-68/:70-122 无 release-notes/）。
- 影响：删除→更新源数据/版本清单归档丢失；应用更新走远端 feed 不受影响（推断）；构建/运行无影响。
- 验证：JSON 可解析、40 条目字段齐全、`html_url`/`tag_name` 形态一致、hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：结构/零引用=**证实**；「即 updates.profer.cn 数据源」=**推断**；40 条与 21 篇 md 的版本交集=**未知**（未逐版比对）。

## release-notes--v0.10.25.md

- 职责：《Proma v0.10.25》发布说明（29 行；:3 对比基准 v0.10.21）：重点改善 Windows 体验、接入更多模型供应商（:5 摘要），含会话切换/文件改动/第三方模型服务改进。
- 消费：全树检索文件名零命中（证实）；人类读者（发布公告归档）。
- 来源：版本发布说明（团队撰写，随 v0.10.25 发布）；sourceBlob `11c942ae4cbc1cd9e8124c11d3c2b74ad7e53c0a`；sourceSha256 `962eff0cb5faa79d5f687ee63ac8761fa6523a0ed3832f0e07da52b8cf8a0cd1`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash 一致；NOT_RUN。
- 证实/推断/未知：内容=**证实**（实读头部）；所述改进与代码一致性=**未知**。

## release-notes--v0.11.1.md

- 职责：《Proma v0.11.1》发布说明（19 行；:3 对比基准 v0.11.0）：继续调整 v0.11.0 重做后的 Agent 侧边栏（会话列表视觉权重/展开节奏）并修复三点菜单浮层漂移到左上角问题（:5）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `85461f27aae4dcdd99b245487e61b4ef6b762e7d`；sourceSha256 `beff14b460047fd9a9e514b0ee68509df313ee42bb94644e1abae0bea8258722`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.12.0.md

- 职责：《Proma v0.12.0》发布说明（35 行）：定时任务（Automation）系统（测试版）大版本（:9 全屏管理视图/interval·daily·weekly 三模式/30 秒 tick 调度器/`~/.proma/automations.json` 持久化）、自然语言创建定时任务（:10，DeepSeek+Anthropic+关键词三级 fallback）、飞书通知（:11）、Markdown 富文本编辑器（:12）、built-in skill 分组（:13，`proma-built-in` 哨兵）、工作区重命名（:14）、项目删除二次确认（:15）、后台任务自动唤醒（:16）、Bridge 长连接自愈（:17）、Chat 侧边栏对齐（:18）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `fd82d24b308d160e5caceee2d827095b4584cb4c`；sourceSha256 `8d879a2df8a2ff982c5eb4472529a55901f2fa1342d4ce6d4488f69177a62aba`。
- 打包：不进产物。
- 影响：删除→Automation 系统发布公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:7/:9-:18、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**（实读要点行）；功能与现行代码一致性=**未知**。

## release-notes--v0.12.23.md

- 职责：《Proma v0.12.23》发布说明（47 行）：含「定时任务跨运行记忆机制」（:15——automation skill 引导 Agent 将「读取/滚动维护工作区 `notes.md`」写进 prompt，约定 `.context/automation/<task-slug>/notes.md` 路径与 kebab-case 命名）等自动化与体验改进。
- 消费：零引用（全树检索证实）；人类读者。注意 :15 是产品行为约定的**发布口径记录**（与 `default-skills/automation/SKILL.md:100/:119` 同一约定的对外说明）。
- 来源：版本发布说明；sourceBlob `ee3950f90b68c2af85743024d369e125aacc057a`；sourceSha256 `66d7d8fed249e35ddc54851cd0a0648fa61db59fc52a1caf1763fce53ee173eb`。
- 打包：不进产物。
- 影响：删除→跨运行记忆约定的发布口径归档丢失；对构建/运行无影响。
- 验证：核 :1/:15、与 automation SKILL.md:100 约定对照、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与 SKILL 文本一致性=**未逐句比对**。

## release-notes--v0.12.26.md

- 职责：《Proma v0.12.26》发布说明（29 行；:3 对比基准 v0.12.23）：交互细节打磨——第 7 个特殊主题「旧屏微光」（CRT 终端风）、Skills/MCP 管理升级为「Agent 技能」全屏视图、深色主题卡片阴影减弱；修复 tooltip 闪现/worktree diff 面板/GLM-5.2 上下文指示器/渠道切换模型残留（:5）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `bfadfc94293b23ff19f185e2995eb4e51d1ea678`；sourceSha256 `5d98da8e7535adb4fdb65034cde4ad34ccac9460f2a1bda1502d16cf082c8ed7`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.12.69.md

- 职责：《Profer v0.12.69》发布说明（17 行；:3 对比基准 v0.12.67）：品牌迁移后首批 Profer 版本之一——从 Proma upstream 同步侧栏委派子会话树形折叠、Markdown 目录手动开闭、经典/现代界面风格切换；补齐协作委派（collaboration）后端链路、修复版本更新渠道校验（:5）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `7afa44e34af38b41182623013fee363ccc97cafa`；sourceSha256 `bca24aace1243b1702c494c1a1a618ba0c40bf1f0e90e55b6e01a110f8e375a6`。
- 打包：不进产物。
- 影响：删除→品牌迁移期公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；upstream 同步完整性=**未知**。

## release-notes--v0.15.51.md

- 职责：《Profer v0.15.51》发布说明（17 行）：Agent 预设导入导出与单工具裁剪（disabledTools 全链路）、Agent 队列自动发送开关（右键入队 + per-session 持久化）、Agent 任务中断原因判定/记录/注入与可视化（:4-:6）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `49719e14d6987fe2ddefcbe09f635764585ad95c`；sourceSha256 `27b057b9dafe2dec28439f1419ecf87a05015094cddc2361a3be2f4fab17016d`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:4-:6、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.15.57.md

- 职责：《Profer v0.15.57》发布说明（15 行）：修复「全局元 Skill」升级后卡片误显「暂无描述」（历史 Skill 文件 Windows 换行与旧元数据解析不兼容→解析器兼容 LF/CRLF、内置 Skill 统一 LF，:5）；修复品牌迁移后残留旧 Proma 元 Skill 内容（按完整目录指纹识别并安全升级，:6）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `8333e3531d190af02eccd185143a33cb44abdb08`；sourceSha256 `da26cb26857c440f24a3f029658a8799b7d691b485709b3f6480b28aea7543a9`。
- 打包：不进产物。
- 影响：删除→元 Skill 迁移修复公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5/:6、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；修复与现行 skill-master-manager 行为一致性=**未知**。

## release-notes--v0.7.1.md

- 职责：《Proma v0.7.1》发布说明（46 行）：飞书群聊完整支持（:5——群聊 @mention 触发、Thread 形式回复、自动注入最近 20 条群聊历史、内置 MCP 工具 `fetch_group_chat_history`）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明（Proma 早期）；sourceBlob `9cfc4747ae9fcea528b729a28197678708dc4acc`；sourceSha256 `e1352d00706cd5e9c230ae0af0c18c0ff56a3d08af8b059161ecc1c35a14b2ed`。
- 打包：不进产物。
- 影响：删除→飞书群聊能力发布公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与现行飞书 bridge 行为一致性=**未知**。

## release-notes--v0.9.11.md

- 职责：《Proma v0.9.11》发布说明（40 行）：Windows 环境检测 + 一键安装（:5——Onboarding 自动检测 Git/Node 缺失可一键安装；聊天错误卡片排障指引升级）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `aa4ac107b1e95897805f0227763f35f990d7c8ef`；sourceSha256 `7a8d1f6da3c14db3f049a556ff3dae483d3683353043d8eb3e3b583a4a40973d`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.9.12.md

- 职责：《Proma v0.9.12》发布说明（36 行）：`@` 文件引用弹窗全面增强（:5——会话/工作区分组双 banner、工作文件顶层目录改名，层级与交互重写）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `7973b48aa464df4f6240a929228de6e68218c299`；sourceSha256 `7c1ab32d99ff4b5295bf9a830ed785b68cdd56235a0f46012fd24c7913293228`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.9.15.md

- 职责：《Proma v0.9.15》发布说明（59 行，本目录最长之一）：豆包流式语音输入（:7，`Ctrl+～` 系统级浮窗）、菜单栏会话快捷操作（:16）、Dock/Launcher 角标（:22）；Bug 修复含权限模式按 session 隔离（:29）等；开发打包含 `ws@8.19.0` 依赖与 AGENTS.md 新增（:45-:46）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `5570614a97d8f5762cbd1d8be7e495e31c37e966`；sourceSha256 `0cce26c4b93c3bca0d1ac6cda1529dbdf0658b1437d1ab41178ab301c2b8c554`。
- 打包：不进产物。
- 影响：删除→语音输入能力发布公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:5/:7/:27/:42 各节、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.9.16.md

- 职责：《Proma v0.9.16》发布说明（43 行；:3 对比基准 v0.9.15）：语音输入自定义热词实验（:7——设置页热词词库、请求级注入豆包 ASR `corpus.context.hotwords`、轻量词库配置）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `7bdeb460e21f2cc7a0193335839409fc0b703bc9`；sourceSha256 `a9819d573fa6ac2f007b4aa98324d5df4060e2cc8115604178a57ba6987ae9e4`。
- 打包：不进产物。
- 影响：删除→热词实验公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:7、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.9.17.md

- 职责：《Proma v0.9.17》发布说明（33 行；:3 对比基准 v0.9.16）：以 Bug 修复为主（:5 起修复清单）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `2709379706e6c2896187d07cd17867307bae51ce`；sourceSha256 `86be5a5bc9bfeb6bc99437f95759aa88e056bc8f76c95cab436c05cf9e6c784c`。
- 打包：不进产物。
- 影响：删除→该版修复公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**（头部实读）；修复明细与代码一致性=**未知**。

## release-notes--v0.9.31.md

- 职责：《Proma v0.9.31》发布说明（29 行；:3 对比基准 v0.9.30）：以「界面与体验优化」为主（:5 起）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `07d9318d24083740fe98b25e9744c27130f4d0dd`；sourceSha256 `2815ad048d3784bce8d8867aad888827170cfba436a6091d9e370c581e0ca7d5`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**（头部实读）；明细一致性=**未知**。

## release-notes--v0.9.32.md

- 职责：《Proma v0.9.32》发布说明（31 行；:3 对比基准 v0.9.31）：以「预览与渲染修复」为主（:5 起，含 Windows 乱码/文件比对/Mermaid 换行符等修复，:16-:20）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `05adc069cc8787189e77aee1fe71aea4f97d3618`；sourceSha256 `fef27655db450a29033588fd679d4ea761f72bfc6f7acd280731da6997e9ee9b`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；明细一致性=**未知**。

## release-notes--v0.9.39.md

- 职责：《Proma v0.9.39》发布说明（63 行，本目录最长）：多主题版本公告；:50「Proactive Center 设计文档 — 新增 `docs/proactive-scheduler-monitor-design.md`……」；:19 记录 fork 会话保留 `.context/` 的行为口径。
- 消费：零引用（全树检索证实）；人类读者。反向关系：它消费 `docs/proactive-scheduler-monitor-design.md`（:50 提及）。
- 来源：版本发布说明；sourceBlob `2667d0c7f158b51d9cf2f70417fb1810d813a6b7`；sourceSha256 `0cbafbe2144c4191b8eecdf1bc2a3f5f99136c4bfd2e1c5c3ef4b6d1bc5265f2`。
- 打包：不进产物。
- 影响：删除→Proactive Center 发布口径与 fork `.context/` 行为记录丢失（proactive 文档回链失效）；对构建/运行无影响。
- 验证：核 :1/:19/:50、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；行为口径与实现一致性=**未知**。

## release-notes--v0.9.40.md

- 职责：《Proma v0.9.40》发布说明（41 行；:3 对比基准 v0.9.39）：聚焦长会话流畅度与启动稳定性（:5——跨 session 并发流式不相互拖累、编辑器/Tab/输入框流式卡顿削减、补强 v0.9.39 启动卡死边界）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `d2bca1bb930eea8e193733296ac08d87696a4da1`；sourceSha256 `ed566e3268971e089c643132eac14a9206ae045772abbe1e78e3f16246b4ed88`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；与代码一致性=**未知**。

## release-notes--v0.9.41.md

- 职责：《Proma v0.9.41》发布说明（29 行；:3 对比基准 v0.9.40）：v0.9.40 内存泄露热修复（:5——「按 sessionId 切片 atomFamily」优化引入的三处泄露路径联合修复）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `60f904b894efd2a703c20500da9bad57bb03b16b`；sourceSha256 `33dde16150db35f65d6dd4cd2c21bb84f95d8b6390b77443df733d4fdfdc2e12`。
- 打包：不进产物。
- 影响：删除→内存修复公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；修复技术细节=**未复核**。

## release-notes--v0.9.7.md

- 职责：《Proma v0.9.7》发布说明（47 行）：侧面板文件一键加入聊天（:5——hover 加入附件、`sourcePath` 原路径引用、新增 `READ_ATTACHED_FILE` 安全 IPC 通道含路径白名单/symlink 防绕过/20MB 限制）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `208c776830afc9f274508139196df48ec2eb9e0a`；sourceSha256 `6fef0a407a95cbe95c998968b7f8d137929e94a5ddd130e9c847ee54f90bdbc1`。
- 打包：不进产物。
- 影响：删除→安全 IPC 能力发布公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；`READ_ATTACHED_FILE` 现状=**未知**（未核 IPC 通道现状）。

## release-notes--v0.9.8.md

- 职责：《Proma v0.9.8》发布说明（19 行）：Agent 运行提速（:5——Claude Agent SDK 0.2.120 native binary 架构升级、工具调用上限 999）。
- 消费：零引用（全树检索证实）；人类读者。
- 来源：版本发布说明；sourceBlob `e0f8e2702708521ce7bb534b26b4fb9606618009`；sourceSha256 `62953496bedb741c5e8de7fb214093de45ac2f0f02527e13265faadf038148e1`。
- 打包：不进产物。
- 影响：删除→该版公告归档丢失；对构建/运行无影响。
- 验证：核 :1/:3/:5、hash；NOT_RUN。
- 证实/推断/未知：内容=**证实**；依赖升级细节=**未知**。
