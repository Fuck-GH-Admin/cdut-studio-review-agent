# G03-T03 → E r02 定向复验交接｜2026-10-15

**仅处理 `E-G03-DEP-002` 选版缺陷及关联Gold私有访问待办**。不修改E r01冻结文档与结论。E r01仍为`E1=INCOMPLETE/BLOCKED_SOURCE_FOR_FULL_H`，尚未获准E2。

## E0 — 来源、包级与冻结版本
- 核查 `D_FREEZE_SELECTION.md` 六ZIP包级完整SHA、字节数、CRC、内部manifest。
- 正式D三件套为后上传`(1)`版；首版只读保留，不拆并任何内部文件。
- 作者交付旁证为两代各自`D_DELIVERY_HASHES.json`；A v0.1和B v0.2的SHA见选版签署。
- 原D作者Git commit=`NOT_AVAILABLE`；冻结E r01 HEAD不是作者commit；本分支新commit仅为补证。
- 评估包受控存储ACL仍`PENDING`，不得把Library位置视为私有合规证明。

## E1 — 独立校规适用性
E需独立闭合本校申请人权限、场馆主管归属、容量/时段、保卫审批触发等`SOURCE_PENDING`；D原作者不能给E1签PASS。材料来源不足不等于已经确证Gold业务误判。

## E2 — C/D比对的前置门槛
E1真实完成且独立受控Gold访问配置/白名单经过E复核之后，才允许读取指定Gold与C定版并逐条追踪。**本轮没有查阅C规则或修改Gold以迎合C。**

## E3 — 归因、修复与复验
仅对E2找到的具体证据性问题定位C、D或来源责任；若Gold确有问题必须显式升版并保留被选v1字节，不允许静默替换。

## 交付与未关闭项
公开：D作者选版签署、六原包哈希清单、受限访问阻断与对接记录。未公开：隐藏Gold、模拟可信底账、逐案预期、答案索引与打分。

该整改只解除“原D作者最终选版未签署”的作者责任；是否关闭E blocker由**独立E r02**自行裁定。当前无Git原作者归档SHA；Gold ACL、校本高风险来源依旧待补。E r01不变。
