# G04-T02｜旧版作者资产与本次证据差分

本轮为E-G04-GLOBAL-0003的定向证明材料，**原 D0–D4 与三个ZIP文件均不修改、不重打包**。

| 文件 | 字节 | 原SHA-256与E r01一致 |
|---|---:|---|
| INPUT_ONLY.zip | 9252964 | `a6108d5686326fc59b10fbb3a5a36d360a7afa3c4374d78ebaa5a444307a1b8c` |
| EVALUATION_ONLY.zip | 41925 | `c81d27287d7b13f2f5fcf4b6bbf225108fcc54461613b287b77dc21991f24e33` |
| D_REPORTS.zip | 39556 | `d93cdc4175c613c8b9bbc33f40947e235f4ba3b90547fb6c6ad6258b37529217` |
| 受控Gold JSON | 38689 | `0f3361a31eff55cca7081864fce2a4ad1835c4ba537ecf7dfafc1548babc488e` |

本轮对D_REPORTS ZIP内A/B/规范快照逐字节复核：
- A_G04_00 `a9ff3d93304431bdfccac9f0f339b5760ee2986a2af605d5324075369f14dca5`
- B_G04-T02_02 `64494c2445789c31ed08694359346e24c01ef457d0d54293149630de31220ebb`
- B_G04-T02_06 `02fca659c474e3d65ed6a075e24c1ae75430a09e557353d9233b63efd86c080b`
- B_G04-T02_L01 `bc6fa3cf93a3b1ee4dce63464c5d350cb586c93af8b9f1ce906185e1e471b2b1`
- D_v2.1_instruction `04ee6462aa2eeff7971a9f7d2617c8f16fc410aee92a3b0998c4b907434263a1`

旧版状态保持：D0=PARTIAL，D1=PASS（FROZEN_GOLD_v1.0），D2=PASS，D3=PASS（仅静态/抽样），D4=PASS（仅离线）；不涉及产品准确率。原作者Git SHA=`NOT_AVAILABLE`。2026-10-12 ZIP内部条目时间不可外部认证；2026-10-14 E0是独立审计时的字节确认日期。

**此次差分：ADD 3份公开脱敏MD；MODIFY 0件输入、政策、Gold、mock、scoring、报告原件；DELETE 0**。本次新Git SHA只指这次的增量证据，不冒充原D作者提交，不引用E audit HEAD作为作者commit。

受影响：仅T02证据溯源、ACL阻断项及E r02复验入口。涉及2023学校2016办法废止为A职责；N18驻场分界为A/来源owner，不由T02 D做校规。