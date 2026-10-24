# p02-agent-runtime__vendor-xsd__ecma — vendor XSD 家族索引（ECMA-376 OPC 四 schema × docx/pptx/xlsx 三副本）

> 冻结源只读：`baseline/source` @ git HEAD `05fb2565e20eb1760233696be1832f68196b37c2`（本轮实测 `git rev-parse HEAD` 相符、tree clean）。范围 12 文件（4 家族 × 3 副本）。本轮产品运行统一 **NOT_RUN**。以下结论均由本作者独立 grep/read/sha256sum 核实，`inventory/INDEX-FACTS.tsv` 仅作线索未采信进正文。

**家族总述**（按合同置于各文件 `##` 节之前）：

- **家族是什么**：ECMA-376 Open Packaging Conventions（OPC）4th edition 的四个 vendor schema，位于 `apps/electron/default-skills/{docx,pptx,xlsx}/scripts/office/schemas/ecma/fouth-edition/`：
  - `opc-contentTypes.xsd`：包内容类型清单部件 `[Content_Types].xml` 的模型（targetNamespace `http://schemas.openxmlformats.org/package/2006/content-types`）；
  - `opc-coreProperties.xsd`：核心文档属性部件 `core.xml` 的模型（targetNamespace `http://schemas.openxmlformats.org/package/2006/metadata/core-properties`）；
  - `opc-digSig.xsd`：OPC 数字签名补充部件的模型（targetNamespace `http://schemas.openxmlformats.org/package/2006/digital-signature`）；
  - `opc-relationships.xsd`：关系清单部件 `*.rels` 的模型（targetNamespace `http://schemas.openxmlformats.org/package/2006/relationships`）。
  归属「ECMA-376 OPC 4th edition」为**推断**（依据：目录名 `ecma/fouth-edition`、OPC 2006 包命名空间、文件名对应 OPC 各部件；四文件内均无出处注释——见下）。目录名实为 **`fouth-edition`**（源目录实名拼写，如实记录，未改）。
- **来源注释（实读 XSD 头部）**：`opc-contentTypes.xsd`（42 行，首行为 BOM+XML 声明）、`opc-coreProperties.xsd`（50 行）、`opc-digSig.xsd`（49 行）、`opc-relationships.xsd`（33 行）**全文均无任何 XML 注释/头部出处注释**（证实，逐文件通读）。对照同批 vendor 的 `mce/mc.xsd:7-25` 有出处注释（docx4j `markup-compatibility-2006-MINIMAL.xsd` 修改版、ECMA-376 4th Ed. Part 3），ecma 四文件没有同类注释。
- **三副本映射（自己 sha256sum 实测）**：每个家族在 docx/pptx/xlsx 三处落盘，**三副本逐字节相同**（各家族单一内容三处复制）：

  | 家族文件 | sha256（三副本相同） | bytes/lines | git hash-object（=sourceBlob） |
  |---|---|---|---|
  | opc-contentTypes.xsd | `9e0b7209fc69ab11987900404540969976000c5ebe4d4f58c43dc3842886bf3a` | 1963/42 | `a6de9d2733d3f0eea12ae87b24122495df1f0928` |
  | opc-coreProperties.xsd | `451958454e8588dfc7cd945981ada142ca06ff3307937f5700df059c2b307fa8` | 2515/50 | `10e978b661fc291cbeea9ab0c248601cf216f96d` |
  | opc-digSig.xsd | `6de111e11403f7cd49027400755bae0ea1cabef2815f09bd40a24f0017613b24` | 2856/49 | `4248bf7a39c793c9f319bae7d09f92983efe5368` |
  | opc-relationships.xsd | `f565adfef5a502044abc3a9153e157edc25af78304d335994afb958874b15e26` | 1344/33 | `56497467120b52b742756379959d4b2536be6df7` |

  与 `inventory/INDEX-SCOPE-LOCK.json` 本 group manifest 的 sourceSha256/sourceBlob/bytes/lines 逐一相符（sha256sum + git hash-object + wc 实测）。
- **校验加载映射（实读 `apps/electron/default-skills/docx/scripts/office/validators/base.py`；三副本 base.py sha256 全等 `d6358b67252df4dbfe4fa6647423a765960c949346ef6a8c4eb8722bb1108d25`，行号同）**：
  - `SCHEMA_MAPPINGS`（**:43-59**，核实真实行号）中本家族三条：`"[Content_Types].xml" → "ecma/fouth-edition/opc-contentTypes.xsd"`（**:47**）、`"core.xml" → "ecma/fouth-edition/opc-coreProperties.xsd"`（**:49**）、`".rels" → "ecma/fouth-edition/opc-relationships.xsd"`（**:51**）。同表另有 `"word"→wml.xsd`（:44）、`"ppt"→pml.xsd`（:45）、`"xl"→sml.xsd`（:46）、`"app.xml"→shared-documentPropertiesExtended.xsd`（:48）等 ISO/MS 映射。`opc-digSig.xsd` **不在映射中**。
  - `schemas_dir` 构造：`base.py:99` `self.schemas_dir = Path(__file__).parent.parent / "schemas"`（合同点名行号 :99 实测为该构造）。
  - `_get_schema_path`（**:685-701**）：`xml_file.name` 命中 `SCHEMA_MAPPINGS` → `schemas_dir/SCHEMA_MAPPINGS[...]`（:686-687）；`.rels` 后缀回落 `.rels` 映射（:689-690）；`charts/`、`theme/` 目录同机制（:692-696）；主内容目录 `word|ppt|xl` 按父目录名映射（:698-699）；否则返回 None（跳过校验，:701）。
  - `_validate_single_file_xsd`（**:750-785**）：`open(schema_path,"rb")`（:756）→ lxml `XMLParser` 解析 XSD（:757-760）→ `lxml.etree.XMLSchema(xsd_doc)` 编译（**:761**）→ 对每个 xml/rels 去模版标签（:766）→ `_preprocess_for_mc_ignorable`（:767；定义 :742-748，删除根元素 `mc:Ignorable` 属性；`MC_NAMESPACE` 常量 :61）→ `schema.validate`（:776）；异常兜底（:784-785）返回 `(False, {str(e)})`。
  - **pptx/xlsx 侧同样有 validators 副本**（sha256 与 docx 侧全等，行号相同）：`apps/electron/default-skills/pptx/scripts/office/validators/base.py:43-59/:99/:685/:750/:761`、`apps/electron/default-skills/xlsx/scripts/office/validators/base.py:43-59/:99/:685/:750/:761`。validator 的实例化入口：`scripts/office/validate.py:83/:91`（DOCX/PPTXSchemaValidator）与 `scripts/office/pack.py:87/:91`（三 skill 同名副本，pack.py sha256 三份全等 `b1800987…`）；CLI 调用示例 `apps/electron/default-skills/docx/SKILL.md:78` `python scripts/office/validate.py doc.docx`。
  - **`opc-digSig.xsd` 负向检索（独立重做）**：`SCHEMA_MAPPINGS`（base.py:43-59 全文）无映射；全树 grep「digSig」（`-i`，含 `*.py/*.ts/*.tsx/*.js/*.json/*.xsd/*.yml/*.yaml/*.md` 及无扩展名过滤全文件，排除 node_modules）仅命中 `ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd:35`（`<xsd:element name="DigSig" … type="CT_DigSigBlob"/>`）与 `:51`（`CT_DigSigBlob` 类型定义）——那是 docProps 扩展属性的同名元素，与 `opc-digSig.xsd` 无 import/加载关系；「opc-digSig」文件名字符串与 `…/package/2006/digital-signature` 命名空间在 `opc-digSig.xsd` 自身之外**零命中**；全部 `*.xsd` 的 `xs:import/xs:include` 清点（grep 实测，零 `xs:include`）无任何指向 `opc-digSig.xsd`。结论：**未发现消费者/未接线**。
  - **`opc-coreProperties.xsd` 自身 xs:import 三条**（核实行号）：`:7-8` dc elements/1.1 → `http://dublincore.org/schemas/xmls/qdc/2003/04/02/dc.xsd`（远端 URL）；`:9-10` dc terms → `…/2003/04/02/dcterms.xsd`（远端 URL）；`:11` XML 1998/namespace（无 schemaLocation）。`base.py:14-17` `IGNORED_VALIDATION_ERRORS` 含 `"purl.org/dc/terms"`，在 `base.py:616-619` 过滤含该子串的错误（**推断**：用于吸收 dc/dcterms 远端 schema 解析失败类错误；运行实测 NOT_RUN）。
- **失败影响（`validate.py` 真实退出路径；三副本 validate.py sha256 全等 `1aef24f8e316965a0584c30859776bd2c82a9fb69f72d79cfed041119cf95514`）**：
  - **XSD 校验失败的真实退出码**：`validate.py:102` `success = all(v.validate() for v in validators)` → `validate.py:107` `sys.exit(0 if success else 1)`，即校验失败（含 XSD 编译异常被 `base.py:784-785` 转成文件级错误、`validate_against_xsd` `base.py:675-679` 打印 `FAILED` 返回 False）→ 进程**退出码 1（:107）**，而非 :95。
  - 预读线索所指 `:95 sys.exit(1)` 实测是 `match` 的 `case _` 兜底分支（:93-95，`Error: Validation not supported for file type …`）；且实测 **`.xlsx` 也落进该分支**（match 仅 `.docx`（:81）/`.pptx`（:89）两个 case；validate.py/pack.py 均只装配 DOCX/PPTX validator，`validators/__init__.py:6-7/:12-13` 亦只导出 DOCX/PPTX/Redlining；pack.py `_run_validation` :78-94 对 .docx/.pptx 装配 validator，其余后缀静默 `return True, None`）。
  - `assert` 路径（validate.py:56/:61/:63/:67/:77）抛 `AssertionError` 带 traceback，进程退出码同为 1。

## apps--electron--default-skills--docx--scripts--office--schemas--ecma--fouth-edition--opc-contentTypes.xsd

- **职责**：OPC 包内容类型清单部件 `[Content_Types].xml` 的 XSD 模型——`Types` 根元素、`Default`/`Override` 元素与 `ST_ContentType`/`ST_Extension` 模式约束（源文件 :7-41）。
- **真实加载或消费者**：`apps/electron/default-skills/docx/scripts/office/validators/base.py:47`（`"[Content_Types].xml" → "ecma/fouth-edition/opc-contentTypes.xsd"`）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 XMLSchema 编译）。另两副本同机制：`pptx/…/validators/base.py:47`、`xlsx/…/validators/base.py:47`。validator 经 `scripts/office/validate.py:83/:91`、`scripts/office/pack.py:87/:91` 实例化，CLI 入口示例 `docx/SKILL.md:78`。
- **来源与 hash**：文件内无头部出处注释（实测全文 42 行）；ECMA-376 OPC 4th edition 归属=推断（目录名 `ecma/fouth-edition` + targetNamespace :2-4）。sourceBlob=`a6de9d2733d3f0eea12ae87b24122495df1f0928`、sourceSha256=`9e0b7209fc69ab11987900404540969976000c5ebe4d4f58c43dc3842886bf3a`（INDEX-SCOPE-LOCK.json 本 group manifest；sha256sum/git hash-object 实测一致）。三副本映射（另两份逐字节相同，1963B/42L）：`apps/electron/default-skills/pptx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`、`apps/electron/default-skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`。
- **打包位置**：随 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources：`from: default-skills` → `to: default-skills`，filter `**/*`，含 schemas 树）；打包后在 `process.resourcesPath/default-skills`（`apps/electron/src/main/lib/config-paths.ts:770-776`），`seedDefaultSkills`（config-paths.ts:956 起）同步到 `~/.cdutai/default-skills/`（`getDefaultSkillsDir` :566-574；:5/:71 实证 `~/.cdutai`）。注：electron-builder.yml:71 注释写 `~/.proma`，按 QA 勘误 IDX-QA-E02-N-01 以代码为准。
- **修改影响（含失败影响）**：缺失/损坏 → `_validate_single_file_xsd` 在 base.py:756 打开或 :761 编译抛异常 → :784-785 转为该文件错误 → `validate_file_against_xsd` :598-628 判 new error → `validate_against_xsd` :675-679 `FAILED` 返回 False → validator.validate() False（docx.py:41-42 / pptx.py:48）→ `validate.py:102/:107` **退出码 1**。影响面：每个包唯一的 `[Content_Types].xml`（全 skill 校验必经）；三副本各自只影响对应 skill 目录。
- **验证方法**：`sha256sum` 三副本比对 + `git hash-object` 对 sourceBlob；grep `SCHEMA_MAPPINGS` 与 `_get_schema_path` 行号；对样例包跑 `python scripts/office/validate.py doc.docx`（本轮 NOT_RUN）。
- **证实·推断·未知**：加载映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--docx--scripts--office--schemas--ecma--fouth-edition--opc-coreProperties.xsd

- **职责**：`core.xml` 核心文档属性部件的 XSD 模型——`coreProperties` 根元素、`CT_CoreProperties`（引用 dc/dcterms 元素 :19-30）、`CT_Keywords`/`CT_Keyword`（:35-48）。
- **真实加载或消费者**：`apps/electron/default-skills/docx/scripts/office/validators/base.py:49`（`"core.xml" → "ecma/fouth-edition/opc-coreProperties.xsd"`）；解析/编译同 `_get_schema_path` :685-687 与 `_validate_single_file_xsd` :750-761。另两副本：`pptx/…/validators/base.py:49`、`xlsx/…/validators/base.py:49`。本文件自身 **xs:import 三条**：`:7-8` dc elements/1.1（schemaLocation `http://dublincore.org/schemas/xmls/qdc/2003/04/02/dc.xsd`，远端 URL）、`:9-10` dc terms（`…/dcterms.xsd`，远端 URL）、`:11` XML 1998/namespace（无 schemaLocation）。
- **来源与 hash**：文件内无头部出处注释（实测全文 50 行）；ECMA-376 OPC 归属=推断。sourceBlob=`10e978b661fc291cbeea9ab0c248601cf216f96d`、sourceSha256=`451958454e8588dfc7cd945981ada142ca06ff3307937f5700df059c2b307fa8`（manifest 取值，实测一致）。三副本映射（另两份逐字节相同，2515B/50L）：`…/pptx/…/ecma/fouth-edition/opc-coreProperties.xsd`、`…/xlsx/…/ecma/fouth-edition/opc-coreProperties.xsd`。
- **打包位置**：同上——electron-builder.yml:70-75 随 default-skills 整目录进 `process.resourcesPath/default-skills`（config-paths.ts:770-776），`seedDefaultSkills`（:956）同步到 `~/.cdutai/default-skills/`（:566-574；以代码为准，勿信 yml:71 的 `~/.proma` 注释）。
- **修改影响（含失败影响）**：缺失/损坏 → `core.xml` 校验链失败 → base.py:784-785 捕获 → `validate.py:102/:107` **退出码 1**（链路同上节）。另：两条远端 import（dc/dcterms）在无网环境的实际解析行为本轮 NOT_RUN；`base.py:14-17` `IGNORED_VALIDATION_ERRORS` 含 `"purl.org/dc/terms"`、:616-619 过滤相关错误（推断抑错机制）。
- **验证方法**：sha256sum/git hash-object 核对；grep 本文件 xs:import 行号；跑 validate.py 校验带 core.xml 的样例包（NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**；dc/dcterms 远端 import 的运行时解析结果与 IGNORED_VALIDATION_ERRORS 动机=**推断**（运行 NOT_RUN）；ECMA-376 精确上游版本=**未知**（见文末）。

## apps--electron--default-skills--docx--scripts--office--schemas--ecma--fouth-edition--opc-digSig.xsd

- **职责**：OPC 数字签名补充部件的 XSD 模型——`SignatureTime`/`RelationshipReference`/`RelationshipsGroupReference` 元素与 `ST_Format`/`ST_Value` 时间格式约束（源文件 :7-48；targetNamespace :2-4 `…/package/2006/digital-signature`）。
- **真实加载或消费者**：**未发现消费者/未接线**（证实的负向检索）：①`SCHEMA_MAPPINGS`（base.py:43-59，三副本同）无任何映射指向 opc-digSig.xsd；②全树 grep「digSig」（-i，含 *.py/*.ts/*.tsx/*.js/*.json/*.xsd/*.yml/*.yaml/*.md 及无过滤全文件）仅命中 `ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd:35/:51`（`DigSig` 元素/`CT_DigSigBlob` 类型，docProps 扩展属性同名元素，与本文件无 import 关系）；③「opc-digSig」文件名与 `…/2006/digital-signature` 命名空间在本文件自身外零命中；④全部 *.xsd 的 xs:import/xs:include 清点零指向本文件（ecma/mce 目录内仅 opc-coreProperties.xsd 有 xs:import）。查过：base.py、validate.py、pack.py、validators/*、全部 *.ts/*.json、electron-builder.yml、全部 *.xsd。
- **来源与 hash**：文件内无头部出处注释（实测全文 49 行）；ECMA-376 OPC 数字签名 schema 归属=推断。sourceBlob=`4248bf7a39c793c9f319bae7d09f92983efe5368`、sourceSha256=`6de111e11403f7cd49027400755bae0ea1cabef2815f09bd40a24f0017613b24`（manifest 取值，实测一致）。三副本映射（另两份逐字节相同，2856B/49L）：`…/pptx/…/ecma/fouth-edition/opc-digSig.xsd`、`…/xlsx/…/ecma/fouth-edition/opc-digSig.xsd`。
- **打包位置**：同上——三副本均随各自 skill 的 default-skills 目录打包（electron-builder.yml:70-75 → `process.resourcesPath/default-skills`，config-paths.ts:770-776/:956 → `~/.cdutai/default-skills/`），即文件物理随包分发，尽管无校验加载点。
- **修改影响（含失败影响）**：因未接线，缺失/损坏**不进入** `_validate_single_file_xsd` 校验链，不影响现行 validate.py/pack.py 结果（推断自「无消费者」事实）；潜在影响仅在未来接入 SCHEMA_MAPPINGS 或被 xs:import 后显现。
- **验证方法**：重做负向检索（grep 全树 digSig/digital-signature/opc-digSig）+ sha256sum 三副本比对 + git hash-object；接线后行为测试本轮 NOT_RUN。
- **证实·推断·未知**：「未发现消费者/未接线」=**证实**（负向检索范围如上）；「缺失不影响现行校验」=**推断**；为何随包携带/是否有意保留=**未知**（见文末）。

## apps--electron--default-skills--docx--scripts--office--schemas--ecma--fouth-edition--opc-relationships.xsd

- **职责**：OPC 关系清单部件 `*.rels` 的 XSD 模型——`Relationships`/`Relationship` 元素（源文件 :7-8）、`TargetMode` 属性（:19）与 `ST_TargetMode` 枚举（:27-32，External :29/Internal :30）；全文 33 行（ECMA-F-01 勘误：原括注 :56-81 越界，按 QA 实测行号更正）。
- **真实加载或消费者**：`apps/electron/default-skills/docx/scripts/office/validators/base.py:51`（`".rels" → "ecma/fouth-edition/opc-relationships.xsd"`）；`_get_schema_path` :689-690 对**所有 `.rels` 后缀文件**回落到该映射（不限文件名为 `.rels`），即包内全部关系清单（`_rels/.rels`、`word/_rels/document.xml.rels` 等）都以本文件校验；编译校验 :750-761。另两副本：`pptx/…/validators/base.py:51`、`xlsx/…/validators/base.py:51`。
- **来源与 hash**：文件内无头部出处注释（实测全文 33 行；首行为 BOM+XML 声明）；ECMA-376 OPC 归属=推断。sourceBlob=`56497467120b52b742756379959d4b2536be6df7`、sourceSha256=`f565adfef5a502044abc3a9153e157edc25af78304d335994afb958874b15e26`（manifest 取值，实测一致）。三副本映射（另两份逐字节相同，1344B/33L）：`…/pptx/…/ecma/fouth-edition/opc-relationships.xsd`、`…/xlsx/…/ecma/fouth-edition/opc-relationships.xsd`。
- **打包位置**：同上——electron-builder.yml:70-75 随 default-skills 打包至 `process.resourcesPath/default-skills`，seedDefaultSkills（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574，以代码为准）。
- **修改影响（含失败影响）**：缺失/损坏 → 所有 `*.rels` 校验在 base.py:756/:761 失败/编译异常 → :784-785 捕获 → `validate.py:102/:107` **退出码 1**；影响面是本家族最大（每包多份关系清单均经 `_get_schema_path` :689-690 命中本文件）。
- **验证方法**：sha256sum/git hash-object 核对；grep `SCHEMA_MAPPINGS[".rels"]` 与 :689-690 回落逻辑；跑 validate.py 校验样例包（NOT_RUN）。
- **证实·推断·未知**：映射/回落逻辑/失败链=**证实**；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--pptx--scripts--office--schemas--ecma--fouth-edition--opc-contentTypes.xsd

- **职责**：pptx 份 `opc-contentTypes.xsd`——OPC 包内容类型清单部件 `[Content_Types].xml` 的 XSD 模型（`Types` 根、`Default`/`Override`、`ST_ContentType`/`ST_Extension`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/pptx/scripts/office/validators/base.py:47`（SCHEMA_MAPPINGS）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `a6de9d2733d3f0eea12ae87b24122495df1f0928`；sourceSha256 `9e0b7209fc69ab11987900404540969976000c5ebe4d4f58c43dc3842886bf3a`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`、`apps/electron/default-skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`。
- **打包位置**：随 pptx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：缺失/损坏 → 本 skill 每个包的 `[Content_Types].xml` 校验在 base.py:756 打开或 :761 编译失败 → :784-785 转文件级错误 → `validate.py:102/:107` **退出码 1**（失败链详见家族总述）；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--pptx--scripts--office--schemas--ecma--fouth-edition--opc-coreProperties.xsd

- **职责**：pptx 份 `opc-coreProperties.xsd`——`core.xml` 核心文档属性部件的 XSD 模型（`coreProperties`/`CT_CoreProperties`、`CT_Keywords`/`CT_Keyword`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/pptx/scripts/office/validators/base.py:49`（SCHEMA_MAPPINGS）；本文件自身 xs:import 三条：`:7-8` dc elements/1.1、`:9-10` dc terms（均远端 URL）、`:11` XML 1998/namespace（无 schemaLocation）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `10e978b661fc291cbeea9ab0c248601cf216f96d`；sourceSha256 `451958454e8588dfc7cd945981ada142ca06ff3307937f5700df059c2b307fa8`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`、`apps/electron/default-skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`。
- **打包位置**：随 pptx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：缺失/损坏 → 本 skill `core.xml` 校验链失败 → base.py:784-785 捕获 → `validate.py:102/:107` **退出码 1**（失败链详见家族总述）；dc/dcterms 远端 import 的无网解析行为 NOT_RUN；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--pptx--scripts--office--schemas--ecma--fouth-edition--opc-digSig.xsd

- **职责**：pptx 份 `opc-digSig.xsd`——OPC 数字签名补充部件的 XSD 模型（`SignatureTime`/`RelationshipReference`/`RelationshipsGroupReference`、`ST_Format`/`ST_Value`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/pptx/scripts/office/validators/base.py:43-59（无本文件映射，见「消费」）`（SCHEMA_MAPPINGS）；**未发现消费者/未接线**（负向检索同 docx 份小节：SCHEMA_MAPPINGS 无映射、全树「digSig/digital-signature/opc-digSig」仅命中 ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd:35/:51 同名元素、零 xs:import/xs:include 指向）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `4248bf7a39c793c9f319bae7d09f92983efe5368`；sourceSha256 `6de111e11403f7cd49027400755bae0ea1cabef2815f09bd40a24f0017613b24`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`、`apps/electron/default-skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`。
- **打包位置**：随 pptx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：因未接线，缺失/损坏**不进入** `_validate_single_file_xsd` 校验链，不影响现行 validate.py/pack.py 结果（推断）；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--pptx--scripts--office--schemas--ecma--fouth-edition--opc-relationships.xsd

- **职责**：pptx 份 `opc-relationships.xsd`——OPC 关系清单部件 `*.rels` 的 XSD 模型（`Relationships`/`Relationship`、`ST_TargetMode`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/pptx/scripts/office/validators/base.py:51`（SCHEMA_MAPPINGS）；`_get_schema_path` base.py:689-690 对全部 `.rels` 后缀文件回落到本映射（包内所有关系清单均以本文件校验）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `56497467120b52b742756379959d4b2536be6df7`；sourceSha256 `f565adfef5a502044abc3a9153e157edc25af78304d335994afb958874b15e26`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`、`apps/electron/default-skills/xlsx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`。
- **打包位置**：随 pptx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：缺失/损坏 → 本 skill 所有 `*.rels` 校验失败/编译异常（base.py:756/:761→:784-785）→ `validate.py:102/:107` **退出码 1**，影响面为本家族最大（每包多份关系清单）；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ecma--fouth-edition--opc-contentTypes.xsd

- **职责**：xlsx 份 `opc-contentTypes.xsd`——OPC 包内容类型清单部件 `[Content_Types].xml` 的 XSD 模型（`Types` 根、`Default`/`Override`、`ST_ContentType`/`ST_Extension`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/xlsx/scripts/office/validators/base.py:47`（SCHEMA_MAPPINGS）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `a6de9d2733d3f0eea12ae87b24122495df1f0928`；sourceSha256 `9e0b7209fc69ab11987900404540969976000c5ebe4d4f58c43dc3842886bf3a`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`、`apps/electron/default-skills/pptx/scripts/office/schemas/ecma/fouth-edition/opc-contentTypes.xsd`。
- **打包位置**：随 xlsx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：缺失/损坏 → 本 skill 每个包的 `[Content_Types].xml` 校验在 base.py:756 打开或 :761 编译失败 → :784-785 转文件级错误 → `validate.py:102/:107` **退出码 1**（失败链详见家族总述）；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ecma--fouth-edition--opc-coreProperties.xsd

- **职责**：xlsx 份 `opc-coreProperties.xsd`——`core.xml` 核心文档属性部件的 XSD 模型（`coreProperties`/`CT_CoreProperties`、`CT_Keywords`/`CT_Keyword`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/xlsx/scripts/office/validators/base.py:49`（SCHEMA_MAPPINGS）；本文件自身 xs:import 三条：`:7-8` dc elements/1.1、`:9-10` dc terms（均远端 URL）、`:11` XML 1998/namespace（无 schemaLocation）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `10e978b661fc291cbeea9ab0c248601cf216f96d`；sourceSha256 `451958454e8588dfc7cd945981ada142ca06ff3307937f5700df059c2b307fa8`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`、`apps/electron/default-skills/pptx/scripts/office/schemas/ecma/fouth-edition/opc-coreProperties.xsd`。
- **打包位置**：随 xlsx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：缺失/损坏 → 本 skill `core.xml` 校验链失败 → base.py:784-785 捕获 → `validate.py:102/:107` **退出码 1**（失败链详见家族总述）；dc/dcterms 远端 import 的无网解析行为 NOT_RUN；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ecma--fouth-edition--opc-digSig.xsd

- **职责**：xlsx 份 `opc-digSig.xsd`——OPC 数字签名补充部件的 XSD 模型（`SignatureTime`/`RelationshipReference`/`RelationshipsGroupReference`、`ST_Format`/`ST_Value`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/xlsx/scripts/office/validators/base.py:43-59（无本文件映射，见「消费」）`（SCHEMA_MAPPINGS）；**未发现消费者/未接线**（负向检索同 docx 份小节：SCHEMA_MAPPINGS 无映射、全树「digSig/digital-signature/opc-digSig」仅命中 ISO-IEC29500-4_2016/shared-documentPropertiesExtended.xsd:35/:51 同名元素、零 xs:import/xs:include 指向）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `4248bf7a39c793c9f319bae7d09f92983efe5368`；sourceSha256 `6de111e11403f7cd49027400755bae0ea1cabef2815f09bd40a24f0017613b24`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`、`apps/electron/default-skills/pptx/scripts/office/schemas/ecma/fouth-edition/opc-digSig.xsd`。
- **打包位置**：随 xlsx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：因未接线，缺失/损坏**不进入** `_validate_single_file_xsd` 校验链，不影响现行 validate.py/pack.py 结果（推断）；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## apps--electron--default-skills--xlsx--scripts--office--schemas--ecma--fouth-edition--opc-relationships.xsd

- **职责**：xlsx 份 `opc-relationships.xsd`——OPC 关系清单部件 `*.rels` 的 XSD 模型（`Relationships`/`Relationship`、`ST_TargetMode`）；与另两份逐字节相同的 vendor 副本（模型细节与家族语义见 docx 份同名小节及家族总述，不重复手册）。
- **真实加载或消费者**：`apps/electron/default-skills/xlsx/scripts/office/validators/base.py:51`（SCHEMA_MAPPINGS）；`_get_schema_path` base.py:689-690 对全部 `.rels` 后缀文件回落到本映射（包内所有关系清单均以本文件校验）；解析 `_get_schema_path` base.py:685-687；编译校验 `_validate_single_file_xsd` base.py:750-761（:756 打开本文件、:761 `lxml.etree.XMLSchema` 编译，异常兜底 :784-785）。
- **来源与 hash**：文件内无头部出处注释（家族总述实读）；ECMA-376 OPC 4th edition 归属=**推断**。sourceBlob `56497467120b52b742756379959d4b2536be6df7`；sourceSha256 `f565adfef5a502044abc3a9153e157edc25af78304d335994afb958874b15e26`（manifest 取值，sha256sum/git hash-object 实测一致）。三副本映射（三份逐字节相同）：`apps/electron/default-skills/docx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`、`apps/electron/default-skills/pptx/scripts/office/schemas/ecma/fouth-edition/opc-relationships.xsd`。
- **打包位置**：随 xlsx skill 的 default-skills 整目录打包——`apps/electron/electron-builder.yml:70-75`（extraResources `from: default-skills`→`to: default-skills`，filter `**/*`）→ `process.resourcesPath/default-skills`（`config-paths.ts:770-776`）→ `seedDefaultSkills`（config-paths.ts:956）同步 `~/.cdutai/default-skills/`（:566-574；以代码为准，yml:71 注释 `~/.proma` 过时）。
- **修改影响（含失败影响）**：缺失/损坏 → 本 skill 所有 `*.rels` 校验失败/编译异常（base.py:756/:761→:784-785）→ `validate.py:102/:107` **退出码 1**，影响面为本家族最大（每包多份关系清单）；三副本任一缺失只影响对应 skill 目录的校验。
- **验证方法**：sha256sum 三副本比对 + git hash-object 对 sourceBlob；grep `SCHEMA_MAPPINGS` 行号与 `_get_schema_path` 回落；对样例包跑 `python scripts/office/validate.py`（本轮 NOT_RUN）。
- **证实·推断·未知**：映射/行号/失败链=**证实**（源码实读）；ECMA-376 出处=**推断**；运行时行为=**NOT_RUN**。

## 未运行 / 未知

**未运行（本轮产品运行统一 NOT_RUN）**：
- 未执行 `validate.py`/`pack.py` 全流程、未实际运行 lxml XMLSchema 编译与样例包校验；文中退出码/失败链为源码实读结论。
- 未运行 electron 打包与 `seedDefaultSkills` 同步；打包路径为配置+代码实读结论。
- validate.py 对 `.xlsx` 落 `case _` 兜底（:93-95）亦为代码实读结论，未运行验证。

**未知（均已注明查过什么）**：
1. ecma 四文件的精确上游版本/下载出处：文件内无出处注释（四文件通读证实），「ECMA-376 OPC 4th edition」归属仅由目录名 `ecma/fouth-edition` 与 OPC 2006 命名空间推断；查过：四个 XSD 全文、schemas 目录树、INDEX-SCOPE-LOCK.json。
2. `opc-digSig.xsd` 随包携带的原因及是否有未来接线计划：未发现任何注释/文档/issue 说明；查过：全树 grep「digSig/digital-signature」、SKILL.md、packaging 配置、packaging-guards 测试。
3. `opc-coreProperties.xsd` 两条远端 import（dc.xsd/dcterms.xsd）在无网/沙箱环境的实际解析结果（是否报错、是否被 `IGNORED_VALIDATION_ERRORS` 全数吸收）：本轮 NOT_RUN，行为未知。
4. 三副本 `ecma/` 目录是否存在生成脚本（还是手工复制）：未发现同步/生成脚本；查过：default-skills 全树脚本（*.py/*.ts/*.sh）与打包配置。
