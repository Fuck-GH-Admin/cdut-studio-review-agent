# 本轮复查证据

报告：[N1–N7 实际复查](../../2026-10-04-n-stage-recheck.md)。全部材料来自隔离配置和虚构样例，无真实密钥或学生材料。

[verification.json](verification.json) 记录最终检查命令、计数、构建和测试环境关闭结果；完整开发日志保留在临时 QA 目录，未加入仓库。

## 截图

| 文件 | 含义 |
| --- | --- |
| [02](02-review-before.png) | 修复前三栏各追加三份管理面板 |
| [03](03-v2-created-before.png) | V2 创建后无任务，V1 工作台仍无材料 |
| [04](04-premature-finalization.png) | 未处理批次可定稿的旧错误 |
| [05](05-wizard-result.png) | 简化向导发布结果，缺模板使用入口 |
| [06](06-workbench-fixed.png) | 修复后的独立工作页与三栏布局 |
| [09](09-v1-demo-reviewed.png) | 模拟引擎、6 条事项、7 张问题卡 |
| [10](10-linked-finding.png) | 问题卡联动蓝色依据/红色证明 |
| [11](11-assistant.png) | 快捷助手，当前问题及明确离线回答 |
| [12](12-workbench-narrow.png) | 实际缩小窗口后的工作台栏目切换 |
| [13](13-template-narrow-fixed.png) | 实际窄屏管理页，切换后表单步骤保留 |
| [14](14-v2-after-restart.png) | 重启后 V2 页只能新建，旧案文件仍在 |
| [15](15-batch-after-restart-fixed.png) | 重启后 queued 批次定稿禁用 |
| [16](16-case-list-after-restart.png) | 案卷选择只列出 V1，无 V2 恢复入口 |

[ui-actions.jsonl](ui-actions.jsonl) 记录已执行的 UI 操作；DOM eval 仅用于读状态。截图 12/13 使用 X11 的真实窗口尺寸调整；早期 CDP emulation 随连接关闭未保留的尝试不用于窄屏结论。

## 服务探查

- [service-probe.json](service-probe.json)：修复前的字段/事实/绑定、流程、离线包、检查点和资源探查。
- [service-probe-after.json](service-probe-after.json)：检查点修复后，其余缺口仍存在。
- [rating-outbox-probe.json](rating-outbox-probe.json)：重复票掩盖缺评、NaN、N/A 分母、空评分及发送前没有 pending。

可以在项目根目录复跑，两个脚本均自行新建临时配置，不读取用户已有配置：

```bash
bun work/reports/assets/2026-10-04-n-stage-recheck/service-probe.ts
bun work/reports/assets/2026-10-04-n-stage-recheck/rating-outbox-probe.ts
```

脚本输出观察值，**不代表这些功能已通过**；对照报告第 4 节判断。脚本保留临时文件便于查看落盘结果，路径会出现在配置初始化日志。

`afterRestartSimulation` 是清空模块内 Map 的模拟，不是完整的跨进程导入。截图 14–16 才来自实际 Electron 重启。检查点探查在后续节点读取磁盘，另通过删除/损坏产物后调用续跑验证；本轮没有真实模型运行中强杀的用户验收。outbox 探查使用延迟响应端口查看发送期间的磁盘文件，不冒充真实学校网络。
