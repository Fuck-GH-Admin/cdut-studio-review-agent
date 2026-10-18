# 69｜P06 L02-U1 Office #71：共享文档身份修复与上游移植交接（2026-10-18）

> **定位**：通用 Office 文档物化 identity/index/cache 的定向工程，不是审核 SourceRef 权限改造；本 PR 与 P02 真实通过证据分离。**完整 U1、L02-00 和发布门禁均不因通用单测通过而自动解除。**

## 1. 固定输入及历史首败

| 项目 | 固定输入 |
| --- | --- |
| 本仓库基线 | PR #108 `64c01e57d1e3e1a587a639ae59f9f62ed878924e`，68 号 P02 实机 R01–R07 PASS |
| 本轮工程 | `fix/office71-generic-index-source-identity-r01` → Draft PR #110，基线只取上述 SHA；最终 HEAD/tree 以 PR/CI 为准 |
| Office 真材实机 RED | PR #105 `44c7dc9fefdfd7693f1b6d1de00cf348af7abf3f`，65 号、`acceptance/p06-u1-local-r01/office/`：合法 DOCX/XLSX/PPTX 的 Main/真实解析中，重复 basename 的异路径复用 fN 和索引；相同字节跨路径缓存旧 sourcePath；重启后复现 |
| 上游原项目 | `Nya-Angle/CDUT-Studio`：查询时 `main@d262a8860af47797733f9f88442b79737666f37f`，上游 `document-parse-tools.ts` blob `43f98167a92334bf531a46bd01c290cf9cbee09a`；本仓库旧文件 blob 不同，必须**移植而非复制整个文件** |
| Issue | [#71](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/issues/71)，先前确认通用 Office 归属上游，先真材验收再修复 |

### 明确的上游权限限制

已尝试在上游当前固定 `main` 创建 `fix/office71-distinct-source-index-r01`。GitHub 连接实际拒绝：
`403 Resource not accessible by integration`。
因此本轮 **无法宣称已提交 Nya-Angle 上游 PR**。PR #110 是**本审核仓库独立的、可移植的共享 Office 补丁**，不是上游仓库合并/发布凭据。取得有权限的 fork 或维护者授权后，必须从上游固定 HEAD 另建分支，人工审查与移植此处的通用变更并通过**上游独立 CI**，提交上游 Draft PR（而不是替换其较新的整个源文件）。

## 2. 修复设计

原问题由三个相互强化的身份冲突构成：
- `allocateSessionFileId` 优先无条件复用 `manifest[stem].fileId`，不校验物理源路径。
- `manifest[stem]`、`<stem>.index.json`、`<stem>.anchored.md`、`<stem>.md` 都只以 basename/stem 命名，第二个来源覆盖第一个，尤其相同 revision 会命中旧缓存。
- `resolveMaterializedIndex` 对重复 basename 的模糊查询静默返回第一个来源，构成错误材料归属风险。

本补丁限定 `apps/electron/src/main/lib/document-parse-tools.ts`：
1. **物理源路径优先**：manifest、registry 中只复用匹配 normalized absolute sourcePath 的身份；检测同一个 `fN` 同时属于多个不同源时不复用，且不接受指定的 `preferredFileId` 去抢占另一来源。
2. **复用旧单文件布局**：当无同 stem 记录或旧 index 时仍使用 `<stem>.md` / `<stem>.index.json`；否则为新源使用 sourcePath 的短 SHA-256 派生稳定候选 artifactId（同目录内防冲突），让 `fN`、manifest key、clean/anchored/index 文件独立。文件内容相同但物理路径不同，仍属两个不同来源。
3. **缓存一致性**：命中缓存同时核对来源路径、`fileId`、`artifactId`、解析版次 `revision` 及所需文件，否则重建；源内容更新只能重写自己的索引。
4. **查询明确性**：唯一 `fileId` / 完整路径优先；basename 对应多文件时返回明确错误，要求模型使用唯一 `fN` 或完整来源路径，不能猜第一份。
5. **原件与 SourceRef 分层**：这修的是普通 Agent Office 索引，**不是**直接审核 `SourceRef(documentVersionId,parseRevision,location,quote)` 的信任授予；仍由原案卷校验实际引用和权限。

**升级注意**：先前被错误覆盖而消失的旧索引不可能凭残留 manifest 猜测或恢复原始出处。旧实例中有冲突的源必须依托各自仍在的原件重新导入并重建索引；不能把原有 `f1` 解释成原本不存在的另一源，也不能伪造恢复成功。本补丁并未实现通用数据迁移器。

## 3. 工程回归范围（不得夸大）

新增 `apps/electron/src/main/lib/document-parse-tools.office71.test.ts` 为**真实文件系统与物化层正反例，但 Office parsed 内容是合成输入**，不是完整 ZIP 解析 / Electron/Main E2E。覆盖 DOCX/XLSX/PPTX × 不同内容同名异路径、相同内容反向导入/重复、跨格式同 stem、物理路径改版、preferred ID 碰撞、legacy 单文档路径、`fN` 切片及带锚点反查、同名弱查 fail-closed。

定向测试、本仓库 typecheck、边界、Main/Preload/Renderer build 和全仓 PR CI 必须全部以 **PR #110 最终 HEAD/tree** 的实际 Actions 与日志签署；任何 CI 首败保留（含测试夹具问题），不得拿之前 #108/#105 的成功代替。

## 4. 下一实机入口

按 [70 号](70-p06-u1-office71-local-acceptance-20261018.md) 在新隔离 profile 复演 **真实** DOCX/XLSX/PPTX，Main 经过新补丁后六组 formerly RED 变 GREEN，另外测试一致性/缓存/不同进程重启、跨案 SourceRef 仍拒止。此环节不可使用旧 PR #105 的应用二进制。全部经证据核验才可写 `OFFICE71_LOCAL_REAL_PASS_SCOPED`；上游独立 PR 仍须另行处理。

## 5. 门禁状态

- P02 `REMOTE_CONTROLLED_PASS + LOCAL_PASS_SCOPED` 继续保留；
- Office #71 在 CI 未确认前为 `FIX_IN_DRAFT / REMOTE_PENDING`，在真正实机验收前为 `LOCAL_NOT_ACCEPTED`；
- 合法 Pi/provider 五工具与真实 binding、跨案撤权、P06 业务 A/B/C、故障卷等没有因此得到通过凭据；
- P06 `PARTIAL`、P06-S02 `NOT ACCEPTED`、L02-00 `PARTIAL / NOT ACCEPTED`、L02-01 `NOT ADMITTED`、`MERGE NO-GO`、P07/P08 `NOT STARTED`。
