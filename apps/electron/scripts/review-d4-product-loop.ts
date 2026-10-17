/** 启动隔离的 D4 客户端；仅复制模型配置，不复制用户会话、模板或案卷。 */
import { copyFileSync, existsSync, mkdtempSync, mkdirSync } from 'node:fs'
import { homedir, tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { createServer } from 'node:net'
import { createRequire } from 'node:module'

const root = resolve(import.meta.dir, '../../..')
const electronDir = join(root, 'apps/electron')
const args = process.argv.slice(2)
const sourceIndex = args.indexOf('--model-config')
const modelConfig = sourceIndex >= 0 ? resolve(args[sourceIndex + 1] ?? '') : join(homedir(), '.cdutai-dev')
if (sourceIndex >= 0 && !args[sourceIndex + 1]) throw new Error('--model-config 需要配置目录路径（无需填写 API Key）')
const profile = mkdtempSync(join(tmpdir(), 'cdut-d4-product-loop-'))
const config = join(profile, 'config')
mkdirSync(config)
for (const name of ['channels.json', 'device.json', 'proxy-settings.json']) {
  if (existsSync(join(modelConfig, name))) copyFileSync(join(modelConfig, name), join(config, name))
}
const port = await new Promise<number>((resolvePort, reject) => {
  const server = createServer()
  server.once('error', reject)
  server.listen(0, '127.0.0.1', () => {
    const address = server.address()
    if (!address || typeof address === 'string') { server.close(); reject(new Error('无法分配开发端口')); return }
    server.close(() => resolvePort(address.port))
  })
})
const env = { ...process.env, PROFER_DEV: '1', PROFER_CONFIG_DIR: config,
  PROFER_USER_DATA_DIR: join(profile, 'user-data'), PROFER_DEV_INSTANCE: `d4-${Date.now()}`, PROFER_VITE_PORT: String(port) }
console.log(`D4 技术预审隔离目录：${profile}\n模型配置来源：${modelConfig}\n合成材料：${join(root, 'docs/design/review-agent/acceptance/d4-product-loop-r01/fixtures')}`)
for (const script of ['typecheck', 'build:main', 'build:preload', 'build:resources', 'build:ooxml']) {
  const task = Bun.spawn(['bun', 'run', script], { cwd: electronDir, env, stdout: 'inherit', stderr: 'inherit' })
  if (await task.exited !== 0) throw new Error(`D4 启动前 ${script} 失败；原始配置未修改，隔离目录已保留`)
}
const require = createRequire(join(electronDir, 'package.json'))
let binary = process.env.D4_ELECTRON_BINARY
if (!binary) {
  try { binary = require('electron') as string } catch {
    const install = join(dirname(require.resolve('electron/package.json')), 'install.js')
    const downloadEnv = { ...env }; delete downloadEnv.ELECTRON_SKIP_BINARY_DOWNLOAD
    const task = Bun.spawn(['node', install], { env: downloadEnv, stdout: 'inherit', stderr: 'inherit' })
    if (await task.exited !== 0) throw new Error('锁定的 Electron 二进制下载失败；可用 D4_ELECTRON_BINARY 指定同版本已安装二进制')
    binary = require('electron') as string
  }
}
const vite = Bun.spawn(['bun', 'run', 'dev:vite'], { cwd: electronDir, env, stdout: 'inherit', stderr: 'inherit' })
let ready = false
for (let i = 0; i < 60; i++) {
  try { if ((await fetch(`http://localhost:${port}`)).ok) { ready = true; break } } catch { /* 等待 Vite 启动。 */ }
  await Bun.sleep(500)
}
if (!ready) { vite.kill(); throw new Error('Vite 未就绪；请检查上面的构建日志') }
const extraArgs = process.env.D4_CDP_PORT ? [`--remote-debugging-address=127.0.0.1`, `--remote-debugging-port=${process.env.D4_CDP_PORT}`] : []
// 仅在使用者显式指定时用于隔离 Linux 开发测试；不改变审核员/工具业务权限。
if (args.includes('--no-sandbox')) extraArgs.push('--no-sandbox')
const app = Bun.spawn([binary!, '.', ...extraArgs], { cwd: electronDir, env, stdout: 'inherit', stderr: 'inherit' })
const stop = (): void => { app.kill(); vite.kill() }
process.on('SIGINT', stop); process.on('SIGTERM', stop)
console.log('客户端入口：CDUT 专区 → 材料审核 → 新建审核项目 → 使用 D4 候选模板 · 技术预审')
console.log('条件改变请新建案卷；候选不能发布。退出后保留隔离目录供核验。')
const exitCode = await app.exited
vite.kill()
process.exitCode = exitCode
