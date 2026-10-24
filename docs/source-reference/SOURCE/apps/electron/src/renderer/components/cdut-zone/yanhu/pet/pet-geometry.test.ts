/**
 * 砚小龙 · 桌宠浮动窗口几何算法物理边界测试
 *
 * 覆盖：160px 大立绘 + 420px 伴随卡片的紧凑包裹矩形、右边缘展开时向左推移、
 * 极窄视口下的朝向自适应反转、Y 轴上下边界推回、仅显示桌宠态剪裁与夹取、
 * 交互命中并集矩形（碰撞箱稳定性）。
 */

import { describe, expect, test } from 'bun:test'
import {
  BUBBLE_HEIGHT,
  CARD_INNER_GAP,
  CARD_WIDTH,
  HISTORY_HEIGHT,
  INPUT_BAR_HEIGHT,
  PET_GAP,
  PET_HEIGHT,
  PET_UNION_WIDTH,
  PET_WIDTH,
  SHADOW_PADDING,
  clampPetPosition,
  computeCardHeight,
  computeCenterPetPosition,
  computeInteractionUnionRect,
  computePetCardLayout,
  computePetOnlyLayout,
  computePushBackCoordinates,
  isLegacyDefaultPosition,
  isPointInsideRect,
} from './pet-geometry'

const BUBBLE_CARD = computeCardHeight('bubble') // BUBBLE_HEIGHT + CARD_INNER_GAP + INPUT_BAR_HEIGHT

describe('computeCardHeight（伴随卡片高度）', () => {
  test('气泡态与历史态高度符合规格', () => {
    expect(BUBBLE_CARD).toBe(BUBBLE_HEIGHT + CARD_INNER_GAP + INPUT_BAR_HEIGHT)
    expect(computeCardHeight('history')).toBe(HISTORY_HEIGHT + CARD_INNER_GAP + INPUT_BAR_HEIGHT)
  })
})

describe('computePushBackCoordinates（边界碰撞与智能推回）', () => {
  test('贴合右边缘时向左推移桌宠', () => {
    const result = computePushBackCoordinates({ xp: 900, yp: 100, direction: 'right', vw: 1000, vh: 800 })
    expect(result.autoFlippedDirection).toBe('right')
    // vw - margin - cardW - gap - petW = 1000 - 16 - 420 - 12 - 160 = 392
    expect(result.nextXp).toBe(1000 - 16 - CARD_WIDTH - PET_GAP - PET_WIDTH)
    expect(result.nextYp).toBe(100)
  })

  test('极窄视口下朝向自适应反转至 left', () => {
    const result = computePushBackCoordinates({ xp: 200, yp: 100, direction: 'right', vw: 400, vh: 800 })
    expect(result.autoFlippedDirection).toBe('left')
    expect(result.nextXp).toBe(16 + CARD_WIDTH + PET_GAP)
  })

  test('Y 轴底部越界时向上推回（卡片底边与桌宠对齐）', () => {
    const result = computePushBackCoordinates({ xp: 24, yp: 300, direction: 'right', vw: 1000, vh: 400 })
    expect(result.nextYp).toBe(400 - 16 - PET_HEIGHT)
    expect(result.nextXp).toBe(24)
  })

  test('视口内无需推回时坐标保持不变', () => {
    // 卡片（218）高于立绘（160），故 Y 轴最小起点为 margin + (cardH - petH) = 74
    const result = computePushBackCoordinates({ xp: 40, yp: 100, direction: 'right', vw: 1200, vh: 900 })
    expect(result).toEqual({ nextXp: 40, nextYp: 100, autoFlippedDirection: 'right' })
  })

  test('卡片高于立绘时 Y 轴起点被抬升至卡片可容纳的最小位置', () => {
    const cardH = computeCardHeight('bubble')
    const result = computePushBackCoordinates({ xp: 40, yp: 0, direction: 'right', vw: 1200, vh: 900 })
    expect(result.nextYp).toBe(16 + Math.max(0, cardH - PET_HEIGHT))
  })

  test('朝向为左越界时向右推回', () => {
    const result = computePushBackCoordinates({ xp: 100, yp: 40, direction: 'left', vw: 1000, vh: 800 })
    expect(result.nextXp).toBe(16 + CARD_WIDTH + PET_GAP)
    expect(result.autoFlippedDirection).toBe('left')
  })

  test('历史展开态下 Y 轴按更高卡片推回', () => {
    const result = computePushBackCoordinates({
      xp: 24,
      yp: 40,
      direction: 'right',
      vw: 1200,
      vh: 900,
      cardH: computeCardHeight('history'),
    })
    // minYp = margin + (cardH - petH)
    expect(result.nextYp).toBe(16 + (computeCardHeight('history') - PET_HEIGHT))
  })
})

describe('computePetCardLayout（伴随卡片紧凑包裹矩形）', () => {
  test('朝右：卡片位于桌宠右侧且底边对齐', () => {
    const layout = computePetCardLayout({ xp: 24, yp: 24, direction: 'right', cardHeight: BUBBLE_CARD })
    expect(layout.winWidth).toBe(PET_WIDTH + 12 + CARD_WIDTH + 2 * SHADOW_PADDING)
    expect(layout.winHeight).toBe(BUBBLE_CARD + 2 * SHADOW_PADDING)
    expect(layout.petLocalX).toBe(SHADOW_PADDING)
    // 卡片比桌宠高 6px，故桌宠底边对齐后下移 6px
    expect(layout.petLocalY).toBe(BUBBLE_CARD - PET_HEIGHT + SHADOW_PADDING)
    expect(layout.cardLocalX).toBe(SHADOW_PADDING + PET_WIDTH + 12)
    expect(layout.cardLocalY).toBe(SHADOW_PADDING)
  })

  test('朝左：卡片位于桌宠左侧', () => {
    const layout = computePetCardLayout({ xp: 500, yp: 24, direction: 'left', cardHeight: BUBBLE_CARD })
    expect(layout.winWidth).toBe(CARD_WIDTH + 12 + PET_WIDTH + 2 * SHADOW_PADDING)
    expect(layout.cardLocalX).toBe(SHADOW_PADDING)
    expect(layout.petLocalX).toBe(SHADOW_PADDING + CARD_WIDTH + 12)
  })

  test('历史展开态窗口向上生长', () => {
    const bubble = computePetCardLayout({ xp: 24, yp: 300, direction: 'right', cardHeight: BUBBLE_CARD })
    const history = computePetCardLayout({
      xp: 24,
      yp: 300,
      direction: 'right',
      cardHeight: computeCardHeight('history'),
    })
    expect(history.winHeight).toBeGreaterThan(bubble.winHeight)
    // 底边固定：窗口底部不变
    expect(history.winY + history.winHeight).toBe(bubble.winY + bubble.winHeight)
  })
})

describe('computePetOnlyLayout（仅显示桌宠）', () => {
  test('仅包裹立绘并预留阴影留白', () => {
    const layout = computePetOnlyLayout({ xp: 24, yp: 24 })
    expect(layout).toEqual({
      winX: 8,
      winY: 8,
      winWidth: PET_WIDTH + 2 * SHADOW_PADDING,
      winHeight: PET_HEIGHT + 2 * SHADOW_PADDING,
      petLocalX: SHADOW_PADDING,
      petLocalY: SHADOW_PADDING,
      cardLocalX: 0,
      cardLocalY: 0,
    })
  })
})

describe('clampPetPosition（视口内夹取）', () => {
  test('越界坐标被夹回内边距范围内', () => {
    expect(clampPetPosition(500, 500, 200, 150)).toEqual({ xp: 24, yp: 16 })
  })

  test('正常坐标保持不变', () => {
    expect(clampPetPosition(40, 40, 800, 600)).toEqual({ xp: 40, yp: 40 })
  })
})

describe('PET_UNION_WIDTH（伴随态联合外框宽度）', () => {
  test('等于立绘 + 间距 + 卡片总宽（592px）', () => {
    expect(PET_UNION_WIDTH).toBe(PET_WIDTH + PET_GAP + CARD_WIDTH)
    expect(PET_UNION_WIDTH).toBe(592)
  })
})

describe('computeCenterPetPosition（视口物理正中央定位）', () => {
  const unionLeftOf = (vw: number): number => Math.round((vw - PET_UNION_WIDTH) / 2)

  test('典型 1200×800 视口：联合外框水平居中且立绘纵向居中', () => {
    expect(computeCenterPetPosition(1200, 800, true)).toEqual({ x: unionLeftOf(1200), y: 320 })
  })

  test('多分辨率下水平中心随视口线性平移', () => {
    expect(computeCenterPetPosition(1280, 800, true)).toEqual({ x: unionLeftOf(1280), y: 320 })
    expect(computeCenterPetPosition(1920, 1080, true)).toEqual({ x: unionLeftOf(1920), y: 460 })
    expect(computeCenterPetPosition(800, 600, true)).toEqual({ x: unionLeftOf(800), y: 220 })
  })

  test('联合外框整体居中：立绘左缘 + 联合宽 / 2 === 视口中心', () => {
    const { x } = computeCenterPetPosition(1200, 800, true)
    expect(x + PET_UNION_WIDTH / 2).toBe(1200 / 2)
  })

  test('收起卡片时以 160px 立绘单体居中', () => {
    expect(computeCenterPetPosition(1200, 800, false)).toEqual({ x: 520, y: 320 })
    const { x } = computeCenterPetPosition(1200, 800, false)
    expect(x + PET_WIDTH / 2).toBe(1200 / 2)
  })

  test('朝向为左时立绘位于联合外框右缘，整组元素仍居中', () => {
    const { x, y } = computeCenterPetPosition(1200, 800, true, 'left')
    expect(x).toBe(unionLeftOf(1200) + PET_GAP + CARD_WIDTH)
    expect(y).toBe(320)
    // 联合外框整体仍居中
    expect(unionLeftOf(1200) + PET_UNION_WIDTH / 2).toBe(600)
  })

  test('极窄视口下水平居中退化为内边距保护', () => {
    expect(computeCenterPetPosition(400, 300, true)).toEqual({ x: 16, y: 70 })
    expect(computeCenterPetPosition(100, 100, false)).toEqual({ x: 16, y: 16 })
  })
})

describe('isLegacyDefaultPosition（旧版死值/未初始化判定）', () => {
  test('识别旧版写死的 (24, 24)', () => {
    expect(isLegacyDefaultPosition({ x: 24, y: 24 })).toBe(true)
  })

  test('历史散落坐标与正常坐标不判定为旧版', () => {
    expect(isLegacyDefaultPosition({ x: 591, y: 413 })).toBe(false)
    expect(isLegacyDefaultPosition({ x: 344, y: 320 })).toBe(false)
  })

  test('缺失或非法坐标视为未初始化', () => {
    expect(isLegacyDefaultPosition(null)).toBe(true)
    expect(isLegacyDefaultPosition(undefined)).toBe(true)
    expect(isLegacyDefaultPosition({ x: Number.NaN, y: 10 })).toBe(true)
  })
})

describe('computeInteractionUnionRect / isPointInsideRect（碰撞箱稳定性）', () => {
  const buildRect = (direction: 'left' | 'right') => {
    const layout = computePetCardLayout({ xp: 100, yp: 100, direction, cardHeight: BUBBLE_CARD })
    return computeInteractionUnionRect({
      petLocalX: layout.petLocalX,
      petLocalY: layout.petLocalY,
      cardLocalX: layout.cardLocalX,
      cardLocalY: layout.cardLocalY,
      cardVisible: true,
      cardHeight: BUBBLE_CARD,
    })
  }

  test('命中并集覆盖「立绘 + 间隙 + 卡片」，宽度等于联合外框且不含阴影留白', () => {
    const rect = buildRect('right')
    expect(rect.width).toBe(PET_WIDTH + PET_GAP + CARD_WIDTH)
    expect(rect.height).toBe(BUBBLE_CARD)
    // 阴影留白不参与命中：并集高度应恰好等于卡片内容高度而非再加 2*padding
    expect(rect.height).toBeLessThan(BUBBLE_CARD + 2 * SHADOW_PADDING)
  })

  test('朝向为左时并集左缘为卡片左缘', () => {
    const layout = computePetCardLayout({ xp: 100, yp: 100, direction: 'left', cardHeight: BUBBLE_CARD })
    const rect = buildRect('left')
    expect(rect.x).toBe(layout.cardLocalX)
    expect(rect.width).toBe(PET_WIDTH + PET_GAP + CARD_WIDTH)
  })

  test('立绘与卡片之间的间隙点位判定为命中（消除穿越间隙导致的穿透抖动）', () => {
    const rect = buildRect('right')
    // 间隙中心：成立于立绘右缘之后、卡片左缘之前
    const gapX = rect.x + PET_WIDTH + Math.floor(PET_GAP / 2)
    const midY = rect.y + Math.floor(rect.height / 2)
    expect(isPointInsideRect(gapX, midY, rect, 0)).toBe(true)
  })

  test('滞后余量内判为命中、超出余量判为外部', () => {
    const rect = buildRect('right')
    const midY = rect.y + Math.floor(rect.height / 2)
    expect(isPointInsideRect(rect.x - 5, midY, rect, 10)).toBe(true)
    expect(isPointInsideRect(rect.x - 5, midY, rect, 0)).toBe(false)
    expect(isPointInsideRect(rect.x - 30, midY, rect, 10)).toBe(false)
  })

  test('卡片收起时命中区仅包裹立绘', () => {
    const rect = computeInteractionUnionRect({
      petLocalX: SHADOW_PADDING,
      petLocalY: SHADOW_PADDING,
      cardLocalX: 0,
      cardLocalY: 0,
      cardVisible: false,
      cardHeight: BUBBLE_CARD,
    })
    expect(rect).toEqual({ x: SHADOW_PADDING, y: SHADOW_PADDING, width: PET_WIDTH, height: PET_HEIGHT })
  })
})
