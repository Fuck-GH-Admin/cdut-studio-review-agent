---
path: apps/electron/src/renderer/components/content-review/review-error-text.ts
frozenSha: 05fb2565e20eb1760233696be1832f68196b37c2
blob: b3aca15c799303c2eec541f3b45befdad1008948
sha256: 58d1c094ce5f1f270652077798bf17b953b780a9f2e00393ff9fa7ea6e0b1b16
lines: 55
kind: source
package: p08-renderer-ui
author: docs-r07-author-ui-20261023
reviewer: p03-integrations
status: authored
evidence: static
---

# apps/electron/src/renderer/components/content-review/review-error-text.ts

## 1. 结论与边界

审核错误的**展示层翻译**：把 Main 抛出的内部错误码、Electron IPC 外壳（`Error invoking remote method '…': Error: …`）转换成普通用户能读懂的一句话（`apps/electron/src/renderer/components/content-review/review-error-text.ts:1-8`）。

纯函数模块，无状态、无 IO、无 React 依赖。唯一导出是 `humanizeReviewError`（`:40`）。

明确不做的事（由文件头注释与本文件实现共同界定）：

- **不改变错误语义、不放宽门禁**（`:6`）；只是文本替换。
- **不吞掉未识别错误**：未命中规则时去掉错误码前缀后**原样透出**（`:54`），避免「为好看而掩盖真实原因」（`:7`）。
- **不做日志/上报**：无 console、无遥测。

## 2. 导出与关键符号

`export` 行仅 `:40`；其余为模块内私有常量。

| 符号 | 类型 | 行 | 签名/形状 | 说明 |
| --- | --- | --- | --- | --- |
| `humanizeReviewError` | 导出函数 | `:40-55` | `(error: unknown) => string` | 唯一导出；`unknown` 入参，对常规输入不抛错（例外见 §6） |
| `IPC_WRAPPER` | 内部 const RegExp | `:11` | `/^Error invoking remote method '[^']*':\s*(?:Error:\s*)?/i` | 只匹配**开头**的 Electron 外壳 |
| `ERROR_CODE_PREFIX` | 内部 const RegExp | `:13` | `/^[A-Z][A-Z0-9_]{3,}(?::\s*)/` | 开头大写错误码 + 可选冒号；至少 4 字符 |
| `RULES` | 内部 const 数组 | `:15-37` | `Array<{match: RegExp; text: string}>`，共 **19** 条 | 顺序敏感，先命中先返回 |

## 3. 内部逻辑与关键流程

执行顺序（`:40-55`）：

1. **取原文**：`error instanceof Error ? error.message : String(error ?? '')`，然后 `.replace(IPC_WRAPPER, '').trim()`（`:41-43`）。`null`/`undefined` 变成 `''`；数字变成其字符串。
2. **空串短路**：`if (!raw) return ''`（`:44`）。因此 `humanizeReviewError(undefined) === ''`。
3. **`LOCAL_D4_TEMPLATE_ALREADY_BOUND` 特判**（`:46-50`）：
   - 前缀存在时尝试剥掉 `^LOCAL_D4_TEMPLATE_ALREADY_BOUND:\s*`；
   - 若剥掉后与原文不同（即确实带 `: 原因`），返回**原因原文**（保留 Main 写好的可读说明）；
   - 若相同（只有裸错误码），返回固定句「当前案卷已绑定其他审核模板，请新建一个未绑定模板的案卷后再试」。
   - 该分支在 `RULES` 循环之前，优先于其它规则。
4. **顺序匹配 `RULES`**：`for (const rule of RULES) if (rule.match.test(raw)) return rule.text`（`:51-53`）。注意是 `test`（不要求整串匹配），因此带具体原因的错误也会命中。
5. **兜底**：`raw.replace(ERROR_CODE_PREFIX, '').trim() || raw`（`:54`）——去掉开头错误码后若为空，返回**未去码的原文**。

### 3.1 `RULES` 全表（19 条，`:15-37`）

| # | 行 | 匹配 | 输出 |
| --- | --- | --- | --- |
| 1 | `:16` | `T05_ACTOR_NOT_ASSIGNED_TO_STAGE` | 当前身份不能办理这个阶段；请切换到对应身份（初审用审核员，终审用终审教师） |
| 2 | `:17` | `T05_CURRENT_REAL_RUN_REQUIRED` | 还没有针对当前材料的审核运行结果，请先点「按模板规则检查」 |
| 3 | `:18` | `无与当前原件一致的有效审核运行` / `没有与当前原件一致的有效审核运行` | 材料已变化，需要重新检查一次 |
| 4 | `:19` | `T05_REQUIRED_CHECKS_NOT_RESOLVED` | 还有检查项没有结论，不能直接通过 |
| 5 | `:20` | `T05_UNRESOLVED_SUPPLEMENTS` | 还有补件没有处理完，请先处理补件 |
| 6 | `:21` | `T05_DECISION_REASON_REQUIRED` | 请填写处理理由，便于后续追溯 |
| 7 | `:23` | `^AGENT_DECISION_DISABLED:?\s*$`（**锚定整串**） | 这类审核方案只做技术检查，不能代替学校正式审批 |
| 8 | `:24` | `D2 模板失去受控候选资格` / `这套审核方案只能用于尚未绑定模板的新案卷` | 这套审核方案只能用于尚未绑定模板的新案卷；当前案卷已绑定其他模板，请新建案卷后再试 |
| 9 | `:26` | `LOCAL_D4_CASE_AND_SCENARIO_REQUIRED` | 请先选择审核方案，并确认要审核的对象和场景 |
| 10 | `:27` | `LOCAL_D4_NATIVE_DRAFT_CASE_REQUIRED` | 只有尚未开始、也未固定审核任务的草稿案卷才能套用这套方案 |
| 11 | `:28` | `LOCAL_D4_CANDIDATE_NOT_FOUND` | 这套审核方案在本机已不可用，请重新选择 |
| 12 | `:29` | `LOCAL_D4_EXISTING_ITEMS` | 当前案卷已有审核事项，请为这套方案新建一个草稿案卷 |
| 13 | `:30` | `LOCAL_D4_PLAN_INVALID` | 这套方案与当前案卷不匹配，未能安装审核任务；请换一套方案或新建案卷 |
| 14 | `:31` | `LOCAL_D4_STUDENT_FIXTURE_SCOPE_INVALID` | 只有学籍信息更正的方案可以使用演示学籍数据 |
| 15 | `:32` | `缺少必需材料` / `缺少必交材料` | 还缺少模板要求的材料，请先上传后再提交 |
| 16 | `:33` | `请先在上方「材料槽」` | 请先选择材料要归到哪一项要求下 |
| 17 | `:34` | `T07_STATE_NOT_INITIALIZED` | 这个批次还没有开始评分，请先点「建立评分轮次」 |
| 18 | `:35` | `REVISION_CONFLICT` / `VERSION_CONFLICT` | 这条记录刚被其他操作更新，请刷新后重试 |
| 19 | `:36` | `T04_BINDING_SET_MISMATCH` / `T04_CHECK_BINDING_MISSING` | 模板规则与本次检查范围不一致，请重新发布模板后再试 |

第 7 条的锚定是有意的：注释说明「只有错误体就是光秃秃一个错误码时才翻译；带具体原因的保留原因，只去掉码」（`:22`）。因此 `AGENT_DECISION_DISABLED: D2 模板失去受控候选资格` 不会命中第 7 条，而会命中第 8 条。

### 3.2 顺序敏感的例子

- `LOCAL_D4_TEMPLATE_ALREADY_BOUND: 当前案卷已绑定「综合测评模板」…` → 走 `:46-50` 特判，返回带书名号的原因原文；**不会**落到第 8 条（`D2 模板失去受控候选资格`）也不会被兜底去码。
- `OUT_OF_TOOL_BUDGET: 超出预算` → 不命中任何规则 → 兜底去掉 `OUT_OF_TOOL_BUDGET: ` → `超出预算`。

## 4. 调用者与调用链

**入向（6 个组件、11 处调用）**

| 调用方 | 调用点数 | 代表行 |
| --- | --- | --- |
| `ReviewV3CaseTaskView.tsx` | 5 | `:64`、`:80`、`:92`、`:117`、`:128` |
| `ReviewV3T05HumanWorkflow.tsx` | 2 | 本批未逐行读，仅统计 |
| `ContentReviewView.tsx` | 1 | `:177`（发布模板失败） |
| `ReviewV3LocalCandidateWorkbench.tsx` | 1 | `:184`（安装 D4 方案失败） |
| `ReviewV3TemplateRoutingAssistant.tsx` | 1 | 本批未逐行读，仅统计 |
| `V2CasePanel.tsx` | 1 | 本批未逐行读，仅统计 |
| `review-error-text.test.ts` | 8 个用例 | `:6-44` |

**出向**：无。本文件不 import 任何模块（纯正则 + 字符串）。

## 5. 数据 I/O、读写与副作用

- **输入**：任意 `unknown`；实际使用 `.message`（Error）或 `String()`。
- **输出**：`string`；可能为空串。
- **无**磁盘/网络/缓存/全局状态/定时器/监听器。
- **纯函数**：同输入必同输出（正则无 `g` 标志，无 `lastIndex` 状态）。

## 6. 分支、失败、取消与恢复

| 分支 | 行 | 结果 |
| --- | --- | --- |
| `Error` 实例 | `:41` | 取 `.message` |
| 非 Error（含 `undefined`/`null`/数字/字符串） | `:41` | `String(error ?? '')` |
| 空串 | `:44` | 返回 `''` |
| 带 Electron 外壳 | `:42` | 仅剥离开头外壳 |
| `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 带原因 | `:46-49` | 返回原因原文 |
| 裸 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` | `:48` | 返回固定句 |
| 命中规则 | `:51-52` | 返回规则文案 |
| 未命中 | `:54` | 去码后原文；去空则回原文 |

- **不会主动抛错，但有例外，不能承诺「绝不会抛」**：正常输入（Error、字符串、数字、`Symbol`、`null`、`undefined`）都不会抛——`String(Symbol())` 合法返回 `Symbol(x)`，正则均为字面量、无编译期风险。**但**当入参是无法转换为原始值的对象（如 `Object.create(null)`）或其 `toString`/`valueOf` 抛错时，`String(error ?? )`（`:41`）会把该错误向外抛出（已用语言语义验证：前者 `TypeError: Cannot convert object to primitive value`，后者原样外抛）；自定义 `Error` 子类若覆写 `message` getter 抛错同样外抛。本文件不 catch 这一层。
- **取消/恢复**：不适用（无异步）。
- **失败后状态**：无状态可污染。

## 7. 权限与权威状态

- 无权限分支，依据：本文件无 sender/role 检查、无 IPC、无文件访问。
- 权威状态：错误码与可读原因由 Main 产生；本文件只做**文本映射**，不判断该错误是否应阻断操作。真正的门禁在 Main 的服务层（例如 `review-ipc.ts:1504-1523` 的参数校验、`review-c0-authority.ts:21-27` 的 sender 校验）。

## 8. 修改影响面

- **6 个渲染层组件的用户可见文案**（见第 4 节表）；改规则文本会同时改变这些页面的提示。
- **测试**：`review-error-text.test.ts` 8 条用例直接依赖本文件的匹配行为（尤其 `:30-35` 的 `AGENT_DECISION_DISABLED` 双分支与 `:37-40` 的去码）。
- **顺序敏感**：在 `RULES` 中间插入更宽泛的规则会截胡后面的具体规则；新增规则应放在更具体规则之后，或使用锚定。
- **无类型/接口导出**，不产生编译期耦合；无存储/协议/迁移影响。
- **与 Main 文案的耦合**：第 8、9-14 条依赖 Main 抛出的错误码字符串（如 `LOCAL_D4_*`）；Main 改码名而本文件未同步时，用户会看到兜底去码后的原文，而不是友好文案。

## 9. 测试证据

直接测试文件：`apps/electron/src/renderer/components/content-review/review-error-text.test.ts`（46 行、1 个 `describe`、8 个 `test`）。逐条真实断言见该文件手册（`review-error-text.test.ts.md`）。此处只记覆盖关系：

- 覆盖：第 1 条规则（`:6`）、第 3 条（`:10`）、第 15 条（`:14`）、兜底透出（`:18`）、`LOCAL_D4_TEMPLATE_ALREADY_BOUND` 特判（`:21-28`）、第 7/8 条（`:30-35`）、第 12 条 + 兜底去码（`:37-40`）、非 Error 输入（`:42-45`）。
- **未覆盖**：第 2、4、5、6、9、10、11、13、14、16、17、18、19 条规则；`IPC_WRAPPER` 的大小写不敏感分支；`ERROR_CODE_PREFIX` 的「去码后为空则回原文」分支；`RULES` 顺序敏感性。
- **NOT_RUN**：本轮未执行测试。

## 10. 已证实 / 推断 / 未知

| 结论 | 等级 | 证据 |
| --- | --- | --- |
| 唯一导出 `humanizeReviewError(unknown): string` | 已证实 | `:40` |
| `RULES` 共 19 条，顺序匹配、先命中先返回 | 已证实 | `:15-37`、`:51-53` |
| 空串输入返回空串 | 已证实 | `:44` |
| `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 在规则循环前特判 | 已证实 | `:46-50` |
| 未识别错误只去码、不去内容 | 已证实 | `:54` |
| `AGENT_DECISION_DISABLED` 仅在裸码时翻译 | 已证实 | `:22-23`、测试 `:30-35` |
| 6 个组件共 11 处调用 | 已证实 | `grep -c "humanizeReviewError("` 逐文件统计 |
| 正则无 `g` 标志，无跨调用状态 | 已证实 | `:11`、`:13`、`:16-36` 均无 `g` |
| Main 侧错误码集合与本表完全对应 | 未知 | 只核到 `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 等少数码在 Main 出现；未穷举 |
| 去码后为空时返回原文是否会让用户看到裸码 | 已证实（行为）/未知（实际触发） | `:54`；未见真实错误体只有 4+ 字符码且无后续文本 |

## 11. 覆盖表

| 符号/分支 | 章节 | 行 | 状态 |
| --- | --- | --- | --- |
| `IPC_WRAPPER` | 3 | `:11` | covered |
| `ERROR_CODE_PREFIX` | 3、3.2 | `:13` | covered |
| `RULES` 19 条 | 3.1 | `:15-37` | covered |
| 取原文与 trim | 3 | `:41-43` | covered |
| 空串短路 | 3、6 | `:44` | covered |
| `LOCAL_D4_TEMPLATE_ALREADY_BOUND` 特判 | 3、3.2 | `:46-50` | covered |
| 规则循环 | 3 | `:51-53` | covered |
| 兜底去码 | 3、3.2 | `:54` | covered |
| 调用者清单 | 4 | — | covered |
| 测试覆盖关系 | 9 | — | partial |
| Main 错误码全集 | 10 | — | unknown |
