/**
 * AppearanceSettings - 外观设置页
 *
 * 主题模式切换与本地皮肤管理（浅色/深色/跟随系统）。
 * 通过 Jotai atom 管理状态，持久化到 ~/.proma/settings.json。
 */

import * as React from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@profer/ui/primitives/alert-dialog'
import { toast } from 'sonner'
import {
  SettingsSection,
  SettingsCard,
  SettingsRow,
  SettingsSegmentedControl,
} from './primitives'
import {
  themeModeAtom,
  themeStyleAtom,
  systemIsDarkAtom,
  updateThemeMode,
  updateThemeStyle,
  applyThemeToDOM,
  skinsAtom,
  refreshSkinRegistry,
} from '@/atoms/theme'
import {
  markdownFontSizeAtom,
  updateMarkdownFontSize,
} from '@/atoms/markdown-font-size'
import {
  uiScaleAtom,
  updateUiScale,
  UI_SCALE_OPTIONS,
} from '@/atoms/ui-scale'
import { SkinManager } from './SkinManager'
import type { ThemeMode, ThemeStyle, MarkdownFontSize, UiScale, SkinInfo } from '../../../types'

/** 主题选项 */
const THEME_OPTIONS = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
]

/** Markdown 字号选项 */
const MARKDOWN_FONT_SIZE_OPTIONS = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
]

/** 根据平台返回缩放快捷键提示 */
const isMac = navigator.userAgent.includes('Mac')
const ZOOM_HINT = isMac
  ? '使用 ⌘= 放大、⌘- 缩小、⌘0 恢复默认大小'
  : '使用 Ctrl++ 放大、Ctrl+- 缩小、Ctrl+0 恢复默认大小'

export function AppearanceSettings(): React.ReactElement {
  const [themeMode, setThemeMode] = useAtom(themeModeAtom)
  const [themeStyle, setThemeStyle] = useAtom(themeStyleAtom)
  const systemIsDark = useAtomValue(systemIsDarkAtom)
  const skins = useAtomValue(skinsAtom)
  const [deleteTarget, setDeleteTarget] = React.useState<SkinInfo | null>(null)
  const [conflict, setConflict] = React.useState<{ path: string; kind: 'zip' | 'folder' } | null>(null)
  const [busy, setBusy] = React.useState(false)
  const [markdownFontSize, setMarkdownFontSize] = useAtom(markdownFontSizeAtom)
  // 界面大小控件仅面向移动端/浏览器端（UiScaleContainer 等比缩放）；
  // Electron 桌面保持原版行为（Ctrl+± 浏览器级缩放），不渲染控件避免“调了无效果”。
  const isElectron = React.useMemo(() => navigator.userAgent.includes('Electron'), [])
  const [uiScale, setUiScale] = useAtom(uiScaleAtom)
  const scaleOptions = UI_SCALE_OPTIONS

  /** 切换主题模式 */
  const handleThemeChange = React.useCallback((value: string) => {
    const mode = value as ThemeMode
    setThemeMode(mode)
    updateThemeMode(mode)
    setThemeStyle('default')
    updateThemeStyle('default')
    applyThemeToDOM(mode, 'default', systemIsDark)
  }, [setThemeMode, setThemeStyle, systemIsDark])

  /** 从皮肤管理器选择皮肤 */
  const handleStyleSelect = React.useCallback((style: ThemeStyle) => {
    setThemeMode('special')
    setThemeStyle(style)
    updateThemeMode('special')
    updateThemeStyle(style)
    applyThemeToDOM('special', style, systemIsDark)
  }, [setThemeMode, setThemeStyle, systemIsDark])

  const refreshSkins = React.useCallback(async () => {
    setBusy(true)
    try { await refreshSkinRegistry(themeStyle); toast.success('皮肤库已刷新') } catch { toast.error('刷新皮肤库失败') } finally { setBusy(false) }
  }, [themeStyle])
  const importSkin = React.useCallback(async (kind: 'zip' | 'folder', replace = false, existingPath?: string) => {
    setBusy(true)
    try {
      const path = existingPath ?? (kind === 'zip' ? await window.electronAPI.selectSkinZip() : await window.electronAPI.selectSkinFolder())
      if (!path) return
      const result = kind === 'zip' ? await window.electronAPI.installSkinZip(path, replace) : await window.electronAPI.installSkinFolder(path, replace)
      if (result.status === 'conflict') { setConflict({ path, kind }); return }
      if (!result.ok) { toast.error(result.message ?? '导入失败'); return }
      await refreshSkinRegistry(themeStyle)
      toast.success(result.message ?? '皮肤已导入')
    } catch { toast.error('导入皮肤失败') } finally { setBusy(false) }
  }, [themeStyle])
  const confirmDelete = React.useCallback(async () => {
    if (!deleteTarget) return
    if (themeMode === 'special' && themeStyle === deleteTarget.id) { toast.error('请先恢复默认主题，再删除当前皮肤'); setDeleteTarget(null); return }
    setBusy(true)
    try { const result = await window.electronAPI.deleteUserSkin(deleteTarget.id); if (!result.ok) toast.error(result.message ?? '删除失败'); else { await refreshSkinRegistry(); toast.success('皮肤已删除') } } finally { setBusy(false); setDeleteTarget(null) }
  }, [deleteTarget, themeMode, themeStyle])

  /** 切换 Markdown 字号 */
  const handleMarkdownFontSizeChange = React.useCallback((value: string) => {
    const size = value as MarkdownFontSize
    setMarkdownFontSize(size)
    updateMarkdownFontSize(size)
  }, [setMarkdownFontSize])

  /** 切换界面大小 */
  const handleUiScaleChange = React.useCallback((value: string) => {
    const scale = value as UiScale
    setUiScale(scale)
    updateUiScale(scale)
  }, [setUiScale])

  return (
    <div className="space-y-6">
      <SettingsSection
        title="外观设置"
        description="自定义应用的视觉风格"
      >
        <SettingsCard>
          {/* 主题模式 - 最上面 */}
          <SettingsSegmentedControl
            label="主题模式"
            description="选择应用的配色方案"
            value={themeMode}
            onValueChange={handleThemeChange}
            options={THEME_OPTIONS}
          />

          {isElectron ? (
            <SettingsRow
              label="界面缩放"
              description={ZOOM_HINT}
            />
          ) : (
            <SettingsSegmentedControl
              label="界面大小"
              description="整体等比缩放界面（触屏设备推荐 110% 或更大）"
              value={uiScale}
              onValueChange={handleUiScaleChange}
              options={scaleOptions}
            />
          )}

          <SettingsSegmentedControl
            label="Markdown 字号"
            description="调整 AI 回复与 Markdown 编辑器的正文字号"
            value={markdownFontSize}
            onValueChange={handleMarkdownFontSizeChange}
            options={MARKDOWN_FONT_SIZE_OPTIONS}
          />

        </SettingsCard>
      </SettingsSection>

      <SkinManager skins={skins} themeMode={themeMode} themeStyle={themeStyle} busy={busy} onSelect={handleStyleSelect} onImport={importSkin} onRefresh={refreshSkins} onOpenFolder={() => window.electronAPI.openUserSkinsFolder()} onDelete={setDeleteTarget} />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>删除皮肤？</AlertDialogTitle><AlertDialogDescription>将永久删除「{deleteTarget?.name}」，此操作不可恢复。</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={confirmDelete}>删除</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
      <AlertDialog open={conflict !== null} onOpenChange={(open) => { if (!open) setConflict(null) }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>皮肤已存在</AlertDialogTitle><AlertDialogDescription>是否以新导入的皮肤替换同名用户皮肤？</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>取消</AlertDialogCancel><AlertDialogAction onClick={() => { const item = conflict; setConflict(null); if (item) void importSkin(item.kind, true, item.path) }}>替换</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
