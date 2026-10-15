# E2 G04-T08｜独立交叉验收判定

冻结G04 E1 SHA：f9d66e46c686f8176a8907b9c1b493bed089474f1d893c82c3822a02dd82b9c9。E0 B/C/D归档SHA见 E0-input-manifest.json。完整内容/模拟源已在E1签章后检查。公开版不包含Gold答案或受控底账。

- 业务：校园机动车长期通行资格审核
- E2阶段结果：PARTIAL
- sourceValidity：PARTIAL（校本适用核心流程仍有未核）。
- templateFidelity：PARTIAL。
- goldValidity：PARTIAL（结构与关键设计挑战抽核；未逐案独立复算全部Gold，且多数为模拟政策）。
- crossTemplate：留待E3域级结论。
- provenanceIntegrity：BLOCKED_INPUT（作者提交原Git快照缺失，已有Library ZIP固定字节摘要）。
- technicalTemplateRuntime：NOT_RUN。
- onlineModelAccuracy：NOT_RUN。
- administrativeAuthority：NOT_VERIFIED。

## 核心复核事实
C将2022费额和2026校本未知分开，D至少有2026政策未知反例且存在审批后白名单条件

## 独立E1/官方原文与追踪
见 E1-official-fact-register.md、E2-duty-crosswalk.csv；B使用相应TXX v0.2归档中的04来源登记/03候选规则，C来自该TXX v0.1归档业务母版，D来自独立EVALUATION_ONLY分包。本报告不复制隐藏Gold值。

## 进入完整复验所需输入
取得2026车证具体政策和宜宾/成都不同规则，核权威道闸状态。
