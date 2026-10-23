# Integrator-I R01｜使用说明

**四线共同规则的唯一权威文档**：[ABCI-UNIFIED-COORDINATION-AND-STATUS.md](./ABCI-UNIFIED-COORDINATION-AND-STATUS.md)。A/B/C/I 每次启动先读其最新版本、协调分支 HEAD 和自身进度区；C 独占正式决议。此 README 与 I 技术任务书不构成第二份跨线规则。**共享协调分支仅用于 docs-only 规则与摘要进度，生产代码、详细证据仍在各自工程分支/Draft PR。**

启动一个独立新会话，直接提供 `INTEGRATOR-I-EXECUTION-TASK.md`。该 Agent 不是独立架构师，不能直接合并 Dev-A/B/C 的完整分支，也不能抢占 Dev-C 的共享文件 Owner。

现在就可以开始 **I0**：真实核对 SHA/CI、源码差分、CR-A-001/B-CR-001、owner、建立分层接线方案与 docs-only Draft PR。

**I1** 需要 Dev-C 明确批准最少的共享接口变更，并提供已核验的 C 集成锚点 SHA；再在独立 `integration/v3-i1-*` 分支引入经批准的 A/B 片段、编写受控桥接、运行新 HEAD 上的合并回归和安全负例。C 可继续自己的开发工作，不必等待 I 的每一个小提交。

本文档写作时核验基线：C0 #141 `5682057c7232c914e72fdae525ce95fd33f32b53`；A #143 `d8fd3e0e696caa1df7321c23c46e4f70a1f910f7`；B #142 `f7a7cf2a63f5861ad4bfd3f432c7f9a6dfe151bc`；C #144 `31aa352c45a33d6832612884b0fea38e39b5cf8d`；设计 #140 `7f954661b3dbca7f0707832c2d097d9c68a965b4`。

上面是**固定参考，不是未来自动更新的 SHA**。每次启动均需重查最新 HEAD 与 CI，并把变更作为新快照记录。所有历史 PR 保持 Draft、不自动合并 main。
