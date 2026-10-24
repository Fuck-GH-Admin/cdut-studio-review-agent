---
path: apps/electron/default-skills/docx/scripts/accept_changes.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 8e363161915d3720409bb8b6ef9bc4ade33b64e4
sha256: 0c991d2bc7304a1248e9f3bf9b1498f0b6e76641fc457e7cbd73c99b4eef3a74
lines: 135
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/accept_changes.py

## 1. 结论与边界

DOCX **接受全部修订**工具（`apps/electron/default-skills/docx/scripts/accept_changes.py:1-4`）：经 LibreOffice（soffice）headless + StarBasic 宏 `AcceptAllTrackedChanges` 接受修订并另存。CLI 入口（`:121-135`）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 签名 | 说明 |
| --- | --- | --- | --- | --- |
| `accept_changes` | 函数 | `:36-88` | `(input_file, output_file) => tuple[None, str]` | 主流程（返回 `(None, 消息)`） |
| `_setup_libreoffice_macro` | 私有函数 | `:91-118` | `() => bool` | 写宏文件到 LO profile |

内部常量：`LIBREOFFICE_PROFILE=/tmp/libreoffice_docx_profile`（`:16`）、`MACRO_DIR`（`:17`）、`ACCEPT_CHANGES_MACRO`（`:19-33`，StarBasic 源码）。

## 3. 内部逻辑与关键流程

1. 入参校验：文件存在（`:43-44`）、扩展名 `.docx`（`:46-47`），否则返回错误消息。
2. 复制输入到输出（`shutil.copy2`，`:50-51`）；失败返回错误（`:52-53`）。
3. `_setup_libreoffice_macro`（`:91-118`）：宏已存在且含 `AcceptAllTrackedChanges` 则跳过（`:95-96`）；否则必要时先 `soffice --terminate_after_init` 初始化 profile（`:98-111`），写 `Module1.xba`（`:114`）；失败记 warning 返回 False。
4. 执行 `soffice --headless … vnd.sun.star.script:Standard.Module1.AcceptAllTrackedChanges … <output>`（`:58-65`），`timeout=30`、`env=get_soffice_env()`（`:67-75`）。
5. 返回码非 0 → 错误消息含 stderr（`:82-83`）；成功 → 「Successfully accepted…」（`:85-88`）。
6. CLI：打印消息，含 `"Error"` 则 `SystemExit(1)`（`:131-135`）。

## 4. 调用者与调用链

- CLI（`__main__`）或 skill 编排直接 import `accept_changes`。
- 出向：`office.soffice.get_soffice_env`（本批同组）、系统 `soffice` 可执行文件。

## 5. 数据 I/O、读写与副作用

- **文件**：复制输入→输出（`:51`）；写 LO 宏 `Module1.xba`（`:114`）。
- **进程**：`subprocess.run` 调 `soffice`（`:68-75`、`:99-110`）。
- **固定路径**：`/tmp/libreoffice_docx_profile`（全局共享 profile，`:16`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| 输入不存在/非 docx | `:43-47` | 返回错误消息 |
| 复制失败 | `:52-53` | 返回错误 |
| 宏设置失败 | `:55-56` | 返回错误 |
| **`soffice` 30s 超时** | `:76-80` | **返回「Successfully accepted…」成功消息**（超时被当成功——见第 10 节） |
| soffice 非 0 退出 | `:82-83` | 返回错误含 stderr |
| 宏写失败 | `:116-118` | warning + False |

**恢复**：无回滚——输出文件即使宏未执行也已复制（`:51` 先于 soffice）。

## 7. 权限与权威状态

无身份校验；以进程权限读写文件。`/tmp` 共享 profile 属环境级约定。

## 8. 修改影响面

- `ACCEPT_CHANGES_MACRO` 内容与 LO 版本耦合（`.uno:AcceptAllTrackedChanges` 派发）。
- 固定 profile 路径并发执行会互相干扰（未加锁）。
- 返回消息含 `"Error"` 字符串即视为失败（`:134`）——文案改动影响 CLI 退出码判定。

## 9. 测试证据

无专属测试（全树检索 `accept_changes` 测试命中 0）。**NOT_RUN**：未运行 Python 测试/soffice/GUI。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 主流程与宏机制 | 已证实 | `:36-118` |
| **超时返回成功消息**（`TimeoutExpired`→「Successfully accepted」） | 已证实（实现如此） | `:76-80` |
| 输出文件先复制后执行、失败无回滚 | 已证实 | `:51` 与 `:67-83` 顺序 |
| 超时当成功是否为有意设计（宏可能已执行） | 未知 | 无注释说明；不臆测 |
| LibreOffice 实际行为 | 未知 | 未运行 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `accept_changes` | 3 | `:36-88` | covered |
| `_setup_libreoffice_macro` | 3 | `:91-118` | covered |
| 超时/失败分支 | 6 | `:76-83` | covered |
| CLI | 3 | `:121-135` | covered |
| 测试证据 | 9 | — | covered（无测试） |
