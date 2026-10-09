import * as React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { toast } from 'sonner'
import { Button } from '@profer/ui/primitives/button'
import { developerModeEnabledAtom, openEpistemicModeEnabledAtom } from '@/atoms/developer-mode'
import { settingsTabAtom } from '@/atoms/settings-tab'
import { SettingsCard, SettingsSection, SettingsToggle } from './primitives'

export function DeveloperSettings(): React.ReactElement {
  const [, setDeveloperModeEnabled] = useAtom(developerModeEnabledAtom)
  const [openEpistemicModeEnabled, setOpenEpistemicModeEnabled] = useAtom(openEpistemicModeEnabledAtom)
  const setActiveTab = useSetAtom(settingsTabAtom)
  const [saving, setSaving] = React.useState(false)
  // 双引擎检索引擎开关（默认 classic 经典实现，开启即切到增强引擎）
  const [memoryEngine, setMemoryEngine] = React.useState<'classic' | 'hipporag'>('classic')
  const [studyEngine, setStudyEngine] = React.useState<'classic' | 'graphrag'>('classic')

  React.useEffect(() => {
    void window.electronAPI
      .getSettings()
      .then((settings) => {
        setMemoryEngine(settings.memoryRetrievalEngine === 'hipporag' ? 'hipporag' : 'classic')
        setStudyEngine(settings.studyRetrievalEngine === 'graphrag' ? 'graphrag' : 'classic')
      })
      .catch(() => {
        // 读取失败保持默认 classic，不影响面板使用
      })
  }, [])

  const updateMemoryEngine = async (enhanced: boolean): Promise<void> => {
    const previous = memoryEngine
    const next: 'classic' | 'hipporag' = enhanced ? 'hipporag' : 'classic'
    setMemoryEngine(next)
    setSaving(true)
    try {
      const settings = await window.electronAPI.updateSettings({ memoryRetrievalEngine: next })
      setMemoryEngine(settings.memoryRetrievalEngine === 'hipporag' ? 'hipporag' : 'classic')
      toast.success(enhanced ? '终身记忆已切换为 HippoRAG 图谱增强引擎' : '终身记忆已切换为经典 FTS5 引擎')
    } catch (error) {
      setMemoryEngine(previous)
      toast.error('检索引擎设置保存失败', { description: error instanceof Error ? error.message : String(error) })
    } finally {
      setSaving(false)
    }
  }

  const updateStudyEngine = async (enhanced: boolean): Promise<void> => {
    const previous = studyEngine
    const next: 'classic' | 'graphrag' = enhanced ? 'graphrag' : 'classic'
    setStudyEngine(next)
    setSaving(true)
    try {
      const settings = await window.electronAPI.updateSettings({ studyRetrievalEngine: next })
      setStudyEngine(settings.studyRetrievalEngine === 'graphrag' ? 'graphrag' : 'classic')
      toast.success(enhanced ? '速课堂已切换为分层 Leiden GraphRAG 引擎' : '速课堂已切换为经典混合检索引擎')
    } catch (error) {
      setStudyEngine(previous)
      toast.error('检索引擎设置保存失败', { description: error instanceof Error ? error.message : String(error) })
    } finally {
      setSaving(false)
    }
  }

  const updateOpenEpistemicMode = async (enabled: boolean): Promise<void> => {
    const previous = openEpistemicModeEnabled
    setOpenEpistemicModeEnabled(enabled)
    setSaving(true)
    try {
      const settings = await window.electronAPI.updateSettings({ openEpistemicModeEnabled: enabled })
      setOpenEpistemicModeEnabled(settings.openEpistemicModeEnabled === true)
      toast.success(enabled ? '开放认识论已启用，将从下一轮 Agent 消息起生效' : '开放认识论已关闭，将从下一轮 Agent 消息起生效')
    } catch (error) {
      setOpenEpistemicModeEnabled(previous)
      toast.error('开发者设置保存失败', { description: error instanceof Error ? error.message : String(error) })
    } finally {
      setSaving(false)
    }
  }

  const exitDeveloperMode = async (): Promise<void> => {
    setSaving(true)
    try {
      await window.electronAPI.updateSettings({
        developerModeEnabled: false,
        openEpistemicModeEnabled: false,
      })
      setDeveloperModeEnabled(false)
      setOpenEpistemicModeEnabled(false)
      setActiveTab('general')
      toast.success('开发者模式已关闭')
    } catch (error) {
      toast.error('关闭开发者模式失败', { description: error instanceof Error ? error.message : String(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <SettingsSection
        title="开发者模式"
        description="管理实验性能力。这里的设置可能改变 Agent 的工作姿态，但不会绕过权限、安全规则或模型服务端约束。"
      >
        <SettingsCard>
          <SettingsToggle
            label="开放认识论（关闭「绝对正确」姿态）"
            description="开启后 Agent 不再为了保持「绝对正确」而回避表态：先给判断、不做两头并列、不堆免责声明，允许暂定结论与创作自由。执行事实、文件修改、测试、发送与发布仍必须真实可核验。全局设置，下一轮 Agent 消息起生效。"
            checked={openEpistemicModeEnabled}
            onCheckedChange={(enabled) => { void updateOpenEpistemicMode(enabled) }}
            disabled={saving}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="增强检索引擎（双引擎并行，单开独立链路）"
        description="经典实现始终保留且 100% 不动；开启后改为纯内存增强链路，可随时切回。全部本地运行，不引入任何外部数据库。"
      >
        <SettingsCard>
          <SettingsToggle
            label="终身记忆：HippoRAG 图谱多跳检索"
            description="关闭时使用经典 FTS5 BM25 全文检索；开启后改用纯内存海马体共现图 + 个性化 PageRank 扩散，支持多跳隐式关联召回。全局设置，立即生效。"
            checked={memoryEngine === 'hipporag'}
            onCheckedChange={(enabled) => { void updateMemoryEngine(enabled) }}
            disabled={saving}
          />
          <SettingsToggle
            label="速课堂：分层 Leiden GraphRAG 检索"
            description="关闭时使用经典全域混合检索；开启后改用 Leiden 模块度社区聚类 + 三层社群摘要，支持全局宏观思想演变问答。全局设置，立即生效。"
            checked={studyEngine === 'graphrag'}
            onCheckedChange={(enabled) => { void updateStudyEngine(enabled) }}
            disabled={saving}
          />
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="运行时边界" description="本开关改变 CDUT Studio 注入的 Agent 姿态，不代表移除所有上游约束；已开启的会话会从下一轮消息起使用新的姿态段。">
        <SettingsCard divided={false} className="p-4 text-sm leading-6 text-muted-foreground">
          Claude Runtime 在开放认识论开启时不再叠加本地 Claude Code 默认 preset，改用 CDUT Studio 自管 system prompt；模型服务端更高优先级的 system、developer、安全与法律规则仍然存在。Pi Runtime 始终使用 CDUT Studio 自管 system prompt。
        </SettingsCard>
      </SettingsSection>

      <SettingsSection title="退出开发者模式" description="关闭后会隐藏开发者与插件入口，并同时关闭开放认识论；已安装插件及其数据不会被删除。">
        <Button type="button" variant="outline" onClick={() => { void exitDeveloperMode() }} disabled={saving}>
          退出开发者模式
        </Button>
      </SettingsSection>
    </div>
  )
}
