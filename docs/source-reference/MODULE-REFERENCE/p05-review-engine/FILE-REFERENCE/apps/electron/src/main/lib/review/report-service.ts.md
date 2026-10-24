---
path: apps/electron/src/main/lib/review/report-service.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: dcae49957ca640fa8c46931d8ae2a6116af18442
sha256: b929b57705095d86e9bbb2ea31cca4d7842a4f17392c260a9b40f401ee7e8937
lines: 204
kind: source
package: p05-review-engine
author: docs-r07-author-nb-09-20261023
reviewer: docs-r07-qa-nb-09-20261023
status: authored
evidence: static
---

# apps/electron/src/main/lib/review/report-service.ts

## 1. 结论与边界

V1 预审报告导出（`EXPORT_REPORT` 实现，头注 :1-9）：产出 `{configDir}/review-reports/{caseId}-{stamp}.json`（机器可读 `ReviewReportData`）与同名 `.md`（人可读交接文档）。对齐设计 §6（列依据版本、事项、问题、引用位置、补件清单、人工处理记录）。

边界：V1 系（`case-store`）；V2 导出在 `report-export-v2-service`；不做受众授权（全部内容出报告）。

## 2. 导出与关键符号

| 符号 | 类型 | 行 | 说明 |
| --- | --- | --- | --- |
| `exportReport` | async fn | 69-112 | 导出 JSON+MD，返回 `{jsonPath, markdownPath}` |

内部：`escapeMdCell`（:20-22）、`writeFileAtomic`（:25-29）、`KIND_LABELS`（:32-41，8 种 FindingKind 中文）、`SEVERITY_LABELS`（:44-47）、`SUGGESTION_LABELS`（:50-55）、`getReportsDir`（:58-62）、`renderMarkdown`（:115-204）、`describeAnchor` 闭包（:170-173）。

## 3. 内部逻辑与关键流程

1. **守门**（:70-85）：`assertSafeId` + 案卷不存在 → throw `案卷不存在: …`（:72）；无运行 → `该案卷尚未执行审核，无法导出报告（请先在右栏运行审核）`（:75）；运行非 completed → `本次审核尚未成功完成，无法导出预审结论：请完成审核后重试`（:76）；**同版守门**（M0/H06/H10，:78-85）：`inputHash` 与当前指纹不符 → `案卷在本次审核后已修改，最近一次结果已过期：请重审后再导出报告`；缺 inputHash（旧格式）→ `该运行记录缺少输入快照（旧格式），无法证明与当前案卷同版：请重审后再导出报告`。
2. **数据装配**（:87-101）：caseId/title/时间/学年/申请人/rulePacks 元数据/`runs:[run]`/`manualNotes:[]`。
3. **落盘**（:103-111）：stamp = ISO 毫秒化 + 4 位随机（同毫秒并发不互覆，:103-104）；`writeFileAtomic`（tmp+rename）JSON 与 MD；`console.log`（:113）。
4. **`renderMarkdown`**（:115-204）：demo 案卷警示行（:120）；概要表（含引擎 AI/模拟，:122-133）；审核依据（规则包列表，:135-144）；审核发现表（severity/kind 中文标签、建议分数或「待确认」，:146-163）；逐发现详情（事项/说明/修改建议/待审位置/证明位置/对照位置/依据位置，:165-182）；覆盖摘要（含 `unprocessedMaterials` 逐条 + `> 存在未处理材料，本报告不能表示全部材料符合要求。`，:184-195）；人工处理记录（:198-201）。

## 4. 调用者与调用链

入向（生产）：`review-ipc.ts:56`（`exportReport`，IPC `EXPORT_REPORT`）。测试：无专属测试文件（全树 glob）。出向：`./report-data`（`getCase/latestRunSafe`，:15）、`./case-store`（`assertSafeId/computeCaseInputHash`，:16-17）、`../config-paths`（:14）、`node:fs/path`（:11-12）。

## 5. 数据 I/O、读写与副作用

- 写 `{configDir}/review-reports/{caseId}-{stamp}.json/.md`（tmp+rename，无 fsync）。
- 副作用：`console.log`（:113）；mkdir（:60）。
- 无网络/窗口。

## 6. 分支、失败、取消与恢复

四类 throw（§3.1）全部**中文错误**、不生成空报告（注释 :67）；无取消；覆盖式不发生（stamp 唯一）；旧格式运行 fail-closed 拒导（:83-85）。

## 7. 权限与权威状态

- 同版权威：输入指纹一致才可出报告（:80-85，防「当前元数据 × 旧运行」混版）。
- 诚实性：demo 案卷显著标注（:120）；未处理材料显式列出并加警示行（:191-194）。
- 无 sender/role 检查（IPC 层负责）；本报告无受众过滤（内部意见也出——与 V2 的 A15 分离不同，边界如实记录）。

## 8. 修改影响面

- `EXPORT_REPORT` IPC 契约（`ExportReportResult`）。
- 中文文案被 UI/用户依赖；`computeCaseInputHash` 变更影响守门。
- 无专属测试；回归面在 IPC 集成测试（他批）。

## 9. 测试证据

无直接测试文件（全树 glob `report-service.test.ts` 不存在）；间接线索：无（IPC 层测试未覆盖本导出）。缺口：守门四分支、renderMarkdown 全结构、stamp 并发。NOT_RUN。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 1 导出/内部符号行号如 §2 | 已证实 | 逐条 |
| 同版守门（含旧格式拒导） | 已证实 | :78-85 |
| demo 标注/未处理材料警示 | 已证实 | :120/:191-194 |
| 生产唯一接线 review-ipc:56 | 已证实 | grep |
| 运行行为 | 未知 | 无测试；NOT_RUN |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `exportReport` 守门 | §3.1/§6 | 70-85 | covered（未测） |
| 数据装配+原子落盘 | §3.2-3.3 | 87-113 | covered（未测） |
| `renderMarkdown` 全结构 | §3.4 | 115-204 | covered（未测） |
