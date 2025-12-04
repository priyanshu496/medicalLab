import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import {
  Activity,
  Beaker,
  ClipboardList,
  FileText,
  LogOut,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getAllPatientsWithBills } from '@/routes/api/patient-with-bills';

export const Route = createFileRoute('/dashboard/technician')({
  component: TechnicianDashboard,
});

function TechnicianDashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paidPatients, setPaidPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getPatientsFn = useServerFn(getAllPatientsWithBills);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate({ to: '/login' });
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'lab_technician') {
      if (user.role === 'master') {
        navigate({ to: '/dashboard/master' });
      } else if (user.role === 'cashier') {
        navigate({ to: '/dashboard/cashier' });
      }
      return;
    }

    setCurrentUser(user);
    loadPatients();
  }, [navigate]);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const result = await getPatientsFn();
      const paid = result.patients.filter((p: any) => p.bill && p.bill.isPaid);
      setPaidPatients(paid);
    } catch (error) {
      console.error('Error loading patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate({ to: '/login' });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Test Booth Entry */}
          <Link to="/test-entry">
            <Card className="shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border-0 h-full">
              <div className="bg-linear-to-br from-teal-600 to-cyan-500 h-1"></div>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-linear-to-br from-teal-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                    Lab Work
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Test Entry
                </h3>
                <p className="text-gray-600 mb-4">
                  Record and enter test samples in the lab booth system
                </p>
                <div className="flex items-center gap-2 text-teal-600 font-semibold">
                  Go to Test Booth
                  <span className="text-lg">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Test Results */}
          <Link to="/test-results">
            <Card className="shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border-0 h-full">
              <div className="bg-linear-to-br from-pink-600 to-rose-500 h-1"></div>
              <CardContent className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 bg-linear-to-br from-pink-600 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-semibold">
                    Lab Work
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Test Results
                </h3>
                <p className="text-gray-600 mb-4">
                  Enter and finalize test results for patient samples
                </p>
                <div className="flex items-center gap-2 text-pink-600 font-semibold">
                  Enter Results
                  <span className="text-lg">→</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-teal-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Patients Ready for Testing</p>
                  <p className="text-3xl font-bold text-gray-900">{paidPatients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Beaker className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Tests</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-linear-to-br from-purple-600 to-pink-500 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Results</p>
                  <p className="text-3xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Patients Ready for Testing */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Patients Ready for Lab Testing
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading patients...</p>
            </div>
          ) : paidPatients.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <Beaker className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">No patients available for testing</p>
                <p className="text-gray-500 text-sm mt-2">
                  Patients with completed payments will appear here
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paidPatients.map((patient: any) => (
                <Link
                  key={patient.id}
                  to={`/test-entry/${patient.id}`}
                  className="block"
                >
                  <Card className="shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-1 cursor-pointer border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-gray-900 mb-2">
                            {patient.fullName}
                          </h4>
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Patient ID</p>
                              <p className="font-semibold text-gray-900">
                                {patient.patientId}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Age / Gender</p>
                              <p className="font-semibold text-gray-900">
                                {patient.age} / {patient.gender}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Tests Assigned</p>
                              <p className="font-semibold text-gray-900">
                                {patient.testCount || 0}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-500">Status</p>
                              <span className="inline-flex items-center px-2 py-1 bg-teal-100 text-teal-700 rounded text-xs font-semibold">
                                ✓ Ready
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button className="bg-linear-to-r from-teal-600 to-cyan-500 hover:from-teal-700 hover:to-cyan-600">
                          <Activity className="w-4 h-4 mr-2" />
                          Start Testing
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Lab Safety Reminder */}
        <div className="mt-12 p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
          <h4 className="text-lg font-bold text-blue-900 mb-2">
            Lab Safety Reminder
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• Always wear appropriate protective equipment (PPE)</li>
            <li>• Follow proper sanitation protocols</li>
            <li>• Maintain accuracy in sample handling and labeling</li>
            <li>• Report any issues or discrepancies immediately</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
