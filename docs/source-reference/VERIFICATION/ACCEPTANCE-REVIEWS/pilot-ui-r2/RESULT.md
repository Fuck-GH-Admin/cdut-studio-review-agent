# pilot-ui-r2 独立勘误复验结果（accepted）

- 批次：`pilot-ui-r2`（revisionOf `pilot-ui-r1`，8 文件）；冻结 `05fb2565e20eb1760233696be1832f68196b37c2`
- 复核者 `docs-r07-qa-ui-20261023`；作者 `docs-r07-author-ui-20261023`；时间 2026-10-23T15:40:25Z
- **batchVerdict: accepted**（8/8）。7 条 errata 全部 closed；2 条新低级备注（N-R2-1/N-R2-2）需 G4 前关闭，不阻断本批。
- NOT_RUN：bun test / typecheck / build / Electron·GUI / 真实模型。测试断言不等于已运行。

## 封版绑定（sha256，取 ZIP 内 stage 字节）

READY `a3ab4029…`、DONE `4d83f3d8…`、MANIFEST `7682bbc4…`、ZIP `e93cf931…`（128004 B，44 entries）；父批 r1（READY `c913ce96…`/ZIP `6c5c8359…`）字节未动。

## G0（PASS）

四方手册哈希 8/8 全等；before/ 4 篇 = r1 字节；4 篇未变 = r1 accepted 逐字节；changes.diff 从 r1 stage 重放 8/8 一致；ZIP 无穿越/符号链接、unzip -t 无错误、元数据 ZIP==目录、stage 无漂移；8/8 source blob+sha 与冻结树一致；START.json（N-META-1）路径/before/assignmentSha256 与实际一致。

## G1（PASS）

8/8 front matter 11 键且与源一致；7 篇 source 11 章、1 篇 test 6 章；三态/NOT_RUN/覆盖表齐；全 stage+UNVERIFIED 无「一帧/帧数/frame」实测性表述。

## G2：7 条 errata closure（逐条回源）

| ID | 复核要点 | 判定 |
| --- | --- | --- |
| N-WB-1 | `ReviewV3AuthorWizard.tsx:37` 两参签名 / `:39` initialRevision（nl 实测）；4 处已改，stage 残留 :39 = 0 | closed |
| N-WB-2 | `key={` 实测 5 处，materialsEpoch 仅 `:429`/`:452` 两个 | closed |
| N-CV-1 | `setActivePane` 写点 `:124` + `:331-333`（PaneTab） | closed |
| N-CT-1 | `:105-106` 写 plan、`:108` deps、`:113` 条件、`:119` deps → 停止三类 + 「templates 变化=再触发」方向正确 | closed |
| N-META-1 | START.json 实际 r2 路径 + before 4 篇事实，r1 未回写 | closed |
| PUI-ET-N1 | 「永不全抛」→「对常规输入不抛错（例外见 §6）」 | closed |
| PUI-ET-N2 | `String(error ?? '')` 例外语义经独立 Node 语义复核一致（Object.create(null)→TypeError；toString 抛错→外抛；Symbol→'Symbol(x)'） | closed（主断言） |

## 逐文件 verdict（exact manual SHA）

| 文件 | manualSha256 | verdict |
| --- | --- | --- |
| ContentReviewView.tsx.md | `57fed7cbc24e43ca73987e810b30bb9e021df78b69d39ee0e3d06b6690939841` | accepted |
| ReviewSettingsPanel.tsx.md | `56bba7fcfb708381122db63e5df713e8685ac2cb26f1ff14a0a048513341b95d` | accepted（未变） |
| ReviewV3CaseTaskView.tsx.md | `b6143d346ee879932aaefc16cc8331230d3d4e0d5c792464d3f53eb78f780df6` | accepted |
| ReviewV3LocalCandidateWorkbench.tsx.md | `fce7fdea1d6884f8a4d2643523fc3d5957db762fbdd5dacd1f66908e69bcd26d` | accepted |
| review-error-text.ts.md | `f372235da13ba91a2fa3bc2463cbd1454c7183dad21b0c817ff6436ba86a2f6b` | accepted（2 low notes） |
| review-error-text.test.ts.md | `9f03da5ff12055305ad1f9a097231fddc56ff6576d47aac5c4e6a675fee9415d` | accepted（未变） |
| review-atoms.ts.md | `908d1a9d64c3e0a748f34f75d05e617d88f0756f5bf98bcde7f01b6cf575c2e8` | accepted（未变） |
| ReviewFirstUseReadiness.tsx.md | `fa012e6b7301b1c0cfd9d31d4e5330d558ce5f5fa5f99f5fd5fd402be7c88848` | accepted（未变） |

## 新增非阻断备注（G4 前关闭）

1. **N-R2-1**（review-error-text 手册 `:121`）：代码引号残缺 `` `String(error ?? )` ``（缺 `''`；`:44`/`:113` 与源 `:41` 均为 `String(error ?? '')`）。
2. **N-R2-2**（同 `:121`）：「Error 子类覆写 message getter 抛错同样外抛」需限定——`super(msg)` 写 own `message` 属性遮蔽原型 getter（独立语义复核 `new E2('x').message`→`'x'`）；仅未传 message/非 Error 对象时 getter 才触发。

均属引用精度/限定语，不反转行为结论；建议下次触碰或编辑性小修一并关闭。

## 边界

未改源码/作者正文/candidate/全局总账；未回写任何旧 seal；未跑产品测试/GUI/真实模型（NOT_RUN）；1 次独立 Node 语言语义复核（非产品运行）。accepted 仅限静态文档 scope。
