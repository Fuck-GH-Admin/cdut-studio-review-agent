# Dev-B B2-R05｜真实 Office 字节混合 ZIP、Subject 分离与恢复可信能力边界

**工程分支**：`feat/v3-dev-b-template-intake-r01`，Draft PR #142；本报告记录新代码变动与需要运行的验证，不表示仓库/目标机 Gate O/E 已通过。上游 C0 `5682057c7232c914e72fdae525ce95fd33f32b53` / `review-c0/1`。最终正式 Main Principal/Picker/ApplyMaterial/Case 属 Dev-C，不授予 B 或 I 新业务写权。

## 本批定位的恢复缺陷及代码修复

1. **旧恢复候选带合成物理键**：`ReviewB2ArchiveVault.prepareRestage` 之前返回 `physicalArchiveKey: 'recovered-' + sha256(previousPhysicalKey)`。该派生字符串不是真实 Main 新签发的 Native 文件能力，却被赋予与 `B2TrustedZipInput` 相同的类型，容易被上层作为“受信原件”误用，且再调用 `saveAndStage` 时会依据新物理键生成另一 archiveId，丢失原始输入账关系。
2. **修复**：`B2RestageIntent.restage` 收窄为 `{requestId,bytes}`，不再包含 `physicalArchiveKey`。恢复输出仍明确为 `needs-main-revalidation`；要进入新的 staging，C Main 必须先从当前真实 sender/frame/session/Native source 重新授权并提供可信 physical key。旧 generation/token 绝不恢复，现有案卷、Plan、Run 不受影响。
3. **解码限额入版本化来源账**：新增 `review-b2-archive/2`，保存首次 decode 的原始 `B2ZipLimits`，重启按相同限额重新解码并逐项比对，防止只改自算 JSON hash 就将拒止子文件重判为接受。对于缺限额字段的旧 `/1` 输入，保留更严大小限制造成的保守拒止，但这不是有签名的来源认证，依然必须经 C Main 重新鉴别。
4. **旧只校验自持 manifest Hash**：`readVerified` 原先比对 ZIP 整包 SHA256 与 checkpoint manifest SHA256，但本地 JSON 可被修改并重新计算未签名的 manifest 摘要；`fileReceipts` 的 ZIP 子文件状态与原始 bytes 没有独立重算比对。修复后每次恢复会重新用生产 `decodeReviewB2Zip` 对真实 archive bytes 解码，与保存的 entryIndex/path/compressed hash/accepted raw SHA/status/reason 逐条交叉核验；原来按更严 maxEntry/maxTotal 拒绝的 `BOMB_OR_SIZE_LIMIT` 子文件保持拒绝，不擅自重判接受。
5. **成本边界**：恢复读取原件并重新解码可能增加 CPU/内存；当前优先采用 fail-closed，目标机 100 案/500 文件、超限与冷启动压测须记录重解压耗时/峰值，并据真实证据考虑只读持久已验证分片优化。普通 SHA256 不是签名，也不抵御本机管理员获取所有文件后的恶意篡改；文件权限、符号链接父路径、多 PID、ENOSPC 仍属 Gate E。

## 新增真实解析输入覆盖（非目标机 UAT）

新测试 `review-b2-office-zip-subject-v3.test.ts` 使用项目已依赖的 JSZip、XLSX 在执行时生成合法 OOXML 字节流，真实经过生产 `saveAndStage` → `decodeReviewB2Zip` → `ReviewB2StagingService` → `ReviewB2SourceVersionAdapter.parse` → `ReviewB2InputLedger` → `proposeB2MaterialCandidates`：

- 子文件 A `sub-A/proposal.docx`：真实 DOCX 段落+表格块及 `document-block` 原有来源；手动确认 `subject-A/application`。
- 子文件 B `sub-B/results.xlsx`：Excel 两个工作表 `Students`、`Awards`，表格中的前导零文本 `00123`、sheet/row/column 坐标；手动确认 `subject-B/supporting`。
- 子文件 C `sub-C/scan.png`：真实 PNG 原件，部分解析/人工视觉复核；**保持 needs-user-confirmation，绝不导出正式材料或 input accepted 候选**。
- 验证来自不同 physical bytes 的同名 DOCX 新 documentVersionId 不等于旧版本、旧 blockId 不可在新版本使用；跨 Case source 查找拒止；撤权后旧 parser registry/SourceIdentity 不可用于新发放。

这些是**程序生成的合法原件字节回归**，不是校方真实文件、独立 Gold，也不是 Electron 实机 Office71 全覆盖。尚需真实 Office 文件变体、损坏文件、PDF 大文档/扫描件、图片和 OCR、ZIP 文件夹批量、多 Subject 并发、目标机中断/断电。

## 回归命令与证据要求

```bash
bun run typecheck
bun run check:boundaries
bun test apps/electron/src/main/lib/review/review-import-checkpoint-v3-b2.test.ts apps/electron/src/main/lib/review/review-b2-office-zip-subject-v3.test.ts apps/electron/src/main/lib/review/review-import-ledger-v3-b2.test.ts apps/electron/src/main/lib/review/review-import-handoff-v3-b2.test.ts apps/electron/src/main/lib/review/review-source-version-adapter-v3-b2.test.ts
```

取得精确 HEAD 的 GitHub Actions PR CI、Baseline、D2，并将运行 ID、步骤首败、exit code、实际测试数量写入验收记录。旧 SHA 成功不等于新 SHA 成功。若 CI 失败，优先处理 B-owned 首败，禁止放宽可信 owner/Source/Subject 断言。

- **Gate O**：提交后精确 SHA CI 待完成，绝不借旧绿灯。
- **Gate E**：NOT_RUN；包括 Electron Main/native picker/drop、真实 Office71、100案/500文件、跨窗口撤权、恢复与文件系统故障。
- **Gate L**：BLOCKED_NO_AUTH；校方政策效力、真实签发人、SchoolPort、独立 Gold。
- **Gate P**：PARTIAL；50 个 candidate-held 模板的 34 Scope UNKNOWN/38 原文未独立取得、第51套无代码 UAT及完整工作台操作仍阻断。

## I 可用来源界限

本批 B2 decoder/vault/source candidate/测试只能在新的精确 B SHA Gate O 完整通过后作为技术隔离切片提供 I；I1 已锁定的 B `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc` 不自动替换。C 的 `B-CR-001` 保持 `APPROVED_SLICED_SPEC / IMPLEMENTATION_PENDING`，不得宣称安装或正式 ImportBatch 已实现。
