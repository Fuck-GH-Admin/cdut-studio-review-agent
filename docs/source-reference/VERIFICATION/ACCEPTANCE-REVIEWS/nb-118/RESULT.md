# NB-118 独立真值审查报告（RESULT）— p08-renderer-ui · p08.renderer-lib

- 审查者：`docs-r07-qa-extra-02-20261024`｜作者：`docs-r07-author-extra-02-20261024`｜冻结 `05fb2565e20eb1760233696be1832f68196b37c2`｜seal `seal-75060440ee5e7fe9`
- **batchVerdict：revision_required**（18/18 手册内容 accepted；阻断 NB118-B-01 链归属错标；errata NB118-N-01 汇总计数）
- 证据：`reviews/nb-118/{SOURCE-CHECKLIST,PRE_READ_DONE}`（独立整读 18 文件 1775 行、绑定 0 差异、T1-T5）。

## 一、G0
机械面全对（scope 18/18、三方 hash、ZIP、绑定 0 差异、counts 1775 对齐）。**D0 链归属 FAIL**：author/reviewer=nb-09 旧会话（B-01，本组第 5 批同病）。

## 二、G1
自查 3 差异修正在先（3 篇改 15 篇不动）；覆盖缺口/边界诚实（跨批配对、域外模块、无测试声明均标注）。**N-01**：汇总"77"错误——逐篇计数（24/5/6/11/4/6/3）全对，批内合计 **59**（含批外间接 agent-running-indicator 3 则 62）；errata 关闭。

## 三、G2
**18/18 accepted**：预读 T1-T5 全部如实收录（beijing 测试批外+"17时"陷阱、projection 防复活语义、无测试声明、浏览器推送守卫/水合重试）；agent-session-list 24 用例分项与 QA 机械计数逐项一致；避让/水位/迟滞等算术自洽；跨批边界（channel-health SUT 在 nb-119）诚实标注。

## 四、findings

| id | 级别 | 摘要 | 处置 |
| --- | --- | --- | --- |
| NB118-B-01 | **blocking** | D0 链 author/reviewer 错标 nb-09 旧会话 | nb-118-r1 重封+SUPERSEDED-BY |
| NB118-N-01 | minor | UNVERIFIED 汇总计数 77→59（/62 含批外） | errata，最终关闭 |

## 五、边界（NOT_RUN）
产品测试/typecheck/build/Electron-GUI/真实渲染交互/真实模型 **NOT_RUN**。只读复核，未改作者正文/源码/candidate/全局总账/旧 seal。
