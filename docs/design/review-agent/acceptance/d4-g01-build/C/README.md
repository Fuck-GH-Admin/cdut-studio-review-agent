# G01-C｜特殊校园卡资格审核 D4 模块化候选

固定技术代码：`a7a6a11d4840ad64cfc858c17b35f35180adf063`（COMMON-01/02，Draft PR #88）。

原件：`docs/design/review-agent/business-templates/G01/originals/special_campus_card_template_v1.4.md`；SHA-256：`fa409cfa30ad0f0c624784f9beab4799cc1e31bbcf3d118c0e41a67deba8937f`。原文完整收录、未修改。技术作者态为 `workspace.json`，逐项来源和覆盖在 `source-catalog.json` / `coverage-ledger.json`；双对象、互斥场景、附加三值条件示例在 `selection.json`。

本目录只提供 D1 v1 原生 JSON、D3 组合作者态和 D2 运行选项，来源被分为业务请求级技术检查和未核制度候选。**不得把来源 `content-checked` 认定为成都理工校规已获授权。**

关键业务：family、temporary-service 互斥对象场景；deceased、retired、multi-generation、secondment、department-employed、labor-dispatch、long-service、proxy 逐对象可叠加条件。所有来源行及非编号说明都有独立反向定位；条件触发的实质判断保留在原文语义 Check 内，不冒充已硬编码的行政结果。

本文件生成时未执行 Bun 运行，后续 CI 结果以锁定 workflow/HEAD 为准。正式学校数据、权限、Gold 和在线模型准确率均不在本阶段认证。
