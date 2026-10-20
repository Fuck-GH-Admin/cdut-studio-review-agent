# Dev-B R17｜候选修订存储与物理来源可信性加固

**归属**：Dev-B 既有 #142 Draft、`feat/v3-dev-b-template-intake-r01`；C-only 可信 Main/IPC/Preload/Case/Run 权限不变。唯一 ABCI 协议 PR #145，C `B-CR-002-A/B/C` 参见 [正式批示](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/142#issuecomment-6275492512)。R16 已签回滚锚 `33a8482a1bc40d24076941f7643e002d8a228cb1`（PR CI #39315934021, D2 #39315934016, Baseline #39315934018，4164 pass/5 skip/0 fail）。

## 本批实现（真实 B-only 生产技术代码）

1. `review-template-author-store-v3-b1.ts`：B1 作者草稿不可变修订和冻结候选的**原 JSON 布局、文件名、SHA/revision CAS 合同保持不变**。在已存在的单模板独占锁下，新修订/冻结 JSON 改为 `wx` 排他创建、0600、文件内容 `fsync`，本地 POSIX 对父目录单独 `fsync`；Windows Node 不保证目录句柄 `fsync`，需 Gate E Windows/macOS/Linux 真机验证。所有读取按 `lstat`+文件单链接+ `O_NOFOLLOW`（平台支持时） + `fstat` 比对 inode/dev，且对子目录 `review-v3-author-candidate/{id}/{revisions,frozen}` 防符号链接。任何截断修订、破损的历史链、孤儿 `author.lock`、不安全文件/目录均 fail closed；**本批没有做无人授权的自动解锁/自恢复**。这提供本地 crash consistency 加固，**不代表已证明断电持久性或网络文件系统原子性**。
2. `review-source-version-adapter-v3-b2.ts`：已通过真实 parser 缓存取得的 `SourceIdentity`，再次签发前读取当前 Main staging capability 的 `B2MaterialCandidate` 元数据与原始字节，验证 `documentVersionId/materialId/rawSha256/caseCandidateId/Owner/generation` 一致；真正 `sha256(current bytes)` 一致才能使用原 `parseRevision/blockId`。不能因为过去登记过块就允许物理字节被替换或 Owner 撤权后继续出具证据。此重新哈希是完整原件 I/O，**文件最大 50 MiB，可能增加读取成本，后续可在真机 Gate E 计量，但不得以缓存优化绕过来源真实性**。
3. `ReviewV3AuthorWizard.tsx` + `review-v3-author-revision-read.ts/.test.ts`：作者点击“导出候选 JSON”只发起浏览器下载请求，**不得自动设置备份成功**。展示独立 UI 要求作者检查文件存在、可打开且内容正确后手动确认，确认绑定当前 `templateId+editEpoch`；旧 epoch/不同模板/繁忙操作失效。不宣称通过 OS API 校验备份成功；真实下载成功与文件验真需 Gate E 录屏/打开文件证据。只有在可选 C-owned reader 真正授权接线后，才会呈现候选 latest revision 的比较/显式替换界面。

## 必须回归的证据

- B1 目录符号链接、历史修订符号链接/硬链接、冻结候选符号链接、孤儿 writer lock、异常 revision、既有 CAS/历史链/冻结不可变格式；明确覆盖失败后的 fail closed。
- B2 真实 TXT stage+parse+SourceIdentity 正例，使用测试专属 Fault Injection 篡改 staging 缓存原始字节和 `documentVersionId` 的负例，Owner revoke 负例，扫描图片等先前 R16 证据不再被认作全文已读。
- B1 导出事件与用户备份确认必须分离，同 epoch 正例、不同模板/后续编辑/写入中负例。
- 每轮 Gate O 仅以最新精确 #142 SHA 的 PR CI frozen install、TS、boundaries、skin、Main/Preload/Renderer build、Bun 完整回归，以及 D2、Baseline 三者均 `completed/success` 判 PASS。记录所有真实首次失败、不将前一绿色结果转移给新 SHA。

## 仍然明确阻断

不引入任何 SchoolPort、Main trusted actor、Renderer 授权生产 token、CurrentCase Install/UpgradePlan、正式删除 Check durable ACK、ReviewRun/Decision/Outbox writer。本批**不是** `B-CR-002` 向生产 Main/Preload 的授权延伸，也不默认让 Integrator-I 导入本 HEAD；I3 固定 source 锚、I2 旧 B blob lock 均不变。50 套 candidate-held、47/50 原始 raw byte 验证通过与三套隔离冲突、G01 34 UNKNOWN/4163 来源适用性未知、B4 32 高风险条款 semanticValidated=false 继续。Gate E 未跑、L 无学校授权、P 第51套五位非开发人员×30分钟未跑，Release NO-GO。
