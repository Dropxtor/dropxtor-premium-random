Param(
  [Parameter(Mandatory=$false)]
  [string]$Repo = "",

  [Parameter(Mandatory=$false)]
  [ValidateSet("public","private")]
  [string]$Visibility = "private",

  [Parameter(Mandatory=$false)]
  [string]$CommitMessage = "Initial commit"
)

$ErrorActionPreference = "Stop"

function Has-Cmd($name) {
  return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

if (-not (Has-Cmd git)) {
  throw "git is not installed or not in PATH"
}

if ([string]::IsNullOrWhiteSpace($Repo)) {
  $Repo = Read-Host "GitHub repo (format: username/repo)"
}
if ([string]::IsNullOrWhiteSpace($Repo) -or ($Repo -notmatch "^[^/]+/[^/]+$")) {
  throw "Repo must look like username/repo"
}

$remoteUrl = "https://github.com/$Repo.git"

Write-Host "[cwd]" (Get-Location)

# Init git repo if missing
if (-not (Test-Path .git)) {
  Write-Host "[git] init"
  git init
}

# Ensure main branch
try {
  $branch = (git rev-parse --abbrev-ref HEAD)
} catch {
  $branch = ""
}

if ($branch -eq "HEAD" -or [string]::IsNullOrWhiteSpace($branch)) {
  # fresh repo
  git checkout -b main | Out-Host
} elseif ($branch -ne "main") {
  Write-Host "[git] switching to main (current=$branch)"
  git branch -M main
}

# Add files
Write-Host "[git] add -A"
git add -A

# Commit (skip if nothing to commit)
$porcelain = (git status --porcelain=v1)
if (-not [string]::IsNullOrWhiteSpace($porcelain)) {
  Write-Host "[git] commit"
  git commit -m $CommitMessage
} else {
  Write-Host "[git] nothing to commit"
}

# Configure remote
$hasOrigin = $false
try {
  $remotes = git remote
  $hasOrigin = $remotes -match "origin"
} catch {
  $hasOrigin = $false
}

if (-not $hasOrigin) {
  Write-Host "[git] remote add origin $remoteUrl"
  git remote add origin $remoteUrl
} else {
  Write-Host "[git] remote origin already exists"
  git remote -v | Out-Host
}

# If gh CLI available, try creating repo (idempotent-ish)
if (Has-Cmd gh) {
  Write-Host "[gh] detected — attempting repo create (may fail if already exists)"
  try {
    gh repo create $Repo --$Visibility --source . --remote origin --push
    Write-Host "[gh] done"
    exit 0
  } catch {
    Write-Host "[gh] repo create failed (maybe already exists). Will try git push..."
  }
}

Write-Host "[git] push -u origin main"
git push -u origin main

Write-Host "[done]"
