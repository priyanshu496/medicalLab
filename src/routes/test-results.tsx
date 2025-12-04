import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { FileText, Home, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getAllPatientsWithBills } from '@/routes/api/patient-with-bills';
import { getPatientReport } from '@/routes/api/report';

export const Route = createFileRoute('/test-results')({
  component: TestResults,
});

function TestResults() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [paidPatients, setPaidPatients] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const getPatientsFn = useServerFn(getAllPatientsWithBills);
  const getReportFn = useServerFn(getPatientReport);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (!storedUser) {
      navigate({ to: '/login' });
      return;
    }

    const user = JSON.parse(storedUser);
    if (user.role !== 'lab_technician') {
      navigate({ to: '/dashboard/' + user.role });
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

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const results = paidPatients.filter((p) =>
      p.fullName.toLowerCase().includes(query.toLowerCase()) ||
      p.patientId.toLowerCase().includes(query.toLowerCase()) ||
      p.phoneNumber.includes(query)
    );

    setSearchResults(results);
    setShowResults(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleViewReport = (patientId: number) => {
    navigate({ to: `/report/${patientId}` });
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate({ to: '/login' });
  };

  if (!currentUser) {
    return null;
  }

  const displayPatients = showResults ? searchResults : paidPatients;

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-cyan-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-linear-to-br from-pink-600 to-rose-500 rounded-lg flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Test Results
              </h1>
              <p className="text-sm text-gray-600">
                {currentUser.labInfo?.labName || 'Lab Management System'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-900">
                {currentUser.fullName}
              </p>
              <p className="text-xs text-gray-600">Lab Technician</p>
            </div>
            <Button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Home className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search Component */}
        <Card className="shadow-xl border-2 border-gray-200 mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-xl font-bold text-gray-900">Search for Patient</h3>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by Patient Name, Patient ID, or Phone..."
                  className="pr-10"
                />
                {searchQuery && (
                  <Button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Button
                onClick={() => handleSearch(searchQuery)}
                disabled={searching || !searchQuery.trim()}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {searching ? 'Searching...' : 'Search'}
              </Button>
            </div>

            {showResults && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-3">
                  Found {searchResults.length} patient(s)
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patients List */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            {showResults ? 'Search Results' : 'All Patients with Results'}
          </h3>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading patients...</p>
            </div>
          ) : displayPatients.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 text-lg">
                  {showResults ? 'No patients found matching your search' : 'No patients available'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {displayPatients.map((patient: any) => (
                <Card
                  key={patient.id}
                  className="shadow-lg hover:shadow-2xl transition-all border-0 cursor-pointer"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900 mb-3">
                          {patient.fullName}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
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
                            <p className="text-gray-500">Phone</p>
                            <p className="font-semibold text-gray-900">
                              {patient.phoneNumber}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Tests</p>
                            <p className="font-semibold text-gray-900">
                              {patient.testCount || 0}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Invoice</p>
                            <p className="font-semibold text-blue-600">
                              {patient.bill?.invoiceNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleViewReport(patient.id)}
                        className="bg-linear-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Report
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <h4 className="text-lg font-bold text-blue-900 mb-2">
            📋 How to View Test Results
          </h4>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>• Search for a patient by name, ID, or phone number</li>
            <li>• Click "View Report" to see the complete test results</li>
            <li>• Only patients with completed payments are displayed</li>
            <li>• You can print or download the report from the report page</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
