/**
 * CDUT 演示特区账户：凭证与画像定义
 *
 * 用途：产品演示专用的离线账户。命中演示凭据后旁路真实 CAS 通道，
 * 不发起任何网络请求、不启动保活、不落盘（仅内存会话，退出即失效）。
 *
 * 红线：本模块仅在演示态生效，绝不参与真实登录判定。
 */

import type { CdutAccountProfile } from '@profer/shared'
import { DEMO_AVATAR_DATA_URL } from './demo-avatar'

/** 演示登录凭据：学工号与密码需同时精确命中才进入演示态 */
export const DEMO_CREDENTIALS = {
  studentId: '202520260101',
  password: 'Nya315',
} as const

/** 演示账户画像字段（离线内置，不走网络） */
export const DEMO_ACCOUNT_FIELDS = {
  studentName: '张澄一',
  studentId: '202520260101',
  college: '环境与土木工程',
  major: '地下水科学与工程',
  classCode: '2025202601',
  role: '学生',
} as const

/**
 * 构造演示账户画像（登录命中后置入账户状态）。
 * 演示态恒为「仅内存」，因此 rememberPassword 固定为 false，杜绝任何落盘。
 */
export function buildDemoProfile(): CdutAccountProfile {
  const now = Date.now()
  return {
    studentId: DEMO_ACCOUNT_FIELDS.studentId,
    studentName: DEMO_ACCOUNT_FIELDS.studentName,
    avatar: DEMO_AVATAR_DATA_URL,
    college: DEMO_ACCOUNT_FIELDS.college,
    major: DEMO_ACCOUNT_FIELDS.major,
    classCode: DEMO_ACCOUNT_FIELDS.classCode,
    role: DEMO_ACCOUNT_FIELDS.role,
    status: 'active',
    rememberPassword: false,
    lastLoginAt: now,
    lastActiveAt: now,
  }
}
