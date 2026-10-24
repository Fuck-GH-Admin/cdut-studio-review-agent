# NB-54-R1 返修复验报告（rN 独立验收）

- 批：nb-54-r1（revisionOf nb-54，18 文件/4241 行 pi-* 适配层）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`。
- 审验对象：`deliveries/nb-54-r1/`（sealId `seal-d3130401f8f6ec3f`）；reviewer `docs-r07-qa-nb-07-20261023`。
- **批次结论：accepted** —— **18 accepted / 0 revision_required / 0 unknown**。
- 测试/构建/真实模型/win32 实跑：本轮 **NOT_RUN**。

## G0 完整性：PASS
哈希链/ZIP 21 条目/源绑定 18/18/manualSha256 无 drift/人工列 18/18/元数据 18/18 全过。rN 证据链：
- before/stage 18/18 == 父批 r0 字节（sha256 实算）；
- changes.diff（空树全量创建式，18 触达）重放 **18/18 逐字节==stage**；
- **F-NB54-G0-01 闭合**：`pi-provider-compat.ts.md` 的 diff blob 行现为 `a35ba54bb7fb…`，==封版 stage==源 `git hash-object`（r0 时 diff 携过期 `9a2a46…`）；正文未动（before==after）。

## G1：PASS

## G2 返修复核：FULL（18/18）
10 篇变更逐篇复核，全部落实：
- **F-NB54-01**（message-adapter.ts.md）：导出 14、补 `isAssistantPiMessage:299`/`isAbortedAssistantMessage:303`/`dropTrailingAbortedAssistant:307`、`EMPTY_OUTPUT_ERROR_MESSAGE:312` 归入导出表（test:3 import 佐证）✓
- **F-NB54-02**（powershell-tool.test.ts.md）：13 调用点全列（补 never-closes 强制 settle+进程树、taskkill /T /F、DEFAULT=30、abort、非 Windows 门禁 5 例）✓
- **N-NB54-01..08** 计数 grep 校准：model-registry 16 / powershell-tool 9 / model-registry.test 51（48+3 each）/ retry-control 15 / retry-control.test 15 / prompt-chain.test 4 / payload-sanitizer 6 it / message-adapter.test 15 ✓
- 8 篇未变 == r0 accepted 字节 ✓；FINDINGS-RESPONSE 逐条 before/after sha256 对应，根因（读取截断臆补，同 nb-41 教训）如实记录 ✓

### 处置
**18 篇全量合入**（`reviews/nb-54-r1/REVIEWED-HASHES.json` exact manualSha256，**取代 r0 全部行**；r0 的 15A/3RQ 历史保留）。证据：`reviews/nb-54-r1/{RESULT.json,REVIEWED-HASHES.json,DONE.json}`。未改作者正文/源码/candidate/全局 FILES/MANIFEST/总账；NOT_RUN。
