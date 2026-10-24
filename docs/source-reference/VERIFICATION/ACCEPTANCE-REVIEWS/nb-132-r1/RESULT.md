# nb-132-r1 返修复核报告（RESULT.md）

- **批次**：nb-132-r1（revisionOf nb-132；18 文件）｜ **结论：`accepted`（18/18）**
- **封版**：sealId `seal-1fa23608fdc044f2` @2026-10-23T20:22:51Z ｜ 复核：docs-r07-qa-extra-05-20261024

## 复验内容（对应 reviews/nb-132 F-1..F-3）

| finding | 修正 | 复验 |
| --- | --- | --- |
| F-1 计数 五段≠六条 | pi-task-prompt.ts.md 3 处→"六段裁剪" | ✓ 源码 6 次 prune（:98/:108/:111/:120/:146/:154）回源属实 |
| F-2 计数 五段 | pi-task-prompt.test.ts.md §6→"六段裁剪条件" | ✓ |
| F-3 过宽否定 | review-private-file-access.ts.md + UNVERIFIED.md：改"生产代码 0 调用（ipc.ts 仅 import :141）；批外 p04.test.ts:84 直接调用" | ✓ QA 指定 2 处+同源家族 5 处+TSV 3 处残留同步，逐处记录不隐去 |

## 字节核验

- 3 篇修订 before-hash=父版锚、after-hash=READY=stage 实测（双向一致）；UNVERIFIED/两 TSV 非 scope 锁定，随批修订见 changes.diff。
- 15 篇 accepted 与父版**逐字节相同**，沿用原 accepted（"旧接受不套新字节"合规）。
- G0：MANIFEST→READY→DONE→ZIP 链复算全对、sealId 复算一致、ZIP 21 条目合规。

## 边界

NOT_RUN：产品测试（40 批内+32 批外用例）/typecheck/构建/GUI/真实 LLM/网络/IPC。父版 G2 结论在 15 篇未变字节上继续有效。
