[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$ErrorActionPreference = "Stop"

$workDir = $PSScriptRoot
if (-not $workDir) { $workDir = (Get-Item .).FullName }

$destIco = Join-Path $workDir "icon.ico"
$destPng = Join-Path $workDir "public\icon.png"
$batPath = Join-Path $workDir "start_dashboard.bat"

Write-Host "Working directory: $workDir"

# Create Shortcuts on Desktop and Project Folder
$WScriptShell = New-Object -ComObject WScript.Shell
$desktopPath = [System.Environment]::GetFolderPath('Desktop')

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
    if (Test-Path $destIco) {
        $shortcut.IconLocation = "$destIco,0"
    }
    $shortcut.Description = "Bot Manager Dashboard - Launchpad"
    $shortcut.Save()
    Write-Host "Created shortcut: $path"
}

# 2. Silent VBS Launcher (no black cmd window)
$vbsPath = Join-Path $workDir "start_hidden.vbs"
$vbsContent = "Set WshShell = CreateObject(""WScript.Shell"")" + "`r`n" + "Set fso = CreateObject(""Scripting.FileSystemObject"")" + "`r`n" + "scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)" + "`r`n" + "WshShell.Run ""cmd.exe /c """""" & scriptDir & ""\start_dashboard.bat"""""", 0, False"
[System.IO.File]::WriteAllText($vbsPath, $vbsContent)

$silentDesktop2 = Join-Path $desktopPath "Bot Launchpad (Silent Mode).lnk"
$silentWorkDir2 = Join-Path $workDir "Bot Launchpad (Silent Mode).lnk"

foreach ($path in @($silentDesktop2, $silentWorkDir2)) {
    $shortcut = $WScriptShell.CreateShortcut($path)
    $shortcut.TargetPath = "C:\Windows\System32\wscript.exe"
    $shortcut.Arguments = "`"$vbsPath`""
    $shortcut.WorkingDirectory = $workDir
    if (Test-Path $destIco) {
        $shortcut.IconLocation = "$destIco,0"
    }
    $shortcut.Description = "Bot Manager Dashboard - Silent Launch"
    $shortcut.Save()
    Write-Host "Created silent shortcut: $path"
}
