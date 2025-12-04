import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, Calendar, CheckCircle2, Download, FileSpreadsheet, Home, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  cleanupOldExports, 
  deleteExportedFile,
  downloadExportedFile,
  exportLabReportToExcel,
  exportPatientsToExcel,
  exportTestsToExcel,
  listExportedFiles
} from '@/routes/api/export';

export const Route = createFileRoute('/exports')({
  component: ExportsPage,
});

function ExportsPage() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportPatientsFn = useServerFn(exportPatientsToExcel);
  const exportTestsFn = useServerFn(exportTestsToExcel);
  const exportLabReportFn = useServerFn(exportLabReportToExcel);
  const listFilesFn = useServerFn(listExportedFiles);
  const downloadFileFn = useServerFn(downloadExportedFile);
  const cleanupFn = useServerFn(cleanupOldExports);
  const deleteFileFn = useServerFn(deleteExportedFile);

  const loadFiles = useCallback(async () => {
    try {
      setLoading(true);
      const result = await listFilesFn();
      setFiles(result.files || []);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load exported files');
    } finally {
      setLoading(false);
    }
  }, [listFilesFn]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleExport = async (type: 'patients' | 'tests' | 'complete') => {
    try {
      setExporting(type);
      setError(null);
      setSuccess(null);

      let result;
      switch (type) {
        case 'patients':
          result = await exportPatientsFn();
          break;
        case 'tests':
          result = await exportTestsFn();
          break;
        case 'complete':
          result = await exportLabReportFn();
          break;
      }

      setSuccess(result.message);
      await loadFiles();
      
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Export error:', err);
      setError(err instanceof Error ? err.message : 'Failed to export');
    } finally {
      setExporting(null);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const result = await downloadFileFn({ data: { filename } });
      
      const byteCharacters = atob(result.data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: result.mimeType });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      setSuccess(`Downloaded ${filename} successfully`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete ${filename}?`)) return;

    try {
      await deleteFileFn({ data: { filename } });
      setSuccess(`Deleted ${filename} successfully`);
      await loadFiles();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete file');
    }
  };

  const handleCleanup = async () => {
    if (!confirm('Delete all files older than 7 days?')) return;

    try {
      const result = await cleanupFn({ data: { daysOld: 7 } });
      setSuccess(result.message);
      await loadFiles();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      console.error('Cleanup error:', err);
      setError('Failed to cleanup old files');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <FileSpreadsheet className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Export Manager</h1>
              <p className="text-gray-600">Export and manage lab data in Excel format</p>
            </div>
          </div>
          <Button 
            onClick={() => navigate({ to: '/' })} 
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Alerts */}
        {success && (
          <Alert className="mb-6 border-green-300 bg-green-50 shadow-md">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <AlertDescription className="text-green-800 ml-2">{success}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-300 bg-red-50 shadow-md">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
          </Alert>
        )}

        {/* Export Actions */}
        <Card className="shadow-xl border-0 mb-8">
          <CardHeader className="bg-linear-to-r from-blue-600 to-cyan-500 text-white">
            <CardTitle className="text-2xl">Generate New Export</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => handleExport('patients')}
                disabled={!!exporting}
                className="h-auto py-6 flex-col gap-2 bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {exporting === 'patients' ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-8 h-8" />
                    <span className="font-semibold">Export Patients</span>
                    <span className="text-xs opacity-90">All patient records</span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleExport('tests')}
                disabled={!!exporting}
                className="h-auto py-6 flex-col gap-2 bg-linear-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              >
                {exporting === 'tests' ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-8 h-8" />
                    <span className="font-semibold">Export Tests</span>
                    <span className="text-xs opacity-90">All test definitions</span>
                  </>
                )}
              </Button>

              <Button
                onClick={() => handleExport('complete')}
                disabled={!!exporting}
                className="h-auto py-6 flex-col gap-2 bg-linear-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
              >
                {exporting === 'complete' ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <FileSpreadsheet className="w-8 h-8" />
                    <span className="font-semibold">Complete Report</span>
                    <span className="text-xs opacity-90">All lab data (7 sheets)</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exported Files List */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-linear-to-r from-gray-700 to-gray-800 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl">Exported Files ({files.length})</CardTitle>
              {files.length > 0 && (
                <Button
                  onClick={handleCleanup}
                  variant="outline"
                  size="sm"
                  className="gap-2 text-black mt-2"
                >
                  <Calendar className="w-4 h-4" />
                  Cleanup Old Files (7+ days)
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading files...</p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12">
                <FileSpreadsheet className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No exported files yet</p>
                <p className="text-gray-500 text-sm mt-2">Generate your first export using the buttons above</p>
              </div>
            ) : (
              <div className="space-y-3">
                {files.map((file) => (
                  <div
                    key={file.filename}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileSpreadsheet className="w-7 h-7 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{file.filename}</p>
                        <p className="text-sm text-gray-600">
                          {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleDownload(file.filename)}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                        size="sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </Button>
                      <Button
                        onClick={() => handleDelete(file.filename)}
                        variant="outline"
                        size="sm"
                        className="gap-2 border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Exported Excel files are automatically saved in the 'exports' folder. 
            Files older than 7 days can be cleaned up using the cleanup button. All exports include complete data 
            with proper formatting and column widths for easy viewing.
          </p>
        </div>
      </div>
    </div>
  );
}