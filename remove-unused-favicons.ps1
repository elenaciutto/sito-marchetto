<#
  remove-unused-favicons.ps1
  - Cerca i file favicon di prova e li sposta in una cartella di backup
  - Mostra i file trovati e richiede conferma 'yes' per procedere
  Uso: esegui in PowerShell dalla cartella del progetto:
    powershell -ExecutionPolicy Bypass -File .\remove-unused-favicons.ps1
#>

$targets = @('.tmp_favicon.ico', '.avicon.ico', 'img\favicon.ico')
$found = @()

foreach ($t in $targets) {
  if (Test-Path $t) { $found += $t }
}

if ($found.Count -eq 0) {
  Write-Host "Nessun file di favicon di prova trovato. Nessuna azione eseguita." -ForegroundColor Yellow
  exit 0
}

Write-Host "Trovati i seguenti file da rimuovere (verranno spostati in backup):" -ForegroundColor Cyan
$found | ForEach-Object { Write-Host " - $_" }

$confirm = Read-Host "Digita 'yes' per confermare lo spostamento in ./deleted_favicons_backup"
if ($confirm -ne 'yes') {
  Write-Host "Operazione annullata dall'utente." -ForegroundColor Yellow
  exit 0
}

$backupDir = Join-Path (Get-Location) 'deleted_favicons_backup'
if (-not (Test-Path $backupDir)) { New-Item -ItemType Directory -Path $backupDir | Out-Null }

foreach ($f in $found) {
  try {
    $dest = Join-Path $backupDir (Split-Path $f -Leaf)
    Move-Item -Path $f -Destination $dest -Force
    Write-Host "Spostato: $f -> $dest" -ForegroundColor Green
  } catch {
    Write-Host "Errore spostando $f : $_" -ForegroundColor Red
  }
}

Write-Host "Operazione completata. I file sono stati spostati in deleted_favicons_backup." -ForegroundColor Green
