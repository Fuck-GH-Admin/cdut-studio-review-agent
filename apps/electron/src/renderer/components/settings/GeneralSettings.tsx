/**
 * GeneralSettings - 通用设置页
 *
 * 只保留系统级与环境配置：工作流入口（语言、快捷任务、界面引导）和系统环境（启动方式、Shell、新标签页）。
 * 使用中的高频开关（通知与声音、对话浏览、输入体验）已拆分至 UsageSettings（使用偏好）。
 * 账户与个人资料由 AccountSettings 独立管理。
 */

import * as React from 'react'
import { useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsToggle,
  SettingsInput,
} from './primitives'
import { settingsOpenAtom } from '@/atoms/settings-tab'
import { coachTourOpenAtom } from '@/atoms/coach-tour-atoms'
import { Button } from '@profer/ui/primitives/button'

export function GeneralSettings(): React.ReactElement {
  const setSettingsOpen = useSetAtom(settingsOpenAtom)
  const setCoachTourOpen = useSetAtom(coachTourOpenAtom)
  const replayPendingRef = React.useRef(false)
  const [autoLaunch, setAutoLaunch] = React.useState(false)
  const [autoLaunchBusy, setAutoLaunchBusy] = React.useState(true)
  const [browserHomeUrl, setBrowserHomeUrl] = React.useState('')

  // 加载设置
  React.useEffect(() => {
    window.electronAPI.getSettings().then((settings) => {
      setBrowserHomeUrl(settings.browserHomeUrl ?? '')
    }).catch(console.error)

    // 登录项以系统实际状态为准，不使用可能过期的配置缓存。
    let cancelled = false
    window.electronAPI.getAutoLaunch().then((enabled) => {
      if (!cancelled) setAutoLaunch(enabled)
    }).catch((error) => {
      console.error('[通用设置] 读取开机自启动状态失败:', error)
      if (!cancelled) toast.error('读取开机自启动状态失败')
    }).finally(() => {
      if (!cancelled) setAutoLaunchBusy(false)
    })
    return () => { cancelled = true }
  }, [])

  /** 切换开机自启动 */
  const handleAutoLaunchChange = async (enabled: boolean): Promise<void> => {
    setAutoLaunchBusy(true)
    setAutoLaunch(enabled)
    try {
      await window.electronAPI.setAutoLaunch(enabled)
      setAutoLaunch(await window.electronAPI.getAutoLaunch())
    } catch (error) {
      console.error('[通用设置] 设置开机自启动失败:', error)
      setAutoLaunch(!enabled) // 回滚
      toast.error('设置开机自启动失败')
    } finally {
      setAutoLaunchBusy(false)
    }
  }

  /** 保存新标签页默认首页（失焦时落盘）。 */
  const handleBrowserHomeUrlBlur = async (): Promise<void> => {
    try {
      const api = (window.electronAPI as Partial<typeof window.electronAPI>)
      if (typeof api.updateBrowserHomeUrl === 'function') {
        await api.updateBrowserHomeUrl(browserHomeUrl)
      } else {
        await window.electronAPI.updateSettings({ browserHomeUrl: browserHomeUrl.trim() })
      }
    } catch (error) {
      console.error('[通用设置] 更新默认首页失败:', error)
    }
  }


  return (
    <div className="space-y-6">
      <SettingsSection
        title="工作流与引导"
        description="控制任务入口和界面引导"
      >
        <SettingsCard>
          <SettingsRow
            label="语言"
            description="更多语言支持即将推出"
          >
            <span className="text-[13px] text-foreground/40">简体中文</span>
          </SettingsRow>
          <SettingsRow
            label="界面引导"
            description="重新播放首次进入时的界面蒙层引导（Esc 可随时退出）"
          >
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (replayPendingRef.current) return
                replayPendingRef.current = true
                // 先关设置再开播：引导遮罩在主界面上方取景，避免盖住设置对话框
                setSettingsOpen(false)
                window.setTimeout(() => {
                  setCoachTourOpen(true)
                  window.setTimeout(() => { replayPendingRef.current = false }, 500)
                }, 200)
              }}
            >
              重新播放
            </Button>
          </SettingsRow>
        </SettingsCard>
      </SettingsSection>

      <SettingsSection
        title="系统环境"
        description="配置 CDUT Studio 的启动方式、命令执行环境和新标签页"
      >
        <SettingsCard>
          <SettingsToggle
            label="开机自启动"
            description="系统启动时自动运行 CDUT Studio"
            checked={autoLaunch}
            disabled={autoLaunchBusy}
            onCheckedChange={handleAutoLaunchChange}
          />

          <SettingsInput
            label="新标签页默认首页"
            description="留空时新建标签页显示起始页（书签与最近访问）；填入 URL 后新建标签页直接打开该地址"
            value={browserHomeUrl}
            onChange={setBrowserHomeUrl}
            onBlur={handleBrowserHomeUrlBlur}
            placeholder="例如 https://example.com"
          />
        </SettingsCard>
      </SettingsSection>
    </div>
  )
}
