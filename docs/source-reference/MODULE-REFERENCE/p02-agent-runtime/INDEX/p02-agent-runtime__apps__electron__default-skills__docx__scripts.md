# p02-agent-runtime__apps__electron__default-skills__docx__scripts 索引（docx 批注模板骨架五件套）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p02-agent-runtime__apps__electron__default-skills__docx__scripts`（owner `p02-agent-runtime`，family `apps/electron/default-skills/docx/scripts`）共 5 个文件，七项必填：职责 / 消费（真实加载点）/ 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。

## 家族背景（实读证实）

`apps/electron/default-skills/docx/scripts/templates/` 是 docx 技能「添加批注」流程的 **OOXML part 骨架模板五件套**：每个文件是一行 XML 声明 + 一行**空根元素（含全套命名空间声明与 `mc:Ignorable` 列表）**+ 一行闭合根，共 3 行。运行时消费者是同目录 `scripts/comment.py`（318 行）：

- **加载链（谁加载→何时生效）**：①打包——`apps/electron/electron-builder.yml:71-73` `extraResources: from: default-skills / to: default-skills / filter: **/*`，整个技能目录（含 scripts/templates）进 `process.resourcesPath/default-skills`；②主进程定位——`apps/electron/src/main/index.ts:940-941` `bundledGlobalSkillsDir = app.isPackaged ? join(process.resourcesPath,'default-skills') : join(__dirname,'../default-skills')` → `configureGlobalSkillSystem(...)`（:942）；③用户库——`skill-master-manager.ts:1-13` 把技能落到 `~/.cdutai/default-skills/{slug}/`（唯一编辑源）并同步到工作区 `skills/`；④会话注入——`agent-prompt-builder.ts:961-963` 系统提示声明「技能是含 SKILL.md 指令/脚本/资源的目录，相关任务必须先读 SKILL.md」，agent 运行 docx 技能时按 `docx/SKILL.md:429-433`（「Adding comments: Use `comment.py` to handle boilerplate across multiple XML files」）执行 `python scripts/comment.py unpacked/ 0 "…"`，`comment.py:22` `TEMPLATE_DIR = Path(__file__).parent / "templates"` 按脚本相对路径取模板。
- **行为约束**：`comment.py` 只在对应 part **不存在**时 `shutil.copy` 模板作初始 part，再用 `defusedxml.minidom` 解析并把生成的批注子元素 append 到模板根（`_append_xml` comment.py:91-101，写回前 `_encode_smart_quotes` 把弯引号转实体 :80-88）；首个批注还会登记 4 条 relationship（`_ensure_comment_relationships` :139-176）与 4 条 Content-Type Override（`_ensure_comment_content_types` :179-218）。模板根元素自带的命名空间声明（w/w14/w15/w16cid/w16cex/w16du/wp14/cr 等）即产物 part 的合法命名空间基底——删模板或改坏声明会直接产出非法 OOXML。
- **校验加载**：`docx/scripts/office/validators/base.py` 的 `SCHEMA_MAPPINGS`（:43-59）把 part 名映射到 XSD（commentsExtended/commentsIds/commentsExtensible/people → `microsoft/*`，comments.xml 走 `word/` 目录规则 :698-699 → `ISO-IEC29500-4_2016/wml.xsd`），经 `_get_schema_path`（:685-699）→ `_validate_single_file_xsd`（:751-761 `lxml.etree.XMLSchema`）校验；pptx/xlsx 技能各有字节相同的 validators 副本（实测 `validators/base.py` 三副本同映射）。
- **打包位置（共通）**：进产物——随 default-skills 整目录入 `extraResources`（electron-builder.yml:71-73），运行时路径 `process.resourcesPath/default-skills`（index.ts:940）。
- **来源（共通）**：随仓库引入的 docx 技能资源模板（`change=unchanged_since_093f`，锁列照录）；内容为 Microsoft Word 产出的 OOXML part 命名空间骨架（wpc/cx…w16du/wp14 等命名空间 URI 可证其为 Word 2010–2024 批注扩展命名空间组）。
- **验证方法（共通）**：①hash 对锁（MANIFEST 逐文件行）；②`grep -n "TEMPLATE_DIR / " comment.py` 核复制点行号；③实跑 `python scripts/comment.py unpacked/ 0 "…"` 后用 `python scripts/office/validate.py out.docx` 校验产物（本轮 NOT_RUN）。

## apps--electron--default-skills--docx--scripts--templates--comments.xml

- 职责：Word 批注主 part `word/comments.xml` 的**空根骨架**（`<w:comments>` + 全套命名空间声明 + `mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh w16sdtfl w16du wp14"`），是批注内容（`w:comment` 元素序列）的容器 part 模板。
- 消费（真实加载点）：`apps/electron/default-skills/docx/scripts/comment.py:233-235`——首个批注时 `comments` 不存在则 `shutil.copy(TEMPLATE_DIR / "comments.xml", comments)`，随后 `:236-247` `_append_xml(comments, "w:comments", COMMENT_XML…)` 追加 `w:comment`（含 w14:paraId/文本/annotationRef），并 `:236-237` 触发 relationship 与 Content-Type 登记。校验加载：`validators/base.py:698-699`（父目录 `word` 命中 `SCHEMA_MAPPINGS["word"]`→`ISO-IEC29500-4_2016/wml.xsd`）。
- 来源与 hash：随仓库引入的 docx 技能资源模板，`change=unchanged_since_093f`；sourceBlob `cd01a7d7155f9a78cf3d11470e2ce2b5ccdac640`；sourceSha256 `a08ba83ee8790ac9e3dc61921f4988f19edd7e06ac09d6f1897a877c1581818d`；2603 字节 3 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`；运行时经 `index.ts:940-941` 定位。
- 影响：删除→`comment.py:234` 复制失败，docx 技能批注功能首跑即报错；改坏命名空间/根元素→产出非法 `word/comments.xml`，Word 打开报修复或批注丢失，且 `validate.py` 校验失败（`sys.exit(1)`）。
- 验证：①`grep -n 'TEMPLATE_DIR / "comments.xml"' comment.py` 应命中 :234；②3 行骨架含 `w:comments` 根与 `mc:Ignorable`；③hash 对锁；实跑 comment.py+validate.py（NOT_RUN）。
- 证实/推断/未知：复制点与追加逻辑=**证实**（comment.py:233-247 实读）；「Word 产出命名空间骨架」=**推断**（命名空间 URI 序列吻合 Word 2010–2024 批注扩展，无厂商声明文件）；模板最初引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--templates--commentsExtended.xml

- 职责：Word 2013+ 批注扩展 part `word/commentsExtended.xml` 的空根骨架（`<w15:commentsEx>` + 命名空间组），承载批注**回复父子关系**（`w15:commentEx/@w15:paraIdParent`）与**已解决状态**（`@w15:done`）。
- 消费（真实加载点）：`comment.py:252-254` 不存在则 `shutil.copy(TEMPLATE_DIR / "commentsExtended.xml", ext)`；`:255-269` 追加 `w15:commentEx`——回复时用 `_find_para_id`（:104-111）取父批注 paraId 写 `paraIdParent`（父不存在则返回错误 :258-260），普通批注写 `done="0"`。校验加载：`validators/base.py:55` `SCHEMA_MAPPINGS["commentsExtended.xml"] → microsoft/wml-2012.xsd`（按文件名映射优先于 `word/` 目录规则，:686-687）。
- 来源与 hash：随仓库引入的 docx 技能资源模板，`change=unchanged_since_093f`；sourceBlob `411003cc485356c560e29687ca359d64cd89d4b4`；sourceSha256 `544eeecfeceed4b468fff163cd9c366d33641c8b8ab691ce002576197846afe8`；2611 字节 3 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`。
- 影响：删除→`comment.py:253` 复制失败，回复链（--parent）无法落盘；改坏根元素→Word 中批注线程/已解决状态丢失，validate.py 报错退出 1。
- 验证：①`grep -n 'commentsExtended.xml' comment.py` 命中 :252-254 复制、:255-269 追加；②根元素为 `w15:commentsEx`；③hash 对锁；实跑 `comment.py … --parent` 后 validate.py（NOT_RUN）。
- 证实/推断/未知：复制/追加/父子关系逻辑=**证实**（comment.py:252-269 实读）；`w15:done` 语义（已解决标记）=**推断**（命名空间惯例，脚本恒写 "0" 未消费已解决态）；引入 commit=**未知**。

## apps--electron--default-skills--docx--scripts--templates--commentsExtensible.xml

- 职责：Word 2019+ 批注可扩展 part `word/commentsExtensible.xml` 的空根骨架（`<w16cex:commentsExtensible>`，`mc:Ignorable` 额外含 `cr`——comments reactions 命名空间），承载每条批注的 **durableId 与 UTC 时间戳**（`w16cex:commentExtensible`）。
- 消费（真实加载点）：`comment.py:280-282` 不存在则 `shutil.copy(TEMPLATE_DIR / "commentsExtensible.xml", extensible)`；`:283-287` 追加 `w16cex:commentExtensible w16cex:durableId="{durable_id}" w16cex:dateUtc="{ts}"`（durable_id 为 `_generate_hex_id()` :73-74 与 commentsIds 共用）。校验加载：`validators/base.py:54` `SCHEMA_MAPPINGS["commentsExtensible.xml"] → microsoft/wml-cex-2018.xsd`。
- 来源与 hash：随仓库引入的 docx 技能资源模板，`change=unchanged_since_093f`；sourceBlob `f5572d710826dd7a1f455af7487e2157ef01ada0`；sourceSha256 `bad10b3283e6ad6e7ef6d1ca5169683721ed690ee331282c65df04017e080631`；2707 字节 3 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`。
- 影响：删除→`comment.py:281` 复制失败、现代 Word 批注元数据缺失；改坏根元素→durableId/时间戳 part 非法，validate.py 退出 1。
- 验证：①`grep -n 'commentsExtensible.xml' comment.py` 命中 :280-287；②根元素 `w16cex:commentsExtensible` 且 Ignorable 含 `cr`；③hash 对锁；实跑 comment.py+validate.py（NOT_RUN）。
- 证实/推断/未知：复制/追加/durableId 共用=**证实**（comment.py:73-74/:280-287 实读）；durableId 与 commentsIds 的跨 part 一致性约束=**推断**（同变量同值，实测于代码）；引入 commit=**未知**。

## apps--electron--default-skills--docx--scripts--templates--commentsIds.xml

- 职责：Word 2016+ 批注持久 ID part `word/commentsIds.xml` 的空根骨架（`<w16cid:commentsIds>`），维护 **paraId → durableId** 映射（`w16cid:commentId`），供现代 Word 在批注迁移/合并后稳定识别批注。
- 消费（真实加载点）：`comment.py:271-273` 不存在则 `shutil.copy(TEMPLATE_DIR / "commentsIds.xml", ids)`；`:274-278` 追加 `w16cid:commentId w16cid:paraId="{para_id}" w16cid:durableId="{durable_id}"`。校验加载：`validators/base.py:53` `SCHEMA_MAPPINGS["commentsIds.xml"] → microsoft/wml-cid-2016.xsd`。
- 来源与 hash：随仓库引入的 docx 技能资源模板，`change=unchanged_since_093f`；sourceBlob `32f1629f2a8bb9aafebb0699349d0d799edce9f3`；sourceSha256 `db20f9616e004ec42ef736e80c2384e45db0f8d1194d31dc8b37c7d6ecdd6420`；2619 字节 3 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`。
- 影响：删除→`comment.py:272` 复制失败、批注持久 ID 缺失（Word 新版可能丢批注归属）；改坏根元素→validate.py 退出 1。
- 验证：①`grep -n 'commentsIds.xml' comment.py` 命中 :271-278；②根元素 `w16cid:commentsIds`；③hash 对锁；实跑 comment.py+validate.py（NOT_RUN）。
- 证实/推断/未知：复制/追加/paraId↔durableId 映射=**证实**（comment.py:271-278 实读）；「Word 迁移后稳定识别」用途=**推断**（命名空间/字段语义惯例）；引入 commit=**未知**。

## apps--electron--default-skills--docx--scripts--templates--people.xml

- 职责：Word 2013+ 批注「人员」part `word/people.xml` 的空根骨架（`<w15:people xmlns:w15="…/word/2012/wordml">`，仅 115 字节、命名空间最小集），预留现代批注的人员/身份容器。
- 消费（真实加载点）：**运行时复制点未知**——`comment.py` 全文（318 行）不引用 people.xml（实读确认其只 copy comments/commentsExtended/commentsIds/commentsExtensible 四件）；全树检索（`grep -rn "people" apps/`，.py/.ts/.md/.js）除 `validators/base.py:52` 映射行外零命中。当前唯一消费者是**校验映射**：`docx/scripts/office/validators/base.py:52` `SCHEMA_MAPPINGS["people.xml"] → microsoft/wml-2012.xsd`（pptx/xlsx 技能 validators 副本同），即一旦解包目录出现 `word/people.xml` 会按 wml-2012.xsd 校验。
- 来源与 hash：随仓库引入的 docx 技能资源模板，`change=unchanged_since_093f`；sourceBlob `3803d2de0faa635687a48947b52ab98b9655f631`；sourceSha256 `056f63aa1197fd8c9dda980c9f1b9ff016fd5fa4a462df8aec5f384f39d23e37`；115 字节 3 行。
- 打包：进产物——`electron-builder.yml:71-73` extraResources `default-skills/**/*`（随模板目录整体入包，虽无运行时复制点）。
- 影响：删除→当前批注流程无可见影响（无复制点），但 validators 映射变悬空、未来如实现 people part 将无骨架；改坏根元素→若出现 people.xml 校验即失败。**不接受"资源/无逻辑"一句带过**：其语义位置（Word 现代批注人员容器）与校验映射如上，运行时消费者缺失已如实登记。
- 验证：①`grep -rn "people" apps/` 复核零复制点（检索范围 .py/.ts/.md/.js）；②根元素 `w15:people`；③hash 对锁；如需完整验证须实测带 people part 的 docx 校验（NOT_RUN）。
- 证实/推断/未知：校验映射=**证实**（validators/base.py:52 实读）；「无运行时复制点」=**负向检索证实**（全树 grep 如上口径）；people part 的预期写入方=**未知**（查过 comment.py 全文、docx/SKILL.md 全文、apps/ 全树检索，均无写入方；可能为预留骨架或上游模板残留）。
