# D4 P1-A/B｜Electron 虚拟屏实机操作与独立验收任务书（2026-10-18）

> **本文件是本机执行依据，不是通过声明、CI 报告或学校业务授权。**
> 用户已批准先完成 P1-A/B 再做 P1-C/P2；本任务仅验收 PR #104 的真实可操作性、D2 建案落盘与来源边界。**不调用在线模型、不跑 P06、不修校方制度、不生成正式审批结果。**

## 0. 固定输入与退出判词

- 仓库：https://github.com/Fuck-GH-Admin/cdut-studio-review-agent
- 待测 PR：[#104](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/pull/104)
- 待测代码父版本：PR #100 \`b5a1bde69b04832a3ce5625b9577a8b50e626f13\`
- P1-A/B 最后一次已获完整 CI 通过的**代码提交**：\`639dd5ea47853e820590f72fca2eb643ebdf23c4\`。
- 执行前必须重新检查 #104 远端 HEAD、父版本、修改文件与 CI；**以实际检出的代码/文档提交 SHA 记录本次冻结基线**。若后续只是新增此验收文档，可记录文档提交作为测试 HEAD，并对比所有生产文件与上述通过的代码提交相同；有其他生产变更则重新确认范围，不默默测试浮动版本。
- 上次远端证据：#104 同代码 SHA 的 [PR CI 39092898924](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39092898924) 和 [D4 统一集成 39092898935](https://github.com/Fuck-GH-Admin/cdut-studio-review-agent/actions/runs/39092898935) SUCCESS，后者 3720 pass / 6 skip / 0 fail，50 个 candidate-held；**均非本次 GUI 证据**。
- 产品源码入口：
  - \`apps/electron/src/renderer/components/content-review/CaseManagerBar.tsx\`（工作台“新建审核项目”）
  - \`CreateCaseDialog.tsx\` → \`D4CaseSetup.tsx\` → \`D4GenericObjectForm.tsx\`
  - \`apps/electron/src/main/lib/review/review-d4-client.ts\`、\`review-d4-client-validation.ts\`
  - \`apps/electron/src/main/lib/review/review-d2-runtime.ts\`
  - \`apps/electron/scripts/review-d4-product-loop.ts\`（唯一优先使用的隔离启动器）
- 本轮验收结论可为：\`PASS_GUI_AND_D2\` / \`PARTIAL\` / \`FAIL\` / \`BLOCKED_ENV\` / \`NOT_RUN\`；缺真实可见 GUI 操作或者 D2 实际读回，就不能给 PASS。

## 1. 安全隔离与启动（由本地 Agent 真实执行）

### 1.1 冻结工作树

1. 检查 \`git status --short\`、\`git worktree list\`、远端 PR #104 HEAD 与 CI；原正在使用的 worktree 不得覆盖。
2. 从已经冻结的 #104 提交创建**独立 detached checkout/worktree**；在报告中记录 \`git rev-parse HEAD\`、\`git status --short\`、OS、Bun/Node、Electron 包版本、虚拟屏 \`DISPLAY\`、进程 PID、构建和启动命令/退出码。若 #104 有并发新代码，先核对，不进行隐式 rebase、cherry-pick 或强推。
3. 非必要不安装额外 npm/bun 依赖；依赖使用锁文件：\`bun install --frozen-lockfile\`。此前 CI 已通过，**不要再次运行 50 套业务模型审核或全仓 A/B/C/D/E**。
4. 使用**新 Xvfb 显示号**（示例 \`:109\`，先检测是否占用）、真实 Electron 窗口；建议分辨率 1600×1000×24 或更大。不得把仅调用 IPC/React 单元测试冒充 GUI。
5. 启用本机回环 CDP（示例 \`D4_CDP_PORT=9229\`，先检测端口空闲），不得将远程调试端口绑定外网。优先通过现有 Playwright/CDP 或系统级鼠标键盘自动化真实点击；只允许**只读**的 CDP/Preload API 取回 D2 结构，不允许用 \`window.reviewAPI.createCase\`、\`importDocumentFromPath\` 或直接写 DB 来替代 UI 操作。
6. **本轮不需要在线 Provider/API Key**。新建一个空目录作为 \`--model-config\` 源（不复制宿主 \`~/.cdutai-dev\`），不登录真实校务账号。若必须经过首次引导，只能按当前应用提供的离线演示路径操作，不绕过身份或安全边界。
7. 启动器每次都会新建 \`/tmp/cdut-d4-product-loop-*\` 的 config/user-data，退出后保留用于私有取证；不能把二次启动自动视作同一 profile 的持久化测试。重载 Renderer 可在同一次应用进程内按 Ctrl+R 检查状态恢复。

建议**等价命令**（可根据本机实际工具路径调整，并将真实命令记录到报告）：

~~~bash
git fetch origin feat/d4-p1-real-case-input-r01
# 用已核实的固定 SHA 创建独立 worktree；不要在正在工作的主 worktree 跑
git worktree add --detach ../cdut-d4-p1ab-gui <FIXED_PR104_HEAD_SHA>
cd ../cdut-d4-p1ab-gui
bun install --frozen-lockfile
mkdir -p .local-evidence/d4-p1ab-gui/empty-model-config
# 先确认显示号与调试端口未占用；必要时选择其他值
Xvfb :109 -screen 0 1600x1000x24 -nolisten tcp > .local-evidence/d4-p1ab-gui/xvfb.log 2>&1 &
export DISPLAY=:109
export D4_CDP_PORT=9229
# 以下命令在 worktree 的 apps/electron 目录执行，输出落本地原始日志
cd apps/electron
bun run review:d4:dev --model-config "$(cd ../../.local-evidence/d4-p1ab-gui/empty-model-config && pwd)"
~~~

- \`review:d4:dev\` 会自动执行 typecheck、Main/Preload/resources/OOXML 构建、Vite/Electron 启动；如果必要的 Linux SUID sandbox helper 报错，**只有隔离虚拟环境允许**才追加 \`--no-sandbox\`，同时记录首次错误及此降级的环境理由；此参数仅解决 Electron 开发沙箱启动，不得放宽业务工具权限。
- 若没有 Xvfb/CDP 可用，查清本机实际安装能力后采用等价隔离 GUI 工具；无法真实启动则 \`BLOCKED_ENV\`，不要伪造截图或用无头服务测试代替。
- 不杀其他进程、不清空宿主 user-data、不复制生产 profile。截图前确保窗口确实显示的是本轮 Electron、不是 Vite 网页模拟。
- 录屏可选，**关键步骤截图必需**。CDP/Playwright 只需连接 \`127.0.0.1:<port>\` 并选择真实 CDUT Studio 页面，不要求新增依赖。

## 2. 最小主路径：G03-T01 三对象真实操作（必须）

先从当前客户端**实际点击**“CDUT 专区 → 材料审核 → 新建审核项目”，勾选“使用 D4 技术预审”，填写：

- 标题：\`P1AB-GUI-G03-20261018\`
- 申请人：\`合成测试申请人\`
- 学年：\`2026-2027\`
- 模板：\`g03-t01\`（公共教学教室临时借用，界面列表中可用 ID 定位，不根据菜单顺序猜）

按以下**可观察顺序**逐步操作，尽量少用 sleep，优先等待元素出现/状态改变；界面滚动到最底部再检查确认按钮：

| ID | 真实 GUI 动作 | 必须观察到 | 证据 |
|---|---|---|---|
| G-01 | 选中 g03-t01、尚未添加对象 | 0 对象、可见“添加对象”；“确认 D4 对象和条件”不可勾选；“创建项目”不可提交；不得自动载入两件合成对象 | \`01-empty-form.png\` |
| G-02 | 点击“添加对象” | 出现第 1 个对象；名称为空、主场景仍显示“请选择主场景…”；8 个条件初始皆“未知·待核”；对象 ID 只读且有值 | \`02-first-defaults.png\` |
| G-03 | 填写对象 A“图书馆教室·上午”，主场景 \`p-public-classroom\`；\`c-exam-period=applicable\`、\`c-holiday=not-applicable\`，其他 unknown | 可编辑的名称、互斥主场景与独立三值字段正确；不因为一项确定就把其他 unknown 改为 false | \`03-first-edited.png\` |
| G-04 | 再添加 B“研究生教室·下午”并选 \`p-graduate-classroom\`；添加 C“委托教室·晚间”选 \`p-delegated-classroom\`，其 \`c-multimedia=applicable\` 其余 unknown | A/B/C 三个不同 Subject/objectKey（只读输入可观察）；不存在对象数据互相覆盖 | \`04-three-objects.png\` |
| G-05 | 删除 B；再添加 D“研究生教室·新增时段”，主场景 \`p-graduate-classroom\`；D 的 \`c-holiday=applicable\`，其余 unknown | 总数仍为 3；保留 A/C 的原值；新 D ID 与已删 B 的 ID 不重复；UI 无残留 B | \`05-delete-add.png\` |
| G-06 | 勾选“确认 D4 对象和条件”，再修改 D 的一个条件（例如 \`c-holiday\` 改成 unknown），随后重新选择 applicable | 一旦修改，确认复选框自动取消，“创建项目”重新不可提交；手动再次确认后才恢复可提交 | \`06-confirm-reset.png\`、\`07-reconfirmed.png\` |
| G-07 | 确认并用“创建项目”**通过真实 UI 提交** | 对话框关闭、显示成功或已创建案卷、当前工作台选择该案；无错误 Toast、窗口无白屏；没有上传文件或启动 Pi | \`08-created-workbench.png\` |
| G-08 | 在**不退出此隔离 profile**前进行 Ctrl+R（若当前环境支持渲染重载）；从案卷列表重新进入刚创建的案卷 | 名称/对象/Plan 与重载前一致、无重复案卷、不会丢失或重新编译旧案的 Check | \`09-reopened.png\` |

记录可选的 accessible 文本，用真实选择器：\`aria-label="D4 技术预审模板"\`、\`aria-label="对象 1 名称"\`、\`aria-label="对象 1 主场景"\`、\`aria-label="对象 1 条件 c-exam-period"\`、\`aria-label="确认 D4 对象和条件"\`，以及 \`data-testid="d4-object-form"\`。**这些名称来自现有源码，但若运行版不同，应记录实际 DOM/截图，不编造控件。**

注意：上述最终对象是 A、C、D；对象内部 ID 自动随机生成，**不规定固定字符串**，只验唯一性和持久性。主场景与条件标签可能包含中文和 ID；通过实际选项 value 断言，不依赖英文外观。

## 3. 同一真实进程内，只读取回 D2 账本（必须）

**这一节必须发生在 G-07 真实 UI 建案成功之后**。Renderer 通过 preload 暴露 \`window.reviewAPI.listCases()\`、\`window.reviewAPI.getAggregateV2(caseId)\`、\`window.reviewAPI.listRunsV2(caseId)\`，可在 CDP 对当前真实页面作**只读查询**；记录经过 Main IPC 返回的结果及调用返回时间。不能用从作者态 JSON 直接计算出来的“预期 Plan”代替真实案卷。

记录受控字段（禁止导出含凭证的完整应用状态）：

~~~ts
const cases = await window.reviewAPI.listCases()
const target = cases.find(c => c.title === 'P1AB-GUI-G03-20261018')
if (!target) throw new Error('GUI-created case not found')
const aggregate = await window.reviewAPI.getAggregateV2(target.id)
const runs = await window.reviewAPI.listRunsV2(target.id)
const result = {
  caseId: target.id,
  templateId: aggregate?.caseV2.templateId,
  templateVersion: aggregate?.caseV2.templateVersion,
  mode: aggregate?.d2RuntimePlan?.mode,
  publicationAllowed: aggregate?.d2RuntimePlan?.publicationAllowed,
  fingerprint: aggregate?.d2RuntimePlan?.fingerprint,
  targets: aggregate?.d2RuntimePlan?.targets?.map(t => ({
    objectKey: t.objectKey, subjectId: t.subjectId,
    title: t.title, scenario: t.scenario, conditions: t.conditions?.map(c => ({
      id: c.id, applicability: c.applicability, decidedBy: c.decidedBy,
      sourceId: c.sourceId, sourceVersionId: c.sourceVersionId,
    })),
  })),
  subjects: aggregate?.caseV2.subjects?.map(s => ({ id: s.id, title: s.title })),
  rulesCount: aggregate?.d2RuntimePlan?.rules?.length,
  mappingCount: aggregate?.d2RuntimePlan?.mapping?.length,
  evidenceLinkCount: aggregate?.evidenceLinks?.length,
  runCount: runs?.length,
}
~~~

如实际接口版本变化，先核对 preload 类型与可见对象后做等价**只读**快照。严禁将此片段用于写入案卷。

**断言：**

- \`caseId\` 为真实有效 ID；\`templateId=g03-t01\`、\`mode=technical-pre-review\`、\`publicationAllowed=false\`、\`fingerprint\` 非空。
- \`targets.length===3\`；\`subjects.length===3\`，两组 ID 唯一且逐对象对应；A/C/D 名称、场景保留；不存在已删 B；每个对象包含完整的 8 个条件。
- 初始 unknown 保留为 \`applicability=unknown, decidedBy=undetermined\`；已明确勾选的适用和不适用分别对应 \`reviewer\`；每个来源 \`sourceId/sourceVersionId\` 来自冻结 D1 选择锚点，**不是可信校方审批或真实注册记录**。
- \`mappingCount>0\`、\`rulesCount>0\`，并确认三对象都有相应责任映射（不要要求 unknown 一定展开为独立语义 Check；D2 仍可能按模块任务适用性裁剪）。
- 新案 \`evidenceLinkCount===0\`、\`runCount===0\`（未导入文件、未执行模型）。**不得通过伪造空的 107/107 结果充当验证。**
- Ctrl+R 后再通过 Main 读取同一个 caseId 和 fingerprint；若重载确实导致应用退出，记录这一事件，不得改用新启动器产生的新 profile 冒充恢复测试。
- 保存 \`evidence/g03-aggregate-readback.json\`、\`evidence/case-list-readback.json\`（只导出本轮受控匿名案卷）及必要截图；文件 SHA-256，记录来源为 \`IPC_READBACK\`。

## 4. 快速边界检查（只需少量 GUI 操作）

| ID | 操作 | 必须观察到 / 不应误判 |
|---|---|---|
| B-01 | **G08-T02** 新建另一个合成案卷，模板改为 \`g08-t02\`，新增两个对象：A 主场景 self，B 主场景 proxy；将 A 的 valuable=not-applicable，B 的 valuable=unknown、dispute=unknown；其余默认 unknown。双方分别命名“失物甲 / 失物乙” | 能正确显示两对象、不同主场景，unknown 不自动变为 false。确认建案后通过 Main 只读看到两个独立 Subject；**不需要**运行 G08 107 项在线审核，不上传 PR #100 的“含答案”合成材料。截图 \`10-g08-two-objects.png\`；回执 \`g08-aggregate-readback.json\` |
| B-02 | **G01-I** 打开新建对话框，选 \`g01-student-identity-correction\` | 明确看到“特殊对象合同/独立受控技术输入”说明和“合成学籍快照”选项；不能把学籍字段当成随意新增的 generic-object，且默认不加载真实学校 registry。只检查展示和边界即可；截图 \`11-g01-special-boundary.png\`。如确认尝试建案，须仅使用随包 synthetic fixture，记新案和来源。 |
| B-03 | 再次打开 G03 新建表单：空对象、未选主场景、空名称三个状态逐一试验 | 不能绕过“确认”直接创建 D2 案卷；不应出现新案 ID。截图/只读案卷列表证明。 |
| B-04 | 对已有 G03 固定案卷尝试通过公开 UI 修改其模板/条件，或在新建向导重新选择不同条件并建新案 | 已有固定案卷模板应不可改；重新建案的 caseId / Plan 不得复用原案。由于新建对象 ID 本身随机，**两个 Plan fingerprint 不同并不能单独证明“只由条件改变”**；此因果关系依赖已通过的定向 service 测试。无需为了该证明强行修改现有 Plan。 |

若 G08/G03 当前某一作者态缺合法 \`businessTypes\` 或可信的冻结情景来源锚点，UI 应明确禁止添加并说明原因：**把它记录为 TEMPLATE_BLOCKED**，而非伪造源或削弱 Main 校验求绿。G01-I 不要求正式教务网在线交互。

## 5. 人机界面质量与安全边界

验收不只看能点击成功，还要记录：

- 窗口/弹窗可见，1600×1000 下所有主要控件能通过正常滚动触达，不被 Dialog footer 遮挡；长对象表单的删除按钮不会误删相邻对象；
- 同一对象名称、主场景、条件的标签或 aria-label 不串对象；鼠标和键盘操作状态一致；
- UI 变更后复选框撤销，不能因 React 状态异步而出现“已确认旧内容却提交新 Plan”；
- no console **uncaught** error、no renderer white screen、无无休止 loading；如有非致命 warning 记录原文和影响，不一律当 FAIL；
- model provider 不配置/不调用；不为拿截图开启真实账号、不把 synthetic source 当校方制度；\`candidate-held\`、\`technical-pre-review\`、\`publicationAllowed=false\` 恒成立；
- 本轮**不**验 P1-C 自动路由/20 秒倒计时、P2 Token 优化、P06 Main-owned owner/IPC、OFFICE #71、50 套业务准确率、签章与学校最终审批。

## 6. 必须留存的证据、问题处理和交付

### 6.1 本机原始证据（私有）

在独立 worktree 下使用 \`.local-evidence/d4-p1ab-gui/\` 保存以下**原始材料**；这里不能进入公开 Git：

- 启动、构建、stderr/stdout 原日志（包含首次失败），\`DISPLAY\`、PID、端口、实际命令和退出码；完整 CDP session 的 raw 信息如含 cookies、个人账户、配置或 transcript，**仅私有**。
- 全套真实 GUI PNG（第 2～4 节重点图）；可附短视频但不是必要条件。
- 原始只读 Main 回执、同进程重载前后比对、全量 \`sha256sum\` manifest；可在私有区完整保存样本。
- 失败时 screenshot + 操作序列 + 错误 Toast/Console + Main 拒止错误码 + 首次失败 commit/hash；绝不能用只拍最终绿屏替代首败。

### 6.2 可公开提交的脱敏证据（Agent 应在独立验收分支提交）

建议目录：\`docs/design/review-agent/acceptance/d4-p1-ab-gui-r01/\`

- \`REPORT.md\`：操作设备、版本、环境、实际命令（去密钥/私人目录）、G/B 各项 PASS/FAIL/BLOCKED 判词、首败与复现、问题归属、截图索引、计划后续。
- \`evidence/verification.json\`：机器可读字段：\`scope\`、\`sourceCodeHead\`、\`testedHead\`、\`worktreeClean\`、\`guiObserved\`、\`mainIpcReadback\`、\`cases\`、\`checks\`、\`failures\`、\`unrun\`、\`verdict\`。
- \`evidence/*.png\`：至少空表单/默认 unknown、三对象、删除重加、确认撤销、建案成功、G01-I 特殊边界的真实截屏（可按表中命名）；不得使用设计图/合成截图。
- \`evidence/g03-aggregate-readback.json\`、\`g08-aggregate-readback.json\`、\`SHA256SUMS\`：仅保留本轮 synthetic caseId、对象/条件/技术指纹等必要字段；严禁上传账号头像/学号、token、校务数据、原始模型配置。
- 报告中对每个判词标证据级别：\`GUI_OBSERVED\`、\`IPC_READBACK\`、\`CI_HISTORICAL\` 或 \`NOT_RUN\`。没有真实截图和原始 Main IPC 读回，不能写 \`PASS_GUI_AND_D2\`。

### 6.3 分支与责任

- 为避免覆盖 PR #104 代码，Agent 在本机**从本任务文档所在固定 SHA**新建 \`audit/d4-p1ab-gui-r01\`（如该名已占用，改 \`-r02\` 并注明）；只提交本轮脱敏验收证据和报告，并建 **Draft PR，base 为 \`feat/d4-p1-real-case-input-r01\`**。不要修改 #104、PR #100、main、P06 等。
- 若真实 GUI 首败，先存证、给最短复现，再判 \`FAIL\` / \`PARTIAL\` / \`BLOCKED_ENV\`；**不要暗改生产 UI、放宽验证、改 Gold、删失败日志、强行给 PASS**。如确需代码修复，应另提修复建议/独立分支等待用户确认。
- 必须明确分开三件事：**UI 能编辑**、**Main 确实创建了固定 Plan**、**Pi/学校审批**。第三件事**不在本轮验收范围**。
- 报告必须包含：已验证事实、不通过项、未运行项、是否建议进入 P1-C。准入仅代表 **P1-A/B GUI + D2 真实运行输入可用**，不代表后台审核或业务授权通过。

## 7. 完成定义（严格）

\`PASS_GUI_AND_D2\` 仅在同时满足时签署：

1. 独立 Electron/Xvfb 真实窗口与真实鼠标键盘/CDP 操作可证明，且主路径 G-01～G-08（G-08 若环境限制则报告 PARTIAL）；
2. G03 A/C/D 最终三个对象各自名称、主场景、三态条件保留；修改后确认失效，重新确认才能提交；
3. Main 只读回执有真实 caseId、D2 fingerprint、3 Subject/完整条件、非空规则与映射、0 EvidenceLink、0 Pi run；
4. G08 的两个独立对象和 G01-I 的特殊合同边界经过真实 GUI 观察；
5. 无伪造校方授权、跨案事实、模型调用或不当修改冻结样本；全部截屏与机器回执指向**同一次真实运行**并保存原始指纹。

如仅通过第 1/2 条而无法得到 Main 读回，记 \`PARTIAL/IPC_READBACK_NOT_RUN\`；若 GUI 完全不能启动，记 \`BLOCKED_ENV\` 并保存构建/显示错误。**不得把此前 3720 个 CI PASS、PR #100 G08 在线运行或者 HTML 单页演示替代此次验收。**
