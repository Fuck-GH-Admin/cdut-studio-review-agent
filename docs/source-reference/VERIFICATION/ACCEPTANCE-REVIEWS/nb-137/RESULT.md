# NB-137 独立 QA 复核报告（RESULT.md）

- 批次：nb-137（p01-app-shell · 构建/打包脚本，18 文件 / 1923 行）
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`（只读）｜作者：docs-r07-author-extra-03-20261024 ｜ QA：docs-r07-qa-extra-03-20261024
- 封版：sealId `seal-212b490607ef8758`（2026-10-23T20:19:23Z）；ZIP `93574B/21 条目`
- 复核时间：2026-10-23T21:10Z
- **batchVerdict：accepted（18/18；G0/G1/G2 PASS；2 条 minor 非阻断待勘误）**

## 判定摘要

18 篇手册逐篇真值审查通过：预读 Q1-Q9 核查点**全部如实处置**，且作者有更深发现（插件子系统 5 模块在冻结树整体缺失、claude-agent-sdk 未登记、memory-archive-backup 路径根与应用权威根不一致）——3 项强声明回源**全部实锤**。9 组行号/符号抽验全中。仅 2 条 minor 引用毛刺（非阻断，errata 关闭）。

## G0（PASS）

MANIFEST `93885734…`/READY/ZIP 三方哈希重算全对；manualSha256 18/18 四方一致；18/18 源绑定==manager scope；front matter 齐全。

## G1（PASS）

- UNVERIFIED 自报 5 组实现差异 + 8 组否定检索范围，逐项回源成立。
- **强声明复验**：`plugin-manager/plugin-permissions/plugin-requests/plugin-view-manager/plugin-agent-tools` 5 模块冻结树 find 0 命中；`@anthropic-ai/claude-agent-sdk` 在 apps/electron/package.json、bun.lock、根 package.json 均 0 命中；`examples/` 目录不存在；memory-archive-backup.mjs:42 硬编码 `~/.profer` vs config-paths `~/.cdutai[-dev]`/PROFER_CONFIG_DIR（:58-59,:522-524）+ :68-71 明示不迁移 ~/.profer——全部属实。
- COVERAGE.tsv 备注完整（18/18，min 29 字符）。

## G2（PASS + 2 minor）

- 抽验 9/9 全中：channel-manager.ts:530 createChannel、main-window-state.ts:9 setMainWindow、template-store.ts:253/365-367/386、SettingsDialog.tsx:38-43、SettingsPanel.tsx:238-245、after-pack.cjs 5 锚点、pnpm-lock.yaml 存在、packaging-guards 19 用例计数。
- 预读核查点处置：Q1 probe 注释 Pi 0.84.2 vs 锁 0.86.1（含 CHANGELOG:361 佐证）✓；Q2 set-exe-icon 零调用+after-pack 并行实现+LegalCopyright 口径差 ✓；Q3 plugin-smoke fixture 缺失+cwd 敏感 ✓；Q6 packaging-host 仅 win 门禁 ✓；Q7 packaging-guards :242 非 darwin 跳过 ✓；Q9 revisionArg 双义 ✓。

### 非阻断 findings（errata 关闭）

| id | 对象 | 问题 | 实测 |
|---|---|---|---|
| NB137-N-01 | sign-update-metadata.cjs.md §4 | verifier.verify 失败 throw 引 :29-31 | 实 :33-34（+2~3 漂移） |
| NB137-N-02 | memory-archive-backup.mjs.md §6 | 引用 :178 | 74 行文件无此行（疑串稿残留） |

## NOT_RUN

产品测试（packaging-guards 19 / package-closure 4 / settings-macos 4 用例声明）、typecheck、build、Electron/GUI、真实打包/签名/公证/CLI 探针、bun install。两冒烟脚本因插件子系统缺失**本基线不可运行**（已如实记录，非 NOT_RUN 掩盖）。

## 合入

lead 按 `reviews/nb-137/REVIEWED-HASHES.json` acceptedHashes（18 篇）合入；N-01/N-02 随下次勘误一次编辑性关闭。
