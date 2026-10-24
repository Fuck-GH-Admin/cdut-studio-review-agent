# T03 科研与项目事务｜A 批 T01–T05 候选模板质量意见

本批以 PR #251 `3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38` 为取证 HEAD，静态检查研究 MD、运行 TS，不主张校方制度现行或真实审核通过。

| ID | 名称 | MD F/M/R/SRC | TS F/M/R | M min>0 | dataCheck | 状态 |
|---|---|---|---|---:|---:|---|
| T03-T01 | 纵向科研项目申报、负责人资格和推荐审核 | 41/35/37/19 | 41/35/37 | 0 | 0 | 编号相符，政策待证 |
| T03-T02 | 纵向科研项目立项任务书与责任承担审核 | 41/23/35/21 | 41/23/35 | 0 | 0 | 编号相符，政策待证 |
| T03-T03 | 横向科研合同立项与研究合同内容审核 | 44/20/26/15 | 44/20/26 | 0 | 0 | 编号相符，政策待证 |
| T03-T04 | 科研项目预算调整申请与变更权限审核 | 40/23/39/18 | 40/23/39 | 0 | 0 | 编号相符，政策待证 |
| T03-T05 | 科研项目研究内容、成员、负责人及期限变更审核 | 40/25/31/19 | 40/25/31 | 0 | 0 | 编号相符，政策待证 |

## 各模板待完善事项

### T03-T01 纵向科研项目申报、负责人资格和推荐审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T03-T01.md) blob `84a3f2d0f83a2e831176dd3701b9b76035704210`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T03-T01.ts) blob `74587bd008a2809b1fc2ca267faf84ad9d609d26`；章节 15/15，字典 41/35/37/19，TS 编号 41/35/37。
- **P1/可执行材料定义待证**：35/35 槽 `minCount=0`，正数 0；科研申请书、经费项目、协议、签章审批件、结题成果的材料时序与持有人需按项目性质、主体及阶段划分，不得前置后生文件。
- **P1/P2 实质规则审查缺口**：manual 27、semantic 10、dataCheck 0；对机构资质、合同权限、经费预算、伦理与保密等条件只能在可信依据/权限后核验，语义描述不等于有权审核或签署。
- 编号映射：F=无；M=无；R=无；命名式字段需独立语义对应表。
- 文稿自陈待核：- **阶段依赖分层：** `M001/M002` 由 P0 公告源提供；`M003/M004` 从 P1 开始；`M005–M023` 按 P1–P4 真值条件取用；`M024` P2 后、`M025` P3、`M026` P4、`M027` P5、`M028/M029/M032` 仅对应 P6 ；- **G50/R02 的精确核验等级：`R02_CATALOG_VERIFIED_G50_ENTITY_OPEN`。** 本轮已在整合包中实读 R02 主目录与判重审查记录，并于第02节补了 T03-T02–T10、G06/G07/T02/T04/T07/S/T 的原始 ID→本 R 只读引用→不。
- 三种合成场景待执行：a 事实齐不构成项目/合同批准；b 条件文件缺、审批后件不前置；c 项目版本或合作主体冲突交有权机构。全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### T03-T02 纵向科研项目立项任务书与责任承担审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T03-T02.md) blob `866f1dded3998b73cdcd2af65ec18d6919a1a11d`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T03-T02.ts) blob `5e39ff72fd8f2169734b3599428fcae1ea6cc607`；章节 15/15，字典 41/23/35/21，TS 编号 41/23/35。
- **P1/可执行材料定义待证**：23/23 槽 `minCount=0`，正数 0；科研申请书、经费项目、协议、签章审批件、结题成果的材料时序与持有人需按项目性质、主体及阶段划分，不得前置后生文件。
- **P1/P2 实质规则审查缺口**：manual 34、semantic 1、dataCheck 0；对机构资质、合同权限、经费预算、伦理与保密等条件只能在可信依据/权限后核验，语义描述不等于有权审核或签署。
- 编号映射：F=无；M=无；R=无；命名式字段需独立语义对应表。
- 文稿自陈待核：- [ ] G50 原始 `catalog.json` 未取得，故只完成 R02 **目录层**去重，运行时逐项字段/能力碰撞待集成 Owner 读源码后确认；不增加模板、不伪造新 G50 ID。；/ GAP-01 / **仍未解决**。2017纵向管理办法官网目录可见，但网页本轮直开412且未取得正文/废止链；已复核2024校规第13条冲突优先及2025专项第2/37条。[SRC-003][SRC-004][SRC-009] / 科发院取得2017原件、2018补充规定及后续修废清单，逐条标。
- 三种合成场景待执行：a 事实齐不构成项目/合同批准；b 条件文件缺、审批后件不前置；c 项目版本或合作主体冲突交有权机构。全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### T03-T03 横向科研合同立项与研究合同内容审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T03-T03.md) blob `1fb74a33e173f54e73866ad7d30a010daaecea3f`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T03-T03.ts) blob `baf8153e948373d720fbbae75faaa49516af95e7`；章节 15/15，字典 44/20/26/15，TS 编号 44/20/26。
- **P1/可执行材料定义待证**：20/20 槽 `minCount=0`，正数 0；科研申请书、经费项目、协议、签章审批件、结题成果的材料时序与持有人需按项目性质、主体及阶段划分，不得前置后生文件。
- **P1/P2 实质规则审查缺口**：manual 22、semantic 4、dataCheck 0；对机构资质、合同权限、经费预算、伦理与保密等条件只能在可信依据/权限后核验，语义描述不等于有权审核或签署。
- 编号映射：F=无；M=无；R=无；命名式字段需独立语义对应表。
- 文稿自陈待核：未抽取明确自检条目，校方适用政策和授权需外部确认。
- 三种合成场景待执行：a 事实齐不构成项目/合同批准；b 条件文件缺、审批后件不前置；c 项目版本或合作主体冲突交有权机构。全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### T03-T04 科研项目预算调整申请与变更权限审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T03-T04.md) blob `4ef79273ed63d0ff8c2b21957026687320978311`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T03-T04.ts) blob `307b87e7cfd2ea885fa6319de1ba37a2d384d056`；章节 15/15，字典 40/23/39/18，TS 编号 40/23/39。
- **P1/可执行材料定义待证**：23/23 槽 `minCount=0`，正数 0；科研申请书、经费项目、协议、签章审批件、结题成果的材料时序与持有人需按项目性质、主体及阶段划分，不得前置后生文件。
- **P1/P2 实质规则审查缺口**：manual 33、semantic 6、dataCheck 0；对机构资质、合同权限、经费预算、伦理与保密等条件只能在可信依据/权限后核验，语义描述不等于有权审核或签署。
- 编号映射：F=无；M=无；R=无；命名式字段需独立语义对应表。
- 文稿自陈待核：**本轮不提出**。当前证据支持在同一 `T03-T04` 中以多资金类别和项目层级表达预算调整权限分流；“结余经费”“政府采购预算调整”是否构成另有独立授权目的尚缺原始规定全文与 G50 对照。待核后若确有不可合并的独立决定，才提交 `CATALOG-CHANGE-REQUEST`，**不改动本 ；/ `R034–R039` 2026 资金版次与权链 / R034 设备间接费联动在 S2/S5 分期；R035/036 国/省社科预算制/包干制互斥；R037 四川科技 2025/2026 条文未完整证实时只能政策待核；R038 签发 S4+，R039 补充协议 S4/S5 后才形成 / SRC-。
- 三种合成场景待执行：a 事实齐不构成项目/合同批准；b 条件文件缺、审批后件不前置；c 项目版本或合作主体冲突交有权机构。全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

### T03-T05 科研项目研究内容、成员、负责人及期限变更审核

- [研究 MD](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/docs/design/review-agent/business-templates/R02/T03-T05.md) blob `d23ab223b5bbb7d21cfe3da721854c1672d38283`；[TS](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/blob/3b5dd22f15280a1a9cf1ea53e9861b5ac16c7e38/apps/electron/src/main/lib/review/r02-template-catalog/definitions/T03-T05.ts) blob `add22610e25fc615fe390fea906a17552213212d`；章节 15/15，字典 40/25/31/19，TS 编号 40/25/31。
- **P1/可执行材料定义待证**：25/25 槽 `minCount=0`，正数 0；科研申请书、经费项目、协议、签章审批件、结题成果的材料时序与持有人需按项目性质、主体及阶段划分，不得前置后生文件。
- **P1/P2 实质规则审查缺口**：manual 30、semantic 1、dataCheck 0；对机构资质、合同权限、经费预算、伦理与保密等条件只能在可信依据/权限后核验，语义描述不等于有权审核或签署。
- 编号映射：F=无；M=无；R=无；命名式字段需独立语义对应表。
- 文稿自陈待核：- [ ] **第 1 轮历史缺口**：2021 校社科管理办法全文附件、2025 国基金表单字节尚未核；当时 G50/R02 对照文件未取得。第四轮仅补回 R02 两份总账，另外两附件仍缺。；- [ ] **第 2 轮历史缺口**：当时 R02 两份总账与 G50 `catalog.json` 原文件不可得；第四轮**已补回两份 R02 总账**，G50 原 JSON 本轮仍未独立取回，邻接业务对象可按原 R02 目录核对，但当前 DTO 去重仍待代码集成验证。。
- 三种合成场景待执行：a 事实齐不构成项目/合同批准；b 条件文件缺、审批后件不前置；c 项目版本或合作主体冲突交有权机构。全部 `NOT_EXECUTED`。
- 状态：`quality=PENDING_DEEP_REVIEW; policy=PARTIAL/UNCONFIRMED; definition=PARTIAL; runnable=UNVERIFIED`。

本批意见仅限模板质量，并未改写科研审批/伦理/涉密入口。
