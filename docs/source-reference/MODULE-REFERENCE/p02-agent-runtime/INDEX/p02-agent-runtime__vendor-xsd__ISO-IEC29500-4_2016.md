# p02-agent-runtime__vendor-xsd__ISO-IEC29500-4_2016 索引（ISO/IEC 29500-4:2016 vendor XSD 三副本）— r1

冻结 `05fb2565e20eb1760233696be1832f68196b37c2`，源根 `agent-ops/docs-r07-20261023/baseline/source`。
本篇覆盖 group `p02-agent-runtime__vendor-xsd__ISO-IEC29500-4_2016`（owner `p02-agent-runtime`，family `vendor-xsd/ISO-IEC29500-4_2016`）共 **81 个 vendor XSD 文件 = 27 个 schema 模块 × 3 副本（docx/pptx/xlsx）**。按合同「家族说明 + 每文件三副本映射/校验加载映射/失败影响，不逐份重复手册」组织：**27 模块家族说明（7 个子家族）+ 81 行逐文件登记**（每行七项必填：职责 / 消费（校验加载映射）/ 来源与 hash / 打包 / 影响 / 验证 / 证实·推断·未知）；逐文件行机械列（blob/sha256/字节/行数）取冻结树，加载映射与影响结论为人工实读实测。

## 修订记录（r1，revisionOf `index-p02-agent-runtime__vendor-xsd__ISO-IEC29500-4_2016`）

响应独立 QA `reviews/index-p02-agent-runtime__vendor-xsd__ISO-IEC29500-4_2016/RESULT.json`（batchVerdict=revision_required，54 accepted / 27 revision_required）：

- **F-01（blocking，已修正）**：原文「validate.py 按扩展名选 DOCXSchemaValidator/PPTXSchemaValidator（:74-87），xlsx 走对应校验器」不实。回源确认（作者复测与 QA 一致）：validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 仅 `case ".docx"`（:81）/`case ".pptx"`（:89），`.xlsx` 落 `case _:`「Error: Validation not supported for file type」+`sys.exit(1)`（:93-95）；`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining、全树无 XLSX 校验器（`grep XLSXSchemaValidator` 零命中）；xlsx/SKILL.md 对 validate/validators 零引用。→ 篇首改为如实口径；**27 个 xlsx 副本行的消费/影响改「零加载/不可达」口径**（与 vml 同级）。
- **N-01（low，已合并）**：27 个 pptx 副本行影响列改「CLI/打包工具链支持的 pptx 校验中断」（validate.py:89-92、pack.py:85-91 可校 .pptx；pptx/SKILL.md 无 validate.py 引用）。
- **N-02（low，已合并）**：行号重导——`validate.py:108→:107`（`sys.exit(0 if success else 1)`）、`base.py:785-786→:784-785`（except→`return False,{str(e)}`）、`electron-builder.yml:71-73→:70-75`（from/to :72-73、filter :74-75）、`index.ts:940-941→:939-941`。已核实行的加载映射语义不动（机械列与 import 图不变），仅按 QA 指定项改列。
- **N-03（low，已更正）**：本 r1 封版元数据 `startedAtUtc ≤ sealedAtUtc`（父批 DONE 时间倒挂不改写——历史 DONE 不重写，以本 r1 为准）。

## 一、家族总述（实读证实）

- **这是什么**：`apps/electron/default-skills/{docx,pptx,xlsx}/scripts/office/schemas/ISO-IEC29500-4_2016/` 三份**字节全等**（实测 `sha256sum` 三副本同值）的 vendor XSD 库——ISO/IEC 29500-4:2016（ECMA-376 第 4 版）OOXML 过渡期架构文本，覆盖 WordprocessingML/PresentationML/SpreadsheetML/DrawingML/OMML/VML/docProps 各命名空间，供 office 校验工具做「解包后逐 XML 文件 XSD 校验」。27 个模块（每模块 3 副本）：`wml/pml/sml` 三大主架构、`dml-*` 8 个 DrawingML、`shared-*` 10 个共享、`vml-*` 5 个 VML、`xml` 1 个 W3C xml: 命名空间。
- **谁加载（校验加载映射，实读证实）**：唯一加载器是各技能 `scripts/office/validators/base.py`（三副本同构）——①`SCHEMA_MAPPINGS`（docx 副本 :43-59）把 OOXML part 映射到 schema：`word/→wml.xsd`、`ppt/→pml.xsd`、`xl/→sml.xsd`、`app.xml→shared-documentPropertiesExtended.xsd`、`custom.xml→shared-documentPropertiesCustom.xsd`、`chart→dml-chart.xsd`、`theme/drawing→dml-main.xsd`（另 people/comments 系→`microsoft/*`，属别的 group）；②`_get_schema_path`（:685-699）按文件名映射优先、`.rels`/charts//theme//主内容目录规则兜底；③`schemas_dir`（:99）= `validators/../schemas`；④`_validate_single_file_xsd`（:750-775，schema_path :751、`lxml.etree.XMLSchema` :761）按 base_url 相对解析 `xsd:import schemaLocation="…"`，把家族其余模块传递拉入（实测 `grep schemaLocation` 建图，见下节）。**何时生效**：agent/维护者跑 `python scripts/office/validate.py <doc>` 校验手改 OOXML 时（docx/SKILL.md:76-78「After creating the file, validate it … python scripts/office/validate.py doc.docx」为唯一技能引用）；`validate.py` dispatch（三副本同一文件，sha256 `1aef24f8e316965a…`）：`case ".docx"`（:81-88，DOCXSchemaValidator+--original 时 RedliningValidator）、`case ".pptx"`（:89-92，PPTXSchemaValidator）；**`.xlsx` 落 `case _:`「Error: Validation not supported for file type」+`sys.exit(1)`（:93-95）**，`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining、全树无 XLSX 校验器，xlsx/SKILL.md 对 validate/validators 零引用、pptx/SKILL.md 亦无 validate.py 引用（均实测）——故 **xlsx 技能没有「改后必校验」环节，27 份 xlsx 副本 schema 经现有产品流程不可达（零加载/不可达，与 vml 族同级口径）**。**行为约束**：校验只报「相对原件的新增错误」（base.py:676-683 `FAILED - Found NEW validation errors` / `PASSED - No new XSD validation errors introduced`），schema 加载/解析异常一律记为该文件校验错误（base.py:784-785 `except Exception as e: return False, {str(e)}`）。
- **失败影响（共通）**：任一**被加载**（docx/pptx 侧）模块缺失/损坏/import 目标断链 → `_validate_single_file_xsd` 抛异常被 base.py:784-785 捕获 → 校验判失败 → `validate.py:107` `sys.exit(0 if success else 1)` **退出码 1**，docx 技能校验环节（docx/SKILL.md:76-78）与 CLI/打包工具链支持的 .docx/.pptx 校验（validate.py、pack.py:85-91 打包校验链）中断；xlsx 侧见 F-01 口径（当前不可达，删改无运行时影响）。反之若放行非法 OOXML，Word/Excel/PowerPoint 可能拒开文件（chartlib.md §五口径：schema 通过≠Office 能打开）。
- **打包（共通）**：进产物——`apps/electron/electron-builder.yml:70-75` `extraResources`（`from: default-skills` :72、`to: default-skills` :73、`filter: **/*` :74-75），三副本随各技能目录整体入 `process.resourcesPath/default-skills`（`apps/electron/src/main/index.ts:939-941` 定位）→ 用户库 `~/.cdutai/default-skills/`（skill-master-manager.ts:1-13）→ 工作区 `skills/` 副本；`validators/base.py:99` 相对自身定位 `schemas/`，故只要技能目录内部相对结构不变，打包位置不影响加载。
- **来源（共通）**：vendor 引入的 ISO/IEC 29500-4:2016 / ECMA-376 架构文本（`xsd:schema` 头含 ECMA 命名空间组与 W3C xml.xsd 标准文本，命名空间 URI 全部指向 `schemas.openxmlformats.org`/`schemas.microsoft.com`/`w3.org`——出处=**推断**，文件内无厂商版本声明；引入 commit=**未知**）；`change=unchanged_since_093f`（81/81 锁列照录）。
- **验证方法（共通）**：①三副本 `sha256sum` 相等并与锁/MANIFEST 一致（实测抽查 dml-chart/wml/xml/vml-main 三副本全同，另 validate.py 三副本全同 `1aef24f8…`）；②`grep -o 'schemaLocation="[^"]*"'` 重建 import 图与下节一致；③`grep -n "SCHEMA_MAPPINGS\|_get_schema_path\|XMLSchema" validators/base.py` 核 :43-59/:685-699/:751-761；④`grep -n "case \|not supported" validate.py` 核 :81/:89/:93-95/:107；⑤实跑 `python scripts/office/validate.py` 校验 .docx/.pptx（本轮 NOT_RUN）。

## 二、校验加载映射与 import 图（实测 grep schemaLocation）

**入口（SCHEMA_MAPPINGS 直接映射，7/27 模块）**：`wml`（word/）、`pml`（ppt/）、`sml`（xl/）、`shared-documentPropertiesExtended`（app.xml）、`shared-documentPropertiesCustom`（custom.xml）、`dml-chart`（chart）、`dml-main`（theme/、drawing/）。

**传递可达（经 xsd:import 被拉入，12/27 模块）**：`dml-chartDrawing`、`dml-diagram`、`dml-lockedCanvas`、`dml-picture`、`dml-spreadsheetDrawing`、`dml-wordprocessingDrawing`、`shared-commonSimpleTypes`、`shared-customXmlSchemaProperties`、`shared-documentPropertiesVariantTypes`、`shared-math`、`shared-relationshipReference`、`xml`（xml 经 `shared-math.xsd` 的 import 链：wml→shared-math→xml）。

**当前零加载（8/27 模块，负向检索证实）**：`shared-additionalCharacteristics`、`shared-bibliography`、`shared-customXmlDataProperties`、`vml-main`、`vml-officeDrawing`、`vml-presentationDrawing`、`vml-spreadsheetDrawing`、`vml-wordprocessingDrawing`——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外零外部引用（vml-main↔vml-officeDrawing 互引、vml-main→其余 3 个 vml；三 shared 仅出不进）。

**xlsx 副本维度（F-01 修正）**：上述「入口/传递」均以 docx/pptx 侧校验器为加载方；**全部 27 模块的 xlsx 副本对现有产品流程零加载/不可达**（xlsx/SKILL.md 零引用、validate.py:93-95 拒 .xlsx、全树无 XLSX 校验器）。另注：`SCHEMA_MAPPINGS["xl"]→sml.xsd` 映射代码存在，但 xl/ part 仅 .xlsx 语境出现、CLI 不收 .xlsx，故该入口当前无触发流（sml/dml-spreadsheetDrawing 的映射处于休眠态）。

**跨家族引用（非本 group 文件，只登记关系）**：`wml.xsd` → `../mce/mc.xsd`（mce 组）；`microsoft/wml-2012.xsd`、`wml-2018/2010/cid/cex/sdtdatahash/symex` 等反向 import 本家族 `wml.xsd`/`shared-commonSimpleTypes.xsd`（即 microsoft 组校验也依赖本家族）；`xml.xsd:58` 的 `schemaLocation="http://www.w3.org/2001/03/xml.xsd"` 位于 `xs:documentation` 示例文本内，**不是**真实 import（实读确认）。

## 三、子家族说明（27 模块）

1. **wml（WordprocessingML 主架构，1 模块）**：`wml.xsd`（`…/wordprocessingml/2006/main`，3646 行）——`w:` 文档元素全家（document/body/p/tbl/rPr…）。入口=word/ 目录规则（base.py:698-699）；import `../mce/mc.xsd`、`dml-wordprocessingDrawing`、`shared-math`、`shared-relationshipReference`、`shared-commonSimpleTypes`、`shared-customXmlSchemaProperties`。批注/正文/样式校验的地基；坏→所有 .docx 校验断。
2. **pml（PresentationML 主架构，1 模块）**：`pml.xsd`（`…/presentationml/2006/main`，1676 行）——`p:` 演示元素。入口=ppt/ 目录规则；import shared-relationshipReference/dml-main/shared-commonSimpleTypes。坏→CLI/打包工具链支持的 .pptx 校验断（validate.py:89-92、pack.py:85-91）。
3. **sml（SpreadsheetML 主架构，1 模块）**：`sml.xsd`（`…/spreadsheetml/2006/main`，4439 行，家族最大）——工作簿/工作表/单元格/公式元素。入口=xl/ 目录规则（映射存在但**当前无触发流**——CLI 拒 .xlsx，见 F-01 修正）；import shared-relationshipReference/shared-commonSimpleTypes/dml-spreadsheetDrawing。坏→未来接入 .xlsx 校验时断；当前运行时影响=无。
4. **dml-*（DrawingML，8 模块）**：`dml-main`（`…/drawingml/2006/main`，3081 行，形状/文本/填充/效果核心，theme/ 与 drawing/ 直接入口，:57-58）为枢纽，互引 `dml-chart`/`dml-diagram`/`dml-picture`/`dml-lockedCanvas`；`dml-chart`（`…/chart`，1499 行，图表元素，chart 直接入口 :56，import dml-main/dml-chartDrawing/shared-*）；`dml-chartDrawing`（`…/chartDrawing`）；`dml-diagram`（`…/diagram`，1085 行，SmartArt）；`dml-picture`（`…/picture`）；`dml-lockedCanvas`（`…/lockedCanvas`）；`dml-spreadsheetDrawing`（`…/spreadsheetDrawing`，工作表锚定绘图 xdr，经 sml 链——同属休眠入口）；`dml-wordprocessingDrawing`（`…/wordprocessingDrawing`，文档锚定绘图 wp，import dml-main/wml/dml-picture）。除 dml-chart/dml-main 直接入口外均经 import 传递加载。
5. **shared-*（共享基础，10 模块）**：`shared-commonSimpleTypes`（`…/sharedTypes`，174 行，ST_* 简单类型全家，家族中被 import 最多）；`shared-relationshipReference`（`…/relationships`，r:id 引用类型）；`shared-math`（`…/math`，582 行，OMML，import wml/shared-commonSimpleTypes/xml）；`shared-documentPropertiesExtended`（app.xml 入口）；`shared-documentPropertiesCustom`（custom.xml 入口）；`shared-documentPropertiesVariantTypes`（vt: 变体类型，被两个 docProps 模块 import）；`shared-customXmlSchemaProperties`（schemaLibrary `sl:`，被 wml import）；`shared-customXmlDataProperties`（customXml 数据属性，零加载）；`shared-bibliography`（书目 `b:`，零加载）；`shared-additionalCharacteristics`（附加特性，零加载）。
6. **vml-*（VML 旧式矢量绘图，5 模块）**：`vml-main`（`urn:schemas-microsoft-com:vml`）↔`vml-officeDrawing` 互引，vml-main 另 import `vml-wordprocessingDrawing`/`vml-spreadsheetDrawing`/`vml-presentationDrawing`（三个 `urn:schemas-microsoft-com:office:*` 扩展）。**整个 vml 族当前零校验加载**（wml 不 import vml；全目录 grep 无外部引用）——Word 2007 前 VML 绘图（w:pict）的架构保留件。
7. **xml（W3C xml: 命名空间，1 模块）**：`xml.xsd`（`http://www.w3.org/XML/1998/namespace`，116 行）——`xml:base/lang/space` 特殊属性组（文件头 W3C 标准文本自述）。经 `shared-math.xsd` import 传递加载（wml→shared-math→xml）。

## 四、27 模块 × 三副本映射总表（机械列实测）

| 模块 | targetNamespace | 三副本路径（docx/pptx/xlsx `scripts/office/schemas/ISO-IEC29500-4_2016/<名>.xsd`） | 加载状态 |
| --- | --- | --- | --- |
| `dml-chart.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/chart` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 直接入口 |
| `dml-chartDrawing.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/chartDrawing` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `dml-diagram.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/diagram` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `dml-lockedCanvas.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/lockedCanvas` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `dml-main.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/main` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 直接入口 |
| `dml-picture.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/picture` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `dml-spreadsheetDrawing.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `dml-wordprocessingDrawing.xsd` | `http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `pml.xsd` | `http://schemas.openxmlformats.org/presentationml/2006/main` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 直接入口 |
| `shared-additionalCharacteristics.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/characteristics` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `shared-bibliography.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/bibliography` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `shared-commonSimpleTypes.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/sharedTypes` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `shared-customXmlDataProperties.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/customXml` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `shared-customXmlSchemaProperties.xsd` | `http://schemas.openxmlformats.org/schemaLibrary/2006/main` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `shared-documentPropertiesCustom.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/custom-properties` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 直接入口 |
| `shared-documentPropertiesExtended.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/extended-properties` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 直接入口 |
| `shared-documentPropertiesVariantTypes.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `shared-math.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/math` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `shared-relationshipReference.xsd` | `http://schemas.openxmlformats.org/officeDocument/2006/relationships` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |
| `sml.xsd` | `http://schemas.openxmlformats.org/spreadsheetml/2006/main` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 直接入口 |
| `vml-main.xsd` | `urn:schemas-microsoft-com:vml` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `vml-officeDrawing.xsd` | `urn:schemas-microsoft-com:office:office` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `vml-presentationDrawing.xsd` | `urn:schemas-microsoft-com:office:powerpoint` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `vml-spreadsheetDrawing.xsd` | `urn:schemas-microsoft-com:office:excel` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `vml-wordprocessingDrawing.xsd` | `urn:schemas-microsoft-com:office:word` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | **零加载** |
| `wml.xsd` | `http://schemas.openxmlformats.org/wordprocessingml/2006/main` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 直接入口 |
| `xml.xsd` | `http://www.w3.org/XML/1998/namespace` | docx/pptx/xlsx 三份字节全等（sha256 实测同值） | 传递加载 |

> 注（F-01 修正）：上表「加载状态」按 docx/pptx 侧校验器口径；**全部 27 模块的 xlsx 副本对现有产品流程零加载/不可达**（xlsx/SKILL.md 零引用、validate.py:93-95 拒 .xlsx、全树无 XLSX 校验器），xlsx 27 行已按零加载口径登记。


## 五、逐文件登记（81 行，每行七项必填）

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-chart.xsd

- 职责：DrawingML 图表架构（`c:` 图表空间/系列/坐标轴元素，`…/drawingml/2006/chart`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["chart"]（validators/base.py:56，charts/chartN.xml） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`dml-main.xsd`、`dml-chartDrawing.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `6454ef9a94d52512e4905df61280a3fd1dafc0a4`；sourceSha256 `41b93bd8857cc68b1e43be2806a872d736a9bdd6566900062d8fdb57d7bbb354`；74984 字节 1499 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-chartDrawing.xsd

- 职责：DrawingML 图表绘图架构（`cdr:` 图表内绘图扩展，`…/drawingml/2006/chartDrawing`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `afa4f463e3140a3f626c73f7966d689270d89b2c`；sourceSha256 `3fd0586f2637b98bb9886f0e0b67d89e1cc987c2d158cc7deb5f5b9890ced412`；6956 字节 146 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-diagram.xsd

- 职责：DrawingML 图示/SmartArt 架构（`dgm:`，`…/drawingml/2006/diagram`，1085 行）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`shared-relationshipReference.xsd`、`dml-main.xsd`、`shared-commonSimpleTypes.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `64e66b8abd496d2e450c08110e40607e90b3fe13`；sourceSha256 `29b254ee0d10414a8504b5a08149c7baec35a60d5ff607d6b3f492aa36815f40`；51302 字节 1085 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-lockedCanvas.xsd

- 职责：DrawingML 锁定画布架构（`…/drawingml/2006/lockedCanvas`，锁定形状画布容器）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `687eea8297caa298581aa06c40ca40ef7b8a58bc`；sourceSha256 `5cb76dabd8b97d1e9308a1700b90c20139be4d50792d21a7f09789f5cccd6026`；624 字节 11 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-main.xsd

- 职责：DrawingML 主架构（`a:` 形状/文本/填充/效果核心元素，`…/drawingml/2006/main`，3081 行）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["theme"]/"drawing"（validators/base.py:57-58） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`dml-diagram.xsd`、`dml-chart.xsd`、`dml-picture.xsd`、`dml-lockedCanvas.xsd`；家族内被 import 方：`dml-chart.xsd`、`dml-chartDrawing.xsd`、`dml-diagram.xsd`、`dml-lockedCanvas.xsd`、`dml-picture.xsd`、`dml-spreadsheetDrawing.xsd`、`dml-wordprocessingDrawing.xsd`、`pml.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `6ac81b06b7a3ef916d677953084ae225504a77bc`；sourceSha256 `5375417f0f5394b8dd1a7035b9679151f19a6b65df309dec10cfb4a420cb00e9`；152039 字节 3081 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-picture.xsd

- 职责：DrawingML 图片架构（`pic:` 图片容器，`…/drawingml/2006/picture`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd`、`dml-wordprocessingDrawing.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `1dbf05140d07fa014f18a5630acc0613d8058e52`；sourceSha256 `5d389d42befbebd91945d620242347caecd3367f9a3a7cf8d97949507ae1f53c`；1231 字节 23 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-spreadsheetDrawing.xsd

- 职责：DrawingML 工作表锚定绘图架构（`xdr:`，`…/drawingml/2006/spreadsheetDrawing`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `sml.xsd` 的 `xsd:import` 传递加载（入口：sml（xl/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`、`shared-relationshipReference.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `f1af17db4e83b1c40152577eca4a575ab63a1ca7`；sourceSha256 `b4532b6d258832953fbb3ee4c711f4fe25d3faf46a10644b2505f17010d01e88`；8862 字节 185 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-wordprocessingDrawing.xsd

- 职责：DrawingML 文档锚定绘图架构（`wp:`，`…/drawingml/2006/wordprocessingDrawing`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`、`wml.xsd`、`dml-picture.xsd`、`shared-relationshipReference.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `0a185ab6ed0c2dd9b383a403c56c909bbab8b9a1`；sourceSha256 `bdad416b096b61d37b71603b2c949484f9070c830bdaeba93bf35e15c8900614`；14795 字节 287 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--pml.xsd

- 职责：PresentationML 主架构（`p:` 演示文稿元素，`…/presentationml/2006/main`，1676 行）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["ppt"]（validators/base.py:45）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`dml-main.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `14ef488865f3ae6150776220ebbcf4788f89066a`；sourceSha256 `d173c3e5d61e42e2e3a97226c632fd2ab7cc481fc4e492365b87024ab546daff`；83612 字节 1676 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-additionalCharacteristics.xsd

- 职责：共享「附加特性」简单类型架构（`…/officeDocument/2006/characteristics`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `c20f3bf14720d34247e8e1302dc3c40f7b832099`；sourceSha256 `3c6709101c6aaa82888df5d8795c33f9e857196790eb320d9194e64be2b6bdd8`；1269 字节 28 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-bibliography.xsd

- 职责：共享书目/参考文献架构（`b:` 书目源，`…/officeDocument/2006/bibliography`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `ac60252262534e7b87523fd04d252f085b38bec0`；sourceSha256 `0b364451dc36a48dd6dae0f3b6ada05fd9b71e5208211f8ee5537d7e51a587e2`；7328 字节 144 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-commonSimpleTypes.xsd

- 职责：共享公共简单类型架构（`s:` ST_* 类型全家，`…/officeDocument/2006/sharedTypes`，家族被 import 最多的地基）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd`、`dml-diagram.xsd`、`dml-main.xsd`、`pml.xsd`、`shared-bibliography.xsd`、`shared-customXmlDataProperties.xsd`、`shared-documentPropertiesCustom.xsd`、`shared-documentPropertiesVariantTypes.xsd`、`shared-math.xsd`、`sml.xsd`、`vml-main.xsd`、`vml-officeDrawing.xsd`、`vml-spreadsheetDrawing.xsd`、`wml.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、shared-documentPropertiesCustom（custom.xml）、shared-documentPropertiesExtended（app.xml）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `424b8ba8d1f9ebb22ba72cdd174c8a2ade0ecf89`；sourceSha256 `e2abacbb9a55ce1365f8961bc1b1395bbc811e512b111000d8c333f98458dece`；6382 字节 174 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-customXmlDataProperties.xsd

- 职责：customXml 数据属性架构（`…/officeDocument/2006/customXml`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `2bddce29214882eb9fdf2be8a50ed5bdd0c69dfc`；sourceSha256 `0ef4bb354ff44b923564c4ddbdda5987919d220225129ec94614a618ceafc281`；1248 字节 25 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-customXmlSchemaProperties.xsd

- 职责：schemaLibrary 架构属性（`sl:`，`…/schemaLibrary/2006/main`，被 wml import）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `8a8c18ba2d5caa7e60a365e77ae0d1b872141bb0`；sourceSha256 `0d103b99a4a8652f8871552a69d42d2a3760ac6a5e3ef02d979c4273257ff6a4`；880 字节 18 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesCustom.xsd

- 职责：文档自定义属性架构（docProps/custom.xml 的 `ds:` 自定义属性，`…/custom-properties`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["custom.xml"]（validators/base.py:50） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-documentPropertiesVariantTypes.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `5c42706a0d53c5e8b96818d9c29a292d1504f720`；sourceSha256 `9c085407751b9061c1f996f6c39ce58451be22a8d334f09175f0e89e42736285`；2608 字节 59 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesExtended.xsd

- 职责：文档扩展属性架构（docProps/app.xml 的 `ep:`，`…/extended-properties`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["app.xml"]（validators/base.py:48） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-documentPropertiesVariantTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `853c341c87feb51e10d757aea28b4185ae4c2731`；sourceSha256 `bc92e36ccd233722d4c5869bec71ddc7b12e2df56059942cce5a39065cc9c368`；3507 字节 56 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesVariantTypes.xsd

- 职责：文档属性变体类型（`vt:`，`…/docPropsVTypes`，两 docProps 模块共用）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `shared-documentPropertiesCustom.xsd`、`shared-documentPropertiesExtended.xsd` 的 `xsd:import` 传递加载（入口：shared-documentPropertiesCustom（custom.xml）、shared-documentPropertiesExtended（app.xml），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`shared-commonSimpleTypes.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `da835ee82d5cc31be9fa9792512930f7ae3fb5ce`；sourceSha256 `7b5b7413e2c895b1e148e82e292a117d53c7ec65b0696c992edca57b61b4a74b`；7507 字节 195 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-math.xsd

- 职责：OMML 数学架构（`m:` 公式元素，`…/officeDocument/2006/math`，582 行）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`wml.xsd`、`shared-commonSimpleTypes.xsd`、`xml.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `87ad2658fa51cb4c172f82d0fdf33a492a750eca`；sourceSha256 `3213ef1631606250f5010b42cad7ef716f7c59426367798e33c374c0ec391d3a`；23313 字节 582 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-relationshipReference.xsd

- 职责：关系引用架构（`r:` id 引用类型，`…/officeDocument/2006/relationships`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd`、`dml-diagram.xsd`、`dml-main.xsd`、`dml-spreadsheetDrawing.xsd`、`dml-wordprocessingDrawing.xsd`、`pml.xsd`、`sml.xsd`、`vml-main.xsd`、`vml-officeDrawing.xsd`、`wml.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `9e86f1b2be0d431cd3c250ddeaf4efabdbcb088b`；sourceSha256 `12264f3c03d738311cd9237d212f1c07479e70f0cbe1ae725d29b36539aef637`；1367 字节 25 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--sml.xsd

- 职责：SpreadsheetML 主架构（工作簿/工作表/单元格/公式元素，`…/spreadsheetml/2006/main`，4439 行，家族最大）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["xl"]（validators/base.py:46）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`dml-spreadsheetDrawing.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `d0be42e757f3cce533c1c80770239f0097d3de6b`；sourceSha256 `beffeed56945c22a77440122c8bdc426f3fcbe7f3b12ea0976c770d1f8d54578`；242277 字节 4439 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-main.xsd

- 职责：VML 主架构（`v:` 旧式矢量绘图，`urn:schemas-microsoft-com:vml`，Word 2007 前 w:pict 绘图）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-officeDrawing.xsd`；本模块 import：`vml-officeDrawing.xsd`、`wml.xsd`、`vml-wordprocessingDrawing.xsd`、`shared-relationshipReference.xsd`、`vml-spreadsheetDrawing.xsd`、`vml-presentationDrawing.xsd`、`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `8821dd183caf9c8c3b809e0e2d9e0df56c4e9ed9`；sourceSha256 `f5ee623b08b6a66935e5aced2f5d8ad0fc71bf9e8e833cd490150c0fa94b8763`；26148 字节 570 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-officeDrawing.xsd

- 职责：VML office 绘图扩展（`o:`，`urn:schemas-microsoft-com:office:office`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：`vml-main.xsd`、`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `ca2575c753be78cdaa96de56b3ff8770173c324d`；sourceSha256 `585bedc1313b40888dcc544cb74cd939a105ee674f3b1d3aa1cc6d34f70ff155`；25279 字节 509 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-presentationDrawing.xsd

- 职责：VML PowerPoint 扩展（`urn:schemas-microsoft-com:office:powerpoint`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `dd079e603f5770176212776a1d565b108875cf64`；sourceSha256 `133c9f64a5c5d573b78d0a474122b22506d8eadb5e063f67cdbbb8fa2f161d0e`；535 字节 12 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-spreadsheetDrawing.xsd

- 职责：VML Excel 扩展（`urn:schemas-microsoft-com:office:excel`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `3dd6cf625a740398c2a4dc8abbe18e25e0ac5e9f`；sourceSha256 `6bdeb169c3717eb01108853bd9fc5a3750fb1fa5b82abbdd854d49855a40f519`；5712 字节 108 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-wordprocessingDrawing.xsd

- 职责：VML Word 扩展（`urn:schemas-microsoft-com:office:word`）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `f1041e34ef365926f5670b896f5bb23e553ac36d`；sourceSha256 `475dcae1e7d1ea46232db6f8481040c15e53a52a3c256831d3df204212b0e831`；4010 字节 96 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--wml.xsd

- 职责：WordprocessingML 主架构（`w:` 文档元素全家，`…/wordprocessingml/2006/main`，3646 行）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["word"]（validators/base.py:44）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`dml-wordprocessingDrawing.xsd`、`shared-math.xsd`、`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`shared-customXmlSchemaProperties.xsd`；家族内被 import 方：`dml-wordprocessingDrawing.xsd`、`shared-math.xsd`、`vml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `9c5b7a633411c2313ce839f748e4623bb0a70efe`；sourceSha256 `c2dd9f61f892deae6acd8d20771ea79b12018af25f3bf8d06639c8542d218cfd`；171367 字节 3646 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--docx--scripts--office--schemas--ISO-IEC29500-4_2016--xml.xsd

- 职责：W3C xml: 命名空间架构（`xml:base/lang/space` 特殊属性组，`http://www.w3.org/XML/1998/namespace`，W3C 标准文本）；本行为 `docx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `shared-math.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `0f13678d80a762375223f060e23b56c7b2eac89e`；sourceSha256 `a539aa2fb154fa50e0f5cc97e6ad7cbc66f8ec3e3746f61ec6a8b0d5d15ecdf2`；4646 字节 116 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，docx 技能校验环节（docx/SKILL.md:76-78「After creating the file, validate it」指引 validate.py）中断；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-chart.xsd

- 职责：DrawingML 图表架构（`c:` 图表空间/系列/坐标轴元素，`…/drawingml/2006/chart`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["chart"]（validators/base.py:56，charts/chartN.xml） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`dml-main.xsd`、`dml-chartDrawing.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `6454ef9a94d52512e4905df61280a3fd1dafc0a4`；sourceSha256 `41b93bd8857cc68b1e43be2806a872d736a9bdd6566900062d8fdb57d7bbb354`；74984 字节 1499 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-chartDrawing.xsd

- 职责：DrawingML 图表绘图架构（`cdr:` 图表内绘图扩展，`…/drawingml/2006/chartDrawing`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `afa4f463e3140a3f626c73f7966d689270d89b2c`；sourceSha256 `3fd0586f2637b98bb9886f0e0b67d89e1cc987c2d158cc7deb5f5b9890ced412`；6956 字节 146 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-diagram.xsd

- 职责：DrawingML 图示/SmartArt 架构（`dgm:`，`…/drawingml/2006/diagram`，1085 行）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`shared-relationshipReference.xsd`、`dml-main.xsd`、`shared-commonSimpleTypes.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `64e66b8abd496d2e450c08110e40607e90b3fe13`；sourceSha256 `29b254ee0d10414a8504b5a08149c7baec35a60d5ff607d6b3f492aa36815f40`；51302 字节 1085 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-lockedCanvas.xsd

- 职责：DrawingML 锁定画布架构（`…/drawingml/2006/lockedCanvas`，锁定形状画布容器）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `687eea8297caa298581aa06c40ca40ef7b8a58bc`；sourceSha256 `5cb76dabd8b97d1e9308a1700b90c20139be4d50792d21a7f09789f5cccd6026`；624 字节 11 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-main.xsd

- 职责：DrawingML 主架构（`a:` 形状/文本/填充/效果核心元素，`…/drawingml/2006/main`，3081 行）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["theme"]/"drawing"（validators/base.py:57-58） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`dml-diagram.xsd`、`dml-chart.xsd`、`dml-picture.xsd`、`dml-lockedCanvas.xsd`；家族内被 import 方：`dml-chart.xsd`、`dml-chartDrawing.xsd`、`dml-diagram.xsd`、`dml-lockedCanvas.xsd`、`dml-picture.xsd`、`dml-spreadsheetDrawing.xsd`、`dml-wordprocessingDrawing.xsd`、`pml.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `6ac81b06b7a3ef916d677953084ae225504a77bc`；sourceSha256 `5375417f0f5394b8dd1a7035b9679151f19a6b65df309dec10cfb4a420cb00e9`；152039 字节 3081 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-picture.xsd

- 职责：DrawingML 图片架构（`pic:` 图片容器，`…/drawingml/2006/picture`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd`、`dml-wordprocessingDrawing.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `1dbf05140d07fa014f18a5630acc0613d8058e52`；sourceSha256 `5d389d42befbebd91945d620242347caecd3367f9a3a7cf8d97949507ae1f53c`；1231 字节 23 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-spreadsheetDrawing.xsd

- 职责：DrawingML 工作表锚定绘图架构（`xdr:`，`…/drawingml/2006/spreadsheetDrawing`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `sml.xsd` 的 `xsd:import` 传递加载（入口：sml（xl/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`、`shared-relationshipReference.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `f1af17db4e83b1c40152577eca4a575ab63a1ca7`；sourceSha256 `b4532b6d258832953fbb3ee4c711f4fe25d3faf46a10644b2505f17010d01e88`；8862 字节 185 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-wordprocessingDrawing.xsd

- 职责：DrawingML 文档锚定绘图架构（`wp:`，`…/drawingml/2006/wordprocessingDrawing`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`、`wml.xsd`、`dml-picture.xsd`、`shared-relationshipReference.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `0a185ab6ed0c2dd9b383a403c56c909bbab8b9a1`；sourceSha256 `bdad416b096b61d37b71603b2c949484f9070c830bdaeba93bf35e15c8900614`；14795 字节 287 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--pml.xsd

- 职责：PresentationML 主架构（`p:` 演示文稿元素，`…/presentationml/2006/main`，1676 行）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["ppt"]（validators/base.py:45）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`dml-main.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `14ef488865f3ae6150776220ebbcf4788f89066a`；sourceSha256 `d173c3e5d61e42e2e3a97226c632fd2ab7cc481fc4e492365b87024ab546daff`；83612 字节 1676 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-additionalCharacteristics.xsd

- 职责：共享「附加特性」简单类型架构（`…/officeDocument/2006/characteristics`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `c20f3bf14720d34247e8e1302dc3c40f7b832099`；sourceSha256 `3c6709101c6aaa82888df5d8795c33f9e857196790eb320d9194e64be2b6bdd8`；1269 字节 28 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-bibliography.xsd

- 职责：共享书目/参考文献架构（`b:` 书目源，`…/officeDocument/2006/bibliography`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `ac60252262534e7b87523fd04d252f085b38bec0`；sourceSha256 `0b364451dc36a48dd6dae0f3b6ada05fd9b71e5208211f8ee5537d7e51a587e2`；7328 字节 144 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-commonSimpleTypes.xsd

- 职责：共享公共简单类型架构（`s:` ST_* 类型全家，`…/officeDocument/2006/sharedTypes`，家族被 import 最多的地基）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd`、`dml-diagram.xsd`、`dml-main.xsd`、`pml.xsd`、`shared-bibliography.xsd`、`shared-customXmlDataProperties.xsd`、`shared-documentPropertiesCustom.xsd`、`shared-documentPropertiesVariantTypes.xsd`、`shared-math.xsd`、`sml.xsd`、`vml-main.xsd`、`vml-officeDrawing.xsd`、`vml-spreadsheetDrawing.xsd`、`wml.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、shared-documentPropertiesCustom（custom.xml）、shared-documentPropertiesExtended（app.xml）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `424b8ba8d1f9ebb22ba72cdd174c8a2ade0ecf89`；sourceSha256 `e2abacbb9a55ce1365f8961bc1b1395bbc811e512b111000d8c333f98458dece`；6382 字节 174 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-customXmlDataProperties.xsd

- 职责：customXml 数据属性架构（`…/officeDocument/2006/customXml`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `2bddce29214882eb9fdf2be8a50ed5bdd0c69dfc`；sourceSha256 `0ef4bb354ff44b923564c4ddbdda5987919d220225129ec94614a618ceafc281`；1248 字节 25 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-customXmlSchemaProperties.xsd

- 职责：schemaLibrary 架构属性（`sl:`，`…/schemaLibrary/2006/main`，被 wml import）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `8a8c18ba2d5caa7e60a365e77ae0d1b872141bb0`；sourceSha256 `0d103b99a4a8652f8871552a69d42d2a3760ac6a5e3ef02d979c4273257ff6a4`；880 字节 18 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesCustom.xsd

- 职责：文档自定义属性架构（docProps/custom.xml 的 `ds:` 自定义属性，`…/custom-properties`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["custom.xml"]（validators/base.py:50） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-documentPropertiesVariantTypes.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `5c42706a0d53c5e8b96818d9c29a292d1504f720`；sourceSha256 `9c085407751b9061c1f996f6c39ce58451be22a8d334f09175f0e89e42736285`；2608 字节 59 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesExtended.xsd

- 职责：文档扩展属性架构（docProps/app.xml 的 `ep:`，`…/extended-properties`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["app.xml"]（validators/base.py:48） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-documentPropertiesVariantTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `853c341c87feb51e10d757aea28b4185ae4c2731`；sourceSha256 `bc92e36ccd233722d4c5869bec71ddc7b12e2df56059942cce5a39065cc9c368`；3507 字节 56 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesVariantTypes.xsd

- 职责：文档属性变体类型（`vt:`，`…/docPropsVTypes`，两 docProps 模块共用）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `shared-documentPropertiesCustom.xsd`、`shared-documentPropertiesExtended.xsd` 的 `xsd:import` 传递加载（入口：shared-documentPropertiesCustom（custom.xml）、shared-documentPropertiesExtended（app.xml），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`shared-commonSimpleTypes.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `da835ee82d5cc31be9fa9792512930f7ae3fb5ce`；sourceSha256 `7b5b7413e2c895b1e148e82e292a117d53c7ec65b0696c992edca57b61b4a74b`；7507 字节 195 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-math.xsd

- 职责：OMML 数学架构（`m:` 公式元素，`…/officeDocument/2006/math`，582 行）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`wml.xsd`、`shared-commonSimpleTypes.xsd`、`xml.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `87ad2658fa51cb4c172f82d0fdf33a492a750eca`；sourceSha256 `3213ef1631606250f5010b42cad7ef716f7c59426367798e33c374c0ec391d3a`；23313 字节 582 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-relationshipReference.xsd

- 职责：关系引用架构（`r:` id 引用类型，`…/officeDocument/2006/relationships`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd`、`dml-diagram.xsd`、`dml-main.xsd`、`dml-spreadsheetDrawing.xsd`、`dml-wordprocessingDrawing.xsd`、`pml.xsd`、`sml.xsd`、`vml-main.xsd`、`vml-officeDrawing.xsd`、`wml.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `9e86f1b2be0d431cd3c250ddeaf4efabdbcb088b`；sourceSha256 `12264f3c03d738311cd9237d212f1c07479e70f0cbe1ae725d29b36539aef637`；1367 字节 25 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--sml.xsd

- 职责：SpreadsheetML 主架构（工作簿/工作表/单元格/公式元素，`…/spreadsheetml/2006/main`，4439 行，家族最大）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["xl"]（validators/base.py:46）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`dml-spreadsheetDrawing.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `d0be42e757f3cce533c1c80770239f0097d3de6b`；sourceSha256 `beffeed56945c22a77440122c8bdc426f3fcbe7f3b12ea0976c770d1f8d54578`；242277 字节 4439 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-main.xsd

- 职责：VML 主架构（`v:` 旧式矢量绘图，`urn:schemas-microsoft-com:vml`，Word 2007 前 w:pict 绘图）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-officeDrawing.xsd`；本模块 import：`vml-officeDrawing.xsd`、`wml.xsd`、`vml-wordprocessingDrawing.xsd`、`shared-relationshipReference.xsd`、`vml-spreadsheetDrawing.xsd`、`vml-presentationDrawing.xsd`、`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `8821dd183caf9c8c3b809e0e2d9e0df56c4e9ed9`；sourceSha256 `f5ee623b08b6a66935e5aced2f5d8ad0fc71bf9e8e833cd490150c0fa94b8763`；26148 字节 570 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-officeDrawing.xsd

- 职责：VML office 绘图扩展（`o:`，`urn:schemas-microsoft-com:office:office`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：`vml-main.xsd`、`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `ca2575c753be78cdaa96de56b3ff8770173c324d`；sourceSha256 `585bedc1313b40888dcc544cb74cd939a105ee674f3b1d3aa1cc6d34f70ff155`；25279 字节 509 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-presentationDrawing.xsd

- 职责：VML PowerPoint 扩展（`urn:schemas-microsoft-com:office:powerpoint`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `dd079e603f5770176212776a1d565b108875cf64`；sourceSha256 `133c9f64a5c5d573b78d0a474122b22506d8eadb5e063f67cdbbb8fa2f161d0e`；535 字节 12 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-spreadsheetDrawing.xsd

- 职责：VML Excel 扩展（`urn:schemas-microsoft-com:office:excel`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `3dd6cf625a740398c2a4dc8abbe18e25e0ac5e9f`；sourceSha256 `6bdeb169c3717eb01108853bd9fc5a3750fb1fa5b82abbdd854d49855a40f519`；5712 字节 108 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-wordprocessingDrawing.xsd

- 职责：VML Word 扩展（`urn:schemas-microsoft-com:office:word`）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `f1041e34ef365926f5670b896f5bb23e553ac36d`；sourceSha256 `475dcae1e7d1ea46232db6f8481040c15e53a52a3c256831d3df204212b0e831`；4010 字节 96 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前 validate.py 行为不变**（零加载，负向检索证实）；影响=ISO 家族完整性与未来接入（VML/书目/customXml 校验）断供，及 microsoft/其它家族反向 import 时的连带缺失——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--wml.xsd

- 职责：WordprocessingML 主架构（`w:` 文档元素全家，`…/wordprocessingml/2006/main`，3646 行）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：SCHEMA_MAPPINGS["word"]（validators/base.py:44）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`dml-wordprocessingDrawing.xsd`、`shared-math.xsd`、`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`shared-customXmlSchemaProperties.xsd`；家族内被 import 方：`dml-wordprocessingDrawing.xsd`、`shared-math.xsd`、`vml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `9c5b7a633411c2313ce839f748e4623bb0a70efe`；sourceSha256 `c2dd9f61f892deae6acd8d20771ea79b12018af25f3bf8d06639c8542d218cfd`；171367 字节 3646 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--pptx--scripts--office--schemas--ISO-IEC29500-4_2016--xml.xsd

- 职责：W3C xml: 命名空间架构（`xml:base/lang/space` 特殊属性组，`http://www.w3.org/XML/1998/namespace`，W3C 标准文本）；本行为 `pptx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：无直接 SCHEMA_MAPPINGS 条目；经 `shared-math.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `0f13678d80a762375223f060e23b56c7b2eac89e`；sourceSha256 `a539aa2fb154fa50e0f5cc97e6ad7cbc66f8ec3e3746f61ec6a8b0d5d15ecdf2`；4646 字节 116 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏（或断其 import 目标）→ `_validate_single_file_xsd` 构建 schema 抛异常（base.py:784-785 捕获记 error）→ 校验判失败 → `validate.py:107` `sys.exit(1)`，CLI/打包工具链支持的 .pptx 校验中断（validate.py:89-92、pack.py:85-91 打包校验链；pptx/SKILL.md 无 validate.py 引用——N-01 口径）；放宽架构→非法 OOXML 反而过校验、Office 可能拒开。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：加载映射与 import 链=**证实**（validators/base.py:43-59/:685-699/:751-761 实读 + schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-chart.xsd

- 职责：DrawingML 图表架构（`c:` 图表空间/系列/坐标轴元素，`…/drawingml/2006/chart`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：SCHEMA_MAPPINGS["chart"]（validators/base.py:56，charts/chartN.xml） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`dml-main.xsd`、`dml-chartDrawing.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chart.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `6454ef9a94d52512e4905df61280a3fd1dafc0a4`；sourceSha256 `41b93bd8857cc68b1e43be2806a872d736a9bdd6566900062d8fdb57d7bbb354`；74984 字节 1499 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-chartDrawing.xsd

- 职责：DrawingML 图表绘图架构（`cdr:` 图表内绘图扩展，`…/drawingml/2006/chartDrawing`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-chartDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `afa4f463e3140a3f626c73f7966d689270d89b2c`；sourceSha256 `3fd0586f2637b98bb9886f0e0b67d89e1cc987c2d158cc7deb5f5b9890ced412`；6956 字节 146 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-diagram.xsd

- 职责：DrawingML 图示/SmartArt 架构（`dgm:`，`…/drawingml/2006/diagram`，1085 行）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`shared-relationshipReference.xsd`、`dml-main.xsd`、`shared-commonSimpleTypes.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-diagram.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `64e66b8abd496d2e450c08110e40607e90b3fe13`；sourceSha256 `29b254ee0d10414a8504b5a08149c7baec35a60d5ff607d6b3f492aa36815f40`；51302 字节 1085 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-lockedCanvas.xsd

- 职责：DrawingML 锁定画布架构（`…/drawingml/2006/lockedCanvas`，锁定形状画布容器）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-lockedCanvas.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `687eea8297caa298581aa06c40ca40ef7b8a58bc`；sourceSha256 `5cb76dabd8b97d1e9308a1700b90c20139be4d50792d21a7f09789f5cccd6026`；624 字节 11 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-main.xsd

- 职责：DrawingML 主架构（`a:` 形状/文本/填充/效果核心元素，`…/drawingml/2006/main`，3081 行）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：SCHEMA_MAPPINGS["theme"]/"drawing"（validators/base.py:57-58） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`dml-diagram.xsd`、`dml-chart.xsd`、`dml-picture.xsd`、`dml-lockedCanvas.xsd`；家族内被 import 方：`dml-chart.xsd`、`dml-chartDrawing.xsd`、`dml-diagram.xsd`、`dml-lockedCanvas.xsd`、`dml-picture.xsd`、`dml-spreadsheetDrawing.xsd`、`dml-wordprocessingDrawing.xsd`、`pml.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-main.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `6ac81b06b7a3ef916d677953084ae225504a77bc`；sourceSha256 `5375417f0f5394b8dd1a7035b9679151f19a6b65df309dec10cfb4a420cb00e9`；152039 字节 3081 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-picture.xsd

- 职责：DrawingML 图片架构（`pic:` 图片容器，`…/drawingml/2006/picture`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `dml-main.xsd`、`dml-wordprocessingDrawing.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-picture.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `1dbf05140d07fa014f18a5630acc0613d8058e52`；sourceSha256 `5d389d42befbebd91945d620242347caecd3367f9a3a7cf8d97949507ae1f53c`；1231 字节 23 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-spreadsheetDrawing.xsd

- 职责：DrawingML 工作表锚定绘图架构（`xdr:`，`…/drawingml/2006/spreadsheetDrawing`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `sml.xsd` 的 `xsd:import` 传递加载（入口：sml（xl/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`、`shared-relationshipReference.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-spreadsheetDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `f1af17db4e83b1c40152577eca4a575ab63a1ca7`；sourceSha256 `b4532b6d258832953fbb3ee4c711f4fe25d3faf46a10644b2505f17010d01e88`；8862 字节 185 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--dml-wordprocessingDrawing.xsd

- 职责：DrawingML 文档锚定绘图架构（`wp:`，`…/drawingml/2006/wordprocessingDrawing`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`dml-main.xsd`、`wml.xsd`、`dml-picture.xsd`、`shared-relationshipReference.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/dml-wordprocessingDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `0a185ab6ed0c2dd9b383a403c56c909bbab8b9a1`；sourceSha256 `bdad416b096b61d37b71603b2c949484f9070c830bdaeba93bf35e15c8900614`；14795 字节 287 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--pml.xsd

- 职责：PresentationML 主架构（`p:` 演示文稿元素，`…/presentationml/2006/main`，1676 行）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：SCHEMA_MAPPINGS["ppt"]（validators/base.py:45）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`dml-main.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/pml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `14ef488865f3ae6150776220ebbcf4788f89066a`；sourceSha256 `d173c3e5d61e42e2e3a97226c632fd2ab7cc481fc4e492365b87024ab546daff`；83612 字节 1676 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-additionalCharacteristics.xsd

- 职责：共享「附加特性」简单类型架构（`…/officeDocument/2006/characteristics`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-additionalCharacteristics.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `c20f3bf14720d34247e8e1302dc3c40f7b832099`；sourceSha256 `3c6709101c6aaa82888df5d8795c33f9e857196790eb320d9194e64be2b6bdd8`；1269 字节 28 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-bibliography.xsd

- 职责：共享书目/参考文献架构（`b:` 书目源，`…/officeDocument/2006/bibliography`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-bibliography.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `ac60252262534e7b87523fd04d252f085b38bec0`；sourceSha256 `0b364451dc36a48dd6dae0f3b6ada05fd9b71e5208211f8ee5537d7e51a587e2`；7328 字节 144 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-commonSimpleTypes.xsd

- 职责：共享公共简单类型架构（`s:` ST_* 类型全家，`…/officeDocument/2006/sharedTypes`，家族被 import 最多的地基）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd`、`dml-diagram.xsd`、`dml-main.xsd`、`pml.xsd`、`shared-bibliography.xsd`、`shared-customXmlDataProperties.xsd`、`shared-documentPropertiesCustom.xsd`、`shared-documentPropertiesVariantTypes.xsd`、`shared-math.xsd`、`sml.xsd`、`vml-main.xsd`、`vml-officeDrawing.xsd`、`vml-spreadsheetDrawing.xsd`、`wml.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、shared-documentPropertiesCustom（custom.xml）、shared-documentPropertiesExtended（app.xml）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-commonSimpleTypes.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `424b8ba8d1f9ebb22ba72cdd174c8a2ade0ecf89`；sourceSha256 `e2abacbb9a55ce1365f8961bc1b1395bbc811e512b111000d8c333f98458dece`；6382 字节 174 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-customXmlDataProperties.xsd

- 职责：customXml 数据属性架构（`…/officeDocument/2006/customXml`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：无（本家族内无 import 引用方）；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlDataProperties.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `2bddce29214882eb9fdf2be8a50ed5bdd0c69dfc`；sourceSha256 `0ef4bb354ff44b923564c4ddbdda5987919d220225129ec94614a618ceafc281`；1248 字节 25 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-customXmlSchemaProperties.xsd

- 职责：schemaLibrary 架构属性（`sl:`，`…/schemaLibrary/2006/main`，被 wml import）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-customXmlSchemaProperties.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `8a8c18ba2d5caa7e60a365e77ae0d1b872141bb0`；sourceSha256 `0d103b99a4a8652f8871552a69d42d2a3760ac6a5e3ef02d979c4273257ff6a4`；880 字节 18 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesCustom.xsd

- 职责：文档自定义属性架构（docProps/custom.xml 的 `ds:` 自定义属性，`…/custom-properties`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：SCHEMA_MAPPINGS["custom.xml"]（validators/base.py:50） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-documentPropertiesVariantTypes.xsd`、`shared-commonSimpleTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesCustom.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `5c42706a0d53c5e8b96818d9c29a292d1504f720`；sourceSha256 `9c085407751b9061c1f996f6c39ce58451be22a8d334f09175f0e89e42736285`；2608 字节 59 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesExtended.xsd

- 职责：文档扩展属性架构（docProps/app.xml 的 `ep:`，`…/extended-properties`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：SCHEMA_MAPPINGS["app.xml"]（validators/base.py:48） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-documentPropertiesVariantTypes.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `853c341c87feb51e10d757aea28b4185ae4c2731`；sourceSha256 `bc92e36ccd233722d4c5869bec71ddc7b12e2df56059942cce5a39065cc9c368`；3507 字节 56 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-documentPropertiesVariantTypes.xsd

- 职责：文档属性变体类型（`vt:`，`…/docPropsVTypes`，两 docProps 模块共用）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `shared-documentPropertiesCustom.xsd`、`shared-documentPropertiesExtended.xsd` 的 `xsd:import` 传递加载（入口：shared-documentPropertiesCustom（custom.xml）、shared-documentPropertiesExtended（app.xml），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`shared-commonSimpleTypes.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-documentPropertiesVariantTypes.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `da835ee82d5cc31be9fa9792512930f7ae3fb5ce`；sourceSha256 `7b5b7413e2c895b1e148e82e292a117d53c7ec65b0696c992edca57b61b4a74b`；7507 字节 195 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-math.xsd

- 职责：OMML 数学架构（`m:` 公式元素，`…/officeDocument/2006/math`，582 行）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `wml.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：`wml.xsd`、`shared-commonSimpleTypes.xsd`、`xml.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-math.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `87ad2658fa51cb4c172f82d0fdf33a492a750eca`；sourceSha256 `3213ef1631606250f5010b42cad7ef716f7c59426367798e33c374c0ec391d3a`；23313 字节 582 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--shared-relationshipReference.xsd

- 职责：关系引用架构（`r:` id 引用类型，`…/officeDocument/2006/relationships`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `dml-chart.xsd`、`dml-diagram.xsd`、`dml-main.xsd`、`dml-spreadsheetDrawing.xsd`、`dml-wordprocessingDrawing.xsd`、`pml.xsd`、`sml.xsd`、`vml-main.xsd`、`vml-officeDrawing.xsd`、`wml.xsd` 的 `xsd:import` 传递加载（入口：dml-chart（chart）、dml-main（theme/、drawing/）、pml（ppt/）、sml（xl/）、wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/shared-relationshipReference.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `9e86f1b2be0d431cd3c250ddeaf4efabdbcb088b`；sourceSha256 `12264f3c03d738311cd9237d212f1c07479e70f0cbe1ae725d29b36539aef637`；1367 字节 25 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--sml.xsd

- 职责：SpreadsheetML 主架构（工作簿/工作表/单元格/公式元素，`…/spreadsheetml/2006/main`，4439 行，家族最大）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：SCHEMA_MAPPINGS["xl"]（validators/base.py:46）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`dml-spreadsheetDrawing.xsd`；家族内被 import 方：无（本家族内无 import 引用方）。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/sml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `d0be42e757f3cce533c1c80770239f0097d3de6b`；sourceSha256 `beffeed56945c22a77440122c8bdc426f3fcbe7f3b12ea0976c770d1f8d54578`；242277 字节 4439 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-main.xsd

- 职责：VML 主架构（`v:` 旧式矢量绘图，`urn:schemas-microsoft-com:vml`，Word 2007 前 w:pict 绘图）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-officeDrawing.xsd`；本模块 import：`vml-officeDrawing.xsd`、`wml.xsd`、`vml-wordprocessingDrawing.xsd`、`shared-relationshipReference.xsd`、`vml-spreadsheetDrawing.xsd`、`vml-presentationDrawing.xsd`、`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-main.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `8821dd183caf9c8c3b809e0e2d9e0df56c4e9ed9`；sourceSha256 `f5ee623b08b6a66935e5aced2f5d8ad0fc71bf9e8e833cd490150c0fa94b8763`；26148 字节 570 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-officeDrawing.xsd

- 职责：VML office 绘图扩展（`o:`，`urn:schemas-microsoft-com:office:office`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：`vml-main.xsd`、`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-officeDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `ca2575c753be78cdaa96de56b3ff8770173c324d`；sourceSha256 `585bedc1313b40888dcc544cb74cd939a105ee674f3b1d3aa1cc6d34f70ff155`；25279 字节 509 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-presentationDrawing.xsd

- 职责：VML PowerPoint 扩展（`urn:schemas-microsoft-com:office:powerpoint`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-presentationDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `dd079e603f5770176212776a1d565b108875cf64`；sourceSha256 `133c9f64a5c5d573b78d0a474122b22506d8eadb5e063f67cdbbb8fa2f161d0e`；535 字节 12 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-spreadsheetDrawing.xsd

- 职责：VML Excel 扩展（`urn:schemas-microsoft-com:office:excel`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：`shared-commonSimpleTypes.xsd`）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-spreadsheetDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `3dd6cf625a740398c2a4dc8abbe18e25e0ac5e9f`；sourceSha256 `6bdeb169c3717eb01108853bd9fc5a3750fb1fa5b82abbdd854d49855a40f519`；5712 字节 108 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--vml-wordprocessingDrawing.xsd

- 职责：VML Word 扩展（`urn:schemas-microsoft-com:office:word`）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：当前**零加载**——SCHEMA_MAPPINGS 无条目、全 schemas 目录 `grep schemaLocation` 除 vml 族内部互引外无任何 import 引用（家族内 import 方：`vml-main.xsd`；本模块 import：无）——负向检索证实，详见篇首「当前零加载」清单。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/vml-wordprocessingDrawing.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `f1041e34ef365926f5670b896f5bb23e553ac36d`；sourceSha256 `475dcae1e7d1ea46232db6f8481040c15e53a52a3c256831d3df204212b0e831`；4010 字节 96 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--wml.xsd

- 职责：WordprocessingML 主架构（`w:` 文档元素全家，`…/wordprocessingml/2006/main`，3646 行）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：SCHEMA_MAPPINGS["word"]（validators/base.py:44）+主内容目录规则（:698-699） 直接映射本模块为 OOXML part 校验架构（按文件名/目录规则命中，base.py:686-699）；`xsd:import` 拉入：`dml-wordprocessingDrawing.xsd`、`shared-math.xsd`、`shared-relationshipReference.xsd`、`shared-commonSimpleTypes.xsd`、`shared-customXmlSchemaProperties.xsd`；家族内被 import 方：`dml-wordprocessingDrawing.xsd`、`shared-math.xsd`、`vml-main.xsd`。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/wml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `9c5b7a633411c2313ce839f748e4623bb0a70efe`；sourceSha256 `c2dd9f61f892deae6acd8d20771ea79b12018af25f3bf8d06639c8542d218cfd`；171367 字节 3646 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ISO-IEC29500-4_2016--xml.xsd

- 职责：W3C xml: 命名空间架构（`xml:base/lang/space` 特殊属性组，`http://www.w3.org/XML/1998/namespace`，W3C 标准文本）；本行为 `xlsx` 技能副本（三副本之一，docx/pptx/xlsx 三份字节全等）。
- 消费（谁加载）：**校验加载映射**：**零加载/不可达（F-01 修正）**——xlsx 副本经现有产品流程不可达：xlsx/SKILL.md 对 validate/validators 零引用（实测）、validate.py 三副本同一文件（sha256 `1aef24f8e316965a…`）dispatch 拒 .xlsx（:93-95）、全树无 XLSX 校验器（`validators/__init__.py` 仅导出 Base/DOCX/PPTX/Redlining）；仅非常规地以本副本 validate.py 校 .docx/.pptx 时才会加载（未见消费者）。家族模块层面映射事实（供未来接入参考）：无直接 SCHEMA_MAPPINGS 条目；经 `shared-math.xsd` 的 `xsd:import` 传递加载（入口：wml（word/），base.py:751-761 `lxml.etree.XMLSchema` 按 base_url 解析相对 import）；本模块 import：无。三副本映射：`docx|pptx|xlsx/scripts/office/schemas/ISO-IEC29500-4_2016/xml.xsd`（实测 sha256 三副本同值）。
- 来源与 hash：vendor ISO/IEC 29500-4:2016（ECMA-376）架构文本（出处=推断，见篇首）；`change=unchanged_since_093f`（锁列照录）；sourceBlob `0f13678d80a762375223f060e23b56c7b2eac89e`；sourceSha256 `a539aa2fb154fa50e0f5cc97e6ad7cbc66f8ec3e3746f61ec6a8b0d5d15ecdf2`；4646 字节 116 行。
- 打包：进产物——`electron-builder.yml:70-75` extraResources（from/to :72-73、filter :74-75）`default-skills/**/*` 随技能目录入 `process.resourcesPath/default-skills`（index.ts:939-941 定位）。
- 影响：删/改坏→**当前运行时影响=无**（xlsx 副本零加载/不可达，负向检索证实——F-01 修正口径，与 vml 族同级）；影响=ISO 家族完整性与未来接入（.xlsx 校验接入）断供——本行如实登记而不以「资源/无逻辑」带过。
- 验证：①三副本 sha256 相等并对锁（MANIFEST 机械列；作者已实测抽查 dml-chart/wml/xml/vml-main 三副本全同）；②`grep schemaLocation` 重建 import 图核对本行链路；③实跑 `scripts/office/validate.py` 校验含相关 part 的 OOXML（本轮 NOT_RUN）。
- 证实/推断/未知：本副本零加载/不可达=**证实**（负向检索：xlsx/SKILL.md 零引用 + validate.py:93-95 拒 .xlsx + 全树无 XLSX 校验器）；模块 import 链事实=**证实**（schemaLocation 实测建图）；三副本全等=**证实**（sha256 实测）；vendor 出处=**推断**（命名空间/结构吻合 ISO/IEC 29500-4:2016，文件内无厂商版本声明）；引入 commit=**未知**（未查 git 历史）。

