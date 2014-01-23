Function GetMovie($file){
    if ($file.BaseName -notmatch "Part [2-9]")
    {
        $url = CreateUrl($file.BaseName)
        $json = Invoke-RestMethod -uri $url -method Get
        if ($json.code -eq 404)
        {
            Write-Host "Didn't found $file"
            $newFileName = Read-Host $("What is the name of that movie? " + $file)
            if($newFileName -ne "")
            {
                $newFile = Rename-Item -Path $file -NewName $($newFileName+$file.Extension) -PassThru
                return GetMovie($newFile)
            }
        }
        else
        {
            Write-Host "Found $file"
            $json | Add-Member -MemberType NoteProperty -Name fileName -Value $file.BaseName
            if($json.actors -eq $null)
            {
                $json | Add-Member -MemberType NoteProperty -Name actors -Value @(" ")
            }

            return $json
        }
    }
}

Function GetLocalJson(){
    $data = (Get-Content Movies.html)[2] | ConvertFrom-Json
    if ($data -eq $null){
        return New-Object PSObject
    }
    else{
        return $data
    }
}


Function CreateUrl([string]$fileName){
    $movieInfo = $fileName.split(".")
    [string]$url = "http://mymovieapi.com/?title="+$movieInfo[0] -replace "[_]|[ ]|[-]","+"
	if ($movieInfo[1] -match "\d{4}"){
	    $url+="&yg=1&year="+$movieInfo[1]
	}
    return $url
}
Function GenerateJson($localJson){
    #remettre tout dans un tableau et vérifier les noms avec un hashtable
    $movies = get-childItem -recurse -include *.mp4,*.avi,*.ogg,*.mkv,*.m4v | Where { $localJson.($_.BaseName) -eq $null  } | % { GetMovie($_) }
    ForEach($movie in $movies){
        $localJson | Add-Member -MemberType NoteProperty -Name $movie.fileName -Value $movie
    }
    return $movies | ConvertTo-Json -Compress
}



Function IMDBApiIsUp(){
    [Net.HttpWebRequest] $request = [Net.WebRequest]::create("http://mymovieapi.com/")
    $request.Timeout = 10000
    $response = $request.GetResponse()
    return $response -and $response.StatusCode -eq "OK" 
}

if ($psversiontable.psversion.Major -ge 3){
    if (IMDBApiIsUp) {
        cd C:\Users\Bruno\Videos\Films
        $localJson = GetLocalJson
        "<html><head><script src='http://code.jquery.com/jquery-latest.min.js'></script><script src='movies.js'></script><script src='brunogrid.js'></script></head><body><script>" | Out-File "Movies.html"
        "var movies = " >>"Movies.html"
        GenerateJson($localJson) >> "Movies.html"
        "</script></body></html>">>"Movies.html"
    }
    else{
        "Connection with the server is impossible, please wait a couple of hours and try again"
    }
}
else{
    "You need PowerShell version 3 or greater to execute this script, you have PowerShell " + $psversiontable.psversion
}
pause
