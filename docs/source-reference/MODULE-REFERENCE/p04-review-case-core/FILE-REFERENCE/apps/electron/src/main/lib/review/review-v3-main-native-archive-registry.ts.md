---
path: apps/electron/src/main/lib/review/review-v3-main-native-archive-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 993de558511767b8b67251de80434f944a51b364
sha256: de33ea62391c3324ba71e0fd44f8b4251d2726ae2a06aedeeb6690ef935b3779
lines: 186
kind: source
package: p04-review-case-core
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/review-v3-main-native-archive-registry.ts

## 1. 结论与边界

C-MAIN-PICKER-R01：B20 候选读取用的**原生物理 ZIP 重选**注册表。Main 范围、进程内的物理文件能力；不是第二个 B2 ZIP ArchiveVault/InputLedger，也不是候选 SourceIdentity（文件头 `apps/electron/src/main/lib/review/review-v3-main-native-archive-registry.ts:1-11`）。

边界：

- 归档 ID 与内容语义归独立授权的 B2 ArchiveVault；本注册表只证明“OS 用户确实选中了仍存在的同一普通文件”，并绑定到已认证 Main 范围（`:6-8`）。
- 不接受/不返回 Renderer 提供的 path/key/actor；冷进程零可复用选择授权（`:9-10`）。

## 2. 导出与关键符号

`export` 逐条核对：3 个接口 + 1 个类 + 1 个函数 = 5 个导出（常量 0）。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `CMainPhysicalArchiveScope` | 接口（导出） | 18-27 | 8 字段身份（principalId…caseCandidateId，`ownerGeneration:number`） | |
| `CMainNativeArchiveExpectation` | 接口（导出） | 28-34 | `{archiveId,archiveSha256,archiveByteLength}` | B Vault 核验值，非 Renderer 字符串 |
| `CMainNativeArchiveAuthorities` | 接口（导出） | 35-41 | `currentScope/assertCurrentArchive/pickZipPath` | 特权 Main 注入 |
| `CMainNativeArchiveRegistry` | 类（导出） | 104-173 | `pickForBVault/pick/resolveNativeArchiveKey/revoke/close` | 带范围的原生见证 |
| `createCMainElectronNativeArchiveChooser` | 函数（导出） | 175-186 | `()=>string\|undefined` | 真实 Electron 对话框 |
| `PhysicalRecord` | 内部 | 42-49 | `{scope,expected,path,dev,ino,nativeKey}` | |
| `MAX_BYTES`/`MAX_RECORDS`/`sha`/`safe`/`refuse`/`same`/`idOf` | 内部 | 50-58 | 100MB/128 条；抛 `C_MAIN_NATIVE_ARCHIVE_*`；`idOf=JSON([caseCandidateId,ownerId,ownerGeneration,archiveId])` | |
| `validateScope`/`validateArchive` | 内部 | 59-71 | 形状校验 | `AUTHENTICATED_MAIN_SCOPE_REQUIRED`/`VAULT_EXACT_ORIGINAL_REQUIRED` |
| `physicalRead` | 内部 | 72-101 | 抗替换读文件 | 见 §3.1 |

## 3. 内部逻辑与关键流程

### 3.1 抗替换读（`physicalRead`，`:72-101`）

路径非空无 `\0`（`OS_PATH_INVALID`）→ `lstat` 必须是普通文件、非符号链接、`nlink===1`、size 1–100MB（`REGULAR_UNLINKED_ZIP_REQUIRED`）→ `O_RDONLY|O_NOFOLLOW` 打开 → `fstat` 与打开前 dev/ino/size 一致（`ORIGINAL_REPLACED`）→ 读字节 → `fstat`/`lstat` 再验 dev/ino/size/nlink/非符号链接（`ORIGINAL_CHANGED_DURING_READ`）→ `realpathSync` 返回规范路径 + sha256（`:79-96`）。非本模块错误统一 `OS_ORIGINAL_UNAVAILABLE`（`:97-99`）；`finally` 关 fd（`:100`）。

### 3.2 选择（`pickForBVault`/`pick`/`pickPhysical`，`:118-152`）

- `pickForBVault(expected,key,checkpointKeyDigest)`：key 安全、digest 64hex、`sha256(key)===checkpointKeyDigest`，否则 `B_VAULT_PHYSICAL_ORIGIN_KEY_INVALID`；随后用该 key 做物理选择（`:118-125`）。注释：绝不从文件名/archiveId/IPC 派生 key；旧 `pick()` 只是新临时 key，不能主张 B 的字节（`:112-117`）。
- `pick(expected)`：`randomUUID()` 新 key（`:127-129`）。
- `pickPhysical`（`:131-152`）：关闭 → `REGISTRY_CLOSED`；`validateArchive`+`validateScope`；`assertCurrentArchive`；`pickZipPath()` 空 → `USER_DID_NOT_SELECT_ORIGINAL`；`physicalRead` 后 SHA/size 必须等于期望（`PICKED_DIFFERENT_PHYSICAL_ORIGINAL`）；scope 未变（`MAIN_OWNER_OR_FRAME_CHANGED_AFTER_PICK`）再 `assertCurrentArchive`；容量 ≥128 → `PICKER_CAPACITY_CLOSED`；同 index 已注册 → `ARCHIVE_ALREADY_REGISTERED`（“同 archiveId 不能靠再点一次换指，须先 revoke”，`:147-149`）；登记 `{scope,expected,path,dev,ino,nativeKey}`。

### 3.3 解析 key（`resolveNativeArchiveKey`，`:154-170`）

关闭/校验后取登记项（`CURRENT_NATIVE_REPICK_REQUIRED`，`:159-161`）→ 重读物理文件 dev/ino/realpath/SHA/size 全等（`PHYSICAL_ORIGINAL_REPLACED`，`:162-165`）→ scope 未变（`MAIN_OWNER_OR_FRAME_CHANGED_AFTER_READ`）→ `assertCurrentArchive` → 返回 `nativeKey`（`:166-169`）。

### 3.4 生命周期与 OS 选择器

`revoke()` 清空 entries；`close()` 置 closed + revoke（`:171-172`）。`createCMainElectronNativeArchiveChooser`：主窗口必须存活，`dialog.showOpenDialogSync` 只选单个 `.zip` 文件（`:175-185`）。

## 4. 调用者与调用链

入向（冻结树 grep）：

- `CMainNativeArchiveRegistry`：`review-v3-main-b20-physical-composition.ts:22,53,116`（`nativePicker instanceof` 校验）与 `review-v3-main-b20-current-registry.ts:31,88,108`（构造）。注：该链（current-registry）无生产调用者（nb-10 手册已证）。
- `createCMainElectronNativeArchiveChooser`：`review-v3-main-b20-current-registry.ts:31,127`（`host.nativePickZipPath` 缺省）。
- 测试：自身 `review-v3-main-native-archive-registry.test.ts`（5 例）；`review-v3-main-b20-physical-composition.test.ts:22-25`（nb-10 批，真实 repick 流程）。

出向：`node:crypto`（randomUUID/createHash）、`node:fs`（open/fstat/lstat/read/realpath）、`electron`（`dialog`）、`../main-window-state.ts:5`（`getMainWindow`）。

## 5. 数据 I/O、读写与副作用

- 读：用户选中的 ZIP 文件字节（每次 resolve 都重读重哈希）；无任何写。
- 副作用：`pickZipPath` 是 OS 文件对话框（`:179-183`）；进程内 `entries` Map（≤128）。
- 并发/原子性：同步方法 + 抗替换读（前后三重 stat）；无锁（进程内单线程假设）。
- 幂等：同 `idOf` 重复注册拒绝；`close` 幂等；冷进程无状态可复用（`:10`）。

## 6. 分支、失败、取消与恢复

| 拒绝（`C_MAIN_NATIVE_ARCHIVE_*`） | 触发 | 行 |
| --- | --- | --- |
| `AUTHENTICATED_MAIN_SCOPE_REQUIRED` | scope 缺失/非法 | 63 |
| `VAULT_EXACT_ORIGINAL_REQUIRED` | 期望形状 | 69 |
| `OS_PATH_INVALID`/`REGULAR_UNLINKED_ZIP_REQUIRED`/`ORIGINAL_REPLACED`/`ORIGINAL_CHANGED_DURING_READ`/`OS_ORIGINAL_UNAVAILABLE` | 物理读 | 74,81,85,93,99 |
| `INDEPENDENT_MAIN_AND_B_VAULT_REQUIRED` | 构造缺方法 | 110 |
| `B_VAULT_PHYSICAL_ORIGIN_KEY_INVALID` | key/digest 不符 | 123 |
| `REGISTRY_CLOSED` | 关闭后 | 133,155 |
| `USER_DID_NOT_SELECT_ORIGINAL` | 用户取消 | 138 |
| `PICKED_DIFFERENT_PHYSICAL_ORIGINAL` | 选中文件不符 | 141 |
| `MAIN_OWNER_OR_FRAME_CHANGED_AFTER_PICK`/`MAIN_OWNER_OR_FRAME_CHANGED_AFTER_READ` | 选择/读期间漂移 | 143,167 |
| `PICKER_CAPACITY_CLOSED` | >128 条 | 145 |
| `ARCHIVE_ALREADY_REGISTERED` | 重复注册 | 149 |
| `CURRENT_NATIVE_REPICK_REQUIRED` | 无登记/不当前 | 161 |
| `PHYSICAL_ORIGINAL_REPLACED` | inode/内容替换 | 165 |

- 失败后状态：登记失败无状态变化；`revoke` 后必须重新 OS 选择（测试 `:55-59`）。
- 取消/恢复：对话框取消即拒绝；冷进程重启必须全新选择（`:10`；测试用例 5）。

## 7. 权限与权威状态

- 权威来源：`currentScope`（已认证 Main 范围）+ `assertCurrentArchive`（C 权限 + B Vault 只读有效性，每次查询重验，`:37-38`）+ OS 选择器（“唯一物理路径权威”，`:130`）。
- `nativeKey` 是 Main-only 内部 key；B ZIP Vault 在自己的台账里验 digest（`:153`）；绝不派生自文件名/archiveId/IPC（`:113-115`）。
- 同 archiveId 不能重新指向（防早前私钥被新点击劫持，`:147-149`）。

## 8. 修改影响面

- 改 `CMainNativeArchiveExpectation`/`CMainPhysicalArchiveScope` 影响 `review-v3-main-b20-physical-composition.ts`（`pickForBVault` 调用点 `:149-151`）与 `review-v3-main-b20-current-registry.ts:107-119`。
- 改 `physicalRead` 影响两组测试的替换/链接拒绝断言。
- 改容量/重复语义影响长进程与 repick 流程。

## 9. 测试证据

直接测试：`review-v3-main-native-archive-registry.test.ts`（115 行，5 例，详见其手册）：每次特权读重哈希 + 同 grant 内 key 稳定 + revoke 后必须重选、错字节/同名替换/同 SHA 换 inode 拒绝、符号链接/硬链接拒绝、撤权/轮换/丢主窗口拒绝、冷注册表不可复用。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型。

间接：`review-v3-main-b20-physical-composition.test.ts`（nb-10 批 repick 流程）。

缺口：`pickForBVault` 的 digest 正确路径（nb-10 批有覆盖）、`MAX_BYTES` 边界、对话框多选/非 zip、`OS_PATH_INVALID`（含 `\0`）无独立用例。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 抗替换读三重 stat | 已证实 | `:72-101` |
| key 不可派生、同 archiveId 不可重指向 | 已证实 | `:112-125,147-149` |
| 冷进程零复用 | 已证实 | `:10,171-172`；测试 `:100-114` |
| 每次 resolve 重读重哈希 | 已证实 | `:162-165`；测试 `:48-62` |
| 生产链止于 current-registry（无调用者） | 已证实（检索：冻结树 `apps`+`packages` 非测试 `*.ts`） | 见 §4 |
| 真实 Electron 对话框行为 | 未知 | 测试注入 `pickZipPath` |
| O_NOFOLLOW 平台差异 | 推断 | `constants.O_NOFOLLOW??0`（`:82`） |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `physicalRead` | §3.1 | 72-101 | covered |
| `pickForBVault`/`pick`/`pickPhysical` | §3.2 | 118-152 | covered |
| `resolveNativeArchiveKey` | §3.3 | 154-170 | covered |
| `revoke`/`close`/选择器 | §3.4 | 171-186 | covered |
| 权威/私钥语义 | §7 | 35-41,112-125,153 | covered |
| 生产接线 | §4 | 检索记录 | covered（范围已声明） |
| 对话框/容量边界 | §9,§10 | — | unknown |
