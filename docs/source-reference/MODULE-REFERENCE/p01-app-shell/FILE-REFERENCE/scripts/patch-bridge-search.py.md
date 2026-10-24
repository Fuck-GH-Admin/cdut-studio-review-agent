---
path: scripts/patch-bridge-search.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ab1e25dd5b4a8342d83fef3b764f1734bd7edb00
sha256: 47a9f3bbf273dad8cf1dc784587d09e35aea8f6b33c032c8226e478816c318fc
lines: 112
kind: script
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/patch-bridge-search.py

## 1. 结论与边界

服务器端 paperpipe-bridge.py 的一次性补丁脚本（Python，运维工具）：整段替换 `/search` 处理器为 FTS5 排序搜索（`run_papi(..., ["search","--fts",...])`）+ meta.json 补全（title/authors/year/abstract/tags/arxivId）+ 无结果时回退基础 grep 搜索（`scripts/patch-bridge-search.py:1-112`）。目标硬编码 `/home/ecs-user/paperpipe-bridge.py`（`:7`），数据根 `/data/paperpipe`（`:6`）。

边界：bridge 本体不在冻结树；`run_papi`/FTS5 输出格式语义在服务器侧（照补丁内正则假定，`:51`）。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（脚本体）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `DATA_BASE`/`BRIDGE_PATH` | 常量（内部） | 6-7 | `/data/paperpipe`、bridge 路径 |
| import re 插入 | 步骤 | 13-17 | 顶部补 `import re`（失败仅打印） |
| `old_start_marker`/`old_end_marker` | 定位 | 20-21 | 旧 `/search` 块起止 |
| `new_search` | 字符串（内部） | 32-104 | 新处理器全文 |

## 3. 内部逻辑与关键流程

1. 读 bridge 文件（`:9-10`）；顶部字符串替换插入 `import re`（`:13-17`）。
2. 定位旧 `/search` 块（`find` 起止 marker，`:23-30`）；任一缺失打印 `ERROR: markers not found` 并 `exit(1)`（`:26-28`）。
3. 切片替换为 `new_search`（`:106`），打印替换字符数（`:107`）；写回（`:109-111`）。

`new_search` 语义（`:32-104`）：空 query→400（`:36-37`）；`topK` 默认 5（`:39`）；FTS5 输出按 `paperId (score: X)` 正则解析+snippet 拼接（`:50-63`）；`meta.json` 逐条补全（读 `/data/paperpipe/<user>/papers/<pid>/meta.json`，异常降级 title=pid，`:68-84`）；空结果回退 `run_papi(..., ["search", query])` 的 `ref:snippet` 行解析（score 0.0，`:86-102`）；响应 `{results, query}`（`:104`）。

## 4. 调用者与调用链

入向：无（运维手动执行）；全树无引用（grep 证实）。出向：目标服务器文件（读写）。

## 5. 数据 I/O、读写与副作用

读写 bridge 源文件（整文件覆盖写，`:110`）；副作用=修改服务器脚本。幂等：marker 检测——已替换则旧 marker 消失 → `ERROR: markers not found` + exit 1（不重复替换，`:26-28`）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 | 退出码 |
| --- | --- | --- | --- |
| import re 失败仅打印 | 替换未命中 | 17 | 继续 |
| markers 缺失 | 已打过/格式变 | 26-28 | 1 |
| 替换+写回 | 正常 | 106-111 | 0 |

文件错误冒泡（无捕获，推断）；无备份/回滚（手工工具）。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；执行需目标文件读写权限。修改第三方运维脚本；meta.json 读取为服务器本地数据。

## 8. 修改影响面

- 影响 `/search` 响应形状（`{results, query}`，条目含 paperId/score/snippet/title/authors/year/abstract/tags/arxivId）——服务器端消费者未知（不在冻结树）。
- 与同组两个补丁脚本共享目标文件（执行顺序敏感）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行/真实 bridge 修改。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + new_search 全文 | 已证实 | `:1-112` 逐行读 |
| 幂等（marker 消失→exit 1） | 已证实 | `:26-28` |
| FTS5 输出格式假定 | 已证实（补丁内） | `:51` 正则（服务器实现未核，标未知） |
| 无备份/无条件写回 | 已证实 | `:109-111` |
| 无仓库内调用者 | 已证实 | 全树检索 |
| bridge/papi/meta 数据实现 | 未知 | 不在冻结树 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| import 插入/定位/替换 | §3 | 13-30, 106-111 | covered |
| new_search 语义 | §2-3 | 32-104 | covered |
| 分支/退出码 | §6 | 26-28 | covered |
| 调用链 | §4 | - | covered |
| 运行期/bridge 本体 | §10 | - | unknown（NOT_RUN/不在冻结树） |
