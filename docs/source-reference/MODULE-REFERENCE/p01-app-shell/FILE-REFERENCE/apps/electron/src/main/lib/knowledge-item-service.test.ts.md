---
path: apps/electron/src/main/lib/knowledge-item-service.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: e98c9050dcf75b30148154b1c5adc1b6079bbb75
sha256: eb2508a80f6959f063660aadee3567b08372ad5203771f7191c2612a6defb9d0
lines: 61
kind: test
package: p01-app-shell
author: docs-r07-author-extra-01-20261024
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/knowledge-item-service.test.ts

## 1. 测试目标

`knowledge-item-service`（同批深读）的受控存储与 allowlist 检索安全性质：批量导入上限、索引不泄漏源绝对路径、删除后不可读、allowlist 不越权读取。框架 `bun:test`；mock 边界=真实 fs + 临时配置根（`PROFER_CONFIG_DIR`），不 mock 存储层。

## 2. 用例清单

用例计数：`test(` **4**（`:21`、`:26`、`:38`、`:47`），`it(` 0——与源码计数一致。单一 `describe('个人资料受控存储')`（`:20`）。

公共装置（非用例）：
- `beforeEach`（`:9-13`）：`mkdtempSync(tmpdir()/profer-knowledge-test-)` 建临时根；`process.env.PROFER_CONFIG_DIR = root`（配置根重定向，`config-paths.resolveConfigDir` 尊重该覆盖，`config-paths.ts:57-60`）；动态 `import('./knowledge-item-service?test=<Date.now()>-<Math.random>')` **带查询串做模块隔离**（每次重载模块级状态）。
- `afterEach`（`:15-18`）：删环境变量 + `rmSync(root, {recursive, force})`。

| # | 用例（test 名） | 设置 | 动作 | 依赖顺序 |
| --- | --- | --- | --- | --- |
| 1 | `Given 十一份资料 When 导入 Then 拒绝并且不创建索引`（`:21-24`） | 临时根 | `importKnowledgeItems(11 个不存在的 .md 路径)` | 独立 |
| 2 | `Given 本地 Markdown When 导入 Then 索引不记录原始绝对路径且正文可受控读取`（`:26-36`） | 写 `private-note.md`（'# 私有标题\n这里是受控正文。'） | 导入 1 份 + 读索引文件 + `getKnowledgeItem` | 独立 |
| 3 | `Given 已删除资料 When 读取或 allowlist 搜索 Then 不返回正文`（`:38-45`） | 写 `delete-me.md` | 导入→`deleteKnowledgeItem`→读/搜 | 独立 |
| 4 | `Given 两份资料 When allowlist 只含一份 Then 搜索不会越权读取另一份`（`:47-60`） | 写 `allowed.md`（含 alpaca）、`denied.md`（含 forbidden-token） | 导入 2 份→`searchKnowledgeItemsForChat('forbidden-token', [first.id])` | 独立 |

每用例独立 beforeEach 的临时根与模块实例，无顺序依赖。

## 3. 真实断言

（逐条引用 expect 行）

1. `await expect(service.importKnowledgeItems(...11 项)).rejects.toThrow('一次最多导入 10 份资料')`；`expect(service.listKnowledgeItems()).toEqual([])`（`:22-23`）。
2. `expect(item).toBeDefined()`；`expect(index).not.toContain(source)`（源绝对路径不入索引）；`expect(index).toContain('private-note.md')`；`expect(service.getKnowledgeItem(item!.id)?.text).toContain('受控正文')`（`:31-35`）。
3. `expect(service.getKnowledgeItem(item.id)).toBeNull()`；`expect(await service.searchKnowledgeItemsForChat('删除内容', [item.id])).toEqual([])`（`:43-44`）。
4. `expect(results.map((result) => result.item.id)).toEqual([first!.id])`；`expect(results.map((result) => result.content).join('\n')).not.toContain('forbidden-token')`；`expect(service.getKnowledgeItem(second!.id)?.text).toContain('forbidden-token')`（`:57-59`）。

## 4. 未覆盖与脆弱点

- 未覆盖（对照被测源码）：`resolveKnowledgeReferences`、旧论文 `index.json` 投影/删除、`getKnowledgeLibrarySnapshot`、`getKnowledgeItemStoredFilePath`、`searchKnowledgeItems`（无 allowlist 形态）、错误分支（不支持格式/100MB/空文本/解析失败）、10 份上限边界（恰好 10 份）、并发导入。
- 脆弱点：动态 import 查询串依赖模块每例重载（若打包器改缓存行为会失真）；`PROFER_CONFIG_DIR` 覆盖是测试专用受控机制，生产路径（`~/.cdutai`）未测；用例 4 的越权断言依赖关键词词面命中（`keywords` 切词 ≥2 字符）。
- 真实 fs 无 mock：`extractTextFromFile`（document-parser）对 `.md` 走 `readFileSync`（`document-parser.ts:136-138`），故用例只测 Markdown 路径，Office/PDF 解析未触达。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 4 test/0 it 计数 | 已证实 | 全文件 `test(`/`it(` 机械计数 |
| 断言逐条如 §3 | 已证实 | `knowledge-item-service.test.ts:22-59` |
| mock 边界=真实 fs+临时配置根+模块重载 | 已证实 | `:9-18` |
| 测试通过与否 | 未知 | NOT_RUN（本轮未执行 bun test） |
| 旧论文/引用解析/错误分支行为 | 未知 | 无用例（§4） |

## 6. 覆盖表

| 对象 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 导入上限 10 | §2/§3 | 21-24 | covered |
| 索引不泄漏源路径+受控读取 | §2/§3 | 26-36 | covered |
| 删除后不可读/不可搜 | §2/§3 | 38-45 | covered |
| allowlist 不越权 | §2/§3 | 47-60 | covered |
| 旧论文投影/`resolveKnowledgeReferences` | §4 | — | unknown |
| 运行结果 | §5 | — | unknown（NOT_RUN） |
