/**
 * WelcomeEmptyState — Agent 空状态引导
 *
 * 在没有会话时展示个性化问候、平台提示和 Agent 入口。
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { Lightbulb } from 'lucide-react'
import { userProfileAtom } from '@/atoms/user-profile'
import { appModeAtom } from '@/atoms/app-mode'
import { currentAgentWorkspaceIdAtom, agentWorkspacesAtom } from '@/atoms/agent-atoms'
import { getRandomTip, getPlatform, type Tip } from '@/lib/tips'
import { UsageHeatmap } from './UsageHeatmap'

/** 根据小时返回时段问候 */
function getGreeting(hour: number): string {
  if (hour < 6) return '夜深了'
  if (hour < 12) return '早上好'
  if (hour < 18) return '下午好'
  return '晚上好'
}

export function WelcomeEmptyState(): React.ReactElement {
  const userProfile = useAtomValue(userProfileAtom)
  const mode = useAtomValue(appModeAtom)
  const currentWorkspaceId = useAtomValue(currentAgentWorkspaceIdAtom)
  const workspaces = useAtomValue(agentWorkspacesAtom)

  const currentWorkspace = React.useMemo(
    () => workspaces.find((workspace) => workspace.id === currentWorkspaceId) ?? null,
    [workspaces, currentWorkspaceId],
  )
  const showHeatmap = mode === 'agent' && currentWorkspace?.type !== 'team'
  const [tip] = React.useState<Tip>(() => getRandomTip(getPlatform()))

  const greeting = getGreeting(new Date().getHours())
  const displayName = userProfile.userName || '用户'

  return (
    <div className="welcome-empty-state relative flex h-full translate-y-[60px] flex-col items-center justify-center gap-5 px-4 [@media(max-height:820px)]:translate-y-0 [@media(max-height:700px)]:gap-3.5 overflow-hidden">
      <h1 className="text-[26px] font-semibold tracking-tight text-foreground z-10">
        {displayName}，{greeting}
      </h1>

      <div className="z-10 flex items-center gap-2.5 rounded-full bg-muted/50 px-4 py-2 text-[13px] text-muted-foreground">
        <Lightbulb size={14} className="flex-shrink-0 text-amber-500/80" />
        <span>{tip.text}</span>
      </div>

      {showHeatmap && (
        <div className="z-10 [@media(max-height:640px)]:hidden">
          <UsageHeatmap />
        </div>
      )}
    </div>
  )
}
