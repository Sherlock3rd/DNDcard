param(
  [string]$OutputPath = "exports/relationship-network.jpg"
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$resolvedOutput = [System.IO.Path]::GetFullPath((Join-Path $projectRoot $OutputPath))
$outputDirectory = Split-Path -Parent $resolvedOutput
[System.IO.Directory]::CreateDirectory($outputDirectory) | Out-Null

$width = 1800
$height = 1100
$bitmap = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$background = [System.Drawing.Color]::FromArgb(255, 8, 8, 14)
$panel = [System.Drawing.Color]::FromArgb(255, 14, 14, 23)
$ivory = [System.Drawing.Color]::FromArgb(255, 231, 224, 207)
$muted = [System.Drawing.Color]::FromArgb(255, 167, 158, 140)
$gold = [System.Drawing.Color]::FromArgb(255, 176, 146, 82)
$violet = [System.Drawing.Color]::FromArgb(255, 119, 99, 201)
$cyan = [System.Drawing.Color]::FromArgb(255, 103, 164, 158)
$red = [System.Drawing.Color]::FromArgb(255, 173, 67, 83)
$graphics.Clear($background)

$panelBrush = New-Object System.Drawing.SolidBrush($panel)
$graphics.FillRectangle($panelBrush, 30, 30, 1740, 1040)
$borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(130, 176, 146, 82), 2)
$graphics.DrawRectangle($borderPen, 30, 30, 1739, 1039)

$fontTitle = New-Object System.Drawing.Font("Microsoft YaHei UI", 32, [System.Drawing.FontStyle]::Regular)
$fontEnglish = New-Object System.Drawing.Font("Georgia", 12, [System.Drawing.FontStyle]::Bold)
$fontSection = New-Object System.Drawing.Font("Georgia", 13, [System.Drawing.FontStyle]::Bold)
$fontName = New-Object System.Drawing.Font("Microsoft YaHei UI", 16, [System.Drawing.FontStyle]::Bold)
$fontMeta = New-Object System.Drawing.Font("Microsoft YaHei UI", 10, [System.Drawing.FontStyle]::Regular)
$fontLabel = New-Object System.Drawing.Font("Microsoft YaHei UI", 11, [System.Drawing.FontStyle]::Regular)
$fontHub = New-Object System.Drawing.Font("Microsoft YaHei UI", 18, [System.Drawing.FontStyle]::Bold)
$fontBadge = New-Object System.Drawing.Font("Microsoft YaHei UI", 9, [System.Drawing.FontStyle]::Bold)

$brushIvory = New-Object System.Drawing.SolidBrush($ivory)
$brushMuted = New-Object System.Drawing.SolidBrush($muted)
$brushGold = New-Object System.Drawing.SolidBrush($gold)
$brushViolet = New-Object System.Drawing.SolidBrush($violet)
$brushCyan = New-Object System.Drawing.SolidBrush($cyan)
$brushRed = New-Object System.Drawing.SolidBrush($red)

$graphics.DrawString("RELATIONSHIP NETWORK", $fontEnglish, $brushGold, 75, 62)
$graphics.DrawString("人物关系网", $fontTitle, $brushIvory, 70, 90)
$graphics.DrawString("人物身份、存亡状态与已知关系", $fontMeta, $brushMuted, 75, 150)
$graphics.DrawLine($borderPen, 70, 185, 1730, 185)
$graphics.DrawString("ADVENTURING PARTY", $fontSection, $brushMuted, 85, 215)
$graphics.DrawString("IRON RING VILLAGE", $fontSection, $brushMuted, 920, 215)

function New-LinePen([System.Drawing.Color]$color, [float]$width, [System.Drawing.Drawing2D.DashStyle]$dash) {
  $pen = New-Object System.Drawing.Pen($color, $width)
  $pen.DashStyle = $dash
  return $pen
}

$partyPen = New-LinePen $violet 2 ([System.Drawing.Drawing2D.DashStyle]::Dot)
$storyPen = New-LinePen $gold 2 ([System.Drawing.Drawing2D.DashStyle]::Solid)
$rescuePen = New-LinePen $cyan 3 ([System.Drawing.Drawing2D.DashStyle]::Solid)
$lossPen = New-LinePen $red 3 ([System.Drawing.Drawing2D.DashStyle]::Dash)

function Draw-CenteredText([string]$text, [System.Drawing.Font]$font, [System.Drawing.Brush]$brush, [float]$centerX, [float]$top) {
  $size = $graphics.MeasureString($text, $font)
  $graphics.DrawString($text, $font, $brush, $centerX - ($size.Width / 2), $top)
}

function Draw-LineLabel([string]$text, [float]$x, [float]$y, [System.Drawing.Brush]$brush) {
  $size = $graphics.MeasureString($text, $fontLabel)
  $back = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 14, 14, 23))
  $graphics.FillRectangle($back, $x - 7, $y - 3, $size.Width + 14, $size.Height + 6)
  $graphics.DrawString($text, $fontLabel, $brush, $x, $y)
  $back.Dispose()
}

function Draw-Avatar([string]$relativePath, [float]$centerX, [float]$centerY, [float]$diameter, [System.Drawing.Color]$ringColor) {
  $path = Join-Path $projectRoot $relativePath
  $image = [System.Drawing.Image]::FromFile($path)
  $state = $graphics.Save()
  $clip = New-Object System.Drawing.Drawing2D.GraphicsPath
  $clip.AddEllipse($centerX - $diameter / 2, $centerY - $diameter / 2, $diameter, $diameter)
  $graphics.SetClip($clip)
  $destination = [System.Drawing.Rectangle]::new(
    [int]($centerX - $diameter / 2),
    [int]($centerY - $diameter / 2),
    [int]$diameter,
    [int]$diameter
  )
  $graphics.DrawImage($image, $destination)
  $graphics.Restore($state)
  $clip.Dispose()
  $ring = New-Object System.Drawing.Pen($ringColor, 3)
  $graphics.DrawEllipse($ring, $centerX - $diameter / 2, $centerY - $diameter / 2, $diameter, $diameter)
  $ring.Dispose()
  $image.Dispose()
}

function Draw-PersonNode($node) {
  $ring = if ($node.status -eq "deceased") { $red } elseif ($node.status -eq "rescued") { $cyan } else { $violet }
  Draw-Avatar $node.image $node.x $node.y 104 $ring
  if ($node.status -eq "deceased") {
    $graphics.FillRectangle($brushRed, $node.x + 18, $node.y + 31, 62, 24)
    $graphics.DrawString("† 已故", $fontBadge, $brushIvory, $node.x + 25, $node.y + 34)
  }
  Draw-CenteredText $node.tag $fontMeta $(if ($node.status -eq "deceased") { $brushRed } elseif ($node.status -eq "rescued") { $brushCyan } else { $brushViolet }) $node.x ($node.y + 62)
  Draw-CenteredText $node.name $fontName $brushIvory $node.x ($node.y + 84)
  Draw-CenteredText $node.meta $fontMeta $brushMuted $node.x ($node.y + 115)
}

$hubX = 430
$hubY = 575
$partyNodes = @(
  @{ name="甘阿·道夫"; meta="人类 · 法师（剑咏）"; image="assets/images/gandalf-bladesinger.png"; x=430; y=320; tag="冒险团成员" },
  @{ name="赛伦"; meta="人类 · 牧师"; image="assets/images/relationship-sairen.png"; x=230; y=365; tag="冒险团成员" },
  @{ name="夏尔-金歌"; meta="人类 · 吟游诗人"; image="assets/images/relationship-shire-goldsong.png"; x=640; y=365; tag="冒险团成员" },
  @{ name="艾黎"; meta="人类 · 边境行者"; image="assets/images/relationship-aili.png"; x=145; y=590; tag="冒险团成员" },
  @{ name="费伊"; meta="变体人类-不朽者 · 魔器师"; image="assets/images/relationship-feiyi.png"; x=250; y=820; tag="冒险团成员" },
  @{ name="缪拉-青苔"; meta="半精灵 · 德鲁伊"; image="assets/images/relationship-mura-moss.png"; x=450; y=885; tag="冒险团成员" },
  @{ name="左无峰"; meta="人类 · 拳师"; image="assets/images/relationship-zuo-wufeng.png"; x=650; y=820; tag="冒险团成员" }
)

foreach ($node in $partyNodes) { $graphics.DrawLine($partyPen, $hubX, $hubY, $node.x, $node.y) }

$villageX = 1110
$villageY = 575
$chief = @{ name="艾德诺根"; meta="矮人 · 备注：村长"; image="assets/images/relationship-chief.png"; x=1010; y=325; tag="铁环村" }
$pazu = @{ name="帕祖"; meta="种族待确认 · 职业待确认"; image="assets/images/relationship-pazu.png"; x=1480; y=325; tag="已救援"; status="rescued" }
$morris = @{ name="墨里斯"; meta="矮人 · 职业待确认"; image="assets/images/relationship-morris.png"; x=1010; y=835; tag="矿坑遇难者之一"; status="deceased" }
$maruk = @{ name="马鲁克"; meta="矮人 · 职业待确认"; image="assets/images/relationship-maruk.png"; x=1480; y=835; tag="被误杀"; status="deceased" }

$graphics.DrawLine($storyPen, $hubX + 72, $hubY, $villageX - 75, $villageY)
$graphics.DrawLine($storyPen, $villageX, $villageY - 70, $chief.x, $chief.y + 65)
$graphics.DrawBezier($rescuePen, $hubX + 40, $hubY - 50, 760, 245, 1210, 225, $pazu.x - 55, $pazu.y + 35)
$graphics.DrawLine($lossPen, $hubX + 50, $hubY + 45, $maruk.x - 55, $maruk.y - 45)
$graphics.DrawLine($lossPen, $villageX, $villageY + 72, $morris.x, $morris.y - 62)

Draw-LineLabel "进入铁环村" 735 548 $brushGold
Draw-LineLabel "村长" 1040 430 $brushGold
Draw-LineLabel "被冒险团救下" 1190 235 $brushCyan
Draw-LineLabel "被误认为叛徒 · 误杀" 965 750 $brushRed
Draw-LineLabel "矿坑遇难者之一" 930 690 $brushRed

$hubPoints = [System.Drawing.PointF[]]@(
  [System.Drawing.PointF]::new([single]$hubX, [single]($hubY - 76)),
  [System.Drawing.PointF]::new([single]($hubX + 76), [single]$hubY),
  [System.Drawing.PointF]::new([single]$hubX, [single]($hubY + 76)),
  [System.Drawing.PointF]::new([single]($hubX - 76), [single]$hubY)
)
$hubBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(245, 18, 17, 29))
$graphics.FillPolygon($hubBrush, $hubPoints)
$graphics.DrawPolygon($borderPen, $hubPoints)
Draw-CenteredText "冒险团" $fontHub $brushGold $hubX ($hubY - 20)
Draw-CenteredText "七名平级成员" $fontMeta $brushMuted $hubX ($hubY + 15)

Draw-Avatar "assets/images/relationship-dwarf-village.png" $villageX $villageY 132 $gold
Draw-CenteredText "关联地点" $fontMeta $brushGold $villageX ($villageY + 78)
Draw-CenteredText "铁环村" $fontName $brushIvory $villageX ($villageY + 101)
Draw-CenteredText "矮人聚落 · 矿坑事故" $fontMeta $brushMuted $villageX ($villageY + 132)

foreach ($node in $partyNodes) { Draw-PersonNode $node }
Draw-PersonNode $chief
Draw-PersonNode $pazu
Draw-PersonNode $morris
Draw-PersonNode $maruk

$graphics.DrawString("关系类型", $fontMeta, $brushMuted, 1350, 92)
$graphics.DrawLine($partyPen, 1435, 104, 1480, 104)
$graphics.DrawString("冒险团", $fontMeta, $brushMuted, 1490, 92)
$graphics.DrawLine($storyPen, 1570, 104, 1615, 104)
$graphics.DrawString("人物关系", $fontMeta, $brushMuted, 1625, 92)

$encoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
$quality = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 94L)
$parameters = New-Object System.Drawing.Imaging.EncoderParameters(1)
$parameters.Param[0] = $quality
$bitmap.Save($resolvedOutput, $encoder, $parameters)

$parameters.Dispose()
$quality.Dispose()
$partyPen.Dispose()
$storyPen.Dispose()
$rescuePen.Dispose()
$lossPen.Dispose()
$hubBrush.Dispose()
$panelBrush.Dispose()
$borderPen.Dispose()
$brushIvory.Dispose()
$brushMuted.Dispose()
$brushGold.Dispose()
$brushViolet.Dispose()
$brushCyan.Dispose()
$brushRed.Dispose()
$fontTitle.Dispose()
$fontEnglish.Dispose()
$fontSection.Dispose()
$fontName.Dispose()
$fontMeta.Dispose()
$fontLabel.Dispose()
$fontHub.Dispose()
$fontBadge.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Get-Item -LiteralPath $resolvedOutput | Select-Object FullName, Length
