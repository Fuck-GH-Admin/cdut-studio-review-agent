/**
 * 砚小龙 · 桌宠立绘（YanhuPetAvatar）
 *
 * 渲染 88x88 高清四态精灵，并在挂载时预加载全部帧，杜绝切换时的白闪。
 * 右键菜单由父级 ContextMenuTrigger 承担，本组件保持纯展示。
 */

import * as React from 'react'
import type { YanhuPetSpriteState } from '@profer/shared'
import { cn } from '@/lib/utils'
import blinkingImg from '@assets/IP/Cute_IP/Blinking.png'
import breathingImg from '@assets/IP/Cute_IP/Breathing.png'
import walkingImg from '@assets/IP/Cute_IP/Walking.png'
import yawningImg from '@assets/IP/Cute_IP/Yawning.png'

/** 四态精灵资源映射 */
const SPRITE_SOURCES: Record<YanhuPetSpriteState, string> = {
  blinking: blinkingImg,
  breathing: breathingImg,
  walking: walkingImg,
  yawning: yawningImg,
}

/** 四态精灵中文标签（无障碍） */
const SPRITE_LABELS: Record<YanhuPetSpriteState, string> = {
  blinking: '砚小龙正在眨眼',
  breathing: '砚小龙正在呼吸',
  walking: '砚小龙正在忙碌',
  yawning: '砚小龙正在打哈欠',
}

export interface YanhuPetAvatarProps {
  state: YanhuPetSpriteState
  size?: number
  /** 是否处于忙碌（Walking）——附加轻微脉动 */
  className?: string
}

export function YanhuPetAvatar({ state, size = 160, className }: YanhuPetAvatarProps): React.ReactElement {
  // 预加载全部精灵，避免切图白闪
  React.useEffect(() => {
    for (const src of Object.values(SPRITE_SOURCES)) {
      const img = new Image()
      img.src = src
    }
  }, [])

  return (
    <div
      className={cn(
        'pointer-events-none relative flex items-end justify-center select-none transition-transform duration-200',
        state === 'walking' && 'scale-[1.03] transition-transform duration-300',
        className,
      )}
      style={{ width: size, height: size }}
      role="img"
      aria-label={SPRITE_LABELS[state]}
    >
      <img
        src={SPRITE_SOURCES[state]}
        alt=""
        draggable={false}
        className="h-full w-full object-contain object-bottom drop-shadow-[0_4px_10px_rgba(0,0,0,0.30)]"
      />
    </div>
  )
}
