---
path: apps/electron/src/renderer/components/cdut-zone/sheets/GradesDomainSheet.tsx
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: bf0bd9c0bb4ceff3df4309b80fc23c98e4689d12
sha256: 6d03767c6e6af8454e30ee2143b09c62700f132076049bf782ec66d6f1c073c8
lines: 606
kind: source
package: p08-renderer-ui
author: docs-r07-author-nb-01-20261023
reviewer: docs-r07-qa-nb-01-20261023
status: authored
evidence: static
---

# apps/electron/src/renderer/components/cdut-zone/sheets/GradesDomainSheet.tsx

## 1. 结论与边界

CDUT「学业绩点/培养方案」抽屉业务卡片（文件头 `apps/electron/src/renderer/components/cdut-zone/sheets/GradesDomainSheet.tsx:1-10`）：Tab 双模式（历年成绩/培养方案与学业进度）；**补考重修双轨加权 GPA 仪表盘**（最新成绩轨 vs 最高成绩轨切换）；学期+级别筛选（全部/必修/选修/90+）；培养方案树状图谱+模块进度条；实时教务与演示回退（环境徽标+重试）。

## 2. 导出与关键符号

`export` 逐条核对：1 个组件 = 1 个导出。

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `GradesDomainSheet` | 组件（导出） | 177-606 | 主卡片 |
| `GradeItem`/`CurriculumModuleItem`/`GpaSummary` | 内部接口 | 27-51 | 明细/模块/汇总形状 |
| `normalizeGrades` | 内部 | 54-96 | 双轨汇总+records（`records`/`courses` 双式；**绩点回退公式 `(score-50)/10`（≥60）** `:90`；无分数 `hasScore:false`） |
| `normalizeCurriculum` | 内部 | 99-125 | 模块树（completed/pending 二值） |
| `getScoreColorClass` | 内部 | 128-166 | 五档色（90/80/70/60/不及格） |
| `collectSemesters`/`FilterCategory` | 内部 | 168-175 | 学期倒序归纳 |

## 3. 内部逻辑与关键流程

- **SWR 缓存契约**（`:182-209,219-225,263-270`）：①抽屉打开读 `readDomainCache('grades')` 秒开；②**仅真实在线且 records>0 才原子写缓存——严禁空表/演示数据覆盖有效缓存**（`:219-220`）；③合并：live 有效优先，否则缓存降级**绝不白屏**（`:263-270`）。**防御式 API 调用**（`readDomainCache` 可能不存在，直接调会同步抛 TypeError 致入口空白的历史 Bug，`:189-191`）。
- 双轨 GPA（`:358-427`）：latest/highest 切换；四指标（GPA/加权均分/总学分·必修/90+ 门数）。
- 筛选（`:275-283`）：类别（必修/选修含子串匹配/90+）×学期。
- 成绩卡（`:501-537`）：五档色边条+补重徽标+绩点；**加载期骨架屏杜绝一片空白**（`:484-495` 注释）。
- 培养方案（`:540-603`）：模块进度条（required/completedCredits 缺省按课程推算，`:555-560`）；课程 chip 已修高对比（**深色 OLED 暗背景可分辨** `:587` 注释）。

## 4. 调用者与调用链

入向：CDUT 专区成绩抽屉；测试：本批**无专属测试**（scope 无 `.test.ts`）。出向：`lucide-react`、`@profer/shared`、`window.electronAPI.cdutZone`（callDomainTool/readDomainCache/writeDomainCache）。

## 5. 数据 I/O、读写与副作用

IPC：域工具双（grades/curriculum）+缓存读写；本地 SWR/筛选状态。

## 6. 分支、失败、取消与恢复

| 情形 | 行为 | 行 |
| --- | --- | --- |
| 查询失败 | isDemo 错误 | 226-232 |
| API 缺失 | 防御跳过 | 194-195,221-223 |
| 空表/演示 | **不写缓存** | 223 |
| 同步未完成 | 离线快照徽标+重试 | 340-353 |
| 筛选空 | 空态 | 496-500 |

## 7. 权限与权威状态

成绩权威=青果教务（isDemo 显式）；缓存=SWR 降级层（写入门槛：真实+非空）。

## 8. 修改影响面

改 SWR 逻辑影响秒开/降级；改双轨影响 GPA 口径。

## 9. 测试证据

本批**无专属测试**（scope 事实）。`NOT_RUN`：本轮未执行 Bun 测试/typecheck/构建/GUI/真实模型/真实教务。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| SWR 三步契约/禁空表覆盖 | 已证实 | `:182-270` |
| 双轨 GPA/筛选 | 已证实 | `:275-427` |
| 骨架屏/OLED 对比 | 已证实 | `:484-495,587` |
| 真实教务数据 | 未知 | 未运行 |
| 测试覆盖 | 未知 | 无专属测试 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| 规范化+helpers | §2 | 27-175 | covered |
| 主组件 | §3 | 177-606 | covered |
| 断言 | §9,§10 | — | unknown |
