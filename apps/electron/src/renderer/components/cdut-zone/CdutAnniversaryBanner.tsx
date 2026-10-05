/**
 * CdutAnniversaryBanner — 成都理工大学 70 周年红金流光庆典通栏横幅
 *
 * 位于 CDUT 专区内容区最顶部通栏：成理深绯红到暗酒红渐变，
 * 边缘点缀细密微金线，左侧星芒图标配鎏金主文案，右侧装饰 1956-2026 校庆徽标。
 */

import * as React from 'react'
import { Sparkles, Heart } from 'lucide-react'

export function CdutAnniversaryBanner(): React.ReactElement {
  return (
    <div className="relative z-10 flex shrink-0 items-center justify-between overflow-hidden border-b border-amber-500/25 bg-gradient-to-r from-red-900/90 via-rose-950/95 to-red-900/90 px-6 py-2.5 text-xs shadow-sm backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <span className="flex size-5 items-center justify-center rounded-full bg-amber-400/20 text-amber-300">
          <Sparkles size={12} className="animate-pulse" />
        </span>
        <span className="font-semibold tracking-wide text-amber-100">
          七十年星河滚烫，成理依旧浪漫
        </span>
        <span className="text-amber-200/80">—— 开发团队祝母校70岁生日快乐</span>
      </div>
      <div className="flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-200">
        <Heart size={10} className="fill-amber-300 text-amber-300" />
        <span>1956 - 2026 · 砥砺七十载</span>
      </div>
    </div>
  )
}
