import * as React from 'react'
import { Bot } from 'lucide-react'
import { cn } from '@/lib/utils'
import { interfaceVariantAtom } from '@/atoms/theme'
import { useAtomValue } from 'jotai'

/** Agent-only 产品入口；Chat 模式已从 CDUTAI 用户路径移除。 */
export function ModeSwitcher(): React.ReactElement {
  const interfaceVariant = useAtomValue(interfaceVariantAtom)
  const isClassic = interfaceVariant === 'classic'

  return (
    <div data-profer-navigation-region="mode-switcher" className="pt-2 titlebar-drag-region select-none">
      <div className={cn(
        'flex h-10 items-center justify-center gap-1.5 rounded-xl px-3 titlebar-drag-region mode-switcher-track',
        isClassic ? 'bg-muted' : 'bg-primary/5',
      )}>
        <Bot size={15} />
        <span className="text-sm font-medium">Agent</span>
      </div>
    </div>
  )
}
