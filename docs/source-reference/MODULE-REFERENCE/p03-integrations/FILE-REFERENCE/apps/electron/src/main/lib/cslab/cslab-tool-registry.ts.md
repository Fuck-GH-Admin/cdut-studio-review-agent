---
path: apps/electron/src/main/lib/cslab/cslab-tool-registry.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 79baca87608886553b541c6d6d367c8890a9fb44
sha256: e65bddd5347a6f9817d12e2a61cbcf40e718b5d7e6877115fd6b03e4a0fa5aa6
lines: 740
kind: source
package: p03-integrations
author: docs-r07-author-nb-06-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-tool-registry.ts

## 1. 结论与边界

**CSLab 用户自定义 Python 工具注册表**（`cslab-tool-registry.ts:1-9` 注释四能力）：扫描 `runtime/tools/*.py` 优先实验室 Python `ast` 提取签名/docstring；无 Python **降级启发式并如实标 source=heuristic**（`:6`）；清单落盘 `.cslab-tools.json`（原子写+bak `:7`）；runner 脚本 venv 执行，**超时 120s，绝不伪造结果**（`:8`）。

## 2. 导出与关键符号（11 条）

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `annotationToJsonType` | function（export） | `:93-127` | Python 注解→JSON 类型（Optional/`|None` 识别 `:101-111`；str/int/float/bool/list/dict 族 `:114-125`；兜底 any） |
| `ParsedPythonParam` | interface（export） | `:159-165` | name/annotation?/defaultValue?/required/variadic |
| `parsePythonToolSignature` | function（export） | `:168-207` | 参数串解析（`*`/`/` 分界跳过 `:174`、变长标记 `:176-178`、深度感知 `=` 切分 `:181-190`） |
| `parseHeuristicModule` | function（export） | `:222-299` | 启发式解析（私有 `_` 跳过 `:234`、括号配对取参 `:236-250`、返回注解 `:254`、async/变长→unsupportedReason `:289-293`） |
| `scanLabTools` | function（export） | `:391-471` | 全量扫描（§3.1） |
| `readLabToolManifestSync` | function（export） | `:480-495` | 同步读清单（**不触发扫描** `:479`） |
| `getLabToolScan` | function（export） | `:497-507` | 缓存命中（指纹一致）否则重扫 |
| `CsLabToolAuditContext` | interface（export） | `:509-514` | sessionId?/source(agent\|ipc)/permissionMode? |
| `runLabTool` | function（export） | `:516-639` | 执行（§3.2） |
| `startLabToolWatcher`/`stopLabToolWatcher`/`closeAllLabToolWatchers` | function（export） | `:649-740` | 目录监听（§3.3） |

内部：`TOOL_NAME_RE`（`:33`）、`MANIFEST_FILE`/`ToolManifestFile`（`:34-44`）、`parseLastJsonLine`（`:68-80`）、`splitTopLevel`（引号/括号感知 `:129-157`）、`extractDocstring`/`extractModuleDocstring`（首段落 `:209-219`）、`listToolFiles`/`fingerprintFiles`（mtime:size 指纹 `:301-328`）、`scanWithAst`（20s 超时/4MB `:330-350`）、`buildToolFromAst`/`dedupeTools`（重名→未装配 `:380-389`）。

## 3. 内部逻辑与关键流程

### 3.1 扫描（`:391-471`）

无 .py → engine 'none' 空清单；有 Python+scanner → **ast 逐文件，失败/异常降级启发式**并计数（`:417-443`，message 如实）；无 Python/scanner → 全启发式+提示"类型可能不完整"（`:444-456`）；`dedupeTools` 后原子写清单。

### 3.2 执行（`:516-639`）

守卫链：名称正则（`:531`）→ 清单存在（`:535`）→ **unsupportedReason 直拒**（`:536`）→ 未知参数拒/必填缺失拒（**:542/:546**）→ **路径越界防护**（模块必须在 runtime/tools 内，**分隔符收尾防 `runtime/tools-evil` 误判** `:551-555`）→ runner/Python 缺失拒（`:557-560`）。执行：args 写临时 JSON（`:562-567`）→ execFile（**timeout 120s、16MB、cwd=实验室** `:582`）→ `parseLastJsonLine` 取结果（不可解析→失败 `:588-591`）；finally 删临时 args（`:601-603`）。**外层 finally 无论成败都 `appendCsLabToolAudit`**（非法 labId 跳过 `:614-637`）。

### 3.3 监听（`:649-740`）

chokidar（`awaitWriteFinish` 200/80 `:673`）；**`.py` 变更 debounce 300/1500ms 重扫**（`createDebouncer` `:678-691`）；串行 flush（pending 链 `:677-684`）；close/stop 清理。

## 4. 调用者与调用链

- 入向：Pi 工具装配（adapters/pi-cslab-tools，同批测试 `cslab-tools.test.ts` 6 用例间接覆盖）。
- 出向：`../safe-file`、`./cslab-paths`/`./cslab-debounce`/`./cslab-python-runtime`/`./cslab-tool-audit`（同批）、chokidar（动态）、`node:child_process`/`fs`。

## 5. 数据 I/O、读写与副作用

读 `runtime/tools/*.py`、写清单 `.cslab-tools.json`/临时 args JSON、execFile Python（scanner/runner）、console。审计经 tool-audit（同批）。

## 6. 分支、失败、取消与恢复

ast 失败→启发式降级（`:433-438`）；执行异常→结构化失败+审计（`:604-613`）；watcher 错误仅 warn。不适用取消（execFile 超时）。

## 7. 权限与权威状态

红线：**绝不伪造结果**（`:8`，输出不可解析即失败）；路径越界防护（`:551-555`）；unsupported 不执行（`:536`）；执行留审计（`:614-637`）。

## 8. 修改影响面

改扫描/守卫 → 用户 Python 工具可用性与安全面；改 runner 协议 → 执行结果解析；指纹机制牵动缓存命中。

## 9. 测试证据

**直接测试 `cslab-tools.test.ts`（6 用例，NOT_RUN）**：签名解析/类型映射/启发式（含 `_private` 排除、async/变长 unsupported）、执行守卫（未知参数/必填缺失/审计留痕）、Pi 装配排除 unsupported——断言见测试手册。未覆盖：watcher、ast 真实路径。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 导出+守卫链+降级链 | 已证实 | 逐行读 `:1-740` |
| 测试 6 用例断言 | 已证实 | 测试文件；NOT_RUN |
| cslab-tool-scanner/runner.py 行为 | 未知 | 跨文件脚本 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 11 导出 | §2 | `:93-740` | covered |
| 扫描/执行/监听 | §3 | `:391-740` | covered |
| 测试 | §9 | 测试文件 | covered（NOT_RUN） |
