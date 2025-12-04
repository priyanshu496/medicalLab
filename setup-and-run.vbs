' ============================================
' Medical Lab Management - Complete Setup & Run Script
' ============================================

Option Explicit
Dim WshShell, objFSO, strProjectPath, strLogFile
Set WshShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

' Get the directory where this script is located
strProjectPath = objFSO.GetParentFolderName(WScript.ScriptFullName)
strLogFile = strProjectPath & "\setup.log"

' Function to log messages
Sub LogMessage(message)
    Dim objFile
    Set objFile = objFSO.CreateTextFile(strLogFile, True)
    objFile.WriteLine Now & " - " & message
    objFile.Close
    WScript.Echo message
End Sub

' Check if Node.js is installed
Function CheckNodeJS()
    Dim result
    On Error Resume Next
    result = WshShell.Exec("node --version").StdOut.ReadAll()
    On Error GoTo 0
    If result <> "" Then
        CheckNodeJS = True
        LogMessage "✓ Node.js found: " & result
    Else
        CheckNodeJS = False
        LogMessage "✗ Node.js not found. Please install Node.js first."
    End If
End Function

' Check if pnpm is installed
Function CheckPNPM()
    Dim result
    On Error Resume Next
    result = WshShell.Exec("pnpm --version").StdOut.ReadAll()
    On Error GoTo 0
    If result <> "" Then
        CheckPNPM = True
        LogMessage "✓ pnpm found: " & result
    Else
        CheckPNPM = False
        LogMessage "✗ pnpm not found. Installing globally..."
        WshShell.Run "npm install -g pnpm", 1, True
    End If
End Function

' Install dependencies
Sub InstallDependencies()
    LogMessage "Installing dependencies..."
    WshShell.Run "cmd /c cd /d """ & strProjectPath & """ && pnpm install", 1, True
    LogMessage "Dependencies installation completed"
End Sub

' Build the project
Sub BuildProject()
    LogMessage "Building project..."
    WshShell.Run "cmd /c cd /d """ & strProjectPath & """ && pnpm build", 1, True
    LogMessage "Build completed"
End Sub

' Run the development server
Sub RunDevServer()
    LogMessage "Starting development server on port 3000..."
    WshShell.Run "cmd /c cd /d """ & strProjectPath & """ && pnpm dev", 0, False
End Sub

' ============================================
' Main Execution
' ============================================

LogMessage "======================================"
LogMessage "Medical Lab Management - Setup Script"
LogMessage "======================================"
LogMessage "Project Path: " & strProjectPath

' Check prerequisites
If Not CheckNodeJS() Then
    WScript.Quit 1
End If

If Not CheckPNPM() Then
    LogMessage "Installing pnpm..."
End If

' Install dependencies
InstallDependencies()

' Build project
BuildProject()

' Run development server
RunDevServer()

LogMessage "Script execution completed"
