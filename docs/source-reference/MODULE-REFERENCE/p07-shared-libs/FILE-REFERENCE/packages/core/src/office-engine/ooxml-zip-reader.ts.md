---
path: packages/core/src/office-engine/ooxml-zip-reader.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: eed923c02a907a82c73ff7e2b17cc62afdf00f64
sha256: e4f16ebf9e548536b4c7d35104b20e7a38b3424ce3a0f53e8db67cc0e6b6de1c
lines: 486
kind: source
package: p07-shared-libs
author: docs-r07-author-nb-30-20261023
reviewer: p06-review-batch
status: authored
evidence: static
---
# packages/core/src/office-engine/ooxml-zip-reader.ts

## 1. 结论与边界

OOXML **零外部依赖 ZIP+XML 解析器**（`packages/core/src/office-engine/ooxml-zip-reader.ts:1-8`）：`node:zlib` inflateRawSync 解析 ZIP 中央目录，面向 ECMA-376 的轻量命名空间感知 XML AST + `.rels` 关系映射器——`@profer/core` 零第三方冗余依赖、毫秒级流式解析。

边界：仅支持压缩法 0（store）/8（deflate），其余抛错（`:148-149`）；XML 解析是自写词法（非完整 XML 规范——CDATA/注释/PI/DOCTYPE 跳过处理，`:301`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `OoxmlZipReader` | class | 25-170 | 构造 `(Buffer\|Uint8Array\|ArrayBuffer)`；`isZipBuffer`(static)/`listEntries`/`has`/`readBinary`/`readText`/`readXml` | 双 Map（精确+小写）+文本缓存 |
| `detectOfficeFormatFromZip` | function | 176-190 | `(zip, fallback?) => OfficeFormat` | 内容嗅探（docm/xlsm/ppsx 变体兼容） |
| `OoxmlRelationship` | interface | 192-197 | `{id;type;target;targetMode?}` | **零外部引用** |
| `parseOoxmlRelationships` | function | 203-235 | `(zip, relsPath, baseDir) => Map` | 相对路径归一包内根路径 |
| `parseCoreMetadata` | function | 240-254 | `(zip) => {title?;author?}` | docProps/core.xml |
| `XmlElement` | interface | 258-269 | `{tag;localName;attrs;children[]}` | 命名空间感知 |
| `decodeXmlEntities` | function | 277-293 | 5 实体+十/十六进制字符引用 | **零外部引用** |
| `parseXmlDocument` | function | 299-375 | 词法栈式解析 | **零外部引用**（内部 readXml 用） |
| `getAttr` | function | 380-390 | 全名匹配+去前缀回退 | |
| `getDirectChildren`/`getFirstDirectChild` | function | 400-424 | 直接子元素（tag/localName 双匹配） | |
| `findElements`/`findFirstElement` | function | 429-460 | 深度优先 | |
| `getTextContent` | function | 465-475 | 递归拼接纯文本 | **碰撞警示**：pdfjs `page.getTextContent()` 是方法调用非本符号 |

内部：`EOCD/CENTRAL_DIR/LOCAL_FILE_HEADER` 三签名（`:16-18`）、`ZipEntryMeta`（`:20-26`）、`normalizeEntryName`（`:51-53`，反斜杠/前导斜杠归一）、`parseArchive`（`:55-113`，EOCD 尾部回扫 65557 窗口）、`XML_ENTITY_MAP`（`:271-275`）、`getLocalTagName/parseAttributes`（`:295-312`）、`unwrapDocumentRoot`（`:392-405`）。

## 3. 内部逻辑与关键流程

- `parseArchive`（`:55-113`）：长度 ≥22；EOCD 签名回扫；逐中央目录项（46 字节头）建双 Map（大小写不敏感兜底 `has`/读取）。
- `readBinary`（`:116-149`）：本地头校验→数据切片→store 直取/deflate `inflateRawSync`；越界返回 null。
- `detectOfficeFormatFromZip`（`:176-190`）：特征文件嗅探（word/document.xml 等）→ `[Content_Types].xml` 关键词（wordprocessingml 等）→ `fallback ?? 'docx'`。
- `parseOoxmlRelationships`（`:203-235`）：`Relationship` 节点映射；非 External 目标按 baseDir posix 归一（绝对路径剥前导斜杠）。
- `parseXmlDocument`（`:299-375`）：单正则词法（注释/CDATA/PI/DOCTYPE/闭合/开启）；文本节点保留规则（非空白或父为 `t`/`xml:space=preserve`，`:335-338`）；闭合标签按全名或 localName 回溯出栈（容错，`:350-357`）。
- `getAttr`（`:380-390`）：全名→去前缀逐项回退（`w:val`/`val` 双语义）。

## 4. 调用者与调用链

出向：`node:zlib`/`node:path`/`./types.ts`（OfficeFormat）（`:10-12`）。入向（检索=符号名+模块名，全冻结树）：

- `OoxmlZipReader`：三 solver（类型+使用）、`office-engine/index.ts:10,86`（new）、main 4 文件（document-parse-tools:29,602,1137 isZipBuffer；document-parser:184,190,194；review/document-service:367,373；study-document-indexer:630,634）。
- `detectOfficeFormatFromZip`：`index.ts:11,92`；`parseOoxmlRelationships`：pptx/xlsx solver；`parseCoreMetadata`：三 solver。
- `getAttr/getDirectChildren/getFirstDirectChild/findElements/findFirstElement/getTextContent`：三 solver+document-parser 大量消费。
- **零外部引用**：`OoxmlRelationship`、`decodeXmlEntities`、`parseXmlDocument`（仅内部）。
- **同名碰撞警示**：`XmlElement`（`apps/electron/src/main/lib/cslab/cslab-ooxml.ts:196` 本地同名类型，cslab-ooxml.test 测的是本地版）；`getTextContent`（pdfjs 方法调用）。
- 产品入口：main ✔（4 文件）；preload/renderer/shared/cli ✘。测试：本批 office-engine.test（3 test 间接）。

## 5. 数据 I/O、读写与副作用

内存 Buffer/Map/文本缓存（`:28-30`）；无文件/网络 I/O；无副作用（抛错即失败）。

## 6. 分支、失败、取消与恢复

抛 `Error`：容器长度不足/无 EOCD/不支持压缩算法；读取越界/签名不符 → null（静默）；无异步/取消。

## 7. 权限与权威状态

本文件不适用（无权限代码）；ECMA-376 兼容口径（`:3`）是解析权威声明。

## 8. 修改影响面

- ZIP 中央目录/本地头偏移解析改动影响全部 Office 解析。
- XML 词法容错（闭合回溯）影响畸形文档存活率。
- 三 solver + main 4 文件直接受影响。

## 9. 测试证据

无直接同名测试；间接 `office-engine.test.ts`（本批 3 test）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| EOCD 回扫+双 Map 大小写兜底 | 已证实 | `:55-113,124-125` |
| 仅 store/deflate | 已证实 | `:143-149` |
| XML 词法容错（闭合回溯/文本保留规则） | 已证实 | `:299-375` |
| 3 导出零外部引用 | 已证实（检索式见 §4，全冻结树） | grep+子 agent |
| 碰撞 2 组（XmlElement/getTextContent） | 已证实 | 子 agent 检索 |
| 真实 OOXML 容器覆盖 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 14 导出 | §2 | 25-475 | covered |
| ZIP 解析 | §3 | 55-149 | covered |
| 嗅探/rels/metadata | §3 | 176-254 | covered |
| XML 词法+查询 | §3 | 299-475 | covered |
