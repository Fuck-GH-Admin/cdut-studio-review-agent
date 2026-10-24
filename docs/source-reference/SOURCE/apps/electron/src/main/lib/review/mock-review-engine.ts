/**
 * 确定性模拟审核引擎
 *
 * 无模型凭证 / 网关不可用时的演示降级路径（设计决策 D6）：
 * 用纯规则比对产出与 AI 路径同 schema 的审核发现，结果显式标记 `generatedBy: 'mock-engine'`。
 *
 * 六类检查（遍历 rulePacks[0].outline 的 constraint 逐条核对）：
 * 1. 等级冲突（红）：item.level 与关联证据 recognizedLevel 都存在且不等
 * 2. 缺证明（黄）：evidenceDocumentIds 为空
 * 3. 分值超上限（红）：constraint kind 'max-score'，同类别合计 > value
 * 4. 互斥计分（红）：同一 exclusionGroup 的两条申报同时计分
 * 5. 日期越界（红）：activityDate 超出 date-range（字符串 ISO 比较）
 * 6. 证明看不清（黄）：关联证据 parseStatus 'unclear'
 *
 * 所有判断只读案卷数据，不写盘、不联网，可单测。
 */

import type {
  EvidenceDocument,
  ReviewCase,
  ReviewFinding,
  ReviewItem,
  ReviewRun,
  ReviewSourceAnchor,
  RuleOutlineItem,
} from '@profer/shared'

/** 引擎产物：一次审核运行中由引擎负责的字段子集（id/时间/状态由 run-service 补齐） */
export interface MockReviewResult {
  findings: ReviewFinding[]
  coverage: {
    reviewedItemIds: string[]
    manualReviewItemIds: string[]
    unrecognizedDocumentIds: string[]
    ruleUncoveredItemIds: string[]
  }
}

/** 志愿服务/劳动实践互斥组的固定组名（与 fixture constraint.exclusionGroup 对齐） */
const VOLUNTEER_LABOR_GROUP = 'volunteer-labor'

/** 判定一条申报是否属于"学科竞赛类"（类别或标题含"竞赛"——fixture 类别用智育等表述，关键词实际在标题中） */
function isCompetitionCategory(category: string, title?: string): boolean {
  return `${category} ${title ?? ''}`.includes('竞赛')
}

/** 判定一条申报是否属于互斥组（类别或标题含"志愿"/"劳动"——fixture 类别用德育/劳育表述，关键词实际在标题中） */
function belongsToVolunteerLabor(item: ReviewItem): boolean {
  const haystack = `${item.category} ${item.title}`
  return haystack.includes('志愿') || haystack.includes('劳动')
}

/** 找出 category 为"等级分值"的规则条目（等级冲突时引用其条款） */
function findLevelRule(outline: RuleOutlineItem[]): RuleOutlineItem | undefined {
  return outline.find((rule) => rule.category === '等级分值')
}

/** 按 id 索引证据文档 */
function indexEvidences(reviewCase: ReviewCase): Map<string, EvidenceDocument> {
  const map = new Map<string, EvidenceDocument>()
  for (const evidence of reviewCase.evidences) map.set(evidence.documentId, evidence)
  return map
}

/** 取证据文档的首个块锚点（证明侧高亮目标；文档无块时不给锚点，不伪造坐标） */
function firstBlockAnchor(reviewCase: ReviewCase, documentId: string): ReviewSourceAnchor | undefined {
  const doc = reviewCase.documents.find((d) => d.id === documentId)
  const block = doc?.blocks[0]
  if (!doc || !block) return undefined
  return { documentId: doc.id, blockId: block.id, page: block.page, precision: 'block' }
}

/** 组装一条 finding 的公共骨架 */
function buildFinding(input: {
  id: string
  item: ReviewItem
  kind: ReviewFinding['kind']
  severity: ReviewFinding['severity']
  title: string
  detail: string
  suggestion: ReviewFinding['suggestion']
  suggestionText: string
  ruleItemIds: string[]
  ruleAnchors: ReviewSourceAnchor[]
  evidenceAnchor?: ReviewSourceAnchor
  suggestedScore?: number
}): ReviewFinding {
  const finding: ReviewFinding = {
    id: input.id,
    itemId: input.item.id,
    kind: input.kind,
    severity: input.severity,
    title: input.title,
    detail: input.detail,
    suggestion: input.suggestion,
    suggestionText: input.suggestionText,
    subjectAnchor: input.item.anchor,
    ruleAnchors: input.ruleAnchors,
    ruleItemIds: input.ruleItemIds,
    generatedBy: 'mock-engine',
  }
  if (input.evidenceAnchor) finding.evidenceAnchor = input.evidenceAnchor
  if (input.suggestedScore !== undefined) finding.suggestedScore = input.suggestedScore
  return finding
}

/**
 * 构建一次模拟审核的全部发现与覆盖摘要（纯函数，供 runMockReview 与单测复用）。
 *
 * @param reviewCase 待审核案卷
 * @returns findings + coverage（id/时间/状态留给调用方补齐）
 */
export function buildFindingsForCase(reviewCase: ReviewCase): MockReviewResult {
  const outline = reviewCase.rulePacks[0]?.outline ?? []
  const evidences = indexEvidences(reviewCase)
  const findings: ReviewFinding[] = []
  /** 命中过任一 constraint 的条目（用于 ruleUncoveredItemIds） */
  const coveredItemIds = new Set<string>()
  /** 需要人工复核的条目（缺证明 / 证明看不清） */
  const manualReviewItemIds = new Set<string>()

  const levelRule = findLevelRule(outline)
  let seq = 0
  const nextId = (): string => {
    seq += 1
    return `find-${String(seq).padStart(3, '0')}`
  }

  for (const item of reviewCase.items) {
    // 关联证据（按 item.evidenceDocumentIds 顺序）
    const linkedEvidences = item.evidenceDocumentIds
      .map((docId) => evidences.get(docId))
      .filter((evidence): evidence is EvidenceDocument => evidence !== undefined)

    // ===== 1. 等级冲突（红）=====
    if (item.level) {
      for (const evidence of linkedEvidences) {
        const recognized = evidence.recognizedLevel?.trim()
        if (recognized && recognized !== item.level.trim()) {
          coveredItemIds.add(item.id)
          const ruleAnchors = levelRule?.anchors ?? []
          const ruleItemIds = levelRule ? [levelRule.id] : []
          const evidenceAnchor = firstBlockAnchor(reviewCase, evidence.documentId)
          findings.push(
            buildFinding({
              id: nextId(),
              item,
              kind: 'level-conflict',
              severity: 'red',
              title: `申报等级「${item.level}」与证明等级「${recognized}」不一致`,
              detail:
                `申报事项填写的等级为「${item.level}」，但关联证明「${evidence.recognizedFacts}」识别出的等级为「${recognized}」。` +
                (levelRule
                  ? `依据规则条款《${levelRule.title}》：${levelRule.summary}`
                  : '案卷中没有可引用的等级分值条款，请人工确认适用规则。') +
                '等级直接决定建议分值，两处不一致必须先澄清以哪份材料为准。',
              suggestion: 'fix-declaration',
              suggestionText: '请核对证书原件：若证书等级确为所填等级，修正申报表等级字段；若证书等级不同，按证书等级重新申报并同步调整申报分值。',
              ruleItemIds,
              ruleAnchors,
              ...(evidenceAnchor ? { evidenceAnchor } : {}),
            }),
          )
        }
      }
    }

    // ===== 2. 缺证明（黄）=====
    if (item.evidenceDocumentIds.length === 0) {
      coveredItemIds.add(item.id)
      manualReviewItemIds.add(item.id)
      const materialRule = outline.find((rule) => rule.constraint?.kind === 'required-evidence')
      findings.push(
        buildFinding({
          id: nextId(),
          item,
          kind: 'missing-evidence',
          severity: 'yellow',
          title: '申报事项未关联任何证明材料',
          detail:
            `申报事项「${item.title}」的证明列表为空。` +
            (materialRule
              ? `依据规则条款《${materialRule.title}》：${materialRule.summary}`
              : '按材料要求，每项申报应附可核验的证明材料。') +
            '缺少证明时无法核验申报事实，本条不计入建议分。',
          suggestion: 'supplement-evidence',
          suggestionText: '请上传该事项对应的证书或电子证明（需含姓名、奖项、等级、日期），上传后重新运行审核。',
          ruleItemIds: materialRule ? [materialRule.id] : [],
          ruleAnchors: materialRule?.anchors ?? [],
          // 缺件类发现不伪造证明侧坐标（spec：无 evidenceAnchor）
        }),
      )
    }

    // ===== 6. 证明看不清（黄）=====
    for (const evidence of linkedEvidences) {
      if (evidence.parseStatus === 'unclear') {
        coveredItemIds.add(item.id)
        manualReviewItemIds.add(item.id)
        const materialRule = outline.find((rule) => rule.constraint?.kind === 'required-evidence')
        const evidenceAnchor = firstBlockAnchor(reviewCase, evidence.documentId)
        findings.push(
          buildFinding({
            id: nextId(),
            item,
            kind: 'unclear-evidence',
            severity: 'yellow',
            title: '关联证明识别结果看不清，需人工复核',
            detail:
              `申报事项「${item.title}」关联的证明识别状态为「看不清」：${evidence.recognizedFacts}。` +
              (materialRule
                ? `依据规则条款《${materialRule.title}》：${materialRule.summary}`
                : '证明要素缺项或无法辨认时，系统不给出自动结论。') +
              '看不清的印章或被遮挡的等级不能推断为一致，也不能表述为已通过。',
            suggestion: 'manual-review',
            suggestionText: '请人工打开证明原件核对姓名、奖项、等级、日期；仍无法辨认时要求申报人补传清晰件。',
            ruleItemIds: materialRule ? [materialRule.id] : [],
            ruleAnchors: materialRule?.anchors ?? [],
            ...(evidenceAnchor ? { evidenceAnchor } : {}),
          }),
        )
      }
    }
  }

  // ===== 3. 分值超上限（红）：max-score 约束 =====
  for (const rule of outline) {
    const constraint = rule.constraint
    if (!constraint) continue

    if (constraint.kind === 'max-score' && typeof constraint.value === 'number') {
      const limit = constraint.value
      // 只对"学科竞赛类"（类别或标题含"竞赛"）计算合计
      const competitionItems = reviewCase.items.filter((item) => isCompetitionCategory(item.category, item.title))
      const total = competitionItems.reduce((sum, item) => sum + item.declaredScore, 0)
      if (total > limit) {
        // 逐条给发现：每条的 suggestedScore = 上限 - 其他条合计
        for (const item of competitionItems) {
          coveredItemIds.add(item.id)
          const others = competitionItems
            .filter((other) => other.id !== item.id)
            .reduce((sum, other) => sum + other.declaredScore, 0)
          const suggested = Math.max(0, limit - others)
          findings.push(
            buildFinding({
              id: nextId(),
              item,
              kind: 'score-over-limit',
              severity: 'red',
              title: `学科竞赛类合计 ${total} 分超过上限 ${limit} 分`,
              detail:
                `本案学科竞赛类申报合计 ${total} 分（${competitionItems.map((i) => `${i.title} ${i.declaredScore} 分`).join('、')}），` +
                `超过规则规定的单学年上限。依据规则条款《${rule.title}》：${rule.summary}`,
              suggestion: 'modify-score',
              suggestionText: `请核减本条申报分值至 ${suggested} 分以内（上限 ${limit} 分减去其余条合计 ${others} 分），或撤回部分申报。`,
              ruleItemIds: [rule.id],
              ruleAnchors: rule.anchors,
              suggestedScore: suggested,
            }),
          )
        }
      }
    }

    // ===== 4. 互斥计分（红）：同一 exclusionGroup 的两条申报 =====
    if (constraint.kind === 'mutual-exclusion') {
      const group = constraint.exclusionGroup ?? VOLUNTEER_LABOR_GROUP
      // 志愿服务类与劳动实践类映射到 volunteer-labor 组
      const groupItems = reviewCase.items.filter((item) => {
        if (group === VOLUNTEER_LABOR_GROUP) return belongsToVolunteerLabor(item)
        return false
      })
      if (groupItems.length >= 2) {
        for (const item of groupItems) {
          coveredItemIds.add(item.id)
          findings.push(
            buildFinding({
              id: nextId(),
              item,
              kind: 'mutual-exclusion',
              severity: 'red',
              title: `「${item.title}」与同类事项重复计分（互斥组）`,
              detail:
                `本案中「${groupItems.map((i) => i.title).join('」与「')}」同属互斥组，同一事项只能计一类分值。` +
                `依据规则条款《${rule.title}》：${rule.summary}`,
              suggestion: 'modify-score',
              suggestionText: '请保留其中一项计分，撤回另一项的申报分值；确属两类不同事项时需提供区分依据并转人工复核。',
              ruleItemIds: [rule.id],
              ruleAnchors: rule.anchors,
            }),
          )
        }
      }
    }

    // ===== 5. 日期越界（红）：date-range 约束（ISO 字符串比较）=====
    if (constraint.kind === 'date-range') {
      for (const item of reviewCase.items) {
        if (!item.activityDate) continue
        const outOfRange =
          (constraint.dateFrom !== undefined && item.activityDate < constraint.dateFrom) ||
          (constraint.dateTo !== undefined && item.activityDate > constraint.dateTo)
        if (outOfRange) {
          coveredItemIds.add(item.id)
          findings.push(
            buildFinding({
              id: nextId(),
              item,
              kind: 'date-out-of-range',
              severity: 'red',
              title: `活动日期 ${item.activityDate} 超出认可时段`,
              detail:
                `申报事项「${item.title}」的获得日期为 ${item.activityDate}，不在规则认可的 ` +
                `${constraint.dateFrom ?? '不限'} 至 ${constraint.dateTo ?? '不限'} 区间内。` +
                `依据规则条款《${rule.title}》：${rule.summary}`,
              suggestion: 'fix-declaration',
              suggestionText: '请核对获奖日期：日期填写有误则修正申报；确属区间外的事项按规则不予计分，请撤回该条申报。',
              ruleItemIds: [rule.id],
              ruleAnchors: rule.anchors,
            }),
          )
        }
      }
    }
  }

  // ===== 覆盖摘要 =====
  const reviewedItemIds = reviewCase.items.map((item) => item.id)
  const ruleUncoveredItemIds = reviewedItemIds.filter((id) => !coveredItemIds.has(id))
  const unrecognizedDocumentIds = reviewCase.documents
    .filter((doc) => doc.parseStatus === 'failed')
    .map((doc) => doc.id)

  return {
    findings,
    coverage: {
      reviewedItemIds,
      manualReviewItemIds: [...manualReviewItemIds],
      unrecognizedDocumentIds,
      ruleUncoveredItemIds,
    },
  }
}

/**
 * 运行确定性模拟审核。
 *
 * 返回 findings + coverage；调用方（run-service）补齐 id / startedAt / completedAt / status。
 */
export function runMockReview(
  reviewCase: ReviewCase,
): Omit<ReviewRun, 'id' | 'startedAt' | 'completedAt' | 'status' | 'inputVersion'> {
  const result = buildFindingsForCase(reviewCase)
  return {
    caseId: reviewCase.id,
    findings: result.findings,
    coverage: result.coverage,
    engine: 'mock-engine',
  }
}
