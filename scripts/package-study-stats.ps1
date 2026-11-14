$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$packageRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$skillRoot = Join-Path $packageRoot 'skills\study-stats'
$outputFolder = Join-Path $packageRoot 'downloads'
$outputPath = Join-Path $outputFolder 'study-stats.zip'
New-Item -ItemType Directory -Path $outputFolder -Force | Out-Null
$files = @([pscustomobject]@{Source=(Join-Path $packageRoot 'START-STUDY-STATS.md'); Relative='START-STUDY-STATS.md'})
foreach ($file in Get-ChildItem -LiteralPath $skillRoot -Recurse -File) {
    $relative = $file.FullName.Substring($skillRoot.Length + 1).Replace('\', '/')
    $files += [pscustomobject]@{Source=$file.FullName; Relative=('.agents/skills/study-stats/' + $relative)}
}
$stream = [System.IO.File]::Open($outputPath, [System.IO.FileMode]::Create)
try {
    $archive = [System.IO.Compression.ZipArchive]::new($stream, [System.IO.Compression.ZipArchiveMode]::Create, $true)
    try {
        foreach ($file in ($files | Sort-Object Relative)) {
            $entry = $archive.CreateEntry($file.Relative, [System.IO.Compression.CompressionLevel]::Optimal)
            $entry.LastWriteTime = [System.DateTimeOffset]::new(2000, 1, 1, 0, 0, 0, [System.TimeSpan]::Zero)
            $inputStream = [System.IO.File]::OpenRead($file.Source)
            $entryStream = $entry.Open()
            try { $inputStream.CopyTo($entryStream) }
            finally { $entryStream.Dispose(); $inputStream.Dispose() }
        }
    } finally { $archive.Dispose() }
} finally { $stream.Dispose() }
Write-Output ('Packaged {0} files: {1}' -f $files.Count, $outputPath)
