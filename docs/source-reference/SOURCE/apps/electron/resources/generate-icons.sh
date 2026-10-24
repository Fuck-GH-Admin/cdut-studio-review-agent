#!/bin/bash

# CDUT Studio Icon Generation Script
# Generates all required icon formats from CDUT_Studio.svg
# Requires: ImageMagick(magick)；rsvg-convert 可选（缺失时回退 magick 渲染 SVG）；iconutil 仅 macOS

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 应用图标与托盘图标统一图源
APP_SVG="CDUT_Studio.svg"
TRAY_SVG="CDUT_Studio.svg"

echo "🎨 Generating CDUT Studio icons..."

# Check required tools
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick (magick) not found. Install with: brew install imagemagick"
    exit 1
fi

if ! command -v iconutil &> /dev/null; then
    echo "⚠️  iconutil not found (macOS only). Skipping .icns generation"
fi

# SVG → PNG 等比栅格化：优先 rsvg-convert，缺失时回退 ImageMagick(librsvg 委托)
# $1=长边像素 $2=源 SVG $3=输出 PNG
render_svg() {
    if command -v rsvg-convert &> /dev/null; then
        rsvg-convert -w "$1" "$2" -o "$3"
    else
        magick -background none "$2" -resize "${1}x${1}" "$3"
    fi
}

# 生成正方形托盘图标（等比缩放后居中补透明边）
# $1=尺寸 $2=输出 $3=是否单色(1/0)
render_tray() {
    render_svg "$1" "$TRAY_SVG" "$2"
    if [ "$3" = "1" ]; then
        # 单色剪影：仅改 RGB 通道、保留 alpha，供 macOS Template 自动着色
        magick "$2" -channel RGB -fill black -colorize 100 +channel \
            -background none -gravity center -extent "${1}x${1}" "$2"
    else
        magick "$2" -background none -gravity center -extent "${1}x${1}" "$2"
    fi
}

# 1. Generate icon.png (1024x1024) from SVG
# 兼容性优先：只指定 -w，rsvg-convert 会按原始比例自动推算高度（只给单个尺寸时始终保比例，
# 无需 rsvg-convert 2.46+ 才有的 --keep-aspect-ratio）；再用 ImageMagick 居中补透明边成
# 正方形，既不变形，也保证下游 sips/magick 处理时统一为 1024x1024。
echo "📦 Generating icon.png (1024x1024)..."
render_svg 1024 "$APP_SVG" icon.png
magick icon.png -background none -gravity center -extent 1024x1024 icon.png

# 2. Generate menubar/tray icons (multi-resolution for Retina displays)
echo "📦 Generating tray icons..."

# macOS 托盘图标规范：
# - 标准尺寸: 22x22pt（点）
# - @2x Retina: 44x44px
# - @3x 高分辨率: 66x66px
# macOS：由彩色 logo 派生为单色剪影，命名 "Template" 让系统自动适配深色/浅色菜单栏
# 其他平台（Windows/Linux）：使用彩色版本
render_tray 22 tray-icons/iconTemplate.png 1
render_tray 44 "tray-icons/iconTemplate@2x.png" 1
render_tray 66 "tray-icons/iconTemplate@3x.png" 1
render_tray 22 tray-icons/iconTray.png 0
render_tray 44 "tray-icons/iconTray@2x.png" 0
render_tray 66 "tray-icons/iconTray@3x.png" 0

echo "✅ Tray icons generated:"
echo "   - tray-icons/iconTemplate.png/@2x/@3x (macOS 单色 Template)"
echo "   - tray-icons/iconTray.png/@2x/@3x (其他平台彩色)"

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
echo "  - tray-icons/iconTemplate.png/@2x/@3x - macOS tray (mono template)"
echo "  - tray-icons/iconTray.png/@2x/@3x - Windows/Linux tray (color)"
