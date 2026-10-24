---
path: scripts/fix-bridge-add-lookup.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 16521f5b92c1092df3aadc3c36fe86b05eb8a479
sha256: ee1b24fa4d67c91e7a337b2465ed011893e76c8fd3fe49b12f79e5e9cd8f1442
lines: 89
kind: script
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/fix-bridge-add-lookup.py

## 1. 结论与边界

服务器端 paperpipe-bridge.py 的一次性修复脚本（Python，运维工具）：替换 `/add` 处理器中「按 id 查找新论文」的逻辑——从只查列表结果改为遍历列表、经 `meta.json` 补全 authors/tags/arxivId、`/meta` 接口包 warning 兜底（`scripts/fix-bridge-add-lookup.py:1-89`）。目标文件硬编码 `/home/ecs-user/paperpipe-bridge.py`（`:3`）。

边界：不改本仓库代码；bridge 本体不在冻结树（服务器文件）；与 `patch-bridge-*.py` 同属运维补丁工具组。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（脚本体）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BRIDGE_PATH` | 常量（内部） | 3 | `/home/ecs-user/paperpipe-bridge.py` |
| `old_find_paper` | 字符串（内部） | 5-20 | 旧查找逻辑片段（精确匹配） |
| `new_find_paper` | 字符串（内部） | 23-74 | 新逻辑（循环列表+meta 补全+warning 兜底） |

## 3. 内部逻辑与关键流程

1. 读 bridge 文件（`:4`）。
2. `content.replace(old, new)`（`:76-78`）；未命中打印 `pattern NOT FOUND` 并定位 `clean_id = arxiv_id.lower()` 偏移供人工排查（`:80-85`）。
3. 无条件写回（`:87-89`）。

新逻辑（`:23-74`）：遍历 `list` 找 `clean_id == (p.get("arxivId") or "").strip()`（`:40-43`）；`dataBase/<user>/papers/<id>/meta.json` 存在则补 `authors/tags/arxivId`（`:48-58`）；`/meta` 接口单层 try/except 补 title（`:59-65`）；遍历兜底构造 `{id,title:id}`（`:70-72`）。

## 4. 调用者与调用链

入向：无（运维手动执行 `python3 scripts/fix-bridge-add-lookup.py`）；全树无引用（grep 证实）。

出向：目标服务器文件（读写 `/home/ecs-user/paperpipe-bridge.py`）。

## 5. 数据 I/O、读写与副作用

- 读写 bridge 源文件（整文件覆盖写，`:87`）；副作用=修改服务器脚本（需在服务器执行才有意义）。
- 并发/幂等：精确字符串匹配——已替换过则 `pattern NOT FOUND`（`:80`），重复执行不重复替换（幂等，依据：old 不再存在）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| 替换成功 | old 命中 | 76-78 |
| 未命中诊断 | pattern NOT FOUND | 80-85 |
| 写回 | 无条件 | 87-89 |

文件不存在/权限不足 → IOError 冒泡（无捕获，推断）。无备份/回滚（手工工具，照实记录）。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；执行需对目标文件的读写权限（服务器 shell 权限）。修改的是第三方运维脚本（非产品代码）。

## 8. 修改影响面

- 影响 paperpipe-bridge `/add` 响应形状（新增 message/paper 字段）——服务器端消费者未知（不在冻结树）。
- 与 `patch-bridge-index-rebuild.py`/`patch-bridge-search.py` 构成同目标文件的补丁序列（执行顺序影响结果，均精确匹配）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 `fix-bridge-add-lookup` 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行/真实 bridge 修改。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 替换逻辑全文 | 已证实 | `:1-89` 逐行读 |
| 幂等（old 不复存） | 已证实 | `:76-85` |
| 无备份/无条件写回 | 已证实 | `:87-89` |
| 无仓库内调用者 | 已证实 | 全树检索 |
| bridge 本体/服务器消费者 | 未知 | 不在冻结树 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| old/new 片段 | §2-3 | 5-74 | covered |
| 替换/诊断/写回 | §3, §6 | 76-89 | covered |
| 调用链 | §4 | - | covered |
| 运行期/bridge 本体 | §10 | - | unknown（NOT_RUN/不在冻结树） |
