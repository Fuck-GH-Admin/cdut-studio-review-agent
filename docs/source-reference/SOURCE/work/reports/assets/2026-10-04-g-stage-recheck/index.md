# 第二轮复查证据

基线 `ddd9b1e3` + 本次局部修复；2026-10-04，Linux Electron 开发实例。仅使用隔离配置和虚构材料，没有真实学生数据或密钥。

## 界面

| 文件 | 内容 |
| --- | --- |
| 01-restored-list.png | 重启后旧 V2 案卷可从列表恢复 |
| 03-submit-conflict.png / 04-submitted-without-task.png | 修复前登记后提交冲突，留 submitted/无任务 |
| 05-owner-rule-input.png / 06-owner-rule-published-before.png | 修复前通过界面输入自有规则并发布；文件实际丢为默认政策 |
| 07-submit-recovered.png | 修复后恢复旧中间态，开放 auto-check 任务 |
| 08-owner-rule-fixed.png | 修复后重新用界面发布自有规则，文件原文匹配 |
| 09-supplement-response.png / 10-supplement-returned-task.png | 快捷补件回复落盘，判满足后回流任务 |
| 11-batch-no-run.png | 创建固定示例批次后 queued，没有执行入口 |

[UI 操作记录](ui-actions.jsonl) 记录鼠标/键盘及只读探查；原生文件选择由系统鼠标/键盘操作，选中 scratch fixtures/evidence.txt，细节见 [UI 落盘摘要](ui-results.json)。原生文件选择框截图未归档。

补件界面当前使用固定说明，未上传新附件；手动处理 auto-check 阶段不是 Agent 执行通过。新提交的正常路径另由行为回归验证；恢复旧案在 UI 实测。

## 服务与门禁

- [service-probe.json](service-probe.json)：新评分、补件、离线回复、字段与 outbox 的真实服务反例。
- [service-probe.ts](service-probe.ts)：从仓库根目录运行 `bun run work/reports/assets/2026-10-04-g-stage-recheck/service-probe.ts`。总会创建新的临时配置，不读取用户配置；输出不是全项通过报告，个别值是为了复现当前错误。
- [submit-regression-before.log](submit-regression-before.log) / [submit-regression-after.log](submit-regression-after.log)：同三个提交行为用例，修复前 0 pass/3 fail，修复后 3 pass/0 fail。
- [verification.json](verification.json)：最终全量测试、类型检查、边界与构建结果。

没有完整生产安装、真实模型准确率、两个副本界面往返或校方系统联调证据。服务调用不冒充 UI 通过；全部截图已经查看。
