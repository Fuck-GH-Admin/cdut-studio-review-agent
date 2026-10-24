---
path: scripts/patch-bridge-semantic.py
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: 857e8c024914385a28c335641a03f22b2ae083aa
sha256: 8647d857ae4e4709265638a49fc579b7e0c8f7faff5aae6b157347b1636df5b2
lines: 234
kind: script
package: p01-app-shell
author: docs-r07-author-extra-02-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# scripts/patch-bridge-semantic.py

## 1. 结论与边界

**bridge.py 语义搜索补丁脚本**（234 行 Python，一次性运维脚本）：向远程主机文件 `/home/ecs-user/paperpipe-bridge.py`（硬编码 `scripts/patch-bridge-semantic.py:4`）注入「bge-small 预计算嵌入语义搜索」能力——模块级懒加载模型（PATCH 1）、/add 成功后预计算嵌入（PATCH 2）、/search 支持 `mode=semantic|hybrid`（PATCH 3a/3b）、/remove 清理嵌入缓存（PATCH 4）（docstring `:1`）。边界：本文件不被本仓任何构建/测试/运行链引用（§4），仅作用于目标主机上的 paperpipe-bridge.py；不做网络请求；无参数（目标路径写死）。

## 2. 导出与关键符号

无导出（script）：无 CLI 参数（`scripts/patch-bridge-semantic.py:4` 硬编码目标路径）。内部符号（均「内部」）：
- `BRIDGE_PATH`（`:4`）：目标文件绝对路径。
- `model_init_code`（`:10-84`）：PATCH 1 注入代码块；其中注入到 bridge.py 的符号为 `_embed_model`（懒加载全局）、`get_embed_model()`（懒加载 `BAAI/bge-small-en-v1.5`，384 维，`:14-23`）、`compute_and_save_embedding(user_id, paper_id, text)`（`text[:3000]` 归一化编码并 `np.save` 到 `DATA_BASE/<uid>/papers/<pid>/embedding.npy`，`:25-36`）、`semantic_search(user_id, query, top_k=5)`（query 嵌入与全部缓存嵌入点积相似度、读 `meta.json`/`summary.md[:200]` 组装结果、按 score 降序取 top_k，`:38-83`）。
- `insert_marker`（`:87`）：`"class BridgeHandler(BaseHTTPRequestHandler):"`。
- `old_add_after_import`/`new_add_after_import`（`:95-99`/`:101-111`）：PATCH 2 文本对。
- `old_search_result_line`（`:121`）：PATCH 3 总门闩文本。
- `old_query_read`/`new_query_read`（`:125-127`/`:129-139`）：PATCH 3a 文本对。
- `fts5_end_marker`/`new_fts5_end`（`:149-166`/`:168-200`）：PATCH 3b 文本对。
- `old_remove_cleanup`/`new_remove_cleanup`（`:213-215`/`:217-223`）：PATCH 4 文本对。
- 死代码事实：`import re`（`:2`）全文未使用；`old_search_end`（`:146`）赋值后未被引用（实际使用的是 `fts5_end_marker`，注释 `:147-148` 说明定位方式）。

## 3. 内部逻辑与关键流程

按真实执行顺序分段（全部为顶层顺序语句）：
1. 读目标文件全文（`scripts/patch-bridge-semantic.py:6-7`）。
2. **PATCH 1**（`:86-92`）：`insert_marker` 在 content 中 → 将 `model_init_code` 插入 `class BridgeHandler` 之前并打印 `PATCH 1 (model loading): OK`（`:88-90`）；否则打印 `NOT FOUND`（`:92`）。不短路，继续后续补丁。
3. **PATCH 2**（`:94-117`）：命中 `old_add_after_import`（/add 成功后重建 FTS5 索引的锚点）→ 替换为含「预计算语义嵌入」的版本：`clean_id_final = arxiv_id.lower().replace("v","")`（怪癖：`replace("v","")` 删除**全部** 'v' 字符而非仅版本后缀，id 中部含 'v' 会被破坏，潜在 paperId 错配，`:106`），`summary.md` 存在则 `compute_and_save_embedding`（`:105-109`），打印 `PATCH 2 (add embedding): OK`（`:115`）；否则 `NOT FOUND`（`:117`）。
4. **PATCH 3 总门**（`:119-123`）：`old_search_result_line`（`self._send_json({"results": results, "query": query})`）不存在 → 打印 `PATCH 3: search result line NOT FOUND` 并短路 3a/3b（`:209-210`）。
5. **PATCH 3a**（`:125-143`）：命中 `old_query_read` → 替换为 `new_query_read`：新增 `mode = body.get("mode", "fts")`（`:129`）；`mode == "semantic"` 时 `semantic_search` 直接返回并 `_send_json(..., "mode": "semantic")` 后 `return`（`:133-136`，短路 FTS5）；否则保持 FTS5 路径。打印 `PATCH 3a (search mode): OK`（`:143`）；未命中 → `NOT FOUND` 并短路 3b（`:207-208`）。
6. **PATCH 3b**（`:146-206`）：以 `fts5_end_marker`（FTS5 兜底块 + 终局 `_send_json`）定位 → 替换为 `new_fts5_end`：保留兜底块，追加 hybrid 重排——`mode == "hybrid" and results` 时 `semantic_search(user_id, query, top_k*2)` 建 `sem_map`，每条结果记 `ftsScore`/`semScore` 并按 `score = 0.3*ftsScore + 0.7*semScore` 重排（`:186-196`），异常仅打印 `Hybrid rerank failed` 不中断（`:197-198`）；终局 `_send_json` 带 `"mode": mode`（`:200`）。打印 `PATCH 3b (hybrid mode): OK`/`NOT FOUND`（`:202-206`）。
7. **PATCH 4**（`:212-229`）：命中 /remove 成功后重建索引锚点 → 追加「清理语义嵌入缓存」`embedding.npy` 存在则 `unlink()`（`:220-223`），打印 `PATCH 4 (remove embedding): OK`（`:227`）；否则 `NOT FOUND`（`:229`）。
8. **写回**：无论补丁命中与否，`open(BRIDGE_PATH, "w")` 全量重写 content（`:231-232`）并打印 `All done, writing to <path>`（`:234`）。返回值：无（脚本无函数定义、无 return）。

## 4. 调用者与调用链

- 入向：**未知——冻结树内零引用**。已尝试检索方式：全树（含 docs/work/specs）grep `patch-bridge-semantic` 无命中；`package.json` scripts、`.github/workflows/` 8 个 workflow、bunfig 均无点名。推断为运维人员在目标主机（ecs-user）手工执行（依据：硬编码 `/home/ecs-user/...` 绝对路径 `scripts/patch-bridge-semantic.py:4`）。
- 同族脚本（共享同一 `BRIDGE_PATH` 目标，无相互调用）：`scripts/fix-bridge-add-lookup.py:2`、`scripts/patch-bridge-index-rebuild.py:4`、`scripts/patch-bridge-search.py:7`。
- 出向：文件读（`:6-7`）/写（`:231-232`）目标 `/home/ecs-user/paperpipe-bridge.py`。注入代码依赖目标文件既有符号（字符串内引用）：`json`（`:63`）、`Path`/`DATA_BASE`（`:31`、`:44`）、`run_papi`（`:97`、`:103`）；运行时依赖 `numpy`、`sentence_transformers.SentenceTransformer`、模型 `BAAI/bge-small-en-v1.5`（`:18-21`、`:28`、`:40`）。

## 5. 数据 I/O、读写与副作用

- 磁盘读：`/home/ecs-user/paperpipe-bridge.py` 一次全量读（`scripts/patch-bridge-semantic.py:6-7`）。
- 磁盘写：同一文件一次全量覆盖写（`:231-232`）——`open(..., "w")` 直接截断重写，**非原子**（无临时文件+rename、无备份、无回滚）。
- 注入代码的运行时副作用（属 bridge.py 进程）：写 `embedding.npy`（`np.save`，`:32`）、读 `meta.json`/`summary.md`（`:63`、`:67`）、/remove 时删除 `embedding.npy`（`:221-223`）。
- 幂等性：**PATCH 1 非幂等**——`insert_marker`（类声明行）在首次补丁后仍存在，重跑会再次插入整个 `model_init_code` 造成重复定义；PATCH 2/3/4 重跑时旧文本已被替换 → 打印 `NOT FOUND` 跳过（近幂等）。脚本本身无网络副作用。

## 6. 分支、失败、取消与恢复

- 无显式 exit code/错误码；各补丁不匹配仅打印 `NOT FOUND` 不抛错（`scripts/patch-bridge-semantic.py:92`、`:117`、`:206`、`:208`、`:210`、`:229`），脚本仍以 0 退出并写回文件。异常路径：目标文件不可读/不可写 → Python traceback 非零退出（未捕获）。
- 失败后状态：补丁按序执行，前序命中、后序 `NOT FOUND` 时会写回**部分补丁**版本的 bridge.py；PATCH 3a 失败时 3b 被短路（`:207-208`）。无断点/续跑机制。
- 重试/恢复：手工检查打印的 OK/NOT FOUND 清单后人工修复锚点再跑；PATCH 1 重跑前必须先去重（§5 非幂等）。取消：不适用，依据：无异步/信号处理。

## 7. 权限与权威状态

- 权限读取点：对 `/home/ecs-user/paperpipe-bridge.py` 的读写权限（`scripts/patch-bridge-semantic.py:4`，隐含在目标主机以有权用户运行）；无 env、token、凭据读取（全文核对 `:1-234`）。
- 权威状态：bridge.py 的语义/混合搜索行为以本补丁注入的代码为权威实现来源（`bge-small` 归一化嵌入 + 点积相似度 + 0.3/0.7 混合权重，`:194-195`）；混合权重与 top_k 默认值（5）为本文件内约定常量。

## 8. 修改影响面

- 目标主机 bridge.py 的三条端点行为：`/add`（嵌入预计算，`:101-111`）、`/search`（`mode=semantic|hybrid` 新语义，`:129-200`）、`/remove`（嵌入清理，`:217-223`）；以及模块级新增三个函数（`:14-83`）。
- 注入代码的契约面：bridge.py 的 `DATA_BASE`/`Path`/`json`/`run_papi` 符号布局（`scripts/patch-bridge-semantic.py:31`、`:44`、`:63`、`:97`）；目标机须安装 `sentence_transformers`/`numpy` 与可下载/缓存 `BAAI/bge-small-en-v1.5`（`:18-21`）。
- 对本仓运行时/构建/测试无影响（零引用，§4）。

## 9. 测试证据

`NOT_RUN`（本轮未运行任何脚本/测试，纯静态阅读）。直接测试：无（grep 全树 `patch-bridge-semantic` 零命中，`it(`/`test(` 计数 0）。间接证据：无。测试断言≠运行。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 个 PATCH 的锚点/替换体/OK-NOT FOUND 打印与写回 | 已证实 | `scripts/patch-bridge-semantic.py:1-234` 全文 |
| PATCH 1 非幂等、`re` 未用、`old_search_end` 死赋值 | 已证实 | `:87-89`、`:2`、`:146` |
| 注入代码的嵌入/相似度/混合权重语义 | 已证实 | `:10-84`、`:185-198` |
| 入向调用方式 | 未知 | 全树 grep/package.json/workflows 检索零命中 |
| 目标机 bridge.py 现状与运行验证 | 未知 | NOT_RUN；目标文件在域外主机 |

## 11. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 读入/写回 | §3/§5 | 6-7,231-234 | covered |
| PATCH 1（模型懒加载/嵌入/语义搜索注入） | §3 | 10-92 | covered |
| PATCH 2（/add 预计算嵌入） | §3 | 94-117 | covered |
| PATCH 3 总门 + 3a（mode=semantic） | §3 | 119-143,209-210 | covered |
| PATCH 3b（hybrid 重排） | §3 | 146-206 | covered |
| PATCH 4（/remove 嵌入清理） | §3 | 212-229 | covered |
| 死代码（`re`/`old_search_end`） | §2 | 2,146 | covered |
| 幂等性/非原子写 | §5/§6 | 231-232 | covered |
| 入向调用链 | §4 | - | unknown |
| 运行验证 | §10 | - | unknown（NOT_RUN） |
