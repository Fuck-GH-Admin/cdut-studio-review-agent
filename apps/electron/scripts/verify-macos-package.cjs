#!/usr/bin/env node
/**
 * 验证 Apple Silicon macOS 解包产物的基础运行时闭包。
 *
 * 仅应在 darwin-arm64 上运行，并由 dist:mac 在 electron-builder 成功后调用。
 * 它不替代真实 UI/Agent 冒烟，也不做签名或 notarization 断言（P1 明确无签名）。
 */
const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')
const { findUnpackedNativeFiles } = require('./packaged-pi-probe.cjs')
const { PRODUCT_APP_NAME, findMacAppBundle } = require('./macos-signature.cjs')

if (process.platform !== 'darwin' || process.arch !== 'arm64') {
  throw new Error(`verify:mac-package 仅支持 darwin-arm64，当前为 ${process.platform}-${process.arch}`)
}

const appRoot = path.resolve(__dirname, '..')
const outputDir = process.env.PROFER_ELECTRON_OUTPUT_DIR
  ? path.resolve(appRoot, process.env.PROFER_ELECTRON_OUTPUT_DIR)
  : path.join(appRoot, 'out')
function assertExists(filePath, description) {
  if (!fs.existsSync(filePath)) throw new Error(`macOS 安装包缺少 ${description}: ${filePath}`)
}

const appBundle = findMacAppBundle(outputDir)
if (!appBundle) throw new Error(`未找到 macOS ${PRODUCT_APP_NAME} 解包产物: ${outputDir}`)
const contents = path.join(appBundle, 'Contents')
const resources = path.join(contents, 'Resources')
const macOsDir = path.join(contents, 'MacOS')
const appArchive = path.join(resources, 'app.asar')
const unpackedNodeModules = path.join(resources, 'app.asar.unpacked', 'node_modules')
const cliPath = path.join(resources, 'bin', 'profer')
const executableName = execFileSync('/usr/libexec/PlistBuddy', [
  '-c', 'Print :CFBundleExecutable', path.join(contents, 'Info.plist'),
], { encoding: 'utf8' }).trim()
if (!executableName) throw new Error('Info.plist 缺少 CFBundleExecutable')
const appBinary = path.join(macOsDir, executableName)

assertExists(appBinary, '应用可执行文件')
assertExists(appArchive, 'app.asar')
assertExists(unpackedNodeModules, 'app.asar.unpacked/node_modules')
assertExists(cliPath, '随包 CLI')

for (const [binary, description] of [[cliPath, '随包 CLI'], [appBinary, '应用主程序']]) {
  try {
    fs.accessSync(binary, fs.constants.X_OK)
  } catch {
    throw new Error(`${description} 不具备 macOS 可执行权限: ${binary}`)
  }
}

const nativeFiles = findUnpackedNativeFiles(unpackedNodeModules)
if (nativeFiles.length === 0) throw new Error('app.asar.unpacked 中未找到 Pi native/WASM 文件')
const appBinaryInfo = execFileSync('file', ['-b', appBinary], { encoding: 'utf8' }).trim()
if (!/arm64|arm64e/i.test(appBinaryInfo)) throw new Error(`${PRODUCT_APP_NAME} 主二进制不是 arm64: ${appBinaryInfo}`)

// 使用安装包自身的 Electron/Node ABI 验证 Pi-only 闭包，不依赖已移除的 Claude SDK CLI。
execFileSync(appBinary, [path.join(__dirname, 'packaged-pi-probe.cjs'), resources], {
  env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' },
  encoding: 'utf8',
  timeout: 120_000,
})

console.log(JSON.stringify({
  ok: true,
  appBundle,
  appBinary,
  nativeFileCount: nativeFiles.length,
  appBinaryInfo,
}, null, 2))
