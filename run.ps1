param(
    [ValidateSet('dev', 'build', 'preview', 'typecheck', 'lint', 'test', 'test:watch', 'test:e2e', 'validate:content')]
    [string]$Task = 'dev'
)

$ErrorActionPreference = 'Stop'
$gameDirectory = Join-Path $PSScriptRoot 'game'
$systemNode = Get-Command node.exe -ErrorAction SilentlyContinue
$systemNpm = Get-Command npm.cmd -ErrorAction SilentlyContinue

if ($systemNode -and $systemNpm) {
    $npmExecutable = $systemNpm.Source
} else {
    $toolsDirectory = Join-Path $PSScriptRoot '.tools'
    $portableNode = Get-ChildItem -LiteralPath $toolsDirectory -Filter node.exe -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object { Test-Path -LiteralPath (Join-Path $_.DirectoryName 'npm.cmd') } |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1

    if (-not $portableNode) {
        throw 'Can Node.js 24 tro len. Cai Node.js hoac chuan bi ban portable trong .tools/.'
    }

    $env:PATH = $portableNode.DirectoryName + [System.IO.Path]::PathSeparator + $env:PATH
    $npmExecutable = Join-Path $portableNode.DirectoryName 'npm.cmd'
}

Push-Location -LiteralPath $gameDirectory
try {
    if (-not (Test-Path -LiteralPath (Join-Path $gameDirectory 'node_modules'))) {
        & $npmExecutable ci --no-audit --no-fund
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }

    & $npmExecutable run $Task
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
