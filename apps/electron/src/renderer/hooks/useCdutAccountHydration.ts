/**
 * CDUT 特区账户全局水合
 *
 * 目前 cdutAccountAtom 仅在 CdutZoneView 挂载时被填充。此钩子在应用根部挂载后即拉取
 * 一次账户快照并订阅状态变更，使账户状态（含登录时已保存到本地的证件照头像）对任何界面
 * 都可用——这样聊天里的 CDUT 学籍照片才能被通用图片渲染能力显示出来。
 */

import { useEffect } from 'react'
import { useStore } from 'jotai'
import { cdutAccountAtom } from '@/atoms/cdut-account-atoms'

export function useCdutAccountHydration(): void {
  const store = useStore()

  useEffect(() => {
    let active = true

    window.electronAPI.cdutZone
      .getAccount()
      .then((profile) => {
        if (active) store.set(cdutAccountAtom, profile)
      })
      .catch((err: unknown) => console.error('[CdutHydration] 拉取特区账户失败:', err))

    const unsubscribe = window.electronAPI.cdutZone.onStatusChanged((profile) => {
      store.set(cdutAccountAtom, profile)
    })

    return () => {
      active = false
      unsubscribe()
    }
  }, [store])
}
