# NB-99 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 17 文件/8510 行（p08-renderer-ui · p08.cdut-science-ui）
- 交付：`deliveries/nb-99/`（seal_delivery.py/1 v2，sealId `seal-247a39d912d52328`）；作者 `docs-r07-author-nb-47-20261023`
- 复核基线：QA 独立预读 `reviews/nb-99/SOURCE-CHECKLIST.md`（17 文件全读，跨 4 轮草稿续写；WorkspaceView 2660 三段）；本轮 17 篇手册全文比对
- **批次判定：accepted（17 accepted / 0 revision_required / 0 unknown）**——17 篇按 exact hash 全量合入
- 测试/typecheck/build/GUI **NOT_RUN**（0 测试文件属该批实情）

## G0 完整性（PASS）

17/17 源绑定 == MANIFEST == SCOPE 独立重算全等；17/17 `manualSha256` == stage；DONE 三哈希链自洽；ZIP `R07-nb-99-05fb2565.zip` 20 条目（不含 READY/DONE 属 v2）无穿越/0 mismatch；人工列 17/17。

## G1 结构（PASS）

17 篇章节齐全；三分+NOT_RUN 17/17；「0 测试」如实标注未编造。

## G2 源码真实性（PASS，17/17）

**20+ 契约锚点全回源为真**：SlideDrawer 宽度三重帽+渲染期 clamp 不回写；ReviewMarginalia 性能红线三条（transform-only/shared 纯函数/先淡出后卸载）；StagePane「资产拖不抢单元格拖」；ToolsPanel 真实扫描如实+会话绑定唯一注入（禁全局 activeLabId）；PdfViewer 评审加固三点（11.3 Worker 降级 fake worker/11.4 四向仿射/11.6 ±1 缓冲释放+page.cleanup）；PlotDigitizer 三点标定+shared 纯几何吸附+缺包一键装；PreparationView 零硬编码（lab.manifest.json 真实沙箱）；SciAgentWindow 预填不自动发送；SpectrumStrip 只画线不拟合+量纲红线三条；RunTimeline 5 态+50 步/参数帽；StageGrid 四 pane 恒挂载不毁编辑器；ZoteroPanel **AVAILABILITY_LABEL 四态（:19-24，sed 核实 4 键）**+绝不写 zotero.sqlite；RenameLab 仅改展示名+拼音 IME 守卫。导出计数 17 篇全对（各「导出 1 条」与源一致）。

非阻断：M-01 契约确认；M-02 诚实降级合规+批外依赖 15+ 已限定。

## 合入绑定

- **acceptedHashes（17）**：全量。见 `RESULT.json`/`REVIEWED-HASHES.json`。
- 无 rejectedHashes；无返修。未写 deliveries/inventory/manager/candidate/全局账；预读产物原样保留。
