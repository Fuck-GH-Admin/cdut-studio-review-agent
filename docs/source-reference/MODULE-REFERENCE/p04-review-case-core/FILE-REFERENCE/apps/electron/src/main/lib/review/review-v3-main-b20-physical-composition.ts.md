---
path: apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 582e106690a8af369d6f5841b66ccad3f0658b32
sha256: 4ebcdd04c1b85a2061e7d402e96dec650f954a5a45478474fb6d3081dbaeb18e
lines: 218
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.ts

## 1. 结论与边界

Dev-C R10 的“真实 C Main ↔ B20 源适配器”：把 Main 注入的物理身份/候选注册/私有 ZIP key，与真实的 B1 修订库、B2 暂存/解析、持久 ZIP 保险库/输入台账、B19 绑定解析组合起来，通过 `installCMainV3B20ReadAuthorities` 把 B20 读取权威装进 `review-v3-main-author-plan-ipc.ts` 已注册的 B20 IPC handler。

边界（文件头 `apps/electron/src/main/lib/review/review-v3-main-b20-physical-composition.ts:1-15`）：

- 不创建学校发布者、Case/Plan/Run 事务、渲染层源；不含数据语义（那是 `readB20CurrentCandidateBundle`）。
- 不能用 `local-reviewer` 回退自我安装：必须由 Main 提供当前、独立授权的候选源（`:12-14`）。
- 零条目选择 = UNKNOWN，绝不等于 PASS（`:14`）。

## 2. 导出与关键符号

`export` 逐条核对：1 个接口 + 1 个类 + 1 个函数 = 3 个导出（常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainB20PhysicalSources` | 接口（导出） | 41-65 | `bSources:B20ReadOnlySources`、`currentCandidate`、`canReadCandidate`、`currentPinnedAuthor`、`currentSelections`、`nativePicker:CMainNativeArchiveRegistry`、`currentMainIssuedOriginalKey`、`assertLiveCMainIdentity` | Main 侧必须实现的物理源；实现者为 `review-v3-main-b20-current-registry.ts:86` |
| `CMainB20NumericEpoch` | 类（导出） | 71-101 | `create(id,numeric)=>B20MainReadScope`、`invalidate()`、`close()` | 本地单调数字 epoch；与 C 的字符串 `authorityEpoch` 无关（`:66-70`） |
| `installCMainV3PhysicalB20Sources` | 函数（导出） | 108-218 | `(source)=>()=>void` | 构造 `CMainV3B20ReadAuthorities` 并安装；返回卸载闭包 |
| `reject`/`same`/`sha`/`safe` | 内部 | 31-34 | 抛 `C_MAIN_B20_PHYSICAL_<reason>`；JSON 相等；64hex；≤256 非空串 | 校验原语 |
| `repick` | 内部（闭包） | 137-160 | `(expected,id,numeric,archiveId)=>void` | OS 归档重选 |
| `authority` | 内部（闭包对象） | 161-213 | 实现 `CMainV3B20ReadAuthorities` | 5 个回调 |

## 3. 内部逻辑与关键流程

### 3.1 数字 epoch（`CMainB20NumericEpoch`，`:71-101`）

- `create` 要求 `id` 七字段 + `numeric.senderId/frameId` 为非负安全整数，否则 `REAL_MAIN_NUMERIC_FRAME_AND_GRANT_REQUIRED`（`:75-84`）。
- 身份键 = 10 元组 JSON（含 numeric 帧）；键变化即 `generation++`（`:85-90`），返回的 `B20MainReadScope` 的 `authorityEpoch` 是**数字** `generation`（`:91-97`），绝不解析 C 的字符串 epoch（注释 `:66-70`）。
- `EPOCH_EXHAUSTED`（`:88`）；`invalidate()` 只清 `previous`（`:99`）；`close()` 后 `NUMERIC_EPOCH_CLOSED`（`:100-101`）。

### 3.2 安装（`installCMainV3PhysicalB20Sources`，`:108-218`）

1. 形状校验 `source`：`bSources` 四件套 + 5 个方法 + `nativePicker instanceof CMainNativeArchiveRegistry`，否则 `REAL_B1_B2_AND_C_MAIN_AUTHORITY_REQUIRED`（`:109-119`）。
2. `epochs` + `closed` 标志；`active()` 在卸载后抛 `SOURCE_UNINSTALLED`（`:120-121`）。
3. `validate(id,expected)`（`:123-135`）：`assertLiveCMainIdentity`；`currentCandidate` 的 caseCandidateId/grant 三字段与 `id` 对齐；`canReadCandidate` 真；`currentPinnedAuthor` 与 `expected` 全等且两个 digest 64hex，否则 `OWNER_OR_CANDIDATE_REVOKED`/`FROZEN_PIN_REVOKED`。
4. `repick`（`:137-160`）：`validate` → 数字 scope → `staging.assertStillGranted` → `currentSelections` 必须含该 `archiveId`（`ARCHIVE_NOT_IN_CURRENT_C_MAIN_SELECTIONS`，`:143-145`）→ `vault.inspect` → `currentMainIssuedOriginalKey`（`MAIN_ISSUED_ORIGINAL_KEY_NOT_AVAILABLE`，`:147-148`）→ `nativePicker.pickForBVault`（用 B 保险库原始 SHA + 密封 key digest，`:149-151`）→ 再 `validate` → scope 未变（`MAIN_SCOPE_CHANGED_DURING_OS_PICKER`，`:153-154`）。
5. `authority`（`:161-213`）：
   - `currentCandidate`/`canReadCandidate`/`currentPinnedAuthor`：`active()` 后透传（`:162-173`）。
   - `repickNativeArchive` → `repick`（`:174-176`）。
   - `readCurrentB20Bundle`（`:177-211`）：`validate`；记 `numericStart`；构造 `B20CurrentMainReadAuthority`：`currentScope` 每次 `validate` 并要求数字 scope 未旋转（`NUMERIC_SCOPE_ROTATED`，`:181-186`）；`currentSelections` 要求 scope/author 与起点全等（`FOREIGN_OWNER_OR_AUTHOR_SOURCE`）、注册表必须已装（`C_SOURCE_REGISTRY_NOT_INSTALLED`）、返回克隆（`:187-194`）；`nativeArchiveKey` 先 `validate`、要求 `bScope` 与起点相同（`NATIVE_PICKER_SCOPE_DRIFT`，`:195-197`），再 `vault.inspect` + `nativePicker.resolveNativeArchiveKey`（`:198-202`）。最后调 `readB20CurrentCandidateBundle(expected,{authority,sources:source.bSources})`（`:205-207`），读完 `validate` 并比较 `epochs.create(id,numeric)` 与起点（`MAIN_SCOPE_CHANGED_AFTER_PHYSICAL_READ`，`:208-210`）。
6. `installCMainV3B20ReadAuthorities(authority)`（`:214`）；卸载闭包 `closed=true; epochs.close(); uninstall()`（`:215-217`）。

## 4. 调用者与调用链

入向（冻结树 grep）：生产唯一引用是 `review-v3-main-b20-current-registry.ts:34-37`（import `installCMainV3PhysicalB20Sources`）与 `:268`（`install()` 内调用）；而该注册表无生产调用者（见其手册 §4）。测试：`review-v3-main-b20-physical-composition.test.ts:26-28`，实例化点 `:206,232,240,251,259,281`。

出向：`review-v3-b1-b2-main-read-bundle-v3-b.ts:122`（`readB20CurrentCandidateBundle`）与类型 `:31,36,43,59`；`review-v3-main-native-archive-registry.ts:104`（`CMainNativeArchiveRegistry`）；`review-v3-main-author-plan-ipc.ts:107`（`installCMainV3B20ReadAuthorities`）；`review-v3-main-b20-trusted-candidate-read.ts`（类型）；`review-v3-b1-b2-candidate-source-bridge.ts:30`（`B19SourceSelection`）。

## 5. 数据 I/O、读写与副作用

- 本文件不直接读写磁盘；经 `bSources`（B2 staging/vault/ledger）读取与校验，经 `nativePicker` 做 OS 文件选择。
- 副作用：安装 B20 读取权威（进程内槽）；OS picker 可能打开系统文件对话框（`pickForBVault`/`pickZipPath`）。
- 并发/原子性：全程同步；读 bundle 后用数字 scope 比较防“读期间漂移”（`:208-210`）。
- 幂等：卸载后 `active()` 全拒绝；`epochs.close()` 后 `create` 拒绝。

## 6. 分支、失败、取消与恢复

| 错误（前缀 `C_MAIN_B20_PHYSICAL_`） | 触发 | 行 |
| --- | --- | --- |
| `NUMERIC_EPOCH_CLOSED`/`EPOCH_EXHAUSTED`/`REAL_MAIN_NUMERIC_FRAME_AND_GRANT_REQUIRED` | epoch 生命周期/入参 | 77,82,88,101 |
| `REAL_B1_B2_AND_C_MAIN_AUTHORITY_REQUIRED` | source 形状非法 | 119 |
| `SOURCE_UNINSTALLED` | 卸载后调用 | 121 |
| `OWNER_OR_CANDIDATE_REVOKED`/`FROZEN_PIN_REVOKED` | 身份/grant/pin 漂移 | 131,135 |
| `ARCHIVE_NOT_IN_CURRENT_C_MAIN_SELECTIONS` | 归档不在当前选择 | 145 |
| `MAIN_ISSUED_ORIGINAL_KEY_NOT_AVAILABLE` | 私钥缺失 | 148 |
| `MAIN_SCOPE_CHANGED_DURING_OS_PICKER` | OS 选择期间漂移 | 154 |
| `NUMERIC_SCOPE_ROTATED`/`FOREIGN_OWNER_OR_AUTHOR_SOURCE`/`C_SOURCE_REGISTRY_NOT_INSTALLED`/`NATIVE_PICKER_SCOPE_DRIFT`/`MAIN_SCOPE_CHANGED_AFTER_PHYSICAL_READ` | 读 bundle 过程校验 | 185,190,193,197,210 |

- 失败后状态：不产生持久写；`repick` 失败不改变选择状态（`nativePicker.pickForBVault` 之前失败）。
- 取消/恢复：无取消；卸载闭包一次性；冷启动需重新安装（`epochs` 清零）。

## 7. 权限与权威状态

- 身份/权限来自 `source.assertLiveCMainIdentity`、`currentCandidate`、`canReadCandidate`（`:123-135`）；本文件不接受渲染层输入（回调参数全部由 IPC 层从真实 sender 派生）。
- 私有 ZIP key（`currentMainIssuedOriginalKey`）是 Main 在初次物理导入时铸造的能力，只传给 `nativePicker`，绝不进 IPC 响应（`:49-62`）。
- 返回/流转的数据带 `candidateOnly`/`publicationAllowed:false` 语义（由 B20 bundle 保证）；本文件不产生学校/业务权威。

## 8. 修改影响面

- 改 `CMainB20PhysicalSources` 影响 `review-v3-main-b20-current-registry.ts`（唯一实现）。
- 改 `authority` 的回调语义影响 `review-v3-main-author-plan-ipc.ts:302-362` 的 `handleCMainB20CandidateRead`。
- 改 epoch 语义影响 `review-v3-main-b20-physical-composition.test.ts:346-367`（单调/轮换/关闭断言）。

## 9. 测试证据

直接测试：`review-v3-main-b20-physical-composition.test.ts`（367 行，8 个 `test(`，详见该文件手册）：真实 ZIP CRC + 台账 + repick + 两次读取（`:205-229`）、冷启动无 key（`:230-236`）、同 SHA 换 inode 拒绝（`:237-248`）、epoch 轮换/撤销/作者漂移（`:249-270`）、私钥摘要不符（`:271-278`）、OS 选择器拒绝渲染层路径（`:279-291`）、注册表为唯一 B20 运行源（`:292-344`）、数字 epoch 单调（`:346-367`）。

`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

缺口：`installCMainV3PhysicalB20Sources` 的形状校验各分支、`readB20CurrentCandidateBundle` 内部失败、`EPOCH_EXHAUSTED`、`NUMERIC_SCOPE_ROTATED`/`FOREIGN_OWNER_OR_AUTHOR_SOURCE` 等读中分支无独立用例（部分经 8 例间接触发）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 数字 epoch 与字符串 C epoch 解耦 | 已证实 | `:66-70,85-97`；测试 `:346-367` |
| repick 只对当前选择内归档 | 已证实 | `:143-145`；测试 `:279-291` |
| 读 bundle 全程三次以上身份/scope 复核 | 已证实 | `:177-210` |
| 私钥不进 IPC | 已证实 | `:49-62,147-151` |
| 生产无安装点（经 current-registry） | 已证实（检索） | 见 §4 与 current-registry 手册 |
| `readB20CurrentCandidateBundle` 内部行为 | 未知（超出本文件） | 在 `review-v3-b1-b2-main-read-bundle-v3-b.ts:122` |
| OS 选择器真实对话框行为 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `CMainB20NumericEpoch` | §3.1 | 71-101 | covered |
| 安装形状校验 | §3.2 | 108-121 | covered |
| `validate` | §3.2 | 123-135 | covered |
| `repick` | §3.2 | 137-160 | covered |
| `readCurrentB20Bundle`/`authority` | §3.2 | 161-213 | covered |
| 卸载闭包 | §3.2 | 214-217 | covered |
| 权限/私钥 | §7 | 123-151 | covered |
| 生产接线 | §4 | 检索记录 | covered（范围已声明） |
| bundle 内部 | §10 | — | unknown |
