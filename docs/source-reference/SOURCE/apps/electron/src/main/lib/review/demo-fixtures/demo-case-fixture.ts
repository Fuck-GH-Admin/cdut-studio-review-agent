/**
 * 本文件为演示用虚构数据，不得作为任何真实审核依据。
 *
 * 内容审核专区 demo 案卷 fixtures：三栏工作台（左=校规依据+AI 规则大纲 /
 * 中=申报表+识别条目与证明 / 右=AI 审核发现）所需的全部静态数据。
 *
 * 所有姓名、学校、活动、证书、日期均为虚构，展示用名称统一带"（模拟）"后缀。
 * block ID 采用稳定序列（blk-rule-001 等，不含 uuid），保证重审之间锚点可比较。
 */

import type {
  EvidenceDocument,
  ReviewCase,
  ReviewDocumentBlock,
  ReviewItem,
  ReviewSourceAnchor,
  RuleOutlineItem,
  SourceDocument,
} from '@profer/shared'

// ===== SVG 证书常量（证明材料，无 OCR 依赖，纯内嵌字符串） =====

/** 证明 1：蓝桥杯省赛二等奖证书（与申报表的一等奖冲突 → 等级冲突红卡） */
const CERT_BLUEBRIDGE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260">
  <rect x="4" y="4" width="412" height="252" fill="#fffdf5" stroke="#b8860b" stroke-width="6"/>
  <rect x="16" y="16" width="388" height="228" fill="none" stroke="#d9b45a" stroke-width="2"/>
  <text x="210" y="60" text-anchor="middle" font-size="26" font-weight="bold" fill="#8b5a00">获奖证书（模拟）</text>
  <text x="210" y="105" text-anchor="middle" font-size="17" fill="#333">姓名：张三（模拟）</text>
  <text x="210" y="140" text-anchor="middle" font-size="17" fill="#333">奖项：蓝桥杯省赛</text>
  <text x="210" y="175" text-anchor="middle" font-size="17" fill="#333">等级：二等奖</text>
  <text x="210" y="210" text-anchor="middle" font-size="17" fill="#333">日期：2024-11-20</text>
</svg>`

/** 证明 2：优秀学生干部证书（印章模糊、等级栏被遮挡 → 识别 unclear → 黄卡） */
const CERT_STUDENT_CADRE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260">
  <rect x="4" y="4" width="412" height="252" fill="#fffdf5" stroke="#4a6fa5" stroke-width="6"/>
  <rect x="16" y="16" width="388" height="228" fill="none" stroke="#9db4d6" stroke-width="2"/>
  <text x="210" y="60" text-anchor="middle" font-size="24" font-weight="bold" fill="#28527a">荣誉证书（模拟）</text>
  <text x="210" y="105" text-anchor="middle" font-size="17" fill="#333">姓名：张三（模拟）</text>
  <text x="210" y="140" text-anchor="middle" font-size="17" fill="#333">奖项：优秀学生干部</text>
  <rect x="150" y="152" width="120" height="32" fill="#cccccc" opacity="0.85"/>
  <text x="210" y="175" text-anchor="middle" font-size="15" fill="#666">等级：（遮挡）</text>
  <text x="210" y="215" text-anchor="middle" font-size="17" fill="#333">日期：2024-11-01</text>
  <circle cx="352" cy="200" r="34" fill="none" stroke="#c0392b" stroke-width="3" opacity="0.35"/>
</svg>`

/** 证明 3：社区疫情防控志愿服务证明 */
const CERT_VOLUNTEER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260">
  <rect x="4" y="4" width="412" height="252" fill="#f7fdf9" stroke="#2e7d54" stroke-width="6"/>
  <rect x="16" y="16" width="388" height="228" fill="none" stroke="#8fc9ad" stroke-width="2"/>
  <text x="210" y="60" text-anchor="middle" font-size="24" font-weight="bold" fill="#1e5b3c">志愿服务证明（模拟）</text>
  <text x="210" y="105" text-anchor="middle" font-size="17" fill="#333">姓名：张三（模拟）</text>
  <text x="210" y="140" text-anchor="middle" font-size="17" fill="#333">项目：社区疫情防控志愿服务</text>
  <text x="210" y="175" text-anchor="middle" font-size="17" fill="#333">类别：志愿服务</text>
  <text x="210" y="210" text-anchor="middle" font-size="17" fill="#333">日期：2024-12-01</text>
</svg>`

/** 证明 4：校园歌手大赛校级一等奖证书（日期 2026-03-10 超出认可时段 → 日期越界红卡） */
const CERT_SINGER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260">
  <rect x="4" y="4" width="412" height="252" fill="#fffdf8" stroke="#7d3c98" stroke-width="6"/>
  <rect x="16" y="16" width="388" height="228" fill="none" stroke="#c9a7e0" stroke-width="2"/>
  <text x="210" y="60" text-anchor="middle" font-size="26" font-weight="bold" fill="#5b2c6f">获奖证书（模拟）</text>
  <text x="210" y="105" text-anchor="middle" font-size="17" fill="#333">姓名：张三（模拟）</text>
  <text x="210" y="140" text-anchor="middle" font-size="17" fill="#333">奖项：校园歌手大赛</text>
  <text x="210" y="175" text-anchor="middle" font-size="17" fill="#333">等级：校级一等奖</text>
  <text x="210" y="210" text-anchor="middle" font-size="17" fill="#333">日期：2026-03-10</text>
</svg>`

// ===== 申报表 CSV 原文（6 条申报 + 表头行） =====

/** 申报表表头行 */
const APP_HEADER_LINE = '序号,申报人,学号,学年,指标类别,项目名称,申报等级,申报分值,获得日期,证明材料'

/** 6 条申报的 CSV 数据行（顺序与 blk-app-001..006 一一对应） */
const APP_DATA_LINES: string[] = [
  '1,张三（模拟）,2023123456,2025-2026,智育,学科竞赛-蓝桥杯省赛,一等奖,4,2024-11-20,蓝桥杯获奖证书.svg',
  '2,张三（模拟）,2023123456,2025-2026,智育,学科竞赛-数学建模国赛,国家二等奖,4,2024-10-15,（无）',
  '3,张三（模拟）,2023123456,2025-2026,德育,志愿服务-社区疫情防控志愿,,2,2024-12-01,志愿服务证明.svg',
  '4,张三（模拟）,2023123456,2025-2026,劳育,劳动实践-校园劳动周,,2,2024-12-05,（无）',
  '5,张三（模拟）,2023123456,2025-2026,美育,文体活动-校园歌手大赛,校级一等奖,2,2026-03-10,校园歌手大赛证书.svg',
  '6,张三（模拟）,2023123456,2025-2026,其他,荣誉称号-优秀学生干部,,2,2024-11-01,优秀学生干部证书.svg',
]

// ===== 块构建工具 =====

interface MakeBlockOptions {
  /** 图片块的描述（仅 kind 为 image 时有意义） */
  imageAlt?: string
}

/** 构建一个结构化块（page 固定为 1：本 demo 文档均无分页概念） */
function makeBlock(id: string, kind: ReviewDocumentBlock['kind'], text: string, options?: MakeBlockOptions): ReviewDocumentBlock {
  const block: ReviewDocumentBlock = { id, kind, text, page: 1 }
  if (kind === 'image') block.imageAlt = options?.imageAlt ?? ''
  return block
}

/** 构建指向某文档块的定位锚点（block 级精度，重审之间可比较） */
function anchor(documentId: string, blockId?: string): ReviewSourceAnchor {
  if (blockId) return { documentId, blockId, page: 1, precision: 'block' }
  return { documentId, page: 1, precision: 'page' }
}

/** 生成 SVG 证明文档（单个 image 块，alt 承载证书内容文本） */
function makeEvidenceDocument(input: {
  id: string
  fileName: string
  svg: string
  blockId: string
  imageAlt: string
  importedAt: string
}): SourceDocument {
  return {
    id: input.id,
    fileName: input.fileName,
    role: 'evidence',
    mimeType: 'image/svg+xml',
    sizeBytes: new TextEncoder().encode(input.svg).length,
    parseStatus: 'parsed',
    blocks: [makeBlock(input.blockId, 'image', '', { imageAlt: input.imageAlt })],
    origin: 'fixture',
    importedAt: input.importedAt,
  }
}

/** 构建演示案卷（虚构数据，不得作为真实审核依据） */
export function buildDemoCase(): ReviewCase {
  const now = new Date().toISOString()

  // ===== 文档 1：规则材料（markdown，7 类条款逐条切块） =====
  const ruleBlocks: ReviewDocumentBlock[] = [
    makeBlock('blk-rule-001', 'heading', '学生综合素质测评实施办法（模拟）'),
    makeBlock('blk-rule-002', 'paragraph', '（演示数据，虚构文件，不作为任何真实审核依据）适用学年：2025-2026。'),

    // 1. 准入条件
    makeBlock('blk-rule-003', 'heading', '第一章 准入条件'),
    makeBlock('blk-rule-004', 'paragraph', '申报本学年综合素质测评加分的学生，须满足本学年无挂科、无违纪记录的准入条件。'),

    // 2. 指标分类
    makeBlock('blk-rule-005', 'heading', '第二章 指标分类'),
    makeBlock('blk-rule-006', 'list-item', '综合素质测评指标分为德育、智育、体育、美育、劳育五类。'),
    makeBlock('blk-rule-007', 'list-item', '学科竞赛与学术创新成果计入智育类；志愿服务计入德育类；劳动实践计入劳育类；文体活动计入美育类。'),

    // 3. 等级分值
    makeBlock('blk-rule-008', 'heading', '第三章 等级分值'),
    makeBlock('blk-rule-009', 'list-item', '学科竞赛：国家级一等奖 6 分、二等奖 4 分、三等奖 2 分。'),
    makeBlock('blk-rule-010', 'list-item', '学科竞赛：省级一等奖 4 分、二等奖 2.5 分、三等奖 1.5 分。'),
    makeBlock('blk-rule-011', 'list-item', '学科竞赛：校级一等奖 2 分、二等奖 1 分、三等奖 0.5 分。'),

    // 4. 上限
    makeBlock('blk-rule-012', 'heading', '第四章 计分上限'),
    makeBlock('blk-rule-013', 'paragraph', '学科竞赛类得分单学年累计不超过 8 分，超出部分不予计入。'),

    // 5. 互斥
    makeBlock('blk-rule-014', 'heading', '第五章 互斥与重复申报'),
    makeBlock('blk-rule-015', 'list-item', '同一活动获得多级奖项的，按最高等级计分，不得重复申报。'),
    makeBlock('blk-rule-016', 'list-item', '志愿服务与劳动实践互斥计分：同一事项只能作为其中一类计算，不得双重计分。'),

    // 6. 时间范围
    makeBlock('blk-rule-017', 'heading', '第六章 时间范围'),
    makeBlock('blk-rule-018', 'paragraph', '仅认可 2024-09-01 至 2025-08-31 期间获得的奖项，区间外获得的奖项不予计分。'),

    // 7. 材料要求
    makeBlock('blk-rule-019', 'heading', '第七章 材料要求'),
    makeBlock('blk-rule-020', 'list-item', '每项申报须附证书照片或电子证明，无证明材料的申报不予受理。'),
    makeBlock('blk-rule-021', 'list-item', '证书须含姓名、奖项名称、等级、日期四项要素，缺项或无法辨认的转人工复核。'),
  ]

  const ruleDoc: SourceDocument = {
    id: 'doc-rule-001',
    fileName: '综合素质测评实施办法（模拟）v2025.md',
    role: 'rule',
    mimeType: 'text/markdown',
    sizeBytes: new TextEncoder().encode(ruleBlocks.map((b) => b.text).join('\n')).length,
    parseStatus: 'parsed',
    blocks: ruleBlocks,
    origin: 'fixture',
    importedAt: now,
  }

  // ===== 文档 2：申报表（CSV，表头行 blk-app-000 + 6 条申报行 blk-app-001..006） =====
  const appBlocks: ReviewDocumentBlock[] = [
    makeBlock('blk-app-000', 'heading', APP_HEADER_LINE),
    ...APP_DATA_LINES.map((line, index) => {
      const seq = String(index + 1).padStart(3, '0')
      return makeBlock(`blk-app-${seq}`, 'line', line)
    }),
  ]

  const appCsvText = [APP_HEADER_LINE, ...APP_DATA_LINES].join('\n')
  const appDoc: SourceDocument = {
    id: 'doc-app-001',
    fileName: '综测申报表（模拟）张三.csv',
    role: 'application',
    mimeType: 'text/csv',
    sizeBytes: new TextEncoder().encode(appCsvText).length,
    parseStatus: 'parsed',
    blocks: appBlocks,
    origin: 'fixture',
    importedAt: now,
  }

  // ===== 文档 3-6：证明材料（4 份 SVG 证书） =====
  const evidenceDocs: SourceDocument[] = [
    makeEvidenceDocument({
      id: 'doc-ev-001',
      fileName: '蓝桥杯省赛获奖证书（模拟）.svg',
      svg: CERT_BLUEBRIDGE_SVG,
      blockId: 'blk-ev-001',
      imageAlt:
        '获奖证书（模拟）：姓名 张三（模拟），奖项 蓝桥杯省赛，等级 二等奖，日期 2024-11-20（证书等级为二等奖，与申报表的一等奖不一致）',
      importedAt: now,
    }),
    makeEvidenceDocument({
      id: 'doc-ev-002',
      fileName: '优秀学生干部证书（模拟）.svg',
      svg: CERT_STUDENT_CADRE_SVG,
      blockId: 'blk-ev-002',
      imageAlt:
        '荣誉证书（模拟）：姓名 张三（模拟），奖项 优秀学生干部，日期 2024-11-01；印章模糊，等级栏被遮挡，无法辨认等级',
      importedAt: now,
    }),
    makeEvidenceDocument({
      id: 'doc-ev-003',
      fileName: '社区疫情防控志愿服务证明（模拟）.svg',
      svg: CERT_VOLUNTEER_SVG,
      blockId: 'blk-ev-003',
      imageAlt:
        '志愿服务证明（模拟）：姓名 张三（模拟），项目 社区疫情防控志愿服务，类别 志愿服务，日期 2024-12-01',
      importedAt: now,
    }),
    makeEvidenceDocument({
      id: 'doc-ev-004',
      fileName: '校园歌手大赛获奖证书（模拟）.svg',
      svg: CERT_SINGER_SVG,
      blockId: 'blk-ev-004',
      imageAlt:
        '获奖证书（模拟）：姓名 张三（模拟），奖项 校园歌手大赛，等级 校级一等奖，日期 2026-03-10（超出认可时段）',
      importedAt: now,
    }),
  ]

  const documents: SourceDocument[] = [ruleDoc, appDoc, ...evidenceDocs]

  // ===== 申报事项（6 条，锚点指向申报表对应行） =====
  const items: ReviewItem[] = [
    {
      id: 'item-001',
      title: '学科竞赛 蓝桥杯省赛一等奖',
      category: '智育',
      level: '一等奖',
      declaredScore: 4,
      activityDate: '2024-11-20',
      organizer: '蓝桥杯大赛组委会（模拟）',
      anchor: anchor('doc-app-001', 'blk-app-001'),
      evidenceDocumentIds: ['doc-ev-001'],
      status: 'identified',
      identifiedBy: 'fixture',
    },
    {
      id: 'item-002',
      title: '学科竞赛 数学建模国赛国家二等奖',
      category: '智育',
      level: '国家二等奖',
      declaredScore: 4,
      activityDate: '2024-10-15',
      organizer: '全国大学生数学建模竞赛组委会（模拟）',
      anchor: anchor('doc-app-001', 'blk-app-002'),
      evidenceDocumentIds: [],
      status: 'identified',
      identifiedBy: 'fixture',
    },
    {
      id: 'item-003',
      title: '志愿服务 社区疫情防控志愿',
      category: '德育',
      declaredScore: 2,
      activityDate: '2024-12-01',
      organizer: '社区居委会（模拟）',
      anchor: anchor('doc-app-001', 'blk-app-003'),
      evidenceDocumentIds: ['doc-ev-003'],
      status: 'identified',
      identifiedBy: 'fixture',
    },
    {
      id: 'item-004',
      title: '劳动实践 校园劳动周',
      category: '劳育',
      declaredScore: 2,
      activityDate: '2024-12-05',
      organizer: '学校后勤处（模拟）',
      anchor: anchor('doc-app-001', 'blk-app-004'),
      evidenceDocumentIds: [],
      status: 'identified',
      identifiedBy: 'fixture',
    },
    {
      id: 'item-005',
      title: '文体活动 校园歌手大赛校级一等奖',
      category: '美育',
      level: '校级一等奖',
      declaredScore: 2,
      activityDate: '2026-03-10',
      organizer: '校学生会（模拟）',
      anchor: anchor('doc-app-001', 'blk-app-005'),
      evidenceDocumentIds: ['doc-ev-004'],
      status: 'identified',
      identifiedBy: 'fixture',
    },
    {
      id: 'item-006',
      title: '荣誉称号 优秀学生干部',
      category: '其他',
      declaredScore: 2,
      activityDate: '2024-11-01',
      organizer: '学生工作处（模拟）',
      anchor: anchor('doc-app-001', 'blk-app-006'),
      evidenceDocumentIds: ['doc-ev-002'],
      status: 'identified',
      identifiedBy: 'fixture',
    },
  ]

  // ===== 证明识别结果（与 item 反向绑定） =====
  const evidences: EvidenceDocument[] = [
    {
      documentId: 'doc-ev-001',
      recognizedFacts: '蓝桥杯省赛获奖证书（模拟）：张三（模拟），二等奖，2024-11-20',
      recognizedLevel: '二等奖',
      parseStatus: 'recognized',
      linkedItemIds: ['item-001'],
    },
    {
      documentId: 'doc-ev-002',
      recognizedFacts: '优秀学生干部荣誉证书（模拟）：张三（模拟），2024-11-01；印章模糊，等级栏被遮挡',
      parseStatus: 'unclear',
      linkedItemIds: ['item-006'],
    },
    {
      documentId: 'doc-ev-003',
      recognizedFacts: '社区疫情防控志愿服务证明（模拟）：张三（模拟），志愿服务，2024-12-01',
      parseStatus: 'recognized',
      linkedItemIds: ['item-003'],
    },
    {
      documentId: 'doc-ev-004',
      recognizedFacts: '校园歌手大赛获奖证书（模拟）：张三（模拟），校级一等奖，2026-03-10',
      recognizedLevel: '校级一等奖',
      parseStatus: 'recognized',
      linkedItemIds: ['item-005'],
    },
  ]

  // ===== 规则大纲（7 类条款各一条，锚点指向规则文档真实存在的块） =====
  const outline: RuleOutlineItem[] = [
    {
      id: 'outline-001',
      category: '准入条件',
      title: '申报准入条件',
      summary: '本学年无挂科、无违纪记录方可申报加分。',
      anchors: [anchor('doc-rule-001', 'blk-rule-004')],
      generatedBy: 'fixture',
    },
    {
      id: 'outline-002',
      category: '指标分类',
      title: '五类指标分类',
      summary: '测评指标分为德育、智育、体育、美育、劳育五类。',
      anchors: [anchor('doc-rule-001', 'blk-rule-006'), anchor('doc-rule-001', 'blk-rule-007')],
      generatedBy: 'fixture',
    },
    {
      id: 'outline-003',
      category: '等级分值',
      title: '学科竞赛获奖等级分值',
      summary:
        '国家级一等 6 / 二等 4 / 三等 2 分；省级一等 4 / 二等 2.5 / 三等 1.5 分；校级一等 2 / 二等 1 / 三等 0.5 分。',
      constraint: {
        kind: 'level-mapping',
        levels: {
          '国家级一等奖': 6,
          '国家级二等奖': 4,
          '国家二等奖': 4,
          '国家级三等奖': 2,
          '省级一等奖': 4,
          '省级二等奖': 2.5,
          '省级三等奖': 1.5,
          '校级一等奖': 2,
          '校级二等奖': 1,
          '校级三等奖': 0.5,
        },
        levelKeywords: {
          '一等奖': '一等奖',
          '二等奖': '二等奖',
          '三等奖': '三等奖',
        },
      },
      anchors: [
        anchor('doc-rule-001', 'blk-rule-009'),
        anchor('doc-rule-001', 'blk-rule-010'),
        anchor('doc-rule-001', 'blk-rule-011'),
      ],
      generatedBy: 'fixture',
    },
    {
      id: 'outline-004',
      category: '上限',
      title: '学科竞赛类单学年累计上限',
      summary: '学科竞赛类单学年累计不超过 8 分。',
      constraint: { kind: 'max-score', value: 8 },
      anchors: [anchor('doc-rule-001', 'blk-rule-013')],
      generatedBy: 'fixture',
    },
    {
      id: 'outline-005',
      category: '互斥',
      title: '重复申报与互斥计分',
      summary:
        '同一活动按最高等级计分且不得重复申报；志愿服务与劳动实践互斥，同一事项只能计一类。',
      constraint: { kind: 'mutual-exclusion', exclusionGroup: 'volunteer-labor' },
      anchors: [anchor('doc-rule-001', 'blk-rule-015'), anchor('doc-rule-001', 'blk-rule-016')],
      generatedBy: 'fixture',
    },
    {
      id: 'outline-006',
      category: '时间范围',
      title: '奖项认可时间范围',
      summary: '仅认可 2024-09-01 至 2025-08-31 期间获得的奖项。',
      constraint: { kind: 'date-range', dateFrom: '2024-09-01', dateTo: '2025-08-31' },
      anchors: [anchor('doc-rule-001', 'blk-rule-018')],
      generatedBy: 'fixture',
    },
    {
      id: 'outline-007',
      category: '材料要求',
      title: '申报材料要求',
      summary: '每项申报须附证书照片或电子证明；证书须含姓名、奖项名称、等级、日期。',
      constraint: { kind: 'required-evidence', requiredEvidenceTypes: ['certificate'] },
      anchors: [anchor('doc-rule-001', 'blk-rule-020'), anchor('doc-rule-001', 'blk-rule-021')],
      generatedBy: 'fixture',
    },
  ]

  const rulePack = {
    id: 'rulepack-demo-001',
    documentId: 'doc-rule-001',
    name: '学生综合素质测评实施办法（模拟）',
    publisher: '某某大学学生工作处（模拟）',
    academicYear: '2025-2026',
    version: 'v2025（模拟）',
    outline,
    confirmed: false,
  }

  return {
    id: 'demo-zhangsan-2026',
    title: '综测加分审核演示案卷（模拟）· 张三（模拟）',
    type: '综合测评',
    applicant: '张三（模拟）',
    academicYear: '2025-2026',
    createdAt: now,
    updatedAt: now,
    documents,
    rulePacks: [rulePack],
    items,
    evidences,
    isDemo: true,
  }
}
