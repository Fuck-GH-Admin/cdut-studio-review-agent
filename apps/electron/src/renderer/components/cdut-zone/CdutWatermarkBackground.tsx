/**
 * CdutWatermarkBackground — CDUT 专区左下角校宠立绘艺术环境水印
 *
 * 以非阻断式（pointer-events-none）方式将校宠立绘吉祥物柔和融入内容区左下方底纹：
 * - 浅色模式：multiply 混合 + 适当透明度，白色底自然滤除；
 * - 深色模式：反相 + hue-rotate + screen 发光，适配暗色背景；
 * - 结合径向渐变遮罩羽化边缘，绝不遮挡任何交互与文字。
 */

import * as React from 'react'
import mascotImg from '@assets/IP/IP_1.jpg'

/** 径向遮罩：自左下角向外柔和羽化，营造环境水印质感 */
const FEATHER_MASK =
  'radial-gradient(circle at bottom left, black 50%, transparent 95%)'

export function CdutWatermarkBackground(): React.ReactElement {
  return (
    <div
      className="pointer-events-none absolute bottom-0 left-0 z-0 select-none"
      aria-hidden="true"
    >
      <img
        src={mascotImg}
        alt=""
        draggable={false}
        className="w-[260px] max-w-[42vw] object-contain opacity-30 mix-blend-multiply dark:opacity-20 dark:invert dark:hue-rotate-180 dark:mix-blend-screen sm:w-[320px]"
        style={{ WebkitMaskImage: FEATHER_MASK, maskImage: FEATHER_MASK }}
      />
    </div>
  )
}
