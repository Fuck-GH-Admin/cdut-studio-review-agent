# p02-agent-runtime__vendor-xsd__mce — vendor XSD 家族索引（Markup Compatibility 2006 最小 XSD × docx/pptx/xlsx 三副本）

> 冻结源只读：`baseline/source` @ git HEAD `05fb2565e20eb1760233696be1832f68196b37c2`（本轮实测 `git rev-parse HEAD` 相符、tree clean）。范围 3 文件（1 家族 × 3 副本）。本轮产品运行统一 **NOT_RUN**。以下结论均由本作者独立 grep/read/sha256sum 核实，`inventory/INDEX-FACTS.tsv` 仅作线索未采信进正文。

**家族总述**（按合同置于各文件 `##` 节之前）：

- **家族是什么**：Markup Compatibility and Extensibility 2006 的最小 XSD——`mc.xsd`（`apps/electron/default-skills/{docx,pptx,xlsx}/scripts/office/schemas/mce/mc.xsd`），targetNamespace `http://schemas.openxmlformats.org/markup-compatibility/2006`（mc.xsd:2-5）。内容为 `mc:Ignorable`（:28）/`mc:MustUnderstand`（:31）/`mc:ProcessContent`（:32）三属性与 `AlternateContent`/`Choice`/`Fallback` 元素模型（:37-74，含注释 :34-36/:66-69 引 ECMA-376 语义）。
- **来源注释（实读 XSD 头部，mc.xsd:7-25）**：明示「This XSD is a modified version of the one found at: `https://github.com/plutext/docx4j/blob/master/xsd/mce/markup-compatibility-2006-MINIMAL.xsd`」（:8-9）；两个目标——round tripping `@mc:Ignorable`（:13，示例 :15-18）、使 AlternateContent 可在特定元素中被操作（:20-21）；注明见 **ECMA-376, 4th Edition, Part 3: Markup Compatibility and Extensibility**（:23-24）。
- **三副本映射（自己 sha256sum 实测）**：`apps/electron/default-skills/{docx,pptx,xlsx}/scripts/office/schemas/mce/mc.xsd` 三处落盘，**三副本逐字节相同**：sha256 均为 `3a37e461ecf5a8670fdec34029703401f8728ab9c96ec1739a6ae58d55212413`（3127B/75L）；`git hash-object` 均为 `ef725457cf39116672e285d021be69b7ad022574`（=manifest sourceBlob）。与 `inventory/INDEX-SCOPE-LOCK.json` 本 group manifest 逐一相符。
- **校验加载映射（xs:import 链，实测）**：
  - **唯一直接入口**：`schemas/ISO-IEC29500-4_2016/wml.xsd:12` `<xsd:import namespace="http://schemas.openxmlformats.org/markup-compatibility/2006" schemaLocation="../mce/mc.xsd"/>`——docx/pptx/xlsx 三树各自的 `wml.xsd:12` 均如此（逐一 grep 核实）。`wml.xsd:3631` `<xsd:attribute ref="mc:Ignorable" use="optional"/>` 消费 mc.xsd:28 定义的属性。全程 **xs:import + 相对 schemaLocation，零 xs:include**（全量 grep 核实；与 QA 勘误 IDX-QA-E02-N-02 口径一致，不照抄合同概称）。
  - **实测更正预读线索**：`pml.xsd`（:10-15 仅三条 xs:import：shared-relationshipReference / dml-main / shared-commonSimpleTypes）与 `sml.xsd`（:9-15 仅三条：shared-relationshipReference / shared-commonSimpleTypes / dml-spreadsheetDrawing）**均不 import mc.xsd**——「pml/sml 同机制」不成立。
  - **传递到达者**（经 wml.xsd 间接加载 mc.xsd）：`microsoft/wml-2010.xsd:3`、`wml-2012.xsd:2`、`wml-2018.xsd:2`、`wml-cid-2016.xsd:2`、`wml-cex-2018.xsd:3`、`wml-sdtdatahash-2020.xsd:2`、`wml-symex-2015.xsd:2`（均 `../ISO-IEC29500-4_2016/wml.xsd`）、`dml-wordprocessingDrawing.xsd:12`（`wml.xsd`）、`shared-math.xsd:9-10`（`wml.xsd`）等。
  - mc.xsd **不在** `SCHEMA_MAPPINGS` 值内（base.py:43-59 全文核实），是被主 schema import 的依赖。主 schema 映射触发编译：`"word"→wml.xsd`（base.py:44）、`"people.xml"→microsoft/wml-2012.xsd`（:52）、`"commentsIds.xml"→microsoft/wml-cid-2016.xsd`（:53）、`"commentsExtensible.xml"→microsoft/wml-cex-2018.xsd`（:54）、`"commentsExtended.xml"→microsoft/wml-2012.xsd`（:55）等。
  - 代码侧 MC 处理：`MC_NAMESPACE` 常量 `base.py:61`；`_preprocess_for_mc_ignorable` `base.py:742-748`（校验前删除根元素 `mc:Ignorable` 属性，于 `_validate_single_file_xsd` :767 调用）。解析/编译链同 ecma 组：`schemas_dir`（`base.py:99`）→ `_get_schema_path`（:685-701）→ `_validate_single_file_xsd`（:750-785，:761 XMLSchema 编译）。
  - pptx/xlsx 侧同样有 validators 副本（与 docx 侧 sha256 全等 `d6358b67252df4dbfe4fa6647423a765960c949346ef6a8c4eb8722bb1108d25`，行号同）：`apps/electron/default-skills/pptx/scripts/office/validators/base.py:61/:99/:685/:742/:750/:761/:767`、`apps/electron/default-skills/xlsx/scripts/office/validators/base.py:61/:99/:685/:742/:750/:761/:767`。
- **失败影响（`validate.py` 真实退出路径；三副本 sha256 全等 `1aef24f8e316965a0584c30859776bd2c82a9fb69f72d79cfed041119cf95514`）**：
  - **XSD 校验失败真实退出码**：`validate.py:102` `success = all(v.validate() …)` → `:107` `sys.exit(0 if success else 1)`，退出码 **1（:107）**。mc.xsd 缺失/损坏的具体路径：wml.xsd:12 import 解析失败或 wml.xsd:3631 ref 解析失败 → wml.xsd 编译抛异常 → `_validate_single_file_xsd` :761 失败、由 :784-785 捕获转为文件级错误 → `validate_against_xsd` :675-679 `FAILED` 返回 False → validator.validate() False（docx.py:41-42 / pptx.py:48）→ :102/:107 退出 1。
  - 预读/合同口径的 `:95 sys.exit(1)` 实测为 `match` 的 `case _` 兜底（:93-95，"Validation not supported for file type …"），**不是** XSD 校验失败路径；且 `.xlsx` 实测也落该分支（match 仅 `.docx`（:81）/`.pptx`（:89）；validate.py/pack.py 只装配 DOCX/PPTX validator；pack.py `_run_validation` :78-94 其余后缀静默 `return True, None`）。assert（:56/:61/:63/:67/:77）抛 AssertionError 退出 1。

## apps--electron--default-skills--docx--scripts--office--schemas--mce--mc.xsd

- **职责**：docx 份 mc.xsd——Markup Compatibility 2006 最小 schema：`mc:Ignorable`/`mc:MustUnderstand`/`mc:ProcessContent` 属性（:28-32）+ `AlternateContent`/`Choice`/`Fallback` 元素模型（:37-74），供主 schema 引用以容忍/回绕扩展属性（自身注释 :13/:20-21）。
- **真实加载或消费者**：`apps/electron/default-skills/docx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd:12` xs:import（`schemaLocation="../mce/mc.xsd"`）+ `wml.xsd:3631` `attribute ref="mc:Ignorable"`；传递：`microsoft/wml-2010.xsd:3`、`wml-2012.xsd:2`、`wml-2018.xsd:2`、`wml-cid-2016.xsd:2`、`wml-cex-2018.xsd:3`、`wml-sdtdatahash-2020.xsd:2`、`wml-symex-2015.xsd:2`、`dml-wordprocessingDrawing.xsd:12`、`shared-math.xsd:9-10` 经 wml.xsd 到达；触发点 `docx/scripts/office/validators/base.py:44`（"word"→wml.xsd）、:52-55（microsoft 映射）编译时加载；代码级 MC 处理 `base.py:61`/:742-748（:767 调用）。本文件不在 SCHEMA_MAPPINGS（:43-59 核实）；pml.xsd/sml.xsd 实测不 import 本文件。
- **来源与 hash**：头部注释 mc.xsd:7-25（docx4j `markup-compatibility-2006-MINIMAL.xsd` 修改版 :8-9；ECMA-376 4th Ed. Part 3 :23-24）。sourceBlob=`ef725457cf39116672e285d021be69b7ad022574`、sourceSha256=`3a37e461ecf5a8670fdec34029703401f8728ab9c96ec1739a6ae58d55212413`（INDEX-SCOPE-LOCK.json manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（另两份逐字节相同，3127B/75L）：`apps/electron/default-skills/pptx/scripts/office/schemas/mce/mc.xsd`、`apps/electron/default-skills/xlsx/scripts/office/schemas/mce/mc.xsd`。
- **打包位置**：随 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills` → `to: default-skills`，filter `**/*`，含 schemas 树）；打包后在 `process.resourcesPath/default-skills`（`apps/electron/src/main/lib/config-paths.ts:770-776`），`seedDefaultSkills`（config-paths.ts:956 起）同步到 `~/.cdutai/default-skills/`（`getDefaultSkillsDir` :566-574；:5/:71 实证 `~/.cdutai`）。electron-builder.yml:71 注释写 `~/.proma`，按 QA 勘误 IDX-QA-E02-N-01 以代码为准。
- **修改影响（含失败影响）**：缺失/损坏 → wml.xsd:12 import 或 wml.xsd:3631 ref 解析失败 → wml.xsd 编译抛异常 → base.py:784-785 捕获 → `validate.py:102/:107` **退出码 1**。影响面：`SCHEMA_MAPPINGS` "word"（:44）及 microsoft/wml-* 映射（:52-55）覆盖的全部 XML 校验（word/document.xml、people.xml、commentsIds.xml 等）；pml.xsd/sml.xsd 路径**不受直接**影响（实测无 import）。三副本任一缺失只影响对应 skill 目录。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `wml.xsd:12` import 与全树 xs:import 清点；跑 `python scripts/office/validate.py doc.docx` 校验带 `mc:Ignorable` 的样例包（本轮 NOT_RUN）。
- **证实·推断·未知**：注释/行号/加载链/pml-sml 不 import=**证实**（源码实读+grep）；「缺失→编译异常→退出 1」链=**证实**（代码路径实读）；lxml 对 ref 解析失败的实际报错文本=**未知**（NOT_RUN）。

## apps--electron--default-skills--pptx--scripts--office--schemas--mce--mc.xsd

- **职责**：pptx 份 mc.xsd——内容与 docx 份逐字节相同的 Markup Compatibility 2006 最小 schema（mc:Ignorable/MustUnderstand/ProcessContent 属性 :28-32 + AlternateContent/Choice/Fallback :37-74）。
- **真实加载或消费者**：`apps/electron/default-skills/pptx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd:12` xs:import（`../mce/mc.xsd`）+ `wml.xsd:3631` `attribute ref="mc:Ignorable"`；传递 import 同 docx 树（该树内 `microsoft/wml-*.xsd:2-3`、`dml-wordprocessingDrawing.xsd:12`、`shared-math.xsd:9-10` 等经 wml.xsd 到达）。触发点 `pptx/scripts/office/validators/base.py:44`/:52-55；MC 处理 `base.py:61`/:742-748（:767 调用）。本文件不在 SCHEMA_MAPPINGS（pptx 侧 base.py:43-59 核实）；该树 pml.xsd（:10-15）/sml.xsd（:9-15）实测不 import 本文件。
- **来源与 hash**：头部注释 mc.xsd:7-25（docx4j markup-compatibility-2006-MINIMAL.xsd 修改版；ECMA-376 4th Ed. Part 3）。sourceBlob=`ef725457cf39116672e285d021be69b7ad022574`、sourceSha256=`3a37e461ecf5a8670fdec34029703401f8728ab9c96ec1739a6ae58d55212413`（manifest 取值，实测一致）。三副本映射（另两份逐字节相同，3127B/75L）：`apps/electron/default-skills/docx/scripts/office/schemas/mce/mc.xsd`、`apps/electron/default-skills/xlsx/scripts/office/schemas/mce/mc.xsd`。
- **打包位置**：随 pptx skill 的 default-skills 目录打包——electron-builder.yml:70-75（`from: default-skills` → `to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（config-paths.ts:770-776）→ `seedDefaultSkills`（:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：缺失/损坏 → 该树 wml.xsd 编译失败 → base.py:784-785 捕获 → `validate.py:102/:107` **退出码 1**；影响 pptx skill 内经 wml.xsd/microsoft/wml-* 的校验（含 commentsIds.xml 等映射 :52-55），pml.xsd/sml.xsd 主 schema 校验不受直接牵连（实测无 import）。
- **验证方法**：sha256sum 三副本比对 + git hash-object；grep 该树 `wml.xsd:12`/pml/sml import 清单；跑 pptx 侧 validate.py（NOT_RUN）。
- **证实·推断·未知**：加载链/行号/不 import 结论=**证实**；失败链=**证实**（代码路径实读）；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--mce--mc.xsd

- **职责**：xlsx 份 mc.xsd——内容与 docx/pptx 份逐字节相同的 Markup Compatibility 2006 最小 schema（属性 :28-32 + AlternateContent/Choice/Fallback :37-74）。
- **真实加载或消费者**：`apps/electron/default-skills/xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd:12` xs:import（`../mce/mc.xsd`）+ `wml.xsd:3631` `attribute ref="mc:Ignorable"`；传递 import 同该树 `microsoft/wml-*.xsd:2-3`、`dml-wordprocessingDrawing.xsd:12`、`shared-math.xsd:9-10`。触发点 `xlsx/scripts/office/validators/base.py:44`/:52-55；MC 处理 `base.py:61`/:742-748（:767 调用）。本文件不在 SCHEMA_MAPPINGS（xlsx 侧 base.py:43-59 核实）；该树 pml.xsd/sml.xsd 实测不 import 本文件。**注意**：xlsx 的 `validate.py` 实测未装配 XLSX validator（match 无 `.xlsx` case，落 :93-95 兜底退出 1；pack.py :78-94 对 .xlsx 静默跳过校验），故本文件在 xlsx 树中实际被 XMLSchema 编译加载的运行时路径=**未运行确认（NOT_RUN）**；静态加载链如上。
- **来源与 hash**：头部注释 mc.xsd:7-25（docx4j markup-compatibility-2006-MINIMAL.xsd 修改版；ECMA-376 4th Ed. Part 3）。sourceBlob=`ef725457cf39116672e285d021be69b7ad022574`、sourceSha256=`3a37e461ecf5a8670fdec34029703401f8728ab9c96ec1739a6ae58d55212413`（manifest 取值，实测一致）。三副本映射（另两份逐字节相同，3127B/75L）：`apps/electron/default-skills/docx/scripts/office/schemas/mce/mc.xsd`、`apps/electron/default-skills/pptx/scripts/office/schemas/mce/mc.xsd`。
- **打包位置**：随 xlsx skill 的 default-skills 目录打包——electron-builder.yml:70-75（`from: default-skills` → `to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（config-paths.ts:770-776）→ `seedDefaultSkills`（:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准）。
- **修改影响（含失败影响）**：缺失/损坏 → 该树 wml.xsd:12 import 解析失败 → wml.xsd 编译抛异常 → base.py:784-785 捕获 → 若有校验入口运行则 `validate.py:102/:107` **退出码 1**；但因 xlsx 树 validate.py 未装配 XLSX validator（实测 :80-95），缺失本文件对现行 xlsx CLI 行为的净影响=**推断为无**（CLI 不进入 XSD 校验链），潜在影响在 DOCX/PPTX 类文档经本树脚本校验或未来接入 XLSX validator 时显现。
- **验证方法**：sha256sum 三副本比对 + git hash-object；grep 该树 wml/pml/sml import 清单与 validate.py 分支；跑 xlsx 侧 validate.py 验证兜底行为（NOT_RUN）。
- **证实·推断·未知**：加载链/行号/分支缺失=**证实**（源码实读）；「缺失净影响为无」=**推断**（基于 CLI 未接线，运行 NOT_RUN）；未来是否接入 XLSX validator=**未知**。

## 未运行 / 未知

**未运行（本轮产品运行统一 NOT_RUN）**：
- 未执行 `validate.py`/`pack.py` 全流程、未实际运行 lxml XMLSchema 编译（含 wml.xsd→mc.xsd import 的真实解析）与样例包校验；文中退出码/失败链为源码实读结论。
- 未运行 electron 打包与 `seedDefaultSkills` 同步；打包路径为配置+代码实读结论。
- validate.py 对 `.xlsx` 落 `case _` 兜底（:93-95）、pack.py 对 .xlsx 静默跳过校验（:93-94）均为代码实读结论，未运行验证。

**未知（均已注明查过什么）**：
1. mc.xsd 的修改版相对 docx4j 原版的具体差异清单：注释只说「modified version」（mc.xsd:8），未列 diff；查过：mc.xsd 全文（75 行）。
2. lxml 对 `wml.xsd:3631` `mc:Ignorable` ref 解析失败（mc.xsd 缺失/损坏时）的实际报错文本与是否被 `IGNORED_VALIDATION_ERRORS`（base.py:14-17）部分吸收：本轮 NOT_RUN，行为未知。
3. xlsx 树未来是否接入 XLSX validator（当前 validate.py/pack.py/validators/__init__.py 均无 XLSX 装配）：未发现计划性注释/文档；查过：xlsx/scripts/office 全目录、SKILL.md、packaging-guards 测试。
4. 三副本 `mce/` 目录是否存在生成/同步脚本（还是手工复制）：未发现；查过：default-skills 全树脚本（*.py/*.ts/*.sh）与打包配置。
