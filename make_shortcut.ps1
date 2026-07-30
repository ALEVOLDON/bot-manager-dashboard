[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$srcJpg = "C:\Users\alevo\.gemini\antigravity\brain\dd6e8596-6aa2-4f83-8376-979691faccd6\bot_launchpad_icon_1785407082006.jpg"
$destIco = "c:\Users\alevo\Desktop\bot-manager-dashboard\icon.ico"
$destPng = "c:\Users\alevo\Desktop\bot-manager-dashboard\public\icon.png"

# Save PNG for web app / Favicon
$bmp = [System.Drawing.Bitmap]::FromFile($srcJpg)
$bmp.Save($destPng, [System.Drawing.Imaging.ImageFormat]::Png)

# Save ICO file for Windows shortcut
$resized = New-Object System.Drawing.Bitmap($bmp, 256, 256)
$hIcon = $resized.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)

$fs = New-Object System.IO.FileStream($destIco, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()

$resized.Dispose()
$bmp.Dispose()

Write-Host "Icon created successfully at: $destIco"

# Create Shortcut on Desktop and Project Folder
$WScriptShell = New-Object -ComObject WScript.Shell
$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$batPath = "c:\Users\alevo\Desktop\bot-manager-dashboard\start_dashboard.bat"
$workDir = "c:\Users\alevo\Desktop\bot-manager-dashboard"

# Clean old shortcuts
Get-ChildItem -Path $desktopPath -Filter "*Bot Launchpad*" | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem -Path $workDir -Filter "*.lnk" | Remove-Item -Force -ErrorAction SilentlyContinue

# 1. Main Direct Shortcut (cmd.exe target - ready to pin to Taskbar)
$shortcutDesktop1 = Join-Path $desktopPath "Bot Launchpad.lnk"
$shortcutWorkDir1 = Join-Path $workDir "Bot Launchpad.lnk"

foreach ($path in @($shortcutDesktop1, $shortcutWorkDir1)) {
    $shortcut = $WScriptShell.CreateShortcut($path)
    $shortcut.TargetPath = "C:\Windows\System32\cmd.exe"
    $shortcut.Arguments = "/c `"$batPath`""
    $shortcut.WorkingDirectory = $workDir
    $shortcut.IconLocation = "$destIco,0"
    $shortcut.Description = "Bot Manager Dashboard - Launchpad"
    $shortcut.Save()
    Write-Host "Created shortcut: $path"
}

# 2. Silent VBS Launcher (no black cmd window)
$vbsPath = Join-Path $workDir "start_hidden.vbs"
$vbsContent = "Set WshShell = CreateObject(""WScript.Shell"")" + "`r`n" + "WshShell.Run ""cmd.exe /c """"$batPath"""""", 0, False"
[System.IO.File]::WriteAllText($vbsPath, $vbsContent)

$silentDesktop2 = Join-Path $desktopPath "Bot Launchpad (Silent Mode).lnk"
$silentWorkDir2 = Join-Path $workDir "Bot Launchpad (Silent Mode).lnk"

foreach ($path in @($silentDesktop2, $silentWorkDir2)) {
    $shortcut = $WScriptShell.CreateShortcut($path)
    $shortcut.TargetPath = "C:\Windows\System32\wscript.exe"
    $shortcut.Arguments = "`"$vbsPath`""
    $shortcut.WorkingDirectory = $workDir
    $shortcut.IconLocation = "$destIco,0"
    $shortcut.Description = "Bot Manager Dashboard - Silent Launch"
    $shortcut.Save()
    Write-Host "Created silent shortcut: $path"
}
