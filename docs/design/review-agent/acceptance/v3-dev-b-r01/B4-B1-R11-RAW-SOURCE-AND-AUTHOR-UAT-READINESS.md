# Dev-B R11｜历史原件真实性恢复、作者工作流输入修复及第 51 套真人验收准备

**身份/隔离**：CDUT Studio Review V3 / Dev-B R01，仅涉及 B 自有来源核验、作者界面候选组件、测试和文档；原 Draft PR #142，base C0 `5682057c7232c914e72fdae525ce95fd33f32b53`。不是学校政策/Gold 签署，也不是 C 的 Main/Preload/CurrentCase/ApplyMaterial/InstallPlan/ReviewRun 写口。

## 1. R10 精确 Gate O 绿色检查点

先在固定代码 SHA `bf88320e57b20ebc2023f27665c544ce2ba72ce4` 完成 4 类 TypeScript 首败修复以及 17 个实际 ZIP/ArchiveVault/OOXML 测试失败收口：

- [PR CI #39291009965](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39291009965)：`SUCCESS`，`bun run typecheck`、package boundaries、main/preload/renderer build、完整 Bun 回归。**4,100 pass / 5 platform skip / 0 fail，4,105 tests / 479 files / 18,283 assertions**。
- [D2 #39291009879](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39291009879)：`SUCCESS`。
- [Review Baseline #39291009937](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39291009937)：`SUCCESS`。

因此 **R10 Gate O=PASS_EXACT_SHA**，不是最新移动 HEAD 的永续签名。用户可按此 SHA 回滚；R11 新文档/测试/作者修订产生的 HEAD 必须另跑自己的 O。Gate E `NOT_RUN`，Gate L `BLOCKED_NO_AUTH`，Gate P `PARTIAL`。

## 2. 原文真实性：12/50 → 43/50，与业务认证分开

独立访问用户已授权的 ChatGPT Library 原始 Markdown（此前 Git manifest 说明 Library 原文字节未提交），按真实原始文件字节计算 SHA256，与 D4 固定目录 `sourceSha256` 逐模板逐项对照。任何工作副本只有短期离线核验用途，本批**没有向 GitHub 提交原始业务 MD 原文**，仅提交可追溯的 SHA256/文件名/冻结声明/状态证据。

来源：`B4-50-ORIGINAL-MD-BYTE-AUDIT-R03.csv`（保留原来 12/38 的历史调查快照）；本批新 `B4-50-ORIGINAL-LIBRARY-RECOVERY-R11.json` 是针对其中 38 份缺失项的**独立增量补证**，以及 `review-v3-b4-library-original-audit.test.ts`（校验 38 个唯一 templateId 与固定 50 行来源声明一一对齐、状态和学校授权绝不升级）。该合成数据测试只核验归档证据账**内在一致性**，不能代替当次用原件 bytes 实际重算 SHA256 的独立程序与材料保全。

| 冻结原始母版 SHA256 证据 | 套数 | 说明 |
|---|---:|---|
| R03 历史 Git 原文对象，实际字节重新计算匹配 | 12 | G01 5 + G07 7；不改历史结果 |
| R11 Library 原始 Markdown 实际字节 SHA256 与 D4 冻结声明一致 | **31** | 覆盖 G02、G03、G04、G05、G06、G08 的部分成员 |
| R11 找到同名/相关版本，但实际字节 SHA256 不等于 D4 冻结声明 | **4** | 明确 `HASH_MISMATCH_QUARANTINED`，不能覆盖原始候选 |
| R11 当前可检索 Library 未找到原文字节 | **3** | `RAW_LIBRARY_FILE_NOT_FOUND`，不是断言文件永远不存在 |
| **历史原文身份现可独立匹配** | **43/50** | 这不是逐业务 Check 无损性、校方有效校规、独立 Gold 或发布权 |

严格隔离的四套差异：
- G02 `g02-t03-review`：`G02-T03_正式业务模板_MD_v0.1.md`；有实际文件，但 SHA256 不等于固定 D4。
- G04 `d4-g04-t06`：`G04-T06_正式业务模板_MD_v0.1.md`；有实际文件，但 SHA256 不等于固定 D4。
- G06 `g06-t01`：取回文件名带 **v0.1.1**，D4 固定源为其他版本/内容；不得把最新版覆盖原版。
- G08 `g08-t03`：`G08-T03_正式业务模板_MD_v0.1.md`；有实际文件，但 SHA256 不等于固定 D4。

仍需原件的三项：`g03-t12`、`d4-g04-t03`、`g06-t06`。不得依据相邻 T 编号的规则猜补、用 Git manifest 自称 SHA 当重新验真的原文字节、或静默进行 CRLF/Unicode 修复后当作同一来源。来源版本冲突应提请用户/原作者找冻结字节或按“真实新版来源”建立另一个明确审计身份。

**持续阻断**：G01 34 条 Check 的对象/case scope 均仍 `UNKNOWN/NO_AUTO_DEFAULT`；4,163 条来源链接 applicability 未充分确认；50 套均 `candidate-held/publicationAllowed=false/policyApproval=NOT_VERIFIED/independentGold=NOT_AUTHORIZED_OR_NOT_RUN`。Source SHA256 真实匹配不代表现行学校制度或 Gold 答案，不能导致任何 C 正式 Plan 安装。

## 3. 作者工作流 R11：输入法暂态与业务标识的区别

先前 `ReviewV3AuthorWizard` 对来源/字段/对象 ID 的每一次键入都立即调用 `renameB1AuthorIdentity`，该函数只接受**完整合法**的 ID（正则严格、不得空或重名）。输入法组合、先清空再重命名、使用键盘选择全名，会因暂态被当作正式业务改名而直接报错；这属于实际操作体验缺口，不应该要求用户“逐字符都符合完整 ID”。

本批引入 B-only `B1BufferedIdentityInput.tsx`，在焦点期间独立保存输入字符串；blur/非 IME 正在组合时的 Enter 才执行一次已有的、不可变复制的来源引用重命名；Escape 取消提交。来源 `sourceId`、字段 `field.key`、目标 `targetKey` 三处接入，仍由 `renameB1AuthorIdentity` 一次性级联所有 field/source/Check/target/trial 引用；非法完整值/冲突不保存，原值由组件回显，不增添发布/身份权。并提交 `B1BufferedIdentityInput.test.tsx` 的渲染、引用图保持和非法完整 ID 负例。

**本轮实现限制**：JSX SSR 测试不是中文 IME 的完整事件序列，也不是实际 Electron 的焦点/blur/异步保存行为。必须在 Gate E 实机测试中文拼音中间态、Enter 选字与 Enter 保存、Escape、Tab/blur、重复 ID 拒绝、旧字段引用和试跑样例迁移。B1 作者组件仍没有被 C 正式工作台安装；不得标记“51st 真人无代码 UAT PASS”。

## 4. 第 51 套真正无代码 UAT：正式启动条件与停止规则

**必须同时具备**：Dev-C 正式认可新 B 技术切片（不能越过 `B-CR-001 APPROVED_SLICED_SPEC/IMPLEMENTATION_PENDING`）；C/I 按正式授权把 B1 Wizard 挂到真实 Electron 工作台，Main-sourced principal/owner/grant + CAS Receipt 连接到 `ReviewB1AuthorMainPort.freezeSavedDocument(ctx,shownDocument,revision)`，不允许只调用旧的 `freezeCandidate(templateId,revision)`；具备真实 app 文件版本/原件输入与 B3 20s 用户可取消技术候选；精确集成 SHA Gate O 已绿。学校政策/独立 Gold **不是作者自建合成候选编辑的前提**，但若要签正式学校政策出版，则 Gate L 必须另通过。

**五人独立验收**：5 位不知道内部 JSON/TypeScript 的真实用户，各做 **30 分钟**，每人从空白 UI 自建“第 51 套用户声明业务”候选，而不是把现成 fixture/JSON 粘进磁盘。目标脚本承接 R08 `B1-R08-AUTHOR-REFERENCE-INTEGRITY-AND-51-UAT.md`，但要增加新输入法问题与 B3 路由入口：

| 时间 | 真实用户动作 | 关键通过证据 |
|---|---|---|
| 00–05 | 从真实主界面进入“没有匹配模板→自建审核业务”，填写目的、角色、选择候选性质 | 用户不误解为校规发布；无源代码或 devtools 写入 |
| 05–12 | 添加两来源、三个字段（布尔/枚举/evidence）、两个 Subject/对象、两个 Check、阶段与输出 | 逐字段/来源/Check 绑定保真；视频、Main Receipt、修订一致 |
| 12–18 | 使用中文 IME、清空/替换来源/字段/目标 ID，Enter/Escape/Tab，先尝试删除被引用元素再解除引用删除 | 临时 IME/空输入不会破坏引用；不误删除/覆盖；原版仍可追溯 |
| 18–23 | 空值 `unknown`、技术样本真/假分开预览，伪附件/错误 Subject 试跑 | sample 不会写进来源；不生成假 SourceIdentity/Gold 或 approved |
| 23–27 | 保存→继续编辑→旧版本冻结失败→重存修订→冻结已保存候选→关闭重开 | Main 再验可信身份、显示源与 revision；只冻结 `candidate-held` |
| 27–30 | 删除 Check，审查版本差异/必须 ACK 的旧绑定，导出候选、重新打开、恢复历史 | 删除责任未静默消失；无法绕过 C 发布门禁，记录失败恢复 |

**验收记录必须有**：安装包/OS/架构/应用 SHA、B/I/C 原始锁与新集成 SHA、每位参与者明确匿名 ID+使用时长、真实屏录、Main/Renderer 脱敏日志、原件 SHA/DocumentVersion/SourceRef、修订/Receipt/冻结指纹与返回值、失败首发日志、是否自行需要协助、填写时间与总任务成功率。不得通过排除失败参与者、由作者代操作、修改 fixture、录制无授权原件、发布未批准政策来取得“好看”的 PASS。

**停止与 NO_GO**：跨案串 Subject、旧 Owner 仍可提交、伪造学校身份/政策权限、未保存内容意外冻结、试跑假证据被当真、丢 Check、来源版本被静默覆盖、正式 UI 没有 Main 可信入口，任一成立立即记录 `BLOCKED_PRODUCT/SAFETY`，不能签 P。Gate E 还必须覆盖真实 Office71、目标机多 PID 并发、ZIP/ENOSPC/强杀恢复、100 案/500 文件和 B3 路由超时/手动纠正；这些不能由五人作者试用替代。

## 5. 批次归档及交接

- **已签的固定 R10 O 锁**：`bf88320e57b20ebc2023f27665c544ce2ba72ce4` / 3 项 SUCCESS，**不能**视为上述 R11 新代码和文档 SHA 的 Gate O。
- 本批新 B-owned 工件：`B4-50-ORIGINAL-LIBRARY-RECOVERY-R11.json`、`review-v3-b4-library-original-audit.test.ts`、`B1BufferedIdentityInput.tsx`、`B1BufferedIdentityInput.test.tsx`、`ReviewV3AuthorWizard.tsx` 的局部 B1 输入改动及本文。全部保持 #142 Draft，不改变 C0 原文件/正式 Main/Preload/Case/Run。
- 本批新最终 HEAD 必须重新在同 SHA 执行 `bun run typecheck`、`bun run check:boundaries`、`bun test` 及 build:main/preload/renderer，并检查 GitHub PR CI、D2、Baseline 的结果。若 CI 首败必须保留日志并修复 B-owned 文件，不能仅凭历史 R10 Green 签本批。
- C/I 后续真实接入：只提交 B 技术候选、raw source/receipt/source scope 核验材料和 UAT 门禁；新业务发布/授权、真实 Main handler 和正式业务回执都由 C 控制。I1 固定早期 B 来源 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`，未经 C 与新 Gate O 不自动热替换。
