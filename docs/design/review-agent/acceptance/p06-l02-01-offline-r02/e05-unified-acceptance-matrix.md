# E05 统一实机验收矩阵（准备材料，尚未执行）

> 一次冻结候选 SHA，集中一次本机 agent / Electron / 实体环境验收；不是本轮已完成测试的报告。不要重启冻结 #118 U1 campaign。所有动作限定脱敏合成案卷，禁止污染真实校方生产数据、隐藏 Gold 或冻结历史。

| Lane | 最小证明对象 | 必须保留的证据 | 放行/失败标准 |
| --- | --- | --- | --- |
| L02-01 E02 正式终审 | 真实完成 Run、当前输入哈希/模板版、人工有权 task；分别拒绝无 Run、旧 Run、伪造 Run、未读材料、未处置 Check、伪造 School actor | 真实 `receiptLog`、Run manifest、聚合决策、Main 角色门禁、录屏/执行日志 | 不得落盘冒签；有效终审完整可追溯 |
| L02-01 E03 多补件 | A/B 两补件仅消掉其一、insufficient→再回复→satisfied、同一 requestId 重放 | 每次 case revision、补件 responses、task stage/round、batch JSON | 未满足不回审，不重复回流 |
| L02-01 E03 多批源 | 同案多历史/当前批，Main UI 显示并由 reviewer **显式确认**指定一个真实目标；旧批、已 finalized 和 running 禁止重排 | Renderer 截图、真实 IPC 参数（脱敏）、before/after 两批 JSON + cursor、重复操作 | 只改目标，回放与更高 revision 不复活 old done |
| E04 批次自动化/定稿 | assist 默认禁止 AI 代批；逐批授权撤销；模板改版/检查缺口；定稿快照与重开 | 自动化授权、Run、决策、outbox/WAL、快照 hash | 技术 done ≠ 正式决定，旧快照不改 |
| Provider / A-B-C | 真 Pi / tool-use → Main gate → V2 receipts；三独立材料对照与质量核验 | 原始可追踪 SourceRef / version、Provider 回执、可复核 Gold *隔离存放* | 未获凭据、额度、外网，标 BLOCKED，不签 LIVE |
| 磁盘与恢复 | 独立环境 FULL/ENOSPC、跨 PID、Main kill -9、run 中断/old ACK、outbox actionId 重放 | 命令 + 真实 exit、pid、故障时磁盘状态/日志、重启恢复后磁盘比对 | 无真实实测不得拿模拟代签 |
| GUI / Office | 真 Electron 和文档原件查看；编辑器 / 预览与角色入口 | 逐动作录屏、源文档和真实只读预览差分 | 合成 fixture 不能替代真 GUI |
| Relay / Pocket | 多 viewer / FIFO / 共享 session 归属 | 真实连接日志、隔离和出站效果记录 | 未跑即明确 BLOCKED |

阶段门禁：失败项必须写首败可复现日志；修复后另提交候选版本、全仓 CI 与差分实机复跑；最终只允许更新**经权责确认**的 LIVE 29 台账。不合并 #121、不解除 Draft、不宣布 L02 LIVE、不推进 P07/P08。
