---
path: scripts/patch-bridge-index-rebuild.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: ba68ce4d64a9175d07f5e648b5adeb27f8c79503
sha256: 7665028a3232f17356d7501ee87fcc6f3218510aea16d648943efbd4d1c48320
lines: 58
kind: script
package: p01-app-shell
author: docs-r07-author-extra-05-20261024
reviewer: docs-r07-qa-extra-05-20261024
status: authored
evidence: static
---

# scripts/patch-bridge-index-rebuild.py

## 1. 结论与边界

服务器端 paperpipe-bridge.py 的一次性补丁脚本（Python，运维工具）：在 `/add` 导入成功后与 `/remove/` 删除成功后各插入一次 `run_papi(user_id, ["index", "--backend", "search"], timeout=60)`——增删后重建 FTS5 搜索索引（`scripts/patch-bridge-index-rebuild.py:1-58`）。目标硬编码 `/home/ecs-user/paperpipe-bridge.py`（`:4`）。

边界：bridge 本体不在冻结树（服务器文件）；与 `patch-bridge-search.py`/`fix-bridge-add-lookup.py` 构成同目标补丁组。

## 2. 导出与关键符号

`export` 逐条核对：**0 个导出**（脚本体）。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `BRIDGE_PATH` | 常量（内部） | 4 | `/home/ecs-user/paperpipe-bridge.py` |
| `old_block`/`new_block` | 字符串（内部） | 16-25 | `/add` 成功块替换（插入 index 重建） |
| `old_remove`/`new_remove` | 字符串（内部） | 34-47 | `/remove/` 块替换（删除后 index 重建） |

（`old_add_success_marker` `:9-13` 为遗留未用片段，仅作定位提示——照实记录。）

## 3. 内部逻辑与关键流程

1. 读 bridge 文件（`:5-6`）。
2. `/add` 补丁（`:27-31`）：`old_block in content` → 替换并在 `list` 获取新论文前插入 `run_papi(..., ["index","--backend","search"], timeout=60)`（`:20-25`）；否则打印 `NOT FOUND`。
3. `/remove/` 补丁（`:49-53`）：删除成功后条件插入同一 index 重建（`:40-47`）；否则 `NOT FOUND`。
4. 无条件写回（`:55-57`）。

## 4. 调用者与调用链

入向：无（运维手动执行）；全树无引用（grep 证实）。出向：目标服务器文件（读写）。

## 5. 数据 I/O、读写与副作用

读写 bridge 源文件（整文件覆盖写，`:56`）；副作用=修改服务器脚本。幂等：精确匹配替换，已应用则 `NOT FOUND`（不重复替换）。

## 6. 分支、失败、取消与恢复

| 分支 | 触发 | 行 |
| --- | --- | --- |
| /add 替换 | old_block 命中 | 27-29 |
| /add NOT FOUND | 未命中 | 30-31 |
| /remove 替换 | old_remove 命中 | 49-51 |
| /remove NOT FOUND | 未命中 | 52-53 |
| 写回 | 无条件 | 55-57 |

文件错误冒泡（无捕获，推断）；无备份/回滚（手工工具）。

## 7. 权限与权威状态

无权限分支，依据：本文件无权限逻辑；执行需目标文件读写权限。修改第三方运维脚本。

## 8. 修改影响面

- 影响 bridge 增删后的搜索索引一致性（FTS5 重建）；`run_papi(..., "index", ...)` 语义在 bridge/papi（不在冻结树）。
- 与同组两个补丁脚本共享目标文件与匹配式设计（执行顺序敏感）。
- 需同步的测试：无（0 test）。

## 9. 测试证据

直接测试：**无**（全树 `*.test.*` 检索 0 命中）。间接证据：无。

NOT_RUN：本轮未运行任何测试/typecheck/构建/脚本执行/真实 bridge 修改。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 0 导出 + 两补丁块全文 | 已证实 | `:1-58` 逐行读 |
| 幂等（精确匹配） | 已证实 | `:27-53` |
| 无备份/无条件写回 | 已证实 | `:55-57` |
| `old_add_success_marker` 为遗留未用片段 | 已证实 | `:9-13` 全文无其它引用 |
| 无仓库内调用者 | 已证实 | 全树检索 |
| bridge/papi 实现 | 未知 | 不在冻结树 |
| 运行期行为 | 未知 | NOT_RUN |

## 11. 覆盖表

| 符号/职责 | 手册章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 两替换块 | §2-3 | 16-47 | covered |
| 分支/写回 | §6 | 27-57 | covered |
| 调用链 | §4 | - | covered |
| 运行期/bridge 本体 | §10 | - | unknown（NOT_RUN/不在冻结树） |
