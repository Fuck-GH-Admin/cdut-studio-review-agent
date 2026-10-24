# p01-app-shell__docs__assets 索引（docs/assets/screenshots 产品演示截图）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p01-app-shell__docs__assets`（owner `p01-app-shell`，family `docs/assets`）共 6 个文件（6 resource），七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

家族背景：`docs/assets/screenshots/` 是产品界面演示截图组（2026 年 Proma/Profer 时期命名并存）。**全组在冻结树内零引用**（grep `profer-main-demo|proma-agent-demo|proma-chat-demo|proma-mcp-demo|proma-skills-demo|proma-typeless-input|docs/assets/screenshots` 全树零命中，证实）——无代码/文档消费者，用途推测为对外宣传/网站素材（推断）。全组不进安装包（`electron-builder.yml:44-68` `files:`、`:70-122` `extraResources:` 均无 `docs/`）。以下逐文件；「打包」行均指此结论。

## docs--assets--screenshots--profer-main-demo.png

- 职责：产品主界面演示截图（PNG 2384x1565 RGBA，375746 字节，实读图像）：CDUT Studio 主窗口——左侧栏（Agent/Chat 切换、规划中心、Agent 技能 14、项目树：profer/默认工作区/团队工作区/个人网盘、已归档 237、积分面板 31.7 积分、用户「源来如此」）；右侧新 Agent 会话页（欢迎语「源来如此，早上好」、快捷键提示、Agent/Chat 切换、活跃度热力图、输入框占位「Enter 发送，Shift+Enter 换行，@ 引用文件，/ 调用 Skill，# 调用 MCP，& 引用会话」、模型选择 `deepseek-v4-flash`、Pi 等工具按钮）。
- 消费：无仓内消费者（全树检索零命中，证实）；推测用于官网/发布说明等对外展示（推断）。
- 来源：产品界面截图（团队截取）；`change=unchanged_since_093f`。sourceBlob `9033aacad65f8ffa6dfa04a59d2b6c2c5d300e2d`；sourceSha256 `b2fc6a7a62aaa5684ada8637631756e85598280a85502e02ccff58cc400fac5a`。
- 打包：不进产物（electron-builder.yml:44-68/:70-122 无 docs/）。
- 影响：删除对构建/运行无影响；损失主界面演示素材。
- 验证：①`file` 复核 2384x1565 RGBA PNG；②图像内容与上述描述一致（已实读）；③hash 一致；NOT_RUN（本轮统一 NOT_RUN）。
- 证实/推断/未知：尺寸格式/画面内容/零引用=**证实**（实读）；对外用途=**推断**；截图版本对应的产品版本=**未知**。

## docs--assets--screenshots--proma-agent-demo.png

- 职责：Agent 功能演示截图（PNG 2560x1340 RGBA，668528 字节）：文件名 `proma-agent-demo` 指向 Agent 会话/执行能力演示画面（画面内容=推断，本轮未逐像素查看）。
- 消费：无仓内消费者（全树检索零命中，证实）。
- 来源：产品界面截图（Proma 时期命名）；`change=unchanged_since_093f`。sourceBlob `4243e5b7b48817a56736295074ab3de38270c543`；sourceSha256 `0b4d93d2ffdf2ee4679a56ea07d688e4643b0eeb9025a87f1ce1ad586e8147cf`。
- 打包：不进产物。
- 影响：删除对构建/运行无影响；损失 Agent 演示素材。
- 验证：`file` 复核 2560x1340 RGBA PNG、hash 一致；NOT_RUN。
- 证实/推断/未知：格式尺寸/零引用=**证实**；画面内容=**推断**（文件名+同族规格）。

## docs--assets--screenshots--proma-chat-demo.png

- 职责：Chat 功能演示截图（PNG 2560x1340 RGBA，519082 字节）：文件名 `proma-chat-demo` 指向普通对话能力演示画面（画面内容=推断，未逐像素查看）。
- 消费：无仓内消费者（全树检索零命中，证实）。
- 来源：产品界面截图；`change=unchanged_since_093f`。sourceBlob `01320d2e86c7bac0c05958ef93fec1a4be9a7bfb`；sourceSha256 `d1ee59db8adc73225e1535ed8a600bf0854762cfab0c06cbce4fae9f0545c332`。
- 打包：不进产物。
- 影响：删除对构建/运行无影响；损失 Chat 演示素材。
- 验证：`file` 复核、hash 一致；NOT_RUN。
- 证实/推断/未知：格式尺寸/零引用=**证实**；画面内容=**推断**。

## docs--assets--screenshots--proma-mcp-demo.png

- 职责：MCP 调用能力演示截图（PNG 2560x1340 RGBA，490922 字节）：文件名 `proma-mcp-demo` 指向 MCP 工具调用演示画面（画面内容=推断，未逐像素查看）。
- 消费：无仓内消费者（全树检索零命中，证实）。
- 来源：产品界面截图；`change=unchanged_since_093f`。sourceBlob `59f283691082a7cdd07d1e92a810455b3b3028c4`；sourceSha256 `761599cb075591d3978427fc8b5ce6deb900f5471209b73cb638f3a81e6f4b4a`。
- 打包：不进产物。
- 影响：删除对构建/运行无影响；损失 MCP 演示素材。
- 验证：`file` 复核、hash 一致；NOT_RUN。
- 证实/推断/未知：格式尺寸/零引用=**证实**；画面内容=**推断**。

## docs--assets--screenshots--proma-skills-demo.png

- 职责：Skills 技能系统演示截图（PNG 2560x1340 RGBA，594701 字节）：文件名 `proma-skills-demo` 指向技能列表/调用演示画面（画面内容=推断，未逐像素查看）。
- 消费：无仓内消费者（全树检索零命中，证实）。
- 来源：产品界面截图；`change=unchanged_since_093f`。sourceBlob `6446017e440181a4e0c93bbcda00afce78232668`；sourceSha256 `10b5f1328f151e3eb4f54651e8ca203d6e62935a63af3041debe108a6c335189`。
- 打包：不进产物。
- 影响：删除对构建/运行无影响；损失 Skills 演示素材。
- 验证：`file` 复核、hash 一致；NOT_RUN。
- 证实/推断/未知：格式尺寸/零引用=**证实**；画面内容=**推断**。

## docs--assets--screenshots--proma-typeless-input.png

- 职责：语音输入（「Typeless Input」）演示截图（PNG 3456x2018 RGB，252750 字节，实读图像）：mac 窗口内「Proma 语音输入」悬浮听写卡片（状态「正在听写」、停止按钮、提示「Ctrl+~ 停止 · 外部写入光标 · Proma 激活时写入 Chat / Agent」、听写文案「Proma 也支持语音输入，并且支持在任意的光标内进行输入。如果是在 Proma 内使用的话，那么会自动输入到 Proma 的输入框」）。
- 消费：无仓内消费者（全树检索零命中，证实）。
- 来源：产品界面截图；`change=unchanged_since_093f`。sourceBlob `aec7cf252063289d8a267afaaaf18dd8053ddec5`；sourceSha256 `8195a7c90a596d4d6a9df5a563b632f421af6c55fd2d1a3f633e94341d8ac12b`。
- 打包：不进产物。
- 影响：删除对构建/运行无影响；损失语音输入演示素材。
- 验证：①`file` 复核 3456x2018 RGB PNG（扩展名与内容一致，无 JPEG 伪装）；②图像内容与描述一致（已实读）；③hash 一致；NOT_RUN。
- 证实/推断/未知：格式尺寸/画面内容/零引用=**证实**（实读）；对外用途=**推断**。
