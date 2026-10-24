---
path: apps/electron/src/main/lib/cslab/cslab-share-watcher.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7754d82e16b903aa77a487a7f2f1546a588044c8
sha256: 8e2a1044b4d42b9d99973b0fa5ffe02b6c9e3346bf681470916a172d283a2700
lines: 1159
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-share-watcher.ts

## 1. 结论与边界

**CSLab 局域网仪器共享盘监听器**（`cslab-share-watcher.ts:1-14` 注释）三件事：①发现（chokidar 事件仅「尽快扫描」提示，真正依据=增量枚举+时间戳水位 `:5`）；②完成判定（quietSeconds 静默期内指纹不变才捕获 `:6`）；③捕获（Windows 独占读租约或 Node 稳定性校验，单通道流式写暂存+渐进 SHA-256+fsync+原子重命名，交 `ingestFiles` 入库 `:7-8`）。**三条红线**：只有捕获并复验成功才 `published`（绝不半截入库）；**租约等级必须如实记录**（protected-lease/inline-command-lease/node-stream-stability）；异常收敛为候选级 retry/quarantined，**不抛未捕获异常中断主进程**（`:10-13`）。

## 2. 导出与关键符号（16 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `CsLabShareWatcherSink` | interface（export） | `:67-70` | onStatus/onCaptured |
| `__setShareTuningForTest` | function（export） | `:93-97` | 测试调参（仍受生产 clamp `:90`） |
| `NormalizedSharePath` | interface（export） | `:114-119` | kind/normalized/host?/share? |
| `normalizeSharePath` | function（export） | `:165-211` | UNC/smb/长 UNC/WebDAV/本地归一+安全断言 |
| `assertInlinePowerShellSafe` | function（export） | `:483-487` | 拒控制字符（`:484`） |
| `listShareSources`/`addShareSource`/`updateShareSource`/`removeShareSource` | function（export） | `:235-329` | 源管理（§3.1） |
| `scanShareSource`/`scanAllShareSources`/`testShareSource` | function（export） | `:765-1008` | 扫描（§3.3） |
| `listShareCandidates` | function（export） | `:845-854` | 候选列表 |
| `startShareWatcher`/`stopShareWatcher`/`stopAllShareWatchers`/`isShareWatching` | function（export） | `:1012-1139` | 监听生命周期（§3.4） |
| `__upsertCandidateForTest`/`__getCandidateStateForTest`/`__sanitizeShareFileName` | function（export） | `:1142-1159` | 测试辅助 |

内部要点：常量（quiet 45s/poll 30s、钳制区间、**MAX_SCAN_ENTRIES 5000**、租约超时 5min、retry 2s→120s 指数 `:54-63`）、`TEMP_FILE_RE`（临时文件过滤 `:65`）、`BLOCKED_METADATA_HOSTS`/`BLOCKED_SINGLE_LABEL_HOSTS`（`:121-125`，注释：单标签 NetBIOS 是凭据中继经典入口但校园共享盘就是 lab-pc 这类单标签，故只拦协议保留名 wpad/isatap `:123-124`）、`assertSafeShareHost`（**:132-162：云元数据 169.254/100.100.100.200/fd00:ec2::254、IPv6 字面量别名、回环、WPAD/ISATAP 拦截；10/172.16/192.168 局域网 NAS 可用；静态判断不做 DNS `:129-130`）、`runPowerShell`/`parseLeaseStdout`/`POLICY_FAILURE_RE`（`:436-480`）、`leaseCopyWindows`（阶梯1 PS 脚本 protected-lease → 阶梯2 内联 .NET inline-command-lease `:510`，`psQuote` 单引号转义+控制字符前置拒 `:489-492`）、`copyWithStabilityCheck`（Node 稳定性 `node-stream-stability`）、WebDAV PROPFIND 枚举+basicAuth（secretCipher 解密 `:675`）、`listLocalEntries`、`captureCandidate`（`:652-757`）、`retryDelay`。

## 3. 内部逻辑与关键流程

### 3.1 源管理（`:213-329`）

`addShareSource`：normalizeSharePath（含安全断言）；include ≤16 项；quiet/poll 钳制（1-3600s/1-300s `:56-59`）；密码 **encryptToken 密文入库**（`:269-272`）；`updateShareSource` 可改 include/quiet/poll/用户名/密码（空密码=保留原密文 `:283-288`）；`removeShareSource` 删源+候选+关闭 watcher（`:315-329`）。

### 3.2 安全边界（`:112-211`）

`normalizeSharePath`：WebDAV（URL 解析+`assertSafeShareHost`+去尾斜杠 `:169-184`）；smb:// 与 `//` 转 UNC、长 UNC 归一（`:186-192`）；UNC 需 `\\服务器\共享名`（`:196`）+主机安全断言；本地 `resolve`。

### 3.3 扫描/捕获（`:333-854`）

`scanShareSource`（`:765-842`）：枚举（WebDAV PROPFIND / 本地 readdir，`MAX_SCAN_ENTRIES` 截断）→ 逐条指纹（size:mtime）；published+同指纹跳过（`:800-803`）；capturing 残留→重置 debouncing（**:804-813 崩溃恢复**）；静默期（同指纹累计 ≥quietSeconds）才进入捕获；全量候选状态写回。枚举失败→源 offline+emitStatus（`:785-789`）。
`captureCandidate`（`:652-757`）：**阶梯 1-3 租约链**——WebDAV 下载 / Windows `leaseCopyWindows`（PS 脚本→内联 .NET）/ 失败退 `copyWithStabilityCheck`（`:677-686`）；失败→retry+退避（`:688-700`）；**SHA 幂等**：同源同 sha 已发布→复用 assetUri 丢暂存（`:703-718`）；fsync+原子 rename→`ingestFiles` 铁笼入库（**:724-728，铁笼拒绝=异常入 retry**）；成功→published+**证据如实标注**（protected-lease→'protected-lease'，否则 'quiet-interval' `:734`）；finally 清理 finalPath（`:755`）。

### 3.4 监听生命周期（`:1012-1139`）

`startShareWatcher`：每源 poll 轮询（unref 定时器 `:1062-1063`）+非 WebDAV 可选 chokidar（**事件只作提示，1.5s 防抖 tick** `:1079-1087`；chokidar 不可用降级纯轮询 `:1091-1093`）；启动前**崩溃恢复**：残留 capturing→debouncing（`:1038-1048`）；tick 重入保护（`:1051`）。stop/stopAll 清定时器与 chokidar（`:1104-1133`）。

## 4. 调用者与调用链

- 入向：CSLab 共享盘 IPC/前端（跨文件）；测试 `cslab-share-watcher.test.ts`（同批 14 用例）。
- 出向：`./cslab-share-db`（持久化，同批）、`./cslab-iron-cage`（ingestFiles 铁笼）、`./cslab-paths`/`./cslab-python-runtime`（resolveCsLabScript 找 PS 脚本）、`../token-crypto`、chokidar（动态 import）、`node:child_process`/`node:fs`/`stream`。

## 5. 数据 I/O、读写与副作用

读共享盘（本地/WebDAV）；写实验室 vault 暂存/最终文件（原子重命名）；数据库候选/源状态；spawn powershell.exe；console。密码仅密文（`encryptToken/decryptToken`）。

## 6. 分支、失败、取消与恢复

三级租约降级（§3.3）；失败→retry/退避/最终 quarantined（扫描侧）；崩溃恢复（capturing→debouncing `:1038`）；**红线：不抛未捕获异常**（`:13`，各 catch 收敛）。

## 7. 权限与权威状态

安全边界权威（§3.2）；租约等级如实（红线② `:12`）；半截文件绝不入库（红线① `:11`）。

## 8. 修改影响面

改租约/静默/幂等 → 共享盘数据入库正确性；改安全断言 → SSRF/凭据中继面；改生命周期 → 长连接可靠性。

## 9. 测试证据

**直接测试 `cslab-share-watcher.test.ts`（14 用例，NOT_RUN）**：路径规范化 5 形态、安全拦截清单（云元数据/回环/WPAD/ISATAP/IPv6 别名）、PowerShell 控制字符、静默期+证据标注（node-stream-stability/quiet-interval）、SHA 幂等、启停、租约降级不中断——断言见测试手册。未覆盖：真实 SMB/WebDAV 网络。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 16 导出+三事+三红线+三级租约 | 已证实 | 逐行读 `:1-1159` |
| 测试 14 用例断言 | 已证实 | 测试文件；NOT_RUN |
| 真实 Windows 租约/网络行为 | 未知 | 平台/网络 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 16 导出 | §2 | `:67-1159` | covered |
| 源管理/安全/扫描捕获/生命周期 | §3 | `:213-1139` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
