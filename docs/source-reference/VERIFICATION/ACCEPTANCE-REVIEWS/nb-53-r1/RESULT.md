# nb-53-r1 独立复验结果（QA：docs-r07-qa-nb-01-20261023）

- 批次：`nb-53-r1`（revisionOf `nb-53`，T5，18 文件 / 8538 行）
- 冻结 SHA：`05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核对、clean）
- 交付：`deliveries/nb-53-r1/`（sealId `seal-3f748e7210bdfec7`，`seal_delivery.py/1` / SEAL-DELIVERY **v2**）
- 父版本：`deliveries/nb-53/`（sealId `seal-515c37796ad2ed5b`，**未改动**，保留）
- 复验时间：2026-10-24T01:10:00Z
- **NOT_RUN**：产品测试 / typecheck / build / Electron-GUI / 真实模型 / 并发与故障注入

## 总判定

| 门 | 结论 |
| --- | --- |
| G0 完整性 | **PASS** |
| G1 结构与可读性 | **PASS** |
| G2 源码真实性 | **PASS** |
| 批次判定 | **accepted**（18 accepted / 0 revision_required / 0 unknown） |

## G0

- 18/18 源绑定与父批**逐字段一致**（源未变）；18/18 manualSha256 = stage = READY.`manualHashes`。
- **字节差异核**：与父批逐篇比对，**恰 5 篇字节不同**（= 父批被拒 5 篇），其余 13 篇与父批 accepted **逐字节相同**——符合「已 seal 不改」。
- ZIP `R07-nb-53-r1-05fb2565.zip` = `c4c827476438…`（64111 B / 21 条目，v2 布局不含 READY/DONE）；逐条目 0 mismatch、无穿越/符号链接、mtime 全 1980-01-01；哈希链自绑。

## G1/G2：F-01..F-06 修复复验（全部 resolved）

| # | 手册 | 修复内容 | 复验 |
| --- | --- | --- | --- |
| F-01 | `pi-agent-proxy.test.ts.md` | **全量重写**：§2 12 条声明逐条对应绑定源码真实断言，杜撰内容（`:7890`/`ALL_PROXY`/`noProxy` 数组/`socksProxy`/禁用重试三组）全部移除，`applyPiProxySettingsForQuery`/SOCKS 移入未覆盖 | 断言与 `:11,21,32,39,43,47,55,62,75,95,108,119` 逐条一致 |
| F-02 | 同上 | 计数改「12 条声明 = 11 `test(` + 1 `test.each`(3 providers)」 | = 源码 |
| F-03 | `pi-agent-adapter.ts.md` | 计数改「**42 条 export 语句 = 3 re-export + 3 接口 + 1 类 + 35 函数 + 2 常量（符号级 44）**」 | = QA 独立计数；`:48/:171,290,1584/:2531/:948,1103` 逐条对 |
| F-04 | `pi-codex-title-generator.ts.md` | 计数改「4 接口 + 4 函数 = 8」 | = 源码（`:28,37,45,52` + `:70,85,95,141`） |
| F-05 | `pi-codex-fast-mode.test.ts.md` | 计数改「16 条声明 = 13 `test(` + 3 `test.each(`（`:6,39,82`）」 | = 源码，行号清单逐条一致 |
| F-06 | `pi-builtin-tools.test.ts.md` | 计数改「共 32 个 `test(`」 | = 源码 32 |

修复仅限被指问题，未引入新错误声明。FINDINGS-RESPONSE 的 before/after 哈希与 QA 实算一致（F-01：`7ce6b709…`→`293c7070…`）。

## 残留非阻断（2 条，字节未变沿用父批 accepted）

| # | 手册 | 问题（内容正确，仅行号） |
| --- | --- | --- |
| N-01 | `pi-harness-lifecycle.test.ts.md` | 用例行号 `:5,21,31` → `:5,11,21`；证据 `:48-50`→`:16-18`、`:33`→`:22` |
| N-02 | `pi-harness-lifecycle.ts.md` | 证据 `:73-85` → `:26-42` |

## exact acceptedHashes（18）

见 `REVIEWED-HASHES.json.acceptedHashes`。**13 篇 hash 与父批 accepted 相同**（字节未变，按 QUALITY-GATES 子批 QA 仍记录同一 hash），5 篇为 r1 新 hash。`rejectedHashes` 为空。

## 边界

未运行产品测试/typecheck/build/GUI/真实模型（NOT_RUN）；未改源码、作者正文、candidate、全局总账；父批交付字节未动；未 commit/push。
