---
path: apps/electron/default-skills/skill-creator/eval-viewer/generate_review.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 7fa5978631fed1ed545591dbb2b0eb21ce3f3d08
sha256: fc9d1b9243fe5ab6012ebd579bd76d0035de1b79fd3b969de114defab26478fb
lines: 471
kind: script
package: p02-agent-runtime
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/default-skills/skill-creator/eval-viewer/generate_review.py

## 1. 结论与边界

skill-creator 评测评审页**生成器 + 微型 HTTP 服务**（Python 标准库零依赖，`apps/electron/default-skills/skill-creator/eval-viewer/generate_review.py:1-13`）：读 workspace、发现 runs（含 `outputs/` 的目录）、把全部输出数据嵌入自包含 HTML，`feedback.json` 自动保存。CLI：`python generate_review.py <workspace-path> [--port] [--skill-name] [--previous-workspace] [--benchmark] [--static]`（`:8-10/:387-404`）。

## 2. 导出与关键符号

脚本无模块级 export（Python CLI 直执行，`__main__`）；以下为关键内部符号与数据流：

| 符号 | 行 | 行为 |
| --- | --- | --- |
| `METADATA_FILES/TEXT_EXTENSIONS/IMAGE_EXTENSIONS/MIME_OVERRIDES` | 31-49 | 输出清单排除 3 文件；文本/图片扩展名集合；MIME 覆盖（svg/xlsx/docx/pptx） |
| `get_mime_type` | 52-57 | 扩展名→MIME（兜底 octet-stream） |
| `find_runs`/`_find_runs_recursive` | 60-82 | 递归找 `outputs/` 目录；跳过 node_modules/.git/__pycache__/skill/inputs；按 (eval_id, id) 排序 |
| `build_run` | 85-146 | prompt 取自 `eval_metadata.json`（两级回退）→ `transcript.md` 的 `## Eval Prompt` 正则（`:108`）→ `(No prompt found)`；收集 outputs（排除 METADATA_FILES）；`grading.json` 两级回退 |
| `embed_file` | 149-210 | text 内嵌 / image+pdf+xlsx+binary base64 data_uri（OSError→error 项） |
| `load_previous_iteration` | 213-247 | 上轮 feedback.json + runs（供对照展示） |
| `generate_html` | 250-281 | 读同目录 `viewer.html` 模板，把 `/*__EMBEDDED_DATA__*/` 替换为 `const EMBEDDED_DATA = {...}`（`:281`） |
| `_kill_port` | 288-306 | lsof 找占用进程 SIGTERM（无 lsof 提示 stderr） |
| `ReviewHandler` | 308-384 | GET `/`（**每次请求重新生成 HTML**，`:334`）、GET/POST `/api/feedback`（校验 `reviews` 键，`:367`）；日志静默 |
| `main` | 387-471 | 参数解析；无 runs 退出 1（`:412-414`）；`--static` 写独立 HTML 退出（`:431-436`）；否则 `_kill_port` 后 HTTPServer 127.0.0.1（默认端口 3117，`:390`；被占自动换随机端口 `:443-447`）；`webbrowser.open` |

## 3. 内部逻辑与关键流程

主链路：`main`（`:387-471`）→ `find_runs` 递归找含 `outputs/` 的目录（`:60-82`）→ `build_run`（`:85-146`）+`embed_file`（`:149-210`）把输出内嵌 data_uri → `generate_html` 读同目录 `viewer.html` 模板替换占位符（`:250-281`）→ `--static` 写独立 HTML 退出（`:431-436`），否则 `_kill_port`（`:288-306`）后起 `HTTPServer 127.0.0.1`（默认 3117，被占换随机端口 `:443-447`）+`ReviewHandler` 路由（GET / 每请求重生成 `:334`；GET/POST /api/feedback 校验 `reviews` 键 `:367`）。
## 4. 调用者与调用链

入向：`apps/electron/default-skills/skill-creator/SKILL.md`（指令点名）、`viewer.html`（模板配对，另篇）。出向：stdlib http.server/socketserver/webbrowser/lsof 子进程、同目录 `viewer.html` 模板、`feedback.json` 读写。
## 5. 数据 I/O、读写与副作用

本文件为生成端；DOM 契约在 `viewer.html`（另篇）。注入契约：模板占位符 `/*__EMBEDDED_DATA__*/`（`:649` viewer.html），数据键 `skill_name/runs/previous_feedback/previous_outputs/benchmark`（`:270-277`）。

## 6. 分支、失败、取消与恢复

JSON/IO 解析失败静默回退（`:97/:111/:136/:231/:340/:427`）；文件读取失败→error 项（`:169` 等）；端口被占→随机端口（`:445-447`）；无 lsof→提示继续（`:306`）。

## 7. 权限与权威状态

无权限分支，依据：CLI 脚本本地进程内执行，无 sender/role 检查（静态）。
## 8. 修改影响面

改嵌入数据结构影响 viewer.html 消费；改路由影响前端 fetch（`/api/feedback`）；`generate_review.py`+`viewer.html`+`eval_review.html` 同属 skill-creator 评测工具链。

## 9. 测试证据

无专属测试（冻结树检索零命中）；NOT_RUN（网络/GUI）。
## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 全函数/路由/回退链 | 已证实 | `:31-471` 逐行 |
| 每请求重生成 HTML | 已证实 | `:334` |
| 实际服务行为 | 未知 | NOT_RUN（网络/GUI） |

## 11. 覆盖表

| 区段 | 章节 | 状态 |
| --- | --- | --- |
| 全部函数/HTTP 路由/CLI | §2 | covered |
| 失败降级 | §4 | covered |
| 运行验证 | §10 | unknown（NOT_RUN） |
