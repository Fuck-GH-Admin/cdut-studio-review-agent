# 01｜固定证据与可达性裁决（R3-CANDIDATE / docs-only）
本报告在授权 GitHub 连接器上按固定 SHA 阅读 #133–#139 的关键正文、机器索引、L1-01/02/03 合成 JSON 和源产品文档 00/02/03/04/14；此外读取 #91/#97 Git tree 与 G05 差异。**本执行环境无法通过 git DNS clone，本轮没有本地 Bun/Electron/Provider/校方联调；不把 #139 的本地实测视为本轮重跑。** 逐项保留前轮的原始证据边界。
## 输入锁
| 审计报告 | HEAD | 权威作用 |
|---|---|---|
| PR #133 | `ff5e1068b99dc2aa41f53c692cd0e44a2e7ca071` | 审计报告证据，非生产代码 |
| PR #134 | `54b906dc7f4dcd06d8ca14ae39798bf18336e7d6` | 审计报告证据，非生产代码 |
| PR #135 | `9147b0c6240fc866ea98b489c37c8738714d5e9f` | 审计报告证据，非生产代码 |
| PR #136 | `87e1d2636403f8f0ccceb4fd786ee4b7097bbfb6` | 审计报告证据，非生产代码 |
| PR #137 | `082fafb3f1df7d19af25bf52cc93135190ff102c` | 审计报告证据，非生产代码 |
| PR #138 | `e2ee1d738c43ee193bb8812389a148fd2d3ad479` | 审计报告证据，非生产代码 |
| PR #139 | `10d499d6d120dcffc3c1c8a90aabac9302a9757f` | 审计报告证据，非生产代码 |
| 代码 | SHA | 说明 |
|---|---|---|
| main | `8989941b6fb5651564e32d11c4215b6a6d5a5209` | 固定样本（不接受后续HEAD静默替换） |
| D4 | `c2f965d29022a42b3c32d6a4cb73aa8fd542329b` | 固定样本（不接受后续HEAD静默替换） |
| P06 | `db0284879f75ce123b5d83cb6577a3cc7ad057da` | 固定样本（不接受后续HEAD静默替换） |
| R02 | `c23789882aabf18689c314c77c270ac4a8ae4729` | 固定样本（不接受后续HEAD静默替换） |
| I | `b68443b23293b4714e61a3b81383d3d3a56434fc` | 固定样本（不接受后续HEAD静默替换） |
原始产品目标：`docs/design/review-agent/{00-overview,02-product-and-templates,03-architecture-and-delivery,04-acceptance-and-evaluation,14-pi-native-review-and-simple-workspace-design}.md`，main固定SHA。禁止将历史设计当成已验收实现。
## 已可进入设计的证据
- L1-01（ARCH-002/003）：D4 真实导入/归档撤销旧Observation确认、拒旧EvidenceLink、Plan字段冻结；P06虽归档仍confirmed，人工构造合成Run及adjudication、删除D2 Plan后**实际决定服务**消费归档旧值4。说明业务服务漏失效校验，不证明普通UI攻击可达。
- L1-02（ARCH-004/014）：P06 `registerReviewIpc` 真实Main handler harness 四条写接口接受合成的school/teacher并把Actor写Receipt；非live Electron。local reviewer申诉被领域层正确拒止；可信teacher入口未证。
- L1-03（ARCH-007/008/009）：P06公开Main `finalize-completed`/底层finalizer接受entry Run错配或缺失，并持久finalized；正常auto绑定本entry Run仍PASS_SCOPED；R02保护回归通过。live UI调用者未证。
- L1-05：D4两个generic-object target含conditions/unknown保留6 Check×target并产Prompt；P06旧archive three mappings并不支持同一个generic DTO，报D2_TARGET_INVALID，不能做不等价AB。
- L0 Git：M–D merge-base `98708f965f09f83541deef64f577767cb0c753b6`（170/333）；M→P 113 commit；D–P 333/283；R02/R03 4/5，原PR→#97路径无丢失，G05十四处blob差异已定位。
- L1-06已由#139**选定样本**执行21+30+114+74=239 PASS_SCOPED；不是全仓typecheck、集成、系统上线。三项新增保护性预期测试以非0退出揭示失败，不属于239 PASS。
## 不能升级的证据
- L1-07 Owner撤权没有运行；Provider真tool-use、Electron/GUI、跨PID和ENOSPC、Outbox实际恢复、校方账户/校规、独立Gold均缺证。状态BLOCKED/NOT_RUN。
- #139校验和验证的是离线脚本与合成数据；没有复核该环境的live依赖，不作“完整生产漏洞”或“上线可用”推断。
- 72能力的原始#138分级47 PARTIAL/21 UNKNOWN/4 BLOCKED；本次映射中的产品必要性/Owner是**设计裁决**，非验收通过数。
## 决策边界
- `REPRODUCED_FAIL`指既定SHA与明确调用层、合成状态下失败；`VERIFIED_STATIC`源码级；`PASS_SCOPED`选定回归；`PARTIAL`链路不全；`BLOCKED`环境/授权；`UNKNOWN`未复核。详情见03索引`reachability`。
- “当前代码冲突”不等于“已上线遭受攻击”。发布门禁必须是新合并快照的精确负例转正、全路径GUI与授权LIVE分开签名。
## 直接裁决
采用**增强A + 边界重建的受控混合**：V2 Aggregate/CAS/Receipt作为唯一当前业务写权威；不可变Plan/Source/Run作为引用对象，D4与P06按函数级迁移；重新构建最外层写命令授权与多文件intent/recovery，不新建第二套平行业务核心。详05/06。
