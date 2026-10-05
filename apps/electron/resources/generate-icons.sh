#!/bin/bash

# CDUT Studio Icon Generation Script
# Generates all required icon formats from CDUT_Studio.svg
# Requires: rsvg-convert (librsvg), iconutil (macOS), magick (ImageMagick)

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🎨 Generating CDUT Studio icons..."

# Check required tools
if ! command -v rsvg-convert &> /dev/null; then
    echo "❌ rsvg-convert not found. Install with: brew install librsvg"
    exit 1
fi

if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick (magick) not found. Install with: brew install imagemagick"
    exit 1
fi

if ! command -v iconutil &> /dev/null; then
    echo "⚠️  iconutil not found (macOS only). Skipping .icns generation"
fi

# 1. Generate icon.png (1024x1024) from SVG
# 兼容性优先：只指定 -w，rsvg-convert 会按原始比例自动推算高度（只给单个尺寸时始终保比例，
# 无需 rsvg-convert 2.46+ 才有的 --keep-aspect-ratio）；再用 ImageMagick 居中补透明边成
# 正方形，既不变形，也保证下游 sips/magick 处理时统一为 1024x1024。
echo "📦 Generating icon.png (1024x1024)..."
rsvg-convert -w 1024 CDUT_Studio.svg -o icon.png
magick icon.png -background none -gravity center -extent 1024x1024 icon.png

# 2. Generate menubar/tray icons (multi-resolution for Retina displays)
echo "📦 Generating tray icons..."

# macOS 托盘图标规范：
# - 标准尺寸: 22x22pt（点）
# - @2x Retina: 44x44px
# - @3x 高分辨率: 66x66px
# 使用 "Template" 命名让 macOS 自动适配深色/浅色菜单栏
TRAY_SVG="profer-logos/icon.svg"

if [ ! -f "$TRAY_SVG" ]; then
  echo "⚠️  Tray icon SVG not found at $TRAY_SVG, skipping tray icon generation"
else
  # 生成多分辨率 Template 图标（macOS 会自动选择合适的版本）
  rsvg-convert -w 22 -h 22 "$TRAY_SVG" -o profer-logos/iconTemplate.png
  rsvg-convert -w 44 -h 44 "$TRAY_SVG" -o "profer-logos/iconTemplate@2x.png"
  rsvg-convert -w 66 -h 66 "$TRAY_SVG" -o "profer-logos/iconTemplate@3x.png"

  echo "✅ Tray icons generated:"
  echo "   - profer-logos/iconTemplate.png (22x22 @1x)"
  echo "   - profer-logos/iconTemplate@2x.png (44x44 @2x Retina)"
  echo "   - profer-logos/iconTemplate@3x.png (66x66 @3x)"
fi

# 3. Generate .icns (macOS app icon)
if command -v iconutil &> /dev/null; then
    echo "📦 Generating icon.icns..."

    # Create iconset directory
    mkdir -p icon.iconset

    # Generate all required sizes for macOS
    # Standard resolutions
    sips -z 16 16     icon.png --out icon.iconset/icon_16x16.png      > /dev/null 2>&1
    sips -z 32 32     icon.png --out icon.iconset/icon_16x16@2x.png   > /dev/null 2>&1
    sips -z 32 32     icon.png --out icon.iconset/icon_32x32.png      > /dev/null 2>&1
    sips -z 64 64     icon.png --out icon.iconset/icon_32x32@2x.png   > /dev/null 2>&1
    sips -z 128 128   icon.png --out icon.iconset/icon_128x128.png    > /dev/null 2>&1
    sips -z 256 256   icon.png --out icon.iconset/icon_128x128@2x.png > /dev/null 2>&1
    sips -z 256 256   icon.png --out icon.iconset/icon_256x256.png    > /dev/null 2>&1
    sips -z 512 512   icon.png --out icon.iconset/icon_256x256@2x.png > /dev/null 2>&1
    sips -z 512 512   icon.png --out icon.iconset/icon_512x512.png    > /dev/null 2>&1
    sips -z 1024 1024 icon.png --out icon.iconset/icon_512x512@2x.png > /dev/null 2>&1

    # Convert to .icns
    iconutil -c icns icon.iconset -o icon.icns

    # Clean up
    rm -rf icon.iconset

    echo "✅ icon.icns generated"
else
    echo "⚠️  Skipping .icns generation (iconutil not available)"
fi

# 4. Generate .ico (Windows app icon)
echo "📦 Generating icon.ico..."
magick icon.png -define icon:auto-resize=256,128,96,64,48,32,16 icon.ico
echo "✅ icon.ico generated"

# 5. 产物自检：任何一项异常都立即失败，避免把坏图当作成功交付
PNG_SIZE="$(magick identify -format '%wx%h' icon.png)"
if [ "$PNG_SIZE" != "1024x1024" ]; then
  echo "❌ 自检失败：icon.png 尺寸为 ${PNG_SIZE}，期望 1024x1024"
  exit 1
fi
for f in icon.png icon.ico; do
  if [ ! -s "$f" ]; then
    echo "❌ 自检失败：产物缺失或为空 ${f}"
    exit 1
  fi
done
echo "✅ 自检通过：icon.png=1024x1024，icon.ico 已生成"

echo ""
echo "✅ All icons generated successfully!"
echo ""
echo "Generated files:"
echo "  - icon.png (1024x1024) - Linux & macOS Dock"
echo "  - icon.icns - macOS app icon"
echo "  - icon.ico - Windows app icon"
echo "  - profer-logos/iconTemplate.png - macOS tray (22x22 @1x)"
echo "  - profer-logos/iconTemplate@2x.png - macOS tray (44x44 @2x Retina)"
echo "  - profer-logos/iconTemplate@3x.png - macOS tray (66x66 @3x)"
