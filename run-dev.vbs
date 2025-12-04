' ============================================
' Medical Lab Management - Quick Run Script
' ============================================

Option Explicit
Dim WshShell, objFSO, strProjectPath

Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strProjectPath = objFSO.GetParentFolderName(WScript.ScriptFullName)

' Run the development server
WshShell.Run "cmd /c cd /d """ & strProjectPath & """ && pnpm dev", 0, False
