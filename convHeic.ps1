$sourceFolder = "data/img/heic"
$destinationFolder = "data/img"

mkdir $destinationFolder -Force

$files = Get-ChildItem -Path $sourceFolder -Filter *.heic

foreach ($file in $files) {
    $outputFile = Join-Path -Path $destinationFolder -ChildPath ($file.BaseName + ".jpg")
    magick $file.FullName $outputFile
}
cd $destinationFolder
ls -Name 