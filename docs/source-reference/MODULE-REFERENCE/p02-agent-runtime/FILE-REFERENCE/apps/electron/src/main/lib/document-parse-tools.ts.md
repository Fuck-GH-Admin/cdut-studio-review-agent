---
path: apps/electron/src/main/lib/document-parse-tools.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: a190f4110ae0b4861cb5c9fd6d8f3b8375ca6c51
sha256: 85ddb5a268945f52ece07abcc841a25869b4bb2afdb489855fd7a46b8c77110a
lines: 1594
kind: source
package: p02-agent-runtime
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/document-parse-tools.ts

## 1. 结论与边界

文档内核预处理与双态落盘（头注 :1-17，Artifact-by-Reference 零中继）：「意图由 LLM 裁决，数据由内核直流」——Clean 交付版（`<agentCwd>/<stem>.md` 纯净 Markdown）+ Anchored 索引版（`.context/artifacts/` 带 `fN:pX-bY` 锚点）；轻量句柄 `<attached_document>`（~300 Token）绝不灌全文；read 二进制透明重定向。

## 2. 导出与关键符号

常量/类型：`OFFICE_INDEX_SCHEMA_VERSION='v2'`（:30）、`MAX_DOCUMENT_CHARS=160000`（:33）、`MAX_ARTIFACT_SLICE_CHARS=16000`（:36）、`PREINGEST_DOCUMENT_EXTENSIONS`（:41-62，19 扩展名）、`DocumentAnchorBlockMeta`（:66-81）、`SessionDocumentRegistryEntry`（:83-90）、`ResolvedDocumentAnchor`（:92-106）、`DocumentPageSlice`（:145-160）、`MaterializedDocumentIndex`（:162-180）、`ParseDocumentResult`（:182-198）、`ReadDocumentArtifactInput`（:~845-856）。

| 函数 | 行 | 说明 |
| --- | --- | --- |
| `isPreingestDocumentPath` | 64-66 | 扩展名判定 |
| `extractAndNamespaceAnchors` | 212-262 | 锚点 BBox 提取+`fileId:` 命名空间 |
| `materializeToWorkspace` | 375-508 | 双态落盘（沙箱校验） |
| `executeParseDocumentTool` | 513-700 | 解析主入口（pdf/office/基座三分支） |
| `parseAttachedDocument` | 725-753 | 磁盘指纹缓存（32 上限，:719-720） |
| `formatDocumentArtifactHandle` | 758-820 | 轻量句柄（preview 600 字） |
| `buildAttachedDocumentsContext` | 822-885 | 附件前置摄入+协议注释 |
| `parsePageRangeSpec` | 888-918 | "1-3,5"→页码集合 |
| `executeReadDocumentArtifact` | 978-1122 | 按页/按 query 切片 |
| `upgradeStaleOfficeIndexIfNeeded` | 1127-1225 | 旧索引原地升级 |
| `resolveDocumentAnchor` | 1272-1530 | 双轨锚点反查（抗劫持） |
| `redirectBinaryDocumentRead` | 1535-1594 | read 透明重定向 |

内部：`buildVirtualPagesFromText`（:266-311，~3000 字符/虚拟页）、`allocateSessionFileId`（:315-345，确定性 fN）、`extractLabelKeywords`/`LABEL_TYPE_HINTS`/`correctMutuallyExclusiveBlockType`（:1230-1268）。

## 3. 内部逻辑与关键流程

1. **双态落盘**（:375-508）：`isAgentWorkspaceSandbox` 拒非沙箱（:380-382）；fileId 分配（preferred/manifest 源路径/registry 三重确定性，:331-345）；clean 路径优先 `<stem>.md`（已存在非内核产物→回退 `.parsed.md` 防覆盖用户笔记）；同步维护 `manifest.json`+`registry.json`（:483-504）；失败 warn 返回 undefined（不阻断）。
2. **`executeParseDocumentTool`**（:513-700）：`resolveAuthorizedFile` 授权（:518-520）；revision=`sha256:v2:{hash}`；PDF→pdf-engine（页切片含 `isFigureHeavy`：≤4 块且有图注/留白<1800 字，:572-573）；OOXML→office-engine includeAnchors（outline 从 heading 块收集，无标题回退 sheetName/title，:608-624）；基座→`extractTextFromFile`+虚拟页。
3. **锚点反查 `resolveDocumentAnchor`**（:1272-1530）：支持 `#f1:p1-b11/#p1-tbl1/#f3:p1-B4:E10` 等形态；`tbl` 不坍缩为 b（注释 :1334-1336，坍缩反查到错误段落块）；registry/manifest 确定性反查旧索引 fileId（:1436-1442，杜绝遍历序随机对调）；**B1 抗劫持**（注释 :1446-1452）：显式块号命中即严格信任，仅两种情况允许关键词模糊探测（越界缺失/纯页面锚点）；互斥版面类型窄校正（label 表格 vs 块插图→同页表格块，:1248-1262）；XLSX 行列收敛（单格 B10 不拉整行——B4 决议，:1505-1507）。
4. **`executeReadDocumentArtifact`**（:978-1122）：query 模式按块命中±1 邻块、16k 预算截断；pages 模式分页提示 `nextSuggestedPages`。
5. **read 重定向**（:1535-1594）：无 agentCwd 拒相对路径；返回句柄+前 3 页。

## 4. 调用者与调用链

入向：`agent-orchestrator.ts`/`pi-builtin-tools.ts`/`pi-agent-adapter.ts`（read 拦截/附件摄入）、`rag/workspace-rag-service.ts`、`remote-service.ts`（全树 grep）。出向：`./pi-file-checkpoint`（沙箱）、`@profer/core/{office,pdf}-engine`、`./preview-inspection-service`（`resolveAuthorizedFile`）、`./document-parser`（动态）。

## 5. 数据 I/O、读写与副作用

写 `<agentCwd>/<stem>.md`+`.context/artifacts/{*.anchored.md,*.index.json,manifest.json,registry.json}`；内存附件缓存（32）；无网络。

## 6. 分支、失败、取消与恢复

解析/授权失败 throw（executeParse）或 null（parseAttached，注释「绝不阻断本轮对话」:717）；落盘失败 warn+undefined；旧索引 `upgradeStaleOfficeIndexIfNeeded` 静默重建；缓存满清空重建。

## 7. 权限与权威状态

- 落盘权威：仅沙箱目录（:380-382）；不覆盖用户手写笔记（clean 回退 `.parsed.md`）。
- 锚点权威：显式块号不被模糊扫描劫持（B1 决议，:1446-1452）；`tbl` 保留原 ID；单格不拉整行（B4）；registry 确定性 fileId。
- 零中继权威：句柄 ~300 Token；「严禁打字机式重写」协议注释（:867-871）。
- 授权权威：`resolveAuthorizedFile` 前置（:518）。

## 8. 修改影响面

Agent 附件摄入/read 工具/RAG 溯源胶囊。同测：`document-parse-tools.test.ts`（14 用例）。

## 9. 测试证据

直接测试 `document-parse-tools.test.ts`（14 用例 / 3 describe；手工合法单页 PDF 字节 + 手工索引 `writeHandmadeIndex`；NOT_RUN）要点：
- 内核双态（3）：txt 解析格式标签（:42-50）；PDF 落盘双态（fileId f1、clean 无锚点/anchored 含 `id="f1:p1-b0"`，:52-78）；未授权路径抛（:80-88）。
- 零 Token 摄入（5）：句柄含 file_id/pages/`证据互信`+切片+query（:93-121）；多 PDF 带/不带 fileId 反查+BBox（:123-148）；纯文本附件不注入（:150-159）；read 透明重定向（:161-166）。
- 抗劫持与扩展锚点（6）：显式 p2-b3 不被关键词劫持（:237-245）；互斥类型校正到表格块（:247-256）；`p1-tbl1` 不坍缩（:258-267）；extractAndNamespaceAnchors 命名空间（:269-280）；无 c 前缀 `#f3:p1-B4:E10`→cellRef（:282-291）；单格 B10 不放大（:293-302）；registry 严格反查（alpha→f2/beta→f1，:304-341）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 双态落盘/沙箱拒/不覆盖笔记 | 已证实 | :375-508 + 测试 :52-88 |
| 抗劫持/tbl/单格语义 | 已证实 | :1446-1520 + 测试 :237-341 |
| registry 确定性 | 已证实 | :1436-1442 + 测试 :304-341 |
| upgradeStale 真实升级 | 未知（无直接用例） | §9 |
| 运行通过与否 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `executeParseDocumentTool` 三分支 | §3.2 | 513-700 | covered |
| `materializeToWorkspace` | §3.1 | 375-508 | covered |
| `resolveDocumentAnchor` | §3.3/§9 | 1272-1530 | covered |
| `executeReadDocumentArtifact` | §3.4 | 978-1122 | covered |
| `upgradeStaleOfficeIndexIfNeeded` | §2 | 1127-1225 | covered（未测） |
