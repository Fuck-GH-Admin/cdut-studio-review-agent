---
path: apps/electron/default-skills/docx/scripts/office/validate.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 03b01f6e3ba40e1408d0bd16d587154fa9798a87
sha256: 1aef24f8e316965a0584c30859776bd2c82a9fb69f72d79cfed041119cf95514
lines: 111
kind: script
package: p02-agent-runtime
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/default-skills/docx/scripts/office/validate.py

## 1. 结论与边界

Office 文档 **XSD/修订校验 CLI**（`apps/electron/default-skills/docx/scripts/office/validate.py:1-14`）：入参可为解包目录或打包文件（自动解到临时目录）；支持 `--auto-repair`（hex ID 超限、`xml:space="preserve` 缺失）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `main` | 函数 | `:25-107` | CLI 主流程 |

出向依赖：`validators.DOCXSchemaValidator`/`PPTXSchemaValidator`/`RedliningValidator`（`:22`，本批同组）。

## 3. 内部逻辑与关键流程

1. 参数：`path`（目录或打包文件）、`--original`、`-v`、`--auto-repair`、`--author`（**默认 `'Claude'`**，`:48-52`）。
2. 断言：path 存在（`:56`）；original 是文件且后缀合法（`:61-64`）；文件类型判定 `(original or path).suffix`（`:66-69`）。
3. 入参为打包文件 → `tempfile.mkdtemp` 解包（`:71-75`）；否则须为目录（`:77`）。
4. 分派（`:80-95`）：`.docx` → `DOCXSchemaValidator`，有 original 再加 `RedliningValidator`（author 透传）；`.pptx` → `PPTXSchemaValidator`；其它 → 报错退出 1。
5. `--auto-repair` → `sum(v.repair())` 报计数（`:97-100`）。
6. `success = all(v.validate())`；成功打印「All validations PASSED!」；退出码 0/1（`:102-107`）。

## 4. 调用者与调用链

- CLI（`__main__`，`:110-111`）；被 `pack.py` 的 `_run_validation` 等价逻辑复用（校验器层）。
- 出向：`validators` 包（本批）。

## 5. 数据 I/O、读写与副作用

- 读解包目录/打包文件；`--auto-repair` 时**就地改写 XML**（经校验器 `repair()`）。
- 临时目录解包（无清理，`:72-75`）。

## 6. 分支、失败、取消与恢复

| 场景 | 行 | 行为 |
| --- | --- | --- |
| path 不存在 | `:56` | assert 失败（带消息） |
| original 非法 | `:61-64` | assert |
| 类型不可判定 | `:67-69` | assert |
| 非目录/非打包 | `:77` | assert |
| `.xlsx`（match `case _`） | `:93-95` | 「Validation not supported」exit 1 |
| 校验失败 | `:102-107` | exit 1 |

## 7. 权限与权威状态

`--author` 用于修订作者校验（默认 `'Claude'`）；无身份校验。

## 8. 修改影响面

- 校验器构造签名变更需同步（`:83-91`）。
- `.xlsx` 明确不支持（`case _` 分支）。

## 9. 测试证据

无专属测试（校验器测试在 validators 实现层）。**NOT_RUN**。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| `main` 全流程与分派 | 已证实 | `:25-107` |
| `--author` 默认 `'Claude'` | 已证实 | `:48-52` |
| `.xlsx` 不支持校验 | 已证实 | `:93-95` |
| 临时目录不清理 | 已证实 | `:72-75` |
| 校验器内部行为 | 未知 | 见各实现手册 |
| 测试实际通过 | 未知 | NOT_RUN |

## 11. 覆盖表

| 面 | 行 | 状态 |
| --- | --- | --- |
| 参数/断言 | `:26-69` | covered |
| 解包/分派 | `:71-95` | covered |
| repair/validate/退出码 | `:97-107` | covered |
