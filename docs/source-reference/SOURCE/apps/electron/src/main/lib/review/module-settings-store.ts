/** 审核专区独立偏好；仅持久化渠道/模型 ID，不复制或保存任何凭证。 */
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ReviewModuleSettingsV2 } from '@profer/shared'
import { getConfigDir } from '../config-paths'
import { getSettings } from '../settings-service'

export interface EffectiveReviewModelSelection {
  selection: { channelId: string; modelId: string } | null
  /** 审核专区显式选择失效时必须报错，不能静默换模型。 */
  explicit: boolean
}

const DEFAULT_SETTINGS: ReviewModuleSettingsV2 = { agentModelSelection: null }

function settingsPath(): string {
  return join(getConfigDir(), 'review-module-settings.json')
}

export function getReviewModuleSettings(): ReviewModuleSettingsV2 {
  const path = settingsPath()
  if (!existsSync(path)) return DEFAULT_SETTINGS
  try {
    const value = JSON.parse(readFileSync(path, 'utf8')) as Partial<ReviewModuleSettingsV2>
    const selection = value.agentModelSelection
    if (selection === null || selection === undefined) return DEFAULT_SETTINGS
    if (typeof selection.channelId !== 'string' || !selection.channelId || typeof selection.modelId !== 'string' || !selection.modelId) {
      return DEFAULT_SETTINGS
    }
    return { agentModelSelection: { channelId: selection.channelId, modelId: selection.modelId } }
  } catch (error) {
    console.warn('[审核设置] 设置文件无法读取，使用全局 Agent 默认模型:', error)
    return DEFAULT_SETTINGS
  }
}

/**
 * 审核未单独选择模型时，沿用应用主 Agent 当前渠道/模型。
 * 这里只读取全局偏好，不复制凭证；渠道有效性仍由模型网关统一校验。
 */
export function getEffectiveReviewModelSelection(): EffectiveReviewModelSelection {
  const reviewSelection = getReviewModuleSettings().agentModelSelection
  if (reviewSelection) return { selection: reviewSelection, explicit: true }
  const appSettings = getSettings()
  if (!appSettings.agentChannelId) return { selection: null, explicit: false }
  return {
    selection: { channelId: appSettings.agentChannelId, modelId: appSettings.agentModelId ?? '' },
    explicit: false,
  }
}

export function saveReviewModuleSettings(settings: ReviewModuleSettingsV2): ReviewModuleSettingsV2 {
  const path = settingsPath()
  const tempPath = `${path}.tmp`
  writeFileSync(tempPath, JSON.stringify(settings, null, 2), 'utf8')
  renameSync(tempPath, path)
  return settings
}
