# NB-111 独立复核报告（QA：docs-r07-qa-nb-47-20261023）

- 冻结 `05fb2565e20eb1760233696be1832f68196b37c2`（HEAD 核、clean）；scope 17 文件/3830 行（p08-renderer-ui · p08.components-browser-tabs）
- 交付：`deliveries/nb-111/`（seal_delivery.py/1 v2，sealId `seal-ada60ff3b8804649`）；作者 `docs-r07-author-nb-47-20261023`（二次再平衡新增任务批，旧 nb30 线移交）
- 复核基线：QA 独立预读 `reviews/nb-111/SOURCE-CHECKLIST.md`（17 文件全读，跨轮草稿续写；TabBar 1427 三段）；本轮 17 篇手册全文比对
- **批次判定：revision_required（15 accepted / 2 revision_required / 0 unknown）**——15 篇按 exact hash 合入；2 篇退回 `nb-111-r1`
- 测试/typecheck/build/GUI **NOT_RUN**

## G0 完整性（PASS）

17/17 源绑定 == MANIFEST == SCOPE 独立重算全等；17/17 `manualSha256` == stage；DONE 三哈希链自洽；ZIP `R07-nb-111-05fb2565.zip` 20 条目（不含 READY/DONE 属 v2）无穿越/0 mismatch；人工列 17/17。

## G1 结构（PASS）

17 篇章节齐全；6 用例一致（topbar-layout.test）；三分+NOT_RUN 17/17。

## G2 源码真实性（15 PASS / 2 返修）

**正面确认（定点回源属实）**：topbar-layout「`resolveTopBarGeometry`/`resolveTopBarDragRightInset`/`TopBarGeometry` 无生产消费者（仅测试）」grep 全树属实；`TabBar`「AppShell:14 死导入（从未渲染）」属实；**十大契约注释锚点全回源**（整数几何 40/37/offset=1+110% zoom、拖拽层让位操作胶囊、重命名互斥防 onBlur 双提交、禁 useDeferredValue、浏览器只读推送不建组、组合拖拽轴向判定、压缩迟滞 16px 防振荡、draft 自动收起四禁、Ctrl=物理 Control、主进程拓扑唯一源）；死导出类否定照实记录（wechatConnected/yanhuActiveTabId/petRequestId 0 消费、tabs/index 死桶）。

**返修 2 篇（均差一型计数）**：

| id | 对象 | 摘要 |
| --- | --- | --- |
| F-01 | topbar-layout.ts.md | 「导出 7 条」实 **8**（自列 8 位置） |
| F-02 | yanhu-pet-atoms.ts.md | 「导出 10 条」实 **11**（自列 11：DEFAULT_PET_CONFIG+10 原子） |

非阻断：M-01 正面确认（两处深水否定+十契约锚点）；M-02 诚实降级合规（「头+大纲级」标注）。

## 合入绑定

- **acceptedHashes（15）**：TabBar/MainArea/TabBarItem/TabContent/TabErrorBoundary/TabGroupItem/TabPreviewPanel/TabSwitcher/index/UserAvatar/EmptyPanePlaceholder/topbar-layout.test + user-profile/wechat/yanhu-express 原子。
- **rejectedHashes（2）**：topbar-layout.ts.md / yanhu-pet-atoms.ts.md；`nb-111-r1` 修订后按新 hash 复验。
- 未写 deliveries/inventory/manager/candidate/全局账；预读产物原样保留。
