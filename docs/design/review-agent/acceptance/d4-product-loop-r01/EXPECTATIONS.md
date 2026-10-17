# 在线运行前固定的可观察预期

输入仅使用 fixtures/ 下的合成 Markdown；不使用正式校务数据。

- 选择 g08-t02，两个对象/Subject 保持 lost-item-a/lost-a、lost-item-b/lost-b。
- A 为本人认领，valuable、dispute、card、sensitive、venue、handover 均明确不适用；有电子购买凭证与一致的物品识别信息。不得仅因无纸质发票、代领委托或尚未到交付阶段的签收记录报缺件。
- B 为 proxy 代领，valuable/dispute/sensitive/venue 未知，card/handover 不适用。输入有明确的“白色耳机 TEST-B-7788”与“绿色雨伞 TEST-B-9900”矛盾，且未提供代领委托。模型须指出至少这个实质矛盾及 B 原件位置；未知不能变为不适用或通过。
- A、B 各自只关联自己的证明和对象事实；A 证据不能给 B 下确定结论。对象关联是审核员确认的材料用途，不能把它当成材料内容已充分。
- 本轮至少观察真实 Pi 请求、review_read_documents 的真实 block 读取回执、review_submit_result 的对应 ruleId/Subject、原件版本与准确引文，以及 Renderer 可见结果。只有合理文字、CLI 合成收据、零用量或缺少实际读取，不算在线审核成功。
- 冻结 D4 来源尚未取得校规确认，unverified-policy 的 Check 即使模型发现实质问题也必须维持 awaiting-confirmation；须在 reason/SourceRef 中记录差异，而非无内容 pending。此限制不得通过伪造制度来源消除。
- 条件修改创建新案与新 Plan；不继承旧案运行或证据。G03 多资源和 G01-I 双字段的独立性另做定向服务回归及客户端建案验证。
