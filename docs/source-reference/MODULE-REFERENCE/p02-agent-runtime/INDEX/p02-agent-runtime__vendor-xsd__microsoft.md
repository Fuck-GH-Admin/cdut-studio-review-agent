# p02-agent-runtime__vendor-xsd__microsoft 索引（Microsoft WML 扩展 XSD 家族，21 个 vendor 文件）

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`（HEAD 已核、clean 已核）。
本篇覆盖 group `p02-agent-runtime__vendor-xsd__microsoft`（owner `p02-agent-runtime`，family `vendor-xsd/microsoft`）共 21 个 vendor 文件＝7 个 Microsoft WordprocessingML 扩展 XSD × 3 份技能副本（docx/pptx/xlsx）。按合同以「家族说明 + 每文件三副本映射 / 校验加载映射 / 失败影响」组织，不逐份重复手册；每文件仍含七项必填：职责 / 消费 / 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知。运行验证本轮统一 NOT_RUN。

## 家族说明：microsoft/wml（实读证实）

- **成员与命名空间**（各文件 :1 `targetNamespace`）：`wml-2010.xsd`→`schemas.microsoft.com/office/word/2010/wordml`（W14，560 行）；`wml-2012.xsd`→`…/word/2012/wordml`（W15，67 行）；`wml-2018.xsd`→`…/word/2018/wordml`（W16，14 行）；`wml-cex-2018.xsd`→`…/word/2018/wordml/cex`（20 行）；`wml-cid-2016.xsd`→`…/word/2016/wordml/cid`（13 行）；`wml-sdtdatahash-2020.xsd`→`…/word/2020/wordml/sdtdatahash`（4 行）；`wml-symex-2015.xsd`→`…/word/2015/wordml/symex`（8 行）。内容为 Word 批注/人员/SDT/符号等扩展部件的结构定义。
- **三副本映射**：`apps/electron/default-skills/{docx,pptx,xlsx}/scripts/office/schemas/microsoft/` 各一份完整 7 文件；实测三副本逐字节相同（每个文件 3 份 sha256 逐一相等，见逐文件条目）。运行时**每技能只消费自己那份**：`validators/base.py:99` `self.schemas_dir = Path(__file__).parent.parent / "schemas"` 按相对路径解析到本技能本地副本（docx/pptx/xlsx 三份 base.py 逐字节相同，行号通用）。
- **校验加载映射**：注册表 `SCHEMA_MAPPINGS`（`validators/base.py:43-59`）按**部件文件名**映射到 schema（与 docx/pptx/xlsx 类型无关）：`base.py:52` `people.xml → microsoft/wml-2012.xsd`；`base.py:53` `commentsIds.xml → microsoft/wml-cid-2016.xsd`；`base.py:54` `commentsExtensible.xml → microsoft/wml-cex-2018.xsd`；`base.py:55` `commentsExtended.xml → microsoft/wml-2012.xsd`（其余映射指向 ISO-IEC29500-4_2016/ecma 家族）。解析在 `_get_schema_path`（`base.py:685-699`），加载编译在 `_validate_single_file_xsd`（`base.py:750-761`：:756 打开 XSD、:758-759 `lxml.etree.parse(..., base_url=str(schema_path))` 使 `xs:import` 相对本文件目录解析、:761 `lxml.etree.XMLSchema(xsd_doc)` 编译）。族内导入边：全部 7 个文件 `xs:import` ISO 核心 `../ISO-IEC29500-4_2016/wml.xsd`（wml-2010.xsd:3、wml-2012.xsd:2、wml-2018.xsd:2、wml-cid-2016.xsd:2、wml-sdtdatahash-2020.xsd:2、wml-symex-2015.xsd:2、wml-cex-2018.xsd:3）；`wml-2012.xsd:3`、`wml-cex-2018.xsd:4` 另导入 `shared-commonSimpleTypes.xsd`；**族内唯一边** `wml-cex-2018.xsd:2` → `wml-2018.xsd`。反向无边：ISO/ecma/mce 家族无任何 `xs:include/xs:import/schemaLocation` 指向 `microsoft/`（检索已核）。运行时可达＝wml-2012、wml-cid-2016、wml-cex-2018（经 cex 拉起 wml-2018）；**休眠**＝wml-2010、wml-sdtdatahash-2020、wml-symex-2015（全仓文件名与 schemaLocation 检索零引用，见逐文件否定结论）。
- **失败影响**：`validate.py:102` `success = all(v.validate() for v in validators)` → `validate.py:107` `sys.exit(0 if success else 1)`（schema 校验失败以退出码 1 失败；:95 的 `sys.exit(1)` 仅用于不支持的文件类型）。错误统计：`base.py:779-782` 收集 `schema.error_log`，`base.py:611-619` 取「原件已有的错误」差集并过滤 `IGNORED_VALIDATION_ERRORS`（`base.py:14-17`）后只报**新增**错误，`base.py:676-679` 打印 `FAILED - Found NEW validation errors:` 并返回 False。触发链：docx/SKILL.md:78 创建后必跑 `python scripts/office/validate.py`，失败按 docx/SKILL.md:76 unpack/fix/repack 循环；`pptx.py:48`/`docx.py:41` 均调用 `validate_against_xsd`（`docx.py:16`/`pptx.py:10` 继承 `BaseSchemaValidator`，无子类覆盖 SCHEMA_MAPPINGS）。注意 `xlsx/scripts/office/validate.py:93-95` 对 `.xlsx` 显式不支持（`case _` →「Validation not supported」`sys.exit(1)`），且 xlsx/SKILL.md 全文不引用 scripts/office（已核）——xlsx 副本无校验入口。
- **来源与许可**：各文件 :1 即 `<xsd:schema …>`，无版权/版本/发布者注释（7/7 实读）；发布者按命名空间惯例推断为 Microsoft 发布的 WordprocessingML 扩展 schema；目录内无 README/LICENSE（已核）。对比：同级 `mce/mc.xsd:9-10` 明确标注 plutext/docx4j 出处、`ISO-IEC29500-4_2016/wml.xsd:1-12` 无出处注释。上游具体版本=未知。
- **打包**：随 `default-skills/` 整体进产物（`electron-builder.yml:69-75` `extraResources`，`filter: **/*`），三副本均随包；`packaging-guards.test.ts:382-385` 文件数守卫（≥200，注释 :383「历史上包含全套 schemas 时约 240 个文件」）间接覆盖。TS 代码零消费（检索范围 apps/electron/src 与 packages/：仅 `document-parser.test.ts:25` 等测试夹具出现命名空间 URI 字符串，无 XSD 加载点）。

## docx 副本（`apps/electron/default-skills/docx/scripts/office/schemas/microsoft/`）

## apps--electron--default-skills--docx--scripts--office--schemas--microsoft--wml-2010.xsd

- 职责：Microsoft Word 2010 WordprocessingML 扩展（W14，`…/word/2010/wordml`）vendor XSD——定义 docId/conflictMode（:20-21）、修订冲突标记 customXmlConflict*Range（:28-31）、颜色/渐变扩展模型（tint/shade/alpha/hueMod 等 :140-192）；本行为 docx 技能副本。
- 消费：三副本映射＝docx/pptx/xlsx 三份逐字节相同（实测同 sha256）；校验加载映射＝**无**——不在 SCHEMA_MAPPINGS（base.py:43-58）、无任何 `xs:import` 引用（全仓 schemaLocation/文件名检索零命中）＝运行时不可达（休眠 vendor 存档）；W14 命名空间被 `docx.py:19` `W14_NAMESPACE` 常量使用（paraId，docx.py:256）但不加载本 XSD。失败影响＝休眠，不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者按命名空间惯例=推断；:1 无版权注释=证实）；sourceBlob `f65f777730d82162f4248f03c703b1b85fda5fe2`；sourceSha256 `568b26ee156cb9549aa439ca2158965f77b7c1602b7e0316f40ac6cf586e35f2`；change=unchanged_since_093f。
- 打包：进产物——随 default-skills extraResources（electron-builder.yml:71-75）。
- 影响：删除/改动→运行时校验无影响（零引用，证实）；但 vendor 集不完整、packaging-guards.test.ts:384 文件数守卫计数下降（推断）。
- 验证：①三副本 sha256 相等（已核）；②grep `wml-2010` 全仓仅三副本目录命中（已核）；③lxml 编译 smoke=NOT_RUN。
- 证实/推断/未知：结构与休眠状态=**证实**（检索范围：三份 scripts/office 全树+全仓文件名/schemaLocation）；发布者=**推断**；上游版本=**未知**（文件头无版本注释）。

## apps--electron--default-skills--docx--scripts--office--schemas--microsoft--wml-2012.xsd

- 职责：Microsoft Word 2012 WordprocessingML 扩展（W15，`…/word/2012/wordml`）vendor XSD——批注扩展 commentsEx（CT_CommentsEx/CT_CommentEx :17-27）、人员 people（CT_People/CT_Person :28-43）、SDT 外观/数据绑定（:4,:12,:16）、repeatingSection（:44-59）、docId/webExtension*（:60-65）等部件结构；本行为 docx 技能副本。
- 消费：三副本映射＝三份逐字节相同；校验加载映射＝**直接加载**——`SCHEMA_MAPPINGS` `base.py:52`（people.xml→本文件）与 `base.py:55`（commentsExtended.xml→本文件），经 `_get_schema_path`（base.py:685-687）→ `_validate_single_file_xsd`（base.py:750-761）编译（:758-759 base_url 使其 :2/:3 的 ISO import 相对解析）。失败影响＝编译/校验失败→新增错误（base.py:611-619 差集）→base.py:676-679 FAILED→validate.py:107 `sys.exit(1)`→docx/SKILL.md:76 unpack/fix/repack 返修。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `6b00755a9a8733f0fb171a47b25d0d7b4c70dee8`；sourceSha256 `0fa75578a000439a7988ba0c59fdc69f774bbd416cbacc14d07125b3f686cb74`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除/损坏→people.xml/commentsExtended.xml 无 schema 可编译（base.py:761 抛异常=推断）→docx 批注/人员部件校验崩溃；改动→误判 commentsEx/people 结构（批注功能相关部件，与 docx/scripts/comment.py 产物相关=推断）。
- 验证：①三副本相等（已核）；②核 base.py:52/:55 映射与 :17-43 结构；③编译/校验 smoke=NOT_RUN。
- 证实/推断/未知：加载映射与结构=**证实**；异常行为细节=**推断**（未实跑）；发布者/版本=**推断/未知**。

## apps--electron--default-skills--docx--scripts--office--schemas--microsoft--wml-2018.xsd

- 职责：Microsoft Word 2018 WordprocessingML 扩展（W16，`…/word/2018/wordml`）vendor XSD——通用扩展容器 CT_Extension/CT_ExtensionList（:5-12）；本行为 docx 技能副本。
- 消费：三副本映射＝三份逐字节相同；校验加载映射＝**间接加载**——族内唯一导入边 `wml-cex-2018.xsd:2` `xs:import schemaLocation="wml-2018.xsd"`，在 commentsExtensible.xml 校验编译 wml-cex 时被拉起（base.py:758-761）；自身 :2 导入 ISO wml.xsd。失败影响＝损坏→wml-cex-2018.xsd 连带编译失败→commentsExtensible.xml 校验崩溃→validate.py:107 exit 1。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `f321d333a5e6ef98cbdfeeeaa334923e4cfc8a6c`；sourceSha256 `be0ff793a22dd31384650c3a4da14c2fa8062751c2e97b0e5ee852bda13c60ad`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→wml-cex-2018.xsd 的 :2 import 解析失败（相对 base_url）→commentsExtensible 部件校验直接崩；改动→CT_Extension 容器语义漂移。
- 验证：①三副本相等（已核）；②核 wml-cex-2018.xsd:2 导入边；③编译 smoke=NOT_RUN。
- 证实/推断/未知：导入边与结构=**证实**；连带失败细节=**推断**（未实跑）；发布者/版本=**推断/未知**。

## apps--electron--default-skills--docx--scripts--office--schemas--microsoft--wml-cex-2018.xsd

- 职责：Word 2018 批注可扩展部件（`…/word/2018/wordml/cex`）vendor XSD——根元素 commentsExtensible、CT_CommentExtensible（durableId 必填/dateUtc/intelligentPlaceholder 属性 :13-17，根 :18）；本行为 docx 技能副本。
- 消费：三副本映射＝三份逐字节相同；校验加载映射＝**直接加载**——`SCHEMA_MAPPINGS` `base.py:54`（commentsExtensible.xml→本文件）；编译时拉起族内 wml-2018.xsd（:2）与 ISO wml.xsd（:3）、shared-commonSimpleTypes.xsd（:4）。失败影响＝新增错误→base.py:676-679 FAILED→validate.py:107 exit 1→docx/SKILL.md:76 返修循环。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `364c6a9b8df6e252bb5ae39e2ca031fcbfc4e8a5`；sourceSha256 `fddc2b880cabb9005aebbc7e783e53c19fec1c03df7d0e2f2076a33a0fdfd081`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除/损坏→commentsExtensible.xml（批注 durableId 关联部件）无法校验→文档批注校验链断；改动→durableId/dateUtc 语义漂移，误放行/误报批注部件。
- 验证：①三副本相等（已核）；②核 base.py:54 与 :2-4 三个 import；③编译/校验 smoke=NOT_RUN。
- 证实/推断/未知：映射与结构=**证实**；失败细节=**推断**；发布者/版本=**推断/未知**。

## apps--electron--default-skills--docx--scripts--office--schemas--microsoft--wml-cid-2016.xsd

- 职责：Word 2016 批注 ID 部件（`…/word/2016/wordml/cid`）vendor XSD——根元素结构 CT_CommentsIds/CT_CommentId（:5-11）；本行为 docx 技能副本。
- 消费：三副本映射＝三份逐字节相同；校验加载映射＝**直接加载**——`SCHEMA_MAPPINGS` `base.py:53`（commentsIds.xml→本文件）；:2 导入 ISO wml.xsd。失败影响＝同家族：新增错误→FAILED（base.py:676-679）→validate.py:107 exit 1。W16CID 命名空间另被 `docx.py:20` `W16CID_NAMESPACE` 常量使用（durableId，docx.py:257）。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `fed9d15b7f504e14ac82793d79db2d7ad83d56ed`；sourceSha256 `127ca209fa73d7cb708449cb355c871867948a96e4a74f7bf5811ef62d17991d`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除/损坏→commentsIds.xml 无法校验→批注 ID 部件校验链断；改动→CT_CommentId 结构漂移。
- 验证：①三副本相等（已核）；②核 base.py:53、docx.py:20/:257；③编译 smoke=NOT_RUN。
- 证实/推断/未知：映射与结构=**证实**；失败细节=**推断**；发布者/版本=**推断/未知**。

## apps--electron--default-skills--docx--scripts--office--schemas--microsoft--wml-sdtdatahash-2020.xsd

- 职责：Word 2020 SDT 数据哈希扩展（`…/word/2020/wordml/sdtdatahash`）vendor XSD——仅一个全局属性 storeItemChecksum（:3，引用 w12:ST_String）；本行为 docx 技能副本。
- 消费：三副本映射＝三份逐字节相同；校验加载映射＝**无**——不在 SCHEMA_MAPPINGS、无任何 `xs:import` 引用（全仓检索零命中）＝休眠 vendor 存档；失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `680cf15400cd57ce2bf17a58ecd29caa0d8a8422`；sourceSha256 `842e7163409c8d74f4d7088a8bc99500d80bc75332681a0980055b08f374a604`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（零引用，证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②grep `wml-sdtdatahash` 全仓零引用（已核）；③编译 smoke=NOT_RUN。
- 证实/推断/未知：休眠状态=**证实**（检索范围同上）；发布者=**推断**；用途背景（SDT 校验和）=**推断**（按命名空间与元素名）。

## apps--electron--default-skills--docx--scripts--office--schemas--microsoft--wml-symex-2015.xsd

- 职责：Word 2015 符号扩展（`…/word/2015/wordml/symex`）vendor XSD——CT_SymEx（font/char 属性）与根元素 symEx（:5-7）；本行为 docx 技能副本。
- 消费：三副本映射＝三份逐字节相同；校验加载映射＝**无**——不在 SCHEMA_MAPPINGS、无任何 `xs:import` 引用（全仓检索零命中）＝休眠 vendor 存档；失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `89ada90837b2db3f3d453212ae426520acedbbea`；sourceSha256 `16f6f8072249f431370723c2cd8974672e0d9c897e00e97dd918079df934871b`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（零引用，证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②grep `wml-symex` 全仓零引用（已核）；③编译 smoke=NOT_RUN。
- 证实/推断/未知：休眠状态=**证实**；发布者=**推断**；上游版本=**未知**。

## pptx 副本（`apps/electron/default-skills/pptx/scripts/office/schemas/microsoft/`）

## apps--electron--default-skills--pptx--scripts--office--schemas--microsoft--wml-2010.xsd

- 职责：W14（`…/word/2010/wordml`）扩展 XSD（docId/conflictMode :20-21、修订冲突标记 :28-31、颜色/渐变扩展 :140-192）；本行为 pptx 技能副本，内容与 docx/xlsx 副本逐字节相同。
- 消费：三副本映射＝三份同 sha256；校验加载映射＝**无**（不在 SCHEMA_MAPPINGS base.py:43-58、无 `xs:import` 引用，全仓检索零命中）＝休眠；pptx 侧校验入口为 `PPTXSchemaValidator`（pptx.py:10，validate.py:91 分派 `.pptx`）但不会加载本文件。失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断，:1 无版权注释）；sourceBlob `f65f777730d82162f4248f03c703b1b85fda5fe2`；sourceSha256 `568b26ee156cb9549aa439ca2158965f77b7c1602b7e0316f40ac6cf586e35f2`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（零引用，证实）；三副本 vendor 完整性破坏、守卫计数下降（推断）。
- 验证：①三副本 sha256 相等（已核）；②grep 零引用（已核）；③编译 smoke=NOT_RUN。
- 证实/推断/未知：休眠=**证实**；发布者=**推断**；版本=**未知**。

## apps--electron--default-skills--pptx--scripts--office--schemas--microsoft--wml-2012.xsd

- 职责：W15 扩展 XSD（commentsEx :17-27、people :28-43、SDT 外观/数据绑定 :4/:12/:16、repeatingSection :44-59）；本行为 pptx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**直接加载**——`pptx/scripts/office/validators/base.py:52`（people.xml→本文件）、`:55`（commentsExtended.xml→本文件），经 `_get_schema_path`（:685-687）→`_validate_single_file_xsd`（:750-761）编译；pptx 校验链 `validate.py:91`→`pptx.py:10/:48` `validate_against_xsd`（SCHEMA_MAPPINGS 继承自 base，无覆盖）。失败影响＝新增错误→FAILED（base.py:676-679）→`validate.py:107` exit 1。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `6b00755a9a8733f0fb171a47b25d0d7b4c70dee8`；sourceSha256 `0fa75578a000439a7988ba0c59fdc69f774bbd416cbacc14d07125b3f686cb74`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除/损坏→含 people/commentsExtended 部件的包无法校验（base.py:761 编译异常=推断）；改动→误判部件结构。此类部件在 .pptx 中少见=推断（映射按文件名通用）。
- 验证：①三副本相等（已核）；②核 pptx base.py:52/:55；③校验 smoke=NOT_RUN。
- 证实/推断/未知：映射=**证实**；.pptx 中部件出现频率=**推断**；发布者/版本=**推断/未知**。

## apps--electron--default-skills--pptx--scripts--office--schemas--microsoft--wml-2018.xsd

- 职责：W16 通用扩展容器 CT_Extension/CT_ExtensionList（:5-12）；本行为 pptx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**间接加载**——`wml-cex-2018.xsd:2` `xs:import`（commentsExtensible.xml 校验编译时拉起）；失败影响＝损坏→wml-cex 连带编译失败→校验崩→validate.py:107 exit 1。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `f321d333a5e6ef98cbdfeeeaa334923e4cfc8a6c`；sourceSha256 `be0ff793a22dd31384650c3a4da14c2fa8062751c2e97b0e5ee852bda13c60ad`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→wml-cex-2018.xsd:2 import 解析失败→commentsExtensible 部件校验崩（推断）。
- 验证：①三副本相等（已核）；②核导入边；③编译 smoke=NOT_RUN。
- 证实/推断/未知：导入边=**证实**；连带失败=**推断**；版本=**未知**。

## apps--electron--default-skills--pptx--scripts--office--schemas--microsoft--wml-cex-2018.xsd

- 职责：Word 2018 批注可扩展部件（`…/word/2018/wordml/cex`）XSD——根 commentsExtensible、CT_CommentExtensible（durableId/dateUtc/intelligentPlaceholder :13-17）；本行为 pptx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**直接加载**——`pptx .../validators/base.py:54`（commentsExtensible.xml→本文件），编译时拉起 wml-2018.xsd（:2）/ISO wml.xsd（:3）/shared-commonSimpleTypes.xsd（:4）；失败影响＝新增错误→FAILED→validate.py:107 exit 1。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `364c6a9b8df6e252bb5ae39e2ca031fcbfc4e8a5`；sourceSha256 `fddc2b880cabb9005aebbc7e783e53c19fec1c03df7d0e2f2076a33a0fdfd081`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除/损坏→commentsExtensible.xml 校验链断；改动→durableId 语义漂移。
- 验证：①三副本相等（已核）；②核 base.py:54 与 :2-4 imports；③smoke=NOT_RUN。
- 证实/推断/未知：映射=**证实**；失败细节=**推断**；发布者/版本=**推断/未知**。

## apps--electron--default-skills--pptx--scripts--office--schemas--microsoft--wml-cid-2016.xsd

- 职责：Word 2016 批注 ID 部件（`…/word/2016/wordml/cid`）XSD——CT_CommentsIds/CT_CommentId（:5-11）；本行为 pptx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**直接加载**——`pptx .../validators/base.py:53`（commentsIds.xml→本文件）；:2 导入 ISO wml.xsd；失败影响＝同上（FAILED→exit 1）。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `fed9d15b7f504e14ac82793d79db2d7ad83d56ed`；sourceSha256 `127ca209fa73d7cb708449cb355c871867948a96e4a74f7bf5811ef62d17991d`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除/损坏→commentsIds.xml 无法校验；改动→CT_CommentId 结构漂移。
- 验证：①三副本相等（已核）；②核 base.py:53；③smoke=NOT_RUN。
- 证实/推断/未知：映射=**证实**；失败细节=**推断**；版本=**未知**。

## apps--electron--default-skills--pptx--scripts--office--schemas--microsoft--wml-sdtdatahash-2020.xsd

- 职责：Word 2020 SDT 数据哈希扩展 XSD——全局属性 storeItemChecksum（:3）；本行为 pptx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**无**（全仓检索零引用）＝休眠；失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `680cf15400cd57ce2bf17a58ecd29caa0d8a8422`；sourceSha256 `842e7163409c8d74f4d7088a8bc99500d80bc75332681a0980055b08f374a604`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（零引用，证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②grep 零引用（已核）；③smoke=NOT_RUN。
- 证实/推断/未知：休眠=**证实**；发布者=**推断**；用途=**推断**（按命名空间）。

## apps--electron--default-skills--pptx--scripts--office--schemas--microsoft--wml-symex-2015.xsd

- 职责：Word 2015 符号扩展 XSD——CT_SymEx/symEx（font/char，:5-7）；本行为 pptx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**无**（全仓检索零引用）＝休眠；失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `89ada90837b2db3f3d453212ae426520acedbbea`；sourceSha256 `16f6f8072249f431370723c2cd8974672e0d9c897e00e97dd918079df934871b`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（零引用，证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②grep 零引用（已核）；③smoke=NOT_RUN。
- 证实/推断/未知：休眠=**证实**；发布者=**推断**；版本=**未知**。

## xlsx 副本（`apps/electron/default-skills/xlsx/scripts/office/schemas/microsoft/`）

## apps--electron--default-skills--xlsx--scripts--office--schemas--microsoft--wml-2010.xsd

- 职责：W14 扩展 XSD（docId/conflictMode :20-21、修订冲突标记 :28-31、颜色/渐变扩展 :140-192）；本行为 xlsx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝三份同 sha256；校验加载映射＝**无**（零引用）＝休眠；xlsx 副本整体**无校验入口**——`xlsx/scripts/office/validate.py:93-95` 对 `.xlsx` 显式不支持（`case _`→`sys.exit(1)`）且 xlsx/SKILL.md 全文不引用 scripts/office（已核）。失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `f65f777730d82162f4248f03c703b1b85fda5fe2`；sourceSha256 `568b26ee156cb9549aa439ca2158965f77b7c1602b7e0316f40ac6cf586e35f2`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（零引用+无校验入口，证实）；vendor 三副本集不完整（推断）。
- 验证：①三副本相等（已核）；②grep 零引用（已核）；③smoke=NOT_RUN。
- 证实/推断/未知：休眠=**证实**；发布者=**推断**；版本=**未知**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--microsoft--wml-2012.xsd

- 职责：W15 扩展 XSD（commentsEx :17-27、people :28-43、SDT :4/:12/:16、repeatingSection :44-59）；本行为 xlsx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**注册但不可达**——`xlsx .../validators/base.py:52/:55`（people.xml/commentsExtended.xml→本文件）注册存在，但 xlsx 侧无校验入口（validate.py:93-95 拒绝 `.xlsx`，xlsx/SKILL.md 零引用）→实际运行时**不加载**。失败影响＝无运行时失败路径。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `6b00755a9a8733f0fb171a47b25d0d7b4c70dee8`；sourceSha256 `0fa75578a000439a7988ba0c59fdc69f774bbd416cbacc14d07125b3f686cb74`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（证实）；若未来 xlsx 工具链接入校验（推断场景），本文件将成为 commentsEx/people 部件校验依赖。
- 验证：①三副本相等（已核）；②核 base.py:52/:55 注册与 validate.py:93-95 不支持 .xlsx；③smoke=NOT_RUN。
- 证实/推断/未知：注册存在但无入口=**证实**；未来接入=**推断**；发布者/版本=**推断/未知**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--microsoft--wml-2018.xsd

- 职责：W16 通用扩展容器 CT_Extension/CT_ExtensionList（:5-12）；本行为 xlsx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝仅经 `wml-cex-2018.xsd:2` `xs:import` 间接可达，而 xlsx 侧无校验入口=实际不加载；失败影响＝无运行时失败路径。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `f321d333a5e6ef98cbdfeeeaa334923e4cfc8a6c`；sourceSha256 `be0ff793a22dd31384650c3a4da14c2fa8062751c2e97b0e5ee852bda13c60ad`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→运行时无影响（证实）；破坏 cex→2018 导入闭包完整性（推断）。
- 验证：①三副本相等（已核）；②核导入边；③smoke=NOT_RUN。
- 证实/推断/未知：导入边=**证实**；实际不加载=**证实**（无入口）；版本=**未知**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--microsoft--wml-cex-2018.xsd

- 职责：Word 2018 批注可扩展部件（`…/word/2018/wordml/cex`）XSD——根 commentsExtensible、CT_CommentExtensible（durableId/dateUtc/intelligentPlaceholder :13-17）；本行为 xlsx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝`xlsx .../validators/base.py:54`（commentsExtensible.xml→本文件）注册存在，但 xlsx 无校验入口=实际不加载；其 :2-4 imports（wml-2018/ISO wml/shared-commonSimpleTypes）同为休眠闭包。失败影响＝无运行时失败路径。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `364c6a9b8df6e252bb5ae39e2ca031fcbfc4e8a5`；sourceSha256 `fddc2b880cabb9005aebbc7e783e53c19fec1c03df7d0e2f2076a33a0fdfd081`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→运行时无影响（证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②核 base.py:54 与 :2-4 imports；③smoke=NOT_RUN。
- 证实/推断/未知：注册但不加载=**证实**；发布者=**推断**；版本=**未知**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--microsoft--wml-cid-2016.xsd

- 职责：Word 2016 批注 ID 部件（`…/word/2016/wordml/cid`）XSD——CT_CommentsIds/CT_CommentId（:5-11）；本行为 xlsx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝`xlsx .../validators/base.py:53`（commentsIds.xml→本文件）注册存在，但 xlsx 无校验入口=实际不加载；失败影响＝无运行时失败路径。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `fed9d15b7f504e14ac82793d79db2d7ad83d56ed`；sourceSha256 `127ca209fa73d7cb708449cb355c871867948a96e4a74f7bf5811ef62d17991d`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→运行时无影响（证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②核 base.py:53；③smoke=NOT_RUN。
- 证实/推断/未知：注册但不加载=**证实**；发布者=**推断**；版本=**未知**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--microsoft--wml-sdtdatahash-2020.xsd

- 职责：Word 2020 SDT 数据哈希扩展 XSD——全局属性 storeItemChecksum（:3）；本行为 xlsx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**无**（全仓零引用）＝休眠，且 xlsx 无校验入口；失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `680cf15400cd57ce2bf17a58ecd29caa0d8a8422`；sourceSha256 `842e7163409c8d74f4d7088a8bc99500d80bc75332681a0980055b08f374a604`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②grep 零引用（已核）；③smoke=NOT_RUN。
- 证实/推断/未知：休眠=**证实**；发布者=**推断**；用途=**推断**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--microsoft--wml-symex-2015.xsd

- 职责：Word 2015 符号扩展 XSD——CT_SymEx/symEx（font/char，:5-7）；本行为 xlsx 技能副本，与另两副本逐字节相同。
- 消费：三副本映射＝同 sha256；校验加载映射＝**无**（全仓零引用）＝休眠，且 xlsx 无校验入口；失败影响＝不参与校验。
- 来源与 hash：Microsoft WML 扩展 schema（发布者=推断）；sourceBlob `89ada90837b2db3f3d453212ae426520acedbbea`；sourceSha256 `16f6f8072249f431370723c2cd8974672e0d9c897e00e97dd918079df934871b`；change=unchanged_since_093f。
- 打包：进产物（electron-builder.yml:71-75）。
- 影响：删除→无运行时影响（证实）；vendor 集不完整（推断）。
- 验证：①三副本相等（已核）；②grep 零引用（已核）；③smoke=NOT_RUN。
- 证实/推断/未知：休眠=**证实**；发布者=**推断**；版本=**未知**。
