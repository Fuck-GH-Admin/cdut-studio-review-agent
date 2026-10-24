# 真实主链路交付附记（2026-10-05，针对第二轮复查）

> 基线：8330e313，shared 0.1.61 / electron 0.15.136。门禁：**3062 pass / 5 skip / 0 fail，typecheck 0**。

## 复查 §5 各项处置（本轮 goal）

| 复查项 | 处置 | 提交 |
| --- | --- | --- |
| §5.1 RUN_REVIEW_V2 未接通/执行器空转 | RUN_REVIEW_V2 四层接通；v2-executor-factory 装配 11 节点（extract/summarize 输入含字段/规则/材料文本，complete 结果 extractJson→引用校验/规则白名单过滤；check 确定性引擎；OCR 见下）；未配置渠道明确报错 | 8590d0f1 |
| §5.1 OCR 无实现 | TesseractOcrPort（动态依赖探测/语言包/worker 三重检查，缺失如实 available=false；words→OcrBlock 矩形+置信度） | 782d8546 |
| §5.2 校验未接入口 | updateFields IPC 自动载当前模板 + validateFieldValuesV2（前轮 a1cf7a0a）；作用域默认值已统一为 case | 前轮+本轮 |
| §5.3 补件不足/申诉 | insufficient 可再回复并计入门控（cancelled 才豁免）；申诉 resolution 闭环（upheld/overturned/decided；更正 actor=复核人、finality=final） | 51ee40db + 80278dc1 |
| §5.4 评分轮次/量表 | 唯一票键含 round；聚合按轮次过滤 | 51ee40db |
| §5.5 离线冲突/附件 | （前轮 F 修复后）本轮补 pushViaOutbox 发送前落盘 pending + recoverPendingPushes 扫描 | 8330e313 |
| §5.6 投影共用 | ownRating 取 ratings；student/judge 投影剥除 decision.reason | 567bb257 |
| §5.7 模板不能使用 | 已发布模板下拉→动态字段表单→建案（替换硬编码） | 67310086 |
| §5.8 批次无启动 | RUN_BATCH_V2 + 执行队列按钮（网关执行器注入 runBatchQueue；全 done 才显定稿） | 67310086 |
| §5.9 槽位/附件 | 提交按 minCount 逐槽门控；版本链=同槽位+同名；面板槽位下拉/文件列表/补件回复说明+附件勾选 | dcf41e39 |

## 诚实边界（仍需实测）

1. Pi 真实渠道的完整点击旅程（选择模板→登记→提交→运行→产物质量）需 QA 在配置渠道后实测
2. OCR 识别质量需真实图文材料 + 随包语言资源实测（适配器结构/降级路径已就绪并测试）
3. 目标机安装、S 类校方联调不变
