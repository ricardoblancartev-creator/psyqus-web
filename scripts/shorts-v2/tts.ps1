param(
  # Lista JSON: [{ "texto": "ruta.txt", "salida": "ruta.wav" }, ...]
  [Parameter(Mandatory = $true)][string]$ListFile,
  [string]$Voice = "Sabina",
  [double]$Rate = 1.0
)

# Genera varias voces en un solo proceso. Abrir PowerShell es lento en este
# equipo (el antivirus revisa cada script), así que se hace una vez por lote.
# Voces neuronales locales de Windows (OneCore). Si la voz pedida no está
# instalada, usa la primera voz en español disponible.
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media.SpeechSynthesis, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]

$asTask = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1'
  })[0]

function Await($op, [Type]$type) {
  $task = $asTask.MakeGenericMethod($type).Invoke($null, @($op))
  # La síntesis de Windows a veces se cuelga: no esperar más de 45 s.
  if (-not $task.Wait(45000)) { throw "La voz tardó demasiado." }
  $task.Result
}

$voces = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices
$v = $voces | Where-Object { $_.DisplayName -like "*$Voice*" } | Select-Object -First 1
if (-not $v) { $v = $voces | Where-Object { $_.Language -like "es-*" } | Select-Object -First 1 }
if (-not $v) { throw "No hay voces en español instaladas." }
"VOZ $($v.DisplayName) ($($v.Language))"

$lista = [System.IO.File]::ReadAllText($ListFile, [System.Text.Encoding]::UTF8) | ConvertFrom-Json

foreach ($item in $lista) {
  try {
    $synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
    $synth.Voice = $v
    $synth.Options.SpeakingRate = $Rate
    $text = [System.IO.File]::ReadAllText($item.texto, [System.Text.Encoding]::UTF8)
    $stream = Await ($synth.SynthesizeTextToStreamAsync($text)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
    $reader = New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
    $size = [uint32]$stream.Size
    $null = Await ($reader.LoadAsync($size)) ([uint32])
    $bytes = New-Object byte[] $size
    $reader.ReadBytes($bytes)
    [System.IO.File]::WriteAllBytes($item.salida, $bytes)
    "OK $($item.salida)"
  } catch {
    "ERROR $($item.salida) $($_.Exception.Message)"
  }
}
