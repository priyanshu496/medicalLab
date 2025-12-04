import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, CheckCircle2, FileText, Home, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getPatientTests } from '@/routes/api/patient-tests';
import { getPatientReport } from '@/routes/api/report';
import { submitTestResults } from '@/routes/api/test-results';

export const Route = createFileRoute('/test-entry/$patientId')({
  component: TestEntry,
});

function TestEntry() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState<Record<string, string>>({});
  const [impressions, setImpressions] = useState<Record<number, string>>({});
  const [patientTests, setPatientTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);

  const getPatientTestsFn = useServerFn(getPatientTests);
  const getReportFn = useServerFn(getPatientReport);
  const submitResultsFn = useServerFn(submitTestResults);

  useEffect(() => {
    const checkPayment = async () => {
      try {
        setCheckingPayment(true);
        const result = await getReportFn({ data: { patientId: Number(patientId) } });
        
        if (!result.bill) {
          setError('No bill found. Please complete billing first.');
          setCheckingPayment(false);
          return;
        }

        if (!result.bill.isPaid) {
          setError('Payment not completed. Please complete payment before test entry.');
          setPaymentStatus(result.bill);
          setCheckingPayment(false);
          return;
        }

        setPaymentStatus(result.bill);
        setCheckingPayment(false);
      } catch (err) {
        console.error('Error checking payment:', err);
        setError('Failed to verify payment status');
        setCheckingPayment(false);
      }
    };

    if (patientId) {
      checkPayment();
    }
  }, [patientId]);

  useEffect(() => {
    const loadPatientTests = async () => {
      if (checkingPayment || !paymentStatus || !paymentStatus.isPaid) {
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const result = await getPatientTestsFn({ data: { patientId: Number(patientId) } });
        setPatientTests(result.tests || []);
      } catch (err) {
        console.error('Error loading patient tests:', err);
        setError(err instanceof Error ? err.message : 'Failed to load patient tests');
      } finally {
        setLoading(false);
      }
    };

    loadPatientTests();
  }, [patientId, checkingPayment, paymentStatus]);

  const handleInputChange = (parameterId: number, value: string) => {
    setResults((prev) => ({
      ...prev,
      [parameterId]: value,
    }));
  };

  const handleImpressionChange = (patientTestId: number, value: string) => {
    setImpressions((prev) => ({
      ...prev,
      [patientTestId]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    try {
      const resultsArray = Object.entries(results).map(([parameterId, value]) => {
        const param = patientTests
          .flatMap((test: any) => test.parameters)
          .find((p: any) => p.id === Number(parameterId));

        return {
          patientTestId: patientTests.find((test: any) =>
            test.parameters.some((p: any) => p.id === Number(parameterId))
          )?.patientTestId,
          parameterId: Number(parameterId),
          value,
          remarks: '',
        };
      });

      const patientTestIds = patientTests.map((test: any) => test.patientTestId);

      const impressionsArray = Object.entries(impressions).map(([patientTestId, impression]) => ({
        patientTestId: Number(patientTestId),
        impression,
      }));

      await submitResultsFn({ 
        data: { 
          results: resultsArray, 
          patientTestIds,
          impressions: impressionsArray
        } 
      });

      navigate({ to: `/report/${patientId}` });
    } catch (error) {
      console.error('Error submitting test results:', error);
      setSubmitError(
        error instanceof Error ? error.message : 'Failed to submit test results'
      );
    }
  };

  if (checkingPayment) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-blue-200 rounded-lg w-3/4 mx-auto"></div>
            <p className="text-lg text-gray-600">Verifying payment status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && (!paymentStatus || !paymentStatus.isPaid)) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-300 bg-red-50 shadow-lg mb-6">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 ml-2">
              <strong>Payment Required</strong>
              <br />
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex gap-4">
            <Button
              onClick={() => navigate({ to: `/bill/${patientId}` })}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <FileText className="w-4 h-4" />
              Go to Billing
            </Button>
            <Button onClick={() => navigate({ to: '/' })} variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-blue-200 rounded-lg w-3/4 mx-auto"></div>
            <p className="text-lg text-gray-600">Loading patient tests...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Alert className="border-red-300 bg-red-50 shadow-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <AlertDescription className="text-red-800 ml-2">{error}</AlertDescription>
          </Alert>
          <Button onClick={() => navigate({ to: '/' })} className="mt-6 gap-2" variant="outline">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardHeader className="bg-linear-to-r from-blue-600 to-cyan-500 text-white p-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">🧪</span>
              </div>
              <div>
                <CardTitle className="text-3xl font-bold">Test Results Entry</CardTitle>
                <CardDescription className="text-blue-100 text-base mt-1">
                  Enter test results and impressions for Patient ID: {patientId}
                  <br />
                  <span className="inline-flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full mt-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Payment Completed
                  </span>
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-8">
            {submitError && (
              <Alert className="mb-6 border-red-300 bg-red-50 shadow-md">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">{submitError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {patientTests.map((test: any) => (
                <div key={test.patientTestId} className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-blue-200">
                    <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                      <span className="text-white text-lg">🧪</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {test.testName}
                    </h2>
                  </div>

                  <div className="space-y-4 mb-6">
                    {test.parameters.map((param: any) => (
                      <div key={param.id} className="bg-gray-50 rounded-lg p-4 hover:bg-blue-50 transition-colors">
                        <div className="grid grid-cols-12 gap-4 items-center">
                          <div className="col-span-12 md:col-span-4">
                            <Label className="font-semibold text-gray-900 text-base">
                              {param.parameterName}
                            </Label>
                            {param.normalRange && (
                              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <span className="font-medium">Normal:</span> {param.normalRange}
                              </p>
                            )}
                          </div>

                          <div className="col-span-8 md:col-span-6">
                            <Input
                              type="text"
                              value={results[param.id] || ''}
                              onChange={(e) => handleInputChange(param.id, e.target.value)}
                              placeholder="Enter result value"
                              required
                              className="bg-white text-base font-semibold"
                            />
                          </div>

                          <div className="col-span-4 md:col-span-2">
                            <span className="text-gray-700 font-medium">{param.unit || ''}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Report Impression Section */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <Label className="font-semibold text-blue-900 text-base mb-2 block">
                      Report Impression / Clinical Remarks
                    </Label>
                    <Textarea
                      value={impressions[test.patientTestId] || ''}
                      onChange={(e) => handleImpressionChange(test.patientTestId, e.target.value)}
                      placeholder="Enter clinical impression, interpretation, or recommendations for this test..."
                      className="resize-none h-24 bg-white"
                    />
                    <p className="text-xs text-blue-700 mt-2">
                      💡 Add professional interpretation, abnormal findings, or clinical recommendations
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1 bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-lg py-6 shadow-lg"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Results & Generate Report
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: '/' })}
                  className="gap-2"
                >
                  <Home className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}