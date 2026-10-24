# NB-38 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 18 文件/1672 行（p07-ui · p07.primitives，`packages/ui/src/primitives/`）
- 交付：`deliveries/nb-38/`（seal_delivery.py/1 v2，sealId `seal-0022ecc86492c439`，sealedAt 2026-10-23T17:02:48Z）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-38/SOURCE-CHECKLIST.md`（18 文件全读 + 全树消费矩阵/可达性检索）；本轮 18 篇手册全文比对
- **批次判定：accepted（18 accepted / 0 revision_required / 0 unknown）**——18 篇按 exact hash 合入
- 测试/GUI/渲染 **NOT_RUN**（批内 0 测试文件）

## G0 完整性（PASS）

18/18 源绑定（blob=git ls-tree HEAD/sha256/行数）== MANIFEST == SCOPE 独立重算全等；18/18 `manualSha256` == stage 字节；DONE 三哈希链自洽；ZIP `R07-nb-38-05fb2565.zip` 21 条目（18 手册+MANIFEST+2 mechanical TSV，不含 READY/DONE 属 v2）无穿越/0 mismatch；人工证据列 18/18 非空；交付 SCOPE=manager SCOPE；元数据头 11 键 18/18。

## G1 结构（PASS）

18 篇章节齐全（薄包装按精简口径合规）；导出清单与源逐条吻合（3/2/2/3/9/1/15/10/15/1/1/1/1/4/2/10/1/10）；三分+NOT_RUN 18/18；无编造测试覆盖（批内 0 测试，手册一致如实）。

## G2 源码真实性（18/18 PASS）

1. **负面事实全部照实记录且经独立复核为真**：`command.tsx` 生产不可达（0 消费者/无 barrel/符号级核，潜在死代码）；`SettingsDialog.tsx:10` 绕过 dialog 封装直引 radix（现存观察）；批内无组件测试（`ui-workspace-contract.test.ts:32` 仅路径契约字符串，手册正确区分）。
2. **消费者计数全对账**：button 116+包内 2=118、input 21+1=22、popover 18+1=19、dialog 40+command=41、select 14（我初测 15 中 `session-core/index.ts:51` 为同名 `./select` 误报，核实后一致）、其余 1-7 各件吻合。
3. **行为件细节逐点回源**：confirm-dialog loading 阻关守卫/描述合并/loading 文案；image-lightbox 空 src 短路、`reset(1)` 随 [open,src]、背景点击仅 e.target===currentTarget、sr-only 无障碍、onSave 可选；loading-indicator 数字/true/false 三分支计时语义、100ms interval+cleanup、≥1s 显时；sheet Windows 右侧 `shouldHideClose = hideClose || (side==='right' && isWindows)`（:66-69 实测逐字吻合）；cva 变体族与 Radix 转发族结构（6 转发+9 样式化×2、Z_LAYER.menu/dialog/lightbox 归属）全对。
4. **诚实标注**：spinner/use-smooth-zoom/alert-dialog 等批外实现标 unknown（属他批）；Slot 渲染语义标推断；GUI 行为标未实测。

## 发现

| id | 级别 | 对象 | 摘要 | 处置 |
| --- | --- | --- | --- | --- |
| N-01 | non_blocking | loading-indicator.tsx.md | 可选：补记源 JSDoc「3x3 点阵纯 CSS」描述的是 Spinner 行为（注释-实现归属差异） | rN 可选 |
| N-02 | non_blocking | button.tsx.md | 行号 ±1-2 漂移 | 可不修 |
| M-01 | info | — | 负面事实+行为细节+计数全对账（正面确认） | 记录 |
| M-02 | info | — | 批内 0 测试；GUI/渲染 NOT_RUN | 记录 |

## 合入绑定

- **acceptedHashes（18）**：全部手册现字节 `manualSha256`，见 `RESULT.json`/`REVIEWED-HASHES.json`（rejectedHashes 空）。
- 未写 deliveries/inventory/manager/candidate/全局 FILES/COVERAGE/MANIFEST/INDEX；旧预读产物原样保留。
