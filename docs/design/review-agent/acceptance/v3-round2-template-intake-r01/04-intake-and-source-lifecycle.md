# 04｜材料输入、原件生命周期与来源证据链

**调查性质：固定 SHA 远端源码静态检查、历史测试断言阅读。** D4 输入使用 `c2f965d29022a42b3c32d6a4cb73aa8fd542329b`；P06 SourceRef/工具使用 `db0284879f75ce123b5d83cb6577a3cc7ad057da`；主线文档解析使用 `8989941b6fb5651564e32d11c4215b6a6d5a5209`。分支并行，不能用“同名文件”推断天然集成。未在本轮执行 Electron GUI、真实 Office、OCR、Provider、坏卷测试。

## 一、从选择到正式案卷的状态图

```text
OS Native Picker (files/folder) ─┐
Renderer drag file BYTES ────────┼→ Main staging/private copies + bounded directory/ZIP expansion
                                └→ SHA256, skips, staged ownerWebContentsId/token/TTL
                                            ↓ (candidate route only)
                            suggested / manual-required / multiple-tasks
                                            ↓ (explicit reviewer choice)
                      D2 candidate Plan + new technical case/legacy metadata
                                            ↓
            import file with role application/evidence + source origin/hash
                                            ↓
                  parsed | partial | failed (retain actual originals)
                                            ↓
   active DocumentVersion, parseRevision, blocks/locations, SourceRef, EvidenceLink
                                            ↓
            Pi read/inspect with case/run binding → coverage, verification
                                            ↓
          append / replace / retry / old version archived / re-review gate
```

**分界：**D4 import batch 管理“哪些文件被接收入哪个案卷”；P06 `batch-store.ts`/调度管理“哪些案卷执行了哪一批 Run”。两种 batch 生命周期、幂等键、失败含义不同，V3 可共享身份/日志/事务工具，但不能合并成一个含混状态机。

## 二、入口、信任边界、落盘归属

| 节点 | 已看到的真实实现 | 必须区分的失败与未证实处 | 来源 |
| --- | --- | --- | --- |
| Native 文件/目录 | Electron 主进程 `dialog.showOpenDialog` 取得宿主路径，不收普通 Renderer 任意路径；返回审阅预览，不暴露暂存的磁盘路径 | 跨系统、取消后迟到结果、窗口销毁后的 owner 仍需实机 | [review-d4-intake.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-intake.ts) |
| Drag/drop | 传输用户选中的 File bytes，不传 Renderer host path；单次 16 份、每份 10 MiB、总 40 MiB，逐项验证合法名称 | 复制成本/大文件性能及真实拖放体验未测 | 同上 |
| Folder/ZIP 展开 | `stageD4NativeBatch` 只接受 Main 选中根路径/私有副本；lstat 禁跟随 symlink；ZIP 路径拒绝绝对路径、父目录、驱动器、反斜杠；流式大小限额、SHA-256 去重并登记 skip | Native 接收至多100文件、每件50 MiB、批次100 MiB、ZIP压缩不超过50 MiB、8层、5000遍历节点。恶意 ZIP CRC、竞态、大小声明边界须独立 fuzz/回归 | [review-d4-batch-staging.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-batch-staging.ts) |
| 暂存能力 | Main 仅保存20分钟 STAGED Map，UUID token 与 `ownerWebContentsId` 绑定，`inUse` 避免重复 claim，取消/过期清理临时目录；`multiple-tasks` 不可 claim | claim/inspect 校验原件仍存在、size 不变，并非每次重新 sha256；暂存期文件被等长更换等 TOCTOU 需反例试验，不可宣称已发现可利用漏洞 | [review-d4-intake.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-intake.ts) |
| 角色 | `resolveD4IntakeRoles` 明确只允许 `application` / `evidence`，数量必须与暂存文件一致 | 角色由审核人选择，不代表学校官方材料可信；跨 Subject 明确关联仍需 EvidenceLink | [review-d4-intake-roles.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-intake-roles.ts) |
| 模板路由 | 两组明确 SIGNALS (`g03-t01`、`g08-t02`) 加全模板 ID/完整名称文本匹配，仅候选；多事项 `multiple-tasks` 拒绝、含未知文件人工确认 | PDF/Office/图片并不进入此处语义识别；没有全50领域的可靠自动路由 | [review-d4-routing.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-routing.ts) |
| 单案创建 | `createD4ClientCase` 调 D2 技术建案、写 legacy case metadata 并导入 staged；`review-d2-runtime` 在 V2 aggregate 挂 Plan | 分属 V2 aggregate 和 legacy ReviewCase；是否可在 I/O 中断下全原子、一致恢复尚未核实 | [review-d4-client.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-client.ts)、[review-d2-runtime.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d2-runtime.ts) |
| 文件追加/替换 | `assessD4CaseBatch` 检查当前修订、重复 SHA、同名冲突，执行显式 append/replace/skip。 `D4BatchRun` 按文件落盘 checkpoint，恢复严格核对暂存清单 SHA/大小/名称 | `D4_CASE_WRITE_BUSY` 为进程内 Set；跨 PID/双 Main 和崩溃状态恢复需要独立证据；替换归档异常标 `archive-failed` 不应判成功 | [review-d4-case-batch.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-case-batch.ts) |
| 原件重解析 | `resolveD4RetryOriginal` 验案卷根 realpath/非 symlink/大小/SHA；retry 新增一次尝试版本，处理 archive/失败状态 | 新版本不能复用旧证据；必须验证旧 Run/Outcome/SourceRef 全局失效 | [review-d4-document-retry.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-document-retry.ts) |
| 原件冲突决议 | 明确选择保留新版、弃新版等，检查单活跃版本与新版原件 hash；保存过渡结论 | 版本终态、历史案例查询、现场双击同版本的 GUI 行为未签收 | [review-d4-material-resolution.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/c2f965d29022a42b3c32d6a4cb73aa8fd542329b/apps/electron/src/main/lib/review/review-d4-material-resolution.ts) |

## 三、格式解析与坐标精度

| 原件 | 已证实的解析表达/限制 | V3 必留的真实性原则 |
| --- | --- | --- |
| PDF | `parseFileIntoSourceDocument` 优先布局块与页坐标，失败回退文本切块；扫描 PDF 提取零文本 → `partial` + 无伪造文本块 | 有真实页坐标才可指向矩形；扫描页视觉预览不等于可复制文字或精确引文 |
| DOCX | 结构解析标题、列表、表格和内嵌图片资产；结构异常回退纯文本会标 `partial`；不应伪造 Word 页码 | Word 段落/表格结构定位与版面视觉区别保存 |
| XLS/XLSX | 逐 sheet/row/column 单元格文本，解析警告时 `partial`；公式未计算或缓存值不可信不能当定论 | 数值、文本、前导零及公式缓存、来源单元格必须分开 |
| 图片 | 原图登记为 image 块、无 OCR 文本时 `partial`；视觉阅读记录另走 image tool | 不允许只有“上传成功”就标文档全文读取 |
| CSV/Text | `source-index.ts` 引号感知 CSV 和段落/文本范围索引；保存 `documentVersionId + parseRevision + blockId` | 索引不是审核授权；含糊的 FNV 风格短 `excerptHash` 不是 SHA-256 原件完整性证明 |

主线 [document-service.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/8989941b6fb5651564e32d11c4215b6a6d5a5209/apps/electron/src/main/lib/review/document-service.ts)；P06 [source-index.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/source-index.ts)。P06 [document-capability-library.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/document-capability-library.ts) 只允许通过 documentVersionId/blockId 读取，分页记录完整块、图像通过实际加载与视觉登记；`isFullyRead` 拒绝凭部分扫描件已阅推导“完全阅读”，图像只有全部注册图块实际视觉检查后才有完整条件。原件及派生缓存应分开，不接受代理的宿主文件路径。

## 四、Office #71 与 SourceRef 的**双重身份**问题

- [document-parse-tools.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/document-parse-tools.ts) 及 [document-parse-tools.office71.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/document-parse-tools.office71.test.ts) 显示相同 basename、不同绝对源或同字节异路径必须有独立 Office `fileId/artifactId`，同一路径修改需更新 revision，不能污染另一个源。
- Office #71 专项测试**使用预物化内容来验证索引身份**，自身明确不代表完整 DOCX/XLSX/PPTX ZIP 解析和 Office GUI 端到端通过。
- [review-office-v2-sourceref-boundary.l02.test.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-office-v2-sourceref-boundary.l02.test.ts) 明确不能用普通 Office `fileId/revision/fN` 来证明 `Review SourceRef`：必须是确切案卷的 documentVersionId、parseRevision、当前 block/quote。Office 索引与 V2 业务证据是不同信任域。
- Office 修复在 P06 R03 的祖先链，但 D4 W1 和 P06 R03 分叉；**尚不能宣布两者在统一 W1 导入后直接适配**。已有“上游移植 403 BLOCKED_UPSTREAM”历史标记应当保留阻断状态。

## 五、严格工具读取边界

P06 [review-strict-pi-tools.ts](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/db0284879f75ce123b5d83cb6577a3cc7ad057da/apps/electron/src/main/lib/review/review-strict-pi-tools.ts) 把直接审核工具限定为 `review_read_documents`、`review_inspect_document_image`、`review_submit_result`、`review_inspect_original` 与 profile 的 `CompactContext`。原件视觉工具只接本案 `documentVersionId`，由 Main 实时解析可信物理路径并检查根目录，`await` 页图渲染后再次验证 session/case/run/assignment，防止撤权/换轮后迟到回执。**视觉回执不能自动升级为可定位文字 SourceRef**；真实 Provider 接口链未在本轮验证。

## 六、风险/可继承结论

优先保留：Main 私有暂存、owner/token 及 fail-closed 多任务路由，ZIP 边界与去重、逐文件进度+失败重试、原件可信 hash/版本、parseStatus/坐标精度区分、单案只读工具、Office 双源隔离、阅读覆盖双账本。V3 不得复制暂存文件到模型可写外部目录；不能让文件暂存状态兼任正式 DocumentVersion；需为换原件后的 SourceRef/Run/Observation/EvidenceLink 设计一个**原子失效传播合同**。未测的跨 PID、真实多图、Office71 完整集成、OCR 与学校权限继续列为验收门禁。
