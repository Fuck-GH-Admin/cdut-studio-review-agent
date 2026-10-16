# adversarial-cases.md
# G08-T03｜最小反事实：官方事实 F／封闭模拟 S／校本未知 U

- 核验日：2026-10-16。本文件与 `independent-source-register.md` 同属**已接触 C/E 的旧会话完成的 POST_EXPOSURE 来源研究**；不具首次盲审资格。
- 不打开 C、D Gold、评分答案、旧 E 缺陷位置。用例事实完全虚构；除明确注明的官方平台政策外，不将测试条件当真实学校身份、时限或强制规则。
- 仅给出官方支持的**允许结论集合**，不生成与私有 Gold 对应的“唯一评分答案”。必须要可信平台记录的部分，若缺失则为 `U/REQUIRES_AUTHORITATIVE_FACT`，不把模型推断当学校已执行操作。
- `changedFact` 每组**仅一个受控事实变化**；其余学校、政策版本、原工单、证明材料、用户身份、时间均固定。
- 状态用自然语言表达，不证明实际平台枚举 ID 或接口权限。所有系统正式更新由有权人员或被授权系统执行；AI 只生成建议。

## CF-01｜首轮“一般＋继续”与“不满意＋继续”

- `dutyId`: G08-T03-E1-CF-01
- `sourceLocator`: https://www.sdaeu.edu.cn/bgs/info/1008/1912.htm 一（五），首次评价段。
- `applicability`: `F`山东农业工程学院接入的该平台；测试为`S`虚构校园、以该官方指南作为显式模拟政策。
- `given`: 有可信原工单、确已反馈的**第一次**处理结果、允许反馈的主体、原因文本已填写，`continueRequested=true`。
- `changedFact`: 唯一变化为 `rating=一般` ↔ `rating=不满意`。
- `expectedDecision`: 两案都允许按该平台规则进入**二次上报建议**；都不能无校方授权就自行写入已二次受理。
- `admissibleAlternatives`: 先待可信原单核查、再交有权平台执行；不可因一般而直接强制办结。
- `evidenceAnchors`: 第一次反馈的权威状态；评价枚举；继续办理选择；原因；平台版本。
- `failureMode`: 漏掉“一般且明确选择继续”的合法分支。
- `confidence`: HIGH 官方直读。`unresolved`: 实际平台API角色未验证；不适用于 CDUT。
- `reverseInterpretation`: 原文是**首次**评价；如果证据实际是第二次评价，不能继续沿用此期望，应切到 CF-03。

## CF-02｜评价“一般”时办结与继续办理

- `dutyId`: G08-T03-E1-CF-02
- `sourceLocator`: 同上，一（五）首次评价。
- `applicability`: 山东平台 `F` 或明确封闭模拟 `S`。
- `given`: 可信第一次处理结果反馈，评价为“一般”，填写理由，身份/平台/时点不变。
- `changedFact`: 仅 `continueRequested=false` ↔ `true`，即用户选择“办结” ↔ “继续办理”。
- `expectedDecision`: 前者办结；后者产生二次上报的程序建议；不能靠“评价分级”代替独立动作选择。
- `admissibleAlternatives`: 可信系统不可达→待操作记录核验。
- `evidenceAnchors`: rating / continueRequested / valid first response / official state.
- `failureMode`: 任一“一般”强制办结，或默认下一轮。
- `confidence`: HIGH。`unresolved`: 有权实际操作人和真实状态记录未验证。
- `reverseInterpretation`: 若用户根本未评价，不能凭缺值假设“选择办结”。

## CF-03｜首次与第二次均评价“一般”

- `dutyId`: G08-T03-E1-CF-03
- `sourceLocator`: 同上，一（五）同一段前后两组评价规则。
- `applicability`: 山东平台 `F`，封闭模拟 `S`；不外推成理。
- `given`: 用户有权评价；每轮结果均已由学校正式反馈，评价“一般”并填写原因；用户表单同时提出“希望继续”，这是*用户意愿而非生效平台命令*。
- `changedFact`: 仅 `feedbackRound=1` ↔ `2`。
- `expectedDecision`: 第一轮按有效选择可二次上报；第二轮“一般”依指南办结，不能简单继承“继续就第三次上报”。
- `admissibleAlternatives`: 如第二轮仍不满意可说明继续反馈渠道，但不承诺自动第三轮；需有权操作。
- `evidenceAnchors`: 可信轮次、原单、第一/第二次实际处理结果、选择、平台版本。
- `failureMode`: 把不同轮次的评价枚举映射合并为同一个状态机。
- `confidence`: HIGH。`unresolved`: 第二轮其他复杂政策例外未证。
- `reverseInterpretation`: 用户侧口头“继续”不能覆盖第二轮官方办结状态规定。

## CF-04｜二次评价由“一般”变为“不满意”

- `dutyId`: G08-T03-E1-CF-04
- `sourceLocator`: 同上，一（五）二次办理后评价语句。
- `applicability`: 山东平台 `F` 或仿照该规则的 `S`。
- `given`: 同一份已再次反馈的可信**二次处理**结果；身份、原因、文本、时点、系统权限均一致。
- `changedFact`: `rating=一般` ↔ `不满意`。
- `expectedDecision`: 一般按指南办结；不满意填写原因，由学校最终反馈，且指南指定在已办结栏目查看最终结果。
- `admissibleAlternatives`: 无可信结果/未获授权时只能建议查询或人工复核。
- `evidenceAnchors`: second_response_id、rating、reason、official case state.
- `failureMode`: 把二次不满意当成无限自动再次办理或直接满足“法定复核”。
- `confidence`: HIGH。`unresolved`: 真实第三轮系统能力无法由此推得。
- `reverseInterpretation`: “最终反馈”不是法院、申诉委员会等实体裁决。

## CF-05｜第10日默认办结的**反馈起算**而非提交起算

- `dutyId`: G08-T03-E1-CF-05
- `sourceLocator`: 同上，一（五）末段。
- `applicability`: 山东平台 `F` 或显式相同模拟 `S`；CDUT真实邮箱 `U`。
- `given`: `submittedAt=2026-09-01 09:00`，`now=2026-09-12 09:00`，用户始终没有评价；可信原单相同。
- `changedFact`: 唯一改变 `feedbackAt=2026-09-11 09:00` ↔ `2026-09-02 09:00`。
- `expectedDecision`: 前者自反馈仅一天，不能根据已提交11日自动判第10日默认满意；后者自反馈10日且仍未评价，符合该平台指南的默认办结**触发条件**（实际完成仍需权威系统日志）。
- `admissibleAlternatives`: 时间戳/时区/系统任务状态缺失→`PENDING_SYSTEM_CHECK`，不直接写已办结。
- `evidenceAnchors`: official_feedback_at、submitted_at、now、rating_state、effective_rule_version、system_event.
- `failureMode`: 以 submittedAt 替代 feedbackAt；错误把“应触发”当“已执行”。
- `confidence`: HIGH（文字起点）；`unresolved`: 具体边界时区、定时器行为未实测。
- `reverseInterpretation`: 若消息仅是工作人员草稿、并未反馈给用户，则 feedbackAt 不应采纳该值。

## CF-06｜办理中“学校尚未操作”与“学校已操作”撤回

- `dutyId`: G08-T03-E1-CF-06
- `sourceLocator`: 同上，一（三）末段。
- `applicability`: 山东平台 `F` / 明示模拟 `S`。
- `given`: 同一申诉人、同一办理中记录及撤回请求，事件时点/权限一致。
- `changedFact`: `schoolHasActed=false` ↔ `true`（权威后台状态）。
- `expectedDecision`: false 时可以按指南发起撤回，成功后转“未提交”；true 时不得根据这项指南承诺相同自动撤回能力，转主管人员核查。
- `admissibleAlternatives`: 仅记录撤回请求并等待可信成功回执，不在无权限系统写工单。
- `evidenceAnchors`: school action log, current processing state, official withdrawal receipt.
- `failureMode`: 只看“办理中”就假称所有工单撤回成功。
- `confidence`: HIGH（资格限制）；`unresolved`: 操作前以何技术事件为准需接口确认。
- `reverseInterpretation`: schoolHasActed=true 只能推出**原文不保证自动撤回**，不等于上位法禁止一切其他撤回途径。

## CF-07｜校级与环土学院匿名信箱的差异

- `dutyId`: G08-T03-E1-CF-07
- `sourceLocator`: https://www.cdut.edu.cn/index/sjxxxzxx.htm 使用须知3；https://cece.cdut.edu.cn/info/1063/8771.htm 通知三（三）。
- `applicability`: `F`官方索引层级不同；2026有效细则仍 `U`；不作为两校不同硬性政策。
- `given`: 完全相同且可理解的匿名校园建设建议，未署姓名但有同样邮箱回邮头。
- `changedFact`: `channel=CDUT_SCHOOL_MAIL` ↔ `CDUT_CECE_DEAN_MAIL`。
- `expectedDecision`: 校级“建议尽量实名”并不支持缺姓名自动拒收；学院“匿名原则上不予回复”支持**回信预期不同**，但不证明不登记/不保密。
- `admissibleAlternatives`: 均可记录来源和建议人工确认是否受理、是否回复；不生成正式审批或假定所有学院都这样。
- `evidenceAnchors`: actual target mailbox, official channel notice/version, raw mail header, missing name.
- `failureMode`: 将学院“不予回复”外推为校级“强制匿名拒件”，或将校级建议实名强行改成学院必须回复。
- `confidence`: MEDIUM 官方索引（直开412）。`unresolved`: 校级/学院当前内部有效通知及回复权限。
- `reverseInterpretation`: 没有实时邮箱后台收件/回信状态，无法据此判定某封信确已被记录或得到正式答复。

## CF-08｜普通校领导邮箱收件与学生申诉委员会法定收件

- `dutyId`: G08-T03-E1-CF-08
- `sourceLocator`: https://www.moe.gov.cn/srcsite/A02/s5911/moe_621/201702/t20170216_296385.html §§59–61。
- `applicability`: `F`受第41号令调整的学生处理/处分正式申诉；具体 CDUT 接收方式 `U`。
- `given`: 同一已向当事人送达的处分决定、同一学生、同一合格内容的书面申诉、同一提交时间，均有普通校邮箱已收件记录。
- `changedFact`: 唯一变化为 `committeeHasAuthenticallyReceivedWrittenAppeal=false` ↔ `true`，来自委员会可信收件簿。
- `expectedDecision`: false 时不能基于普通信箱已收件就宣告委员会正式受理、启动其15日复查时钟；true 时从委员会**收到书面申诉**日起可计算其法定复查期限，但还不能预言复查结论。
- `admissibleAlternatives`: 真实收件机关需核官方校本办法与登记回执；普通邮箱可提路由建议，不能取代有权机关。
- `evidenceAnchors`: decision-service date, original written appeal, competent committee receipt with timestamp, regulation version.
- `failureMode`: 将“一封校长邮件”当成“法定书面申诉已受理”，再宣称处分撤销。
- `confidence`: HIGH 官方规章索引。`unresolved`: 本校现行委员会工作制度、材料清单、收件途径未核。
- `reverseInterpretation`: 未找到委员会收件记录 **不等于** 可肯定委员会未收到；正确状态是待核，不自动否定申诉人权利。

## CF-09｜法定信访复查 vs 平台普通评价（条件限定）

- `dutyId`: G08-T03-E1-CF-09
- `sourceLocator`: https://www.gjxfj.gov.cn/2022-04/08/c_1310549186.htm §§31(六)、34–36。
- `applicability`: 仅条例所规定主体、事项、出具了§31(六)正式处理意见的 `F`；其他投诉 `U`。
- `given`: 同一有权机关已书面作出并送达处理意见的申诉求决事项，同一事实与请求、同一期限内、同一当事人。
- `changedFact`: `authorizedReviewRequestReceived=false` ↔ `true`，其他原信与时间不变。
- `expectedDecision`: false 时不能因用户给普通平台一个“不满意”就认定法定复查已进入办理；true 时由上一级有权机关按 §35 程序复查，而非普通平台自动“再次办理”。
- `admissibleAlternatives`: 核实是否属于该条例和§31(六)，有权机关收到事实不明则待核。
- `evidenceAnchors`: valid signed original opinion, service time, written review request, competent upper authority receipt.
- `failureMode`: 混同“评价流程”与“上级机关法定复查”；混淆复查请求提出期与办理期。
- `confidence`: HIGH 官方条例直开；`unresolved`: 是否有适用该法定途径的真实学校事项。
- `reverseInterpretation`: 具体争议若应走诉讼、仲裁、专门行政程序，不以 §31(六)处理。
 
## 反向假设与失败判据

| hypothesisId | 可能被官方原文推翻的简化推论 | 反证与判定边界 |
|---|---|---|
| HYP-A | “不满意”才允许山东平台继续办理 | 山东官方 §一（五）还包括“一般”；CF-01可推翻这一简化 |
| HYP-B | 同一个满意度词在所有轮次必然走同一路径 | 山东官方按首次/二次区别；CF-03/04可推翻 |
| HYP-C | 用户首次提交满10天即可默认满意 | 山东官方时钟从结果反馈之后起算；CF-05可推翻 |
| HYP-D | 平台列表存在“办理中”就允许撤回 | 学校执行操作之前的条件独立存在；CF-06可推翻 |
| HYP-E | 校级建议实名可以推广为成都理工全校匿名强制拒件 | 不同渠道文字不同，学院匿名原则不回且仅限定本院；CF-07可推翻 |
| HYP-F | 学生在校领导邮箱发文即启动法定申诉委员会复查 | 第41号令以委员会收到书面申诉为起点；CF-08可推翻 |
| HYP-G | 平台再次办理天然满足《信访工作条例》的复查复核 | 受理机关和原处理文书都不同；CF-09可推翻 |

`NOT_RUN`：九组都没有调用真实线上平台或模型，尚不能证明 C、Gold 或运行时的实际行为。该研究文件绝不作为正式 E v1.0 E2 的通过记录。
