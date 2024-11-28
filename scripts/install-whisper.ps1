# PowerShell script to install whisper.cpp
$ErrorActionPreference = "Stop"

# Create temp directory
$tempDir = Join-Path $env:TEMP "whisper-install"
New-Item -ItemType Directory -Force -Path $tempDir | Out-Null

# Clone whisper.cpp
Set-Location $tempDir
git clone https://github.com/ggerganov/whisper.cpp.git
Set-Location whisper.cpp

# Build using CMake
mkdir build
Set-Location build
cmake ..
cmake --build . --config Release

# Download the tiny model
Invoke-WebRequest -Uri "https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-tiny.en.bin" -OutFile "models/ggml-tiny.en.bin"

# Add to PATH
$installDir = Join-Path $env:USERPROFILE "whisper.cpp"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

# Copy necessary files
Copy-Item "Release/main.exe" -Destination (Join-Path $installDir "whisper-cpp.exe")
Copy-Item "../models/ggml-tiny.en.bin" -Destination $installDir

# Add to user PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$installDir", "User")
}

Write-Host "Whisper.cpp installed successfully! Please restart your terminal for PATH changes to take effect."
