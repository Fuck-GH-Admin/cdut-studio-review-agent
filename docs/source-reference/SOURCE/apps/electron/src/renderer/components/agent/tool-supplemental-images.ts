/**
 * 工具补充图片来源注册表
 *
 * 某些工具的图片并不在工具结果里（例如 CDUT 学籍档案的证件照字段只回传占位符
 * "(base64-embedded)"），但应用本地已保存了该图片。此注册表把这类"已知本地图源"
 * 接入通用图片渲染能力，无需修改任何工具源码。
 */

import * as React from 'react'
import { useAtomValue } from 'jotai'
import { cdutAccountAtom } from '@/atoms/cdut-account-atoms'
import { dataUrlImage, type AgentRenderableImage } from './agent-renderable-image'

/**
 * 返回给定工具调用在工具结果之外、来自本地状态的补充图片。
 * @param toolName 工具名
 * @param action 工具 action（缺失时按默认 action 处理）
 */
export function useToolSupplementalImages(toolName: string, action: string): AgentRenderableImage[] {
  const account = useAtomValue(cdutAccountAtom)

  return React.useMemo(() => {
    // CDUT 学籍档案：证件照直接使用登录时已保存到本地的头像（不联网抓取，也不改工具）
    if (toolName === 'cdut_academic_profile' && (action === 'get_profile' || action === '')) {
      const image = account.avatar ? dataUrlImage(account.avatar, '证件照') : null
      return image ? [image] : []
    }
    return []
  }, [toolName, action, account.avatar])
}
