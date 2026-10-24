# NB-123 独立真值审查报告（RESULT）— p08-renderer-ui · p08.renderer-lib

- 审查者：`docs-r07-qa-extra-02-20261024`｜作者：`docs-r07-author-extra-02-20261024`
- 冻结：`05fb2565e20eb1760233696be1832f68196b37c2`｜seal：`seal-a5a2b013540e425d`
- **batchVerdict：revision_required**（18/18 手册内容 accepted；阻断仅 NB123-B-01 链归属错标；errata N-01 汇总计数）
- 证据：`reviews/nb-123/{SOURCE-CHECKLIST,PRE_READ_DONE}`（独立整读 18 文件 1871 行、绑定 0 差异、S1-S5 预读发现）。

## 一、G0

机械面全对：scope 18/18、三方 hash、ZIP↔磁盘逐字节、绑定 0 差异、counts 1871 对齐。**D0 链归属 FAIL**：author/reviewer=nb-07 旧会话（B-01，本组第 4 批同病）。

## 二、G1

自查 3 差异（措辞/区间端点×2）+2 备注全部修正在先（4 篇改 14 篇不动），test.each 口径明示（声明 8/运行态 12）。**N-01**：汇总"41 声明"应为 **45**（5+10+7+3+6+8+5+1；运行态 49）——逐篇计数全对、仅 UNVERIFIED 汇总错，errata 关闭。

## 三、G2

- **18/18 accepted**：行为/分支/失败恢复/测试断言逐项对源命中；预读 S1-S5 怪癖**全部已收录**（tips 非 mac 落 windows、_currentTaskId 弃用、edges 反向约定、display win 原样、tab-activation typeof 守卫/吞错）；"task-graph-events 无生产调用点"经 QA 独立全树 grep 复核成立（孪生 task-graph-event-converter.ts 系独立实现，手册已标注并给同步契约）；避让算术（1152/512/608）、区间端点、29 条 Tips 分布（12/12/5）均自洽。
- QA 勘误 NB123-R-01：预读曾记 shortcut-registry.test「7 用例」实为 10（作者正确）。

## 四、findings

| id | 级别 | 摘要 | 处置 |
| --- | --- | --- | --- |
| NB123-B-01 | **blocking** | D0 链 author/reviewer 错标 nb-07 旧会话 | nb-123-r1 重封+SUPERSEDED-BY |
| NB123-N-01 | minor | UNVERIFIED 汇总计数 41→45（/49 运行态） | errata，最终关闭 |
| NB123-R-01 | info | QA 预读用例数勘误 7→10 | 留档 |

## 五、边界（NOT_RUN）

产品测试/typecheck/build/Electron-GUI/真实渲染交互/真实模型 **NOT_RUN**。只读复核，未改作者正文/源码/candidate/全局总账/旧 seal。
