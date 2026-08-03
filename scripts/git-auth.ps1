# ============================================================
# git-auth.ps1: carrega o .env e autentica o Git nesta sessão.
#
# Uso (na raiz do projeto):
#   . .\scripts\git-auth.ps1
#
# Repare no ponto e no espaço no início: é dot-sourcing. Sem ele
# as variáveis morrem junto com o processo do script e o push
# continua pedindo senha.
#
# O token fica só na memória desta sessão do PowerShell. Nada é
# gravado no .git/config, e por isso ele não vaza num `git remote -v`
# nem para quem clonar o repositório.
# ============================================================

$ErrorActionPreference = 'Stop'
$raiz = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $raiz '.env'

if (-not (Test-Path $envPath)) {
    Write-Host "Nao encontrei o .env em $raiz" -ForegroundColor Red
    Write-Host "Rode:  Copy-Item .env.example .env   e preencha o token." -ForegroundColor Yellow
    return
}

# Le o .env linha a linha. Ignora comentario e linha vazia.
Get-Content $envPath -Encoding utf8 | ForEach-Object {
    $linha = $_.Trim()
    if ($linha -eq '' -or $linha.StartsWith('#')) { return }
    if ($linha -match '^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$') {
        $nome = $Matches[1]
        $valor = $Matches[2].Trim().Trim('"').Trim("'")
        if ($valor -ne '') { Set-Item -Path "env:$nome" -Value $valor }
    }
}

if (-not $env:GITHUB_TOKEN) {
    Write-Host 'GITHUB_TOKEN esta vazio no .env. Preencha e rode de novo.' -ForegroundColor Red
    return
}

# O gh CLI le o GH_TOKEN. E o `gh auth setup-git` registra o gh como
# credential helper do git, entao o push usa o mesmo token sem
# guardar nada em disco.
$env:GH_TOKEN = $env:GITHUB_TOKEN

# Aceita tanto `GITHUB_REPO=nome-do-repo` quanto a URL de clone inteira
# colada do GitHub. Com a URL, deriva dono e nome e monta o remote.
if ($env:GITHUB_REPO -match '^(https?://|git@)') {
    $env:GITHUB_REMOTE_URL = $env:GITHUB_REPO
    $slug = $env:GITHUB_REPO -replace '^.*github\.com[:/]', '' -replace '\.git$', ''
    $env:GITHUB_OWNER = $slug.Split('/')[0]
    $env:GITHUB_REPO = $slug.Split('/')[-1]
} elseif ($env:GITHUB_OWNER -and $env:GITHUB_REPO) {
    $env:GITHUB_REMOTE_URL = "https://github.com/$($env:GITHUB_OWNER)/$($env:GITHUB_REPO).git"
}
if ($env:GITHUB_OWNER) {
    Write-Host "Repositorio: $($env:GITHUB_OWNER)/$($env:GITHUB_REPO)" -ForegroundColor DarkGray
}

if (Test-Path (Join-Path $raiz '.git')) {
    Push-Location $raiz
    try {
        if ($env:GIT_AUTHOR_NAME) { git config --local user.name $env:GIT_AUTHOR_NAME }
        if ($env:GIT_AUTHOR_EMAIL) { git config --local user.email $env:GIT_AUTHOR_EMAIL }
        $nome = git config --local user.name
        $mail = git config --local user.email
        if ($nome) { Write-Host "Autoria deste repo: $nome <$mail>" -ForegroundColor DarkGray }
    } finally { Pop-Location }
}

$mascarado = if ($env:GITHUB_TOKEN.Length -gt 8) {
    $env:GITHUB_TOKEN.Substring(0, 4) + ('*' * 8) + $env:GITHUB_TOKEN.Substring($env:GITHUB_TOKEN.Length - 4)
} else { '****' }

Write-Host "Token carregado nesta sessao ($mascarado)." -ForegroundColor Green
Write-Host 'Confira com:  gh auth status' -ForegroundColor DarkGray
