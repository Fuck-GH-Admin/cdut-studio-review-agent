/**
 * CDUT 特区账户认证管理器单元测试
 *
 * 覆盖范围（对应计划 §5.2）：
 *   1. loadPersistedAccount —— 从模拟 JSON 文件读取元数据，且重启后默认状态为 disconnected；
 *   2. getSavedAccount —— 正确返回脱敏元数据与已记住密码（供登录窗一键填充）；
 *   3. logout —— 清理内存状态、删除本地文件并复位 profile；
 *   4. persistAccount —— 勾选「记住密码」时仅密码字段经 token-crypto 加密落盘。
 *
 * 说明：隐藏认证窗口的登录全流程依赖真实 Electron 导航，无法在单测环境端到端复现，
 * 故此处聚焦可确定性验证的持久化 / 清理内核路径。
 */

import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { CdutAccountProfile } from '@profer/shared'
import { getCdutAccountPath } from '../config-paths'
import { encryptToken, decryptToken } from '../token-crypto'
import { CdutAuthManager } from './cdut-auth-manager'
import { extractProfilePhotoUrl } from './cdut-jw-client'

/** 与管理器内部 StoredCdutAccount 对应的落盘结构（密码字段为密文） */
interface StoredAccount {
  studentId: string
  studentName: string
  avatar?: string
  college?: string
  major?: string
  classCode?: string
  role?: string
  rememberPassword: boolean
  encryptedPassword?: string
  status: 'active' | 'disconnected'
  lastLoginAt: number
  lastActiveAt: number
}

const tempRoots: string[] = []
const originalConfigDir = process.env.PROFER_CONFIG_DIR

function makeTempConfigDir(): string {
  const root = mkdtempSync(join(tmpdir(), 'profer-cdut-'))
  tempRoots.push(root)
  return root
}

function readStoredAccount(): StoredAccount {
  return JSON.parse(readFileSync(getCdutAccountPath(), 'utf-8')) as StoredAccount
}

/**
 * 通过类型断言触达私有持久化内核。
 * persistAccount 已私有化（杜绝生产代码暴露写入口），但落盘与加密内核仍需确定性验证，
 * 故此处以受控方式在单测内调用。
 */
function persistAccountForTest(
  manager: CdutAuthManager,
  params: CdutAccountProfile & { password?: string },
): void {
  ;(
    manager as unknown as {
      persistAccount: (p: CdutAccountProfile & { password?: string }) => void
    }
  ).persistAccount(params)
}

beforeEach(() => {
  // 隔离配置根，避免污染真实 ~/.cdutai 或项目工作区
  process.env.PROFER_CONFIG_DIR = makeTempConfigDir()
})

afterEach(() => {
  if (originalConfigDir === undefined) delete process.env.PROFER_CONFIG_DIR
  else process.env.PROFER_CONFIG_DIR = originalConfigDir
  while (tempRoots.length > 0) rmSync(tempRoots.pop()!, { recursive: true, force: true })
})

describe('CdutAuthManager 特区账户持久化', () => {
  test('Given 本地已落盘加密账户 When 加载账户 Then 正确读取元数据且状态复位为未登录', () => {
    const password = 'cdut-secret-9527'
    const stored: StoredAccount = {
      studentId: '20210001',
      studentName: '张三',
      college: '地球物理学院',
      major: '勘查技术与工程',
      classCode: '2021010101',
      role: '学生',
      rememberPassword: true,
      encryptedPassword: encryptToken(password),
      status: 'active',
      lastLoginAt: 1_700_000_000_000,
      lastActiveAt: 1_700_000_100_000,
    }
    writeFileSync(getCdutAccountPath(), JSON.stringify(stored), 'utf-8')

    const manager = new CdutAuthManager({ autoLoad: false })
    manager.loadPersistedAccount()

    const profile = manager.getProfile()
    expect(profile.studentId).toBe('20210001')
    expect(profile.studentName).toBe('张三')
    expect(profile.college).toBe('地球物理学院')
    expect(profile.major).toBe('勘查技术与工程')
    expect(profile.classCode).toBe('2021010101')
    expect(profile.role).toBe('学生')
    // 客户端重启后必须严格复位为未登录，持久化凭据仅供一键填充消费
    expect(profile.status).toBe('disconnected')
    expect(profile.rememberPassword).toBe(true)
    // 密文可解密回明文，证明落盘的是可还原的加密值而非占位串
    expect(decryptToken(readStoredAccount().encryptedPassword!)).toBe(password)
    expect(manager.getRememberedPassword()).toBe(password)
  })

  test('Given 本地已保存账户 When 查询 SavedAccount Then 返回脱敏元数据与已记住密码', () => {
    const password = 'cdut-secret-9527'
    const manager = new CdutAuthManager({ autoLoad: false })

    // 无文件时如实返回 hasSaved=false
    expect(manager.getSavedAccount().hasSaved).toBe(false)

    persistAccountForTest(manager, {
      studentId: '202519110211',
      studentName: '马晨超',
      college: '地球物理学院',
      major: '勘查技术与工程',
      status: 'active',
      rememberPassword: true,
      password,
    })

    const summary = manager.getSavedAccount()
    expect(summary.hasSaved).toBe(true)
    expect(summary.studentId).toBe('202519110211')
    expect(summary.studentName).toBe('马晨超')
    expect(summary.rememberPassword).toBe(true)
    // 勾选记住密码时，一键填充需要拿到可用的明文密码
    expect(summary.savedPassword).toBe(password)
  })

  test('Given 本地存在已保存账户 When 登出 Then 清空内存状态、删除本地文件并复位 profile', async () => {
    const manager = new CdutAuthManager({ autoLoad: false })
    persistAccountForTest(manager, {
      studentId: '20210001',
      studentName: '张三',
      status: 'active',
      rememberPassword: true,
      password: 'cdut-secret-9527',
    })
    // 重启加载后仅恢复未登录态下的元数据，持久化文件仍在
    manager.loadPersistedAccount()
    expect(manager.getProfile().studentId).toBe('20210001')
    expect(manager.getProfile().status).toBe('disconnected')
    expect(existsSync(getCdutAccountPath())).toBe(true)

    let broadcasted = manager.getProfile()
    manager.setStatusCallback((p) => {
      broadcasted = p
    })

    await manager.logout()

    expect(manager.getProfile().status).toBe('disconnected')
    expect(manager.getProfile().studentId).toBe('')
    expect(existsSync(getCdutAccountPath())).toBe(false)
    // 状态变更需广播给主进程，供渲染层同步复位
    expect(broadcasted.status).toBe('disconnected')
  })

  test('Given 勾选记住密码 When 保存账户 Then 仅密码字段经 token-crypto 加密落盘', () => {
    const manager = new CdutAuthManager({ autoLoad: false })
    const password = 'cdut-secret-9527'

    persistAccountForTest(manager, {
      studentId: '20210001',
      studentName: '张三',
      status: 'active',
      rememberPassword: true,
      password,
    })

    const stored = readStoredAccount()
    expect(stored.rememberPassword).toBe(true)
    expect(stored.encryptedPassword).toBeTruthy()
    // 落盘内容不得为明文
    expect(stored.encryptedPassword).not.toBe(password)
    // 使用 token-crypto 的 AES-GCM 格式，且可解密还原
    expect(stored.encryptedPassword!.startsWith('proferv1:')).toBe(true)
    expect(decryptToken(stored.encryptedPassword!)).toBe(password)

    // 未勾选记住密码时不落盘任何密码字段，杜绝明文泄露
    persistAccountForTest(manager, {
      studentId: '20210001',
      studentName: '张三',
      status: 'active',
      rememberPassword: false,
      password,
    })
    expect(readStoredAccount().encryptedPassword).toBe('')
  })
})

describe('青果教务证件照定位解析', () => {
  test('Given 学籍卡片 img#xjkp When 提取证件照 Then 成功命中照片地址', () => {
    const html = `
      <table class="Nsb_table">
        <tr>
          <td>学号</td><td>202519110211</td>
          <td rowspan="6"><img id="xjkp" src="/jsxsd/grxx/xsxx_zp.do?xh=202519110211" width="120" height="160" /></td>
        </tr>
      </table>
    `
    expect(extractProfilePhotoUrl(html)).toBe('/jsxsd/grxx/xsxx_zp.do?xh=202519110211')
  })

  test('Given 学籍管理页 img#xszp When 提取证件照 Then 成功命中照片地址', () => {
    const html = `
      <div id="xsxxPhoto">
        <img id="xszp" src="/jsxsd/xsxj/xszp.do?xh=202519110211" />
      </div>
    `
    expect(extractProfilePhotoUrl(html)).toBe('/jsxsd/xsxj/xszp.do?xh=202519110211')
  })

  test('Given 相对路径 showzp.do When 提取证件照 Then 成功识别 showzp 端点且不被 trailing slash 漏匹', () => {
    const html = `
      <table class="form-table">
        <tr>
          <td><img src="showzp.do?id=123" /></td>
        </tr>
      </table>
    `
    expect(extractProfilePhotoUrl(html)).toBe('showzp.do?id=123')
  })

  test('Given 表格中包含站点图标与占位图 When 提取证件照 Then 自动排除占位图并命中真实照片', () => {
    const html = `
      <img src="/images/logo.png" />
      <img src="/images/blank.gif" />
      <table>
        <tr>
          <td><img src="/images/icon_user.png" /></td>
          <td rowspan="5"><img src="/jsxsd/grxx/readzp.do?id=99" /></td>
        </tr>
      </table>
    `
    expect(extractProfilePhotoUrl(html)).toBe('/jsxsd/grxx/readzp.do?id=99')
  })

  test('Given 仅有查看照片下载链接 When 提取证件照 Then 通过链接兜底提取照片地址', () => {
    const html = `
      <div class="user-card">
        <a href="/jsxsd/grxx/xsxx_zp.do?xh=202519110211">查看照片</a>
      </div>
    `
    expect(extractProfilePhotoUrl(html)).toBe('/jsxsd/grxx/xsxx_zp.do?xh=202519110211')
  })
})

