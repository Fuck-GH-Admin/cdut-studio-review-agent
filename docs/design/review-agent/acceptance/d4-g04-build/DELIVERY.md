# G04 八套 D4 实际制作阶段交接（工程态，不是业务审批）
固定 COMMON 代码：`a7a6a11d4840ad64cfc858c17b35f35180adf063`。来源仅用户 Library 完整 C MD 字节及已核定 T06 v0.1.1。采用8个独立 `ReviewAuthoringWorkspaceV1`、每套7组本地模块、8个 `selection.json` 和合成 `case.json`，没有改动引擎和其他 GXX。

## 业务含义保留方法及显式非承诺
- `workspace.json` 逐条装入全部编号 R 正文；`coverage.json` 逐 R、逐主章节对应模块；`source-sections.json` 保留各章包括 F/MS/BR/EV/阶段/输出表的全文。章节超长时工作区 `secNN` 仅截取开头说明，其完整章节位于同目录 source-sections.json；**这不等于每个 F/MS/BR 都已独立程序执行**。
- 技术 `genericScenarioAxes` 每域是 2 主场景 + 2 条叠加场景的**最小可运行选择器**。**它不是原文 13/19/18 条 BR 路由的全量可执行分类器**。主模块的原 R 条件保留语义；需要确定性源事实与阶段触发的进一步映射不能擅自声明通过。
- 所有 R 都绑定原 MD 锚点的作者来源；`verification:content-checked` 只代表阅读原文，不代表现行校规。不得将 pending-only 技术回执当合规 PASS；学校保卫、公安、实验室等批准仍由人决定。
- B01/B02 是既有合成共享语义，不作未经核证的跨模板冻结复用；`sharedModuleLocks:[]` 是有意选择而不是版本锁失效。所有 7 组 `workspace-local` 模块固定 @1，并接受 D3 revision/export/import。
- 当前无任何 Gold 读取或生成；仅合成技术对象与材料；无真实访客、人脸、学籍、车牌、管理员授权。
- 预设运行样本同时展示两个 Subject，不同 primary 与叠加条件，一项 unknown 和一项 false，证据仅能覆盖自身目标。高阶 Claim 图和跨对象审批因无确证权威源暂由语义审核 + 人工待办承担。

## 实测入口
```bash
export PROFER_CONFIG_DIR="$(mktemp -d)"
bun install --frozen-lockfile
bun test --isolate --timeout 120000 apps/electron/src/main/lib/review/review-d4-g04.test.ts
```
该测试实际调用 D1 validate / D3 export-import / D2 compile、实体案卷 create / Pi prepare-submit-verify，并将每套完整真实 Plan 与 Pi Run 放在环境变量 `D4_G04_EVIDENCE_DIR` 指向目录。PR 的单独 G04 工作流使用真实命令，若权限允许则只向本领域 `runtime/` 提交实测 JSON。未见当前 SHA 绿色工作流之前，全部测试状态严格 `NOT_RUN`，不能从公共引擎既有绿灯推断八模板成功。

## 有边界的制作交付状态
| TXX | 原子责任 | 作者态已生成 | 条件细化现状 |
|---|---:|---|---|
| T01 | 40 | YES | 13 BR 的完整跨门点逐实例自动适用尚需业务细化 |
| T02 | 53 | YES | 访客/车辆/公众与 N18 长期驻场有权路由尚待校本确认 |
| T03 | 46 | YES | 人员×实验室资格/考试/撤销权威数据未接入 |
| T04 | 35 | YES | 多项目危险源/改版差异仍须专业判断 |
| T05 | 36 | YES | 值守人员与设备实时状态尚非授权接口 |
| T06 | 48 | YES | 19 BR 不能等同四轴；公安法定许可独立于校内会议审批 |
| T07 | 46 | YES | 每动火点、每工人许可/工单与施工准入不能互代 |
| T08 | 39 | YES | 18 BR 不能等同四轴；年卡收费与真实门禁名单独立 |

状态由最新仓库 CI / 产物回执复核后更新，不以 Markdown 自评冒充工程 PASS。
