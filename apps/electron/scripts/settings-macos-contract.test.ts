import { describe, expect, test } from 'bun:test'
import { readFileSync } from 'node:fs'

// 源码接线契约补充：验证 UI 到现有状态/API 的接线，不冒充真实窗口 E2E。
function source(path: string): string {
  return readFileSync(new URL(`../src/${path}`, import.meta.url), 'utf8')
}

function between(text: string, start: string, end: string): string {
  const offset = text.indexOf(start)
  expect(offset).toBeGreaterThanOrEqual(0)
  const endOffset = text.indexOf(end, offset + start.length)
  expect(endOffset).toBeGreaterThan(offset)
  return text.slice(offset, endOffset)
}

describe('Mac 设置页接线契约', () => {
  test('Given 新建渠道有未保存内容 When 遮罩或 Esc 请求关闭 Then 先请求确认', () => {
    const dialog = source('renderer/components/settings/SettingsDialog.tsx')
    const handler = between(dialog, 'const handleOpenChange', '\n  return (')
    expect(handler).toContain('if (!nextOpen && channelFormDirty)')
    expect(handler).toMatch(/setCloseRequested\(true\)\s+return/)
    expect(handler.indexOf('setCloseRequested(true)')).toBeLessThan(handler.indexOf('setOpen(nextOpen)'))
    expect(dialog).toContain('onOpenChange={handleOpenChange}')
  })

  test('Given 未保存渠道 When 跳转教程 Then 保护先于导航且确认后仍打开教程', () => {
    const panel = source('renderer/components/settings/SettingsPanel.tsx')
    const handler = between(panel, 'const handleTabChange', '/** 关闭设置面板')
    expect(handler).toMatch(/channelFormDirty\)\s*\{\s*setPendingAction/)
    expect(handler.indexOf('setPendingAction')).toBeLessThan(handler.indexOf('navigateToTab(tabId)'))
    expect(handler).not.toContain('setSettingsOpen(false)')
    const confirmed = between(panel, 'const executePendingAction', '/** 取消待处理')
    expect(confirmed).toContain('navigateToTab(pendingAction.tabId)')
    const navigate = between(panel, 'const navigateToTab', '/** 执行待处理')
    expect(navigate).toContain("if (tabId === 'tutorial')")
    expect(navigate).toContain('setSettingsOpen(false)')
  })

  test('Given 设置页精简 When 渲染 Shell 状态 Then 收敛到关于页且无运行时状态不渲染', () => {
    // Rebrand（testBuild）把通用设置里的「Agent Shell 环境」选择器裁掉了；
    // Shell 状态现在收敛到关于页 ShellEnvironmentCard：没有 runtimeStatus.shell 时不渲染空卡片。
    const general = source('renderer/components/settings/GeneralSettings.tsx')
    expect(general).not.toContain('Agent Shell 环境')
    const about = source('renderer/components/settings/AboutSettings.tsx')
    expect(about).toContain('function ShellEnvironmentCard')
    expect(about).toContain('if (!runtimeStatus || !runtimeStatus.shell)')
    expect(about).toContain('<ShellEnvironmentCard />')
  })

  test('Given 系统登录项被用户修改 When 打开设置或启动 Mac Then 读取系统而不覆盖它', () => {
    const general = source('renderer/components/settings/GeneralSettings.tsx')
    expect(general).toContain('window.electronAPI.getAutoLaunch().then')
    expect(general).not.toContain('setAutoLaunch(settings.autoLaunch')
    expect(general).toContain('disabled={autoLaunchBusy}')
    const startup = between(source('main/index.ts'), "safeRun('applyAutoLaunch'", '// 启动工作区文件监听')
    const mac = between(startup, "if (process.platform === 'darwin')", '\n    const settings')
    expect(mac).toContain('app.getLoginItemSettings().openAtLogin')
    expect(mac).toContain('updateSettings({ autoLaunch: enabled })')
    expect(mac).toContain('return')
    expect(mac).not.toContain('setLoginItemSettings')
    // 非 Mac 保留原行为，避免本次兼容修复改变 Windows 启动逻辑。
    expect(startup).toContain('app.setLoginItemSettings({ openAtLogin: enabled })')
  })

  test('Given 更新弹窗全局挂载 When 存在手动渠道 Then 不自动弹窗且类型贯通 IPC', () => {
    // Rebrand 后关于页不再内置更新 switch；更新 UI 收敛为全局挂载的 UpdateDialog。
    // manualUrl（开发版等手动渠道）存在时禁止自动弹窗，避免绕过手动发布流程。
    const dialog = source('renderer/components/settings/UpdateDialog.tsx')
    expect(dialog).toContain('!updateStatus.manualUrl')
    expect(dialog).toContain('window.electronAPI.updater?.quitAndInstall()')
    const main = source('renderer/main.tsx')
    expect(main).toContain('<UpdateDialog />')
    for (const path of ['renderer/atoms/updater.ts', 'renderer/vite-env.d.ts', 'preload/index.ts']) {
      expect(source(path)).toContain("| 'disabled' | 'error'")
    }
  })
})

