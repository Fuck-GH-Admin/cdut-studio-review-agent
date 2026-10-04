/**
 * CDUT 专区特区账户状态 Atom
 *
 * 仅保存「特区账户」的本地展示状态（学号 / 姓名 / 连接状态）。
 * 真实认证与凭证加密全部在主进程完成，渲染进程只消费
 * window.electronAPI.cdutZone 推送与查询结果，绝不接触明文密码。
 */

import { atom } from 'jotai'
import type { CdutAccountProfile } from '@profer/shared'

/** CDUT 特区账户全局状态（默认未连接） */
export const cdutAccountAtom = atom<CdutAccountProfile>({
  studentId: '',
  studentName: '',
  status: 'disconnected',
})
