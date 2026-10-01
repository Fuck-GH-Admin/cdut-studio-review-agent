/**
 * AgentSettings - Agent 配置页
 *
 * Skills 与 MCP 的管理已迁移到独立的「Agent 技能」全屏视图
 * （左侧栏入口，components/agent-skills/AgentSkillsView），
 * Agent 预设管理也已迁移到该视图的「预设」tab。
 * 此页仅保留推理档位与内置工具的只读概览。
 * 展示类偏好（自动预览修改中文件、输出完保持展开）已迁至「使用偏好」。
 */

import * as React from 'react'
import { useAtom } from 'jotai'
import { agentEffortAtom } from '@/atoms/agent-atoms'
import { SettingsSection, SettingsCard, SettingsSegmentedControl } from './primitives'
import type { AgentEffort } from '@profer/shared'

const EFFORT_OPTIONS: { value: AgentEffort; label: string }[] = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'max', label: '最大' },
]

export function AgentSettings(): React.ReactElement {
  const [effort, setEffort] = useAtom(agentEffortAtom)

  const handleEffortChange = React.useCallback((value: string) => {
    const v = value as AgentEffort
    setEffort(v)
    window.electronAPI.updateSettings({ agentEffort: v }).catch(console.error)
  }, [setEffort])

  return (
    <div className="space-y-6">
      <SettingsSection title="Agent 配置" description="调整 Agent 的推理行为和资源限制">
        <SettingsCard>
          <SettingsSegmentedControl
            label="思考强度"
            description="控制 Agent 推理深度。低强度响应更快，高强度更适合复杂任务（仅 Claude Opus 4.6+ 支持 max）"
            value={effort ?? 'high'}
            onValueChange={handleEffortChange}
            options={EFFORT_OPTIONS}
          />
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
