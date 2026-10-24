---
path: apps/electron/default-skills/pptx/scripts/office/validate.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03b01f6e3ba40e1408d0bd16d587154fa9798a87
sha256: 1aef24f8e316965a0584c30859776bd2c82a9fb69f72d79cfed041119cf95514
lines: 111
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-05-20261023
reviewer: p01-app-shell
status: authored
evidence: static
---

# apps/electron/default-skills/pptx/scripts/office/validate.py

## 1. 结论与边界

Office XML **校验命令行入口**：对 XSD 与修订（tracked changes）校验；入参可为解包目录或打包文件（自动解到临时目录，`validate.py:1-14`）。auto-repair 修 paraId/durableId 超限与 `xml:space` 缺失。副作用=可写修复+临时目录。

## 2. 导出与关键符号

1 个导出函数 `main`（`:25`）+ CLI 参数组（`:26-53`）：`path`、`--original`（缺省=全部报 XSD 错且跳过红线校验，`:35`）、`-v`、`--auto-repair`、`--author`（默认 'Claude'）。

## 3. 内部逻辑与关键流程

（`:55-107`）：path 存在断言（`:56`）→ original 校验（`:59-64`）→ 后缀判定（original 或 path，`:66-69`）→ 打包文件则 `zipfile.extractall` 到 temp（`:71-75`）→ 按后缀组校验器：docx=DOCXSchemaValidator（+有 original 时 RedliningValidator，`:81-88`）；pptx=PPTXSchemaValidator（`:89-92`）；**xlsx 不支持→exit 1**（`:93-95`）→ `--auto-repair` 时 `sum(v.repair())`（`:97-100`）→ `all(v.validate())`（`:102`）→ exit 0/1（`:107`）。

## 4. 调用者与调用链

- 入向：技能流程 CLI（域外）；pack.py 同族逻辑（`_run_validation`）。
- 出向：`validators`（本批）。

## 5. 数据 I/O、读写与副作用

读 Office 文件/目录；repair 模式改写 XML；临时目录（tempfile.mkdtemp，无清理逻辑照实记录 `:72`）。

## 6. 分支、失败、取消与恢复

断言校验（存在/后缀）→ AssertionError 退出；xlsx 分支 exit 1；validate 结果 exit 0/1；无取消。

## 7. 权限与权威状态

无权限分支，依据：本地 CLI；校验权威=validators（XSD/修订语义见对应手册）。

## 8. 修改影响面

校验入口（技能质量门）；`--author` 与 RedliningValidator 归因语义联动。

## 9. 测试证据

`NOT_RUN`。无直接测试（本批无 test 文件）。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 参数/分支/exit 语义 | 已证实 | `:1-111` 全文 |
| 临时目录不回收（mkdtemp 无 cleanup） | 已证实（照实记录） | `:72-75` |
| 运行验证 | 未知 | NOT_RUN |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| main+CLI | §2/§3 | 25-107 | covered |
