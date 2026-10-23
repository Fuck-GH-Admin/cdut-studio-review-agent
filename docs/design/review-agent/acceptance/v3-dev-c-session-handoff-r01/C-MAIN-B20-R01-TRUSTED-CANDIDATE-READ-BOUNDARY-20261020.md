# Dev-C C-MAIN-B20-R01 | trusted Main-only B20 current candidate read boundary

**C-ONLY ENGINEERING EVIDENCE**：供 Dev-C 与用户阅读；不是 A/B/I 的共享规则/任务，也不授任何 I C-owned source 变更或 Main lease。唯一跨线批准以 #145 `DECISIONS:C` 为准。

## 0. 已独立接收 B R20，未自动源导入

B #142 最终精确 `984fbdda35590b39e8547860a025ef0db5a666b9`，compare 上轮 R19 `77e6df0511098e084b045a711d16c48cad93c758` ahead 5/behind 0，恰 3 B-owned 新增路径。B20 read bundle `review-v3-b1-b2-main-read-bundle-v3-b.ts@2ff051fc5d18a2c0ef9465188a3611a71a0989ee` 的 `readB20CurrentCandidateBundle`、新增测试 `@65fc1149b6bd73b2e51f0e0e960541204055128d`、B-only 详细依赖与 UAT `@098ce5115169e40edd269d789c1a8fd96addf1b5`；三工作流 `39328913067`、`39328913007`、`39328913046` 3/3 PASS，full Bun 4212/5 skip/0 fail、新 12/12 PASS。C 在 #145 C-only 授权/签 B 完成 `B-R20-C-DEPENDENCY-ACCEPT-R01`；**仅依赖验收，不是批准 I 全量导入**。

## 1. C 实际开发

C Draft #144 基于上一签绿 `7e80c5e782c0e7d5b41a804b11cd5cbe6a130c45`：

- C-owned `apps/electron/src/main/lib/review/review-v3-main-b20-trusted-candidate-read.ts`：提交 `329a256c944efd1ee0de4778b64e7f90ec8f8c09`，实现 `CMainB20TrustedCandidateRead`；它不 import B 源码、也不 import Electron 或注册 IPC。
- 同路径 `.test.ts`：提交 `d5a61304ddb09c38fea7982623786f0ce56ed220`，八类安全组别。

## 2. 真实依赖与承诺

本 Main-only gate 从 C future trusted Main composition **主动注入**：
1. `currentIdentity`：Principal/session、current Main window/physical sender frame、Owner ID/generation/epoch、Case candidate ID，绝不信任 Renderer actor/archive key/School issuer；
2. `currentInstallationToken`：同一源对象卸载重新安装也必须换 token；旧异步返回不再有效；
3. `canRead`：基于真实 Main 授权与当前 Owner；
4. `getPinnedExpectation`：来自 C Main 当前候选版本登记，不允许 Renderer 决定 B1 revision/digest/frozen fingerprint；
5. `readCurrentBundle`：未来从已独立来源锁批准的 B-owned `readB20CurrentCandidateBundle` 取得最新 B1 vault+B2 live original/ledger/parser+B19 candidate，只读，C 不做第二份 B 库。

C before/after 两次 re-attest Main principal/frame/Owner/epoch、安装 token、不可变 pinned author revision/digest/frozen；两次 B20 当前来源读取内容不一致拒绝。检查 B20 外层和内层 B19 provenance 的 template/case/Owner/fingerprint/current candidate-only/无 School publication/无 Business write，并只返回脱敏 `CMainB20CandidatePreview`、`displayOnly=true`、`schoolPolicyVerified=false`，不返回 Principal/physical archive key/School issuer。

## 3. 已新增离线正反例

1. 精确来源读取，两次 current 回验，返回仅 candidate-held，物理 archive key/Principal/issuer 不输出、结构化隔离。
2. 未安装 Main reader/无 frame/撤权/路径探测，在 B read 前拒绝。
3. 同源卸载重装发生在 B await 后，旧 request 拒绝。
4. frame 更换、Owner 代次更换、ACL 撤权，before/after 双边拒绝。
5. C Main 当前作者版本发生变化或 B bundle revision/frozen fingerprint 漂移，拒绝。
6. B bundle 伪装 school published/Business write/authorityInstalledByB，拒绝。
7. 跨 Case/Owner generation/B19 source snapshot/hash/Plan fingerprint 伪造，拒绝。
8. 两次真实来源读取中状态不同，拒绝返回旧结果。

## 4. 必须坚持的真实边界

**此 R01 并未把 B R20 代码实际装入 C 生产分支、未新增 UI/IPC/Preload、未安装 Main Principal/Owner/native picker、未生成 School 发行者或正式 Plan**。现状应标记 `C_MAIN_B20_READ_BOUNDARY=OFFLINE_ONLY`、`LIVE_B20_SOURCE=NOT_INSTALLED`。C 后续另行精确来源锁：B R20 源文件 + 完整 imports/dependency graph，需要正式选择 C direct source integration 或 I 有界 replay、重新验所有 source-to-target Git blob、联合 Gate O，再单独授予真实 Main/Preload 读通路的 C-owned 变更与 Gate E。

## 5. GitHub CI / 工程签收

初始新 C exact SHA `d5a61304ddb09c38fea7982623786f0ce56ed220` 已触发 GitHub PR `39331486760`、Baseline `39331486741`、Batch `39331486761`、D1 `39331486777`、D2 `39331486745`。**起始状态 PENDING**，不得拿 B 4212/5/0 或旧 C 4142/5/0 代签。首败须保留并仅修 C-owned 代码/测试，新 SHA 同基线 5/5 成功后由 C 另签 `C-MAIN-B20-R01-FINAL-GATE-O`。Gate E NOT_RUN，School L BLOCKED_NO_AUTH，Product P NOT_RUN，Release NO_GO。

## 最终精确 Gate O 结果

- C #144 HEAD `d5a61304ddb09c38fea7982623786f0ce56ed220` vs 上轮签收 `7e80c5e782c0e7d5b41a804b11cd5cbe6a130c45` ahead=2/behind=0、仅 2 个全新 C-owned 路径、0 B/A/I/shared/Main IPC/Preload/Case/Run/SchoolPort 修改。
- PR CI [39331486760](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39331486760) job `118330650650` full frozen install、TypeScript、package boundary、built-in skin、Main/Preload/Renderer build 完整通过，原始 Bun **4150 PASS / 5 OS SKIP / 0 FAIL（4155 tests/478 files）**。
- 8/8 专项（main identity/Owner/grant/epoch/real source pin 双读、撤销、同源重装、frame 换代、作者修订变更、候选来源恶意发布标记、跨案来源、异步途中变更）**均从同一原始 log 确认 (pass)**。
- Baseline `39331486741`、Batch `39331486761`、D1 `39331486777`、D2 `39331486745` **4/4 SUCCESS**；五项最终 `5/5 completed/success`。
- C 在唯一四线 `DECISIONS:C`、`STATUS:C` 正式签 `C-MAIN-B20-R01-FINAL-EXACT-GATE-O=PASS_EXACT_SHA_D5A61304` [commit `970675175fd048a679fd4b1d12621ff028265119`](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/commit/970675175fd048a679fd4b1d12621ff028265119)。

**未达成的生产前置条件**：B20 read bundle 源锁具体 imports/依赖集合尚未导入 C 或 I；C 仅创建了经过 Gate O 的无 IPC Main-side gate，不存在真实窗口身份、Owner、native picked archive 和当前 selector registry 的合法 live 安装回执；不允许把测试 dependency fixture 宣称产品已闭环。后续必须先核验完整 source graph/精确 blob，再真实 C-only Main adapter 实装、严格 Electron Gate E、L/P。另外 I #154 新 B18 Stage4 联合 Gate O 已请求 C 独立新工程签收，不能用 C B20 签收代签。
