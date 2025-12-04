Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d E:\globizhub projects\medical-lab-management && node .output/server/index.mjs", 0, False