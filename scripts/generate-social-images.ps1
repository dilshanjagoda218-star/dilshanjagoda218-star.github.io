# Generates the Open Graph card and install icons from public/logo.png.
# Requires Windows PowerShell with System.Drawing (built into Windows).
# Usage: powershell -ExecutionPolicy Bypass -File scripts/generate-social-images.ps1

Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$public = Join-Path $root 'public'
$logoPath = Join-Path $public 'logo.png'
$logo = [System.Drawing.Image]::FromFile($logoPath)

function New-Canvas([int]$width, [int]$height, [string]$hex) {
  $bmp = New-Object System.Drawing.Bitmap($width, $height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml($hex))
  return @($bmp, $g)
}

function Draw-Logo($g, [int]$x, [int]$y, [int]$maxW, [int]$maxH) {
  $scale = [Math]::Min($maxW / $logo.Width, $maxH / $logo.Height)
  $w = [int]($logo.Width * $scale)
  $h = [int]($logo.Height * $scale)
  $g.DrawImage($logo, $x + [int](($maxW - $w) / 2), $y + [int](($maxH - $h) / 2), $w, $h)
}

function Draw-RoundedRect($g, [int]$x, [int]$y, [int]$w, [int]$h, [int]$r, [string]$fill, [string]$stroke) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $r * 2
  $path.AddArc($x, $y, $d, $d, 180, 90)
  $path.AddArc($x + $w - $d, $y, $d, $d, 270, 90)
  $path.AddArc($x + $w - $d, $y + $h - $d, $d, $d, 0, 90)
  $path.AddArc($x, $y + $h - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($fill))
  $g.FillPath($brush, $path)
  if ($stroke) {
    $pen = New-Object System.Drawing.Pen([System.Drawing.ColorTranslator]::FromHtml($stroke), 1.5)
    $g.DrawPath($pen, $path)
    $pen.Dispose()
  }
  $brush.Dispose()
  $path.Dispose()
}

# ---------- Open Graph card: 1200x630 ----------
$og = New-Canvas 1200 630 '#F0F0F0'
$bmp = $og[0]
$g = $og[1]

# Decorative accent blocks
$gold = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#FBBF24'))
$g.FillRectangle($gold, 0, 0, 14, 630)
$g.FillRectangle($gold, 72, 560, 96, 8)

# Logo panel
Draw-RoundedRect $g 820 140 320 350 24 '#FFFFFF' $null
Draw-Logo $g 850 175 260 280

# Kicker pill
Draw-RoundedRect $g 72 64 330 44 22 '#FFFFFF' '#DDDDDD'
$kickerFont = New-Object System.Drawing.Font('Segoe UI Semibold', 13)
$kickerBrush = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#444444'))
$g.DrawString('SRI LANKAN FUNK · POP · RAP', $kickerFont, $kickerBrush, 94, 77)
$kickerFont.Dispose()
$kickerBrush.Dispose()

# Wordmark
$display = New-Object System.Drawing.Font('Arial Black', 92, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$ink = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#111111'))
$g.DrawString('FUNKY', $display, $ink, 66, 138)
$g.DrawString('DIRT', $display, $ink, 66, 246)
$display.Dispose()

# Supporting copy
$sub = New-Object System.Drawing.Font('Segoe UI', 26, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$muted = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml('#555555'))
$g.DrawString('Colombo, Sri Lanka  ·  Est. 2007', $sub, $muted, 72, 376)

$song = New-Object System.Drawing.Font('Segoe UI', 20, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('Sereppuwa  ·  Ada Ape Thaththa  ·  Hollala', $song, $muted, 72, 424)

$url = New-Object System.Drawing.Font('Segoe UI Semibold', 22, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$g.DrawString('funkydirtmusic.com', $url, $ink, 72, 486)

$sub.Dispose(); $song.Dispose(); $url.Dispose(); $muted.Dispose(); $ink.Dispose(); $gold.Dispose()
$g.Dispose()
$bmp.Save((Join-Path $public 'og-image.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# ---------- Square install icons ----------
function Save-Icon([int]$size, [int]$logoMax, [string]$name, [string]$bg) {
  $canvas = New-Canvas $size $size $bg
  $b = $canvas[0]
  $graphics = $canvas[1]
  $pad = [int](($size - $logoMax) / 2)
  Draw-Logo $graphics $pad $pad $logoMax $logoMax
  $graphics.Dispose()
  $b.Save((Join-Path $public $name), [System.Drawing.Imaging.ImageFormat]::Png)
  $b.Dispose()
}

Save-Icon 512 440 'icon-512.png' '#FFFFFF'
Save-Icon 192 168 'icon-192.png' '#FFFFFF'
Save-Icon 180 158 'apple-touch-icon.png' '#FFFFFF'
Save-Icon 512 300 'maskable-512.png' '#F0F0F0'

$logo.Dispose()
Write-Host 'Generated public/og-image.png, icon-512.png, icon-192.png, apple-touch-icon.png and maskable-512.png'
