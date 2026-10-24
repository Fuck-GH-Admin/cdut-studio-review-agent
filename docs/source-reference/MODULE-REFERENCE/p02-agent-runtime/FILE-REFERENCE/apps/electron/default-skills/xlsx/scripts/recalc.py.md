---
path: apps/electron/default-skills/xlsx/scripts/recalc.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: f472e9a5d04583dc14869f36aa4252a533639ad6
sha256: cf419d15e02965aeaec17773c05b61303f7f520f67fa2696547e7da07502eac7
lines: 184
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-03-20261023
reviewer: docs-r07-qa-nb-03-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/xlsx/scripts/recalc.py

## 1. 结论与边界

Excel 公式重算脚本（docstring `:1-4`）：用 LibreOffice（soffice + StarBasic 宏 `RecalculateAndSave`）全量重算并保存，再用 openpyxl 扫描 Excel 错误值与公式数，输出 JSON 报告。Skill 工具脚本（xlsx 技能核心工具）。

不做的事：不改公式语义（只触发重算）；不校验计算结果正确性（只报错误值）；无网络。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `MACRO_DIR_MACOS`/`MACRO_DIR_LINUX`/`MACRO_FILENAME` | consts | `:17-19` | LibreOffice 用户宏目录（macOS/Linux）与 `Module1.xba` |
| `RECALCULATE_MACRO` | const | `:21-29` | StarBasic 宏源（calculateAll→store→close） |
| `has_gtimeout` | function | `:32-39` | gtimeout 可用性探测 |
| `setup_libreoffice_macro` | function | `:42-67` | 幂等安装宏（已有含 `RecalculateAndSave` 即 True；否则初始化 soffice 后写宏） |
| `recalc` | function | `:70-161` | `(filename, timeout=30) => dict`（结果/错误 JSON 结构） |
| `main` | function | `:164-180` | CLI（`<excel_file> [timeout_seconds]`，打印 JSON） |

## 3. 内部逻辑与关键流程

### 3.1 宏安装（`:42-67`）

宏文件已含 `RecalculateAndSave` → 直接 True；宏目录不存在 → 先 `soffice --headless --terminate_after_init`（10s，带 get_soffice_env）初始化配置再 `makedirs`；写 `RECALCULATE_MACRO`，失败 False。

### 3.2 `recalc`（`:70-161`）

1. 文件存在检查；`setup_libreoffice_macro()` 失败 → `{"error": …}`。
2. 命令：`soffice --headless --norestore <宏 URL> <abs_path>`；**Linux 用 `timeout N` 前缀、macOS 用 `gtimeout`（若装）**（`:87-90`）。
3. 运行（capture_output）；非 0 且非 **124（timeout 也放行）** 时判错——stderr 含 "Module1" 或不含 "RecalculateAndSave" → “macro not configured properly”，否则透传 stderr（`:94-98`）。
4. openpyxl `data_only=True` 重读：逐格扫 7 类 Excel 错误值（`#VALUE!/#DIV/0!/#REF!/#NAME?/#NULL!/#NUM!/#N/A`），按类型计数、位置截前 20（`:100-140`）。
5. `data_only=False` 二读数公式（`=` 开头单元格，`:142-156`）。
6. 返回 `{status:'success'|'errors_found', total_errors, error_summary, total_formulas}`；异常 → `{"error": str(e)}`。

## 4. 调用者与调用链

检索范围：冻结树 `apps/electron/default-skills/xlsx/**`：skill 工作流命令行 `python recalc.py <file> [timeout]`（JSON 输出供 agent 读取）；出向 `office.soffice.get_soffice_env`（`:13`）、`openpyxl.load_workbook`、外部 `soffice`/`timeout`/`gtimeout`。

## 5. 数据 I/O、读写与副作用

- **写**：LibreOffice 用户配置目录的 `Module1.xba`（安装宏——修改用户 soffice 配置，照实记录）；被测 xlsx 经宏 `store()` 落盘（重算结果写回）。
- 读：xlsx 两遍（值/公式）。
- 子进程：soffice（沙箱环境经 LD_PRELOAD shim）、timeout/gtimeout。

## 6. 分支、失败、取消与恢复

| 分支/失败 | 行 | 行为 |
| --- | --- | --- |
| 文件不存在/宏安装失败 | `:71-77` | `{"error": …}` |
| soffice 失败（非 124） | `:94-98` | 分类错误（宏未配置 vs stderr 透传） |
| 超时 124 | `:94` | **放行继续读结果**（宏可能未完成 store——照实记录） |
| 读簿异常 | `:160-161` | `{"error": str(e)}` |
| 取消 | 无 | timeout 是唯一时限手段 |

## 7. 权限与权威状态

无权限分支；“success”仅表示扫描未见错误值（`total_errors==0`），不背书公式正确性；错误位置截断 20 条是报告口径。

## 8. 修改影响面

改宏/扫描 → 影响 xlsx 技能的重算校验口径；依赖用户 LibreOffice 配置目录可写。

## 9. 测试证据

本轮 `NOT_RUN`。无直接测试文件（skill 脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 宏幂等安装+重算链 | 已证实 | `:42-67/:79-92` |
| timeout 124 放行 | 已证实 | `:94` |
| 7 类错误值扫描+公式计数 | 已证实 | `:103-156` |
| 写用户 soffice 配置 | 已证实 | `:54-64` |
| 运行行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 宏常量/`setup_libreoffice_macro` | 3.1 | `:17-67` | covered |
| `recalc` | 3.2 | `:70-161` | covered |
| `has_gtimeout`/`main` | 2/3 | `:32-39/:164-180` | covered |
