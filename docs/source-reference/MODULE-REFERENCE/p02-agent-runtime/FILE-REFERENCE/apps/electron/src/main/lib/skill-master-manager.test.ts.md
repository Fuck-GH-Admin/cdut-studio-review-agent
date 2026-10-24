---
path: apps/electron/src/main/lib/skill-master-manager.test.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: d6de619fe1cc0d7b509969c697adadac9ea63dc8
sha256: 43531db1d7087bb66c89213a53f908abea8c7f8f4ee27674629f3cdc8acabf3a
lines: 178
kind: test
package: p02-agent-runtime
author: docs-r07-author-nb-47-20261023
reviewer: p02-agent-runtime
status: authored
evidence: static
---

# apps/electron/src/main/lib/skill-master-manager.test.ts

## 1. 测试目标

元 Skill 库 CRUD/版本/回滚/同步/冲突/迁移。不运行（`NOT_RUN`）。

## 2. 用例清单

11 用例（:64-:163），1 describe（:63）：
1. 列出+读取元数据内容（:64-69）。
2. CRLF+引号 description 解析（:71-81）。
3. 保存版本 patch+1+历史快照（:83-91）。
4. renameMasterSkillMeta 只改 frontmatter（:93-99）。
5. 回退快照+追加新快照（:101-110）。
6. 原样再同步无冲突（:112-119）。
7. 副本改动后非 force 同步拒覆盖（:121-131）。
8. force 覆盖同步（:133-140）。
9. 批量同步冲突保留其余覆盖（:142-151）。
10. syncedWorkspaceCount 一次扫描统计（:153-161）。
11. 历史 Coach slug 迁移同步（:163-176）。

## 3. 真实断言

各用例 toBe/toEqual 级（版本号/内容/冲突判定/计数）。

## 4. 未覆盖与脆弱点

注意：13 个 export（含本测试测的写/同步 API）**仅测试使用**——生产 IPC 写通道已 throw 停用（见姊妹手册 §4）；测试覆盖的是「已停用但保留的实现层」。mock 边界：`__setSkillMasterRoots` 测试钩子注入 tmp。`NOT_RUN`。

## 5. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 11 用例/主题如 §2 | 已证实 | 逐行读 |
| 通过与否 | 未知（NOT_RUN） | — |

## 6. 覆盖表

| 被测能力 | 用例 | 状态 |
| --- | --- | --- |
| CRUD/版本/回滚/同步/冲突/迁移 | #1-#11 | covered |
| 生产 IPC 链（写已停用） | — | out-of-scope |
