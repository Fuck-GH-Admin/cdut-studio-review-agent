/**
 * useEnterCdutAiClass — 统一进入「AI速课堂」界面的导航封装
 *
 * 供两处复用：
 *   1. CDUT 专区会话选择弹窗选定/新建课堂后正式进入（CdutZoneView.handlePickSession）；
 *   2. 已登录时从主侧边栏打开课堂会话后，输入框锁定引导按钮「前往 CDUT 专区」。
 *
 * 逻辑：激活专属会话 Tab → 切回 CDUT 专区视图 → 沉浸式折叠主边栏（暂存原折叠态）→ 打开速课堂子页面。
 */

import * as React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { sidebarCollapsedAtom } from '@/atoms/tab-atoms'
import { activeViewAtom } from '@/atoms/active-view'
import { cdutSidebarRestoreAtom, cdutSubViewAtom } from '@/atoms/cdut-account-atoms'
import { useOpenSession } from '@/hooks/useOpenSession'

export function useEnterCdutAiClass(): (sessionId: string, title?: string) => void {
  const openSession = useOpenSession()
  const setActiveView = useSetAtom(activeViewAtom)
  const setSubView = useSetAtom(cdutSubViewAtom)
  const sidebarCollapsed = useAtomValue(sidebarCollapsedAtom)
  const setSidebarCollapsed = useSetAtom(sidebarCollapsedAtom)
  const sidebarRestore = useAtomValue(cdutSidebarRestoreAtom)
  const setSidebarRestore = useSetAtom(cdutSidebarRestoreAtom)

  return React.useCallback((sessionId: string, title?: string): void => {
    // 复用统一 openSession：同步 Tab / 当前会话 / 当前工作区（appMode 切至 agent）
    openSession('agent', sessionId, title || 'AI速课堂')
    // openSession 会切到 conversations 视图，此处保持停留在 CDUT 专区
    setActiveView('cdut-zone')
    // 沉浸式折叠主边栏：仅在尚未暂存时记录进入前状态，关闭子页面时恢复
    if (sidebarRestore === null) setSidebarRestore(sidebarCollapsed)
    setSidebarCollapsed(true)
    setSubView('ai-class')
  }, [openSession, setActiveView, setSubView, sidebarCollapsed, sidebarRestore, setSidebarCollapsed, setSidebarRestore])
}
