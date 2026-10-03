import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'

/**
 * MinGit 下载与配置脚本
 *
 * 针对 Windows 环境下载并解压官方 MinGit (Git for Windows 精简版) 到 resources/bin/git
 * 供纯净无 Git 的 Windows 设备开箱即用。
 */

const MINGIT_VERSION = '2.47.1'
const MINGIT_URL = `https://github.com/git-for-windows/git/releases/download/v${MINGIT_VERSION}.windows.1/MinGit-${MINGIT_VERSION}-64-bit.zip`

const targetDir = join(import.meta.dirname, '..', 'resources', 'bin', 'git')
const gitExe = join(targetDir, 'cmd', 'git.exe')

async function ensureMinGit(): Promise<void> {
  if (process.platform !== 'win32') {
    console.log('[MinGit] 非 Windows 平台，跳过 MinGit 下载。')
    return
  }

  if (existsSync(gitExe)) {
    console.log(`[MinGit] 检测到内置 MinGit 已就绪: ${gitExe}`)
    return
  }

  console.log(`[MinGit] 开始从 GitHub 镜像下载 MinGit v${MINGIT_VERSION}...`)
  mkdirSync(targetDir, { recursive: true })

  const zipPath = join(targetDir, 'mingit.zip')

  try {
    const res = await fetch(MINGIT_URL)
    if (!res.ok) {
      console.warn(`[MinGit] 下载失败 (HTTP ${res.status}): ${res.statusText}`)
      return
    }

    const arrayBuffer = await res.arrayBuffer()
    await Bun.write(zipPath, arrayBuffer)
    console.log('[MinGit] 下载完成，正在解压...')

    // 在 Windows 上利用 PowerShell Expand-Archive 解压
    const proc = Bun.spawnSync(['powershell', '-NoProfile', '-Command', `Expand-Archive -Path "${zipPath}" -DestinationPath "${targetDir}" -Force`])
    if (proc.exitCode !== 0) {
      console.error('[MinGit] 解压失败:', proc.stderr.toString())
      return
    }

    if (existsSync(zipPath)) {
      rmSync(zipPath, { force: true })
    }

    if (existsSync(gitExe)) {
      console.log(`[MinGit] 内置 MinGit 配置成功: ${gitExe}`)
    } else {
      console.warn('[MinGit] 解压后未找到 cmd/git.exe')
    }
  } catch (error) {
    console.warn('[MinGit] 下载或解压过程中出错:', error)
  }
}

if (import.meta.main) {
  ensureMinGit()
}
