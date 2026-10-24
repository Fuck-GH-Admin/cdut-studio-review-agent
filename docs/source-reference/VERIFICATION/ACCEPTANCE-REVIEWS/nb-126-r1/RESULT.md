# nb-126-r1 返修复核报告（RESULT.md）

- **批次**：nb-126-r1（revisionOf nb-126；9 文件/729 行）｜ **结论：`accepted`（9/9）**
- **封版**：sealId `seal-19f87a8a96bf168f` @2026-10-23T20:18:32Z ｜ 复核：docs-r07-qa-extra-05-20261024

## 复验内容（对应 reviews/nb-126 F-1..F-5）

| finding | 修正 | 复验 |
| --- | --- | --- |
| F-1 计数 8≠6 | §10→「2 导出 + 6 内部符号」 | ✓ 回源属实（:6/8/19/27/42/66） |
| F-2 计数 10≠9 | §4→「9 处调用」 | ✓ 实测 9 调用（§8 总数 14 保持正确） |
| F-3 转述≠instanceof | 改源码原式 `error instanceof Error ? error.message : '创建失败'` | ✓ |
| F-4 转述≠instanceof | 改源码原式 `… : String(error)` | ✓ |
| F-5 resize 公式缺 !transitioning | 补实际公式+注明注释简写差异 | ✓ `ready && !transitioning` |

## 字节核验

- 5 篇修订 after-hash = FINDINGS-RESPONSE = READY.manualHashes = stage 实测（双向一致）。
- 4 篇 accepted（useScrollSpy/useSyncActiveTabSideEffects/useTocHeadings/cslab-crystallography.worker）manualSha256 与父版**逐字节相同**，沿用原 accepted（合规应用"旧接受不套新字节"）。
- G0：MANIFEST→READY→DONE→ZIP 链复算全对、sealId 复算一致、ZIP 12 条目合规。

## 边界

NOT_RUN：产品测试/typecheck/构建/GUI/真实 worker/模型网络。复核仅覆盖 F-1..F-5 修正与 4 篇不变性；父版 G2 结论（reviews/nb-126）在未变字节上继续有效。
