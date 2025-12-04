import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { AlertCircle, ArrowRight, CheckCircle2, Home, Printer } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { createBill, updateBillPayment } from '@/routes/api/bills';
import { getPatientReport } from '@/routes/api/report';

export const Route = createFileRoute('/bill/$patientId')({
  component: BillPage,
});

function BillPage() {
  const { patientId } = Route.useParams();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid'>('pending');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [billError, setBillError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const getReportFn = useServerFn(getPatientReport);
  const createBillFn = useServerFn(createBill);
  const updateBillPaymentFn = useServerFn(updateBillPayment);

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

  const handleGenerateBill = async () => {
    try {
      setGenerating(true);
      setBillError(null);
      
      await createBillFn({ 
        data: { 
          patientId: Number(patientId), 
          discount,
          isPaid: paymentStatus === 'paid'
        } 
      });
      
      const result = await getReportFn({ data: { patientId: Number(patientId) } });
      setReportData(result);
    } catch (error) {
      console.error('Error generating bill:', error);
      setBillError(error instanceof Error ? error.message : 'Failed to generate bill');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (!reportData?.bill) return;
    
    try {
      setBillError(null);
      await updateBillPaymentFn({
        data: {
          id: reportData.bill.id,
          isPaid: paymentStatus === 'paid'
        }
      });
      
      const result = await getReportFn({ data: { patientId: Number(patientId) } });
      setReportData(result);
    } catch (error) {
      console.error('Error updating payment:', error);
      setBillError(error instanceof Error ? error.message : 'Failed to update payment status');
    }
  };

  const handleProceedToTest = () => {
    navigate({ to: `/test-entry/${patientId}` });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-blue-200 rounded-lg w-3/4 mx-auto"></div>
            <p className="text-lg text-gray-600">Loading bill information...</p>
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
              {error || 'Failed to load bill information'}
            </AlertDescription>
          </Alert>
          <div className="flex gap-4 mt-6">
            <Button onClick={() => navigate({ to: '/' })} variant="outline" className="gap-2">
              <Home className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { patient, tests, bill } = reportData;

  const uniqueTests = tests.reduce((acc: any[], test: any) => {
    if (!acc.find(t => t.patientTestId === test.patientTestId)) {
      acc.push(test);
    }
    return acc;
  }, []);

  const totalAmount = uniqueTests.reduce(
    (sum: number, test: any) => sum + Number(test.testPrice || 0),
    0
  );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-cyan-50 p-8 print:p-0 print:bg-white">
      <div className="max-w-4xl mx-auto">
        {/* Action Buttons */}
        <div className="mb-6 flex gap-3 print:hidden">
          {bill && (
            <>
              <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 gap-2 shadow-lg">
                <Printer className="w-4 h-4" />
                Print Bill
              </Button>
              {bill.isPaid && (
                <Button onClick={handleProceedToTest} className="bg-green-600 hover:bg-green-700 gap-2 shadow-lg">
                  Proceed to Test Entry
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
          <Button onClick={() => navigate({ to: '/' })} variant="outline" className="gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>

        {/* Professional Bill Card */}
        <Card className="shadow-2xl border-2 border-gray-200 print:shadow-none print:border-2">
          {/* Letterhead Header */}
          <div className="bg-white border-b-4 border-blue-600 p-8 print:p-12">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">NextGenLab</h1>
                <p className="text-gray-600">Advanced Diagnostic Center</p>
                <p className="text-sm text-gray-500 mt-2">123 Medical Plaza, Healthcare District</p>
                <p className="text-sm text-gray-500">Phone: +91-9876543210 | Email: info@nexgenlab.com</p>
              </div>
              <div className="text-right">
                <div className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg mb-2">
                  <p className="text-sm font-semibold">TAX INVOICE</p>
                </div>
                {bill && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500">Invoice No.</p>
                    <p className="text-lg font-bold text-blue-600">{bill.invoiceNumber}</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">Date</p>
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
            {billError && (
              <Alert className="mb-6 border-red-300 bg-red-50 shadow-md print:hidden">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <AlertDescription className="text-red-800 ml-2">{billError}</AlertDescription>
              </Alert>
            )}

            {/* Bill To Section */}
            <div className="mb-8 grid grid-cols-2 gap-8">
              <div className="border-l-4 border-blue-600 pl-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Bill To</p>
                <p className="text-lg font-bold text-gray-900">{patient.patient.fullName}</p>
                <p className="text-sm text-gray-600 mt-1">Patient ID: {patient.patient.patientId}</p>
                <p className="text-sm text-gray-600">Phone: {patient.patient.phoneNumber}</p>
                <p className="text-sm text-gray-600 mt-1">{patient.patient.addressLine1}</p>
                <p className="text-sm text-gray-600">{patient.patient.state} - {patient.patient.pincode}</p>
              </div>
              <div className="border-l-4 border-gray-300 pl-4">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Test Details</p>
                <p className="text-sm text-gray-600">Total Tests: {uniqueTests.length}</p>
                {patient.doctor && (
                  <>
                    <p className="text-sm text-gray-600 mt-2">Referred By:</p>
                    <p className="text-sm font-semibold text-gray-900">{patient.doctor.name}</p>
                    {patient.doctor.specialization && (
                      <p className="text-xs text-gray-500">{patient.doctor.specialization}</p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Test Items Table */}
            <div className="mb-8">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100 border-y-2 border-gray-300">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Sr.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Test Description</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueTests.map((test: any, index: number) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="px-4 py-3 text-sm text-gray-700">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{test.testName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 text-right font-semibold">
                        {Number(test.testPrice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bill Summary */}
            <div className="border-t-2 border-gray-300 pt-6">
              {!bill ? (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">₹{totalAmount.toFixed(2)}</span>
                      </div>

                      <div className="flex justify-between items-center print:hidden">
                        <Label className="text-gray-600 text-sm">Discount:</Label>
                        <Input
                          type="number"
                          value={discount}
                          onChange={(e) => setDiscount(Number(e.target.value))}
                          className="w-32 text-right"
                          placeholder="0.00"
                          min="0"
                          max={totalAmount}
                        />
                      </div>

                      <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-300">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">₹{(totalAmount - discount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 print:hidden">
                    <Label className="text-gray-900 font-semibold">Payment Status:</Label>
                    <RadioGroup
                      value={paymentStatus}
                      onValueChange={(value) => setPaymentStatus(value as 'pending' | 'paid')}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2 bg-orange-50 border-2 border-orange-200 rounded-lg px-4 py-3 flex-1">
                        <RadioGroupItem value="pending"/>
                        <Label className="cursor-pointer text-orange-700 flex-1">Pending Payment</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-green-50 border-2 border-green-200 rounded-lg px-4 py-3 flex-1">
                        <RadioGroupItem value="paid" />
                        <Label className="cursor-pointer text-green-700 flex-1">Payment Completed</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={handleGenerateBill}
                    className="w-full print:hidden bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Generating Bill...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 mr-2" />
                        Generate Bill & Confirm
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-end">
                    <div className="w-80 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="font-semibold">₹{Number(bill.totalAmount).toFixed(2)}</span>
                      </div>
                      {Number(bill.discount) > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount:</span>
                          <span className="font-semibold text-red-600">-₹{Number(bill.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-xl font-bold pt-3 border-t-2 border-gray-300">
                        <span>Total Amount:</span>
                        <span className="text-blue-600">₹{Number(bill.finalAmount).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-semibold">Payment Status:</span>
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                        bill.isPaid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {bill.isPaid ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            PAID
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5" />
                            PENDING
                          </>
                        )}
                      </div>
                      {!bill.isPaid && (
                        <div className="print:hidden">
                          <RadioGroup
                            value={bill.isPaid ? 'paid' : 'pending'}
                            onValueChange={(value) => setPaymentStatus(value as 'pending' | 'paid')}
                            className="flex gap-3"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="pending" />
                              <Label className="cursor-pointer">Pending</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="paid" />
                              <Label className="cursor-pointer">Paid</Label>
                            </div>
                          </RadioGroup>
                        </div>
                      )}
                    </div>
                  </div>

                  {((bill.isPaid && paymentStatus === 'pending') || (!bill.isPaid && paymentStatus === 'paid')) && (
                    <Button
                      onClick={handleUpdatePayment}
                      className="w-full print:hidden bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    >
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Update Payment Status
                    </Button>
                  )}

                  {bill.isPaid && (
                    <Button
                      onClick={handleProceedToTest}
                      className="w-full print:hidden bg-green-600 hover:bg-green-700 text-lg py-6"
                    >
                      Proceed to Test Entry
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-12 pt-6 border-t-2 border-gray-200">
              <div className="grid grid-cols-2 gap-8 mb-6">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Terms & Conditions</p>
                  <p className="text-xs text-gray-600">Payment is due upon receipt</p>
                  <p className="text-xs text-gray-600">Reports will be issued after payment confirmation</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Authorized Signature</p>
                  <div className="mt-8 pt-2 border-t border-gray-400 inline-block w-48"></div>
                </div>
              </div>
              <div className="text-center text-xs text-gray-500 pt-4 border-t border-gray-200">
                <p>This is a computer-generated invoice | NextGenLab - Excellence in Diagnostics</p>
                <p className="mt-1">For any queries, contact: support@nexgenlab.com</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}