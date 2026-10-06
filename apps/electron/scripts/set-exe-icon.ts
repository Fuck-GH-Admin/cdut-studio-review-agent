/**
 * Set Windows exe icon + version info using npm rcedit (v5.x, ESM)
 * electron-builder's bundled rcedit (2.6.0) doesn't work with Electron 39-43.
 */
import { rcedit } from 'rcedit'
import { existsSync, copyFileSync } from 'node:fs'
import { join } from 'node:path'

const exePath = join(import.meta.dirname, '..', 'out', 'win-unpacked', 'CDUT Studio.exe')
const icoPath = join(import.meta.dirname, '..', 'resources', 'icon.ico')

if (!existsSync(exePath)) {
  console.error('ERROR: CDUT Studio.exe not found at', exePath)
  process.exit(1)
}
if (!existsSync(icoPath)) {
  console.error('ERROR: icon.ico not found at', icoPath)
  process.exit(1)
}

console.log('Patching:', exePath)
console.log('Icon:', icoPath)

await rcedit(exePath, {
  'version-string': {
    ProductName: 'CDUT Studio',
    FileDescription: 'CDUT Studio',
    CompanyName: 'CDUT Studio Devs',
    LegalCopyright: 'By 雫窝中央实验室 · 2026',
  },
  icon: icoPath,
})

console.log('Done — icon + metadata applied')
