# nb-02-r1 独立复核结果（accepted）

- 批次 `nb-02-r1`（revisionOf `nb-02`，6 文件）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 复核者 `docs-r07-qa-ui-20261023`；作者 `docs-r07-author-ui-20261023`；2026-10-23T15:52:00Z
- **batchVerdict: accepted（6/6）**。NB02-CCD-1（blocking）+ 6 条 low 全部 closed；ProductWorkspace 逐字节未变。1 条新低级备注 N-R1-1 待 G4 前关闭。
- NOT_RUN：bun test / typecheck / build / Electron·GUI / 真实模型；测试断言不等于已运行。

## 封版绑定（seal v2）

READY `dbef0656…`、DONE `890e35fa…`、MANIFEST `40a7f71b…`、ZIP `e3be4a23…`（50251 B，9 entries：6 stage + MANIFEST + 2 mechanical tsv）。before/ 5 篇 = nb-02 封版字节；changes.diff 从 nb-02 stage 重放 6/6 一致；6/6 源 blob/sha 与冻结树一致；nb-02 r0 封版未动。

## G0/G1（PASS）

四方手册哈希一致、ZIP 无穿越/符号链接、元数据一致、无漂移；8 类 front matter/11 章/三态/NOT_RUN 全过；全 stage 无「一帧」实测表述。

## G2：7 条返修逐条回源（全部 closed）

| ID | 复核要点 |
| --- | --- |
| NB02-CCD-1 | 空学年链路逐跳与源一致（`:96`→`review-actions-controller.ts:536`→`preload :4752`→`review-ipc.ts:182-184`/`requireString :76-81`→`:547-549`→`:100`/`:107-109`）；§8 两层口径（IPC 全局 + native 仅综测不可达）正确；§10 撤回 r0「注释过时/矛盾」判定并改「与本通道可观察行为一致」；`review-ipc.ts:181` 注释位置已纠 |
| NB02-D4-N1 | §10 拆「单次挂载内只读一次」+「父级 key 重挂载重新 listD4Templates」 |
| NB02-T5-N1 | §9 改 `:5-20`，用例 `:6-9`/`:12-14`/`:16-20` 与测试实测一致 |
| NB02-T5-N2 | §7 补读通道守卫弱于写通道（`LIST_RUNS_V2 :599-604`、`GET_WORKSPACE_RUN_VALIDITY_V2 :709-715` 无 sender 校验） |
| NB02-RT-N1 | `currentLocal` 改 `:21-26`，注明 `:27-32` 是 `localDocument` |
| NB02-RT-N2 | 提示清空路径已证实、**可见帧数/时长标未知（未运行）**——满足「不写实测帧数」要求；attachFallback 四处静默中止（`:131`/`:134`/`:141`/`:143`）逐点列出、产物留 Main 无回滚 |
| NB02-IS-N1 | `B3RoutePanelProps` 改 8 字段（4 数据 + 4 回调）逐名列出 |

## acceptedHashes（exact，6/6）

- CreateCaseDialog.tsx.md `1ba2acfaa420e5a37cf67026b258330030bb0672ad28a2fd30bc5a149061cf69`
- D4CaseSetup.tsx.md `d9328e671d62871aaf3c0ee1ec4017aad4341c0bb12976530f4e6dfa58f5b597`
- ReviewV3T05RunDecision.tsx.md `93bcf3fc4efd8d0ed1ca094a69bf2f85e9c8c5f899fbe59895fe17877a5b792c`
- ReviewV3TemplateRoutingAssistant.tsx.md `cf398df9ef81bb5d52563e8b71aff941d3aa501d13c01a1d5c6bcb73742cb9a7`
- ReviewV3CandidateIntakeSurface.tsx.md `e07001fda08fb2fa51617596d94bbc913f280ed81d7f19eccfd01c1fb02496d7`
- ReviewV3ProductWorkspace.tsx.md `a7214a03ca78c3d922f1cdd0d4019450b76402292252e31ee3c8b53dc09e3c6e`（未变）

## 新增低级备注（G4 前关闭）

- **N-R1-1**：`FINDINGS-RESPONSE.md` §8 表把 ProductWorkspace 手册 hash 写成 `64b9826e…`（旧 FIRST-FILE 草稿值）；实际封版为 `a7214a03…`（nb-02 与 r1 逐字节一致的结论属实，仅引用值错）。下次触碰改正。

## 边界

未改源码/作者正文/candidate/全局总账；未回写旧 seal（nb-02 r0 交付与 QA 报告保留）；NOT_RUN；运行期行为（可见帧数、报错文案表现、重试环次数、双 AuthorWizard 交互）保持未知。accepted 仅限静态文档 scope。
