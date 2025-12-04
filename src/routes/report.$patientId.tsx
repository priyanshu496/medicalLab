import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start'
import { AlertCircle, FileText, Home, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getPatientReport } from '@/routes/api/report';

export const Route = createFileRoute('/report/$patientId')({
  component: Report,
});

function Report() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getReportFn = useServerFn(getPatientReport);

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getReportFn({ data: { patientId: Number(patientId) } });
        setReportData(result);
      } catch (err) {
        console.error('Error loading report:', err);
        setError(err instanceof Error ? err.message : 'Failed to load report');
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      loadReport();
    }
  }, [patientId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-blue-200 rounded-lg w-3/4 mx-auto"></div>
            <p className="text-lg text-gray-600">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !reportData) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-300 bg-red-50 shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 ml-2">
              {error || 'Failed to load report'}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/' })} className="mt-6 gap-2" variant="outline">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const { patient, tests, bill } = reportData;

  // Group tests by test name
  const groupedTests = tests.reduce((acc: any, test: any) => {
    if (!acc[test.testName]) {
      acc[test.testName] = {
        testName: test.testName,
        patientTestId: test.patientTestId,
        reportImpression: test.reportImpression,
        parameters: []
      };
    }
    acc[test.testName].parameters.push(test);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8 print:p-0 print:bg-white">
      <div className="max-w-6xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 print:hidden">
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg">
            <Printer className="w-4 h-4" />
            Print Report
          </Button>
          <Button onClick={() => navigate({ to: `/bill/${patientId}` })} variant="outline" className="gap-2">
            <FileText className="w-4 h-4" />
            View Bill
          </Button>
          <Button onClick={() => navigate({ to: '/' })} variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Professional Report Card */}
        <Card className="shadow-2xl border-2 border-gray-200 print:shadow-none print:border-2">
          {/* Letterhead Header */}
          <div className="bg-white border-b-4 border-blue-600 p-8 print:p-12">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">NextGenLab</h1>
                <p className="text-gray-600">Advanced Diagnostic Center</p>
                <p className="text-sm text-gray-500 mt-2">123 Medical Plaza, Healthcare District</p>
                <p className="text-sm text-gray-500">Phone: +91-9876543210 | Email: info@nexgenlab.com</p>
                <p className="text-sm text-gray-500">NABL Accredited | ISO 9001:2015 Certified</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg mb-2">
                  <p className="text-sm font-semibold">LABORATORY REPORT</p>
                </div>
                {bill && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Report ID</p>
                    <p className="text-lg font-bold text-blue-600">{bill.invoiceNumber}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Report Date</p>
                <p className="text-sm font-semibold">
                  {new Date().toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-8 print:p-12">
            {/* Patient Information */}
            <div className="mb-8 grid grid-cols-2 gap-8 pb-6 border-b-2 border-gray-200">
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Patient Information</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p className="text-sm text-gray-600">Name:</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.patient.fullName}</p>
                  
                  <p className="text-sm text-gray-600">Patient ID:</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.patient.patientId}</p>
                  
                  <p className="text-sm text-gray-600">Age/Gender:</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {patient.patient.age || 'N/A'} / {patient.patient.gender || 'N/A'}
                  </p>
                  
                  <p className="text-sm text-gray-600">Phone:</p>
                  <p className="text-sm font-semibold text-gray-900">{patient.patient.phoneNumber}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs text-gray-500 uppercase font-semibold">Clinical Information</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p className="text-sm text-gray-600">Referred By:</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {patient.doctor?.name || 'Self'}
                  </p>
                  
                  {patient.doctor?.specialization && (
                    <>
                      <p className="text-sm text-gray-600">Specialization:</p>
                      <p className="text-sm text-gray-900">{patient.doctor.specialization}</p>
                    </>
                  )}
                  
                  <p className="text-sm text-gray-600">Collection Date:</p>
                  <p className="text-sm text-gray-900">
                    {new Date().toLocaleDateString('en-IN')}
                  </p>
                  
                  <p className="text-sm text-gray-600">Reporting Date:</p>
                  <p className="text-sm text-gray-900">
                    {new Date().toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="space-y-6">
              {Object.values(groupedTests).map((testGroup: any) => (
                <div key={testGroup.patientTestId} className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b-2 border-gray-200">
                    <h3 className="text-lg font-bold text-gray-900">{testGroup.testName}</h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                          <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Test Parameter</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Result</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Unit</th>
                          <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Reference Range</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testGroup.parameters.map((param: any, idx: number) => {
                          const resultValue = param.resultValue ? Number(param.resultValue) : null;
                          const normalRange = param.normalRange?.split('-').map((v: string) => Number(v.trim()));
                          let isAbnormal = false;
                          
                          if (resultValue !== null && normalRange && normalRange.length === 2) {
                            isAbnormal = resultValue < normalRange[0] || resultValue > normalRange[1];
                          }

                          return (
                            <tr key={param.parameterId} className={`border-b border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                              <td className="px-6 py-3 font-medium text-gray-900">{param.parameterName}</td>
                              <td className={`px-6 py-3 text-center font-bold ${isAbnormal ? 'text-red-600' : 'text-blue-600'}`}>
                                {param.resultValue || '-'}
                                {isAbnormal && <span className="ml-2 text-xs">⚠</span>}
                              </td>
                              <td className="px-6 py-3 text-center text-gray-700">{param.unit || '-'}</td>
                              <td className="px-6 py-3 text-center text-gray-700">{param.normalRange || '-'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Report Impression */}
                  {testGroup.reportImpression && (
                    <div className="bg-blue-50 border-t-2 border-blue-200 px-6 py-4">
                      <p className="text-xs text-blue-700 uppercase font-semibold mb-2">Impression / Remarks:</p>
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">{testGroup.reportImpression}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Notes */}
            <div className="mt-12 pt-6 border-t-2 border-gray-200 space-y-4">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-xs font-semibold text-yellow-800 mb-1">Important Notes:</p>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• This report is valid only with authorized signature and stamp</li>
                  <li>• Results are based on the sample received and testing methodology used</li>
                  <li>• Abnormal values are marked with ⚠ symbol</li>
                  <li>• Please correlate clinically and consult your physician for interpretation</li>
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Lab Technician</p>
                  <div className="mt-8 pt-2 border-t border-gray-400 w-48">
                    <p className="text-xs text-gray-600">Signature & Date</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Medical Director</p>
                  <div className="mt-8 pt-2 border-t border-gray-400 inline-block w-48">
                    <p className="text-xs text-gray-600">Signature & Stamp</p>
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p className="font-semibold">*** End of Report ***</p>
                <p className="mt-2">This is a computer-generated report | NextGenLab - Excellence in Diagnostics</p>
                <p className="mt-1">For report verification, visit: www.nexgenlab.com/verify</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}