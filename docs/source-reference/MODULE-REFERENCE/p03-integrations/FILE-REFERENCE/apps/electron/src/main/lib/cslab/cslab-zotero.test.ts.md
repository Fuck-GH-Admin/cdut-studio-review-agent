---
path: apps/electron/src/main/lib/cslab/cslab-zotero.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f2e94a0dc1a1af113ae4d34328ebeab40ca5c9e8
sha256: f81897fc159b37c68dd1a9189b93b07bfefbd3897c2d9170b4eaf6f35654226b
lines: 263
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-zotero.test.ts

## 1. 测试目标

两组目标（文件头 `apps/electron/src/main/lib/cslab/cslab-zotero.test.ts:1-9`）：①`cslab-zotero.ts` 的 Zotero 增量同步——递归 CTE 分类路径、EAV 元数据、storage 附件路径重建、高水位增量与删除标记；②`cslab-zotero-format.ts` 的批注四向仿射投影（0/90/180/270）。使用**合成 `zotero.sqlite`**（真实 `node:sqlite`），无 mock。不测监听链路。

## 2. 用例清单

2 个 `describe`、10 个 `test`（`:122/:142/:154/:163/:184` + `:218/:228/:238/:248/:258`）。夹具：`createZoteroDatabase`（`:22-86`，WAL 模式建 Zotero 10 表 + 种子：条目 `ABC123`(v10, journalArticle, title/DOI/date/publicationTitle/abstract 五字段 EAV)、附件 `ATT999`（`storage:paper.pdf`，application/pdf）、批注 `ANNO1`(v11, type=1, position `{"pageIndex":0,"rects":[[10,20,110,40]],"rotation":90}`)、集合 `Research>Battery`（C1/C2）、creator `Ada Lovelace`）；`beforeAll`（`:88-98`）：临时根 + `storage/ATT999/paper.pdf` 物理文件 + `PROFER_CONFIG_DIR` 重定向 + `createLab('Zotero 同步测试实验室')`。`afterAll`（`:100-111`）：`__resetZoteroWatchersForTest` + `closeAllCsLabDatabases` + 清目录。用例顺序：同步用例 1→5 有**依赖顺序**（共用同一 lab/同一合成库，后用例在前用例同步结果上增量）；投影组独立。常量 `PAGE={width:200,height:300}`、`RECT=[10,20,110,40]`、缩放 2（`:19-20`）。

`describe('Zotero 增量同步')`（`:121`）：

1. `:122-140` 首次同步：分类路径、EAV 元数据与附件路径——`syncZoteroLibrary(lab.id,{dataDir:zoteroDir})` + `listZoteroLiterature`。
2. `:142-152` 批注解析：类型、颜色与文本——`listLiteratureZoteroAnnotations(lab.id, uri)`。
3. `:154-161` 高水位游标：无变化时增量同步为空——再次同步。
4. `:163-182` 删除条目：增量标记为 unsupported，不物理删除文献——直接改合成库 `deleted=1,version=20` 后同步，`listAssets`（`cslab-iron-cage`）断言。
5. `:184-215` 无本地 PDF 的条目仍登记元数据，中文作者姓前名后——插入 `META01`(v21, 无附件, creator 张/三) 后同步。

`describe('Zotero 批注四向仿射投影')`（`:217`）：

6. `:218-226` 0°：Y 轴翻转——`zoteroRectToViewport(RECT, PAGE, 2, 0)`。
7. `:228-236` 90°：宽高互换。
8. `:238-246` 180°：XY 双翻转。
9. `:248-256` 270°：宽高互换。
10. `:258-263` 无法解析的 position 返回 null——`parseZoteroAnnotationPosition('not-json')` 与缺 rects 情形。

## 3. 真实断言

- `:126-139`：`result.ok` true、`added` 1、`annotationCount` 1、`collectionCount` 2；`literature` 长度 1；`title` `'Solid State Battery Interfaces'`、`authors` `['Ada Lovelace']`、`doi` `'10.1000/cslab.2024.001'`、`collections` `['Research > Battery']`（递归路径 `>` 拼接）、`source` `'zotero'`、`hasFile` true（storage 物理文件存在）、`annotationCount` 1。
- `:147-151`：`annotations` 长度 1；`type` `'highlight'`（数字 1 映射）、`color` `'#ffd400'`、`text` `'SEI layer'`、`position.rotation` 90。
- `:158-160`：`ok` true 且 `added`/`updated`/`removed` 全 0（高水位游标短路）。
- `:177-181`：`ok` true、`removed` 1；`listAssets(lab.id).find(layerType==='lit')` 的 `unsupported` 为 `'Zotero 中已删除'`（软删不物理删）。
- `:207-214`：`ok` true、`added` 1；title `'固态电池界面综述'` 的条目 truthy、`hasFile` false、`authors` `['张三']`（`formatCreatorName` CJK 姓前名后）、`doi` `'10.1000/cslab.2024.002'`。
- `:222-225`：`zoteroRectToViewport(RECT,PAGE,2,0)` 精确对象 `{left:20, top:520, width:200, height:40}`。
- `:232-235`：90° → `{left:40, top:20, width:40, height:200}`。
- `:242-245`：180° → `{left:180, top:40, width:200, height:40}`。
- `:252-255`：270° → `{left:520, top:180, width:40, height:200}`。
- `:260-262`：`parseZoteroAnnotationPosition('not-json')` 为 null；`parseZoteroAnnotationPosition('{"pageIndex":0}')?.rects` 为 `[]`。

## 4. 未覆盖与脆弱点

- **归属交叉**：用例 6-10 的被测符号 `zoteroRectToViewport`/`parseZoteroAnnotationPosition` 在 `apps/electron/src/main/lib/cslab/cslab-zotero-format.ts`（非本批清单文件）——断言对象跨文件，已如实登记（跨文件结论双侧行号：test:218-263 ↔ `cslab-zotero-format.ts`）。
- 未覆盖（`cslab-zotero.ts` 范围）：`startZoteroWatcher`/`stopZoteroWatcher`/防抖/重入保护；`discoverZotero` 的 schema-unsupported/no-permission/degraded WAL 分支；`setZoteroDataDir` 无 zotero.sqlite 抛错；`forceFull` 全量重放；`syncingLabs` 并发互斥；prefs.js 发现链（`discoverProfile`/`parsePrefsFile`）；`readDeletedDeltas` 对未知 key 的跳过；`getZoteroSource`/`listStoredZoteroAnnotations`。
- 脆弱点：用例 1-5 顺序耦合（共享合成库游标），bun 串行执行下成立；用例 4/5 直接 `require('node:sqlite')` 改库绕过被测 API（构造增量场景，合理但要求 Zotero 影子副本每次重拷——依赖 `refreshZoteroShadow` 行为）；`hasFile` 断言依赖 beforeAll 写入的物理 PDF。
- 无 mock：真实 `node:sqlite`、真实文件系统、真实影子副本复制链路。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 10 个 test、行号、断言文本 | 已证实 | `apps/electron/src/main/lib/cslab/cslab-zotero.test.ts:122-263` 逐条核对 |
| 合成库表结构与种子数据 | 已证实 | `:22-86` |
| 用例 1-5 顺序耦合共用库/游标 | 已证实 | 各用例均同 `lab.id` + `zoteroDir` 且后用例依赖前用例状态 |
| 用例 6-10 被测符号在 cslab-zotero-format.ts | 已证实 | import 动态路径 `./cslab-zotero-format`（`:219/:229/:239/:249/:259`） |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `syncZoteroLibrary` 首次全量/增量/软删/无 PDF | §3 | test:122-215 | covered |
| 批注解析（mapAnnotationType/position） | §3 | test:142-152 | covered |
| `listLiterature`/`listLiteratureZoteroAnnotations` 转发 | §3 | test:122-152 | indirect |
| 监听/发现降级/互斥/forceFull | §4 | — | unknown（无断言） |
| `zoteroRectToViewport`/`parseZoteroAnnotationPosition` | §3/§4 | test:218-263 | covered（跨文件归属 cslab-zotero-format） |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
