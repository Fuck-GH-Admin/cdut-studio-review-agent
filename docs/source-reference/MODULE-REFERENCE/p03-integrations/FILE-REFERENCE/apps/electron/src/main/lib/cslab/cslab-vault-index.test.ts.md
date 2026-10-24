---
path: apps/electron/src/main/lib/cslab/cslab-vault-index.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: cbffd347384ba7accb2a8ea3b9aa95490c05f769
sha256: 239ff0b76b8f8bda07b76762397e50a0315259e7733aa8af4cf067c0b0e9e449
lines: 63
kind: test
package: p03-integrations
author: docs-r07-author-nb-07-20261023
reviewer: docs-r07-qa-nb-07-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/cslab/cslab-vault-index.test.ts

## 1. 测试目标

CSLab Vault 笔记**检索相关度排序**（文件头 `apps/electron/src/main/lib/cslab/cslab-vault-index.test.ts:1-4`）：标题命中必须优先于正文命中，避免高价值笔记因创建时间早而被截断。针对 `searchVaultNotes` 打分排序契约（实现在 `apps/electron/src/main/lib/cslab/cslab-vault-index.ts:560-589`）。

## 2. 用例清单

1 个 `describe`、1 个 `test`（`bun:test`，`:5`）。夹具：`beforeAll`（`:17-33`）——`mkdtempSync` 临时配置根（`PROFER_CONFIG_DIR` 重定向，保存旧值于 `previousConfigDir`）→ `createLab({name:'Vault 检索排序测试实验室'})` → 写两篇笔记：`界面阻抗.md`（标题精确命中，`utimesSync` 回拨 120 秒使其**更旧**，`:23-28`）与 `循环稳定性.md`（仅正文提到「界面阻抗」，`:30-31`）。`afterAll`（`:35-49`）：`__clearVaultContentLru` + `closeCsLabVaultCache(lab.id)` + `closeAllCsLabDatabases` + 清目录 + 还原 `PROFER_CONFIG_DIR`。用例间无顺序依赖（唯一用例）。

1. `:52-63`「标题命中优先于正文命中并参与截断」——设置：两篇笔记（标题命中者更旧）；动作：`rebuildVaultIndex(lab.id, { force: true })` 后 `searchVaultNotes(lab.id, '界面阻抗', 1)` 与 `searchVaultNotes(lab.id, '界面阻抗', 10)`；断言见 §3。

## 3. 真实断言

- `:57` `expect(top).toHaveLength(1)`（limit=1 截断生效）。
- `:58` `expect(top[0]?.title).toBe('界面阻抗')`（标题命中 50 分排首，即使 mtime 更旧）。
- `:61` `expect(all.map((note) => note.title)).toEqual(['界面阻抗', '循环稳定性'])`（完整序：标题命中先于正文命中；对应打分 50 > 10，`cslab-vault-index.ts:582-586`）。

## 4. 未覆盖与脆弱点

- 未覆盖：同分（score 相同）时的 `mtimeMs` 降序次级排序（`:577`）；空 query 退化路径（`:566-568`）；limit 边界（1-300 夹取）；标签/路径/出链命中分；`listVaultNotes`/`readVaultNote`/`getNoteBacklinks`/缓存复用/坏缓存回退（属源文件其余分支，见 `cslab-vault-index.ts.md` §9 缺口表）。
- 脆弱点：依赖文件名与 H1 一致的夹具构造（`界面阻抗.md` 的 stem 与 title 同为「界面阻抗」，`noteKeys` 双键重合，反链计数语义未区分）；断言用 `toEqual` 全序比较——若未来新增排序键（如稳定排序改动）会立即暴露（这是优点）。
- 无 mock：真实文件系统 + 真实 `createLab`/SQLite；`rebuildVaultIndex(..., {force:true})` 规避缓存复用干扰。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 个 test、3 条断言行号 | 已证实 | `apps/electron/src/main/lib/cslab/cslab-vault-index.test.ts:52-61` |
| 夹具构造（临时根/回拨 mtime/两篇笔记）与清理 | 已证实 | `:17-49` |
| 断言语义对应打分 50 vs 10 | 已证实 | test:58/61 + `cslab-vault-index.ts:582-586` |
| 运行结果 | 未知 | NOT_RUN |

## 6. 覆盖表

| 被测分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `searchVaultNotes` 标题>正文排序 + 截断 | §3 | test:52-61 | covered |
| 同分 mtime 次级排序/空 query/limit 夹取 | §4 | — | unknown（无断言） |
| `rebuildVaultIndex` 重建路径 | §3 | test:54（动作） | indirect |
| 实际运行 | §5 | — | unknown（NOT_RUN） |
