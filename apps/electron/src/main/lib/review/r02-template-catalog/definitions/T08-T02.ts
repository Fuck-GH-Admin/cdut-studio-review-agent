import type { TemplateVersion } from '@profer/shared'

export interface R02CriterionMetadata {
  sectionId: string
  criterionId: string
  srcIds: string[]
  evidenceStatus: 'VERIFIED' | 'PARTIAL' | 'UNCONFIRMED'
}

export interface R02Metadata {
  templateId: string
  name: string
  sourceDocumentPath: string
  researchSourcePath: string
  sourceDocumentSha256: string
  sourceDocumentBytes: number
  manifestExpectedBytes: number
  manifestExpectedSha256: string
  sourceIntegrityStatus: 'LINE_ENDING_DRIFT_ONE_LF' | 'MATCH'
  sourceIntegrityNote: string
  officialSchoolTemplate: false
  researchStatus: string
  policyEvidenceStatus: 'VERIFIED' | 'PARTIAL' | 'UNCONFIRMED'
  sourceRecordCount: number
  fieldCount: number
  materialSlotCount: number
  criterionCount: number
  criteria: R02CriterionMetadata[]
}

/** V3 native draft definition; intentionally not registered/published by this batch. */
export const templateVersion: TemplateVersion = {
  "templateId": "T08-T02",
  "version": 1,
  "schemaVersion": 2,
  "name": "科研助理、项目编外人员录用与聘用合同核验",
  "description": "科研助理、项目编外人员录用与聘用合同核验。本地研究模板 · 非校方正式模板。政策证据状态：PARTIAL；仅用于事实提取、差异提示和人工复核，不产生学校正式决定。",
  "catalogKind": "builtin",
  "sourceNote": "R02_RESEARCH_TEMPLATE_NONOFFICIAL: 本模板由 R02 研究 Markdown 转换；非校方正式模板。SRC 仅是研究来源索引，不是案卷 SourceRef。所有校内政策、权限、法律关系或正式决定未确认时必须人工复核。",
  "objectType": "person",
  "displayName": {
    "template": "科研助理、项目编外人员录用与聘用合同核验（本地研究案卷）"
  },
  "fields": [
    {
      "key": "F001",
      "label": "案卷候选—批次—岗位复合键／ID／Case（F001）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "case",
      "extractionHint": "研究字段字典摘录：**F001** | 案卷候选—批次—岗位复合键／ID／Case | L0 | 可信建案和 M001/M004/M005 关联元信息 | P1；N（不能凭姓名建重复案）. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F002",
      "label": "招聘批次编号与类型关联键／ID／RecruitmentBatch（F002）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F002** | 招聘批次编号与类型关联键／ID／RecruitmentBatch | L0 | 招录单位公告 M001，系统内部稳定映射 | P0；N/Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F003",
      "label": "校级／项目／二级学院组织类型／ENUM?／RecruitmentBatch（F003）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F003** | 校级／项目／二级学院组织类型／ENUM?／RecruitmentBatch | L0 | 当批 M001，SRC-001/002/004/017 | P0；U（不能按招聘者名称猜）. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F004",
      "label": "招聘发文单位及归口／TEXT／RecruitmentBatch（F004）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F004** | 招聘发文单位及归口／TEXT／RecruitmentBatch | L0 | M001 发布机构和当批联系人 | P0；Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F005",
      "label": "公告版本、发布时间、更正关系／LIST／RecruitmentBatch（F005）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F005** | 公告版本、发布时间、更正关系／LIST／RecruitmentBatch | L0，变更即更新 | M001/M003 官域发布日期／修订引用，SRC-014 | P0；Q/K. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F006",
      "label": "岗位代码／名额／专业说明／TEXT（F006）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F006** | 岗位代码／名额／专业说明／TEXT/REF／Position | L0 | M002 岗位附件或 M001 可辨识段，必要时 M029 | P0/P1；N/Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F007",
      "label": "实际用工主体与预定签约主体／TEXT（F007）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F007** | 实际用工主体与预定签约主体／TEXT/REF／Position | L0 初判、L5 复核 | M001/M002、M024/M025；需人事／法务确认 | P1；U/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F008",
      "label": "项目／课题／二级单位关联／REF／Position（F008）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F008** | 项目／课题／二级单位关联／REF／Position | L0 | M002/M029、单位有权岗位登记 | P1；条件无项目时 X，有项目而缺 Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F009",
      "label": "报名、面试、测评、公示、报到等有效节点／LIST<PERIOD>／RecruitmentBatch（F009）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F009** | 报名、面试、测评、公示、报到等有效节点／LIST<PERIOD>／RecruitmentBatch | 各阶段开始前 | M001/M003/M016 及当批后续通知，SRC-005/014 | P0；U/Q，拒绝复制其他批日期. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F010",
      "label": "候选人去重与内部身份引用／ID（F010）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F010** | 候选人去重与内部身份引用／ID/REF／Candidate | L1 | M004/M005/M007、有授权的人事身份核验 | P2；N/K，不得以同名匹配. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F011",
      "label": "法定姓名／TEXT／Candidate（F011）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F011** | 法定姓名／TEXT／Candidate | L1 | M007 与 M004/M005/M006 的原文定位 | P2；N/K. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F012",
      "label": "证件类型和最小必要号码／TEXT（F012）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F012** | 证件类型和最小必要号码／TEXT/REF／Candidate | L1 | M007 证件原件或可信核验回执 | P2；N/K，公开界面仅脱敏. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F013",
      "label": "毕业／应届／在读及学段状态／ENUM?／Candidate（F013）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F013** | 毕业／应届／在读及学段状态／ENUM?／Candidate | L1 | M008/M010/M011、当批 M001 | P2；N/U，非毕业生能否报考按批次. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F014",
      "label": "学历及学位证据状态／RESULT／Candidate（F014）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F014** | 学历及学位证据状态／RESULT／Candidate | L1 初核、L4 原件复核 | M008/M009/M010/M011/M021，标明当前与预计取得 | P2；N 或允许暂代时 X. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F015",
      "label": "当批双证／认证取得截止日／DATE／RecruitmentBatch（F015）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F015** | 当批双证／认证取得截止日／DATE／RecruitmentBatch | L1、L4 | M001/M003/M016 当批明确条文 | P0；U，不可默认 2026-07-10. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F016",
      "label": "专业、学历层级、学段与岗位匹配要素／TEXT（F016）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F016** | 专业、学历层级、学段与岗位匹配要素／TEXT/LIST／Candidate | L1 | M008/M009/M010/M011，标准来自 M001/M002 | P2；N/U，阈值由公告决定. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F017",
      "label": "当批要求的额外资格／成果事实／LIST／Application（F017）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F017** | 当批要求的额外资格／成果事实／LIST／Application | 条件触发 L1 | M012 与 M001/M002 逐条对应 | P2；无要求 X，要求而未提供 N. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F018",
      "label": "报名提交时间／TIME／Application（F018）",
      "kind": "date",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F018** | 报名提交时间／TIME／Application | L1 | M004 官方回执或 M005 具时间戳收件记录 | P2；N/Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F019",
      "label": "报名引用、渠道及材料版本／REF（F019）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F019** | 报名引用、渠道及材料版本／REF/LIST／Application | L1，补件即更新 | M004/M005/M006 及学校接收记录 | P2；N/K，补充公告前成功报名不重报. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F020",
      "label": "资格审查结果／RESULT／EligibilityReview（F020）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F020** | 资格审查结果／RESULT／EligibilityReview | L1 审查完成 | M013 由批次指定机构签发 | P2；未出前 X，应出未出 Q/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F021",
      "label": "资格审查机构、核验人、签发时间／REF（F021）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F021** | 资格审查机构、核验人、签发时间／REF/TIME／EligibilityReview | L1 结论产生 | M013 签发元信息及授权人员目录 | P1/P2；Q/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F022",
      "label": "面试通知、到场和身份核验事件／EVENT／Assessment（F022）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F022** | 面试通知、到场和身份核验事件／EVENT／Assessment | L2 | M013/M014 与当批面试通知（必要时 M001 后续链接） | P2；Q，未面试前 X. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F023",
      "label": "面试／考核小组实际结论／RESULT／Assessment（F023）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F023** | 面试／考核小组实际结论／RESULT／Assessment | L2 结果产生 | M014 小组原始签发记录 | P2；Q/R，AI 不独立评分. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F024",
      "label": "拟聘推荐名单人与岗位关联／REF／Assessment（F024）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F024** | 拟聘推荐名单人与岗位关联／REF／Assessment | L2 推荐后 | M015/M016 有权单位产生的人选记录 | P2；Q/K，未推荐前 X. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F025",
      "label": "公示发布时间、届满时间、版本／PERIOD（F025）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F025** | 公示发布时间、届满时间、版本／PERIOD/LIST／PublicNotice | L3 发布后 | M016 机构官网公告或可信签发文件 | P0/P2；未发布 X、已发布失联 Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F026",
      "label": "异议受理与结论状态（非原始举报细节）／RESULT（F026）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F026** | 异议受理与结论状态（非原始举报细节）／RESULT/EVENT／PublicNotice | L3 异议发生 | M017 有权承办登记与处理结论 | P2/P3；无异议记录不能凭空写“无异议”；Q/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F027",
      "label": "体检完成与可录用结论／RESULT／PreEmploymentCheck（F027）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F027** | 体检完成与可录用结论／RESULT／PreEmploymentCheck | 当批体检节点 | M018 有权医疗机构／学校授权结果 | P3；未到 X、已到无结论 Q/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F028",
      "label": "心理测评完成及授权结论／RESULT／PreEmploymentCheck（F028）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F028** | 心理测评完成及授权结论／RESULT／PreEmploymentCheck | L1a 或 L3，按批次 | M019 管理机构结论，SRC-005/016 | P3；未触发 X、已触发无结果 Q/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F029",
      "label": "教职工准入查询结论／RESULT／PreEmploymentCheck（F029）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F029** | 教职工准入查询结论／RESULT／PreEmploymentCheck | 当批规定的核验节点 | M020 人事处有权查询回执 | P3；适用性不明 U，缺结果 Q/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F030",
      "label": "报到时证件原件核验结果／RESULT／HiringDecision（F030）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F030** | 报到时证件原件核验结果／RESULT／HiringDecision | L4 报到 | M021 用人／人事授权经办原件核验记录 | P2；未报到 X，报到无记录 Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F031",
      "label": "最终聘用人员确定结论／RESULT／HiringDecision（F031）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F031** | 最终聘用人员确定结论／RESULT／HiringDecision | L4 | M022 按该批有权机关签发 | P2；未形成 X，应有却无 Q/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F032",
      "label": "撤回、取消、递补及关联原决定／EVENT／HiringDecision（F032）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F032** | 撤回、取消、递补及关联原决定／EVENT／HiringDecision | 任一相关阶段 | M023 事件登记、接收答复及更正决定 | P2；无事件 X，冲突 K/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F033",
      "label": "合同法律性质：劳动／聘用／服务协议／ENUM?／EmploymentContract（F033）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F033** | 合同法律性质：劳动／聘用／服务协议／ENUM?／EmploymentContract | L5 前人工归类 | M024、人事／法务归口文书、SRC-010/011/012 | P1/P2；U/R，不可默认劳动法适用. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F034",
      "label": "合同用工主体、受雇人身份／REF（F034）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F034** | 合同用工主体、受雇人身份／REF/LIST／EmploymentContract | L5 | M024/M027 与 M007/M022 身份对照 | P2；N/K. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F035",
      "label": "合同起止、生效／报到时间／PERIOD／EmploymentContract（F035）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F035** | 合同起止、生效／报到时间／PERIOD／EmploymentContract | L5 | M024/M027 合同约定及 M001 具体批次范围 | P2；N/K/U，不能套用 2019 编制合同期限. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F036",
      "label": "任务、岗位、地点、报酬等关键条款摘要／LIST／EmploymentContract（F036）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F036** | 任务、岗位、地点、报酬等关键条款摘要／LIST／EmploymentContract | L5 | M024/M027 合同正文及当批 M002 | P2；条款缺失 N，法律充分性 R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F037",
      "label": "签署代表身份、授权范围与有效期／REF（F037）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F037** | 签署代表身份、授权范围与有效期／REF/PERIOD／EmploymentContract | L5 | M025 2026 最新授权及必要单位审批，SRC-008 | P1；U/R，不得自动放行. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F038",
      "label": "合同草案、审签、最终版本链／LIST<DOCREF>／EmploymentContract（F038）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F038** | 合同草案、审签、最终版本链／LIST<DOCREF>／EmploymentContract | L5→L6 | M024/M026/M027 版本哈希／批准关联 | P2；N/K，替换需失效旧审查. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F039",
      "label": "双方签字、校方用印或可靠电子签验证／RESULT（F039）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F039** | 双方签字、校方用印或可靠电子签验证／RESULT/LIST／EmploymentContract | L5 签署时 | M027 原件或可靠验签及校内印章记录 | P2；未签 X、签章真实性未核 R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F040",
      "label": "合同归档位置、交付回执／REF／EmploymentContract（F040）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F040** | 合同归档位置、交付回执／REF／EmploymentContract | L6 | M028 校内授权归档与持有记录 | P2；签前 X，签后缺记录 Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F041",
      "label": "已有岗位立项／用工来源权威决定／REF／LinkedDecision（F041）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F041** | 已有岗位立项／用工来源权威决定／REF／LinkedDecision | L0 条件适用 | M029 及 T08-T01 可信关联；仅校内有权时可查询 | P1；Q/U，不另审批立项. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F042",
      "label": "续聘、变更、解除、权限变更等外部决定／REF／LinkedDecision（F042）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F042** | 续聘、变更、解除、权限变更等外部决定／REF／LinkedDecision | L6 有事件才需 | M030 对 T08-T03/04/05 及其它权威事项的引用 | P1/P2；无事件 X，有事件缺权威 Q. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F043",
      "label": "适用政策版本、时效、来源取得等级及是否取得权威全文／RESULT／RecruitmentBatch（F043）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F043** | 适用政策版本、时效、来源取得等级及是否取得权威全文／RESULT／RecruitmentBatch | L0 持续复核 | M001/M003/M025，SRC-001～020 的适用性及 04.1 访问等级 | P1；U，索引不等于合同权限与政策现行性；政策不明不得假装满足. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    },
    {
      "key": "F044",
      "label": "被替换证据、失效审查结果及重审事件／EVENT／EvidenceEvent（F044）",
      "kind": "text",
      "required": false,
      "visibility": "internal",
      "scope": "subject",
      "extractionHint": "研究字段字典摘录：**F044** | 被替换证据、失效审查结果及重审事件／EVENT／EvidenceEvent | 任一材料改变时 | M003/M017/M023/M027/M030 版本指针和审查流水 | P1/P2；未发生 X，变更不重审 K/R. 此为本地研究字段，不代表学校表单必填；缺失、来源失联、不可读、冲突和政策未知须分别记录，不得把未知默认为 false 或通过。"
    }
  ],
  "materialSlots": [
    {
      "id": "M001",
      "name": "M001 当批招聘存在、范围、时间与权责；发文单位的官网公告／原文",
      "purpose": "当批招聘存在、范围、时间与权责；发文单位的官网公告／原文；当批招聘存在、范围、时间与权责；发文单位的官网公告／原文；L0 `C`；学校权威盖章公告或可验证官方发布记录可替代网页，非第三方转载不自动替代；F002–F005,F007,F009,F015,F043；SRC-001/002/003/004/016/017/019；按发布 URL+批次+时间留原版；官方正文失联→`SOURCE_UNAVAILABLE`，仅有搜索摘要无法核强制细节→`POLICY_UNCONFIRMED`，已给件不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F002",
        "F005",
        "F007",
        "F009",
        "F015",
        "F043"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M002",
      "name": "M002 具体岗位、名额、项目条件；发文单位／岗位主管附件表或公告正文岗位段",
      "purpose": "具体岗位、名额、项目条件；发文单位／岗位主管附件表或公告正文岗位段；具体岗位、名额、项目条件；发文单位／岗位主管附件表或公告正文岗位段；L0 `T`（公告明确引用附件或独立岗位表时）；正文足以完全确定岗位时可用原文替代；F006–F008,F016,F017；SRC-001/002/004/017；绑定岗位附件版次与公告；缺→`NEEDS_MATERIAL`/校方调取，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F006",
        "F008",
        "F016",
        "F017"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M003",
      "name": "M003 公告更正、日期和条件效力；原发文机构补充公告／撤销更正通知",
      "purpose": "公告更正、日期和条件效力；原发文机构补充公告／撤销更正通知；公告更正、日期和条件效力；原发文机构补充公告／撤销更正通知；更正发生时 `T`；没有变更为 `NOT_APPLICABLE`；权威更正原件可代网站显示；F005,F009,F015,F043,F044；SRC-014（示例）；关联原 `M001` 生效链；缺→`SOURCE_UNAVAILABLE`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F005",
        "F009",
        "F015",
        "F043",
        "F044"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M004",
      "name": "M004 证明线上报名事件；校人才招聘系统／本人回执及可核后台报名记录",
      "purpose": "证明线上报名事件；校人才招聘系统／本人回执及可核后台报名记录；证明线上报名事件；校人才招聘系统／本人回执及可核后台报名记录；采用线上渠道的 L1 `T`；有获授权系统记录优先，上传截图仅待核替代；不假设实际接口已开放；F001,F010,F018,F019；SRC-001；回执版本+申请时间+账号去标识；缺→`NEEDS_MATERIAL` 或学校查询，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F001",
        "F010",
        "F018",
        "F019"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M005",
      "name": "M005 证明纸质／邮件报名及岗位意向；申请人和招聘接收单位科研助理报名表（表名已公开）",
      "purpose": "证明纸质／邮件报名及岗位意向；申请人和招聘接收单位科研助理报名表（表名已公开）；证明纸质／邮件报名及岗位意向；申请人和招聘接收单位科研助理报名表（表名已公开）；纸表或邮件报名 L1 `T`；当批认可的邮箱受理记录／网报回执为合法替代时才可互替；F001,F010,F011,F018,F019；SRC-002/004/016；绑定接收时间+批次岗位+表版本；缺→`NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F001",
        "F010",
        "F011",
        "F018",
        "F019"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M006",
      "name": "M006 联系方式、人员信息、简历补充；本人《应聘者个人信息表》或当批要求的简历",
      "purpose": "联系方式、人员信息、简历补充；本人《应聘者个人信息表》或当批要求的简历；联系方式、人员信息、简历补充；本人《应聘者个人信息表》或当批要求的简历；当批明确要求时 L1 `T`；同渠道表单已具备等效字段且学校接受时可不重传；F010,F011,F013,F016,F019；SRC-004/017；每份本人归属、表版本独立，电话等受限；缺→`NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F010",
        "F011",
        "F013",
        "F016",
        "F019"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M007",
      "name": "M007 验证同一人并参加报考；本人／签发机关身份证件扫描或原件核验回执",
      "purpose": "验证同一人并参加报考；本人／签发机关身份证件扫描或原件核验回执；验证同一人并参加报考；本人／签发机关身份证件扫描或原件核验回执；L1 `C`（所核实招录公告要求）；具有同等证明力的证件替代须校方依法确认；到场原件另见 `M021`；F010–F012,F034；SRC-001/002/004/017；仅受限保存证件引用及掩码，绑定姓名证号；缺→`NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F010",
        "F012",
        "F034"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M008",
      "name": "M008 已取得学历事实；本人／学籍学历主管机构毕业证／核验凭证",
      "purpose": "已取得学历事实；本人／学籍学历主管机构毕业证／核验凭证；已取得学历事实；本人／学籍学历主管机构毕业证／核验凭证；L1 已毕业分支 `T`，未毕业可用 `M010` 当前暂代；报到双证时点依 `M001/M016` 可能成为 `C`；F013–F016,F030；SRC-001/002/005/017；证书身份、发证时间及后续原件核验版本；缺→条件性 `NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F013",
        "F016",
        "F030"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M009",
      "name": "M009 已取得学位事实；本人／学位授予单位学位证／核验结果",
      "purpose": "已取得学位事实；本人／学位授予单位学位证／核验结果；已取得学位事实；本人／学位授予单位学位证／核验结果；已毕业 L1 `T`，在读经当批允许可由 `M010` 暂代；合同前是否必须双证以批次及权威复核；F014–F016,F030；SRC-001/002/005/017；证号与同人校验；缺→条件性 `NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F014",
        "F016",
        "F030"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M010",
      "name": "M010 未毕业的当前在读／学籍身份；学校学籍部门／教育部学籍系统／本人提交凭证",
      "purpose": "未毕业的当前在读／学籍身份；学校学籍部门／教育部学籍系统／本人提交凭证；未毕业的当前在读／学籍身份；学校学籍部门／教育部学籍系统／本人提交凭证；在读且当批明示允许 L1 `T`；教务处／研究生院在读证明与有效学籍在线验证报告可替代（SRC-001/017）；不替代后续双证原件；F013–F016；SRC-001/002/017；有效期、同人、学段、预计毕业时间；缺→`NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F013",
        "F016"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M011",
      "name": "M011 国（境）外学历学位真实性；教育部留学服务中心／本人认证",
      "purpose": "国（境）外学历学位真实性；教育部留学服务中心／本人认证；国（境）外学历学位真实性；教育部留学服务中心／本人认证；境外学历且当批要求时 L1 `T`；其他国家／地区文件或尚在认证状态能否替代由当批主管确认，不能自行认可；F013,F014,F016；SRC-001/017；认证编号、持有人及有效版本；缺→`NEEDS_MATERIAL`/特殊时点 `POLICY_UNCONFIRMED`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F013",
        "F014",
        "F016"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M012",
      "name": "M012 岗位独有技能、专业经历、成果或当批明确简历材料；本人／授予机构证明附件",
      "purpose": "岗位独有技能、专业经历、成果或当批明确简历材料；本人／授予机构证明附件；岗位独有技能、专业经历、成果或当批明确简历材料；本人／授予机构证明附件；当批列明要求才 L1 `T`；学校认可的正式记录或证明可替代复印件；公告未列材料不得自动增加；F016,F017；SRC-002/004/016/017；每项证明对应岗位条款、持有人、原件版本；缺→`NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F016",
        "F017"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M013",
      "name": "M013 校方对候选人资格的审查结论；科发院／项目组／院办公室审查记录、入围通知",
      "purpose": "校方对候选人资格的审查结论；科发院／项目组／院办公室审查记录、入围通知；校方对候选人资格的审查结论；科发院／项目组／院办公室审查记录、入围通知；L1 审查完成后转 `C`；具有签发记录的官方系统结论可代纸表，自述／邀请短信只作线索；F020–F022；SRC-001/002/004/016；审查机构、人员、时点及关联原报名版本；尚未产生→`NOT_APPLICABLE`，应有失联→`SOURCE_UNAVAILABLE`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F020",
        "F022"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M014",
      "name": "M014 面试行为及有权小组结论；面试小组／项目组记录、评议确认表",
      "purpose": "面试行为及有权小组结论；面试小组／项目组记录、评议确认表；面试行为及有权小组结论；面试小组／项目组记录、评议确认表；L2 面试完成后 `C`；校方认证成绩记录可替代纸签，AI 不补评分；F022,F023,F024；SRC-001/002/004/016；记录小组、笔录/成绩版次、对应人员岗位；未面试→`NOT_APPLICABLE`，已面试缺→`SOURCE_UNAVAILABLE`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F022",
        "F023",
        "F024"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M015",
      "name": "M015 项目或单位拟聘推荐／汇总关系；项目组／二级单位拟聘清单、签发名单",
      "purpose": "项目或单位拟聘推荐／汇总关系；项目组／二级单位拟聘清单、签发名单；项目或单位拟聘推荐／汇总关系；项目组／二级单位拟聘清单、签发名单；当批程序要求汇总时 L2 `T`；校方有权系统签发的同效名单可替代，校级直接公示批次未必需独立清单；F024,F031；SRC-004/016；清单名义、批次、顺位与更改版次；缺→`SOURCE_UNAVAILABLE`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F024",
        "F031"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M016",
      "name": "M016 正式拟聘／面试结果公示及期限；校方／学院发文主体官网公示、可信签发公告",
      "purpose": "正式拟聘／面试结果公示及期限；校方／学院发文主体官网公示、可信签发公告；正式拟聘／面试结果公示及期限；校方／学院发文主体官网公示、可信签发公告；实际进入公示且发布后 L3 `C`；校方公示原件可替网页；未来尚未公示时是 `L`；F024–F026,F009,F015；SRC-001/004/005/016/017；公告日期、名单附件仅取获授权同人匹配，不批量采集个人表；发布后失联→`SOURCE_UNAVAILABLE`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F024",
        "F026",
        "F009",
        "F015"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M017",
      "name": "M017 异议受理、事实核查及处理结论；公告指定承办机关／复核主体登记与答复",
      "purpose": "异议受理、事实核查及处理结论；公告指定承办机关／复核主体登记与答复；异议受理、事实核查及处理结论；公告指定承办机关／复核主体登记与答复；实有异议／更正 L3 `T`；由有权承办方签发的答复可替流水截图；不存在异议时不能强制造“无异议证明”；F026,F032,F044；SRC-005/013；受理号、决定版本和访问控制、只传必要结论；发生但缺→`SOURCE_UNAVAILABLE`/人工，读取失败→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F026",
        "F032",
        "F044"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M018",
      "name": "M018 体检完成及有权健康资格结论；指定／当批允许医疗机构和校内接收机构的结果",
      "purpose": "体检完成及有权健康资格结论；指定／当批允许医疗机构和校内接收机构的结果；体检完成及有权健康资格结论；指定／当批允许医疗机构和校内接收机构的结果；当批体检阶段 L3/L4 `T`，某数学学院仅指定公立二甲及以上属该批；不可从原始病历自动计算；F027,F031；SRC-002/004/005/017/013；保留结论、出具日和人员归属，健康原件限制阅览；到期无结论→`NEEDS_HUMAN_DECISION`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F027",
        "F031"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M019",
      "name": "M019 心理测评完成与处理结论；学校测评主管部门受限状态／回执",
      "purpose": "心理测评完成与处理结论；学校测评主管部门受限状态／回执；心理测评完成与处理结论；学校测评主管部门受限状态／回执；按当批阶段 L1a 或 L3 `T`；学校授权结果优先，无法律依据不收量表原始答案（SRC-013）；不因 2024 先测而认定所有批次先测；F028,F031；SRC-001/002/005/016；不复制公开公告中登录凭据，限结论、时点、批次；结果缺→`SOURCE_UNAVAILABLE`/人工，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F028",
        "F031"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M020",
      "name": "M020 教职工准入审查结论；成都理工大学人事处有权查询或签发回执",
      "purpose": "教职工准入审查结论；成都理工大学人事处有权查询或签发回执；教职工准入审查结论；成都理工大学人事处有权查询或签发回执；当批明确要求后置核验时 L3/L4 `T`；学校正式查询记录可代纸质结论；对公告遗漏此步骤的批次先 `POLICY_UNCONFIRMED`；F029,F031；SRC-001/003/004/016；严格限制查看依据细节，仅业务结论；有要求但无结果→`SOURCE_UNAVAILABLE`/人工，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F029",
        "F031"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M021",
      "name": "M021 报到时证件原件与身份核验；有权接收办公室／候选人原件核对表",
      "purpose": "报到时证件原件与身份核验；有权接收办公室／候选人原件核对表；报到时证件原件与身份核验；有权接收办公室／候选人原件核对表；L4 实际报到时 `C`；可信窗口原件验真记录可替再次上传扫描件；报告本身在 L1 不存在；F011,F012,F014,F030；SRC-001/002/005/017；经办人、时间、对应原件版本；应有缺→`SOURCE_UNAVAILABLE`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F011",
        "F012",
        "F014",
        "F030"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M022",
      "name": "M022 学校／单位最终聘用确认事实；当批有权聘用决定者的决定事件或可查的正式状态（不预设必有单独“录用通知书”）",
      "purpose": "学校／单位最终聘用确认事实；当批有权聘用决定者的决定事件或可查的正式状态（不预设必有单独“录用通知书”）；学校／单位最终聘用确认事实；当批有权聘用决定者的决定事件或可查的正式状态（不预设必有单独“录用通知书”）；到了当批应确认的节点才成为当前 `C/T`；可由有授权的校内决定记录、聘用手续确认回执等依当批被归口认可的载体证明，拟聘公告本身不能替代；F007,F031,F034；SRC-001/002/004；要求签发主体、具体人与岗位、授权和生效/撤销时间。当前尚未到节点→`NOT_APPLICABLE`；该批是否存在独立决定载体未知→`POLICY_UNCONFIRMED`；应有权威状态但不可查→`SOURCE_UNAVAILABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F007",
        "F031",
        "F034"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M023",
      "name": "M023 撤回、自动放弃认定、取消、递补及答复；本人声明＋有权受理单位登记和后续决定",
      "purpose": "撤回、自动放弃认定、取消、递补及答复；本人声明＋有权受理单位登记和后续决定；撤回、自动放弃认定、取消、递补及答复；本人声明＋有权受理单位登记和后续决定；发生事件时 L1–L4 `T`；本人申请不能替代校方已确认的取消／递补；以真实受理回执和决定为准；F019,F026,F031,F032,F044；SRC-001/005/014；保留事件时间、旧决定、替换结论、责任人；发生却无答复→`NEEDS_HUMAN_DECISION`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F019",
        "F026",
        "F031",
        "F032",
        "F044"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M024",
      "name": "M024 合同拟稿、岗位、薪酬与约定条款；拟订单位／候选人有标识的合同草案",
      "purpose": "合同拟稿、岗位、薪酬与约定条款；拟订单位／候选人有标识的合同草案；合同拟稿、岗位、薪酬与约定条款；拟订单位／候选人有标识的合同草案；进入 L5 才 `C`；单位正式合同拟稿记录可代文件；尚未发生签约流程不可前置；F007,F033–F036,F038；SRC-002/010/011/012；草案版本、对象、当批岗位与修改人；应有无稿→`NEEDS_MATERIAL`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F007",
        "F033",
        "F036",
        "F038"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M025",
      "name": "M025 核定真实合同甲方及签署人权限；党政办公室、人事／法务等有权部门对签约日有效的授权原件、校内确认及变更链",
      "purpose": "核定真实合同甲方及签署人权限；党政办公室、人事／法务等有权部门对签约日有效的授权原件、校内确认及变更链；核定真实合同甲方及签署人权限；党政办公室、人事／法务等有权部门对签约日有效的授权原件、校内确认及变更链；进入 L5，签约权限审查关键 `T`；依法由法定代表人亲签、部门主管签、受托人签、第三方人力公司签是不同证明路径；一般合同授权公告是否适用于劳动/聘用关系须法务确认；F007,F034,F037,F039,F043；SRC-006/008/012；逐一匹配实际甲方、姓名、权限内容、授权期限、签约日及撤销；未得正文→`POLICY_UNCONFIRMED`/人工，不可读→`UNREADABLE`，不得假设学校印章即可免核授权。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F007",
        "F034",
        "F037",
        "F039",
        "F043"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M026",
      "name": "M026 按校内适用制度完成合同审查、批准及用印前置；学校合同归口真实审批流水",
      "purpose": "按校内适用制度完成合同审查、批准及用印前置；学校合同归口真实审批流水；按校内适用制度完成合同审查、批准及用印前置；学校合同归口真实审批流水；仅经证实适用此类型劳动／聘用合同的制度时 L5 `T`；不凭 2024 一般合同办法解读直接设为所有人硬件，可信原审签记录可代 PDF；F033,F037–F039；SRC-006/008/012；审批意见指向准确草案 hash、节点和操作者；适用性未知→`POLICY_UNCONFIRMED`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F033",
        "F037",
        "F039"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M027",
      "name": "M027 双方真实签署合同或协议；实际用工主体／候选人纸质签署原件或可靠电子签验签",
      "purpose": "双方真实签署合同或协议；实际用工主体／候选人纸质签署原件或可靠电子签验签；双方真实签署合同或协议；实际用工主体／候选人纸质签署原件或可靠电子签验签；只在宣称已经签署后才为当前 `C`，拟稿阶段为 `L`；纸质/电子签接受机制须合法且被校内归口确认；F033–F039,F044；SRC-002/010/011/012；合同唯一编号、双方意思表示证据、签章时点、最终 hash、交付记录；声称已签而原件由机构保存但不可查→`SOURCE_UNAVAILABLE`，申请人应有一方副本可补→`NEEDS_MATERIAL`，签章真实性争议→`NEEDS_HUMAN_DECISION`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F033",
        "F039",
        "F044"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M028",
      "name": "M028 已签合同交付与归档；学校有权档案或人事部门档案索引／回执",
      "purpose": "已签合同交付与归档；学校有权档案或人事部门档案索引／回执；已签合同交付与归档；学校有权档案或人事部门档案索引／回执；签完后 L6 `C`；可信归档系统记录可代回执，但接口存在性未知；F038,F040；SRC-006/012/013；绑定 `M027` 最终 hash 和存取权限；应归档未见→`SOURCE_UNAVAILABLE`，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F038",
        "F040"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M029",
      "name": "M029 引用上游岗位批准／经费许可；T08-T01 决定机关真实立项决定引用",
      "purpose": "引用上游岗位批准／经费许可；T08-T01 决定机关真实立项决定引用；引用上游岗位批准／经费许可；T08-T01 决定机关真实立项决定引用；仅有对应独立岗位立项决定且需核来源时 L0 `T`；经学校授权对已有案例只读关联，不以候选人自填证明；F006–F008,F041；SRC-011/015（仅范围／技术背景，没有校本审批条款）；权威案号及版本，缺→`SOURCE_UNAVAILABLE`/人工，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F006",
        "F008",
        "F041"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M030",
      "name": "M030 引用合同调整、离岗、授权人变更等下游决定；T08-T03/04/05 等原决定机关正式结论",
      "purpose": "引用合同调整、离岗、授权人变更等下游决定；T08-T03/04/05 等原决定机关正式结论；引用合同调整、离岗、授权人变更等下游决定；T08-T03/04/05 等原决定机关正式结论；L6 真正发生后续独立决定时 `T`；原签发系统只读引用优先，未发生为 `L/X`；F032,F042,F044；SRC-015（仅技术关联，校本政策待补）；带原案、决定有效期及撤销指针；缺→`SOURCE_UNAVAILABLE`/人工，不可读→`UNREADABLE`。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [
        "F032",
        "F042",
        "F044"
      ],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M001",
      "name": "M001 R001/R002/R003/R004/R006/R007/R008/R009/R010/R011/R012/R015/R018/R019/R020/R023/R024",
      "purpose": "R001/R002/R003/R004/R006/R007/R008/R009/R010/R011/R012/R015/R018/R019/R020/R023/R024；R001/R002/R003/R004/R006/R007/R008/R009/R010/R011/R012/R015/R018/R019/R020/R023/R024；M016；R014/R015/R016/R017/R018/R019/R022。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M002",
      "name": "M002 R001/R003/R010/R024",
      "purpose": "R001/R003/R010/R024；R001/R003/R010/R024；M017；R016/R030。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M003",
      "name": "M003 R002/R004/R006/R030",
      "purpose": "R002/R004/R006/R030；R002/R004/R006/R030；M018；R018/R022。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M004",
      "name": "M004 R004/R005/R006/R017",
      "purpose": "R004/R005/R006/R017；R004/R005/R006/R017；M019；R012/R019/R022。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M005",
      "name": "M005 R004/R005/R006/R017",
      "purpose": "R004/R005/R006/R017；R004/R005/R006/R017；M020；R020/R022。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M006",
      "name": "M006 R006",
      "purpose": "R006；R006；M021；R008/R021。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M007",
      "name": "M007 R005/R009/R021/R024/R030",
      "purpose": "R005/R009/R021/R024/R030；R005/R009/R021/R024/R030；M022；R022/R024。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M008",
      "name": "M008 R007/R008/R021",
      "purpose": "R007/R008/R021；R007/R008/R021；M023；R017/R022/R030。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M009",
      "name": "M009 R007/R008/R021",
      "purpose": "R007/R008/R021；R007/R008/R021；M024；R001/R023/R024/R025/R026/R027。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M010",
      "name": "M010 R007/R008/R021",
      "purpose": "R007/R008/R021；R007/R008/R021；M025；R023/R025/R026/R027。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M011",
      "name": "M011 R009",
      "purpose": "R009；R009；M026；R026/R027。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M012",
      "name": "M012 R010",
      "purpose": "R010；R010；M027；R024/R025/R027/R028/R030。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M013",
      "name": "M013 R011/R012/R013",
      "purpose": "R011/R012/R013；R011/R012/R013；M028；R028/R030。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M014",
      "name": "M014 R013/R014",
      "purpose": "R013/R014；R013/R014；M029；R003/R029。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    },
    {
      "id": "M015",
      "name": "M015 R014/R022",
      "purpose": "R014/R022；R014/R022；M030；R029/R030。原件未规定业务数量上限；槽位 maxCount 使用宽松技术上限，不构成政策阈值。SRC 仅为研究索引，不作为案卷附件或 SourceRef。",
      "acceptedKinds": [
        "pdf",
        "image",
        "office",
        "sheet",
        "text"
      ],
      "minCount": 0,
      "maxCount": 2147483647,
      "requiredElements": [],
      "allowReuseAcrossSubjects": false
    }
  ],
  "sections": [
    {
      "id": "R02_RESEARCH_RULES",
      "name": "逐条事实核验",
      "description": "逐条对应 T08-T02 原文 §08 的 R 规则。此分项是研究检查项，不是学校政策；SRC IDs 只保存在 r02Metadata，不得作为案卷 SourceRef。条件性阶段、例外与校本规则待确认时转人工。",
      "order": 0,
      "required": true,
      "criteria": [
        {
          "id": "R001",
          "title": "R001 · L0｜用工性质与目录路由 T：当批公告确认科研助理编外；F：有权证实正式编制／博士后等其他业务；U：仅写“项目人员”无法确定合同性质",
          "requirement": "原文规则行： **R001** L0｜用工性质与目录路由 ； T：当批公告确认科研助理编外；F：有权证实正式编制／博士后等其他业务；U：仅写“项目人员”无法确定合同性质 ； SRC-001/002/007/010/011；F003,F007,F008,F033,F043；M001/M002/M024。按公告岗位身份及法律关系说明区分 T02-T01、博士后、助研津贴；不能从“劳务”文字猜劳动关系 ； 证实路由→`PASS_FACT`，他事项→`NOT_APPLICABLE` 并转其权威业务，未知→`POLICY_UNCONFIRMED`；下一：招聘归口／人事法务 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R002",
          "title": "R002 · L0｜招聘公告真伪、版本及现行性 T：已识别实际批次；F：本案不属招聘事实核验；U：批次编号／原发布机构不明",
          "requirement": "原文规则行： **R002** L0｜招聘公告真伪、版本及现行性 ； T：已识别实际批次；F：本案不属招聘事实核验；U：批次编号／原发布机构不明 ； SRC-001/002/003/004/009/014/017/019；F002–F005,F043；M001/M003。官方发文域名、标题、发布日与原机构修订链比对，核办理发生时版本；**SRC-019 首批原公告与 SRC-014 补充必须成对看**，历史批次不适用于新批 ； 公告**发布事实**证实→`PASS_FACT`，需原文却无法得到→`SOURCE_UNAVAILABLE`，强制条款/时效待证→`POLICY_UNCONFIRMED`；下一：公告发布单位 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R003",
          "title": "R003 · L0｜岗位及上游立项关联 T：公告要求特定岗位／已有岗位立项；F：不存在可引用的独立立项条件；U：是否另有岗位核准未知",
          "requirement": "原文规则行： **R003** L0｜岗位及上游立项关联 ； T：公告要求特定岗位／已有岗位立项；F：不存在可引用的独立立项条件；U：是否另有岗位核准未知 ； SRC-001/002/004/011/015/017；F006–F008,F041；M001/M002/M029。核岗位代码、名额与只读 T08-T01 真实决定案号；不重审经费／批准权限，SRC-011/015 只作背景 ； 岗位一致→`PASS_FACT`，名额矛盾→`CONFLICT`，立项权威失联→`SOURCE_UNAVAILABLE`；下一：岗位发布单位／T08-T01 原决定机关 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R004",
          "title": "R004 · L0/L1｜公告补充及报名截止适用 T：有更正或要比较提交时间；F：尚未提交、无时间判断；U：补充公告是否覆盖此批未知",
          "requirement": "原文规则行： **R004** L0/L1｜公告补充及报名截止适用 ； T：有更正或要比较提交时间；F：尚未提交、无时间判断；U：补充公告是否覆盖此批未知 ； SRC-001/014/017/019；F005,F009,F018,F019,F043,F044；M001/M003/M004/M005。按**同批生效版本**比较提交时间，2026 首批有效报名不重报；不能把 6/21 期限用于 7 月第二批 ； 在当前窗口事实一致→`PASS_FACT`，确实逾期的资格后果→`NEEDS_HUMAN_DECISION`，旧新冲突→`CONFLICT`；下一：报名受理方 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R005",
          "title": "R005 · L1｜应聘人身份／同一案归属 T：存在候选人身份材料；F：尚未出现个人申请的 L0；U：证件是否与本人对应无法核实",
          "requirement": "原文规则行： **R005** L1｜应聘人身份／同一案归属 ； T：存在候选人身份材料；F：尚未出现个人申请的 L0；U：证件是否与本人对应无法核实 ； SRC-001/002/004/013/017；F001,F006,F010–F012；M004/M005/M007。比强身份标识与申请、同批同岗记录，不以姓名或 OCR 相似度替代原件核验 ； 一致的**表面事实**→`PASS_FACT`，不同证号→`CONFLICT`，证件无法取得→`NEEDS_MATERIAL`；下一：本人及批次资格审查员 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R006",
          "title": "R006 · L1｜报名渠道／记录／时间 T：本批已开放报名且本人提出申请；F：未进入报名；U：当批报名渠道未知",
          "requirement": "原文规则行： **R006** L1｜报名渠道／记录／时间 ； T：本批已开放报名且本人提出申请；F：未进入报名；U：当批报名渠道未知 ； SRC-001/002/004/014/017；F018,F019,F002,F009；M001/M003/M004/M005/M006。对网报回执或邮箱收件记录比时间、渠道、岗位和版本；校方可查询优先，不假设接口，已报名延长后仍有效 ； 记录匹配→`PASS_FACT`，当批应交本人表缺→`NEEDS_MATERIAL`，校方回执查不到→`SOURCE_UNAVAILABLE`；下一：本人／接收单位 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R007",
          "title": "R007 · L1｜已毕业学历／学位证据 T：当批要求毕业双证且此时点已取得；F：当批允许在读暂代且当前尚未到原件时点；U：是否须双证或取得节点未明",
          "requirement": "原文规则行： **R007** L1｜已毕业学历／学位证据 ； T：当批要求毕业双证且此时点已取得；F：当批允许在读暂代且当前尚未到原件时点；U：是否须双证或取得节点未明 ； SRC-001/002/005/017；F013–F016,F043；M001/M008/M009/M010。按**本批**学历层级、证书时间和岗位范围比原件字段；不得套 2019 正式教职工或其他批阈值 ； 表面证件一致→`PASS_FACT`，此时点无证→`NEEDS_MATERIAL`，资格是否不符→`NEEDS_HUMAN_DECISION`；下一：本人／当批资格部门 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R008",
          "title": "R008 · L1→L4｜在读材料暂代与报到转正 T：本人未毕业且公告在报名阶段允许 `M010`；F：已取得并交双证；U：当前批次是否允许暂代未知",
          "requirement": "原文规则行： **R008** L1→L4｜在读材料暂代与报到转正 ； T：本人未毕业且公告在报名阶段允许 `M010`；F：已取得并交双证；U：当前批次是否允许暂代未知 ； SRC-001/005/017；F013–F016,F015,F030；M001/M008/M009/M010/M021。L1 验在读证明或教育部学籍报告、有效期及同人，L4 再独立核毕业学位**原件**；禁止 L1 预索取 L4 文档 ； 合法暂代→`PASS_FACT`（仅 L1 事实）；L4 原件未形成→对应未来 `NOT_APPLICABLE`，到期与原件不符→`NEEDS_HUMAN_DECISION`；下一：本人／报到经办 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R009",
          "title": "R009 · L1｜境外学历认证 T：应聘人用国（境）外学历且批次要求认证；F：无此身份；U：认证形式／时效／替代未知",
          "requirement": "原文规则行： **R009** L1｜境外学历认证 ； T：应聘人用国（境）外学历且批次要求认证；F：无此身份；U：认证形式／时效／替代未知 ； SRC-001/017；F013,F014,F016,F043；M001/M007/M011。比留服认证编号、姓名、层级与岗位，其他海外文件不自行认可为等效 ； 一致→`PASS_FACT`，确需却未交→`NEEDS_MATERIAL`，非标准文件合法性→`POLICY_UNCONFIRMED`；下一：本人／资格部门 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R010",
          "title": "R010 · L1｜岗位特殊条件及证明 T：岗位表确有资格、技能、成果要求；F：本岗无此要求；U：岗位附件无法取得或标准不清",
          "requirement": "原文规则行： **R010** L1｜岗位特殊条件及证明 ； T：岗位表确有资格、技能、成果要求；F：本岗无此要求；U：岗位附件无法取得或标准不清 ； SRC-002/004/016/017；F006,F016,F017；M001/M002/M012。逐项取**当批文字**、证明页／签发人比，不设自创荣誉、年龄或分数下限 ； 证据文字一致→`PASS_FACT`，明列而未交→`NEEDS_MATERIAL`，实质满足否→`NEEDS_HUMAN_DECISION`；下一：项目组／资格部门 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R011",
          "title": "R011 · L1→L2｜有权资格审查和面试入围 T：批次已正式审查并发布入围；F：审查尚未到节点；U：审查主体或结论签发无凭据",
          "requirement": "原文规则行： **R011** L1→L2｜有权资格审查和面试入围 ； T：批次已正式审查并发布入围；F：审查尚未到节点；U：审查主体或结论签发无凭据 ； SRC-001/002/004/016/018；F020–F022；M001/M013。核当批机构、人员关联、签发日、入围通知，名单附件仅有标题不足证明个人入围；不重算资格裁量 ； 权威记录吻合→`PASS_FACT`（记录存在）；有自称“通过”无签发→`SOURCE_UNAVAILABLE`/`NEEDS_HUMAN_DECISION`；下一：科发院／院办公室／项目组 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R012",
          "title": "R012 · L1a/L2｜心理测评前置顺序 T：有效当批规定面试前测评；F：有效当批明确面试后测评；U：当批顺序无法确认",
          "requirement": "原文规则行： **R012** L1a/L2｜心理测评前置顺序 ； T：有效当批规定面试前测评；F：有效当批明确面试后测评；U：当批顺序无法确认 ； SRC-005/016；F005,F009,F028；M001/M013/M019。2024 前置测评历史例不能跨批导入 2026；只比校方受限测评结论和时间，不读取答卷 ； 当批节点顺序及记录一致→`PASS_FACT`，前置未到节点→`NOT_APPLICABLE`，顺序未核→`POLICY_UNCONFIRMED`；下一：招聘组织者／测评部门 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R013",
          "title": "R013 · L2｜面试到场与小组考核事实 T：候选人已进入并参加当批面试；F：尚未获得面试资格或面试尚未举行；U：通知／人员归属未知",
          "requirement": "原文规则行： **R013** L2｜面试到场与小组考核事实 ； T：候选人已进入并参加当批面试；F：尚未获得面试资格或面试尚未举行；U：通知／人员归属未知 ； SRC-001/002/004/016/018/020（SRC-020 **仅后续通知存在性**）；F022,F023,F024；M013/M014。对照官方入围名单、面试小组签发原记录和日期；不可从通知标题推断本人已参加或个人成绩；绝不以模型重打分 ； 到场及签发事实吻合→`PASS_FACT`，记录失联→`SOURCE_UNAVAILABLE`，考核取舍→`NEEDS_HUMAN_DECISION`；下一：面试小组／项目组 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R014",
          "title": "R014 · L2｜拟聘推荐及名单版本 T：项目／单位已产生推荐名单；F：该批直接发布校级公示而无独立推荐清单或尚未推荐；U：是否存在独立汇总环节未知",
          "requirement": "原文规则行： **R014** L2｜拟聘推荐及名单版本 ； T：项目／单位已产生推荐名单；F：该批直接发布校级公示而无独立推荐清单或尚未推荐；U：是否存在独立汇总环节未知 ； SRC-001/004/016；F023,F024,F031；M014/M015/M016。比小组推荐、项目汇总人与岗位和签发版本；推荐只能证明被推荐，不能证明最终录用 ； 名单一致→`PASS_FACT`，跨人／跨岗位→`CONFLICT`，未确认裁量→`NEEDS_HUMAN_DECISION`；下一：项目组／单位汇总者 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "semantic",
          "targetScope": "subject"
        },
        {
          "id": "R015",
          "title": "R015 · L3｜正式拟聘公示与发布期限 T：有权单位已正式公示本批拟聘或结果；F：公示尚未发布／当前不在公示阶段；U：发布权限或适用公示要求未知",
          "requirement": "原文规则行： **R015** L3｜正式拟聘公示与发布期限 ； T：有权单位已正式公示本批拟聘或结果；F：公示尚未发布／当前不在公示阶段；U：发布权限或适用公示要求未知 ； SRC-001/004/005/017；F024–F026,F009；M001/M016。核发布主体、时间、公告版本及同人岗位；3 工作日仅对应具体批次，**公示结束不自动视为无异议** ； 发布事实可核→`PASS_FACT`，链接丢失→`SOURCE_UNAVAILABLE`，名单与推荐冲突→`CONFLICT`；下一：发文单位／异议受理机关 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R016",
          "title": "R016 · L3｜公示异议及处理权威记录 T：有实名异议被有权机关受理；F：已核不存在本案异议事件；U：是否存在未处理异议无法由可信渠道获知",
          "requirement": "原文规则行： **R016** L3｜公示异议及处理权威记录 ； T：有实名异议被有权机关受理；F：已核不存在本案异议事件；U：是否存在未处理异议无法由可信渠道获知 ； SRC-005/013；F025,F026,F032；M016/M017。核受理号、对象、时间、决定机关和答复版本；无截图不是“无异议”，匿名与实名处理限定该批 ； 有权受理事实→`PASS_FACT`（非异议成立）；裁定争议→`NEEDS_HUMAN_DECISION`，结论失联→`SOURCE_UNAVAILABLE`；下一：公示监督／复核机关 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R017",
          "title": "R017 · L1–L4｜撤回、放弃、取消、递补事件 T：出现本人撤回、公告所述逾期／资格取消、递补之一；F：经有权核实无此事件；U：本人陈述与官方登记是否对应未知",
          "requirement": "原文规则行： **R017** L1–L4｜撤回、放弃、取消、递补事件 ； T：出现本人撤回、公告所述逾期／资格取消、递补之一；F：经有权核实无此事件；U：本人陈述与官方登记是否对应未知 ； SRC-001/002/005/014；F019,F031,F032,F044；M004/M005/M016/M023。区分本人**申请撤回**、学校确认生效、校方取消和后续递补；事件时间相对最终聘用决定判定；无统一撤回/复核期限 ； 有权事件链可核→`PASS_FACT`，当事人与校方结论冲突→`CONFLICT`，是否准予／重新受理→`NEEDS_HUMAN_DECISION`；下一：报名单位／原决定机关 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R018",
          "title": "R018 · L3/L4｜体检完成及适用结论 T：当批规定且已到体检节点；F：未触发或本批确认不要求；U：有无统一体检门禁／医院等级政策未知",
          "requirement": "原文规则行： **R018** L3/L4｜体检完成及适用结论 ； T：当批规定且已到体检节点；F：未触发或本批确认不要求；U：有无统一体检门禁／医院等级政策未知 ； SRC-002/004/005/013/017/020（SRC-020 **仅通知索引**）；F009,F027,F031；M001/M016/M018。仅核指定机构签发结果状态、完成时间、同人；**面试/公示/体检可有重叠窗口**；不从通知标题或病历推断结论 ； 完成记录存在及时间吻合→`PASS_FACT`（非医学诊断）；缺权威状态→`SOURCE_UNAVAILABLE`，不合格后果→`NEEDS_HUMAN_DECISION`；下一：体检接收单位／人事 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R019",
          "title": "R019 · L1a/L3｜心理测评完成及受限结论 T：该批已触发前置或后置心理测评；F：未到阶段或经有权确认不需要；U：当批先后、必经性未明",
          "requirement": "原文规则行： **R019** L1a/L3｜心理测评完成及受限结论 ； T：该批已触发前置或后置心理测评；F：未到阶段或经有权确认不需要；U：当批先后、必经性未明 ； SRC-001/002/005/013/016；F009,F028,F031；M001/M016/M019。比完成时间和有权部门最小结论，避免量表答案／密码进入案件；不以心理原数据自动筛选 ； 完成事实可信→`PASS_FACT`，结果缺→`SOURCE_UNAVAILABLE`，是否满足聘用条件→`NEEDS_HUMAN_DECISION`；下一：测评主管／招聘归口 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R020",
          "title": "R020 · L3/L4｜教职工准入查询结论 T：该批或现行总则要求准入查询且已到节点；F：有权制度明确本类免查；U：沉积地质等公告未载明且无统一原文",
          "requirement": "原文规则行： **R020** L3/L4｜教职工准入查询结论 ； T：该批或现行总则要求准入查询且已到节点；F：有权制度明确本类免查；U：沉积地质等公告未载明且无统一原文 ； SRC-001/002/003/004/013/016；F029,F031,F043；M001/M020。仅认可学校人事处签发的最小结果及业务用途，不收个人查询底层名单；公告沉默不能推断免查 ； 可信已查事实→`PASS_FACT`，规定与适用未知→`POLICY_UNCONFIRMED`，结果效力由人事处决定→`NEEDS_HUMAN_DECISION`；下一：人事处 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R021",
          "title": "R021 · L4｜报到原件和身份复核 T：当批到了实际报到及原件核验节点；F：尚未通知报到或本人未到该阶段；U：原件核验角色或日期未知",
          "requirement": "原文规则行： **R021** L4｜报到原件和身份复核 ； T：当批到了实际报到及原件核验节点；F：尚未通知报到或本人未到该阶段；U：原件核验角色或日期未知 ； SRC-001/002/005/017；F010–F015,F030；M007/M008/M009/M010/M021。报到窗口按当批要求比身份证、毕业及学位双证**原件**和 L1 暂代记录；此前正当暂代不作虚假材料 ； 原件匹配→`PASS_FACT`，到期未提供→`NEEDS_HUMAN_DECISION`，窗口无记录→`SOURCE_UNAVAILABLE`；下一：报到经办／人事 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R022",
          "title": "R022 · L4｜最终聘用确认的来源、授权及效力 T：该批已经进入终局聘用确定环节；F：仍处面试/拟聘且本批尚无终局动作；U：该批决定机关、程序或记录形态未知",
          "requirement": "原文规则行： **R022** L4｜最终聘用确认的来源、授权及效力 ； T：该批已经进入终局聘用确定环节；F：仍处面试/拟聘且本批尚无终局动作；U：该批决定机关、程序或记录形态未知 ； SRC-001/002/004/005；F007,F024,F027–F032；M015/M016/M018/M019/M020/M022/M023。核本批有权部门提供的**最终聘用确认事件或可信状态**、对应人岗批次、条件达成、撤销/递补；不强制必须有独立纸质《录用决定书》，但拟聘名单不能取代权威终局确认 ； **仅确认有权记录存在且与本案匹配**→`PASS_FACT`；决定形式及职权不明→`POLICY_UNCONFIRMED`，是否确定/撤销仍→`NEEDS_HUMAN_DECISION`；下一：当批聘用归口人事／项目决策者 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R023",
          "title": "R023 · L5｜合同法律关系与归口确认 T：已拟制本次用工合同／聘用协议；F：尚未进入签约或转入正式教职工业务；U：劳动合同、聘用合同、服务协议性质不明",
          "requirement": "原文规则行： **R023** L5｜合同法律关系与归口确认 ； T：已拟制本次用工合同／聘用协议；F：尚未进入签约或转入正式教职工业务；U：劳动合同、聘用合同、服务协议性质不明 ； SRC-002/006/007/010/011/012；F007,F033,F043；M001/M024/M025。比岗位与合同名称、约定及人事法务意见，依据实际关系判适用法律；2019 编制合同和一般民商合同不自动套用 ； 能证明有合同草案→`PASS_FACT`；法律性质未有权认定→`POLICY_UNCONFIRMED`／`NEEDS_HUMAN_DECISION`；下一：人事／法务 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R024",
          "title": "R024 · L5｜合同人、岗、期限及条款一致性 T：已有本案草案或签署版；F：未进入合同阶段；U：聘期／岗位约束无有效当批依据",
          "requirement": "原文规则行： **R024** L5｜合同人、岗、期限及条款一致性 ； T：已有本案草案或签署版；F：未进入合同阶段；U：聘期／岗位约束无有效当批依据 ； SRC-001/002/006/010/011/012；F006,F007,F010–F012,F034–F036,F038；M001/M002/M007/M022/M024/M027。对照同人身份、用工主体、岗位、当批聘期和正文约定；沉积地质 6 个月与第二批 1 年均**仅当批** ； 字面一致→`PASS_FACT`，身份／雇主错配→`CONFLICT`，劳动合同条款充分性→`NEEDS_HUMAN_DECISION`；下一：合同承办／人事法务 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R025",
          "title": "R025 · L5｜合同真实甲方及签署代表的现行权限 T：已准备/声称签订本类合同；F：尚未启动签约；U：签约甲方是学校、学院、项目依托法人或第三方、授权适用性未知",
          "requirement": "原文规则行： **R025** L5｜合同真实甲方及签署代表的现行权限 ； T：已准备/声称签订本类合同；F：尚未启动签约；U：签约甲方是学校、学院、项目依托法人或第三方、授权适用性未知 ； SRC-006/008/012；F007,F034,F037,F039,F043；M024/M025/M027。先核实际甲方与法律关系，再按该签约主体分别比法定代表人/委托代理人的签约日权限、范围、变更与撤销；党政办**一般合同授权清单是否覆盖劳动/聘用合同未知**，不得直接推定 ； 签约人和合同文本的**事实关联**有权核实后方可 `PASS_FACT`；适用制度/授权不明→`POLICY_UNCONFIRMED`，越权争议→`NEEDS_HUMAN_DECISION`；下一：校人事/法务/真实甲方授权保管人 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R026",
          "title": "R026 · L5｜合同适用审批链与草案版本 T：该合同种类依现行学校规则确需审签；F：有权校规明确该类无需此审批；U：2024 办法原件、归口分类与实际适用性不明",
          "requirement": "原文规则行： **R026** L5｜合同适用审批链与草案版本 ； T：该合同种类依现行学校规则确需审签；F：有权校规明确该类无需此审批；U：2024 办法原件、归口分类与实际适用性不明 ； SRC-006/008/012；F033,F037,F038,F043；M024/M025/M026。核审批者职权、时点、其批准所针对的草案 hash；既有一般合同系统上线不证明人事合同已接入 ； 审批链表面一致→`PASS_FACT`，未经授权／变更后失配→`CONFLICT`，政策未知→`POLICY_UNCONFIRMED`；下一：合同归口／法务 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R027",
          "title": "R027 · L5→L6｜双方签署、用印／电子验签与最终版本 T：声称合同已签署；F：仍在草稿／审签前；U：合同签署形式、用印条件不明",
          "requirement": "原文规则行： **R027** L5→L6｜双方签署、用印／电子验签与最终版本 ； T：声称合同已签署；F：仍在草稿／审签前；U：合同签署形式、用印条件不明 ； SRC-002/006/008/012；F034,F037–F039；M024/M025/M026/M027。比双签或可信电子验签、实际签约人权限、时间、最终 hash；印章图像扫描仅是待核线索，合同法效力由人审 ； 签署文件事实可证→`PASS_FACT`，未经授权结论未定→`NEEDS_HUMAN_DECISION`，版本不符→`CONFLICT`；下一：签署双方／合同归口 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R028",
          "title": "R028 · L6｜合同归档与交付关系 T：已存在已签最终合同、应按校方制度归档；F：未签、无归档义务阶段；U：劳动聘用合同的档案归口与保存期限未核",
          "requirement": "原文规则行： **R028** L6｜合同归档与交付关系 ； T：已存在已签最终合同、应按校方制度归档；F：未签、无归档义务阶段；U：劳动聘用合同的档案归口与保存期限未核 ； SRC-006/012/013；F038,F040,F043；M027/M028。比归档对象 hash、归档人、签署版与交付索引；不将“上传一份 PDF”当成校档案入库 ； 归档可追溯→`PASS_FACT`，归档渠道无法访问→`SOURCE_UNAVAILABLE`，归口未明→`POLICY_UNCONFIRMED`；下一：人事／档案部门 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R029",
          "title": "R029 · L0/L6｜上游／下游独立决定只读引用 T：存在 T08-T01 岗位立项、T08-T03 续期、T08-T04 离岗或 T08-T05 团队组织授权人变更；F：无此类独立事项；U：R02 原账或决定机关未明",
          "requirement": "原文规则行： **R029** L0/L6｜上游／下游独立决定只读引用 ； T：存在 T08-T01 岗位立项、T08-T03 续期、T08-T04 离岗或 T08-T05 团队组织授权人变更；F：无此类独立事项；U：R02 原账或决定机关未明 ； SRC-007/011/015；F006–F008,F041,F042,F044；M029/M030。只比原决定案号、业务对象、签发机关、版本和生效时间；**不在本模板重做岗位审批、续期或离岗批准，也不把 T08-T05 团队授权当校级合同签约授权** ； 真实引用一致→`PASS_FACT`，旧版与现行决定冲突→`CONFLICT`，接口／原文不明→`SOURCE_UNAVAILABLE`／`POLICY_UNCONFIRMED`；下一：原业务 Owner 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        },
        {
          "id": "R030",
          "title": "R030 · 任一阶段｜证据变更、隐私许可与定向失效",
          "requirement": "原文规则行： **R030** 任一阶段｜证据变更、隐私许可与定向失效 ； T：任一被 R 消费的材料、公告、决定或访问权限发生变更；F：无变化；U：旧新版本、受影响引用无法可靠解析 ； SRC-013/014/015；F001,F005,F010,F019,F026,F032,F038,F040,F043,F044；M003/M007/M017/M023/M027/M028/M030。按 sourceVersion/hash 与 `R→F/M/SRC` 依赖图找受影响规则，旧观察结果失效待重审；P3 仅受权人可见；不凭新上传时间覆盖旧正式决定 ； 变更影响集已确定→`PASS_FACT`（仅重审调度）；依赖无法追溯→`NEEDS_HUMAN_DECISION`，授权访问不明→`POLICY_UNCONFIRMED`；下一：可信案卷审查员／原签发机关 。执行边界：只核验本案可追溯事实与来源版本；SRC 是研究来源索引，不是案卷材料 SourceRef。若政策现行性、适用身份、签发权限、法律关系或事实真伪未证，结果必须保持待确认/人工复核；不得自动批准、拒绝、签约、解除、任命或回写学校系统。",
          "execution": "manual",
          "targetScope": "subject"
        }
      ]
    }
  ],
  "policyVersionIds": [],
  "stages": [
    {
      "id": "l0",
      "name": "L0 批次／岗位识别",
      "kind": "manual-review",
      "executorRole": "reviewer",
      "workflowOwner": "local",
      "nextStageId": "l1"
    },
    {
      "id": "l1",
      "name": "L1 报名与资格",
      "kind": "manual-review",
      "executorRole": "reviewer",
      "workflowOwner": "local",
      "nextStageId": "l2"
    },
    {
      "id": "l2",
      "name": "L2 面试、拟聘",
      "kind": "manual-review",
      "executorRole": "reviewer",
      "workflowOwner": "local",
      "nextStageId": "l3"
    },
    {
      "id": "l3",
      "name": "L3 公示、异议及后置核验",
      "kind": "manual-review",
      "executorRole": "reviewer",
      "workflowOwner": "local",
      "nextStageId": "l4"
    },
    {
      "id": "l4",
      "name": "L4 最终用工确认／报到",
      "kind": "manual-review",
      "executorRole": "reviewer",
      "workflowOwner": "local",
      "nextStageId": "l5"
    },
    {
      "id": "l5",
      "name": "L5 合同草稿、审核与订立",
      "kind": "manual-review",
      "executorRole": "reviewer",
      "workflowOwner": "local",
      "nextStageId": "l6"
    },
    {
      "id": "l6",
      "name": "L6 归档、复核、后续关联",
      "kind": "handoff",
      "executorRole": "teacher",
      "workflowOwner": "local"
    }
  ],
  "outputs": [
    {
      "id": "fact-review-summary",
      "kind": "item-feedback",
      "audience": "reviewer"
    },
    {
      "id": "targeted-supplement-tasks",
      "kind": "supplement-list",
      "audience": "reviewer"
    }
  ],
  "autoPassPolicy": {
    "enabled": false
  },
  "status": "draft",
  "createdAt": "2026-10-24T03:10:00+08:00"
}

/** Backward-friendly explicit name for the definition object. */
export const template = templateVersion

/** Research provenance only. SRC IDs here are not case evidence SourceRef values. */
export const r02Metadata: R02Metadata = {
  "templateId": "T08-T02",
  "name": "科研助理、项目编外人员录用与聘用合同核验",
  "sourceDocumentPath": "docs/design/review-agent/business-templates/R02/T08-T02.md",
  "researchSourcePath": "docs/design/review-agent/business-templates/R02/research-original/T08-T02.md",
  "sourceDocumentSha256": "e6fa47059b51d517f44d0277c9415271cd2f2e924e79eb8f505465b2793f01ab",
  "sourceDocumentBytes": 149841,
  "manifestExpectedBytes": 149842,
  "manifestExpectedSha256": "17bd28b28c5599812493f4a4de68de48a62ea040f3e02abb3404c969c8e1ada9",
  "sourceIntegrityStatus": "LINE_ENDING_DRIFT_ONE_LF",
  "sourceIntegrityNote": "当前 research-original blob 的 UTF-8 原始字节不含末尾 LF；00_模板清单_128.tsv 的 bytes 与 SHA-256 对应同一正文追加一个 LF。未发现正文差异，不修改原件或清单。",
  "officialSchoolTemplate": false,
  "researchStatus": "RESEARCH_HANDOFF_READY",
  "policyEvidenceStatus": "PARTIAL",
  "sourceRecordCount": 40,
  "fieldCount": 44,
  "materialSlotCount": 45,
  "criterionCount": 30,
  "criteria": [
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R001",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-007",
        "SRC-010",
        "SRC-011"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R002",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-003",
        "SRC-004",
        "SRC-009",
        "SRC-014",
        "SRC-017",
        "SRC-019"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R003",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-004",
        "SRC-011",
        "SRC-015",
        "SRC-017"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R004",
      "srcIds": [
        "SRC-001",
        "SRC-014",
        "SRC-017",
        "SRC-019"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R005",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-004",
        "SRC-013",
        "SRC-017"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R006",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-004",
        "SRC-014",
        "SRC-017"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R007",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-005",
        "SRC-017"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R008",
      "srcIds": [
        "SRC-001",
        "SRC-005",
        "SRC-017"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R009",
      "srcIds": [
        "SRC-001",
        "SRC-017"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R010",
      "srcIds": [
        "SRC-002",
        "SRC-004",
        "SRC-016",
        "SRC-017"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R011",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-004",
        "SRC-016",
        "SRC-018"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R012",
      "srcIds": [
        "SRC-005",
        "SRC-016"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R013",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-004",
        "SRC-016",
        "SRC-018",
        "SRC-020"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R014",
      "srcIds": [
        "SRC-001",
        "SRC-004",
        "SRC-016"
      ],
      "evidenceStatus": "PARTIAL"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R015",
      "srcIds": [
        "SRC-001",
        "SRC-004",
        "SRC-005",
        "SRC-017"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R016",
      "srcIds": [
        "SRC-005",
        "SRC-013"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R017",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-005",
        "SRC-014"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R018",
      "srcIds": [
        "SRC-002",
        "SRC-004",
        "SRC-005",
        "SRC-013",
        "SRC-017",
        "SRC-020"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R019",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-005",
        "SRC-013",
        "SRC-016"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R020",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-003",
        "SRC-004",
        "SRC-013",
        "SRC-016"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R021",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-005",
        "SRC-017"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R022",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-004",
        "SRC-005"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R023",
      "srcIds": [
        "SRC-002",
        "SRC-006",
        "SRC-007",
        "SRC-010",
        "SRC-011",
        "SRC-012"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R024",
      "srcIds": [
        "SRC-001",
        "SRC-002",
        "SRC-006",
        "SRC-010",
        "SRC-011",
        "SRC-012"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R025",
      "srcIds": [
        "SRC-006",
        "SRC-008",
        "SRC-012"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R026",
      "srcIds": [
        "SRC-006",
        "SRC-008",
        "SRC-012"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R027",
      "srcIds": [
        "SRC-002",
        "SRC-006",
        "SRC-008",
        "SRC-012"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R028",
      "srcIds": [
        "SRC-006",
        "SRC-012",
        "SRC-013"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R029",
      "srcIds": [
        "SRC-007",
        "SRC-011",
        "SRC-015"
      ],
      "evidenceStatus": "UNCONFIRMED"
    },
    {
      "sectionId": "R02_RESEARCH_RULES",
      "criterionId": "R030",
      "srcIds": [
        "SRC-013",
        "SRC-014",
        "SRC-015"
      ],
      "evidenceStatus": "UNCONFIRMED"
    }
  ]
}
