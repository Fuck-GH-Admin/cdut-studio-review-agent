---
path: apps/electron/src/main/lib/wsl-detector.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7fd1db25708683aa6f21ff896ceed7bd8ffbe048
sha256: 058549f3968bcc2ccd741dd79bf56777741c67eb47b27db3c7e4650bd260c68c
lines: 187
kind: source
package: p01-app-shell
author: docs-r07-author-extra-06-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/wsl-detector.ts

## 1. 结论与边界

WSL 环境检测（187 行，头注释 `:1-11`）：`wsl.exe --list --verbose` 列发行版/识别默认/取版本。**全部异常统一归一"WSL 未就绪"**（`:183`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `detectWsl` | 异步函数（导出） | 142-187 | `() => Promise<WslStatus>` | 唯一入口 |

内部：`WSL_NOT_READY_ERROR='WSL 未就绪，如已安装 Git Bash 可不安装'`（`:18`）、`smartDecode`（`:24-56`）、`parseWslListOutput`（`:71-121`）、`createWslNotReadyResult`（`:124-132`）。导出合计 1。`WslStatus` 形状：`{available, version, defaultDistro, distros, error}`。

## 3. 内部逻辑与关键流程

1. **detectWsl**（`:142-187`）：非 win32 → `{available:false, error:'非 Windows 平台'}`（`:144-152`）；`execSync('wsl.exe --list --verbose', {timeout:10000})` 收原始 Buffer（不指定 encoding，`:157-160`）→ smartDecode → parseWslListOutput；无发行版 → not-ready（`:166-169`）；catch → 统一 not-ready（`:182-186`）。
2. **smartDecode**（`:24-56`）：UTF-16 LE 检测（BOM `FF FE` 或 `buffer[1]/buffer[3]` 为 00 的特征，`:26-28`）→ `iconv.decode('utf-16le')`；否则 UTF-8（含替换符 `U+FFFD` 则继续）→ GBK → 兜底 UTF-16LE（`:41-55`）。
3. **parseWslListOutput**（`:71-121`）：按行 trim 去空；**标题行过滤=`includes('NAME'/'STATE'/'VERSION')`**（`:79-84`，照实：发行版名恰含这些子串会被误滤）；`*` 前缀=默认发行版（`:92`）；每行 `split(/\s+/)` ≥3 段（`:96-97`）；version 取末字段（`:100`）；**仅默认发行版的 `1|2` 记入 primaryVersion**（`:110-112`）。

## 4. 调用者与调用链

入向（全冻结树检索 `wsl-detector`）：`lib/runtime-init.ts:18`（`detectWsl`）。出向：`node:child_process`、`iconv-lite`、`@profer/shared` 类型。

## 5. 数据 I/O、读写与副作用

- 读：`wsl.exe` 子进程输出（只读）。
- 副作用：console.warn/log 两条。

## 6. 分支、失败、取消与恢复

- 非 Windows 分支（`:144`）；无发行版分支（`:166`）；**所有异常→统一 not-ready 文案**（`:182-186`，含超时/编码/命令不存在）。
- 无部分失败恢复面（降级即终态）。

## 7. 权限与权威状态

无权限分支（不适用）。权威=系统 WSL 安装状态（wsl.exe 输出）。

## 8. 修改影响面

runtime-init 的 WSL 检测/安装引导（环境检测 UI 文案 `WSL_NOT_READY_ERROR` 用户可见，含"Git Bash 可不安装"提示）；解析规则（§3.3）对发行版命名有脆弱面。

## 9. 测试证据

直接测试：**无**（全冻结树检索 `wsl-detector` 无测试命中；检索范围=baseline/source 全树）。

`NOT_RUN`：本轮未运行任何测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 单导出/解码链/解析规则/异常归一 | 已证实 | `:1-187` 全文逐行 |
| 调用方=runtime-init.ts:18 | 已证实 | 全树检索（§4） |
| 标题行 includes 过滤局限（同名子串误滤） | 已证实（代码事实） | `:79-84` |
| wsl.exe 真实输出形态 | 边界（系统工具） | `:61-66` 示例 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `smartDecode` | §3.2 | 24-56 | covered |
| `parseWslListOutput`（含过滤局限） | §3.3/§10 | 71-121 | covered |
| `detectWsl`/not-ready 归一 | §3.1/§6 | 124-187 | covered |
