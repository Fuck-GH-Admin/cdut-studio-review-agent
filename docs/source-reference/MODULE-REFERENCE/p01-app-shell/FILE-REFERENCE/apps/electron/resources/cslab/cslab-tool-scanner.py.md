---
path: apps/electron/resources/cslab/cslab-tool-scanner.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 9a27a938489e13406b385767ef51891c39385667
sha256: 1cdaece16e5ed8570e6145c8f763cfe36d24812f9006d1d4790e20c476148aac
lines: 97
kind: script
package: p01-app-shell
author: docs-r07-author-nb-05-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/resources/cslab/cslab-tool-scanner.py

## 1. 结论与边界

**CSLab 用户工具 AST 静态扫描器**（97 行，`:1-5`）：解析用户 Python 文件提取函数签名/文档；输出单行 JSON。语法错误原样回报宿主（`:92` 注释）。

## 2. 导出与关键符号

无导出（CLI）；`--file`。内部：`annotation_to_text`（`:21`，ast.unparse 容错）、`collect_function`（`:30`）。

## 3. 内部逻辑与关键流程

`collect_function`（`:30-70`）：位置参数+默认值对齐（`self/cls` 跳过 `:36-37`）+kwonly 参数→params 列表（name/annotation/required/default）；**不支持项显式标注**（async/变长参数→`unsupportedReason` `:67-69`）。`main`（`:73-93`）：ast.parse→顶层非下划线函数收集（`:82-84`）→`{ok, moduleDoc, functions}`；异常→`{ok:false,error}`。

## 4. 调用者与调用链

- 入向：CSLab 工具注册扫描链（域外）。
- 出向：ast/json（stdlib）。

## 5. 数据 I/O、读写与副作用

读用户源文件；stdout 单行 JSON；无写。

## 6. 分支、失败、取消与恢复

语法/IO 异常→ok:false；下划线函数跳过。

## 7. 权限与权威状态

静态分析边界=AST（不执行用户代码）；unsupported 显式声明防误用。

## 8. 修改影响面

CSLab 工具清单/表单生成的签名来源；unsupportedReason 语义影响宿主工具注册。

## 9. 测试证据

`NOT_RUN`。无直接测试（未运行脚本）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 参数提取/unsupported 标注/双态输出 | 已证实 | `:1-97` 全文 |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 脚本体 | §2/§3 | 21-93 | covered |
